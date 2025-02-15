import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { getHealthAdvice, getRandomTip } from "./health-advisor";

// Keep track of connected clients
const clients = new Map<number, WebSocket>();

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get all doctors
  app.get("/api/doctors", async (_req, res) => {
    const doctors = await storage.getDoctors();
    res.json(doctors);
  });

  // Get doctor by id
  app.get("/api/doctors/:id", async (req, res) => {
    const doctor = await storage.getDoctor(parseInt(req.params.id));
    if (!doctor) return res.status(404).send("Doctor not found");
    res.json(doctor);
  });

  // Get user appointments
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const appointments = await storage.getUserAppointments(req.user.id);
    res.json(appointments);
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parsed = insertAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const appointment = await storage.createAppointment({
      ...parsed.data,
      userId: req.user.id,
    });

    // Send notification to the user about the new appointment
    const userSocket = clients.get(req.user.id);
    if (userSocket?.readyState === WebSocket.OPEN) {
      userSocket.send(JSON.stringify({
        type: 'appointment_created',
        data: {
          message: 'New appointment scheduled successfully',
          appointment
        }
      }));
    }

    res.status(201).json(appointment);
  });

  // Health assistant
  app.post("/api/health-advice", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).send("Symptoms are required");
    }

    try {
      const advice = getHealthAdvice(symptoms);
      res.json(advice);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message });
    }
  });

  // Get daily health tip
  app.get("/api/health-tip", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tip = getRandomTip();
    res.json({ tip });
  });

  // Track water intake
  app.post("/api/water-intake", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { amount } = req.body;
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ message: "Valid amount in milliliters is required" });
    }

    try {
      const waterIntake = await storage.addWaterIntake(req.user.id, amount);
      res.status(201).json(waterIntake);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to track water intake';
      res.status(500).json({ message });
    }
  });

  // Get water intake history
  app.get("/api/water-intake", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const history = await storage.getWaterIntakeHistory(req.user.id);
      res.json(history);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get water intake history';
      res.status(500).json({ message });
    }
  });

  // Request emergency services
  app.post("/api/emergency", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { location, details } = req.body;
    if (!location || !details) {
      return res.status(400).json({ message: "Location and emergency details are required" });
    }

    // In a real application, this would integrate with an emergency services API
    // For demo purposes, we'll simulate a successful request
    res.json({
      message: "Emergency services have been notified",
      estimatedArrival: "10-15 minutes",
      emergencyId: Date.now().toString(),
      instructions: "Stay calm. Emergency services are on their way. If possible, send someone to guide the ambulance to your exact location."
    });
  });

  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    if (!req.url) return;

    // Extract user ID from the URL
    const userId = parseInt(req.url.split('=')[1]);
    if (isNaN(userId)) {
      ws.close();
      return;
    }

    // Store the connection
    clients.set(userId, ws);

    // Send initial notification
    ws.send(JSON.stringify({
      type: 'connection_established',
      data: { message: 'Connected to notification service' }
    }));

    // Handle client disconnect
    ws.on('close', () => {
      clients.delete(userId);
    });

    // Start appointment reminder checks for this user
    checkUpcomingAppointments(userId);
  });

  // Function to check upcoming appointments
  async function checkUpcomingAppointments(userId: number) {
    setInterval(async () => {
      const appointments = await storage.getUserAppointments(userId);
      const now = new Date();

      appointments.forEach(appointment => {
        const appointmentTime = new Date(appointment.datetime);
        const timeDiff = appointmentTime.getTime() - now.getTime();
        const minutesUntilAppointment = Math.floor(timeDiff / (1000 * 60));

        // Notify for appointments happening in 24 hours or less
        if (minutesUntilAppointment <= 1440 && minutesUntilAppointment > 0) {
          const userSocket = clients.get(userId);
          if (userSocket?.readyState === WebSocket.OPEN) {
            userSocket.send(JSON.stringify({
              type: 'appointment_reminder',
              data: {
                message: `Upcoming appointment in ${minutesUntilAppointment} minutes`,
                appointment
              }
            }));
          }
        }
      });
    }, 60000); // Check every minute
  }

  return httpServer;
}