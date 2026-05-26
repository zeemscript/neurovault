"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon, EyeIcon, LockIcon, PlusSignIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Button from "@/components/ui/button";

const HeroPage = () => {
  const features = [
    {
      icon: Shield01Icon,
      text: "AI & SaaS Content Security",
    },
    {
      icon: EyeIcon,
      text: "Shadow AI & Unauthorized App Detection",
    },
    {
      icon: LockIcon,
      text: "Browser Extension Risk Control",
    },
    {
      icon: PlusSignIcon,
      text: "Plus a wide range of additional safeguards",
    },
  ];

  return (
    <section className="w-full bg-slate-50 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left content */}
          <div className="flex flex-col gap-6 lg:gap-8 flex-1">
            <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                How it works
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Your Unified AI & Browser
              <span className="text-blue-600"> Defense System</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
              Our code-free security layer connects seamlessly with any browser
              to protect every user action across AI tools, SaaS platforms, and
              web applications.
            </p>
            <ul className="flex flex-col gap-4 mt-2">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-base"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <HugeiconsIcon icon={feature.icon} className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/request-a-demo">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-2"
                >
                  Request a Demo
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          {/* Right image */}
          <div className="flex-1 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100">
              <Image
                src="/nv.png"
                width={500}
                height={450}
                alt="NeuroVault Security Platform"
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroPage;
