import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Card, Badge, Button } from'../components/ui';
import { useNavigate } from'react-router-dom';
import { motion } from'framer-motion';
import {
 Users,
 Smile,
 Heart,
 CalendarRange,
 Activity,
 Coins,
 Award,
 GraduationCap,
 Building2,
 UserCheck,
 ChevronRight,
 Sparkles,
 Clock,
 Upload,
 FileText,
 AlertTriangle,
 Info
} from'lucide-react';
import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 PieChart, Pie, Cell, BarChart, Bar
} from'recharts';
import { JOURNEY_STEPS } from'../components/common/RenuJourneyTracker';

export const Dashboard: React.FC = () => {
 const { role, isAdmin } = useRole();
 const navigate = useNavigate();

 // Load states from RenuStore
 const [children, setChildren] = useState(() => RenuStore.getChildren());
 const [camps, setCamps] = useState(() => RenuStore.getCamps());
 const [coordinators, setCoordinators] = useState(() => RenuStore.getCoordinators());
 const [centres, setCentres] = useState(() => RenuStore.getTherapyCentres());
 const [sponsorships, setSponsorships] = useState(() => RenuStore.getSponsorships());
 const [followups, setFollowups] = useState(() => RenuStore.getFollowUps());

 useEffect(() => {
 const handleStorageChange = () => {
 setChildren(RenuStore.getChildren());
 setCamps(RenuStore.getCamps());
 setCoordinators(RenuStore.getCoordinators());
 setCentres(RenuStore.getTherapyCentres());
 setSponsorships(RenuStore.getSponsorships());
 setFollowups(RenuStore.getFollowUps());
 };
 window.addEventListener('storage', handleStorageChange);
 window.addEventListener('renu_data_updated', handleStorageChange);
 window.addEventListener('renu_role_changed', handleStorageChange);
 
 return () => {
 window.removeEventListener('storage', handleStorageChange);
 window.removeEventListener('renu_data_updated', handleStorageChange);
 window.removeEventListener('renu_role_changed', handleStorageChange);
 };
 }, []);

 // Compute metrics
 const totalChildren = children.length;
 const normalChildren = children.filter(c => c.classification ==='Normal').length;
 const specialChildren = children.filter(c => c.classification ==='Special').length;
 const totalCamps = camps.length;
 const childrenScreened = camps.reduce((sum, c) => sum + c.registeredCount, 0);
 const activeSponsorships = sponsorships.filter(s => s.status ==='Active').length;
 const schoolReady = children.filter(c => c.journeyStatus ==='School Ready').length;
 const schoolAdmissions = children.filter(c => c.journeyStatus ==='School Admission').length;
 const totalCentres = centres.length;
 const totalCoordinators = coordinators.length;

 const kpis = [
 { title:'Total Children', value: totalChildren, icon: <Users className="h-5 w-5 text-red-600"/>, desc:'Registered in programme', iconBg:'bg-red-50', trend:'+12%', trendColor:'text-emerald-600'},
 { title:'Normal Children', value: normalChildren, icon: <Smile className="h-5 w-5 text-emerald-600"/>, desc:'Development Normal', iconBg:'bg-emerald-50', trend:'Stable', trendColor:'text-slate-500'},
 { title:'Special Children', value: specialChildren, icon: <Heart className="h-5 w-5 text-red-500"/>, desc:'Special needs identified', iconBg:'bg-red-50', trend:'+4%', trendColor:'text-red-500'},
 { title:'Total Camps', value: totalCamps, icon: <CalendarRange className="h-5 w-5 text-amber-600"/>, desc:'Medical screening camps', iconBg:'bg-amber-50', trend:'+8%', trendColor:'text-emerald-600'},
 { title:'Children Screened', value: childrenScreened, icon: <Activity className="h-5 w-5 text-sky-600"/>, desc:'Screened at camps to date', iconBg:'bg-sky-50', trend:'+15%', trendColor:'text-emerald-600'},
 { title:'Active Sponsorships', value: activeSponsorships, icon: <Coins className="h-5 w-5 text-teal-600"/>, desc:'Sponsored therapy/school', iconBg:'bg-teal-50', trend:'+5%', trendColor:'text-emerald-600', adminOnly: true },
 { title:'School Ready', value: schoolReady, icon: <Award className="h-5 w-5 text-purple-600"/>, desc:'Mainstream prepared', iconBg:'bg-purple-50', trend:'+20%', trendColor:'text-emerald-600'},
 { title:'School Admissions', value: schoolAdmissions, icon: <GraduationCap className="h-5 w-5 text-indigo-600"/>, desc:'Enrolled in normal schools', iconBg:'bg-indigo-50', trend:'+10%', trendColor:'text-emerald-600'},
 { title:'Partner Centres', value: totalCentres, icon: <Building2 className="h-5 w-5 text-red-600"/>, desc:'Enrolled therapy centers', iconBg:'bg-red-50', trend:'Stable', trendColor:'text-slate-500'},
 { title:'Coordinators', value: totalCoordinators, icon: <UserCheck className="h-5 w-5 text-orange-600"/>, desc:'Active field staff', iconBg:'bg-orange-50', trend:'Active', trendColor:'text-emerald-600', adminOnly: true },
 ];

 // Journey Counts
 const journeyCounts = JOURNEY_STEPS.map(step => ({
 step,
 count: children.filter(c => c.journeyStatus === step).length
 }));

 // Disability Distribution
 const disabilityCounts: Record<string, number> = {};
 children.forEach(c => {
 if (c.classification ==='Special'&& c.disabilityType) {
 disabilityCounts[c.disabilityType] = (disabilityCounts[c.disabilityType] || 0) + 1;
 }
 });

 const COLORS = ['#2563EB','#4F46E5','#14B8A6','#10B981','#0EA5E9','#EC4899','#F59E0B','#3B82F6'];
 const pieData = Object.keys(disabilityCounts).map((key, i) => ({
 name: key,
 value: disabilityCounts[key],
 color: COLORS[i % COLORS.length]
 }));

 // Severity Distribution
 const severityCounts: Record<string, number> = { Mild: 0, Moderate: 0, Severe: 0 };
 children.forEach(c => {
 if (c.classification ==='Special'&& c.severity) {
 severityCounts[c.severity] = (severityCounts[c.severity] || 0) + 1;
 }
 });
 const severityData = Object.keys(severityCounts).map(key => ({
 name: key,
 Count: severityCounts[key as keyof typeof severityCounts]
 }));

 // Screened by Area
 const areaChartData = camps.slice(-6).map(c => ({
 name: c.area,
 Registered: c.registeredCount,
 Special: c.specialCount,
 }));

 // Lists
 const recentChildren = [...children]
 .sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime())
 .slice(0, 5);

 const pendingFollowups = followups
 .filter(f => f.status ==='Pending')
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
 .slice(0, 4);

 const lowStockItems = RenuStore.getInventory()
 .filter(item => item.remainingQty < 10)
 .slice(0, 3);

 // Chart Styles
 const gridColor ='#F1F5F9';
 const labelColor ='#94A3B8';
 const tooltipBg ='#FFFFFF';
 const tooltipBorder ='#E2E8F0';

 return (
 <div className="space-y-8 w-full max-w-none pb-12 text-slate-700">
 {/* Hero Welcome Section & Welcome Banner */}
 <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-red-50/40 to-indigo-50/50 p-6 md:p-8 text-slate-800 border border-slate-200/80 shadow-md">
 <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"/>
 <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"/>

 <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
 <div className="space-y-3">
 <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-100">
 <Sparkles className="h-3.5 w-3.5 animate-pulse"/> Welcome, {role ==='Admin'?'Dr. Satish Gupta':'Rohan Kulkarni'}
 </div>
 <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 leading-tight">
 RENU Programme Management
 </h1>
 <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
 Vishalwin Foundation's primary operational portal. Track medical screenings, schedule pediatric assessments, and manage therapy-to-school graduation.
 </p>
 </div>
 
 {/* Today's Stats snippet inside Hero */}
 <div className="flex flex-wrap gap-4 sm:gap-6 bg-white/80 p-4 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-xs">
 <div className="text-center px-2">
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Caseload</span>
 <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalChildren} kids</span>
 </div>
 <div className="h-8 w-[1px] bg-slate-200 self-center"/>
 <div className="text-center px-2">
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Camps</span>
 <span className="text-xl font-extrabold text-teal-600 mt-1 block">{totalCamps}</span>
 </div>
 <div className="h-8 w-[1px] bg-slate-200 self-center"/>
 <div className="text-center px-2">
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Graduated</span>
 <span className="text-xl font-extrabold text-indigo-600 mt-1 block">{schoolAdmissions + schoolReady}</span>
 </div>
 </div>
 </div>
 </div>
<Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
  <div className="px-6 py-5 border-b border-slate-100">
    <h3 className="text-lg font-bold text-slate-800">
      Quick Actions
    </h3>
    <p className="text-sm text-slate-500 mt-1">
      Frequently used operational shortcuts
    </p>
  </div>

  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

    {/* Register Child */}
    <button
      onClick={() => navigate('/children?register=true')}
      className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-lg transition-all duration-300"
    >
      <Users className="absolute right-2 bottom-2 h-16 w-16 text-red-100" />

      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Users className="h-6 w-6" />
        </div>

        <h4 className="font-bold text-slate-800 text-sm">
          Register Child
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          Add a new beneficiary
        </p>
      </div>
    </button>

    {/* Create Camp */}
    <button
      onClick={() => {
        if (role === 'Coordinator') {
          showToast('Access Denied','danger','Admin privileges are required.');
          return;
        }
        navigate('/camps?add=true');
      }}
      className={`group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-lg transition-all duration-300 ${
        role === 'Coordinator'
          ? 'opacity-60 cursor-not-allowed'
          : ''
      }`}
    >
      <CalendarRange className="absolute right-2 bottom-2 h-16 w-16 text-red-100" />

      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <CalendarRange className="h-6 w-6" />
        </div>

        <h4 className="font-bold text-slate-800 text-sm">
          Create Camp
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          Schedule a medical camp
        </p>
      </div>
    </button>

    {/* Follow Up */}
    <button
      onClick={() => navigate('/children')}
      className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-lg transition-all duration-300"
    >
      <Clock className="absolute right-2 bottom-2 h-16 w-16 text-red-100" />

      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Clock className="h-6 w-6" />
        </div>

        <h4 className="font-bold text-slate-800 text-sm">
          Add Follow-Up
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          Track patient progress
        </p>
      </div>
    </button>

    {/* Upload Report */}
    <button
      onClick={() => navigate('/diagnosis')}
      className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-lg transition-all duration-300"
    >
      <Upload className="absolute right-2 bottom-2 h-16 w-16 text-red-100" />

      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Upload className="h-6 w-6" />
        </div>

        <h4 className="font-bold text-slate-800 text-sm">
          Upload Report
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          Add diagnosis records
        </p>
      </div>
    </button>

    {/* Sponsorships */}
    <button
      onClick={() => {
        if (role === 'Coordinator') {
          showToast('Access Denied','danger','Admin privileges are required.');
          return;
        }
        navigate('/sponsorships');
      }}
      className={`group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-lg transition-all duration-300 ${
        role === 'Coordinator'
          ? 'opacity-60 cursor-not-allowed'
          : ''
      }`}
    >
      <Coins className="absolute right-2 bottom-2 h-16 w-16 text-red-100" />

      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Coins className="h-6 w-6" />
        </div>

        <h4 className="font-bold text-slate-800 text-sm">
          Sponsorships
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          Manage donor funding
        </p>
      </div>
    </button>

    {/* Parent Report */}
    <button
      onClick={() => navigate('/reports')}
      className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-lg transition-all duration-300"
    >
      <FileText className="absolute right-2 bottom-2 h-16 w-16 text-red-100" />

      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <FileText className="h-6 w-6" />
        </div>

        <h4 className="font-bold text-slate-800 text-sm">
          Parent Report
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          Generate reports
        </p>
      </div>
    </button>

  </div>
</Card>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
  {kpis.map((kpi, idx) => {
    if (kpi.adminOnly && role === "Coordinator") return null;

    return (
      <div key={idx} className="group">
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

          {/* Colored Watermark Icon */}
<div className="absolute right-3 bottom-3 opacity-[0.12] pointer-events-none text-red-600">
  <div className="scale-[14]">
    {kpi.icon}
  </div>
</div>

          <div className="relative p-5">

            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                {kpi.title}
              </span>

              <div
                className={`p-3 rounded-xl ${kpi.iconBg} shadow-sm`}
              >
                {kpi.icon}
              </div>
            </div>

            {/* KPI Value */}
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {kpi.value}
              </h3>

              <span
                className={`text-xs font-bold ${kpi.trendColor}`}
              >
                {kpi.trend}
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-slate-500">
              {kpi.desc}
            </p>

            {/* Bottom Accent */}
            <div className="mt-5 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-red-500"></div>
            </div>

          </div>
        </Card>
      </div>
    );
  })}
</div>

 {/* CORE FEATURE: RENU Child Journey Stepper Funnel */}
 <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
 <div className="flex justify-between items-start mb-6">
 <div>
 <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
 <Sparkles className="h-5 w-5 text-red-600"/> RENU Child Journey Tracker
 </h3>
 <p className="text-xs text-slate-400 mt-0.5">Active beneficiary distribution funnel across the complete 11-step rehabilitation process.</p>
 </div>
 <Badge color="primary"className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">NGO Funnel</Badge>
 </div>

 {/* Funnel visualization nodes */}
 <div className="overflow-x-auto pb-2 scrollbar-thin select-none">
 <div className="flex items-center justify-between min-w-[1000px] py-2 px-1">
 {journeyCounts.map((node, idx) => (
 <React.Fragment key={node.step}>
 {idx > 0 && (
 <div className="h-0.5 flex-1 bg-slate-200 border-dashed border-t mx-1"/>
 )}
 <motion.div 
 whileHover={{ scale: 1.05 }}
 onClick={() => navigate(`/children?status=${encodeURIComponent(node.step)}`)}
 className="flex flex-col items-center cursor-pointer group text-center"
 style={{ width:'85px'}}
 >
 <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex flex-col items-center justify-center text-red-600 font-extrabold text-sm shadow-inner group-hover:bg-red-600 group-hover:text-white group-hover:border-transparent transition-all duration-200">
 <span>{node.count}</span>
 </div>
 <span className="text-[9px] font-bold text-slate-600 mt-2 block truncate max-w-[80px]"title={node.step}>
 {node.step}
 </span>
 <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Step {idx + 1}</span>
 </motion.div>
 </React.Fragment>
 ))}
 </div>
 </div>
 </Card>

 {/* Classification Distribution Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Disability distribution pie chart */}
 <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-900 font-display">Disability type Distribution</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Disorder breakdown of identified special-needs children.</p>
 </div>
 
 <div className="h-44 w-full flex items-center justify-center my-4">
 {pieData.length === 0 ? (
 <span className="text-slate-400 italic">No Special Needs registered.</span>
 ) : (
 <ResponsiveContainer width="100%"height="100%">
 <PieChart>
 <Pie
 data={pieData}
 cx="50%"
 cy="50%"
 innerRadius={45}
 outerRadius={65}
 paddingAngle={3}
 dataKey="value"
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip 
 contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius:'12px'}}
 itemStyle={{ color:'#0F172A', fontSize:'11px', fontWeight:'600'}}
 />
 </PieChart>
 </ResponsiveContainer>
 )}
 </div>

 <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
 {pieData.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center text-[10px]">
 <div className="flex items-center gap-1.5 min-w-0">
 <span className="h-2.5 w-2.5 rounded-full flex-shrink-0"style={{ backgroundColor: item.color }} />
 <span className="text-slate-600 font-semibold truncate">{item.name}</span>
 </div>
 <span className="font-bold text-slate-800 flex-shrink-0">{item.value} children</span>
 </div>
 ))}
 </div>
 </Card>

 {/* Severity distribution bar chart */}
 <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-900 font-display">Severity level Distribution</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Mild, Moderate, and Severe caseload classification.</p>
 </div>

 <div className="h-44 w-full my-4">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={severityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={gridColor} />
 <XAxis dataKey="name"stroke={labelColor} fontSize={9} />
 <YAxis stroke={labelColor} fontSize={9} />
 <Tooltip 
 contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius:'12px'}}
 itemStyle={{ color:'#0F172A', fontSize:'11px', fontWeight:'600'}}
 />
 <Bar dataKey="Count"fill="#4F46E5"radius={[4, 4, 0, 0]}>
 {severityData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={index === 0 ?'#10B981': index === 1 ?'#F59E0B':'#EF4444'} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>

 <div className="space-y-1.5 border-t border-slate-100 pt-3">
 {severityData.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center text-[10px]">
 <span className="text-slate-600 font-semibold">{item.name} Severity Cases</span>
 <span className="font-bold text-slate-800">{item.Count} children</span>
 </div>
 ))}
 </div>
 </Card>

 {/* Geographical reach area chart */}
 <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-900 font-display">Screenings by Area</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Tally of Screened vs. Identified Special children in recent camps.</p>
 </div>

 <div className="h-44 w-full my-4">
 <ResponsiveContainer width="100%"height="100%">
 <AreaChart data={areaChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRegistered"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%"stopColor="#2563EB"stopOpacity={0.2}/>
 <stop offset="95%"stopColor="#2563EB"stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorSpecial"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%"stopColor="#EF4444"stopOpacity={0.2}/>
 <stop offset="95%"stopColor="#EF4444"stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={gridColor} />
 <XAxis dataKey="name"stroke={labelColor} fontSize={8} />
 <YAxis stroke={labelColor} fontSize={8} />
 <Tooltip 
 contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius:'12px'}}
 itemStyle={{ color:'#0F172A', fontSize:'11px', fontWeight:'600'}}
 />
 <Area type="monotone"dataKey="Registered"stroke="#2563EB"fillOpacity={1} fill="url(#colorRegistered)"strokeWidth={2} />
 <Area type="monotone"dataKey="Special"stroke="#EF4444"fillOpacity={1} fill="url(#colorSpecial)"strokeWidth={2} />
 </AreaChart>
 </ResponsiveContainer>
 </div>

 <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
 <span>Live Sync: Active Camps</span>
 <span className="font-bold text-teal-600">Total: {childrenScreened} Screened</span>
 </div>
 </Card>
 </div>

 {/* Grid of lists */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Recent Enrollments */}
 <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl text-xs">
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-slate-900 font-display">Recent Registrations</h3>
 <button onClick={() => navigate('/children')} className="text-red-600 hover:underline flex items-center font-bold cursor-pointer">
 View all <ChevronRight className="h-3.5 w-3.5"/>
 </button>
 </div>
 <div className="space-y-3.5">
 {recentChildren.map((c) => (
 <div key={c.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
 <div className="flex items-center gap-2.5">
 <div className="h-8.5 w-8.5 rounded-full bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-[10px] border border-red-100">
 {c.name.split('').slice(0, 2).map(n => n[0]).join('')}
 </div>
 <div>
 <h4 className="font-bold text-slate-800 truncate max-w-[120px]">{c.name}</h4>
 <p className="text-[9px] text-slate-400 mt-0.5">{c.area}</p>
 </div>
 </div>
 <div className="text-right">
 <Badge color={c.classification ==='Special'?'danger':'success'} className="scale-90 font-bold px-1.5 py-0">
 {c.classification}
 </Badge>
 <span className="text-[9px] text-slate-400 mt-1 block">Stage: {c.journeyStatus.split('')[0]}</span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Upcoming Visits */}
 <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl text-xs">
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-slate-900 font-display">Follow-Up Reminders</h3>
 <button onClick={() => navigate('/follow-ups')} className="text-red-600 hover:underline flex items-center font-bold cursor-pointer">
 Timeline <ChevronRight className="h-3.5 w-3.5"/>
 </button>
 </div>
 <div className="space-y-3.5">
 {pendingFollowups.length === 0 ? (
 <p className="text-slate-400 italic text-center py-6">All visits logged!</p>
 ) : (
 pendingFollowups.map((f) => (
 <div key={f.id} className="flex gap-2.5 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
 <div className="p-1.5 bg-red-50 text-red-600 rounded-xl h-7.5 w-7.5 flex items-center justify-center mt-0.5 border border-red-100">
 <Clock className="h-4 w-4"/>
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-bold text-slate-800 truncate">{f.childName}</h4>
 <p className="text-[9px] text-slate-500 truncate mt-0.5">Task: {f.notes}</p>
 <span className="text-[8px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md mt-1.5 inline-block border border-red-100">
 Due: {f.date}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </Card>

 {/* Action Center & Notification Widget */}
 <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl text-xs flex flex-col justify-between">
 <div>
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-slate-900 font-display">Action Center</h3>
 <Badge color="warning"className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">Alerts</Badge>
 </div>
 
 <div className="space-y-2.5">
 {isAdmin && lowStockItems.map((item) => (
 <div key={item.id} className="p-2.5 border border-red-200 bg-red-50/50 rounded-xl flex items-start gap-2">
 <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5 animate-pulse"/>
 <div className="min-w-0">
 <h4 className="font-bold text-slate-800 text-[11px] truncate">Low Stock Alert</h4>
 <p className="text-[9px] text-slate-500 leading-tight">Only {item.availableQty} units left of {item.name}. Allocated to {item.allocatedCampName}.</p>
 </div>
 </div>
 ))}
 
 <div className="p-3 bg-teal-50/30 border border-teal-100 rounded-xl flex items-start gap-2">
 <Info className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5"/>
 <div>
 <h4 className="font-bold text-slate-800 text-[11px]">RENU Clinical Auditing</h4>
 <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
 Remember to upload disability certificates and therapy recommendations in the **Diagnosis** tab of the child profile.
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 mt-4">
 Vishalwin Foundation • RENU Management System v1.2.0
 </div>
 </Card>
 </div>
 </div>
 );
};
export default Dashboard;
