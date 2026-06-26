import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🔄 Initializing HaFi Serve Rwanda...");
        console.log("✅ App initialized successfully!");
        setIsInitialized(true);
      } catch (err) {
        console.error("❌ Initialization error:", err);
        setIsInitialized(true);
      }
    };

    init();
  }, []);


  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">
            Loading HaFi Serve Rwanda...
          </h2>
          <p className="text-gray-600 mt-2">
            Serving near you 🇷🇼
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <Analytics />
    </>
  );
}