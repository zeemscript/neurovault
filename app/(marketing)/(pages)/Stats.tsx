"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon, EyeIcon, ActivityIcon, LockIcon } from "@hugeicons/core-free-icons";

const stats = [
  {
    k: "1M+",
    v: "Threats Blocked",
    icon: Shield01Icon,
    description: "Malicious activities prevented across networks",
  },
  {
    k: "500+",
    v: "Companies Protected",
    icon: EyeIcon,
    description: "Organizations relying on NeuroVault",
  },
  {
    k: "99.9%",
    v: "Uptime SLA",
    icon: ActivityIcon,
    description: "Guaranteed platform availability",
  },
  {
    k: "24/7",
    v: "Active Monitoring",
    icon: LockIcon,
    description: "Continuous security surveillance",
  },
];

function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const prefix = value.match(/^[^0-9.]*/)?.[0] || "";
  const suffix = value.replace(/[0-9.]/g, "").replace(prefix, "");

  useEffect(() => {
    if (!isInView) return;
    if (isNaN(numericValue)) return;

    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  const formatCount = () => {
    if (isNaN(numericValue)) return value;
    const formatted = count % 1 !== 0 ? count.toFixed(1) : count.toFixed(0);
    return `${prefix}${formatted}${suffix}`;
  };

  return (
    <span ref={ref}>
      {isInView ? formatCount() : isNaN(numericValue) ? value : `${prefix}0${suffix}`}
    </span>
  );
}

const Stats = () => (
  <section className="relative w-full py-20 sm:py-24 lg:py-28 bg-slate-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <span className="mb-4 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          By the Numbers
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Trusted by Industry Leaders
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-400 leading-relaxed">
          Numbers that speak for themselves. Join hundreds of organizations
          securing their web environment with NeuroVault.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: i * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
            }}
            className="group relative"
          >
            <div className="relative h-full rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 transition-all duration-300 hover:border-blue-500/30 hover:-translate-y-1">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1 + 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-blue-600/10"
              >
                <HugeiconsIcon icon={s.icon} className="size-5 text-blue-400" />
              </motion.div>

              <div className="mb-1 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {s.k === "24/7" ? <span>{s.k}</span> : <AnimatedCounter value={s.k} />}
              </div>

              <p className="text-sm font-semibold text-blue-400 mb-1">
                {s.v}
              </p>

              <p className="text-xs leading-relaxed text-gray-500 hidden sm:block">
                {s.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
