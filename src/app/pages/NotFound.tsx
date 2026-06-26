import { Link } from "react-router";
import { Home, MapPin, Utensils } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg mb-4">
          <div className="relative">
            <MapPin className="size-10 text-green-600" />
            <Utensils className="size-6 text-blue-600 absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              HaFi Serve Rwanda
            </h1>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-6xl font-bold text-gray-900">404</h2>
          <h3 className="text-2xl font-semibold text-gray-700">Page Not Found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <Link to="/">
          <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
            <Home className="size-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
