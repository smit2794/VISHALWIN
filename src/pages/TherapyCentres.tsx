import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { TherapyCentre, Child, Diagnosis } from'../types';
import { Card, Badge, Button, Drawer, Label } from'../components/ui';
import { Building2, Phone, User, CheckCircle, MapPin, Sparkles, ChevronRight, Activity, TrendingUp, Award, Coins } from'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from'recharts';

export const TherapyCentres: React.FC = () => {
 // Theme state for Recharts
 const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
 
 useEffect(() => {
 const handleThemeChange = () => {
 setIsDark(document.documentElement.classList.contains('dark'));
 };
 window.addEventListener('renu_theme_changed', handleThemeChange);
 return () => window.removeEventListener('renu_theme_changed', handleThemeChange);
 }, []);

 // Data States
 const [centres, setCentres] = useState<TherapyCentre[]>([]);
 const [children, setChildren] = useState<Child[]>([]);
 const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

 // UI States
 const [selectedCentre, setSelectedCentre] = useState<TherapyCentre | null>(null);
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);

 useEffect(() => {
 loadData();
 }, []);

 const loadData = () => {
 setCentres(RenuStore.getTherapyCentres());
 setChildren(RenuStore.getChildren());
 setDiagnoses(RenuStore.getDiagnoses());
 };

 const getEnrolledChildren = (centreName: string) => {
 // A child is enrolled if their diagnosis centre matches, or their status is Centre Allocated/Active Therapy
 const childIdsAtCentre = new Set(
 diagnoses.filter(d => d.centreName === centreName).map(d => d.childId)
 );
 return children.filter(c => childIdsAtCentre.has(c.id));
 };

 // Active Enrollments Dashboard Metrics
 const totalClinics = centres.length;
 const specialChildren = children.filter(c => c.classification ==='Special');
 
 // Count of enrolled children in any therapy center
 const allDiagnosedCentreNames = new Set(diagnoses.map(d => d.centreName));
 const enrolledChildrenCount = children.filter(c => {
 const diag = diagnoses.find(d => d.childId === c.id);
 return diag && allDiagnosedCentreNames.has(diag.centreName);
 }).length;

 const sponsoredEnrolled = children.filter(c => {
 const hasSpons = RenuStore.getSponsorships().some(s => s.childId === c.id);
 const diag = diagnoses.find(d => d.childId === c.id);
 return hasSpons && diag && allDiagnosedCentreNames.has(diag.centreName);
 }).length;

 // Average progress score across all children in therapy
 const childrenWithProgress = children.filter(c => c.therapyProgressScore !== undefined);
 const avgProgressScore = childrenWithProgress.length > 0
 ? Math.round(childrenWithProgress.reduce((sum, c) => sum + (c.therapyProgressScore || 0), 0) / childrenWithProgress.length)
 : 0;

 // Chart data: Enrolled children per center
 const chartData = centres.map(tc => {
 const enrolled = getEnrolledChildren(tc.name);
 return {
 name: tc.name.replace('Rehabilitation Centre','Rehab').replace('Child Development Centre','CDC').replace('Neurodevelopmental Centre','Neuro').replace('Clinic','').replace('Academy',''),
 Enrolled: enrolled.length,
 Capacity: 15 // Mock capacity ceiling
 };
 });

 return (
 <div className="space-y-6 pb-12">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Therapy Centre Enrollment</h1>
 <p className="text-xs text-slate-500 mt-1">Manage partner clinic placements, check student development checklist scores, and review clinic utilization rates.</p>
 </div>

 {/* Enrollments KPI dashboard */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
 <Card className="p-4 border-l-4 border-l-teal-600 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Active Clinics</span>
 <div className="p-1.5 bg-brand-cyan-50 text-brand-cyan-705 rounded-md">
 <Building2 className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-800">{totalClinics} Centres</h3>
 <p className="text-[10px] text-slate-400 mt-1">Partners in therapy & counselling</p>
 </Card>

 <Card className="p-4 border-l-4 border-l-emerald-500 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Total Enrolled Children</span>
 <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
 <Activity className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-800">{enrolledChildrenCount} Children</h3>
 <p className="text-[10px] text-slate-400 mt-1">Undergoing training & therapy</p>
 </Card>

 <Card className="p-4 border-l-4 border-l-indigo-500 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Sponsored Placements</span>
 <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
 <Coins className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-800">{sponsoredEnrolled} Placements</h3>
 <p className="text-[10px] text-slate-400 mt-1">{Math.round(sponsoredEnrolled / enrolledChildrenCount * 100) || 0}% Funding coverage rate</p>
 </Card>

 <Card className="p-4 border-l-4 border-l-teal-600 bg-white/80">
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-slate-400 font-semibold uppercase">Average Therapy Progress</span>
 <div className="p-1.5 bg-teal-50 text-teal-800 rounded-md">
 <Award className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-xl font-extrabold text-slate-800">{avgProgressScore} %</h3>
 <p className="text-[10px] text-slate-400 mt-1">Average developmental milestone score</p>
 </Card>
 </div>

 {/* Visual Analytics */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
 
 {/* Children Per Centre Chart */}
 <Card className="lg:col-span-1 p-5 flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-900 font-display">Children Per Centre Stats</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Tally of enrolled children compared to nominal capacity limit (15) per clinic.</p>
 </div>
 <div className="h-48 w-full my-4">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={isDark ?'#1e293b':'#f1f5f9'} />
 <XAxis dataKey="name"stroke={isDark ?'#64748b':'#94a3b8'} fontSize={7} />
 <YAxis stroke={isDark ?'#64748b':'#94a3b8'} fontSize={7} />
 <Tooltip contentStyle={{ background: isDark ?'#0f172a':'#ffffff', borderColor: isDark ?'#1e293b':'#e2e8f0', color: isDark ?'#f1f5f9':'#0f172a'}} />
 <Bar dataKey="Enrolled"fill="#0d9488"radius={[3, 3, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
 <span>Utilization Target: 80%</span>
 <span className="font-semibold text-brand-cyan-700">Total Centres: {centres.length}</span>
 </div>
 </Card>

 {/* Utilization Table */}
 <Card className="lg:col-span-2 p-5">
 <div className="flex justify-between items-center mb-4">
 <div>
 <h3 className="text-sm font-bold text-slate-900 font-display">Centre Utilization Analytics</h3>
 <p className="text-[10px] text-slate-405 mt-0.5">Milestone benchmarks and regional clinic seat utilization ledger.</p>
 </div>
 <Badge color="primary"variant="soft"className="flex items-center gap-1 font-semibold">
 <TrendingUp className="h-3.5 w-3.5"/> Utilization Report
 </Badge>
 </div>

 <div className="overflow-x-auto border border-slate-200 rounded-xl">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
 <th className="p-3">Clinic Name</th>
 <th className="p-3 text-center">Nominal Cap.</th>
 <th className="p-3 text-center">Active Enrolled</th>
 <th className="p-3 text-center">Utilization Rate</th>
 <th className="p-3 text-center">Avg Progress</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 text-[11px] text-slate-700">
 {centres.map(tc => {
 const enrolled = getEnrolledChildren(tc.name);
 const capacity = 15;
 const utilRate = Math.round((enrolled.length / capacity) * 100);
 
 // Compute average progress score for children in this center
 const enrolledWithProgress = enrolled.filter(c => c.therapyProgressScore !== undefined);
 const avgProg = enrolledWithProgress.length > 0
 ? Math.round(enrolledWithProgress.reduce((sum, c) => sum + (c.therapyProgressScore || 0), 0) / enrolledWithProgress.length)
 : 0;

 return (
 <tr key={tc.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="p-3 font-semibold text-slate-800">{tc.name}</td>
 <td className="p-3 text-center font-semibold text-slate-455">{capacity} seats</td>
 <td className="p-3 text-center font-bold text-slate-900">{enrolled.length} children</td>
 <td className="p-3 text-center">
 <div className="flex items-center justify-center gap-1.5">
 <span className={`font-bold ${
 utilRate > 75 ?'text-brand-danger': utilRate > 40 ?'text-teal-600':'text-slate-500'
 }`}>{utilRate}%</span>
 <div className="w-10 bg-slate-100 h-1 rounded-full overflow-hidden">
 <div className={`h-full rounded-full ${
 utilRate > 75 ?'bg-red-500':'bg-brand-cyan-705'
 }`} style={{ width:`${utilRate}%`}} />
 </div>
 </div>
 </td>
 <td className="p-3 text-center font-extrabold text-slate-800">
 {avgProg > 0 ?`${avgProg}%`:'N/A'}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>

 </div>

 {/* Grid List of Centres cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
 {centres.map((tc) => {
 const enrolled = getEnrolledChildren(tc.name);
 return (
 <Card key={tc.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-brand-cyan-700 bg-white/80">
 <div>
 <div className="flex justify-between items-start mb-3">
 <div className="p-2 bg-brand-cyan-50 rounded-lg text-brand-cyan-755">
 <Building2 className="h-5 w-5"/>
 </div>
 <Badge color={tc.sponsorshipRequired ?'warning':'success'} className="font-bold">
 {tc.sponsorshipRequired ?'Sponsorship Required':'Fully Funded'}
 </Badge>
 </div>

 <h3 className="text-sm font-bold text-slate-900 leading-tight font-display">{tc.name}</h3>
 <p className="text-[10px] text-slate-400 mt-0.5 mb-3">ID: {tc.id}</p>

 <div className="flex items-start gap-1 text-slate-500 mb-4">
 <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5"/>
 <span>{tc.address}</span>
 </div>

 <div className="mb-4">
 <Label>Services Offered</Label>
 <div className="flex flex-wrap gap-1.5 mt-1">
 {tc.services.map((serv, idx) => (
 <Badge key={idx} color="slate"variant="soft"className="scale-95 px-2 py-0">
 {serv}
 </Badge>
 ))}
 </div>
 </div>

 <div className="p-2.5 bg-slate-50/50 border border-slate-100/50 rounded-xl flex items-center justify-between mb-4">
 <span className="font-semibold text-slate-500">Active Beneficiaries</span>
 <span className="font-bold text-slate-800 text-sm">{enrolled.length} Enrolled</span>
 </div>
 </div>

 <div>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => { setSelectedCentre(tc); setIsDrawerOpen(true); }}
 className="w-full flex items-center justify-center gap-1 cursor-pointer"
 >
 Manage Placements & Staff <ChevronRight className="h-3.5 w-3.5"/>
 </Button>
 </div>
 </Card>
 );
 })}
 </div>

 {/* Therapy Centre Drawer Details */}
 <Drawer
 isOpen={isDrawerOpen}
 onClose={() => { setIsDrawerOpen(false); setSelectedCentre(null); }}
 title={selectedCentre ? selectedCentre.name :''}
 size="md"
 >
 {selectedCentre && (
 <div className="space-y-6 text-xs">
 {/* Address */}
 <div className="pb-4 border-b border-slate-200">
 <Label>Centre Address</Label>
 <div className="flex items-start gap-1.5 mt-1">
 <MapPin className="h-4 w-4 text-slate-400 mt-0.5"/>
 <p className="text-slate-700 leading-relaxed font-semibold">{selectedCentre.address}</p>
 </div>
 </div>

 {/* Contact details */}
 <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
 <div>
 <Label>Contact Person</Label>
 <div className="flex items-center gap-1.5 mt-1">
 <User className="h-4 w-4 text-slate-400"/>
 <span className="font-bold text-slate-800">{selectedCentre.contactPerson}</span>
 </div>
 </div>
 <div>
 <Label>Phone Number</Label>
 <div className="flex items-center gap-1.5 mt-1">
 <Phone className="h-4 w-4 text-slate-400"/>
 <span className="font-bold text-slate-800">{selectedCentre.contactNumber}</span>
 </div>
 </div>
 </div>

 {/* Services checklist detail */}
 <div className="pb-4 border-b border-slate-200">
 <Label>All Services Checklist</Label>
 <div className="grid grid-cols-2 gap-2 mt-2">
 {['Speech Therapy','Occupational Therapy','Special Education','Physiotherapy','Counselling'].map((service) => {
 const isAvailable = selectedCentre.services.includes(service as any);
 return (
 <div key={service} className="flex items-center gap-2">
 <CheckCircle className={`h-4 w-4 ${isAvailable ?'text-brand-success':'text-slate-200'}`} />
 <span className={isAvailable ?'text-slate-800 font-medium':'text-slate-400'}>{service}</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Staff */}
 <div className="pb-4 border-b border-slate-200">
 <Label>Therapy Enrollment Info</Label>
 <div className="grid grid-cols-2 gap-4 mt-2">
 <div className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl">
 <span className="text-[9px] text-slate-400 font-semibold uppercase block">Assigned Therapist</span>
 <span className="font-bold text-slate-800 mt-1 block">{selectedCentre.assignedTherapist ||'Dr. Sneha Joshi'}</span>
 </div>
 <div className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl">
 <span className="text-[9px] text-slate-400 font-semibold uppercase block">Joined Date</span>
 <span className="font-bold text-slate-800 mt-1 block">{selectedCentre.enrollmentDate ||'2025-06-15'}</span>
 </div>
 </div>
 </div>

 {/* Therapy Progress Tracking List */}
 <div>
 <Label className="mb-2">Active Student Placements & Progress</Label>
 {getEnrolledChildren(selectedCentre.name).length === 0 ? (
 <p className="text-slate-400 italic">No registered children currently attending this centre.</p>
 ) : (
 <div className="border border-slate-200 bg-white rounded-xl divide-y divide-slate-200 max-h-56 overflow-y-auto">
 {getEnrolledChildren(selectedCentre.name).map((c) => {
 const prog = c.therapyProgressScore !== undefined ? c.therapyProgressScore : 0;
 return (
 <div 
 key={c.id} 
 className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
 onClick={() => {
 setIsDrawerOpen(false);
 setSelectedCentre(null);
 window.location.hash =`#/children/${c.id}`;
 }}
 >
 <div className="min-w-0 flex-1 pr-4">
 <div className="font-bold text-slate-800 truncate">{c.name}</div>
 <div className="flex items-center gap-2 mt-1 w-full max-w-[200px]">
 <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden flex-shrink-0">
 <div className="bg-brand-cyan-705 h-full rounded-full"style={{ width:`${prog}%`}} />
 </div>
 <span className="text-[9px] text-slate-400 font-bold flex-shrink-0">{prog}% Prog</span>
 </div>
 </div>
 <div className="flex items-center gap-2 flex-shrink-0">
 <Badge color={c.journeyStatus ==='Active Therapy'?'primary':'slate'} className="scale-90 px-2.5 py-0 font-semibold">
 {c.journeyStatus}
 </Badge>
 <ChevronRight className="h-3 w-3 text-slate-400"/>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 )}
 </Drawer>

 </div>
 );
};
export default TherapyCentres;
