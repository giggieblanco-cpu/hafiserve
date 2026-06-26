import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import OwnerLayout from "../../components/OwnerLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getCurrentUser } from "../../lib/storage";
import { getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from "../../lib/api";
import { MenuItem } from "../../lib/mockData";
import { getImageUrl } from "../../lib/imageMap";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";

export default function OwnerMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const currentUser = getCurrentUser();
    if (currentUser?.hotelId) {
      const allItems = await getAllMenuItems();
      const items = Array.isArray(allItems) ? allItems.filter((item) => item.hotelId === currentUser.hotelId) : [];
      setMenuItems(items);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowDialog(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowDialog(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await deleteMenuItem(item.id);
      toast.success("Menu item deleted");
      await loadMenuItems();
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const itemData: MenuItem = {
      id: editingItem?.id || `menu_${Date.now()}`,
      hotelId: user?.hotelId || "",
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      image: formData.get("image") as string || "fresh-fruit-juice",
      available: formData.get("available") === "on",
      prepTime: Number(formData.get("prepTime")),
    };

    if (editingItem) {
      await updateMenuItem(itemData.id, itemData);
      toast.success("Menu item updated");
    } else {
      await addMenuItem(itemData);
      toast.success("Menu item added");
    }

    setShowDialog(false);
    await loadMenuItems();
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <OwnerLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
            <p className="text-gray-600">Manage your menu items and pricing</p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="size-4 mr-1" />
            Add Menu Item
          </Button>
        </div>

        {menuItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 text-lg mb-4">No menu items yet</p>
              <Button onClick={handleAddNew}>Add Your First Item</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-3">{category}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              <div className="flex items-center gap-1">
                                <div className={`size-2 rounded-full ${item.available ? "bg-green-500" : "bg-red-500"}`} />
                                <span className="text-xs text-gray-500">
                                  {item.available ? "Available" : "Unavailable"}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-green-600">
                                {item.price.toLocaleString()} RWF
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="size-3" />
                                {item.prepTime} min
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update the details of your menu item" : "Add a new item to your menu"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingItem?.name}
                  placeholder="e.g., Grilled Chicken"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingItem?.description}
                  placeholder="Describe your item..."
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (RWF) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={editingItem?.price}
                    placeholder="5000"
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (min) *</Label>
                  <Input
                    id="prepTime"
                    name="prepTime"
                    type="number"
                    defaultValue={editingItem?.prepTime}
                    placeholder="15"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue={editingItem?.category || "Main Course"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="available" className="cursor-pointer">
                  Available for ordering
                </Label>
                <Switch
                  id="available"
                  name="available"
                  defaultChecked={editingItem?.available !== false}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  {editingItem ? "Update" : "Add"} Item
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </OwnerLayout>
  );
}