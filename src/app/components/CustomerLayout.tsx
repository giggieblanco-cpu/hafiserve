import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Home, ShoppingCart, Receipt, LogOut, MapPin, Utensils, User, Bed, Calendar, UtensilsCrossed, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { getCurrentUser, setCurrentUser, getCartItemCount } from "../lib/storage";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import NotificationBell from "./NotificationBell";

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartItemCount());
  }, [location.pathname]); // Update cart count when location changes

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navItems = [
    { path: "/customer/home", label: "Hotels", icon: Home },
    { path: "/customer/buffets", label: "Buffets", icon: UtensilsCrossed },
    { path: "/customer/rooms", label: "Rooms", icon: Bed },
    { path: "/customer/my-bookings", label: "My Bookings", icon: Calendar },
    { path: "/customer/messages", label: "Messages", icon: MessageCircle },
    { path: "/customer/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { path: "/customer/orders", label: "Orders", icon: Receipt },
    { path: "/about", label: "About", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/customer/home" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="relative">
              <MapPin className="size-8 text-green-600" />
              <Utensils className="size-5 text-blue-600 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HaFi Serve Rwanda
              </h1>
              <p className="text-xs text-gray-500">Serving near you</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="size-4 text-gray-600" />
              <span className="text-gray-700">{user?.name}</span>
            </div>
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
                      ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      : ""
                  }
                >
                  <Icon className="size-4 mr-1" />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
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