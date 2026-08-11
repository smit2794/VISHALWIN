import { Workshop, Institution, Participant, Collaboration } from '../types';

export interface RoadSafetyStoreState {
  workshops: Workshop[];
  institutions: Institution[];
  participants: Participant[];
  collaborations: Collaboration[];
}

const defaultState: RoadSafetyStoreState = {
  workshops: [
    {
      id: 'WS-2026-001',
      title: 'Safe Drive Saves Life - College Campaign',
      date: '2026-08-20',
      time: '10:00',
      venue: 'Fergusson College Auditorium',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'Completed',
      targetAudience: 'Students',
      expectedParticipants: 200,
      primaryCoordinatorId: 'COORD-001',
      supportCoordinators: [],
      outcome: {
        actualParticipants: 215,
        institutionsCovered: ['INST-001'],
        awarenessTopicsCovered: ['Helmet Safety', 'Drunk Driving', 'Speed Limits'],
        partnerOrganisations: ['Traffic Police Pune'],
        keyOutcome: 'High engagement, 200 pledge forms signed.',
        followUpRequired: false
      }
    }
  ],
  institutions: [
    {
      id: 'INST-001',
      name: 'Fergusson College',
      type: 'College',
      address: 'FC Road',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      contactPersonName: 'Dr. Anita Joshi',
      contactPersonMobile: '9876543210',
      contactPersonEmail: 'principal@fc.edu',
      totalWorkshopsConducted: 1
    }
  ],
  participants: [
    {
      id: 'PAR-001',
      workshopId: 'WS-2026-001',
      name: 'Rahul Sharma',
      age: 20,
      gender: 'Male',
      mobile: '9988776655',
      pledgeSigned: true
    }
  ],
  collaborations: [
    {
      id: 'COL-001',
      partnerName: 'Pune Traffic Police',
      type: 'Traffic Police',
      contactPerson: 'Inspector Patil',
      mobile: '9123456789',
      email: 'traffic@punepolice.gov.in',
      mouSigned: true,
      mouDate: '2025-01-15',
      activeStatus: 'Active',
      supportProvided: 'Personnel for awareness talks and venue permissions.'
    }
  ]
};

class RoadSafetyStore {
  private readonly STORAGE_KEY = 'vishalwin_roadsafety';

  private getState(): RoadSafetyStoreState {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : defaultState;
  }

  private saveState(state: RoadSafetyStoreState) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('roadsafety_data_updated'));
  }

  public get data(): RoadSafetyStoreState {
    return this.getState();
  }

  public initialize() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveState(defaultState);
    }
  }
}

export const roadSafetyStore = new RoadSafetyStore();
roadSafetyStore.initialize();
