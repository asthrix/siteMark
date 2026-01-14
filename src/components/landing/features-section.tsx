"use client";

import { motion } from "motion/react";
import {
  Image as ImageIcon,
  FolderOpen,
  Tags,
  Search,
  Keyboard,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: ImageIcon,
    title: "Visual Thumbnails",
    description: "Automatic thumbnail generation for every bookmark. See your links at a glance.",
  },
  {
    icon: FolderOpen,
    title: "Smart Collections",
    description: "Organize bookmarks into collections. Keep work, personal, and projects separate.",
  },
  {
    icon: Tags,
    title: "Flexible Tags",
    description: "Add multiple tags for flexible categorization. Filter by any combination.",
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Find any bookmark instantly. Search by title, URL, tags, or description.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description: "Power user friendly. ⌘K command menu for quick actions.",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Works beautifully on desktop, tablet, and mobile devices.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      </div>

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
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              manage bookmarks
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Powerful features designed to help you save time and stay organized.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center mb-4 group-hover:from-indigo-500/20 group-hover:to-violet-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-indigo-500" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
