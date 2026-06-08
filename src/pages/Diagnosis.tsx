import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Child, Diagnosis, TherapyCentre } from'../types';
import { Card, Badge, Button, Input, Select, Label, Tabs, Textarea, Modal } from'../components/ui';
import { FileText, CheckCircle2, AlertCircle, FileCheck, Stethoscope, Search, Plus, Calendar, Upload } from'lucide-react';
import EmptyState from'../components/common/EmptyState';

export const DiagnosisPage: React.FC = () => {
 const { role, isAdmin } = useRole();
 
 // Data States
 const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
 const [children, setChildren] = useState<Child[]>([]);
 const [centres, setCentres] = useState<TherapyCentre[]>([]);

 // UI States
 const [activeTab, setActiveTab] = useState('diagnosed');
 const [searchQuery, setSearchQuery] = useState('');
 
 // Log Diagnosis Modal
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedChild, setSelectedChild] = useState<Child | null>(null);
 
 // Form State
 const [formData, setFormData] = useState({
 date: new Date().toISOString().split('T')[0],
 centreName:'',
 assessmentSummary:'',
 certificateAvailable: false,
 assessmentScore: 70,
 outcome:'',
 fileName:''
 });

 useEffect(() => {
 loadData();
 }, []);

 const loadData = () => {
 setDiagnoses(RenuStore.getDiagnoses());
 setChildren(RenuStore.getChildren());
 const loadedCentres = RenuStore.getTherapyCentres();
 setCentres(loadedCentres);
 if (loadedCentres.length > 0) {
 setFormData(prev => ({ ...prev, centreName: loadedCentres[0].name }));
 }
 };

 // Filter Children for tabs
 const diagnosedChildIds = new Set(diagnoses.map(d => d.childId));

 const diagnosedChildrenList = children.filter(c => {
 const isDiagnosed = c.classification ==='Special'&& diagnosedChildIds.has(c.id);
 const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 c.id.toLowerCase().includes(searchQuery.toLowerCase());
 return isDiagnosed && matchesSearch;
 });

 const pendingChildrenList = children.filter(c => {
 const isPending = c.classification ==='Special'&& !diagnosedChildIds.has(c.id);
 const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 c.id.toLowerCase().includes(searchQuery.toLowerCase());
 return isPending && matchesSearch;
 });

 const getChildDiagnosis = (childId: string) => {
 return diagnoses.find(d => d.childId === childId);
 };

 const handleOpenLogModal = (childItem: Child) => {
 setSelectedChild(childItem);
 setIsModalOpen(true);
 };

 const handleLogSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedChild) return;

 const newDiagnosis: Diagnosis = {
 id:`DIA-${600 + diagnoses.length + 1}`,
 childId: selectedChild.id,
 childName: selectedChild.name,
 date: formData.date,
 centreName: formData.centreName,
 assessmentSummary: formData.assessmentSummary ||'General clinical review completed.',
 certificateAvailable: formData.certificateAvailable,
 medicalReportUrl: formData.fileName ?`/reports/filed_${selectedChild.id}_${formData.fileName}`: undefined,
 assessmentScore: Number(formData.assessmentScore) || 75,
 outcome: formData.outcome ||'Recommended for routine therapy.'
 };

 // Save diagnosis
 const updatedDiag = [...diagnoses, newDiagnosis];
 RenuStore.saveDiagnoses(updatedDiag);
 setDiagnoses(updatedDiag);

 // Update child journey status to'Therapy Centre Enrollment'automatically
 const allChildren = RenuStore.getChildren();
 const updatedChildren = allChildren.map(c => {
 if (c.id === selectedChild.id) {
 return {
 ...c,
 journeyStatus:'Therapy Centre Enrollment'as const
 };
 }
 return c;
 });
 RenuStore.saveChildren(updatedChildren);
 setChildren(updatedChildren);

 setIsModalOpen(false);
 showToast('Clinical Diagnosis Logged','success',`Assessment successfully logged for ${selectedChild.name}.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 
 // Reset form
 setFormData({
 date: new Date().toISOString().split('T')[0],
 centreName: centres[0]?.name ||'',
 assessmentSummary:'',
 certificateAvailable: false,
 assessmentScore: 70,
 outcome:'',
 fileName:''
 });
 setSelectedChild(null);
 };

 // Mock File Upload action
 const handleMockUpload = () => {
 setFormData(prev => ({
 ...prev,
 fileName:'medical_report_signed.pdf'
 }));
 showToast('Report Uploaded','info','Mock medical certificate PDF was attached.');
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Clinical Diagnosis Directory</h1>
 <p className="text-xs text-slate-500 mt-1">Enroll medical reports, track development assessment scores, and log government disability certificates.</p>
 </div>
 </div>

 {/* Tabs */}
 <Tabs
 tabs={[
 { id:'diagnosed', label:`Assessed Children (${diagnosedChildrenList.length})`},
 { id:'pending', label:`Pending Assessment (${pendingChildrenList.length})`},
 ]}
 activeTab={activeTab}
 onChange={setActiveTab}
 />

 {/* Global Search card */}
 <Card className="p-4">
 <div className="relative max-w-sm">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
 <Input
 placeholder="Search by child name or ID..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
 </Card>

 {/* Content Grid */}
 {activeTab ==='diagnosed'? (
 diagnosedChildrenList.length === 0 ? (
 <EmptyState
 title="No Diagnosed Children Found"
 description="No matching assessed children reports were found in our directory database."
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
 {diagnosedChildrenList.map(c => {
 const diag = getChildDiagnosis(c.id);
 if (!diag) return null;
 
 return (
 <Card key={c.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
 <div>
 {/* Header info */}
 <div className="flex justify-between items-start mb-3 border-b border-slate-200 pb-2">
 <div>
 <h3 
 onClick={() => window.location.hash =`#/children/${c.id}`}
 className="text-xs font-bold text-slate-800 hover:text-brand-cyan-700 hover:underline cursor-pointer"
 >
 {c.name}
 </h3>
 <p className="text-[10px] text-slate-400 mt-0.5">ID: {c.id} | Age: {c.age} | Disability: {c.disabilityType}</p>
 </div>
 <Badge color={diag.certificateAvailable ?'success':'warning'} className="scale-90 px-2.5 py-0 font-semibold">
 {diag.certificateAvailable ?'Certificate Available':'No Certificate'}
 </Badge>
 </div>

 {/* Scores & center info */}
 <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
 <div className="p-2 bg-slate-50/50 border border-slate-100/50 rounded-lg">
 <span className="text-[9px] text-slate-400 font-bold block uppercase">Score</span>
 <span className="text-sm font-extrabold text-brand-cyan-800">{diag.assessmentScore} / 100</span>
 </div>
 <div className="p-2 bg-slate-50/50 border border-slate-100/50 rounded-lg col-span-2 text-left">
 <span className="text-[9px] text-slate-400 font-bold block uppercase pl-1">Centre Location</span>
 <span className="text-[11px] font-bold text-slate-700 truncate block pl-1 mt-0.5">{diag.centreName}</span>
 </div>
 </div>

 <div className="space-y-2.5">
 <div>
 <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Clinical Summary</div>
 <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{diag.assessmentSummary}</p>
 </div>
 <div>
 <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Outcome Recommendation</div>
 <p className="text-xs font-medium text-slate-800 mt-0.5 leading-relaxed">{diag.outcome}</p>
 </div>
 </div>
 </div>

 {/* Actions / uploader status */}
 <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100">
 <div className="flex items-center gap-1.5 text-slate-500">
 <Calendar className="h-3.5 w-3.5"/>
 <span>Assessed: {diag.date}</span>
 </div>
 {diag.medicalReportUrl ? (
 <Badge color="primary"variant="soft"className="flex items-center gap-1">
 <FileCheck className="h-3 w-3"/> Report Filed
 </Badge>
 ) : (
 <span className="text-[10px] text-slate-400 italic">No document file attached</span>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 )
 ) : (
 pendingChildrenList.length === 0 ? (
 <EmptyState
 title="All Assessments Logged"
 description="There are no children currently waiting for clinical assessments. Great job!"
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {pendingChildrenList.map(c => (
 <Card key={c.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-full bg-brand-cyan-50 text-brand-cyan-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
 {c.name.split('').map(n => n[0]).join('')}
 </div>
 <div>
 <h3 className="text-xs font-bold text-slate-800">{c.name}</h3>
 <p className="text-[10px] text-slate-400">ID: {c.id} • Disability: {c.disabilityType} ({c.severity})</p>
 </div>
 </div>
 <div>
 <Button
 size="sm"
 onClick={() => handleOpenLogModal(c)}
 className="flex items-center gap-1 cursor-pointer"
 >
 <Stethoscope className="h-3.5 w-3.5"/> Log Assessment
 </Button>
 </div>
 </Card>
 ))}
 </div>
 )
 )}

 {/* Log Assessment Form Modal */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => { setIsModalOpen(false); setSelectedChild(null); }}
 title={selectedChild ?`Log Clinical Diagnosis for ${selectedChild.name}`:''}
 size="lg"
 >
 <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Assessment Date *</Label>
 <Input
 type="date"
 value={formData.date}
 onChange={e => setFormData({ ...formData, date: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Diagnosed Centre / Hospital *</Label>
 <Select
 options={centres.map(tc => ({ label: tc.name, value: tc.name }))}
 value={formData.centreName}
 onChange={e => setFormData({ ...formData, centreName: e.target.value })}
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label>Assessment score (0 - 100) *</Label>
 <Input
 type="number"
 min={0}
 max={100}
 value={formData.assessmentScore}
 onChange={e => setFormData({ ...formData, assessmentScore: Number(e.target.value) })}
 required
 />
 </div>
 
 <div className="md:col-span-2">
 <Label>Government Disability Certificate Issued?</Label>
 <div className="flex gap-4 mt-2.5">
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
 <input
 type="radio"
 checked={formData.certificateAvailable === true}
 onChange={() => setFormData({ ...formData, certificateAvailable: true })}
 className="accent-teal-600 h-4 w-4"
 />
 Yes, Certificate Available
 </label>
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
 <input
 type="radio"
 checked={formData.certificateAvailable === false}
 onChange={() => setFormData({ ...formData, certificateAvailable: false })}
 className="accent-teal-600 h-4 w-4"
 />
 No, Pending Issuance
 </label>
 </div>
 </div>
 </div>

 <div>
 <Label>Assessment Findings Summary *</Label>
 <Textarea
 rows={2}
 placeholder="Clinical markers, development delays noted, behavioral evaluations..."
 value={formData.assessmentSummary}
 onChange={e => setFormData({ ...formData, assessmentSummary: e.target.value })}
 required
 />
 </div>

 <div>
 <Label>Diagnosis Outcome & Therapy Recommendations *</Label>
 <Textarea
 rows={2}
 placeholder="Suggested therapies (Occupational, Speech, Physiotherapy), school readiness milestones..."
 value={formData.outcome}
 onChange={e => setFormData({ ...formData, outcome: e.target.value })}
 required
 />
 </div>

 {/* Medical report upload UI */}
 <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
 <Label className="mb-2">Attach Signed Medical Report PDF</Label>
 <div className="flex flex-col items-center justify-center gap-2">
 <Upload className="h-6 w-6 text-slate-400"/>
 {formData.fileName ? (
 <div className="flex items-center gap-1 text-xs font-semibold text-brand-success">
 <FileCheck className="h-4 w-4"/> {formData.fileName}
 </div>
 ) : (
 <div className="text-[10px] text-slate-400">PDF formats under 5MB allowed</div>
 )}
 <Button
 variant="outline"
 size="sm"
 type="button"
 onClick={handleMockUpload}
 className="mt-1 flex items-center gap-1 cursor-pointer"
 >
 Upload Document File
 </Button>
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => { setIsModalOpen(false); setSelectedChild(null); }}>
 Cancel
 </Button>
 <Button type="submit">
 Log Assessment Outcomes
 </Button>
 </div>
 </form>
 </Modal>

 </div>
 );
};
export default DiagnosisPage;
