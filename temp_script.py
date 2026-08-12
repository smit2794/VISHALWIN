import re

path = '/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx'
with open(path, 'r') as f:
    content = f.read()

tabs_content_new = """
      {/* TAB: ENROLLMENT */}
      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Enrollment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <Label>Admission Date</Label>
              <Input type="date" value={child.enrollmentDetails?.admissionDate || ''} onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, admissionDate: e.target.value } })} />
            </div>
            <div>
              <Label>Current Status</Label>
              <Select value={child.enrollmentDetails?.currentStatus || ''} onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, currentStatus: e.target.value as any } })} options={[{label:'Select',value:''},'Active','Hold','Completed','Dropout','Shifted','Expired'].map(o=>typeof o==='string'?{label:o,value:o}:o)} />
            </div>
            {['Dropout', 'Shifted', 'Expired'].includes(child.enrollmentDetails?.currentStatus || '') && (
              <div className="md:col-span-2">
                <Label>Reason for Exit</Label>
                <Input value={child.enrollmentDetails?.reasonForExit || ''} onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, reasonForExit: e.target.value } })} />
              </div>
            )}
            <div>
              <Label>Sponsorship Status</Label>
              <Input value={child.enrollmentDetails?.sponsorshipStatus || ''} onChange={e => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, sponsorshipStatus: e.target.value } })} />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <Label className="text-xs">Admission Form</Label>
                <FakeUpload status={child.enrollmentDetails?.admissionFormFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, admissionFormFileName: status } })} />
              </div>
              <div>
                <Label className="text-xs">Consent Form</Label>
                <FakeUpload status={child.enrollmentDetails?.consentFormFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, consentFormFileName: status } })} />
              </div>
              <div>
                <Label className="text-xs">Parent Consent</Label>
                <FakeUpload status={child.enrollmentDetails?.parentConsentFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ enrollmentDetails: { ...child.enrollmentDetails, parentConsentFileName: status } })} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: THERAPY */}
      {activeTab === 'therapy' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Therapy Assignments</h3>
              <Button size="sm" onClick={() => {
                const newAssignment = { id: `TA-${Date.now()}`, therapyType: 'Occupational Therapy' as any, required: true, frequency: '', sessionTime: '', sessionDuration: '' };
                saveChildUpdates({ therapyAssignments: [...(child.therapyAssignments || []), newAssignment] });
              }}><Plus className="h-4 w-4 mr-1" /> Add Therapy</Button>
            </div>
            <div className="space-y-4">
              {(child.therapyAssignments || []).map((ta, idx) => (
                <div key={ta.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                  <button onClick={() => {
                    const newArr = [...(child.therapyAssignments || [])];
                    newArr.splice(idx, 1);
                    saveChildUpdates({ therapyAssignments: newArr });
                  }} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label className="text-[10px]">Therapy Type</Label>
                      <Select value={ta.therapyType} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].therapyType = e.target.value as any;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} options={['Occupational Therapy', 'Speech Therapy', 'Behaviour Therapy', 'Physiotherapy', 'Special Education', 'Early Intervention', 'Parent Training', 'Group Therapy', 'ADL', 'Life Skills'].map(o=>({label:o,value:o}))} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Required</Label>
                      <div className="mt-2 flex items-center"><input type="checkbox" checked={ta.required} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].required = e.target.checked;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} className="mr-2"/> Yes</div>
                    </div>
                    <div>
                      <Label className="text-[10px]">Frequency</Label>
                      <Input value={ta.frequency || ''} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].frequency = e.target.value;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} placeholder="e.g. 3x/week" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Time</Label>
                      <Input value={ta.sessionTime || ''} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].sessionTime = e.target.value;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} placeholder="10:00 AM" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Duration</Label>
                      <Input value={ta.sessionDuration || ''} onChange={e => {
                        const newArr = [...(child.therapyAssignments || [])];
                        newArr[idx].sessionDuration = e.target.value;
                        saveChildUpdates({ therapyAssignments: newArr });
                      }} placeholder="45 min" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Monthly Attendance & Financial Tracking</h3>
              <Button size="sm" onClick={() => {
                const newRec = { id: `MA-${Date.now()}`, year: new Date().getFullYear(), month: 'Jan', totalDaysSuggested: 0, totalDaysAttended: 0, totalDaysMissed: 0, attendancePercentage: 0, qualifiedForFinancialSupport: false };
                saveChildUpdates({ monthlyAttendanceRecords: [...(child.monthlyAttendanceRecords || []), newRec] });
              }}><Plus className="h-4 w-4 mr-1" /> Add Month</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2 rounded-tl-lg">Year</th>
                    <th className="p-2">Month</th>
                    <th className="p-2">Suggested</th>
                    <th className="p-2">Attended</th>
                    <th className="p-2">Missed</th>
                    <th className="p-2">Attendance %</th>
                    <th className="p-2">Support Qual.</th>
                    <th className="p-2">Note</th>
                    <th className="p-2 rounded-tr-lg"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(child.monthlyAttendanceRecords || []).map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-2"><Input type="number" className="w-20 text-xs p-1 h-7" value={rec.year} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].year = Number(e.target.value);
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2"><Select className="w-24 text-xs p-1 h-7" value={rec.month} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].month = e.target.value;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} options={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(o=>({label:o,value:o}))} /></td>
                      <td className="p-2"><Input type="number" className="w-16 text-xs p-1 h-7" value={rec.totalDaysSuggested} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].totalDaysSuggested = Number(e.target.value);
                        newArr[idx].totalDaysMissed = newArr[idx].totalDaysSuggested - newArr[idx].totalDaysAttended;
                        newArr[idx].attendancePercentage = newArr[idx].totalDaysSuggested > 0 ? (newArr[idx].totalDaysAttended / newArr[idx].totalDaysSuggested) * 100 : 0;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2"><Input type="number" className="w-16 text-xs p-1 h-7" value={rec.totalDaysAttended} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].totalDaysAttended = Number(e.target.value);
                        newArr[idx].totalDaysMissed = newArr[idx].totalDaysSuggested - newArr[idx].totalDaysAttended;
                        newArr[idx].attendancePercentage = newArr[idx].totalDaysSuggested > 0 ? (newArr[idx].totalDaysAttended / newArr[idx].totalDaysSuggested) * 100 : 0;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2 font-bold">{rec.totalDaysMissed}</td>
                      <td className="p-2">
                        {rec.attendancePercentage.toFixed(1)}%
                        {rec.attendancePercentage < 70 && rec.totalDaysSuggested > 0 && <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold">⚠ Below 70%</span>}
                      </td>
                      <td className="p-2 text-center"><input type="checkbox" checked={rec.qualifiedForFinancialSupport} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].qualifiedForFinancialSupport = e.target.checked;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2"><Input className="w-32 text-xs p-1 h-7" value={rec.monthlyNote || ''} onChange={e => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr[idx].monthlyNote = e.target.value;
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} /></td>
                      <td className="p-2"><button onClick={() => {
                        const newArr = [...(child.monthlyAttendanceRecords || [])];
                        newArr.splice(idx, 1);
                        saveChildUpdates({ monthlyAttendanceRecords: newArr });
                      }} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2 mb-4">Travel Financial Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div><Label>Center Name</Label><Input value={child.travelSupport?.centerName || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, centerName: e.target.value } })} /></div>
              <div><Label>Distance (KM)</Label><Input type="number" value={child.travelSupport?.distanceKm || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, distanceKm: Number(e.target.value) } })} /></div>
              <div><Label>Support Slab</Label><Select value={child.travelSupport?.slab || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, slab: e.target.value as any } })} options={[{label:'Select',value:''},'₹500','₹1000','Other'].map(o=>typeof o==='string'?{label:o,value:o}:o)} /></div>
              {child.travelSupport?.slab === 'Other' && <div><Label>Other Amount</Label><Input type="number" value={child.travelSupport?.otherAmount || ''} onChange={e => saveChildUpdates({ travelSupport: { ...child.travelSupport, otherAmount: Number(e.target.value) } })} /></div>}
            </div>
          </div>
        </div>
      )}

"""

tabs_content_2 = """
      {/* TAB: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Developmental Milestones</h3>
          <div className="grid gap-3">
            {['Early Intervention','Inclusive Education','Independent Living Skills','Communication','Self Care','Behaviour','Social Skills','Vocational Training','School Readiness','School Admission','Employment'].map((domain) => {
              const current = child.developmentalMilestones?.find(m => m.domain === domain) || { domain, progress: 'Not Started', remarks: '', lastUpdated: new Date().toISOString().split('T')[0] };
              return (
                <div key={domain} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-wrap gap-4 items-center">
                  <div className="w-48 font-bold text-xs text-slate-700">{domain}</div>
                  <Select className="w-36 h-7 text-xs" value={current.progress} onChange={e => {
                    const existing = [...(child.developmentalMilestones || [])].filter(m => m.domain !== domain);
                    saveChildUpdates({ developmentalMilestones: [...existing, { ...current, progress: e.target.value as any, lastUpdated: new Date().toISOString().split('T')[0] }] });
                  }} options={[{label:'Not Started',value:'Not Started'},{label:'In Progress',value:'In Progress'},{label:'Achieved',value:'Achieved'}]} />
                  <Input className="flex-1 min-w-[200px] h-7 text-xs" placeholder="Remarks..." value={current.remarks || ''} onChange={e => {
                    const existing = [...(child.developmentalMilestones || [])].filter(m => m.domain !== domain);
                    saveChildUpdates({ developmentalMilestones: [...existing, { ...current, remarks: e.target.value }] });
                  }} />
                  <div className="w-24 text-[9px] text-slate-400">Updated: {current.lastUpdated}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
"""

content = re.sub(r'\{\/\* TAB 1: ASSESSMENT \*\/\}.*', '', content, flags=re.DOTALL)
content += tabs_content_new + tabs_content_2 + """
    </div>
  </Card>
</div>
  );
};
"""

with open('/Users/smit/Desktop/vishalwin/update_tabs_rest.py', 'w') as f:
    f.write('''import re
with open("/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx", "r") as f:
    c = f.read()

# We will just parse out the div that wraps the tabs and replace it.
# This requires precision. We will write another script for it.
''')
