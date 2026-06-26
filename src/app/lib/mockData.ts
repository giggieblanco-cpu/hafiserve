// Mock data for HaFi Serve Rwanda

export interface Hotel {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  totalReviews: number;
  location: {
    address: string;
    city: string;
    district?: string; // Add district as optional field
    lat: number;
    lng: number;
  };
  contact: {
    phone: string;
    email: string;
  };
  services: string[];
  password: string; // Default password for hotel owner login
  ownerId?: string;
}

export interface MenuItem {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  prepTime: number; // minutes
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  hotelId: string;
  hotelName: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  customerEmail?: string;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  paymentMethod: "MTN Mobile Money" | "Airtel Money" | "Cash";
  createdAt: string;
  pickupTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "owner";
  hotelId?: string; // for owners
}

export interface Buffet {
  id: string;
  hotelId: string;
  hotelName: string;
  name: string;
  description: string;
  price: number;
  image: string;
  availableItems: string[]; // array of menu item IDs
  category: "Breakfast" | "Lunch" | "Dinner" | "Special Event";
  available: boolean;
  maxSelections?: number; // optional: limit number of items customer can select
  createdAt: string;
}

export interface BuffetOrder {
  id: string;
  customerId: string;
  customerName: string;
  hotelId: string;
  hotelName: string;
  buffetId: string;
  buffetName: string;
  selectedItems: string[]; // array of menu item IDs selected by customer
  totalPrice: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  paymentMethod: "MTN Mobile Money" | "Airtel Money" | "Cash";
  createdAt: string;
  eventDate?: string; // for future buffets
}

// Rwanda Hotels Data
export const MOCK_HOTELS: Hotel[] = [
  {
    id: "1",
    name: "Kigali Marriott Hotel",
    description: "Luxury 5-star hotel in the heart of Kigali offering international cuisine and exceptional service.",
    image: "luxury-hotel-kigali",
    rating: 4.8,
    totalReviews: 324,
    location: {
      address: "KN 3 Ave, Kigali",
      city: "Kigali",
      lat: -1.9536,
      lng: 30.0606,
    },
    contact: {
      phone: "+250 788 188 000",
      email: "info@marriottkigali.com",
    },
    services: ["Restaurant", "Room Service", "Bar", "Conference Rooms", "Spa"],
    password: "marriott123",
  },
  {
    id: "2",
    name: "Heaven Restaurant",
    description: "Popular restaurant and boutique hotel known for delicious local and international dishes with a beautiful garden setting.",
    image: "restaurant-terrace-garden",
    rating: 4.7,
    totalReviews: 512,
    location: {
      address: "KG 7 Ave, Kimihurura, Kigali",
      city: "Kigali",
      lat: -1.9442,
      lng: 30.0946,
    },
    contact: {
      phone: "+250 788 504 539",
      email: "info@heavenrwanda.com",
    },
    services: ["Restaurant", "Boutique Hotel", "Events", "Catering"],
    password: "heaven123",
  },
];

// Menu Items - Standardized categories: Beverage, Starter, Main Course, Dessert
export const MOCK_MENU_ITEMS: MenuItem[] = [
  // Kigali Marriott Hotel
  {
    id: "m1",
    hotelId: "1",
    name: "Grilled Tilapia",
    description: "Fresh tilapia grilled to perfection with vegetables and rice",
    price: 12000,
    category: "Main Course",
    image: "grilled-fish-plate",
    available: true,
    prepTime: 25,
  },
  {
    id: "m2",
    hotelId: "1",
    name: "Beef Brochettes",
    description: "Tender beef skewers marinated in local spices",
    price: 15000,
    category: "Main Course",
    image: "beef-skewers-grilled",
    available: true,
    prepTime: 20,
  },
  {
    id: "m3",
    hotelId: "1",
    name: "Club Sandwich",
    description: "Triple-decker sandwich with chicken, bacon, lettuce, and fries",
    price: 8000,
    category: "Starter",
    image: "club-sandwich-fries",
    available: true,
    prepTime: 15,
  },
  {
    id: "m4",
    hotelId: "1",
    name: "Fruit Juice (Fresh)",
    description: "Freshly squeezed passion fruit, mango, or pineapple juice",
    price: 3000,
    category: "Beverage",
    image: "fresh-fruit-juice",
    available: true,
    prepTime: 5,
  },
  {
    id: "m9",
    hotelId: "1",
    name: "Ikivuguto (Traditional Yogurt)",
    description: "Authentic Rwandan fermented milk, creamy and refreshing",
    price: 2500,
    category: "Beverage",
    image: "fresh-fruit-juice",
    available: true,
    prepTime: 2,
  },
  {
    id: "m10",
    hotelId: "1",
    name: "Sambaza (Fried Sardines)",
    description: "Crispy fried small fish from Lake Kivu, served with lemon",
    price: 5000,
    category: "Starter",
    image: "grilled-fish-plate",
    available: true,
    prepTime: 15,
  },

  // Heaven Restaurant - Traditional Rwandan Cuisine
  {
    id: "m5",
    hotelId: "2",
    name: "Isombe (Cassava Leaves)",
    description: "Traditional Rwandan dish of cassava leaves cooked in peanut sauce",
    price: 7000,
    category: "Main Course",
    image: "african-vegetable-stew",
    available: true,
    prepTime: 30,
  },
  {
    id: "m11",
    hotelId: "2",
    name: "Imyumbati (Cassava)",
    description: "Boiled cassava roots served with peanut sauce, a Rwandan staple",
    price: 4000,
    category: "Starter",
    image: "african-vegetable-stew",
    available: true,
    prepTime: 20,
  },
  {
    id: "m12",
    hotelId: "2",
    name: "Amateke (Baked Taro)",
    description: "Traditional taro roots baked and served with butter",
    price: 4500,
    category: "Starter",
    image: "african-vegetable-stew",
    available: true,
    prepTime: 25,
  },
  {
    id: "m13",
    hotelId: "2",
    name: "Ubugari n'Isambaza",
    description: "Cassava porridge served with crispy fried sardines from Lake Kivu",
    price: 8000,
    category: "Main Course",
    image: "grilled-fish-plate",
    available: true,
    prepTime: 30,
  },
  {
    id: "m14",
    hotelId: "2",
    name: "Ibirayi (Rwandan Potatoes)",
    description: "Fried or boiled potatoes seasoned with local spices",
    price: 3500,
    category: "Starter",
    image: "club-sandwich-fries",
    available: true,
    prepTime: 15,
  },
  {
    id: "m15",
    hotelId: "2",
    name: "Umuceri n'Ibihaza (Rice & Pumpkin)",
    description: "Steamed rice mixed with sweet pumpkin, a traditional combination",
    price: 6000,
    category: "Main Course",
    image: "chicken-curry-rice",
    available: true,
    prepTime: 25,
  },
  {
    id: "m16",
    hotelId: "2",
    name: "Igikoma (Plantains)",
    description: "Grilled or fried plantains served with beans",
    price: 5500,
    category: "Main Course",
    image: "african-vegetable-stew",
    available: true,
    prepTime: 20,
  },
  {
    id: "m6",
    hotelId: "2",
    name: "Chicken Curry",
    description: "Aromatic chicken curry served with rice or chapati",
    price: 9500,
    category: "Main Course",
    image: "chicken-curry-rice",
    available: true,
    prepTime: 25,
  },
  {
    id: "m7",
    hotelId: "2",
    name: "Garden Salad",
    description: "Fresh mixed greens with homemade dressing",
    price: 5000,
    category: "Starter",
    image: "fresh-garden-salad",
    available: true,
    prepTime: 10,
  },
  {
    id: "m8",
    hotelId: "2",
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake with ganache",
    price: 4000,
    category: "Dessert",
    image: "chocolate-layer-cake",
    available: true,
    prepTime: 5,
  },
  {
    id: "m17",
    hotelId: "2",
    name: "Ibitoke (Banana Fritters)",
    description: "Sweet fried banana fritters with honey drizzle",
    price: 3000,
    category: "Dessert",
    image: "chocolate-layer-cake",
    available: true,
    prepTime: 10,
  },
  {
    id: "m18",
    hotelId: "2",
    name: "Urwagwa (Traditional Banana Beer)",
    description: "Traditional Rwandan banana beer, mildly alcoholic",
    price: 3500,
    category: "Beverage",
    image: "fresh-fruit-juice",
    available: true,
    prepTime: 2,
  },
];

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: "admin_001",
    name: "Admin User",
    email: "admin@hafi.rw",
    phone: "+250 788 000 001",
    role: "customer",
  },
  {
    id: "customer_001",
    name: "Baraka Mugisha",
    email: "baraka@example.com",
    phone: "+250 788 123 456",
    role: "customer",
  },
  {
    id: "customer_002",
    name: "Grace Uwase",
    email: "grace@example.com",
    phone: "+250 788 234 567",
    role: "customer",
  },
];

// Mock Orders
export const MOCK_ORDERS: Order[] = [];

// Mock Buffets
export const MOCK_BUFFETS: Buffet[] = [
  {
    id: "buf1",
    hotelId: "1",
    hotelName: "Kigali Marriott Hotel",
    name: "Executive Breakfast Buffet",
    description: "All-you-can-eat breakfast buffet with international and local options",
    price: 25000,
    image: "luxury-hotel-kigali",
    availableItems: ["m4", "m9", "m10", "m3"], // Juice, Ikivuguto, Sambaza, Sandwich
    category: "Breakfast",
    available: true,
    maxSelections: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "buf2",
    hotelId: "2",
    hotelName: "Heaven Restaurant",
    name: "Traditional Rwandan Feast",
    description: "Experience authentic Rwandan cuisine - choose your favorites from our traditional menu",
    price: 35000,
    image: "restaurant-terrace-garden",
    availableItems: ["m5", "m11", "m12", "m13", "m14", "m15", "m16", "m18"], // All traditional dishes
    category: "Lunch",
    available: true,
    maxSelections: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "buf3",
    hotelId: "2",
    hotelName: "Heaven Restaurant",
    name: "Celebration Dinner Buffet",
    description: "Perfect for special occasions - mix of international and local cuisine",
    price: 45000,
    image: "restaurant-terrace-garden",
    availableItems: ["m5", "m6", "m13", "m15", "m16", "m8", "m17"], // Mix of dishes
    category: "Dinner",
    available: true,
    maxSelections: 6,
    createdAt: new Date().toISOString(),
  },
];

// Mock Buffet Orders
export const MOCK_BUFFET_ORDERS: BuffetOrder[] = [];