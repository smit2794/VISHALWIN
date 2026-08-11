export type EventStatus = 'Planned' | 'Nomination Open' | 'Nomination Closed' | 'Selection in Progress' | 'Completed';
export type VerificationStatus = 'Pending' | 'Verified' | 'Clarification Required' | 'Rejected';
export type SelectionStatus = 'Under Review' | 'Shortlisted' | 'Selected' | 'Not Selected';
export type CertificateStatus = 'Pending' | 'Generated' | 'Issued';
export type NomineeType = 'Professional' | 'Caregiver';
export type NominationSource = 'Self Nomination' | 'Organisation' | 'Parent-Family' | 'Professional' | 'NGO' | 'VishalWin Foundation' | 'Other';
export type DocumentCategory = 'Profile/Bio' | 'Photograph' | 'Achievement Documents' | 'Certificates' | 'Supporting Letter' | 'Recommendation/Reference' | 'Work Photographs' | 'Media/News Reference' | 'Other';
export type FileFormat = 'PDF' | 'Image' | 'Document' | 'Link';

export type EventType = 'Annual' | 'Regional' | 'Special' | 'Inaugural';

export interface EventSession {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  speakerName: string;
}

export interface IECMaterial {
  id: string;
  type: 'Invitation Card' | 'Banner' | 'Brochure' | 'Backdrop' | 'Other';
  quantity: number;
  status: 'Pending' | 'Ordered' | 'Received' | 'Distributed';
  sampleFileName?: string;
}

export interface AwardCategory {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  nominationCount: number;
  selectedCount: number;
}

export interface AwardEvent {
  id: string;
  name: string;
  eventType?: EventType;
  year: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  status: EventStatus;
  categories: AwardCategory[];
  sessions?: EventSession[];
  iecMaterials?: IECMaterial[];
}

export interface NominatorDetails {
  name: string;
  organisation?: string;
  designation?: string;
  mobile: string;
  email?: string;
  relationship: string;
}

export interface AchievementDetails {
  awardCategory: string; // Refers to Category ID or Name
  description: string;
  workForSpecialNeeds: string;
  yearsOfContribution: number;
  beneficiariesSupported?: number;
  remarks?: string;
}

export interface SupportingDocument {
  id: string;
  category: DocumentCategory;
  format: FileFormat;
  url: string;
  title: string;
}

export interface VerificationSelection {
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationDate?: string;
  verificationRemarks?: string;
  selectionStatus: SelectionStatus;
  selectionRemarks?: string;
  finalAwardCategory?: string;
  selectionDate?: string;
}

export interface Nominee {
  id: string;
  dateOfNomination: string;
  awardYear: string;
  awardCategory: string; // Initially applied category
  nominationStatus: VerificationStatus | SelectionStatus; // Merged for dashboard ease, though usually tracked via verificationSelection block
  
  // Personal Details
  fullName: string;
  photograph: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;

  // Professional/Caregiver Details
  nomineeType: NomineeType;
  organisationName?: string;
  designation?: string;
  areaOfWork: string;
  yearsOfExperience: number;
  currentCityOfService: string;

  // Nomination Details
  source: NominationSource;
  nominator?: NominatorDetails;
  achievement: AchievementDetails;

  // Documents & Verification
  documents: SupportingDocument[];
  documentStatuses?: Record<string, string>;
  verificationSelection: VerificationSelection;
}

export interface AwardCeremonyRecord {
  awardeeId: string; // Links to final Awardee
  awardEventId: string;
  awardCategory: string;
  awardDate: string;
  venue: string;
  attendanceStatus: 'Present' | 'Absent';
  awardReceived: boolean;
  certificateStatus: CertificateStatus;
  certificateNumber?: string;
  recognitionDetails?: string;
  ceremonyPhotograph?: string;
  otherDocuments?: string[];
}

export interface Awardee {
  id: string;
  nomineeId: string;
  name: string;
  photograph: string;
  awardYear: string;
  category: string;
  professionRole: string;
  organisation?: string;
  city: string;
  state: string;
  contactDetails: string;
  contributionSummary: string;
  certificateNumber?: string;
  photographs: string[];
  futureEngagementNotes?: string;
  followUpStatus?: 'Not Started' | 'Contacted' | 'In Progress' | 'Completed';
  
  ceremonyRecord?: AwardCeremonyRecord;
}
