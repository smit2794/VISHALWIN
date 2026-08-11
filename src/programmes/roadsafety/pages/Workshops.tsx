import React, { useState, useEffect } from 'react';
import { roadSafetyStore } from '../data/roadSafetyStore';
import { Workshop, WorkshopStatus, TargetAudience, WorkshopOutcome } from '../types';
import { Card, Button, Badge, Modal, Input, Select } from '../../../components/ui';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { showToast } from '../../../hooks/useToast';
import { ShieldAlert, Plus, Edit2, Calendar, MapPin, Users, CheckCircle, Trash2, Upload, FileText } from 'lucide-react';

export const Workshops: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>(roadSafetyStore.data.workshops);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);

  // Core Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [status, setStatus] = useState<WorkshopStatus>('Scheduled');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('Students');
  const [expectedParticipants, setExpectedParticipants] = useState<number>(0);
  const [primaryCoordinatorId, setPrimaryCoordinatorId] = useState('');
  const [trainer, setTrainer] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [iecMaterials, setIecMaterials] = useState<any[]>([]);
  const [mediaCoverage, setMediaCoverage] = useState<any>({ newsCoverage: false, mediaOutletName: '', link: '' });

  // Outcome Form State
  const [actualParticipants, setActualParticipants] = useState<number>(0);
  const [institutionsCoveredStr, setInstitutionsCoveredStr] = useState('');
  const [awarenessTopicsCoveredStr, setAwarenessTopicsCoveredStr] = useState('');
  const [partnerOrganisationsStr, setPartnerOrganisationsStr] = useState('');
  const [keyOutcome, setKeyOutcome] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpRemarks, setFollowUpRemarks] = useState('');

  useEffect(() => {
    const handleStorageChange = () => setWorkshops(roadSafetyStore.data.workshops);
    window.addEventListener('roadsafety_data_updated', handleStorageChange);
    return () => window.removeEventListener('roadsafety_data_updated', handleStorageChange);
  }, []);

  const resetForm = () => {
    setEditingWorkshop(null);
    setTitle('');
    setDate('');
    setTime('10:00');
    setVenue('');
    setCity('');
    setStateName('');
    setStatus('Scheduled');
    setTargetAudience('Students');
    setExpectedParticipants(0);
    setPrimaryCoordinatorId('');
    setTrainer('');
    setSessions([]);
    setIecMaterials([]);
    setMediaCoverage({ newsCoverage: false, mediaOutletName: '', link: '' });
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (w: Workshop) => {
    setEditingWorkshop(w);
    setTitle(w.title);
    setDate(w.date);
    setTime(w.time);
    setVenue(w.venue);
    setCity(w.city);
    setStateName(w.state);
    setStatus(w.status);
    setTargetAudience(w.targetAudience);
    setExpectedParticipants(w.expectedParticipants);
    setPrimaryCoordinatorId(w.primaryCoordinatorId);
    setTrainer(w.trainer || '');
    setSessions(w.sessions || []);
    setIecMaterials(w.iecMaterials || []);
    setMediaCoverage(w.mediaCoverage || { newsCoverage: false, mediaOutletName: '', link: '' });
    setIsModalOpen(true);
  };

  const openOutcomeModal = (w: Workshop) => {
    setEditingWorkshop(w);
    if (w.outcome) {
      setActualParticipants(w.outcome.actualParticipants);
      setInstitutionsCoveredStr(w.outcome.institutionsCovered.join(', '));
      setAwarenessTopicsCoveredStr(w.outcome.awarenessTopicsCovered.join(', '));
      setPartnerOrganisationsStr(w.outcome.partnerOrganisations.join(', '));
      setKeyOutcome(w.outcome.keyOutcome);
      setFollowUpRequired(w.outcome.followUpRequired);
      setFollowUpRemarks(w.outcome.followUpRemarks || '');
    } else {
      setActualParticipants(0);
      setInstitutionsCoveredStr('');
      setAwarenessTopicsCoveredStr('');
      setPartnerOrganisationsStr('');
      setKeyOutcome('');
      setFollowUpRequired(false);
      setFollowUpRemarks('');
    }
    setIsOutcomeModalOpen(true);
  };

  const handleSaveWorkshop = () => {
    if (!title || !date || !venue) {
      showToast('Validation Error', 'danger', 'Please fill required fields.');
      return;
    }

    const newWorkshop: Workshop = {
      id: editingWorkshop ? editingWorkshop.id : `WS-${new Date().getFullYear()}-${Date.now()}`,
      title,
      date,
      time,
      venue,
      city,
      state: stateName,
      status,
      targetAudience,
      expectedParticipants,
      primaryCoordinatorId,
      trainer,
      sessions,
      iecMaterials,
      mediaCoverage,
      supportCoordinators: editingWorkshop?.supportCoordinators || [],
      outcome: editingWorkshop?.outcome
    };

    const currentData = roadSafetyStore.data;
    if (editingWorkshop) {
      currentData.workshops = currentData.workshops.map(w => w.id === editingWorkshop.id ? newWorkshop : w);
      showToast('Workshop Updated', 'success');
    } else {
      currentData.workshops.push(newWorkshop);
      showToast('Workshop Created', 'success');
    }

    localStorage.setItem('vishalwin_roadsafety', JSON.stringify(currentData));
    window.dispatchEvent(new Event('roadsafety_data_updated'));
    setIsModalOpen(false);
  };

  const handleSaveOutcome = () => {
    if (!editingWorkshop) return;

    const outcome: WorkshopOutcome = {
      actualParticipants,
      institutionsCovered: institutionsCoveredStr.split(',').map(s => s.trim()).filter(s => s),
      awarenessTopicsCovered: awarenessTopicsCoveredStr.split(',').map(s => s.trim()).filter(s => s),
      partnerOrganisations: partnerOrganisationsStr.split(',').map(s => s.trim()).filter(s => s),
      keyOutcome,
      followUpRequired,
      followUpRemarks: followUpRemarks || undefined
    };

    const currentData = roadSafetyStore.data;
    currentData.workshops = currentData.workshops.map(w => 
      w.id === editingWorkshop.id 
        ? { ...w, outcome, status: 'Completed' } // Auto-complete when outcome is added
        : w
    );

    localStorage.setItem('vishalwin_roadsafety', JSON.stringify(currentData));
    window.dispatchEvent(new Event('roadsafety_data_updated'));
    showToast('Workshop Outcome Recorded', 'success');
    setIsOutcomeModalOpen(false);
  };

  const getStatusColor = (s: WorkshopStatus) => {
    switch (s) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Workshops</h1>
          <p className="text-sm text-slate-500">Manage road safety awareness workshops and track outcomes</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Schedule Workshop
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {workshops.map(ws => (
          <Card key={ws.id} className="p-0 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 font-display">{ws.title}</h3>
                  <Badge className={getStatusColor(ws.status)}>{ws.status}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {ws.date} at {ws.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {ws.venue}, {ws.city}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(ws)} className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4" /> Edit
                </Button>
                <Button 
                  variant={ws.status === 'Completed' ? 'outline' : 'primary'} 
                  size="sm" 
                  onClick={() => openOutcomeModal(ws)} 
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" /> 
                  {ws.outcome ? 'Update Outcome' : 'Record Outcome'}
                </Button>
              </div>
            </div>
            
            <div className="p-5 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                  <Users className="h-4 w-4" /> Target Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Target Audience</span>
                    <span className="text-sm font-medium text-slate-800">{ws.targetAudience}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Expected Participants</span>
                    <span className="text-sm font-medium text-slate-800">{ws.expectedParticipants}</span>
                  </div>
                </div>
              </div>

              {ws.outcome && (
                <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Workshop Outcome
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-bold text-emerald-600/70 uppercase">Actual Participants</span>
                      <span className="text-sm font-bold text-emerald-900">{ws.outcome.actualParticipants}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-emerald-600/70 uppercase">Topics Covered</span>
                      <span className="text-sm font-medium text-emerald-800 line-clamp-1" title={ws.outcome.awarenessTopicsCovered.join(', ')}>
                        {ws.outcome.awarenessTopicsCovered.join(', ')}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-bold text-emerald-600/70 uppercase">Key Outcome</span>
                      <span className="text-sm text-emerald-800">{ws.outcome.keyOutcome}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><FileText className="h-4 w-4"/> Sessions</h4>
                {ws.sessions?.length ? ws.sessions.map(s => (
                  <div key={s.id} className="mb-2 p-2 bg-white rounded border border-slate-200 text-xs">
                    <div className="font-bold">{s.name} ({s.duration})</div>
                    <div className="text-slate-500">By: {s.facilitator}</div>
                    <div className="mt-1">{s.keyPoints}</div>
                  </div>
                )) : <div className="text-xs text-slate-500">No sessions added.</div>}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><FileText className="h-4 w-4"/> IEC Materials</h4>
                {ws.iecMaterials?.length ? ws.iecMaterials.map(m => (
                  <div key={m.id} className="mb-1 text-sm flex items-center gap-2">
                    <Badge variant="outline">{m.type}</Badge> <span>Qty: {m.quantity}</span>
                    <span className="text-xs text-slate-500">({m.uploadStatus})</span>
                  </div>
                )) : <div className="text-xs text-slate-500">No materials added.</div>}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><FileText className="h-4 w-4"/> Media Coverage</h4>
                {ws.mediaCoverage?.newsCoverage ? (
                  <div className="text-sm">
                    <div className="font-medium">{ws.mediaCoverage.mediaOutletName}</div>
                    {ws.mediaCoverage.link && <a href={ws.mediaCoverage.link} className="text-blue-600 text-xs underline truncate block" target="_blank" rel="noreferrer">{ws.mediaCoverage.link}</a>}
                  </div>
                ) : <div className="text-xs text-slate-500">No media coverage.</div>}
                {ws.trainer && (
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-1">Trainer</h4>
                    <div className="text-sm">{ws.trainer}</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWorkshop ? 'Edit Workshop' : 'Schedule Workshop'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Workshop Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Date *</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Time</label>
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Venue *</label>
            <Input value={venue} onChange={e => setVenue(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">City</label>
            <Input value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">State</label>
            <Input value={stateName} onChange={e => setStateName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Target Audience</label>
            <Select value={targetAudience} onChange={e => setTargetAudience(e.target.value as TargetAudience)} options={[
              { label: 'Students', value: 'Students' },
              { label: 'Drivers', value: 'Drivers' },
              { label: 'General Public', value: 'General Public' },
              { label: 'Corporate Employees', value: 'Corporate Employees' },
              { label: 'Other', value: 'Other' }
            ]} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Expected Participants</label>
            <Input type="number" value={expectedParticipants} onChange={e => setExpectedParticipants(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Trainer / Facilitator</label>
            <Input value={trainer} onChange={e => setTrainer(e.target.value)} placeholder="Primary Trainer Name" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Status</label>
            <Select value={status} onChange={e => setStatus(e.target.value as WorkshopStatus)} options={[
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' }
            ]} />
          </div>
          
          <div className="md:col-span-2 mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-700">Sessions</label>
              <Button type="button" size="sm" variant="outline" onClick={() => setSessions([...sessions, { id: Date.now().toString(), name: '', duration: '', facilitator: '', keyPoints: '' }])}>
                <Plus className="h-4 w-4 mr-1" /> Add Session
              </Button>
            </div>
            {sessions.map((s, idx) => (
              <div key={s.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 p-2 border border-slate-200 rounded">
                <Input placeholder="Session Name" value={s.name} onChange={e => { const n = [...sessions]; n[idx].name = e.target.value; setSessions(n); }} />
                <Input placeholder="Duration (e.g. 45 min)" value={s.duration} onChange={e => { const n = [...sessions]; n[idx].duration = e.target.value; setSessions(n); }} />
                <Input placeholder="Facilitator" value={s.facilitator} onChange={e => { const n = [...sessions]; n[idx].facilitator = e.target.value; setSessions(n); }} />
                <div className="flex gap-2">
                   <textarea className="flex-1 rounded-md border border-slate-300 p-2 text-sm" placeholder="Key Points" value={s.keyPoints} onChange={e => { const n = [...sessions]; n[idx].keyPoints = e.target.value; setSessions(n); }} />
                   <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { const n = sessions.filter((_, i) => i !== idx); setSessions(n); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-700">IEC Materials Used</label>
              <Button type="button" size="sm" variant="outline" onClick={() => setIecMaterials([...iecMaterials, { id: Date.now().toString(), type: 'Pamphlet', quantity: 0, uploadStatus: 'Not Uploaded' }])}>
                <Plus className="h-4 w-4 mr-1" /> Add Material
              </Button>
            </div>
            {iecMaterials.map((m, idx) => (
              <div key={m.id} className="flex gap-2 mb-2 items-center">
                <Select value={m.type} onChange={e => { const n = [...iecMaterials]; n[idx].type = e.target.value; setIecMaterials(n); }} options={[{label:'Pamphlet',value:'Pamphlet'},{label:'Banner',value:'Banner'},{label:'Video',value:'Video'},{label:'Poster',value:'Poster'},{label:'Other',value:'Other'}]} />
                <Input type="number" placeholder="Qty" value={m.quantity} onChange={e => { const n = [...iecMaterials]; n[idx].quantity = Number(e.target.value); setIecMaterials(n); }} className="w-24" />
                <div className="flex-1 flex gap-2 items-center">
                  <Badge>{m.uploadStatus}</Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.onchange = () => {
                       const n = [...iecMaterials];
                       n[idx].uploadStatus = 'Uploaded: ' + (input.files?.[0]?.name || 'file.pdf');
                       setIecMaterials(n);
                       showToast('Sample Uploaded', 'success');
                     };
                     input.click();
                  }}><Upload className="h-3 w-3 mr-1"/> Upload Sample</Button>
                  <Button type="button" variant="outline" className="text-red-600 border-red-200" onClick={() => { const n = iecMaterials.filter((_, i) => i !== idx); setIecMaterials(n); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 mt-4 space-y-2 p-3 bg-slate-50 border border-slate-200 rounded">
             <label className="text-sm font-bold text-slate-700 block">Media Coverage</label>
             <div className="flex items-center gap-2">
                <input type="checkbox" id="newsCoverage" checked={mediaCoverage.newsCoverage} onChange={e => setMediaCoverage({...mediaCoverage, newsCoverage: e.target.checked})} className="rounded border-slate-300" />
                <label htmlFor="newsCoverage" className="text-sm">Has News Coverage?</label>
             </div>
             {mediaCoverage.newsCoverage && (
               <div className="flex gap-2 mt-2">
                  <Input placeholder="Media Outlet Name" value={mediaCoverage.mediaOutletName} onChange={e => setMediaCoverage({...mediaCoverage, mediaOutletName: e.target.value})} />
                  <Input placeholder="Link" value={mediaCoverage.link} onChange={e => setMediaCoverage({...mediaCoverage, link: e.target.value})} />
               </div>
             )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWorkshop}>{editingWorkshop ? 'Save Changes' : 'Schedule Workshop'}</Button>
        </div>
      </Modal>

      <Modal isOpen={isOutcomeModalOpen} onClose={() => setIsOutcomeModalOpen(false)} title="Record Workshop Outcome" size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Actual Participants *</label>
            <Input type="number" value={actualParticipants} onChange={e => setActualParticipants(Number(e.target.value))} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Institutions Covered (comma separated IDs/Names)</label>
            <Input value={institutionsCoveredStr} onChange={e => setInstitutionsCoveredStr(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Awareness Topics Covered (comma separated)</label>
            <Input value={awarenessTopicsCoveredStr} onChange={e => setAwarenessTopicsCoveredStr(e.target.value)} placeholder="e.g. Helmet Safety, Speed Limits" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Partner Organisations (comma separated)</label>
            <Input value={partnerOrganisationsStr} onChange={e => setPartnerOrganisationsStr(e.target.value)} placeholder="e.g. Traffic Police, Rotary Club" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Key Outcome Summary</label>
            <Input value={keyOutcome} onChange={e => setKeyOutcome(e.target.value)} placeholder="Summary of the impact and engagement..." />
          </div>
          
          <div className="space-y-1 flex items-center gap-3 pt-4 md:col-span-2">
            <input 
              type="checkbox" 
              id="followUpRequired" 
              checked={followUpRequired} 
              onChange={e => setFollowUpRequired(e.target.checked)} 
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
            />
            <label htmlFor="followUpRequired" className="text-sm font-bold text-slate-800 cursor-pointer">
              Requires Follow Up
            </label>
          </div>

          {followUpRequired && (
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Follow Up Remarks</label>
              <Input value={followUpRemarks} onChange={e => setFollowUpRemarks(e.target.value)} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setIsOutcomeModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveOutcome}>Save Outcome & Complete Workshop</Button>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Workshops;
