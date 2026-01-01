import Link from "next/link";
import { Building2, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Heart, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Newsletter Section - Modern Card Style */}
      <div className="bg-white border-t border-gray-100">
        <div className="container py-16 md:py-20">
          <div className="relative bg-linear-to-br from-violet-600 via-indigo-600 to-violet-700 rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm mb-4">
                  <Sparkles className="h-4 w-4" />
                  Join 10,000+ subscribers
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                  Get Exclusive Deals
                </h3>
                <p className="text-white/80 text-base md:text-lg">
                  Be the first to know about new listings, special offers, and insider tips.
                </p>
              </div>
              
              <div className="w-full lg:w-auto">
                <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full sm:w-72 pl-12 pr-4 py-4 rounded-xl bg-white/10 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-colors text-base"
                    />
                  </div>
                  <Button className="px-8 py-4 h-auto bg-white text-violet-600 hover:bg-gray-50 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all">
                    Subscribe
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <p className="text-white/60 text-sm mt-3 text-center lg:text-left">
                  No spam, unsubscribe anytime. Read our <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-slate-900 text-gray-300">
        <div className="container py-16 md:py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-2xl text-white">RentSpace</span>
              </Link>
              <p className="text-gray-400 leading-relaxed">
                Find your perfect room with RentSpace. We connect renters with verified properties and trusted hosts worldwide.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Linkedin, href: "#" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-violet-500/20 hover:text-violet-400 transition-all"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white text-lg mb-6">Quick Links</h3>
              <ul className="space-y-4">
                {[
                  { name: "Browse Rooms", href: "/rooms" },
                  { name: "List Your Property", href: "/auth/register?role=LANDLORD" },
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-violet-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white text-lg mb-6">Support</h3>
              <ul className="space-y-4">
                {[
                  { name: "Help Center", href: "/help" },
                  { name: "FAQs", href: "/faq" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-violet-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white text-lg mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="text-gray-400">123 Main Street, New York, NY 10001</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 shrink-0 mt-0.5">
                    <Phone className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="text-gray-400">support@rentspace.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5">
          <div className="container py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} RentSpace. All rights reserved.</p>
              <p className="flex items-center gap-1">
                Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for better stays
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

