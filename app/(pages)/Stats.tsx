"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    k: "10K+",
    v: "Active Users",
    icon: Users,
    description: "Join our growing community of Web3 innovators",
    isDark: true,
  },
  {
    k: "$2M+",
    v: "Paid Out",
    icon: DollarSign,
    description: "Total earnings distributed to our community",
    isDark: true,
  },
  {
    k: "50K+",
    v: "Tasks Completed",
    icon: CheckCircle2,
    description: "Successfully completed projects and tasks",
    isDark: true,
  },
  {
    k: "95%",
    v: "Success Rate",
    icon: TrendingUp,
    description: "Satisfaction rate from our users",
    isDark: true,
  },
];

function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Extract numeric value and preserve the rest (prefixes, suffixes like K, M, %, +, $)
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const prefix = value.match(/^[^0-9.]*/)?.[0] || "";
  const suffix = value.replace(/[0-9.]/g, "").replace(prefix, "");

  useEffect(() => {
    if (!isInView) return;

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
    const formatted = count % 1 !== 0 ? count.toFixed(1) : count.toFixed(0);
    return `${prefix}${formatted}${suffix}`;
  };

  return (
    <span ref={ref}>
      {isInView ? formatCount() : `${prefix}0${suffix}`}
    </span>
  );
}

const Stats = () => (
  <section className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 bg-gray-100">
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
        className="mb-4 inline-block rounded-full border border-purple-200/50 bg-gradient-to-r from-purple-50/80 to-pink-50/80 px-4 py-1.5 text-sm font-medium text-purple-700 backdrop-blur-sm dark:border-purple-500/20 dark:from-purple-500/10 dark:to-pink-500/10 dark:text-purple-300"
      >
        Our Impact
      </motion.span>
      <h2 className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
        Success Stories
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
        Numbers that speak for themselves. Join thousands of satisfied users
        building the future of Web3
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
          <div
            className={cn(
              "relative h-full overflow-hidden rounded-2xl border transition-all duration-300",
              s.isDark
                ? "border-purple-500/20 bg-gradient-to-br from-purple-950/90 to-indigo-950/90 dark:from-purple-900/40 dark:to-indigo-900/40"
                : "border-purple-200/30 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:border-purple-500/10 dark:from-purple-950/20 dark:to-indigo-950/20"
            )}
          >
            {/* Grid pattern overlay */}
            <div
              className={cn(
                "absolute inset-0 opacity-30",
                s.isDark
                  ? "bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(168,85,247,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.15)_1px,transparent_1px)]"
                  : "bg-[linear-gradient(rgba(139,92,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px)]"
              )}
              style={{ backgroundSize: "20px 20px" }}
            />

            <div className="relative p-8">
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
                className={cn(
                  "mb-6 inline-flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                  s.isDark
                    ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                    : "bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
                )}
              >
                <s.icon
                  className={cn(
                    "size-6",
                    s.isDark
                      ? "text-purple-300 dark:text-purple-400"
                      : "text-purple-600 dark:text-purple-400"
                  )}
                />
              </motion.div>

              {/* Large statistic */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className={cn(
                  "mb-3 text-5xl font-bold tracking-tight sm:text-6xl",
                  s.isDark
                    ? "text-purple-200 dark:text-purple-300"
                    : "text-purple-700 dark:text-purple-300"
                )}
              >
                <AnimatedCounter value={s.k} />
              </motion.div>

              {/* Label */}
              <p
                className={cn(
                  "mb-2 text-base font-semibold",
                  s.isDark
                    ? "text-purple-300/90 dark:text-purple-200"
                    : "text-purple-700 dark:text-purple-300"
                )}
              >
                {s.v}
              </p>

              {/* Description */}
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  s.isDark
                    ? "text-purple-300/70 dark:text-purple-300/60"
                    : "text-purple-600/70 dark:text-purple-400/70"
                )}
              >
                {s.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default Stats;
