import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Hotel, Users, Bed, Wifi, Coffee, Check } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { getAllHotels } from "../../lib/api";
import { Hotel as HotelType } from "../../lib/mockData";
import { getImageUrl } from "../../lib/imageMap";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export default function RoomBooking() {
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get hotels that have accommodation services
    loadHotels();
  }, []);

  const loadHotels = async () => {
    const allHotels = await getAllHotels();
    if (!Array.isArray(allHotels)) {
      setHotels([]);
      return;
    }
    setHotels(allHotels);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Bed className="size-12" />
            <div>
              <h1 className="text-4xl font-bold">Book Your Room</h1>
              <p className="text-lg text-white/90 mt-1">
                Find and reserve the perfect accommodation in Kigali
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{hotels.length}+</div>
              <div className="text-sm text-white/80">Hotels Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-sm text-white/80">Average Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/80">Check-in Support</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/80">Secure Booking</div>
            </div>
          </div>
        </div>

        {/* Hotel Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Hotels</h2>
          {hotels.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Hotel className="size-20 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Hotels Available</h3>
                <p className="text-gray-500">Check back later for room availability</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <Card
                  key={hotel.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/customer/rooms/${hotel.id}`)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                    <ImageWithFallback
                      src={getImageUrl(hotel.image)}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/95 text-gray-900 backdrop-blur-sm">
                        ⭐ {hotel.rating}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl">{hotel.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hotel className="size-4" />
                      <span>{hotel.location.address}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {hotel.description}
                    </p>

                    {/* Amenities Preview */}
                    <div className="flex flex-wrap gap-2">
                      {hotel.services.slice(0, 3).map((service, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs"
                        >
                          <Check className="size-3 mr-1" />
                          {service}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/rooms/${hotel.id}`);
                        }}
                      >
                        View Available Rooms
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}