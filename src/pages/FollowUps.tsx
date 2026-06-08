import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { FollowUp, Coordinator } from'../types';
import { Card, Badge, Button, Select, Input } from'../components/ui';
import { Calendar, CheckCircle2, Clock, Filter, Phone, AlertCircle, RefreshCw } from'lucide-react';
import EmptyState from'../components/common/EmptyState';

export const FollowUps: React.FC = () => {
 const { role } = useRole();
 const [followups, setFollowups] = useState<FollowUp[]>([]);
 const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
 
 // Filters
 const [statusFilter, setStatusFilter] = useState<'All'|'Pending'|'Completed'>('All');
 const [coordFilter, setCoordFilter] = useState('All');
 const [searchQuery, setSearchQuery] = useState('');

 useEffect(() => {
 loadData();
 }, []);

 const loadData = () => {
 setFollowups(RenuStore.getFollowUps());
 setCoordinators(RenuStore.getCoordinators());
 };

 const handleToggleStatus = (id: string) => {
 const allFups = RenuStore.getFollowUps();
 const updated = allFups.map(f => {
 if (f.id === id) {
 const nextStatus = f.status ==='Completed'?'Pending':'Completed';
 showToast('Follow-Up Updated','success',`Status changed to ${nextStatus}.`);
 return { ...f, status: nextStatus as any };
 }
 return f;
 });
 RenuStore.saveFollowUps(updated);
 setFollowups(updated);
 window.dispatchEvent(new Event('renu_data_updated'));
 };

 // Filter & Search Logic
 const filteredFollowUps = followups
 .filter(f => {
 const matchesSearch = f.childName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 f.notes.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesStatus = statusFilter ==='All'|| f.status === statusFilter;
 const matchesCoord = coordFilter ==='All'|| f.coordinatorId === coordFilter;
 
 return matchesSearch && matchesStatus && matchesCoord;
 })
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Earliest due first

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Follow-Up Management</h1>
 <p className="text-xs text-slate-500 mt-1">Track home visits, parental counselling progress, and therapy checklist updates.</p>
 </div>
 <Button variant="outline"size="sm"onClick={loadData} className="flex items-center gap-1.5 cursor-pointer">
 <RefreshCw className="h-4 w-4"/> Sync Records
 </Button>
 </div>

 {/* Filters */}
 <Card className="p-4">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <Input
 placeholder="Search by child name or notes..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 />
 </div>
 <div>
 <Select
 options={[
 { label:'All Statuses', value:'All'},
 { label:'Pending Scheduled', value:'Pending'},
 { label:'Completed visits', value:'Completed'},
 ]}
 value={statusFilter}
 onChange={e => setStatusFilter(e.target.value as any)}
 />
 </div>
 <div>
 <Select
 options={[{ label:'All Coordinators', value:'All'}, ...coordinators.map(c => ({ label: c.name, value: c.id }))]}
 value={coordFilter}
 onChange={e => setCoordFilter(e.target.value)}
 />
 </div>
 </div>
 </Card>

 {/* Timeline View */}
 {filteredFollowUps.length === 0 ? (
 <EmptyState
 title="No Follow-Ups Pending"
 description="We couldn't find any scheduled follow-ups matching your parameters. Check your filters or schedule a follow-up directly from a child's profile page."
 />
 ) : (
 <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6 text-xs max-w-4xl pb-6">
 {filteredFollowUps.map((fup) => {
 const isCompleted = fup.status ==='Completed';
 return (
 <div key={fup.id} className="relative">
 {/* Stepper Dot */}
 <span className={`absolute -left-[30px] top-0 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
 isCompleted 
 ?'bg-brand-success border-brand-success text-white'
 :'bg-white border-brand-warning ring-4 ring-amber-50'
 }`}>
 {isCompleted ? <CheckCircle2 className="h-3 w-3 text-white"/> : <Clock className="h-3 w-3 text-brand-warning"/>}
 </span>

 {/* Followup Timeline Card */}
 <Card className="p-5 hover:shadow-md transition-shadow">
 {/* Top card block */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
 <div>
 <h3 
 onClick={() => window.location.hash =`#/children/${fup.childId}`}
 className="text-sm font-bold text-slate-800 hover:text-brand-cyan-700 hover:underline cursor-pointer"
 >
 Child: {fup.childName}
 </h3>
 <div className="text-[10px] text-slate-400 mt-0.5">Followup ID: {fup.id}</div>
 </div>
 <div className="flex items-center gap-2">
 <Badge color={isCompleted ?'success':'warning'}>
 {fup.status}
 </Badge>
 <span className="text-[10px] text-slate-400 font-semibold bg-slate-50/50 px-2 py-0.5 rounded border border-slate-200/80">
 {fup.date}
 </span>
 </div>
 </div>

 {/* Body Content */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Observations & Home Visit Notes</div>
 <p className="text-xs text-slate-700 mt-1 leading-relaxed">{fup.notes}</p>
 </div>
 <div>
 <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Parent counseling discussion</div>
 <p className="text-xs text-slate-700 mt-1 leading-relaxed">{fup.parentDiscussion}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100">
 <div>
 <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Milestones achieved</div>
 <p className="text-xs text-slate-700 mt-1 leading-relaxed">{fup.progressUpdates}</p>
 </div>
 <div>
 <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Recommendations</div>
 <p className="text-xs text-slate-700 mt-1 leading-relaxed">{fup.recommendations}</p>
 </div>
 </div>

 {/* Footer links */}
 <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-slate-100">
 <div className="flex items-center gap-2">
 <div className="h-6 w-6 rounded-full bg-brand-cyan-50 flex items-center justify-center text-brand-cyan-700 font-bold text-[10px]">
 {fup.coordinatorName?.split('').map(n => n[0]).join('')}
 </div>
 <span className="text-[10px] text-slate-500">
 Logged by: <span className="font-semibold text-slate-700">{fup.coordinatorName}</span>
 </span>
 </div>

 <div className="flex items-center gap-4">
 {fup.nextFollowUpDate && (
 <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-cyan-700 bg-brand-cyan-50 px-2 py-0.5 rounded border border-transparent">
 <Calendar className="h-3.5 w-3.5"/> Next: {fup.nextFollowUpDate}
 </div>
 )}
 <button
 onClick={() => handleToggleStatus(fup.id)}
 className="text-[10px] font-bold text-brand-cyan-700 hover:underline cursor-pointer"
 >
 {isCompleted ?'Mark Pending':'Mark Completed'}
 </button>
 </div>
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
};
export default FollowUps;
