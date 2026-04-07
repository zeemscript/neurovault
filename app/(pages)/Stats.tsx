"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Shield, Eye, Activity, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    k: "1M+",
    v: "Threats Blocked",
    icon: Shield,
    description: "Malicious activities prevented across networks",
  },
  {
    k: "500+",
    v: "Companies Protected",
    icon: Eye,
    description: "Organizations relying on NeuroVault",
  },
  {
    k: "99.9%",
    v: "Uptime SLA",
    icon: Activity,
    description: "Guaranteed platform availability",
  },
  {
    k: "24/7",
    v: "Active Monitoring",
    icon: Lock,
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
  <section className="relative mx-auto w-full py-16 sm:py-20 lg:py-24 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 border-y border-slate-800/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-4 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-sm"
        >
          Unmatched Protection
        </motion.span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Trusted by Industry Leaders
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-400 leading-relaxed">
          Numbers that speak for themselves. Join hundreds of organizations
          securing their web environment with NeuroVault.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            className="group relative h-full"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border border-slate-800/80 bg-linear-to-br from-slate-900 to-slate-800/50 transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1">
              
              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)]"
                style={{ backgroundSize: "20px 20px" }}
              />

              <div className="relative p-8 flex flex-col h-full">
                {/* Icon in top-left */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-blue-600/10 transition-all duration-300 group-hover:bg-blue-600/20 group-hover:scale-110"
                >
                  <s.icon className="size-6 text-blue-400" />
                </motion.div>

                {/* Large statistic */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.4 }}
                  className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl text-white"
                >
                  {s.k === "24/7" ? <span>{s.k}</span> : <AnimatedCounter value={s.k} />}
                </motion.div>

                {/* Label */}
                <p className="mb-2 text-base font-semibold text-blue-400">
                  {s.v}
                </p>

                {/* Description */}
                <p className="text-sm leading-relaxed text-gray-400 mt-auto">
                  {s.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
