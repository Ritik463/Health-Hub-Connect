import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquareText, 
  LogOut,
  User
} from "lucide-react";

export default function NavSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/health-assistant", label: "Health Assistant", icon: MessageSquareText },
  ];

  return (
    <Card className="h-screen w-64 p-4 flex flex-col fixed left-0 top-0 border-r">
      <div className="flex items-center gap-3 mb-8 px-2">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h2 className="font-semibold">{user?.fullName}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={location === href ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>

      <Button
        variant="ghost"
        className="justify-start gap-2"
        onClick={() => logoutMutation.mutate()}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </Card>
  );
}
