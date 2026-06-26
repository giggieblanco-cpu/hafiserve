import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Phone, Mail, MapPin, CheckCircle2, MessageCircle } from "lucide-react";

function toWhatsApp(phone: string) {
  return `https://wa.me/${phone.replace(/[\s+\-()]/g, "")}`;
}
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { getCart, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal, getCurrentUser } from "../../lib/storage";
import { CartItem } from "../../lib/storage";
import { getHotel, createOrder, createNotification } from "../../lib/api";
import { getImageUrl } from "../../lib/imageMap";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { Order } from "../../lib/mockData";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"MTN Mobile Money" | "Airtel Money" | "Cash">("MTN Mobile Money");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderedItems, setOrderedItems] = useState<{ hotelId: string; hotelName: string; items: CartItem[]; hotel: any }[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const currentCart = getCart();
    setCart(currentCart);
  };

  const handleQuantityChange = (menuItemId: string, newQuantity: number) => {
    updateCartItemQuantity(menuItemId, newQuantity);
    loadCart();
  };

  const handleRemoveItem = (menuItemId: string, itemName: string) => {
    removeFromCart(menuItemId);
    toast.success(`Removed ${itemName} from cart`);
    loadCart();
  };

  const total = getCartTotal();

  // Group cart items by hotel
  const cartByHotel = cart.reduce((acc, item) => {
    const hotelId = item.menuItem.hotelId;
    if (!acc[hotelId]) {
      acc[hotelId] = [];
    }
    acc[hotelId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }

    // Store ordered items with hotel info before clearing cart
    const ordersData = await Promise.all(Object.keys(cartByHotel).map(async (hotelId) => {
      const hotelItems = cartByHotel[hotelId];
      const hotel = await getHotel(hotelId);
      const hotelName = hotel?.name || "Hotel";

      const order: Order = {
        id: `order_${Date.now()}_${hotelId}`,
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        hotelId: hotelId,
        hotelName: hotelName,
        items: hotelItems.map((item) => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
          quantity: item.quantity,
        })),
        total: hotelItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
        status: "pending",
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
      };

      await createOrder(order);

      // Notify hotel owner about the new order
      if (hotel?.contact?.email) {
        createNotification({
          targetEmail: hotel.contact.email,
          title: `New order from ${user.name}`,
          message: `${hotelItems.length} item(s) · ${order.total.toLocaleString()} RWF · ${paymentMethod}`,
          type: "order",
          linkPath: "/owner/orders",
        });
      }

      return {
        hotelId,
        hotelName,
        items: hotelItems,
        hotel,
      };
    }));

    setOrderedItems(ordersData);
    clearCart();
    setShowPaymentDialog(false);
    setShowSuccessDialog(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    navigate("/customer/orders");
  };

  if (cart.length === 0) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <ShoppingCart className="size-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
          <Button onClick={() => navigate("/customer/home")} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
            Browse Hotels
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
          <p className="text-gray-600">{cart.length} item(s) in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.menuItem.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={getImageUrl(item.menuItem.image)}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{item.menuItem.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {item.menuItem.description}
                      </p>
                      <p className="font-bold text-green-600">
                        {item.menuItem.price.toLocaleString()} RWF
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveItem(item.menuItem.id, item.menuItem.name)}
                      >
                        <Trash2 className="size-4" />
                      </Button>

                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-7 p-0"
                          onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-7 p-0"
                          onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      <p className="font-bold">
                        {(item.menuItem.price * item.quantity).toLocaleString()} RWF
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{total.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">{total.toLocaleString()} RWF</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={handleCheckout}
                >
                  <CreditCard className="size-4 mr-2" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Payment Method</DialogTitle>
              <DialogDescription>
                Select your preferred payment method to complete your order
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="MTN Mobile Money" id="mtn" />
                  <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">MTN Mobile Money</p>
                      <p className="text-xs text-gray-500">Pay with MTN MoMo</p>
                    </div>
                  </Label>
                  <div className="text-yellow-500 font-bold text-xl">MTN</div>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="Airtel Money" id="airtel" />
                  <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">Airtel Money</p>
                      <p className="text-xs text-gray-500">Pay with Airtel Money</p>
                    </div>
                  </Label>
                  <div className="text-red-600 font-bold text-xl">Airtel</div>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="Cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">Cash on Pickup</p>
                      <p className="text-xs text-gray-500">Pay when you collect your order</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-900 mb-1">Total Amount:</p>
                <p className="text-2xl font-bold text-blue-600">{total.toLocaleString()} RWF</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="text-yellow-800">💡 <strong>Demo Mode:</strong> Payment integration coming soon. Orders will be placed without actual payment.</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={handleConfirmPayment}
                >
                  Confirm & Pay
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog with Order Summary & Hotel Contact Info */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Thank You for Your Order!</DialogTitle>
                  <DialogDescription>
                    Your order has been placed successfully
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Order Summary by Hotel */}
              {orderedItems.map(({ hotelId, hotelName, items, hotel }) => {
                const hotelTotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
                
                return (
                  <div key={hotelId} className="border rounded-lg p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-green-600">{hotelName}</h3>
                      <p className="text-sm text-gray-600">Order Summary</p>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.menuItem.id} className="flex justify-between items-center py-2 border-b">
                          <div className="flex-1">
                            <p className="font-medium">{item.menuItem.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {(item.menuItem.price * item.quantity).toLocaleString()} RWF
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2">
                        <p className="font-bold">Subtotal:</p>
                        <p className="font-bold text-green-600 text-lg">
                          {hotelTotal.toLocaleString()} RWF
                        </p>
                      </div>
                    </div>

                    {/* Hotel Contact Information */}
                    {hotel && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 space-y-3">
                        <p className="font-semibold text-gray-800 mb-2">
                          💳 To Complete Your Payment, Please Contact:
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <Phone className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">Phone</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <a
                                  href={`tel:${hotel.contact.phone}`}
                                  className="text-blue-600 hover:underline font-semibold"
                                >
                                  {hotel.contact.phone}
                                </a>
                                <a
                                  href={toWhatsApp(hotel.contact.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full transition-colors"
                                >
                                  <MessageCircle className="size-3" />
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Mail className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">Email</p>
                              <a 
                                href={`mailto:${hotel.contact.email}`}
                                className="text-blue-600 hover:underline font-semibold"
                              >
                                {hotel.contact.email}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">Location</p>
                              <p className="font-semibold">{hotel.location.address}, {hotel.location.city}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                          <p className="text-sm text-yellow-800">
                            <strong>Payment Method:</strong> {paymentMethod}
                          </p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Please contact the hotel directly to arrange payment and confirm your pickup time.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>📱 Next Steps:</strong>
                </p>
                <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                  <li>Contact the hotel(s) using the information above</li>
                  <li>Complete your payment via {paymentMethod}</li>
                  <li>Confirm your pickup time with the hotel</li>
                  <li>Visit the hotel and enjoy your meal! 🍽️</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseSuccess}
                >
                  View My Orders
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    navigate("/customer/home");
                  }}
                >
                  Browse More Hotels
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
}