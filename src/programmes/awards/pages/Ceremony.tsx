import React, { useState, useEffect } from 'react';
import { awardsStore } from '../data/awardsStore';
import { Nominee, Awardee, AwardCeremonyRecord, CertificateStatus, AwardEvent } from '../types';
import { Card, Button, Badge, Modal, Input, Select } from '../../../components/ui';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { showToast } from '../../../hooks/useToast';
import { Trophy, Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';

export const Ceremony: React.FC = () => {
  const [selectedNominees, setSelectedNominees] = useState<Nominee[]>([]);
  const [awardees, setAwardees] = useState<Awardee[]>([]);
  const [events, setEvents] = useState<AwardEvent[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNominee, setActiveNominee] = useState<Nominee | null>(null);

  // Form State
  const [awardEventId, setAwardEventId] = useState('');
  const [awardCategory, setAwardCategory] = useState('');
  const [awardDate, setAwardDate] = useState('');
  const [venue, setVenue] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent'>('Present');
  const [awardReceived, setAwardReceived] = useState(true);
  const [certificateStatus, setCertificateStatus] = useState<CertificateStatus>('Pending');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [recognitionDetails, setRecognitionDetails] = useState('');
  const [ceremonyPhotograph, setCeremonyPhotograph] = useState('');
  const [otherDocName, setOtherDocName] = useState('');

  useEffect(() => {
    const loadData = () => {
      const data = awardsStore.data;
      // Only get nominees who are actually 'Selected'
      setSelectedNominees(data.nominees.filter(n => n.verificationSelection.selectionStatus === 'Selected'));
      setAwardees(data.awardees);
      setEvents(data.events);
    };
    
    loadData();
    window.addEventListener('awards_data_updated', loadData);
    return () => window.removeEventListener('awards_data_updated', loadData);
  }, []);

  const openCeremonyModal = (nominee: Nominee) => {
    setActiveNominee(nominee);
    
    // Check if they are already an awardee to pre-fill
    const existingAwardee = awardees.find(a => a.nomineeId === nominee.id);
    
    if (existingAwardee && existingAwardee.ceremonyRecord) {
      const rec = existingAwardee.ceremonyRecord;
      setAwardEventId(rec.awardEventId);
      setAwardCategory(rec.awardCategory);
      setAwardDate(rec.awardDate);
      setVenue(rec.venue);
      setAttendanceStatus(rec.attendanceStatus);
      setAwardReceived(rec.awardReceived);
      setCertificateStatus(rec.certificateStatus);
      setCertificateNumber(rec.certificateNumber || '');
      setRecognitionDetails(rec.recognitionDetails || '');
      setCeremonyPhotograph(rec.ceremonyPhotograph || '');
      setOtherDocName((rec.otherDocuments && rec.otherDocuments[0]) || '');
    } else {
      // Defaults based on the nominee
      setAwardEventId(events.length > 0 ? events[0].id : '');
      setAwardCategory(nominee.verificationSelection.finalAwardCategory || nominee.awardCategory);
      setAwardDate(new Date().toISOString().split('T')[0]);
      setVenue(events.length > 0 ? events[0].venue : '');
      setAttendanceStatus('Present');
      setAwardReceived(true);
      setCertificateStatus('Pending');
      setCertificateNumber('');
      setRecognitionDetails('');
      setCeremonyPhotograph('');
      setOtherDocName('');
    }
    
    setIsModalOpen(true);
  };

  const handleSaveCeremony = () => {
    if (!activeNominee || !awardEventId) return;

    const currentData = awardsStore.data;
    const existingIndex = currentData.awardees.findIndex(a => a.nomineeId === activeNominee.id);

    const ceremonyRecord: AwardCeremonyRecord = {
      awardeeId: existingIndex >= 0 ? currentData.awardees[existingIndex].id : `AWD-${activeNominee.awardYear}-${Date.now()}`,
      awardEventId,
      awardCategory,
      awardDate,
      venue,
      attendanceStatus,
      awardReceived,
      certificateStatus,
      certificateNumber,
      recognitionDetails,
      ceremonyPhotograph,
      otherDocuments: otherDocName ? [otherDocName] : undefined
    };

    if (existingIndex >= 0) {
      // Update existing awardee
      currentData.awardees[existingIndex].ceremonyRecord = ceremonyRecord;
      currentData.awardees[existingIndex].certificateNumber = certificateNumber;
      showToast('Ceremony Record Updated', 'success');
    } else if (awardReceived) {
      // Create new permanent awardee record
      const newAwardee: Awardee = {
        id: ceremonyRecord.awardeeId,
        nomineeId: activeNominee.id,
        name: activeNominee.fullName,
        photograph: activeNominee.photograph,
        awardYear: activeNominee.awardYear,
        category: awardCategory,
        professionRole: activeNominee.designation || activeNominee.nomineeType,
        organisation: activeNominee.organisationName,
        city: activeNominee.city,
        state: activeNominee.state,
        contactDetails: activeNominee.mobile,
        contributionSummary: activeNominee.achievement.description,
        certificateNumber,
        photographs: ceremonyPhotograph ? [ceremonyPhotograph] : [], // ceremony photos would go here
        ceremonyRecord
      };
      currentData.awardees.push(newAwardee);
      showToast('New Awardee Created Successfully!', 'success');
    }

    localStorage.setItem('vishalwin_awards', JSON.stringify(currentData));
    window.dispatchEvent(new Event('awards_data_updated'));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Award Ceremony Management</h1>
        <p className="text-sm text-slate-500">Track attendance, certificates, and finalize awardees from selected nominees.</p>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Selected Nominee</th>
                <th className="px-6 py-4 font-bold">Award Category</th>
                <th className="px-6 py-4 font-bold">Ceremony Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {selectedNominees.map(nominee => {
                const awardee = awardees.find(a => a.nomineeId === nominee.id);
                const isAwarded = awardee && awardee.ceremonyRecord?.awardReceived;

                return (
                  <tr key={nominee.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={nominee.photograph || 'https://via.placeholder.com/40'} alt={nominee.fullName} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900">{nominee.fullName}</div>
                          <div className="text-xs text-slate-500">{nominee.city}, {nominee.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {nominee.verificationSelection.finalAwardCategory || nominee.awardCategory}
                    </td>
                    <td className="px-6 py-4">
                      {isAwarded ? (
                        <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" /> Awarded
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 flex items-center gap-1 w-fit">
                          <Calendar className="h-3 w-3" /> Pending Ceremony
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => openCeremonyModal(nominee)}>
                        {isAwarded ? 'Update Record' : 'Record Ceremony'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {selectedNominees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <Trophy className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                    <p className="font-medium text-slate-600">No selected nominees found.</p>
                    <p className="text-xs mt-1">Nominees must have 'Selected' status to appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ceremony Record" size="xl">
        {activeNominee && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4 items-center">
              <img src={activeNominee.photograph} alt={activeNominee.fullName} className="h-12 w-12 rounded-full object-cover shadow-sm border border-slate-200" />
              <div>
                <h4 className="font-bold text-slate-800">{activeNominee.fullName}</h4>
                <p className="text-sm text-slate-500">{activeNominee.id} • {awardCategory}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Award Event</label>
                <Select value={awardEventId} onChange={e => {
                  setAwardEventId(e.target.value);
                  const ev = events.find(x => x.id === e.target.value);
                  if (ev) setVenue(ev.venue);
                }} options={events.map(e => ({ label: `${e.name} (${e.year})`, value: e.id }))} />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Ceremony Date</label>
                <Input type="date" value={awardDate} onChange={e => setAwardDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Venue</label>
                <Input value={venue} onChange={e => setVenue(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Attendance Status</label>
                <Select value={attendanceStatus} onChange={e => setAttendanceStatus(e.target.value as 'Present' | 'Absent')} options={[
                  { label: 'Present', value: 'Present' },
                  { label: 'Absent', value: 'Absent' }
                ]} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Certificate Status</label>
                <Select value={certificateStatus} onChange={e => setCertificateStatus(e.target.value as CertificateStatus)} options={[
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Generated', value: 'Generated' },
                  { label: 'Issued', value: 'Issued' }
                ]} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Certificate Number</label>
                <Input value={certificateNumber} onChange={e => setCertificateNumber(e.target.value)} placeholder="e.g. GAA-2026-001" />
              </div>

              <div className="space-y-1 flex items-center gap-3 pt-6">
                <input 
                  type="checkbox" 
                  id="awardReceived" 
                  checked={awardReceived} 
                  onChange={e => setAwardReceived(e.target.checked)} 
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
                <label htmlFor="awardReceived" className="text-sm font-bold text-slate-800 cursor-pointer">
                  Award Received successfully? (Will create Awardee permanent record)
                </label>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Recognition Details / Remarks</label>
                <textarea 
                  value={recognitionDetails} 
                  onChange={e => setRecognitionDetails(e.target.value)} 
                  placeholder="Details of the specific award or recognition given..."
                  className="w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 min-h-[80px] p-3"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 flex justify-between">Ceremony Photograph {ceremonyPhotograph && <span className="text-emerald-600">({ceremonyPhotograph})</span>}</label>
                <div className="relative">
                  <Button variant="outline" className="w-full" onClick={() => document.getElementById('ceremony-photo-upload')?.click()}>
                    Upload Photograph
                  </Button>
                  <input 
                    type="file" 
                    id="ceremony-photo-upload" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCeremonyPhotograph(e.target.files[0].name);
                        showToast('Photograph uploaded successfully', 'success');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 flex justify-between">Other Documents {otherDocName && <span className="text-emerald-600">({otherDocName})</span>}</label>
                <div className="relative">
                  <Button variant="outline" className="w-full" onClick={() => document.getElementById('other-doc-upload')?.click()}>
                    Upload Document
                  </Button>
                  <input 
                    type="file" 
                    id="other-doc-upload" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setOtherDocName(e.target.files[0].name);
                        showToast('Document uploaded successfully', 'success');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCeremony}>Save Ceremony Record</Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Ceremony;
