import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Child, Camp, DisabilityType, SeverityLevel, ChildJourneyStatus } from'../types';
import { Card, Badge, Button, Input, Select, Label, Modal } from'../components/ui';
import { Search, MapPin, ChevronRight, Sparkles, Clipboard, Heart, Settings, AlertCircle, Info, Plus } from'lucide-react';
import EmptyState from'../components/common/EmptyState';
import { useNavigate, useSearchParams } from'react-router-dom';
import { JOURNEY_STEPS } from'../components/common/RenuJourneyTracker';
import { motion } from'framer-motion';

export const Children: React.FC = () => {
 const { role } = useRole();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();

 // Data States
 const [children, setChildren] = useState<Child[]>([]);
 const [camps, setCamps] = useState<Camp[]>([]);

 // Search & Filter State
 const [search, setSearch] = useState('');
 const [classFilter, setClassFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All');
 const [disabilityFilter, setDisabilityFilter] = useState('All');
 const [severityFilter, setSeverityFilter] = useState('All');
 const [campFilter, setCampFilter] = useState('All');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Add Child Modal State
 const [isAddOpen, setIsAddOpen] = useState(false);
 const [regStep, setRegStep] = useState(1);

 // Form State
 const [formData, setFormData] = useState({
 name:'',
 gender:'Male'as Child['gender'],
 dob:'',
 fatherName:'',
 motherName:'',
 guardianName:'',
 mobile:'',
 alternateMobile:'',
 address:'',
 area:'',
 city:'Mumbai',
 pincode:'',
 campId:'',
 schoolName:'',
 currentStandard:'',
 isNotEnrolled: true,
 classification:'Special'as Child['classification'],
 disabilityType:'Speech Delay'as DisabilityType,
 severity:'Mild'as SeverityLevel,
 journeyStatus:'Medical Camp'as ChildJourneyStatus,
 });

 useEffect(() => {
 loadData();
 
 // Check if query params specify filters or open registration
 const registerParam = searchParams.get('register');
 if (registerParam ==='true') {
 setIsAddOpen(true);
 }
 const statusParam = searchParams.get('status');
 if (statusParam) {
 setStatusFilter(statusParam);
 }
 const searchParam = searchParams.get('search');
 if (searchParam !== null) {
 setSearch(searchParam);
 } else {
 setSearch('');
 }
 }, [searchParams]);

 const loadData = () => {
 setChildren(RenuStore.getChildren());
 const loadedCamps = RenuStore.getCamps();
 setCamps(loadedCamps);
 if (loadedCamps.length > 0) {
 setFormData(prev => ({ 
 ...prev, 
 campId: loadedCamps[0].id, 
 area: loadedCamps[0].area, 
 city: loadedCamps[0].city 
 }));
 }
 };

 // Filter & Search Logic
 const filteredChildren = children.filter(c => {
 const s = search.toLowerCase().trim();
 const matchSearch =
 c.name.toLowerCase().includes(s) ||
 c.id.toLowerCase().includes(s) ||
 c.area.toLowerCase().includes(s) ||
 (c.fatherName && c.fatherName.toLowerCase().includes(s)) ||
 (c.motherName && c.motherName.toLowerCase().includes(s)) ||
 (c.guardianName && c.guardianName.toLowerCase().includes(s)) ||
 c.mobile.includes(s) ||
 (c.alternateMobile && c.alternateMobile.includes(s)) ||
 (c.disabilityType && c.disabilityType.toLowerCase().includes(s)) ||
 (c.severity && c.severity.toLowerCase().includes(s)) ||
 c.journeyStatus.toLowerCase().includes(s);

 const matchClass = classFilter ==='All'|| c.classification === classFilter;
 const matchStatus = statusFilter ==='All'|| c.journeyStatus === statusFilter;
 const matchCamp = campFilter ==='All'|| c.campId === campFilter;
 
 // Expanded requirements filters
 const matchDisability = disabilityFilter ==='All'|| c.disabilityType === disabilityFilter;
 const matchSeverity = severityFilter ==='All'|| c.severity === severityFilter;

 return matchSearch && matchClass && matchStatus && matchCamp && matchDisability && matchSeverity;
 });

 // Pagination
 const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);
 const paginatedChildren = filteredChildren.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 const getCampName = (campId?: string) => {
 if (!campId) return'N/A';
 return camps.find(c => c.id === campId)?.name ||'Unknown Camp';
 };

 const handleCampChange = (campId: string) => {
 const selectedCamp = camps.find(c => c.id === campId);
 if (selectedCamp) {
 setFormData(prev => ({
 ...prev,
 campId,
 area: selectedCamp.area,
 city: selectedCamp.city,
 }));
 }
 };

 const calculateAge = (dobString: string): number => {
 if (!dobString) return 5;
 const dob = new Date(dobString);
 const diffMs = Date.now() - dob.getTime();
 const ageDate = new Date(diffMs);
 return Math.abs(ageDate.getUTCFullYear() - 1970) || 5;
 };

 // Register Child Form Submit
 const handleRegisterSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.name || !formData.dob || !formData.fatherName || !formData.mobile) {
 showToast('Validation Error','danger','Please fill in name, date of birth, father name and mobile number.');
 return;
 }

 const calculatedAge = calculateAge(formData.dob);
 const registeredDate = new Date().toISOString().split('T')[0];

 const newChild: Child = {
 id:`CHI-${400 + children.length + 1}`,
 name: formData.name,
 photo:`https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.name}`,
 dob: formData.dob,
 age: calculatedAge,
 gender: formData.gender,
 fatherName: formData.fatherName,
 motherName: formData.motherName,
 guardianName: formData.guardianName || undefined,
 mobile: formData.mobile,
 alternateMobile: formData.alternateMobile || undefined,
 address: formData.address,
 area: formData.area,
 city: formData.city,
 pincode: formData.pincode,
 schoolName: formData.isNotEnrolled ? undefined : formData.schoolName,
 currentStandard: formData.isNotEnrolled ? undefined : formData.currentStandard,
 isNotEnrolled: formData.isNotEnrolled,
 classification: formData.classification,
 disabilityType: formData.classification ==='Special'? formData.disabilityType : undefined,
 severity: formData.classification ==='Special'? formData.severity : undefined,
 journeyStatus: formData.classification ==='Normal'?'School Ready': formData.journeyStatus,
 registeredDate,
 campId: formData.campId,
 documents: [],
 certificateAvailable: false,
 therapyProgressScore: undefined
 };

 const updatedChildren = [newChild, ...children];
 RenuStore.saveChildren(updatedChildren);
 setChildren(updatedChildren);
 setIsAddOpen(false);
 setRegStep(1);
 
 // Update Camp counter metrics
 const updatedCamps = camps.map(camp => {
 if (camp.id === formData.campId) {
 return {
 ...camp,
 registeredCount: camp.registeredCount + 1,
 normalCount: camp.normalCount + (formData.classification ==='Normal'? 1 : 0),
 specialCount: camp.specialCount + (formData.classification ==='Special'? 1 : 0),
 followUpsRequiredCount: camp.followUpsRequiredCount + (formData.classification ==='Special'? 1 : 0),
 };
 }
 return camp;
 });
 RenuStore.saveCamps(updatedCamps);
 setCamps(updatedCamps);

 showToast('Child Registered','success',`${newChild.name} successfully registered in the system.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 resetForm();
 };

 const resetForm = () => {
 setFormData({
 name:'',
 gender:'Male',
 dob:'',
 fatherName:'',
 motherName:'',
 guardianName:'',
 mobile:'',
 alternateMobile:'',
 address:'',
 area: camps[0]?.area ||'',
 city: camps[0]?.city ||'Mumbai',
 pincode:'',
 campId: camps[0]?.id ||'',
 schoolName:'',
 currentStandard:'',
 isNotEnrolled: true,
 classification:'Special',
 disabilityType:'Speech Delay',
 severity:'Mild',
 journeyStatus:'Medical Camp',
 });
 };

 const classificationOptions = [
 { label:'All Classifications', value:'All'},
 { label:'Normal Child', value:'Normal'},
 { label:'Special Child', value:'Special'},
 ];

 const disabilityOptions = [
 { label:'All Disabilities', value:'All'},
 { label:'Autism Spectrum', value:'Autism'},
 { label:'Down Syndrome', value:'Down Syndrome'},
 { label:'ADHD', value:'ADHD'},
 { label:'Intellectual Disability', value:'Intellectual Disability'},
 { label:'Speech Delay', value:'Speech Delay'},
 { label:'Development Delay', value:'Development Delay'},
 { label:'Learning Disability', value:'Learning Disability'},
 { label:'Other', value:'Other'}
 ];

 const severityOptions = [
 { label:'All Severities', value:'All'},
 { label:'Mild', value:'Mild'},
 { label:'Moderate', value:'Moderate'},
 { label:'Severe', value:'Severe'}
 ];

 const journeyOptions = [
 { label:'All Journey Stages', value:'All'},
 ...JOURNEY_STEPS.map(step => ({ label: step, value: step }))
 ];

 return (
 <div className="space-y-6 text-slate-800">
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Children Directory</h1>
 <p className="text-xs text-slate-500 mt-1">Manage, filter, and track development outcomes of registered children.</p>
 </div>
 <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="flex items-center gap-1.5 cursor-pointer shadow-sm">
 <Plus className="h-4 w-4"/> Register New Child
 </Button>
 </div>

 {/* Expanded filters */}
 <Card className="p-4 text-xs">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"/>
 <Input
 placeholder="Search ID, name..."
 value={search}
 onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
 className="pl-8 text-xs py-1.5 bg-slate-50/50"
 />
 </div>
 {/* Classification */}
 <div>
 <Select
 options={classificationOptions}
 value={classFilter}
 onChange={e => { setClassFilter(e.target.value); setCurrentPage(1); }}
 className="text-xs py-1.5"
 />
 </div>
 {/* Disability Type */}
 <div>
 <Select
 options={disabilityOptions}
 value={disabilityFilter}
 onChange={e => { setDisabilityFilter(e.target.value); setCurrentPage(1); }}
 className="text-xs py-1.5"
 disabled={classFilter ==='Normal'}
 />
 </div>
 {/* Severity */}
 <div>
 <Select
 options={severityOptions}
 value={severityFilter}
 onChange={e => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
 className="text-xs py-1.5"
 disabled={classFilter ==='Normal'}
 />
 </div>
 {/* Journey Status */}
 <div>
 <Select
 options={journeyOptions}
 value={statusFilter}
 onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
 className="text-xs py-1.5"
 />
 </div>
 {/* Camp filter */}
 <div>
 <Select
 options={[{ label:'All Camps', value:'All'}, ...camps.map(c => ({ label: c.name, value: c.id }))]}
 value={campFilter}
 onChange={e => { setCampFilter(e.target.value); setCurrentPage(1); }}
 className="text-xs py-1.5"
 />
 </div>
 </div>
 </Card>

 {/* Children Directory List */}
 {filteredChildren.length === 0 ? (
 <EmptyState
 title="No Children Found"
 description="Try clearing search queries or adjusting category filters to find registered children."
 actionText="Register New Child"
 onAction={() => setIsAddOpen(true)}
 />
 ) : (
 <div className="space-y-4">
 <Card className="overflow-hidden border border-slate-200 rounded-2xl bg-white">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
 <th className="p-4">Child ID & Name</th>
 <th className="p-4">Age & Gender</th>
 <th className="p-4">Classification</th>
 <th className="p-4">Disability Details</th>
 <th className="p-4">Camp & Registered</th>
 <th className="p-4">Current Journey Stage</th>
 <th className="p-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700">
 {paginatedChildren.map(c => (
 <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
 <td className="p-4 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-extrabold flex items-center justify-center shadow-inner">
 {c.name.split('').slice(0, 2).map(n => n[0]).join('')}
 </div>
 <div>
 <span 
 onClick={() => navigate(`/children/${c.id}`)}
 className="font-bold text-slate-900 group-hover:text-indigo-600 hover:underline transition-colors cursor-pointer"
 >
 {c.name}
 </span>
 <div className="text-[10px] text-slate-400 mt-0.5">ID: {c.id}</div>
 </div>
 </div>
 </td>
 <td className="p-4 border-b border-slate-100">
 <div className="font-semibold text-slate-800">{c.age} years</div>
 <div className="text-[10px] text-slate-400 mt-0.5">{c.gender}</div>
 </td>
 <td className="p-4 border-b border-slate-100">
 <Badge color={c.classification ==='Special'?'danger':'success'} className="font-bold scale-95 origin-left">
 {c.classification ==='Special'?'Special Needs':'Normal Dev'}
 </Badge>
 </td>
 <td className="p-4 border-b border-slate-100">
 {c.classification ==='Special'? (
 <div>
 <span className="font-semibold text-slate-700">{c.disabilityType}</span>
 <div className="text-[10px] text-slate-400 mt-0.5">Severity: {c.severity}</div>
 </div>
 ) : (
 <div className="text-slate-400 italic">No immediate intervention</div>
 )}
 </td>
 <td className="p-4 border-b border-slate-100">
 <div className="flex items-center gap-1.5 font-semibold text-slate-700">
 <span>{c.area}</span>
 </div>
 <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]">{getCampName(c.campId)}</div>
 </td>
 <td className="p-4 border-b border-slate-100">
 <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
 <span className={`h-1.5 w-1.5 rounded-full ${
 c.journeyStatus ==='School Admission'?'bg-indigo-600':
 c.journeyStatus ==='School Ready'?'bg-purple-600':
 c.journeyStatus ==='Active Therapy'?'bg-teal-500':'bg-amber-500'
 }`} />
 <span className="text-[10px] font-bold">{c.journeyStatus}</span>
 </div>
 </td>
 <td className="p-4 border-b border-slate-100 text-right">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => navigate(`/children/${c.id}`)}
 className="flex items-center gap-1 cursor-pointer ml-auto"
 >
 Profile <ChevronRight className="h-3.5 w-3.5"/>
 </Button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>

 {/* Pagination Controls */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold">
 <span className="text-slate-500">
 Showing {Math.min(filteredChildren.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredChildren.length, currentPage * itemsPerPage)} of {filteredChildren.length} children
 </span>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 disabled={currentPage === 1}
 onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
 >
 Previous
 </Button>
 <Button
 variant="outline"
 size="sm"
 disabled={currentPage === totalPages}
 onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Redesigned Premium Register Child Stepper Modal */}
 <Modal
 isOpen={isAddOpen}
 onClose={() => { setIsAddOpen(false); setRegStep(1); }}
 title={`Register Child: Registration Wizard (Step ${regStep} of 4)`}
 size="lg"
 >
 {/* Step Indicators */}
 <div className="flex gap-2.5 mb-6">
 {['Basic Info','Parents & Contact','School Status','Classification'].map((label, index) => {
 const stepNum = index + 1;
 const isCompleted = regStep > stepNum;
 const isActive = regStep === stepNum;
 return (
 <div key={label} className="flex-1 flex flex-col gap-1.5">
 <div className={`h-1.5 rounded-full transition-all duration-300 ${
 isActive ?'bg-indigo-600': isCompleted ?'bg-emerald-500':'bg-slate-100'
 }`} />
 <span className={`text-[9px] font-bold text-center block ${
 isActive ?'text-indigo-600':'text-slate-400'
 }`}>{label}</span>
 </div>
 );
 })}
 </div>

 <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
 {/* STEP 1: Basic Information */}
 {regStep === 1 && (
 <div className="space-y-4 animate-in fade-in duration-200">
 <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl flex gap-2.5">
 <Info className="h-4.5 w-4.5 text-indigo-600 mt-0.5 flex-shrink-0"/>
 <p className="text-[10px] text-indigo-900 leading-relaxed font-semibold">
 Enter child demographics. Age is automatically calculated using the date of birth entered below.
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Child Name *</Label>
 <Input
 placeholder="Full Name (e.g. Vihaan Sharma)"
 value={formData.name}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Gender *</Label>
 <Select
 options={[
 { label:'Male', value:'Male'},
 { label:'Female', value:'Female'},
 { label:'Other', value:'Other'},
 ]}
 value={formData.gender}
 onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Date of Birth *</Label>
 <Input
 type="date"
 value={formData.dob}
 onChange={e => setFormData({ ...formData, dob: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Registered Camp Location *</Label>
 <Select
 options={camps.map(c => ({ label: c.name, value: c.id }))}
 value={formData.campId}
 onChange={e => handleCampChange(e.target.value)}
 required
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 2: Parents & Addresses */}
 {regStep === 2 && (
 <div className="space-y-4 animate-in fade-in duration-200">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Father Name *</Label>
 <Input
 placeholder="Father Name"
 value={formData.fatherName}
 onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Mother Name</Label>
 <Input
 placeholder="Mother Name"
 value={formData.motherName}
 onChange={e => setFormData({ ...formData, motherName: e.target.value })}
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="md:col-span-1">
 <Label>Guardian Name</Label>
 <Input
 placeholder="Optional Guardian Name"
 value={formData.guardianName}
 onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
 />
 </div>
 <div>
 <Label>Mobile Number *</Label>
 <Input
 placeholder="+91 99887 XXXXX"
 value={formData.mobile}
 onChange={e => setFormData({ ...formData, mobile: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Alternate Contact</Label>
 <Input
 placeholder="+91 99887 XXXXX"
 value={formData.alternateMobile}
 onChange={e => setFormData({ ...formData, alternateMobile: e.target.value })}
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="md:col-span-2">
 <Label>Address *</Label>
 <Input
 placeholder="Street Address, Block or Slum Locality"
 value={formData.address}
 onChange={e => setFormData({ ...formData, address: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Pincode *</Label>
 <Input
 placeholder="400001"
 value={formData.pincode}
 onChange={e => setFormData({ ...formData, pincode: e.target.value })}
 required
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: School Status */}
 {regStep === 3 && (
 <div className="space-y-4 animate-in fade-in duration-200">
 <div>
 <Label>Is the child currently enrolled in school?</Label>
 <div className="flex gap-6 mt-2">
 <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
 <input
 type="radio"
 checked={formData.isNotEnrolled === false}
 onChange={() => setFormData({ ...formData, isNotEnrolled: false })}
 className="accent-indigo-600 h-4.5 w-4.5"
 />
 Yes, Enrolled
 </label>
 <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
 <input
 type="radio"
 checked={formData.isNotEnrolled === true}
 onChange={() => setFormData({ ...formData, isNotEnrolled: true })}
 className="accent-indigo-600 h-4.5 w-4.5"
 />
 No, Not Enrolled
 </label>
 </div>
 </div>

 {!formData.isNotEnrolled && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-200">
 <div>
 <Label>School Name</Label>
 <Input
 placeholder="e.g. Municipal Primary School"
 value={formData.schoolName}
 onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
 />
 </div>
 <div>
 <Label>Current Standard/Grade</Label>
 <Input
 placeholder="e.g. 1st Std"
 value={formData.currentStandard}
 onChange={e => setFormData({ ...formData, currentStandard: e.target.value })}
 />
 </div>
 </div>
 )}
 </div>
 )}

 {/* STEP 4: Classification */}
 {regStep === 4 && (
 <div className="space-y-4 animate-in fade-in duration-200">
 <div>
 <Label>Pediatric Screening Classification *</Label>
 <div className="grid grid-cols-2 gap-4 mt-2">
 <div 
 onClick={() => setFormData({ ...formData, classification:'Normal', journeyStatus:'School Ready'})}
 className={`p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
 formData.classification ==='Normal'
 ?'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-100/50'
 :'border-slate-200 hover:bg-slate-50'
 }`}
 >
 <span className="font-extrabold text-slate-800 block text-xs">Development Normal</span>
 <span className="text-[10px] text-slate-400 mt-1.5 block leading-normal">Meets developmental milestones. No immediate clinical intervention.</span>
 </div>

 <div 
 onClick={() => setFormData({ ...formData, classification:'Special', journeyStatus:'Medical Camp'})}
 className={`p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
 formData.classification ==='Special'
 ?'border-red-500 bg-red-50/50 shadow-sm ring-2 ring-red-100/50'
 :'border-slate-200 hover:bg-slate-50'
 }`}
 >
 <span className="font-extrabold text-slate-800 block text-xs">Special needs Child</span>
 <span className="text-[10px] text-slate-400 mt-1.5 block leading-normal">Neurodiversity or development delay identified. Needs therapy placements.</span>
 </div>
 </div>
 </div>

 {formData.classification ==='Special'&& (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-200 bg-slate-50/50 rounded-2xl animate-in slide-in-from-top duration-250">
 <div>
 <Label>Disability Type</Label>
 <Select
 options={[
 { label:'Autism Spectrum', value:'Autism'},
 { label:'Down Syndrome', value:'Down Syndrome'},
 { label:'ADHD', value:'ADHD'},
 { label:'Intellectual Disability', value:'Intellectual Disability'},
 { label:'Speech Delay', value:'Speech Delay'},
 { label:'Development Delay', value:'Development Delay'},
 { label:'Learning Disability', value:'Learning Disability'},
 { label:'Other', value:'Other'},
 ]}
 value={formData.disabilityType}
 onChange={e => setFormData({ ...formData, disabilityType: e.target.value as any })}
 />
 </div>
 <div>
 <Label>Severity Level</Label>
 <Select
 options={[
 { label:'Mild', value:'Mild'},
 { label:'Moderate', value:'Moderate'},
 { label:'Severe', value:'Severe'},
 ]}
 value={formData.severity}
 onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
 />
 </div>
 <div>
 <Label>Initial Journey Stage</Label>
 <Select
 options={[
 { label:'Medical Camp (Start)', value:'Medical Camp'},
 { label:'Screening', value:'Screening'},
 { label:'Child Classification', value:'Child Classification'},
 { label:'Follow-Up', value:'Follow-Up'},
 ]}
 value={formData.journeyStatus}
 onChange={e => setFormData({ ...formData, journeyStatus: e.target.value as any })}
 />
 </div>
 </div>
 )}
 </div>
 )}

 {/* Action buttons */}
 <div className="flex justify-between items-center pt-4 border-t border-slate-100">
 <div>
 {regStep > 1 && (
 <Button variant="outline"type="button"onClick={() => setRegStep(s => s - 1)}>
 Previous Step
 </Button>
 )}
 </div>
 <div className="flex gap-2">
 <Button variant="outline"type="button"onClick={() => { setIsAddOpen(false); setRegStep(1); }}>
 Cancel
 </Button>
 {regStep < 4 ? (
 <Button type="button"onClick={() => setRegStep(s => s + 1)}>
 Next Step
 </Button>
 ) : (
 <Button type="submit">
 Log Registration
 </Button>
 )}
 </div>
 </div>
 </form>
 </Modal>
 </div>
 );
};
export default Children;
