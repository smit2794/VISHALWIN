import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/renuStore';
import { useRole } from'../../../hooks/useRole';
import { showToast } from'../../../hooks/useToast';
import { Camp, Coordinator, Child, CampOrganizer, CampFollowUpSection, CampTeamMember, CampIECMaterial, CampDocument } from '../types';
import { Card, Badge, Button, Input, Select, Label, Modal, Drawer } from'../../../components/ui';
import { Search, Filter, Plus, Calendar, MapPin, User, Stethoscope, ArrowUpDown, ChevronRight, Edit, ChevronLeft, FileText, CheckCircle, Upload, Users, Building2, Info, Trash2 } from 'lucide-react';
import EmptyState from'../../../components/common/EmptyState';

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
 const [addStep, setAddStep] = useState(1);
 const [editStep, setEditStep] = useState(1);

 // Form State
  const [formData, setFormData] = useState({
  name:'',
  date:'',
  time: '',
  duration: '',
  location:'',
  address: '',
  place: '',
  area:'',
  city:'Mumbai',
  coverageArea: 'Village' as Camp['coverageArea'],
  venueType: 'School' as Camp['venueType'],
  campType: 'Medical Screening & Assessment Camp' as Camp['campType'],
  coordinatorId:'',
  doctorName:'',
  therapistName:'',
  registeredCount: 0,
  screenedCount: 0,
  maleScreenedCount: 0,
  femaleScreenedCount: 0,
  normalCount: 0,
  specialCount: 0,
  followUpsRequiredCount: 0,
  organizer: {
    isCollaborated: false,
    collaborationType: 'CSR',
    instituteName: '',
    instituteAddress: '',
    repName: '',
    repDesignation: '',
    repContact: '',
    repEmail: ''
  } as CampOrganizer,
  teamMembers: [] as CampTeamMember[],
  iecMaterials: [] as CampIECMaterial[],
  campDocuments: [] as CampDocument[],
  followUpSheetFileName: '',
  expertsAssessmentFileName: '',
  campFollowUp: {
    ageBand: '0-12',
    isDisabilityID: false,
    referralTherapy: false,
    referralMedicalTreatment: false,
    referralGovtScheme: false,
    referralRenuAdmission: false
  } as CampFollowUpSection
  });

 // Additional Drawer State
 const [newTeamMember, setNewTeamMember] = useState({ role: 'Volunteer', name: '', organization: '', mobile: '' });
 const [newIEC, setNewIEC] = useState({ name: '', quantity: 1, status: 'Ordered' });

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
 const coords = RenuStore.getCoordinators();
 setCoordinators(coords);
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

 const updateSelectedCampInStore = (updatedCamp: Camp) => {
    const updatedCamps = camps.map(c => c.id === updatedCamp.id ? updatedCamp : c);
    RenuStore.saveCamps(updatedCamps);
    setCamps(updatedCamps);
    setSelectedCamp(updatedCamp);
    window.dispatchEvent(new Event('renu_data_updated'));
  };

  const handleAddTeamMember = () => {
    if (!selectedCamp || !newTeamMember.name) return;
    const updated = {
      ...selectedCamp,
      teamMembers: [...(selectedCamp.teamMembers || []), { id: Date.now().toString(), ...newTeamMember } as any]
    };
    updateSelectedCampInStore(updated);
    setNewTeamMember({ role: 'Volunteer', name: '', organization: '', mobile: '' });
    showToast('Team Member Added', 'success');
  };

  const handleDeleteTeamMember = (id: string) => {
    if (!selectedCamp) return;
    const updated = {
      ...selectedCamp,
      teamMembers: (selectedCamp.teamMembers || []).filter(t => t.id !== id)
    };
    updateSelectedCampInStore(updated);
    showToast('Team Member Removed', 'info');
  };

  const handleAddIEC = () => {
    if (!selectedCamp || !newIEC.name) return;
    const updated = {
      ...selectedCamp,
      iecMaterials: [...(selectedCamp.iecMaterials || []), { id: Date.now().toString(), ...newIEC } as any]
    };
    updateSelectedCampInStore(updated);
    setNewIEC({ name: '', quantity: 1, status: 'Ordered' });
    showToast('IEC Material Added', 'success');
  };

  const handleDeleteIEC = (id: string) => {
    if (!selectedCamp) return;
    const updated = {
      ...selectedCamp,
      iecMaterials: (selectedCamp.iecMaterials || []).filter(i => i.id !== id)
    };
    updateSelectedCampInStore(updated);
    showToast('IEC Material Removed', 'info');
  };

  const handleMockUploadIEC = (id: string) => {
    if (!selectedCamp) return;
    const updated = {
      ...selectedCamp,
      iecMaterials: (selectedCamp.iecMaterials || []).map(i => i.id === id ? { ...i, sampleFileName: 'sample_material.pdf' } : i)
    };
    updateSelectedCampInStore(updated);
    showToast('Sample Uploaded', 'success');
  };

  const handleMockUploadDoc = (type: 'report' | 'photos') => {
    if (!selectedCamp) return;
    const updated = {
      ...selectedCamp,
      reportDocumentStatus: type === 'report' ? 'Uploaded (camp_report.pdf)' : selectedCamp.reportDocumentStatus,
      photosDocumentStatus: type === 'photos' ? 'Uploaded (camp_photos.zip)' : selectedCamp.photosDocumentStatus
    };
    updateSelectedCampInStore(updated);
    showToast('Document Uploaded', 'success');
  };

  // Submit Add Form
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      showToast('Validation Error', 'danger', 'Please enter camp name and venue location.');
      return;
    }

    const newCamp: Camp = {
      id: `CAMP-${300 + camps.length + 1}`,
      name: formData.name,
      date: formData.date || new Date().toISOString().split('T')[0],
      location: formData.location,
      area: formData.area || 'General Area',
      city: formData.city,
      coordinatorId: formData.coordinatorId || coordinators[0]?.id || '',
      doctorName: formData.doctorName || 'Dr. Assigned',
      therapistName: formData.therapistName || 'Therapist Assigned',
      time: formData.time || '09:30 AM',
      duration: formData.duration || '5 Hours',
      address: formData.address,
      place: formData.place,
      coverageArea: formData.coverageArea,
      venueType: formData.venueType,
      campType: formData.campType,
      registeredCount: Number(formData.registeredCount) || 0,
      screenedCount: Number(formData.screenedCount) || Number(formData.registeredCount) || 0,
      maleScreenedCount: Number(formData.maleScreenedCount) || 0,
      femaleScreenedCount: Number(formData.femaleScreenedCount) || 0,
      normalCount: Number(formData.normalCount) || 0,
      specialCount: Number(formData.specialCount) || 0,
      followUpsRequiredCount: Number(formData.followUpsRequiredCount) || 0,
      organizer: formData.organizer,
      teamMembers: formData.teamMembers,
      iecMaterials: formData.iecMaterials,
      campDocuments: formData.campDocuments,
      followUpSheetFileName: formData.followUpSheetFileName,
      expertsAssessmentFileName: formData.expertsAssessmentFileName,
      campFollowUp: formData.campFollowUp
    };

    const updated = [newCamp, ...camps];
    RenuStore.saveCamps(updated);
    setCamps(updated);
    setIsAddOpen(false);
    setAddStep(1);
    showToast('Camp Added Successfully', 'success', `"${newCamp.name}" has been logged.`);
    window.dispatchEvent(new Event('renu_data_updated'));
    resetForm();
  };

  // Open Edit Modal
  const openEditModal = (camp: Camp) => {
    setCampToEdit(camp);
    setFormData({
      name: camp.name || '',
      date: camp.date || '',
      location: camp.location || '',
      area: camp.area || '',
      city: camp.city || 'Mumbai',
      coordinatorId: camp.coordinatorId || coordinators[0]?.id || '',
      doctorName: camp.doctorName || '',
      therapistName: camp.therapistName || '',
      time: camp.time || '09:30 AM',
      duration: camp.duration || '5 Hours',
      address: camp.address || '',
      place: camp.place || '',
      coverageArea: camp.coverageArea || 'Village',
      venueType: camp.venueType || 'School',
      campType: camp.campType || 'Medical Screening & Assessment Camp',
      registeredCount: camp.registeredCount || 0,
      screenedCount: camp.screenedCount || camp.registeredCount || 0,
      maleScreenedCount: camp.maleScreenedCount || 0,
      femaleScreenedCount: camp.femaleScreenedCount || 0,
      normalCount: camp.normalCount || 0,
      specialCount: camp.specialCount || 0,
      followUpsRequiredCount: camp.followUpsRequiredCount || 0,
      organizer: camp.organizer || { isCollaborated: false, collaborationType: 'CSR', instituteName: '', instituteAddress: '', repName: '', repDesignation: '', repContact: '', repEmail: '' } as CampOrganizer,
      teamMembers: camp.teamMembers || [],
      iecMaterials: camp.iecMaterials || [],
      campDocuments: camp.campDocuments || [],
      followUpSheetFileName: camp.followUpSheetFileName || '',
      expertsAssessmentFileName: camp.expertsAssessmentFileName || '',
      campFollowUp: camp.campFollowUp || { ageBand: '0-12', isDisabilityID: false, referralTherapy: false, referralMedicalTreatment: false, referralGovtScheme: false, referralRenuAdmission: false } as CampFollowUpSection
    });
    setEditStep(1);
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
          time: formData.time,
          duration: formData.duration,
          address: formData.address,
          place: formData.place,
          coverageArea: formData.coverageArea,
          venueType: formData.venueType,
          campType: formData.campType,
          registeredCount: Number(formData.registeredCount) || 0,
          screenedCount: Number(formData.screenedCount) || 0,
          maleScreenedCount: Number(formData.maleScreenedCount) || 0,
          femaleScreenedCount: Number(formData.femaleScreenedCount) || 0,
          normalCount: Number(formData.normalCount) || 0,
          specialCount: Number(formData.specialCount) || 0,
          followUpsRequiredCount: Number(formData.followUpsRequiredCount) || 0,
          organizer: formData.organizer,
          teamMembers: formData.teamMembers,
          iecMaterials: formData.iecMaterials,
          campDocuments: formData.campDocuments,
          followUpSheetFileName: formData.followUpSheetFileName,
          expertsAssessmentFileName: formData.expertsAssessmentFileName,
          campFollowUp: formData.campFollowUp
        };
      }
      return camp;
    });

    RenuStore.saveCamps(updatedCamps);
    setCamps(updatedCamps);
    setIsEditOpen(false);
    setCampToEdit(null);
    setEditStep(1);
    showToast('Camp Updated Successfully', 'success', `Changes for "${formData.name}" have been saved.`);
    window.dispatchEvent(new Event('renu_data_updated'));
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      time: '09:30 AM',
      duration: '5 Hours',
      location: '',
      address: '',
      place: '',
      area: '',
      city: 'Mumbai',
      coverageArea: 'Village',
      venueType: 'School',
      campType: 'Medical Screening & Assessment Camp',
      coordinatorId: coordinators[0]?.id || '',
      doctorName: '',
      therapistName: '',
      registeredCount: 0,
      screenedCount: 0,
      maleScreenedCount: 0,
      femaleScreenedCount: 0,
      normalCount: 0,
      specialCount: 0,
      followUpsRequiredCount: 0,
      organizer: {
        isCollaborated: false,
        collaborationType: 'CSR',
        instituteName: '',
        instituteAddress: '',
        repName: '',
        repDesignation: '',
        repContact: '',
        repEmail: ''
      } as CampOrganizer,
      teamMembers: [],
      iecMaterials: [],
      campDocuments: [],
      followUpSheetFileName: '',
      expertsAssessmentFileName: '',
      campFollowUp: {
        ageBand: '0-12',
        isDisabilityID: false,
        referralTherapy: false,
        referralMedicalTreatment: false,
        referralGovtScheme: false,
        referralRenuAdmission: false
      } as CampFollowUpSection
    });
    setAddStep(1);
    setEditStep(1);
  };

  const renderCampStepWizard = (isEdit: boolean) => {
    const currentStep = isEdit ? editStep : addStep;
    const setStep = isEdit ? setEditStep : setAddStep;
    const submitHandler = isEdit ? handleEditSubmit : handleAddSubmit;
    const closeHandler = () => {
      if (isEdit) {
        setIsEditOpen(false);
        setCampToEdit(null);
        setEditStep(1);
      } else {
        setIsAddOpen(false);
        setAddStep(1);
      }
    };

    return (
      <form onSubmit={submitHandler} className="space-y-4 text-xs">
        {/* 4-Step Progress Indicator Header */}
        <div className="flex gap-2 mb-4 border-b border-slate-100 pb-3">
          {[
            { num: 1, title: 'A.1 Planning' },
            { num: 2, title: 'A.2 Organizer' },
            { num: 3, title: 'A.4 Team & Docs' },
            { num: 4, title: 'A.6 Stats & Followup' }
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <div
                key={s.num}
                onClick={() => setStep(s.num)}
                className="flex-1 cursor-pointer flex flex-col gap-1"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-brand-cyan-700' : isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`text-[9px] font-bold text-center truncate block ${
                    isActive ? 'text-brand-cyan-700' : isDone ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  Step {s.num}: {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: A.1 Camp Planning & Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-brand-cyan-50/60 border border-brand-cyan-100 rounded-xl flex items-center gap-2">
              <Info className="h-4 w-4 text-brand-cyan-700 flex-shrink-0" />
              <span className="text-[11px] font-medium text-brand-cyan-900">
                Step 1: Enter basic camp schedule, venue details, location & assigned staff.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Camp Name *</Label>
                <Input
                  placeholder="e.g. RENU Medical Camp - Dharavi"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Camp Type</Label>
                <Select
                  options={[
                    { label: 'Medical Screening & Assessment Camp', value: 'Medical Screening & Assessment Camp' },
                    { label: 'Aids & Appliances Assessment & Distribution Camp', value: 'Aids & Appliances Assessment & Distribution Camp' }
                  ]}
                  value={formData.campType || 'Medical Screening & Assessment Camp'}
                  onChange={e => setFormData({ ...formData, campType: e.target.value as any })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  placeholder="e.g. 09:30 AM"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  placeholder="e.g. 5 Hours"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Location / Venue Address *</Label>
                <Input
                  placeholder="e.g. Primary Health Centre, Main Road"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>City *</Label>
                <Select
                  options={[
                    { label: 'Mumbai', value: 'Mumbai' },
                    { label: 'Pune', value: 'Pune' },
                    { label: 'Bangalore', value: 'Bangalore' },
                    { label: 'Hyderabad', value: 'Hyderabad' },
                    { label: 'Chennai', value: 'Chennai' },
                    { label: 'Delhi', value: 'Delhi' }
                  ]}
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Area / Locality</Label>
                <Input
                  placeholder="e.g. Dharavi"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
              <div>
                <Label>Coverage Area</Label>
                <Select
                  options={[
                    { label: 'Village', value: 'Village' },
                    { label: 'Taluka', value: 'Taluka' },
                    { label: 'District', value: 'District' },
                    { label: 'Ward', value: 'Ward' },
                    { label: 'Zone', value: 'Zone' }
                  ]}
                  value={formData.coverageArea || 'Village'}
                  onChange={e => setFormData({ ...formData, coverageArea: e.target.value as any })}
                />
              </div>
              <div>
                <Label>Camp Venue Type</Label>
                <Select
                  options={[
                    { label: 'School / College', value: 'School' },
                    { label: 'Community Hall', value: 'Community Hall' },
                    { label: 'PHC / CHC / Urban Health Centre', value: 'PHC-CHC-Urban Health Centre' },
                    { label: 'NGO', value: 'NGO' },
                    { label: 'Other', value: 'Other' }
                  ]}
                  value={formData.venueType || 'School'}
                  onChange={e => setFormData({ ...formData, venueType: e.target.value as any })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <Label>Assigned Lead Therapist</Label>
                <Input
                  placeholder="Sneha Joshi"
                  value={formData.therapistName}
                  onChange={e => setFormData({ ...formData, therapistName: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: A.2 Camp Organizer & Collaboration Details */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-700 flex-shrink-0" />
                <span className="text-[11px] font-medium text-purple-900">
                  Step 2: Section A.2 — Association & Collaborative Partner Details
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-purple-900 bg-white px-3 py-1 rounded-lg border border-purple-200 shadow-xs">
                <input
                  type="checkbox"
                  checked={formData.organizer?.isCollaborated || false}
                  onChange={e => setFormData({
                    ...formData,
                    organizer: { ...(formData.organizer || {} as any), isCollaborated: e.target.checked }
                  })}
                  className="rounded text-purple-700 accent-purple-700"
                />
                Association / Collaboration Active
              </label>
            </div>

            {formData.organizer?.isCollaborated ? (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Collaboration With</Label>
                    <Select
                      options={[
                        { label: 'CSR', value: 'CSR' },
                        { label: 'Venue Partner', value: 'Venue Partner' },
                        { label: 'NGO', value: 'NGO' },
                        { label: 'Community', value: 'Community' },
                        { label: 'Center', value: 'Center' },
                        { label: 'Other', value: 'Other' }
                      ]}
                      value={formData.organizer?.collaborationType || 'CSR'}
                      onChange={e => setFormData({
                        ...formData,
                        organizer: { ...(formData.organizer || {} as any), collaborationType: e.target.value as any }
                      })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Name of Associated / Collaborative Institute</Label>
                    <Input
                      placeholder="e.g. Rotary Club / Tata Trust"
                      value={formData.organizer?.instituteName || ''}
                      onChange={e => setFormData({
                        ...formData,
                        organizer: { ...(formData.organizer || {} as any), instituteName: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Address of Associated Institute</Label>
                  <Input
                    placeholder="Full institute address"
                    value={formData.organizer?.instituteAddress || ''}
                    onChange={e => setFormData({
                      ...formData,
                      organizer: { ...(formData.organizer || {} as any), instituteAddress: e.target.value }
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Representative Name</Label>
                    <Input
                      placeholder="Full Name"
                      value={formData.organizer?.repName || ''}
                      onChange={e => setFormData({
                        ...formData,
                        organizer: { ...(formData.organizer || {} as any), repName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Designation of Representative</Label>
                    <Input
                      placeholder="Designation / Role"
                      value={formData.organizer?.repDesignation || ''}
                      onChange={e => setFormData({
                        ...formData,
                        organizer: { ...(formData.organizer || {} as any), repDesignation: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Representative Contact No</Label>
                    <Input
                      placeholder="+91 98200 XXXXX"
                      value={formData.organizer?.repContact || ''}
                      onChange={e => setFormData({
                        ...formData,
                        organizer: { ...(formData.organizer || {} as any), repContact: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Representative Email ID</Label>
                    <Input
                      placeholder="rep@institute.org"
                      value={formData.organizer?.repEmail || ''}
                      onChange={e => setFormData({
                        ...formData,
                        organizer: { ...(formData.organizer || {} as any), repEmail: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-slate-600">No Collaboration Active</p>
                <p className="text-[11px] mt-0.5">Toggle "Association / Collaboration Active" above if this camp is organized jointly with a partner.</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: A.4 Camp Team & A.5 Documents */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* A.4 Camp Medical Team Selection */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-cyan-700" />
                Section A.4 — Camp Team Selection (Vishalwin & Medical Experts)
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {(formData.teamMembers || []).map((m: any, idx: number) => (
                  <div key={m.id || idx} className="flex justify-between items-center p-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <Badge color="primary" className="ml-2 scale-90">{m.role}</Badge>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {m.organization ? `${m.organization} • ` : ''}{m.mobile}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = (formData.teamMembers || []).filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, teamMembers: updated });
                      }}
                      className="h-6 text-[10px] py-0 px-2 cursor-pointer text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {(formData.teamMembers || []).length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">No medical experts added yet. Add team members below.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 items-end">
                <div>
                  <Label>Role (14 Medical + 2 Team)</Label>
                  <Select
                    options={[
                      'Pediatrician', 'Developmental Pediatrician', 'Neurologist', 'Psychiatrist', 'Psychologist',
                      'Occupational Therapist', 'Speech Therapist', 'Physiotherapist', 'Audiologist', 'Vision Expert',
                      'Nutritionist', 'Orthopedic Doctor', 'Prosthetist & Orthotist', 'Special Educator',
                      'Coordinator', 'Volunteer'
                    ].map(r => ({ label: r, value: r }))}
                    value={newTeamMember.role}
                    onChange={e => setNewTeamMember({ ...newTeamMember, role: e.target.value as any })}
                  />
                </div>
                <div>
                  <Label>Expert / Staff Name</Label>
                  <Input
                    placeholder="Dr. Full Name"
                    value={newTeamMember.name}
                    onChange={e => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Organization / Hospital</Label>
                  <Input
                    placeholder="Hospital / NGO"
                    value={newTeamMember.organization}
                    onChange={e => setNewTeamMember({ ...newTeamMember, organization: e.target.value })}
                  />
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <Label>Mobile</Label>
                    <Input
                      placeholder="+91 Mobile"
                      value={newTeamMember.mobile}
                      onChange={e => setNewTeamMember({ ...newTeamMember, mobile: e.target.value })}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!newTeamMember.name) {
                        showToast('Name Required', 'danger', 'Please enter expert name.');
                        return;
                      }
                      setFormData({
                        ...formData,
                        teamMembers: [...(formData.teamMembers || []), { id: `tm_${Date.now()}`, ...newTeamMember } as CampTeamMember]
                      });
                      setNewTeamMember({ role: 'Volunteer', name: '', organization: '', mobile: '' });
                      showToast('Team Member Added', 'success');
                    }}
                    className="mt-5 cursor-pointer"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* A.5 Camp Documents & IEC Material */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-brand-cyan-700" />
                Section A.5 — Camp Documents & IEC Material Matrix (13 Types)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
                {[
                  'Permission Letter', 'Approval Letter', 'Posters', 'Banners', 'Social Media Creative',
                  'Registration Sheet', 'Google Form', 'Photos', 'Videos', 'Parents Feedback',
                  'Press Coverage', 'Media Link', 'Other IEC Material'
                ].map(docType => {
                  const existing = (formData.campDocuments || []).find((d: any) => d.type === docType);
                  return (
                    <div key={docType} className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-2 text-xs">
                      <span className="font-semibold text-slate-800">{docType}</span>
                      {existing?.fileName || existing?.mediaLink ? (
                        <Badge color="success" className="w-fit text-[9px] py-0 px-2 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {existing.fileName || 'Link Saved'}
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedDocs: CampDocument[] = [
                              ...(formData.campDocuments || []).filter((d: any) => d.type !== docType),
                              { type: docType as any, fileName: `${docType.toLowerCase().replace(/ /g, '_')}_file.pdf` }
                            ];
                            setFormData({ ...formData, campDocuments: updatedDocs });
                            showToast(`${docType} Attached`, 'success');
                          }}
                          className="text-[10px] h-6 py-0 px-2 cursor-pointer border-slate-300 hover:bg-slate-100"
                        >
                          Upload {docType}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: A.6 Camp Statistics & A.7 Follow-up Details */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* A.6 Camp Statistics */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-brand-cyan-700" />
                Section A.6 — Camp Statistics & Recommendation Forms Upload
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label>Registered Children</Label>
                  <Input
                    type="number"
                    value={formData.registeredCount}
                    onChange={e => setFormData({ ...formData, registeredCount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Screened Children</Label>
                  <Input
                    type="number"
                    value={formData.screenedCount}
                    onChange={e => setFormData({ ...formData, screenedCount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Total Male Child</Label>
                  <Input
                    type="number"
                    value={formData.maleScreenedCount}
                    onChange={e => setFormData({ ...formData, maleScreenedCount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Total Female Child</Label>
                  <Input
                    type="number"
                    value={formData.femaleScreenedCount}
                    onChange={e => setFormData({ ...formData, femaleScreenedCount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Normal Children</Label>
                  <Input
                    type="number"
                    value={formData.normalCount}
                    onChange={e => setFormData({ ...formData, normalCount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Special Children</Label>
                  <Input
                    type="number"
                    value={formData.specialCount}
                    onChange={e => setFormData({ ...formData, specialCount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Followups Required</Label>
                  <Input
                    type="number"
                    value={formData.followUpsRequiredCount}
                    onChange={e => setFormData({ ...formData, followUpsRequiredCount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <Label>Followup Sheet Document</Label>
                  {formData.followUpSheetFileName ? (
                    <Badge color="success" className="flex items-center gap-1 text-[10px] py-1 px-2.5">
                      <CheckCircle className="h-3.5 w-3.5" /> Attached: {formData.followUpSheetFileName}
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, followUpSheetFileName: `followup_sheet_${Date.now()}.pdf` });
                        showToast('Followup Sheet Attached', 'success');
                      }}
                      className="w-full text-xs"
                    >
                      Upload Followup Sheet
                    </Button>
                  )}
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <Label>Experts Assessment & Recommendation Forms</Label>
                  {formData.expertsAssessmentFileName ? (
                    <Badge color="success" className="flex items-center gap-1 text-[10px] py-1 px-2.5">
                      <CheckCircle className="h-3.5 w-3.5" /> Attached: {formData.expertsAssessmentFileName}
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, expertsAssessmentFileName: `experts_assessment_${Date.now()}.pdf` });
                        showToast('Experts Assessment Form Attached', 'success');
                      }}
                      className="w-full text-xs"
                    >
                      Upload Experts Assessment Form
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* A.7 Follow-up Details of Child */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Section A.7 — Follow-up & Referral Parameters
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Age Group Band</Label>
                  <Select
                    options={[
                      { label: '0 - 12 Years', value: '0-12' },
                      { label: '12 - 18 Years', value: '12-18' },
                      { label: '18 & Above', value: '18+' }
                    ]}
                    value={formData.campFollowUp?.ageBand || '0-12'}
                    onChange={e => setFormData({
                      ...formData,
                      campFollowUp: { ...(formData.campFollowUp || {} as any), ageBand: e.target.value as any }
                    })}
                  />
                </div>
                <div>
                  <Label>Disability Category Type</Label>
                  <Select
                    options={[
                      { label: 'ID (Intellectual Disability)', value: 'true' },
                      { label: 'Non-ID', value: 'false' }
                    ]}
                    value={String(formData.campFollowUp?.isDisabilityID ?? false)}
                    onChange={e => setFormData({
                      ...formData,
                      campFollowUp: { ...(formData.campFollowUp || {} as any), isDisabilityID: e.target.value === 'true' }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 font-semibold text-slate-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.campFollowUp?.referralTherapy || false}
                    onChange={e => setFormData({
                      ...formData,
                      campFollowUp: { ...(formData.campFollowUp || {} as any), referralTherapy: e.target.checked }
                    })}
                    className="rounded accent-brand-cyan-700"
                  />
                  Referred for Therapy
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.campFollowUp?.referralMedicalTreatment || false}
                    onChange={e => setFormData({
                      ...formData,
                      campFollowUp: { ...(formData.campFollowUp || {} as any), referralMedicalTreatment: e.target.checked }
                    })}
                    className="rounded accent-brand-cyan-700"
                  />
                  Medical Referral
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.campFollowUp?.referralGovtScheme || false}
                    onChange={e => setFormData({
                      ...formData,
                      campFollowUp: { ...(formData.campFollowUp || {} as any), referralGovtScheme: e.target.checked }
                    })}
                    className="rounded accent-brand-cyan-700"
                  />
                  Govt Scheme Referral
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-700 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.campFollowUp?.referralRenuAdmission || false}
                    onChange={e => setFormData({
                      ...formData,
                      campFollowUp: { ...(formData.campFollowUp || {} as any), referralRenuAdmission: e.target.checked }
                    })}
                    className="rounded accent-brand-cyan-700"
                  />
                  RENU Admission Rec.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(s => Math.max(s - 1, 1))}
                className="flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={closeHandler}>
                Cancel
              </Button>
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && (!formData.name || !formData.location)) {
                    showToast('Validation Error', 'danger', 'Please enter camp name and venue location.');
                    return;
                  }
                  setStep(s => Math.min(s + 1, 4));
                }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="cursor-pointer font-bold px-6">
                {isEdit ? 'Save Camp Changes' : 'Conduct & Log Camp'}
              </Button>
            )}
          </div>
        </div>
      </form>
    );
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

    {/* Camp Details Drawer (Section A Master Overview) */}
    <Drawer
      isOpen={isDetailsOpen}
      onClose={() => { setIsDetailsOpen(false); setSelectedCamp(null); }}
      title={selectedCamp ? `Camp Details: ${selectedCamp.name}` : ''}
      size="lg"
    >
      {selectedCamp && (
        <div className="space-y-6 text-xs">
          {/* Section A.1 Header & Schedule */}
          <div className="p-4 bg-brand-cyan-50/50 border border-brand-cyan-100 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan-700">Section A.1 • Screening Camp</span>
                <h3 className="text-base font-bold text-slate-900">{selectedCamp.name}</h3>
                <p className="text-[11px] text-slate-500">{selectedCamp.campType || 'Medical Screening & Assessment Camp'}</p>
              </div>
              <Badge color="primary" className="font-bold">{selectedCamp.city}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-brand-cyan-100/70">
              <div>
                <Label className="text-[10px] text-slate-400">Date & Time</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.date} {selectedCamp.time ? `• ${selectedCamp.time}` : ''}</p>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400">Duration</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.duration || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400">Venue Type</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.venueType || 'School'}</p>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400">Coverage Area</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.coverageArea || 'Village'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Label className="text-[10px] text-slate-400">Venue Address</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.location} {selectedCamp.address ? `, ${selectedCamp.address}` : ''}</p>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400">Locality & Place</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.area} {selectedCamp.place ? `(${selectedCamp.place})` : ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-cyan-100/70">
              <div>
                <Label className="text-[10px] text-slate-400">Camp Coordinator</Label>
                <p className="font-semibold text-slate-800">{getCoordinatorName(selectedCamp.coordinatorId)}</p>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400">Lead Pediatrician</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.doctorName}</p>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400">Assigned Therapist</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.therapistName}</p>
              </div>
            </div>
          </div>

          {/* Section A.2 Organizer & Collaboration Details */}
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-purple-700" />
                Section A.2 — Association & Collaborative Partner Details
              </h4>
              <Badge color={selectedCamp.organizer?.isCollaborated ? 'success' : 'slate'}>
                {selectedCamp.organizer?.isCollaborated ? 'Collaboration Active' : 'Independent Camp'}
              </Badge>
            </div>

            {selectedCamp.organizer?.isCollaborated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <Label className="text-[10px] text-slate-400">Collaboration With</Label>
                  <p className="font-semibold text-slate-800">{selectedCamp.organizer?.collaborationType || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] text-slate-400">Institute Name</Label>
                  <p className="font-semibold text-slate-800">{selectedCamp.organizer?.instituteName || 'N/A'}</p>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-[10px] text-slate-400">Institute Address</Label>
                  <p className="font-semibold text-slate-800">{selectedCamp.organizer?.instituteAddress || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400">Representative Name</Label>
                  <p className="font-semibold text-slate-800">{selectedCamp.organizer?.repName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400">Designation</Label>
                  <p className="font-semibold text-slate-800">{selectedCamp.organizer?.repDesignation || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400">Contact / Email</Label>
                  <p className="font-semibold text-slate-800">
                    {selectedCamp.organizer?.repContact || ''} {selectedCamp.organizer?.repEmail ? `(${selectedCamp.organizer.repEmail})` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No external partner collaboration associated with this camp.</p>
            )}
          </div>

          {/* Section A.6 Camp Statistics & Recommendation Forms */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section A.6 — Camp Statistics & Recommendation Forms Upload
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-slate-800 block">{selectedCamp.registeredCount}</span>
                <span className="text-[9px] text-slate-500 font-medium uppercase">Registered</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-brand-cyan-800 block">{selectedCamp.screenedCount}</span>
                <span className="text-[9px] text-brand-cyan-700 font-medium uppercase">Screened</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-blue-700 block">{selectedCamp.maleScreenedCount || 0}</span>
                <span className="text-[9px] text-blue-600 font-medium uppercase">Male</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-pink-700 block">{selectedCamp.femaleScreenedCount || 0}</span>
                <span className="text-[9px] text-pink-600 font-medium uppercase">Female</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-emerald-600 block">{selectedCamp.normalCount}</span>
                <span className="text-[9px] text-emerald-600 font-medium uppercase">Normal</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-red-500 block">{selectedCamp.specialCount}</span>
                <span className="text-[9px] text-red-500 font-medium uppercase">Special</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-amber-500 block">{selectedCamp.followUpsRequiredCount}</span>
                <span className="text-[9px] text-amber-500 font-medium uppercase">Followups</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <Label className="text-[10px] text-slate-400">Followup Sheet Document</Label>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {selectedCamp.followUpSheetFileName || 'Not Uploaded'}
                  </div>
                </div>
                {!selectedCamp.followUpSheetFileName && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = { ...selectedCamp, followUpSheetFileName: `followup_sheet_${Date.now()}.pdf` };
                      updateSelectedCampInStore(updated);
                      showToast('Followup Sheet Uploaded', 'success');
                    }}
                    className="text-[10px] h-6 py-0 px-2 cursor-pointer"
                  >
                    Upload
                  </Button>
                )}
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <Label className="text-[10px] text-slate-400">Experts Assessment Form</Label>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {selectedCamp.expertsAssessmentFileName || 'Not Uploaded'}
                  </div>
                </div>
                {!selectedCamp.expertsAssessmentFileName && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = { ...selectedCamp, expertsAssessmentFileName: `experts_assessment_${Date.now()}.pdf` };
                      updateSelectedCampInStore(updated);
                      showToast('Experts Assessment Form Uploaded', 'success');
                    }}
                    className="text-[10px] h-6 py-0 px-2 cursor-pointer"
                  >
                    Upload
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Section A.7 Follow-up & Referral Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section A.7 — Follow-up & Referral Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] text-slate-400">Target Age Group Band</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.campFollowUp?.ageBand || '0-12 Years'}</p>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400">Disability Category</Label>
                <p className="font-semibold text-slate-800">{selectedCamp.campFollowUp?.isDisabilityID ? 'ID (Intellectual Disability)' : 'Non-ID'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge color={selectedCamp.campFollowUp?.referralTherapy ? 'primary' : 'slate'}>
                Therapy Referral: {selectedCamp.campFollowUp?.referralTherapy ? 'Yes' : 'No'}
              </Badge>
              <Badge color={selectedCamp.campFollowUp?.referralMedicalTreatment ? 'primary' : 'slate'}>
                Medical Referral: {selectedCamp.campFollowUp?.referralMedicalTreatment ? 'Yes' : 'No'}
              </Badge>
              <Badge color={selectedCamp.campFollowUp?.referralGovtScheme ? 'primary' : 'slate'}>
                Govt Scheme: {selectedCamp.campFollowUp?.referralGovtScheme ? 'Yes' : 'No'}
              </Badge>
              <Badge color={selectedCamp.campFollowUp?.referralRenuAdmission ? 'success' : 'slate'}>
                RENU Admission Rec: {selectedCamp.campFollowUp?.referralRenuAdmission ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {/* Section A.4 Camp Medical Team */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Section A.4 — Camp Team Selection ({selectedCamp.teamMembers?.length || 0} Members)
            </h4>
            <div className="space-y-2 mb-3">
              {(selectedCamp.teamMembers || []).map(member => (
                <div key={member.id} className="flex justify-between items-center p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900">{member.name}</span> <Badge color="primary" className="scale-75 origin-left py-0">{member.role}</Badge>
                    <div className="text-[10px] text-slate-400 mt-0.5">{member.organization ? `${member.organization} • ` : ''}{member.mobile}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTeamMember(member.id)} className="h-6 text-[10px] py-0 px-2 cursor-pointer text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
                </div>
              ))}
              {(selectedCamp.teamMembers || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">No medical experts logged for this camp yet.</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
              <div>
                <Select 
                  options={['Pediatrician', 'Developmental Pediatrician', 'Neurologist', 'Psychiatrist', 'Psychologist', 'Occupational Therapist', 'Speech Therapist', 'Physiotherapist', 'Audiologist', 'Vision Expert', 'Nutritionist', 'Orthopedic Doctor', 'Prosthetist & Orthotist', 'Special Educator', 'Coordinator', 'Volunteer'].map(r => ({label: r, value: r}))} 
                  value={newTeamMember.role} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value as any})} 
                />
              </div>
              <div>
                <Input placeholder="Name" value={newTeamMember.name} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} />
              </div>
              <div>
                <Input placeholder="Organization / Hospital" value={newTeamMember.organization} onChange={e => setNewTeamMember({...newTeamMember, organization: e.target.value})} />
              </div>
              <div className="flex gap-1">
                <Input placeholder="Mobile" value={newTeamMember.mobile} onChange={e => setNewTeamMember({...newTeamMember, mobile: e.target.value})} />
                <Button size="sm" onClick={handleAddTeamMember} className="cursor-pointer">Add</Button>
              </div>
            </div>
          </div>

          {/* Section A.5 IEC Materials */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">IEC Materials Tracking</h4>
            <div className="space-y-2 mb-3">
              {(selectedCamp.iecMaterials || []).map(iec => (
                <div key={iec.id} className="flex justify-between items-center p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900">{iec.name}</span> <span className="text-slate-500">(Qty: {iec.quantity})</span> - <Badge color="primary" className="scale-75 origin-left py-0">{iec.status}</Badge>
                    {iec.sampleFileName && <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Sample: {iec.sampleFileName}</div>}
                  </div>
                  <div className="flex gap-2">
                    {!iec.sampleFileName && <Button variant="outline" size="sm" onClick={() => handleMockUploadIEC(iec.id)} className="h-6 text-[10px] py-0 px-2 cursor-pointer">Upload Sample</Button>}
                    <Button variant="outline" size="sm" onClick={() => handleDeleteIEC(iec.id)} className="h-6 text-[10px] py-0 px-2 cursor-pointer text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input placeholder="Item Name" value={newIEC.name} onChange={e => setNewIEC({...newIEC, name: e.target.value})} />
              </div>
              <div className="w-20">
                <Input type="number" placeholder="Qty" value={newIEC.quantity} onChange={e => setNewIEC({...newIEC, quantity: Number(e.target.value)})} />
              </div>
              <div className="flex-1">
                <Select 
                  options={['Ordered', 'Ready', 'Distributed'].map(r => ({label: r, value: r}))} 
                  value={newIEC.status} onChange={e => setNewIEC({...newIEC, status: e.target.value as any})} 
                />
              </div>
              <Button size="sm" onClick={handleAddIEC} className="cursor-pointer">Add</Button>
            </div>
          </div>

          {/* Section A.5 Camp Documents (13 Types) */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Section A.5 — Camp Documents Matrix (13 Types)
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Permission Letter', 'Approval Letter', 'Posters', 'Banners', 'Social Media Creative',
                'Registration Sheet', 'Google Form', 'Photos', 'Videos', 'Parents Feedback',
                'Press Coverage', 'Media Link', 'Other IEC Material'
              ].map((docType) => {
                const existingDoc = (selectedCamp.campDocuments || []).find(d => d.type === docType);
                return (
                  <div key={docType} className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="font-bold text-slate-800 text-[11px] mb-0.5">{docType}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {existingDoc ? (docType === 'Media Link' ? existingDoc.mediaLink : existingDoc.fileName) : 'Not Uploaded'}
                      </div>
                    </div>
                    {docType === 'Media Link' ? (
                      <Input 
                        placeholder="Paste Media URL..." 
                        className="h-6 text-[10px]" 
                        value={existingDoc?.mediaLink || ''} 
                        onChange={(e) => {
                          const updated = {
                            ...selectedCamp,
                            campDocuments: [
                              ...(selectedCamp.campDocuments || []).filter(d => d.type !== docType),
                              { type: docType as any, mediaLink: e.target.value }
                            ]
                          };
                          updateSelectedCampInStore(updated);
                        }}
                      />
                    ) : (
                      <Button variant="outline" size="sm" className="w-full text-[10px] h-6 py-0 cursor-pointer" onClick={() => {
                        const updated = {
                          ...selectedCamp,
                          campDocuments: [
                            ...(selectedCamp.campDocuments || []).filter(d => d.type !== docType),
                            { type: docType as any, fileName: `uploaded_${docType.replace(/ /g, '_')}.pdf` }
                          ]
                        };
                        updateSelectedCampInStore(updated);
                        showToast(`${docType} Uploaded`, 'success');
                      }}>
                        Upload {docType}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registered Children List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Registered Children List ({getCampChildren(selectedCamp.id).length})
            </h4>
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
                      window.location.hash = `#/children/${c.id}`;
                      showToast(`Viewing profile of ${c.name}`, 'info');
                    }}
                  >
                    <div>
                      <div className="font-bold text-slate-800">{c.name}</div>
                      <div className="text-[10px] text-slate-400">ID: {c.id} • Age: {c.age} ({c.gender})</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={c.classification === 'Special' ? 'danger' : 'success'} className="scale-90 font-bold px-1.5 py-0">
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
    onClose={() => { setIsAddOpen(false); setAddStep(1); }}
    title="Log New Screening Camp (Section A Master Wizard)"
    size="lg"
  >
    {renderCampStepWizard(false)}
  </Modal>

  {/* Edit Camp Modal */}
  <Modal
    isOpen={isEditOpen}
    onClose={() => { setIsEditOpen(false); setCampToEdit(null); setEditStep(1); }}
    title={campToEdit ? `Edit Camp: ${campToEdit.name}` : 'Edit Camp'}
    size="lg"
  >
    {renderCampStepWizard(true)}
  </Modal>
 </div>
 );
};

export default Camps;
