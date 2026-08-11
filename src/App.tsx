import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProgrammeSwitcher } from './components/ProgrammeSwitcher';

// RENU Pages
import Dashboard from './programmes/renu/pages/Dashboard';
import Camps from './programmes/renu/pages/Camps';
import Children from './programmes/renu/pages/Children';
import ChildProfile from './programmes/renu/pages/ChildProfile';
import FollowUps from './programmes/renu/pages/FollowUps';
import DiagnosisPage from './programmes/renu/pages/Diagnosis';
import TherapyCentres from './programmes/renu/pages/TherapyCentres';
import Sponsorships from './programmes/renu/pages/Sponsorships';
import Inventory from './programmes/renu/pages/Inventory';
import Coordinators from './programmes/renu/pages/Coordinators';
import Reports from './programmes/renu/pages/Reports';
import Analytics from './programmes/renu/pages/Analytics';
import SchoolAdmissions from './programmes/renu/pages/SchoolAdmissions';
import HomeVisits from './programmes/renu/pages/HomeVisits';
import MedicalDatabase from './programmes/renu/pages/MedicalDatabase';
// Shared Pages
import Settings from './shared/pages/Settings';

// Dummy Pages for Awards and Road Safety (to show routing works)
const DummyPage = ({ title }: { title: string }) => <div className="p-8 text-2xl font-bold">{title}</div>;

import AwardsDashboard from './programmes/awards/pages/Dashboard';
import AwardsEvents from './programmes/awards/pages/Events';
import AwardsNominees from './programmes/awards/pages/Nominees';
import AwardsNomineeProfile from './programmes/awards/pages/NomineeProfile';
import AwardsCeremony from './programmes/awards/pages/Ceremony';
import AwardsAwardees from './programmes/awards/pages/Awardees';
import AwardsReports from './programmes/awards/pages/Reports';

// Road Safety
import RSDashboard from './programmes/roadsafety/pages/Dashboard';
import RSWorkshops from './programmes/roadsafety/pages/Workshops';
import RSInstitutions from './programmes/roadsafety/pages/Institutions';
import RSCollaborations from './programmes/roadsafety/pages/Collaborations';
import RSParticipants from './programmes/roadsafety/pages/Participants';
import RSProgrammeReach from './programmes/roadsafety/pages/ProgrammeReachDatabase';
import RSReports from './programmes/roadsafety/pages/Reports';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Root Route: Programme Switcher */}
        <Route path="/" element={<ProgrammeSwitcher />} />

        {/* Programme Portals */}
        <Route element={<DashboardLayout />}>
          
          {/* RENU Module */}
          <Route path="/renu" element={<Dashboard />} />
          <Route path="/renu/camps" element={<Camps />} />
          <Route path="/renu/children" element={<Children />} />
          <Route path="/renu/children/:id" element={<ChildProfile />} />
          <Route path="/renu/follow-ups" element={<FollowUps />} />
          <Route path="/renu/diagnosis" element={<DiagnosisPage />} />
          <Route path="/renu/therapy-centres" element={<TherapyCentres />} />
          <Route path="/renu/sponsorships" element={<Sponsorships />} />
          <Route path="/renu/inventory" element={<Inventory />} />
          <Route path="/renu/coordinators" element={<Coordinators />} />
          <Route path="/renu/reports" element={<Reports />} />
          <Route path="/renu/analytics" element={<Analytics />} />
          <Route path="/renu/school-admissions" element={<SchoolAdmissions />} />
          <Route path="/renu/home-visits" element={<HomeVisits />} />
          <Route path="/renu/medical-database" element={<MedicalDatabase />} />
          {/* Shared Pages (RENU Portal) */}
          <Route path="/renu/settings" element={<Settings />} />

          {/* Awards Module (Phase 2) */}
          <Route path="/awards" element={<AwardsDashboard />} />
          <Route path="/awards/events" element={<AwardsEvents />} />
          <Route path="/awards/nominees" element={<AwardsNominees />} />
          <Route path="/awards/nominees/:id" element={<AwardsNomineeProfile />} />
          <Route path="/awards/ceremony" element={<AwardsCeremony />} />
          <Route path="/awards/awardees" element={<AwardsAwardees />} />
          <Route path="/awards/reports" element={<AwardsReports />} />
          
          {/* Shared Pages (Awards Portal) */}
          <Route path="/awards/settings" element={<Settings />} />
          <Route path="/awards/coordinators" element={<Coordinators />} />

          {/* Road Safety Module */}
          <Route path="/road-safety" element={<RSDashboard />} />
          <Route path="/road-safety/workshops" element={<RSWorkshops />} />
          <Route path="/road-safety/institutions" element={<RSInstitutions />} />
          <Route path="/road-safety/collaborations" element={<RSCollaborations />} />
          <Route path="/road-safety/participants" element={<RSParticipants />} />
          <Route path="/road-safety/programme-reach" element={<RSProgrammeReach />} />
          <Route path="/road-safety/reports" element={<RSReports />} />
          
          {/* Shared Pages (Road Safety Portal) */}
          <Route path="/road-safety/settings" element={<Settings />} />
          <Route path="/road-safety/coordinators" element={<Coordinators />} />

        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
