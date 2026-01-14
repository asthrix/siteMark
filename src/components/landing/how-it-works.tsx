"use client";

import { motion } from "motion/react";
import { Link2, FolderPlus, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Save Any URL",
    description: "Add bookmarks with one click. We automatically fetch the title, description, and thumbnail.",
  },
  {
    number: "02",
    icon: FolderPlus,
    title: "Organize Your Way",
    description: "Create collections and add tags. Build a system that works for how you think.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Find Anything Instantly",
    description: "Use search, filters, or just browse your visual grid. Your bookmarks are always at your fingertips.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            How it{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Get started in seconds. No complicated setup required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              {/* Step Number */}
              <div className="relative inline-flex mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center border border-border/50">
                  <step.icon className="h-10 w-10 text-indigo-500" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
