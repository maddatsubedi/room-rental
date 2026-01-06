import Link from "next/link";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";

const footerLinks = {
  company: [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Help Center", href: "/help" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300">
      {/* Newsletter Section */}
      <div className="border-b border-stone-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-2xl md:text-3xl font-serif text-white mb-3">
                Stay in the loop
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Get notified about new rooms, affordable deals, and housing tips.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full pl-12 pr-4 py-4 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-stone-700 transition-colors"
                />
              </div>
              <button className="px-8 py-4 bg-white text-stone-900 font-medium rounded-xl hover:bg-stone-100 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                <span className="text-stone-900 font-serif text-xl font-semibold">R</span>
              </div>
              <span className="font-serif text-xl text-white">RentSpace</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-sm">
              Find your perfect home in Nepal. We connect students and working professionals 
              with verified rooms and trusted landlords across the country.
            </p>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-5 w-5 text-stone-500 shrink-0 mt-0.5" />
              <span className="text-stone-400">Kathmandu, Nepal 44600</span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-medium mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white font-medium mb-5">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-medium mb-5">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
            <p>&copy; {new Date().getFullYear()} RentSpace. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
