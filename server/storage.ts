import { User, InsertUser, Doctor, Appointment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

interface WaterIntake {
  id: number;
  userId: number;
  amount: number;
  timestamp: Date;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  addWaterIntake(userId: number, amount: number): Promise<WaterIntake>;
  getWaterIntakeHistory(userId: number): Promise<{ todayTotal: number, history: WaterIntake[] }>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctors: Map<number, Doctor>;
  private appointments: Map<number, Appointment>;
  private waterIntakes: Map<number, WaterIntake>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.doctors = new Map();
    this.appointments = new Map();
    this.waterIntakes = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });

    // Seed doctors
    this.doctors.set(1, {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "General Medicine",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dr1",
      availableDays: ["Monday", "Tuesday", "Wednesday"]
    });
    this.doctors.set(2, {
      id: 2,  
      name: "Dr. Michael Chen",
      specialty: "Cardiology",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dr2",
      availableDays: ["Wednesday", "Thursday", "Friday"]
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    const id = this.currentId++;
    const newAppointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId
    );
  }

  async addWaterIntake(userId: number, amount: number): Promise<WaterIntake> {
    const id = this.currentId++;
    const waterIntake = {
      id,
      userId,
      amount,
      timestamp: new Date()
    };
    this.waterIntakes.set(id, waterIntake);
    return waterIntake;
  }

  async getWaterIntakeHistory(userId: number): Promise<{ todayTotal: number, history: WaterIntake[] }> {
    const today = new Date();
    const history = Array.from(this.waterIntakes.values()).filter(
      (intake) => intake.userId === userId
    );

    const todayTotal = history
      .filter(intake => {
        const intakeDate = new Date(intake.timestamp);
        return (
          intakeDate.getDate() === today.getDate() &&
          intakeDate.getMonth() === today.getMonth() &&
          intakeDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((total, intake) => total + intake.amount, 0);

    return {
      todayTotal,
      history: history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    };
  }
}

export const storage = new MemStorage();