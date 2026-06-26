// Storage utilities for managing app data
// Using localStorage for MVP (instant, reliable, no backend needed)

import { User, Hotel, MenuItem, Order } from "./mockData";

const STORAGE_KEYS = {
  USER: "hafi_current_user",
  USERS: "hafi_users",
  HOTELS: "hafi_hotels",
  MENU_ITEMS: "hafi_menu_items",
  ORDERS: "hafi_orders",
  CART: "hafi_cart",
  ROOM_BOOKINGS: "hafi_room_bookings",
};

// ==================== USER MANAGEMENT ====================

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const addUser = async (user: User): Promise<void> => {
  const users = await getAllUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const users = await getAllUsers();
  return users.find((u) => u.email === email);
};

export const deleteUserByEmail = async (email: string): Promise<void> => {
  const users = await getAllUsers();
  const filtered = users.filter((u) => u.email !== email);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
};

// ==================== HOTEL MANAGEMENT ====================

export const getAllHotels = async (): Promise<Hotel[]> => {
  const hotelsStr = localStorage.getItem(STORAGE_KEYS.HOTELS);
  return hotelsStr ? JSON.parse(hotelsStr) : [];
};

export const setHotels = async (hotels: Hotel[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
};

export const getHotelById = async (id: string): Promise<Hotel | undefined> => {
  const hotels = await getAllHotels();
  return hotels.find((h) => h.id === id);
};

export const updateHotel = async (hotel: Hotel): Promise<void> => {
  const hotels = await getAllHotels();
  const index = hotels.findIndex((h) => h.id === hotel.id);
  if (index !== -1) {
    hotels[index] = hotel;
    await setHotels(hotels);
  }
};

export const addHotel = async (hotel: Hotel): Promise<void> => {
  const hotels = await getAllHotels();
  hotels.push(hotel);
  await setHotels(hotels);
};

export const deleteHotelById = async (id: string): Promise<void> => {
  const hotels = await getAllHotels();
  const filtered = hotels.filter((h) => h.id !== id);
  await setHotels(filtered);
};

// ==================== MENU ITEMS MANAGEMENT ====================

export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  const itemsStr = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
  return itemsStr ? JSON.parse(itemsStr) : [];
};

export const setMenuItems = async (items: MenuItem[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
};

export const getMenuItemsByHotelId = async (hotelId: string): Promise<MenuItem[]> => {
  const items = await getAllMenuItems();
  return items.filter((item) => item.hotelId === hotelId);
};

export const addMenuItem = async (item: MenuItem): Promise<void> => {
  const items = await getAllMenuItems();
  items.push(item);
  await setMenuItems(items);
};

export const updateMenuItem = async (item: MenuItem): Promise<void> => {
  const items = await getAllMenuItems();
  const index = items.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    items[index] = item;
    await setMenuItems(items);
  }
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const items = await getAllMenuItems();
  const filtered = items.filter((i) => i.id !== id);
  await setMenuItems(filtered);
};

// ==================== ORDERS MANAGEMENT ====================

export const getAllOrders = async (): Promise<Order[]> => {
  const ordersStr = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return ordersStr ? JSON.parse(ordersStr) : [];
};

export const setOrders = async (orders: Order[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const addOrder = async (order: Order): Promise<void> => {
  const orders = await getAllOrders();
  orders.push(order);
  await setOrders(orders);
};

export const updateOrder = async (order: Order): Promise<void> => {
  const orders = await getAllOrders();
  const index = orders.findIndex((o) => o.id === order.id);
  if (index !== -1) {
    orders[index] = order;
    await setOrders(orders);
  }
};

export const getOrdersByCustomerId = async (customerId: string): Promise<Order[]> => {
  const orders = await getAllOrders();
  return orders.filter((o) => o.customerId === customerId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getOrdersByHotelId = async (hotelId: string): Promise<Order[]> => {
  const orders = await getAllOrders();
  return orders.filter((o) => o.hotelId === hotelId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// ==================== CART MANAGEMENT ====================

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export const getCart = (): CartItem[] => {
  const cartStr = localStorage.getItem(STORAGE_KEYS.CART);
  return cartStr ? JSON.parse(cartStr) : [];
};

export const setCart = (cart: CartItem[]) => {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
};

export const addToCart = (menuItem: MenuItem, quantity: number = 1) => {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.menuItem.id === menuItem.id);
  
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ menuItem, quantity });
  }
  
  setCart(cart);
};

export const removeFromCart = (menuItemId: string) => {
  const cart = getCart();
  const filtered = cart.filter((item) => item.menuItem.id !== menuItemId);
  setCart(filtered);
};

export const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
  const cart = getCart();
  const index = cart.findIndex((item) => item.menuItem.id === menuItemId);
  
  if (index !== -1) {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      cart[index].quantity = quantity;
      setCart(cart);
    }
  }
};

export const clearCart = () => {
  localStorage.removeItem(STORAGE_KEYS.CART);
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};

// ==================== ROOM BOOKINGS MANAGEMENT ====================

export interface RoomBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  roomId: string;
  roomName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export const getAllRoomBookings = async (): Promise<RoomBooking[]> => {
  const bookingsStr = localStorage.getItem(STORAGE_KEYS.ROOM_BOOKINGS);
  return bookingsStr ? JSON.parse(bookingsStr) : [];
};

export const setRoomBookings = async (bookings: RoomBooking[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.ROOM_BOOKINGS, JSON.stringify(bookings));
};

export const addRoomBooking = async (booking: RoomBooking): Promise<void> => {
  const bookings = await getAllRoomBookings();
  bookings.push(booking);
  await setRoomBookings(bookings);
};

export const updateRoomBooking = async (booking: RoomBooking): Promise<void> => {
  const bookings = await getAllRoomBookings();
  const index = bookings.findIndex((b) => b.id === booking.id);
  if (index !== -1) {
    bookings[index] = booking;
    await setRoomBookings(bookings);
  }
};

export const getRoomBookingsByHotelId = async (hotelId: string): Promise<RoomBooking[]> => {
  const bookings = await getAllRoomBookings();
  return bookings.filter((b) => b.hotelId === hotelId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getRoomBookingsByCustomerId = async (customerId: string): Promise<RoomBooking[]> => {
  const bookings = await getAllRoomBookings();
  return bookings.filter((b) => b.customerId === customerId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
