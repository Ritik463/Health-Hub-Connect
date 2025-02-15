import { useState, useEffect } from "react";
import NavSidebar from "@/components/nav-sidebar";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  MessageSquareText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Ambulance,
  Droplet,
  Trophy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type HealthAdvice = {
  advice: string;
  severity: "low" | "medium" | "high";
  seekMedicalAttention: boolean;
};

type FormData = {
  symptoms: string;
};

type EmergencyFormData = {
  location: string;
  details: string;
};

type WaterIntakeFormData = {
  amount: number;
};

export default function HealthAssistant() {
  const [lastResponse, setLastResponse] = useState<HealthAdvice>();
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showWaterIntakeForm, setShowWaterIntakeForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      symptoms: "",
    },
  });

  const emergencyForm = useForm<EmergencyFormData>({
    defaultValues: {
      location: "",
      details: "",
    },
  });

  const waterIntakeForm = useForm<WaterIntakeFormData>({
    defaultValues: {
      amount: 250, // Default to 250ml (a glass of water)
    },
  });

  // Fetch daily health tip
  const { data: healthTip } = useQuery({
    queryKey: ["/api/health-tip"],
  });

  // Fetch water intake history
  const { data: waterIntake, refetch: refetchWaterIntake } = useQuery({
    queryKey: ["/api/water-intake"],
  });

  const getAdvice = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/health-advice", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to get health advice");
      }
      return res.json() as Promise<HealthAdvice>;
    },
    onSuccess: (data) => {
      setLastResponse(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not get health advice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addWaterIntake = useMutation({
    mutationFn: async (data: WaterIntakeFormData) => {
      const res = await apiRequest("POST", "/api/water-intake", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to track water intake");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Water intake tracked",
        description: "Keep staying hydrated!",
      });
      setShowWaterIntakeForm(false);
      refetchWaterIntake();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to track water intake",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestEmergency = useMutation({
    mutationFn: async (data: EmergencyFormData) => {
      const res = await apiRequest("POST", "/api/emergency", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to request emergency services");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Emergency services notified",
        description: `${data.message}. ETA: ${data.estimatedArrival}`,
      });
      setShowEmergencyForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request emergency services",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Water intake reminder effect
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      toast({
        title: "Water Intake Reminder",
        description: "Stay hydrated! Time to drink some water.",
      });
    }, 3600000); // Remind every hour

    return () => clearInterval(reminderInterval);
  }, [toast]);

  function getSeverityColor(severity: "low" | "medium" | "high") {
    switch (severity) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  }

  function calculateWaterProgress() {
    if (!waterIntake?.todayTotal) return 0;
    const dailyGoal = 2500; // 2.5L daily goal
    return Math.min((waterIntake.todayTotal / dailyGoal) * 100, 100);
  }

  return (
    <div className="min-h-screen bg-background">
      <NavSidebar />

      <main className="pl-64 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Emergency Services Button */}
          <div className="mb-8">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowEmergencyForm(true)}
            >
              <Ambulance className="mr-2 h-5 w-5" />
              Request Emergency Services
            </Button>
          </div>

          {/* Health Tracking Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={calculateWaterProgress()} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{waterIntake?.todayTotal || 0}ml</span>
                    <span>Goal: 2500ml</span>
                  </div>
                  <Button
                    onClick={() => setShowWaterIntakeForm(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Droplet className="mr-2 h-4 w-4" />
                    Add Water Intake
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Daily Health Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {healthTip?.tip || "Loading health tip..."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Health Assistant Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-6 w-6" />
                Health Assistant
              </CardTitle>
              <CardDescription>
                Describe your symptoms to get health advice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => getAdvice.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe your symptoms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="E.g. I have a headache and fever for the last 2 days..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={getAdvice.isPending}
                    className="w-full"
                  >
                    {getAdvice.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting advice...
                      </>
                    ) : (
                      "Get Health Advice"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {lastResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lastResponse.seekMedicalAttention ? (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                  Health Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Severity Level:</span>
                  <span className={getSeverityColor(lastResponse.severity)}>
                    {lastResponse.severity.toUpperCase()}
                  </span>
                </div>

                {lastResponse.seekMedicalAttention && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">
                          Please seek medical attention
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="prose prose-blue max-w-none">
                  <h3 className="text-lg font-semibold mb-2">
                    Recommendations:
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {lastResponse.advice}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground mt-4">
                  Note: This is AI-generated advice and should not replace
                  professional medical consultation.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Emergency Services Dialog */}
      <Dialog open={showEmergencyForm} onOpenChange={setShowEmergencyForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <Ambulance className="h-6 w-6" />
              Request Emergency Services
            </DialogTitle>
          </DialogHeader>
          <Form {...emergencyForm}>
            <form
              onSubmit={emergencyForm.handleSubmit((data) =>
                requestEmergency.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={emergencyForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your current address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emergencyForm.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the emergency situation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={requestEmergency.isPending}
              >
                {requestEmergency.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting Emergency Services...
                  </>
                ) : (
                  "Request Emergency Services Now"
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Water Intake Dialog */}
      <Dialog open={showWaterIntakeForm} onOpenChange={setShowWaterIntakeForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Droplet className="h-6 w-6 text-blue-500" />
              Track Water Intake
            </DialogTitle>
          </DialogHeader>
          <Form {...waterIntakeForm}>
            <form
              onSubmit={waterIntakeForm.handleSubmit((data) =>
                addWaterIntake.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={waterIntakeForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (ml)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="50"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    waterIntakeForm.setValue("amount", 250)
                  }
                >
                  Glass (250ml)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    waterIntakeForm.setValue("amount", 500)
                  }
                >
                  Bottle (500ml)
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={addWaterIntake.isPending}
              >
                {addWaterIntake.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  "Track Water Intake"
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}