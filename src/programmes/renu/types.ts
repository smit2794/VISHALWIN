// ============================================================
// RENU Programme — TypeScript Types
// Updated to match client PDF specification (Sections A–Q)
// ============================================================

// ── Enums & Unions ───────────────────────────────────────────

export type ChildJourneyStatus =
  | 'Medical Camp'
  | 'Screening'
  | 'Child Classification'
  | 'Follow-Up'
  | 'Diagnosis'
  | 'Therapy Centre Enrollment'
  | 'Sponsorship Support'
  | 'Active Therapy'
  | 'Progress Tracking'
  | 'School Ready'
  | 'School Admission';

/** All 10 required disability categories per PDF spec */
export type DisabilityType =
  | 'Autism'
  | 'Intellectual Disability'
  | 'Cerebral Palsy'
  | 'ADHD'
  | 'Down Syndrome'
  | 'Learning Disability'
  | 'Hearing Impairment'
  | 'Visual Impairment'
  | 'Multiple Disability'
  | 'Others';

/** 4 severity levels including Profound per PDF spec */
export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe' | 'Profound';

export type UserRole = 'Admin' | 'Coordinator';

// ── Section A: Camp Management ────────────────────────────────

export type CampType =
  | 'Medical Screening & Assessment Camp'
  | 'Aids & Appliances Assessment & Distribution Camp';

export type CampCoverageArea = 'Village' | 'Taluka' | 'District' | 'Ward' | 'Zone';

export type CampVenueType =
  | 'School'
  | 'College'
  | 'Community Hall'
  | 'PHC-CHC-Urban Health Centre'
  | 'NGO'
  | 'Other';

export type CampCollaborationType =
  | 'CSR'
  | 'Venue Partner'
  | 'NGO'
  | 'Community'
  | 'Center'
  | 'Other';

/** 14 named medical roles + coordinator/volunteer per PDF spec section A.4 */
export type CampTeamRole =
  | 'Pediatrician'
  | 'Developmental Pediatrician'
  | 'Neurologist'
  | 'Psychiatrist'
  | 'Psychologist'
  | 'Occupational Therapist'
  | 'Speech Therapist'
  | 'Physiotherapist'
  | 'Audiologist'
  | 'Vision Expert'
  | 'Nutritionist'
  | 'Orthopedic Doctor'
  | 'Prosthetist & Orthotist'
  | 'Special Educator'
  | 'Coordinator'
  | 'Volunteer';

export interface CampTeamMember {
  id: string;
  role: CampTeamRole;
  name: string;
  organization?: string;
  mobile: string;
}

/** 13 camp document types per PDF spec section A.5 */
export type CampDocumentType =
  | 'Permission Letter'
  | 'Approval Letter'
  | 'Posters'
  | 'Banners'
  | 'Social Media Creative'
  | 'Registration Sheet'
  | 'Google Form'
  | 'Photos'
  | 'Videos'
  | 'Parents Feedback'
  | 'Press Coverage'
  | 'Media Link'
  | 'Other IEC Material';

export interface CampDocument {
  type: CampDocumentType;
  fileName?: string;
  mediaLink?: string;
}

export interface CampOrganizer {
  isCollaborated: boolean;
  collaborationType?: CampCollaborationType;
  instituteName?: string;
  instituteAddress?: string;
  repName?: string;
  repDesignation?: string;
  repContact?: string;
  repEmail?: string;
}

export interface CampFollowUpSection {
  ageBand?: '0-12' | '12-18' | '18+';
  isDisabilityID?: boolean;
  referralTherapy?: boolean;
  referralMedicalTreatment?: boolean;
  referralGovtScheme?: boolean;
  referralRenuAdmission?: boolean;
}

export interface CampIECMaterial {
  id: string;
  name: string;
  quantity: number;
  status: 'Ordered' | 'Ready' | 'Distributed';
  sampleFileName?: string;
}

export interface Camp {
  id: string;
  name: string;
  date: string;
  time?: string;
  duration?: string;
  location: string;
  address?: string;
  place?: string;
  area: string;
  city: string;
  coverageArea?: CampCoverageArea;
  venueType?: CampVenueType;
  campType?: CampType;
  coordinatorId: string;
  doctorName: string;
  therapistName: string;
  registeredCount: number;
  screenedCount?: number;
  maleScreenedCount?: number;
  femaleScreenedCount?: number;
  normalCount: number;
  specialCount: number;
  followUpsRequiredCount: number;
  organizer?: CampOrganizer;
  teamMembers?: CampTeamMember[];
  iecMaterials?: CampIECMaterial[];
  campDocuments?: CampDocument[];
  // Legacy document fields (kept for backwards compat)
  reportDocumentStatus?: string;
  photosDocumentStatus?: string;
  // New statistic uploads
  followUpSheetFileName?: string;
  expertsAssessmentFileName?: string;
  // Camp follow-up section
  campFollowUp?: CampFollowUpSection;
}

// ── Section B: Child Master Profile ───────────────────────────

export type RegistrationSource =
  | 'Medical Camp'
  | 'Helpline'
  | 'Field Visit'
  | 'NGO Request'
  | 'School'
  | 'Hospital'
  | 'Government'
  | 'Parent Walk-in'
  | 'Reference'
  | 'Other';

export type SocioEconomicStatus = 'Low' | 'Lower Middle' | 'Middle' | 'Upper';

export interface SiblingInfo {
  name: string;
  education?: string;
  age?: number;
  businessOrOccupation?: string;
}

export interface ParentDetails {
  name?: string;
  education?: string;
  occupation?: string;
  mobile?: string;
  isWhatsApp?: boolean;
}

export interface FamilyDetails {
  father?: ParentDetails;
  mother?: ParentDetails;
  guardian?: ParentDetails;
  annualIncome?: number;
  bplStatus?: boolean;
  rationCard?: boolean;
  familyMembersCount?: number;
  socioEconomicStatus?: SocioEconomicStatus;
  // Section B Extended Family Details (Points 32-38)
  siblings?: SiblingInfo[];
  otherChildDisability?: boolean;
  otherChildDisabilityDetails?: string;
  consanguineousMarriage?: boolean;
  interestedHouseholdMembers?: string;
  familyType?: 'Nuclear' | 'Joint' | 'Single Parent';
  connectedNGOsOrGroups?: string;
}

export interface EmergencyContact {
  name?: string;
  relation?: string;
  mobile?: string;
}

// ── Section E: RENU Programme Enrollment ─────────────────────

export type EnrollmentStatus =
  | 'Active'
  | 'Hold'
  | 'Completed'
  | 'Dropout'
  | 'Shifted'
  | 'Expired';

export interface EnrollmentDetails {
  admissionDate?: string;
  currentStatus?: EnrollmentStatus;
  assignedCoordinator?: string;
  annualRenewalDate?: string;
  admissionFormFileName?: string;
  consentFormFileName?: string;
  parentConsentFileName?: string;
  sponsorshipStatus?: string;
  reasonForExit?: string;
}

// ── Section D: Assessment ─────────────────────────────────────

/** All 9 assessment types per PDF spec section D */
export type AssessmentType =
  | 'Initial'
  | 'Developmental'
  | 'IQ'
  | 'Functional'
  | 'Behaviour'
  | 'Communication'
  | 'Motor'
  | 'Sensory Profile'
  | 'ADL';

export interface AssessmentRecord {
  id?: string;
  type: AssessmentType;
  date?: string;
  toolUsed?: string;
  score?: number;
  category?: string;
  finding?: string;
  conductedBy?: string;
  remarks?: string;
  reportFileName?: string;
  nextAssessmentDueDate?: string;
}

// ── Section F: Therapy Management ────────────────────────────

export type TherapyType =
  | 'Occupational Therapy'
  | 'Speech Therapy'
  | 'Behaviour Therapy'
  | 'Physiotherapy'
  | 'Special Education'
  | 'Early Intervention'
  | 'Parent Training'
  | 'Group Therapy'
  | 'ADL'
  | 'Life Skills';

export interface TherapyAssignment {
  id: string;
  therapyType: TherapyType;
  required: boolean;
  frequency?: string;
  sessionTime?: string;
  sessionDuration?: string;
}

export interface MonthlyAttendanceRecord {
  id: string;
  year: number;
  month: string;
  totalDaysSuggested: number;
  totalDaysAttended: number;
  totalDaysMissed: number;
  attendancePercentage: number; // auto-calculated: (attended/suggested)*100
  qualifiedForFinancialSupport: boolean;
  monthlyNote?: string;
}

export type TravelSupportSlab = '₹500' | '₹1000' | 'Other';

export interface TravelSupport {
  centerName?: string;
  distanceKm?: number;
  slab?: TravelSupportSlab;
  otherAmount?: number;
}

// ── Section G: IEP Management ─────────────────────────────────

export interface IEPGoal {
  goal: string;
  achieved: boolean;
  goalStatus?: string;
}

export interface IEPQuarterlyReview {
  date?: string;
  reviewedBy?: string;
  achievementPercent?: number;
  remarks?: string;
  goalStatus?: string;
  newGoals?: string;
}

export interface IEPRecord {
  baselineAssessment?: string;
  planPeriodFrom?: string;
  planPeriodTo?: string;
  shortTermGoals?: IEPGoal[];
  longTermGoals?: IEPGoal[];
  sixMonthGoals?: IEPGoal[];
  annualGoals?: IEPGoal[];
  quarterlyReviews?: IEPQuarterlyReview[];
  documentStatus?: string;
}

// ── Section H: Education / School Admission ───────────────────

export type EducationType =
  | 'Normal School'
  | 'Inclusive School'
  | 'Integrated School'
  | 'Home Schooling'
  | 'NIOS';

export interface SchoolAdmissionDetails {
  admissionDate?: string;
  schoolName?: string;
  schoolType?: EducationType;
  schoolAddress?: string;
  mediumOfInstruction?: 'English' | 'Hindi' | 'Gujarati' | 'Marathi' | 'Other';
  currentAcademicYear?: string;
  standard?: string;
  principalName?: string;
  principalContact?: string;
  educationCategory?: 'Inclusive Education' | 'Special School';
  transportSupportBusPass?: boolean;
  transportSupportAllowance?: number;
  attendancePercent?: number;
  teacherFeedback?: string;
  reportCards?: { year: string; grade: string; remarks: string; fileName?: string }[];
  admissionStatus?: 'Identified' | 'Applied' | 'Confirmed' | 'Cancelled';
  educationSupportProvided?: ('Uniforms' | 'Textbooks' | 'Stationery' | 'Assistive Technology' | 'None')[];
  feesSponsored?: boolean;
  feesSponsoredAmount?: number;
  remarks?: string;
}

// ── Section I: Medical Records ────────────────────────────────

/** All 10 medical report types per PDF spec section I */
export type MedicalScanType =
  | 'MRI'
  | 'CT Scan'
  | 'EEG'
  | 'BERA'
  | 'Blood Report'
  | 'Genetic Test'
  | 'Hearing Test'
  | 'Vision Test'
  | 'Thyroid Report'
  | 'Vitamin Reports';

export interface MedicalRecordScan {
  id?: string;
  date?: string;
  type: MedicalScanType | string;
  finding?: string;
  centre?: string;
  doctor?: string;
  scanDocumentStatus?: string;
}

export interface PrescriptionRecord {
  id?: string;
  date?: string;
  doctorName?: string;
  hospitalName?: string;
  medicines?: string;
  notes?: string;
  prescriptionDocumentStatus?: string;
}

export interface ImmunisationRecord {
  id?: string;
  vaccineName?: string;
  dateGiven?: string;
  nextDueDate?: string;
}

export interface MedicalRecords {
  scans?: MedicalRecordScan[];
  prescriptions?: PrescriptionRecord[];
  immunisations?: ImmunisationRecord[];
}

// ── Section J: Government Benefits ───────────────────────────

export type GovtBenefitStatus = 'Applied' | 'Approved' | 'Rejected';

export interface GovtBenefit {
  status?: GovtBenefitStatus;
  renewalDate?: string;
  remarks?: string;
  fileName?: string;
  amount?: number;
  schemeName?: string;
  issueDate?: string;
}

export interface GovtBenefits {
  disabilityCertificate?: GovtBenefit;
  udidCard?: GovtBenefit;
  niramayaInsurance?: GovtBenefit;
  disabilityPension?: GovtBenefit;
  busPass?: GovtBenefit;
  railwayPass?: GovtBenefit;
  ayushmanCard?: GovtBenefit;
  pmjay?: GovtBenefit;
  sadhanSahay?: GovtBenefit;
  tlmKit?: GovtBenefit;
  scholarship?: GovtBenefit;
  hostel?: GovtBenefit;
  caregiverAllowance?: GovtBenefit;
}

// ── Section K: Financial Support ─────────────────────────────

export type FinancialSupportType =
  | 'Therapy'
  | 'Education'
  | 'Medicine'
  | 'Travel'
  | 'Assistive Device';

export type FinancialFundingSource =
  | 'Vishalwin'
  | 'CSR'
  | 'Donor'
  | 'Parent'
  | 'Government'
  | 'Crowd Funding';

export interface FinancialSupport {
  supportType?: FinancialSupportType;
  fundingSource?: FinancialFundingSource;
  amountSanctioned?: number;
  amountReceived?: number;
  approvalStatus?: 'Pending' | 'Approved' | 'Sanctioned' | 'Rejected';
  donorName?: string;
  contactPerson?: string;
  contactMobile?: string;
  grantPeriodStart?: string;
  grantPeriodEnd?: string;
  utilization?: string;
  billsFileName?: string;
  grantLetterFileName?: string;
  receiptFileName?: string;
  documentStatus?: string;
}

// ── Section L: Assistive Devices ─────────────────────────────

export type AssistiveDeviceType =
  | 'Wheelchair'
  | 'Hearing Aid'
  | 'Crutches'
  | 'Communication Device'
  | 'Spectacles'
  | 'Other';

export interface AssistiveDevice {
  id?: string;
  deviceType?: AssistiveDeviceType | string;
  brandModel?: string;
  issuedDate?: string;
  warrantyUntil?: string;
  issuedBy?: string;
  photoStatus?: string;
}

// ── Section M: Child Development Milestones ───────────────────

export type MilestoneDomain =
  | 'Early Intervention'
  | 'Inclusive Education'
  | 'Independent Living Skills'
  | 'Communication'
  | 'Self Care'
  | 'Behaviour'
  | 'Social Skills'
  | 'Vocational Training'
  | 'School Readiness'
  | 'School Admission'
  | 'Employment';

export type MilestoneProgress = 'Not Started' | 'In Progress' | 'Achieved' | 'Needs Improvement';

export interface DevelopmentalMilestone {
  id?: string;
  domain: MilestoneDomain;
  progress: MilestoneProgress;
  remarks?: string;
  lastUpdated?: string;
}

// ── Section N: Parent Support ─────────────────────────────────

export type ParentSupportActivityType =
  | 'Counselling'
  | 'Training'
  | 'Workshop'
  | 'Expert Session'
  | 'Support Group'
  | 'Follow-up Parents';

export interface ParentSupportRecord {
  id: string;
  activityType: ParentSupportActivityType;
  date?: string;
  staffName?: string;
  topicOrPurpose?: string;
  notes?: string;
  nextSessionDate?: string;
}

export interface ParentSupport {
  activities?: ParentSupportRecord[];
  feedbackNotes?: string;
  audioFeedbackFileName?: string;
  videoFeedbackFileName?: string;
  consentStatus?: boolean;
  consentFileName?: string;
}

// ── Section O: Home Visit ─────────────────────────────────────

export type HomeEnvironmentRating = 'Positive' | 'Negative' | 'Scope to Improve';

export interface HomeVisitRecord {
  id?: string;
  date?: string;
  staffName?: string;
  observations?: string;
  environmentRating?: HomeEnvironmentRating;
  parentCounsellingDone?: boolean;
  recommendations?: string;
  nextVisitDate?: string;
  photoFileName?: string;
  gpsLocation?: string;
  // Legacy support
  type?: 'Counselling' | 'Home Visit';
  topicOrObservations?: string;
  notesOrRecommendations?: string;
  rating?: number;
  nextDate?: string;
}

// ── Section P: Volunteer & Field Visit ───────────────────────

export interface VolunteerVisit {
  id: string;
  volunteerName: string;
  visitDate: string;
  purpose: string;
  observation: string;
  outcome: string;
}

// ── Section Q: Stakeholder Database ──────────────────────────

export type StakeholderCategory =
  | 'Medical Experts'
  | 'Therapy Centres'
  | 'Special Schools'
  | 'NGOs'
  | 'Hospitals'
  | 'Government Departments'
  | 'CSR Partners'
  | 'Donors'
  | 'Volunteers'
  | 'Store';

export interface Stakeholder {
  id: string;
  category: StakeholderCategory;
  name: string;
  contactPerson?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  mouFileName?: string;
  agreementFileName?: string;
  photosFileName?: string;
  documentsFileName?: string;
  notes?: string;
  isActive?: boolean;
}

// ── Main Child Interface ──────────────────────────────────────

export interface MockDocument {
  id: string;
  type: 'Medical Report' | 'Assessment Report' | 'Disability Certificate' | 'Therapy Recommendation';
  name: string;
  date: string;
  fileSize?: string;
}

export interface Child {
  id: string;
  name: string;
  // Section B Demographics & Physical (Points 8-14, 18, 19, 22-27, 39, 44, 46)
  photo?: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  udidNo?: string;
  bloodGroup?: string;
  religion?: string;
  district?: string;
  registrationSource?: RegistrationSource;
  motherTongue?: string;
  languageSpokenAtHome?: string;
  weightKg?: number;
  heightCm?: number;
  identificationMark?: string;
  childConditionDescription?: string;
  // Legacy single fields (kept for backwards compat)
  fatherName: string;
  motherName: string;
  guardianName?: string;
  // Structured family details (Section B)
  familyDetails?: FamilyDetails;
  mobile: string;
  alternateMobile?: string;
  emergencyContact?: EmergencyContact;
  address: string;
  area: string;
  city: string;
  pincode?: string;
  schoolName?: string;
  currentStandard?: string;
  isNotEnrolled?: boolean;
  // Section B Schooling History (Point 19)
  lastSchoolAttended?: string;
  reasonForDropout?: string;
  // Classification & Disability
  classification: 'Normal' | 'Special';
  disabilityType?: DisabilityType;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  coMorbidities?: string;
  severity?: SeverityLevel;
  // Section B Medical & Therapy Checks (Points 18, 22, 23, 24, 26, 27)
  hasEpilepsyAttacks?: boolean;
  epilepsySinceWhen?: string;
  karyotypingTestDone?: boolean;
  karyotypingTestCentre?: string;
  otherMedicalIssuesNotes?: string;
  medicalCheckupDone?: boolean;
  medicalCheckupDate?: string;
  isToiletTrained?: 'Yes' | 'No' | 'Partial';
  specialFootwearSuggested?: boolean;
  specialFootwearProcured?: boolean;
  // Journey
  journeyStatus: ChildJourneyStatus;
  registeredDate: string;
  registrationPlace?: string;
  campId?: string;
  // Required & Special Documents (Section B Points 15, 16, 17, 42, 43)
  birthCertificateFileName?: string;
  aadhaarCardFileName?: string;
  disabilityCertificatesFileName?: string;
  healthExpertsReportFileName?: string;
  psychiatristReportFileName?: string;
  psychologicalReportFileName?: string;
  // Section B Special Notes & Declaration (Points 39, 44)
  specialNotes?: string;
  verificationDeclarationChecked?: boolean;
  // Legacy documents
  documents?: MockDocument[];
  certificateAvailable?: boolean;
  // Section E: Enrollment
  enrollmentDetails?: EnrollmentDetails;
  // Section F: Therapy Management
  therapyAssignments?: TherapyAssignment[];
  monthlyAttendanceRecords?: MonthlyAttendanceRecord[];
  travelSupport?: TravelSupport;
  // Section D: Assessment
  assessments?: AssessmentRecord[];
  assessmentReportStatus?: string;
  // Section I: Medical Records
  medicalRecords?: MedicalRecords;
  // Section G: IEP
  iepRecords?: IEPRecord;
  // Section M: Milestones
  developmentalMilestones?: DevelopmentalMilestone[];
  // Section K: Financial Support
  financialSupport?: FinancialSupport;
  // Section L: Assistive Devices
  assistiveDevices?: AssistiveDevice[];
  // Section N: Parent Support
  parentSupport?: ParentSupport;
  // Section O: Home Visit records (per-child)
  homeVisitRecords?: HomeVisitRecord[];
  // Section P: Volunteer & Field Visit records
  volunteerVisits?: VolunteerVisit[];
  // Section J: Government Benefits (structured)
  govtBenefits?: GovtBenefits;
  // Legacy govt benefit fields (kept for backwards compat)
  udidCardStatus?: 'Applied' | 'Pending' | 'Received' | 'Expired';
  udidCardRemarks?: string;
  udidCardFileName?: string;
  niramayaStatus?: 'Active' | 'Pending' | 'Expired';
  niramayaExpiry?: string;
  niramayaFileName?: string;
  disabilityPensionStatus?: 'Applied' | 'Approved' | 'Not Applicable';
  disabilityPensionAmount?: number;
  busPassStatus?: 'Issued' | 'Not Issued';
  busPassIssueDate?: string;
  scholarshipStatus?: 'Applied' | 'Approved' | 'Not Applicable';
  scholarshipAmount?: number;
  scholarshipScheme?: string;
  // Legacy therapy/school/progress
  therapyProgressScore?: number;
  attendanceStatus?: 'Present' | 'Absent' | 'Pending';
  progressHistory?: { date: string; score: number; notes: string }[];
  schoolAdmission?: SchoolAdmissionDetails;
  therapyProgress?: TherapyProgressDetails;
}

// ── Follow-Up ─────────────────────────────────────────────────

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
  status: 'Pending' | 'Completed';
  coordinatorId: string;
  coordinatorName?: string;
  communicationType?: 'Call' | 'Meeting' | 'Home Visit';
  actionItems?: string;
  nextFollowUpPlan?: string;
}

// ── Diagnosis ─────────────────────────────────────────────────

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
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  coMorbidities?: string;
  referringDoctor?: {
    name: string;
    hospital: string;
    mobile: string;
  };
  disabilityCertificate?: {
    status: 'Applied' | 'Received' | 'Expired';
    expiryDate: string;
    fileName: string;
  };
  diagnosisReportFileName?: string;
}

// ── Therapy Centre (directory) ────────────────────────────────

export interface TherapyProgressDetails {
  therapyType: 'Special Education' | 'Speech Therapy' | 'Occupational Therapy' | 'Physiotherapy' | 'Counselling';
  assignedTherapist: string;
  sessionsCompleted: number;
  sessionsRemaining: number;
  progressScore: number;
  therapistRemarks: string;
}

export interface TherapyCentre {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  services: ('Special Education' | 'Speech Therapy' | 'Occupational Therapy' | 'Physiotherapy' | 'Counselling')[];
  enrollmentDate?: string;
  assignedTherapist?: string;
  sponsorshipRequired?: boolean;
}

// ── Sponsorship ───────────────────────────────────────────────

export interface Sponsorship {
  id: string;
  sponsorName: string;
  amount: number;
  startDate: string;
  endDate: string;
  coverage: ('Therapy Fees' | 'Education Support' | 'Assessment Cost' | 'Transportation Support')[];
  status: 'Active' | 'Pending' | 'Completed';
  childId?: string;
  childName?: string;
}

// ── Inventory ─────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medical Items' | 'Educational Material' | 'Support Equipment';
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
  category: 'Medical Items' | 'Educational Material' | 'Support Equipment';
  campId: string;
  campName: string;
  quantityDistributed: number;
  distributionDate: string;
  remainingStockAfter: number;
}

// ── Coordinator ───────────────────────────────────────────────

export interface CoordinatorActivity {
  id: string;
  coordinatorId: string;
  type: 'Registration' | 'Assessment' | 'Follow-Up' | 'Document' | 'Progress' | 'Attendance';
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
