import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roadSafetyStore } from '../data/roadSafetyStore';
import { Card, Badge, Button } from '../../../components/ui';
import {
  ShieldAlert,
  Users,
  Building2,
  Handshake,
  MapPin,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(roadSafetyStore.data);

  useEffect(() => {
    const handleStorageChange = () => setData(roadSafetyStore.data);
    window.addEventListener('roadsafety_data_updated', handleStorageChange);
    return () => window.removeEventListener('roadsafety_data_updated', handleStorageChange);
  }, []);

  // Basic stats
  const totalWorkshops = data.workshops.length;
  const totalParticipants = data.workshops.reduce((acc, curr) => acc + (curr.outcome?.actualParticipants || 0), 0);
  const pledgeCount = data.participants.filter(p => p.pledgeSigned).length;
  
  // KPI stats
  const completedWorkshops = data.workshops.filter(w => w.status === 'Completed').length;
  const institutionsCovered = data.institutions.length;
  const activeCollaborations = data.collaborations.filter(c => c.activeStatus === 'Active').length;
  const upcomingWorkshops = data.workshops.filter(w => w.status === 'Scheduled').length;
  const citiesCovered = new Set(data.workshops.map(w => w.city)).size;

  const kpis = [
    { title: 'Total Workshops', value: totalWorkshops, icon: <ShieldAlert className="h-5 w-5 text-red-600"/>, bg: 'bg-red-50', color: 'text-red-600', bar: 'bg-red-500' },
    { title: 'Completed Workshops', value: completedWorkshops, icon: <CheckCircle2 className="h-5 w-5 text-green-600"/>, bg: 'bg-green-50', color: 'text-green-600', bar: 'bg-green-500' },
    { title: 'Total Participants', value: totalParticipants, icon: <Users className="h-5 w-5 text-blue-600"/>, bg: 'bg-blue-50', color: 'text-blue-600', bar: 'bg-blue-500' },
    { title: 'Pledges Signed', value: pledgeCount, icon: <Award className="h-5 w-5 text-emerald-600"/>, bg: 'bg-emerald-50', color: 'text-emerald-600', bar: 'bg-emerald-500' },
    { title: 'Institutions Covered', value: institutionsCovered, icon: <Building2 className="h-5 w-5 text-purple-600"/>, bg: 'bg-purple-50', color: 'text-purple-600', bar: 'bg-purple-500' },
    { title: 'Active Collaborations', value: activeCollaborations, icon: <Handshake className="h-5 w-5 text-amber-600"/>, bg: 'bg-amber-50', color: 'text-amber-600', bar: 'bg-amber-500' },
    { title: 'Upcoming Workshops', value: upcomingWorkshops, icon: <Clock className="h-5 w-5 text-sky-600"/>, bg: 'bg-sky-50', color: 'text-sky-600', bar: 'bg-sky-500' },
    { title: 'Cities Covered', value: citiesCovered, icon: <MapPin className="h-5 w-5 text-indigo-600"/>, bg: 'bg-indigo-50', color: 'text-indigo-600', bar: 'bg-indigo-500' },
  ];

  // Pipeline counts
  const pipelineNodes = [
    { label: 'Scheduled', count: data.workshops.filter(w => w.status === 'Scheduled').length, color: 'blue' },
    { label: 'In Progress', count: 0, color: 'amber' },
    { label: 'Completed', count: data.workshops.filter(w => w.status === 'Completed').length, color: 'green' },
    { label: 'Cancelled', count: data.workshops.filter(w => w.status === 'Cancelled').length, color: 'red' },
  ];

  // Monthly Workshop Trend
  interface TrendItem { monthStr: string; month: number; year: number; count: number; }
  const getLast6Months = (): TrendItem[] => {
    const result: TrendItem[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        monthStr: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear(),
        month: d.getMonth(),
        year: d.getFullYear(),
        count: 0
      });
    }
    return result;
  };

  const trendData: TrendItem[] = getLast6Months();
  data.workshops.forEach(w => {
    const d = new Date(w.date);
    const m = d.getMonth();
    const y = d.getFullYear();
    const index = trendData.findIndex(t => t.month === m && t.year === y);
    if (index !== -1) {
      trendData[index].count++;
    }
  });

  // City-wise Reach
  const cityReachMap: Record<string, number> = {};
  data.workshops.forEach(w => {
    const participants = w.outcome?.actualParticipants || 0;
    cityReachMap[w.city] = (cityReachMap[w.city] || 0) + participants;
  });
  const cityReachData = Object.keys(cityReachMap).map(k => ({ name: k, reach: cityReachMap[k] }))
    .sort((a,b) => b.reach - a.reach).slice(0, 8);

  // Pledge Ratio
  const totalPartFromParticipants = data.participants.length;
  const pledgeSigned = data.participants.filter(p => p.pledgeSigned).length;
  const pledgePercentage = totalPartFromParticipants > 0 ? Math.round((pledgeSigned / totalPartFromParticipants) * 100) : 0;

  // Institution Type Breakdown
  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
  const instTypeMap: Record<string, number> = {};
  data.institutions.forEach(i => {
    instTypeMap[i.type] = (instTypeMap[i.type] || 0) + 1;
  });
  const instTypeData = Object.keys(instTypeMap).map((k, i) => ({
    name: k,
    value: instTypeMap[k],
    color: COLORS[i % COLORS.length]
  }));

  // Recent Participants
  const recentParticipants = [...data.participants].reverse().slice(0, 5);

  // Upcoming Workshops
  const upcomingWorkshopsList = data.workshops
    .filter(w => w.status === 'Scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 w-full max-w-none pb-12 text-slate-700">
      
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-red-50/40 to-orange-50/50 p-6 md:p-8 border border-slate-200/80 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"/>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"/>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-100">
              <Sparkles className="h-3.5 w-3.5 animate-pulse"/> Road Safety Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 leading-tight">
              Road Safety Awareness Programme
            </h1>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              Creating safer roads through education and awareness.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 sm:gap-6 bg-white/80 p-4 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-xs">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Workshops</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalWorkshops}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 self-center"/>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reached</span>
              <span className="text-xl font-extrabold text-blue-600 mt-1 block">{totalParticipants}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 self-center"/>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pledges</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-1 block">{pledgeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-5 gap-4">
          <button onClick={() => navigate('/road-safety/workshops')} className="group flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">New Workshop</span>
          </button>
          <button onClick={() => navigate('/road-safety/institutions')} className="group flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Add Institution</span>
          </button>
          <button onClick={() => navigate('/road-safety/participants')} className="group flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Add Participant</span>
          </button>
          <button onClick={() => navigate('/road-safety/collaborations')} className="group flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Handshake className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Collaboration</span>
          </button>
          <button onClick={() => navigate('/road-safety/reports')} className="group flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Reports</span>
          </button>
        </div>
      </Card>

      {/* 3. 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none text-slate-500 scale-[5]">
              {kpi.icon}
            </div>
            <div className="relative p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 line-clamp-1">{kpi.title}</span>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">{kpi.value}</h3>
              <div className="mt-4 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full w-2/3 rounded-full ${kpi.bar}`}></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 4. Workshop Status Pipeline */}
      <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-600"/> Workshop Status Pipeline
        </h3>
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-center justify-between min-w-[600px] px-4">
            {pipelineNodes.map((node, idx) => (
              <React.Fragment key={node.label}>
                {idx > 0 && <div className="h-0.5 flex-1 bg-slate-200 border-dashed border-t mx-2"/>}
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center">
                  <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-bold text-lg
                    ${node.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      node.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      node.color === 'green' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                    {node.count}
                  </div>
                  <span className="text-xs font-bold text-slate-600 mt-2">{node.label}</span>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Monthly Workshop Trend */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-80">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Workshop Activity — Last 6 Months</h3>
          {trendData.reduce((a, b) => a + b.count, 0) === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No activity in the last 6 months</div>
          ) : (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthStr" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="#ef4444" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* 6. City-wise Reach */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-80">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Top Cities by Reach</h3>
          {cityReachData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No reach data available</div>
          ) : (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityReachData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="reach" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 7. Pledge Ratio Progress Card */}
        <Card className="p-5 bg-emerald-50 border border-emerald-100 shadow-sm rounded-2xl flex flex-col justify-center text-center">
          <Award className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-2xl font-black text-emerald-900 mb-2">{pledgePercentage}%</h3>
          <p className="text-sm text-emerald-700 font-medium mb-4">of participants signed the Road Safety Pledge</p>
          <div className="w-full h-3 rounded-full bg-emerald-200 overflow-hidden mb-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pledgePercentage}%` }}></div>
          </div>
          <p className="text-xs text-emerald-600 font-bold">{pledgeSigned} pledges out of {totalPartFromParticipants} participants</p>
        </Card>

        {/* 8. Institution Type Breakdown Pie Chart */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Institution Type Breakdown</h3>
          {instTypeData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No institutions data</div>
          ) : (
            <div className="flex-1 w-full flex items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={instTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                    {instTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* 9. Recent Participants Feed */}
        <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Participants</h3>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {recentParticipants.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-4">No participants yet</div>
            ) : (
              recentParticipants.map(p => {
                const ws = data.workshops.find(w => w.id === p.workshopId);
                return (
                  <div key={p.id} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-xs text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{ws ? ws.title : 'Unknown Workshop'}</p>
                    </div>
                    {p.pledgeSigned && (
                      <Badge color="success" className="text-[9px] px-1.5 py-0.5 whitespace-nowrap">Pledge Signed</Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* 10. Upcoming Workshops Alert List */}
      <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-900">Upcoming Workshops</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/road-safety/workshops')} className="text-xs text-red-600 h-auto p-1">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="space-y-3">
          {upcomingWorkshopsList.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-4">No upcoming scheduled workshops</div>
          ) : (
            upcomingWorkshopsList.map(ws => (
              <div key={ws.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{ws.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ws.city}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ws.expectedParticipants} Expected</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge color="primary" className="text-[10px] mb-1">{ws.date}</Badge>
                  <p className="text-[10px] text-slate-500">{ws.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
