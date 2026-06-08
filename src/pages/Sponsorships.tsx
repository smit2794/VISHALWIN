import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { Sponsorship } from'../types';
import { Card, Badge, Label } from'../components/ui';
import { Coins, HeartHandshake, Calendar, CreditCard, User, Sparkles, Plus, AlertCircle } from'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from'recharts';
import { useNavigate } from'react-router-dom';

export const Sponsorships: React.FC = () => {
 const navigate = useNavigate();
 const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);

 // Theme state for Recharts
 const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
 
 useEffect(() => {
 const handleThemeChange = () => {
 setIsDark(document.documentElement.classList.contains('dark'));
 };
 window.addEventListener('renu_theme_changed', handleThemeChange);
 return () => window.removeEventListener('renu_theme_changed', handleThemeChange);
 }, []);

 useEffect(() => {
 setSponsorships(RenuStore.getSponsorships());
 }, []);

 // 1. Sponsorship Metrics calculations
 const totalSponsorshipAmount = sponsorships.reduce((sum, s) => sum + s.amount, 0);
 const activeCount = sponsorships.filter(s => s.status ==='Active').length;
 const pendingCount = sponsorships.filter(s => s.status ==='Pending').length;
 const completedCount = sponsorships.filter(s => s.status ==='Completed').length;
 
 // Sponsored Children Count: distinct beneficiary child IDs
 const sponsoredChildrenCount = new Set(
 sponsorships.filter(s => s.childId).map(s => s.childId)
 ).size;

 const avgSponsorship = totalSponsorshipAmount / sponsorships.length || 0;
 const fundsUtilized = totalSponsorshipAmount * 0.82; // Mock utilization 82%
 const remainingFunds = totalSponsorshipAmount - fundsUtilized;

 // 2. Beneficiary Coverage categories (Therapy Fees, Education Support, Assessment Cost, Transportation Support)
 const coverageCounts: Record<string, number> = {
'Therapy Fees': 0,
'Education Support': 0,
'Assessment Cost': 0,
'Transportation Support': 0
 };

 sponsorships.forEach(s => {
 s.coverage.forEach(cov => {
 // Map helper in case spelling differs slightly
 const key = (cov as string) ==='Transportation'?'Transportation Support': cov;
 if (coverageCounts[key] !== undefined) {
 coverageCounts[key]++;
 }
 });
 });

 const barChartData = Object.keys(coverageCounts).map(key => ({
 name: key.replace('Support',''),
 Count: coverageCounts[key]
 }));

 // 3. Funding Utilization Chart Data (AreaChart representing quarterly growth of funds raised vs utilized)
 const utilizationChartData = [
 { Quarter:'Q1 2025', FundsRaised: totalSponsorshipAmount * 0.4, FundsUtilized: totalSponsorshipAmount * 0.3 },
 { Quarter:'Q2 2025', FundsRaised: totalSponsorshipAmount * 0.6, FundsUtilized: totalSponsorshipAmount * 0.45 },
 { Quarter:'Q3 2025', FundsRaised: totalSponsorshipAmount * 0.8, FundsUtilized: totalSponsorshipAmount * 0.65 },
 { Quarter:'Q4 2025', FundsRaised: totalSponsorshipAmount, FundsUtilized: fundsUtilized }
 ];

 return (
 <div className="space-y-6 pb-12">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Sponsorship Management</h1>
 <p className="text-xs text-slate-500 mt-1">Track CSR (Corporate Social Responsibility) grants, individual donor funds, and student scholarship utilization metrics.</p>
 </div>

 {/* Rebuilt KPI metrics cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 text-xs">
 <Card className="p-5 border-l-4 border-l-brand-cyan-705 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Total Sponsored Amount</span>
 <div className="p-1.5 bg-brand-cyan-50 text-brand-cyan-705 rounded-md">
 <Coins className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-900">₹{totalSponsorshipAmount.toLocaleString()}</h3>
 <p className="text-[10px] text-slate-400 mt-1">Total raised to date</p>
 </Card>

 <Card className="p-5 border-l-4 border-l-emerald-500 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Active Sponsorships</span>
 <div className="p-1.5 bg-green-50 text-emerald-600 rounded-md">
 <HeartHandshake className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-900">{activeCount} Active</h3>
 <p className="text-[10px] text-slate-455 mt-1">Ongoing monthly backing</p>
 </Card>

 <Card className="p-5 border-l-4 border-l-amber-500 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Pending & Completed</span>
 <div className="p-1.5 bg-amber-50 text-brand-warning rounded-md">
 <Calendar className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-900">{pendingCount} P / {completedCount} C</h3>
 <p className="text-[10px] text-slate-455 mt-1">Awaiting or expired sponsorships</p>
 </Card>

 <Card className="p-5 border-l-4 border-l-indigo-600 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Sponsored Children</span>
 <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md">
 <User className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-900">{sponsoredChildrenCount} Kids</h3>
 <p className="text-[10px] text-slate-400 mt-1">Beneficiary scholarships assigned</p>
 </Card>

 <Card className="p-5 border-l-4 border-l-teal-600 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Funding Utilization</span>
 <div className="p-1.5 bg-teal-50 text-teal-800 rounded-md">
 <CreditCard className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-900">82%</h3>
 <p className="text-[10px] text-slate-455 mt-1">₹{fundsUtilized.toLocaleString()} Utilized</p>
 </Card>
 </div>

 {/* Funding Utilization Charts & statistics */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
 
 {/* Funding utilization area chart */}
 <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-900 font-display">Funding Utilization Charts</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Timeline comparison of total CSR donor funds raised against actual scholarship disbursements.</p>
 </div>
 <div className="h-56 w-full my-4">
 <ResponsiveContainer width="100%"height="100%">
 <AreaChart data={utilizationChartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRaised"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%"stopColor="#0d9488"stopOpacity={0.25}/>
 <stop offset="95%"stopColor="#0d9488"stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorUtilized"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%"stopColor="#10b981"stopOpacity={0.25}/>
 <stop offset="95%"stopColor="#10b981"stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={isDark ?'#1e293b':'#f1f5f9'} />
 <XAxis dataKey="Quarter"stroke={isDark ?'#64748b':'#94a3b8'} fontSize={9} />
 <YAxis stroke={isDark ?'#64748b':'#94a3b8'} fontSize={9} />
 <Tooltip contentStyle={{ background: isDark ?'#0f172a':'#ffffff', borderColor: isDark ?'#1e293b':'#e2e8f0', color: isDark ?'#f1f5f9':'#0f172a'}} formatter={(value) =>`₹${Number(value).toLocaleString()}`} />
 <Area type="monotone"name="Total Funds Raised"dataKey="FundsRaised"stroke="#0d9488"fill="url(#colorRaised)"strokeWidth={2} />
 <Area type="monotone"name="Total Funds Utilized"dataKey="FundsUtilized"stroke="#10b981"fill="url(#colorUtilized)"strokeWidth={2} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </Card>

 {/* Coverage distribution bar chart */}
 <Card className="lg:col-span-1 p-5 flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-900 font-display">Sponsorship Coverage stats</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Tally of student coverage limits per funding category.</p>
 </div>
 <div className="h-44 w-full my-4">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={barChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={isDark ?'#1e293b':'#f1f5f9'} />
 <XAxis dataKey="name"stroke={isDark ?'#64748b':'#94a3b8'} fontSize={8} />
 <YAxis stroke={isDark ?'#64748b':'#94a3b8'} fontSize={8} />
 <Tooltip contentStyle={{ background: isDark ?'#0f172a':'#ffffff', borderColor: isDark ?'#1e293b':'#e2e8f0', color: isDark ?'#f1f5f9':'#0f172a'}} />
 <Bar dataKey="Count"fill="#0d9488"radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="space-y-1.5 border-t border-slate-200 pt-3">
 {barChartData.map((d, idx) => (
 <div key={idx} className="flex justify-between items-center text-[10px]">
 <span className="text-slate-600 font-medium">{d.name} Placements</span>
 <span className="font-bold text-slate-800">{d.Count} children</span>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Sponsor Ledger Table */}
 <Card className="p-5 text-xs">
 <div className="flex justify-between items-center mb-4">
 <div>
 <h3 className="font-bold text-slate-900 font-display">Sponsorship Contracts Ledger</h3>
 <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Active ledger matching CSR corporate sponsors, scholarship amounts, and children.</p>
 </div>
 </div>

 <div className="overflow-x-auto border border-slate-200 rounded-xl">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
 <th className="p-3">Sponsor Information</th>
 <th className="p-3">Beneficiary Child</th>
 <th className="p-3 text-right">Sponsorship Amount</th>
 <th className="p-3">Sponsorship Coverage</th>
 <th className="p-3 text-center">Contract Timeline</th>
 <th className="p-3 text-center">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 text-[11px] text-slate-700">
 {sponsorships.map((s) => (
 <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="p-3">
 <div className="font-bold text-slate-900">{s.sponsorName}</div>
 <div className="text-[9px] text-slate-400 mt-0.5">ID: {s.id}</div>
 </td>
 <td className="p-3">
 <span 
 onClick={() => navigate(`/children/${s.childId}`)}
 className="font-bold text-brand-cyan-700 hover:underline cursor-pointer"
 >
 {s.childName}
 </span>
 <div className="text-[9px] text-slate-400 mt-0.5">ID: {s.childId}</div>
 </td>
 <td className="p-3 text-right font-extrabold text-slate-900">
 ₹{s.amount.toLocaleString()}
 </td>
 <td className="p-3">
 <div className="flex flex-wrap gap-1 max-w-[200px]">
 {s.coverage.map((cov, idx) => (
 <span key={idx} className="bg-slate-100/80 border border-transparent px-1.5 py-0.5 rounded text-[9px] font-medium text-slate-600">
 {cov}
 </span>
 ))}
 </div>
 </td>
 <td className="p-3 text-center">
 <span className="font-medium text-slate-800">{s.startDate}</span>
 <span className="text-slate-405 block text-[9px] mt-0.5">to {s.endDate}</span>
 </td>
 <td className="p-3 text-center">
 <Badge color={s.status ==='Active'?'success': s.status ==='Pending'?'warning':'slate'} className="font-bold">
 {s.status}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 );
};
export default Sponsorships;
