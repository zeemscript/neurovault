"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  Configuration01Icon,
  Shield01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const steps = [
  {
    number: "01",
    icon: Download01Icon,
    title: "Deploy in Minutes",
    description:
      "Install the NeuroVault browser extension or connect via your identity provider. No code changes, no infrastructure modifications — just deploy and go.",
  },
  {
    number: "02",
    icon: Configuration01Icon,
    title: "Set Your Policies",
    description:
      "Define security rules for AI usage, SaaS access, browser extensions, and data handling. Use our pre-built templates or create custom policies for your org.",
  },
  {
    number: "03",
    icon: Shield01Icon,
    title: "Protected in Real-Time",
    description:
      "Every user action is monitored and secured. Threats are detected and blocked instantly while your team gets full visibility through a unified dashboard.",
  },
];

const HowItWorks = () => {
  return (
    <section className="w-full py-20 sm:py-24 lg:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Three steps to total protection
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Go from zero to fully secured in under 15 minutes.
            No engineering resources required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-0">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center lg:px-8">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-blue-500/40 to-blue-500/10" />
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="absolute -right-2 -top-2 w-4 h-4 text-blue-500/40"
                  />
                </div>
              )}

              {/* Step number + icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
                  <HugeiconsIcon icon={step.icon} className="w-10 h-10 text-blue-400" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
