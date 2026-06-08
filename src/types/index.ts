export type ChildJourneyStatus =
 |'Medical Camp'
 |'Screening'
 |'Child Classification'
 |'Follow-Up'
 |'Diagnosis'
 |'Therapy Centre Enrollment'
 |'Sponsorship Support'
 |'Active Therapy'
 |'Progress Tracking'
 |'School Ready'
 |'School Admission';

export type DisabilityType =
 |'Autism'
 |'Down Syndrome'
 |'ADHD'
 |'Intellectual Disability'
 |'Speech Delay'
 |'Development Delay'
 |'Learning Disability'
 |'Other';

export type SeverityLevel ='Mild'|'Moderate'|'Severe';

export interface MockDocument {
 id: string;
 type:'Medical Report'|'Assessment Report'|'Disability Certificate'|'Therapy Recommendation';
 name: string;
 date: string;
 fileSize?: string;
}

export interface SchoolAdmissionDetails {
 admissionDate?: string;
 schoolName?: string;
 schoolType?:'Government'|'Private'|'Inclusive'|'Special School'|'Other';
 standard?: string;
 admissionStatus?:'Identified'|'Applied'|'Confirmed'|'Cancelled';
 educationSupportProvided?: ('Uniforms'|'Textbooks'|'Stationery'|'Assistive Technology'|'None')[];
 feesSponsored?: boolean;
 feesSponsoredAmount?: number;
 remarks?: string;
}

export interface TherapyProgressDetails {
 therapyType:'Special Education'|'Speech Therapy'|'Occupational Therapy'|'Physiotherapy'|'Counselling';
 assignedTherapist: string;
 sessionsCompleted: number;
 sessionsRemaining: number;
 progressScore: number; // 0 to 100
 therapistRemarks: string;
}

export interface Child {
 id: string;
 name: string;
 photo: string;
 dob: string;
 age: number;
 gender:'Male'|'Female'|'Other';
 fatherName: string;
 motherName: string;
 guardianName?: string;
 mobile: string;
 alternateMobile?: string;
 address: string;
 area: string;
 city: string;
 pincode: string;
 schoolName?: string;
 currentStandard?: string;
 isNotEnrolled: boolean;
 classification:'Normal'|'Special';
 disabilityType?: DisabilityType;
 severity?: SeverityLevel;
 journeyStatus: ChildJourneyStatus;
 registeredDate: string;
 campId?: string;
 
 // Refined / expanded requirements fields
 therapyProgressScore?: number; // 0 to 100
 documents?: MockDocument[];
 certificateAvailable?: boolean;

 // New V2 business models
 attendanceStatus?:'Present'|'Absent'|'Pending';
 progressHistory?: { date: string; score: number; notes: string }[];
 schoolAdmission?: SchoolAdmissionDetails;
 therapyProgress?: TherapyProgressDetails;
}

export interface Camp {
 id: string;
 name: string;
 date: string;
 location: string;
 area: string;
 city: string;
 coordinatorId: string;
 doctorName: string;
 therapistName: string;
 registeredCount: number;
 normalCount: number;
 specialCount: number;
 followUpsRequiredCount: number;
}

export interface FollowUp {
 id: string;
 childId: string;
 childName?: string;
 date: string;
 notes: string;
 parentDiscussion: string;
 progressUpdates: string;
 issuesIdentified: string;
 recommendations: string;
 nextFollowUpDate?: string;
 status:'Pending'|'Completed';
 coordinatorId: string;
 coordinatorName?: string;

 // V2 parent communication tracking
 communicationType?:'Call'|'Meeting'|'Home Visit';
 actionItems?: string;
 nextFollowUpPlan?: string;
}

export interface Diagnosis {
 id: string;
 childId: string;
 childName?: string;
 date: string;
 centreName: string;
 assessmentSummary: string;
 certificateAvailable: boolean;
 medicalReportUrl?: string;
 assessmentScore: number;
 outcome: string;
}

export interface TherapyCentre {
 id: string;
 name: string;
 address: string;
 contactPerson: string;
 contactNumber: string;
 services: ('Special Education'|'Speech Therapy'|'Occupational Therapy'|'Physiotherapy'|'Counselling')[];
 enrollmentDate?: string;
 assignedTherapist?: string;
 sponsorshipRequired: boolean;
}

export interface Sponsorship {
 id: string;
 sponsorName: string;
 amount: number;
 startDate: string;
 endDate: string;
 coverage: ('Therapy Fees'|'Education Support'|'Assessment Cost'|'Transportation Support')[];
 status:'Active'|'Pending'|'Completed';
 childId?: string; // Beneficiary child ID
 childName?: string;
}

export interface InventoryItem {
 id: string;
 name: string;
 category:'Medical Items'|'Educational Material'|'Support Equipment';
 availableQty: number;
 distributedQty: number;
 remainingQty: number;
 allocatedCampId?: string;
 allocatedCampName?: string;
}

export interface InventoryDistribution {
 id: string;
 itemId: string;
 itemName: string;
 category:'Medical Items'|'Educational Material'|'Support Equipment';
 campId: string;
 campName: string;
 quantityDistributed: number;
 distributionDate: string;
 remainingStockAfter: number;
}

export interface CoordinatorActivity {
 id: string;
 coordinatorId: string;
 type:'Registration'|'Assessment'|'Follow-Up'|'Document'|'Progress'|'Attendance';
 childName?: string;
 childId?: string;
 campName?: string;
 description: string;
 date: string;
}

export interface Coordinator {
 id: string;
 name: string;
 mobile: string;
 email: string;
 assignedArea: string;
 campsManagedCount: number;
 childrenRegisteredCount: number;
 followUpsCompletedCount: number;
 activeChildrenCount: number;
}

export type UserRole ='Admin'|'Coordinator';
