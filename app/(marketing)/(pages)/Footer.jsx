"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  NewTwitterIcon,
  Linkedin01Icon,
  Mail01Icon,
  Shield01Icon,
  SecurityCheckIcon,
  Certificate01Icon,
  ArrowRight01Icon,
  HeadphonesIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "AI Content Security", href: "#features" },
      { name: "Shadow AI Detection", href: "#features" },
      { name: "Browser Extension Control", href: "#features" },
      { name: "Security Analytics", href: "#features" },
      { name: "Threat Response", href: "#features" },
    ],
    solutions: [
      { name: "Enterprise", href: "#enterprise" },
      { name: "Mid-Market", href: "#midmarket" },
      { name: "Financial Services", href: "#finance" },
      { name: "Healthcare", href: "#healthcare" },
      { name: "Government", href: "#government" },
    ],
    resources: [
      { name: "Documentation", href: "#docs" },
      { name: "API Reference", href: "#api" },
      { name: "Blog", href: "#blog" },
      { name: "Case Studies", href: "#cases" },
      { name: "Changelog", href: "#changelog" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Partners", href: "#partners" },
      { name: "Press", href: "#press" },
      { name: "Contact", href: "#contact" },
    ],
  };

  const socialLinks = [
    { icon: NewTwitterIcon, href: "#", label: "Twitter" },
    { icon: Linkedin01Icon, href: "#", label: "LinkedIn" },
    { icon: GithubIcon, href: "#", label: "GitHub" },
    { icon: Mail01Icon, href: "#", label: "Email" },
  ];

  const certifications = [
    { label: "SOC 2 Type II", icon: Shield01Icon },
    { label: "ISO 27001", icon: Certificate01Icon },
    { label: "GDPR Compliant", icon: SecurityCheckIcon },
  ];

  return (
    <footer className="relative w-full bg-slate-950 overflow-hidden">
      {/* Subtle top border accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -bottom-48 left-1/4 w-[500px] h-[500px] bg-blue-600/[0.07] rounded-full blur-[120px]" />
        <div className="absolute -bottom-48 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Enterprise CTA Banner */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-800/40 to-slate-900/80 p-8 sm:p-10 lg:p-12 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/[0.08] via-transparent to-blue-600/[0.08]" />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                Ready to secure your organization?
              </h3>
              <p className="text-gray-400 text-sm sm:text-base max-w-lg">
                Join 500+ enterprises that trust NeuroVault to protect their AI workflows, SaaS applications, and browser activity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/request-a-demo"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25"
              >
                Request a Demo
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 hover:text-white border border-slate-700/50 hover:border-slate-600 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              >
                <HugeiconsIcon icon={HeadphonesIcon} className="w-4 h-4" />
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block group">
              <span className="text-2xl font-bold text-white tracking-tight">
                Neuro<span className="text-blue-500">Vault</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Enterprise-grade AI & browser security. One platform to monitor, detect, and respond to threats across your entire digital surface.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-gray-500 hover:text-white hover:border-slate-600 hover:bg-slate-700/60 transition-all duration-200"
                >
                  <HugeiconsIcon icon={social.icon} className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-medium mb-5 text-xs uppercase tracking-[0.15em]">
                {category === "platform" ? "Platform" : category === "solutions" ? "Solutions" : category.charAt(0).toUpperCase() + category.slice(1)}
              </h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance & Certifications Bar */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-800/60 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Certifications */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/40 flex items-center justify-center">
                    <HugeiconsIcon icon={cert.icon} className="w-4 h-4 text-blue-400/70" />
                  </div>
                  <span className="text-xs font-medium tracking-wide">{cert.label}</span>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-slate-700/30 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">
                  All systems operational
                </span>
              </div>
              <span className="text-xs text-gray-600">99.9% SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-800/40 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-600">
              &copy; {currentYear} NeuroVault, Inc. All rights reserved.
            </span>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="#privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#cookies" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Cookie Policy
              </Link>
              <Link href="#compliance" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Compliance
              </Link>
              <Link href="#security" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
