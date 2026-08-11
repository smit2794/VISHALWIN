import React, { useState, useEffect } from 'react';
import { awardsStore } from '../data/awardsStore';
import { Nominee, VerificationStatus, SelectionStatus } from '../types';
import { Card, Button, Badge, Input, Select } from '../../../components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, User, FileText, CheckCircle } from 'lucide-react';

export const Nominees: React.FC = () => {
  const [nominees, setNominees] = useState<Nominee[]>(awardsStore.data.nominees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => setNominees(awardsStore.data.nominees);
    window.addEventListener('awards_data_updated', handleStorageChange);
    return () => window.removeEventListener('awards_data_updated', handleStorageChange);
  }, []);

  const getStatusBadge = (status: VerificationStatus | SelectionStatus) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'Clarification Required': return <Badge className="bg-red-100 text-red-700">Clarification Req</Badge>;
      case 'Verified': return <Badge className="bg-blue-100 text-blue-700">Verified</Badge>;
      case 'Under Review': return <Badge className="bg-purple-100 text-purple-700">Under Review</Badge>;
      case 'Shortlisted': return <Badge className="bg-indigo-100 text-indigo-700">Shortlisted</Badge>;
      case 'Selected': return <Badge className="bg-emerald-100 text-emerald-700">Selected</Badge>;
      case 'Not Selected': return <Badge className="bg-slate-100 text-slate-700">Not Selected</Badge>;
      case 'Rejected': return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
    }
  };

  const filteredNominees = nominees.filter(n => {
    const matchesSearch = n.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || n.nomineeType === filterType;
    
    // Check both verification and selection status for filtering ease
    const effectiveStatus = n.verificationSelection.selectionStatus !== 'Under Review' 
      ? n.verificationSelection.selectionStatus 
      : n.verificationSelection.verificationStatus;
      
    const matchesStatus = filterStatus === 'All' || effectiveStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Nominees Database</h1>
          <p className="text-sm text-slate-500">Track and review all Guardian Angel Award nominations</p>
        </div>
        <Button onClick={() => navigate('/awards/nominees/new')} className="flex items-center gap-2">
          + Add New Nominee
        </Button>
      </div>

      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { label: 'All Types', value: 'All' },
                { label: 'Professional', value: 'Professional' },
                { label: 'Caregiver', value: 'Caregiver' }
              ]}
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: 'All Status', value: 'All' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Verified', value: 'Verified' },
                { label: 'Shortlisted', value: 'Shortlisted' },
                { label: 'Selected', value: 'Selected' }
              ]}
            />
          </div>
        </div>
      </Card>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Nominee Name</th>
                <th className="px-6 py-4 font-bold">Category & Type</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNominees.map((nominee) => (
                <tr key={nominee.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={nominee.photograph || 'https://via.placeholder.com/40'} alt={nominee.fullName} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{nominee.fullName}</div>
                        <div className="text-xs text-slate-500">{nominee.id} • Added {nominee.dateOfNomination}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{nominee.awardCategory}</div>
                    <div className="text-xs text-slate-500">{nominee.nomineeType}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {nominee.city}, {nominee.state}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(nominee.verificationSelection.selectionStatus !== 'Under Review' ? nominee.verificationSelection.selectionStatus : nominee.verificationSelection.verificationStatus)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/awards/nominees/${nominee.id}`)} className="text-xs px-3 py-1.5 flex items-center gap-1.5 ml-auto">
                      <Eye className="h-3.5 w-3.5" /> View Profile
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredNominees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <User className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                    <p className="font-medium text-slate-600">No nominees found</p>
                    <p className="text-xs mt-1">Adjust your filters or add a new nominee.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Nominees;
