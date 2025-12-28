"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Camera, ScanLine, TrendingDown } from "lucide-react";

const steps = [
  { icon: Camera, text: "Upload a photo" },
  { icon: ScanLine, text: "AI identifies the product" },
  { icon: TrendingDown, text: "Find the lowest price" },
];

export default function HowItWorks() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = steps[index].icon;

  return (
    <div className="h-64 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider">How it works</div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
            <CurrentIcon size={32} />
          </div>
          <p className="text-xl font-medium text-slate-700">{steps[index].text}</p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 flex gap-2">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'}`} 
          />
        ))}
      </div>
    </div>
  );
}