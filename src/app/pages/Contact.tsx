import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Phone, MapPin, Globe, MessageCircle, Instagram } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[600px] bg-gradient-to-br from-[#1e7ba0] to-[#4fb3d4] rounded-xl shadow-2xl p-12 md:p-16 text-white">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Contact HaFi Serve Rwanda</h1>
          <p className="text-xl md:text-2xl text-white/90">We'd Love to Hear From You</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-5 mb-10">
          <div className="flex items-start gap-4">
            <Mail className="size-6 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg mb-1">Email</p>
              <a 
                href="mailto:hafiserverwanda.official@gmail.com"
                className="text-white/90 hover:underline text-lg break-all"
              >
                hafiserverwanda.official@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="size-6 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg mb-1">Phone Numbers</p>
              <a 
                href="tel:+250795410739"
                className="text-white/90 hover:underline text-lg block"
              >
                +250 795 410 739
              </a>
              <a 
                href="tel:+250726362947"
                className="text-white/90 hover:underline text-lg block"
              >
                +250 726 362 947
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MessageCircle className="size-6 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg mb-1">WhatsApp</p>
              <a 
                href="https://wa.me/250795127587"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:underline text-lg"
              >
                +250 795 127 587
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Instagram className="size-6 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg mb-1">Instagram</p>
              <a 
                href="https://instagram.com/hafiserverwanda.official"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:underline text-lg"
              >
                @hafiserverwanda.official
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="size-6 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg mb-1">Address</p>
              <p className="text-white/90 text-lg">
                KG 7 Ave, Kigali, Rwanda
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 pt-6 text-center space-y-2">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-3"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Website
          </Button>
          <p className="text-sm text-white/70">
            © 2026 HaFi Serve Rwanda. All rights reserved.
          </p>
          <p className="text-xs text-white/60">
            Order Before You Arrive. Enjoy Without Waiting.
          </p>
        </div>
      </div>
    </div>
  );
}