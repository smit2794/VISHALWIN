import React, { useState, useEffect } from 'react';
import { RenuStore } from '../data/renuStore';
import { Card, Input, Select, Label, Button } from '../../../components/ui';
import { Printer, FileText } from 'lucide-react';

export const MedicalDatabase: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState('All');
  const [recordType, setRecordType] = useState('All');
  
  useEffect(() => {
    loadData();
    window.addEventListener('renu_data_updated', loadData);
    return () => window.removeEventListener('renu_data_updated', loadData);
  }, []);

  const loadData = () => {
    setChildren(RenuStore.getChildren());
  };

  // Mocking medical records across all children since they don't explicitly exist in store structure in detail
  // but we can generate them from child list and their documents.
  const allRecords = children.flatMap(c => {
    const docs = c.documents || [];
    return docs.map((d: any) => ({
      ...d,
      childName: c.name,
      childId: c.id
    }));
  });

  const filtered = allRecords.filter(r => {
    if (selectedChild !== 'All' && r.childId !== selectedChild) return false;
    if (recordType !== 'All' && !r.type.includes(recordType)) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">Medical Records Database</h1>
          <p className="text-xs text-slate-500 mt-1">Cross-child master view of all medical records, scans, and prescriptions.</p>
        </div>
        <Button onClick={handlePrint} className="flex items-center gap-1.5">
          <Printer className="h-4 w-4" /> Print Records
        </Button>
      </div>

      <Card className="p-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Child</Label>
            <Select 
              options={[{label: 'All Children', value: 'All'}, ...children.map(c => ({label: c.name, value: c.id}))]}
              value={selectedChild}
              onChange={e => setSelectedChild(e.target.value)}
            />
          </div>
          <div>
            <Label>Record Type</Label>
            <Select 
              options={[
                {label: 'All Types', value: 'All'},
                {label: 'MRI', value: 'MRI'},
                {label: 'CT Scan', value: 'CT Scan'},
                {label: 'EEG', value: 'EEG'},
                {label: 'BERA', value: 'BERA'},
                {label: 'Blood Report', value: 'Blood Report'},
                {label: 'Genetic Test', value: 'Genetic Test'},
                {label: 'Hearing Test', value: 'Hearing Test'},
                {label: 'Vision Test', value: 'Vision Test'},
                {label: 'Thyroid Report', value: 'Thyroid Report'},
                {label: 'Vitamin Reports', value: 'Vitamin Reports'},
              ]}
              value={recordType}
              onChange={e => setRecordType(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 uppercase">
                <th className="p-4">Date</th>
                <th className="p-4">Child Name</th>
                <th className="p-4">Record Type</th>
                <th className="p-4">Document Name</th>
                <th className="p-4">File Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-4">{r.date}</td>
                  <td className="p-4 font-bold">{r.childName}</td>
                  <td className="p-4">{r.type}</td>
                  <td className="p-4">{r.name}</td>
                  <td className="p-4">{r.fileSize || 'N/A'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No medical records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MedicalDatabase;
