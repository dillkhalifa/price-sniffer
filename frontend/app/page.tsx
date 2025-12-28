"use client";

import { useState, useRef } from "react";
import { Camera, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ResultsView from "../components/ResultsView";
import HowItWorks from "../components/HowItWorks";
import BentoGrid from "../components/BentoGrid";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent, file?: File) => {
    if (e) e.preventDefault();
    if (!query && !file) return;

    setLoading(true);
    setData(null);

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (query) formData.append("query", query);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      alert("Failed to fetch prices. Ensure Backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleSearch(undefined, e.target.files[0]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-indigo-600">
          PriceSniffer<span className="text-slate-400">.</span>
        </h1>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {!data ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Stop overpaying. <br />
              <span className="text-indigo-600">Sniff out the best deal.</span>
            </h2>
            
            <p className="text-lg text-slate-500 max-w-2xl">
              Type a product name or upload a photo. We instantly compare prices across the internet to find you the lowest offer.
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="block w-full pl-12 pr-14 py-4 bg-white border border-slate-200 rounded-full text-lg shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Paste a link or type product name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>
              
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-indigo-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-indigo-600 font-medium animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin" />
                Sniffing out prices...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
              <HowItWorks />
              <BentoGrid />
            </div>

          </motion.div>
        ) : (
          <ResultsView data={data} onReset={() => setData(null)} />
        )}
      </div>
    </main>
  );
}