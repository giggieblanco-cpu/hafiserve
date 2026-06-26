import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, MapPin, Phone, Mail, Clock, Plus, Minus, ShoppingCart, ArrowLeft, MessageCircle } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { addToCart, getCart } from "../../lib/storage";
import { getHotel, getAllMenuItems } from "../../lib/api";
import { Hotel, MenuItem } from "../../lib/mockData";
import { getImageUrl } from "../../lib/imageMap";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadHotelData = async () => {
      if (id) {
        const hotelData = await getHotel(id);
        setHotel(hotelData || null);

        if (hotelData) {
          const allItems = await getAllMenuItems();
          const hotelItems = allItems.filter((item) => item.hotelId === id);
          setMenuItems(Array.isArray(hotelItems) ? hotelItems : []);
        }
      }
    };
    loadHotelData();
  }, [id]);

  if (!hotel) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Hotel not found</p>
          <Link to="/customer/home">
            <Button className="mt-4">Back to Hotels</Button>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Define category order: Beverage, Starter, Main Course, Dessert
  const categoryOrder = ["Beverage", "Starter", "Main Course", "Dessert"];
  const categories = Object.keys(groupedMenuItems).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    // If category not in order list, put it at the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    addToCart(item, quantity);
    toast.success(`Added ${quantity}x ${item.name} to cart`);
    setQuantities({ ...quantities, [item.id]: 1 });
  };

  const incrementQuantity = (itemId: string) => {
    setQuantities({
      ...quantities,
      [itemId]: (quantities[itemId] || 1) + 1,
    });
  };

  const decrementQuantity = (itemId: string) => {
    const current = quantities[itemId] || 1;
    if (current > 1) {
      setQuantities({
        ...quantities,
        [itemId]: current - 1,
      });
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/customer/home">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-1" />
            Back to Hotels
          </Button>
        </Link>

        {/* Hotel Header */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="h-64 md:h-80">
            <ImageWithFallback
              src={getImageUrl(hotel.image)}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{hotel.name}</h1>
                <p className="text-lg opacity-90">{hotel.description}</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 text-gray-900 flex-shrink-0">
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{hotel.rating}</span>
                <span className="text-sm text-gray-500">({hotel.totalReviews})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <MapPin className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Location</p>
                <p className="text-sm text-gray-600">{hotel.location.address}</p>
                <p className="text-sm text-gray-500">{hotel.location.city}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Phone className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Contact</p>
                <p className="text-sm text-gray-600">{hotel.contact.phone}</p>
                <p className="text-sm text-gray-500">{hotel.contact.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/customer/messages?hotelId=${hotel.id}`)}
                  className="mt-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                >
                  <MessageCircle className="size-4 mr-1" />
                  Message Hotel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="font-semibold mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {hotel.services.map((service, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Menu</h2>
            
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No menu items available</p>
            ) : categories.length === 1 ? (
              // Single category - no tabs
              <div className="space-y-4">
                {groupedMenuItems[categories[0]].map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={quantities[item.id] || 1}
                    onIncrement={() => incrementQuantity(item.id)}
                    onDecrement={() => decrementQuantity(item.id)}
                    onAddToCart={() => handleAddToCart(item)}
                  />
                ))}
              </div>
            ) : (
              // Multiple categories - use tabs
              <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="mb-4 flex-wrap h-auto">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category} ({groupedMenuItems[category].length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    {groupedMenuItems[category].map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={quantities[item.id] || 1}
                        onIncrement={() => incrementQuantity(item.id)}
                        onDecrement={() => decrementQuantity(item.id)}
                        onAddToCart={() => handleAddToCart(item)}
                      />
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddToCart: () => void;
}

function MenuItemCard({ item, quantity, onIncrement, onDecrement, onAddToCart }: MenuItemCardProps) {
  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={getImageUrl(item.image)}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold">{item.name}</h3>
          {!item.available && (
            <Badge variant="destructive" className="text-xs flex-shrink-0">
              Unavailable
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{item.prepTime} min</span>
          </div>
          <span className="font-bold text-green-600 text-lg">
            {item.price.toLocaleString()} RWF
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between gap-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            className="size-8 p-0"
            onClick={onDecrement}
            disabled={!item.available}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <Button
            size="sm"
            variant="ghost"
            className="size-8 p-0"
            onClick={onIncrement}
            disabled={!item.available}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <Button
          size="sm"
          onClick={onAddToCart}
          disabled={!item.available}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <ShoppingCart className="size-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
