import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Utensils, Target, Users, Heart, Zap, Award, Sparkles, Phone, Mail, MessageCircle, Instagram } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { getCurrentUser } from "../lib/storage";

export default function AboutUs() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const goBack = () => {
    if (user) {
      if (user.role === "customer") {
        navigate("/customer/home");
      } else {
        navigate("/owner/dashboard");
      }
    } else {
      navigate("/");
    }
  };

  const values = [
    {
      icon: Zap,
      title: "Speed & Convenience",
      description: "We save you time by letting you order before you arrive",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our top priority, always",
      color: "from-pink-500 to-red-500",
    },
    {
      icon: Award,
      title: "Quality Service",
      description: "Partnering with Rwanda's best hotels and restaurants",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Supporting local businesses and creating opportunities",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const team = [
    {
      name: "BARAKA Bolingo",
      role: "Founder & CEO",
      description: "The visionary developer behind HaFi Serve Rwanda",
      color: "from-green-600 to-blue-600",
    },
  ];

  const stats = [
    { number: "2026", label: "Founded" },
    { number: "10+", label: "Partner Hotels" },
    { number: "100+", label: "Menu Items" },
    { number: "1000+", label: "Happy Customers" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MapPin className="size-8 text-green-600" />
              <Utensils className="size-5 text-blue-600 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HaFi Serve Rwanda
              </h1>
              <p className="text-xs text-gray-500">Serving near you</p>
            </div>
          </div>
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-full mb-6">
            <Sparkles className="size-4" />
            <span className="text-sm font-medium">About HaFi Serve Rwanda</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Order Before You Arrive.
            <br />
            Enjoy Without Waiting.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing the dining experience in Rwanda by connecting hungry customers 
            with the best hotels and restaurants through our innovative pre-order platform.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <Card className="mb-16 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
            <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <Target className="size-8" />
              Our Story
            </h3>
          </div>
          <CardContent className="p-8">
            <div className="space-y-4 text-gray-700 text-lg">
              <p>
                <strong>HaFi Serve Rwanda</strong> was born from a simple yet powerful idea: 
                <span className="text-green-600 font-semibold"> what if you could order your favorite meal before arriving at a restaurant, 
                and have it ready the moment you walk in?</span>
              </p>
              <p>
                In today's fast-paced world, time is precious. We saw people wasting valuable time 
                waiting for their food, and we knew there had to be a better way. That's when 
                HaFi Serve Rwanda was created - a platform that bridges the gap between customers 
                and hotels, making dining experiences seamless and enjoyable.
              </p>
              <p>
                Our name "HaFi" means <strong>"serving near you"</strong> in Kinyarwanda, reflecting 
                our commitment to connecting you with the best dining options in your area. We're 
                proud to be Rwanda's first hotel pre-order platform, serving both traditional 
                Rwandan cuisine and international dishes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">Our Core Values</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${value.color} text-white mb-4`}>
                      <Icon className="size-8" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Meet the Team */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">Meet the Founder</h3>
          <div className="max-w-2xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`bg-gradient-to-r ${member.color} p-8 text-white text-center`}>
                  <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="size-12" />
                  </div>
                  <h4 className="text-2xl font-bold mb-1">{member.name}</h4>
                  <p className="text-white/90">{member.role}</p>
                </div>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-700 text-lg">{member.description}</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 italic">
                      "Together strong 💪 - Let's revolutionize dining in Rwanda!"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-green-700">🎯 Our Mission</h3>
              <p className="text-gray-700 text-lg">
                To make dining experiences seamless and enjoyable by connecting customers with 
                Rwanda's best hotels and restaurants through our innovative pre-order platform.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-blue-700">🚀 Our Vision</h3>
              <p className="text-gray-700 text-lg">
                To become Rwanda's leading food service platform, expanding to hotel bookings 
                and creating the ultimate hospitality experience across East Africa.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">Get in Touch</h3>
            <p className="text-xl mb-6 text-white/90">
              Have questions or want to partner with us? We'd love to hear from you!
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a
                href="tel:+250795410739"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Phone className="size-4" />
                <span>+250 795 410 739</span>
              </a>
              <a
                href="mailto:hafiserverwanda.official@gmail.com"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Mail className="size-4" />
                <span>Email Us</span>
              </a>
              <a
                href="https://wa.me/250795127587"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="size-4" />
                <span>WhatsApp</span>
              </a>
              <a
                href="https://instagram.com/hafiserverwanda.official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Instagram className="size-4" />
                <span>Instagram</span>
              </a>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/contact")}
              className="bg-white text-green-600 hover:bg-gray-100 border-0"
            >
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2026 HaFi Serve Rwanda. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Order Before You Arrive. Enjoy Without Waiting.
          </p>
        </div>
      </footer>
    </div>
  );
}
