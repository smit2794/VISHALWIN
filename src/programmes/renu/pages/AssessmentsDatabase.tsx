import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RenuStore } from '../data/renuStore';
import { Child, AssessmentRecord, AssessmentType } from '../types';
import { Card, Badge, Button, Input, Select, Label } from '../../../components/ui';
import { Search, Stethoscope, Filter, Printer, ExternalLink, Calendar, CheckCircle2, FileText, Activity } from 'lucide-react';

export const AssessmentsDatabase: React.FC = () => {
  const navigate = useNavigate();

  // Data State
  const [children, setChildren] = useState<Child[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [childFilter, setChildFilter] = useState<string>('All');

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('renu_data_updated', handleUpdate);
    return () => window.removeEventListener('renu_data_updated', handleUpdate);
  }, []);

  const loadData = () => {
    setChildren(RenuStore.getChildren());
  };

  // Flatten all assessment records across all children
  const allAssessments: { child: Child; record: AssessmentRecord; index: number }[] = [];

  children.forEach(child => {
    if (child.assessments && child.assessments.length > 0) {
      child.assessments.forEach((record, index) => {
        allAssessments.push({ child, record, index });
      });
    }
  });

  // Filter Logic
  const filteredAssessments = allAssessments.filter(item => {
    const matchesChild = childFilter === 'All' || item.child.id === childFilter;
    const matchesType = typeFilter === 'All' || item.record.type === typeFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.child.name.toLowerCase().includes(query) ||
      item.child.id.toLowerCase().includes(query) ||
      (item.record.toolUsed && item.record.toolUsed.toLowerCase().includes(query)) ||
      (item.record.conductedBy && item.record.conductedBy.toLowerCase().includes(query)) ||
      (item.record.finding && item.record.finding.toLowerCase().includes(query));

    return matchesChild && matchesType && matchesSearch;
  });

  const assessmentTypes: AssessmentType[] = [
    'Initial',
    'Developmental',
    'IQ',
    'Functional',
    'Behaviour',
    'Communication',
    'Motor',
    'Sensory Profile',
    'ADL'
  ];

  return (
    <div className="space-y-6 w-full max-w-none px-6 md:px-8 xl:px-12 pb-12">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-assessments, #printable-assessments * { visibility: visible; }
          #printable-assessments { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/85 border border-slate-200/80 p-6 rounded-2xl shadow-xs backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shadow-inner">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-extrabold text-slate-900">
              Section D: Clinical Assessment Database
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Cross-child master view of IQ, Functional, Behavioural, Motor, Speech & Sensory evaluations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1.5 cursor-pointer">
            <Printer className="h-4 w-4" /> Print Database Report
          </Button>
        </div>
      </div>

      {/* Stats Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/40 to-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Assessments Evaluated</span>
          <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">{allAssessments.length}</span>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-50/40 to-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Children Assessed</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {new Set(allAssessments.map(a => a.child.id)).size}
          </span>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50/40 to-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">IQ Assessments Logged</span>
          <span className="text-2xl font-extrabold text-purple-700 mt-1 block">
            {allAssessments.filter(a => a.record.type === 'IQ').length}
          </span>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-50/40 to-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Reports Attached</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
            {allAssessments.filter(a => a.record.reportFileName).length}
          </span>
        </Card>
      </div>

      {/* Filter Controls Card */}
      <Card className="p-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs mb-1">Search Children / Specialist / Tools</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by child name, tool, evaluator..."
                className="pl-9 text-xs h-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1">Assessment Type</Label>
            <Select
              className="h-9 text-xs"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={[{ label: 'All Assessment Types', value: 'All' }, ...assessmentTypes.map(t => ({ label: `${t} Assessment`, value: t }))]}
            />
          </div>

          <div>
            <Label className="text-xs mb-1">Filter by Child</Label>
            <Select
              className="h-9 text-xs"
              value={childFilter}
              onChange={e => setChildFilter(e.target.value)}
              options={[{ label: 'All Children', value: 'All' }, ...children.map(c => ({ label: `${c.name} (${c.id})`, value: c.id }))]}
            />
          </div>
        </div>
      </Card>

      {/* Master Assessments Table */}
      <div id="printable-assessments">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Child Details</th>
                  <th className="p-3.5">Assessment Type</th>
                  <th className="p-3.5">Evaluation Date</th>
                  <th className="p-3.5">Tool / Scale Used</th>
                  <th className="p-3.5">Score & Level</th>
                  <th className="p-3.5">Evaluator Specialist</th>
                  <th className="p-3.5">Report Attachment</th>
                  <th className="p-3.5 text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssessments.length > 0 ? (
                  filteredAssessments.map(({ child, record, index }) => (
                    <tr key={`${child.id}-${index}`} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div
                          onClick={() => navigate(`/renu/children/${child.id}`)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer flex items-center gap-1.5"
                        >
                          {child.name}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">ID: {child.id}</span>
                      </td>

                      <td className="p-3.5">
                        <Badge color="primary" className="font-bold">
                          {record.type}
                        </Badge>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-700">
                        {record.date || 'N/A'}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800">{record.toolUsed || 'General Evaluation'}</span>
                      </td>

                      <td className="p-3.5">
                        {record.score !== undefined && (
                          <span className="font-extrabold text-indigo-700 block">Score: {record.score}</span>
                        )}
                        <span className="text-[10px] text-slate-500 block">Category: {record.category || 'Standard'}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-700 block">{record.conductedBy || 'Clinical Evaluator'}</span>
                        <span className="text-[10px] text-slate-400 block italic truncate max-w-[150px]">{record.finding || 'Evaluated'}</span>
                      </td>

                      <td className="p-3.5">
                        {record.reportFileName ? (
                          <Badge color="success" className="text-[9px]">
                            {record.reportFileName}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">No Attachment</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right no-print">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/renu/children/${child.id}`)}
                          className="text-[10px] h-7 px-2"
                        >
                          View Child Profile <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No clinical assessment records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentsDatabase;
