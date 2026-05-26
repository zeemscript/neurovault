"use client";

import React from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuoteDownIcon } from "@hugeicons/core-free-icons";

const testimonials = [
  {
    quote:
      "NeuroVault gave us visibility into AI tools we didn't even know our teams were using. Within a week, we identified 40+ shadow AI applications and secured them all without disrupting workflows.",
    name: "Sarah Chen",
    role: "CISO",
    company: "Meridian Health Systems",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote:
      "The deployment was shockingly fast. We went from evaluation to full rollout across 3,000 employees in under two hours. No other security tool we've evaluated came close to that.",
    name: "James Okonkwo",
    role: "VP of Engineering",
    company: "Apex Financial Group",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "Browser extension risks were our biggest blind spot. NeuroVault caught a malicious extension within hours of deployment that had been exfiltrating data for months.",
    name: "Maria Gonzalez",
    role: "Head of Security Operations",
    company: "CloudBridge Technologies",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const Testimonials = () => {
  return (
    <section className="w-full py-20 sm:py-24 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Hear from security leaders
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            See why hundreds of organizations trust NeuroVault to protect
            their most critical digital assets.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl border border-gray-200 p-8 flex flex-col hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Quote icon */}
              <HugeiconsIcon
                icon={QuoteDownIcon}
                className="w-8 h-8 text-blue-600/20 mb-5"
              />

              {/* Quote */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 flex-1">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
