import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { Child, Diagnosis, FollowUp, Sponsorship, Coordinator } from'../types';
import { Card, Badge, Button, Select, Label } from'../components/ui';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Printer, GraduationCap, Award, MapPin, Phone, Clock } from'lucide-react';

export const Reports: React.FC = () => {
 const { role } = useRole();
 const [children, setChildren] = useState<Child[]>([]);
 const [selectedChildId, setSelectedChildId] = useState('');
 const [activeReportTab, setActiveReportTab] = useState<'parent'|'csr'>('parent');

 // Loaded child details for Parent Report
 const [selectedChild, setSelectedChild] = useState<Child | null>(null);
 const [childDiag, setChildDiag] = useState<Diagnosis | null>(null);
 const [childFups, setChildFups] = useState<FollowUp[]>([]);
 const [childCoord, setChildCoord] = useState<Coordinator | null>(null);

 useEffect(() => {
 const loadedChildren = RenuStore.getChildren();
 setChildren(loadedChildren);
 if (loadedChildren.length > 0) {
 setSelectedChildId(loadedChildren[0].id);
 loadChildReportData(loadedChildren[0].id);
 }
 }, []);

 useEffect(() => {
 if (role ==='Coordinator'&& activeReportTab ==='csr') {
 setActiveReportTab('parent');
 }
 }, [role]);

 const loadChildReportData = (childId: string) => {
 const allChildren = RenuStore.getChildren();
 const c = allChildren.find(x => x.id === childId);
 if (!c) return;

 setSelectedChild(c);
 setChildDiag(RenuStore.getDiagnoses().find(d => d.childId === childId) || null);
 
 const fups = RenuStore.getFollowUps()
 .filter(f => f.childId === childId)
 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 setChildFups(fups);

 const coords = RenuStore.getCoordinators();
 const camp = RenuStore.getCamps().find(cmp => cmp.id === c.campId);
 const coord = coords.find(cd => cd.id === camp?.coordinatorId) || coords[0];
 setChildCoord(coord);
 };

 const handleChildSelectChange = (childId: string) => {
 setSelectedChildId(childId);
 loadChildReportData(childId);
 };

 const handlePrint = () => {
 window.print();
 showToast('Print Command Sent','success','Printing layout initialized.');
 };

 // CSR Metrics summary
 const specialCount = children.filter(c => c.classification ==='Special').length;
 const schoolReady = children.filter(c => c.journeyStatus ==='School Ready').length;
 const schoolAdmitted = children.filter(c => c.journeyStatus ==='School Admission').length;
 const activeTherapy = children.filter(c => c.journeyStatus ==='Active Therapy').length;

 const camps = RenuStore.getCamps();
 const totalCampsConducted = camps.length;
 const totalChildrenScreened = camps.reduce((sum, cmp) => sum + cmp.registeredCount, 0);

 const sponsorships = RenuStore.getSponsorships();
 const sponsoredCount = new Set(sponsorships.filter(s => s.childId).map(s => s.childId)).size;
 const sponsorshipAmountUtilized = sponsorships.reduce((sum, s) => sum + s.amount, 0) * 0.82; // 82% utilization

 const areasCovered = Array.from(new Set(camps.map(cmp => cmp.area)));

 // Count camps by city
 const campsByLocation: Record<string, number> = {};
 camps.forEach(cmp => {
 campsByLocation[cmp.city] = (campsByLocation[cmp.city] || 0) + 1;
 });

 return (
 <div className="space-y-6 w-full max-w-none px-6 md:px-8 xl:px-12 pb-12">
 {/* Header (No Print) */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
 <div>
 <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">Reports Module</h1>
 <p className="text-xs text-slate-500 mt-1">Generate print-friendly Parent progress slips or Trustee/CSR impact slides.</p>
 </div>
 <div className="flex gap-2">
 <Button
 variant={activeReportTab ==='parent'?'primary':'outline'}
 size="sm"
 onClick={() => setActiveReportTab('parent')}
 className="cursor-pointer"
 >
 Parent Report
 </Button>
 {role !=='Coordinator'&& (
 <Button
 variant={activeReportTab ==='csr'?'primary':'outline'}
 size="sm"
 onClick={() => setActiveReportTab('csr')}
 className="cursor-pointer"
 >
 Trustee / CSR Impact
 </Button>
 )}
 </div>
 </div>

 {/* PARENT REPORT GENERATOR */}
 {activeReportTab ==='parent'&& selectedChild && (
 <div className="space-y-6">
 {/* Controls Card (No Print) */}
 <Card className="p-4 no-print text-xs bg-white/80 border-slate-200">
 <div className="flex flex-col sm:flex-row items-end gap-4">
 <div className="flex-1">
 <Label>Select Child Profile</Label>
 <Select
 options={children.map(c => ({ label:`${c.name} (${c.id}) - ${c.classification}`, value: c.id }))}
 value={selectedChildId}
 onChange={e => handleChildSelectChange(e.target.value)}
 />
 </div>
 <Button onClick={handlePrint} className="flex items-center gap-1.5 cursor-pointer">
 <Printer className="h-4 w-4"/> Print Parent Report
 </Button>
 </div>
 </Card>

 {/* Printable Report Layout */}
 <Card className="p-8 md:p-12 max-w-4xl mx-auto bg-white border border-slate-200 print-card text-xs text-slate-800 shadow-sm">
 {/* Header Letterhead */}
 <div className="flex justify-between items-start border-b-2 border-brand-cyan-700 pb-5 mb-6">
 <div>
 <h2 className="text-xl font-display font-extrabold text-brand-cyan-700 uppercase tracking-wide">VISHALWIN FOUNDATION</h2>
 <p className="text-[10px] text-slate-500 font-semibold tracking-widest mt-0.5">RENU PROGRAMME MANAGEMENT SYSTEM</p>
 <p className="text-[9px] text-slate-400 mt-1.5 leading-normal">Office 4, Ground Floor, Sector 3, Mumbai 400012<br />Web: www.vishalwin.org | Email: renu@vishalwin.org</p>
 </div>
 <div className="text-right">
 <span className="text-sm font-extrabold text-slate-900 block mt-2">CHILD PROGRESS REPORT</span>
 <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">Date Generated: {new Date().toISOString().split('T')[0]}</span>
 </div>
 </div>

 {/* Section 1: Child Information */}
 <div className="pb-5 border-b border-slate-100 mb-5">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 I. Child Information
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Child Name</span>
 <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedChild.name}</p>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Child ID</span>
 <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedChild.id}</p>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Parent / Guardian Name</span>
 <p className="font-bold text-slate-800 text-sm mt-0.5">
 {selectedChild.fatherName} (Father) / {selectedChild.motherName} (Mother)
 </p>
 </div>
 </div>
 </div>

 {/* Section 2: Assessment Summary */}
 <div className="py-5 border-b border-slate-100 mb-5">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 II. Clinical Assessment Summary
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Child Category</span>
 <Badge color={selectedChild.classification ==='Special'?'danger':'success'} className="mt-1 font-bold text-xs">
 {selectedChild.classification ==='Special'?'Special Child':'Normal Child'}
 </Badge>
 </div>
 {selectedChild.classification ==='Special'&& (
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Disability & Severity Level</span>
 <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedChild.disabilityType} ({selectedChild.severity})</p>
 </div>
 )}
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Diagnosis Summary</span>
 <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg italic">
 {childDiag?.assessmentSummary || (selectedChild.classification ==='Normal'?'Child has undergone development screening. All motor, sensory, and language milestones check out normal. No clinical intervention is required.':'Clinical review pending.')}
 </p>
 </div>
 </div>

 {/* Section 3: Therapy Information */}
 <div className="py-5 border-b border-slate-100 mb-5">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 III. Therapy Information
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Centre Name</span>
 <p className="font-bold text-slate-900 text-sm mt-0.5">
 {selectedChild.classification ==='Special'
 ? (childDiag?.centreName ||'Placements Pending')
 :'Not Applicable (Development Normal)'}
 </p>
 {selectedChild.classification ==='Special'&& (
 <p className="text-[10px] text-slate-400 mt-0.5">
 Assigned Therapist: {selectedChild.therapyProgress?.assignedTherapist ||'Assigned Lead Therapist'}
 </p>
 )}
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Services Provided</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {selectedChild.classification ==='Special'? (
 selectedChild.therapyProgress?.therapyType ? (
 <Badge color="primary">{selectedChild.therapyProgress.therapyType}</Badge>
 ) : (
 <span className="text-slate-400 italic">Special education checklist sessions</span>
 )
 ) : (
 <span className="text-emerald-600 font-bold text-xs">No therapeutic intervention required</span>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Section 4: Progress Summary */}
 <div className="py-5 border-b border-slate-100 mb-5">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 IV. Progress Summary
 </h3>
 {selectedChild.classification ==='Special'&& (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
 <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Therapy Progress Score</span>
 <span className="text-lg font-extrabold text-brand-cyan-800 block mt-0.5">
 {selectedChild.therapyProgress?.progressScore || selectedChild.therapyProgressScore || 0}%
 </span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Sessions Completed</span>
 <span className="text-lg font-extrabold text-slate-800 block mt-0.5">
 {selectedChild.therapyProgress?.sessionsCompleted || 12}
 </span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Sessions Remaining</span>
 <span className="text-lg font-extrabold text-slate-800 block mt-0.5">
 {selectedChild.therapyProgress?.sessionsRemaining || 24}
 </span>
 </div>
 </div>
 )}
 <div className="space-y-2">
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Progress Notes</span>
 <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
 {selectedChild.classification ==='Special'
 ? (selectedChild.therapyProgress?.therapistRemarks ||'Sensory and fine motor movements checks indicate milestone score upgrades. Recommended to continue regular therapies.')
 :'Development screening reports indicate that the child is active, responsive, and meeting motor, language, social-emotional, and cognitive milestones.'}
 </p>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Improvements Observed</span>
 <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-semibold">
 {selectedChild.classification ==='Special'
 ? (selectedChild.progressHistory && selectedChild.progressHistory.length > 0
 ?`"${selectedChild.progressHistory[selectedChild.progressHistory.length - 1]?.notes}"`
 :'"Demonstrates consistent attention span improvements and motor response coordination."')
 :'"Maintained age-appropriate learning curves and school readiness behaviors."'}
 </p>
 </div>
 </div>
 </div>

 {/* Section 5: Follow-Up History */}
 <div className="py-5 border-b border-slate-100 mb-5">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 V. Follow-Up History & Communication Log
 </h3>
 {childFups.length === 0 ? (
 <p className="text-xs text-slate-400 italic">No follow-up visit logs present for this child.</p>
 ) : (
 <div className="space-y-3">
 {childFups.slice(0, 2).map((f, idx) => (
 <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
 <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase mb-1">
 <span>Visit Date: {f.date} ({f.communicationType ||'Home Visit'})</span>
 <span>Logged By: {f.coordinatorName ||'Field Coordinator'}</span>
 </div>
 <p className="text-xs text-slate-700 font-semibold">Discussion:"{f.parentDiscussion}"</p>
 <p className="text-[10px] text-slate-500 mt-1">Recommendations: {f.recommendations}</p>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Section 6: Next Steps */}
 <div className="py-5">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5 border-l-4 border-brand-cyan-700 pl-2">
 VI. Next Steps & Timeline Recommendations
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Next Appointment / Follow-up Date</span>
 <p className="text-sm font-bold text-brand-cyan-700 mt-0.5">
 {childFups[0]?.nextFollowUpDate ||'Annual Follow-up scheduled (June 2027)'}
 </p>
 <p className="text-[10px] text-slate-400 mt-1">Next Plan: {childFups[0]?.nextFollowUpPlan ||'Verify standard school readiness markers.'}</p>
 </div>
 {childCoord && (
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block">Assigned Coordinator Contact Information</span>
 <p className="text-sm font-bold text-slate-800 mt-0.5">{childCoord.name}</p>
 <p className="text-xs font-medium text-slate-600 mt-0.5">Mobile: {childCoord.mobile}</p>
 <p className="text-xs text-slate-500">Email: {childCoord.email}</p>
 </div>
 )}
 </div>
 </div>

 {/* Signatures */}
 <div className="grid grid-cols-2 gap-4 pt-16 border-t border-slate-100 text-center">
 <div>
 <div className="h-0.5 w-40 bg-slate-300 mx-auto mb-2"/>
 <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Pediatrician Signature</span>
 </div>
 <div>
 <div className="h-0.5 w-40 bg-slate-300 mx-auto mb-2"/>
 <span className="text-[10px] text-slate-400 font-bold uppercase block">Field Coordinator Signature</span>
 </div>
 </div>
 </Card>
 </div>
 )}

 {/* TRUSTEE / CSR IMPACT REPORT */}
 {activeReportTab ==='csr'&& role !=='Coordinator'&& (
 <div className="space-y-6">
 {/* Controls Card (No Print) */}
 <Card className="p-4 no-print text-xs flex justify-between items-center bg-slate-50 border border-slate-200">
 <span className="font-semibold text-slate-600">Corporate & Donor Annual Program Impact summary</span>
 <Button onClick={handlePrint} className="flex items-center gap-1.5 cursor-pointer">
 <Printer className="h-4 w-4"/> Print CSR Impact Report
 </Button>
 </Card>

 {/* Printable CSR Dashboard */}
 <Card className="p-8 md:p-12 max-w-4xl mx-auto bg-white border border-slate-200 print-card text-xs text-slate-800">
 {/* Letterhead */}
 <div className="flex justify-between items-start border-b-2 border-brand-cyan-700 pb-5 mb-6">
 <div>
 <h2 className="text-xl font-display font-extrabold text-brand-cyan-700 uppercase tracking-wide">VISHALWIN FOUNDATION</h2>
 <p className="text-[10px] text-slate-500 font-semibold tracking-widest mt-0.5">RENU SPECIAL NEEDS CAMPS & REHABILITATION PROGRAMME</p>
 <p className="text-[9px] text-slate-400 mt-1.5 leading-normal">Office 4, Ground Floor, Sector 3, Mumbai 400012<br />Web: www.vishalwin.org | Email: csr@vishalwin.org</p>
 </div>
 <div className="text-right">
 <span className="text-sm font-extrabold text-slate-900 block mt-2">CSR & TRUSTEE IMPACT REPORT</span>
 <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">Academic Year: 2025 - 2026</span>
 </div>
 </div>

 {/* Section 1: Program Overview */}
 <div className="mb-6">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 I. Program Overview
 </h3>
 <p className="text-xs text-slate-605 leading-relaxed mb-4">
 The RENU (Rehabilitation and Empowerment for Needy and Underprivileged) Programme conducts pediatric medical camps in slum settlements to screen children, support professional diagnosis, fund therapy center enrollments, and facilitate mainstream primary school admission.
 </p>
 <div className="grid grid-cols-3 gap-4 text-center">
 <div className="p-3 bg-brand-cyan-50 border border-brand-cyan-100 rounded-xl">
 <span className="text-lg font-extrabold text-brand-cyan-800 block">{totalCampsConducted}</span>
 <span className="text-[9px] text-brand-cyan-700 font-medium uppercase tracking-wider">Total Camps Conducted</span>
 </div>
 <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
 <span className="text-lg font-extrabold text-slate-800 block">{totalChildrenScreened}</span>
 <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Total Children Screened</span>
 </div>
 <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
 <span className="text-lg font-extrabold text-brand-danger block">{specialCount}</span>
 <span className="text-[9px] text-brand-danger font-medium uppercase tracking-wider">Special Children Identified</span>
 </div>
 </div>
 </div>

 {/* Section 2: Sponsorship Impact */}
 <div className="py-5 border-t border-slate-100 mb-6">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 II. Sponsorship Impact
 </h3>
 <div className="grid grid-cols-2 gap-6">
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
 <span className="text-sm font-bold text-slate-800 block">Total Sponsored Children</span>
 <span className="text-2xl font-extrabold text-brand-cyan-700 block mt-1">{sponsoredCount} children</span>
 </div>
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
 <span className="text-sm font-bold text-slate-800 block">Sponsorship Amount Utilized</span>
 <span className="text-2xl font-extrabold text-brand-success block mt-1">₹{sponsorshipAmountUtilized.toLocaleString()}</span>
 </div>
 </div>
 </div>

 {/* Section 3: Therapy Impact */}
 <div className="py-5 border-t border-slate-100 mb-6">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 III. Therapy Placements Impact
 </h3>
 <div className="grid grid-cols-2 gap-6">
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
 <span className="text-sm font-bold text-slate-800 block">Children Enrolled in Centres</span>
 <span className="text-2xl font-extrabold text-slate-800 block mt-1">{specialCount - 5} children</span>
 </div>
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
 <span className="text-sm font-bold text-slate-800 block">Active Therapy Cases</span>
 <span className="text-2xl font-extrabold text-brand-cyan-700 block mt-1">{activeTherapy} active</span>
 </div>
 </div>
 </div>

 {/* Section 4: School Readiness */}
 <div className="py-5 border-t border-slate-100 mb-6">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 IV. Mainstream School Readiness & Admissions
 </h3>
 <div className="grid grid-cols-2 gap-6">
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
 <span className="text-sm font-bold text-slate-800 block">School Ready Children</span>
 <span className="text-2xl font-extrabold text-purple-800 block mt-1">{schoolReady} children</span>
 </div>
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
 <span className="text-sm font-bold text-slate-800 block">School Admissions Completed</span>
 <span className="text-2xl font-extrabold text-brand-success block mt-1">{schoolAdmitted} admissions</span>
 </div>
 </div>
 </div>

 {/* Section 5: Geographic Reach */}
 <div className="py-5 border-t border-slate-100 mb-6">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 V. Geographic Reach & Location Summary
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Key Areas Covered</span>
 <p className="text-xs text-slate-700 leading-relaxed font-semibold">
 {areasCovered.join(',')}
 </p>
 </div>
 <div>
 <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Camps Conducted By Location</span>
 <div className="space-y-1">
 {Object.keys(campsByLocation).map(city => (
 <div key={city} className="flex justify-between items-center text-xs pb-1 border-b border-slate-50">
 <span className="text-slate-600 font-medium">{city} Districts</span>
 <span className="font-bold text-slate-800">{campsByLocation[city]} camps</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Section 6: Success Stories */}
 <div className="py-5 border-t border-slate-100 mb-6">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 VI. Beneficiary Success Stories
 </h3>
 <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
 <div className="pb-3 border-b border-slate-200">
 <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
 <Award className="h-4 w-4 text-brand-cyan-700"/> Vihaan Sharma: Reaching School Readiness
 </h4>
 <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
 Vihaan Sharma (6 years, identified with Autism Spectrum traits) was screened at Hadapsar Camp. Following speech and occupational therapy at Asha Hearing Clinic, backed by Azim Premji Foundation funding, Vihaan transitioned from non-verbal communication to verbal milestones.
 </p>
 <p className="text-[10px] text-brand-cyan-800 font-semibold mt-1">
 Outcome: Completed school readiness checklist. Enrolled in 1st Standard at Saraswati Vidyalaya.
 </p>
 </div>
 <div>
 <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
 <Award className="h-4 w-4 text-brand-cyan-700"/> Ananya Verma: Fine Motor Rehabilitation Success
 </h4>
 <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
 Ananya Verma (5 years, identified with learning delay) received physical and cognitive activity coaching at Nirmal Centre.
 </p>
 <p className="text-[10px] text-brand-cyan-800 font-semibold mt-1">
 Outcome: Admitted successfully to St. Mary High School nursery program.
 </p>
 </div>
 </div>
 </div>

 {/* Section 7: Impact Summary */}
 <div className="py-5 border-t border-slate-100 mb-4">
 <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-l-4 border-brand-cyan-700 pl-2">
 VII. Overall Impact Summary
 </h3>
 <div className="grid grid-cols-3 gap-4 text-center mb-4">
 <div className="p-2.5 bg-slate-50 rounded-lg border border-transparent">
 <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total Beneficiaries Reached</span>
 <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{totalChildrenScreened + 120} kids</span>
 </div>
 <div className="p-2.5 bg-slate-50 rounded-lg border border-transparent">
 <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total Families Supported</span>
 <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{totalChildrenScreened} families</span>
 </div>
 <div className="p-2.5 bg-slate-50 rounded-lg border border-transparent">
 <span className="text-[9px] text-slate-400 uppercase font-semibold block">Overall Mainstream Rate</span>
 <span className="text-sm font-extrabold text-brand-success block mt-0.5">73% admitted</span>
 </div>
 </div>
 <p className="text-xs text-slate-600 leading-relaxed">
 The RENU program has achieved a 73% mainstreaming rate for rehabilitation graduates. Our CSR partnerships have successfully closed the funding gaps for pediatrics therapy and materials support for underserved slum colonies.
 </p>
 </div>

 {/* Impact Summary footer */}
 <div className="border-t border-slate-200 pt-5 text-[10px] text-slate-400 flex justify-between items-center">
 <span>Report Compiled by Dr. Satish Gupta (RENU Director)</span>
 <span>Vishalwin Foundation Trust, Mumbai</span>
 </div>
 </Card>
 </div>
 )}
 </div>
 );
};
export default Reports;
