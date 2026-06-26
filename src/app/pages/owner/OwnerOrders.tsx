import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import OwnerLayout from "../../components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { getCurrentUser } from "../../lib/storage";
import { getAllOrders, updateOrder, getAllBuffetOrders, updateBuffetOrder } from "../../lib/api";
import { BuffetOrder, Order } from "../../lib/mockData";
import { format } from "date-fns";
import { toast } from "sonner";

export default function OwnerOrders() {
  const [orders, setOrders] = useState<Array<Order | BuffetOrder>>([]);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const currentUser = getCurrentUser();
    if (currentUser?.hotelId) {
      try {
        // Fetch BOTH regular orders and buffet orders
        const [allOrders, allBuffetOrders] = await Promise.all([
          getAllOrders(),
          getAllBuffetOrders()
        ]);
        
        // Filter both by hotel ID
        const hotelRegularOrders = Array.isArray(allOrders) 
          ? allOrders.filter((o: any) => o.hotelId === currentUser.hotelId) 
          : [];
        
        const hotelBuffetOrders = Array.isArray(allBuffetOrders) 
          ? allBuffetOrders.filter((o: any) => o.hotelId === currentUser.hotelId) 
          : [];
        
        // Combine and sort by date
        const combinedOrders = [...hotelRegularOrders, ...hotelBuffetOrders]
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setOrders(combinedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      }
    }
  };

  const handleUpdateStatus = async (order: Order | BuffetOrder, newStatus: Order["status"] | BuffetOrder["status"]) => {
    const updatedOrder = { ...order, status: newStatus };
    const isBuffetOrder = (order as BuffetOrder).buffetId !== undefined;

    try {
      if (isBuffetOrder) {
        await updateBuffetOrder(order.id, updatedOrder);
      } else {
        await updateOrder(order.id, updatedOrder);
      }
      await loadOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status");
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const completedOrders = orders.filter((o) => o.status === "delivered");

  return (
    <OwnerLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="size-20 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-500">Orders from customers will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="preparing">
                Preparing ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="ready">
                Ready ({readyOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending orders</p>
              ) : (
                pendingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="preparing" className="space-y-4 mt-6">
              {preparingOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders in preparation</p>
              ) : (
                preparingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="ready" className="space-y-4 mt-6">
              {readyOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders ready for pickup</p>
              ) : (
                readyOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No completed orders</p>
              ) : (
                completedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </OwnerLayout>
  );
}

interface OrderCardProps {
  order: Order | BuffetOrder;
  onUpdateStatus: (order: Order | BuffetOrder, newStatus: Order["status"] | BuffetOrder["status"]) => void;
}

function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
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
              Customer: <span className="font-semibold">{order.customerName}</span>
            </p>
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
        {/* Order Items */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="font-semibold mb-2">Items:</p>
          {isBuffetOrder ? (
            <div className="text-sm text-gray-600">
              <p className="font-medium">Buffet order:</p>
              <p>{(order as BuffetOrder).buffetName}</p>
              <p className="mt-2 text-sm text-gray-500">Selected items: {(order as BuffetOrder).selectedItems.join(", ") || "None"}</p>
            </div>
          ) : (
            (order as Order).items.map((item, idx) => (
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

        {/* Payment & Total */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-semibold">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-green-600">{(isBuffetOrder ? (order as BuffetOrder).totalPrice : (order as Order).total).toLocaleString()} RWF</span>
          </div>
        </div>

        {/* Action Buttons */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <div className="flex gap-2 pt-2">
            {order.status === "pending" && (
              <>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onUpdateStatus(order, "preparing")}
                >
                  <Package className="size-4 mr-1" />
                  Start Preparing
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onUpdateStatus(order, "cancelled")}
                >
                  <XCircle className="size-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}

            {order.status === "preparing" && (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => onUpdateStatus(order, "ready")}
              >
                <CheckCircle className="size-4 mr-1" />
                Mark as Ready
              </Button>
            )}

            {order.status === "ready" && (
              <Button
                className="flex-1 bg-gray-600 hover:bg-gray-700"
                onClick={() => onUpdateStatus(order, "delivered")}
              >
                <CheckCircle className="size-4 mr-1" />
                Mark as Delivered
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}