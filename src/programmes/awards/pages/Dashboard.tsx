import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { awardsStore } from '../data/awardsStore';
import { Card, Badge, Button } from '../../../components/ui';
import { 
  Plus, Calendar, Trophy, FileText, CheckCircle, 
  Users, Award, Sparkles, Medal, Activity, AlertCircle, CalendarDays,
  Clock, CheckCircle2, ChevronRight, BarChart2, Presentation, MapPin,
  TrendingUp, CircleDot
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(awardsStore.data);

  useEffect(() => {
    const handleStorageChange = () => setData(awardsStore.data);
    window.addEventListener('awards_data_updated', handleStorageChange);
    return () => window.removeEventListener('awards_data_updated', handleStorageChange);
  }, []);

  const currentYear = new Date().getFullYear().toString();

  // 3. KPI Calculations
  const totalNominations = data.nominees.length;
  const totalVerified = data.nominees.filter(n => n.verificationSelection.verificationStatus === 'Verified').length;
  const totalShortlisted = data.nominees.filter(n => n.verificationSelection.selectionStatus === 'Shortlisted').length;
  const totalSelected = data.nominees.filter(n => n.verificationSelection.selectionStatus === 'Selected').length;
  const totalEvents = data.events.length;
  const totalAwardees = data.awardees.length;
  const pendingVerification = data.nominees.filter(n => n.verificationSelection.verificationStatus === 'Pending').length;
  const ceremoniesDone = data.awardees.filter(a => a.ceremonyRecord?.attendanceStatus === 'Present').length;
  const awardedCount = data.awardees.filter(a => a.ceremonyRecord?.awardReceived).length;

  // 4. Pipeline Funnel
  const pipelineStages = [
    { label: 'Submitted', count: totalNominations, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { label: 'Verified', count: totalVerified, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    { label: 'Shortlisted', count: totalShortlisted, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    { label: 'Selected', count: totalSelected, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { label: 'Ceremony', count: data.awardees.filter(a => a.ceremonyRecord).length, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    { label: 'Awarded', count: awardedCount, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  ];

  // 5. Category-wise Bar Chart
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    data.nominees.forEach(n => {
      cats[n.awardCategory] = (cats[n.awardCategory] || 0) + 1;
    });
    return Object.entries(cats).map(([name, count]) => ({ name, count }));
  }, [data.nominees]);

  // 6. City/State Participation Chart
  const cityData = useMemo(() => {
    const cities: Record<string, number> = {};
    data.nominees.forEach(n => {
      cities[n.city] = (cities[n.city] || 0) + 1;
    });
    return Object.entries(cities)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [data.nominees]);

  // 7. Event-year Nomination Trend
  const yearData = useMemo(() => {
    const years: Record<string, number> = {};
    data.nominees.forEach(n => {
      years[n.awardYear] = (years[n.awardYear] || 0) + 1;
    });
    return Object.entries(years)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [data.nominees]);

  // 8. Recent Nominations Feed
  const recentNominations = useMemo(() => {
    return [...data.nominees]
      .reverse()
      .slice(0, 5);
  }, [data.nominees]);

  // 9. Pending Actions Alert Panel
  const shortlistedNoCeremony = data.nominees.filter(n => n.verificationSelection.selectionStatus === 'Shortlisted').length - data.awardees.length; // Approximate logic based on requirements
  const upcomingEvents = data.events.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    const diff = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 30;
  });

  // 10. Awardee Follow-up Status Breakdown
  const followUpData = useMemo(() => {
    const stats: Record<string, number> = {
      'Not Started': 0, 'Contacted': 0, 'In Progress': 0, 'Completed': 0
    };
    data.awardees.forEach(a => {
      const status = a.followUpStatus || 'Not Started';
      stats[status] = (stats[status] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [data.awardees]);

  const PIE_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/40 to-red-50/50 p-6 md:p-8 border border-slate-200/80 shadow-md">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-amber-100/50">
          <Award size={250} strokeWidth={1} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 shadow-sm flex items-center gap-1.5 py-1">
                <Sparkles size={14} className="text-amber-600" />
                Award Programme Portal
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
              Guardian Angel Awards
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Recognising extraordinary caregivers and professionals
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/80 shadow-sm">
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Edition</span>
              <span className="text-lg font-bold text-slate-800">{currentYear} Edition</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nominations</span>
              <span className="text-lg font-bold text-slate-800">{totalNominations}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Selected</span>
              <span className="text-lg font-bold text-slate-800">{totalSelected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <Card className="p-4 border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all border-slate-200" onClick={() => navigate('/awards/nominees')}>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-full mb-1"><Plus size={18} /></div>
            <span className="text-sm font-medium">Add Nominee</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all border-slate-200" onClick={() => navigate('/awards/events')}>
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-full mb-1"><Calendar size={18} /></div>
            <span className="text-sm font-medium">Create Event</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all border-slate-200" onClick={() => navigate('/awards/awardees')}>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-full mb-1"><Medal size={18} /></div>
            <span className="text-sm font-medium">View Awardees</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all border-slate-200" onClick={() => navigate('/awards/ceremony')}>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full mb-1"><Presentation size={18} /></div>
            <span className="text-sm font-medium">Ceremony</span>
          </Button>
          <Button variant="outline" className="col-span-2 md:col-span-1 h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all border-slate-200" onClick={() => navigate('/awards/reports')}>
            <div className="bg-slate-100 text-slate-600 p-2 rounded-full mb-1"><FileText size={18} /></div>
            <span className="text-sm font-medium">Reports</span>
          </Button>
        </div>
      </Card>

      {/* 4. Nomination Pipeline Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-6 font-display flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          Nomination Pipeline
        </h3>
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex items-center min-w-max px-4">
            {pipelineStages.map((stage, idx) => (
              <React.Fragment key={stage.label}>
                <div className="flex flex-col items-center relative group">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${stage.bg} ${stage.border} ${stage.color} shadow-sm group-hover:scale-105 transition-transform bg-white z-10`}>
                    {stage.count}
                  </div>
                  <span className="mt-3 text-sm font-semibold text-slate-600 uppercase tracking-wider">{stage.label}</span>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <div className="w-16 md:w-24 border-t-2 border-dashed border-slate-300 mx-2 -mt-8 z-0"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalNominations}</p>
          <p className="text-sm font-medium text-slate-500">Total Nominations</p>
        </Card>
        
        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalVerified}</p>
          <p className="text-sm font-medium text-slate-500">Verified</p>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalShortlisted}</p>
          <p className="text-sm font-medium text-slate-500">Shortlisted</p>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalSelected}</p>
          <p className="text-sm font-medium text-slate-500">Selected Awardees</p>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalEvents}</p>
          <p className="text-sm font-medium text-slate-500">Total Events</p>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalAwardees}</p>
          <p className="text-sm font-medium text-slate-500">Total Awardees</p>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{pendingVerification}</p>
          <p className="text-sm font-medium text-slate-500">Pending Verification</p>
        </Card>

        <Card className="p-5 flex flex-col relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{ceremoniesDone}</p>
          <p className="text-sm font-medium text-slate-500">Ceremonies Done</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 5. Category-wise Bar Chart */}
        <Card className="p-6 col-span-1 lg:col-span-2 shadow-sm border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 font-display flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-amber-500" />
            Nominations by Category
          </h3>
          <div className="h-72 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" name="Nominees" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No data yet</div>
            )}
          </div>
        </Card>

        {/* 6. City/State Participation Chart */}
        <Card className="p-6 col-span-1 shadow-sm border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 font-display flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-500" />
            Top Cities by Nominations
          </h3>
          <div className="h-72 w-full">
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={80} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" name="Nominations" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No data yet</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7. Event-year Nomination Trend */}
        <Card className="p-6 col-span-1 shadow-sm border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 font-display flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Nominations Trend by Year
          </h3>
          <div className="h-64 w-full">
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                  <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="count" name="Nominations" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No data yet</div>
            )}
          </div>
        </Card>

        {/* 8. Recent Nominations Feed */}
        <Card className="p-6 col-span-1 lg:col-span-1 shadow-sm border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500" />
              Recent Nominations
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/awards/nominees')} className="text-blue-600 p-0 hover:bg-transparent hover:text-blue-700">
              View all <ChevronRight size={16} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {recentNominations.length > 0 ? (
              recentNominations.map(nominee => (
                <div key={nominee.id} className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-slate-900 text-sm line-clamp-1" title={nominee.fullName}>{nominee.fullName}</span>
                    <Badge variant="soft" className={`text-[10px] py-0 h-5 ${
                      nominee.verificationSelection.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                      nominee.verificationSelection.verificationStatus === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                      nominee.verificationSelection.verificationStatus === 'Clarification Required' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {nominee.verificationSelection.verificationStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-600 font-medium truncate">{nominee.awardCategory}</span>
                    <span className="text-slate-500 flex items-center gap-1"><MapPin size={10} />{nominee.city}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No nominations yet</div>
            )}
          </div>
        </Card>

        <div className="col-span-1 flex flex-col gap-6">
          {/* 10. Awardee Follow-up Status Breakdown */}
          <Card className="p-6 shadow-sm border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2 font-display flex items-center gap-2">
              <CircleDot className="h-5 w-5 text-teal-500" />
              Post-Award Follow-up
            </h3>
            <div className="h-40 w-full">
              {followUpData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={followUpData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {followUpData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">No data yet</div>
              )}
            </div>
          </Card>

          {/* 9. Pending Actions Alert Panel */}
          <Card className="p-6 shadow-sm border-slate-200 flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-4 font-display flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Pending Actions
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 border-l-4 border-rose-500 text-sm">
                <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{pendingVerification} Nominees Pending Verification</p>
                  <button onClick={() => navigate('/awards/nominees')} className="text-rose-600 hover:text-rose-700 font-medium text-xs mt-1 underline">Review now</button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border-l-4 border-amber-500 text-sm">
                <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{shortlistedNoCeremony} Shortlisted awaiting Ceremony</p>
                  <button onClick={() => navigate('/awards/ceremony')} className="text-amber-600 hover:text-amber-700 font-medium text-xs mt-1 underline">Schedule ceremony</button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border-l-4 border-emerald-500 text-sm">
                <CalendarDays className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Upcoming Events (30 days)</p>
                  {upcomingEvents.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {upcomingEvents.map(e => (
                        <li key={e.id} className="text-xs text-emerald-700 flex items-center justify-between">
                          <span className="truncate w-32">{e.name}</span>
                          <span className="font-medium">{new Date(e.date).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700 mt-1">No events scheduled.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
