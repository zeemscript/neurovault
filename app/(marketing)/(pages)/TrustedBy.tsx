"use client";

import React from "react";
import Image from "next/image";

const TrustedBy = () => {
  const companies = [
    { name: "Google", logo: "/logos/google.svg" },
    { name: "Microsoft", logo: "/logos/microsoft.svg" },
    { name: "Amazon", logo: "/logos/amazon.svg" },
    { name: "Salesforce", logo: "/logos/salesforce.svg" },
    { name: "Cisco", logo: "/logos/cisco.svg" },
    { name: "IBM", logo: "/logos/ibm.svg" },
    { name: "Deloitte", logo: "/logos/deloitte.svg" },
    { name: "Accenture", logo: "/logos/accenture.svg" },
    { name: "J.P. Morgan", logo: "/logos/jpmorgan.svg" },
    { name: "Stripe", logo: "/logos/stripe.svg" },
  ];

  const duplicated = [...companies, ...companies];

  return (
    <section className="w-full py-16 sm:py-20 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs sm:text-sm font-semibold text-blue-400/80 uppercase tracking-[0.2em]">
            Trusted by Industry Leaders
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-3">
            Securing the world&apos;s most innovative companies
          </h2>
        </div>

        {/* Scrolling Logo Strip */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-linear-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-linear-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          {/* Logo track */}
          <div className="flex animate-scroll gap-14 sm:gap-20 lg:gap-24 items-center">
            {duplicated.map((company, index) => (
              <div
                key={`${company.name}-${index}`}
                className="shrink-0 flex items-center justify-center h-10 sm:h-12 opacity-30 hover:opacity-70 transition-opacity duration-500"
              >
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={140}
                  height={40}
                  className="h-7 sm:h-9 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
