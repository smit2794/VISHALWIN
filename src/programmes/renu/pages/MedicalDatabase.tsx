import React, { useState, useEffect } from 'react';
import { RenuStore } from '../data/renuStore';
import { Card, Select, Label, Button, Badge } from '../../../components/ui';
import { Printer, FileText, Stethoscope, Activity, Pill } from 'lucide-react';

export const MedicalDatabase: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState('All');
  const [recordType, setRecordType] = useState('All');
  const [activeTab, setActiveTab] = useState<'scans' | 'prescriptions'>('scans');

  useEffect(() => {
    loadData();
    window.addEventListener('renu_data_updated', loadData);
    return () => window.removeEventListener('renu_data_updated', loadData);
  }, []);

  const loadData = () => {
    setChildren(RenuStore.getChildren());
  };

  // Aggregate all scans across all children
  const allScans = children.flatMap(c => {
    const scans = c.medicalRecords?.scans || [];
    return scans.map((s: any) => ({
      ...s,
      childName: c.name,
      childId: c.id
    }));
  });

  // Aggregate all prescriptions across all children
  const allPrescriptions = children.flatMap(c => {
    const prescriptions = c.medicalRecords?.prescriptions || [];
    return prescriptions.map((p: any) => ({
      ...p,
      childName: c.name,
      childId: c.id
    }));
  });

  const filteredScans = allScans.filter(s => {
    if (selectedChild !== 'All' && s.childId !== selectedChild) return false;
    if (recordType !== 'All' && s.type !== recordType) return false;
    return true;
  });

  const filteredPrescriptions = allPrescriptions.filter(p => {
    if (selectedChild !== 'All' && p.childId !== selectedChild) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">
            Section I: Medical Database Master
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cross-child master repository of all 10 diagnostic scans, doctor prescriptions, hospitals, and medicines.
          </p>
        </div>
        <Button onClick={handlePrint} className="flex items-center gap-1.5 cursor-pointer">
          <Printer className="h-4 w-4" /> Print Medical Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <Card className="p-4 bg-gradient-to-br from-cyan-50/50 to-blue-50/30 border-cyan-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Diagnostic Scans</p>
              <p className="text-xl font-extrabold text-slate-900">{allScans.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Prescriptions</p>
              <p className="text-xl font-extrabold text-slate-900">{allPrescriptions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Children Managed</p>
              <p className="text-xl font-extrabold text-slate-900">{children.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Reports Uploaded</p>
              <p className="text-xl font-extrabold text-slate-900">
                {allScans.filter(s => s.scanDocumentStatus).length + allPrescriptions.filter(p => p.prescriptionDocumentStatus).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="p-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Filter by Child</Label>
            <Select 
              className="h-9 text-xs py-1.5"
              options={[{label: 'All Children', value: 'All'}, ...children.map(c => ({label: `${c.name} (${c.id})`, value: c.id}))]}
              value={selectedChild}
              onChange={e => setSelectedChild(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Filter Scan / Report Type</Label>
            <Select 
              className="h-9 text-xs py-1.5"
              options={[
                {label: 'All Scan Types', value: 'All'},
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

      {/* Tab Controls */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 print:hidden">
          <button
            onClick={() => setActiveTab('scans')}
            className={`px-6 py-3 text-xs font-bold transition-colors ${
              activeTab === 'scans' ? 'text-indigo-700 border-b-2 border-indigo-700 bg-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Diagnostic Scans & Reports ({filteredScans.length})
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-3 text-xs font-bold transition-colors ${
              activeTab === 'prescriptions' ? 'text-indigo-700 border-b-2 border-indigo-700 bg-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Doctor Prescriptions & Medicines ({filteredPrescriptions.length})
          </button>
        </div>

        {/* TAB 1: SCANS */}
        {activeTab === 'scans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 border-b text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Date</th>
                  <th className="p-3">Child Name</th>
                  <th className="p-3">Scan Type (10 Types)</th>
                  <th className="p-3">Hospital / Centre</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Finding / Diagnosis</th>
                  <th className="p-3 text-right">Report Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredScans.map((scan, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">{scan.date || '2026-08-14'}</td>
                    <td className="p-3 font-bold text-slate-900">{scan.childName}</td>
                    <td className="p-3">
                      <Badge color="primary" className="font-bold">{scan.type}</Badge>
                    </td>
                    <td className="p-3">{scan.centre || 'City Scan Centre'}</td>
                    <td className="p-3">{scan.doctor || 'Dr. K. Mehta'}</td>
                    <td className="p-3 max-w-xs truncate">{scan.finding || 'Normal diagnostic findings'}</td>
                    <td className="p-3 text-right font-mono text-[10px] text-emerald-700 font-bold">
                      {scan.scanDocumentStatus || '✓ Attached'}
                    </td>
                  </tr>
                ))}
                {filteredScans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                      No diagnostic scan records found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 border-b text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Date</th>
                  <th className="p-3">Child Name</th>
                  <th className="p-3">Doctor Name</th>
                  <th className="p-3">Hospital / Clinic</th>
                  <th className="p-3">Medicines & Dosage</th>
                  <th className="p-3">Instructions / Notes</th>
                  <th className="p-3 text-right">Prescription Upload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPrescriptions.map((rx, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold">{rx.date || '2026-08-14'}</td>
                    <td className="p-3 font-bold text-slate-900">{rx.childName}</td>
                    <td className="p-3 font-bold">{rx.doctorName || 'Dr. Ananya Roy'}</td>
                    <td className="p-3">{rx.hospitalName || 'City Children Hospital'}</td>
                    <td className="p-3 font-mono text-[11px] max-w-xs truncate text-indigo-900">{rx.medicines || 'Tab Sodium Valproate 200mg (1-0-1)'}</td>
                    <td className="p-3 max-w-xs truncate">{rx.notes || 'Review in 30 days'}</td>
                    <td className="p-3 text-right font-mono text-[10px] text-emerald-700 font-bold">
                      {rx.prescriptionDocumentStatus || '✓ Uploaded'}
                    </td>
                  </tr>
                ))}
                {filteredPrescriptions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                      No prescription records found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MedicalDatabase;
