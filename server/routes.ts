import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { getHealthAdvice } from "./health-advisor";

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
  return httpServer;
}