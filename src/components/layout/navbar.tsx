"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { getInitials } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/rooms" },
];

// Pages that have dark hero sections and support transparent navbar
const pagesWithHero = ["/", "/rooms", "/auth/login", "/auth/register"];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  // Check if current page has a hero section that supports transparent navbar
  const hasHero = pagesWithHero.some((page) => pathname === page);
  // For colors: solid on pages without hero, or when scrolled
  const showSolid = !hasHero || scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!session?.user) return "/dashboard";
    switch (session.user.role) {
      case "ADMIN":
        return "/admin";
      case "LANDLORD":
        return "/landlord";
      default:
        return "/dashboard";
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        showSolid
          ? "bg-white shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${
          scrolled ? "h-16" : "h-24"
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className={`font-serif text-2xl tracking-tight transition-all duration-500 ${
              showSolid ? "text-stone-900" : "text-white"
            }`}>
              Rent<span className="font-normal italic">Space</span>
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center">
            <div className={`flex items-center rounded-full px-1 py-1 transition-all duration-500 ${
              showSolid ? "bg-stone-100" : "bg-white/10 backdrop-blur-sm"
            }`}>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                      showSolid
                        ? isActive
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-600 hover:text-stone-900"
                        : isActive
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-stone-200/50" />
            ) : session?.user ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardLink()} className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 rounded-full font-medium transition-all duration-300 ${
                      showSolid
                        ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-2 rounded-full p-0.5 pr-2.5 transition-all focus:outline-none ${
                      showSolid ? "hover:bg-stone-100" : "hover:bg-white/10"
                    }`}>
                      <Avatar className="h-8 w-8 border-2 border-stone-200/50">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback className="bg-stone-800 text-white text-xs font-medium">
                          {getInitials(session.user.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className={`h-3.5 w-3.5 transition-colors ${
                        showSolid ? "text-stone-400" : "text-white/60"
                      }`} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 mt-2 rounded-xl border-stone-200 shadow-xl"
                    align="end"
                  >
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-900">{session.user.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{session.user.email}</p>
                    </div>
                    <div className="py-2">
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardLink()} className="cursor-pointer gap-3 py-2.5">
                          <LayoutDashboard className="h-4 w-4 text-stone-500" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile" className="cursor-pointer gap-3 py-2.5">
                          <User className="h-4 w-4 text-stone-500" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full font-medium transition-all duration-300 ${
                      showSolid
                        ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className={`rounded-full font-medium px-5 transition-all duration-300 ${
                      showSolid
                        ? "bg-stone-900 hover:bg-stone-800 text-white"
                        : "bg-white text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={showSolid ? "text-stone-900" : "text-white"}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-l-stone-200">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-8 mt-4">
                    <div className="h-10 w-10 rounded-xl bg-stone-900 flex items-center justify-center">
                      <span className="text-white font-serif text-xl font-semibold">R</span>
                    </div>
                    <span className="font-serif text-xl text-stone-900">RentSpace</span>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-stone-100 text-stone-900"
                              : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                    {session?.user && (
                      <Link
                        href={getDashboardLink()}
                        className="px-4 py-3 text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors"
                      >
                        Dashboard
                      </Link>
                    )}
                  </nav>
                  <div className="mt-auto pb-8">
                    {!session?.user && (
                      <div className="flex flex-col gap-3">
                        <Link href="/auth/login">
                          <Button variant="outline" className="w-full">
                            Sign in
                          </Button>
                        </Link>
                        <Link href="/auth/register">
                          <Button className="w-full bg-stone-900 hover:bg-stone-800">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

