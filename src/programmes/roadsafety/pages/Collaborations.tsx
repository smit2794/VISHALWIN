import React, { useState, useEffect } from 'react';
import { roadSafetyStore } from '../data/roadSafetyStore';
import { Collaboration } from '../types';
import { Card, Button, Input, Select, Modal, Badge } from '../../../components/ui';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { showToast } from '../../../hooks/useToast';
import { Handshake, Plus, Edit2, Phone, Mail, FileText, CheckCircle, Upload, Trash2, Calendar } from 'lucide-react';

export const Collaborations: React.FC = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>(roadSafetyStore.data.collaborations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null);

  // Form State
  const [partnerName, setPartnerName] = useState('');
  const [type, setType] = useState<'Traffic Police' | 'NGO' | 'Corporate' | 'Govt Department' | 'Other'>('NGO');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [mouSigned, setMouSigned] = useState(false);
  const [mouDate, setMouDate] = useState('');
  const [activeStatus, setActiveStatus] = useState<'Active' | 'Inactive'>('Active');
  const [supportProvided, setSupportProvided] = useState('');
  const [mouDocStatus, setMouDocStatus] = useState('Not Uploaded');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const handleStorageChange = () => setCollaborations(roadSafetyStore.data.collaborations);
    window.addEventListener('roadsafety_data_updated', handleStorageChange);
    return () => window.removeEventListener('roadsafety_data_updated', handleStorageChange);
  }, []);

  const resetForm = () => {
    setEditingCollab(null);
    setPartnerName('');
    setType('NGO');
    setContactPerson('');
    setMobile('');
    setEmail('');
    setMouSigned(false);
    setMouDate('');
    setActiveStatus('Active');
    setSupportProvided('');
    setMouDocStatus('Not Uploaded');
    setActivities([]);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (c: Collaboration) => {
    setEditingCollab(c);
    setPartnerName(c.partnerName);
    setType(c.type);
    setContactPerson(c.contactPerson);
    setMobile(c.mobile);
    setEmail(c.email);
    setMouSigned(c.mouSigned);
    setMouDate(c.mouDate || '');
    setActiveStatus(c.activeStatus);
    setSupportProvided(c.supportProvided);
    setMouDocStatus(c.mouDocStatus || 'Not Uploaded');
    setActivities(c.activities || []);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!partnerName || !contactPerson) {
      showToast('Validation Error', 'danger', 'Please fill Partner Name and Contact Person.');
      return;
    }

    const newCollab: Collaboration = {
      id: editingCollab ? editingCollab.id : `COL-${Date.now()}`,
      partnerName,
      type,
      contactPerson,
      mobile,
      email,
      mouSigned,
      mouDate: mouSigned ? mouDate : undefined,
      activeStatus,
      supportProvided,
      mouDocStatus,
      activities
    };

    const currentData = roadSafetyStore.data;
    if (editingCollab) {
      currentData.collaborations = currentData.collaborations.map(c => c.id === editingCollab.id ? newCollab : c);
      showToast('Collaboration Updated', 'success');
    } else {
      currentData.collaborations.push(newCollab);
      showToast('Collaboration Added', 'success');
    }

    localStorage.setItem('vishalwin_roadsafety', JSON.stringify(currentData));
    window.dispatchEvent(new Event('roadsafety_data_updated'));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Collaborations</h1>
          <p className="text-sm text-slate-500">Manage partnerships for the Road Safety Programme</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Partner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborations.map(collab => (
          <Card key={collab.id} className="p-0 overflow-hidden flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-lg shrink-0 ${collab.activeStatus === 'Active' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{collab.partnerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">{collab.type}</span>
                    <Badge className={collab.activeStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                      {collab.activeStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <button onClick={() => openEditModal(collab)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5 flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><FileText className="h-3 w-3"/> Support Provided</p>
                <p className="text-sm font-medium text-slate-800 line-clamp-2">{collab.supportProvided || 'Not specified'}</p>
              </div>

              {collab.mouSigned && (
                <div className="flex items-center justify-between bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-xs font-bold">
                  <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> MOU Signed {collab.mouDate && `on ${collab.mouDate}`}</span>
                  {collab.mouDocStatus && collab.mouDocStatus.startsWith('Uploaded') && (
                    <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded text-blue-800 truncate max-w-[100px]">{collab.mouDocStatus}</span>
                  )}
                </div>
              )}
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Contact Details</p>
                <p className="text-sm font-bold text-slate-800">{collab.contactPerson}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {collab.mobile || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {collab.email || 'N/A'}
                </div>
              </div>

              {collab.activities && collab.activities.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Collaboration Activities</p>
                  {collab.activities.map((act: any) => (
                    <div key={act.id} className="bg-white border border-slate-200 rounded p-2 text-xs">
                       <div className="font-bold">{act.name}</div>
                       <div className="text-slate-500 flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3"/> {act.date}</div>
                       <div className="mt-1 text-slate-700">{act.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
        {collaborations.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            No collaborations recorded.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCollab ? 'Edit Partner' : 'Add Partner'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Partner Organisation Name *</label>
            <Input value={partnerName} onChange={e => setPartnerName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Type</label>
            <Select value={type} onChange={e => setType(e.target.value as any)} options={[
              { label: 'Traffic Police', value: 'Traffic Police' },
              { label: 'NGO', value: 'NGO' },
              { label: 'Corporate', value: 'Corporate' },
              { label: 'Govt Department', value: 'Govt Department' },
              { label: 'Other', value: 'Other' }
            ]} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Active Status</label>
            <Select value={activeStatus} onChange={e => setActiveStatus(e.target.value as 'Active' | 'Inactive')} options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]} />
          </div>

          <div className="space-y-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
            <h4 className="font-bold text-slate-800 mb-2">Contact Person</h4>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Name *</label>
            <Input value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Mobile</label>
            <Input value={mobile} onChange={e => setMobile(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
            <h4 className="font-bold text-slate-800 mb-2">Collaboration Details</h4>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Support Provided</label>
            <Input value={supportProvided} onChange={e => setSupportProvided(e.target.value)} placeholder="e.g. Venue, Volunteers, Speakers" />
          </div>
          <div className="space-y-1 flex items-center gap-3 pt-2 md:col-span-2">
            <input 
              type="checkbox" 
              id="mouSigned" 
              checked={mouSigned} 
              onChange={e => setMouSigned(e.target.checked)} 
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
            />
            <label htmlFor="mouSigned" className="text-sm font-bold text-slate-800 cursor-pointer">
              Formal MOU Signed
            </label>
          </div>
          {mouSigned && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">MOU Date</label>
              <Input type="date" value={mouDate} onChange={e => setMouDate(e.target.value)} />
            </div>
          )}
          {mouSigned && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 block">MOU Document</label>
              <div className="flex gap-2 items-center">
                 <span className="text-xs truncate max-w-[150px]">{mouDocStatus}</span>
                 <Button type="button" size="sm" variant="outline" onClick={() => {
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.onchange = () => {
                       setMouDocStatus('Uploaded: ' + (input.files?.[0]?.name || 'file.pdf'));
                       showToast('MOU Document Uploaded', 'success');
                     };
                     input.click();
                 }}><Upload className="h-3 w-3 mr-1"/> Upload</Button>
              </div>
            </div>
          )}

          <div className="space-y-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-slate-800">Collaboration Activities</h4>
              <Button type="button" size="sm" variant="outline" onClick={() => setActivities([...activities, { id: Date.now().toString(), name: '', date: '', description: '' }])}>
                <Plus className="h-4 w-4 mr-1" /> Add Activity
              </Button>
            </div>
            {activities.map((act, idx) => (
              <div key={act.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 p-2 border border-slate-200 rounded">
                <Input placeholder="Activity Name" value={act.name} onChange={e => { const n = [...activities]; n[idx].name = e.target.value; setActivities(n); }} />
                <Input type="date" value={act.date} onChange={e => { const n = [...activities]; n[idx].date = e.target.value; setActivities(n); }} />
                <div className="sm:col-span-2 flex gap-2">
                   <Input placeholder="Description" value={act.description} onChange={e => { const n = [...activities]; n[idx].description = e.target.value; setActivities(n); }} className="flex-1" />
                   <Button type="button" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { const n = activities.filter((_, i) => i !== idx); setActivities(n); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editingCollab ? 'Save Changes' : 'Add Partner'}</Button>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Collaborations;
