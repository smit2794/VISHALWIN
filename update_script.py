import re

def update_file():
    path = '/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Update Demographics Card
    demographics_old = r'<Label className="mb-2">Parent / Guardian Information</Label>.*?</div>\s*</div>\s*</div>'
    demographics_new = """<Label className="mb-2">Demographics & Contact</Label>
              <div className="space-y-4 p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px]">UDID No.</Label>
                      <Input value={child.udidNo || ''} onChange={e => saveChildUpdates({ udidNo: e.target.value })} className="h-7 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Blood Group</Label>
                      <Input value={child.bloodGroup || ''} onChange={e => saveChildUpdates({ bloodGroup: e.target.value })} className="h-7 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Religion</Label>
                      <Input value={child.religion || ''} onChange={e => saveChildUpdates({ religion: e.target.value })} className="h-7 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">District</Label>
                      <Input value={child.district || ''} onChange={e => saveChildUpdates({ district: e.target.value })} className="h-7 text-xs" />
                    </div>
                  </div>
                  <div className="w-24 text-center">
                    <div className="h-20 w-20 rounded border-2 border-dashed border-slate-300 mx-auto flex items-center justify-center overflow-hidden bg-slate-100">
                      {child.photo && child.photo.startsWith('http') ? <img src={child.photo} className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-slate-400" />}
                    </div>
                    <div className="mt-1">
                      <FakeUpload status={child.photo ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ photo: status })} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Registration Source</Label>
                  <Select 
                    className="h-7 text-xs"
                    value={child.registrationSource || ''} 
                    onChange={e => saveChildUpdates({ registrationSource: e.target.value as any })}
                    options={[{label: 'Select Source', value: ''}, 'Medical Camp', 'Helpline', 'Field Visit', 'NGO Request', 'School', 'Hospital', 'Government', 'Parent Walk-in', 'Reference', 'Other'].map(o => typeof o === 'string' ? {label: o, value: o} : o)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2">Address & Area Location</Label>
              <div className="space-y-2 p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Local Area / Slum Settlement</span>
                  <span className="font-bold text-slate-800">{child.area}, {child.city}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Street Address</span>
                  <span className="font-bold text-slate-800">{child.address}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Pincode</span>
                  <span className="font-bold text-slate-800">{child.pincode}</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Label className="mb-2 mt-2">Family & Guardian Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['father', 'mother', 'guardian'].map((role) => (
                  <div key={role} className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl space-y-2">
                    <span className="text-[10px] text-brand-cyan-700 font-bold uppercase">{role} Details</span>
                    <div><Label className="text-[9px]">Name</Label><Input value={child.familyDetails?.[role as keyof FamilyDetails]?.name || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...child.familyDetails?.[role as keyof FamilyDetails], name: e.target.value } } })} className="h-6 text-[10px]" /></div>
                    <div><Label className="text-[9px]">Education</Label><Input value={child.familyDetails?.[role as keyof FamilyDetails]?.education || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...child.familyDetails?.[role as keyof FamilyDetails], education: e.target.value } } })} className="h-6 text-[10px]" /></div>
                    <div><Label className="text-[9px]">Occupation</Label><Input value={child.familyDetails?.[role as keyof FamilyDetails]?.occupation || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...child.familyDetails?.[role as keyof FamilyDetails], occupation: e.target.value } } })} className="h-6 text-[10px]" /></div>
                    <div><Label className="text-[9px]">Mobile</Label><Input value={child.familyDetails?.[role as keyof FamilyDetails]?.mobile || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, [role]: { ...child.familyDetails?.[role as keyof FamilyDetails], mobile: e.target.value } } })} className="h-6 text-[10px]" /></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                  <span className="text-[10px] text-brand-cyan-700 font-bold uppercase block mb-2">Family Income</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-[9px]">Annual Income</Label><Input type="number" value={child.familyDetails?.annualIncome || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, annualIncome: Number(e.target.value) } })} className="h-6 text-[10px]" /></div>
                    <div><Label className="text-[9px]">Members Count</Label><Input type="number" value={child.familyDetails?.familyMembersCount || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, familyMembersCount: Number(e.target.value) } })} className="h-6 text-[10px]" /></div>
                    <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={child.familyDetails?.bplStatus || false} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, bplStatus: e.target.checked } })} /> <Label className="mb-0 text-[10px]">BPL Status</Label></div>
                    <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={child.familyDetails?.rationCard || false} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, rationCard: e.target.checked } })} /> <Label className="mb-0 text-[10px]">Ration Card</Label></div>
                    <div className="col-span-2 mt-1">
                      <Label className="text-[9px]">Socio-economic Status</Label>
                      <Select className="h-6 text-[10px]" value={child.familyDetails?.socioEconomicStatus || ''} onChange={e => saveChildUpdates({ familyDetails: { ...child.familyDetails, socioEconomicStatus: e.target.value as any } })} options={[{label: 'Select', value: ''}, 'Low', 'Lower Middle', 'Middle', 'Upper'].map(o => typeof o === 'string' ? {label: o, value: o} : o)} />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-xl">
                  <span className="text-[10px] text-brand-cyan-700 font-bold uppercase block mb-2">Emergency Contact</span>
                  <div><Label className="text-[9px]">Name</Label><Input value={child.emergencyContact?.name || ''} onChange={e => saveChildUpdates({ emergencyContact: { ...child.emergencyContact, name: e.target.value } })} className="h-6 text-[10px] mb-2" /></div>
                  <div><Label className="text-[9px]">Relation</Label><Input value={child.emergencyContact?.relation || ''} onChange={e => saveChildUpdates({ emergencyContact: { ...child.emergencyContact, relation: e.target.value } })} className="h-6 text-[10px] mb-2" /></div>
                  <div><Label className="text-[9px]">Mobile</Label><Input value={child.emergencyContact?.mobile || ''} onChange={e => saveChildUpdates({ emergencyContact: { ...child.emergencyContact, mobile: e.target.value } })} className="h-6 text-[10px]" /></div>
                </div>
              </div>
            </div>"""

    content = re.sub(demographics_old, demographics_new, content, flags=re.DOTALL)

    # 2. Update Diagnosis Card
    diagnosis_old = r'<div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg col-span-2 text-left">.*?</div>'
    diagnosis_new = """<div className="p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg col-span-2 text-left space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[9px]">Primary Diagnosis</Label><Input value={child.primaryDiagnosis || ''} onChange={e => saveChildUpdates({ primaryDiagnosis: e.target.value })} className="h-6 text-[10px]" /></div>
                      <div><Label className="text-[9px]">Secondary Diagnosis</Label><Input value={child.secondaryDiagnosis || ''} onChange={e => saveChildUpdates({ secondaryDiagnosis: e.target.value })} className="h-6 text-[10px]" /></div>
                    </div>
                    <div><Label className="text-[9px]">Co-morbidities</Label><Input value={child.coMorbidities || ''} onChange={e => saveChildUpdates({ coMorbidities: e.target.value })} className="h-6 text-[10px]" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[9px]">Severity</Label>
                        <Select className="h-6 text-[10px]" value={child.severity || ''} onChange={e => saveChildUpdates({ severity: e.target.value as any })} options={[{label: 'Select', value: ''}, 'Mild', 'Moderate', 'Severe', 'Profound'].map(o => typeof o === 'string' ? {label: o, value: o} : o)} />
                      </div>
                      <div>
                        <Label className="text-[9px]">Disability Type</Label>
                        <Select className="h-6 text-[10px]" value={child.disabilityType || ''} onChange={e => saveChildUpdates({ disabilityType: e.target.value as any })} options={[{label: 'Select', value: ''}, 'Autism', 'Intellectual Disability', 'Cerebral Palsy', 'ADHD', 'Down Syndrome', 'Learning Disability', 'Hearing Impairment', 'Visual Impairment', 'Multiple Disability', 'Others'].map(o => typeof o === 'string' ? {label: o, value: o} : o)} />
                      </div>
                    </div>
                  </div>"""
    content = re.sub(diagnosis_old, diagnosis_new, content, count=1, flags=re.DOTALL)

    # 3. Document Uploads Card
    doc_old = r'<Card className="p-5">\s*<div className="flex justify-between items-center mb-3">.*?<\/Card>'
    doc_new = """<Card className="p-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 font-display mb-3">
                <FileCheck className="h-4 w-4 text-brand-cyan-700" /> Required Documents
              </h3>
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div><span className="font-bold text-xs">Birth Certificate</span></div>
                  <FakeUpload status={child.birthCertificateFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ birthCertificateFileName: status })} />
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div><span className="font-bold text-xs">Aadhaar Card</span></div>
                  <FakeUpload status={child.aadhaarCardFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ aadhaarCardFileName: status })} />
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div><span className="font-bold text-xs">Disability Certificate</span></div>
                  <FakeUpload status={child.disabilityCertificatesFileName ? 'Uploaded' : ''} onUpload={(status) => saveChildUpdates({ disabilityCertificatesFileName: status })} />
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 font-display">
                  <FileText className="h-4 w-4 text-brand-cyan-700" /> Additional Documents
                </h3>
                <Button size="sm" variant="outline" onClick={() => setIsDocModalOpen(true)} className="py-0.5 px-2 text-[10px]">Attach</Button>
              </div>
              <div className="space-y-2">
                {!child.documents || child.documents.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-3 text-xs">No additional documents.</p>
                ) : (
                  child.documents.map(doc => (
                    <div key={doc.id} className="p-2.5 bg-slate-50/50 border border-slate-100/50 rounded-lg flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800 text-xs truncate">{doc.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{doc.type} • {doc.date}</div>
                      </div>
                      <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="p-1 text-slate-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>"""
    content = re.sub(doc_old, doc_new, content, count=1, flags=re.DOTALL)

    # Now handle the Tabs portion
    tabs_old = r'\{\/\* TAB 1: ASSESSMENT \*\/\}.*?\{\/\* TAB 2: MEDICAL RECORDS \*\/\}'
    
    # We will just inject the entire tabs content by replacing the whole `<div className="p-6 bg-white min-h-[400px]">...</div>`
    
    with open(path, 'w') as f:
        f.write(content)
        
update_file()
