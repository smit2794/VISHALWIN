import React from'react';
import { HashRouter as Router, Routes, Route, Navigate } from'react-router-dom';
import DashboardLayout from'./layouts/DashboardLayout';
import Dashboard from'./pages/Dashboard';
import Camps from'./pages/Camps';
import Children from'./pages/Children';
import ChildProfile from'./pages/ChildProfile';
import FollowUps from'./pages/FollowUps';
import DiagnosisPage from'./pages/Diagnosis';
import TherapyCentres from'./pages/TherapyCentres';
import Sponsorships from'./pages/Sponsorships';
import Inventory from'./pages/Inventory';
import Coordinators from'./pages/Coordinators';
import Reports from'./pages/Reports';
import Analytics from'./pages/Analytics';
import Settings from'./pages/Settings';
import SchoolAdmissions from'./pages/SchoolAdmissions';

export const App: React.FC = () => {
 return (
 <Router>
 <Routes>
 <Route element={<DashboardLayout />}>
 {/* Main Modules */}
 <Route path="/"element={<Dashboard />} />
 <Route path="/camps"element={<Camps />} />
 <Route path="/children"element={<Children />} />
 <Route path="/children/:id"element={<ChildProfile />} />
 <Route path="/follow-ups"element={<FollowUps />} />
 <Route path="/diagnosis"element={<DiagnosisPage />} />
 <Route path="/therapy-centres"element={<TherapyCentres />} />
 <Route path="/sponsorships"element={<Sponsorships />} />
 <Route path="/inventory"element={<Inventory />} />
 <Route path="/coordinators"element={<Coordinators />} />
 <Route path="/reports"element={<Reports />} />
 <Route path="/analytics"element={<Analytics />} />
 <Route path="/settings"element={<Settings />} />
 <Route path="/school-admissions"element={<SchoolAdmissions />} />
 </Route>
 {/* Fallback route */}
 <Route path="*"element={<Navigate to="/"replace />} />
 </Routes>
 </Router>
 );
};

export default App;
