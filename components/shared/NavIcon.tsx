import {
  Activity,
  BarChart3,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  MessageSquareText,
  Settings,
} from "lucide-react";
import type { NavIconKey } from "@/lib/navigation";

interface NavIconProps {
  name: NavIconKey;
  className?: string;
}

export function NavIcon({ name, className = "h-5 w-5" }: NavIconProps) {
  switch (name) {
    case "dashboard":
      return <LayoutDashboard className={className} aria-hidden="true" />;
    case "calendar":
      return <CalendarDays className={className} aria-hidden="true" />;
    case "activities":
      return <Activity className={className} aria-hidden="true" />;
    case "analytics":
      return <BarChart3 className={className} aria-hidden="true" />;
    case "recovery":
      return <HeartPulse className={className} aria-hidden="true" />;
    case "coach":
      return <MessageSquareText className={className} aria-hidden="true" />;
    case "settings":
      return <Settings className={className} aria-hidden="true" />;
  }
}
