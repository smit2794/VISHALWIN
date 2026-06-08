import React, { useState, useEffect } from 'react';
import { RenuStore } from '../data/mockData';
import { Card, Badge, Tabs } from '../components/ui';
import { RenuJourneyTracker, JOURNEY_STEPS } from '../components/common/RenuJourneyTracker';
import { TrendingUp, Award, Calendar, Coins, Users, Sparkles, Activity, Clock, GraduationCap, Heart, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// Reusable mini chart card
const ChartCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  value: string;
  trend: string;
  trendColor: string;
  borderColor: string;
  children: React.ReactNode;
  delay?: number;
}> = ({ title, subtitle, icon, value, trend, trendColor, borderColor, children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className={`p-5 bg-white border border-slate-200 shadow-sm rounded-2xl border-t-4 ${borderColor}`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
              {icon}
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-display truncate">{title}</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <span className="text-lg font-extrabold text-slate-900 block">{value}</span>
          <span className={`text-[9px] font-bold ${trendColor}`}>{trend}</span>
        </div>
      </div>
      <div className="h-52 w-full mt-3">
        {children}
      </div>
    </Card>
  </motion.div>
);

const tooltipStyle = {
  contentStyle: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px' },
  itemStyle: { color: '#0F172A', fontSize: '11px', fontWeight: '600' as const },
};
const gridColor = '#F1F5F9';
const labelColor = '#94A3B8';

export const Analytics: React.FC = () => {
  const [activeRange, setActiveRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [children, setChildren] = useState(() => RenuStore.getChildren());
  const [camps, setCamps] = useState(() => RenuStore.getCamps());
  const [followups, setFollowups] = useState(() => RenuStore.getFollowUps());
  const [centres, setCentres] = useState(() => RenuStore.getTherapyCentres());
  const [sponsorships, setSponsorships] = useState(() => RenuStore.getSponsorships());

  useEffect(() => {
    const handleUpdate = () => {
      setChildren(RenuStore.getChildren());
      setCamps(RenuStore.getCamps());
      setFollowups(RenuStore.getFollowUps());
      setCentres(RenuStore.getTherapyCentres());
      setSponsorships(RenuStore.getSponsorships());
    };
    window.addEventListener('renu_data_updated', handleUpdate);
    return () => window.removeEventListener('renu_data_updated', handleUpdate);
  }, []);

  // Disability Type Breakdown for Pie Chart
  const disabilityCounts: Record<string, number> = {};
  children.forEach(c => {
    if (c.classification === 'Special' && c.disabilityType) {
      disabilityCounts[c.disabilityType] = (disabilityCounts[c.disabilityType] || 0) + 1;
    }
  });
  const PIE_COLORS = ['#2563EB', '#4F46E5', '#14B8A6', '#10B981', '#0EA5E9', '#EC4899', '#F59E0B', '#3B82F6'];
  const pieData = Object.keys(disabilityCounts).map((key, i) => ({
    name: key,
    value: disabilityCounts[key],
    color: PIE_COLORS[i % PIE_COLORS.length]
  }));

  // ============================
  // WEEKLY DATA
  // ============================
  const weeklyCampsData = [
    { name: 'Week 1', Camps: 1 },
    { name: 'Week 2', Camps: 2 },
    { name: 'Week 3', Camps: 1 },
    { name: 'Week 4', Camps: 3 },
  ];
  const weeklyRegistrationsData = [
    { name: 'Week 1', Registered: 10 },
    { name: 'Week 2', Registered: 15 },
    { name: 'Week 3', Registered: 12 },
    { name: 'Week 4', Registered: 22 },
  ];
  const weeklySpecialData = [
    { name: 'Week 1', Special: 6 },
    { name: 'Week 2', Special: 10 },
    { name: 'Week 3', Special: 8 },
    { name: 'Week 4', Special: 15 },
  ];
  const weeklyFollowUpsData = [
    { name: 'Week 1', Completed: 10, Pending: 4 },
    { name: 'Week 2', Completed: 18, Pending: 4 },
    { name: 'Week 3', Completed: 14, Pending: 4 },
    { name: 'Week 4', Completed: 24, Pending: 6 },
  ];

  const totalWeeklyCamps = weeklyCampsData.reduce((s, d) => s + d.Camps, 0);
  const totalWeeklyRegs = children.length;
  const totalWeeklySpecial = children.filter(c => c.classification === 'Special').length;
  const totalWeeklyFups = followups.filter(f => f.status === 'Completed').length;

  // ============================
  // MONTHLY DATA
  // ============================
  const monthlyCampsData = [
    { name: 'Jan', Camps: 2 }, { name: 'Feb', Camps: 3 }, { name: 'Mar', Camps: 2 },
    { name: 'Apr', Camps: 4 }, { name: 'May', Camps: 3 }, { name: 'Jun', Camps: 5 },
  ];
  const monthlyScreeningsData = [
    { name: 'Jan', Screened: 35 }, { name: 'Feb', Screened: 45 }, { name: 'Mar', Screened: 38 },
    { name: 'Apr', Screened: 60 }, { name: 'May', Screened: 50 }, { name: 'Jun', Screened: 85 },
  ];
  const monthlyEnrollmentsData = [
    { name: 'Jan', Enrollments: 8 }, { name: 'Feb', Enrollments: 12 }, { name: 'Mar', Enrollments: 10 },
    { name: 'Apr', Enrollments: 15 }, { name: 'May', Enrollments: 14 }, { name: 'Jun', Enrollments: 22 },
  ];
  const monthlyTherapiesData = [
    { name: 'Jan', Active: 25 }, { name: 'Feb', Active: 28 }, { name: 'Mar', Active: 30 },
    { name: 'Apr', Active: 35 }, { name: 'May', Active: 38 }, { name: 'Jun', Active: 46 },
  ];

  const totalMonthlyCamps = camps.length;
  const totalMonthlyScreened = camps.reduce((s, c) => s + c.registeredCount, 0);
  const totalMonthlyEnrollments = children.filter(c => c.journeyStatus === 'Therapy Centre Enrollment' || c.journeyStatus === 'Active Therapy').length;
  const totalMonthlyTherapies = children.filter(c => c.journeyStatus === 'Active Therapy').length;

  // ============================
  // YEARLY DATA
  // ============================
  const yearlyReachedData = [
    { name: '2024', Reached: 120 }, { name: '2025', Reached: 260 }, { name: '2026', Reached: 450 },
  ];
  const yearlySpecialData = [
    { name: '2024', Special: 70 }, { name: '2025', Special: 160 }, { name: '2026', Special: 280 },
  ];
  const yearlySponsorshipData = [
    { name: '2024', Amount: 3.2 }, { name: '2025', Amount: 6.5 }, { name: '2026', Amount: 9.8 },
  ];
  const yearlyAdmissionsData = [
    { name: '2024', Admissions: 35 }, { name: '2025', Admissions: 75 }, { name: '2026', Admissions: 140 },
  ];

  const totalYearlyReached = camps.reduce((s, c) => s + c.registeredCount, 0) + 517;
  const totalYearlySpecial = children.filter(c => c.classification === 'Special').length + 471;
  const totalSponsorshipAmt = sponsorships.reduce((s, sp) => s + (sp.status === 'Active' ? sp.amount : 0), 0);
  const formattedSponsorship = totalSponsorshipAmt > 0 ? `₹${(totalSponsorshipAmt / 100000).toFixed(1)}L` : '₹9.8L';
  const totalYearlyAdmissions = children.filter(c => c.journeyStatus === 'School Admission').length + 236;

  return (
    <div className="space-y-6 w-full max-w-none pb-12 text-slate-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">Analytics Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Deep-dive graphs illustrating medical screenings, therapy logs, and mainstream school admission rates.</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'weekly', label: 'Weekly Operational Trends' },
          { id: 'monthly', label: 'Monthly Growth Metrics' },
          { id: 'yearly', label: 'Yearly Impact Summary' },
        ]}
        activeTab={activeRange}
        onChange={setActiveRange as any}
      />

      {/* ============================================ */}
      {/* WEEKLY ANALYTICS - 4 Individual Chart Cards */}
      {/* ============================================ */}
      {activeRange === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Camps Conducted */}
          <ChartCard
            title="Camps Conducted"
            subtitle="Number of medical screening camps organized each week."
            icon={<Calendar className="h-5 w-5 text-teal-600" />}
            value={`${totalWeeklyCamps} camps`}
            trend="Target achieved"
            trendColor="text-emerald-600"
            borderColor="border-t-teal-500"
            delay={0}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCampsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="Camps" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. Children Registered */}
          <ChartCard
            title="Children Registered"
            subtitle="Total new children registered per week from screening camps."
            icon={<Users className="h-5 w-5 text-red-600" />}
            value={`${totalWeeklyRegs} kids`}
            trend="+14% vs prev month"
            trendColor="text-emerald-600"
            borderColor="border-t-blue-500"
            delay={0.05}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRegistrationsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="Registered" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. Special Children Identified */}
          <ChartCard
            title="Special Children Identified"
            subtitle="Children identified with special needs requiring pediatric intervention."
            icon={<Activity className="h-5 w-5 text-red-500" />}
            value={`${totalWeeklySpecial} children`}
            trend="Requires pediatric review"
            trendColor="text-amber-500"
            borderColor="border-t-red-500"
            delay={0.1}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySpecialData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="Special" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4. Follow-Ups Completed */}
          <ChartCard
            title="Follow-Ups Completed"
            subtitle="Home visits and parent counseling follow-ups completed vs pending."
            icon={<Clock className="h-5 w-5 text-indigo-600" />}
            value={`${totalWeeklyFups} visits`}
            trend="95% completion rate"
            trendColor="text-emerald-600"
            borderColor="border-t-indigo-500"
            delay={0.15}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyFollowUpsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="Completed" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ============================================ */}
      {/* MONTHLY ANALYTICS - 4 Individual Chart Cards */}
      {/* ============================================ */}
      {activeRange === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Total Camps */}
          <ChartCard
            title="Total Camps"
            subtitle="Monthly screening camps conducted across all operational regions."
            icon={<Calendar className="h-5 w-5 text-teal-600" />}
            value={`${totalMonthlyCamps} camps`}
            trend="All regions active"
            trendColor="text-emerald-600"
            borderColor="border-t-teal-500"
            delay={0}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCampsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="Camps" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. Total Children Screened */}
          <ChartCard
            title="Total Children Screened"
            subtitle="Cumulative children screened at all medical camps per month."
            icon={<Activity className="h-5 w-5 text-red-600" />}
            value={`${totalMonthlyScreened} screened`}
            trend="+18% growth"
            trendColor="text-emerald-600"
            borderColor="border-t-blue-500"
            delay={0.05}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyScreeningsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradScreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="Screened" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradScreen)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. Centre Enrollments */}
          <ChartCard
            title="Centre Enrollments"
            subtitle="Children enrolled in therapy centres for specialized intervention."
            icon={<Building2 className="h-5 w-5 text-purple-600" />}
            value={`${totalMonthlyEnrollments} enrolled`}
            trend="Capacity at 88%"
            trendColor="text-amber-500"
            borderColor="border-t-purple-500"
            delay={0.1}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEnrollmentsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="Enrollments" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4. Active Therapies */}
          <ChartCard
            title="Active Therapies"
            subtitle="Children actively receiving therapy sessions each month."
            icon={<Heart className="h-5 w-5 text-emerald-600" />}
            value={`${totalMonthlyTherapies} active`}
            trend="Sponsorship supported"
            trendColor="text-emerald-600"
            borderColor="border-t-emerald-500"
            delay={0.15}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTherapiesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTherapy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="Active" stroke="#10B981" strokeWidth={2.5} fill="url(#gradTherapy)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ============================================ */}
      {/* YEARLY ANALYTICS - 4 Individual Chart Cards  */}
      {/* ============================================ */}
      {activeRange === 'yearly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Total Children Reached */}
          <ChartCard
            title="Total Children Reached"
            subtitle="Year-on-year cumulative children reached through RENU programme outreach."
            icon={<Users className="h-5 w-5 text-red-600" />}
            value={`${totalYearlyReached} reached`}
            trend="+75% YoY expansion"
            trendColor="text-emerald-600"
            borderColor="border-t-blue-500"
            delay={0}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyReachedData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="Reached" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. Total Special Children */}
          <ChartCard
            title="Total Special Children"
            subtitle="Cumulative special-needs children identified and enrolled across all years."
            icon={<Award className="h-5 w-5 text-teal-600" />}
            value={`${totalYearlySpecial} children`}
            trend="10 Partner Centres"
            trendColor="text-slate-500"
            borderColor="border-t-teal-500"
            delay={0.05}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlySpecialData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="Special" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. Sponsorship Amount Utilized */}
          <ChartCard
            title="Sponsorship Amount Utilized"
            subtitle="Total CSR funding utilized annually for therapy and school sponsorships."
            icon={<Coins className="h-5 w-5 text-emerald-600" />}
            value={formattedSponsorship}
            trend="82% efficiency rating"
            trendColor="text-emerald-600"
            borderColor="border-t-emerald-500"
            delay={0.1}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlySponsorshipData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSponsor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} unit="L" />
                <Tooltip
  {...tooltipStyle}
  formatter={(val) => [`₹${val ?? 0}L`, 'Amount']}
/>
                <Area type="monotone" dataKey="Amount" stroke="#10B981" strokeWidth={2.5} fill="url(#gradSponsor)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4. Total School Admissions */}
          <ChartCard
            title="Total School Admissions"
            subtitle="Children successfully mainstreamed into regular school system per year."
            icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}
            value={`${totalYearlyAdmissions} admissions`}
            trend="73% success rate"
            trendColor="text-emerald-600"
            borderColor="border-t-indigo-500"
            delay={0.15}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyAdmissionsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={9} />
                <YAxis stroke={labelColor} fontSize={9} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="Admissions" stroke="#4F46E5" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Progress Benchmarks (Progress Indicators) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-5 border-l-4 border-l-indigo-500 bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider">School Admission Rate</span>
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">73%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2.5 border border-slate-200/50">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '73%' }} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">110 of 150 target children enrolled in mainstream primary schools</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 border-l-4 border-l-emerald-500 bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Sponsorship Utilization</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/50">90%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2.5 border border-slate-200/50">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '90%' }} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">₹4.5L utilized out of ₹5.0L available CSR funding</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 border-l-4 border-l-amber-500 bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Camp Outreach Goal</span>
              <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100/50">83%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2.5 border border-slate-200/50">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '83%' }} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">20 of 24 planned screening camps completed this fiscal year</p>
          </Card>
        </motion.div>
      </div>

      {/* Journey Tracker & Completion Metrics */}
      <Card className="p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Sparkles className="h-5 w-5 text-red-600" /> RENU Child Journey Progress & Completion Metrics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Overall operational funnel and progress tracker representing completion milestones.</p>
          </div>
          <Badge className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5">Journey Summary</Badge>
        </div>
        <RenuJourneyTracker
          currentStatus="School Admission"
          classification="Special"
          readOnly={true}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3.5 mt-6 border-t border-slate-100 pt-5 text-[10px]">
          {JOURNEY_STEPS.map((step) => {
            const count = children.filter(c => c.journeyStatus === step).length;
            return (
              <div key={step} className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl text-center">
                <span className="font-extrabold text-red-600 block text-xs">{count}</span>
                <span className="text-slate-500 font-bold block mt-1 truncate" title={step}>{step}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Disability Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <Card className="lg:col-span-1 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Special Needs Classification</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Breakdown of registered special children by developmental disorder classification.</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center my-4">
            {pieData.length === 0 ? (
              <span className="text-slate-400 italic">No Special Needs records generated.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-1.5 border-t border-slate-100 pt-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-bold truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 flex-shrink-0">{item.value} kids</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Severity Distribution */}
        <Card className="lg:col-span-2 p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <h3 className="text-sm font-bold text-slate-900 font-display mb-1">Overall Programme Impact Summary</h3>
          <p className="text-[10px] text-slate-400 mb-4">Key performance benchmarks across the RENU programme lifecycle.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Registered', value: children.length, color: 'text-red-600', bg: 'bg-red-50', icon: <Users className="h-4 w-4" /> },
              { label: 'Normal Children', value: children.filter(c => c.classification === 'Normal').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Activity className="h-4 w-4" /> },
              { label: 'Special Children', value: children.filter(c => c.classification === 'Special').length, color: 'text-red-500', bg: 'bg-red-50', icon: <Heart className="h-4 w-4" /> },
              { label: 'School Ready', value: children.filter(c => c.journeyStatus === 'School Ready' || c.journeyStatus === 'School Admission').length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <GraduationCap className="h-4 w-4" /> },
              { label: 'Active Follow-Ups', value: followups.filter(f => f.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock className="h-4 w-4" /> },
              { label: 'Active Sponsors', value: sponsorships.filter(s => s.status === 'Active').length, color: 'text-teal-600', bg: 'bg-teal-50', icon: <Coins className="h-4 w-4" /> },
              { label: 'Therapy Centres', value: centres.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: <Building2 className="h-4 w-4" /> },
              { label: 'Total Camps', value: camps.length, color: 'text-sky-600', bg: 'bg-sky-50', icon: <Calendar className="h-4 w-4" /> },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-center">
                <div className={`inline-flex p-2 rounded-lg ${stat.bg} ${stat.color} mb-2`}>
                  {stat.icon}
                </div>
                <span className={`font-extrabold text-xl block ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};
export default Analytics;
