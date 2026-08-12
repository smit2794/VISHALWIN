import React, { useState, useEffect } from 'react';
import { RenuStore } from '../data/renuStore';
import { Card, Button, Input, Select, Label, Modal } from '../../../components/ui';
import { Home, Calendar, Edit, Star, Plus } from 'lucide-react';
import { showToast } from '../../../hooks/useToast';

export const HomeVisits: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    childId: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitedBy: '',
    environmentRating: 'Positive',
    observations: '',
    recommendations: '',
    nextVisitDate: '',
    parentCounsellingDone: false,
    gpsLocation: '',
    photoFileName: ''
  });

  useEffect(() => {
    loadData();
    window.addEventListener('renu_data_updated', loadData);
    return () => window.removeEventListener('renu_data_updated', loadData);
  }, []);

  const loadData = () => {
    setChildren(RenuStore.getChildren());
    const stored = localStorage.getItem('vishalwin_home_visits');
    if (stored) {
      setVisits(JSON.parse(stored));
    }
  };

  const saveVisits = (newVisits: any[]) => {
    localStorage.setItem('vishalwin_home_visits', JSON.stringify(newVisits));
    setVisits(newVisits);
    window.dispatchEvent(new Event('renu_data_updated'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childId) {
      showToast('Error', 'danger', 'Please select a child');
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
    showToast('Success', 'success', 'Home visit saved successfully.');
  };

  const openModal = (visit?: any) => {
    if (visit) {
      setFormData(visit);
    } else {
      setFormData({
        id: '',
        childId: children[0]?.id || '',
        visitDate: new Date().toISOString().split('T')[0],
        visitedBy: '',
        environmentRating: 'Positive',
        observations: '',
        recommendations: '',
        nextVisitDate: '',
        parentCounsellingDone: false,
        gpsLocation: '',
        photoFileName: ''
      });
    }
    setIsModalOpen(true);
  };

  const filtered = visits.filter(v => {
    const matchChild = selectedChildId === 'All' || v.childId === selectedChildId;
    return matchChild;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Home Visit Log</h1>
          <p className="text-xs text-slate-500 mt-1">Track home visits and parent counselling progress across all children.</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Visit
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-64">
            <Label>Filter by Child</Label>
            <Select 
              options={[{label: 'All Children', value: 'All'}, ...children.map(c => ({label: c.name, value: c.id}))]}
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 uppercase">
                <th className="p-4">Child Name</th>
                <th className="p-4">Visit Date</th>
                <th className="p-4">Visited By</th>
                <th className="p-4">Environment</th>
                <th className="p-4">Observations</th>
                <th className="p-4">Next Visit Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(v => {
                const child = children.find(c => c.id === v.childId);
                return (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold">{child?.name || 'Unknown'}</td>
                    <td className="p-4">{v.visitDate}</td>
                    <td className="p-4">{v.visitedBy}</td>
                    <td className="p-4">{v.environmentRating}</td>
                    <td className="p-4 truncate max-w-[200px]">{v.observations}</td>
                    <td className="p-4">{v.nextVisitDate || '-'}</td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => openModal(v)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No home visits recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Home Visit Details" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Child *</Label>
              <Select 
                options={children.map(c => ({label: c.name, value: c.id}))}
                value={formData.childId}
                onChange={e => setFormData({...formData, childId: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Visit Date *</Label>
              <Input type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} required />
            </div>
            <div>
              <Label>Visited By *</Label>
              <Input value={formData.visitedBy} onChange={e => setFormData({...formData, visitedBy: e.target.value})} required />
            </div>
            <div>
              <Label>Environment Rating</Label>
              <Select 
                options={['Positive', 'Negative', 'Scope to Improve'].map(s => ({label: s, value: s}))}
                value={formData.environmentRating as any}
                onChange={e => setFormData({...formData, environmentRating: e.target.value as any})}
              />
            </div>
            <div>
              <Label>Parent Counselling Done?</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input type="checkbox" checked={formData.parentCounsellingDone} onChange={e => setFormData({...formData, parentCounsellingDone: e.target.checked})} className="accent-brand-cyan-700" /> Yes
                </label>
              </div>
            </div>
            <div>
              <Label>Photographs</Label>
              <Button variant="outline" size="sm" className="w-full mt-1 cursor-pointer" type="button" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = (e: any) => {
                  if (e.target.files?.length) {
                    setFormData({...formData, photoFileName: e.target.files[0].name});
                  }
                };
                input.click();
              }}>{formData.photoFileName ? 'Uploaded: ' + formData.photoFileName : 'Upload Photo'}</Button>
            </div>
            <div>
              <Label>GPS Location</Label>
              <div className="flex gap-2">
                <Input value={formData.gpsLocation} onChange={e => setFormData({...formData, gpsLocation: e.target.value})} className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setFormData({...formData, gpsLocation: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`});
                    }, () => showToast('Error', 'danger', 'Unable to get location'));
                  }
                }}>Use My Location</Button>
              </div>
            </div>
            <div className="col-span-2">
              <Label>Observations</Label>
              <Input value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Recommendations</Label>
              <Input value={formData.recommendations} onChange={e => setFormData({...formData, recommendations: e.target.value})} />
            </div>
            <div>
              <Label>Next Visit Date</Label>
              <Input type="date" value={formData.nextVisitDate} onChange={e => setFormData({...formData, nextVisitDate: e.target.value})} />
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

export default HomeVisits;
