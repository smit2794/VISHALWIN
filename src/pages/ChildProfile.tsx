import React, { useState, useEffect } from'react';
import { useParams, useNavigate } from'react-router-dom';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Child, FollowUp, Diagnosis, TherapyCentre, Sponsorship, ChildJourneyStatus, MockDocument, SchoolAdmissionDetails, TherapyProgressDetails } from'../types';
import { Card, Badge, Button, Input, Select, Label, Textarea, Modal } from'../components/ui';
import { RenuJourneyTracker } from'../components/common/RenuJourneyTracker';
import {
 User, Phone, Home, GraduationCap, Calendar, Heart, Stethoscope, Building2, Coins, Plus,
 CheckCircle, FileCheck, ChevronLeft, FileText, Clock, Trash2, Upload, Activity, Award,
 PhoneCall, Users, CheckSquare, ShieldCheck, XCircle, TrendingUp
} from'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from'recharts';
import LoadingSkeleton from'../components/feedback/LoadingSkeleton';
import EmptyState from'../components/common/EmptyState';

export const ChildProfile: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { role, isAdmin } = useRole();

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
 const [child, setChild] = useState<Child | null>(null);
 const [followups, setFollowups] = useState<FollowUp[]>([]);
 const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
 const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null);
 const [therapyCentre, setTherapyCentre] = useState<TherapyCentre | null>(null);
 const [allCentres, setAllCentres] = useState<TherapyCentre[]>([]);
 
 // UI States
 const [isLoading, setIsLoading] = useState(true);
 const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
 const [isAllocateCentreOpen, setIsAllocateCentreOpen] = useState(false);
 const [isDocModalOpen, setIsDocModalOpen] = useState(false);

 // Form States
 const [newFollowUp, setNewFollowUp] = useState({
 notes:'',
 parentDiscussion:'',
 progressUpdates:'',
 issuesIdentified:'',
 recommendations:'',
 nextFollowUpDate:'',
 status:'Pending'as'Pending'|'Completed',
 communicationType:'Home Visit'as FollowUp['communicationType'],
 actionItems:'',
 nextFollowUpPlan:''
 });
 
 const [selectedCentreId, setSelectedCentreId] = useState('');
 const [assignedTherapist, setAssignedTherapist] = useState('');

 // Document Form State
 const [docForm, setDocForm] = useState({
 type:'Medical Report'as MockDocument['type'],
 name:'',
 });

 useEffect(() => {
 if (id) {
 loadChildData(id);
 }
 }, [id]);

 const loadChildData = (childId: string) => {
 setIsLoading(true);
 setTimeout(() => {
 const allChildren = RenuStore.getChildren();
 const foundChild = allChildren.find(c => c.id === childId);
 
 if (!foundChild) {
 showToast('Child Not Found','danger',`No record matches ID ${childId}`);
 navigate('/children');
 return;
 }
 
 setChild(foundChild);
 
 const childFups = RenuStore.getFollowUps()
 .filter(f => f.childId === childId)
 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 setFollowups(childFups);
 
 const childDiag = RenuStore.getDiagnoses().find(d => d.childId === childId) || null;
 setDiagnosis(childDiag);
 
 const childSpons = RenuStore.getSponsorships().find(s => s.childId === childId) || null;
 setSponsorship(childSpons);

 const centresList = RenuStore.getTherapyCentres();
 setAllCentres(centresList);
 
 const activeCentre = centresList.find(tc => tc.name === childDiag?.centreName) || centresList[0];
 setTherapyCentre(activeCentre);
 setSelectedCentreId(activeCentre?.id ||'');
 setAssignedTherapist(activeCentre?.assignedTherapist ||'');

 setIsLoading(false);
 }, 300);
 };

 if (isLoading || !child) {
 return <LoadingSkeleton variant="profile"/>;
 }

 // Click to update Journey Status
 const handleUpdateStatus = (newStatus: ChildJourneyStatus) => {
 const allChildren = RenuStore.getChildren();
 const updated = allChildren.map(c => {
 if (c.id === child.id) {
 return { 
 ...c, 
 journeyStatus: newStatus,
 certificateAvailable: newStatus ==='Diagnosis'? true : c.certificateAvailable
 };
 }
 return c;
 });
 
 RenuStore.saveChildren(updated);
 setChild({ 
 ...child, 
 journeyStatus: newStatus,
 certificateAvailable: newStatus ==='Diagnosis'? true : child.certificateAvailable
 });

 // Log Coordinator timeline
 RenuStore.logCoordinatorActivity(
'COORD-100', // Rohan Kulkarni
'Progress',
`Advanced journey status to"${newStatus}"for ${child.name}.`,
 child.id,
 child.name
 );

 showToast('Journey Advanced','success',`${child.name} advanced to ${newStatus}.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 };

 // Therapy progress score updates
 const handleProgressChange = (score: number) => {
 const allChildren = RenuStore.getChildren();
 const dateStr = new Date().toISOString().split('T')[0];

 const currentHistory = child.progressHistory || [];
 const updatedHistory = [
 ...currentHistory,
 { date: dateStr, score, notes:'Milestone progress rating logged via dashboard.'}
 ];

 const updated = allChildren.map(c => {
 if (c.id === child.id) {
 return { 
 ...c, 
 therapyProgressScore: score,
 progressHistory: updatedHistory,
 therapyProgress: c.therapyProgress ? {
 ...c.therapyProgress,
 progressScore: score
 } : undefined
 };
 }
 return c;
 });

 RenuStore.saveChildren(updated);
 setChild({ 
 ...child, 
 therapyProgressScore: score,
 progressHistory: updatedHistory,
 therapyProgress: child.therapyProgress ? {
 ...child.therapyProgress,
 progressScore: score
 } : undefined
 });

 // Log Coordinator timeline
 RenuStore.logCoordinatorActivity(
'COORD-100', // Rohan Kulkarni
'Progress',
`Updated milestone progress rating score to ${score}% for ${child.name}.`,
 child.id,
 child.name
 );

 window.dispatchEvent(new Event('renu_data_updated'));
 };

 // Document uploads management
 const handleAddDocument = (e: React.FormEvent) => {
 e.preventDefault();
 if (!docForm.name) {
 showToast('Validation Error','danger','Please enter a report name.');
 return;
 }

 const newDoc: MockDocument = {
 id:`DOC-${Date.now()}`,
 type: docForm.type,
 name: docForm.name.endsWith('.pdf') ? docForm.name :`${docForm.name}.pdf`,
 date: new Date().toISOString().split('T')[0],
 fileSize:'1.4 MB'
 };

 const updatedDocs = [...(child.documents || []), newDoc];
 const allChildren = RenuStore.getChildren();
 const updatedChildren = allChildren.map(c => {
 if (c.id === child.id) {
 return { ...c, documents: updatedDocs };
 }
 return c;
 });

 RenuStore.saveChildren(updatedChildren);
 setChild({ ...child, documents: updatedDocs });
 setIsDocModalOpen(false);

 // Log Coordinator activity log
 RenuStore.logCoordinatorActivity(
'COORD-100',
'Document',
`Uploaded document: ${newDoc.type} (${newDoc.name}) for ${child.name}`,
 child.id,
 child.name
 );

 showToast('Document Added','success',`"${newDoc.name}"uploaded to child profile.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 setDocForm({ type:'Medical Report', name:''});
 };

 const handleDeleteDocument = (docId: string) => {
 if (!window.confirm('Delete this report file?')) return;

 const updatedDocs = (child.documents || []).filter(doc => doc.id !== docId);
 const allChildren = RenuStore.getChildren();
 const updatedChildren = allChildren.map(c => {
 if (c.id === child.id) {
 return { ...c, documents: updatedDocs };
 }
 return c;
 });

 RenuStore.saveChildren(updatedChildren);
 setChild({ ...child, documents: updatedDocs });
 showToast('Document Removed','info','File attachment was deleted from dashboard database.');
 window.dispatchEvent(new Event('renu_data_updated'));
 };

 // Log new Follow-Up
 const handleFollowUpSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newFollowUp.notes || !newFollowUp.parentDiscussion) {
 showToast('Validation Error','danger','Please enter notes and parent discussion summary.');
 return;
 }

 const followUpRecord: FollowUp = {
 id:`FUP-${Date.now()}`,
 childId: child.id,
 childName: child.name,
 date: new Date().toISOString().split('T')[0],
 notes: newFollowUp.notes,
 parentDiscussion: newFollowUp.parentDiscussion,
 progressUpdates: newFollowUp.progressUpdates ||'Milestones assessed.',
 issuesIdentified: newFollowUp.issuesIdentified ||'None reported',
 recommendations: newFollowUp.recommendations ||'Continue ongoing therapies.',
 nextFollowUpDate: newFollowUp.nextFollowUpDate || undefined,
 status: newFollowUp.status,
 coordinatorId:'COORD-100', // Rohan Kulkarni
 coordinatorName:'Rohan Kulkarni',
 // Communication Fields
 communicationType: newFollowUp.communicationType,
 actionItems: newFollowUp.actionItems || undefined,
 nextFollowUpPlan: newFollowUp.nextFollowUpPlan || undefined
 };

 const allFollowUps = RenuStore.getFollowUps();
 const updatedFups = [followUpRecord, ...allFollowUps];
 RenuStore.saveFollowUps(updatedFups);
 setFollowups(updatedFups.filter(f => f.childId === child.id));

 // Log Coordinator activity log
 RenuStore.logCoordinatorActivity(
'COORD-100',
'Follow-Up',
`Logged new follow-up (${newFollowUp.communicationType}) with parent for ${child.name}`,
 child.id,
 child.name
 );

 setIsFollowUpModalOpen(false);
 showToast('Follow-Up Scheduled','success','Successfully logged parent visit.');
 window.dispatchEvent(new Event('renu_data_updated'));
 
 // Reset Form
 setNewFollowUp({
 notes:'',
 parentDiscussion:'',
 progressUpdates:'',
 issuesIdentified:'',
 recommendations:'',
 nextFollowUpDate:'',
 status:'Pending',
 communicationType:'Home Visit',
 actionItems:'',
 nextFollowUpPlan:''
 });
 };

 // Allocate Therapy Centre Details
 const handleAllocateCentre = (e: React.FormEvent) => {
 e.preventDefault();
 const selectedCentre = allCentres.find(tc => tc.id === selectedCentreId);
 if (!selectedCentre) return;

 // Create / Update Diagnosis Outcome mapping
 const newDiag: Diagnosis = diagnosis ? {
 ...diagnosis,
 centreName: selectedCentre.name,
 } : {
 id:`DIA-${Date.now()}`,
 childId: child.id,
 childName: child.name,
 date: new Date().toISOString().split('T')[0],
 centreName: selectedCentre.name,
 assessmentSummary:'Initial clinical assessment logged.',
 certificateAvailable: child.certificateAvailable || false,
 assessmentScore: 70,
 outcome:'Assigned to rehabilitation centre.'
 };

 const allDiagnoses = RenuStore.getDiagnoses();
 const filteredDiag = allDiagnoses.filter(d => d.childId !== child.id);
 RenuStore.saveDiagnoses([...filteredDiag, newDiag]);
 setDiagnosis(newDiag);
 setTherapyCentre(selectedCentre);

 // Sync Child Object Therapy details
 const childTherapy: TherapyProgressDetails = {
 therapyType:'Special Education',
 assignedTherapist,
 sessionsCompleted: 0,
 sessionsRemaining: 24,
 progressScore: child.therapyProgressScore || 50,
 therapistRemarks:'Assigned therapist initialized.'
 };

 const allChildren = RenuStore.getChildren();
 const updatedChildren = allChildren.map(c => {
 if (c.id === child.id) {
 return {
 ...c,
 journeyStatus:'Therapy Centre Enrollment'as ChildJourneyStatus,
 therapyProgress: childTherapy
 };
 }
 return c;
 });
 RenuStore.saveChildren(updatedChildren);
 setChild({
 ...child,
 journeyStatus:'Therapy Centre Enrollment',
 therapyProgress: childTherapy
 });

 // Log Coordinator timeline activity
 RenuStore.logCoordinatorActivity(
'COORD-100',
'Progress',
`Enrolled child in therapy centre: ${selectedCentre.name}`,
 child.id,
 child.name
 );

 setIsAllocateCentreOpen(false);
 showToast('Centre Allocated','success',`Assigned ${child.name} to ${selectedCentre.name}.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 };

 return (
 <div className="space-y-6 w-full max-w-none px-6 md:px-8 xl:px-12 pb-12">
 {/* Header Banner */}
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/85 border border-slate-200/80 p-6 rounded-2xl shadow-xs backdrop-blur-xs">
 <div className="flex items-center gap-4">
 <div className="h-16 w-16 rounded-full bg-brand-cyan-50 border border-brand-cyan-100 flex items-center justify-center text-brand-cyan-700 font-extrabold text-2xl shadow-inner flex-shrink-0">
 {child.name.split('').map(n => n[0]).join('')}
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h1 className="text-xl md:text-2xl font-display font-extrabold text-slate-900">{child.name}</h1>
 <Badge color={child.classification ==='Special'?'danger':'success'} className="font-bold">
 {child.classification ==='Special'?'Special Child':'Normal Child'}
 </Badge>
 </div>
 <p className="text-xs text-slate-500 mt-1 font-semibold">ID: {child.id} | DOB: {child.dob} (Age {child.age} yrs) | Gender: {child.gender}</p>
 </div>
 </div>

 {/* Quick advance stepper actions */}
 <div className="flex gap-2">
 <Button variant="outline"onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer">
 <ChevronLeft className="h-4 w-4"/> Directory
 </Button>
 {child.classification ==='Special'&& (
 <div className="flex gap-2">
 <Select
 options={[
 { label:'Set Journey Step...', value:''},
 { label:'Medical Camp', value:'Medical Camp'},
 { label:'Screening', value:'Screening'},
 { label:'Child Classification', value:'Child Classification'},
 { label:'Follow-Up', value:'Follow-Up'},
 { label:'Diagnosis', value:'Diagnosis'},
 { label:'Therapy Centre Enrollment', value:'Therapy Centre Enrollment'},
 { label:'Sponsorship Support', value:'Sponsorship Support'},
 { label:'Active Therapy', value:'Active Therapy'},
 { label:'Progress Tracking', value:'Progress Tracking'},
 { label:'School Ready', value:'School Ready'},
 { label:'School Admission', value:'School Admission'}
 ]}
 value=""
 onChange={e => {
 if (e.target.value) {
 handleUpdateStatus(e.target.value as ChildJourneyStatus);
 }
 }}
 className="text-xs py-1"
 />
 <Button onClick={() => setIsAllocateCentreOpen(true)} className="flex items-center gap-1.5 cursor-pointer">
 <Building2 className="h-4 w-4"/> Enroll Centre
 </Button>
 </div>
 )}
 </div>
 </div>

 {/* Main Grid: 3-column layout on desktop, stacked on mobile */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
 
 {/* Column 1 & 2: Main Profile Cards (Left side, Span 2) */}
 <div className="lg:col-span-2 space-y-6">
 
 {/* Card A: Demographics (Child, Parent, Address, School Info) */}
 <Card className="p-6">
 <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-4">
 I. Demographics & Contact details
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Parent Details */}
 <div>
 <Label className="mb-2">Parent / Guardian Information</Label>
 <div className="space-y-2 p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
 <div>
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Father Name</span>
 <span className="font-bold text-slate-800">{child.fatherName}</span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Mother Name</span>
 <span className="font-bold text-slate-800">{child.motherName}</span>
 </div>
 {child.guardianName && (
 <div>
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Guardian Name</span>
 <span className="font-bold text-slate-800">{child.guardianName}</span>
 </div>
 )}
 </div>
 </div>

 {/* Address details */}
 <div>
 <Label className="mb-2">Address & Area Location</Label>
 <div className="space-y-2 p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
 <div>
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Local Area / Slum Settlement</span>
 <span className="font-bold text-slate-800">{child.area}, {child.city}</span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Street Address</span>
 <span className="font-bold text-slate-800">{child.address}</span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Pincode</span>
 <span className="font-bold text-slate-800">{child.pincode}</span>
 </div>
 </div>
 </div>
 </div>

 {/* School Enrollment & Readiness status */}
 <div className="mt-6 pt-4 border-t border-slate-100">
 <Label className="mb-2">Milestone School Readiness</Label>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
 <div>
 <span className="text-[9px] text-slate-400 uppercase block font-bold">Enrolled Status</span>
 <Badge color={child.isNotEnrolled ?'warning':'success'} className="mt-1 font-bold">
 {child.isNotEnrolled ?'Not Enrolled':'Mainstream Enrolled'}
 </Badge>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 uppercase block font-bold">School Name</span>
 <span className="font-bold text-slate-800 mt-1 block">{child.schoolName ||'Unassigned'}</span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 uppercase block font-bold">Grade Standard</span>
 <span className="font-bold text-slate-800 mt-1 block">{child.currentStandard ||'N/A'}</span>
 </div>
 </div>
 </div>
 </Card>

 {/* Card B: Clinical Assessment & Therapy Centre Details */}
 <Card className="p-6">
 <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-4">
 II. Clinical Diagnosis & Therapy Centre Placements
 </h3>
 
 <div className="space-y-4">
 {/* Diagnosis block */}
 <div>
 <Label className="mb-1.5"> government disability certificate & Outcome</Label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg text-center">
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Assessment Score</span>
 <span className="text-base font-extrabold text-brand-cyan-800 mt-0.5 block">{diagnosis?.assessmentScore ||'Pending'} / 100</span>
 </div>
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg col-span-2 text-left">
 <span className="text-[9px] text-slate-400 font-bold block uppercase pl-1">Assessment Centre</span>
 <span className="font-bold text-slate-800 mt-0.5 block truncate pl-1">{diagnosis?.centreName ||'No Clinic Assigned'}</span>
 </div>
 </div>
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg">
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Clinical Assessment outcome Remarks</span>
 <p className="text-xs text-slate-700 mt-1 leading-relaxed italic">
"{diagnosis?.assessmentSummary ||'No diagnostic notes logged yet.'}"
 </p>
 </div>
 </div>

 {/* Therapy Placements block */}
 {child.classification ==='Special'&& child.therapyProgress && (
 <div className="pt-4 border-t border-slate-100">
 <Label className="mb-2">Therapy Centre Placements & Progress details</Label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg">
 <span className="text-[9px] text-slate-400 uppercase block font-bold">Therapy Type</span>
 <span className="font-bold text-brand-cyan-800 block mt-0.5">{child.therapyProgress.therapyType}</span>
 </div>
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg">
 <span className="text-[9px] text-slate-400 uppercase block font-bold">Assigned Therapist</span>
 <span className="font-bold text-slate-800 block mt-0.5">{child.therapyProgress.assignedTherapist}</span>
 </div>
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg">
 <span className="text-[9px] text-slate-400 uppercase block font-bold">Sessions Completed / Left</span>
 <span className="font-bold text-slate-800 block mt-0.5">
 {child.therapyProgress.sessionsCompleted} / {child.therapyProgress.sessionsRemaining} remaining
 </span>
 </div>
 </div>
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg">
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Therapist Remarks</span>
 <p className="text-xs text-slate-700 mt-1 leading-relaxed font-semibold">
"{child.therapyProgress.therapistRemarks}"
 </p>
 </div>
 </div>
 )}
 </div>
 </Card>

 {/* Card C: Sponsorship Support & School Admission details */}
 <Card className="p-6">
 <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-4">
 III. Sponsorship support & School Admission ledger
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Sponsorship details */}
 <div>
 <Label className="mb-2">Active Sponsorship details</Label>
 {sponsorship ? (
 <div className="space-y-2.5 p-4 bg-slate-50/50 border border-slate-100/50 rounded-xl">
 <div className="flex justify-between items-center">
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Sponsor Name</span>
 <Badge color="success">Active Sponsorship</Badge>
 </div>
 <p className="font-bold text-slate-900 text-sm">{sponsorship.sponsorName}</p>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Coverage support Types</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {sponsorship.coverage.map((cov, idx) => (
 <Badge key={idx} color="slate"variant="soft"className="scale-90 origin-left">
 {cov}
 </Badge>
 ))}
 </div>
 </div>
 <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
 <span>Timeline: {sponsorship.startDate} to {sponsorship.endDate}</span>
 <span className="font-extrabold text-slate-900">₹{sponsorship.amount.toLocaleString()}</span>
 </div>
 </div>
 ) : (
 <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 italic">
 No active donor sponsorship assigned yet.
 </div>
 )}
 </div>

 {/* School Admission details */}
 <div>
 <Label className="mb-2">Mainstream School Admission details</Label>
 {child.schoolAdmission ? (
 <div className="space-y-2.5 p-4 bg-slate-50/50 border border-slate-100/50 rounded-xl">
 <div className="flex justify-between items-center">
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Mainstream School</span>
 <Badge 
 color={
 child.schoolAdmission.admissionStatus ==='Confirmed'?'success': 
 child.schoolAdmission.admissionStatus ==='Applied'?'primary':'warning'
 }
 >
 {child.schoolAdmission.admissionStatus}
 </Badge>
 </div>
 <p className="font-bold text-slate-900 text-xs leading-tight">{child.schoolAdmission.schoolName}</p>
 <div className="grid grid-cols-2 gap-2 text-[10px]">
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Type / Standard</span>
 <span className="font-semibold text-slate-800">
 {child.schoolAdmission.schoolType} • {child.schoolAdmission.standard}
 </span>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Fee Sponsored?</span>
 <span className="font-semibold text-slate-800">
 {child.schoolAdmission.feesSponsored ?`Yes (₹${child.schoolAdmission.feesSponsoredAmount})`:'No'}
 </span>
 </div>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Education Support Provided</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {child.schoolAdmission.educationSupportProvided?.map(item => (
 <Badge key={item} color="slate"variant="soft"className="scale-90 origin-left">
 {item}
 </Badge>
 ))}
 </div>
 </div>
 </div>
 ) : (
 <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 italic">
 Not yet admitted or registered in school admissions section.
 </div>
 )}
 </div>
 </div>
 </Card>
 </div>

 {/* Column 3: Journey Timeline, Charts, Uploads (Right side, Span 1) */}
 <div className="lg:col-span-1 space-y-6">
 
 {/* Timeline Node Journey Stepper Card */}
 <Card className="p-5">
 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-1.5 font-display">
 <Award className="h-4 w-4 text-brand-cyan-700"/> RENU Child Journey Stepper
 </h3>
 <RenuJourneyTracker
 currentStatus={child.journeyStatus}
 classification={child.classification}
 readOnly={true}
 />
 </Card>

 {/* Therapy Progress checklist Score chart */}
 {child.classification ==='Special'&& child.progressHistory && child.progressHistory.length > 0 && (
 <Card className="p-5">
 <h3 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5 font-display">
 <TrendingUp className="h-4 w-4 text-brand-cyan-700 animate-pulse"/> Therapy progress history
 </h3>
 <div className="h-40 w-full mb-1">
 <ResponsiveContainer width="100%"height="100%">
 <LineChart data={child.progressHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={isDark ?'#1e293b':'#f1f5f9'} />
 <XAxis dataKey="date"stroke={isDark ?'#64748b':'#94a3b8'} fontSize={8} />
 <YAxis stroke={isDark ?'#64748b':'#94a3b8'} fontSize={8} />
 <Tooltip contentStyle={{ background: isDark ?'#0f172a':'#ffffff', borderColor: isDark ?'#1e293b':'#e2e8f0', color: isDark ?'#f1f5f9':'#0f172a'}} />
 <Line type="monotone"dataKey="score"stroke="#0d9488"strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 <p className="text-[9px] text-slate-400 text-center font-medium mt-1">Progress milestones rating checklist history over time</p>
 </Card>
 )}

 {/* Interactive progress rating score slider (for coordinator/admin) */}
 {child.classification ==='Special'&& (
 <Card className="p-5">
 <Label className="mb-2">Milestones Progress Score Rating ({child.therapyProgressScore || 50}%)</Label>
 <div className="flex items-center gap-3">
 <input
 type="range"
 min="0"
 max="100"
 value={child.therapyProgressScore || 50}
 onChange={e => handleProgressChange(Number(e.target.value))}
 className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none"
 />
 <span className="font-extrabold text-slate-800 text-sm">{child.therapyProgressScore || 50}%</span>
 </div>
 </Card>
 )}

 {/* Camp screening attendance logs card */}
 <Card className="p-5">
 <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5 font-display">
 <Users className="h-4 w-4 text-brand-cyan-700"/> Camp screening attendance
 </h3>
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl flex items-center justify-between">
 <div>
 <span className="font-semibold text-slate-700 block">Screening attendance</span>
 <span className="text-[10px] text-slate-400 block mt-0.5">Checked at Camp ID: {child.campId ||'CAMP-300'}</span>
 </div>
 <Badge 
 color={child.attendanceStatus ==='Present'?'success': child.attendanceStatus ==='Absent'?'danger':'warning'} 
 className="font-bold px-2 py-0.5 text-xs flex items-center gap-1"
 >
 {child.attendanceStatus ==='Present'? (
 <>
 <CheckCircle className="h-3.5 w-3.5 text-white"/> Present
 </>
 ) : child.attendanceStatus ==='Absent'? (
 <>
 <XCircle className="h-3.5 w-3.5 text-white"/> Absent
 </>
 ) : (
'Pending Check'
 )}
 </Badge>
 </div>
 </Card>

 {/* Parent Communication Calls log Timeline */}
 <Card className="p-5">
 <div className="flex justify-between items-center mb-3">
 <h3 className="font-bold text-slate-900 flex items-center gap-1.5 font-display">
 <PhoneCall className="h-4 w-4 text-brand-cyan-700"/> Parent Communication log
 </h3>
 <Button size="sm"variant="outline"onClick={() => setIsFollowUpModalOpen(true)} className="py-0.5 px-2 text-[10px] cursor-pointer">
 Log Call/Visit
 </Button>
 </div>

 {followups.length === 0 ? (
 <p className="text-slate-400 italic text-center py-4">No follow-ups recorded.</p>
 ) : (
 <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
 {followups.map(f => (
 <div key={f.id} className="p-2.5 bg-slate-50/50 border border-slate-100/50 rounded-lg space-y-1.5">
 <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
 <span>{f.date}</span>
 <Badge color="primary"variant="soft"className="scale-90">{f.communicationType ||'Home Visit'}</Badge>
 </div>
 <p className="font-bold text-slate-800 leading-tight">Notes:"{f.notes}"</p>
 <p className="text-[10px] text-slate-500 italic">Discussion:"{f.parentDiscussion}"</p>
 {f.actionItems && (
 <p className="text-[9px] text-brand-cyan-800 font-semibold leading-normal">
 Action: {f.actionItems}
 </p>
 )}
 </div>
 ))}
 </div>
 )}
 </Card>

 {/* Document Uploads manager */}
 <Card className="p-5">
 <div className="flex justify-between items-center mb-3">
 <h3 className="font-bold text-slate-900 flex items-center gap-1.5 font-display">
 <FileCheck className="h-4 w-4 text-brand-cyan-700"/> Medical Reports & certificates
 </h3>
 <Button size="sm"variant="outline"onClick={() => setIsDocModalOpen(true)} className="py-0.5 px-2 text-[10px] cursor-pointer">
 Attach File
 </Button>
 </div>

 <div className="space-y-2">
 {!child.documents || child.documents.length === 0 ? (
 <p className="text-slate-400 italic text-center py-3">No documents filed yet.</p>
 ) : (
 child.documents.map(doc => (
 <div key={doc.id} className="p-2.5 bg-slate-50/50 border border-slate-100/50 rounded-lg flex items-center justify-between">
 <div className="min-w-0 pr-2">
 <div className="font-bold text-slate-800 truncate">{doc.name}</div>
 <div className="text-[9px] text-slate-400 mt-0.5">{doc.type} • {doc.date} • {doc.fileSize ||'1.0 MB'}</div>
 </div>
 <button
 type="button"
 onClick={() => handleDeleteDocument(doc.id)}
 className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
 >
 <Trash2 className="h-4 w-4"/>
 </button>
 </div>
 ))
 )}
 </div>
 </Card>
 </div>
 </div>

 {/* Log Visit Modal */}
 <Modal
 isOpen={isFollowUpModalOpen}
 onClose={() => setIsFollowUpModalOpen(false)}
 title={`Log Follow-Up for ${child.name}`}
 size="md"
 >
 <form onSubmit={handleFollowUpSubmit} className="space-y-4 text-xs">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <Label>Communication Type *</Label>
 <Select
 options={[
 { label:'Home Visit', value:'Home Visit'},
 { label:'Parent Call', value:'Call'},
 { label:'Parent Meeting', value:'Meeting'}
 ]}
 value={newFollowUp.communicationType}
 onChange={e => setNewFollowUp({ ...newFollowUp, communicationType: e.target.value as any })}
 required
 />
 </div>
 <div>
 <Label>Follow-Up Status *</Label>
 <Select
 options={[
 { label:'Completed', value:'Completed'},
 { label:'Pending', value:'Pending'}
 ]}
 value={newFollowUp.status}
 onChange={e => setNewFollowUp({ ...newFollowUp, status: e.target.value as any })}
 required
 />
 </div>
 </div>

 <div>
 <Label>Discussion Notes *</Label>
 <Textarea
 rows={2}
 placeholder="What was discussed during the visit/call with the parents..."
 value={newFollowUp.parentDiscussion}
 onChange={e => setNewFollowUp({ ...newFollowUp, parentDiscussion: e.target.value })}
 required
 />
 </div>

 <div>
 <Label>Child Progress notes *</Label>
 <Textarea
 rows={2}
 placeholder="Observations about child development progress..."
 value={newFollowUp.notes}
 onChange={e => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <Label>Issues Identified</Label>
 <Input
 placeholder="e.g. attention lapse, missing therapy"
 value={newFollowUp.issuesIdentified}
 onChange={e => setNewFollowUp({ ...newFollowUp, issuesIdentified: e.target.value })}
 />
 </div>
 <div>
 <Label>Current Recommendations</Label>
 <Input
 placeholder="e.g. increase weekly activity sessions"
 value={newFollowUp.recommendations}
 onChange={e => setNewFollowUp({ ...newFollowUp, recommendations: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
 <div>
 <Label>Action Items</Label>
 <Input
 placeholder="e.g. Parent to fetch certificate"
 value={newFollowUp.actionItems}
 onChange={e => setNewFollowUp({ ...newFollowUp, actionItems: e.target.value })}
 />
 </div>
 <div>
 <Label>Next Follow-Up Plan</Label>
 <Input
 placeholder="e.g. Evaluate school readiness milestones next visit"
 value={newFollowUp.nextFollowUpPlan}
 onChange={e => setNewFollowUp({ ...newFollowUp, nextFollowUpPlan: e.target.value })}
 />
 </div>
 </div>

 <div>
 <Label>Next Appointment Date</Label>
 <Input
 type="date"
 value={newFollowUp.nextFollowUpDate}
 onChange={e => setNewFollowUp({ ...newFollowUp, nextFollowUpDate: e.target.value })}
 />
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => setIsFollowUpModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit">
 Save Follow-Up log
 </Button>
 </div>
 </form>
 </Modal>

 {/* Enroll Therapy Centre Modal */}
 <Modal
 isOpen={isAllocateCentreOpen}
 onClose={() => setIsAllocateCentreOpen(false)}
 title="Enroll Child in Therapy Centre"
 size="md"
 >
 <form onSubmit={handleAllocateCentre} className="space-y-4 text-xs">
 <div>
 <Label>Select Therapy Centre *</Label>
 <Select
 options={allCentres.map(tc => ({ label:`${tc.name} (${tc.services.join(',')})`, value: tc.id }))}
 value={selectedCentreId}
 onChange={e => setSelectedCentreId(e.target.value)}
 required
 />
 </div>

 <div>
 <Label>Assigned Therapist *</Label>
 <Input
 placeholder="e.g. Therapist Sneha Joshi"
 value={assignedTherapist}
 onChange={e => setAssignedTherapist(e.target.value)}
 required
 />
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => setIsAllocateCentreOpen(false)}>
 Cancel
 </Button>
 <Button type="submit">
 Log Centre Placements
 </Button>
 </div>
 </form>
 </Modal>

 {/* Upload Document Modal */}
 <Modal
 isOpen={isDocModalOpen}
 onClose={() => setIsDocModalOpen(false)}
 title="Upload Document File"
 size="md"
 >
 <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
 <div>
 <Label>Document Category *</Label>
 <Select
 options={[
 { label:'Medical Evaluation Report', value:'Medical Report'},
 { label:'Pediatrics Assessment Report', value:'Assessment Report'},
 { label:'Government Disability Certificate', value:'Disability Certificate'},
 { label:'Therapist Recommendation Plan', value:'Therapy Recommendation'}
 ]}
 value={docForm.type}
 onChange={e => setDocForm({ ...docForm, type: e.target.value as any })}
 required
 />
 </div>

 <div>
 <Label>Report File Name *</Label>
 <Input
 placeholder="e.g. government_certificate_signed"
 value={docForm.name}
 onChange={e => setDocForm({ ...docForm, name: e.target.value })}
 required
 />
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => setIsDocModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit">
 Attach Report Document
 </Button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
export default ChildProfile;
