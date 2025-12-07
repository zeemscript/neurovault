import React from "react";
import Image from "next/image";
import { Shield, Eye, Lock, Plus, Play } from "lucide-react";
import Button from "@/components/ui/button";

const HeroPage = () => {
  const features = [
    {
      icon: Shield,
      text: "AI & SaaS Content Security",
    },
    {
      icon: Eye,
      text: "Shadow AI & Unauthorized App Detection",
    },
    {
      icon: Lock,
      text: "Browser Extension Risk Control",
    },
    {
      icon: Plus,
      text: "Plus a wide range of additional safeguards",
    },
  ];

  return (
    <div className="flex items-center justify-center pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white w-full max-w-7xl rounded-2xl flex flex-col justify-center gap-8 p-8 sm:p-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex flex-col gap-6 lg:gap-8 justify-center flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Your Unified AI & Browser <br />
              Defense System
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
              Our code-free security layer connects seamlessly with any browser
              to protect every user action across AI tools, SaaS platforms, and
              web applications. Gain unmatched insight and control over
              AI-related activity and browsing-based risks, all in one place.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              <ul className="flex flex-col gap-3 sm:gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-base sm:text-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 flex items-center justify-center">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <span className="text-gray-200">{feature.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold rounded-lg transition-all duration-200"
              >
                Request a Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-500 bg-none text-blue-500 px-8 py-6 text-base  font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <Image
                src="/nv.png"
                width={500}
                height={450}
                alt="NeuroVault Security Platform"
                className="w-full h-auto object-contain rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroPage;
