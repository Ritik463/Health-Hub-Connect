import NavSidebar from "@/components/nav-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Calendar, User, Clock } from "lucide-react";
import { Appointment } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const upcomingAppointments = appointments?.filter(
    (apt) => new Date(apt.date) > new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <NavSidebar />
      
      <main className="pl-64 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Welcome, {user?.fullName}</h1>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {upcomingAppointments?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Doctors
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Next Appointment
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {upcomingAppointments?.[0] ? (
                    new Date(upcomingAppointments[0].date).toLocaleDateString()
                  ) : (
                    "No appointments"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <Calendar className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Book Appointment</h3>
                  <p className="text-sm text-muted-foreground">
                    Schedule a visit with one of our healthcare professionals
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <User className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Health Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered health advice and recommendations
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
