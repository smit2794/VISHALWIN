import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Select, Label, Modal, Textarea, Badge } from '../../../components/ui';
import { Edit, Plus, Search, Building2, MapPin, Phone, Upload, CheckCircle, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { showToast } from '../../../hooks/useToast';
import { Stakeholder, StakeholderCategory } from '../types';

const CATEGORIES: StakeholderCategory[] = [
  'Medical Experts',
  'Therapy Centres',
  'Special Schools',
  'NGOs',
  'Hospitals',
  'Government Departments',
  'CSR Partners',
  'Donors',
  'Volunteers'
];

export const Stakeholders: React.FC = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StakeholderCategory | 'All'>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Stakeholder>({
    id: '',
    category: 'Medical Experts',
    name: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    notes: '',
    isActive: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<keyof Stakeholder | null>(null);

  useEffect(() => {
    loadData();
    window.addEventListener('renu_data_updated', loadData);
    return () => window.removeEventListener('renu_data_updated', loadData);
  }, []);

  const loadData = () => {
    const stored = localStorage.getItem('vishalwin_stakeholders');
    if (stored) {
      setStakeholders(JSON.parse(stored));
    }
  };

  const saveStakeholders = (newData: Stakeholder[]) => {
    localStorage.setItem('vishalwin_stakeholders', JSON.stringify(newData));
    setStakeholders(newData);
    window.dispatchEvent(new Event('renu_data_updated'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Error', 'danger', 'Please enter name');
      return;
    }
    
    let updated;
    if (formData.id) {
      updated = stakeholders.map(s => s.id === formData.id ? { ...formData } : s);
    } else {
      updated = [{ ...formData, id: Date.now().toString() }, ...stakeholders];
    }
    
    saveStakeholders(updated);
    setIsModalOpen(false);
    showToast('Success', 'success', 'Stakeholder saved successfully.');
  };

  const openModal = (stakeholder?: Stakeholder) => {
    if (stakeholder) {
      setFormData(stakeholder);
    } else {
      setFormData({
        id: '',
        category: activeTab !== 'All' ? activeTab : 'Medical Experts',
        name: '',
        contactPerson: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        state: '',
        notes: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      setFormData(prev => ({
        ...prev,
        [uploadTarget]: file.name
      }));
      showToast('Success', 'success', `File "${file.name}" uploaded successfully.`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadTarget(null);
  };

  const triggerUpload = (target: keyof Stakeholder) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const filtered = stakeholders.filter(s => {
    const matchTab = activeTab === 'All' || s.category === activeTab;
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        (s.city || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hidden file input for fake uploads */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Stakeholder Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Unified directory for experts, centres, NGOs, partners and volunteers.</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Stakeholder
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 xl:w-1/4 space-y-2">
          <Card className="p-2">
            <button
              onClick={() => setActiveTab('All')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'All' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors mt-1 ${
                  activeTab === cat ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </Card>
        </div>

        <div className="w-full md:w-2/3 xl:w-3/4 space-y-4">
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search stakeholders by name or city..." 
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filtered.map(s => (
              <Card key={s.id} className="p-5 flex flex-col justify-between hover:border-red-200 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="bg-slate-50">{s.category}</Badge>
                    <div className="flex items-center gap-2">
                      {!s.isActive && <Badge variant="outline" className="text-red-500 border-red-200">Inactive</Badge>}
                      <Button variant="outline" size="sm" onClick={() => openModal(s)} className="flex items-center gap-1 text-xs">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    {s.name}
                  </h3>
                  
                  <div className="space-y-2 mt-4 text-sm text-slate-600">
                    {s.contactPerson && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-24">Contact:</span>
                        <span>{s.contactPerson}</span>
                      </div>
                    )}
                    {s.mobile && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-24">Mobile:</span>
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{s.mobile}</span>
                      </div>
                    )}
                    {(s.city || s.state) && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-24">Location:</span>
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{[s.city, s.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
                  {s.mouFileName && <Badge color="primary" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> MoU</Badge>}
                  {s.agreementFileName && <Badge color="primary" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Agreement</Badge>}
                  {s.documentsFileName && <Badge variant="outline" className="flex items-center gap-1"><FileText className="h-3 w-3" /> Docs</Badge>}
                  {!s.mouFileName && !s.agreementFileName && !s.documentsFileName && (
                    <span className="text-xs text-slate-400">No documents</span>
                  )}
                </div>
              </Card>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Building2 className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">No stakeholders found in this category.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => openModal()}>
                    Add Stakeholder
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Stakeholder Details" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select 
                options={CATEGORIES.map(c => ({label: c, value: c}))}
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as StakeholderCategory})}
                required
              />
            </div>
            <div>
              <Label>Name / Organization *</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            
            <div>
              <Label>Contact Person</Label>
              <Input 
                value={formData.contactPerson || ''} 
                onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input 
                value={formData.mobile || ''} 
                onChange={e => setFormData({...formData, mobile: e.target.value})} 
              />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={formData.email || ''} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div>
              <Label>City</Label>
              <Input 
                value={formData.city || ''} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <Label>Address</Label>
              <Textarea 
                value={formData.address || ''} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                rows={2}
              />
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <h4 className="font-semibold text-slate-700 mb-3">Documents & Files</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1 truncate pr-2">
                    <span className="font-semibold block mb-1">MoU Document</span>
                    {formData.mouFileName ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {formData.mouFileName}</span>
                    ) : (
                      <span className="text-slate-400">Not uploaded</span>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => triggerUpload('mouFileName')}>
                    <Upload className="h-3 w-3 mr-1" /> Upload
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1 truncate pr-2">
                    <span className="font-semibold block mb-1">Agreement</span>
                    {formData.agreementFileName ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {formData.agreementFileName}</span>
                    ) : (
                      <span className="text-slate-400">Not uploaded</span>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => triggerUpload('agreementFileName')}>
                    <Upload className="h-3 w-3 mr-1" /> Upload
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1 truncate pr-2">
                    <span className="font-semibold block mb-1">Photos</span>
                    {formData.photosFileName ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {formData.photosFileName}</span>
                    ) : (
                      <span className="text-slate-400">Not uploaded</span>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => triggerUpload('photosFileName')}>
                    <Upload className="h-3 w-3 mr-1" /> Upload
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1 truncate pr-2">
                    <span className="font-semibold block mb-1">Other Documents</span>
                    {formData.documentsFileName ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {formData.documentsFileName}</span>
                    ) : (
                      <span className="text-slate-400">Not uploaded</span>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => triggerUpload('documentsFileName')}>
                    <Upload className="h-3 w-3 mr-1" /> Upload
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <Label>Internal Notes</Label>
              <Textarea 
                value={formData.notes || ''} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                rows={2}
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className="flex items-center gap-2"
              >
                {formData.isActive ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-300" />
                )}
                <span className="font-semibold">Active Status</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Stakeholder</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Stakeholders;
