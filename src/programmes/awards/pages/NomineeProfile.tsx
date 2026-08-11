import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { awardsStore } from '../data/awardsStore';
import { Nominee, VerificationStatus, SelectionStatus } from '../types';
import { Card, Button, Badge, Select, Input } from '../../../components/ui';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { showToast } from '../../../hooks/useToast';
import { ArrowLeft, User, FileText, CheckCircle, Upload, Save, Link as LinkIcon, Award, Briefcase, MapPin } from 'lucide-react';

export const NomineeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');
  const [nominee, setNominee] = useState<Nominee | null>(null);

  // Local state for Verification/Selection to allow editing
  const [vStatus, setVStatus] = useState<VerificationStatus>('Pending');
  const [vRemarks, setVRemarks] = useState('');
  const [sStatus, setSStatus] = useState<SelectionStatus>('Under Review');
  const [sRemarks, setSRemarks] = useState('');
  const [docStatuses, setDocStatuses] = useState<Record<string, string>>({});
  const [verifiedBy, setVerifiedBy] = useState('');
  const [verificationDate, setVerificationDate] = useState('');
  const [ceremonyLink, setCeremonyLink] = useState<any>(null);

  useEffect(() => {
    const data = awardsStore.data.nominees.find(n => n.id === id);
    if (data) {
      setNominee(data);
      setVStatus(data.verificationSelection.verificationStatus);
      setVRemarks(data.verificationSelection.verificationRemarks || '');
      setSStatus(data.verificationSelection.selectionStatus);
      setSRemarks(data.verificationSelection.selectionRemarks || '');
      setDocStatuses(data.documentStatuses || {});
      setVerifiedBy(data.verificationSelection.verifiedBy || '');
      setVerificationDate(data.verificationSelection.verificationDate || '');
      
      if (data.verificationSelection.selectionStatus === 'Selected') {
        const awardee = awardsStore.data.awardees.find(a => a.nomineeId === data.id);
        if (awardee && awardee.ceremonyRecord) {
          setCeremonyLink(awardee.ceremonyRecord);
        }
      }
    }
  }, [id]);

  if (!nominee) {
    return <div className="p-12 text-center text-slate-500">Loading nominee profile...</div>;
  }

  const handleSaveVerification = () => {
    const updated = { ...nominee };
    updated.verificationSelection = {
      ...updated.verificationSelection,
      verificationStatus: vStatus,
      verificationRemarks: vRemarks,
      selectionStatus: sStatus,
      selectionRemarks: sRemarks,
      verificationDate: verificationDate,
      verifiedBy: verifiedBy
    };
    
    // Simulate updating store
    const currentData = awardsStore.data;
    const idx = currentData.nominees.findIndex(n => n.id === id);
    if (idx !== -1) {
      updated.documentStatuses = docStatuses;
      currentData.nominees[idx] = updated;
      localStorage.setItem('vishalwin_awards', JSON.stringify(currentData));
      window.dispatchEvent(new Event('awards_data_updated'));
      setNominee(updated);
      showToast('Verification details updated', 'success');
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Clarification Required': return 'bg-red-100 text-red-700';
      case 'Verified': return 'bg-blue-100 text-blue-700';
      case 'Under Review': return 'bg-purple-100 text-purple-700';
      case 'Shortlisted': return 'bg-indigo-100 text-indigo-700';
      case 'Selected': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/awards/nominees')} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-slate-900">{nominee.fullName}</h1>
            <Badge className={getStatusColor(nominee.verificationSelection.selectionStatus !== 'Under Review' ? nominee.verificationSelection.selectionStatus : nominee.verificationSelection.verificationStatus)}>
              {nominee.verificationSelection.selectionStatus !== 'Under Review' ? nominee.verificationSelection.selectionStatus : nominee.verificationSelection.verificationStatus}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">{nominee.id} • Nominated on {nominee.dateOfNomination}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Profile Snapshot */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <Card className="p-6 text-center">
            <img src={nominee.photograph || 'https://via.placeholder.com/150'} alt="Profile" className="h-32 w-32 rounded-full mx-auto object-cover border-4 border-slate-50 shadow-sm mb-4" />
            <h3 className="text-lg font-bold text-slate-800">{nominee.fullName}</h3>
            <p className="text-sm font-medium text-blue-600 mb-1">{nominee.awardCategory}</p>
            <p className="text-xs text-slate-500 mb-4">{nominee.nomineeType}</p>
            
            <div className="border-t border-slate-100 pt-4 mt-2 grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mobile</p>
                <p className="text-sm font-medium text-slate-700">{nominee.mobile}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">City</p>
                <p className="text-sm font-medium text-slate-700">{nominee.city}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
            {['Personal', 'Nomination Details', 'Documents', 'Verification & Selection'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Card className="p-6 min-h-[500px]">
            {activeTab === 'Personal' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" /> Basic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</span><span className="text-slate-800 font-medium">{nominee.fullName}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</span><span className="text-slate-800 font-medium">{nominee.gender}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</span><span className="text-slate-800 font-medium">{nominee.email || 'N/A'}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile</span><span className="text-slate-800 font-medium">{nominee.mobile}</span></div>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" /> Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="md:col-span-2"><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</span><span className="text-slate-800 font-medium">{nominee.address}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">City</span><span className="text-slate-800 font-medium">{nominee.city}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">District</span><span className="text-slate-800 font-medium">{nominee.district}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">State</span><span className="text-slate-800 font-medium">{nominee.state}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Nomination Details' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-500" /> Professional/Caregiver Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Organisation</span><span className="text-slate-800 font-medium">{nominee.organisationName || 'N/A'}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Designation</span><span className="text-slate-800 font-medium">{nominee.designation || 'N/A'}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Area of Work</span><span className="text-slate-800 font-medium">{nominee.areaOfWork}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Years of Exp</span><span className="text-slate-800 font-medium">{nominee.yearsOfExperience} years</span></div>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-500" /> Achievement Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description of Work</span>
                      <p className="text-slate-800 text-sm leading-relaxed">{nominee.achievement.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Work for Special Needs</span>
                        <p className="text-slate-800 text-sm leading-relaxed">{nominee.achievement.workForSpecialNeeds}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Beneficiaries Supported</span>
                        <p className="text-slate-800 text-sm leading-relaxed">{nominee.achievement.beneficiariesSupported || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-500" /> Nominator Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</span><span className="text-slate-800 font-medium">{nominee.nominator?.name || 'Self'}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Relationship</span><span className="text-slate-800 font-medium">{nominee.nominator?.relationship || 'Self'}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile</span><span className="text-slate-800 font-medium">{nominee.nominator?.mobile || 'N/A'}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Documents' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" /> Supporting Documents
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: 'photo', label: 'Profile Photograph' },
                    { key: 'idProof', label: 'Nominee ID Proof' },
                    { key: 'nomLetter', label: 'Nomination Letter' },
                    { key: 'workEvidence', label: 'Work Evidence / Certificates' },
                    { key: 'other', label: 'Any Other Document' }
                  ].map(doc => (
                    <div key={doc.key} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex flex-shrink-0 items-center justify-center text-slate-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{doc.label}</p>
                          <Badge className={docStatuses[doc.key] ? 'bg-emerald-100 text-emerald-700 mt-1' : 'bg-amber-100 text-amber-700 mt-1'}>
                            {docStatuses[doc.key] ? `Uploaded: ${docStatuses[doc.key]}` : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" onClick={() => document.getElementById(`doc-${doc.key}`)?.click()}>
                          <Upload className="h-4 w-4 mr-2" /> Upload
                        </Button>
                        <input 
                          type="file" 
                          id={`doc-${doc.key}`} 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              const newDocs = { ...docStatuses, [doc.key]: e.target.files[0].name };
                              setDocStatuses(newDocs);
                              
                              // Auto save
                              const currentData = awardsStore.data;
                              const idx = currentData.nominees.findIndex(n => n.id === id);
                              if (idx !== -1) {
                                currentData.nominees[idx].documentStatuses = newDocs;
                                localStorage.setItem('vishalwin_awards', JSON.stringify(currentData));
                                window.dispatchEvent(new Event('awards_data_updated'));
                                showToast(`${doc.label} uploaded successfully`, 'success');
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Verification & Selection' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" /> Verification Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Verification Outcome</label>
                      <Select 
                        value={vStatus} 
                        onChange={e => setVStatus(e.target.value as VerificationStatus)}
                        options={[
                          { label: 'Pending', value: 'Pending' },
                          { label: 'Verified', value: 'Verified' },
                          { label: 'Clarification Required', value: 'Clarification Required' },
                          { label: 'Rejected', value: 'Rejected' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Verification Remarks</label>
                      <Input value={vRemarks} onChange={e => setVRemarks(e.target.value)} placeholder="Add remarks..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Verified By</label>
                      <Input value={verifiedBy} onChange={e => setVerifiedBy(e.target.value)} placeholder="Enter name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Verification Date</label>
                      <Input type="date" value={verificationDate} onChange={e => setVerificationDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" /> Final Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Selection Outcome</label>
                      <Select 
                        value={sStatus} 
                        onChange={e => setSStatus(e.target.value as SelectionStatus)}
                        options={[
                          { label: 'Under Review', value: 'Under Review' },
                          { label: 'Shortlisted', value: 'Shortlisted' },
                          { label: 'Selected', value: 'Selected' },
                          { label: 'Not Selected', value: 'Not Selected' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Selection Remarks</label>
                      <Input value={sRemarks} onChange={e => setSRemarks(e.target.value)} placeholder="Add selection remarks..." />
                    </div>
                  </div>
                </div>

                {ceremonyLink && (
                  <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mt-6">
                    <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-emerald-600" /> Linked Ceremony Record
                    </h3>
                    <div className="text-sm text-slate-700">
                      <p><strong>Ceremony Date:</strong> {ceremonyLink.awardDate}</p>
                      <p><strong>Venue:</strong> {ceremonyLink.venue}</p>
                      <p><strong>Attendance:</strong> {ceremonyLink.attendanceStatus}</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/awards/ceremony')}>View Ceremony Dashboard</Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveVerification} className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Verification & Selection
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default NomineeProfile;
