import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import CustomerHome from "./pages/customer/CustomerHome";
import HotelDetails from "./pages/customer/HotelDetails";
import CustomerOrders from "./pages/customer/CustomerOrders";
import Cart from "./pages/customer/Cart";
import RoomBooking from "./pages/customer/RoomBooking";
import RoomDetails from "./pages/customer/RoomDetails";
import MyBookings from "./pages/customer/MyBookings";
import Buffets from "./pages/customer/Buffets";
import CustomerMessages from "./pages/customer/Messages";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerMenu from "./pages/owner/OwnerMenu";
import OwnerOrders from "./pages/owner/OwnerOrders";
import OwnerRoomBookings from "./pages/owner/OwnerRoomBookings";
import OwnerRooms from "./pages/owner/OwnerRooms";
import OwnerBuffets from "./pages/owner/OwnerBuffets";
import OwnerMessages from "./pages/owner/Messages";
import HotelInfo from "./pages/owner/HotelInfo";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import AdminShortcutHandler from "./components/AdminShortcutHandler";
import { Outlet } from "react-router";

function RootLayout() {
  return (
    <>
      <AdminShortcutHandler />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <AboutUs /> },
      {
        path: "customer",
        children: [
          { index: true, element: <Navigate to="/customer/home" replace /> },
          { path: "home", element: <CustomerHome /> },
          { path: "hotel/:id", element: <HotelDetails /> },
          { path: "buffets", element: <Buffets /> },
          { path: "orders", element: <CustomerOrders /> },
          { path: "cart", element: <Cart /> },
          { path: "rooms", element: <RoomBooking /> },
          { path: "rooms/:id", element: <RoomDetails /> },
          { path: "my-bookings", element: <MyBookings /> },
          { path: "messages", element: <CustomerMessages /> },
        ],
      },
      {
        path: "owner",
        children: [
          { index: true, element: <Navigate to="/owner/dashboard" replace /> },
          { path: "dashboard", element: <OwnerDashboard /> },
          { path: "orders", element: <OwnerOrders /> },
          { path: "room-bookings", element: <OwnerRoomBookings /> },
          { path: "messages", element: <OwnerMessages /> },
          { path: "rooms", element: <OwnerRooms /> },
          { path: "menu", element: <OwnerMenu /> },
          { path: "buffets", element: <OwnerBuffets /> },
          { path: "hotel-info", element: <HotelInfo /> },
        ],
      },
      {
        path: "admin",
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);