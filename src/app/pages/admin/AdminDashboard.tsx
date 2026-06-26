import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Hotel, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  MapPin, 
  Utensils, 
  LogOut,
  Building2,
  DollarSign,
  Star,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { getAllHotels, addHotel, updateHotel, deleteHotel, getAllUsers, getAllOrders, getAllRoomBookings } from "../../lib/api";
import { Hotel as HotelType, User } from "../../lib/mockData";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [hotels, setHotelsState] = useState<HotelType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allHotels = await getAllHotels();
    setHotelsState(Array.isArray(allHotels) ? allHotels : []);

    const allUsers = await getAllUsers();
    setUsers(Array.isArray(allUsers) ? allUsers : []);

    const allOrders = await getAllOrders();
    setOrders(Array.isArray(allOrders) ? allOrders : []);

    const allBookings = await getAllRoomBookings();

    setStats({
      totalHotels: Array.isArray(allHotels) ? allHotels.length : 0,
      totalUsers: Array.isArray(allUsers) ? allUsers.length : 0,
      totalOrders: Array.isArray(allOrders) ? allOrders.length : 0,
      totalBookings: Array.isArray(allBookings) ? allBookings.length : 0,
    });
  };

  const handleLogout = () => {
    navigate("/");
    toast.success("Logged out from admin panel");
  };

  const handleAddHotel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newHotel: HotelType = {
      id: `${Date.now()}`,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      location: {
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        lat: 0,
        lng: 0,
      },
      rating: parseFloat(formData.get("rating") as string),
      totalReviews: 0,
      services: (formData.get("services") as string).split(",").map(s => s.trim()),
      image: uploadedImageUrl || (formData.get("image") as string),
      contact: {
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
      },
      password: (formData.get("password") as string) || `${(formData.get("name") as string).toLowerCase().replace(/\s+/g, '')}123`,
    };

    await addHotel(newHotel);
    await loadData();
    setShowAddDialog(false);
    setUploadedImageUrl("");
    toast.success(`${newHotel.name} added successfully!`);
  };

  const handleEditHotel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingHotel) return;

    const formData = new FormData(e.currentTarget);

    const updatedHotel: HotelType = {
      ...editingHotel,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      location: {
        ...editingHotel.location,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
      },
      rating: parseFloat(formData.get("rating") as string),
      services: (formData.get("services") as string).split(",").map(s => s.trim()),
      image: formData.get("image") as string,
      contact: {
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
      },
    };

    await updateHotel(editingHotel.id, updatedHotel);
    await loadData();
    setShowEditDialog(false);
    setEditingHotel(null);
    toast.success(`${updatedHotel.name} updated successfully!`);
  };

  const handleDeleteHotel = async (hotel: HotelType) => {
    if (confirm(`Are you sure you want to delete ${hotel.name}? This cannot be undone.`)) {
      try {
        await deleteHotel(hotel.id);
        await loadData();
        toast.success(`${hotel.name} deleted successfully!`);
      } catch (error: any) {
        console.error("Delete hotel error:", error);
        toast.error(`Failed to delete ${hotel.name}: ${error?.message || "Server error"}`);
      }
    }
  };

  const openEditDialog = (hotel: HotelType) => {
    setEditingHotel(hotel);
    setShowEditDialog(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setUploadedImageUrl(base64Url);
        toast.success(`Image uploaded! File size: ${(file.size / 1024).toFixed(2)}KB`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MapPin className="size-8 text-white" />
              <Utensils className="size-5 text-yellow-300 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">
                🔐 Admin Dashboard
              </h1>
              <p className="text-xs text-white/80">HaFi Serve Rwanda - Control Panel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:text-white hover:bg-white/20"
          >
            <LogOut className="size-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Total Hotels</p>
                  <p className="text-3xl font-bold">{stats.totalHotels}</p>
                </div>
                <Hotel className="size-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Total Customers</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="size-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="size-12 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Room Bookings</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </div>
                <Building2 className="size-12 text-white/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Hotels and Clients */}
        <Tabs defaultValue="hotels" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="hotels">🏨 Hotels</TabsTrigger>
            <TabsTrigger value="clients">👥 Customers</TabsTrigger>
          </TabsList>

          {/* Hotels Tab */}
          <TabsContent value="hotels">
            {/* Hotels Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Hotels Management</CardTitle>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="size-4 mr-2" />
              Add Hotel
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hotels.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Hotel className="size-20 mx-auto mb-4 text-gray-300" />
                  <p>No hotels yet. Add your first hotel!</p>
                </div>
              ) : (
                hotels.map((hotel) => (
                  <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{hotel.name}</h3>
                            <Badge className="bg-yellow-500">⭐ {hotel.rating}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{hotel.description}</p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="size-4" />
                              <span>{hotel.location.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Building2 className="size-4" />
                              <span>{hotel.location.city}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <span>📞 {hotel.contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <span>✉️ {hotel.contact.email}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {hotel.services.map((service, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(hotel)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteHotel(hotel)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">👥 Customers & Their Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="size-20 mx-auto mb-4 text-gray-300" />
                    <p>No customers yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => {
                      const userOrders = orders.filter((o: any) => o.customerId === user.id || o.customerEmail === user.email);
                      const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
                      
                      return (
                        <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-lg font-bold mb-2">{user.name}</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Mail className="size-4" />
                                    <span>{user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="size-4" />
                                    <span>{user.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-700 mt-1">{user.role === "customer" ? "👤 Customer" : "🏢 Owner"}</Badge>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="space-y-2">
                                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold text-green-600">{userOrders.length}</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Total Spent</p>
                                    <p className="text-xl font-bold text-blue-600">{totalSpent.toLocaleString()} RWF</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {userOrders.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="font-semibold text-sm mb-2">Recent Orders:</p>
                                <div className="space-y-2">
                                  {userOrders.slice(0, 3).map((order: any) => (
                                    <div key={order.id} className="bg-gray-50 p-2 rounded text-sm">
                                      <div className="flex justify-between items-start">
                                        <span className="font-medium">{order.hotelName}</span>
                                        <Badge className={order.status === "delivered" ? "bg-green-100 text-green-700" : order.status === "ready" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}>
                                          {order.status}
                                        </Badge>
                                      </div>
                                      <p className="text-gray-600">{order.items?.length || 1} item(s) — {order.total?.toLocaleString()} RWF</p>
                                      <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Hotel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Hotel</DialogTitle>
            <DialogDescription>Enter the details for the new hotel</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHotel} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name *</Label>
                <Input id="name" name="name" placeholder="Marriott Hotel Kigali" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating *</Label>
                <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" placeholder="4.5" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" placeholder="Luxury hotel in the heart of Kigali..." required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" name="address" placeholder="KG 5 Ave, Kigali" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" placeholder="Kigali" required />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+250 788 123 456" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="info@hotel.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="services">Services (comma-separated) *</Label>
              <Input id="services" name="services" placeholder="WiFi, Restaurant, Pool, Parking" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Hotel Image *</Label>
              <Input 
                id="image-upload" 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadedImageUrl && (
                <div className="mt-2">
                  <img src={uploadedImageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  <p className="text-xs text-green-600 mt-1">✓ Image ready</p>
                </div>
              )}
              <p className="text-xs text-gray-500">Upload image from PC or use image key from imageMap.ts</p>
              <Input id="image" name="image" placeholder="luxury-hotel-kigali (backup)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <Input id="password" name="password" type="password" placeholder="Enter a password" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Add Hotel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Dialog */}
      {editingHotel && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Hotel</DialogTitle>
              <DialogDescription>Update hotel details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditHotel} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Hotel Name *</Label>
                  <Input id="edit-name" name="name" defaultValue={editingHotel.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rating">Rating *</Label>
                  <Input id="edit-rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={editingHotel.rating} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea id="edit-description" name="description" defaultValue={editingHotel.description} required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address *</Label>
                  <Input id="edit-address" name="address" defaultValue={editingHotel.location.address} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City *</Label>
                  <Input id="edit-city" name="city" defaultValue={editingHotel.location.city} required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input id="edit-phone" name="phone" type="tel" defaultValue={editingHotel.contact.phone} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editingHotel.contact.email} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-services">Services (comma-separated) *</Label>
                <Input id="edit-services" name="services" defaultValue={editingHotel.services.join(", ")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Image Key *</Label>
                <Input id="edit-image" name="image" defaultValue={editingHotel.image} required />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setShowEditDialog(false);
                  setEditingHotel(null);
                }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Update Hotel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}