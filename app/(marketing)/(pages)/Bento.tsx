"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  EyeIcon,
  LockIcon,
  ActivityIcon,
  ZapIcon,
  BarChartIcon,
  CheckmarkCircle02Icon,
  HierarchyCircle02Icon,
  FileSearchIcon,
  DashboardSpeed01Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import { useInView } from "@/hooks/use-in-view";

const Bento = () => {
  const { ref: featuresRef, hasBeenInView: featuresInView } = useInView({
    threshold: 0.2,
  });

  const features = [
    {
      icon: Shield01Icon,
      title: "AI & SaaS Content Security",
      description:
        "Protect sensitive data across AI tools and SaaS platforms with real-time content monitoring and policy enforcement.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-white",
      size: "lg",
    },
    {
      icon: EyeIcon,
      title: "Shadow AI Detection",
      description:
        "Automatically discover and monitor unauthorized AI applications being used across your organization.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-blue-600",
      size: "md",
    },
    {
      icon: LockIcon,
      title: "Browser Extension Risk Control",
      description:
        "Manage browser extensions with granular controls, risk assessment, and automated policy enforcement.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-blue-600",
      size: "md",
    },
    {
      icon: ActivityIcon,
      title: "Real-Time Activity Monitoring",
      description:
        "Live visibility into all user actions, security events, and potential threats across your entire network.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-white",
      size: "lg",
    },
    {
      icon: HierarchyCircle02Icon,
      title: "Unified Defense System",
      description:
        "Single platform that connects seamlessly with any browser to protect every user action in one place.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-blue-600",
      size: "md",
    },
    {
      icon: FileSearchIcon,
      title: "Code-Free Integration",
      description:
        "Deploy instantly without code changes. Our security layer connects seamlessly with existing infrastructure.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-blue-600",
      size: "md",
    },
    {
      icon: BarChartIcon,
      title: "Security Analytics & Insights",
      description:
        "Comprehensive dashboards and reports providing unmatched insight into AI-related activity and browsing risks.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-blue-600",
      size: "md",
    },
    {
      icon: ZapIcon,
      title: "Instant Threat Response",
      description:
        "Automated threat detection and immediate alerts with configurable response actions to protect your organization.",
      accent: "bg-blue-600",
      accentLight: "bg-blue-50",
      iconColor: "text-blue-600",
      size: "md",
    },
    {
      icon: null,
      title: "",
      description: "",
      accent: "",
      accentLight: "",
      iconColor: "",
      size: "accelerator",
    },
  ];

  return (
    <section
      id="features"
      className="w-full py-20 sm:py-24 lg:py-28 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Security Features
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Protect your organization with a unified defense system that monitors
            and secures every user action across AI tools, SaaS platforms, and
            web applications.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {features.map((feature, index) => {
            // Accelerator card
            if (feature.size === "accelerator") {
              return (
                <div
                  key={index}
                  className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-slate-900 p-6 sm:p-8 flex flex-col items-center justify-center text-center"
                  style={{
                    opacity: featuresInView ? 1 : 0,
                    transform: featuresInView
                      ? "translateY(0)"
                      : "translateY(20px)",
                    transition: `opacity 0.6s ease-out ${index * 0.08}s, transform 0.6s ease-out ${index * 0.08}s`,
                  }}
                >
                  {/* Animated rings */}
                  <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-2 rounded-full border-2 border-blue-500/15 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
                    <div className="absolute inset-4 rounded-full border-2 border-blue-500/20 animate-ping" style={{ animationDuration: "3s", animationDelay: "1s" }} />
                    <div className="relative w-16 h-16 rounded-full bg-blue-600/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <HugeiconsIcon
                        icon={Rocket01Icon}
                        className="w-8 h-8 text-blue-400 group-hover:animate-bounce"
                      />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    10x Faster
                  </h3>
                  <p className="text-sm text-gray-300">
                    Threat detection speed vs. traditional tools
                  </p>

                  {/* Speed gauge bar — pinned to bottom like other cards */}
                  <div className="w-full mt-auto pt-4 flex items-center gap-2">
                    <HugeiconsIcon icon={DashboardSpeed01Icon} className="w-4 h-4 text-blue-300 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: featuresInView ? "92%" : "0%",
                          transition: "width 2s ease-out 1s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            const isLarge = feature.size === "lg";
            const colSpan = isLarge ? "md:col-span-2" : "";
            const rowSpan = isLarge ? "md:row-span-2" : "";

            return (
              <div
                key={index}
                className={`${colSpan} ${rowSpan} group relative overflow-hidden rounded-2xl ${
                  isLarge
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-gray-200 hover:border-blue-200"
                } p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-0.5`}
                style={{
                  opacity: featuresInView ? 1 : 0,
                  transform: featuresInView
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: `opacity 0.6s ease-out ${index * 0.08}s, transform 0.6s ease-out ${index * 0.08}s`,
                }}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
                        isLarge ? "bg-blue-600" : "bg-blue-50"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={feature.icon!}
                        className={`w-6 h-6 ${isLarge ? "text-white" : "text-blue-600"}`}
                      />
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl font-bold mb-2 ${
                        isLarge ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        isLarge ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>

                  <div
                    className={`mt-auto pt-4 flex items-center gap-2 text-sm ${
                      isLarge ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                    <span className="font-medium">Active Protection</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Bento;
