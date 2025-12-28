export default function BentoGrid() {
    return (
      <div className="h-64 flex flex-col gap-4">
         {/* Top Block */}
         <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase">Live Deal</h3>
                <p className="font-bold text-slate-800 text-lg">Sony WH-1000XM5</p>
            </div>
            <div className="text-right">
                <span className="block text-2xl font-bold text-emerald-500">-20%</span>
                <span className="text-xs text-slate-400 line-through">$348.00</span>
            </div>
         </div>

         {/* Bottom Block */}
         <div className="flex-1 bg-indigo-600 p-5 rounded-2xl shadow-lg flex flex-col justify-center text-white">
            <h3 className="text-sm font-medium opacity-80">Total User Savings</h3>
            <p className="text-3xl font-bold mt-1">$12,450</p>
         </div>
      </div>
    );
  }