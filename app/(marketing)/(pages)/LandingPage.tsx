"use client";

import React from "react";
import Button from "@/components/ui/button";
import ScatteredIcons from "@/constants/icons";
import { HugeiconsIcon } from "@hugeicons/react";

const LandingPage = () => {
  // Scattered icons positioned around the card (outside of it) - using viewport-based positioning


  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#47556908_1px,transparent_1px),linear-gradient(to_bottom,#47556908_1px,transparent_1px)] bg-size-[64px_64px]"></div>
      </div>

      {/* Scattered Icons Background - positioned around the card */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {ScatteredIcons.map((item, index) => {
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
          
          const iconData = item.icon;
          if (!iconData) return null;
          return (
            <div
              key={index}
              className={`absolute ${item.position} ${item.size}`}
              style={{
                transform: `rotate(${item.rotation}deg)`,
              }}
            >
              <HugeiconsIcon icon={iconData} className={`w-full h-full ${item.color || "text-blue-400/40"}`} />
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

