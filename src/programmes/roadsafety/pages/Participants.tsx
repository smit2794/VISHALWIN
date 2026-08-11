import React, { useState, useEffect } from 'react';
import { roadSafetyStore } from '../data/roadSafetyStore';
import { Participant, Workshop } from '../types';
import { Card, Button, Input, Select, Modal, Badge } from '../../../components/ui';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { showToast } from '../../../hooks/useToast';
import { Users, Plus, Edit2, ShieldCheck, Phone, Search, Printer, Download, Star, ChevronDown, ChevronUp } from 'lucide-react';

export const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>(roadSafetyStore.data.participants);
  const [workshops, setWorkshops] = useState<Workshop[]>(roadSafetyStore.data.workshops);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<any>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState('All');

  // Form State
  const [workshopId, setWorkshopId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [pledgeSigned, setPledgeSigned] = useState(true);

  useEffect(() => {
    const handleStorageChange = () => {
      setParticipants(roadSafetyStore.data.participants);
      setWorkshops(roadSafetyStore.data.workshops);
    };
    window.addEventListener('roadsafety_data_updated', handleStorageChange);
    return () => window.removeEventListener('roadsafety_data_updated', handleStorageChange);
  }, []);

  const resetForm = () => {
    setEditingParticipant(null);
    setWorkshopId(workshops.length > 0 ? workshops[0].id : '');
    setName('');
    setAge('');
    setGender('Male');
    setMobile('');
    setEmail('');
    setProfession('');
    setPledgeSigned(true);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    setWorkshopId(p.workshopId);
    setName(p.name);
    setAge(p.age);
    setGender(p.gender);
    setMobile(p.mobile);
    setEmail(p.email || '');
    setProfession(p.profession || '');
    setPledgeSigned(p.pledgeSigned);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name || !workshopId || !age) {
      showToast('Validation Error', 'danger', 'Please fill required fields (Name, Workshop, Age).');
      return;
    }

    const newParticipant: Participant = {
      id: editingParticipant ? editingParticipant.id : `PAR-${Date.now()}`,
      workshopId,
      name,
      age: Number(age),
      gender,
      mobile,
      email,
      profession,
      pledgeSigned,
      feedback: editingParticipant?.feedback
    };

    const currentData = roadSafetyStore.data;
    if (editingParticipant) {
      currentData.participants = currentData.participants.map(p => p.id === editingParticipant.id ? newParticipant : p);
      showToast('Participant Updated', 'success');
    } else {
      currentData.participants.push(newParticipant);
      showToast('Participant Added', 'success');
    }

    localStorage.setItem('vishalwin_roadsafety', JSON.stringify(currentData));
    window.dispatchEvent(new Event('roadsafety_data_updated'));
    setIsModalOpen(false);
  };

  const handleSaveFeedback = (pId: string) => {
    const fb = feedbackState[pId];
    if (!fb) return;
    const currentData = roadSafetyStore.data;
    currentData.participants = currentData.participants.map(p => 
      p.id === pId ? { ...p, feedbackDetails: fb } : p
    );
    localStorage.setItem('vishalwin_roadsafety', JSON.stringify(currentData));
    window.dispatchEvent(new Event('roadsafety_data_updated'));
    showToast('Feedback Saved', 'success');
  };

  const toggleRow = (p: Participant) => {
    if (expandedRow === p.id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(p.id);
      setFeedbackState({ ...feedbackState, [p.id]: p.feedbackDetails || { rating: 0, keyTakeaway: '', suggestions: '' } });
    }
  };

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mobile.includes(searchTerm);
    const matchesWorkshop = filterWorkshop === 'All' || p.workshopId === filterWorkshop;
    return matchesSearch && matchesWorkshop;
  });

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
          <h1 className="text-2xl font-display font-bold text-slate-900">Participants & Pledges</h1>
          <p className="text-sm text-slate-500">Track workshop attendees and signed road safety pledges</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print View
          </Button>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Participant
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-white border border-slate-200 no-print">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
          <div className="w-full md:w-64">
            <Select 
              value={filterWorkshop} 
              onChange={(e) => setFilterWorkshop(e.target.value)}
              options={[
                { label: 'All Workshops', value: 'All' },
                ...workshops.map(w => ({ label: w.title, value: w.id }))
              ]}
            />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Participant Name</th>
                <th className="px-6 py-4 font-bold">Demographics</th>
                <th className="px-6 py-4 font-bold">Workshop</th>
                <th className="px-6 py-4 font-bold">Pledge Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredParticipants.map(p => {
                const ws = workshops.find(w => w.id === p.workshopId);
                return (
                  <React.Fragment key={p.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {p.mobile || 'No Mobile'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.age} yrs • {p.gender} {p.profession && `• ${p.profession}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={ws?.title}>
                        {ws?.title || 'Unknown Workshop'}
                      </div>
                      <div className="text-xs text-slate-500">{p.workshopId}</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.pledgeSigned ? (
                        <div className="flex flex-col gap-1 items-start">
                          <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
                            <ShieldCheck className="h-3.5 w-3.5" /> Signed
                          </Badge>
                          <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 px-2 py-0.5 h-6 text-xs no-print" onClick={() => showToast('Certificate PDF generated', 'success')}>
                            <Download className="h-3 w-3 mr-1" /> Certificate
                          </Button>
                        </div>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600">Not Signed</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleRow(p)} className="flex items-center gap-1">
                          {expandedRow === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Feedback
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditModal(p)} className="flex items-center gap-2">
                          <Edit2 className="h-4 w-4" /> Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === p.id && (
                    <tr className="bg-slate-50 border-b border-slate-200 no-print">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1 space-y-4">
                            <h4 className="text-sm font-bold text-slate-700">Feedback Form</h4>
                            <div className="space-y-1">
                               <label className="text-sm font-bold text-slate-700 block">Rating</label>
                               <div className="flex gap-1">
                                  {[1,2,3,4,5].map(star => (
                                    <button key={star} onClick={() => setFeedbackState({...feedbackState, [p.id]: {...feedbackState[p.id], rating: star}})} className="focus:outline-none">
                                      <Star className={`h-5 w-5 ${feedbackState[p.id]?.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                    </button>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-bold text-slate-700">Key Takeaway</label>
                              <Input value={feedbackState[p.id]?.keyTakeaway || ''} onChange={e => setFeedbackState({...feedbackState, [p.id]: {...feedbackState[p.id], keyTakeaway: e.target.value}})} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-bold text-slate-700">Suggestions</label>
                              <Input value={feedbackState[p.id]?.suggestions || ''} onChange={e => setFeedbackState({...feedbackState, [p.id]: {...feedbackState[p.id], suggestions: e.target.value}})} />
                            </div>
                            <Button onClick={() => handleSaveFeedback(p.id)}>Save Feedback</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Users className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                    <p className="font-medium text-slate-600">No participants found</p>
                    <p className="text-xs mt-1">Adjust your filters or add a new participant.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingParticipant ? 'Edit Participant' : 'Add Participant'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Workshop *</label>
            <Select value={workshopId} onChange={e => setWorkshopId(e.target.value)} options={
              workshops.map(w => ({ label: w.title, value: w.id }))
            } />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Full Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Age *</label>
            <Input type="number" value={age.toString()} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Gender</label>
            <Select value={gender} onChange={e => setGender(e.target.value as any)} options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' }
            ]} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Mobile Number</label>
            <Input value={mobile} onChange={e => setMobile(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Profession / Role (Optional)</label>
            <Input value={profession} onChange={e => setProfession(e.target.value)} placeholder="e.g. Student, Driver, Teacher" />
          </div>
          
          <div className="space-y-1 flex items-center gap-3 pt-4 md:col-span-2 border-t border-slate-100">
            <input 
              type="checkbox" 
              id="pledgeSigned" 
              checked={pledgeSigned} 
              onChange={e => setPledgeSigned(e.target.checked)} 
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
            />
            <label htmlFor="pledgeSigned" className="text-sm font-bold text-slate-800 cursor-pointer">
              Road Safety Pledge Signed
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editingParticipant ? 'Save Changes' : 'Add Participant'}</Button>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Participants;
