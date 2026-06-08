import React from'react';
import { RenuStore } from'../data/mockData';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { Card, Badge, Button, Label, Select } from'../components/ui';
import { RefreshCw, UserCheck, BellRing } from'lucide-react';

export const Settings: React.FC = () => {
 const { role, setRole } = useRole();

 const handleResetData = () => {
 if (window.confirm('Are you sure you want to reset all data? This will clear all added children, camps, sponsorships and restore initial mock datasets.')) {
 RenuStore.resetAll();
 showToast('Database Restored','success','All local storage changes have been reverted.');
 // Refresh after a tiny delay so toast displays
 setTimeout(() => {
 window.location.reload();
 }, 800);
 }
 };

 return (
 <div className="space-y-6 max-w-3xl w-full px-6 md:px-8 xl:px-12 pb-12">
 {/* Header */}
 <div>
 <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">Settings & Config</h1>
 <p className="text-xs text-slate-505 mt-1">Configure dashboard preferences, manage roles, or restore the simulated database.</p>
 </div>

 {/* Role Management Card */}
 <Card className="p-5 space-y-4 bg-white/80 border-slate-200">
 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
 <UserCheck className="h-4 w-4 text-brand-cyan-700"/> User Role Simulator
 </h3>
 <p className="text-xs text-slate-500 leading-relaxed">
 Switch roles below to simulate different visibility levels across the dashboard. **Coordinator** role restricts access to sponsorships, coordinator directories, and item stock levels.
 </p>

 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
 <div className="w-48">
 <Label>Select Role to Simulate</Label>
 <Select
 options={[
 { label:'Admin (Full Access)', value:'Admin'},
 { label:'Coordinator (Limited)', value:'Coordinator'},
 ]}
 value={role}
 onChange={e => {
 setRole(e.target.value as any);
 showToast('Role Switched','info',`Access levels updated for ${e.target.value} portal.`);
 }}
 />
 </div>
 <div>
 <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Active Privilege</span>
 <Badge color={role ==='Admin'?'success':'primary'} className="font-bold px-3 py-1 text-xs">
 {role ==='Admin'?'All Modules Unlocked':'Coordinator Restrictions Active'}
 </Badge>
 </div>
 </div>
 </Card>

 {/* Notifications Prefs (Mock) */}
 <Card className="p-5 space-y-4 text-xs bg-white/80 border-slate-200">
 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
 <BellRing className="h-4 w-4 text-brand-cyan-700"/> Operational Notifications (Simulated)
 </h3>
 <div className="space-y-3">
 <label className="flex items-start gap-3 cursor-pointer">
 <input type="checkbox"defaultChecked className="accent-brand-cyan-700 h-4.5 w-4.5 mt-0.5 rounded"/>
 <div>
 <span className="font-bold text-slate-800 block">Low Stock Warnings</span>
 <span className="text-slate-400 block mt-0.5">Notify coordinators when camp clinical materials fall below 10 units.</span>
 </div>
 </label>
 <label className="flex items-start gap-3 cursor-pointer">
 <input type="checkbox"defaultChecked className="accent-brand-cyan-700 h-4.5 w-4.5 mt-0.5 rounded"/>
 <div>
 <span className="font-bold text-slate-800 block">Follow-Up Reminders</span>
 <span className="text-slate-400 block mt-0.5">Alert field coordinators 48 hours prior to scheduled child visits.</span>
 </div>
 </label>
 <label className="flex items-start gap-3 cursor-pointer">
 <input type="checkbox"className="accent-brand-cyan-700 h-4.5 w-4.5 mt-0.5 rounded"/>
 <div>
 <span className="font-bold text-slate-800 block">Email Impact Reports</span>
 <span className="text-slate-400 block mt-0.5">Send monthly trustee CSR summaries automatically to active sponsors.</span>
 </div>
 </label>
 </div>
 </Card>

 {/* Database Management Card */}
 <Card className="p-5 space-y-4 bg-white/80 border-slate-200">
 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
 <RefreshCw className="h-4 w-4 text-brand-cyan-700"/> Database Administration
 </h3>
 <p className="text-xs text-slate-500 leading-relaxed">
 The RENU portal stores all registered children, screening outcomes, and logistics modifications in your web browser's **localStorage**. Click the button below to purge edits and restore the database to its pristine state.
 </p>
 <div className="pt-2">
 <Button
 variant="danger"
 onClick={handleResetData}
 className="flex items-center gap-1.5 cursor-pointer"
 >
 <RefreshCw className="h-4 w-4"/> Reset Portal Database
 </Button>
 </div>
 </Card>

 </div>
 );
};
export default Settings;
