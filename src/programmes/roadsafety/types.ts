export type WorkshopStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type InstitutionType = 'School' | 'College' | 'Corporate' | 'Community' | 'Other';
export type TargetAudience = 'Students' | 'Drivers' | 'General Public' | 'Corporate Employees' | 'Other';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  address: string;
  city: string;
  district: string;
  state: string;
  contactPersonName: string;
  contactPersonMobile: string;
  contactPersonEmail: string;
  totalWorkshopsConducted: number;
  mouStatus?: 'Signed' | 'Not Signed' | 'Under Discussion';
  mouDocStatus?: string;
}

export interface Participant {
  id: string;
  workshopId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email?: string;
  profession?: string;
  feedback?: string;
  feedbackDetails?: {
    rating: number;
    keyTakeaway: string;
    suggestions: string;
  };
  pledgeSigned: boolean;
}

export interface WorkshopOutcome {
  actualParticipants: number;
  institutionsCovered: string[]; // IDs of institutions
  awarenessTopicsCovered: string[];
  partnerOrganisations: string[];
  keyOutcome: string;
  followUpRequired: boolean;
  followUpRemarks?: string;
}

export interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state: string;
  status: WorkshopStatus;
  targetAudience: TargetAudience;
  expectedParticipants: number;
  primaryCoordinatorId: string;
  supportCoordinators: string[];
  trainer?: string;
  sessions?: { id: string; name: string; duration: string; facilitator: string; keyPoints: string; }[];
  iecMaterials?: { id: string; type: string; quantity: number; uploadStatus: string; }[];
  mediaCoverage?: { newsCoverage: boolean; mediaOutletName: string; link: string; };
  outcome?: WorkshopOutcome;
}

export interface Collaboration {
  id: string;
  partnerName: string;
  type: 'Traffic Police' | 'NGO' | 'Corporate' | 'Govt Department' | 'Other';
  contactPerson: string;
  mobile: string;
  email: string;
  mouSigned: boolean;
  mouDate?: string;
  activeStatus: 'Active' | 'Inactive';
  supportProvided: string; // e.g., 'Volunteers, Venue, Expertise'
  mouDocStatus?: string;
  activities?: { id: string; name: string; date: string; description: string; }[];
}
