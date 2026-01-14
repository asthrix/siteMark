"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is SiteMark really free?",
    answer: "Yes! The free plan includes up to 100 bookmarks, 3 collections, and all core features. Perfect for personal use. Upgrade to Pro when you need more.",
  },
  {
    question: "Can I import my existing bookmarks?",
    answer: "Absolutely! You can import bookmarks from Chrome, Firefox, Safari, and other browsers using our HTML import. We also support JSON format for advanced users.",
  },
  {
    question: "How does the thumbnail generation work?",
    answer: "When you save a bookmark, we automatically visit the URL and capture a screenshot. We also fetch the page title, description, and favicon for a rich visual experience.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Yes. Your bookmarks are only accessible to you. We use industry-standard encryption and never share your data with third parties. You can export and delete your data at any time.",
  },
  {
    question: "Can I access my bookmarks on multiple devices?",
    answer: "Yes! SiteMark works in any web browser. Sign in with your account and your bookmarks sync automatically across all your devices.",
  },
  {
    question: "Do you offer a browser extension?",
    answer: "We're working on browser extensions for Chrome, Firefox, and Safari. They'll allow you to save bookmarks with one click. Join the waitlist to be notified!",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Frequently asked{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Got questions? We've got answers.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={cn(
                  "w-full text-left p-5 rounded-xl border transition-all duration-200",
                  openIndex === index
                    ? "border-indigo-500/50 bg-indigo-500/5"
                    : "border-border/50 bg-background/50 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0",
                      openIndex === index && "rotate-180"
                    )}
                  />
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
