import { projectId, publicAnonKey } from "/utils/supabase/info";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-47574933`;

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      console.error(`API Error [${endpoint}]:`, error);
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// ==================== AUTH API ====================

export async function login(email: string, password: string) {
  const { user } = await apiCall("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return user;
}

// ==================== USERS API ====================

export async function getAllUsers() {
  try {
    const { users } = await apiCall("/users");
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function addUser(user: any) {
  const { user: newUser } = await apiCall("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
  return newUser;
}

export async function deleteUser(email: string) {
  await apiCall(`/users/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

// ==================== HOTELS API ====================

export async function getAllHotels() {
  try {
    const { hotels } = await apiCall("/hotels");
    return Array.isArray(hotels) ? hotels : [];
  } catch (error) {
    console.error("Failed to fetch hotels:", error);
    return [];
  }
}

export async function getHotel(id: string) {
  const { hotel } = await apiCall(`/hotels/${id}`);
  return hotel;
}

export async function addHotel(hotel: any) {
  const { hotel: newHotel } = await apiCall("/hotels", {
    method: "POST",
    body: JSON.stringify(hotel),
  });
  return newHotel;
}

export async function updateHotel(id: string, updates: any) {
  const { hotel } = await apiCall(`/hotels/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return hotel;
}

export async function deleteHotel(id: string) {
  await apiCall(`/hotels/${id}`, {
    method: "DELETE",
  });
}

// ==================== MENU ITEMS API ====================

export async function getAllMenuItems() {
  try {
    const { items } = await apiCall("/menu-items");
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return [];
  }
}

export async function addMenuItem(item: any) {
  const { item: newItem } = await apiCall("/menu-items", {
    method: "POST",
    body: JSON.stringify(item),
  });
  return newItem;
}

export async function updateMenuItem(id: string, updates: any) {
  const { item } = await apiCall(`/menu-items/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return item;
}

export async function deleteMenuItem(id: string) {
  await apiCall(`/menu-items/${id}`, {
    method: "DELETE",
  });
}

// ==================== ORDERS API ====================

export async function getAllOrders() {
  try {
    const { orders } = await apiCall("/orders");
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function createOrder(order: any) {
  const { order: newOrder } = await apiCall("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
  return newOrder;
}

export async function updateOrder(id: string, updates: any) {
  const { order } = await apiCall(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return order;
}

// Get ALL orders (both regular and buffet) - consolidated endpoint for better performance
export async function getAllOrdersConsolidated() {
  try {
    const { orders } = await apiCall("/all-orders");
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("Failed to fetch all orders:", error);
    return [];
  }
}

// ==================== ROOMS API ====================

export async function getRoomsByHotelId(hotelId: string) {
  try {
    const { rooms } = await apiCall(`/rooms/${hotelId}`);
    return Array.isArray(rooms) ? rooms : [];
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return [];
  }
}

export async function addRoom(room: any) {
  const { room: newRoom } = await apiCall("/rooms", {
    method: "POST",
    body: JSON.stringify(room),
  });
  return newRoom;
}

export async function updateRoom(hotelId: string, id: string, updates: any) {
  const { room } = await apiCall(`/rooms/${hotelId}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return room;
}

export async function deleteRoom(hotelId: string, id: string) {
  await apiCall(`/rooms/${hotelId}/${id}`, {
    method: "DELETE",
  });
}

// ==================== ROOM BOOKINGS API ====================

export async function getAllRoomBookings() {
  try {
    const { bookings } = await apiCall("/room-bookings");
    return Array.isArray(bookings) ? bookings : [];
  } catch (error) {
    console.error("Failed to fetch room bookings:", error);
    return [];
  }
}

export async function createRoomBooking(booking: any) {
  const { booking: newBooking } = await apiCall("/room-bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
  return newBooking;
}

export async function updateRoomBooking(id: string, updates: any) {
  const { booking } = await apiCall(`/room-bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return booking;
}

// ==================== BUFFETS API ====================

export async function getAllBuffets() {
  try {
    const { buffets } = await apiCall("/buffets");
    return Array.isArray(buffets) ? buffets : [];
  } catch (error) {
    console.error("Failed to fetch buffets:", error);
    return [];
  }
}

export async function getBuffet(id: string) {
  const { buffet } = await apiCall(`/buffets/${id}`);
  return buffet;
}

export async function getBuffetsByHotelId(hotelId: string) {
  try {
    const { buffets } = await apiCall(`/buffets/hotel/${hotelId}`);
    return Array.isArray(buffets) ? buffets : [];
  } catch (error) {
    console.error("Failed to fetch buffets:", error);
    return [];
  }
}

export async function addBuffet(buffet: any) {
  const { buffet: newBuffet } = await apiCall("/buffets", {
    method: "POST",
    body: JSON.stringify(buffet),
  });
  return newBuffet;
}

export async function updateBuffet(id: string, updates: any) {
  const { buffet } = await apiCall(`/buffets/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return buffet;
}

export async function deleteBuffet(id: string) {
  await apiCall(`/buffets/${id}`, {
    method: "DELETE",
  });
}

// ==================== BUFFET ORDERS API ====================

export async function getAllBuffetOrders() {
  try {
    const { orders } = await apiCall("/buffet-orders");
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("Failed to fetch buffet orders:", error);
    return [];
  }
}

export async function getBuffetOrder(id: string) {
  const { order } = await apiCall(`/buffet-orders/${id}`);
  return order;
}

export async function createBuffetOrder(order: any) {
  const { order: newOrder } = await apiCall("/buffet-orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
  return newOrder;
}

export async function updateBuffetOrder(id: string, updates: any) {
  const { order } = await apiCall(`/buffet-orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return order;
}

// ==================== NOTIFICATIONS API ====================

export async function getNotifications(email: string) {
  try {
    const { notifications } = await apiCall(`/notifications/${encodeURIComponent(email)}`);
    return Array.isArray(notifications) ? notifications : [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markNotificationRead(notifId: string, email: string) {
  await apiCall(`/notifications/read/${notifId}`, {
    method: "PUT",
    body: JSON.stringify({ email }),
  });
}

export async function markAllNotificationsRead(email: string) {
  await apiCall(`/notifications/read-all/${encodeURIComponent(email)}`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}

export async function createNotification(notification: {
  targetEmail: string;
  title: string;
  message: string;
  type: "booking" | "message" | "order";
  linkPath?: string;
}) {
  try {
    const { notification: newNotif } = await apiCall("/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    });
    return newNotif;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

// ==================== MESSAGES API ====================

export async function getMessages(conversationId: string) {
  try {
    const { messages } = await apiCall(`/messages/${conversationId}`);
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}

export async function getConversations(email: string) {
  try {
    const { conversations } = await apiCall(`/conversations/${encodeURIComponent(email)}`);
    return Array.isArray(conversations) ? conversations : [];
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return [];
  }
}

export async function sendMessage(message: any) {
  const { message: newMessage } = await apiCall("/messages", {
    method: "POST",
    body: JSON.stringify(message),
  });
  return newMessage;
}

export async function markConversationRead(email: string, conversationId: string) {
  await apiCall(`/conversations/${encodeURIComponent(email)}/${conversationId}/read`, {
    method: "PUT",
  });
}

// ==================== INITIALIZATION API ====================

export async function initializeData(data: {
  users?: any[];
  hotels?: any[];
  menuItems?: any[];
  orders?: any[];
  roomBookings?: any[];
  buffets?: any[];
  buffetOrders?: any[];
}) {
  const response = await apiCall("/init", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
}
