import re

path = '/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx'
with open(path, 'r') as f:
    content = f.read()

# Assessment Options
content = content.replace(
    "{label: 'IQ', value: 'IQ'}, {label: 'Functional', value: 'Functional'}, {label: 'Behaviour', value: 'Behaviour'}, {label: 'Motor', value: 'Motor'}",
    "{label: 'Initial', value: 'Initial'}, {label: 'Developmental', value: 'Developmental'}, {label: 'IQ', value: 'IQ'}, {label: 'Functional', value: 'Functional'}, {label: 'Behaviour', value: 'Behaviour'}, {label: 'Communication', value: 'Communication'}, {label: 'Motor', value: 'Motor'}, {label: 'Sensory Profile', value: 'Sensory Profile'}, {label: 'ADL', value: 'ADL'}"
)
content = content.replace(
    "assessment.type === 'IQ'",
    "true" # Always show score
)

# Medical Scan Options
content = content.replace(
    "Scan Records (MRI/CT/EEG)",
    "Medical Scan & Test Records"
)
content = content.replace(
    "{label: 'MRI', value: 'MRI'}, {label: 'CT', value: 'CT'}, {label: 'EEG', value: 'EEG'}, {label: 'Other', value: 'Other'}",
    "{label: 'MRI', value: 'MRI'}, {label: 'CT Scan', value: 'CT Scan'}, {label: 'EEG', value: 'EEG'}, {label: 'BERA', value: 'BERA'}, {label: 'Blood Report', value: 'Blood Report'}, {label: 'Genetic Test', value: 'Genetic Test'}, {label: 'Hearing Test', value: 'Hearing Test'}, {label: 'Vision Test', value: 'Vision Test'}, {label: 'Thyroid Report', value: 'Thyroid Report'}, {label: 'Vitamin Reports', value: 'Vitamin Reports'}, {label: 'Other', value: 'Other'}"
)

# IEP Baseline Assessment
content = content.replace(
    '<h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Plan Details</h3>',
    '<h3 className="text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2">Plan Details</h3>\n              <div><Label>Baseline Assessment</Label><Textarea value={child.iepRecords?.baselineAssessment || \'\'} onChange={e => saveChildUpdates({ iepRecords: { ...child.iepRecords, baselineAssessment: e.target.value } as any })} /></div>'
)

# IEP Quarterly Review Goal Status / New Goals
content = content.replace(
    'value={rev.remarks} className="h-6 text-xs p-1" onChange={e => {',
    'value={rev.remarks} className="h-6 text-xs p-1 mb-2" onChange={e => {'
)
iep_qr = r'value={rev\.remarks}.*?\}\} \/>'
new_iep_qr = 'value={rev.remarks} placeholder="Remarks" className="h-6 text-xs p-1 mb-2" onChange={e => { const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])]; quarterlyReviews[idx].remarks = e.target.value; saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any }); }} /> <Input placeholder="Goal Status" value={rev.goalStatus || \'\'} className="h-6 text-xs p-1 mb-2" onChange={e => { const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])]; quarterlyReviews[idx].goalStatus = e.target.value; saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any }); }} /> <Input placeholder="New Goals" value={rev.newGoals || \'\'} className="h-6 text-xs p-1" onChange={e => { const quarterlyReviews = [...(child.iepRecords?.quarterlyReviews || [])]; quarterlyReviews[idx].newGoals = e.target.value; saveChildUpdates({ iepRecords: { ...child.iepRecords, quarterlyReviews } as any }); }} />'
content = re.sub(iep_qr, new_iep_qr, content, count=1, flags=re.DOTALL)

# IEP 6-month & Annual Goals
iep_goals_block = r'(<div className="space-y-3">\s*<div className="flex items-center justify-between">\s*<Label>Long Term Goals<\/Label>.*?<\/div>\s*<\/div>)'
new_iep_goals = """\\1
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Six Month Goals</Label>
                <Button size="sm" variant="outline" className="py-1 h-6 text-[10px]" onClick={() => {
                  const goals = [...(child.iepRecords?.sixMonthGoals || []), { goal: '', achieved: false }];
                  saveChildUpdates({ iepRecords: { ...child.iepRecords, sixMonthGoals: goals } as any });
                }}>Add Goal</Button>
              </div>
              {(child.iepRecords?.sixMonthGoals || []).map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="checkbox" checked={goal.achieved} onChange={e => {
                    const goals = [...(child.iepRecords?.sixMonthGoals || [])];
                    goals[idx].achieved = e.target.checked;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, sixMonthGoals: goals } as any });
                  }} className="h-4 w-4 rounded border-slate-300" />
                  <Input value={goal.goal} placeholder="Goal description" onChange={e => {
                    const goals = [...(child.iepRecords?.sixMonthGoals || [])];
                    goals[idx].goal = e.target.value;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, sixMonthGoals: goals } as any });
                  }} />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Annual Goals</Label>
                <Button size="sm" variant="outline" className="py-1 h-6 text-[10px]" onClick={() => {
                  const goals = [...(child.iepRecords?.annualGoals || []), { goal: '', achieved: false }];
                  saveChildUpdates({ iepRecords: { ...child.iepRecords, annualGoals: goals } as any });
                }}>Add Goal</Button>
              </div>
              {(child.iepRecords?.annualGoals || []).map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="checkbox" checked={goal.achieved} onChange={e => {
                    const goals = [...(child.iepRecords?.annualGoals || [])];
                    goals[idx].achieved = e.target.checked;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, annualGoals: goals } as any });
                  }} className="h-4 w-4 rounded border-slate-300" />
                  <Input value={goal.goal} placeholder="Goal description" onChange={e => {
                    const goals = [...(child.iepRecords?.annualGoals || [])];
                    goals[idx].goal = e.target.value;
                    saveChildUpdates({ iepRecords: { ...child.iepRecords, annualGoals: goals } as any });
                  }} />
                </div>
              ))}
            </div>
"""
content = re.sub(iep_goals_block, new_iep_goals, content, count=1)

# Financial support dropdowns
content = content.replace(
    "{label: 'CSR', value: 'CSR'}, {label: 'Government', value: 'Govt'}, {label: 'NGO', value: 'NGO'}, {label: 'Individual Donor', value: 'Donor'}, {label: 'Self', value: 'Self'}",
    "{label: 'Vishalwin', value: 'Vishalwin'}, {label: 'CSR', value: 'CSR'}, {label: 'Donor', value: 'Donor'}, {label: 'Parent', value: 'Parent'}, {label: 'Government', value: 'Government'}, {label: 'Crowd Funding', value: 'Crowd Funding'}"
)

# Financial support utilization and receipt
fin_grant_end = r'(<div>\s*<Label>Grant End Date.*?<\/div>\s*<\/div>)'
new_fin = """\\1
            <div className="mt-4">
              <Label>Support Type</Label>
              <Select options={['Therapy', 'Education', 'Medicine', 'Travel', 'Assistive Device'].map(o=>({label:o,value:o}))} value={child.financialSupport?.supportType || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, supportType: e.target.value as any } })} />
            </div>
            <div className="mt-4">
              <Label>Utilization Notes</Label>
              <Textarea value={child.financialSupport?.utilization || ''} onChange={e => saveChildUpdates({ financialSupport: { ...child.financialSupport, utilization: e.target.value } as any })} />
            </div>
"""
content = re.sub(fin_grant_end, new_fin, content, count=1, flags=re.DOTALL)

fin_doc = r'(<FakeUpload.*?documentStatus.*?/>)'
fin_doc_new = """\\1
              <div className="mt-4">
                <Label>Bill / Receipt Document</Label>
                <FakeUpload status={child.financialSupport?.receiptFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ financialSupport: { ...child.financialSupport, receiptFileName: status } as any })} />
              </div>
"""
content = re.sub(fin_doc, fin_doc_new, content, count=1)

# Home Visit & Parent Support
content = content.replace(
    "<h3 className=\"text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2\">Counselling Log</h3>",
    "<h3 className=\"text-sm font-bold text-slate-900 border-l-4 border-brand-cyan-700 pl-2\">Parent Support Activities</h3>"
)
content = content.replace(
    "<Label className=\"text-[10px]\">Counsellor Name</Label>",
    "<Label className=\"text-[10px]\">Staff/Counsellor Name</Label>"
)
content = content.replace(
    "<div>\s*<Label className=\"text-[10px]\">Topic</Label>",
    """<div>
       <Label className="text-[10px]">Activity Type</Label>
       <Select className="h-7 text-xs mb-2" value={(log as any).activityType || ''} onChange={e => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).activityType = e.target.value; saveChildUpdates({ homeVisitRecords: records }); }} options={['Counselling', 'Training', 'Workshop', 'Expert Session', 'Support Group', 'Follow-up Parents'].map(o=>({label:o,value:o}))} />
       <Label className="text-[10px]">Topic/Purpose</Label>"""
)
# Home Visit additional fields
home_visit_rating = r'<Select\s*options=\{\[\{label: \'1 Star\'[^\}]+\}\]\}\s*value=\{log\.rating\?\.toString\(\)\}.*?/>'
new_home_visit_rating = """<Select 
                          options={[{label: 'Positive', value: 'Positive'}, {label: 'Negative', value: 'Negative'}, {label: 'Scope to Improve', value: 'Scope to Improve'}]}
                          value={(log as any).environmentRating || ''}
                          onChange={e => {
                            const records = [...(child.homeVisitRecords || [])];
                            (records[globalIdx] as any).environmentRating = e.target.value;
                            saveChildUpdates({ homeVisitRecords: records });
                          }}
                        />"""
content = re.sub(home_visit_rating, new_home_visit_rating, content, count=1, flags=re.DOTALL)

home_visit_extras = r'(<Label className="text-\[10px\]">Home Env\. Rating \(1-5\)</Label>.*?</div>\s*<div>\s*<Label className="text-\[10px\]">Next Visit</Label>.*?</div>)'
new_home_visit_extras = """\\1
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center">
                        <input type="checkbox" checked={(log as any).parentCounsellingDone || false} onChange={e => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).parentCounsellingDone = e.target.checked; saveChildUpdates({ homeVisitRecords: records }); }} className="mr-2"/>
                        <Label className="text-[10px] mb-0">Parent Counselling Done</Label>
                      </div>
                      <div>
                        <Label className="text-[10px]">GPS Location</Label>
                        <div className="flex gap-1">
                          <Input className="text-[10px] h-7" value={(log as any).gpsLocation || ''} onChange={e => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).gpsLocation = e.target.value; saveChildUpdates({ homeVisitRecords: records }); }} />
                          <Button size="sm" variant="outline" className="px-2 h-7" onClick={() => navigator.geolocation.getCurrentPosition(pos => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).gpsLocation = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`; saveChildUpdates({ homeVisitRecords: records }); })}>📍</Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label className="text-[10px]">Photos</Label>
                      <FakeUpload status={(log as any).photoFileName ? 'Uploaded' : ''} onUpload={(status) => { const records = [...(child.homeVisitRecords || [])]; (records[globalIdx] as any).photoFileName = status; saveChildUpdates({ homeVisitRecords: records }); }} />
                    </div>"""
content = re.sub(home_visit_extras, new_home_visit_extras, content, count=1, flags=re.DOTALL)


with open('/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx', 'w') as f:
    f.write(content)
