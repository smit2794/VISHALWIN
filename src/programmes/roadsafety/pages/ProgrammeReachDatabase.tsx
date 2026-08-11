import React, { useState, useEffect } from 'react';
import { roadSafetyStore } from '../data/roadSafetyStore';
import { Card } from '../../../components/ui';
import { Activity, Users, Building2, ShieldAlert, Printer, MapPin, Target } from 'lucide-react';

export const ProgrammeReachDatabase: React.FC = () => {
  const [data, setData] = useState(roadSafetyStore.data);

  useEffect(() => {
    const handleStorageChange = () => setData(roadSafetyStore.data);
    window.addEventListener('roadsafety_data_updated', handleStorageChange);
    return () => window.removeEventListener('roadsafety_data_updated', handleStorageChange);
  }, []);

  // Aggregated Foundation-Wide Metrics
  const totalWorkshops = data.workshops.length;
  const totalParticipantsReached = data.workshops.reduce((acc, curr) => acc + (curr.outcome?.actualParticipants || 0), 0);
  const totalUniqueInstitutionsCovered = new Set(
    data.workshops.flatMap(w => w.outcome?.institutionsCovered || [])
  ).size;

  // Aggregate stats per institution based on Workshop Outcomes
  // We need to map every unique institution ID found in any workshop outcome.
  // Then we calculate: total workshops they participated in, and the sum of participants in those workshops.
  
  const institutionStatsMap = new Map<string, { name: string; workshopsHosted: number; totalParticipants: number }>();
  
  data.workshops.forEach(w => {
    if (w.outcome) {
      w.outcome.institutionsCovered.forEach(instId => {
        // Find institution name
        const inst = data.institutions.find(i => i.id === instId);
        const name = inst ? inst.name : `Unknown (${instId})`;
        
        if (!institutionStatsMap.has(instId)) {
          institutionStatsMap.set(instId, { name, workshopsHosted: 0, totalParticipants: 0 });
        }
        const stats = institutionStatsMap.get(instId)!;
        stats.workshopsHosted += 1;
        stats.totalParticipants += (w.outcome?.actualParticipants || 0); // rough estimate: assigns workshop total to all involved institutions
      });
    }
  });

  const institutionStatsList = Array.from(institutionStatsMap.values());

  // Aggregate by City
  const cityStatsMap = new Map<string, { city: string; totalWorkshops: number; totalParticipants: number }>();
  data.workshops.forEach(w => {
    const city = w.city || 'Unknown';
    if (!cityStatsMap.has(city)) {
      cityStatsMap.set(city, { city, totalWorkshops: 0, totalParticipants: 0 });
    }
    const stats = cityStatsMap.get(city)!;
    stats.totalWorkshops += 1;
    stats.totalParticipants += (w.outcome?.actualParticipants || 0);
  });
  const cityStatsList = Array.from(cityStatsMap.values()).sort((a, b) => b.totalParticipants - a.totalParticipants);

  // Aggregate by Target Audience
  const audienceStatsMap = new Map<string, { audience: string; totalWorkshops: number; totalParticipants: number }>();
  data.workshops.forEach(w => {
    const aud = w.targetAudience || 'Unknown';
    if (!audienceStatsMap.has(aud)) {
      audienceStatsMap.set(aud, { audience: aud, totalWorkshops: 0, totalParticipants: 0 });
    }
    const stats = audienceStatsMap.get(aud)!;
    stats.totalWorkshops += 1;
    stats.totalParticipants += (w.outcome?.actualParticipants || 0);
  });
  const audienceStatsList = Array.from(audienceStatsMap.values()).sort((a, b) => b.totalParticipants - a.totalParticipants);

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          .no-print, nav, aside, header { display: none !important; }
          body { padding: 0 !important; margin: 0 !important; }
          .print-full { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Programme Reach Database</h1>
          <p className="text-sm text-slate-500">Foundation-wide continuous aggregation of Road Safety Programme reach</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold">
          <Printer className="h-4 w-4" /> Print Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Total Workshops</p>
            <h3 className="text-4xl font-display font-black text-blue-900">{totalWorkshops}</h3>
          </div>
        </Card>

        <Card className="p-6 bg-emerald-50 border-emerald-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Institutions Reached</p>
            <h3 className="text-4xl font-display font-black text-emerald-900">{totalUniqueInstitutionsCovered}</h3>
          </div>
        </Card>

        <Card className="p-6 bg-amber-50 border-amber-100 flex items-center gap-4">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">Total Participants</p>
            <h3 className="text-4xl font-display font-black text-amber-900">{totalParticipantsReached}</h3>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200 mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Activity className="h-5 w-5 text-slate-500" />
          <h3 className="text-lg font-bold text-slate-900">Institution Reach Aggregation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Institution Name</th>
                <th className="px-6 py-4 font-bold">Total Workshops Hosted</th>
                <th className="px-6 py-4 font-bold">Total Participants Reached</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {institutionStatsList.sort((a, b) => b.totalParticipants - a.totalParticipants).map((stats, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{stats.name}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{stats.workshopsHosted}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{stats.totalParticipants}</td>
                </tr>
              ))}
              {institutionStatsList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                    <p className="font-medium text-slate-600">No institutions have been reached yet.</p>
                    <p className="text-xs mt-1">Record a workshop outcome to update the reach database.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-0 overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-bold text-slate-900">City-wise Reach</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">City</th>
                  <th className="px-6 py-4 font-bold">Workshops</th>
                  <th className="px-6 py-4 font-bold">Participants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {cityStatsList.map((stats, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{stats.city}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">{stats.totalWorkshops}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">{stats.totalParticipants}</td>
                  </tr>
                ))}
                {cityStatsList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <Target className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-bold text-slate-900">Target Audience Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Audience Type</th>
                  <th className="px-6 py-4 font-bold">Workshops</th>
                  <th className="px-6 py-4 font-bold">Participants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {audienceStatsList.map((stats, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{stats.audience}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">{stats.totalWorkshops}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">{stats.totalParticipants}</td>
                  </tr>
                ))}
                {audienceStatsList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgrammeReachDatabase;
