import React, { useState, useEffect } from 'react';
import { roadSafetyStore } from '../data/roadSafetyStore';
import { Card, Button, Select } from '../../../components/ui';
import { Printer } from 'lucide-react';

export const Reports: React.FC = () => {
  const [data, setData] = useState(roadSafetyStore.data);
  const [reportType, setReportType] = useState('summary');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const handleStorageChange = () => setData(roadSafetyStore.data);
    window.addEventListener('roadsafety_data_updated', handleStorageChange);
    return () => window.removeEventListener('roadsafety_data_updated', handleStorageChange);
  }, []);

  const handlePrint = () => window.print();

  const filteredWorkshops = data.workshops.filter(w => {
    if (fromDate && w.date < fromDate) return false;
    if (toDate && w.date > toDate) return false;
    return true;
  });

  const filteredParticipants = data.participants.filter(p => {
    const ws = data.workshops.find(w => w.id === p.workshopId);
    if (!ws) return true;
    if (fromDate && ws.date < fromDate) return false;
    if (toDate && ws.date > toDate) return false;
    return true;
  });

  const cityStatsMap = new Map<string, { city: string; totalWorkshops: number; totalParticipants: number }>();
  filteredWorkshops.forEach(w => {
    const city = w.city || 'Unknown';
    if (!cityStatsMap.has(city)) {
      cityStatsMap.set(city, { city, totalWorkshops: 0, totalParticipants: 0 });
    }
    const stats = cityStatsMap.get(city)!;
    stats.totalWorkshops += 1;
    stats.totalParticipants += (w.outcome?.actualParticipants || 0);
  });
  const cityStatsList = Array.from(cityStatsMap.values()).sort((a, b) => b.totalParticipants - a.totalParticipants);

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Road Safety Reports</h1>
            <p className="text-sm text-slate-500">Generate print-ready reports</p>
          </div>
          <Button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Report Type</label>
              <Select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { label: 'Programme Summary', value: 'summary' },
                  { label: 'Workshops Log', value: 'workshops' },
                  { label: 'Institutions Covered', value: 'institutions' },
                  { label: 'Participant-wise Report', value: 'participants' },
                  { label: 'Collaboration Summary', value: 'collaborations' },
                  { label: 'City-wise Reach', value: 'city' }
                ]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          </div>
        </Card>
      </div>

      <div id="printable-report" className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm min-h-[500px]">
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img src="/vishal-logo.png" alt="Logo" className="h-12 w-auto" />
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900 uppercase tracking-tight">Vishalwin Foundation</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Road Safety Programme Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Generated On</p>
            <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {reportType === 'summary' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">Programme Summary</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Workshops</p>
                <p className="text-2xl font-black text-slate-900">{filteredWorkshops.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Institutions</p>
                <p className="text-2xl font-black text-slate-900">{data.institutions.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Participants</p>
                <p className="text-2xl font-black text-slate-900">{filteredParticipants.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200 border-b-4 border-b-amber-500">
                <p className="text-xs font-bold text-amber-600 uppercase mb-2">Pledges Signed</p>
                <p className="text-2xl font-black text-slate-900">{filteredParticipants.filter(p => p.pledgeSigned).length}</p>
              </div>
            </div>
          </div>
        )}

        {reportType === 'workshops' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">Workshops Log</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Title & Date</th>
                  <th className="border border-slate-300 p-2 text-left">Location</th>
                  <th className="border border-slate-300 p-2 text-left">Audience</th>
                  <th className="border border-slate-300 p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkshops.map(w => (
                  <tr key={w.id}>
                    <td className="border border-slate-300 p-2"><div className="font-bold">{w.title}</div><div className="text-xs text-slate-500">{w.date}</div></td>
                    <td className="border border-slate-300 p-2">{w.venue}, {w.city}</td>
                    <td className="border border-slate-300 p-2">{w.targetAudience}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold">{w.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'institutions' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">Institutions Covered</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Institution Name</th>
                  <th className="border border-slate-300 p-2 text-left">Type</th>
                  <th className="border border-slate-300 p-2 text-left">City</th>
                  <th className="border border-slate-300 p-2 text-left">Contact</th>
                </tr>
              </thead>
              <tbody>
                {data.institutions.map(i => (
                  <tr key={i.id}>
                    <td className="border border-slate-300 p-2 font-bold">{i.name}</td>
                    <td className="border border-slate-300 p-2">{i.type}</td>
                    <td className="border border-slate-300 p-2">{i.city}</td>
                    <td className="border border-slate-300 p-2">{i.contactPersonName} <br/><span className="text-xs text-slate-500">{i.contactPersonMobile}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'participants' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">Participant-wise Report</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Participant Name</th>
                  <th className="border border-slate-300 p-2 text-left">Workshop</th>
                  <th className="border border-slate-300 p-2 text-center">Pledge Signed</th>
                  <th className="border border-slate-300 p-2 text-center">Feedback Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map(p => {
                  const ws = data.workshops.find(w => w.id === p.workshopId);
                  const rating = (p as any).feedbackDetails?.rating;
                  return (
                    <tr key={p.id}>
                      <td className="border border-slate-300 p-2 font-bold">{p.name}</td>
                      <td className="border border-slate-300 p-2 text-xs">{ws?.title || 'Unknown'}</td>
                      <td className="border border-slate-300 p-2 text-center">{p.pledgeSigned ? 'Yes' : 'No'}</td>
                      <td className="border border-slate-300 p-2 text-center">{rating ? `${rating} / 5` : 'N/A'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'collaborations' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">Collaboration Summary</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Partner Name</th>
                  <th className="border border-slate-300 p-2 text-left">Type</th>
                  <th className="border border-slate-300 p-2 text-center">MOU Status</th>
                  <th className="border border-slate-300 p-2 text-center">Activities Count</th>
                </tr>
              </thead>
              <tbody>
                {data.collaborations.map(c => (
                  <tr key={c.id}>
                    <td className="border border-slate-300 p-2 font-bold">{c.partnerName}</td>
                    <td className="border border-slate-300 p-2">{c.type}</td>
                    <td className="border border-slate-300 p-2 text-center">{c.mouSigned ? 'Signed' : 'Not Signed'}</td>
                    <td className="border border-slate-300 p-2 text-center">{c.activities?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'city' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">City-wise Reach</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">City</th>
                  <th className="border border-slate-300 p-2 text-center">Workshops Hosted</th>
                  <th className="border border-slate-300 p-2 text-center">Total Participants</th>
                </tr>
              </thead>
              <tbody>
                {cityStatsList.map((c, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-2 font-bold">{c.city}</td>
                    <td className="border border-slate-300 p-2 text-center">{c.totalWorkshops}</td>
                    <td className="border border-slate-300 p-2 text-center">{c.totalParticipants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
