import re

path_cp = '/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/ChildProfile.tsx'
with open(path_cp, 'r') as f:
    content = f.read()

content = content.replace(
    "import { Child, FollowUp, Diagnosis, TherapyCentre, Sponsorship, ChildJourneyStatus, MockDocument, SchoolAdmissionDetails, TherapyProgressDetails } from '../types';",
    "import { Child, FollowUp, Diagnosis, TherapyCentre, Sponsorship, ChildJourneyStatus, MockDocument, SchoolAdmissionDetails, TherapyProgressDetails, FamilyDetails } from '../types';"
)

content = content.replace(
    'placeholder="Remarks" value={rev.remarks} placeholder="Remarks"',
    'value={rev.remarks} placeholder="Remarks"'
)

with open(path_cp, 'w') as f:
    f.write(content)

path_camps = '/Users/smit/Desktop/vishalwin/src/programmes/renu/pages/Camps.tsx'
with open(path_camps, 'r') as f:
    camps = f.read()

camps = camps.replace("Camp['organizer']['collaborationType']", "any")
camps = camps.replace("Camp['campFollowUp']['ageBand']", "any")
camps = camps.replace("organizer: camp.organizer || { isCollaborated: false, collaborationType: 'CSR', instituteName: '', instituteAddress: '', repName: '', repDesignation: '', repContact: '', repEmail: '' }", "organizer: (camp.organizer || { isCollaborated: false, collaborationType: 'CSR', instituteName: '', instituteAddress: '', repName: '', repDesignation: '', repContact: '', repEmail: '' }) as any")
camps = camps.replace("campFollowUp: camp.campFollowUp || { ageBand: '0-12', isDisabilityID: false, referralTherapy: false, referralMedicalTreatment: false, referralGovtScheme: false, referralRenuAdmission: false }", "campFollowUp: (camp.campFollowUp || { ageBand: '0-12', isDisabilityID: false, referralTherapy: false, referralMedicalTreatment: false, referralGovtScheme: false, referralRenuAdmission: false }) as any")

with open(path_camps, 'w') as f:
    f.write(camps)
