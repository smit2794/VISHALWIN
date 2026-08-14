import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/renuStore';
import { useRole } from'../../../hooks/useRole';
import { showToast } from'../../../hooks/useToast';
import { Child, Camp, DisabilityType, SeverityLevel, ChildJourneyStatus } from'../types';
import { Card, Badge, Button, Input, Select, Label, Textarea, Modal } from '../../../components/ui';
import { Search, MapPin, ChevronRight, Sparkles, Clipboard, Heart, Settings, AlertCircle, Info, Plus, Users, GraduationCap, Stethoscope, FileText } from 'lucide-react';
import EmptyState from'../../../components/common/EmptyState';
import { useNavigate, useSearchParams } from'react-router-dom';
import { JOURNEY_STEPS } from'../../../components/common/RenuJourneyTracker';
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
    name: '',
    gender: 'Male' as Child['gender'],
    dob: '',
    bloodGroup: 'A+',
    motherTongue: 'Hindi',
    languageSpokenAtHome: 'Hindi',
    weightKg: 15,
    heightCm: 95,
    identificationMark: '',
    childConditionDescription: '',
    fatherName: '',
    fatherEducation: '10th Pass',
    fatherOccupation: 'Daily Wage Worker',
    fatherMobile: '',
    fatherWhatsApp: true,
    motherName: '',
    motherEducation: '12th Pass',
    motherOccupation: 'Homemaker',
    motherMobile: '',
    motherWhatsApp: true,
    guardianName: '',
    mobile: '',
    alternateMobile: '',
    address: '',
    area: '',
    city: 'Mumbai',
    pincode: '',
    district: 'Mumbai',
    familyMembersCount: 4,
    annualIncome: 80000,
    socioEconomicStatus: 'Low' as any,
    familyType: 'Nuclear' as any,
    consanguineousMarriage: false,
    otherChildDisability: false,
    otherChildDisabilityDetails: '',
    interestedHouseholdMembers: '',
    connectedNGOsOrGroups: '',
    siblingName: '',
    siblingAge: 10,
    siblingEducation: '5th Std',
    siblingOccupation: 'Student',
    campId: '',
    schoolName: '',
    schoolType: 'Inclusive School' as any,
    schoolAddress: '',
    principalName: '',
    principalContact: '',
    admissionDate: '',
    currentStandard: '',
    mediumOfInstruction: 'Gujarati' as any,
    educationCategory: 'Inclusive Education' as any,
    attendancePercent: 85,
    teacherFeedback: '',
    isNotEnrolled: false,
    lastSchoolAttended: '',
    reasonForDropout: '',
    registrationSource: 'Medical Camp' as Child['registrationSource'],
    registrationPlace: '',
    classification: 'Special' as Child['classification'],
    disabilityType: 'Autism' as DisabilityType,
    severity: 'Mild' as SeverityLevel,
    journeyStatus: 'Medical Camp' as ChildJourneyStatus,
    hasEpilepsyAttacks: false,
    epilepsySinceWhen: '',
    karyotypingTestDone: false,
    karyotypingTestCentre: '',
    otherMedicalIssuesNotes: '',
    medicalCheckupDone: true,
    medicalCheckupDate: '',
    isToiletTrained: 'Yes' as any,
    specialFootwearSuggested: false,
    specialFootwearProcured: false,
    specialNotes: '',
    verificationDeclarationChecked: true,
    birthCertificateFileName: '',
    aadhaarCardFileName: '',
    disabilityCertificatesFileName: '',
    healthExpertsReportFileName: '',
    psychiatristReportFileName: '',
    psychologicalReportFileName: ''
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
      id: `CHI-${400 + children.length + 1}`,
      name: formData.name,
      photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.name}`,
      dob: formData.dob,
      age: calculatedAge,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      motherTongue: formData.motherTongue,
      languageSpokenAtHome: formData.languageSpokenAtHome,
      weightKg: formData.weightKg,
      heightCm: formData.heightCm,
      identificationMark: formData.identificationMark,
      childConditionDescription: formData.childConditionDescription,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      guardianName: formData.guardianName || undefined,
      familyDetails: {
        father: {
          name: formData.fatherName,
          education: formData.fatherEducation,
          occupation: formData.fatherOccupation,
          mobile: formData.fatherMobile || formData.mobile,
          isWhatsApp: formData.fatherWhatsApp
        },
        mother: {
          name: formData.motherName,
          education: formData.motherEducation,
          occupation: formData.motherOccupation,
          mobile: formData.motherMobile || formData.alternateMobile,
          isWhatsApp: formData.motherWhatsApp
        },
        guardian: { name: formData.guardianName || 'N/A', education: 'N/A', occupation: 'N/A', mobile: '' },
        annualIncome: formData.annualIncome,
        bplStatus: true,
        rationCard: true,
        familyMembersCount: formData.familyMembersCount,
        socioEconomicStatus: formData.socioEconomicStatus,
        siblings: formData.siblingName ? [
          { name: formData.siblingName, age: formData.siblingAge, education: formData.siblingEducation, businessOrOccupation: formData.siblingOccupation }
        ] : [],
        otherChildDisability: formData.otherChildDisability,
        otherChildDisabilityDetails: formData.otherChildDisabilityDetails,
        consanguineousMarriage: formData.consanguineousMarriage,
        interestedHouseholdMembers: formData.interestedHouseholdMembers,
        familyType: formData.familyType,
        connectedNGOsOrGroups: formData.connectedNGOsOrGroups
      },
      mobile: formData.mobile,
      alternateMobile: formData.alternateMobile || undefined,
      address: formData.address,
      area: formData.area,
      city: formData.city,
      pincode: formData.pincode,
      district: formData.district,
      schoolName: formData.isNotEnrolled ? undefined : formData.schoolName,
      currentStandard: formData.isNotEnrolled ? undefined : formData.currentStandard,
      isNotEnrolled: formData.isNotEnrolled,
      lastSchoolAttended: formData.isNotEnrolled ? formData.lastSchoolAttended : undefined,
      reasonForDropout: formData.isNotEnrolled ? formData.reasonForDropout : undefined,
      schoolAdmission: {
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        schoolAddress: formData.schoolAddress,
        principalName: formData.principalName,
        principalContact: formData.principalContact,
        admissionDate: formData.admissionDate,
        standard: formData.currentStandard,
        mediumOfInstruction: formData.mediumOfInstruction,
        educationCategory: formData.educationCategory,
        attendancePercent: formData.attendancePercent,
        teacherFeedback: formData.teacherFeedback,
        admissionStatus: formData.isNotEnrolled ? 'Identified' : 'Confirmed'
      },
      registrationSource: formData.registrationSource,
      registrationPlace: formData.registrationPlace || formData.area,
      classification: formData.classification,
      disabilityType: formData.classification === 'Special' ? formData.disabilityType : undefined,
      severity: formData.classification === 'Special' ? formData.severity : undefined,
      hasEpilepsyAttacks: formData.hasEpilepsyAttacks,
      epilepsySinceWhen: formData.epilepsySinceWhen,
      karyotypingTestDone: formData.karyotypingTestDone,
      karyotypingTestCentre: formData.karyotypingTestCentre,
      otherMedicalIssuesNotes: formData.otherMedicalIssuesNotes,
      medicalCheckupDone: formData.medicalCheckupDone,
      medicalCheckupDate: formData.medicalCheckupDate,
      isToiletTrained: formData.isToiletTrained,
      specialFootwearSuggested: formData.specialFootwearSuggested,
      specialFootwearProcured: formData.specialFootwearProcured,
      journeyStatus: formData.classification === 'Normal' ? 'School Ready' : formData.journeyStatus,
      registeredDate,
      campId: formData.campId,
      birthCertificateFileName: formData.birthCertificateFileName || `birth_cert_${Date.now()}.pdf`,
      aadhaarCardFileName: formData.aadhaarCardFileName || `aadhaar_card_${Date.now()}.pdf`,
      disabilityCertificatesFileName: formData.disabilityCertificatesFileName || `disability_cert_${Date.now()}.pdf`,
      healthExpertsReportFileName: formData.healthExpertsReportFileName || `health_experts_report_${Date.now()}.pdf`,
      psychiatristReportFileName: formData.psychiatristReportFileName || `psychiatrist_report_${Date.now()}.pdf`,
      psychologicalReportFileName: formData.psychologicalReportFileName || `psychological_report_${Date.now()}.pdf`,
      specialNotes: formData.specialNotes,
      verificationDeclarationChecked: formData.verificationDeclarationChecked,
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
      name: '',
      gender: 'Male',
      dob: '',
      bloodGroup: 'A+',
      motherTongue: 'Hindi',
      languageSpokenAtHome: 'Hindi',
      weightKg: 15,
      heightCm: 95,
      identificationMark: '',
      childConditionDescription: '',
      fatherName: '',
      fatherEducation: '10th Pass',
      fatherOccupation: 'Daily Wage Worker',
      fatherMobile: '',
      fatherWhatsApp: true,
      motherName: '',
      motherEducation: '12th Pass',
      motherOccupation: 'Homemaker',
      motherMobile: '',
      motherWhatsApp: true,
      guardianName: '',
      mobile: '',
      alternateMobile: '',
      address: '',
      area: camps[0]?.area || '',
      city: camps[0]?.city || 'Mumbai',
      pincode: '',
      district: camps[0]?.city || 'Mumbai',
      familyMembersCount: 4,
      annualIncome: 80000,
      socioEconomicStatus: 'Low',
      familyType: 'Nuclear',
      consanguineousMarriage: false,
      otherChildDisability: false,
      otherChildDisabilityDetails: '',
      interestedHouseholdMembers: '',
      connectedNGOsOrGroups: '',
      siblingName: '',
      siblingAge: 10,
      siblingEducation: '5th Std',
      siblingOccupation: 'Student',
      campId: camps[0]?.id || '',
    schoolName: '',
    schoolType: 'Inclusive School' as any,
    schoolAddress: '',
    principalName: '',
    principalContact: '',
    admissionDate: '',
    currentStandard: '',
    mediumOfInstruction: 'Gujarati' as any,
    educationCategory: 'Inclusive Education' as any,
    attendancePercent: 85,
    teacherFeedback: '',
    isNotEnrolled: false,
    lastSchoolAttended: '',
    reasonForDropout: '',
      registrationSource: 'Medical Camp',
      registrationPlace: camps[0]?.location || '',
      classification: 'Special',
      disabilityType: 'Autism',
      severity: 'Mild',
      journeyStatus: 'Medical Camp',
      hasEpilepsyAttacks: false,
      epilepsySinceWhen: '',
      karyotypingTestDone: false,
      karyotypingTestCentre: '',
      otherMedicalIssuesNotes: '',
      medicalCheckupDone: true,
      medicalCheckupDate: '',
      isToiletTrained: 'Yes',
      specialFootwearSuggested: false,
      specialFootwearProcured: false,
      specialNotes: '',
      verificationDeclarationChecked: true,
      birthCertificateFileName: '',
      aadhaarCardFileName: '',
      disabilityCertificatesFileName: '',
      healthExpertsReportFileName: '',
      psychiatristReportFileName: '',
      psychologicalReportFileName: ''
    });
  };

 const registrationSourceOptions = [
 { label:'Medical Camp', value:'Medical Camp'},
 { label:'Helpline', value:'Helpline'},
 { label:'Field Visit', value:'Field Visit'},
 { label:'NGO Request', value:'NGO Request'},
 { label:'School', value:'School'},
 { label:'Hospital', value:'Hospital'},
 { label:'Government', value:'Government'},
 { label:'Parent Walk-in', value:'Parent Walk-in'},
 { label:'Reference', value:'Reference'},
 { label:'Other', value:'Other'}
 ];

 const classificationOptions = [
 { label:'All Classifications', value:'All'},
 { label:'Normal Child', value:'Normal'},
 { label:'Special Child', value:'Special'},
 ];

 const disabilityOptions = [
 { label:'All Disabilities', value:'All'},
 { label:'Autism', value:'Autism'},
 { label:'Intellectual Disability', value:'Intellectual Disability'},
 { label:'Cerebral Palsy', value:'Cerebral Palsy'},
 { label:'ADHD', value:'ADHD'},
 { label:'Down Syndrome', value:'Down Syndrome'},
 { label:'Learning Disability', value:'Learning Disability'},
 { label:'Hearing Impairment', value:'Hearing Impairment'},
 { label:'Visual Impairment', value:'Visual Impairment'},
 { label:'Multiple Disability', value:'Multiple Disability'},
 { label:'Others', value:'Others'}
 ];

 const severityOptions = [
 { label:'All Severities', value:'All'},
 { label:'Mild', value:'Mild'},
 { label:'Moderate', value:'Moderate'},
 { label:'Severe', value:'Severe'},
 { label:'Profound', value:'Profound'}
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
 onClick={() => navigate(`/renu/children/${c.id}`)}
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
 onClick={() => navigate(`/renu/children/${c.id}`)}
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
    title={`Register Child: Master Registration Wizard (Step ${regStep} of 5)`}
    size="lg"
  >
    {/* Step Indicators */}
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
      {['1. Demographics', '2. Family & House', '3. Schooling', '4. Medical & Screening', '5. Reports & Verify'].map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = regStep > stepNum;
        const isActive = regStep === stepNum;
        return (
          <div key={label} className="flex-1 min-w-[100px] flex flex-col gap-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              isActive ? 'bg-indigo-600' : isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
            }`} />
            <span className={`text-[9px] font-bold text-center block ${
              isActive ? 'text-indigo-600' : 'text-slate-500'
            }`}>{label}</span>
          </div>
        );
      })}
    </div>

    <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
      {/* STEP 1: Child Demographics & Physical Profile */}
      {regStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl flex gap-2.5">
            <Info className="h-4.5 w-4.5 text-indigo-600 mt-0.5 flex-shrink-0"/>
            <p className="text-[10px] text-indigo-900 leading-relaxed font-semibold">
              Step 1 of 5: Child Demographics & Physical Profile (Points 1, 6-14, 45, 46). Age is auto-calculated from DOB.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Child Name * (Point 1)</Label>
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
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' },
                ]}
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Date of Birth * (Point 6)</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Blood Group (Point 12)</Label>
              <Select
                options={['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(b => ({ label: b, value: b }))}
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
              />
            </div>
            <div>
              <Label>Mother Tongue (Point 8)</Label>
              <Input
                placeholder="e.g. Hindi / Marathi / Gujarati"
                value={formData.motherTongue}
                onChange={e => setFormData({ ...formData, motherTongue: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Language Spoken at Home (Point 9)</Label>
              <Input
                placeholder="e.g. Hindi"
                value={formData.languageSpokenAtHome}
                onChange={e => setFormData({ ...formData, languageSpokenAtHome: e.target.value })}
              />
            </div>
            <div>
              <Label>Weight in Kg (Point 10)</Label>
              <Input
                type="number"
                placeholder="15"
                value={formData.weightKg}
                onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Height in Cm (Point 11)</Label>
              <Input
                type="number"
                placeholder="95"
                value={formData.heightCm}
                onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Identification Mark (Point 13)</Label>
              <Input
                placeholder="e.g. Small mole on right cheek"
                value={formData.identificationMark}
                onChange={e => setFormData({ ...formData, identificationMark: e.target.value })}
              />
            </div>
            <div>
              <Label>Registered Camp Location * (Point 46)</Label>
              <Select
                options={camps.map(c => ({ label: c.name, value: c.id }))}
                value={formData.campId}
                onChange={e => handleCampChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label>Describe the Condition of the Child (Point 14)</Label>
            <Textarea
              placeholder="Provide narrative summary of child's developmental condition..."
              value={formData.childConditionDescription}
              onChange={e => setFormData({ ...formData, childConditionDescription: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      )}

      {/* STEP 2: Parents, Family & Household Background */}
      {regStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl flex gap-2.5">
            <Users className="h-4.5 w-4.5 text-indigo-600 mt-0.5 flex-shrink-0"/>
            <p className="text-[10px] text-indigo-900 leading-relaxed font-semibold">
              Step 2 of 5: Parents, Siblings & Household Background (Points 2, 3, 4, 28-38).
            </p>
          </div>

          {/* Father Details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-[11px] uppercase">Father Details (Points 2, 28, 29, 30)</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-emerald-700">
                <input
                  type="checkbox"
                  checked={formData.fatherWhatsApp}
                  onChange={e => setFormData({ ...formData, fatherWhatsApp: e.target.checked })}
                />
                WhatsApp Active (Point 3)
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                <Label>Education</Label>
                <Input
                  placeholder="e.g. 10th Pass"
                  value={formData.fatherEducation}
                  onChange={e => setFormData({ ...formData, fatherEducation: e.target.value })}
                />
              </div>
              <div>
                <Label>Occupation</Label>
                <Input
                  placeholder="e.g. Daily Wage Worker"
                  value={formData.fatherOccupation}
                  onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })}
                />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input
                  placeholder="+91 99887 XXXXX"
                  value={formData.fatherMobile || formData.mobile}
                  onChange={e => setFormData({ ...formData, fatherMobile: e.target.value, mobile: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Mother Details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-[11px] uppercase">Mother Details (Points 2, 28, 29, 30)</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-emerald-700">
                <input
                  type="checkbox"
                  checked={formData.motherWhatsApp}
                  onChange={e => setFormData({ ...formData, motherWhatsApp: e.target.checked })}
                />
                WhatsApp Active (Point 3)
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <Label>Mother Name</Label>
                <Input
                  placeholder="Mother Name"
                  value={formData.motherName}
                  onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                />
              </div>
              <div>
                <Label>Education</Label>
                <Input
                  placeholder="e.g. 12th Pass"
                  value={formData.motherEducation}
                  onChange={e => setFormData({ ...formData, motherEducation: e.target.value })}
                />
              </div>
              <div>
                <Label>Occupation</Label>
                <Input
                  placeholder="e.g. Homemaker"
                  value={formData.motherOccupation}
                  onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })}
                />
              </div>
              <div>
                <Label>Mobile / Alt Contact</Label>
                <Input
                  placeholder="+91 99887 XXXXX"
                  value={formData.motherMobile || formData.alternateMobile}
                  onChange={e => setFormData({ ...formData, motherMobile: e.target.value, alternateMobile: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="md:col-span-2">
              <Label>Address * (Point 4)</Label>
              <Input
                placeholder="Street Address, Block or Slum Locality"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>District</Label>
              <Input
                placeholder="District"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
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

          {/* Family Financials & Type (Points 31, 34, 36, 37) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <Label>Annual Income (Point 31)</Label>
              <Input
                type="number"
                placeholder="80000"
                value={formData.annualIncome}
                onChange={e => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Total Members (Point 36)</Label>
              <Input
                type="number"
                placeholder="4"
                value={formData.familyMembersCount}
                onChange={e => setFormData({ ...formData, familyMembersCount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Family Type (Point 37)</Label>
              <Select
                options={['Nuclear', 'Joint', 'Single Parent'].map(f => ({ label: f, value: f }))}
                value={formData.familyType}
                onChange={e => setFormData({ ...formData, familyType: e.target.value as any })}
              />
            </div>
            <div>
              <Label>Socio-economic Status</Label>
              <Select
                options={['Low', 'Lower Middle', 'Middle', 'Upper'].map(s => ({ label: s, value: s }))}
                value={formData.socioEconomicStatus}
                onChange={e => setFormData({ ...formData, socioEconomicStatus: e.target.value as any })}
              />
            </div>
          </div>

          {/* Siblings & Other Child Disability (Points 32, 33, 34, 35, 38) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase">Sibling & Household Details (Points 32-35, 38)</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <Label>Sibling Name (Point 32)</Label>
                <Input
                  placeholder="Sibling Name"
                  value={formData.siblingName}
                  onChange={e => setFormData({ ...formData, siblingName: e.target.value })}
                />
              </div>
              <div>
                <Label>Sibling Age</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.siblingAge}
                  onChange={e => setFormData({ ...formData, siblingAge: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Sibling Education</Label>
                <Input
                  placeholder="e.g. 5th Std"
                  value={formData.siblingEducation}
                  onChange={e => setFormData({ ...formData, siblingEducation: e.target.value })}
                />
              </div>
              <div>
                <Label>Sibling Occupation</Label>
                <Input
                  placeholder="e.g. Student"
                  value={formData.siblingOccupation}
                  onChange={e => setFormData({ ...formData, siblingOccupation: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.consanguineousMarriage}
                  onChange={e => setFormData({ ...formData, consanguineousMarriage: e.target.checked })}
                />
                Consanguineous Marriage (Marriage in Relative) (Point 34)
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.otherChildDisability}
                  onChange={e => setFormData({ ...formData, otherChildDisability: e.target.checked })}
                />
                Other Child Has Disability in Family (Point 33)
              </label>
            </div>

            {formData.otherChildDisability && (
              <div>
                <Label>Other Child Disability Details</Label>
                <Input
                  placeholder="Describe disability of sibling..."
                  value={formData.otherChildDisabilityDetails}
                  onChange={e => setFormData({ ...formData, otherChildDisabilityDetails: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>Interested Household Members (Point 35)</Label>
                <Input
                  placeholder="e.g. Grandmother assists with care"
                  value={formData.interestedHouseholdMembers}
                  onChange={e => setFormData({ ...formData, interestedHouseholdMembers: e.target.value })}
                />
              </div>
              <div>
                <Label>Connected NGOs / Groups (Point 38)</Label>
                <Input
                  placeholder="e.g. Local Community Welfare Association"
                  value={formData.connectedNGOsOrGroups}
                  onChange={e => setFormData({ ...formData, connectedNGOsOrGroups: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Schooling & Education History (Section H) */}
      {regStep === 3 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl flex gap-2.5">
            <GraduationCap className="h-4.5 w-4.5 text-indigo-600 mt-0.5 flex-shrink-0"/>
            <div>
              <p className="text-[11px] text-indigo-900 leading-relaxed font-bold">
                Step 3 of 5: Section H — Education & School Admissions
              </p>
              <p className="text-[10px] text-indigo-700">Collect school details, type, medium, student standard, education model, attendance, and feedback.</p>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-800">Is the child currently enrolled in school? (Point 20)</Label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input
                  type="radio"
                  checked={formData.isNotEnrolled === false}
                  onChange={() => setFormData({ ...formData, isNotEnrolled: false })}
                  className="accent-indigo-600 h-4 w-4"
                />
                Yes, Currently Enrolled
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input
                  type="radio"
                  checked={formData.isNotEnrolled === true}
                  onChange={() => setFormData({ ...formData, isNotEnrolled: true })}
                  className="accent-indigo-600 h-4 w-4"
                />
                No, Not Enrolled / Dropped Out
              </label>
            </div>
          </div>

          {!formData.isNotEnrolled ? (
            <div className="space-y-4 animate-in slide-in-from-top duration-200">
              {/* 1. SCHOOL DETAILS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                  1. School Details
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px]">School Name *</Label>
                    <Input
                      className="h-8 text-xs py-1"
                      placeholder="e.g. Saraswati Primary School"
                      value={formData.schoolName}
                      onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Type</Label>
                    <Select
                      className="h-8 text-xs py-1"
                      value={formData.schoolType}
                      onChange={e => setFormData({ ...formData, schoolType: e.target.value as any })}
                      options={[
                        { label: 'Normal School', value: 'Normal School' },
                        { label: 'Inclusive School', value: 'Inclusive School' },
                        { label: 'Integrated School', value: 'Integrated School' },
                        { label: 'Home Schooling', value: 'Home Schooling' },
                        { label: 'NIOS (Open Schooling)', value: 'NIOS' }
                      ]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-[10px]">Address</Label>
                    <Input
                      className="h-8 text-xs py-1"
                      placeholder="Campus address..."
                      value={formData.schoolAddress}
                      onChange={e => setFormData({ ...formData, schoolAddress: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Principal / Contact Person</Label>
                    <Input
                      className="h-8 text-xs py-1"
                      placeholder="e.g. Dr. Ramesh Shah"
                      value={formData.principalName}
                      onChange={e => setFormData({ ...formData, principalName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Principal / Contact Phone</Label>
                    <Input
                      className="h-8 text-xs py-1"
                      placeholder="+91 98765 43210"
                      value={formData.principalContact}
                      onChange={e => setFormData({ ...formData, principalContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 2. STUDENT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                  2. Student
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-[10px]">Admission Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs py-1"
                      value={formData.admissionDate}
                      onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Standard / Class (Point 21)</Label>
                    <Input
                      className="h-8 text-xs py-1"
                      placeholder="e.g. 3rd Standard"
                      value={formData.currentStandard}
                      onChange={e => setFormData({ ...formData, currentStandard: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">Medium</Label>
                    <Select
                      className="h-8 text-xs py-1"
                      value={formData.mediumOfInstruction}
                      onChange={e => setFormData({ ...formData, mediumOfInstruction: e.target.value as any })}
                      options={['Gujarati', 'English', 'Hindi', 'Marathi', 'Other'].map(m => ({ label: m, value: m }))}
                    />
                  </div>
                </div>
              </div>

              {/* 3. EDUCATION TYPE */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                  3. Education Type
                </span>
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                    <input
                      type="radio"
                      name="educationCategoryReg"
                      className="h-4 w-4 accent-indigo-600"
                      checked={formData.educationCategory === 'Inclusive Education'}
                      onChange={() => setFormData({ ...formData, educationCategory: 'Inclusive Education' })}
                    />
                    Inclusive Education
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                    <input
                      type="radio"
                      name="educationCategoryReg"
                      className="h-4 w-4 accent-indigo-600"
                      checked={formData.educationCategory === 'Special School'}
                      onChange={() => setFormData({ ...formData, educationCategory: 'Special School' })}
                    />
                    Special School
                  </label>
                </div>
              </div>

              {/* 4. PROGRESS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                  4. Progress & Observations
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px]">Attendance (%)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs py-1"
                      placeholder="85"
                      value={formData.attendancePercent}
                      onChange={e => setFormData({ ...formData, attendancePercent: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Teacher Feedback</Label>
                    <Input
                      className="h-8 text-xs py-1"
                      placeholder="Classroom participation and learning behavior notes..."
                      value={formData.teacherFeedback}
                      onChange={e => setFormData({ ...formData, teacherFeedback: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-200 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <Label className="text-[10px]">Which School Did You Go to Last? (Point 19)</Label>
                <Input
                  className="h-8 text-xs py-1"
                  placeholder="e.g. Municipal Primary School No. 2"
                  value={formData.lastSchoolAttended}
                  onChange={e => setFormData({ ...formData, lastSchoolAttended: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[10px]">Reason for Dropping Out of School? (Point 19)</Label>
                <Input
                  className="h-8 text-xs py-1"
                  placeholder="e.g. Distance to center & financial constraints"
                  value={formData.reasonForDropout}
                  onChange={e => setFormData({ ...formData, reasonForDropout: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Clinical Screening & Medical History */}
      {regStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl flex gap-2.5">
            <Stethoscope className="h-4.5 w-4.5 text-indigo-600 mt-0.5 flex-shrink-0"/>
            <p className="text-[10px] text-indigo-900 leading-relaxed font-semibold">
              Step 4 of 5: Clinical Screening & Medical History (Points 5, 18, 22-27, 39).
            </p>
          </div>

          <div>
            <Label>Pediatric Screening Classification * (Point 5)</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div 
                onClick={() => setFormData({ ...formData, classification: 'Normal', journeyStatus: 'School Ready' })}
                className={`p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
                  formData.classification === 'Normal'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-100/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-extrabold text-slate-800 block text-xs">Development Normal</span>
                <span className="text-[10px] text-slate-400 mt-1.5 block leading-normal">Meets developmental milestones. No immediate clinical intervention.</span>
              </div>

              <div 
                onClick={() => setFormData({ ...formData, classification: 'Special', journeyStatus: 'Medical Camp' })}
                className={`p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
                  formData.classification === 'Special'
                    ? 'border-red-500 bg-red-50/50 shadow-sm ring-2 ring-red-100/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-extrabold text-slate-800 block text-xs">Special needs Child</span>
                <span className="text-[10px] text-slate-400 mt-1.5 block leading-normal">Neurodiversity or development delay identified. Needs therapy placements.</span>
              </div>
            </div>
          </div>

          {formData.classification === 'Special' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-slate-200 bg-slate-50/50 rounded-2xl animate-in slide-in-from-top duration-250">
              <div>
                <Label>Disability Type</Label>
                <Select
                  options={[
                    { label: 'Autism Spectrum', value: 'Autism' },
                    { label: 'Down Syndrome', value: 'Down Syndrome' },
                    { label: 'ADHD', value: 'ADHD' },
                    { label: 'Intellectual Disability', value: 'Intellectual Disability' },
                    { label: 'Speech Delay', value: 'Speech Delay' },
                    { label: 'Development Delay', value: 'Development Delay' },
                    { label: 'Learning Disability', value: 'Learning Disability' },
                    { label: 'Cerebral Palsy', value: 'Cerebral Palsy' },
                    { label: 'Hearing Impairment', value: 'Hearing Impairment' },
                    { label: 'Visual Impairment', value: 'Visual Impairment' },
                    { label: 'Multiple Disability', value: 'Multiple Disability' },
                    { label: 'Other', value: 'Others' },
                  ]}
                  value={formData.disabilityType}
                  onChange={e => setFormData({ ...formData, disabilityType: e.target.value as any })}
                />
              </div>
              <div>
                <Label>Severity Level</Label>
                <Select
                  options={[
                    { label: 'Mild', value: 'Mild' },
                    { label: 'Moderate', value: 'Moderate' },
                    { label: 'Severe', value: 'Severe' },
                    { label: 'Profound', value: 'Profound' },
                  ]}
                  value={formData.severity}
                  onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                />
              </div>
              <div>
                <Label>Initial Journey Stage</Label>
                <Select
                  options={[
                    { label: 'Medical Camp (Start)', value: 'Medical Camp' },
                    { label: 'Screening', value: 'Screening' },
                    { label: 'Child Classification', value: 'Child Classification' },
                    { label: 'Follow-Up', value: 'Follow-Up' },
                  ]}
                  value={formData.journeyStatus}
                  onChange={e => setFormData({ ...formData, journeyStatus: e.target.value as any })}
                />
              </div>
            </div>
          )}

          {/* Screening Checks Grid (Points 18, 22, 24, 26, 27) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 text-[11px] uppercase">Medical Screening Checks (Points 18, 22, 24, 26, 27)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.hasEpilepsyAttacks}
                    onChange={e => setFormData({ ...formData, hasEpilepsyAttacks: e.target.checked })}
                  />
                  Does Child Get Epilepsy Attacks? (Point 18)
                </label>
                {formData.hasEpilepsyAttacks && (
                  <Input
                    className="mt-1.5 h-6 text-[10px]"
                    placeholder="Since when? (e.g. Since 2 years ago)"
                    value={formData.epilepsySinceWhen}
                    onChange={e => setFormData({ ...formData, epilepsySinceWhen: e.target.value })}
                  />
                )}
              </div>

              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.karyotypingTestDone}
                    onChange={e => setFormData({ ...formData, karyotypingTestDone: e.target.checked })}
                  />
                  Have You Taken a Karyotyping Test? (Point 22)
                </label>
                {formData.karyotypingTestDone && (
                  <Input
                    className="mt-1.5 h-6 text-[10px]"
                    placeholder="Where? (e.g. KEM Hospital Genetic Lab)"
                    value={formData.karyotypingTestCentre}
                    onChange={e => setFormData({ ...formData, karyotypingTestCentre: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Toilet Trained (Point 26)</Label>
                <Select
                  options={['Yes', 'No', 'Partial'].map(o => ({ label: o, value: o }))}
                  value={formData.isToiletTrained}
                  onChange={e => setFormData({ ...formData, isToiletTrained: e.target.value as any })}
                />
              </div>
              <div>
                <Label>Special Footwear Suggested (Point 27)</Label>
                <Select
                  options={[
                    { label: 'Yes - Suggested', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]}
                  value={String(formData.specialFootwearSuggested)}
                  onChange={e => setFormData({ ...formData, specialFootwearSuggested: e.target.value === 'true' })}
                />
              </div>
              <div>
                <Label>Medical Check-up Done (Point 24)</Label>
                <Select
                  options={[
                    { label: 'Yes - Completed', value: 'true' },
                    { label: 'Pending', value: 'false' }
                  ]}
                  value={String(formData.medicalCheckupDone)}
                  onChange={e => setFormData({ ...formData, medicalCheckupDone: e.target.value === 'true' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Other Medical Issues Notes (Point 23)</Label>
                <Input
                  placeholder="Write any other medical issues..."
                  value={formData.otherMedicalIssuesNotes}
                  onChange={e => setFormData({ ...formData, otherMedicalIssuesNotes: e.target.value })}
                />
              </div>
              <div>
                <Label>Special Notes (Point 39)</Label>
                <Input
                  placeholder="Special instructions or notes..."
                  value={formData.specialNotes}
                  onChange={e => setFormData({ ...formData, specialNotes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Reports, Attachments & Verification Declaration */}
      {regStep === 5 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl flex gap-2.5">
            <FileText className="h-4.5 w-4.5 text-indigo-600 mt-0.5 flex-shrink-0"/>
            <p className="text-[10px] text-indigo-900 leading-relaxed font-semibold">
              Step 5 of 5: Document Attachments & Verification Declaration (Points 15-17, 40-44).
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 text-[11px] uppercase">Upload Attachments (Points 15, 16, 17, 40, 42, 43)</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-[11px] block">Health Experts Report (Point 15)</span>
                <input
                  type="file"
                  className="mt-1 text-[10px] block w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={e => setFormData({ ...formData, healthExpertsReportFileName: e.target.files?.[0]?.name || '' })}
                />
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-[11px] block">Psychiatrist Report (Point 16)</span>
                <input
                  type="file"
                  className="mt-1 text-[10px] block w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={e => setFormData({ ...formData, psychiatristReportFileName: e.target.files?.[0]?.name || '' })}
                />
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-[11px] block">Psychological Report (Point 17)</span>
                <input
                  type="file"
                  className="mt-1 text-[10px] block w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={e => setFormData({ ...formData, psychologicalReportFileName: e.target.files?.[0]?.name || '' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-[11px] block">Disability Certificate (Point 40)</span>
                <input
                  type="file"
                  className="mt-1 text-[10px] block w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={e => setFormData({ ...formData, disabilityCertificatesFileName: e.target.files?.[0]?.name || '' })}
                />
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-[11px] block">Admission Attachments (Point 42)</span>
                <input
                  type="file"
                  className="mt-1 text-[10px] block w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={e => setFormData({ ...formData, birthCertificateFileName: e.target.files?.[0]?.name || '' })}
                />
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-[11px] block">Parent Consent Form (Point 43)</span>
                <input
                  type="file"
                  className="mt-1 text-[10px] block w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={e => setFormData({ ...formData, aadhaarCardFileName: e.target.files?.[0]?.name || '' })}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="declarationCheck"
              checked={formData.verificationDeclarationChecked}
              onChange={e => setFormData({ ...formData, verificationDeclarationChecked: e.target.checked })}
              className="mt-1 h-4 w-4 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="declarationCheck" className="text-xs font-semibold text-amber-900 leading-relaxed cursor-pointer">
              Verification Declaration Checkbox (Point 44): I hereby declare that all 46 points of information provided during child registration are true, complete, and verified by parent/guardian consent.
            </label>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div>
          {regStep > 1 && (
            <Button variant="outline" type="button" onClick={() => setRegStep(s => s - 1)}>
              Previous Step
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => { setIsAddOpen(false); setRegStep(1); }}>
            Cancel
          </Button>
          {regStep < 5 ? (
            <Button type="button" onClick={() => setRegStep(s => s + 1)}>
              Next Step
            </Button>
          ) : (
            <Button type="submit">
              Log Child Master Registration
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
