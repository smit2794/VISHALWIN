import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Camp, Coordinator, Child } from'../types';
import { Card, Badge, Button, Input, Select, Label, Modal, Drawer } from'../components/ui';
import { Search, Filter, Plus, Calendar, MapPin, User, Stethoscope, ArrowUpDown, ChevronRight, Edit } from'lucide-react';
import EmptyState from'../components/common/EmptyState';

export const Camps: React.FC = () => {
 const { role, isAdmin } = useRole();
 
 // Data State
 const [camps, setCamps] = useState<Camp[]>([]);
 const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
 const [children, setChildren] = useState<Child[]>([]);
 
 // Table UI State
 const [search, setSearch] = useState('');
 const [selectedCity, setSelectedCity] = useState('All');
 const [sortField, setSortField] = useState<'date'|'registeredCount'>('date');
 const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 6;

 // Drawer / Modals State
 const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
 const [isDetailsOpen, setIsDetailsOpen] = useState(false);
 const [isAddOpen, setIsAddOpen] = useState(false);
 const [isEditOpen, setIsEditOpen] = useState(false);
 const [campToEdit, setCampToEdit] = useState<Camp | null>(null);

 // Form State
 const [formData, setFormData] = useState({
 name:'',
 date:'',
 location:'',
 area:'',
 city:'Mumbai',
 coordinatorId:'',
 doctorName:'',
 therapistName:'',
 registeredCount: 0,
 normalCount: 0,
 specialCount: 0,
 followUpsRequiredCount: 0
 });

 useEffect(() => {
 loadData();
 
 // Check if redirect query asks to open Add Camp
 const params = new URLSearchParams(window.location.search);
 if (params.get('add') ==='true'&& isAdmin) {
 setIsAddOpen(true);
 }
 }, [isAdmin]);

 const loadData = () => {
 setCamps(RenuStore.getCamps());
 setCoordinators(RenuStore.getCoordinators());
 setChildren(RenuStore.getChildren());
 };

 const handleSort = (field:'date'|'registeredCount') => {
 if (sortField === field) {
 setSortOrder(sortOrder ==='asc'?'desc':'asc');
 } else {
 setSortField(field);
 setSortOrder('desc');
 }
 };

 // Filter & Search Logic
 const filteredCamps = camps
 .filter(camp => {
 const matchSearch = 
 camp.name.toLowerCase().includes(search.toLowerCase()) ||
 camp.location.toLowerCase().includes(search.toLowerCase()) ||
 camp.area.toLowerCase().includes(search.toLowerCase()) ||
 camp.doctorName.toLowerCase().includes(search.toLowerCase());
 
 const matchCity = selectedCity ==='All'|| camp.city === selectedCity;
 
 return matchSearch && matchCity;
 })
 .sort((a, b) => {
 if (sortField ==='date') {
 const t1 = new Date(a.date).getTime();
 const t2 = new Date(b.date).getTime();
 return sortOrder ==='asc'? t1 - t2 : t2 - t1;
 } else {
 return sortOrder ==='asc'
 ? a.registeredCount - b.registeredCount 
 : b.registeredCount - a.registeredCount;
 }
 });

 // Paginated Camps
 const totalPages = Math.ceil(filteredCamps.length / itemsPerPage);
 const paginatedCamps = filteredCamps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 const getCoordinatorName = (id: string) => {
 return coordinators.find(c => c.id === id)?.name ||'Unknown Coordinator';
 };

 const getCampChildren = (campId: string) => {
 return children.filter(c => c.campId === campId);
 };

 // Submit Add Form
 const handleAddSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.name || !formData.location || !formData.coordinatorId) {
 showToast('Validation Failed','danger','Please enter Name, Location and Coordinator.');
 return;
 }

 const newCamp: Camp = {
 id:`CAMP-${300 + camps.length + 1}`,
 name: formData.name,
 date: formData.date || new Date().toISOString().split('T')[0],
 location: formData.location,
 area: formData.area ||'General Area',
 city: formData.city,
 coordinatorId: formData.coordinatorId,
 doctorName: formData.doctorName ||'Dr. Assigned',
 therapistName: formData.therapistName ||'Therapist Assigned',
 registeredCount: Number(formData.registeredCount) || 0,
 normalCount: Number(formData.normalCount) || 0,
 specialCount: Number(formData.specialCount) || 0,
 followUpsRequiredCount: Number(formData.followUpsRequiredCount) || 0
 };

 const updated = [newCamp, ...camps];
 RenuStore.saveCamps(updated);
 setCamps(updated);
 setIsAddOpen(false);
 showToast('Camp Added Successfully','success',`"${newCamp.name}"has been logged.`);
 
 // Dispatch local update
 window.dispatchEvent(new Event('renu_data_updated'));
 
 // Reset Form
 resetForm();
 };

 // Open Edit Modal
 const openEditModal = (camp: Camp) => {
 setCampToEdit(camp);
 setFormData({
 name: camp.name,
 date: camp.date,
 location: camp.location,
 area: camp.area,
 city: camp.city,
 coordinatorId: camp.coordinatorId,
 doctorName: camp.doctorName,
 therapistName: camp.therapistName,
 registeredCount: camp.registeredCount,
 normalCount: camp.normalCount,
 specialCount: camp.specialCount,
 followUpsRequiredCount: camp.followUpsRequiredCount
 });
 setIsEditOpen(true);
 };

 // Submit Edit Form
 const handleEditSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!campToEdit) return;

 const updatedCamps = camps.map(camp => {
 if (camp.id === campToEdit.id) {
 return {
 ...camp,
 name: formData.name,
 date: formData.date,
 location: formData.location,
 area: formData.area,
 city: formData.city,
 coordinatorId: formData.coordinatorId,
 doctorName: formData.doctorName,
 therapistName: formData.therapistName,
 registeredCount: Number(formData.registeredCount) || 0,
 normalCount: Number(formData.normalCount) || 0,
 specialCount: Number(formData.specialCount) || 0,
 followUpsRequiredCount: Number(formData.followUpsRequiredCount) || 0
 };
 }
 return camp;
 });

 RenuStore.saveCamps(updatedCamps);
 setCamps(updatedCamps);
 setIsEditOpen(false);
 setCampToEdit(null);
 showToast('Camp Updated Successfully','success',`Changes for"${formData.name}"have been saved.`);
 window.dispatchEvent(new Event('renu_data_updated'));
 resetForm();
 };

 const resetForm = () => {
 setFormData({
 name:'',
 date:'',
 location:'',
 area:'',
 city:'Mumbai',
 coordinatorId: coordinators[0]?.id ||'',
 doctorName:'',
 therapistName:'',
 registeredCount: 0,
 normalCount: 0,
 specialCount: 0,
 followUpsRequiredCount: 0
 });
 };

 const citiesOptions = [
 { label:'All Cities', value:'All'},
 { label:'Mumbai', value:'Mumbai'},
 { label:'Pune', value:'Pune'},
 { label:'Bangalore', value:'Bangalore'},
 { label:'Hyderabad', value:'Hyderabad'},
 { label:'Chennai', value:'Chennai'},
 { label:'Delhi', value:'Delhi'},
 { label:'Kolkata', value:'Kolkata'},
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Camp Management</h1>
 <p className="text-xs text-slate-500 mt-1">Schedule, manage clinical attendance, and track outcomes of RENU pediatric screening camps.</p>
 </div>
 {isAdmin && (
 <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="flex items-center gap-1.5 cursor-pointer">
 <Plus className="h-4 w-4"/> Conduct New Camp
 </Button>
 )}
 </div>

 {/* Filters & Search */}
 <Card className="p-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Search bar */}
 <div className="relative">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
 <Input
 type="text"
 placeholder="Search camp, location, doctor..."
 value={search}
 onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
 className="pl-9"
 />
 </div>
 {/* City filter */}
 <div>
 <Select
 options={citiesOptions}
 value={selectedCity}
 onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
 />
 </div>
 {/* Metrics summary */}
 <div className="flex items-center justify-end text-xs text-slate-500 font-semibold pr-2">
 Showing {filteredCamps.length} of {camps.length} camps conducted
 </div>
 </div>
 </Card>

 {/* Camps Table / List */}
 {filteredCamps.length === 0 ? (
 <EmptyState
 title="No Camps Found"
 description="We couldn't find any medical camps matching your search filters. Try clearing your search parameters."
 actionText={isAdmin ?"Log New Camp": undefined}
 onAction={isAdmin ? () => setIsAddOpen(true) : undefined}
 />
 ) : (
 <div className="space-y-4">
 <Card className="overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
 <th className="p-4">Camp Details</th>
 <th className="p-4">Location & City</th>
 <th className="p-4">Staff Assigned</th>
 <th className="p-4 text-center cursor-pointer hover:bg-slate-100/50"onClick={() => handleSort('registeredCount')}>
 <div className="flex items-center justify-center gap-1">
 Registered <ArrowUpDown className="h-3 w-3 text-slate-400"/>
 </div>
 </th>
 <th className="p-4 text-center">N / S / F</th>
 <th className="p-4 text-center cursor-pointer hover:bg-slate-100/50"onClick={() => handleSort('date')}>
 <div className="flex items-center justify-center gap-1">
 Camp Date <ArrowUpDown className="h-3 w-3 text-slate-400"/>
 </div>
 </th>
 <th className="p-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {paginatedCamps.map((camp) => {
 const campChildren = getCampChildren(camp.id);
 return (
 <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors group">
 <td className="p-4">
 <div className="font-semibold text-slate-900 group-hover:text-brand-cyan-700 transition-colors">
 {camp.name}
 </div>
 <div className="text-[10px] text-slate-400 mt-0.5">ID: {camp.id}</div>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-1.5 text-slate-700">
 <MapPin className="h-3.5 w-3.5 text-slate-400"/>
 <span>{camp.location}</span>
 </div>
 <div className="text-[10px] text-slate-400 mt-0.5 pl-5">{camp.area}, {camp.city}</div>
 </td>
 <td className="p-4">
 <div className="text-slate-700 font-medium">Coord: {getCoordinatorName(camp.coordinatorId)}</div>
 <div className="text-[10px] text-slate-400 mt-0.5">Doc: {camp.doctorName}</div>
 </td>
 <td className="p-4 text-center font-bold text-slate-950 text-sm">
 {camp.registeredCount}
 </td>
 <td className="p-4 text-center">
 <div className="flex items-center justify-center gap-1.5">
 <Badge color="success"className="px-1.5 py-0.5 scale-95 font-bold"title="Normal Development">
 {camp.normalCount} N
 </Badge>
 <Badge color="danger"className="px-1.5 py-0.5 scale-95 font-bold"title="Special Children">
 {camp.specialCount} S
 </Badge>
 <Badge color="warning"className="px-1.5 py-0.5 scale-95 font-bold"title="Follow-Ups Required">
 {camp.followUpsRequiredCount} F
 </Badge>
 </div>
 </td>
 <td className="p-4 text-center">
 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 border border-transparent font-medium text-slate-700">
 <Calendar className="h-3 w-3 text-slate-400"/>
 <span>{camp.date}</span>
 </div>
 </td>
 <td className="p-4 text-right">
 <div className="flex items-center justify-end gap-2">
 {isAdmin && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => openEditModal(camp)}
 className="p-1.5 rounded-lg border-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
 title="Edit Camp"
 >
 <Edit className="h-3.5 w-3.5"/>
 </Button>
 )}
 <Button
 variant="secondary"
 size="sm"
 onClick={() => { setSelectedCamp(camp); setIsDetailsOpen(true); }}
 className="flex items-center gap-1 cursor-pointer"
 >
 Details <ChevronRight className="h-3.5 w-3.5"/>
 </Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>

 {/* Pagination Controls */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between px-4 py-1.5 bg-white/80 border border-slate-200 rounded-xl text-xs backdrop-blur-xs">
 <span className="text-slate-500">
 Page {currentPage} of {totalPages}
 </span>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 disabled={currentPage === 1}
 onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
 className="cursor-pointer"
 >
 Previous
 </Button>
 <Button
 variant="outline"
 size="sm"
 disabled={currentPage === totalPages}
 onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
 className="cursor-pointer"
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Camp Details Drawer */}
 <Drawer
 isOpen={isDetailsOpen}
 onClose={() => { setIsDetailsOpen(false); setSelectedCamp(null); }}
 title={selectedCamp ? selectedCamp.name :''}
 size="lg"
 >
 {selectedCamp && (
 <div className="space-y-6">
 {/* Header info */}
 <div className="grid grid-cols-2 gap-4 pb-5 border-b border-slate-200">
 <div>
 <Label>Camp Date</Label>
 <p className="text-sm font-semibold text-slate-800">{selectedCamp.date}</p>
 </div>
 <div>
 <Label>Location</Label>
 <p className="text-sm font-semibold text-slate-800">{selectedCamp.location}</p>
 </div>
 <div className="mt-2">
 <Label>Area & City</Label>
 <p className="text-sm font-semibold text-slate-800">{selectedCamp.area}, {selectedCamp.city}</p>
 </div>
 <div className="mt-2">
 <Label>Coordinator</Label>
 <p className="text-sm font-semibold text-slate-800">{getCoordinatorName(selectedCamp.coordinatorId)}</p>
 </div>
 </div>

 {/* Medical Staff */}
 <div>
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Assigned Clinical Team</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl flex items-center gap-3">
 <div className="p-2 bg-brand-cyan-100/80 text-brand-cyan-800 rounded-full">
 <Stethoscope className="h-4 w-4"/>
 </div>
 <div>
 <div className="text-[10px] text-slate-400 font-semibold uppercase">Lead Pediatrician</div>
 <div className="text-xs font-bold text-slate-800">{selectedCamp.doctorName}</div>
 </div>
 </div>
 <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl flex items-center gap-3">
 <div className="p-2 bg-purple-100/80 text-purple-800 rounded-full">
 <User className="h-4 w-4"/>
 </div>
 <div>
 <div className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Therapist</div>
 <div className="text-xs font-bold text-slate-800">{selectedCamp.therapistName}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Children Screened Grid */}
 <div>
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Camp Screenings Overview</h4>
 <div className="grid grid-cols-4 gap-3 text-center">
 <div className="p-3 bg-brand-cyan-50/70 border border-brand-cyan-100/55 rounded-xl">
 <span className="text-sm font-extrabold text-brand-cyan-800 block">{selectedCamp.registeredCount}</span>
 <span className="text-[9px] text-brand-cyan-700 font-medium uppercase tracking-wider">Registered</span>
 </div>
 <div className="p-3 bg-green-50/70 border border-green-100/55 rounded-xl">
 <span className="text-sm font-extrabold text-emerald-600 block">{selectedCamp.normalCount}</span>
 <span className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider">Normal</span>
 </div>
 <div className="p-3 bg-red-50/70 border border-red-100/55 rounded-xl">
 <span className="text-sm font-extrabold text-red-500 block">{selectedCamp.specialCount}</span>
 <span className="text-[9px] text-red-500 font-medium uppercase tracking-wider">Special</span>
 </div>
 <div className="p-3 bg-amber-50/70 border border-amber-100/55 rounded-xl">
 <span className="text-sm font-extrabold text-amber-500 block">{selectedCamp.followUpsRequiredCount}</span>
 <span className="text-[9px] text-amber-500 font-medium uppercase tracking-wider">Followups</span>
 </div>
 </div>
 </div>

 {/* Registered Children List */}
 <div>
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Registered Children List</h4>
 {getCampChildren(selectedCamp.id).length === 0 ? (
 <p className="text-xs text-slate-400 italic">No registered children records tied to this camp ID.</p>
 ) : (
 <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden bg-white max-h-60 overflow-y-auto">
 {getCampChildren(selectedCamp.id).map((c) => (
 <div 
 key={c.id} 
 className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
 onClick={() => {
 setIsDetailsOpen(false);
 setSelectedCamp(null);
 window.location.hash =`#/children/${c.id}`; // Simulate profile navigate
 showToast(`Viewing profile of ${c.name}`,'info');
 }}
 >
 <div>
 <div className="font-bold text-slate-800">{c.name}</div>
 <div className="text-[10px] text-slate-400">ID: {c.id} • Age: {c.age} ({c.gender})</div>
 </div>
 <div className="flex items-center gap-2">
 <Badge color={c.classification ==='Special'?'danger':'success'} className="scale-90 font-bold px-1.5 py-0">
 {c.classification}
 </Badge>
 <ChevronRight className="h-3 w-3 text-slate-400"/>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}
 </Drawer>

 {/* Add Camp Modal */}
 <Modal
 isOpen={isAddOpen}
 onClose={() => setIsAddOpen(false)}
 title="Log New Screening Camp"
 size="lg"
 >
 <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Camp Name *</Label>
 <Input
 placeholder="e.g. RENU Camp - Dharavi"
 value={formData.name}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Date</Label>
 <Input
 type="date"
 value={formData.date}
 onChange={e => setFormData({ ...formData, date: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="md:col-span-2">
 <Label>Location / Venue Address *</Label>
 <Input
 placeholder="e.g. Govt Primary School Hall, Sector 4"
 value={formData.location}
 onChange={e => setFormData({ ...formData, location: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>City</Label>
 <Select
 options={[
 { label:'Mumbai', value:'Mumbai'},
 { label:'Pune', value:'Pune'},
 { label:'Bangalore', value:'Bangalore'},
 { label:'Hyderabad', value:'Hyderabad'},
 { label:'Chennai', value:'Chennai'},
 { label:'Delhi', value:'Delhi'},
 ]}
 value={formData.city}
 onChange={e => setFormData({ ...formData, city: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label>Area</Label>
 <Input
 placeholder="e.g. Dharavi"
 value={formData.area}
 onChange={e => setFormData({ ...formData, area: e.target.value })}
 />
 </div>
 <div>
 <Label>Coordinator *</Label>
 <Select
 options={coordinators.map(c => ({ label: c.name, value: c.id }))}
 value={formData.coordinatorId}
 onChange={e => setFormData({ ...formData, coordinatorId: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Lead Pediatric Doctor</Label>
 <Input
 placeholder="Dr. Amit Sharma"
 value={formData.doctorName}
 onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Assigned Lead Therapist</Label>
 <Input
 placeholder="Sneha Joshi"
 value={formData.therapistName}
 onChange={e => setFormData({ ...formData, therapistName: e.target.value })}
 />
 </div>
 <div className="grid grid-cols-4 gap-2">
 <div>
 <Label>Screened</Label>
 <Input
 type="number"
 value={formData.registeredCount}
 onChange={e => setFormData({ ...formData, registeredCount: Number(e.target.value) })}
 />
 </div>
 <div>
 <Label>Normal</Label>
 <Input
 type="number"
 value={formData.normalCount}
 onChange={e => setFormData({ ...formData, normalCount: Number(e.target.value) })}
 />
 </div>
 <div>
 <Label>Special</Label>
 <Input
 type="number"
 value={formData.specialCount}
 onChange={e => setFormData({ ...formData, specialCount: Number(e.target.value) })}
 />
 </div>
 <div>
 <Label>Followups</Label>
 <Input
 type="number"
 value={formData.followUpsRequiredCount}
 onChange={e => setFormData({ ...formData, followUpsRequiredCount: Number(e.target.value) })}
 />
 </div>
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => setIsAddOpen(false)}>
 Cancel
 </Button>
 <Button type="submit">
 Conduct Camp
 </Button>
 </div>
 </form>
 </Modal>

 {/* Edit Camp Modal */}
 <Modal
 isOpen={isEditOpen}
 onClose={() => { setIsEditOpen(false); setCampToEdit(null); }}
 title={`Edit Camp: ${campToEdit?.name}`}
 size="lg"
 >
 <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Camp Name *</Label>
 <Input
 value={formData.name}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Date</Label>
 <Input
 type="date"
 value={formData.date}
 onChange={e => setFormData({ ...formData, date: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="md:col-span-2">
 <Label>Location / Venue Address *</Label>
 <Input
 value={formData.location}
 onChange={e => setFormData({ ...formData, location: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>City</Label>
 <Select
 options={[
 { label:'Mumbai', value:'Mumbai'},
 { label:'Pune', value:'Pune'},
 { label:'Bangalore', value:'Bangalore'},
 { label:'Hyderabad', value:'Hyderabad'},
 { label:'Chennai', value:'Chennai'},
 { label:'Delhi', value:'Delhi'},
 ]}
 value={formData.city}
 onChange={e => setFormData({ ...formData, city: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label>Area</Label>
 <Input
 value={formData.area}
 onChange={e => setFormData({ ...formData, area: e.target.value })}
 />
 </div>
 <div>
 <Label>Coordinator *</Label>
 <Select
 options={coordinators.map(c => ({ label: c.name, value: c.id }))}
 value={formData.coordinatorId}
 onChange={e => setFormData({ ...formData, coordinatorId: e.target.value })}
 required
 />
 </div>
 <div>
 <Label>Lead Doctor</Label>
 <Input
 value={formData.doctorName}
 onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label>Assigned Therapist</Label>
 <Input
 value={formData.therapistName}
 onChange={e => setFormData({ ...formData, therapistName: e.target.value })}
 />
 </div>
 <div className="grid grid-cols-4 gap-2">
 <div>
 <Label>Screened</Label>
 <Input
 type="number"
 value={formData.registeredCount}
 onChange={e => setFormData({ ...formData, registeredCount: Number(e.target.value) })}
 />
 </div>
 <div>
 <Label>Normal</Label>
 <Input
 type="number"
 value={formData.normalCount}
 onChange={e => setFormData({ ...formData, normalCount: Number(e.target.value) })}
 />
 </div>
 <div>
 <Label>Special</Label>
 <Input
 type="number"
 value={formData.specialCount}
 onChange={e => setFormData({ ...formData, specialCount: Number(e.target.value) })}
 />
 </div>
 <div>
 <Label>Followups</Label>
 <Input
 type="number"
 value={formData.followUpsRequiredCount}
 onChange={e => setFormData({ ...formData, followUpsRequiredCount: Number(e.target.value) })}
 />
 </div>
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => { setIsEditOpen(false); setCampToEdit(null); }}>
 Cancel
 </Button>
 <Button type="submit">
 Save Changes
 </Button>
 </div>
 </form>
 </Modal>
 </div>
 );
};
export default Camps;
