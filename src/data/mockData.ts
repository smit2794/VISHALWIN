import {
 Child,
 Camp,
 FollowUp,
 Diagnosis,
 TherapyCentre,
 Sponsorship,
 InventoryItem,
 InventoryDistribution,
 CoordinatorActivity,
 Coordinator,
 MockDocument
} from'../types';

// Helper to generate dates relative to today
const getDateAgo = (days: number): string => {
 const date = new Date();
 date.setDate(date.getDate() - days);
 return date.toISOString().split('T')[0];
};

const getDateAhead = (days: number): string => {
 const date = new Date();
 date.setDate(date.getDate() + days);
 return date.toISOString().split('T')[0];
};

// 1. Coordinators
const FIRST_NAMES_COORD = ['Rohan','Ramesh','Sanjay','Sunita','Anjali','Karan','Priya','Amit','Neha','Vikram','Deepika','Rahul','Jyoti','Rajesh','Preeti'];
const LAST_NAMES = ['Kulkarni','Sharma','Verma','Patel','Joshi','Mehta','Nair','Rao','Singh','Deshmukh','Reddy','Pillai','Sen','Gupta','Das'];
const AREAS = ['Dharavi','Kurla','Hadapsar','Kothrud','Whitefield','Majestic','Secunderabad','Gachibowli','T Nagar','Velachery','Salt Lake','Howrah','Chandni Chowk','Dwarka','Koramangala'];
const CITIES = ['Mumbai','Mumbai','Pune','Pune','Bangalore','Bangalore','Hyderabad','Hyderabad','Chennai','Chennai','Kolkata','Kolkata','Delhi','Delhi','Bangalore'];

const generateCoordinators = (): Coordinator[] => {
 return Array.from({ length: 15 }, (_, i) => ({
 id:`COORD-${100 + i}`,
 name: i === 0 ?'Rohan Kulkarni':`${FIRST_NAMES_COORD[i]} ${LAST_NAMES[i]}`,
 mobile:`+91 98765 43${200 + i}`,
 email: i === 0 ?'rohan.k@vishalwin.org':`${FIRST_NAMES_COORD[i].toLowerCase()}.${LAST_NAMES[i].toLowerCase()}@vishalwin.org`,
 assignedArea:`${AREAS[i]}, ${CITIES[i]}`,
 campsManagedCount: 4 + (i % 3),
 childrenRegisteredCount: 15 + (i * 2),
 followUpsCompletedCount: 20 + i,
 activeChildrenCount: 8 + (i % 4),
 }));
};

// 2. Therapy Centres
const CENTRE_NAMES = [
'Nirmal Rehabilitation Centre',
'Asha Speech & Hearing Clinic',
'Prayas Child Development Centre',
'Sanjeevani Occupational Therapy',
'Step-by-Step Learning Academy',
'Tarang Counselling & Physiotherapy',
'Umang Special School',
'Jyoti Integrated Therapy Clinic',
'Navjeevan Child Care Foundation',
'Sadhana Neurodevelopmental Centre'
];

const SERVICES_LIST = [
 ['Special Education','Speech Therapy','Occupational Therapy'],
 ['Speech Therapy','Counselling'],
 ['Special Education','Speech Therapy','Occupational Therapy','Physiotherapy','Counselling'],
 ['Occupational Therapy','Physiotherapy'],
 ['Special Education'],
 ['Physiotherapy','Counselling'],
 ['Special Education','Speech Therapy','Counselling'],
 ['Speech Therapy','Occupational Therapy','Physiotherapy'],
 ['Special Education','Occupational Therapy','Counselling'],
 ['Special Education','Speech Therapy','Occupational Therapy','Physiotherapy']
];

const generateTherapyCentres = (): TherapyCentre[] => {
 return CENTRE_NAMES.map((name, i) => ({
 id:`TC-${200 + i}`,
 name,
 address:`${20 + i * 4}, Main Road, ${AREAS[i % AREAS.length]}, ${CITIES[i % CITIES.length]}`,
 contactPerson:`Dr. ${FIRST_NAMES_COORD[(i + 5) % FIRST_NAMES_COORD.length]} ${LAST_NAMES[(i + 2) % LAST_NAMES.length]}`,
 contactNumber:`+91 91234 567${10 + i}`,
 services: SERVICES_LIST[i] as any,
 sponsorshipRequired: i % 3 !== 0,
 enrollmentDate: getDateAgo(60 + i * 5),
 assignedTherapist:`Therapist ${FIRST_NAMES_COORD[(i + 8) % FIRST_NAMES_COORD.length]}`
 }));
};

// 3. Camps
const CAMP_LOCATIONS = [
'Community Hall','Govt School Ground','Primary Health Centre','Municipal Welfare Office','Rotary Club Hall'
];

const generateCamps = (coordinators: Coordinator[]): Camp[] => {
 return Array.from({ length: 20 }, (_, i) => {
 const coordIndex = i % coordinators.length;
 const reg = 15 + (i * 3) + (i % 4);
 const spec = Math.floor(reg * (0.2 + (i % 4) * 0.08));
 const norm = reg - spec;
 const fup = Math.floor(spec * 0.9);

 return {
 id:`CAMP-${300 + i}`,
 name:`RENU Medical Camp - ${AREAS[i % AREAS.length]}`,
 date: getDateAgo(15 * (20 - i)), // Camps conducted over the past 300 days
 location:`${CAMP_LOCATIONS[i % CAMP_LOCATIONS.length]}, ${AREAS[i % AREAS.length]}`,
 area: AREAS[i % AREAS.length],
 city: CITIES[i % CITIES.length],
 coordinatorId: coordinators[coordIndex].id,
 doctorName:`Dr. Amit ${LAST_NAMES[(i + 4) % LAST_NAMES.length]} (Pediatrician)`,
 therapistName:`Therapist Sneha ${LAST_NAMES[(i + 7) % LAST_NAMES.length]}`,
 registeredCount: reg,
 normalCount: norm,
 specialCount: spec,
 followUpsRequiredCount: fup,
 };
 });
};

// 4. Children
const CHILDREN_FIRST_NAMES = [
'Aarav','Ishaan','Ananya','Diya','Vihaan','Aditya','Riya','Priya','Kabir','Rahul',
'Vivaan','Sai','Arjun','Meera','Rohan','Sneha','Krishna','Tanvi','Dev','Neha',
'Rudra','Kavya','Siddharth','Avani','Karan','Pooja','Ganesh','Shruti','Vikram','Shreya',
'Aryan','Divya','Mayank','Anjali','Yash','Kirti','Pranav','Nisha','Alok','Preeti',
'Samarth','Geeta','Harsh','Sheetal','Manish','Komal','Saurabh','Kiran','Nitin','Deepa'
];

const SCHOOLS = [
'St. Mary High School','Municipal Primary School No. 4','Saraswati Vidyalaya','Kalyan Public School','National English School'
];

const DISABILITY_TYPES = ['Autism','Down Syndrome','ADHD','Intellectual Disability','Speech Delay','Development Delay','Learning Disability','Other'];
const SEVERITIES = ['Mild','Moderate','Severe'];

const JOURNEY_STEPS_LIST: any[] = [
'Medical Camp',
'Screening',
'Child Classification',
'Follow-Up',
'Diagnosis',
'Therapy Centre Enrollment',
'Sponsorship Support',
'Active Therapy',
'Progress Tracking',
'School Ready',
'School Admission'
];

const generateChildren = (camps: Camp[]): Child[] => {
 return CHILDREN_FIRST_NAMES.map((name, i) => {
 const camp = camps[i % camps.length];
 const isSpecial = i % 3 !== 0; // ~34 out of 50 Special Children
 const age = 3 + (i % 10);
 const dob = getDateAgo(age * 365 + (i * 12));
 const classification = isSpecial ?'Special':'Normal';
 
 let journeyStatus: any ='Medical Camp';
 if (isSpecial) {
 journeyStatus = JOURNEY_STEPS_LIST[i % JOURNEY_STEPS_LIST.length];
 } else {
 const normalStatuses = ['Screening','School Ready','School Admission'];
 journeyStatus = normalStatuses[i % normalStatuses.length];
 }

 const disabilityType = isSpecial ? (DISABILITY_TYPES[i % DISABILITY_TYPES.length] as any) : undefined;
 const severity = isSpecial ? (SEVERITIES[i % SEVERITIES.length] as any) : undefined;

 const isNotEnrolled = journeyStatus !=='School Admission'&& (age < 6 || i % 4 !== 0);

 // Initial mock documents
 const documents: MockDocument[] = isSpecial ? [
 { id:`DOC-${camps.length + i}-1`, type:'Medical Report', name:'pediatric_screening_camp_eval.pdf', date: getDateAgo(30 + i), fileSize:'1.2 MB'},
 { id:`DOC-${camps.length + i}-2`, type:'Assessment Report', name:'child_developmental_milestones.pdf', date: getDateAgo(25 + i), fileSize:'850 KB'},
 ] : [];

 const stepIdx = JOURNEY_STEPS_LIST.indexOf(journeyStatus);
 if (isSpecial && stepIdx >= 4) { // Diagnosis step
 documents.push({ id:`DOC-${camps.length + i}-3`, type:'Disability Certificate', name:'govt_disability_certificate.pdf', date: getDateAgo(20 + i), fileSize:'2.1 MB'});
 }
 if (isSpecial && stepIdx >= 5) { // Therapy step
 documents.push({ id:`DOC-${camps.length + i}-4`, type:'Therapy Recommendation', name:'occupational_therapy_plan.pdf', date: getDateAgo(15 + i), fileSize:'450 KB'});
 }

 const therapyProgressScore = (isSpecial && stepIdx >= 7) ? (60 + (i * 7) % 35) : undefined;

 // V2 progressHistory timeline
 const progressHistory = isSpecial ? [
 { date: getDateAgo(90), score: 35, notes:'Intake and baseline pediatric milestone scoring logged.'},
 { date: getDateAgo(45), score: 50, notes:'Shows milestone adaptations, communication triggers positive.'},
 { date: getDateAgo(10), score: therapyProgressScore || 65, notes:'Improvements observed in focus and motor coordination.'}
 ] : [];

 // V2 TherapyProgressDetails
 const therapyProgress = (isSpecial && stepIdx >= 7) ? {
 therapyType: (i % 2 === 0 ?'Speech Therapy':'Occupational Therapy') as any,
 assignedTherapist:`Therapist Sneha ${LAST_NAMES[(i + 7) % LAST_NAMES.length]}`,
 sessionsCompleted: 12 + (i % 8),
 sessionsRemaining: 24 - (i % 8),
 progressScore: therapyProgressScore || 65,
 therapistRemarks:'Attends sessions regularly. Cooperating well with therapists.'
 } : undefined;

 // V2 SchoolAdmissionDetails
 const schoolAdmission = (journeyStatus ==='School Ready'|| journeyStatus ==='School Admission') ? {
 admissionDate: getDateAgo(15 + i),
 schoolName: SCHOOLS[i % SCHOOLS.length],
 schoolType: (i % 3 === 0 ?'Government': i % 3 === 1 ?'Inclusive':'Private') as any,
 standard: age < 6 ?'Nursery': age < 8 ?'1st Std':'2nd Std',
 admissionStatus: (journeyStatus ==='School Admission'?'Confirmed':'Applied') as any,
 educationSupportProvided: ['Uniforms','Textbooks'] as any,
 feesSponsored: i % 2 === 0,
 feesSponsoredAmount: i % 2 === 0 ? 12000 : 0,
 remarks:'Successfully cleared the basic school readiness evaluation checks.'
 } : undefined;

 return {
 id:`CHI-${400 + i}`,
 name:`${name} ${LAST_NAMES[(i + 1) % LAST_NAMES.length]}`,
 photo:`https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
 dob,
 age,
 gender: i % 2 === 0 ?'Male': ('Female'as any),
 fatherName:`${FIRST_NAMES_COORD[(i * 3) % FIRST_NAMES_COORD.length]} ${LAST_NAMES[(i + 1) % LAST_NAMES.length]}`,
 motherName:`${FIRST_NAMES_COORD[(i * 3 + 1) % FIRST_NAMES_COORD.length]} ${LAST_NAMES[(i + 1) % LAST_NAMES.length]}`,
 mobile:`+91 99887 766${10 + i}`,
 alternateMobile: i % 3 === 0 ?`+91 99887 766${50 + i}`: undefined,
 address:`${101 + i * 3}, Block B, Slum Rehabilitation Colony, ${camp.area}`,
 area: camp.area,
 city: camp.city,
 pincode:`4000${10 + i}`,
 schoolName: isNotEnrolled ? undefined : SCHOOLS[i % SCHOOLS.length],
 currentStandard: isNotEnrolled ? undefined : (age < 6 ?'Nursery': age < 8 ?'1st Std':'2nd Std'),
 isNotEnrolled,
 classification,
 disabilityType,
 severity,
 journeyStatus,
 registeredDate: camp.date,
 campId: camp.id,
 therapyProgressScore,
 documents,
 certificateAvailable: isSpecial && stepIdx >= 4,
 attendanceStatus: i % 5 === 0 ?'Absent':'Present',
 progressHistory,
 schoolAdmission,
 therapyProgress
 };
 });
};

// 5. Follow-Ups
const FOLLOW_UP_NOTES = [
'Parent was counselled about therapy center availability.',
'Child shows improvement in eye contact. Recommend speech therapy session count upgrade.',
'Discussed ADHD behavioural tracking with mother. Diet chart shared.',
'Reviewed progress reports. Child is showing excellent response to special education.',
'Parent missed the previous therapy session. Followed up on attendance issues.',
'Child is ready for school enrollment. Handed over school readiness kit.',
'Therapist notes positive change in social interactions. Motor skills need work.',
'Initial counseling completed. Parent is hesitant about clinical diagnosis.'
];

const FOLLOW_UP_DISCUSSIONS = [
'Explained the therapy schedule and subsidies available.',
'Shared methods to reinforce vocabulary at home.',
'Parent agreed to limit screen time and report back.',
'Mother was happy with progress; asked about school admission helper.',
'Father cited work shifts for missed therapy; resolved by shifting to weekend slots.',
'Parent wants guidance in choosing a inclusive school nearby.',
'Discussed fine-motor exercises to practice using clay at home.',
'Counselled parent regarding the importance of a disability certificate.'
];

const generateFollowUps = (children: Child[], coordinators: Coordinator[]): FollowUp[] => {
 const followUps: FollowUp[] = [];
 let followUpIdCount = 500;

 children.forEach((child, index) => {
 const numFollowUps = 1 + (index % 3);
 const coord = coordinators[index % coordinators.length];

 for (let fIndex = 0; fIndex < numFollowUps; fIndex++) {
 const isPast = fIndex < numFollowUps - 1 || index % 3 !== 0; // Most are completed/past
 const date = isPast ? getDateAgo(30 * (numFollowUps - fIndex)) : getDateAhead(5 * (index % 4) + 2);
 const status = isPast ?'Completed':'Pending';

 followUps.push({
 id:`FUP-${followUpIdCount++}`,
 childId: child.id,
 childName: child.name,
 date,
 notes: FOLLOW_UP_NOTES[(index + fIndex) % FOLLOW_UP_NOTES.length],
 parentDiscussion: FOLLOW_UP_DISCUSSIONS[(index + fIndex) % FOLLOW_UP_DISCUSSIONS.length],
 progressUpdates: isPast ?'Slight developmental milestones achieved.':'Progress review scheduled.',
 issuesIdentified: index % 5 === 0 ?'Fine motor coordination delay':'None reported',
 recommendations: index % 2 === 0 ?'Continue sensory integration therapy.':'Encourage communication cues.',
 nextFollowUpDate: status ==='Completed'? getDateAhead(30) : undefined,
 status,
 coordinatorId: coord.id,
 coordinatorName: coord.name,
 // Parent Communication details
 communicationType: (fIndex % 3 === 0 ?'Home Visit': fIndex % 3 === 1 ?'Call':'Meeting') as any,
 actionItems:'Discuss milestones checklist next session. Log visual trackers.',
 nextFollowUpPlan:'Evaluate school enrollment criteria and document certificate.'
 });
 }
 });

 return followUps.slice(0, 100);
};

// 6. Diagnoses
const ASSESSMENT_SUMMARIES = [
'Child exhibits classic symptoms of speech delay and attention deficit. IQ scores are average.',
'Clinical evaluations show Down Syndrome phenotypic traits with mild motor delays.',
'Autism Spectrum Disorder confirmed. Shows sensory hyper-reactivity and speech echolalia.',
'Developmental coordination disorder and mild learning disability identified.',
'Mild intellectual developmental disability. Recommended for Special Education.',
'Severe ADHD symptoms. Occupational therapy and behaviour modifications recommended.'
];

const OUTCOMES = [
'Refer to Speech Therapy & Behavioural Coaching',
'Assigned to Nirmal Rehabilitation Centre for Multi-specialty Care',
'Enrolled in Speech & Occupational Therapy at Prayas Child Development Centre',
'Allocate Special Schooling and Physiotherapy support',
'Enrolled in Special Education and Occupational Therapy',
'Recommended for Behaviour Therapy and Counselling sessions'
];

const generateDiagnoses = (children: Child[], therapyCentres: TherapyCentre[]): Diagnosis[] => {
 const specialChildren = children.filter(c => c.classification ==='Special');
 
 return specialChildren.map((child, i) => {
 const tc = therapyCentres[i % therapyCentres.length];
 return {
 id:`DIA-${600 + i}`,
 childId: child.id,
 childName: child.name,
 date: getDateAgo(30 + i * 4),
 centreName: tc.name,
 assessmentSummary: ASSESSMENT_SUMMARIES[i % ASSESSMENT_SUMMARIES.length],
 certificateAvailable: i % 4 !== 0,
 medicalReportUrl:`/reports/medical_rep_${child.id}.pdf`,
 assessmentScore: 45 + (i * 7) % 45,
 outcome: OUTCOMES[i % OUTCOMES.length]
 };
 });
};

// 7. Sponsorships
const SPONSORS = ['Tata Trusts','Reliance Foundation','Azim Premji Foundation','Individual Donor - K. Mehta','GiveIndia NGO Pool','LIC Golden Jubilee Foundation','Cognizant CSR','Infosys Foundation','Individual Donor - S. Sharma','HDFC Bank Parivartan'];
const COVERAGES = [
 ['Therapy Fees','Education Support'],
 ['Therapy Fees','Assessment Cost','Transportation Support'],
 ['Therapy Fees'],
 ['Education Support'],
 ['Therapy Fees','Education Support','Assessment Cost','Transportation Support']
];

const generateSponsorships = (children: Child[]): Sponsorship[] => {
 const specialChildren = children.filter(c => c.classification ==='Special');
 
 return Array.from({ length: 30 }, (_, i) => {
 const beneficiary = specialChildren[i % specialChildren.length];
 const status = i % 10 === 0 ?'Pending': i % 10 === 9 ?'Completed':'Active';
 
 return {
 id:`SPO-${700 + i}`,
 sponsorName: SPONSORS[i % SPONSORS.length],
 amount: 15000 + (i * 2500),
 startDate: getDateAgo(180 - i * 3),
 endDate: getDateAhead(180 + i * 3),
 coverage: COVERAGES[i % COVERAGES.length] as any,
 status,
 childId: beneficiary.id,
 childName: beneficiary.name
 };
 });
};

// 8. Inventory - Rebuilt Categories and Specific Items
const INVENTORY_ITEMS_SEED = [
 // Medical Items
 { name:'First Aid Kit', category:'Medical Items', qty: 25 },
 { name:'Masks', category:'Medical Items', qty: 60 },
 { name:'Gloves', category:'Medical Items', qty: 80 },
 // Educational Material
 { name:'Books', category:'Educational Material', qty: 100 },
 { name:'Learning Kits', category:'Educational Material', qty: 45 },
 { name:'Awareness Material', category:'Educational Material', qty: 250 },
 // Support Equipment
 { name:'Wheelchairs', category:'Support Equipment', qty: 8 },
 { name:'Hearing Aids', category:'Support Equipment', qty: 15 },
 { name:'Therapy Kits', category:'Support Equipment', qty: 12 },
];

const generateInventory = (camps: Camp[]): InventoryItem[] => {
 const fullList: InventoryItem[] = [];
 
 INVENTORY_ITEMS_SEED.forEach((item, i) => {
 const camp = camps[i % camps.length];
 const dist = Math.floor(item.qty * 0.4);
 fullList.push({
 id:`INV-${800 + i}`,
 name: item.name,
 category: item.category as any,
 availableQty: item.qty - dist,
 distributedQty: dist,
 remainingQty: item.qty - dist,
 allocatedCampId: camp.id,
 allocatedCampName: camp.name
 });
 });
 
 // Pad with batch variations up to 50
 for (let i = 0; i < 41; i++) {
 const baseItem = INVENTORY_ITEMS_SEED[i % INVENTORY_ITEMS_SEED.length];
 const camp = camps[(i + 5) % camps.length];
 const qty = baseItem.qty + 10 + (i * 2);
 const dist = Math.floor(qty * 0.35);
 
 fullList.push({
 id:`INV-${800 + INVENTORY_ITEMS_SEED.length + i}`,
 name:`${baseItem.name} (Batch ${String.fromCharCode(65 + i % 3)})`,
 category: baseItem.category as any,
 availableQty: qty - dist,
 distributedQty: dist,
 remainingQty: qty - dist,
 allocatedCampId: camp.id,
 allocatedCampName: camp.name
 });
 }

 return fullList.slice(0, 50);
};

// 9. Inventory Distribution Logs Seeding
const generateInventoryDistributions = (inventory: InventoryItem[], camps: Camp[]): InventoryDistribution[] => {
 return Array.from({ length: 15 }, (_, i) => {
 const item = inventory[i % inventory.length];
 const camp = camps[i % camps.length];
 const qtyDist = 2 + (i % 4);
 
 return {
 id:`DIST-${900 + i}`,
 itemId: item.id,
 itemName: item.name,
 category: item.category,
 campId: camp.id,
 campName: camp.name,
 quantityDistributed: qtyDist,
 distributionDate: getDateAgo(10 + i * 2),
 remainingStockAfter: Math.max(1, item.remainingQty - qtyDist)
 };
 });
};

// 10. Coordinator Activity Timeline Seeding
const generateCoordinatorActivities = (children: Child[], coordinators: Coordinator[], camps: Camp[]): CoordinatorActivity[] => {
 const types: CoordinatorActivity['type'][] = ['Registration','Assessment','Follow-Up','Document','Progress','Attendance'];
 const descriptions = [
'Registered child at camp screening center',
'Updated developmental milestone assessment logs',
'Logged monthly follow-up meeting remarks',
'Uploaded medical report document attachment',
'Updated therapy progress checklist rating score',
'Completed camp attendance screening check'
 ];

 return Array.from({ length: 25 }, (_, i) => {
 const coord = coordinators[i % coordinators.length];
 const child = children[i % children.length];
 const camp = camps[i % camps.length];
 const actType = types[i % types.length];

 return {
 id:`ACT-${950 + i}`,
 coordinatorId: coord.id,
 type: actType,
 childId: child.id,
 childName: child.name,
 campName: camp.name,
 description:`${descriptions[i % descriptions.length]} for ${child.name}.`,
 date: getDateAgo(1 + i * 2)
 };
 });
};

// Core local storage utility manager
export class RenuStore {
 private static getKey(key: string) {
 return`renu_${key}`;
 }

 private static load<T>(key: string, generator: () => T): T {
 const stored = localStorage.getItem(this.getKey(key));
 if (stored) {
 try {
 return JSON.parse(stored);
 } catch (e) {
 console.error(`Error reading key ${key} from storage`, e);
 }
 }
 const fresh = generator();
 this.save(key, fresh);
 return fresh;
 }

 private static save<T>(key: string, data: T): void {
 localStorage.setItem(this.getKey(key), JSON.stringify(data));
 }

 // API getters and setters
 static getCoordinators(): Coordinator[] {
 return this.load<Coordinator[]>('coordinators', generateCoordinators);
 }
 static saveCoordinators(data: Coordinator[]): void {
 this.save('coordinators', data);
 }

 static getTherapyCentres(): TherapyCentre[] {
 return this.load<TherapyCentre[]>('therapy_centres', generateTherapyCentres);
 }
 static saveTherapyCentres(data: TherapyCentre[]): void {
 this.save('therapy_centres', data);
 }

 static getCamps(): Camp[] {
 const coords = this.getCoordinators();
 return this.load<Camp[]>('camps', () => generateCamps(coords));
 }
 static saveCamps(data: Camp[]): void {
 this.save('camps', data);
 }

 static getChildren(): Child[] {
 const camps = this.getCamps();
 return this.load<Child[]>('children', () => generateChildren(camps));
 }
 static saveChildren(data: Child[]): void {
 this.save('children', data);
 }

 static getFollowUps(): FollowUp[] {
 const children = this.getChildren();
 const coords = this.getCoordinators();
 return this.load<FollowUp[]>('followups', () => generateFollowUps(children, coords));
 }
 static saveFollowUps(data: FollowUp[]): void {
 this.save('followups', data);
 }

 static getDiagnoses(): Diagnosis[] {
 const children = this.getChildren();
 const tcs = this.getTherapyCentres();
 return this.load<Diagnosis[]>('diagnoses', () => generateDiagnoses(children, tcs));
 }
 static saveDiagnoses(data: Diagnosis[]): void {
 this.save('diagnoses', data);
 }

 static getSponsorships(): Sponsorship[] {
 const children = this.getChildren();
 return this.load<Sponsorship[]>('sponsorships', () => generateSponsorships(children));
 }
 static saveSponsorships(data: Sponsorship[]): void {
 this.save('sponsorships', data);
 }

 static getInventory(): InventoryItem[] {
 const camps = this.getCamps();
 return this.load<InventoryItem[]>('inventory', () => generateInventory(camps));
 }
 static saveInventory(data: InventoryItem[]): void {
 this.save('inventory', data);
 }

 static getInventoryDistributions(): InventoryDistribution[] {
 const inv = this.getInventory();
 const camps = this.getCamps();
 return this.load<InventoryDistribution[]>('inventory_distributions', () => generateInventoryDistributions(inv, camps));
 }
 static saveInventoryDistributions(data: InventoryDistribution[]): void {
 this.save('inventory_distributions', data);
 }

 static getCoordinatorActivities(): CoordinatorActivity[] {
 const children = this.getChildren();
 const coords = this.getCoordinators();
 const camps = this.getCamps();
 return this.load<CoordinatorActivity[]>('coordinator_activities', () => generateCoordinatorActivities(children, coords, camps));
 }
 static saveCoordinatorActivities(data: CoordinatorActivity[]): void {
 this.save('coordinator_activities', data);
 }

 static logCoordinatorActivity(
 coordinatorId: string,
 type: CoordinatorActivity['type'],
 description: string,
 childId?: string,
 childName?: string,
 campName?: string
 ): void {
 const activities = this.getCoordinatorActivities();
 const newActivity: CoordinatorActivity = {
 id:`ACT-${950 + activities.length + 1}`,
 coordinatorId,
 type,
 childId,
 childName,
 campName,
 description,
 date: new Date().toISOString().split('T')[0]
 };
 const updated = [newActivity, ...activities];
 this.saveCoordinatorActivities(updated);
 window.dispatchEvent(new Event('renu_data_updated'));
 }

 // Master Reset
 static resetAll(): void {
 localStorage.removeItem(this.getKey('coordinators'));
 localStorage.removeItem(this.getKey('therapy_centres'));
 localStorage.removeItem(this.getKey('camps'));
 localStorage.removeItem(this.getKey('children'));
 localStorage.removeItem(this.getKey('followups'));
 localStorage.removeItem(this.getKey('diagnoses'));
 localStorage.removeItem(this.getKey('sponsorships'));
 localStorage.removeItem(this.getKey('inventory'));
 localStorage.removeItem(this.getKey('inventory_distributions'));
 localStorage.removeItem(this.getKey('coordinator_activities'));
 
 // Reload items to fill local storage with brand new items
 this.getCoordinators();
 this.getTherapyCentres();
 this.getCamps();
 this.getChildren();
 this.getFollowUps();
 this.getDiagnoses();
 this.getSponsorships();
 this.getInventory();
 this.getInventoryDistributions();
 this.getCoordinatorActivities();
 }
}
