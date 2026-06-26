import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Bed, Clock, Phone, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { getCurrentUser, type RoomBooking } from "../../lib/storage";
import { getAllHotels, getAllRoomBookings } from "../../lib/api";
import { Hotel } from "../../lib/mockData";

export default function MyBookings() {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const user = getCurrentUser();
    if (!user) return;

    const allBookings = await getAllRoomBookings();
    if (!Array.isArray(allBookings)) {
      setBookings([]);
      return;
    }

    const myBookings = allBookings.filter((b) => b.customerId === user.id);
    // Sort by most recent first
    myBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setBookings(myBookings);

    const allHotels = await getAllHotels();
    setHotels(Array.isArray(allHotels) ? allHotels : []);
  };

  const getHotelDetails = (hotelId: string) => {
    return hotels.find((h) => h.id === hotelId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="size-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="size-5 text-red-600" />;
      case "pending":
        return <AlertCircle className="size-5 text-yellow-600" />;
      default:
        return <Clock className="size-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const stats = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <CustomerLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">My Room Bookings</h1>
          <p className="text-gray-600">Track your room reservations and booking status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className={`cursor-pointer transition-all ${
              activeTab === "all" ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-md"
            }`}
            onClick={() => setActiveTab("all")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.all}</div>
              <div className="text-sm text-gray-600">All Bookings</div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              activeTab === "pending" ? "ring-2 ring-yellow-500 shadow-md" : "hover:shadow-md"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              activeTab === "confirmed" ? "ring-2 ring-green-500 shadow-md" : "hover:shadow-md"
            }`}
            onClick={() => setActiveTab("confirmed")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              activeTab === "cancelled" ? "ring-2 ring-red-500 shadow-md" : "hover:shadow-md"
            }`}
            onClick={() => setActiveTab("cancelled")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar className="size-16 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-600">
                    {activeTab === "all" ? "No bookings yet" : `No ${activeTab} bookings`}
                  </p>
                  <p className="text-gray-500 mt-2">Start exploring hotels and book your perfect room!</p>
                </div>
                <Button
                  onClick={() => (window.location.href = "/customer/rooms")}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Browse Hotels
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const hotel = getHotelDetails(booking.hotelId);
              const checkInDate = new Date(booking.checkIn);
              const checkOutDate = new Date(booking.checkOut);
              const nights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Booking Info */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{booking.hotelName}</h3>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin className="size-4" />
                            <span>{hotel?.location.address}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {/* Room Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Bed className="size-4" />
                            <span className="font-medium">{booking.roomName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users className="size-4" />
                            <span>
                              {booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="size-4" />
                            <span>{nights} {nights === 1 ? "Night" : "Nights"}</span>
                          </div>
                        </div>

                        {/* Check-in/out */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Check-in</p>
                            <p className="font-medium flex items-center gap-2">
                              <Calendar className="size-4 text-green-600" />
                              {checkInDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Check-out</p>
                            <p className="font-medium flex items-center gap-2">
                              <Calendar className="size-4 text-red-600" />
                              {checkOutDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Hotel Contact Info */}
                      {hotel && (
                        <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Hotel Contact:</p>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="size-3" />
                            <a href={`tel:${hotel.contact.phone}`} className="hover:underline">
                              {hotel.contact.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="size-3" />
                            <a href={`mailto:${hotel.contact.email}`} className="hover:underline">
                              {hotel.contact.email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status & Price */}
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 md:w-64 flex flex-col justify-between">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(booking.status)}
                          <span className="font-semibold text-gray-700">
                            {booking.status === "pending" && "Awaiting Confirmation"}
                            {booking.status === "confirmed" && "Booking Confirmed!"}
                            {booking.status === "cancelled" && "Booking Cancelled"}
                          </span>
                        </div>

                        {booking.status === "pending" && (
                          <p className="text-sm text-gray-600">
                            Please contact the hotel to confirm your booking and arrange payment.
                          </p>
                        )}

                        {booking.status === "confirmed" && (
                          <p className="text-sm text-green-700 font-medium">
                            ✅ Your room is reserved! Contact the hotel for payment details.
                          </p>
                        )}

                        {booking.status === "cancelled" && (
                          <p className="text-sm text-red-700">
                            This booking has been cancelled. Contact the hotel for more information.
                          </p>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-3xl font-bold text-green-600">
                          {booking.totalPrice.toLocaleString()} <span className="text-lg">RWF</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ({(booking.totalPrice / nights).toLocaleString()} RWF per night)
                        </p>
                      </div>

                      <div className="mt-4 text-xs text-gray-500">
                        <p>Booking ID: {booking.id}</p>
                        <p>
                          Booked on:{" "}
                          {new Date(booking.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}