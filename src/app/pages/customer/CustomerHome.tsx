import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Star, MapPin, Phone, Mail, ChevronRight, Search } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getAllHotels } from "../../lib/api";
import { initializeMockData } from "../../lib/initData";
import { Hotel } from "../../lib/mockData";
import { getImageUrl } from "../../lib/imageMap";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export default function CustomerHome() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");

  useEffect(() => {
    const init = async () => {
      await initializeMockData();
      await loadHotels();
    };
    init();
  }, []);

  const loadHotels = async () => {
    const allHotels = await getAllHotels();
    setHotels(allHotels);
  };

  const filteredHotels = hotels
    .filter((hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl md:text-4xl mb-2">Discover Hotels Near You</h1>
          <p className="text-lg opacity-90">Order before you arrive. Enjoy without waiting.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              placeholder="Search hotels, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: "rating" | "name") => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hotels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <Link key={hotel.id} to={`/customer/hotel/${hotel.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full group">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(hotel.image)}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{hotel.rating}</span>
                    <span className="text-xs text-gray-500">({hotel.totalReviews})</span>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-green-600 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span className="line-clamp-1">{hotel.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="size-4 text-blue-600 flex-shrink-0" />
                      <span>{hotel.contact.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hotel.services.slice(0, 3).map((service, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {hotel.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{hotel.services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    View Menu <ChevronRight className="size-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {hotels.length === 0 && !searchQuery
                ? "No hotels available. Please deploy the Supabase Edge Function from Make settings."
                : "No hotels found matching your search."}
            </p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}