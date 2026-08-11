import React, { useState, useEffect } from'react';
import { useParams, useNavigate } from'react-router-dom';
import { RenuStore } from'../data/renuStore';
import { useRole } from'../../../hooks/useRole';
import { showToast } from'../../../hooks/useToast';
import { Child, FollowUp, Diagnosis, TherapyCentre, Sponsorship, ChildJourneyStatus, MockDocument, SchoolAdmissionDetails, TherapyProgressDetails } from'../types';
import { Card, Badge, Button, Input, Select, Label, Textarea, Modal } from'../../../components/ui';
import { RenuJourneyTracker } from'../../../components/common/RenuJourneyTracker';
import {
 User, Phone, Home, GraduationCap, Calendar, Heart, Stethoscope, Building2, Coins, Plus,
 CheckCircle, FileCheck, ChevronLeft, FileText, Clock, Trash2, Upload, Activity, Award,
 PhoneCall, Users, CheckSquare, ShieldCheck, XCircle, TrendingUp
} from'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from'recharts';
import LoadingSkeleton from'../../../components/feedback/LoadingSkeleton';
import EmptyState from'../../../components/common/EmptyState';

export const ChildProfile: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { role, isAdmin } = useRole();

 // Theme state for Recharts
 const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
 const [activeTab, setActiveTab] = useState('assessment');

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

  const saveChildUpdates = (updates: Partial<Child>) => {
    if (!child) return;
    const allChildren = RenuStore.getChildren();
    const updatedChild = { ...child, ...updates } as Child;
    const newChildren = allChildren.map(c => c.id === child.id ? updatedChild : c);
    RenuStore.saveChildren(newChildren);
    setChild(updatedChild);
    showToast('Saved', 'success');
    window.dispatchEvent(new Event('renu_data_updated'));
  };

  const FakeUpload = ({ onUpload, status }: { onUpload: (name: string) => void, status?: string }) => {
    const uploadRef = React.useRef<HTMLInputElement>(null);
    return (
      <div className="flex items-center gap-2 mt-1">
        <input type="file" className="hidden" ref={uploadRef} onChange={e => {
          if (e.target.files?.[0]) onUpload('Uploaded: ' + e.target.files[0].name);
        }} />
        <Button type="button" size="sm" variant="outline" onClick={() => uploadRef.current?.click()} className="text-[10px] py-1 h-auto">
          <Upload className="h-3 w-3 mr-1" /> Upload File
        </Button>
        {status && <Badge color="success" className="text-[10px]">{status}</Badge>}
      </div>
    );
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

 {/* NEW TABS SECTION */}
  <Card className="p-0 overflow-hidden">
    <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
      {['assessment', 'medical', 'iep', 'financial', 'devices', 'homevisit'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-3 text-sm font-bold capitalize transition-colors ${
            activeTab === tab ? 'text-brand-cyan-700 border-b-2 border-brand-cyan-700 bg-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab === 'homevisit' ? 'Parent & Home Visit Log' : 
           tab === 'medical' ? 'Medical Records' : 
           tab === 'iep' ? 'IEP' : 
           tab === 'financial' ? 'Financial Support' : 
           tab === 'devices' ? 'Assistive Devices' : 'Assessment'}
        </button>
      ))}
    </div>
    <div className="p-6 bg-white min-h-[400px]">
      
      {/* TAB 1: ASSESSMENT */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Assessment Records</h3>
            <Button size="sm" onClick={() => {
              const newAssessment = { type: 'IQ' as const, date: new Date().toISOString().split('T')[0] };
              saveChildUpdates({ assessments: [...(child.assessments || []), newAssessment] });
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add Assessment
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(child.assessments || []).map((assessment, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                <button onClick={() => {
                  const newArr = [...(child.assessments || [])];
                  newArr.splice(idx, 1);
                  saveChildUpdates({ assessments: newArr });
                }} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-[10px]">Type</Label>
                    <Select 
                      options={[{label: 'IQ', value: 'IQ'}, {label: 'Functional', value: 'Functional'}, {label: 'Behaviour', value: 'Behaviour'}, {label: 'Motor', value: 'Motor'}]}
                      value={assessment.type}
                      onChange={e => {
                        const newArr = [...(child.assessments || [])];
                        newArr[idx].type = e.target.value as any;
                        saveChildUpdates({ assessments: newArr });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Date</Label>
                    <Input type="date" value={assessment.date} onChange={e => {
                      const newArr = [...(child.assessments || [])];
                      newArr[idx].date = e.target.value;
                      saveChildUpdates({ assessments: newArr });
                    }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-[10px]">Tool Used</Label>
                    <Select 
                      options={[{label: 'Binet-Kamat', value: 'Binet-Kamat'}, {label: 'Vineland', value: 'Vineland'}, {label: 'Other', value: 'Other'}]}
                      value={assessment.toolUsed || ''}
                      onChange={e => {
                        const newArr = [...(child.assessments || [])];
                        newArr[idx].toolUsed = e.target.value;
                        saveChildUpdates({ assessments: newArr });
                      }}
                    />
                  </div>
                  {assessment.type === 'IQ' && (
                    <div>
                      <Label className="text-[10px]">Score</Label>
                      <Input type="number" value={assessment.score || ''} onChange={e => {
                        const newArr = [...(child.assessments || [])];
                        newArr[idx].score = Number(e.target.value);
                        saveChildUpdates({ assessments: newArr });
                      }} />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[10px]">Finding / Result</Label>
                    <Input value={assessment.finding || ''} onChange={e => {
                      const newArr = [...(child.assessments || [])];
                      newArr[idx].finding = e.target.value;
                      saveChildUpdates({ assessments: newArr });
                    }} />
                  </div>
                  <div>
                    <Label className="text-[10px]">Conducted By</Label>
                    <Input value={assessment.conductedBy || ''} onChange={e => {
                      const newArr = [...(child.assessments || [])];
                      newArr[idx].conductedBy = e.target.value;
                      saveChildUpdates({ assessments: newArr });
                    }} />
                  </div>
                  <div>
                    <Label className="text-[10px]">Remarks</Label>
                    <Textarea rows={2} value={assessment.remarks || ''} onChange={e => {
                      const newArr = [...(child.assessments || [])];
                      newArr[idx].remarks = e.target.value;
                      saveChildUpdates({ assessments: newArr });
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <Label>Assessment Report Document</Label>
            <FakeUpload 
              status={child.assessmentReportStatus} 
              onUpload={(status) => saveChildUpdates({ assessmentReportStatus: status })} 
            />
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAL RECORDS */}
      {activeTab === 'medical' && (
        <div className="space-y-8">
          {/* Scans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Scan Records (MRI/CT/EEG)</h3>
              <Button size="sm" onClick={() => {
                const newScan = { date: '', type: 'MRI', finding: '', centre: '', doctor: '' };
                const scans = [...(child.medicalRecords?.scans || []), newScan];
                saveChildUpdates({ medicalRecords: { ...child.medicalRecords, scans } });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Scan
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.medicalRecords?.scans || []).map((scan, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                   <div className="grid grid-cols-2 gap-3 mb-3">
                     <div>
                       <Label className="text-[10px]">Date</Label>
                       <Input type="date" value={scan.date} onChange={e => {
                         const scans = [...(child.medicalRecords?.scans || [])];
                         scans[idx].date = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, scans } });
                       }} />
                     </div>
                     <div>
                       <Label className="text-[10px]">Type</Label>
                       <Select 
                         options={[{label: 'MRI', value: 'MRI'}, {label: 'CT', value: 'CT'}, {label: 'EEG', value: 'EEG'}, {label: 'Other', value: 'Other'}]}
                         value={scan.type}
                         onChange={e => {
                           const scans = [...(child.medicalRecords?.scans || [])];
                           scans[idx].type = e.target.value;
                           saveChildUpdates({ medicalRecords: { ...child.medicalRecords, scans } });
                         }}
                       />
                     </div>
                   </div>
                   <div className="space-y-3 mb-3">
                     <div>
                       <Label className="text-[10px]">Finding</Label>
                       <Input value={scan.finding} onChange={e => {
                         const scans = [...(child.medicalRecords?.scans || [])];
                         scans[idx].finding = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, scans } });
                       }} />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <Label className="text-[10px]">Centre</Label>
                         <Input value={scan.centre} onChange={e => {
                           const scans = [...(child.medicalRecords?.scans || [])];
                           scans[idx].centre = e.target.value;
                           saveChildUpdates({ medicalRecords: { ...child.medicalRecords, scans } });
                         }} />
                       </div>
                       <div>
                         <Label className="text-[10px]">Doctor</Label>
                         <Input value={scan.doctor} onChange={e => {
                           const scans = [...(child.medicalRecords?.scans || [])];
                           scans[idx].doctor = e.target.value;
                           saveChildUpdates({ medicalRecords: { ...child.medicalRecords, scans } });
                         }} />
                       </div>
                     </div>
                   </div>
                   <div className="pt-2 border-t border-slate-200">
                     <Label className="text-[10px]">Scan Report</Label>
                     <FakeUpload 
                       status={scan.scanDocumentStatus} 
                       onUpload={(status) => {
                         const scans = [...(child.medicalRecords?.scans || [])];
                         scans[idx].scanDocumentStatus = status;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, scans } });
                       }} 
                     />
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Prescription Records</h3>
              <Button size="sm" onClick={() => {
                const newRecord = { date: '', doctorName: '', medicines: '', notes: '' };
                const prescriptions = [...(child.medicalRecords?.prescriptions || []), newRecord];
                saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Prescription
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.medicalRecords?.prescriptions || []).map((rx, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <Label className="text-[10px]">Date</Label>
                       <Input type="date" value={rx.date} onChange={e => {
                         const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                         prescriptions[idx].date = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                       }} />
                     </div>
                     <div>
                       <Label className="text-[10px]">Doctor Name</Label>
                       <Input value={rx.doctorName} onChange={e => {
                         const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                         prescriptions[idx].doctorName = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                       }} />
                     </div>
                   </div>
                   <div>
                     <Label className="text-[10px]">Medicines</Label>
                     <Textarea rows={2} value={rx.medicines} onChange={e => {
                       const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                       prescriptions[idx].medicines = e.target.value;
                       saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                     }} />
                   </div>
                   <div>
                     <Label className="text-[10px]">Notes</Label>
                     <Input value={rx.notes} onChange={e => {
                       const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                       prescriptions[idx].notes = e.target.value;
                       saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                     }} />
                   </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Immunisations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Immunisation</h3>
              <Button size="sm" onClick={() => {
                const newRecord = { vaccineName: '', dateGiven: '', nextDueDate: '' };
                const immunisations = [...(child.medicalRecords?.immunisations || []), newRecord];
                saveChildUpdates({ medicalRecords: { ...child.medicalRecords, immunisations } });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Vaccine
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(child.medicalRecords?.immunisations || []).map((vac, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                   <div>
                     <Label className="text-[10px]">Vaccine Name</Label>
                     <Input value={vac.vaccineName} onChange={e => {
                       const immunisations = [...(child.medicalRecords?.immunisations || [])];
                       immunisations[idx].vaccineName = e.target.value;
                       saveChildUpdates({ medicalRecords: { ...child.medicalRecords, immunisations } });
                     }} />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <Label className="text-[10px]">Date Given</Label>
                       <Input type="date" value={vac.dateGiven} onChange={e => {
                         const immunisations = [...(child.medicalRecords?.immunisations || [])];
                         immunisations[idx].dateGiven = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, immunisations } });
                       }} />
                     </div>
                     <div>
                       <Label className="text-[10px]">Next Due</Label>
                       <Input type="date" value={vac.nextDueDate} onChange={e => {
                         const immunisations = [...(child.medicalRecords?.immunisations || [])];
                         immunisations[idx].nextDueDate = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, immunisations } });
                       }} />
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IEP */}
      {activeTab === 'iep' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Plan Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan Period From</Label>
                  <Input type="date" value={child.iepRecords?.planPeriodFrom || ''} onChange={e => {
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, planPeriodFrom: e.target.value } as any });
                  }} />
                </div>
                <div>
                  <Label>Plan Period To</Label>
                  <Input type="date" value={child.iepRecords?.planPeriodTo || ''} onChange={e => {
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, planPeriodTo: e.target.value } as any });
                  }} />
                </div>
              </div>
              <div>
                <Label>IEP Document</Label>
                <FakeUpload 
                  status={child.iepRecords?.documentStatus} 
                  onUpload={(status) => saveChildUpdates({ iepRecords: { ...child.iepRecords, documentStatus: status } as any })} 
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Quarterly Reviews</h3>
                <Button size="sm" onClick={() => {
                  const newReview = { date: '', reviewedBy: '', achievementPercent: 0, remarks: '' };
                  const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || []), newReview];
                  saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                }}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {(child.iepRecords?.quarterlyReviews || []).map((rev, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <Input type="date" value={rev.date} className="w-32 h-6 text-xs p-1" onChange={e => {
                        const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                        quarterlyReviews[idx].date = e.target.value;
                        saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                      }} />
                      <div className="flex items-center gap-2">
                        <Label className="mb-0 text-[10px]">Achieved %:</Label>
                        <Input type="number" value={rev.achievementPercent} className="w-16 h-6 text-xs p-1" onChange={e => {
                          const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                          quarterlyReviews[idx].achievementPercent = Number(e.target.value);
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                        }} />
                      </div>
                    </div>
                    <Input placeholder="Reviewed By" value={rev.reviewedBy} className="h-6 text-xs p-1 mb-2" onChange={e => {
                      const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                      quarterlyReviews[idx].reviewedBy = e.target.value;
                      saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                    }} />
                    <Input placeholder="Remarks" value={rev.remarks} className="h-6 text-xs p-1" onChange={e => {
                      const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                      quarterlyReviews[idx].remarks = e.target.value;
                      saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Short Term Goals</Label>
                <Button size="sm" variant="outline" className="py-1 h-6 text-[10px]" onClick={() => {
                  const goals = [...(child.iepRecords?.shortTermGoals || []), { goal: '', achieved: false }];
                  saveChildUpdates({ iepRecords: { ...child.iepRecords, shortTermGoals: goals } as any });
                }}>Add Goal</Button>
              </div>
              {(child.iepRecords?.shortTermGoals || []).map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="checkbox" checked={goal.achieved} onChange={e => {
                    const goals = [...(child.iepRecords?.shortTermGoals || [])];
                    goals[idx].achieved = e.target.checked;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, shortTermGoals: goals } as any });
                  }} className="h-4 w-4 rounded border-slate-300" />
                  <Input value={goal.goal} placeholder="Goal description" onChange={e => {
                    const goals = [...(child.iepRecords?.shortTermGoals || [])];
                    goals[idx].goal = e.target.value;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, shortTermGoals: goals } as any });
                  }} />
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Long Term Goals</Label>
                <Button size="sm" variant="outline" className="py-1 h-6 text-[10px]" onClick={() => {
                  const goals = [...(child.iepRecords?.longTermGoals || []), { goal: '', achieved: false }];
                  saveChildUpdates({ iepRecords: { ...child.iepRecords, longTermGoals: goals } as any });
                }}>Add Goal</Button>
              </div>
              {(child.iepRecords?.longTermGoals || []).map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="checkbox" checked={goal.achieved} onChange={e => {
                    const goals = [...(child.iepRecords?.longTermGoals || [])];
                    goals[idx].achieved = e.target.checked;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, longTermGoals: goals } as any });
                  }} className="h-4 w-4 rounded border-slate-300" />
                  <Input value={goal.goal} placeholder="Goal description" onChange={e => {
                    const goals = [...(child.iepRecords?.longTermGoals || [])];
                    goals[idx].goal = e.target.value;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, longTermGoals: goals } as any });
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL SUPPORT */}
      {activeTab === 'financial' && (
        <div className="max-w-2xl mx-auto p-6 bg-slate-50 border border-slate-100 rounded-xl">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-6">Financial Support Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Funding Source</Label>
                <Select 
                  options={[{label: 'CSR', value: 'CSR'}, {label: 'Government', value: 'Govt'}, {label: 'NGO', value: 'NGO'}, {label: 'Individual Donor', value: 'Donor'}, {label: 'Self', value: 'Self'}]}
                  value={child.financialSupport?.fundingSource || ''}
                  onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, fundingSource: e.target.value } as any })}
                />
              </div>
              <div>
                <Label>Donor/Company Name</Label>
                <Input value={child.financialSupport?.donorName || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, donorName: e.target.value } as any })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Amount Sanctioned</Label>
                <Input type="number" value={child.financialSupport?.amountSanctioned || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, amountSanctioned: Number(e.target.value) } as any })} />
              </div>
              <div>
                <Label>Amount Received</Label>
                <Input type="number" value={child.financialSupport?.amountReceived || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, amountReceived: Number(e.target.value) } as any })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input value={child.financialSupport?.contactPerson || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, contactPerson: e.target.value } as any })} />
              </div>
              <div>
                <Label>Contact Mobile</Label>
                <Input value={child.financialSupport?.contactMobile || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, contactMobile: e.target.value } as any })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Grant Start Date</Label>
                <Input type="date" value={child.financialSupport?.grantPeriodStart || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, grantPeriodStart: e.target.value } as any })} />
              </div>
              <div>
                <Label>Grant End Date</Label>
                <Input type="date" value={child.financialSupport?.grantPeriodEnd || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, grantPeriodEnd: e.target.value } as any })} />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-200">
              <Label>Grant Letter Document</Label>
              <FakeUpload 
                status={child.financialSupport?.documentStatus} 
                onUpload={(status) => saveChildUpdates({ financialSupport: { ...child.financialSupport, documentStatus: status } as any })} 
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ASSISTIVE DEVICES */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Assistive Devices</h3>
            <Button size="sm" onClick={() => {
              const newDevice = { deviceType: 'Wheelchair', brandModel: '', issuedDate: '', warrantyUntil: '', issuedBy: '' };
              saveChildUpdates({ assistiveDevices: [...(child.assistiveDevices || []), newDevice] });
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add Device
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(child.assistiveDevices || []).map((device, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                <button onClick={() => {
                  const newArr = [...(child.assistiveDevices || [])];
                  newArr.splice(idx, 1);
                  saveChildUpdates({ assistiveDevices: newArr });
                }} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-[10px]">Device Type</Label>
                    <Select 
                      options={[{label: 'Wheelchair', value: 'Wheelchair'}, {label: 'Hearing Aid', value: 'Hearing Aid'}, {label: 'Crutches', value: 'Crutches'}, {label: 'Communication Device', value: 'Communication Device'}, {label: 'Spectacles', value: 'Spectacles'}, {label: 'Other', value: 'Other'}]}
                      value={device.deviceType}
                      onChange={e => {
                        const newArr = [...(child.assistiveDevices || [])];
                        newArr[idx].deviceType = e.target.value;
                        saveChildUpdates({ assistiveDevices: newArr });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Brand / Model</Label>
                    <Input value={device.brandModel} onChange={e => {
                      const newArr = [...(child.assistiveDevices || [])];
                      newArr[idx].brandModel = e.target.value;
                      saveChildUpdates({ assistiveDevices: newArr });
                    }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label className="text-[10px]">Issued Date</Label>
                    <Input type="date" value={device.issuedDate} onChange={e => {
                      const newArr = [...(child.assistiveDevices || [])];
                      newArr[idx].issuedDate = e.target.value;
                      saveChildUpdates({ assistiveDevices: newArr });
                    }} />
                  </div>
                  <div>
                    <Label className="text-[10px]">Warranty Until</Label>
                    <Input type="date" value={device.warrantyUntil} onChange={e => {
                      const newArr = [...(child.assistiveDevices || [])];
                      newArr[idx].warrantyUntil = e.target.value;
                      saveChildUpdates({ assistiveDevices: newArr });
                    }} />
                  </div>
                </div>
                <div className="mb-3">
                  <Label className="text-[10px]">Issued By (Organisation)</Label>
                  <Input value={device.issuedBy} onChange={e => {
                    const newArr = [...(child.assistiveDevices || [])];
                    newArr[idx].issuedBy = e.target.value;
                    saveChildUpdates({ assistiveDevices: newArr });
                  }} />
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <Label className="text-[10px]">Device Photo</Label>
                  <FakeUpload 
                    status={device.photoStatus} 
                    onUpload={(status) => {
                      const newArr = [...(child.assistiveDevices || [])];
                      newArr[idx].photoStatus = status;
                      saveChildUpdates({ assistiveDevices: newArr });
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PARENT & HOME VISIT LOG */}
      {activeTab === 'homevisit' && (
        <div className="space-y-8">
          {/* Counselling Log */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Counselling Log</h3>
              <Button size="sm" onClick={() => {
                const newLog = { type: 'Counselling' as const, date: '', staffName: '', topicOrObservations: '', notesOrRecommendations: '', nextDate: '' };
                saveChildUpdates({ homeVisitRecords: [...(child.homeVisitRecords || []), newLog] });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Session
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.homeVisitRecords || []).filter(r => r.type === 'Counselling').map((log, idx, arr) => {
                const globalIdx = child.homeVisitRecords!.indexOf(log);
                return (
                  <div key={globalIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Date</Label>
                        <Input type="date" value={log.date} onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].date = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Counsellor Name</Label>
                        <Input value={log.staffName} onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].staffName = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px]">Topic</Label>
                      <Input value={log.topicOrObservations} onChange={e => {
                        const records = [...(child.homeVisitRecords || [])];
                        records[globalIdx].topicOrObservations = e.target.value;
                        saveChildUpdates({ homeVisitRecords: records });
                      }} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Notes</Label>
                      <Textarea rows={2} value={log.notesOrRecommendations} onChange={e => {
                        const records = [...(child.homeVisitRecords || [])];
                        records[globalIdx].notesOrRecommendations = e.target.value;
                        saveChildUpdates({ homeVisitRecords: records });
                      }} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Next Session Date</Label>
                      <Input type="date" value={log.nextDate} onChange={e => {
                        const records = [...(child.homeVisitRecords || [])];
                        records[globalIdx].nextDate = e.target.value;
                        saveChildUpdates({ homeVisitRecords: records });
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Home Visit Log */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Home Visit Log</h3>
              <Button size="sm" onClick={() => {
                const newLog = { type: 'Home Visit' as const, date: '', staffName: '', topicOrObservations: '', notesOrRecommendations: '', rating: 3, nextDate: '' };
                saveChildUpdates({ homeVisitRecords: [...(child.homeVisitRecords || []), newLog] });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Visit
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.homeVisitRecords || []).filter(r => r.type === 'Home Visit').map((log, idx) => {
                const globalIdx = child.homeVisitRecords!.indexOf(log);
                return (
                  <div key={globalIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Date</Label>
                        <Input type="date" value={log.date} onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].date = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} />
                      </div>
                      <div>
                        <Label className="text-[10px]">Visited By</Label>
                        <Input value={log.staffName} onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].staffName = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px]">Observations</Label>
                      <Textarea rows={2} value={log.topicOrObservations} onChange={e => {
                        const records = [...(child.homeVisitRecords || [])];
                        records[globalIdx].topicOrObservations = e.target.value;
                        saveChildUpdates({ homeVisitRecords: records });
                      }} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Recommendations</Label>
                      <Textarea rows={2} value={log.notesOrRecommendations} onChange={e => {
                        const records = [...(child.homeVisitRecords || [])];
                        records[globalIdx].notesOrRecommendations = e.target.value;
                        saveChildUpdates({ homeVisitRecords: records });
                      }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Home Env. Rating (1-5)</Label>
                        <Select 
                          options={[{label: '1 Star', value: '1'}, {label: '2 Stars', value: '2'}, {label: '3 Stars', value: '3'}, {label: '4 Stars', value: '4'}, {label: '5 Stars', value: '5'}]}
                          value={log.rating?.toString()}
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            records[globalIdx].rating = Number(e.target.value);
                            saveChildUpdates({ homeVisitRecords: records });
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Next Visit</Label>
                        <Input type="date" value={log.nextDate} onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].nextDate = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  </Card>

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
