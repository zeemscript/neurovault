"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Shield, Zap, Globe } from "lucide-react";

const Faq = () => {
  const faqCategories = [
    {
      title: "General",
      icon: HelpCircle,
      questions: [
        {
          question: "What is NeuroVault?",
          answer:
            "NeuroVault is an all-in-one AI & Browser Security Platform that protects organizations from web-borne threats and browsing risks. Our code-free security layer connects seamlessly with any browser to protect every user action across AI tools, SaaS platforms, and web applications.",
        },
        {
          question: "How does NeuroVault work?",
          answer:
            "NeuroVault operates as a security layer that integrates directly with browsers without requiring code changes. It monitors user activity in real-time, detects threats, enforces security policies, and provides comprehensive visibility into AI-related activity and browsing risks across your organization.",
        },
        {
          question: "Do I need to install anything?",
          answer:
            "No code changes are required. NeuroVault deploys instantly through browser extensions or enterprise integrations. Our platform connects seamlessly with existing infrastructure, making deployment quick and hassle-free.",
        },
        {
          question: "What browsers are supported?",
          answer:
            "NeuroVault supports all major browsers including Chrome, Firefox, Safari, Microsoft Edge, Opera, and Brave. Our platform is designed to work across any browser environment.",
        },
      ],
    },
    {
      title: "Security & Protection",
      icon: Shield,
      questions: [
        {
          question: "What threats does NeuroVault protect against?",
          answer:
            "NeuroVault protects against a wide range of threats including shadow AI usage, unauthorized SaaS applications, browser extension risks, data exfiltration, phishing attacks, and malicious web content. Our platform provides real-time threat detection and automated response capabilities.",
        },
        {
          question: "How does AI content security work?",
          answer:
            "Our AI content security feature monitors and protects sensitive data across AI tools and SaaS platforms with real-time content monitoring and policy enforcement. It automatically detects and blocks unauthorized AI applications and prevents data leakage.",
        },
        {
        question: "Is my data secure with NeuroVault?",
          answer:
            "Absolutely. NeuroVault is SOC 2 compliant and follows enterprise-grade security standards. All data is encrypted in transit and at rest. We never store sensitive user data and operate with a zero-trust security model.",
        },
        {
          question: "Can NeuroVault detect shadow AI?",
          answer:
            "Yes, our Shadow AI Detection feature automatically discovers and monitors unauthorized AI applications being used across your organization. It provides real-time alerts and policy enforcement to prevent security risks.",
        },
      ],
    },
    {
      title: "Integration & Setup",
      icon: Zap,
      questions: [
        {
          question: "How long does setup take?",
          answer:
            "Setup typically takes less than 15 minutes. Since no code changes are required, you can deploy NeuroVault instantly and start protecting your organization immediately.",
        },
        {
          question: "Does it work with existing security tools?",
          answer:
            "Yes, NeuroVault integrates seamlessly with existing security infrastructure including SIEM systems, identity providers, and other security tools. Our platform is designed to complement, not replace, your current security stack.",
        },
        {
          question: "What integrations are available?",
          answer:
            "NeuroVault offers integrations with major identity providers (SSO), SIEM platforms, ticketing systems, and notification services. We also provide a comprehensive API for custom integrations.",
        },
        {
          question: "Can I customize security policies?",
          answer:
            "Absolutely. NeuroVault provides granular policy controls that allow you to customize security rules, threat response actions, and monitoring parameters to match your organization's specific security requirements.",
        },
      ],
    },
    {
      title: "Pricing & Support",
      icon: Globe,
      questions: [
        {
          question: "What pricing plans are available?",
          answer:
            "We offer flexible pricing plans based on the number of users and features required. Contact our sales team for a customized quote that fits your organization's needs and scale.",
        },
        {
          question: "Is there a free trial?",
          answer:
            "Yes, we offer a 14-day free trial with full access to all features. No credit card required. You can start protecting your organization immediately and see the value firsthand.",
        },
        {
          question: "What kind of support do you provide?",
          answer:
            "We provide 24/7 enterprise support with dedicated account managers, priority response times, and comprehensive documentation. Our support team is available via email, chat, and phone.",
        },
        {
          question: "What is your uptime SLA?",
          answer:
            "We guarantee 99.9% uptime with enterprise-grade infrastructure and redundancy. Our platform is designed for high availability and includes automatic failover capabilities.",
        },
      ],
    },
  ];

  return (
    <div
      id="faq"
      className="w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about NeuroVault&apos;s security platform,
            features, and implementation.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div key={categoryIndex} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {category.title}
                  </h3>
                </div>

                {/* Accordion */}
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${categoryIndex}-${index}`}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 sm:px-6 hover:bg-slate-800/70 transition-colors"
                    >
                      <AccordionTrigger className="text-left text-white hover:no-underline py-4 sm:py-6">
                        <span className="font-semibold text-base sm:text-lg pr-4">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-300 text-sm sm:text-base leading-relaxed pb-4 sm:pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Faq;

