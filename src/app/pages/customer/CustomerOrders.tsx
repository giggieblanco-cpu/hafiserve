import { useState, useEffect } from "react";
import { Receipt, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { getCurrentUser } from "../../lib/storage";
import { getAllOrders, getAllBuffetOrders } from "../../lib/api";
import { BuffetOrder, Order } from "../../lib/mockData";
import { format } from "date-fns";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    const loadOrders = async () => {
      if (user) {
        try {
          // Fetch BOTH regular orders and buffet orders
          const [allOrders, allBuffetOrders] = await Promise.all([
            getAllOrders(),
            getAllBuffetOrders()
          ]);
          
          // Combine and filter by current user
          const regularUserOrders = (allOrders || [])
            .filter((o: any) => o.customerId === user.id || o.customerEmail === user.email);
          
          const buffetUserOrders = (allBuffetOrders || [])
            .filter((o: any) => o.customerId === user.id || o.customerEmail === user.email);
          
          // Merge both arrays and sort by date
          const combinedOrders = [...regularUserOrders, ...buffetUserOrders]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setOrders(Array.isArray(combinedOrders) ? combinedOrders : []);
        } catch (error) {
          console.error("Failed to load orders:", error);
          setOrders([]);
        }
      }
    };
    loadOrders();
  }, [user?.id]);

  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing" || o.status === "ready"
  );
  const completedOrders = orders.filter((o) => o.status === "delivered");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  return (
    <CustomerLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Receipt className="size-20 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-500">Your orders will appear here once you place them</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelledOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {activeOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active orders</p>
              ) : (
                activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No completed orders</p>
              ) : (
                completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4 mt-6">
              {cancelledOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No cancelled orders</p>
              ) : (
                cancelledOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </CustomerLayout>
  );
}

function OrderCard({ order }: { order: Order | BuffetOrder }) {
  const isBuffetOrder = (order as BuffetOrder).buffetId !== undefined;

  const getStatusConfig = (status: Order["status"] | BuffetOrder["status"]) => {
    switch (status) {
      case "pending":
        return { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock };
      case "preparing":
        return { label: "Preparing", color: "bg-blue-100 text-blue-800", icon: Package };
      case "ready":
        return { label: "Ready", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "delivered":
        return { label: "Delivered", color: "bg-gray-100 text-gray-800", icon: CheckCircle };
      case "cancelled":
        return { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">Order #{order.id.slice(-8)}</CardTitle>
            <p className="text-sm text-gray-500">
              {format(new Date(order.createdAt), "PPP 'at' p")}
            </p>
          </div>
          <Badge className={`${statusConfig.color} flex items-center gap-1`}>
            <StatusIcon className="size-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items or Buffet Summary */}
        <div className="space-y-2">
          {isBuffetOrder ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Buffet: {(order as BuffetOrder).buffetName}</p>
              <p className="text-sm text-gray-600">Selected items: {(order as BuffetOrder).selectedItems?.length || 0}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Buffet total</span>
                <span className="font-semibold">{(order as BuffetOrder).totalPrice?.toLocaleString?.() || 0} RWF</span>
              </div>
            </div>
          ) : (
            ((order as Order).items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold">
                  {(item.price * item.quantity).toLocaleString()} RWF
                </span>
              </div>
            ))
          )}
        </div>

        {/* Total and Payment */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-semibold">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">
              {isBuffetOrder
                ? (order as BuffetOrder).totalPrice?.toLocaleString?.() || 0
                : (order as Order).total.toLocaleString()}
              {' '}RWF
            </span>
          </div>
        </div>

        {/* Order Timeline */}
        {order.status !== "cancelled" && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`size-8 rounded-full flex items-center justify-center ${
                  order.status === "pending" || order.status === "preparing" || order.status === "ready" || order.status === "delivered"
                    ? "bg-green-600 text-white"
                    : "bg-gray-300"
                }`}>
                  <CheckCircle className="size-4" />
                </div>
                <span className="text-sm font-semibold">Confirmed</span>
              </div>

              <div className="flex-1 h-0.5 bg-gray-300 mx-2" />

              <div className="flex items-center gap-2">
                <div className={`size-8 rounded-full flex items-center justify-center ${
                  order.status === "preparing" || order.status === "ready" || order.status === "delivered"
                    ? "bg-green-600 text-white"
                    : "bg-gray-300"
                }`}>
                  <Package className="size-4" />
                </div>
                <span className="text-sm font-semibold">Preparing</span>
              </div>

              <div className="flex-1 h-0.5 bg-gray-300 mx-2" />

              <div className="flex items-center gap-2">
                <div className={`size-8 rounded-full flex items-center justify-center ${
                  order.status === "ready" || order.status === "delivered"
                    ? "bg-green-600 text-white"
                    : "bg-gray-300"
                }`}>
                  <CheckCircle className="size-4" />
                </div>
                <span className="text-sm font-semibold">Ready</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}