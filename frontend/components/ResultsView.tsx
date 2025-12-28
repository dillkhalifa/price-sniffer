"use client";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ResultsView({ data, onReset }: { data: any, onReset: () => void }) {
  // Get top 5 items for the chart
  const chartData = data.items.slice(0, 5).map((item: any) => ({
    merchant: item.merchant,
    price: item.price
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Back Button */}
      <button 
        onClick={onReset}
        className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Search Again
      </button>

      {/* Dashboard Top Section */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10">
        <div className="lg:w-1/3 space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 capitalize leading-tight">Prices for <br/> <span className="text-indigo-600">{data.query}</span></h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lowest Price</div>
              <div className="text-2xl font-bold text-emerald-600">${data.stats.min_price}</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Average</div>
              <div className="text-2xl font-bold text-slate-700">${data.stats.avg_price}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:w-2/3 h-64 bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Price Comparison</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="merchant" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                cursor={{fill: 'transparent'}} 
              />
              <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                {chartData.map((entry:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Grid */}
      <h3 className="text-xl font-bold text-slate-900 mb-6">Deals Found</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((item: any, idx: number) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="h-48 w-full bg-slate-50 p-6 flex items-center justify-center">
               <img src={item.image_url || "https://placehold.co/200"} alt={item.title} className="max-h-full object-contain mix-blend-multiply" />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                 <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">{item.merchant}</span>
                 {idx === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Best Deal</span>}
              </div>
              <h4 className="font-medium text-slate-900 line-clamp-2 mb-2 h-10 text-sm leading-snug">{item.title}</h4>
              <div className="flex items-end justify-between mt-4">
                <span className="text-xl font-bold text-slate-900">{item.formatted_price}</span>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}