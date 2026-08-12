import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Label, Modal, Textarea } from '../../../components/ui';
import { Edit, Plus, Search, Calendar, FileText } from 'lucide-react';
import { showToast } from '../../../hooks/useToast';
import { VolunteerVisit } from '../types';

export const VolunteerVisits: React.FC = () => {
  const [visits, setVisits] = useState<VolunteerVisit[]>([]);
  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<VolunteerVisit>({
    id: '',
    volunteerName: '',
    visitDate: new Date().toISOString().split('T')[0],
    purpose: '',
    observation: '',
    outcome: ''
  });

  useEffect(() => {
    loadData();
    window.addEventListener('renu_data_updated', loadData);
    return () => window.removeEventListener('renu_data_updated', loadData);
  }, []);

  const loadData = () => {
    const stored = localStorage.getItem('vishalwin_volunteer_visits');
    if (stored) {
      setVisits(JSON.parse(stored));
    }
  };

  const saveVisits = (newVisits: VolunteerVisit[]) => {
    localStorage.setItem('vishalwin_volunteer_visits', JSON.stringify(newVisits));
    setVisits(newVisits);
    window.dispatchEvent(new Event('renu_data_updated'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.volunteerName.trim()) {
      showToast('Error', 'danger', 'Please enter volunteer name');
      return;
    }
    
    let updated;
    if (formData.id) {
      updated = visits.map(v => v.id === formData.id ? { ...formData } : v);
    } else {
      updated = [{ ...formData, id: Date.now().toString() }, ...visits];
    }
    
    saveVisits(updated);
    setIsModalOpen(false);
    showToast('Success', 'success', 'Visit saved successfully.');
  };

  const openModal = (visit?: VolunteerVisit) => {
    if (visit) {
      setFormData(visit);
    } else {
      setFormData({
        id: '',
        volunteerName: '',
        visitDate: new Date().toISOString().split('T')[0],
        purpose: '',
        observation: '',
        outcome: ''
      });
    }
    setIsModalOpen(true);
  };

  const filtered = visits.filter(v => {
    const matchName = v.volunteerName.toLowerCase().includes(searchName.toLowerCase());
    const matchFrom = dateFrom ? new Date(v.visitDate) >= new Date(dateFrom) : true;
    const matchTo = dateTo ? new Date(v.visitDate) <= new Date(dateTo) : true;
    return matchName && matchFrom && matchTo;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Volunteer & Field Visit Log</h1>
          <p className="text-xs text-slate-500 mt-1">Track and manage individual volunteer field visits.</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Visit
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full md:w-64">
            <Label>Filter by Volunteer</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search volunteer name..." 
                className="pl-9"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-40">
            <Label>Date From</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="w-full md:w-40">
            <Label>Date To</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          {(searchName || dateFrom || dateTo) && (
            <Button variant="outline" onClick={() => { setSearchName(''); setDateFrom(''); setDateTo(''); }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 uppercase">
                <th className="p-4">Volunteer Name</th>
                <th className="p-4">Visit Date</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Observation</th>
                <th className="p-4">Outcome</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold">{v.volunteerName}</td>
                  <td className="p-4 whitespace-nowrap"><Calendar className="h-3 w-3 inline mr-1 text-slate-400" />{v.visitDate}</td>
                  <td className="p-4">{v.purpose || '-'}</td>
                  <td className="p-4 text-slate-600 max-w-[200px] truncate" title={v.observation}>
                    {v.observation || '-'}
                  </td>
                  <td className="p-4 text-slate-600 max-w-[200px] truncate" title={v.outcome}>
                    {v.outcome || '-'}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => openModal(v)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="h-8 w-8 mb-2 opacity-50" />
                      <p>No volunteer visits found.</p>
                      {visits.length === 0 && (
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => openModal()}>
                          Add your first visit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Visit Details" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Volunteer Name *</Label>
              <Input 
                value={formData.volunteerName} 
                onChange={e => setFormData({...formData, volunteerName: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>Visit Date *</Label>
              <Input 
                type="date" 
                value={formData.visitDate} 
                onChange={e => setFormData({...formData, visitDate: e.target.value})} 
                required 
              />
            </div>
            <div className="col-span-2">
              <Label>Purpose</Label>
              <Input 
                value={formData.purpose} 
                onChange={e => setFormData({...formData, purpose: e.target.value})} 
              />
            </div>
            <div className="col-span-2">
              <Label>Observation</Label>
              <Textarea 
                value={formData.observation} 
                onChange={e => setFormData({...formData, observation: e.target.value})} 
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <Label>Outcome</Label>
              <Textarea 
                value={formData.outcome} 
                onChange={e => setFormData({...formData, outcome: e.target.value})} 
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Visit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VolunteerVisits;
