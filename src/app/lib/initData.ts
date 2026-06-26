// Initialize mock data if not exists

import { MOCK_HOTELS, MOCK_MENU_ITEMS, MOCK_BUFFETS } from "./mockData";
import { getAllHotels, getAllMenuItems, getAllBuffets, initializeData } from "./api";

export const initializeMockData = async () => {
  try {
    // Check if data already exists
    const hotels = await getAllHotels();
    const menuItems = await getAllMenuItems();
    const buffets = await getAllBuffets();

    // Initialize if all are empty
    if (hotels.length === 0 && menuItems.length === 0 && buffets.length === 0) {
      await initializeData({
        hotels: MOCK_HOTELS,
        menuItems: MOCK_MENU_ITEMS,
        buffets: MOCK_BUFFETS,
      });
    }
  } catch (error) {
    console.error("Failed to initialize mock data:", error);
    console.warn("Please ensure the Supabase Edge Function is deployed");
  }
};