import { AwardEvent, Nominee, Awardee } from '../types';

export interface AwardsStoreState {
  events: AwardEvent[];
  nominees: Nominee[];
  awardees: Awardee[];
}

const defaultState: AwardsStoreState = {
  events: [
    {
      id: 'EVT-2026-01',
      name: 'Guardian Angel Awards 2026',
      year: '2026',
      date: '2026-12-15',
      time: '18:00',
      venue: 'Town Hall',
      address: '123 Main St',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'Selection in Progress',
      categories: [
        {
          id: 'CAT-01',
          name: 'Best Special Educator',
          description: 'Recognizing outstanding contribution in special education.',
          eligibility: 'Minimum 5 years of experience in special education.',
          nominationCount: 15,
          selectedCount: 2
        },
        {
          id: 'CAT-02',
          name: 'Outstanding Caregiver',
          description: 'Recognizing parents and caregivers for their dedication.',
          eligibility: 'Parent or primary caregiver of a child with special needs.',
          nominationCount: 23,
          selectedCount: 0
        }
      ]
    }
  ],
  nominees: [
    {
      id: 'NOM-2026-001',
      dateOfNomination: '2026-05-10',
      awardYear: '2026',
      awardCategory: 'CAT-01',
      nominationStatus: 'Shortlisted',
      fullName: 'Anita Desai',
      photograph: 'https://i.pravatar.cc/150?u=anita',
      gender: 'Female',
      mobile: '9876543210',
      email: 'anita.desai@example.com',
      address: '45 Green Park',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      nomineeType: 'Professional',
      organisationName: 'Sunrise Special School',
      designation: 'Senior Special Educator',
      areaOfWork: 'Autism Spectrum',
      yearsOfExperience: 8,
      currentCityOfService: 'Pune',
      source: 'Organisation',
      nominator: {
        name: 'Dr. Ramesh Kumar',
        organisation: 'Sunrise Special School',
        designation: 'Principal',
        mobile: '9988776655',
        email: 'principal@sunrise.edu',
        relationship: 'Employer'
      },
      achievement: {
        awardCategory: 'CAT-01',
        description: 'Developed an innovative sensory integration program that helped over 50 children improve daily living skills.',
        workForSpecialNeeds: 'Consistent work in autism therapy and parent counseling.',
        yearsOfContribution: 8,
        beneficiariesSupported: 200,
        remarks: 'Highly recommended by parents and peers.'
      },
      documents: [
        {
          id: 'DOC-1',
          category: 'Profile/Bio',
          format: 'Document',
          url: '#',
          title: 'Anita_Desai_Bio.pdf'
        }
      ],
      verificationSelection: {
        verificationStatus: 'Verified',
        verifiedBy: 'Admin',
        verificationDate: '2026-05-20',
        verificationRemarks: 'All documents verified and found authentic.',
        selectionStatus: 'Selected',
        selectionRemarks: 'Strong candidate for the final award.',
        finalAwardCategory: 'CAT-01',
        selectionDate: '2026-06-01'
      }
    }
  ],
  awardees: []
};

class AwardsStore {
  private readonly STORAGE_KEY = 'vishalwin_awards';

  private getState(): AwardsStoreState {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : defaultState;
  }

  private saveState(state: AwardsStoreState) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('awards_data_updated'));
  }

  // Generic getter
  public get data(): AwardsStoreState {
    return this.getState();
  }

  // Initialization
  public initialize() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveState(defaultState);
    }
  }

  // Add more methods here as needed for CRUD operations (similar to RenuStore)
}

export const awardsStore = new AwardsStore();
awardsStore.initialize();
