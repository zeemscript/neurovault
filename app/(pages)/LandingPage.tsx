"use client";

import React from "react";
import Button from "@/components/ui/button";
import {
  Puzzle,
  Monitor,
  Cookie,
  Compass,
  User,
  Chrome,
  Play,
  Linkedin,
  Settings,
  Network,
  Globe,
  MessageSquare,
  FileText,
  UserPlus,
  Search,
  X,
  Sparkles,
} from "lucide-react";

const LandingPage = () => {
  // Scattered icons positioned around the card (outside of it) - using viewport-based positioning
  const scatteredIcons = [
    // Icons positioned to the left of the card area
    { type: "icon", icon: Puzzle, size: "w-8 h-8", position: "top-[10%] left-[5%]", rotation: -5, color: "text-blue-400/40" },
    { type: "icon", icon: Monitor, size: "w-10 h-10", position: "top-[20%] left-[3%]", rotation: 8, color: "text-blue-400/30" },
    { type: "icon", icon: Cookie, size: "w-7 h-7", position: "top-[35%] left-[2%]", rotation: -12, color: "text-blue-400/35" },
    { type: "icon", icon: Compass, size: "w-9 h-9", position: "top-[50%] left-[4%]", rotation: 15, color: "text-blue-400/40" },
    { type: "icon", icon: User, size: "w-8 h-8", position: "top-[65%] left-[3%]", rotation: -8, color: "text-blue-400/30" },
    { type: "icon", icon: Chrome, size: "w-9 h-9", position: "top-[80%] left-[5%]", rotation: 10, color: "text-blue-400/35" },
    
    // Icons positioned to the right of the card area
    { type: "icon", icon: Play, size: "w-8 h-8", position: "top-[15%] right-[5%]", rotation: -15, color: "text-blue-400/40" },
    { type: "icon", icon: Linkedin, size: "w-7 h-7", position: "top-[30%] right-[3%]", rotation: 7, color: "text-blue-400/30" },
    { type: "icon", icon: Puzzle, size: "w-6 h-6", position: "top-[45%] right-[4%]", rotation: 12, color: "text-blue-400/35" },
    { type: "icon", icon: Monitor, size: "w-8 h-8", position: "top-[60%] right-[3%]", rotation: -7, color: "text-blue-400/40" },
    { type: "icon", icon: Cookie, size: "w-7 h-7", position: "top-[75%] right-[5%]", rotation: 9, color: "text-blue-400/30" },
    { type: "password", size: "w-16 h-6", position: "top-[25%] right-[2%]", rotation: 3, color: "text-blue-400/40" },
    
    // Icons above the card area
    { type: "icon", icon: Compass, size: "w-9 h-9", position: "top-[2%] left-[25%]", rotation: 15, color: "text-blue-400/35" },
    { type: "icon", icon: User, size: "w-8 h-8", position: "top-[1%] left-[45%]", rotation: -8, color: "text-blue-400/30" },
    { type: "icon", icon: Globe, size: "w-7 h-7", position: "top-[3%] left-[65%]", rotation: -9, color: "text-blue-400/40", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: MessageSquare, size: "w-6 h-6", position: "top-[2%] right-[25%]", rotation: 11, color: "text-blue-400/35", boxColor: "bg-blue-600/10" },
    
    // Icons below the card area
    { type: "icon", icon: FileText, size: "w-7 h-7", position: "bottom-[5%] left-[20%]", rotation: -7, color: "text-blue-400/40", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: UserPlus, size: "w-6 h-6", position: "bottom-[8%] left-[40%]", rotation: 13, color: "text-blue-400/30", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: Search, size: "w-7 h-7", position: "bottom-[6%] left-[60%]", rotation: -10, color: "text-blue-400/35", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: Settings, size: "w-6 h-6", position: "bottom-[4%] right-[30%]", rotation: 5, color: "text-blue-400/40", boxColor: "bg-blue-600/10" },
    { type: "icon", icon: Network, size: "w-7 h-7", position: "bottom-[7%] right-[15%]", rotation: -8, color: "text-blue-400/30", boxColor: "bg-blue-600/10" },
    
    // Blue rounded square icons scattered around
    { type: "icon", icon: Settings, size: "w-6 h-6", position: "top-[12%] left-[15%]", boxColor: "bg-blue-600/20", rotation: 5, color: "text-blue-400/60" },
    { type: "icon", icon: Network, size: "w-7 h-7", position: "top-[28%] right-[12%]", boxColor: "bg-blue-600/20", rotation: -8, color: "text-blue-400/60" },
    { type: "icon", icon: X, size: "w-6 h-6", position: "top-[40%] left-[12%]", boxColor: "bg-blue-600/20", rotation: 12, color: "text-blue-400/60" },
    { type: "letter", letter: "D", size: "w-6 h-6", position: "top-[55%] right-[10%]", boxColor: "bg-blue-600/20", rotation: -6, color: "text-blue-400/60" },
    { type: "letter", letter: "C", size: "w-6 h-6", position: "bottom-[12%] left-[15%]", boxColor: "bg-blue-600/20", rotation: -4, color: "text-blue-400/60" },
    { type: "letter", letter: "Q", size: "w-7 h-7", position: "bottom-[10%] right-[20%]", boxColor: "bg-blue-600/20", rotation: 8, color: "text-blue-400/60" },
    { type: "letter", letter: "M", size: "w-8 h-8", position: "top-[38%] right-[8%]", rotation: -10, color: "text-blue-400/40" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#47556908_1px,transparent_1px),linear-gradient(to_bottom,#47556908_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      {/* Scattered Icons Background - positioned around the card */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {scatteredIcons.map((item, index) => {
          if (item.type === "password") {
            return (
              <div
                key={index}
                className={`absolute ${item.position} ${item.size}`}
                style={{
                  transform: `rotate(${item.rotation}deg)`,
                }}
              >
                <div className={`font-mono text-sm font-bold ${item.color || "text-blue-400/40"}`}>****</div>
              </div>
            );
          }
          
          if (item.type === "letter") {
            return (
              <div
                key={index}
                className={`absolute ${item.position} ${item.size} ${
                  item.boxColor ? `p-2 rounded-lg ${item.boxColor} flex items-center justify-center border border-blue-500/20` : ""
                }`}
                style={{
                  transform: `rotate(${item.rotation}deg)`,
                }}
              >
                <span className={`font-bold text-lg ${item.color || "text-blue-400/40"}`}>{item.letter}</span>
              </div>
            );
          }
          
          const Icon = item.icon;
          if (!Icon) return null;
          return (
            <div
              key={index}
              className={`absolute ${item.position} ${item.size} ${
                item.boxColor ? `p-2 rounded-lg ${item.boxColor} flex items-center justify-center border border-blue-500/20` : ""
              }`}
              style={{
                transform: `rotate(${item.rotation}deg)`,
              }}
            >
              <Icon className={`w-full h-full ${item.color || "text-blue-400/40"}`} />
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8 sm:mt-10">
        <div className="relative w-full max-w-4xl">
          {/* Central Dark Card with Futuristic Design */}
          <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 p-8 sm:p-12 lg:p-16 relative overflow-hidden backdrop-blur-sm">
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 via-transparent to-blue-500/5"></div>
            
            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            
            {/* Blue Triangular Accent */}
            <div 
              className="absolute top-0 left-0 bg-blue-600"
              style={{
                width: '80px',
                height: '80px',
                clipPath: 'polygon(0 0, 100% 0, 0 100%)',
              }}
            >
            </div>

            {/* Content */}
            <div className="relative z-10 mt-8">
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                The All-in-One AI & Browser Security Platform
              </h1>

              {/* Body Text */}
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                With NeuroVault, any organization can protect its identities, SaaS apps, data and devices from web-borne threats and browsing risks, while maintaining a top-notch user experience.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-blue-600  text-white px-8 py-6 rounded-2xl"
                >
                  Request a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

