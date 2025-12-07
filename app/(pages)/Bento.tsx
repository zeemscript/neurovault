"use client";

import React from "react";
import {
  Shield,
  Eye,
  Lock,
  Activity,
  Zap,
  AlertTriangle,
  Globe,
  BarChart3,
  CheckCircle2,
  Network,
  FileSearch,
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const Bento = () => {
  const { ref: featuresRef, hasBeenInView: featuresInView } = useInView({
    threshold: 0.2,
  });

  const features = [
    {
      icon: Shield,
      title: "AI & SaaS Content Security",
      description:
        "Protect sensitive data across AI tools and SaaS platforms with real-time content monitoring and policy enforcement.",
      gradient: "from-blue-600 to-blue-700",
      iconColor: "text-blue-300",
      size: "lg",
    },
    {
      icon: Eye,
      title: "Shadow AI Detection",
      description:
        "Automatically discover and monitor unauthorized AI applications being used across your organization.",
      gradient: "from-slate-800 to-slate-900",
      iconColor: "text-blue-400",
      size: "md",
    },
    {
      icon: Lock,
      title: "Browser Extension Risk Control",
      description:
        "Manage browser extensions with granular controls, risk assessment, and automated policy enforcement.",
      gradient: "from-slate-800 to-slate-900",
      iconColor: "text-blue-400",
      size: "md",
    },
    {
      icon: Activity,
      title: "Real-Time Activity Monitoring",
      description:
        "Live visibility into all user actions, security events, and potential threats across your entire network.",
      gradient: "from-blue-600 to-blue-700",
      iconColor: "text-blue-300",
      size: "lg",
    },
    {
      icon: Network,
      title: "Unified Defense System",
      description:
        "Single platform that connects seamlessly with any browser to protect every user action in one place.",
      gradient: "from-slate-800 to-slate-900",
      iconColor: "text-blue-400",
      size: "md",
    },
    {
      icon: FileSearch,
      title: "Code-Free Integration",
      description:
        "Deploy instantly without code changes. Our security layer connects seamlessly with existing infrastructure.",
      gradient: "from-slate-800 to-slate-900",
      iconColor: "text-blue-400",
      size: "md",
    },
    {
      icon: BarChart3,
      title: "Security Analytics & Insights",
      description:
        "Comprehensive dashboards and reports providing unmatched insight into AI-related activity and browsing risks.",
      gradient: "from-slate-800 to-slate-900",
      iconColor: "text-blue-400",
      size: "md",
    },
    {
      icon: Zap,
      title: "Instant Threat Response",
      description:
        "Automated threat detection and immediate alerts with configurable response actions to protect your organization.",
      gradient: "from-slate-800 to-slate-900",
      iconColor: "text-blue-400",
      size: "md",
    },
  ];

  const stats = [
    { label: "Threats Blocked", value: "1M+", icon: Shield },
    { label: "Companies Protected", value: "500+", icon: Eye },
    { label: "Uptime SLA", value: "99.9%", icon: CheckCircle2 },
  ];

  return (
    <div
      id="features"
      className="w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Comprehensive Security Features
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            Protect your organization with a unified defense system that monitors
            and secures every user action across AI tools, SaaS platforms, and
            web applications.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center gap-4 hover:bg-slate-800 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bento Grid */}
        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "lg";
            const colSpan = isLarge ? "md:col-span-2" : "";
            const rowSpan = isLarge ? "md:row-span-2" : "";

            return (
              <div
                key={index}
                className={`${colSpan} ${rowSpan} group relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.gradient} p-6 sm:p-8 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1`}
                style={{
                  opacity: featuresInView ? 1 : 0,
                  transform: featuresInView
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`,
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                      <Icon
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor}`}
                      />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="mt-auto pt-4 flex items-center gap-2 text-white/60 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active Protection</span>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>

      
      </div>
    </div>
  );
};

export default Bento;
