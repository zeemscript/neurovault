"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuthNavButtons from "./AuthNavButtons";
import Button from "./ui/button";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AlignJustify, Menu } from "lucide-react";

const links = [
  { name: "Platform", to: "#features" },
  { name: "Use Cases", to: "#use-cases" },
  { name: "Partners", to: "#partners" },
  { name: "About Us", to: "#about" },
  { name: "Resources", to: "#resources" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 hidden lg:flex justify-between items-center h-20 px-6 lg:px-8 xl:px-12 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-xl group-hover:bg-blue-600/30 transition-colors rounded-lg"></div>
            <span className="relative text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          NeuroVault
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1">
          {links.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className="px-4 py-2 text-sm font-medium text-blue-500 transition-all duration-200 rounded-lg hover:bg-white/5 relative group"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center">
          <AuthNavButtons />
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 lg:hidden flex items-center justify-between h-16 px-4 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            NeuroVault
          </span>
        </Link>
        <MobileNav />
      </nav>
    </>
  );
};

export default Navbar;

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-300 hover:text-white hover:bg-white/10"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800"
      >
        <SheetHeader className="mb-8 text-left">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            NeuroVault
          </Link>
        </SheetHeader>
        <nav className="flex flex-col space-y-2">
          {links.map((link) => (
            <SheetClose asChild key={link.to}>
              <Link
                href={link.to}
                className="px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {link.name}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-slate-800">
          <AuthNavButtons />
        </div>
      </SheetContent>
    </Sheet>
  );
}
