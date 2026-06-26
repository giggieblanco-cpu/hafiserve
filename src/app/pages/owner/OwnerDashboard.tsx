import { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Star, TrendingUp, Package } from "lucide-react";
import OwnerLayout from "../../components/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getCurrentUser } from "../../lib/storage";
import { getAllOrders, getHotel } from "../../lib/api";
import { Order } from "../../lib/mockData";
import { Hotel } from "../../lib/mockData";

export default function OwnerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState(getCurrentUser());
  const [hotel, setHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (currentUser?.hotelId) {
        const allOrders = await getAllOrders();
        const hotelOrders = Array.isArray(allOrders) ? allOrders.filter((o) => o.hotelId === currentUser.hotelId) : [];
        setOrders(hotelOrders);

        const userHotel = await getHotel(currentUser.hotelId);
        setHotel(userHotel || null);
      }
    };

    loadData();
  }, []);

  // Calculate statistics
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  ).length;

  const averageRating = hotel?.rating || 0;

  // Get most ordered items
  const itemCounts = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      if (!acc[item.name]) {
        acc[item.name] = 0;
      }
      acc[item.name] += item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Recent orders
  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toLocaleString()} RWF`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      icon: Package,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(1),
      icon: Star,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.bg} p-3 rounded-full`}>
                      <Icon className={`size-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Most Ordered Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-green-600" />
                Most Ordered Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {topItems.map(([name, count], idx) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gradient-to-r from-green-600 to-blue-600 text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-gray-500">{count} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-blue-600" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          Order #{order.id.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-500">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{order.total.toLocaleString()} RWF</p>
                        <p className={`text-xs ${
                          order.status === "pending"
                            ? "text-yellow-600"
                            : order.status === "preparing"
                            ? "text-blue-600"
                            : order.status === "ready"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!user?.hotelId && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <p className="text-yellow-800">
                ⚠️ You haven't set up your hotel yet. Go to <strong>Hotel Info</strong> to complete your profile.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </OwnerLayout>
  );
}