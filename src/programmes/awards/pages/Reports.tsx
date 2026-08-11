import React, { useState, useEffect } from 'react';
import { awardsStore } from '../data/awardsStore';
import { Nominee, Awardee, AwardEvent } from '../types';
import { Card, Button, Select } from '../../../components/ui';
import { Printer, Trophy, Users, Award } from 'lucide-react';

type ReportType = 'annual' | 'nominee' | 'awardee' | 'category' | 'selected' | 'hallOfFame' | 'attendance';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('annual');
  const [data, setData] = useState(awardsStore.data);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter selections
  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [selectedAwardeeId, setSelectedAwardeeId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const handleStorageChange = () => setData(awardsStore.data);
    window.addEventListener('awards_data_updated', handleStorageChange);
    return () => window.removeEventListener('awards_data_updated', handleStorageChange);
  }, []);

  useEffect(() => {
    if (data.nominees.length > 0 && !selectedNomineeId) {
      setSelectedNomineeId(data.nominees[0].id);
    }
    if (data.awardees.length > 0 && !selectedAwardeeId) {
      setSelectedAwardeeId(data.awardees[0].id);
    }
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  // Data helpers
  const years = Array.from(new Set(data.events.map(e => e.year))).sort((a, b) => b.localeCompare(a));
  if (!years.includes(selectedYear) && years.length > 0) setSelectedYear(years[0]);

  const yearEvents = data.events.filter(e => e.year === selectedYear);
  
  let yearNominees = data.nominees.filter(n => n.awardYear === selectedYear);
  if (dateFrom) yearNominees = yearNominees.filter(n => n.dateOfNomination >= dateFrom);
  if (dateTo) yearNominees = yearNominees.filter(n => n.dateOfNomination <= dateTo);

  let yearAwardees = data.awardees.filter(a => a.awardYear === selectedYear);
  if (dateFrom) yearAwardees = yearAwardees.filter(a => a.ceremonyRecord && a.ceremonyRecord.awardDate >= dateFrom);
  if (dateTo) yearAwardees = yearAwardees.filter(a => a.ceremonyRecord && a.ceremonyRecord.awardDate <= dateTo);

  const getNominee = () => data.nominees.find(n => n.id === selectedNomineeId);
  const getAwardee = () => data.awardees.find(a => a.id === selectedAwardeeId);

  return (
    <div className="space-y-6">
      {/* Print styles applied globally when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Controls Area (Hidden on Print) */}
      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Awards Reports</h1>
            <p className="text-sm text-slate-500">Generate print-ready reports for the Guardian Angel Awards</p>
          </div>
          <Button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Report Type</label>
              <Select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value as ReportType)}
                options={[
                  { label: 'Annual Summary Report', value: 'annual' },
                  { label: 'Selected Nominees', value: 'selected' },
                  { label: 'Category-wise Report', value: 'category' },
                  { label: 'Individual Nominee', value: 'nominee' },
                  { label: 'Individual Awardee', value: 'awardee' },
                  { label: 'Awardee Hall of Fame', value: 'hallOfFame' },
                  { label: 'Ceremony Attendance', value: 'attendance' }
                ]}
              />
            </div>
            
            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Award Year</label>
              <Select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years.length > 0 ? years.map(y => ({ label: y, value: y })) : [{ label: new Date().getFullYear().toString(), value: new Date().getFullYear().toString() }]}
              />
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">From Date</label>
              <input 
                type="date" 
                value={dateFrom} 
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">To Date</label>
              <input 
                type="date" 
                value={dateTo} 
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {reportType === 'nominee' && (
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Nominee</label>
                <Select 
                  value={selectedNomineeId} 
                  onChange={(e) => setSelectedNomineeId(e.target.value)}
                  options={data.nominees.map(n => ({ label: `${n.fullName} (${n.id})`, value: n.id }))}
                />
              </div>
            )}

            {reportType === 'awardee' && (
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Awardee</label>
                <Select 
                  value={selectedAwardeeId} 
                  onChange={(e) => setSelectedAwardeeId(e.target.value)}
                  options={data.awardees.map(a => ({ label: `${a.name} (${a.id})`, value: a.id }))}
                />
              </div>
            )}

            {reportType === 'category' && (
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Category</label>
                <Select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { label: 'All Categories', value: 'All' },
                    ...(yearEvents[0]?.categories.map(c => ({ label: c.name, value: c.name })) || [])
                  ]}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Printable Report Area */}
      <div id="printable-report" className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        
        {/* Universal Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img src="/vishal-logo.png" alt="Logo" className="h-12 w-auto" />
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900 uppercase tracking-tight">Vishalwin Foundation</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Guardian Angel Awards • {selectedYear}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Generated On</p>
            <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. Annual Summary Report */}
        {reportType === 'annual' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-display font-extrabold text-slate-900 mb-2">Annual Program Summary</h3>
              <p className="text-slate-500">Comprehensive overview of the Guardian Angel Awards for {selectedYear}</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Nominations</p>
                <p className="text-4xl font-black text-slate-900">{yearNominees.length}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Shortlisted</p>
                <p className="text-4xl font-black text-slate-900">{yearNominees.filter(n => n.verificationSelection.selectionStatus === 'Shortlisted').length}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200 border-b-4 border-b-amber-500">
                <p className="text-xs font-bold text-amber-600 uppercase mb-2">Total Awardees</p>
                <p className="text-4xl font-black text-slate-900">{yearAwardees.length}</p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Event Details</h4>
              {yearEvents.map(evt => (
                <div key={evt.id} className="mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="font-bold text-slate-600">Event Name:</span> {evt.name}</div>
                    <div><span className="font-bold text-slate-600">Date:</span> {evt.date}</div>
                    <div><span className="font-bold text-slate-600">Venue:</span> {evt.venue || 'N/A'}</div>
                    <div><span className="font-bold text-slate-600">Status:</span> {evt.status}</div>
                  </div>
                  
                  <div className="mt-4">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-2 text-left">Category</th>
                          <th className="border border-slate-300 p-2 text-center w-32">Nominations</th>
                          <th className="border border-slate-300 p-2 text-center w-32">Selected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evt.categories.map(cat => (
                          <tr key={cat.id}>
                            <td className="border border-slate-300 p-2 font-medium">{cat.name}</td>
                            <td className="border border-slate-300 p-2 text-center">{cat.nominationCount}</td>
                            <td className="border border-slate-300 p-2 text-center">{cat.selectedCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Selected Nominees Report */}
        {reportType === 'selected' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">Selected Nominees Report</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">ID</th>
                  <th className="border border-slate-300 p-2 text-left">Name</th>
                  <th className="border border-slate-300 p-2 text-left">Category</th>
                  <th className="border border-slate-300 p-2 text-left">City/State</th>
                  <th className="border border-slate-300 p-2 text-left">Awarded?</th>
                </tr>
              </thead>
              <tbody>
                {yearNominees.filter(n => n.verificationSelection.selectionStatus === 'Selected').map(n => {
                  const isAwarded = yearAwardees.some(a => a.nomineeId === n.id);
                  return (
                    <tr key={n.id}>
                      <td className="border border-slate-300 p-2 text-slate-500">{n.id}</td>
                      <td className="border border-slate-300 p-2 font-bold">{n.fullName}</td>
                      <td className="border border-slate-300 p-2">{n.verificationSelection.finalAwardCategory || n.awardCategory}</td>
                      <td className="border border-slate-300 p-2">{n.city}, {n.state}</td>
                      <td className="border border-slate-300 p-2 font-bold">{isAwarded ? 'Yes' : 'No'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Individual Nominee Report */}
        {reportType === 'nominee' && getNominee() && (
          <div className="space-y-6">
            {(() => {
              const n = getNominee()!;
              return (
                <>
                  <div className="flex gap-6 items-center bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <img src={n.photograph || 'https://via.placeholder.com/150'} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm" />
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-900">{n.fullName}</h3>
                      <p className="text-slate-600 font-medium">{n.awardCategory} • {n.nomineeType}</p>
                      <p className="text-sm text-slate-500 mt-1">{n.city}, {n.state} | {n.mobile}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Professional Background</h4>
                      <p className="text-sm mb-1"><span className="font-bold">Organisation:</span> {n.organisationName || 'N/A'}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Designation:</span> {n.designation || 'N/A'}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Experience:</span> {n.yearsOfExperience} years</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Verification & Selection</h4>
                      <p className="text-sm mb-1"><span className="font-bold">Verification:</span> {n.verificationSelection.verificationStatus}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Selection:</span> {n.verificationSelection.selectionStatus}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Remarks:</span> {n.verificationSelection.selectionRemarks || 'None'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Achievement Summary</h4>
                    <p className="text-sm leading-relaxed">{n.achievement.description}</p>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* 4. Individual Awardee Report */}
        {reportType === 'awardee' && getAwardee() && (
          <div className="space-y-6">
            {(() => {
              const a = getAwardee()!;
              return (
                <>
                  <div className="flex gap-6 items-center bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <img src={a.photograph || 'https://via.placeholder.com/150'} className="h-24 w-24 rounded-full object-cover border-4 border-amber-500 shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="h-6 w-6 text-amber-500" />
                        <h3 className="text-2xl font-display font-bold text-slate-900">{a.name}</h3>
                      </div>
                      <p className="text-amber-700 font-bold">{a.category} • {a.awardYear}</p>
                      <p className="text-sm text-slate-600 mt-1">{a.city}, {a.state} | Cert: {a.certificateNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Professional Profile</h4>
                      <p className="text-sm mb-1"><span className="font-bold">Role:</span> {a.professionRole}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Organisation:</span> {a.organisation || 'N/A'}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Contact:</span> {a.contactDetails}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Ceremony Details</h4>
                      <p className="text-sm mb-1"><span className="font-bold">Event ID:</span> {a.ceremonyRecord?.awardEventId}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Attendance:</span> {a.ceremonyRecord?.attendanceStatus}</p>
                      <p className="text-sm mb-1"><span className="font-bold">Venue:</span> {a.ceremonyRecord?.venue}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Contribution to Special Needs</h4>
                    <p className="text-sm leading-relaxed">{a.contributionSummary}</p>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* 5. Hall of Fame Report */}
        {reportType === 'hallOfFame' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Trophy className="h-12 w-12 mx-auto text-amber-500 mb-2" />
              <h3 className="text-3xl font-display font-extrabold text-slate-900 mb-2">Awardee Hall of Fame</h3>
              <p className="text-slate-500">Honoring the recipients of the Guardian Angel Awards ({selectedYear})</p>
            </div>
            
            {Array.from(new Set(yearAwardees.map(a => a.category))).map(cat => (
              <div key={cat} className="mb-8">
                <h4 className="text-xl font-bold text-amber-700 border-b-2 border-amber-200 pb-2 mb-4">{cat}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {yearAwardees.filter(a => a.category === cat).map(a => (
                    <div key={a.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <img src={a.photograph || 'https://via.placeholder.com/60'} className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{a.name}</p>
                        <p className="text-sm text-slate-600">{a.professionRole} {a.organisation ? `| ${a.organisation}` : ''}</p>
                        <p className="text-xs text-slate-500 mt-1">{a.city}, {a.state}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {yearAwardees.length === 0 && (
              <p className="text-center text-slate-500 py-8">No awardees found for this period.</p>
            )}
          </div>
        )}

        {/* 6. Ceremony Attendance Report */}
        {reportType === 'attendance' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-6 text-center">Ceremony Attendance Report</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Event/Venue</th>
                  <th className="border border-slate-300 p-2 text-left">Awardee Name</th>
                  <th className="border border-slate-300 p-2 text-left">Category</th>
                  <th className="border border-slate-300 p-2 text-left">Attendance</th>
                  <th className="border border-slate-300 p-2 text-left">Cert Status</th>
                </tr>
              </thead>
              <tbody>
                {yearAwardees.map(a => (
                  <tr key={a.id}>
                    <td className="border border-slate-300 p-2 text-slate-600">{a.ceremonyRecord?.venue || 'N/A'}</td>
                    <td className="border border-slate-300 p-2 font-bold">{a.name}</td>
                    <td className="border border-slate-300 p-2">{a.category}</td>
                    <td className="border border-slate-300 p-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${a.ceremonyRecord?.attendanceStatus === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {a.ceremonyRecord?.attendanceStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2">{a.ceremonyRecord?.certificateStatus || 'N/A'}</td>
                  </tr>
                ))}
                {yearAwardees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border border-slate-300 p-4 text-center text-slate-500">No ceremony records found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
