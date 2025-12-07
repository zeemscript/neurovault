"use client";

import React, { useEffect, useState, useRef } from "react";
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
import {
  Menu,
  Brain,
  Search,
  Shield,
  Lock,
  Eye,
  Globe,
  FileLock,
  UserCheck,
  AlertTriangle,
  Chrome,
} from "lucide-react";

const links = [
  { name: "Platform", to: "#features" },
  { name: "Use Cases", to: "#use-cases", hasDropdown: true },
  { name: "Partners", to: "#partners" },
  { name: "About Us", to: "#about" },
  { name: "Resources", to: "#resources" },
];

const useCasesData = {
  aiUsageSecurity: {
    title: "AI Usage Security",
    items: [
      {
        title: "AI Discovery",
        description: "Discover and enforce security guardrails on all AI apps",
        icon: Search,
      },
      {
        title: "AI DLP",
        description: "Prevent leakage of sensitive data on AI tools",
        icon: FileLock,
      },
      {
        title: "AI Access Control",
        description: "Restrict user access to unsanctioned AI tools or accounts",
        icon: Lock,
      },
      {
        title: "AI Misuse Prevention",
        description: "Protect against prompt injection, compliance violations, and more",
        icon: Shield,
      },
      {
        title: "AI Browsers",
        description: "Protect AI browsers against attack and exploitation",
        icon: Brain,
      },
    ],
  },
  enterpriseBrowserSecurity: {
    title: "Enterprise Browser Security",
    items: [
      {
        title: "Web/SaaS DLP",
        description: "Threat Prevent data leakage across all web channels",
        icon: FileLock,
      },
      {
        title: "BYOD/Remote Access",
        description: "Secure SaaS remote access by contractors and BYOD",
        icon: UserCheck,
      },
      {
        title: "Identity Protection",
        description: "Discover and secure corporate and personal SaaS identities",
        icon: Shield,
      },
      {
        title: "Safe Browsing",
        description: "Detect and block risky browser extensions on any browser",
        icon: Chrome,
      },
      {
        title: "Shadow SaaS/SaaS Security",
        description: "Discover 'shadow' SaaS and enforce SaaS security controls",
        icon: Eye,
      },
      {
        title: "Protect Against Malicious Browser Extensions",
        description: "Detect and block risky browser extensions on any browser",
        icon: AlertTriangle,
      },
    ],
  },
};

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
          {links.map((link) => {
            if (link.hasDropdown) {
              return <UseCasesDropdown key={link.to} link={link} />;
            }
            return (
              <Link
                key={link.to}
                href={link.to}
                className="px-4 py-2 text-sm font-medium text-blue-500 transition-all duration-200 rounded-lg hover:bg-white/5 relative group"
              >
                {link.name}
              </Link>
            );
          })}
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

function UseCasesDropdown({ link }: { link: typeof links[0] }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 150); // Small delay before closing
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={link.to}
        className="px-4 py-2 text-sm font-medium text-blue-500 transition-all duration-200 rounded-lg hover:bg-white/5 relative group flex items-center gap-1"
      >
        {link.name}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Link>

      {/* Invisible Bridge - prevents gap between button and menu */}
      {isOpen && (
        <div 
          className="fixed top-20 left-0 right-0 h-2 z-40"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Mega Menu */}
      {isOpen && (
        <div 
          className="fixed top-20 left-1/2 -translate-x-1/2 w-[1100px] z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-[85vh] overflow-y-auto">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#47556908_1px,transparent_1px),linear-gradient(to_bottom,#47556908_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            <div className="relative p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* AI Usage Security */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {useCasesData.aiUsageSecurity.title}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {useCasesData.aiUsageSecurity.items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={index}
                          className="group/item p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0 group-hover/item:bg-blue-600/30 transition-colors">
                              <Icon className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white mb-0.5 group-hover/item:text-blue-400 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-gray-400 leading-snug">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enterprise Browser Security */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {useCasesData.enterpriseBrowserSecurity.title}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {useCasesData.enterpriseBrowserSecurity.items.map(
                      (item, index) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={index}
                            className="group/item p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 hover:border-purple-500/50 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0 group-hover/item:bg-purple-600/30 transition-colors">
                                <Icon className="w-4 h-4 text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-white mb-0.5 group-hover/item:text-purple-400 transition-colors">
                                  {item.title}
                                </h4>
                                <p className="text-[11px] text-gray-400 leading-snug">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
