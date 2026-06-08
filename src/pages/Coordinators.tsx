import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { Coordinator, Child, Camp, FollowUp, CoordinatorActivity } from'../types';
import { Card, Badge, Button, Drawer, Select, Label } from'../components/ui';
import { User, Phone, Mail, MapPin, ClipboardList, CheckCircle2, Heart, Calendar, Clock, Activity, ShieldCheck, Sparkles, Check, X } from'lucide-react';
import { showToast } from'../hooks/useToast';

export const Coordinators: React.FC = () => {
 const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
 const [children, setChildren] = useState<Child[]>([]);
 const [camps, setCamps] = useState<Camp[]>([]);
 const [followups, setFollowups] = useState<FollowUp[]>([]);
 const [activities, setActivities] = useState<CoordinatorActivity[]>([]);

 // Selected Coordinator detail drawer state
 const [selectedCoord, setSelectedCoord] = useState<Coordinator | null>(null);
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 const [selectedCampId, setSelectedCampId] = useState('');
 const [attendanceChanges, setAttendanceChanges] = useState<Record<string,'Present'|'Absent'>>({});

 useEffect(() => {
 loadData();
 }, []);

 const loadData = () => {
 setCoordinators(RenuStore.getCoordinators());
 setChildren(RenuStore.getChildren());
 setCamps(RenuStore.getCamps());
 setFollowups(RenuStore.getFollowUps());
 setActivities(RenuStore.getCoordinatorActivities());
 };

 const handleOpenHub = (coord: Coordinator) => {
 setSelectedCoord(coord);
 const coordCamps = camps.filter(c => c.coordinatorId === coord.id);
 if (coordCamps.length > 0) {
 setSelectedCampId(coordCamps[0].id);
 } else {
 setSelectedCampId('');
 }
 setAttendanceChanges({});
 setIsDrawerOpen(true);
 };

 // Calculations for selected coordinator
 const getCoordCamps = (coordId: string) => camps.filter(c => c.coordinatorId === coordId);
 
 const getCoordChildren = (coordId: string) => {
 const campIds = new Set(getCoordCamps(coordId).map(c => c.id));
 return children.filter(c => c.campId && campIds.has(c.campId));
 };

 const getCoordPendingFollowups = (coordId: string) => {
 return followups.filter(f => f.coordinatorId === coordId && f.status ==='Pending');
 };

 const getCoordAttendanceRecords = (coordId: string) => {
 // Number of camps managed by coordinator where attendance is marked
 const coordCampIds = new Set(getCoordCamps(coordId).map(c => c.id));
 const attendedChildren = children.filter(c => c.campId && coordCampIds.has(c.campId) && c.attendanceStatus !== undefined);
 const campsWithAttendance = new Set(attendedChildren.map(c => c.campId));
 return campsWithAttendance.size;
 };

 const getCoordActivities = (coordId: string) => {
 return activities.filter(act => act.coordinatorId === coordId);
 };

 // Camp Attendance Management
 const getCampChildrenList = (campId: string) => {
 return children.filter(c => c.campId === campId);
 };

 const handleAttendanceChange = (childId: string, status:'Present'|'Absent') => {
 setAttendanceChanges(prev => ({
 ...prev,
 [childId]: status
 }));
 };

 const handleSaveAttendance = () => {
 if (!selectedCampId || !selectedCoord) return;
 
 const camp = camps.find(cmp => cmp.id === selectedCampId);
 if (!camp) return;

 const updatedChildren = children.map(c => {
 if (c.campId === selectedCampId && attendanceChanges[c.id] !== undefined) {
 return {
 ...c,
 attendanceStatus: attendanceChanges[c.id]
 };
 }
 return c;
 });

 RenuStore.saveChildren(updatedChildren);
 setChildren(updatedChildren);

 // Save distribution statistics updates for normal/special count
 const campKids = updatedChildren.filter(c => c.campId === selectedCampId);
 const presentKids = campKids.filter(c => c.attendanceStatus ==='Present');
 const normalPresent = presentKids.filter(c => c.classification ==='Normal').length;
 const specialPresent = presentKids.filter(c => c.classification ==='Special').length;
 const followUpsReq = Math.floor(specialPresent * 0.9);

 const updatedCamps = camps.map(cmp => {
 if (cmp.id === selectedCampId) {
 return {
 ...cmp,
 registeredCount: presentKids.length,
 normalCount: normalPresent,
 specialCount: specialPresent,
 followUpsRequiredCount: followUpsReq
 };
 }
 return cmp;
 });
 RenuStore.saveCamps(updatedCamps);
 setCamps(updatedCamps);

 // Log coordinator activity log
 RenuStore.logCoordinatorActivity(
 selectedCoord.id,
'Attendance',
`Marked attendance records for ${camp.name}: ${presentKids.length} present, ${campKids.length - presentKids.length} absent.`,
 undefined,
 undefined,
 camp.name
 );

 // Refresh logs
 setActivities(RenuStore.getCoordinatorActivities());
 setAttendanceChanges({});
 showToast('Attendance Logged','success',`Successfully saved screening attendance for ${camp.name}.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 };

 return (
 <div className="space-y-6 w-full max-w-none px-6 md:px-8 xl:px-12 pb-12">
 {/* Header */}
 <div>
 <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">Field Coordinators Directory</h1>
 <p className="text-xs text-slate-500 mt-1">Monitor operational performance, log camp attendance checklists, and track activities logged by RENU field coordinators.</p>
 </div>

 {/* Grid of coordinators */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-xs">
 {coordinators.map((c) => {
 const coordCampsCount = getCoordCamps(c.id).length;
 const coordChildrenCount = getCoordChildren(c.id).length;
 const coordFupsCount = c.followUpsCompletedCount;

 return (
 <Card key={c.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-brand-cyan-700 bg-white/80 border-slate-205">
 <div>
 {/* Profile Card Head */}
 <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-full bg-brand-cyan-50 border border-brand-cyan-100 flex items-center justify-center text-brand-cyan-700 font-extrabold text-sm shadow-inner">
 {c.name.split('').map(n => n[0]).join('')}
 </div>
 <div>
 <h3 className="text-sm font-bold text-slate-900 leading-tight">{c.name}</h3>
 <div className="text-[10px] text-slate-405 mt-0.5 font-semibold">ID: {c.id}</div>
 </div>
 </div>
 <Badge color="success">Active</Badge>
 </div>

 {/* Contact / Area */}
 <div className="space-y-2 mb-5">
 <div className="flex items-center gap-2 text-slate-600">
 <Phone className="h-3.5 w-3.5 text-slate-400"/>
 <span>{c.mobile}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-600">
 <Mail className="h-3.5 w-3.5 text-slate-400 truncate max-w-[200px]"/>
 <span className="truncate">{c.email}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700 font-semibold bg-slate-50 border border-slate-100 p-2 rounded-lg">
 <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0"/>
 <span className="truncate">Area: {c.assignedArea}</span>
 </div>
 </div>

 {/* Performance Metrics preview */}
 <Label className="mb-2">Key Operational Stats</Label>
 <div className="grid grid-cols-2 gap-2 text-center font-bold">
 <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
 <span className="text-sm font-extrabold text-slate-800 block">{coordCampsCount}</span>
 <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">Camps Managed</span>
 </div>
 <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
 <span className="text-sm font-extrabold text-brand-cyan-700 block">{coordChildrenCount}</span>
 <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">Registrations</span>
 </div>
 </div>
 </div>

 <div className="mt-5 pt-3 border-t border-slate-200">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleOpenHub(c)}
 className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <ClipboardList className="h-4 w-4"/> Open Operations Hub
 </Button>
 </div>
 </Card>
 );
 })}
 </div>

 {/* Coordinator Dashboard Operations Hub Drawer */}
 <Drawer
 isOpen={isDrawerOpen}
 onClose={() => { setIsDrawerOpen(false); setSelectedCoord(null); }}
 title={selectedCoord ?`Operations Hub: ${selectedCoord.name}`:''}
 size="lg"
 >
 {selectedCoord && (
 <div className="space-y-6 text-xs pb-10">
 {/* 1. Dashboard Statistics Section */}
 <div>
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 I. Coordinator Dashboard
 </h4>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center font-bold">
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
 <span className="text-lg font-extrabold text-slate-800 block">
 {getCoordCamps(selectedCoord.id).length}
 </span>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Camps Managed</span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
 <span className="text-lg font-extrabold text-brand-cyan-700 block">
 {getCoordChildren(selectedCoord.id).length}
 </span>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Children Registered</span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
 <span className="text-lg font-extrabold text-brand-success block">
 {selectedCoord.followUpsCompletedCount}
 </span>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Follow-ups Logged</span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
 <span className="text-lg font-extrabold text-slate-800 block">
 {selectedCoord.activeChildrenCount}
 </span>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Active Children Assigned</span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
 <span className="text-lg font-extrabold text-brand-danger block">
 {getCoordPendingFollowups(selectedCoord.id).length}
 </span>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Pending Follow-ups</span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
 <span className="text-lg font-extrabold text-slate-800 block">
 {getCoordAttendanceRecords(selectedCoord.id)}
 </span>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Attendance Records</span>
 </div>
 </div>
 </div>

 {/* 2. Camp Attendance Management Section */}
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 II. Manage Camp Attendance
 </h4>
 
 {getCoordCamps(selectedCoord.id).length === 0 ? (
 <p className="text-slate-400 italic">No camps assigned to this coordinator for attendance mapping.</p>
 ) : (
 <div className="space-y-4">
 <div className="max-w-sm">
 <Label>Select Active Camp</Label>
 <Select
 options={getCoordCamps(selectedCoord.id).map(cmp => ({ label: cmp.name, value: cmp.id }))}
 value={selectedCampId}
 onChange={e => { setSelectedCampId(e.target.value); setAttendanceChanges({}); }}
 />
 </div>

 {selectedCampId && (
 <div className="space-y-3">
 <Label>Registered Children Checklist</Label>
 {getCampChildrenList(selectedCampId).length === 0 ? (
 <p className="text-slate-400 italic bg-white p-3 border border-slate-100 rounded-lg">No children registered at this camp.</p>
 ) : (
 <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-48 overflow-y-auto divide-y divide-slate-100">
 {getCampChildrenList(selectedCampId).map(child => {
 const currentStatus = attendanceChanges[child.id] !== undefined 
 ? attendanceChanges[child.id] 
 : child.attendanceStatus ||'Pending';
 
 return (
 <div key={child.id} className="p-3 flex justify-between items-center text-xs">
 <div>
 <div className="font-bold text-slate-800">{child.name}</div>
 <div className="text-[9px] text-slate-400">ID: {child.id} | Classification: {child.classification}</div>
 </div>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => handleAttendanceChange(child.id,'Present')}
 className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
 currentStatus ==='Present'
 ?'bg-green-105 text-brand-success ring-1 ring-green-300'
 :'bg-slate-50 text-slate-400 hover:bg-slate-100'
 }`}
 >
 <Check className="h-3 w-3"/> Present
 </button>
 <button
 type="button"
 onClick={() => handleAttendanceChange(child.id,'Absent')}
 className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
 currentStatus ==='Absent'
 ?'bg-red-105 text-brand-danger ring-1 ring-red-350'
 :'bg-slate-50 text-slate-455 hover:bg-slate-100'
 }`}
 >
 <X className="h-3 w-3"/> Absent
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 
 {getCampChildrenList(selectedCampId).length > 0 && (
 <div className="flex justify-end pt-2">
 <Button
 size="sm"
 onClick={handleSaveAttendance}
 className="cursor-pointer"
 >
 Save Attendance Record
 </Button>
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </div>

 {/* 3. Coordinator Activity Timeline Feed Section */}
 <div>
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 III. Coordinator Activity Timeline
 </h4>
 {getCoordActivities(selectedCoord.id).length === 0 ? (
 <p className="text-slate-400 italic">No activity logs recorded for this coordinator.</p>
 ) : (
 <div className="relative border-l border-slate-200 ml-3.5 pl-6 space-y-4 py-2">
 {getCoordActivities(selectedCoord.id).slice(0, 8).map((act, index) => (
 <div key={act.id} className="relative group">
 {/* Circle dot marker */}
 <span className="absolute -left-[32px] top-1.5 h-4 w-4 bg-white border border-brand-cyan-700 text-brand-cyan-700 rounded-full flex items-center justify-center">
 <Clock className="h-2.5 w-2.5 text-brand-cyan-700"/>
 </span>
 <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
 <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mb-1">
 <Badge color="primary"variant="soft"className="scale-90 origin-left">
 {act.type}
 </Badge>
 <span>{act.date}</span>
 </div>
 <p className="font-semibold text-slate-800 text-xs leading-relaxed">{act.description}</p>
 {act.campName && (
 <div className="text-[9px] text-slate-400 font-bold mt-1">Camp Location: {act.campName}</div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}
 </Drawer>
 </div>
 );
};
export default Coordinators;
