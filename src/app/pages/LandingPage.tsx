import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { MapPin, Utensils, Clock, Shield, Star, TrendingUp, ChevronRight, Sparkles, Phone, Mail, MessageCircle, Instagram } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { getCurrentUser } from "../lib/storage";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      if (currentUser.role === "customer") {
        navigate("/customer/home");
      } else {
        navigate("/owner/dashboard");
      }
    }
  }, [navigate]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: Clock,
      title: "Pre-Order & Save Time",
      description: "Order before you arrive. Your meal is ready when you get there.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: MapPin,
      title: "Discover Nearby Hotels",
      description: "Find the best hotels and restaurants near you with GPS.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Star,
      title: "Top-Rated Places",
      description: "Browse menus from Rwanda's most popular hotels and restaurants.",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Shield,
      title: "Track Your Order",
      description: "Real-time updates from preparation to ready for pickup.",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const stats = [
    { number: "10+", label: "Partner Hotels" },
    { number: "100+", label: "Menu Items" },
    { number: "1000+", label: "Happy Customers" },
    { number: "5★", label: "Average Rating" },
  ];

  const news = [
    {
      title: "Welcome to HaFi Serve Rwanda! 🎉",
      date: "April 4, 2026",
      description: "We're excited to launch Rwanda's first hotel pre-order platform. Order before you arrive and enjoy without waiting!",
      badge: "Launch",
    },
    {
      title: "10+ Partner Hotels Now Available",
      date: "April 1, 2026",
      description: "From Kigali Marriott to Heaven Restaurant, discover the best dining experiences across Kigali.",
      badge: "Update",
    },
    {
      title: "Coming Soon: Room Booking Feature 🏨",
      date: "March 28, 2026",
      description: "Soon you'll be able to book hotel rooms directly through HaFi Serve. Stay tuned!",
      badge: "Coming Soon",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - Fixed */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MapPin className="size-8 text-green-600" />
              <Utensils className="size-5 text-blue-600 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                HaFi Serve Rwanda
              </h1>
              <p className="text-xs text-gray-600">Serving near you</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection(featuresRef)}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection(newsRef)}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              News
            </button>
            <Button
              onClick={() => navigate("/contact")}
              variant="ghost"
            >
              Contact Us
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden gap-2">
            <Button
              onClick={() => navigate("/auth")}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Screen */}
      <div className="pt-20 min-h-screen flex items-center bg-gradient-to-br from-green-50 via-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 shadow-lg">
                <Sparkles className="size-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Rwanda's #1 Hotel Pre-Order Platform
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Order Before You Arrive.
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Enjoy Without Waiting.
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-600">
                  Discover nearby hotels, explore their menus, and place your order in advance. 
                  Save time and enjoy your meal the moment you arrive.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 size-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection(featuresRef)}
                  className="text-lg px-8 py-6 border-2"
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 md:gap-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1753351057455-b13182da4d03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMGRpbmluZyUyMHJlc3RhdXJhbnQlMjBlbmpveWluZyUyMG1lYWx8ZW58MXx8fHwxNzc1MzM4Mzc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Happy people enjoying their meal"
                  className="w-full h-[600px] object-cover"
                />
                {/* Floating Badge */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="size-5 text-yellow-500 fill-yellow-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-900">5.0 Rating</div>
                      <div className="text-xs text-gray-600">1000+ Reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose HaFi Serve?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for a seamless dining experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className="size-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-600">Simple, fast, and easy</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Browse Hotels Near You",
                  description: "Discover popular hotels and restaurants in your area",
                  color: "from-green-500 to-emerald-600",
                },
                {
                  step: "2",
                  title: "Explore Menus & Order",
                  description: "Choose your favorite dishes and customize your order",
                  color: "from-blue-500 to-cyan-600",
                },
                {
                  step: "3",
                  title: "Track & Pick Up",
                  description: "Get real-time updates and pick up when ready",
                  color: "from-purple-500 to-pink-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex gap-6 items-start bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-3xl font-bold text-white">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-lg">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div ref={newsRef} className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest News
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news and features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {news.map((item, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.badge === "Launch" ? "from-green-500 to-emerald-600" : item.badge === "Update" ? "from-blue-500 to-cyan-600" : "from-purple-500 to-pink-600"} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <div className="text-sm font-bold text-white">{item.badge}</div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm mb-2">{item.date}</p>
                <p className="text-gray-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Skip the Wait?
            </h3>
            <p className="text-xl text-white/90">
              Join thousands of satisfied customers enjoying hassle-free dining
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 bg-white text-green-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Start Ordering Now
                <ChevronRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <MapPin className="size-8 text-green-500" />
                  <Utensils className="size-5 text-blue-500 absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">HaFi Serve Rwanda</h1>
                  <p className="text-xs text-gray-400">Serving near you</p>
                </div>
              </div>
              <p className="text-gray-400">
                Making dining experiences better, one order at a time.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection(featuresRef)}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection(newsRef)}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  News
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Phone className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <a href="tel:+250795410739" className="text-gray-400 hover:text-white transition-colors block">
                      +250 795 410 739
                    </a>
                    <a href="tel:+250726362947" className="text-gray-400 hover:text-white transition-colors block">
                      +250 726 362 947
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <a 
                    href="mailto:hafiserverwanda.official@gmail.com"
                    className="text-sm text-gray-400 hover:text-white transition-colors break-all"
                  >
                    hafiserverwanda.official@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
              <div className="space-y-3">
                <a 
                  href="https://wa.me/250795127587"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="size-5 text-green-500" />
                  <span className="text-sm">WhatsApp: +250 795 127 587</span>
                </a>
                <a 
                  href="https://instagram.com/hafiserverwanda.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="size-5 text-pink-500" />
                  <span className="text-sm">@hafiserverwanda.official</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2026 HaFi Serve Rwanda. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}