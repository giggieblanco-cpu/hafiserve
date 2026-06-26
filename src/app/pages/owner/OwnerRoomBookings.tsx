import { useState, useEffect } from "react";
import { Calendar, Users, Bed, Phone, Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import OwnerLayout from "../../components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { getCurrentUser, type RoomBooking } from "../../lib/storage";
import { getAllRoomBookings, updateRoomBooking } from "../../lib/api";
import { toast } from "sonner";

export default function OwnerRoomBookings() {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const user = getCurrentUser();
    if (user && user.hotelId) {
      const allBookings = await getAllRoomBookings();
      const hotelBookings = Array.isArray(allBookings) ? allBookings.filter((b) => b.hotelId === user.hotelId) : [];
      setBookings(hotelBookings);
    }
  };

  const handleUpdateStatus = async (booking: RoomBooking, status: "confirmed" | "cancelled") => {
    const updatedBooking = { ...booking, status };
    await updateRoomBooking(booking.id, updatedBooking);
    await loadBookings();
    toast.success(`Booking ${status}!`);
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-green-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "confirmed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Room Bookings</h1>
          <p className="text-gray-600">Manage your hotel room reservations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${filter === "all" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setFilter("all")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${filter === "pending" ? "ring-2 ring-yellow-500" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${filter === "confirmed" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setFilter("confirmed")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${filter === "cancelled" ? "ring-2 ring-red-500" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bed className="size-20 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "You don't have any room bookings yet"
                  : `No ${filter} bookings`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status);
              const nights = Math.ceil(
                (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{booking.roomName}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            <StatusIcon className="size-3 mr-1" />
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm">Booking ID: {booking.id}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {booking.totalPrice.toLocaleString()} RWF
                        </div>
                        <div className="text-sm text-gray-600">{nights} {nights === 1 ? "night" : "nights"}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Guest Information */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700 uppercase">Guest Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="size-4 text-gray-500" />
                            <span className="font-medium">{booking.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="size-4" />
                            <a href={`mailto:${booking.customerEmail}`} className="hover:underline">
                              {booking.customerEmail}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bed className="size-4" />
                            <span>{booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700 uppercase">Booking Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-4 text-gray-500" />
                            <div>
                              <span className="font-medium">Check-in:</span>{" "}
                              {new Date(booking.checkIn).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-4 text-gray-500" />
                            <div>
                              <span className="font-medium">Check-out:</span>{" "}
                              {new Date(booking.checkOut).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bed className="size-4" />
                            <span>Room Type: {booking.roomType}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === "pending" && (
                      <div className="mt-6 pt-6 border-t flex gap-3">
                        <Button
                          onClick={() => handleUpdateStatus(booking, "confirmed")}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="size-4 mr-2" />
                          Confirm Booking
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(booking, "cancelled")}
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="size-4 mr-2" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      Booked on: {new Date(booking.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
