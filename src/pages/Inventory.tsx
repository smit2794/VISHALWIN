import React, { useState, useEffect } from'react';
import { RenuStore } from'../data/mockData';
import { InventoryItem, InventoryDistribution, Camp } from'../types';
import { Card, Badge, Button, Input, Select, Label, Modal, Tabs } from'../components/ui';
import { Package, AlertTriangle, Truck, Plus, BarChart2, CheckCircle2, FileText, Printer, Calendar, Clock, AlertCircle } from'lucide-react';
import { showToast } from'../hooks/useToast';
import EmptyState from'../components/common/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from'recharts';

export const Inventory: React.FC = () => {
 // Theme state for Recharts
 const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
 
 useEffect(() => {
 const handleThemeChange = () => {
 setIsDark(document.documentElement.classList.contains('dark'));
 };
 window.addEventListener('renu_theme_changed', handleThemeChange);
 return () => window.removeEventListener('renu_theme_changed', handleThemeChange);
 }, []);

 // Data States
 const [inventory, setInventory] = useState<InventoryItem[]>([]);
 const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
 const [camps, setCamps] = useState<Camp[]>([]);
 
 // UI States
 const [activeTab, setActiveTab] = useState<'All'|'Medical Items'|'Educational Material'|'Support Equipment'>('All');
 const [searchQuery, setSearchQuery] = useState('');
 const [qtyFilter, setQtyFilter] = useState('All'); // All, Low, Out
 const [activeSubTab, setActiveSubTab] = useState<'stock'|'logs'>('stock');

 // Distribution Modals State
 const [isDistributeOpen, setIsDistributeOpen] = useState(false);
 const [isReportOpen, setIsReportOpen] = useState(false);

 // Distribution Form State
 const [distributeForm, setDistributeForm] = useState({
 itemId:'',
 campId:'',
 qty: 5
 });

 useEffect(() => {
 loadData();
 }, []);

 const loadData = () => {
 setInventory(RenuStore.getInventory());
 setDistributions(RenuStore.getInventoryDistributions());
 const loadedCamps = RenuStore.getCamps();
 setCamps(loadedCamps);
 if (loadedCamps.length > 0) {
 setDistributeForm(prev => ({ ...prev, campId: loadedCamps[0].id }));
 }
 };

 // Calculations
 const lowStockCount = inventory.filter(item => item.remainingQty < 10 && item.remainingQty > 0).length;
 const outOfStockCount = inventory.filter(item => item.remainingQty === 0).length;
 
 const medicalTotal = inventory.filter(i => i.category ==='Medical Items').reduce((sum, i) => sum + i.remainingQty, 0);
 const educationalTotal = inventory.filter(i => i.category ==='Educational Material').reduce((sum, i) => sum + i.remainingQty, 0);
 const supportTotal = inventory.filter(i => i.category ==='Support Equipment').reduce((sum, i) => sum + i.remainingQty, 0);

 const totalAvailable = inventory.reduce((sum, item) => sum + item.remainingQty, 0);
 const totalDistributed = inventory.reduce((sum, item) => sum + item.distributedQty, 0);

 // Filter Stock List
 const filteredItems = inventory.filter(item => {
 const matchesCategory = activeTab ==='All'|| item.category === activeTab;
 const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 item.id.toLowerCase().includes(searchQuery.toLowerCase());
 
 let matchesQty = true;
 if (qtyFilter ==='Low') {
 matchesQty = item.remainingQty < 10 && item.remainingQty > 0;
 } else if (qtyFilter ==='Out') {
 matchesQty = item.remainingQty === 0;
 }

 return matchesCategory && matchesSearch && matchesQty;
 });

 // Submit Distribution Form
 const handleDistributeSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 const { itemId, campId, qty } = distributeForm;
 if (!itemId || !campId) {
 showToast('Validation Error','danger','Please select an item and a camp.');
 return;
 }

 const item = inventory.find(i => i.id === itemId);
 const camp = camps.find(c => c.id === campId);
 if (!item || !camp) return;

 if (item.availableQty < qty) {
 showToast('Insufficient Stock','danger',`Only ${item.availableQty} units available. Cannot distribute ${qty}.`);
 return;
 }

 // Deduct available, increase distributed
 const updatedInventory = inventory.map(i => {
 if (i.id === itemId) {
 return {
 ...i,
 availableQty: i.availableQty - qty,
 distributedQty: i.distributedQty + qty,
 remainingQty: i.remainingQty - qty,
 allocatedCampId: camp.id,
 allocatedCampName: camp.name
 };
 }
 return i;
 });

 RenuStore.saveInventory(updatedInventory);
 setInventory(updatedInventory);

 // Save distribution tracking log
 const distributionLog: InventoryDistribution = {
 id:`DIST-${900 + distributions.length + 1}`,
 itemId: item.id,
 itemName: item.name,
 category: item.category,
 campId: camp.id,
 campName: camp.name,
 quantityDistributed: qty,
 distributionDate: new Date().toISOString().split('T')[0],
 remainingStockAfter: Math.max(0, item.remainingQty - qty)
 };

 const updatedDistributions = [distributionLog, ...distributions];
 RenuStore.saveInventoryDistributions(updatedDistributions);
 setDistributions(updatedDistributions);

 // Log Coordinator Activity timeline
 RenuStore.logCoordinatorActivity(
'COORD-100', // Rohan Kulkarni
'Attendance',
`Allocated inventory stock distribution: ${qty} units of"${item.name}"shipped to camp: ${camp.name}`,
 undefined,
 undefined,
 camp.name
 );

 setIsDistributeOpen(false);
 showToast('Stock Distributed','success',`Allocated ${qty} units of"${item.name}"to ${camp.name}.`);
 window.dispatchEvent(new Event('renu_data_updated'));

 // Reset Form
 setDistributeForm({
 itemId:'',
 campId: camps[0]?.id ||'',
 qty: 5
 });
 };

 // Recharts Inventory Analytics Chart Data
 // 1. Distribution by Category (Pie Chart)
 const categoryChartData = [
 { name:'Medical Items', value: medicalTotal, color:'#0E7490'},
 { name:'Educational Material', value: educationalTotal, color:'#16a34a'},
 { name:'Support Equipment', value: supportTotal, color:'#9333ea'}
 ];

 // 2. Most Used Items (Top distributed items)
 const sortedByDistributed = [...inventory]
 .sort((a, b) => b.distributedQty - a.distributedQty)
 .slice(0, 5);
 const mostUsedChartData = sortedByDistributed.map(i => ({
 name: i.name.split('(')[0],
 Distributed: i.distributedQty
 }));

 // 3. Camp Allocation Statistics (Distributed items count per camp)
 const campAllocationCounts: Record<string, number> = {};
 distributions.forEach(d => {
 campAllocationCounts[d.campName] = (campAllocationCounts[d.campName] || 0) + d.quantityDistributed;
 });
 const campAllocationChartData = Object.keys(campAllocationCounts).map(name => ({
 name: name.replace('RENU Medical Camp -',''),
 Allocated: campAllocationCounts[name]
 }));

 const handlePrintReport = () => {
 window.print();
 showToast('Print Initiated','success');
 };

 return (
 <div className="space-y-6 w-full max-w-none px-6 md:px-8 xl:px-12 pb-12">
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
 <div>
 <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">Inventory Management</h1>
 <p className="text-xs text-slate-500 mt-1">Track clinic medical kits, support gear, educational kits, and medical camp distribution allocations.</p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline"onClick={() => setIsReportOpen(true)} className="flex items-center gap-1.5 cursor-pointer">
 <FileText className="h-4 w-4"/> Summary Report
 </Button>
 <Button onClick={() => setIsDistributeOpen(true)} className="flex items-center gap-1.5 cursor-pointer">
 <Truck className="h-4 w-4"/> Distribute Stock
 </Button>
 </div>
 </div>

 {/* Warning Alerts (Low Stock / Out of Stock) */}
 {(lowStockCount > 0 || outOfStockCount > 0) && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
 {outOfStockCount > 0 && (
 <div className="p-3 bg-red-50/70 border border-red-200/50 text-red-500 rounded-xl flex items-start gap-2 text-xs">
 <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0 animate-pulse"/>
 <div>
 <span className="font-extrabold uppercase tracking-wider block text-[10px]">Out of Stock Alert</span>
 <p className="font-semibold text-red-950 mt-0.5">
 There are {outOfStockCount} critical items currently out of stock in the warehouse. Replenish immediately.
 </p>
 </div>
 </div>
 )}
 {lowStockCount > 0 && (
 <div className="p-3 bg-amber-50/70 border border-amber-200/50 text-amber-600 rounded-xl flex items-start gap-2 text-xs">
 <AlertTriangle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0"/>
 <div>
 <span className="font-extrabold uppercase tracking-wider block text-[10px]">Low Stock Alert</span>
 <p className="font-semibold text-amber-950 mt-0.5">
 There are {lowStockCount} items running low (under 10 units remaining). Schedule warehouse orders.
 </p>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Category cards for inventory dashboard */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-xs no-print">
 <Card className="p-4 border-l-4 border-l-brand-cyan-700 bg-white/80">
 <span className="text-slate-400 font-semibold uppercase block">Total Warehouse Stock</span>
 <span className="text-lg font-extrabold text-slate-800 mt-1 block">{totalAvailable + totalDistributed} units</span>
 <p className="text-[9px] text-slate-400 mt-0.5">Warehouse catalog items count</p>
 </Card>

 <Card className="p-4 border-l-4 border-l-brand-cyan-500 bg-white/80">
 <span className="text-slate-400 font-semibold uppercase block">Medical Items</span>
 <span className="text-lg font-extrabold text-slate-800 mt-1 block">{medicalTotal} units</span>
 <p className="text-[9px] text-slate-400 mt-0.5">First aid, masks, gloves</p>
 </Card>

 <Card className="p-4 border-l-4 border-l-emerald-500 bg-white/80">
 <span className="text-slate-400 font-semibold uppercase block">Educational Material</span>
 <span className="text-lg font-extrabold text-slate-800 mt-1 block">{educationalTotal} units</span>
 <p className="text-[9px] text-slate-400 mt-0.5">Storybooks, learning puzzles</p>
 </Card>

 <Card className="p-4 border-l-4 border-l-indigo-600 bg-white/80">
 <span className="text-slate-400 font-semibold uppercase block">Support Equipment</span>
 <span className="text-lg font-extrabold text-slate-800 mt-1 block">{supportTotal} units</span>
 <p className="text-[9px] text-slate-400 mt-0.5">Wheelchairs, digital hearing aids</p>
 </Card>

 <Card className="p-4 border-l-4 border-l-red-500 bg-white/80">
 <span className="text-slate-400 font-semibold uppercase block">Out / Low Stock</span>
 <span className="text-lg font-extrabold text-brand-danger mt-1 block">{outOfStockCount} Out / {lowStockCount} Low</span>
 <p className="text-[9px] text-slate-400 mt-0.5">Warehouse items needing replenishment</p>
 </Card>
 </div>

 {/* Analytics Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs no-print">
 {/* Pie: Category Distribution */}
 <Card className="p-5 flex flex-col justify-between">
 <div>
 <h3 className="font-bold text-slate-900 font-display">Distribution by Category</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Tally of current available warehouse items divided by operational category.</p>
 </div>
 <div className="h-40 w-full flex items-center justify-center my-2">
 <ResponsiveContainer width="100%"height="100%">
 <PieChart>
 <Pie
 data={categoryChartData}
 cx="50%"
 cy="50%"
 innerRadius={35}
 outerRadius={55}
 paddingAngle={3}
 dataKey="value"
 >
 {categoryChartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ background: isDark ?'#0f172a':'#ffffff', borderColor: isDark ?'#1e293b':'#e2e8f0', color: isDark ?'#f1f5f9':'#0f172a'}} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="space-y-1 pt-2 border-t border-slate-200">
 {categoryChartData.map(c => (
 <div key={c.name} className="flex justify-between items-center text-[10px]">
 <div className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full"style={{ backgroundColor: c.color }} />
 <span className="text-slate-600 font-medium">{c.name}</span>
 </div>
 <span className="font-bold text-slate-800">{c.value} units</span>
 </div>
 ))}
 </div>
 </Card>

 {/* Bar: Most Used Items */}
 <Card className="p-5 flex flex-col justify-between">
 <div>
 <h3 className="font-bold text-slate-900 font-display">Most Used Items</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Top inventory items according to cumulative quantities distributed to camps.</p>
 </div>
 <div className="h-44 w-full my-2">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={mostUsedChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={isDark ?'#1e293b':'#f1f5f9'} />
 <XAxis dataKey="name"stroke={isDark ?'#64748b':'#94a3b8'} fontSize={7} />
 <YAxis stroke={isDark ?'#64748b':'#94a3b8'} fontSize={7} />
 <Tooltip contentStyle={{ background: isDark ?'#0f172a':'#ffffff', borderColor: isDark ?'#1e293b':'#e2e8f0', color: isDark ?'#f1f5f9':'#0f172a'}} />
 <Bar dataKey="Distributed"fill="#10b981"radius={[3, 3, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 {/* Bar: Camp Allocation Statistics */}
 <Card className="p-5 flex flex-col justify-between">
 <div>
 <h3 className="font-bold text-slate-900 font-display">Camp Allocation Statistics</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Cumulative materials and equipment items distributed per geographic camp location.</p>
 </div>
 <div className="h-44 w-full my-2">
 {campAllocationChartData.length === 0 ? (
 <div className="flex items-center justify-center h-full text-slate-400 italic">No allocations logged</div>
 ) : (
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={campAllocationChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke={isDark ?'#1e293b':'#f1f5f9'} />
 <XAxis dataKey="name"stroke={isDark ?'#64748b':'#94a3b8'} fontSize={7} />
 <YAxis stroke={isDark ?'#64748b':'#94a3b8'} fontSize={7} />
 <Tooltip contentStyle={{ background: isDark ?'#0f172a':'#ffffff', borderColor: isDark ?'#1e293b':'#e2e8f0', color: isDark ?'#f1f5f9':'#0f172a'}} />
 <Bar dataKey="Allocated"fill="#0d9488"radius={[3, 3, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 )}
 </div>
 </Card>
 </div>

 {/* Sub-tabs toggling stock ledger vs logs */}
 <div className="flex border-b border-slate-200 no-print">
 <button
 onClick={() => setActiveSubTab('stock')}
 className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
 activeSubTab ==='stock'
 ?'border-brand-cyan-500 text-brand-cyan-700'
 :'border-transparent text-slate-400 hover:text-slate-900'
 }`}
 >
 Warehouse Stock Ledger
 </button>
 <button
 onClick={() => setActiveSubTab('logs')}
 className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
 activeSubTab ==='logs'
 ?'border-brand-cyan-500 text-brand-cyan-700'
 :'border-transparent text-slate-400 hover:text-slate-900'
 }`}
 >
 Distribution Allocation Logs
 </button>
 </div>

 {/* WAREHOUSE STOCK LEDGER TAB */}
 {activeSubTab ==='stock'&& (
 <div className="space-y-4">
 {/* Category Tabs & Filters */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
 <div className="flex flex-wrap gap-2">
 {['All','Medical Items','Educational Material','Support Equipment'].map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab as any)}
 className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer border ${
 activeTab === tab
 ?'bg-white text-slate-950 shadow-xs border-slate-200/50'
 :'border-transparent text-slate-500 hover:text-slate-900'
 }`}
 >
 {tab ==='All'?'All Items': tab}
 </button>
 ))}
 </div>

 {/* Inputs & Dropdowns */}
 <div className="flex flex-wrap gap-2 w-full md:w-auto">
 <div className="relative flex-1 md:flex-initial">
 <Package className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"/>
 <Input
 placeholder="Search item..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="pl-8 text-xs py-1 w-full md:w-44"
 />
 </div>
 <div className="w-full sm:w-auto">
 <Select
 options={[
 { label:'All Quantity Stock', value:'All'},
 { label:'Low Stock (< 10)', value:'Low'},
 { label:'Out of Stock (0)', value:'Out'}
 ]}
 value={qtyFilter}
 onChange={e => setQtyFilter(e.target.value)}
 className="text-xs py-1"
 />
 </div>
 </div>
 </div>

 {/* Table */}
 {filteredItems.length === 0 ? (
 <EmptyState
 title="No Warehouse Items Found"
 description="Adjust category tabs or search query filters to display matching stocks."
 />
 ) : (
 <Card className="overflow-hidden no-print border-slate-200">
 <div className="overflow-x-auto text-xs">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
 <th className="p-4">Item Name</th>
 <th className="p-4">Category</th>
 <th className="p-4 text-center">Warehouse Qty</th>
 <th className="p-4 text-center">Qty Distributed</th>
 <th className="p-4 text-center">Remaining Quantity</th>
 <th className="p-4">Camp Allocated</th>
 <th className="p-4 text-center">Stock Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700">
 {filteredItems.map(item => {
 const isLow = item.remainingQty < 10 && item.remainingQty > 0;
 const isOut = item.remainingQty === 0;

 return (
 <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="p-4">
 <div className="font-bold text-slate-900">{item.name}</div>
 <div className="text-[10px] text-slate-400 mt-0.5">ID: {item.id}</div>
 </td>
 <td className="p-4 font-semibold text-slate-700">
 <span className="text-slate-400 font-normal">{item.category}</span>
 <span className="text-slate-300 mx-1.5">&gt;</span>
 <span className="text-slate-700">{item.name}</span>
 </td>
 <td className="p-4 text-center font-bold text-slate-800">
 {item.availableQty + item.distributedQty} units
 </td>
 <td className="p-4 text-center text-slate-455">{item.distributedQty} units</td>
 <td className="p-4 text-center font-extrabold text-slate-900">{item.remainingQty} units</td>
 <td className="p-4">
 {item.allocatedCampName ? (
 <div>
 <span className="font-semibold text-slate-800">{item.allocatedCampName}</span>
 <div className="text-[9px] text-slate-400">ID: {item.allocatedCampId}</div>
 </div>
 ) : (
 <span className="text-slate-400 italic">Central Warehouse</span>
 )}
 </td>
 <td className="p-4 text-center">
 {isOut ? (
 <Badge color="danger"className="animate-pulse">Out of Stock</Badge>
 ) : isLow ? (
 <Badge color="warning">Low Stock</Badge>
 ) : (
 <Badge color="success">Healthy</Badge>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 )}
 </div>
 )}

 {/* DISTRIBUTION ALLOCATION LOGS TAB */}
 {activeSubTab ==='logs'&& (
 <Card className="overflow-hidden no-print text-xs border-slate-200">
 {distributions.length === 0 ? (
 <p className="p-6 text-slate-400 italic text-center">No allocations recorded yet. Use"Distribute Stock"to dispatch items.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
 <th className="p-4">Distribution ID</th>
 <th className="p-4">Item details</th>
 <th className="p-4">Target Camp Allocation</th>
 <th className="p-4 text-center">Quantity Distributed</th>
 <th className="p-4 text-center">Distribution Date</th>
 <th className="p-4 text-center">Remaining Stock After</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700">
 {distributions.map(log => (
 <tr key={log.id} className="hover:bg-slate-50/50">
 <td className="p-4 font-bold text-slate-900">{log.id}</td>
 <td className="p-4">
 <div className="font-bold text-slate-800">{log.itemName}</div>
 <div className="text-[9px] text-slate-400">ID: {log.itemId} | Category: {log.category} &gt; {log.itemName}</div>
 </td>
 <td className="p-4">
 <div className="font-bold text-brand-cyan-700">{log.campName}</div>
 <div className="text-[9px] text-slate-400 font-mono">ID: {log.campId}</div>
 </td>
 <td className="p-4 text-center font-extrabold text-slate-800">{log.quantityDistributed} units</td>
 <td className="p-4 text-center">
 <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
 <Calendar className="h-3 w-3 text-slate-400"/>
 <span>{log.distributionDate}</span>
 </div>
 </td>
 <td className="p-4 text-center font-bold text-slate-500">{log.remainingStockAfter} remaining</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </Card>
 )}

 {/* Distribute Material Modal */}
 <Modal
 isOpen={isDistributeOpen}
 onClose={() => setIsDistributeOpen(false)}
 title="Distribute Stock to Screening Camp"
 size="md"
 >
 <form onSubmit={handleDistributeSubmit} className="space-y-4 text-xs">
 <div>
 <Label>Select Stock Item *</Label>
 <Select
 options={inventory
 .filter(i => i.availableQty > 0)
 .map(i => ({ label:`${i.category} > ${i.name} (Available: ${i.availableQty} units)`, value: i.id }))}
 value={distributeForm.itemId}
 onChange={e => setDistributeForm({ ...distributeForm, itemId: e.target.value })}
 required
 />
 </div>

 <div>
 <Label>Select Target Camp *</Label>
 <Select
 options={camps.map(c => ({ label: c.name, value: c.id }))}
 value={distributeForm.campId}
 onChange={e => setDistributeForm({ ...distributeForm, campId: e.target.value })}
 required
 />
 </div>

 <div>
 <Label>Distribution Quantity *</Label>
 <Input
 type="number"
 min={1}
 value={distributeForm.qty}
 onChange={e => setDistributeForm({ ...distributeForm, qty: Number(e.target.value) })}
 required
 />
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"type="button"onClick={() => setIsDistributeOpen(false)}>
 Cancel
 </Button>
 <Button type="submit">
 Log Distribution
 </Button>
 </div>
 </form>
 </Modal>

 {/* Printable Inventory Summary Report Modal */}
 <Modal
 isOpen={isReportOpen}
 onClose={() => setIsReportOpen(false)}
 title="Inventory Summary Report"
 size="lg"
 >
 <div className="flex justify-end mb-4 no-print">
 <Button onClick={handlePrintReport} className="flex items-center gap-1 cursor-pointer">
 <Printer className="h-4 w-4"/> Print Summary Report
 </Button>
 </div>

 {/* Report Printable Area */}
 <div className="p-6 bg-white border border-slate-200 rounded-xl print-card text-xs space-y-5 text-slate-800">
 <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
 <div>
 <h2 className="text-base font-extrabold text-brand-cyan-700 uppercase">VISHALWIN FOUNDATION</h2>
 <p className="text-[9px] text-slate-400">RENU PROGRAMME LOGISTICS & WAREHOUSE AUDITING</p>
 </div>
 <div className="text-right">
 <span className="font-bold text-slate-800 block animate-none">INVENTORY LOG SUMMARY</span>
 <span className="text-[9px] text-slate-400 block mt-0.5">Date: {new Date().toISOString().split('T')[0]}</span>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4 text-center">
 <div className="p-2.5 bg-slate-50 rounded-lg border border-transparent">
 <span className="text-[9px] text-slate-400 uppercase font-semibold block">Warehouse Available</span>
 <span className="text-sm font-extrabold text-slate-800 mt-1 block">{totalAvailable} Units</span>
 </div>
 <div className="p-2.5 bg-slate-50 rounded-lg border border-transparent">
 <span className="text-[9px] text-slate-400 uppercase font-semibold block">Distributed to camps</span>
 <span className="text-sm font-extrabold text-slate-800 mt-1 block">{totalDistributed} Units</span>
 </div>
 <div className="p-2.5 bg-slate-50 rounded-lg border border-transparent">
 <span className="text-[9px] text-slate-400 uppercase font-semibold block">Low Stock Warnings</span>
 <span className="text-sm font-extrabold text-brand-danger mt-1 block">{lowStockCount + outOfStockCount} Items</span>
 </div>
 </div>

 <div className="overflow-x-auto pt-3 border-t border-slate-100">
 <table className="w-full text-left border-collapse text-[10px]">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase">
 <th className="p-2">Item Name</th>
 <th className="p-2">Category</th>
 <th className="p-2 text-center">Available</th>
 <th className="p-2 text-center">Distributed</th>
 <th className="p-2 text-center">Remaining</th>
 <th className="p-2">Camp Allocated</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-[10px] text-slate-700">
 {inventory.map(item => (
 <tr key={item.id}>
 <td className="p-2 font-bold text-slate-800">{item.name}</td>
 <td className="p-2 text-slate-600">{item.category} &gt; {item.name}</td>
 <td className="p-2 text-center">{item.availableQty + item.distributedQty}</td>
 <td className="p-2 text-center">{item.distributedQty}</td>
 <td className="p-2 text-center font-bold text-slate-900">{item.remainingQty}</td>
 <td className="p-2 truncate max-w-[120px] text-slate-700">{item.allocatedCampName ||'Warehouse Storage'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </Modal>

 </div>
 );
};
export default Inventory;
