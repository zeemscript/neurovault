"use client";

import React from "react";
import Image from "next/image";
import CountUp from "react-countup";
import { useInView } from "@/hooks/use-in-view";

const TrustedBy = () => {
  const { ref, hasBeenInView } = useInView({ threshold: 0.3 });

  // Real company logos using Clearbit Logo API
  const companies = [
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Google", domain: "google.com" },
    { name: "Amazon", domain: "amazon.com" },
    { name: "IBM", domain: "ibm.com" },
    { name: "Salesforce", domain: "salesforce.com" },
    { name: "Oracle", domain: "oracle.com" },
    { name: "Adobe", domain: "adobe.com" },
    { name: "Cisco", domain: "cisco.com" },
  ];

  // Duplicate companies for seamless scroll
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <div className="w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Trusted By Section */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">
            Trusted by Industry Leaders
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Powering Security for Top Organizations
          </h2>
        </div>

        {/* Infinite Scrolling Logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-6 sm:gap-8 lg:gap-10">
            {duplicatedCompanies.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="flex-shrink-0 flex items-center justify-center h-16 sm:h-20 lg:h-24 group"
              >
                <div className="relative w-30 sm:w-40 lg:w-48 h-full opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                  <img
                    src={`https://logo.clearbit.com/${company.domain}`}
                    alt={company.name}
                    className="w-50 h-50 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      // Fallback to placeholder if logo fails
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/180x80/cccccc/666666?text=${encodeURIComponent(company.name)}`;
                      target.onerror = null; // Prevent infinite loop
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;