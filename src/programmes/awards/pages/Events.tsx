import React, { useState, useEffect } from 'react';
import { awardsStore } from '../data/awardsStore';
import { AwardEvent, AwardCategory, EventStatus, EventType, EventSession, IECMaterial } from '../types';
import { Card, Button, Badge, Modal, Input, Select } from '../../../components/ui';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { showToast } from '../../../hooks/useToast';
import { Plus, Edit2, Calendar, MapPin, Tag } from 'lucide-react';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<AwardEvent[]>(awardsStore.data.events);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AwardEvent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [status, setStatus] = useState<EventStatus>('Planned');
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [eventType, setEventType] = useState<EventType>('Annual');
  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [iecMaterials, setIecMaterials] = useState<IECMaterial[]>([]);

  useEffect(() => {
    const handleStorageChange = () => setEvents(awardsStore.data.events);
    window.addEventListener('awards_data_updated', handleStorageChange);
    return () => window.removeEventListener('awards_data_updated', handleStorageChange);
  }, []);

  const resetForm = () => {
    setEditingEvent(null);
    setName('');
    setYear(new Date().getFullYear().toString());
    setDate('');
    setTime('18:00');
    setVenue('');
    setAddress('');
    setCity('');
    setStateName('');
    setStatus('Planned');
    setCategories([]);
    setEventType('Annual');
    setSessions([]);
    setIecMaterials([]);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (evt: AwardEvent) => {
    setEditingEvent(evt);
    setName(evt.name);
    setYear(evt.year);
    setDate(evt.date);
    setTime(evt.time || '18:00');
    setVenue(evt.venue);
    setAddress(evt.address || '');
    setCity(evt.city || '');
    setStateName(evt.state || '');
    setStatus(evt.status);
    setCategories([...evt.categories]);
    setEventType(evt.eventType || 'Annual');
    setSessions([...(evt.sessions || [])]);
    setIecMaterials([...(evt.iecMaterials || [])]);
    setIsModalOpen(true);
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: `CAT-TEMP-${Date.now()}`,
        name: '',
        description: '',
        eligibility: '',
        nominationCount: 0,
        selectedCount: 0
      }
    ]);
  };

  const updateCategory = (index: number, field: keyof AwardCategory, value: string) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], [field]: value };
    setCategories(newCats);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name || !year || !date) {
      showToast('Validation Error', 'danger', 'Please fill required fields: Name, Year, Date.');
      return;
    }

    const newEvent: AwardEvent = {
      id: editingEvent ? editingEvent.id : `EVT-${year}-${Date.now()}`,
      name,
      year,
      date,
      time,
      venue,
      address,
      city,
      state: stateName,
      status,
      categories,
      eventType,
      sessions,
      iecMaterials
    };

    const currentData = awardsStore.data;
    if (editingEvent) {
      currentData.events = currentData.events.map(e => e.id === editingEvent.id ? newEvent : e);
      showToast('Event Updated', 'success');
    } else {
      currentData.events.push(newEvent);
      showToast('Event Created', 'success');
    }

    localStorage.setItem('vishalwin_awards', JSON.stringify(currentData));
    window.dispatchEvent(new Event('awards_data_updated'));
    setIsModalOpen(false);
  };

  const getStatusColor = (s: EventStatus) => {
    switch (s) {
      case 'Planned': return 'bg-slate-100 text-slate-700';
      case 'Nomination Open': return 'bg-blue-100 text-blue-700';
      case 'Nomination Closed': return 'bg-amber-100 text-amber-700';
      case 'Selection in Progress': return 'bg-purple-100 text-purple-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Award Events</h1>
          <p className="text-sm text-slate-500">Manage Guardian Angel Award events and categories</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events.map(evt => (
          <Card key={evt.id} className="p-0 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 font-display">{evt.name}</h3>
                  <Badge className={getStatusColor(evt.status)}>{evt.status}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {evt.date} ({evt.year})</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {evt.venue || 'TBA'}</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => openEditModal(evt)} className="flex items-center gap-2">
                <Edit2 className="h-4 w-4" /> Edit Event
              </Button>
            </div>
            
            <div className="p-5">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Tag className="h-4 w-4" /> Award Categories ({evt.categories.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {evt.categories.map(cat => (
                  <div key={cat.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <h5 className="font-bold text-slate-800 mb-1">{cat.name}</h5>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cat.description}</p>
                    <div className="flex justify-between items-center text-xs font-medium border-t border-slate-100 pt-3">
                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{cat.nominationCount} Nominations</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{cat.selectedCount} Selected</span>
                    </div>
                  </div>
                ))}
                {evt.categories.length === 0 && (
                  <div className="text-sm text-slate-400 italic">No categories defined yet.</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Create Event'} size="xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Event Name *</label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Event Type</label>
              <Select 
                value={eventType} 
                onChange={e => setEventType(e.target.value as EventType)}
                options={[
                  { label: 'Annual', value: 'Annual' },
                  { label: 'Regional', value: 'Regional' },
                  { label: 'Special', value: 'Special' },
                  { label: 'Inaugural', value: 'Inaugural' }
                ]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Year *</label>
              <Input value={year} onChange={e => setYear(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Date *</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Time</label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Venue</label>
              <Input value={venue} onChange={e => setVenue(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Address</label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">City</label>
              <Input value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">State</label>
              <Input value={stateName} onChange={e => setStateName(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Status</label>
              <Select 
                value={status} 
                onChange={e => setStatus(e.target.value as EventStatus)}
                options={[
                  { label: 'Planned', value: 'Planned' },
                  { label: 'Nomination Open', value: 'Nomination Open' },
                  { label: 'Nomination Closed', value: 'Nomination Closed' },
                  { label: 'Selection in Progress', value: 'Selection in Progress' },
                  { label: 'Completed', value: 'Completed' }
                ]}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-800">Categories</h4>
              <Button variant="outline" size="sm" onClick={addCategory}>+ Add Category</Button>
            </div>
            
            <div className="space-y-4">
              {categories.map((cat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <button onClick={() => removeCategory(idx)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                  <div className="grid grid-cols-1 gap-3 pr-10">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Category Name</label>
                      <Input value={cat.name} onChange={e => updateCategory(idx, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Description</label>
                      <Input value={cat.description} onChange={e => updateCategory(idx, 'description', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Eligibility Criteria</label>
                      <Input value={cat.eligibility} onChange={e => updateCategory(idx, 'eligibility', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-xs text-slate-500">No categories added. Click Add Category to define awards.</p>}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-800">Session Schedule</h4>
              <Button variant="outline" size="sm" onClick={() => setSessions([...sessions, { id: 'SES-'+Date.now(), name: '', startTime: '', endTime: '', speakerName: '' }])}>+ Add Session</Button>
            </div>
            <div className="space-y-4">
              {sessions.map((ses, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <button onClick={() => setSessions(sessions.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-10">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Session Name</label>
                      <Input value={ses.name} onChange={e => { const newS = [...sessions]; newS[idx].name = e.target.value; setSessions(newS); }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Speaker Name</label>
                      <Input value={ses.speakerName} onChange={e => { const newS = [...sessions]; newS[idx].speakerName = e.target.value; setSessions(newS); }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Start Time</label>
                      <Input type="time" value={ses.startTime} onChange={e => { const newS = [...sessions]; newS[idx].startTime = e.target.value; setSessions(newS); }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">End Time</label>
                      <Input type="time" value={ses.endTime} onChange={e => { const newS = [...sessions]; newS[idx].endTime = e.target.value; setSessions(newS); }} />
                    </div>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && <p className="text-xs text-slate-500">No sessions added.</p>}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-800">IEC Material Tracking</h4>
              <Button variant="outline" size="sm" onClick={() => setIecMaterials([...iecMaterials, { id: 'IEC-'+Date.now(), type: 'Banner', quantity: 1, status: 'Pending' }])}>+ Add Material</Button>
            </div>
            <div className="space-y-4">
              {iecMaterials.map((mat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <button onClick={() => setIecMaterials(iecMaterials.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pr-10 items-end">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Type</label>
                      <Select 
                        value={mat.type} 
                        onChange={e => { const newM = [...iecMaterials]; newM[idx].type = e.target.value as any; setIecMaterials(newM); }}
                        options={[
                          { label: 'Invitation Card', value: 'Invitation Card' },
                          { label: 'Banner', value: 'Banner' },
                          { label: 'Brochure', value: 'Brochure' },
                          { label: 'Backdrop', value: 'Backdrop' },
                          { label: 'Other', value: 'Other' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Quantity</label>
                      <Input type="number" value={mat.quantity.toString()} onChange={e => { const newM = [...iecMaterials]; newM[idx].quantity = parseInt(e.target.value)||0; setIecMaterials(newM); }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Status</label>
                      <Select 
                        value={mat.status} 
                        onChange={e => { const newM = [...iecMaterials]; newM[idx].status = e.target.value as any; setIecMaterials(newM); }}
                        options={[
                          { label: 'Pending', value: 'Pending' },
                          { label: 'Ordered', value: 'Ordered' },
                          { label: 'Received', value: 'Received' },
                          { label: 'Distributed', value: 'Distributed' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700 flex justify-between">Sample {mat.sampleFileName && <span className="text-emerald-600 truncate ml-2">({mat.sampleFileName})</span>}</label>
                      <div className="relative">
                        <Button variant="outline" className="w-full" onClick={() => document.getElementById(`iec-upload-${idx}`)?.click()}>
                          Upload Sample
                        </Button>
                        <input 
                          type="file" 
                          id={`iec-upload-${idx}`} 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const newM = [...iecMaterials];
                              newM[idx].sampleFileName = e.target.files[0].name;
                              setIecMaterials(newM);
                              showToast('Sample uploaded successfully', 'success');
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {iecMaterials.length === 0 && <p className="text-xs text-slate-500">No materials added.</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingEvent ? 'Save Changes' : 'Create Event'}</Button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Events;
