import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Utensils, Check } from "lucide-react";
import OwnerLayout from "../../components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { getCurrentUser } from "../../lib/storage";
import { getAllBuffets, addBuffet, updateBuffet, deleteBuffet, getAllMenuItems } from "../../lib/api";
import { Buffet, MenuItem } from "../../lib/mockData";
import { toast } from "sonner";

export default function OwnerBuffets() {
  const [buffets, setBuffets] = useState<Buffet[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBuffet, setEditingBuffet] = useState<Buffet | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = getCurrentUser();
    if (currentUser?.hotelId) {
      // Load buffets
      const allBuffets = await getAllBuffets();
      const hotelBuffets = Array.isArray(allBuffets) ? allBuffets.filter((b) => b.hotelId === currentUser.hotelId) : [];
      setBuffets(hotelBuffets);

      // Load menu items for this hotel
      const allItems = await getAllMenuItems();
      const hotelItems = Array.isArray(allItems) ? allItems.filter((item) => item.hotelId === currentUser.hotelId) : [];
      setMenuItems(hotelItems);
    }
  };

  const handleAddNew = () => {
    setEditingBuffet(null);
    setSelectedItems([]);
    setShowDialog(true);
  };

  const handleEdit = (buffet: Buffet) => {
    setEditingBuffet(buffet);
    setSelectedItems(buffet.availableItems || []);
    setShowDialog(true);
  };

  const handleDelete = async (buffet: Buffet) => {
    if (confirm(`Are you sure you want to delete "${buffet.name}"?`)) {
      await deleteBuffet(buffet.id);
      toast.success("Buffet deleted");
      await loadData();
    }
  };

  const toggleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const buffetData: Buffet = {
      id: editingBuffet?.id || `buf_${Date.now()}`,
      hotelId: user?.hotelId || "",
      hotelName: user?.name || "",
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as "Breakfast" | "Lunch" | "Dinner" | "Special Event",
      image: formData.get("image") as string || "luxury-hotel-kigali",
      availableItems: selectedItems,
      available: formData.get("available") === "on",
      maxSelections: Number(formData.get("maxSelections")) || undefined,
      createdAt: editingBuffet?.createdAt || new Date().toISOString(),
    };

    if (editingBuffet) {
      await updateBuffet(buffetData.id, buffetData);
      toast.success("Buffet updated");
    } else {
      await addBuffet(buffetData);
      toast.success("Buffet created");
    }

    setShowDialog(false);
    await loadData();
  };

  return (
    <OwnerLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Buffet Management</h1>
            <p className="text-gray-600">Create and manage buffet packages for your hotel</p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="size-4 mr-1" />
            Create Buffet
          </Button>
        </div>

        {buffets.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Utensils className="size-20 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">No buffets yet</p>
              <Button onClick={handleAddNew}>Create Your First Buffet</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {buffets.map((buffet) => (
              <Card key={buffet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{buffet.name}</CardTitle>
                      <p className="text-sm text-gray-600">{buffet.description}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(buffet)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(buffet)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-xl font-bold text-green-600">{buffet.price.toLocaleString()} RWF</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <Badge variant="secondary">{buffet.category}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available Items</span>
                    <span className="font-semibold">{buffet.availableItems.length} items</span>
                  </div>

                  {buffet.maxSelections && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Max Selections</span>
                      <span className="font-semibold">{buffet.maxSelections} items</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={buffet.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {buffet.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBuffet ? "Edit Buffet" : "Create New Buffet"}</DialogTitle>
              <DialogDescription>
                {editingBuffet ? "Update your buffet package details" : "Create a new buffet package for your guests"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Buffet Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingBuffet?.name}
                    placeholder="e.g., Executive Breakfast Buffet"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (RWF) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={editingBuffet?.price}
                    placeholder="25000"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingBuffet?.description}
                  placeholder="Describe your buffet package..."
                  required
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" defaultValue={editingBuffet?.category || "Lunch"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Special Event">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSelections">Max Items Customer Can Select</Label>
                  <Input
                    id="maxSelections"
                    name="maxSelections"
                    type="number"
                    defaultValue={editingBuffet?.maxSelections}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Available Menu Items *</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {menuItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No menu items available. Add menu items first.</p>
                  ) : (
                    menuItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedItems.includes(item.id)
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <div className={`size-5 rounded border-2 flex items-center justify-center ${
                          selectedItems.includes(item.id)
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                        }`}>
                          {selectedItems.includes(item.id) && <Check className="size-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category} - {item.price.toLocaleString()} RWF</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500">{selectedItems.length} items selected</p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="available" className="cursor-pointer">
                  Available for ordering
                </Label>
                <Switch
                  id="available"
                  name="available"
                  defaultChecked={editingBuffet?.available !== false}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={selectedItems.length === 0}
                >
                  {editingBuffet ? "Update" : "Create"} Buffet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </OwnerLayout>
  );
}
