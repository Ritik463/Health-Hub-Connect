import { useState } from "react";
import NavSidebar from "@/components/nav-sidebar";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

export default function HealthAssistant() {
  const [lastResponse, setLastResponse] = useState<HealthAdvice>();
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
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
    </div>
  );
}