import { useState, useEffect } from "react";
import { Save, Hotel as HotelIcon } from "lucide-react";
import OwnerLayout from "../../components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { getCurrentUser, setCurrentUser } from "../../lib/storage";
import { getAllHotels, updateHotel } from "../../lib/api";
import { Hotel } from "../../lib/mockData";
import { toast } from "sonner";

export default function HotelInfo() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const loadHotelData = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (currentUser?.hotelId) {
        const hotels = await getAllHotels();
        const hotelArray = Array.isArray(hotels) ? hotels : [];
        const userHotel = hotelArray.find((h) => h.id === currentUser.hotelId);
        if (userHotel) {
          setHotel(userHotel);
          setServices(userHotel.services || []);
        }
      }
    };
    loadHotelData();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!hotel) {
      toast.error("Hotel data not found");
      return;
    }

    const updatedHotel: Hotel = {
      ...hotel,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      location: {
        ...hotel.location,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
      },
      contact: {
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
      },
      services: services,
    };

    await updateHotel(hotel.id, updatedHotel);
    setHotel(updatedHotel);
    toast.success("Hotel information updated successfully!");
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  if (!hotel) {
    return (
      <OwnerLayout>
        <Card>
          <CardContent className="py-16 text-center">
            <HotelIcon className="size-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hotel assigned</h2>
            <p className="text-gray-500">Contact support to set up your hotel profile</p>
          </CardContent>
        </Card>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hotel Information</h1>
          <p className="text-gray-600">Manage your hotel details and services</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={hotel.name}
                  placeholder="Enter hotel name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={hotel.description}
                  placeholder="Describe your hotel..."
                  required
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={hotel.location.address}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={hotel.location.city}
                    placeholder="City"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={hotel.contact.phone}
                    placeholder="+250 7XX XXX XXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={hotel.contact.email}
                    placeholder="info@hotel.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add a service (e.g., WiFi, Parking)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddService();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddService}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {services.map((service, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                      onClick={() => handleRemoveService(idx)}
                    >
                      {service} ×
                    </Badge>
                  ))}
                  {services.length === 0 && (
                    <p className="text-sm text-gray-500">No services added yet</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Rating</p>
                    <p className="font-bold text-lg">⭐ {hotel.rating}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Reviews</p>
                    <p className="font-bold text-lg">{hotel.totalReviews}</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Save className="size-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}