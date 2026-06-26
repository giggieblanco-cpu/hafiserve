import { useState, useEffect } from "react";
import { PlusCircle, Edit2, Trash2, Bed, Users, DollarSign } from "lucide-react";
import OwnerLayout from "../../components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { getCurrentUser } from "../../lib/storage";
import { getRoomsByHotelId, addRoom, updateRoom, deleteRoom } from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  beds: string;
  amenities: string[];
  description: string;
  available: boolean;
  image?: string;
}

const ROOM_TYPES = ["Single", "Double", "Suite", "Family", "Deluxe"];
const AVAILABLE_AMENITIES = [
  "Free WiFi",
  "Air Conditioning",
  "TV",
  "Smart TV",
  "Mini Bar",
  "Balcony",
  "Work Desk",
  "Coffee Maker",
  "Private Bathroom",
  "Mini Fridge",
  "Safe",
  "Room Service",
];

export default function OwnerRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "Single",
    price: "",
    capacity: "1",
    beds: "",
    description: "",
    available: true,
    amenities: [] as string[],
  });

  const user = getCurrentUser();
  const hotelId = user?.hotelId;

  useEffect(() => {
    if (hotelId) {
      loadRooms();
    }
  }, [hotelId]);

  const loadRooms = async () => {
    if (!hotelId) return;

    setLoading(true);
    try {
      const hotelRooms = await getRoomsByHotelId(hotelId);
      setRooms(hotelRooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        type: room.type,
        price: room.price.toString(),
        capacity: room.capacity.toString(),
        beds: room.beds,
        description: room.description,
        available: room.available,
        amenities: room.amenities,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: "",
        type: "Single",
        price: "",
        capacity: "1",
        beds: "",
        description: "",
        available: true,
        amenities: [],
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRoom(null);
  };

  const handleSaveRoom = async () => {
    if (!hotelId) return;

    if (!formData.name || !formData.price || !formData.beds || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseInt(formData.price);
    const capacity = parseInt(formData.capacity);

    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (isNaN(capacity) || capacity <= 0) {
      toast.error("Please enter a valid capacity");
      return;
    }

    try {
      if (editingRoom) {
        // Update existing room
        const updatedRoom = {
          ...editingRoom,
          name: formData.name,
          type: formData.type,
          price,
          capacity,
          beds: formData.beds,
          description: formData.description,
          available: formData.available,
          amenities: formData.amenities,
        };

        await updateRoom(hotelId, editingRoom.id, updatedRoom);
        toast.success("Room updated successfully!");
      } else {
        // Add new room
        const newRoom: Room = {
          id: `R${Date.now()}`,
          hotelId,
          name: formData.name,
          type: formData.type,
          price,
          capacity,
          beds: formData.beds,
          description: formData.description,
          available: formData.available,
          amenities: formData.amenities,
        };

        await addRoom(newRoom);
        toast.success("Room added successfully!");
      }

      await loadRooms();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("Failed to save room");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!hotelId) return;

    if (!confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      await deleteRoom(hotelId, roomId);
      toast.success("Room deleted successfully!");
      await loadRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  if (!user || user.role !== "owner") {
    return (
      <OwnerLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Access denied. Owner account required.</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Rooms</h1>
            <p className="text-gray-600">Add, edit, or remove rooms for your hotel</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>

        {/* Rooms List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No rooms yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first room</p>
              <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{room.name}</CardTitle>
                      <Badge variant="outline" className="mb-2">{room.type}</Badge>
                      <Badge
                        variant={room.available ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {room.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(room)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        {room.price.toLocaleString()} RWF/night
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Capacity: {room.capacity} guest{room.capacity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Bed className="mr-2 h-4 w-4" />
                      <span>{room.beds}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                    {room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{room.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {editingRoom ? "Update room details" : "Fill in the details for your new room"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Room Name */}
            <div>
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deluxe Suite"
              />
            </div>

            {/* Room Type */}
            <div>
              <Label htmlFor="type">Room Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price per Night (RWF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (Guests) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="2"
                />
              </div>
            </div>

            {/* Beds */}
            <div>
              <Label htmlFor="beds">Bed Configuration *</Label>
              <Input
                id="beds"
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                placeholder="e.g., 1 King Bed or 2 Double Beds"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the room"
              />
            </div>

            {/* Amenities */}
            <div>
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md">
                {AVAILABLE_AMENITIES.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Click to select/deselect amenities</p>
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="available" className="cursor-pointer">
                Room is available for booking
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoom} className="bg-green-600 hover:bg-green-700">
              {editingRoom ? "Update Room" : "Add Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}
