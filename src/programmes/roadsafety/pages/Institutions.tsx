import React, { useState, useEffect } from 'react';
import { roadSafetyStore } from '../data/roadSafetyStore';
import { Institution, InstitutionType } from '../types';
import { Card, Button, Input, Select, Modal } from '../../../components/ui';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { showToast } from '../../../hooks/useToast';
import { Building2, Plus, Edit2, MapPin, Phone, Mail, FileText, Upload, ChevronDown, ChevronUp } from 'lucide-react';

export const Institutions: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>(roadSafetyStore.data.institutions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<InstitutionType>('School');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonMobile, setContactPersonMobile] = useState('');
  const [contactPersonEmail, setContactPersonEmail] = useState('');
  const [mouStatus, setMouStatus] = useState<'Signed' | 'Not Signed' | 'Under Discussion'>('Not Signed');
  const [mouDocStatus, setMouDocStatus] = useState<string>('Not Uploaded');
  
  const [expandedInst, setExpandedInst] = useState<string | null>(null);

  // Helper to get past workshops for an institution
  const getWorkshopsForInst = (instId: string) => {
    return roadSafetyStore.data.workshops.filter(w => 
      w.outcome?.institutionsCovered?.includes(instId)
    );
  };

  useEffect(() => {
    const handleStorageChange = () => setInstitutions(roadSafetyStore.data.institutions);
    window.addEventListener('roadsafety_data_updated', handleStorageChange);
    return () => window.removeEventListener('roadsafety_data_updated', handleStorageChange);
  }, []);

  const resetForm = () => {
    setEditingInst(null);
    setName('');
    setType('School');
    setAddress('');
    setCity('');
    setDistrict('');
    setStateName('');
    setContactPersonName('');
    setContactPersonMobile('');
    setContactPersonEmail('');
    setMouStatus('Not Signed');
    setMouDocStatus('Not Uploaded');
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (inst: Institution) => {
    setEditingInst(inst);
    setName(inst.name);
    setType(inst.type);
    setAddress(inst.address);
    setCity(inst.city);
    setDistrict(inst.district);
    setStateName(inst.state);
    setContactPersonName(inst.contactPersonName);
    setContactPersonMobile(inst.contactPersonMobile);
    setContactPersonEmail(inst.contactPersonEmail);
    setMouStatus(inst.mouStatus || 'Not Signed');
    setMouDocStatus(inst.mouDocStatus || 'Not Uploaded');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name || !city || !contactPersonName) {
      showToast('Validation Error', 'danger', 'Please fill required fields (Name, City, Contact Person).');
      return;
    }

    const newInst: Institution = {
      id: editingInst ? editingInst.id : `INST-${Date.now()}`,
      name,
      type,
      address,
      city,
      district,
      state: stateName,
      contactPersonName,
      contactPersonMobile,
      contactPersonEmail,
      mouStatus,
      mouDocStatus,
      totalWorkshopsConducted: editingInst ? editingInst.totalWorkshopsConducted : 0
    };

    const currentData = roadSafetyStore.data;
    if (editingInst) {
      currentData.institutions = currentData.institutions.map(i => i.id === editingInst.id ? newInst : i);
      showToast('Institution Updated', 'success');
    } else {
      currentData.institutions.push(newInst);
      showToast('Institution Added', 'success');
    }

    localStorage.setItem('vishalwin_roadsafety', JSON.stringify(currentData));
    window.dispatchEvent(new Event('roadsafety_data_updated'));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Institutions</h1>
          <p className="text-sm text-slate-500">Directory of schools, colleges, and corporates for workshops</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Institution
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map(inst => (
          <Card key={inst.id} className="p-0 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{inst.name}</h3>
                  <span className="text-xs font-bold text-slate-500 uppercase">{inst.type}</span>
                </div>
              </div>
              <button onClick={() => openEditModal(inst)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{inst.address}, {inst.city}, {inst.state}</span>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Contact Person</p>
                <p className="text-sm font-bold text-slate-800">{inst.contactPersonName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {inst.contactPersonMobile || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {inst.contactPersonEmail || 'N/A'}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="text-slate-500">MOU Status: <span className="font-bold">{inst.mouStatus || 'Not Signed'}</span></span>
              {inst.mouDocStatus && inst.mouDocStatus.startsWith('Uploaded') && (
                <span className="text-xs text-blue-600 truncate max-w-[100px]">{inst.mouDocStatus}</span>
              )}
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="text-slate-500">Workshops Hosted</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded shadow-sm border border-slate-200">
                {inst.totalWorkshopsConducted}
              </span>
            </div>

            <div className="border-t border-slate-100">
               <button onClick={() => setExpandedInst(expandedInst === inst.id ? null : inst.id)} className="w-full px-5 py-2 text-sm text-center flex items-center justify-center gap-1 text-slate-500 hover:bg-slate-50 transition-colors">
                  {expandedInst === inst.id ? <><ChevronUp className="h-4 w-4"/> Hide Workshop History</> : <><ChevronDown className="h-4 w-4"/> View Workshop History</>}
               </button>
               {expandedInst === inst.id && (
                 <div className="p-4 bg-slate-50 text-sm space-y-2">
                    {getWorkshopsForInst(inst.id).length > 0 ? getWorkshopsForInst(inst.id).map(w => (
                      <div key={w.id} className="p-2 bg-white rounded border border-slate-200">
                         <div className="font-bold">{w.title}</div>
                         <div className="text-xs text-slate-500">{w.date} • {w.outcome?.actualParticipants || w.expectedParticipants} Participants</div>
                      </div>
                    )) : <div className="text-slate-400 text-xs">No workshops hosted yet.</div>}
                 </div>
               )}
            </div>
          </Card>
        ))}
        {institutions.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            No institutions recorded.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInst ? 'Edit Institution' : 'Add Institution'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Institution Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Type</label>
            <Select value={type} onChange={e => setType(e.target.value as InstitutionType)} options={[
              { label: 'School', value: 'School' },
              { label: 'College', value: 'College' },
              { label: 'Corporate', value: 'Corporate' },
              { label: 'Community', value: 'Community' },
              { label: 'Other', value: 'Other' }
            ]} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Address</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">City *</label>
            <Input value={city} onChange={e => setCity(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">District</label>
            <Input value={district} onChange={e => setDistrict(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">State</label>
            <Input value={stateName} onChange={e => setStateName(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
            <h4 className="font-bold text-slate-800 mb-2">Contact Person Details</h4>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Name *</label>
            <Input value={contactPersonName} onChange={e => setContactPersonName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Mobile</label>
            <Input value={contactPersonMobile} onChange={e => setContactPersonMobile(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Email</label>
            <Input type="email" value={contactPersonEmail} onChange={e => setContactPersonEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">MOU Status</label>
            <Select value={mouStatus} onChange={e => setMouStatus(e.target.value as any)} options={[
              { label: 'Not Signed', value: 'Not Signed' },
              { label: 'Signed', value: 'Signed' },
              { label: 'Under Discussion', value: 'Under Discussion' }
            ]} />
          </div>
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
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editingInst ? 'Save Changes' : 'Add Institution'}</Button>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Institutions;
