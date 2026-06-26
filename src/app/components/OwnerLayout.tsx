import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Utensils, Receipt, Hotel, LogOut, MapPin, User, Info, Bed, DoorOpen, UtensilsCrossed, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { getCurrentUser, setCurrentUser } from "../lib/storage";
import { toast } from "sonner";
import NotificationBell from "./NotificationBell";

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navItems = [
    { path: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/owner/orders", label: "Orders", icon: Receipt },
    { path: "/owner/room-bookings", label: "Room Bookings", icon: Bed },
    { path: "/owner/messages", label: "Messages", icon: MessageCircle },
    { path: "/owner/rooms", label: "Manage Rooms", icon: DoorOpen },
    { path: "/owner/menu", label: "Menu", icon: Utensils },
    { path: "/owner/buffets", label: "Buffets", icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/owner/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="relative">
              <MapPin className="size-8 text-green-600" />
              <Utensils className="size-5 text-blue-600 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HaFi Serve Rwanda
              </h1>
              <p className="text-xs text-gray-500">Owner Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-2 text-sm mr-2">
              <User className="size-4 text-gray-600" />
              <span className="text-gray-700">{user?.name}</span>
            </div>
            {/* Hotel Info shortcut */}
            <Link to="/owner/hotel-info">
              <Button
                variant="ghost"
                size="sm"
                className={`${location.pathname === "/owner/hotel-info" ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}
                title="Hotel Info"
              >
                <Hotel className="size-4" />
                <span className="hidden md:inline ml-1">Hotel Info</span>
              </Button>
            </Link>
            {/* About shortcut */}
            <Link to="/about">
              <Button
                variant="ghost"
                size="sm"
                className={`${location.pathname === "/about" ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}
                title="About"
              >
                <Info className="size-4" />
                <span className="hidden md:inline ml-1">About</span>
              </Button>
            </Link>
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="size-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="container mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      : ""
                  }
                >
                  <Icon className="size-4 mr-1" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}