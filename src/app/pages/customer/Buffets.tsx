import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Star, MapPin, UtensilsCrossed, Check, ShoppingCart, Search } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { getAllBuffets, getAllMenuItems, getAllHotels, createBuffetOrder } from "../../lib/api";
import { getCurrentUser } from "../../lib/storage";
import { Buffet, MenuItem, Hotel } from "../../lib/mockData";
import { getImageUrl } from "../../lib/imageMap";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";

export default function Buffets() {
  const [buffets, setBuffets] = useState<Buffet[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedBuffet, setSelectedBuffet] = useState<Buffet | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"MTN Mobile Money" | "Airtel Money" | "Cash">("MTN Mobile Money");
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allBuffets = await getAllBuffets();
    const availableBuffets = Array.isArray(allBuffets) ? allBuffets.filter((b) => b.available) : [];
    setBuffets(availableBuffets);

    const allHotels = await getAllHotels();
    setHotels(Array.isArray(allHotels) ? allHotels : []);

    const allItems = await getAllMenuItems();
    setMenuItems(Array.isArray(allItems) ? allItems : []);
  };

  const getHotel = (hotelId: string) => {
    return hotels.find((h) => h.id === hotelId);
  };

  const getMenuItem = (itemId: string) => {
    return menuItems.find((item) => item.id === itemId);
  };

  const filteredBuffets = buffets
    .filter((buffet) => {
      const matchesSearch =
        buffet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buffet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buffet.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || buffet.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.price - a.price);

  const handleSelectBuffet = (buffet: Buffet) => {
    setSelectedBuffet(buffet);
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId: string) => {
    if (!selectedBuffet) return;

    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      // Check if max selections limit is reached
      if (selectedBuffet.maxSelections && selectedItems.length >= selectedBuffet.maxSelections) {
        toast.error(`You can only select up to ${selectedBuffet.maxSelections} items`);
        return;
      }
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleProceedToPayment = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    setShowOrderDialog(true);
  };

  const handleConfirmOrder = async () => {
    if (!user || !selectedBuffet) return;

    const order = {
      id: `BUFORD_${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      hotelId: selectedBuffet.hotelId,
      hotelName: selectedBuffet.hotelName,
      buffetId: selectedBuffet.id,
      buffetName: selectedBuffet.name,
      selectedItems: selectedItems,
      totalPrice: selectedBuffet.price,
      status: "pending" as const,
      paymentMethod: paymentMethod,
      createdAt: new Date().toISOString(),
    };

    await createBuffetOrder(order);
    toast.success("Buffet order placed successfully!");
    setShowOrderDialog(false);
    setSelectedBuffet(null);
    setSelectedItems([]);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <UtensilsCrossed className="size-12" />
            <h1 className="text-3xl md:text-4xl">Buffet Packages</h1>
          </div>
          <p className="text-lg opacity-90">All-you-can-enjoy buffets from Rwanda's finest hotels</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder="Search buffets, hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
              <SelectItem value="Special Event">Special Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buffets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuffets.map((buffet) => {
            const hotel = getHotel(buffet.hotelId);
            return (
              <Card key={buffet.id} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(buffet.image)}
                    alt={buffet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-purple-600">{buffet.category}</Badge>
                  </div>
                  {hotel && (
                    <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{hotel.rating}</span>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                    {buffet.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="size-4" />
                    <span>{buffet.hotelName}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{buffet.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Available Items</span>
                      <Badge variant="secondary">{buffet.availableItems.length} items</Badge>
                    </div>

                    {buffet.maxSelections && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">You can choose</span>
                        <Badge variant="outline">{buffet.maxSelections} items</Badge>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Buffet Price</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {buffet.price.toLocaleString()} RWF
                      </span>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => handleSelectBuffet(buffet)}
                    >
                      <UtensilsCrossed className="size-4 mr-1" />
                      Choose Items
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBuffets.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="size-20 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No buffets found matching your search.</p>
          </div>
        )}

        {/* Buffet Selection Dialog */}
        {selectedBuffet && (
          <Dialog open={!!selectedBuffet && !showOrderDialog} onOpenChange={() => setSelectedBuffet(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedBuffet.name}</DialogTitle>
                <DialogDescription>
                  Choose {selectedBuffet.maxSelections ? `up to ${selectedBuffet.maxSelections}` : "your"} items from the available menu
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Price Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Buffet Price</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {selectedBuffet.price.toLocaleString()} RWF
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedBuffet.maxSelections
                      ? `Select up to ${selectedBuffet.maxSelections} items`
                      : "Select as many items as you like"}
                  </p>
                </div>

                {/* Available Items */}
                <div>
                  <h3 className="font-semibold mb-3">Available Items ({selectedBuffet.availableItems.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedBuffet.availableItems.map((itemId) => {
                      const item = getMenuItem(itemId);
                      if (!item) return null;

                      return (
                        <div
                          key={itemId}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedItems.includes(itemId)
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => toggleItemSelection(itemId)}
                        >
                          <div className={`size-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedItems.includes(itemId)
                              ? "border-purple-500 bg-purple-500"
                              : "border-gray-300"
                          }`}>
                            {selectedItems.includes(itemId) && <Check className="size-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                            <Badge variant="outline" className="mt-1 text-xs">{item.category}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selection Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Selected Items:</span>
                    <span className="text-purple-600 font-bold">{selectedItems.length} / {selectedBuffet.maxSelections || "∞"}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBuffet(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={selectedItems.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Proceed to Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Payment Dialog */}
        {showOrderDialog && selectedBuffet && (
          <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Your Order</DialogTitle>
                <DialogDescription>Choose your payment method</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Order Summary */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold">{selectedBuffet.name}</h4>
                  <p className="text-sm text-gray-600">{selectedBuffet.hotelName}</p>
                  <p className="text-sm text-gray-700">
                    {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
                  </p>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {selectedBuffet.price.toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN Mobile Money">MTN Mobile Money</SelectItem>
                      <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                      <SelectItem value="Cash">Cash on Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                  Back
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Confirm Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </CustomerLayout>
  );
}
