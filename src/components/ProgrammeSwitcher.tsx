import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui';
import { Heart, Trophy, ShieldAlert, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProgrammeSwitcher: React.FC = () => {
  const navigate = useNavigate();

  // Mock KPIs for the cards (these would be fetched from stores in reality)
  const programmes = [
    {
      id: 'renu',
      name: 'RENU Programme',
      desc: 'Rehabilitation & Education for Special Needs',
      kpi: '142 Children Enrolled',
      icon: <Heart className="h-10 w-10 text-red-500" />,
      bg: 'bg-red-50',
      border: 'border-red-200 hover:border-red-400',
      path: '/renu'
    },
    {
      id: 'awards',
      name: 'Guardian Angel Awards',
      desc: 'Recognizing Excellence in Special Care',
      kpi: '38 Nominations Received',
      icon: <Trophy className="h-10 w-10 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200 hover:border-amber-400',
      path: '/awards'
    },
    {
      id: 'roadsafety',
      name: 'Road Safety Programme',
      desc: 'Awareness & Education Initiatives',
      kpi: '56 Workshops Conducted',
      icon: <ShieldAlert className="h-10 w-10 text-emerald-500" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200 hover:border-emerald-400',
      path: '/road-safety'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <img src="/vishal-logo.png" alt="Vishalwin Foundation" className="h-20 mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold text-slate-900">Vishalwin Foundation</h1>
        <p className="text-slate-500 mt-2">Select a programme to manage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {programmes.map((prog, idx) => (
          <motion.div
            key={prog.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="h-full"
          >
            <Card
              className={`h-full cursor-pointer transition-all duration-300 p-8 flex flex-col items-center text-center border-2 ${prog.border} hover:shadow-xl group bg-white`}
              onClick={() => navigate(prog.path)}
            >
              <div className={`p-4 rounded-full ${prog.bg} mb-6 group-hover:scale-110 transition-transform`}>
                {prog.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 font-display">{prog.name}</h2>
              <p className="text-sm text-slate-500 mb-6 flex-grow">{prog.desc}</p>
              
              <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{prog.kpi}</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
