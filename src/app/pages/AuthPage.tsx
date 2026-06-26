import { getCurrentUser, setCurrentUser } from "../lib/storage";
import { getAllUsers, addUser as addUserToAPI, getAllHotels, getHotel } from "../lib/api";
import { User } from "../lib/mockData";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapPin, Utensils, Hotel as HotelIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"customer" | "owner">("customer");
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load hotels for owner login
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const allHotels = await getAllHotels();
        setHotels(allHotels);
      } catch (error) {
        console.error("Error loading hotels:", error);
        toast.error("Failed to load hotels");
      }
    };
    loadHotels();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      if (currentUser.role === "customer") {
        navigate("/customer/home");
      } else {
        navigate("/owner/dashboard");
      }
    }
  }, [navigate]);

  const handleCustomerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Get all users from Supabase
      const allUsers = await getAllUsers();
      const user = allUsers.find((u: User) => u.email === email);

      if (!user) {
        toast.error("Account not found. Please sign up first.");
        setLoading(false);
        return;
      }

      // Check password (in production, this should be hashed!)
      if (user.password !== password) {
        toast.error("Incorrect password");
        setLoading(false);
        return;
      }

      if (user.role !== "customer") {
        toast.error(`This account is registered as a ${user.role}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/customer/home");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const hotelId = formData.get("hotel") as string;
      const password = formData.get("password") as string;

      if (!hotelId || !password) {
        toast.error("Please select a hotel and enter password");
        setLoading(false);
        return;
      }

      const hotel = await getHotel(hotelId);
      if (!hotel) {
        toast.error("Hotel not found");
        setLoading(false);
        return;
      }

      // Check password
      if (password !== hotel.password) {
        toast.error("Incorrect password");
        setLoading(false);
        return;
      }

      // Create owner user
      const ownerUser: User = {
        id: `owner_${hotelId}_${Date.now()}`,
        name: `${hotel.name} Manager`,
        email: hotel.contact.email,
        phone: hotel.contact.phone,
        role: "owner",
        hotelId: hotel.id,
      };

      setCurrentUser(ownerUser);
      toast.success(`Welcome to ${hotel.name}!`);
      navigate("/owner/dashboard");
    } catch (error) {
      console.error("Owner login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const password = formData.get("password") as string;

      if (!name || !email || !phone || !password) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Check if user already exists
      const allUsers = await getAllUsers();
      const existingUser = allUsers.find((u: User) => u.email === email);
      if (existingUser) {
        toast.error("An account with this email already exists");
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        phone,
        password, // Store password (in production, hash this!)
        role: "customer",
      };

      await addUserToAPI(newUser);
      setCurrentUser(newUser);

      toast.success(`Account created successfully! Welcome, ${name}!`);
      navigate("/customer/home");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg">
            <div className="relative">
              <MapPin className="size-10 text-green-600" />
              <Utensils className="size-6 text-blue-600 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                HaFi Serve Rwanda
              </h1>
              <p className="text-sm text-gray-600">Serving near you</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Order Before You Arrive.
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Enjoy Without Waiting.
            </h2>
          </div>

          <p className="text-lg text-gray-600 max-w-md">
            Discover nearby hotels, explore their menus, and place your order in advance. 
            Save time and enjoy your meal the moment you arrive.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <div className="size-2 bg-green-500 rounded-full" />
              <span className="text-sm">Pre-Order</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <div className="size-2 bg-blue-500 rounded-full" />
              <span className="text-sm">Track Status</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <div className="size-2 bg-green-500 rounded-full" />
              <span className="text-sm">Save Time</span>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="w-full shadow-2xl border-0">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              Choose your role and login or create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="mb-6">
              <Label>I am a:</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Button
                  type="button"
                  variant={role === "customer" ? "default" : "outline"}
                  className={role === "customer" ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setRole("customer")}
                >
                  Customer
                </Button>
                <Button
                  type="button"
                  variant={role === "owner" ? "default" : "outline"}
                  className={role === "owner" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => setRole("owner")}
                >
                  Hotel Owner
                </Button>
              </div>
            </div>

            <Tabs defaultValue="login" className="w-full">
              {role === "customer" && (
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              )}
              
              {role === "owner" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
                  <p className="text-blue-900 font-semibold mb-2">🏨 Hotel Owner Access</p>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Hotel owner accounts are managed by administrators. If you are a hotel owner and need access, 
                    please contact the admin or use the demo credentials provided to you.
                  </p>
                </div>
              )}

              <TabsContent value="login">
                {role === "customer" ? (
                  <form onSubmit={handleCustomerLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      Login as Customer
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOwnerLogin} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <p className="text-blue-900 font-semibold mb-1">🏨 Hotel Owner Login</p>
                      <p className="text-blue-700 text-xs">Select your hotel and enter the default password. Password format: hotelname123 (e.g., marriott123)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-hotel">Hotel</Label>
                      <Select
                        id="login-hotel"
                        name="hotel"
                        onValueChange={setSelectedHotelId}
                        value={selectedHotelId}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your hotel" />
                        </SelectTrigger>
                        <SelectContent>
                          {hotels.map((hotel) => (
                            <SelectItem key={hotel.id} value={hotel.id}>
                              <div className="flex items-center gap-2">
                                <HotelIcon className="size-4" />
                                {hotel.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Hotel Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter hotel password"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    >
                      <HotelIcon className="size-4 mr-2" />
                      Access Hotel Dashboard
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleCustomerSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="+250 7XX XXX XXX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    Create Customer Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}