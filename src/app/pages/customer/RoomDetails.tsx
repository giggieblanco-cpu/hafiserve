import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Calendar, Users, Bed, MapPin, Star, Phone, Mail, ArrowLeft, Check, Wifi, AirVent, Tv, Bath, Coffee } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { getAllHotels } from "../../lib/api";
import { Hotel as HotelType } from "../../lib/mockData";
import { getImageUrl } from "../../lib/imageMap";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { getCurrentUser, type RoomBooking } from "../../lib/storage";
import { createRoomBooking } from "../../lib/api";
import { getRoomsByHotelId } from "../../lib/api";

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  beds: string;
  amenities: string[];
  description: string;
  available: boolean;
  image: string;
}

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<HotelType | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadHotelAndRooms();
  }, [id]);

  const loadHotelAndRooms = async () => {
    const allHotels = await getAllHotels();
    const currentHotel = allHotels.find((h) => h.id === id);
    if (currentHotel) {
      setHotel(currentHotel);

      try {
        // Fetch real rooms from API
        const hotelRooms = await getRoomsByHotelId(currentHotel.id);

        // Ensure hotelRooms is an array
        if (!Array.isArray(hotelRooms)) {
          console.warn("Rooms data is not an array:", hotelRooms);
          setRooms([]);
          return;
        }

        // Add hotel image to rooms if not present
        const roomsWithImages = hotelRooms.map((room: Room) => ({
          ...room,
          image: room.image || currentHotel.image,
        }));

        setRooms(roomsWithImages);
      } catch (error) {
        console.error("Error loading rooms:", error);
        setRooms([]);
      }
    }
  };

  const amenityIcons: { [key: string]: any } = {
    "Free WiFi": Wifi,
    WiFi: Wifi,
    "Air Conditioning": AirVent,
    TV: Tv,
    "Smart TV": Tv,
    "Private Bathroom": Bath,
    Bathroom: Bath,
    "Mini Bar": Coffee,
    "Coffee Maker": Coffee,
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleConfirmBooking = async () => {
    if (!checkIn || !checkOut || !selectedRoom || !hotel) {
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    // Save the booking
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );

    const booking: RoomBooking = {
      id: `RB${Date.now()}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      roomType: selectedRoom.type,
      checkIn,
      checkOut,
      guests,
      totalPrice: selectedRoom.price * nights,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await createRoomBooking(booking);
    setShowConfirmation(true);
  };

  if (!hotel) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Hotel not found</h2>
          <Button onClick={() => navigate("/customer/rooms")} className="mt-4">
            Back to Hotels
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/customer/rooms")}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Hotels
        </Button>

        {/* Hotel Header */}
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative h-64 md:h-full bg-gradient-to-br from-gray-200 to-gray-300">
              <ImageWithFallback
                src={getImageUrl(hotel.image)}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="size-4" />
                    <span>{hotel.location.address}</span>
                  </div>
                  <Badge className="bg-yellow-500">⭐ {hotel.rating}</Badge>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{hotel.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="size-4" />
                  <a href={`tel:${hotel.contact.phone}`} className="hover:underline">
                    {hotel.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="size-4" />
                  <a href={`mailto:${hotel.contact.email}`} className="hover:underline">
                    {hotel.contact.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Available Rooms */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                  <ImageWithFallback
                    src={getImageUrl(room.image)}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={room.available ? "bg-green-600" : "bg-red-600"}>
                      {room.available ? "Available" : "Booked"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{room.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="size-4" />
                      <span>Up to {room.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="size-4" />
                      <span>{room.beds}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{room.description}</p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 4).map((amenity, idx) => {
                      const Icon = amenityIcons[amenity] || Check;
                      return (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Icon className="size-3 mr-1" />
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Price per night</span>
                      <span className="text-2xl font-bold text-green-600">
                        {room.price.toLocaleString()} RWF
                      </span>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      disabled={!room.available}
                      onClick={() => handleBookRoom(room)}
                    >
                      {room.available ? "Book Now" : "Unavailable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedRoom && (
        <Dialog open={!!selectedRoom && !showConfirmation} onOpenChange={() => setSelectedRoom(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book {selectedRoom.name}</DialogTitle>
              <DialogDescription>
                Complete your booking details below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {Array.from({ length: selectedRoom.capacity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              {checkIn && checkOut && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Duration</span>
                    <span className="font-medium">
                      {Math.ceil(
                        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      nights
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price per night</span>
                    <span className="font-medium">{selectedRoom.price.toLocaleString()} RWF</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      {(
                        selectedRoom.price *
                        Math.ceil(
                          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      ).toLocaleString()}{" "}
                      RWF
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedRoom(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={!checkIn || !checkOut}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-600">🎉 Booking Request Submitted!</DialogTitle>
            <DialogDescription>
              Your room booking request has been received
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-medium">
                      {checkIn && new Date(checkIn).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-medium">
                      {checkOut && new Date(checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-1">Room</p>
                  <p className="font-medium">{selectedRoom?.name}</p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-1">Guests</p>
                  <p className="font-medium">{guests}</p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedRoom &&
                      (
                        selectedRoom.price *
                        Math.ceil(
                          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      ).toLocaleString()}{" "}
                    RWF
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Phone className="size-4" />
                Contact Hotel to Complete Booking
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <strong>{hotel.name}</strong>
                </p>
                <p className="text-gray-600">📞 {hotel.contact.phone}</p>
                <p className="text-gray-600">✉️ {hotel.contact.email}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center">
              Please contact the hotel directly to confirm your booking and arrange payment
            </p>
          </div>

          <Button
            onClick={() => {
              setShowConfirmation(false);
              setSelectedRoom(null);
              navigate("/customer/my-bookings");
            }}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            View My Bookings
          </Button>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}