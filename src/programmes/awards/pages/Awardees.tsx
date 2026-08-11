import React, { useState, useEffect } from 'react';
import { awardsStore } from '../data/awardsStore';
import { Awardee } from '../types';
import { Card, Button, Input, Badge, Select } from '../../../components/ui';
import { Search, Trophy, Medal, MapPin, Phone, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/ui/ToastContainer';

export const Awardees: React.FC = () => {
  const [awardees, setAwardees] = useState<Awardee[]>(awardsStore.data.awardees);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<any>('Not Started');
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => setAwardees(awardsStore.data.awardees);
    window.addEventListener('awards_data_updated', handleStorageChange);
    return () => window.removeEventListener('awards_data_updated', handleStorageChange);
  }, []);

  const filteredAwardees = awardees.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (a: Awardee) => {
    setEditingId(a.id);
    setEditNotes(a.futureEngagementNotes || '');
    setEditStatus(a.followUpStatus || 'Not Started');
  };

  const saveEdit = (aId: string) => {
    const data = awardsStore.data;
    const idx = data.awardees.findIndex(x => x.id === aId);
    if (idx !== -1) {
      data.awardees[idx].futureEngagementNotes = editNotes;
      data.awardees[idx].followUpStatus = editStatus;
      localStorage.setItem('vishalwin_awards', JSON.stringify(data));
      window.dispatchEvent(new Event('awards_data_updated'));
      showToast('Engagement details updated', 'success');
    }
    setEditingId(null);
  };

  const getStatusColor = (s?: string) => {
    switch (s) {
      case 'Contacted': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Guardian Angel Awardees</h1>
          <p className="text-sm text-slate-500">Hall of fame for all past and present award recipients</p>
        </div>
      </div>

      <Card className="p-4 bg-white border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by awardee name, ID, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAwardees.map(awardee => (
          <Card key={awardee.id} className="p-0 overflow-hidden flex flex-col">
            <div className="h-24 bg-gradient-to-r from-amber-500 to-amber-600 relative">
              <div className="absolute -bottom-10 left-6">
                <img 
                  src={awardee.photograph || 'https://via.placeholder.com/150'} 
                  alt={awardee.name}
                  className="h-20 w-20 rounded-full border-4 border-white object-cover bg-white"
                />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className={getStatusColor(awardee.followUpStatus || 'Not Started')}>
                  {awardee.followUpStatus || 'Not Started'}
                </Badge>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                  <Medal className="h-3 w-3" /> {awardee.awardYear}
                </div>
              </div>
            </div>
            <div className="p-6 pt-12 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 font-display">{awardee.name}</h3>
              <p className="text-sm font-bold text-amber-600 mb-1">{awardee.category}</p>
              <p className="text-xs text-slate-500 mb-4">{awardee.professionRole} {awardee.organisation ? `at ${awardee.organisation}` : ''}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {awardee.city}, {awardee.state}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {awardee.contactDetails}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-auto mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contribution</p>
                <p className="text-sm text-slate-700 line-clamp-2">{awardee.contributionSummary}</p>
              </div>

              {/* Ceremony Photo Placeholder */}
              {awardee.ceremonyRecord?.ceremonyPhotograph && (
                <div className="flex items-center gap-2 mb-4 bg-emerald-50 text-emerald-700 p-2 rounded-lg text-xs font-medium border border-emerald-100 w-fit">
                  <ImageIcon className="h-4 w-4" /> Ceremony Photo: {awardee.ceremonyRecord.ceremonyPhotograph}
                </div>
              )}

              {/* Future Engagement */}
              {editingId === awardee.id ? (
                <div className="space-y-3 bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2">
                  <Select 
                    value={editStatus} 
                    onChange={e => setEditStatus(e.target.value)}
                    options={[
                      { label: 'Not Started', value: 'Not Started' },
                      { label: 'Contacted', value: 'Contacted' },
                      { label: 'In Progress', value: 'In Progress' },
                      { label: 'Completed', value: 'Completed' }
                    ]}
                  />
                  <textarea 
                    className="w-full rounded-lg border-slate-300 text-sm p-2 focus:border-blue-500 min-h-[60px]"
                    placeholder="Future engagement notes..."
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(awardee.id)}>Save</Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start mt-2">
                  <div className="flex-1 pr-2">
                    <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Engagement Notes
                    </p>
                    <p className="text-sm text-slate-700 mt-1 line-clamp-2">{awardee.futureEngagementNotes || <span className="text-slate-400 italic">No notes added</span>}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => startEdit(awardee)}>Edit</Button>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">
                Cert: {awardee.certificateNumber || 'Pending'}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate(`/awards/nominees/${awardee.nomineeId}`)}>
                View Original Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredAwardees.length === 0 && (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl">
          <Trophy className="h-16 w-16 mx-auto text-amber-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Awardees Found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Once nominees are selected and processed through the Ceremony module, they will permanently appear here in the Hall of Fame.
          </p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Awardees;
