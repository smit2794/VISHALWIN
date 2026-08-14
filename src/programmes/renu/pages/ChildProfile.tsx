import React, { useState, useEffect } from'react';
import { useParams, useNavigate } from'react-router-dom';
import { RenuStore } from'../data/renuStore';
import { useRole } from'../../../hooks/useRole';
import { showToast } from'../../../hooks/useToast';
import { Child, FollowUp, Diagnosis, TherapyCentre, Sponsorship, ChildJourneyStatus, MockDocument, SchoolAdmissionDetails, TherapyProgressDetails, FamilyDetails, AssessmentRecord, DevelopmentalMilestone, VolunteerVisit } from '../types';
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
        {child.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl md:text-2xl font-display font-extrabold text-slate-900">{child.name}</h1>
          <Badge color={child.classification === 'Special' ? 'danger' : 'success'} className="font-bold">
            {child.classification === 'Special' ? 'Special Child' : 'Normal Child'}
          </Badge>
          <Badge color="primary" className="font-mono font-bold text-xs">
            ID: {child.id}
          </Badge>
          <Badge color={child.enrollmentDetails?.currentStatus === 'Active' ? 'success' : 'warning'} className="text-xs">
            E.2 Status: {child.enrollmentDetails?.currentStatus || 'Active'}
          </Badge>
        </div>
        
        <p className="text-xs text-slate-500 mt-1 font-semibold flex flex-wrap items-center gap-3">
          <span>DOB: {child.dob} (Age {child.age} yrs)</span>
          <span>•</span>
          <span>Gender: {child.gender}</span>
          <span>•</span>
          <span className="text-indigo-700 font-bold">📅 E.1 Admitted: {child.enrollmentDetails?.admissionDate || '14/08/2026'}</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">👤 E.8 Worker: {child.enrollmentDetails?.assignedCoordinator || 'Dr. Rajesh Patel'}</span>
          {child.enrollmentDetails?.annualRenewalDate && (
            <>
              <span>•</span>
              <span className="text-amber-700 font-bold">🔄 E.9 Renewal: {child.enrollmentDetails?.annualRenewalDate}</span>
            </>
          )}
        </p>
      </div>
    </div>

    {/* Quick advance stepper actions */}
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer">
        <ChevronLeft className="h-4 w-4"/> Directory
      </Button>
      {child.classification === 'Special' && (
        <div className="flex gap-2">
          <Select
            options={[
              { label: 'Set Journey Step...', value: '' },
              { label: 'Medical Camp', value: 'Medical Camp' },
              { label: 'Screening', value: 'Screening' },
              { label: 'Child Classification', value: 'Child Classification' },
              { label: 'Follow-Up', value: 'Follow-Up' },
              { label: 'Diagnosis', value: 'Diagnosis' },
              { label: 'Therapy Centre Enrollment', value: 'Therapy Centre Enrollment' },
              { label: 'Sponsorship Support', value: 'Sponsorship Support' },
              { label: 'Active Therapy', value: 'Active Therapy' },
              { label: 'Progress Tracking', value: 'Progress Tracking' },
              { label: 'School Ready', value: 'School Ready' },
              { label: 'School Admission', value: 'School Admission' }
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
 
  {/* Card A: Section B Demographics, Physical & Family Background */}
  <Card className="p-6">
    <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-4">
      I. Demographics, Physical & Contact Details (Section B Master Profile)
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Demographics & Physical Grid */}
      <div>
        <Label className="mb-2">Demographics & Physical Profile</Label>
        <div className="space-y-3 p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-xl">
          <div className="flex gap-4 items-center">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">UDID No.</Label>
                <Input value={child.udidNo || ''} onChange={e => saveChildUpdates({ udidNo: e.target.value })} className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Blood Group</Label>
                <Input value={child.bloodGroup || ''} onChange={e => saveChildUpdates({ bloodGroup: e.target.value })} className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Mother Tongue</Label>
                <Input value={child.motherTongue || ''} onChange={e => saveChildUpdates({ motherTongue: e.target.value })} className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Home Language</Label>
                <Input value={child.languageSpokenAtHome || ''} onChange={e => saveChildUpdates({ languageSpokenAtHome: e.target.value })} className="h-7 text-xs" />
              </div>
            </div>
            <div className="w-24 text-center">
              <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 mx-auto flex items-center justify-center overflow-hidden bg-slate-100">
                {child.photo && child.photo.startsWith('http') ? <img src={child.photo} className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-slate-400" />}
              </div>
              <div className="mt-1">
                <FakeUpload status={child.photo ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ photo: status })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px]">Weight (kg)</Label>
              <Input type="number" value={child.weightKg || ''} onChange={e => saveChildUpdates({ weightKg: Number(e.target.value) })} className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Height (cm)</Label>
              <Input type="number" value={child.heightCm || ''} onChange={e => saveChildUpdates({ heightCm: Number(e.target.value) })} className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Religion</Label>
              <Input value={child.religion || ''} onChange={e => saveChildUpdates({ religion: e.target.value })} className="h-7 text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-[10px]">Identification Mark</Label>
            <Input value={child.identificationMark || ''} onChange={e => saveChildUpdates({ identificationMark: e.target.value })} className="h-7 text-xs" placeholder="e.g. Birthmark on left shoulder" />
          </div>

          <div>
            <Label className="text-[10px]">Describe Condition of Child</Label>
            <Textarea value={child.childConditionDescription || ''} onChange={e => saveChildUpdates({ childConditionDescription: e.target.value })} className="text-xs min-h-14" placeholder="Narrative description of child's condition..." />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Registration Source</Label>
              <Select 
                className="h-9 text-xs py-1.5"
                value={child.registrationSource || ''} 
                onChange={e => saveChildUpdates({ registrationSource: e.target.value as any })}
                options={[{label: 'Select Source', value: ''}, 'Medical Camp', 'Helpline', 'Field Visit', 'NGO Request', 'School', 'Hospital', 'Government', 'Parent Walk-in', 'Reference', 'Other'].map(o => typeof o === 'string' ? {label: o, value: o} : o)}
              />
            </div>
            <div>
              <Label className="text-[10px]">Registration Place</Label>
              <Input value={child.registrationPlace || ''} onChange={e => saveChildUpdates({ registrationPlace: e.target.value })} className="h-9 text-xs py-1.5" placeholder="e.g. Primary Health Centre" />
            </div>
          </div>

          {/* Section E Onboarding & Enrollment Overview */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-900 uppercase block tracking-wider">
              Section E — Onboarding & Enrollment Summary
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[9px]">E.1 Admission Date</Label>
                <Input
                  type="date"
                  className="h-8 text-xs py-1"
                  value={child.enrollmentDetails?.admissionDate || '2026-08-14'}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, admissionDate: e.target.value } })}
                />
              </div>
              <div>
                <Label className="text-[9px]">E.2 Enrollment Status</Label>
                <Select
                  className="h-8 text-xs py-1"
                  value={child.enrollmentDetails?.currentStatus || 'Active'}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, currentStatus: e.target.value as any } })}
                  options={['Active', 'Hold', 'Completed', 'Dropout', 'Shifted', 'Expired'].map(o => ({ label: o, value: o }))}
                />
              </div>
              <div>
                <Label className="text-[9px]">E.8 Case Coordinator</Label>
                <Select
                  className="h-8 text-xs py-1"
                  value={child.enrollmentDetails?.assignedCoordinator || 'Dr. Rajesh Patel (Lead Coordinator)'}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, assignedCoordinator: e.target.value } })}
                  options={[
                    'Dr. Rajesh Patel (Lead Coordinator)',
                    'Sunita Sharma (Field Social Worker)',
                    'Vikram Mehta (Therapy Manager)',
                    'Ananya Roy (Clinical Psychologist)'
                  ].map(c => ({ label: c, value: c }))}
                />
              </div>
              <div>
                <Label className="text-[9px]">E.9 Annual Renewal Date</Label>
                <Input
                  type="date"
                  className="h-8 text-xs py-1"
                  value={child.enrollmentDetails?.annualRenewalDate || ''}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, annualRenewalDate: e.target.value } })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Extended Family Background */}
      <div>
        <Label className="mb-2">Address & Family Background</Label>
        <div className="space-y-3 p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-xl">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase">District & Location</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div><Label className="text-[9px]">District</Label><Input value={child.district || ''} onChange={e => saveChildUpdates({ district: e.target.value })} className="h-6 text-[10px]" /></div>
              <div><Label className="text-[9px]">City</Label><Input value={child.city || ''} onChange={e => saveChildUpdates({ city: e.target.value })} className="h-6 text-[10px]" /></div>
            </div>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Street Address & Area</span>
            <div className="space-y-1 mt-1">
              <Input value={child.address || ''} onChange={e => saveChildUpdates({ address: e.target.value })} className="h-6 text-[10px]" placeholder="Full street address" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={child.area || ''} onChange={e => saveChildUpdates({ area: e.target.value })} className="h-6 text-[10px]" placeholder="Area" />
                <Input value={child.pincode || ''} onChange={e => saveChildUpdates({ pincode: e.target.value })} className="h-6 text-[10px]" placeholder="Pincode" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
            <div>
              <Label className="text-[9px]">Family Type</Label>
              <Select className="h-6 text-[10px]" value={child.familyDetails?.familyType || 'Nuclear'} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, familyType: e.target.value as any } })} options={['Nuclear', 'Joint', 'Single Parent'].map(o => ({label: o, value: o}))} />
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              <input type="checkbox" checked={child.familyDetails?.consanguineousMarriage || false} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, consanguineousMarriage: e.target.checked } })} id="consanguineous" />
              <label htmlFor="consanguineous" className="text-[10px] font-semibold text-slate-700 cursor-pointer">Marriage in Relative</label>
            </div>
          </div>

          <div>
            <Label className="text-[9px]">Interested Household Members</Label>
            <Input value={child.familyDetails?.interestedHouseholdMembers || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, interestedHouseholdMembers: e.target.value } })} className="h-6 text-[10px]" placeholder="e.g. Grandmother assists with care" />
          </div>

          <div>
            <Label className="text-[9px]">Connected NGO / Group</Label>
            <Input value={child.familyDetails?.connectedNGOsOrGroups || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, connectedNGOsOrGroups: e.target.value } })} className="h-6 text-[10px]" placeholder="e.g. Rotary Club / NGO" />
          </div>
        </div>
      </div>
      
      {/* Parents & Sibling Details Grid */}
      <div className="col-span-1 md:col-span-2">
        <Label className="mb-2 mt-2">Parents & Siblings Information (Both Parents WhatsApp)</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['father', 'mother', 'guardian'] as const).map((role) => (
            <div key={role} className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-brand-cyan-700 font-bold uppercase">{role} Details</span>
                {role !== 'guardian' && (
                  <Badge color={child.familyDetails?.[role]?.isWhatsApp ? 'success' : 'slate'} className="text-[8px] py-0">
                    WhatsApp Active
                  </Badge>
                )}
              </div>
              <div><Label className="text-[9px]">Name</Label><Input value={(child.familyDetails?.[role] as any)?.name || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...(child.familyDetails?.[role] as any), name: e.target.value } } })} className="h-6 text-[10px]" /></div>
              <div><Label className="text-[9px]">Education</Label><Input value={(child.familyDetails?.[role] as any)?.education || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...(child.familyDetails?.[role] as any), education: e.target.value } } })} className="h-6 text-[10px]" /></div>
              <div><Label className="text-[9px]">Occupation</Label><Input value={(child.familyDetails?.[role] as any)?.occupation || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...(child.familyDetails?.[role] as any), occupation: e.target.value } } })} className="h-6 text-[10px]" /></div>
              <div><Label className="text-[9px]">Mobile (WhatsApp)</Label><Input value={(child.familyDetails?.[role] as any)?.mobile || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...(child.familyDetails?.[role] as any), mobile: e.target.value } } })} className="h-6 text-[10px]" /></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
            <span className="text-[10px] text-brand-cyan-700 font-bold uppercase block mb-2">Family Financial Status</span>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-[9px]">Annual Income</Label><Input type="number" value={child.familyDetails?.annualIncome || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, annualIncome: Number(e.target.value) } })} className="h-6 text-[10px]" /></div>
              <div><Label className="text-[9px]">Members Count</Label><Input type="number" value={child.familyDetails?.familyMembersCount || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, familyMembersCount: Number(e.target.value) } })} className="h-6 text-[10px]" /></div>
              <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={child.familyDetails?.bplStatus || false} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, bplStatus: e.target.checked } })} /> <Label className="mb-0 text-[10px]">BPL Status</Label></div>
              <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={child.familyDetails?.rationCard || false} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, rationCard: e.target.checked } })} /> <Label className="mb-0 text-[10px]">Ration Card</Label></div>
              <div className="col-span-2 mt-1">
                <Label className="text-[9px]">Socio-economic Status</Label>
                <Select className="h-6 text-[10px]" value={child.familyDetails?.socioEconomicStatus || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, socioEconomicStatus: e.target.value as any } })} options={[{label: 'Select', value: ''}, 'Low', 'Lower Middle', 'Middle', 'Upper'].map(o => typeof o === 'string' ? {label: o, value: o} : o)} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl space-y-2">
            <span className="text-[10px] text-brand-cyan-700 font-bold uppercase block">Sibling Information (Point 32)</span>
            {child.familyDetails?.siblings && child.familyDetails.siblings.length > 0 ? (
              <div className="space-y-1 text-[10px]">
                {child.familyDetails.siblings.map((sib, idx) => (
                  <div key={idx} className="p-1.5 bg-white border border-slate-200 rounded font-medium">
                    <span className="font-bold">{sib.name}</span> ({sib.age} yrs) • {sib.education} • {sib.businessOrOccupation}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">No sibling records added.</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" checked={child.familyDetails?.otherChildDisability || false} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, otherChildDisability: e.target.checked } })} id="otherChildDisability" />
              <label htmlFor="otherChildDisability" className="text-[10px] font-semibold text-slate-700 cursor-pointer">Other child has disability</label>
            </div>
            {child.familyDetails?.otherChildDisability && (
              <Input value={child.familyDetails?.otherChildDisabilityDetails || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, otherChildDisabilityDetails: e.target.value } })} className="h-6 text-[10px]" placeholder="Disability details..." />
            )}
          </div>

          <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
            <span className="text-[10px] text-brand-cyan-700 font-bold uppercase block mb-2">Emergency Contact</span>
            <div><Label className="text-[9px]">Name</Label><Input value={child.emergencyContact?.name || ''} onChange={e => saveChildUpdates({ emergencyContact: { ...child.emergencyContact, name: e.target.value } })} className="h-6 text-[10px] mb-2" /></div>
            <div><Label className="text-[9px]">Relation</Label><Input value={child.emergencyContact?.relation || ''} onChange={e => saveChildUpdates({ emergencyContact: { ...child.emergencyContact, relation: e.target.value } })} className="h-6 text-[10px] mb-2" /></div>
            <div><Label className="text-[9px]">Mobile</Label><Input value={child.emergencyContact?.mobile || ''} onChange={e => saveChildUpdates({ emergencyContact: { ...child.emergencyContact, mobile: e.target.value } })} className="h-6 text-[10px]" /></div>
          </div>
        </div>
      </div>
    </div>

    {/* Schooling & Dropout History (Point 19) */}
    <div className="mt-6 pt-4 border-t border-slate-100">
      <Label className="mb-2">Schooling, Dropout & Academic History</Label>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-xl">
        <div>
          <span className="text-[9px] text-slate-400 uppercase block font-bold">Enrolled Status</span>
          <Badge color={child.isNotEnrolled ? 'warning' : 'success'} className="mt-1 font-bold">
            {child.isNotEnrolled ? 'Not Enrolled / Dropped Out' : 'Mainstream Enrolled'}
          </Badge>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 uppercase block font-bold">Current School</span>
          <span className="font-bold text-slate-800 mt-1 block">{child.schoolName || 'Unassigned'}</span>
        </div>
        <div>
          <Label className="text-[9px]">Last School Attended</Label>
          <Input value={child.lastSchoolAttended || ''} onChange={e => saveChildUpdates({ lastSchoolAttended: e.target.value })} className="h-6 text-[10px]" placeholder="e.g. Municipal School" />
        </div>
        <div>
          <Label className="text-[9px]">Reason for Dropping Out</Label>
          <Input value={child.reasonForDropout || ''} onChange={e => saveChildUpdates({ reasonForDropout: e.target.value })} className="h-6 text-[10px]" placeholder="e.g. Distance / Health" />
        </div>
      </div>
    </div>
  </Card>

  {/* Card B: Clinical Assessment, Medical Checks & Special Reports */}
  <Card className="p-6">
    <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-4">
      II. Clinical Diagnosis, Medical Checks & Special Reports (Section B)
    </h3>
    
    <div className="space-y-4 text-xs">
      {/* Medical Checks Grid (Points 18, 22, 24, 26, 27) */}
      <div className="p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-xl space-y-3">
        <span className="text-[10px] text-brand-cyan-700 font-bold uppercase block">Section B Medical Screening Checks</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2 bg-white border border-slate-200 rounded-lg">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[10px]">
              <input type="checkbox" checked={child.hasEpilepsyAttacks || false} onChange={e => saveChildUpdates({ hasEpilepsyAttacks: e.target.checked })} />
              Epilepsy Attacks
            </label>
            {child.hasEpilepsyAttacks && (
              <Input value={child.epilepsySinceWhen || ''} onChange={e => saveChildUpdates({ epilepsySinceWhen: e.target.value })} className="h-5 text-[9px] mt-1" placeholder="Since when..." />
            )}
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded-lg">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[10px]">
              <input type="checkbox" checked={child.karyotypingTestDone || false} onChange={e => saveChildUpdates({ karyotypingTestDone: e.target.checked })} />
              Karyotyping Test Done
            </label>
            {child.karyotypingTestDone && (
              <Input value={child.karyotypingTestCentre || ''} onChange={e => saveChildUpdates({ karyotypingTestCentre: e.target.value })} className="h-5 text-[9px] mt-1" placeholder="Centre name..." />
            )}
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded-lg">
            <Label className="text-[9px]">Toilet Trained</Label>
            <Select className="h-5 text-[9px]" value={child.isToiletTrained || 'Yes'} onChange={e => saveChildUpdates({ isToiletTrained: e.target.value as any })} options={['Yes', 'No', 'Partial'].map(o => ({label: o, value: o}))} />
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded-lg">
            <Label className="text-[9px]">Special Footwear</Label>
            <div className="flex gap-2 text-[9px] mt-1">
              <label className="flex items-center gap-1"><input type="checkbox" checked={child.specialFootwearSuggested || false} onChange={e => saveChildUpdates({ specialFootwearSuggested: e.target.checked })} /> Suggested</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={child.specialFootwearProcured || false} onChange={e => saveChildUpdates({ specialFootwearProcured: e.target.checked })} /> Done</label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <Label className="text-[9px]">Other Medical Issues Notes</Label>
            <Input value={child.otherMedicalIssuesNotes || ''} onChange={e => saveChildUpdates({ otherMedicalIssuesNotes: e.target.value })} className="h-6 text-[10px]" placeholder="Allergies, surgeries, or chronic issues..." />
          </div>
          <div>
            <Label className="text-[9px]">Special Notes (Point 39)</Label>
            <Input value={child.specialNotes || ''} onChange={e => saveChildUpdates({ specialNotes: e.target.value })} className="h-6 text-[10px]" placeholder="Special child notes or coordinator instructions..." />
          </div>
        </div>
      </div>

      {/* Special Reports Upload Matrix (Points 15, 16, 17, 42, 43, 44) */}
      <div className="p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-brand-cyan-700 font-bold uppercase block">Section B Attachment Documents & Clinical Reports</span>
          <Badge color={child.verificationDeclarationChecked ? 'success' : 'warning'}>
            {child.verificationDeclarationChecked ? 'Declaration Verified' : 'Pending Verification'}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-800 text-[11px] block">Health Experts Report</span>
            <FakeUpload status={child.healthExpertsReportFileName} onUpload={status => saveChildUpdates({ healthExpertsReportFileName: status })} />
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-800 text-[11px] block">Psychiatrist Report</span>
            <FakeUpload status={child.psychiatristReportFileName} onUpload={status => saveChildUpdates({ psychiatristReportFileName: status })} />
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-800 text-[11px] block">Psychological Report</span>
            <FakeUpload status={child.psychologicalReportFileName} onUpload={status => saveChildUpdates({ psychologicalReportFileName: status })} />
          </div>
        </div>
      </div>

      {/* Diagnosis Details */}
      <div className="p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-xl space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-[9px]">Primary Diagnosis</Label><Input value={child.primaryDiagnosis || ''} onChange={e => saveChildUpdates({ primaryDiagnosis: e.target.value })} className="h-6 text-[10px]" /></div>
          <div><Label className="text-[9px]">Secondary Diagnosis</Label><Input value={child.secondaryDiagnosis || ''} onChange={e => saveChildUpdates({ secondaryDiagnosis: e.target.value })} className="h-6 text-[10px]" /></div>
        </div>
        <div><Label className="text-[9px]">Co-morbidities</Label><Input value={child.coMorbidities || ''} onChange={e => saveChildUpdates({ coMorbidities: e.target.value })} className="h-6 text-[10px]" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[9px]">Severity</Label>
            <Select className="h-6 text-[10px]" value={child.severity || ''} onChange={e => saveChildUpdates({ severity: e.target.value as any })} options={[{label: 'Select', value: ''}, 'Mild', 'Moderate', 'Severe', 'Profound'].map(o => typeof o === 'string' ? {label: o, value: o} : o)} />
          </div>
          <div>
            <Label className="text-[9px]">Disability Type</Label>
            <Select className="h-6 text-[10px]" value={child.disabilityType || ''} onChange={e => saveChildUpdates({ disabilityType: e.target.value as any })} options={[{label: 'Select', value: ''}, 'Autism', 'Intellectual Disability', 'Cerebral Palsy', 'ADHD', 'Down Syndrome', 'Learning Disability', 'Hearing Impairment', 'Visual Impairment', 'Multiple Disability', 'Others'].map(o => typeof o === 'string' ? {label: o, value: o} : o)} />
          </div>
        </div>
      </div>
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
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 font-display mb-3">
                <FileCheck className="h-4 w-4 text-brand-cyan-700" /> Required Documents
              </h3>
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div><span className="font-bold text-xs">Birth Certificate</span></div>
                  <FakeUpload status={child.birthCertificateFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ birthCertificateFileName: status })} />
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div><span className="font-bold text-xs">Aadhaar Card</span></div>
                  <FakeUpload status={child.aadhaarCardFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ aadhaarCardFileName: status })} />
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div><span className="font-bold text-xs">Disability Certificate</span></div>
                  <FakeUpload status={child.disabilityCertificatesFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ disabilityCertificatesFileName: status })} />
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 font-display">
                  <FileText className="h-4 w-4 text-brand-cyan-700" /> Additional Documents
                </h3>
                <Button size="sm" variant="outline" onClick={() => setIsDocModalOpen(true)} className="py-0.5 px-2 text-[10px]">Attach</Button>
              </div>
              <div className="space-y-2">
                {!child.documents || child.documents.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-3 text-xs">No additional documents.</p>
                ) : (
                  child.documents.map(doc => (
                    <div key={doc.id} className="p-2.5 bg-slate-50/50 border border-slate-100/50 rounded-lg flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800 text-xs truncate">{doc.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{doc.type} • {doc.date}</div>
                      </div>
                      <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="p-1 text-slate-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
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
      {['enrollment', 'therapy', 'assessment', 'education', 'medical', 'govtbenefit', 'iep', 'milestones', 'financial', 'devices', 'homevisit'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-3 text-sm font-bold capitalize transition-colors ${
            activeTab === tab ? 'text-brand-cyan-700 border-b-2 border-brand-cyan-700 bg-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab === 'homevisit' ? 'Parent & Visit' : 
           tab === 'medical' ? 'Medical' : 
           tab === 'govtbenefit' ? 'Govt Benefits (Sec J)' :
           tab === 'iep' ? 'IEP' : 
           tab === 'financial' ? 'Financial' : 
           tab === 'devices' ? 'Devices' : 
           tab === 'enrollment' ? 'Enrollment' :
           tab === 'therapy' ? 'Therapy' :
           tab === 'education' ? 'Education (Sec H)' :
           tab === 'milestones' ? 'Milestones' :
           'Assessment'}
        </button>
      ))}
    </div>
    <div className="p-6 bg-white min-h-[400px]">
      
      
      {/* TAB 1: ENROLLMENT (Section E PDF Specification) */}
      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section E: RENU Programme Enrollment & Onboarding Master
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Onboarding serial, enrollment lifecycle, caseworker assignment, and consent documentation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="primary" className="font-mono text-xs">
                Serial: {child.id}
              </Badge>
              <Badge color={child.enrollmentDetails?.currentStatus === 'Active' ? 'success' : 'warning'} className="text-xs">
                {child.enrollmentDetails?.currentStatus || 'Active'}
              </Badge>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* E.1 Admission Date */}
              <div>
                <Label className="text-[10px]">E.1 — Admission / Onboarding Date</Label>
                <Input
                  type="date"
                  className="h-9 text-xs py-1.5"
                  value={child.enrollmentDetails?.admissionDate || ''}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, admissionDate: e.target.value } })}
                />
              </div>

              {/* E.2 Current Status */}
              <div>
                <Label className="text-[10px]">E.2 — Current Enrollment Status</Label>
                <Select
                  className="h-9 text-xs py-1.5"
                  value={child.enrollmentDetails?.currentStatus || 'Active'}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, currentStatus: e.target.value as any } })}
                  options={['Active', 'Hold', 'Completed', 'Dropout', 'Shifted', 'Expired'].map(o => ({ label: o, value: o }))}
                />
              </div>

              {/* E.8 Assigned Case Coordinator */}
              <div>
                <Label className="text-[10px]">E.8 — Assigned Case Coordinator / Worker</Label>
                <Select
                  className="h-9 text-xs py-1.5"
                  value={child.enrollmentDetails?.assignedCoordinator || 'Dr. Rajesh Patel (Lead Coordinator)'}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, assignedCoordinator: e.target.value } })}
                  options={[
                    'Dr. Rajesh Patel (Lead Coordinator)',
                    'Sunita Sharma (Field Social Worker)',
                    'Vikram Mehta (Therapy Manager)',
                    'Ananya Roy (Clinical Psychologist)',
                    'Pooja Verma (Special Educator)'
                  ].map(c => ({ label: c, value: c }))}
                />
              </div>

              {/* E.9 Annual Renewal Review Date */}
              <div>
                <Label className="text-[10px]">E.9 — Annual Enrollment Renewal Date</Label>
                <Input
                  type="date"
                  className="h-9 text-xs py-1.5"
                  value={child.enrollmentDetails?.annualRenewalDate || ''}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, annualRenewalDate: e.target.value } })}
                />
              </div>

              {/* E.4 Sponsorship Status */}
              <div>
                <Label className="text-[10px]">E.4 — Sponsorship Allocation Status</Label>
                <Select
                  className="h-9 text-xs py-1.5"
                  value={child.enrollmentDetails?.sponsorshipStatus || 'Fully Subsidized'}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, sponsorshipStatus: e.target.value } })}
                  options={['Fully Subsidized', 'Seeking CSR Sponsor', 'Self-Funded', 'Govt Grant Funded', 'Partial Subsidy'].map(s => ({ label: s, value: s }))}
                />
              </div>

              {/* E.10 Registration Serial Code */}
              <div>
                <Label className="text-[10px]">E.10 — RENU Registration Serial ID</Label>
                <Input
                  className="h-9 text-xs py-1.5 bg-slate-100 font-mono font-bold"
                  value={child.id}
                  disabled
                />
              </div>
            </div>

            {/* E.3 Reason for Exit */}
            {['Dropout', 'Shifted', 'Expired', 'Completed'].includes(child.enrollmentDetails?.currentStatus || '') && (
              <div className="pt-2 border-t border-slate-200">
                <Label className="text-[10px]">E.3 — Reason for Exit / Status Change</Label>
                <Input
                  className="h-9 text-xs py-1.5"
                  placeholder="e.g. Admitted to mainstream school / Relocated to another district"
                  value={child.enrollmentDetails?.reasonForExit || ''}
                  onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, reasonForExit: e.target.value } })}
                />
              </div>
            )}

            {/* Document Uploads: E.5, E.6, E.7 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <Label className="text-xs font-bold text-slate-800">E.5 — Physical Admission Form</Label>
                <p className="text-[10px] text-slate-500 mb-2">Signed hardcopy registration document.</p>
                <FakeUpload
                  status={child.enrollmentDetails?.admissionFormFileName}
                  onUpload={(status) => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, admissionFormFileName: status } })}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-800">E.6 — Programme Consent Form</Label>
                <p className="text-[10px] text-slate-500 mb-2">General rehabilitation consent.</p>
                <FakeUpload
                  status={child.enrollmentDetails?.consentFormFileName}
                  onUpload={(status) => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, consentFormFileName: status } })}
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-800">E.7 — Parent/Guardian Consent</Label>
                <p className="text-[10px] text-slate-500 mb-2">Parent legal declaration & therapy consent.</p>
                <FakeUpload
                  status={child.enrollmentDetails?.parentConsentFileName}
                  onUpload={(status) => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, parentConsentFileName: status } })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THERAPY (Section F PDF Specification) */}
      {activeTab === 'therapy' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                  Section F.1 - F.4: Therapy Assignments & Schedule
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Define mandatory vs optional therapies, session frequency, timing, and duration.</p>
              </div>
              <Button size="sm" onClick={() => {
                const newAssignment = { id: `TA-${Date.now()}`, therapyType: 'Occupational Therapy' as any, required: true, frequency: '3x per week', sessionTime: '10:00 AM', sessionDuration: '45 minutes' };
                saveChildUpdates({ therapyAssignments: [...(child.therapyAssignments || []), newAssignment] });
              }}><Plus className="h-4 w-4 mr-1" /> Add Therapy</Button>
            </div>
            <div className="space-y-4">
              {(child.therapyAssignments || []).map((ta, idx) => (
                <div key={ta.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-3">
                  <button onClick={() => {
                    const newArr = [...(child.therapyAssignments || [])];
                    newArr.splice(idx, 1);
                    saveChildUpdates({ therapyAssignments: newArr });
                  }} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label className="text-[10px]">F.1 — Therapy Type</Label>
                      <Select className="h-9 text-xs py-1.5" value={ta.therapyType} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].therapyType = e.target.value as any;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} options={['Occupational Therapy', 'Speech Therapy', 'Behaviour Therapy', 'Physiotherapy', 'Special Education', 'Early Intervention', 'Parent Training', 'Group Therapy', 'ADL', 'Life Skills'].map(o=>({label:o,value:o}))} />
                    </div>
                    <div>
                      <Label className="text-[10px]">F.2 — Mandatory / Required</Label>
                      <div className="mt-2.5 flex items-center font-semibold text-xs"><input type="checkbox" checked={ta.required} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].required = e.target.checked;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} className="mr-2 h-4 w-4 accent-indigo-600"/> Mandatory</div>
                    </div>
                    <div>
                      <Label className="text-[10px]">F.3 — Frequency</Label>
                      <Input className="h-9 text-xs py-1.5" value={ta.frequency || ''} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].frequency = e.target.value;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} placeholder="e.g. 3x/week" />
                    </div>
                    <div>
                      <Label className="text-[10px]">F.4 — Time</Label>
                      <Input className="h-9 text-xs py-1.5" value={ta.sessionTime || ''} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].sessionTime = e.target.value;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} placeholder="10:00 AM" />
                    </div>
                    <div>
                      <Label className="text-[10px]">F.4 — Duration</Label>
                      <Input className="h-9 text-xs py-1.5" value={ta.sessionDuration || ''} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].sessionDuration = e.target.value;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} placeholder="45 min" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                  Section F.5 - F.8: Monthly Attendance, Progress & Financial Subsidy Tracking
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Track suggested vs attended days, low attendance alerts, subsidy qualification, and therapist notes.</p>
              </div>
              <Button size="sm" onClick={() => {
                const newRec = { id: `MA-${Date.now()}`, year: new Date().getFullYear(), month: 'Jan', totalDaysSuggested: 12, totalDaysAttended: 10, totalDaysMissed: 2, attendancePercentage: 83.3, qualifiedForFinancialSupport: true, monthlyNote: 'Good compliance.' };
                saveChildUpdates({ monthlyAttendanceRecords: [...(child.monthlyAttendanceRecords || []), newRec] });
              }}><Plus className="h-4 w-4 mr-1" /> Add Month Log</Button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Year</th>
                    <th className="p-2.5">Month</th>
                    <th className="p-2.5">Suggested Days</th>
                    <th className="p-2.5">Attended Days</th>
                    <th className="p-2.5">Missed Days</th>
                    <th className="p-2.5">F.6 Attendance %</th>
                    <th className="p-2.5">F.7 Subsidy Qual.</th>
                    <th className="p-2.5">F.8 Therapist Note</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(child.monthlyAttendanceRecords || []).map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-2"><Input type="number" className="w-20 text-xs py-1 h-8" value={rec.year} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].year = Number(e.target.value);
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2"><Select className="w-24 text-xs py-1 h-8" value={rec.month} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].month = e.target.value;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} options={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(o=>({label:o,value:o}))} /></td>
                      <td className="p-2"><Input type="number" className="w-20 text-xs py-1 h-8" value={rec.totalDaysSuggested} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].totalDaysSuggested = Number(e.target.value);
                        newArr[idx].totalDaysMissed = newArr[idx].totalDaysSuggested - newArr[idx].totalDaysAttended;
                        newArr[idx].attendancePercentage = newArr[idx].totalDaysSuggested > 0 ? (newArr[idx].totalDaysAttended / newArr[idx].totalDaysSuggested) * 100 : 0;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2"><Input type="number" className="w-20 text-xs py-1 h-8" value={rec.totalDaysAttended} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].totalDaysAttended = Number(e.target.value);
                        newArr[idx].totalDaysMissed = newArr[idx].totalDaysSuggested - newArr[idx].totalDaysAttended;
                        newArr[idx].attendancePercentage = newArr[idx].totalDaysSuggested > 0 ? (newArr[idx].totalDaysAttended / newArr[idx].totalDaysSuggested) * 100 : 0;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2 font-bold text-slate-800">{rec.totalDaysMissed}</td>
                      <td className="p-2 font-bold">
                        {rec.attendancePercentage.toFixed(1)}%
                        {rec.attendancePercentage < 70 && rec.totalDaysSuggested > 0 && <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">⚠ Below 70%</span>}
                      </td>
                      <td className="p-2 text-center"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={rec.qualifiedForFinancialSupport} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].qualifiedForFinancialSupport = e.target.checked;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2"><Input className="w-48 text-xs py-1 h-8" placeholder="Session observations..." value={rec.monthlyNote || ''} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].monthlyNote = e.target.value;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2 text-right"><button onClick={() => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr.splice(idx, 1);
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-4">Travel Financial Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div><Label>Center Name</Label><Input value={child.travelSupport?.centerName || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, centerName: e.target.value } })} /></div>
              <div><Label>Distance (KM)</Label><Input type="number" value={child.travelSupport?.distanceKm || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, distanceKm: Number(e.target.value) } })} /></div>
              <div><Label>Support Slab</Label><Select value={child.travelSupport?.slab || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, slab: e.target.value as any } })} options={[{label:'Select',value:''},'₹500','₹1000','Other'].map(o=>typeof o==='string'?{label:o,value:o}:o)} /></div>
              {child.travelSupport?.slab === 'Other' && <div><Label>Other Amount</Label><Input type="number" value={child.travelSupport?.otherAmount || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, otherAmount: Number(e.target.value) } })} /></div>}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEVELOPMENTAL MILESTONES (Section M PDF Specification) */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section M: Child Development Milestones Master
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Add specific milestones, select progress scale (Not Started / In Progress / Achieved / Needs Improvement), and record evaluation notes.
              </p>
            </div>
            <Button size="sm" onClick={() => {
              const newMilestone: DevelopmentalMilestone = {
                id: `ms_${Date.now()}`,
                domain: 'Early Intervention',
                progress: 'In Progress',
                remarks: '',
                lastUpdated: new Date().toISOString().split('T')[0]
              };
              saveChildUpdates({ developmentalMilestones: [...(child.developmentalMilestones || []), newMilestone] });
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add Milestone
            </Button>
          </div>

          {/* Dynamic Milestone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(child.developmentalMilestones || []).map((ms, idx) => (
              <div key={ms.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
                <button
                  onClick={() => {
                    const updated = [...(child.developmentalMilestones || [])];
                    updated.splice(idx, 1);
                    saveChildUpdates({ developmentalMilestones: updated });
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Badge
                    color={
                      ms.progress === 'Achieved' ? 'success' :
                      ms.progress === 'In Progress' ? 'primary' :
                      ms.progress === 'Needs Improvement' ? 'warning' : 'slate'
                    }
                    className="text-[10px] font-bold"
                  >
                    {ms.progress || 'Not Started'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px]">Select Milestone Domain</Label>
                    <Select
                      className="h-9 text-xs py-1.5"
                      value={ms.domain}
                      onChange={e => {
                        const updated = [...(child.developmentalMilestones || [])];
                        updated[idx].domain = e.target.value as any;
                        saveChildUpdates({ developmentalMilestones: updated });
                      }}
                      options={[
                        'Early Intervention',
                        'Inclusive Education',
                        'Independent Living Skills',
                        'Communication',
                        'Self Care',
                        'Behaviour',
                        'Social Skills',
                        'Vocational Training',
                        'School Readiness',
                        'School Admission',
                        'Employment'
                      ].map(d => ({ label: d, value: d }))}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Progress Scale Rating</Label>
                    <Select
                      className="h-9 text-xs py-1.5"
                      value={ms.progress}
                      onChange={e => {
                        const updated = [...(child.developmentalMilestones || [])];
                        updated[idx].progress = e.target.value as any;
                        saveChildUpdates({ developmentalMilestones: updated });
                      }}
                      options={[
                        { label: 'Not Started', value: 'Not Started' },
                        { label: 'In Progress', value: 'In Progress' },
                        { label: 'Achieved', value: 'Achieved' },
                        { label: 'Needs Improvement', value: 'Needs Improvement' }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-[10px]">Remarks / Evaluation Notes</Label>
                    <Input
                      className="h-9 text-xs py-1.5"
                      placeholder="e.g. Shows significant improvement in verbal response..."
                      value={ms.remarks || ''}
                      onChange={e => {
                        const updated = [...(child.developmentalMilestones || [])];
                        updated[idx].remarks = e.target.value;
                        saveChildUpdates({ developmentalMilestones: updated });
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Last Updated Date</Label>
                    <Input
                      type="date"
                      className="h-9 text-xs py-1.5"
                      value={ms.lastUpdated || ''}
                      onChange={e => {
                        const updated = [...(child.developmentalMilestones || [])];
                        updated[idx].lastUpdated = e.target.value;
                        saveChildUpdates({ developmentalMilestones: updated });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!child.developmentalMilestones || child.developmentalMilestones.length === 0) && (
              <div className="col-span-2 p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 font-semibold mb-2">No developmental milestones added yet for this child.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newMilestone: DevelopmentalMilestone = {
                      id: `ms_${Date.now()}`,
                      domain: 'Early Intervention',
                      progress: 'In Progress',
                      remarks: '',
                      lastUpdated: new Date().toISOString().split('T')[0]
                    };
                    saveChildUpdates({ developmentalMilestones: [newMilestone] });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add First Milestone
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
{/* TAB 1: ASSESSMENT */}
      {/* TAB 1: ASSESSMENT (Section D PDF Specification) */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Section D: Multi-Disciplinary Assessment Records</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Track IQ, Functional, Behavioural, Motor, Speech, Sensory, and ADL clinical assessments.</p>
            </div>
            <Button size="sm" onClick={() => {
              const newAssessment: AssessmentRecord = { 
                id: `ASM-${Date.now()}`,
                type: 'IQ', 
                date: new Date().toISOString().split('T')[0],
                toolUsed: 'Binet-Kamat Test (BKT)',
                conductedBy: 'Dr. Ananya Roy (Clinical Psychologist)',
                finding: 'Mild intellectual delay; good visual-spatial performance.',
                category: 'Mild',
                score: 68
              };
              saveChildUpdates({ assessments: [...(child.assessments || []), newAssessment] });
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add Assessment
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(child.assessments || []).map((assessment, idx) => {
              const getToolsForType = (typeStr: string) => {
                switch (typeStr) {
                  case 'IQ':
                    return ['Binet-Kamat Test (BKT)', 'Vineland Social Maturity Scale (VSMS)', 'Malin\'s Intelligence Scale (MISIC)', 'Seguin Form Board (SFB)', 'DST', 'DASII', 'ISAA', 'CARS', 'Other'];
                  case 'Functional':
                    return ['FACP (Functional Assessment Checklist)', 'BASIC-MR Part A', 'MDPS (Madras Developmental Scale)', 'Checklist', 'Other'];
                  case 'Behaviour':
                    return ['BASIC-MR Part B', 'Behaviour Problem Checklist (CBCL)', 'Aberrant Behavior Checklist (ABC)', 'Other'];
                  case 'Communication':
                    return ['REELS (Receptive Expressive Scale)', 'Speech & Language Checklist', 'Articulation Test', 'Other'];
                  case 'Motor':
                    return ['GMFCS (Gross Motor Classification)', 'FIM (Functional Independence Measure)', 'Motor Evaluation Scale', 'Other'];
                  case 'Sensory Profile':
                    return ['Sensory Profile Checklist', 'Sensory Integration Inventory', 'Other'];
                  case 'ADL':
                    return ['ADL Checklist', 'Functional Independence Measure (FIM)', 'Other'];
                  case 'Developmental':
                    return ['Developmental Screening Test (DST)', 'DASII', 'Other'];
                  default:
                    return ['Pediatric Screening Checklist', 'Clinical Observation', 'Other'];
                }
              };

              return (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-3">
                  <button onClick={() => {
                    const newArr = [...(child.assessments || [])];
                    newArr.splice(idx, 1);
                    saveChildUpdates({ assessments: newArr });
                  }} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2 pr-6">
                    <Badge color="primary" className="font-bold text-[10px] uppercase">{assessment.type} Assessment</Badge>
                    {assessment.score !== undefined && (
                      <Badge color="success" className="text-[10px]">Score: {assessment.score}</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px]">Assessment Type</Label>
                      <Select 
                        className="h-9 text-xs py-1.5"
                        options={['Initial', 'Developmental', 'IQ', 'Functional', 'Behaviour', 'Communication', 'Motor', 'Sensory Profile', 'ADL'].map(t => ({label: t, value: t}))}
                        value={assessment.type}
                        onChange={e => {
                          const newArr = [...(child.assessments || [])];
                          newArr[idx].type = e.target.value as any;
                          saveChildUpdates({ assessments: newArr });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Assessment Date</Label>
                      <Input type="date" className="h-9 text-xs py-1.5" value={assessment.date || ''} onChange={e => {
                        const newArr = [...(child.assessments || [])];
                        newArr[idx].date = e.target.value;
                        saveChildUpdates({ assessments: newArr });
                      }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px]">Clinical Tool Used</Label>
                      <Select 
                        className="h-9 text-xs py-1.5"
                        options={getToolsForType(assessment.type).map(t => ({label: t, value: t}))}
                        value={assessment.toolUsed || ''}
                        onChange={e => {
                          const newArr = [...(child.assessments || [])];
                          newArr[idx].toolUsed = e.target.value;
                          saveChildUpdates({ assessments: newArr });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Score / IQ Rating</Label>
                      <Input type="number" className="h-9 text-xs py-1.5" placeholder="e.g. 68" value={assessment.score !== undefined ? assessment.score : ''} onChange={e => {
                        const newArr = [...(child.assessments || [])];
                        newArr[idx].score = Number(e.target.value);
                        saveChildUpdates({ assessments: newArr });
                      }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px]">Category / Level</Label>
                      <Select 
                        className="h-9 text-xs py-1.5"
                        options={['Mild', 'Moderate', 'Severe', 'Profound', 'Normal', 'Independent', 'Dependent'].map(c => ({label: c, value: c}))}
                        value={assessment.category || 'Mild'}
                        onChange={e => {
                          const newArr = [...(child.assessments || [])];
                          newArr[idx].category = e.target.value;
                          saveChildUpdates({ assessments: newArr });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Conducted By (Specialist)</Label>
                      <Input className="h-9 text-xs py-1.5" placeholder="e.g. Dr. Ananya Roy" value={assessment.conductedBy || ''} onChange={e => {
                        const newArr = [...(child.assessments || [])];
                        newArr[idx].conductedBy = e.target.value;
                        saveChildUpdates({ assessments: newArr });
                      }} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px]">Finding / Clinical Summary</Label>
                    <Input className="h-9 text-xs py-1.5" placeholder="Assessment findings..." value={assessment.finding || ''} onChange={e => {
                      const newArr = [...(child.assessments || [])];
                      newArr[idx].finding = e.target.value;
                      saveChildUpdates({ assessments: newArr });
                    }} />
                  </div>

                  <div>
                    <Label className="text-[10px]">Remarks & Recommended Intervention</Label>
                    <Textarea rows={2} className="text-xs py-1.5" value={assessment.remarks || ''} onChange={e => {
                      const newArr = [...(child.assessments || [])];
                      newArr[idx].remarks = e.target.value;
                      saveChildUpdates({ assessments: newArr });
                    }} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <Label className="text-[10px]">Next Re-assessment Due</Label>
                      <Input type="date" className="h-9 text-xs py-1.5" value={assessment.nextAssessmentDueDate || ''} onChange={e => {
                        const newArr = [...(child.assessments || [])];
                        newArr[idx].nextAssessmentDueDate = e.target.value;
                        saveChildUpdates({ assessments: newArr });
                      }} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Individual Report Upload</Label>
                      <FakeUpload 
                        status={assessment.reportFileName} 
                        onUpload={(status) => {
                          const newArr = [...(child.assessments || [])];
                          newArr[idx].reportFileName = status;
                          saveChildUpdates({ assessments: newArr });
                        }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
            <div>
              <Label className="font-bold text-slate-800">Section D Master Assessment Report Package</Label>
              <p className="text-[10px] text-slate-500">Upload complete signed multi-disciplinary assessment package PDF.</p>
            </div>
            <FakeUpload 
              status={child.assessmentReportStatus} 
              onUpload={(status) => saveChildUpdates({ assessmentReportStatus: status })} 
            />
          </div>
        </div>
      )}

      {/* TAB: EDUCATION & SCHOOLING (Section H PDF Specification) */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section H: Education & Mainstream School Admissions
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                School details, student admission, education category, report cards, attendance & teacher feedback.
              </p>
            </div>
            <Badge color={child.schoolAdmission?.admissionStatus === 'Confirmed' ? 'success' : 'primary'} className="font-bold">
              Admission Status: {child.schoolAdmission?.admissionStatus || 'Applied'}
            </Badge>
          </div>

          <div className="space-y-6">
            {/* SUB-SECTION 1: SCHOOL DETAILS */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                1. School Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[10px]">School Name</Label>
                  <Input
                    className="h-9 text-xs py-1.5"
                    placeholder="e.g. Saraswati Primary School"
                    value={child.schoolAdmission?.schoolName || child.schoolName || ''}
                    onChange={e => saveChildUpdates({ 
                      schoolName: e.target.value,
                      schoolAdmission: { ...child.schoolAdmission, schoolName: e.target.value } 
                    })}
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Type</Label>
                  <Select
                    className="h-9 text-xs py-1.5"
                    value={child.schoolAdmission?.schoolType || 'Inclusive School'}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, schoolType: e.target.value as any } })}
                    options={[
                      { label: 'Normal School', value: 'Normal School' },
                      { label: 'Inclusive School', value: 'Inclusive School' },
                      { label: 'Integrated School', value: 'Integrated School' },
                      { label: 'Home Schooling', value: 'Home Schooling' },
                      { label: 'NIOS (Open Schooling)', value: 'NIOS' }
                    ]}
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <Label className="text-[10px]">Address</Label>
                  <Input
                    className="h-9 text-xs py-1.5"
                    placeholder="Full school campus address..."
                    value={child.schoolAdmission?.schoolAddress || ''}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, schoolAddress: e.target.value } })}
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Principal / Contact Person Name</Label>
                  <Input
                    className="h-9 text-xs py-1.5"
                    placeholder="e.g. Dr. Ramesh Shah (Principal)"
                    value={child.schoolAdmission?.principalName || ''}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, principalName: e.target.value } })}
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Principal / Contact Phone Number</Label>
                  <Input
                    className="h-9 text-xs py-1.5"
                    placeholder="e.g. +91 98765 43210"
                    value={child.schoolAdmission?.principalContact || ''}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, principalContact: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* SUB-SECTION 2: STUDENT */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                2. Student
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[10px]">Admission Date</Label>
                  <Input
                    type="date"
                    className="h-9 text-xs py-1.5"
                    value={child.schoolAdmission?.admissionDate || ''}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, admissionDate: e.target.value } })}
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Standard / Class</Label>
                  <Input
                    className="h-9 text-xs py-1.5"
                    placeholder="e.g. 3rd Standard"
                    value={child.schoolAdmission?.standard || ''}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, standard: e.target.value } })}
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Medium</Label>
                  <Select
                    className="h-9 text-xs py-1.5"
                    value={child.schoolAdmission?.mediumOfInstruction || 'Gujarati'}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, mediumOfInstruction: e.target.value as any } })}
                    options={['Gujarati', 'English', 'Hindi', 'Marathi', 'Other'].map(m => ({ label: m, value: m }))}
                  />
                </div>
              </div>
            </div>

            {/* SUB-SECTION 3: EDUCATION TYPE */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                3. Education Type
              </h4>
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                  <input
                    type="radio"
                    name="educationCategory"
                    className="h-4 w-4 accent-indigo-600"
                    checked={(child.schoolAdmission?.educationCategory || 'Inclusive Education') === 'Inclusive Education'}
                    onChange={() => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, educationCategory: 'Inclusive Education' } })}
                  />
                  Inclusive Education (Mainstream Integration)
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                  <input
                    type="radio"
                    name="educationCategory"
                    className="h-4 w-4 accent-indigo-600"
                    checked={child.schoolAdmission?.educationCategory === 'Special School'}
                    onChange={() => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, educationCategory: 'Special School' } })}
                  />
                  Special School (Specialized Facility)
                </label>
              </div>
            </div>

            {/* SUB-SECTION 4: PROGRESS */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                4. Progress
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px]">Attendance (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="h-9 text-xs py-1.5"
                      placeholder="e.g. 85"
                      value={child.schoolAdmission?.attendancePercent !== undefined ? child.schoolAdmission.attendancePercent : ''}
                      onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, attendancePercent: Number(e.target.value) } })}
                    />
                    <span className="font-extrabold text-slate-700 text-sm">%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-[10px]">Teacher Feedback & Observations</Label>
                  <Textarea
                    rows={2}
                    className="text-xs"
                    placeholder="Observations regarding learning speed, peer interaction, and classroom participation..."
                    value={child.schoolAdmission?.teacherFeedback || ''}
                    onChange={e => saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, teacherFeedback: e.target.value } })}
                  />
                </div>
              </div>

              {/* Report Card Uploads Matrix */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-800">Report Card & Evaluation Attachments</Label>
                    <p className="text-[10px] text-slate-500">Upload term report cards and grade certificates.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentCards = child.schoolAdmission?.reportCards || [];
                      const newCard = { year: new Date().getFullYear().toString(), grade: 'A', remarks: 'Good academic performance' };
                      saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, reportCards: [...currentCards, newCard] } });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Report Card
                  </Button>
                </div>

                <div className="space-y-2">
                  {(child.schoolAdmission?.reportCards || []).map((card, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Input
                          className="w-24 h-8 text-xs py-1"
                          placeholder="Year"
                          value={card.year}
                          onChange={e => {
                            const updatedCards = [...(child.schoolAdmission?.reportCards || [])];
                            updatedCards[idx].year = e.target.value;
                            saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, reportCards: updatedCards } });
                          }}
                        />
                        <Input
                          className="w-24 h-8 text-xs py-1"
                          placeholder="Grade"
                          value={card.grade}
                          onChange={e => {
                            const updatedCards = [...(child.schoolAdmission?.reportCards || [])];
                            updatedCards[idx].grade = e.target.value;
                            saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, reportCards: updatedCards } });
                          }}
                        />
                        <Input
                          className="w-48 h-8 text-xs py-1"
                          placeholder="Remarks..."
                          value={card.remarks}
                          onChange={e => {
                            const updatedCards = [...(child.schoolAdmission?.reportCards || [])];
                            updatedCards[idx].remarks = e.target.value;
                            saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, reportCards: updatedCards } });
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <FakeUpload
                          status={card.fileName}
                          onUpload={(status) => {
                            const updatedCards = [...(child.schoolAdmission?.reportCards || [])];
                            updatedCards[idx].fileName = status;
                            saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, reportCards: updatedCards } });
                          }}
                        />
                        <button
                          onClick={() => {
                            const updatedCards = [...(child.schoolAdmission?.reportCards || [])];
                            updatedCards.splice(idx, 1);
                            saveChildUpdates({ schoolAdmission: { ...child.schoolAdmission, reportCards: updatedCards } });
                          }}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAL RECORDS */}
      {activeTab === 'medical' && (
        <div className="space-y-8">
          {/* Scans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Medical Scan & Test Records</h3>
              <Button size="sm" onClick={() => {
                const newScan = { id: `scan_${Date.now()}`, date: '', type: 'MRI' as const, finding: '', centre: '', doctor: '' };
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
                         options={[{label: 'MRI', value: 'MRI'}, {label: 'CT Scan', value: 'CT Scan'}, {label: 'EEG', value: 'EEG'}, {label: 'BERA', value: 'BERA'}, {label: 'Blood Report', value: 'Blood Report'}, {label: 'Genetic Test', value: 'Genetic Test'}, {label: 'Hearing Test', value: 'Hearing Test'}, {label: 'Vision Test', value: 'Vision Test'}, {label: 'Thyroid Report', value: 'Thyroid Report'}, {label: 'Vitamin Reports', value: 'Vitamin Reports'}, {label: 'Other', value: 'Other'}]}
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
                const newRecord = { id: `rx_${Date.now()}`, date: new Date().toISOString().split('T')[0], doctorName: '', hospitalName: '', medicines: '', notes: '' };
                const prescriptions = [...(child.medicalRecords?.prescriptions || []), newRecord];
                saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Prescription
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.medicalRecords?.prescriptions || []).map((rx, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                   <div className="grid grid-cols-2 gap-3">
                     <div>
                       <Label className="text-[10px]">Prescription Date</Label>
                       <Input type="date" className="h-9 text-xs py-1.5" value={rx.date} onChange={e => {
                         const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                         prescriptions[idx].date = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                       }} />
                     </div>
                     <div>
                       <Label className="text-[10px]">Doctor Name</Label>
                       <Input className="h-9 text-xs py-1.5" placeholder="e.g. Dr. K. Mehta" value={rx.doctorName} onChange={e => {
                         const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                         prescriptions[idx].doctorName = e.target.value;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                       }} />
                     </div>
                   </div>
                   <div>
                     <Label className="text-[10px]">Hospital / Clinic Name</Label>
                     <Input className="h-9 text-xs py-1.5" placeholder="e.g. City Children Hospital" value={rx.hospitalName || ''} onChange={e => {
                       const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                       prescriptions[idx].hospitalName = e.target.value;
                       saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                     }} />
                   </div>
                   <div>
                     <Label className="text-[10px]">Medicines & Dosage</Label>
                     <Textarea rows={2} className="text-xs" placeholder="e.g. Tab Sodium Valproate 200mg (1-0-1), Syrup Multivitamin 5ml daily" value={rx.medicines} onChange={e => {
                       const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                       prescriptions[idx].medicines = e.target.value;
                       saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                     }} />
                   </div>
                   <div>
                     <Label className="text-[10px]">Instructions / Notes</Label>
                     <Input className="h-9 text-xs py-1.5" placeholder="e.g. Review after 30 days" value={rx.notes} onChange={e => {
                       const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                       prescriptions[idx].notes = e.target.value;
                       saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                     }} />
                   </div>
                   <div className="pt-2 border-t border-slate-200">
                     <Label className="text-[10px]">Prescription Document Upload</Label>
                     <FakeUpload 
                       status={rx.prescriptionDocumentStatus} 
                       onUpload={(status) => {
                         const prescriptions = [...(child.medicalRecords?.prescriptions || [])];
                         prescriptions[idx].prescriptionDocumentStatus = status;
                         saveChildUpdates({ medicalRecords: { ...child.medicalRecords, prescriptions } });
                       }} 
                     />
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
                const newRecord = { id: `vac_${Date.now()}`, vaccineName: '', dateGiven: '', nextDueDate: '' };
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

      {/* TAB: GOVERNMENT BENEFITS (Section J PDF Specification) */}
      {activeTab === 'govtbenefit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section J: Government Welfare Schemes & Benefits Master
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Track status (Applied / Approved / Rejected), renewal dates, scheme amounts, and upload official benefit certificates.
              </p>
            </div>
            <Badge color="primary" className="font-bold">
              13 Schemes Covered
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { key: 'disabilityCertificate', title: '1. Disability Certificate', desc: 'Medical disability certificate (40%+ benchmark)' },
              { key: 'udidCard', title: '2. UDID Card', desc: 'Unique Disability ID Card & portal registration' },
              { key: 'niramayaInsurance', title: '3. Niramaya Health Insurance', desc: 'Health insurance scheme up to ₹1 Lakh' },
              { key: 'disabilityPension', title: '4. Disability Pension', desc: 'Monthly disability pension grant' },
              { key: 'busPass', title: '5. Bus Concession Pass', desc: 'Free/subsidized public transport pass' },
              { key: 'railwayPass', title: '6. Railway Concession Pass', desc: 'Railway travel concession card' },
              { key: 'ayushmanCard', title: '7. Ayushman Bharat Card', desc: 'National health protection card' },
              { key: 'pmjay', title: '8. PMJAY Scheme', desc: 'Pradhan Mantri Jan Arogya Yojana benefit' },
              { key: 'sadhanSahay', title: '9. Sadhan Sahay Scheme', desc: 'Prosthetics, appliances & wheelchair aid' },
              { key: 'tlmKit', title: '10. TLM Kit', desc: 'Teaching Learning Material educational kit' },
              { key: 'scholarship', title: '11. Special Scholarship', desc: 'Pre & Post-Matric disability scholarship' },
              { key: 'hostel', title: '12. Special Hostel Facility', desc: 'Government residential special school hostel' },
              { key: 'caregiverAllowance', title: '13. Caregiver Allowance', desc: 'Monthly caregiver financial assistance' }
            ].map(item => {
              const bKey = item.key as keyof NonNullable<Child['govtBenefits']>;
              const currentData = child.govtBenefits?.[bKey] || {};

              return (
                <div key={bKey} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <Badge color={currentData.status === 'Approved' ? 'success' : currentData.status === 'Applied' ? 'warning' : 'danger'} className="text-[10px]">
                      {currentData.status || 'Not Applied'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {/* Status Dropdown */}
                    <div>
                      <Label className="text-[10px]">Status (Applied / Approved / Rejected)</Label>
                      <Select
                        className="h-8 text-xs py-1"
                        value={currentData.status || ''}
                        onChange={e => {
                          const updatedGovt = {
                            ...(child.govtBenefits || {}),
                            [bKey]: { ...currentData, status: e.target.value as any }
                          };
                          saveChildUpdates({ govtBenefits: updatedGovt });
                        }}
                        options={[
                          { label: 'Select Status...', value: '' },
                          { label: 'Applied', value: 'Applied' },
                          { label: 'Approved', value: 'Approved' },
                          { label: 'Rejected', value: 'Rejected' }
                        ]}
                      />
                    </div>

                    {/* Renewal Date */}
                    <div>
                      <Label className="text-[10px]">Renewal / Review Date</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs py-1"
                        value={currentData.renewalDate || ''}
                        onChange={e => {
                          const updatedGovt = {
                            ...(child.govtBenefits || {}),
                            [bKey]: { ...currentData, renewalDate: e.target.value }
                          };
                          saveChildUpdates({ govtBenefits: updatedGovt });
                        }}
                      />
                    </div>

                    {/* Remarks / Notes */}
                    <div>
                      <Label className="text-[10px]">Remarks / Card ID / Notes</Label>
                      <Input
                        className="h-8 text-xs py-1"
                        placeholder="e.g. Card No. / Application ref ID"
                        value={currentData.remarks || ''}
                        onChange={e => {
                          const updatedGovt = {
                            ...(child.govtBenefits || {}),
                            [bKey]: { ...currentData, remarks: e.target.value }
                          };
                          saveChildUpdates({ govtBenefits: updatedGovt });
                        }}
                      />
                    </div>

                    {/* Document Upload */}
                    <div className="pt-2 border-t border-slate-200">
                      <Label className="text-[10px]">Benefit Certificate Upload</Label>
                      <FakeUpload
                        status={currentData.fileName}
                        onUpload={(status) => {
                          const updatedGovt = {
                            ...(child.govtBenefits || {}),
                            [bKey]: { ...currentData, fileName: status }
                          };
                          saveChildUpdates({ govtBenefits: updatedGovt });
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: IEP MANAGEMENT (Section G PDF Specification) */}
      {activeTab === 'iep' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section G: Individualized Education Program (IEP) Management Master
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Record child's baseline assessment, goal targets by timeframe (Short-Term, 6-Month, Annual, Long-Term), and quarterly review evaluations.
              </p>
            </div>
            <Badge color="primary" className="font-bold">
              Special Education Plan
            </Badge>
          </div>

          <div className="space-y-6">
            {/* CARD 1: BASELINE ASSESSMENT & PLAN OVERVIEW */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                1. Baseline Assessment & Plan Overview (Sec G.1 - G.2)
              </h4>

              <div>
                <Label className="text-xs font-bold text-slate-800">Baseline Assessment</Label>
                <p className="text-[10px] text-slate-500 mb-1.5">Child's initial developmental baseline, functional capabilities, strengths, and areas requiring intervention.</p>
                <Textarea 
                  rows={3} 
                  className="text-xs" 
                  placeholder="Describe initial baseline functional evaluation (e.g. Can write 5 single letters with support, needs pincer grip practice, knows 4 primary colors)..." 
                  value={child.iepRecords?.baselineAssessment || ''} 
                  onChange={e => saveChildUpdates({ iepRecords: { ...child.iepRecords, baselineAssessment: e.target.value } as any })} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <Label className="text-[10px]">Plan Start Date</Label>
                  <Input 
                    type="date" 
                    className="h-9 text-xs py-1.5" 
                    value={child.iepRecords?.planPeriodFrom || ''} 
                    onChange={e => saveChildUpdates({ iepRecords: { ...child.iepRecords, planPeriodFrom: e.target.value } as any })} 
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Plan Target End Date</Label>
                  <Input 
                    type="date" 
                    className="h-9 text-xs py-1.5" 
                    value={child.iepRecords?.planPeriodTo || ''} 
                    onChange={e => saveChildUpdates({ iepRecords: { ...child.iepRecords, planPeriodTo: e.target.value } as any })} 
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Official IEP Document Upload</Label>
                  <FakeUpload 
                    status={child.iepRecords?.documentStatus} 
                    onUpload={(status) => saveChildUpdates({ iepRecords: { ...child.iepRecords, documentStatus: status } as any })} 
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: GOAL MATRIX BY TIMEFRAME */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 shadow-2xs">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                2. Goal Matrix by Timeframe (Sec G.3 - G.7)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Short-Term Goals */}
                <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 mb-0">Short Term Goals (1 - 3 Months)</Label>
                    <Button size="sm" variant="outline" className="py-1 h-7 text-[10px]" onClick={() => {
                      const goals = [...(child.iepRecords?.shortTermGoals || []), { goal: '', achieved: false }];
                      saveChildUpdates({ iepRecords: { ...child.iepRecords, shortTermGoals: goals } as any });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Goal
                    </Button>
                  </div>
                  {(child.iepRecords?.shortTermGoals || []).map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={goal.achieved} 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.shortTermGoals || [])];
                          goals[idx].achieved = e.target.checked;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, shortTermGoals: goals } as any });
                        }} 
                        className="h-4 w-4 rounded text-brand-cyan-700 focus:ring-brand-cyan-700" 
                      />
                      <Input 
                        className="h-8 text-xs flex-1" 
                        value={goal.goal} 
                        placeholder="Short-term target (e.g. Pincer grip holding)" 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.shortTermGoals || [])];
                          goals[idx].goal = e.target.value;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, shortTermGoals: goals } as any });
                        }} 
                      />
                    </div>
                  ))}
                  {(!child.iepRecords?.shortTermGoals || child.iepRecords.shortTermGoals.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic">No short-term goals added yet.</p>
                  )}
                </div>

                {/* Six-Month Goals */}
                <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 mb-0">Six Month Goals (6 Months)</Label>
                    <Button size="sm" variant="outline" className="py-1 h-7 text-[10px]" onClick={() => {
                      const goals = [...(child.iepRecords?.sixMonthGoals || []), { goal: '', achieved: false }];
                      saveChildUpdates({ iepRecords: { ...child.iepRecords, sixMonthGoals: goals } as any });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Goal
                    </Button>
                  </div>
                  {(child.iepRecords?.sixMonthGoals || []).map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={goal.achieved} 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.sixMonthGoals || [])];
                          goals[idx].achieved = e.target.checked;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, sixMonthGoals: goals } as any });
                        }} 
                        className="h-4 w-4 rounded text-brand-cyan-700 focus:ring-brand-cyan-700" 
                      />
                      <Input 
                        className="h-8 text-xs flex-1" 
                        value={goal.goal} 
                        placeholder="Six-month target (e.g. Independent self-feeding)" 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.sixMonthGoals || [])];
                          goals[idx].goal = e.target.value;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, sixMonthGoals: goals } as any });
                        }} 
                      />
                    </div>
                  ))}
                  {(!child.iepRecords?.sixMonthGoals || child.iepRecords.sixMonthGoals.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic">No six-month goals added yet.</p>
                  )}
                </div>

                {/* Annual Goals */}
                <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 mb-0">Annual Goals (1 Year)</Label>
                    <Button size="sm" variant="outline" className="py-1 h-7 text-[10px]" onClick={() => {
                      const goals = [...(child.iepRecords?.annualGoals || []), { goal: '', achieved: false }];
                      saveChildUpdates({ iepRecords: { ...child.iepRecords, annualGoals: goals } as any });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Goal
                    </Button>
                  </div>
                  {(child.iepRecords?.annualGoals || []).map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={goal.achieved} 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.annualGoals || [])];
                          goals[idx].achieved = e.target.checked;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, annualGoals: goals } as any });
                        }} 
                        className="h-4 w-4 rounded text-brand-cyan-700 focus:ring-brand-cyan-700" 
                      />
                      <Input 
                        className="h-8 text-xs flex-1" 
                        value={goal.goal} 
                        placeholder="Annual target (e.g. Write full alphabet independently)" 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.annualGoals || [])];
                          goals[idx].goal = e.target.value;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, annualGoals: goals } as any });
                        }} 
                      />
                    </div>
                  ))}
                  {(!child.iepRecords?.annualGoals || child.iepRecords.annualGoals.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic">No annual goals added yet.</p>
                  )}
                </div>

                {/* Long-Term Goals */}
                <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 mb-0">Long Term Goals (1 - 2 Years)</Label>
                    <Button size="sm" variant="outline" className="py-1 h-7 text-[10px]" onClick={() => {
                      const goals = [...(child.iepRecords?.longTermGoals || []), { goal: '', achieved: false }];
                      saveChildUpdates({ iepRecords: { ...child.iepRecords, longTermGoals: goals } as any });
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Goal
                    </Button>
                  </div>
                  {(child.iepRecords?.longTermGoals || []).map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={goal.achieved} 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.longTermGoals || [])];
                          goals[idx].achieved = e.target.checked;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, longTermGoals: goals } as any });
                        }} 
                        className="h-4 w-4 rounded text-brand-cyan-700 focus:ring-brand-cyan-700" 
                      />
                      <Input 
                        className="h-8 text-xs flex-1" 
                        value={goal.goal} 
                        placeholder="Long-term target (e.g. Grade 1 inclusive school transition)" 
                        onChange={e => {
                          const goals = [...(child.iepRecords?.longTermGoals || [])];
                          goals[idx].goal = e.target.value;
                          saveChildUpdates({ iepRecords: { ...child.iepRecords, longTermGoals: goals } as any });
                        }} 
                      />
                    </div>
                  ))}
                  {(!child.iepRecords?.longTermGoals || child.iepRecords.longTermGoals.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic">No long-term goals added yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 3: PERIODIC REVIEWS & EVALUATION */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">
                  3. Periodic Reviews & Evaluation Matrix (Achievement %, Goal Status, New Goals)
                </h4>
                <Button size="sm" onClick={() => {
                  const newReview = { date: new Date().toISOString().split('T')[0], reviewedBy: '', achievementPercent: 75, remarks: '', goalStatus: 'In Progress', newGoals: '' };
                  const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || []), newReview];
                  saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Periodic Review
                </Button>
              </div>

              <div className="space-y-4">
                {(child.iepRecords?.quarterlyReviews || []).map((rev, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl text-xs space-y-3 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px]">Review Evaluation Date</Label>
                        <Input 
                          type="date" 
                          className="h-9 text-xs py-1.5" 
                          value={rev.date} 
                          onChange={e => {
                            const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                            quarterlyReviews[idx].date = e.target.value;
                            saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                          }} 
                        />
                      </div>

                      <div>
                        <Label className="text-[10px]">Evaluator / Special Educator Name</Label>
                        <Input 
                          className="h-9 text-xs py-1.5" 
                          placeholder="e.g. Dr. Ananya Roy" 
                          value={rev.reviewedBy} 
                          onChange={e => {
                            const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                            quarterlyReviews[idx].reviewedBy = e.target.value;
                            saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                          }} 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px]">Achievement %</Label>
                          <Input 
                            type="number" 
                            className="h-9 text-xs py-1.5 font-bold text-emerald-700" 
                            placeholder="75"
                            value={rev.achievementPercent} 
                            onChange={e => {
                              const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                              quarterlyReviews[idx].achievementPercent = Number(e.target.value);
                              saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                            }} 
                          />
                        </div>

                        <div>
                          <Label className="text-[10px]">Goal Status</Label>
                          <Select
                            className="h-9 text-xs py-1.5"
                            value={rev.goalStatus || 'In Progress'}
                            onChange={e => {
                              const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                              quarterlyReviews[idx].goalStatus = e.target.value;
                              saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                            }}
                            options={[
                              { label: 'Met (Goal Achieved)', value: 'Met' },
                              { label: 'In Progress', value: 'In Progress' },
                              { label: 'Partially Met', value: 'Partially Met' },
                              { label: 'Not Met', value: 'Not Met' }
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Evaluator Remarks & Progress Notes</Label>
                        <Input 
                          className="h-9 text-xs py-1.5" 
                          placeholder="e.g. Good progress in motor skills; needs focus on speech clarity."
                          value={rev.remarks} 
                          onChange={e => {
                            const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                            quarterlyReviews[idx].remarks = e.target.value;
                            saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                          }} 
                        />
                      </div>

                      <div>
                        <Label className="text-[10px]">New Goals Set for Next Cycle</Label>
                        <Input 
                          className="h-9 text-xs py-1.5" 
                          placeholder="e.g. Introduce 2-word sentences & independent buttoning."
                          value={rev.newGoals || ''} 
                          onChange={e => {
                            const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])];
                            quarterlyReviews[idx].newGoals = e.target.value;
                            saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any });
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!child.iepRecords?.quarterlyReviews || child.iepRecords.quarterlyReviews.length === 0) && (
                  <div className="p-6 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-500 font-semibold mb-2">No periodic reviews recorded yet for this IEP.</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newReview = { date: new Date().toISOString().split('T')[0], reviewedBy: '', achievementPercent: 75, remarks: '', goalStatus: 'In Progress', newGoals: '' };
                        saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews: [newReview] } as any });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add First Review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FINANCIAL SUPPORT (Section K PDF Specification) */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section K: Financial Support & Sponsorship Details
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Manage funding sources, support categories, sanctioned/received amounts, approval status, utilization, and bill receipts.
              </p>
            </div>
            <Badge color={child.financialSupport?.approvalStatus === 'Sanctioned' || child.financialSupport?.approvalStatus === 'Approved' ? 'success' : 'warning'} className="font-bold">
              Approval: {child.financialSupport?.approvalStatus || 'Approved'}
            </Badge>
          </div>

          <div className="space-y-6">
            {/* CARD 1: SUPPORT TYPE & FUNDING SOURCE */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                1. Support Type & Funding Source
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[10px]">Support Type</Label>
                  <Select 
                    className="h-9 text-xs py-1.5"
                    options={['Therapy', 'Education', 'Medicine', 'Travel', 'Assistive Device'].map(o => ({ label: o, value: o }))} 
                    value={child.financialSupport?.supportType || 'Therapy'} 
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, supportType: e.target.value as any } })} 
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Funding Source</Label>
                  <Select 
                    className="h-9 text-xs py-1.5"
                    options={[
                      { label: 'Vishalwin Foundation', value: 'Vishalwin' },
                      { label: 'CSR Partner', value: 'CSR' },
                      { label: 'Individual Donor', value: 'Donor' },
                      { label: 'Parent / Self', value: 'Parent' },
                      { label: 'Government Scheme', value: 'Government' },
                      { label: 'Crowd Funding Campaign', value: 'Crowd Funding' }
                    ]}
                    value={child.financialSupport?.fundingSource || 'Vishalwin'}
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, fundingSource: e.target.value as any } })}
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Donor / CSR Company Name</Label>
                  <Input 
                    className="h-9 text-xs py-1.5" 
                    placeholder="e.g. Reliance Foundation / CSR Fund" 
                    value={child.financialSupport?.donorName || ''} 
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, donorName: e.target.value } })} 
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Contact Person Name</Label>
                  <Input 
                    className="h-9 text-xs py-1.5" 
                    placeholder="e.g. Rajesh Mehta (CSR Lead)" 
                    value={child.financialSupport?.contactPerson || ''} 
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, contactPerson: e.target.value } })} 
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Contact Person Phone</Label>
                  <Input 
                    className="h-9 text-xs py-1.5" 
                    placeholder="+91 98765 43210" 
                    value={child.financialSupport?.contactMobile || ''} 
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, contactMobile: e.target.value } })} 
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: FINANCIAL DETAILS & APPROVAL */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                2. Financial Details & Approval Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-[10px]">Amount Sanctioned (₹)</Label>
                  <Input 
                    type="number" 
                    className="h-9 text-xs py-1.5 font-bold" 
                    placeholder="e.g. 15000" 
                    value={child.financialSupport?.amountSanctioned !== undefined ? child.financialSupport.amountSanctioned : ''} 
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, amountSanctioned: Number(e.target.value) } })} 
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Amount Received (₹)</Label>
                  <Input 
                    type="number" 
                    className="h-9 text-xs py-1.5 font-bold text-emerald-700" 
                    placeholder="e.g. 15000" 
                    value={child.financialSupport?.amountReceived !== undefined ? child.financialSupport.amountReceived : ''} 
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, amountReceived: Number(e.target.value) } })} 
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Approval Status</Label>
                  <Select 
                    className="h-9 text-xs py-1.5"
                    options={[
                      { label: 'Pending Approval', value: 'Pending' },
                      { label: 'Approved', value: 'Approved' },
                      { label: 'Sanctioned', value: 'Sanctioned' },
                      { label: 'Rejected', value: 'Rejected' }
                    ]}
                    value={child.financialSupport?.approvalStatus || 'Approved'}
                    onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, approvalStatus: e.target.value as any } })}
                  />
                </div>

                <div>
                  <Label className="text-[10px]">Grant Period (Start / End)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      type="date" 
                      className="h-9 text-xs py-1.5" 
                      value={child.financialSupport?.grantPeriodStart || ''} 
                      onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, grantPeriodStart: e.target.value } })} 
                    />
                    <Input 
                      type="date" 
                      className="h-9 text-xs py-1.5" 
                      value={child.financialSupport?.grantPeriodEnd || ''} 
                      onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, grantPeriodEnd: e.target.value } })} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: UTILIZATION, BILLS & RECEIPTS */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                3. Utilization Notes, Bills & Receipts
              </h4>
              <div>
                <Label className="text-[10px]">Utilization Notes & Purpose</Label>
                <Textarea 
                  rows={2} 
                  className="text-xs" 
                  placeholder="Detailed breakdown of how financial grant was spent (e.g. 6 months therapy sessions + special footwear)..." 
                  value={child.financialSupport?.utilization || ''} 
                  onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, utilization: e.target.value } })} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <Label className="text-xs font-bold text-slate-800">Bills Attachment</Label>
                  <p className="text-[10px] text-slate-500 mb-2">Hospital/Therapy center invoices & bills.</p>
                  <FakeUpload 
                    status={child.financialSupport?.billsFileName} 
                    onUpload={(status) => saveChildUpdates({ financialSupport: { ...child.financialSupport, billsFileName: status } })} 
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-800">Payment Receipt Attachment</Label>
                  <p className="text-[10px] text-slate-500 mb-2">Acknowledged payment receipt.</p>
                  <FakeUpload 
                    status={child.financialSupport?.receiptFileName} 
                    onUpload={(status) => saveChildUpdates({ financialSupport: { ...child.financialSupport, receiptFileName: status } })} 
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-800">Grant Approval Letter</Label>
                  <p className="text-[10px] text-slate-500 mb-2">Signed sanction letter or CSR agreement.</p>
                  <FakeUpload 
                    status={child.financialSupport?.grantLetterFileName || child.financialSupport?.documentStatus} 
                    onUpload={(status) => saveChildUpdates({ financialSupport: { ...child.financialSupport, grantLetterFileName: status, documentStatus: status } })} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ASSISTIVE DEVICES SUPPORT (Section L PDF Specification) */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section L: Assistive Devices Support Master
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Track assistive device issuances, device names, issue dates, vendor details, warranty expiry dates, and device photos.
              </p>
            </div>
            <Button size="sm" onClick={() => {
              const newDevice = { id: `dev_${Date.now()}`, deviceType: 'Wheelchair' as const, brandModel: '', issuedDate: new Date().toISOString().split('T')[0], warrantyUntil: '', issuedBy: 'ALIMCO / Vendor' };
              saveChildUpdates({ assistiveDevices: [...(child.assistiveDevices || []), newDevice] });
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add Device
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(child.assistiveDevices || []).map((device, idx) => (
              <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
                <button onClick={() => {
                  const newArr = [...(child.assistiveDevices || [])];
                  newArr.splice(idx, 1);
                  saveChildUpdates({ assistiveDevices: newArr });
                }} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    Device Item #{idx + 1} — {device.deviceType || 'Wheelchair'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px]">Device Name & Category</Label>
                    <Select 
                      className="h-9 text-xs py-1.5"
                      options={[
                        {label: 'Wheelchair', value: 'Wheelchair'},
                        {label: 'Hearing Aid', value: 'Hearing Aid'},
                        {label: 'Crutches & Canes', value: 'Crutches'},
                        {label: 'Communication Device (AAC)', value: 'Communication Device'},
                        {label: 'Spectacles / Low Vision Aid', value: 'Spectacles'},
                        {label: 'Standing Frame / Splint', value: 'Standing Frame'},
                        {label: 'AFO / Orthotics', value: 'AFO'},
                        {label: 'Other Assistive Device', value: 'Other'}
                      ]}
                      value={device.deviceType}
                      onChange={e => {
                        const newArr = [...(child.assistiveDevices || [])];
                        newArr[idx].deviceType = e.target.value;
                        saveChildUpdates({ assistiveDevices: newArr });
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Brand / Model Name</Label>
                    <Input 
                      className="h-9 text-xs py-1.5"
                      placeholder="e.g. Karma CP-100 / Phonak"
                      value={device.brandModel} 
                      onChange={e => {
                        const newArr = [...(child.assistiveDevices || [])];
                        newArr[idx].brandModel = e.target.value;
                        saveChildUpdates({ assistiveDevices: newArr });
                      }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px]">Issue Date</Label>
                    <Input 
                      type="date" 
                      className="h-9 text-xs py-1.5"
                      value={device.issuedDate} 
                      onChange={e => {
                        const newArr = [...(child.assistiveDevices || [])];
                        newArr[idx].issuedDate = e.target.value;
                        saveChildUpdates({ assistiveDevices: newArr });
                      }} 
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Warranty Expiry Date</Label>
                    <Input 
                      type="date" 
                      className="h-9 text-xs py-1.5"
                      value={device.warrantyUntil} 
                      onChange={e => {
                        const newArr = [...(child.assistiveDevices || [])];
                        newArr[idx].warrantyUntil = e.target.value;
                        saveChildUpdates({ assistiveDevices: newArr });
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px]">Vendor / Supplier Name</Label>
                  <Input 
                    className="h-9 text-xs py-1.5"
                    placeholder="e.g. ALIMCO / V-One Orthotics Vendor"
                    value={device.issuedBy} 
                    onChange={e => {
                      const newArr = [...(child.assistiveDevices || [])];
                      newArr[idx].issuedBy = e.target.value;
                      saveChildUpdates({ assistiveDevices: newArr });
                    }} 
                  />
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <Label className="text-[10px]">Device Photo / Receipt Proof Upload</Label>
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

            {(!child.assistiveDevices || child.assistiveDevices.length === 0) && (
              <div className="col-span-2 p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 font-semibold mb-2">No assistive devices recorded yet for this child.</p>
                <Button size="sm" variant="outline" onClick={() => {
                  const newDevice = { id: `dev_${Date.now()}`, deviceType: 'Wheelchair' as const, brandModel: '', issuedDate: new Date().toISOString().split('T')[0], warrantyUntil: '', issuedBy: 'ALIMCO / Vendor' };
                  saveChildUpdates({ assistiveDevices: [newDevice] });
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Device
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PARENT SUPPORT & HOME VISIT (Section N & O PDF Specification) */}
      {activeTab === 'homevisit' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">
                Section N & O: Parent Support, Feedback & Home Visit Master
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Track parent counselling, training workshops, expert sessions, support groups, home visits, parent feedback, consent, and audio/video recordings.
              </p>
            </div>
            <Badge color="primary" className="font-bold">
              Individual Child Database
            </Badge>
          </div>

          {/* 1. Parent Support Activities Log */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                1. Parent Support & Guidance Sessions (Sec N.1 - N.7)
              </h4>
              <Button size="sm" onClick={() => {
                const newLog = { id: `cl_${Date.now()}`, type: 'Counselling' as const, date: new Date().toISOString().split('T')[0], staffName: '', topicOrObservations: '', notesOrRecommendations: '', nextDate: '' };
                saveChildUpdates({ homeVisitRecords: [...(child.homeVisitRecords || []), newLog] });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Parent Session
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.homeVisitRecords || []).filter(r => r.type !== 'Home Visit').map((log, idx) => {
                const globalIdx = child.homeVisitRecords!.indexOf(log);
                return (
                  <div key={globalIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:shadow-xs transition-shadow relative">
                    <button
                      onClick={() => {
                        const records = [...(child.homeVisitRecords || [])];
                        records.splice(globalIdx, 1);
                        saveChildUpdates({ homeVisitRecords: records });
                      }}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Support Activity Type</Label>
                        <Select 
                          className="h-9 text-xs py-1.5"
                          value={log.type || 'Counselling'}
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            records[globalIdx].type = e.target.value as any;
                            saveChildUpdates({ homeVisitRecords: records });
                          }}
                          options={[
                            { label: 'Parent Counselling', value: 'Counselling' },
                            { label: 'Parent Skill Training', value: 'Training' },
                            { label: 'Awareness Workshop', value: 'Workshop' },
                            { label: 'Expert Session', value: 'Expert Session' },
                            { label: 'Support Group Gathering', value: 'Support Group' },
                            { label: 'Follow-up Parents Call', value: 'Follow-up Parents' }
                          ]}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Session Date</Label>
                        <Input 
                          type="date" 
                          className="h-9 text-xs py-1.5"
                          value={log.date} 
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            records[globalIdx].date = e.target.value;
                            saveChildUpdates({ homeVisitRecords: records });
                          }} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Counsellor / Staff Name</Label>
                        <Input 
                          className="h-9 text-xs py-1.5"
                          placeholder="e.g. Dr. Ananya Roy"
                          value={log.staffName} 
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            records[globalIdx].staffName = e.target.value;
                            saveChildUpdates({ homeVisitRecords: records });
                          }} 
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Session Topic / Purpose</Label>
                        <Input 
                          className="h-9 text-xs py-1.5"
                          placeholder="e.g. Behaviour management at home"
                          value={log.topicOrObservations} 
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            records[globalIdx].topicOrObservations = e.target.value;
                            saveChildUpdates({ homeVisitRecords: records });
                          }} 
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[10px]">Session Observations & Guidance Notes</Label>
                      <Textarea 
                        rows={2} 
                        className="text-xs"
                        placeholder="Detailed advice given to parents..."
                        value={log.notesOrRecommendations} 
                        onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].notesOrRecommendations = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} 
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">Next Follow-up Session Date</Label>
                      <Input 
                        type="date" 
                        className="h-9 text-xs py-1.5"
                        value={log.nextDate} 
                        onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].nextDate = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Home Visit Log */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                2. Field Home Visit Records (Sec N.6 & Sec O)
              </h4>
              <Button size="sm" onClick={() => {
                const newLog = { id: `hv_${Date.now()}`, type: 'Home Visit' as const, date: new Date().toISOString().split('T')[0], staffName: '', topicOrObservations: '', notesOrRecommendations: '', rating: 3, nextDate: '' };
                saveChildUpdates({ homeVisitRecords: [...(child.homeVisitRecords || []), newLog] });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Home Visit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.homeVisitRecords || []).filter(r => r.type === 'Home Visit').map((log, idx) => {
                const globalIdx = child.homeVisitRecords!.indexOf(log);
                return (
                  <div key={globalIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:shadow-xs transition-shadow relative">
                    <button
                      onClick={() => {
                        const records = [...(child.homeVisitRecords || [])];
                        records.splice(globalIdx, 1);
                        saveChildUpdates({ homeVisitRecords: records });
                      }}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Visit Date</Label>
                        <Input 
                          type="date" 
                          className="h-9 text-xs py-1.5"
                          value={log.date} 
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            records[globalIdx].date = e.target.value;
                            saveChildUpdates({ homeVisitRecords: records });
                          }} 
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Staff Name (Social Worker)</Label>
                        <Input 
                          className="h-9 text-xs py-1.5"
                          placeholder="e.g. Ramesh Patel"
                          value={log.staffName} 
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            records[globalIdx].staffName = e.target.value;
                            saveChildUpdates({ homeVisitRecords: records });
                          }} 
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[10px]">Home Visit Observation</Label>
                      <Textarea 
                        rows={2} 
                        className="text-xs"
                        placeholder="Family dynamics, sanitation, hygiene, living space observations..."
                        value={log.topicOrObservations} 
                        onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].topicOrObservations = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">Home Environment Assessment</Label>
                        <Select 
                          className="h-9 text-xs py-1.5"
                          options={[
                            { label: 'Positive Environment', value: 'Positive' },
                            { label: 'Negative Environment', value: 'Negative' },
                            { label: 'Scope of To Be Improved', value: 'Scope of To Be Improved' }
                          ]}
                          value={(log as any).environmentRating || 'Positive'}
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            (records[globalIdx] as any).environmentRating = e.target.value;
                            saveChildUpdates({ homeVisitRecords: records });
                          }}
                        />
                      </div>

                      <div>
                        <Label className="text-[10px]">Parent Counselling Status</Label>
                        <Select 
                          className="h-9 text-xs py-1.5"
                          options={[
                            { label: 'Done (Counselling Completed)', value: 'Done' },
                            { label: 'Not Done (Pending)', value: 'Not Done' }
                          ]}
                          value={(log as any).parentCounsellingDoneStatus || 'Done'}
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            (records[globalIdx] as any).parentCounsellingDoneStatus = e.target.value;
                            (records[globalIdx] as any).parentCounsellingDone = e.target.value === 'Done';
                            saveChildUpdates({ homeVisitRecords: records });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[10px]">Action Plan & Recommendations</Label>
                      <Textarea 
                        rows={2} 
                        className="text-xs"
                        placeholder="Step-by-step action plan for family guidance..."
                        value={log.notesOrRecommendations} 
                        onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].notesOrRecommendations = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} 
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">Next Visit Date</Label>
                      <Input 
                        type="date" 
                        className="h-9 text-xs py-1.5"
                        value={log.nextDate} 
                        onChange={e => {
                          const records = [...(child.homeVisitRecords || [])];
                          records[globalIdx].nextDate = e.target.value;
                          saveChildUpdates({ homeVisitRecords: records });
                        }} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <Label className="text-[10px]">GPS Geo-Coordinates</Label>
                        <div className="flex gap-1">
                          <Input 
                            className="text-[10px] h-8 py-1" 
                            placeholder="Lat, Long"
                            value={(log as any).gpsLocation || ''} 
                            onChange={e => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).gpsLocation = e.target.value; saveChildUpdates({ homeVisitRecords: records }); }} 
                          />
                          <Button size="sm" variant="outline" className="px-2 h-8" onClick={() => navigator.geolocation.getCurrentPosition(pos => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).gpsLocation = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`; saveChildUpdates({ homeVisitRecords: records }); })}>📍</Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px]">Photographs Upload</Label>
                        <FakeUpload status={(log as any).photoFileName} onUpload={(status) => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).photoFileName = status; saveChildUpdates({ homeVisitRecords: records }); }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Parent Feedback, Audio/Video Recordings & Consent (Sec N.8 - N.11) */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
            <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              3. Parent Feedback, Audio / Video Recordings & Consent (Sec N.8 - N.11)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px]">Parent Feedback & Testimonial Notes (Sec N.8)</Label>
                <Textarea 
                  rows={3} 
                  className="text-xs" 
                  placeholder="Record parent feedback on child progress, therapy satisfaction, and suggestions..."
                  value={child.parentSupport?.feedbackNotes || ''} 
                  onChange={e => saveChildUpdates({ parentSupport: { ...(child.parentSupport || {}), feedbackNotes: e.target.value } })} 
                />
              </div>

              <div className="space-y-3 bg-white p-3 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <Label className="text-xs font-bold text-slate-900 mb-0">Parent Signed Consent (Sec N.11)</Label>
                    <p className="text-[9px] text-slate-500">Official written consent for therapy & photo/video usage.</p>
                  </div>
                  <label className="flex items-center cursor-pointer gap-2">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded text-brand-cyan-700 focus:ring-brand-cyan-700" 
                      checked={child.parentSupport?.consentStatus || false} 
                      onChange={e => saveChildUpdates({ parentSupport: { ...(child.parentSupport || {}), consentStatus: e.target.checked } })} 
                    />
                    <span className="text-xs font-bold text-slate-700">{child.parentSupport?.consentStatus ? 'Consented' : 'Pending'}</span>
                  </label>
                </div>
                <div>
                  <Label className="text-[10px]">Upload Signed Consent Document</Label>
                  <FakeUpload 
                    status={child.parentSupport?.consentFileName} 
                    onUpload={(status) => saveChildUpdates({ parentSupport: { ...(child.parentSupport || {}), consentFileName: status } })} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
              <div>
                <Label className="text-xs font-bold text-slate-800">Audio Feedback Recording (Sec N.9)</Label>
                <p className="text-[10px] text-slate-500 mb-2">Upload parent interview audio recording or voice memo.</p>
                <FakeUpload 
                  status={child.parentSupport?.audioFeedbackFileName} 
                  onUpload={(status) => saveChildUpdates({ parentSupport: { ...(child.parentSupport || {}), audioFeedbackFileName: status } })} 
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-800">Video Feedback / Testimonial (Sec N.10)</Label>
                <p className="text-[10px] text-slate-500 mb-2">Upload parent testimonial video or therapy clip.</p>
                <FakeUpload 
                  status={child.parentSupport?.videoFeedbackFileName} 
                  onUpload={(status) => saveChildUpdates({ parentSupport: { ...(child.parentSupport || {}), videoFeedbackFileName: status } })} 
                />
              </div>
            </div>
          </div>

          {/* 4. Volunteer & Field Visit Log (Sec P PDF Specification) */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">
                  4. Volunteer & Field Visit Log (Section P PDF Specification)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Track visits by volunteers, mentors, and field observers along with visit purpose, observations, and key outcomes.
                </p>
              </div>
              <Button size="sm" onClick={() => {
                const newVisit: VolunteerVisit = {
                  id: `vv_${Date.now()}`,
                  volunteerName: '',
                  visitDate: new Date().toISOString().split('T')[0],
                  purpose: '',
                  observation: '',
                  outcome: ''
                };
                saveChildUpdates({ volunteerVisits: [...(child.volunteerVisits || []), newVisit] });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Volunteer Visit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(child.volunteerVisits || []).map((visit, idx) => (
                <div key={visit.id || idx} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs hover:shadow-xs transition-shadow relative">
                  <button
                    onClick={() => {
                      const updated = [...(child.volunteerVisits || [])];
                      updated.splice(idx, 1);
                      saveChildUpdates({ volunteerVisits: updated });
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px]">Volunteer Name</Label>
                      <Input 
                        className="h-9 text-xs py-1.5 font-bold"
                        placeholder="e.g. Dr. Meera Shah"
                        value={visit.volunteerName}
                        onChange={e => {
                          const updated = [...(child.volunteerVisits || [])];
                          updated[idx].volunteerName = e.target.value;
                          saveChildUpdates({ volunteerVisits: updated });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Visit Date</Label>
                      <Input 
                        type="date"
                        className="h-9 text-xs py-1.5"
                        value={visit.visitDate}
                        onChange={e => {
                          const updated = [...(child.volunteerVisits || [])];
                          updated[idx].visitDate = e.target.value;
                          saveChildUpdates({ volunteerVisits: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px]">Purpose of Visit</Label>
                    <Input 
                      className="h-9 text-xs py-1.5"
                      placeholder="e.g. Special education mentorship & AAC device practice"
                      value={visit.purpose}
                      onChange={e => {
                        const updated = [...(child.volunteerVisits || [])];
                        updated[idx].purpose = e.target.value;
                        saveChildUpdates({ volunteerVisits: updated });
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Field Observation</Label>
                    <Textarea 
                      rows={2}
                      className="text-xs"
                      placeholder="Detailed observations during volunteer interaction..."
                      value={visit.observation}
                      onChange={e => {
                        const updated = [...(child.volunteerVisits || [])];
                        updated[idx].observation = e.target.value;
                        saveChildUpdates({ volunteerVisits: updated });
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Visit Outcome & Impact</Label>
                    <Textarea 
                      rows={2}
                      className="text-xs"
                      placeholder="Key outcomes achieved and next steps recommended..."
                      value={visit.outcome}
                      onChange={e => {
                        const updated = [...(child.volunteerVisits || [])];
                        updated[idx].outcome = e.target.value;
                        saveChildUpdates({ volunteerVisits: updated });
                      }}
                    />
                  </div>
                </div>
              ))}

              {(!child.volunteerVisits || child.volunteerVisits.length === 0) && (
                <div className="col-span-2 p-6 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-500 font-semibold mb-2">No volunteer or field visits recorded yet for this child.</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newVisit: VolunteerVisit = {
                        id: `vv_${Date.now()}`,
                        volunteerName: '',
                        visitDate: new Date().toISOString().split('T')[0],
                        purpose: '',
                        observation: '',
                        outcome: ''
                      };
                      saveChildUpdates({ volunteerVisits: [newVisit] });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add First Volunteer Visit
                  </Button>
                </div>
              )}
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
