"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Shield01Icon, ZapIcon, HeadphonesIcon } from "@hugeicons/core-free-icons";
import Button from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="w-full py-20 sm:py-24 lg:py-28 bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 mb-8">
          <HugeiconsIcon icon={Shield01Icon} className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Start protecting your organization
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Secure your AI workflows and
          <br className="hidden sm:block" />
          browser activity today
        </h2>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join 500+ enterprises that trust NeuroVault. Deploy in minutes,
          see results immediately. No code changes, no complexity.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/request-a-demo">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-semibold inline-flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25">
              Request a Demo
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#contact">
            <Button className="bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 hover:text-white border border-slate-700/50 hover:border-slate-600 px-8 py-6 text-base font-semibold inline-flex items-center gap-2 transition-all duration-200">
              <HugeiconsIcon icon={HeadphonesIcon} className="w-4 h-4" />
              Talk to Sales
            </Button>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ZapIcon} className="w-4 h-4 text-blue-400/60" />
            <span>15-min setup</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Shield01Icon} className="w-4 h-4 text-blue-400/60" />
            <span>SOC 2 compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>99.9% uptime SLA</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
