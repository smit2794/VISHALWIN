import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Child, SchoolAdmissionDetails } from'../types';
import { Card, Badge, Button, Input, Select, Label, Modal } from'../components/ui';
import { GraduationCap, Search, CheckCircle2, AlertCircle, FileCheck, Pencil, Calendar, Award } from'lucide-react';
import EmptyState from'../components/common/EmptyState';

export const SchoolAdmissions: React.FC = () => {
 const { role } = useRole();
 const [children, setChildren] = useState<Child[]>([]);
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('All');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Manage modal states
 const [selectedChild, setSelectedChild] = useState<Child | null>(null);
 const [isEditOpen, setIsEditOpen] = useState(false);

 // Form State
 const [formData, setFormData] = useState({
 admissionDate:'',
 schoolName:'',
 schoolType:'Government'as SchoolAdmissionDetails['schoolType'],
 standard:'',
 admissionStatus:'Identified'as SchoolAdmissionDetails['admissionStatus'],
 educationSupport: [] as string[],
 feesSponsored: false,
 feesSponsoredAmount: 0,
 remarks:''
 });

 useEffect(() => {
 loadData();
 }, []);

 const loadData = () => {
 setChildren(RenuStore.getChildren());
 };

 // Filter children who are ready for mainstreaming (School Ready or School Admission)
 const admissionPool = children.filter(c => c.journeyStatus ==='School Ready'|| c.journeyStatus ==='School Admission');

 const filteredPool = admissionPool.filter(c => {
 const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
 c.id.toLowerCase().includes(search.toLowerCase()) ||
 (c.schoolAdmission?.schoolName ||'').toLowerCase().includes(search.toLowerCase());
 const matchStatus = statusFilter ==='All'|| c.schoolAdmission?.admissionStatus === statusFilter;
 return matchSearch && matchStatus;
 });

 // Pagination
 const totalPages = Math.ceil(filteredPool.length / itemsPerPage);
 const paginatedPool = filteredPool.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 // Analytics Calculations
 const schoolReadyCount = children.filter(c => c.journeyStatus ==='School Ready').length;
 const admissionsCompleted = children.filter(c => c.journeyStatus ==='School Admission').length;
 const totalPoolCount = schoolReadyCount + admissionsCompleted;
 const successRate = totalPoolCount > 0 ? Math.round((admissionsCompleted / totalPoolCount) * 100) : 0;

 const handleOpenEdit = (child: Child) => {
 setSelectedChild(child);
 const details = child.schoolAdmission || {};
 setFormData({
 admissionDate: details.admissionDate || new Date().toISOString().split('T')[0],
 schoolName: details.schoolName ||'',
 schoolType: details.schoolType ||'Government',
 standard: details.standard ||'',
 admissionStatus: details.admissionStatus ||'Identified',
 educationSupport: details.educationSupportProvided || [],
 feesSponsored: details.feesSponsored || false,
 feesSponsoredAmount: details.feesSponsoredAmount || 0,
 remarks: details.remarks ||''
 });
 setIsEditOpen(true);
 };

 const handleCheckboxChange = (supportItem: string) => {
 const active = [...formData.educationSupport];
 if (active.includes(supportItem)) {
 setFormData({
 ...formData,
 educationSupport: active.filter(item => item !== supportItem)
 });
 } else {
 setFormData({
 ...formData,
 educationSupport: [...active, supportItem]
 });
 }
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedChild) return;

 const admissionDetails: SchoolAdmissionDetails = {
 admissionDate: formData.admissionDate,
 schoolName: formData.schoolName || undefined,
 schoolType: formData.schoolType,
 standard: formData.standard || undefined,
 admissionStatus: formData.admissionStatus,
 educationSupportProvided: formData.educationSupport as any,
 feesSponsored: formData.feesSponsored,
 feesSponsoredAmount: formData.feesSponsored ? Number(formData.feesSponsoredAmount) : 0,
 remarks: formData.remarks || undefined
 };

 // Update child journey status automatically if confirmed
 let newJourneyStatus = selectedChild.journeyStatus;
 if (formData.admissionStatus ==='Confirmed') {
 newJourneyStatus ='School Admission';
 } else {
 newJourneyStatus ='School Ready';
 }

 const updatedChildren = children.map(c => {
 if (c.id === selectedChild.id) {
 return {
 ...c,
 journeyStatus: newJourneyStatus,
 schoolAdmission: admissionDetails,
 // Sync legacy profile fields
 schoolName: admissionDetails.schoolName,
 currentStandard: admissionDetails.standard,
 isNotEnrolled: formData.admissionStatus !=='Confirmed'
 };
 }
 return c;
 });

 RenuStore.saveChildren(updatedChildren);
 setChildren(updatedChildren);
 setIsEditOpen(false);

 // Log Coordinator Activity timeline
 RenuStore.logCoordinatorActivity(
'COORD-100', // Rohan Kulkarni
'Progress',
`Updated mainstream school admission: Status ${formData.admissionStatus} at ${formData.schoolName ||'unassigned'}`,
 selectedChild.id,
 selectedChild.name
 );

 showToast('School Admission Updated','success',`Successfully saved school details for ${selectedChild.name}.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 setSelectedChild(null);
 };

 const statusOptions = [
 { label:'All Statuses', value:'All'},
 { label:'Identified', value:'Identified'},
 { label:'Applied', value:'Applied'},
 { label:'Confirmed', value:'Confirmed'},
 { label:'Cancelled', value:'Cancelled'}
 ];

 return (
 <div className="space-y-6 w-full max-w-none px-6 md:px-8 xl:px-12 pb-12">
 {/* Header */}
 <div>
 <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">School Admission Management</h1>
 <p className="text-xs text-slate-500 mt-1">Manage mainstreaming progress, log primary school seats, and audit fee sponsorships for rehab graduates.</p>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
 <Card className="p-5 border-l-4 border-l-purple-600 bg-white/80 border-slate-205 shadow-xs">
 <div className="flex justify-between items-start mb-2">
 <span className="text-slate-400 font-semibold uppercase">School Ready Children</span>
 <div className="p-1.5 bg-purple-50 text-purple-700 rounded-md">
 <Award className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-2xl font-bold text-slate-900">{schoolReadyCount} Children</h3>
 <p className="text-[10px] text-slate-400 mt-1">Preparing for mainstream integration</p>
 </Card>

 <Card className="p-5 border-l-4 border-l-indigo-600 bg-white/80 border-slate-205 shadow-xs">
 <div className="flex justify-between items-start mb-2">
 <span className="text-slate-400 font-semibold uppercase">Admissions Completed</span>
 <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md">
 <GraduationCap className="h-4.5 w-4.5"/>
 </div>
 </div>
 <h3 className="text-2xl font-bold text-slate-900">{admissionsCompleted} Admissions</h3>
 <p className="text-[10px] text-slate-400 mt-1">Confirmed enrolled seats in schools</p>
 </Card>

 <Card className="p-5 border-l-4 border-l-brand-cyan-700 bg-white/80 border-slate-205 shadow-xs">
 <div className="flex justify-between items-start mb-2">
 <span className="text-slate-400 font-semibold uppercase">Admission Success Rate</span>
 <div className="p-1.5 bg-brand-cyan-50 text-brand-cyan-700 rounded-md">
 <CheckCircle2 className="h-4.5 w-4.5 animate-pulse"/>
 </div>
 </div>
 <h3 className="text-2xl font-bold text-slate-900">{successRate}%</h3>
 <p className="text-[10px] text-slate-400 mt-1">Admitted ratio out of ready pool</p>
 </Card>
 </div>

 {/* Filters */}
 <Card className="p-4 text-xs bg-white/80 border-slate-200">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="relative">
 <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"/>
 <Input
 placeholder="Search by name, ID, school..."
 value={search}
 onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
 className="pl-8 text-xs py-1.5"
 />
 </div>
 <div>
 <Select
 options={statusOptions}
 value={statusFilter}
 onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
 className="text-xs py-1.5"
 />
 </div>
 <div className="flex items-center justify-end font-semibold text-slate-400 pr-2">
 Showing {filteredPool.length} of {admissionPool.length} ready candidates
 </div>
 </div>
 </Card>

 {/* List Table */}
 {filteredPool.length === 0 ? (
 <EmptyState
 title="No Admission Records Found"
 description="There are no children ready or admitted matching the filter queries."
 />
 ) : (
 <div className="space-y-4">
 <Card className="overflow-hidden border-slate-205">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
 <th className="p-4">Child ID & Name</th>
 <th className="p-4">Age & Classification</th>
 <th className="p-4">Standard & School Details</th>
 <th className="p-4">Fees Sponsored</th>
 <th className="p-4 text-center">Admission Date</th>
 <th className="p-4 text-center">Admission Status</th>
 <th className="p-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700">
 {paginatedPool.map(c => {
 const status = c.schoolAdmission?.admissionStatus ||'Identified';
 return (
 <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="p-4 font-semibold">
 <span 
 onClick={() => window.location.hash =`#/children/${c.id}`}
 className="font-bold text-slate-800 hover:text-brand-cyan-705 hover:underline cursor-pointer"
 >
 {c.name}
 </span>
 <div className="text-[10px] text-slate-400 mt-0.5">ID: {c.id}</div>
 </td>
 <td className="p-4">
 <div className="font-semibold text-slate-800">{c.age} years • {c.gender}</div>
 <Badge color={c.classification ==='Special'?'danger':'success'} className="scale-90 origin-left mt-0.5">
 {c.classification}
 </Badge>
 </td>
 <td className="p-4">
 {c.schoolAdmission?.schoolName ? (
 <>
 <div className="font-bold text-slate-800">{c.schoolAdmission.schoolName}</div>
 <div className="text-[10px] text-slate-400 mt-0.5">
 Std: {c.schoolAdmission.standard ||'N/A'} ({c.schoolAdmission.schoolType ||'General'})
 </div>
 </>
 ) : (
 <span className="text-slate-400 italic">School unassigned</span>
 )}
 </td>
 <td className="p-4">
 {c.schoolAdmission?.feesSponsored ? (
 <Badge color="success">₹{c.schoolAdmission.feesSponsoredAmount?.toLocaleString()} Sponsored</Badge>
 ) : (
 <span className="text-slate-400 italic">No sponsorship</span>
 )}
 </td>
 <td className="p-4 text-center text-slate-800">
 {c.schoolAdmission?.admissionDate ||'Pending'}
 </td>
 <td className="p-4 text-center">
 <Badge 
 color={
 status ==='Confirmed'?'success': 
 status ==='Applied'?'primary': 
 status ==='Cancelled'?'danger':'warning'
 }
 className="font-bold"
 >
 {status}
 </Badge>
 </td>
 <td className="p-4 text-right">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => handleOpenEdit(c)}
 className="flex items-center gap-1 cursor-pointer ml-auto"
 >
 <Pencil className="h-3.5 w-3.5"/> Manage
 </Button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs">
 <span className="text-slate-500">
 Page {currentPage} of {totalPages}
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

 {/* Edit Admission Modal */}
 <Modal
 isOpen={isEditOpen}
 onClose={() => { setIsEditOpen(false); setSelectedChild(null); }}
 title={selectedChild ?`Manage School Admission: ${selectedChild.name}`:''}
 size="lg"
 >
 <form onSubmit={handleSubmit} className="space-y-4 text-xs">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>School Name</Label>
 <Input
 placeholder="e.g. Saraswati Primary School"
 value={formData.schoolName}
 onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
 />
 </div>
 <div>
 <Label>School Type</Label>
 <Select
 options={[
 { label:'Government', value:'Government'},
 { label:'Private', value:'Private'},
 { label:'Inclusive School', value:'Inclusive'},
 { label:'Special School', value:'Special School'},
 { label:'Other', value:'Other'}
 ]}
 value={formData.schoolType}
 onChange={e => setFormData({ ...formData, schoolType: e.target.value as any })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label>Standard / Class</Label>
 <Input
 placeholder="e.g. 1st Std"
 value={formData.standard}
 onChange={e => setFormData({ ...formData, standard: e.target.value })}
 />
 </div>
 <div>
 <Label>Admission Status *</Label>
 <Select
 options={[
 { label:'Identified', value:'Identified'},
 { label:'Applied', value:'Applied'},
 { label:'Confirmed (Enrolled)', value:'Confirmed'},
 { label:'Cancelled', value:'Cancelled'}
 ]}
 value={formData.admissionStatus}
 onChange={e => setFormData({ ...formData, admissionStatus: e.target.value as any })}
 required
 />
 </div>
 <div>
 <Label>Admission Date *</Label>
 <Input
 type="date"
 value={formData.admissionDate}
 onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
 <div>
 <Label>Fees Sponsored?</Label>
 <div className="flex gap-4 mt-2">
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
 <input
 type="radio"
 checked={formData.feesSponsored === true}
 onChange={() => setFormData({ ...formData, feesSponsored: true })}
 className="accent-brand-cyan-700"
 />
 Yes, Sponsored
 </label>
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
 <input
 type="radio"
 checked={formData.feesSponsored === false}
 onChange={() => setFormData({ ...formData, feesSponsored: false })}
 className="accent-brand-cyan-700"
 />
 No Sponsorship
 </label>
 </div>
 </div>
 {formData.feesSponsored && (
 <div className="animate-in slide-in-from-top duration-200">
 <Label>Fees Amount Sponsored (₹)</Label>
 <Input
 type="number"
 placeholder="e.g. 10000"
 value={formData.feesSponsoredAmount}
 onChange={e => setFormData({ ...formData, feesSponsoredAmount: Number(e.target.value) })}
 />
 </div>
 )}
 </div>

 <div>
 <Label>Education Support Provided</Label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
 {['Uniforms','Textbooks','Stationery','Assistive Technology'].map(item => {
 const checked = formData.educationSupport.includes(item);
 return (
 <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
 <input
 type="checkbox"
 checked={checked}
 onChange={() => handleCheckboxChange(item)}
 className="accent-brand-cyan-700"
 />
 {item}
 </label>
 );
 })}
 </div>
 </div>

 <div>
 <Label>Admission Remarks & Notes</Label>
 <Input
 placeholder="e.g. Admission cleared with assistance from coordinator."
 value={formData.remarks}
 onChange={e => setFormData({ ...formData, remarks: e.target.value })}
 />
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => { setIsEditOpen(false); setSelectedChild(null); }}>
 Cancel
 </Button>
 <Button type="submit">
 Save Admission Details
 </Button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
export default SchoolAdmissions;
