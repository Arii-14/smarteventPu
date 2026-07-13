import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalyticsCharts = ({ registrationsData }) => {
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  
  // Dummy data for visual presentation since API might not have this shape
  const dummyLineData = [
    { label: 'Jan', value: 45 }, { label: 'Feb', value: 52 },
    { label: 'Mar', value: 38 }, { label: 'Apr', value: 65 },
    { label: 'Mei', value: 89 }, { label: 'Jun', value: 110 }
  ];

  const maxVal = Math.max(...dummyLineData.map(d => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Analitik Pendaftaran</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tren 6 bulan terakhir</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <TrendingUp size={14} />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <BarChart3 size={14} />
          </button>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="flex-1 flex items-end gap-3 min-h-[160px] pb-2 border-b border-slate-100 dark:border-slate-800/70">
        {dummyLineData.map((d, i) => {
          const height = (d.value / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group relative">
              {/* Tooltip */}
              <div className="absolute -top-8 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
                {d.value} pendaftar
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45" />
              </div>
              
              {chartType === 'bar' ? (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-full rounded-t-lg bg-indigo-100 dark:bg-indigo-500/20 group-hover:bg-gradient-to-t group-hover:from-indigo-600 group-hover:to-violet-500 transition-all duration-300 cursor-pointer"
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-end relative">
                  {/* Pseudo Line chart using dots and connecting visual logic is hard without SVG, falling back to soft bar logic for visual */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full flex justify-center cursor-pointer"
                  >
                    <div className="w-2 h-full bg-indigo-50 dark:bg-indigo-900/10 rounded-t-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30 transition-colors relative">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform" />
                    </div>
                  </motion.div>
                </div>
              )}
              
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{d.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-1">
        <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
          <TrendingUp size={12} />
          <span>+23.5% naik</span>
        </div>
        <Link to="/admin/registrations" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group transition-colors">
          Lihat detail <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default AnalyticsCharts;
