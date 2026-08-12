# Vishalwin Foundation — Programme Management System
## Complete Project Documentation

> **Demo Project** | Frontend Only | No Backend | No Database | Data stored in `localStorage`
> **Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts + Framer Motion
> **Organisation:** Vishalwin Foundation, Ahmedabad

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Portal 1 — RENU Programme](#3-portal-1--renu-programme)
4. [Portal 2 — Guardian Angel Awards](#4-portal-2--guardian-angel-awards)
5. [Portal 3 — Road Safety](#5-portal-3--road-safety-awareness-programme)
6. [Shared Modules](#6-shared-modules)
7. [Cross-Page Connection Map](#7-cross-page-connection-map)
8. [Data Storage Reference](#8-data-storage-reference)
9. [Role-Based Access Control](#9-role-based-access-control)

---

## 1. Project Overview

The **Vishalwin Foundation Programme Management System** is a unified digital management portal for three distinct social programmes:

| Portal | Programme | Route Prefix | Theme |
|---|---|---|---|
| RENU | Rehabilitation & Education for children with special needs | `/renu` | Red |
| Guardian Angel Awards | Annual recognition of caregivers & professionals | `/awards` | Amber/Gold |
| Road Safety | Public awareness & education workshops | `/road-safety` | Red/Orange |

The application starts at a **Programme Switcher** screen (`/`) where users pick a portal. Each portal has its own sidebar navigation, data store, and isolated routes.

---

## 2. System Architecture

```
src/
├── App.tsx                          <- Main router (all 31 routes defined here)
├── components/
│   ├── ProgrammeSwitcher.tsx        <- Entry page: pick a portal
│   ├── ui/                          <- Shared UI (Card, Button, Badge, Select, Input...)
│   └── common/
│       ├── RenuJourneyTracker.tsx   <- 11-step child journey visual
│       └── ToastContainer.tsx       <- Global toast notifications
├── layouts/
│   ├── DashboardLayout.tsx          <- Shell: sidebar + topbar + content area
│   └── ProgrammeSidebar.tsx         <- Dynamic sidebar (changes per active portal)
├── hooks/
│   ├── useRole.ts                   <- Role management (Admin / Coordinator)
│   └── useToast.ts                  <- showToast() function
├── shared/
│   └── pages/Settings.tsx           <- Shared settings page (role toggle)
└── programmes/
    ├── renu/                        <- RENU Portal — 15 pages
    ├── awards/                      <- Awards Portal — 7 pages
    └── roadsafety/                  <- Road Safety Portal — 7 pages
```

### Data Flow Pattern

```
User Action
  -> Component State Update
  -> localStorage.setItem(key, JSON.stringify(data))
  -> window.dispatchEvent(new Event('portal_data_updated'))
  -> All subscribed components re-read the store and re-render
```

---

## 3. Portal 1 — RENU Programme

**Route Base:** `/renu`
**Purpose:** Manage children with special needs from initial screening camp through to school graduation.
**Data Store File:** `src/programmes/renu/data/renuStore.ts`
**Event Key:** `renu_data_updated`

### Child Journey (11 Stages)

```
Screened -> Assessment -> Diagnosis -> Therapy -> IEP -> School Ready
  -> School Admission -> Enrolled -> Monitoring -> Graduated -> Referred Out
```

---

### 3.1 Dashboard — `/renu`
**File:** `src/programmes/renu/pages/Dashboard.tsx`

| Section | Description |
|---|---|
| Hero Banner | Personalized welcome (role-based name), Caseload / Camps / Graduated stat pills |
| Quick Actions | 6 icon buttons: Add Child, New Camp, Follow-Ups, School Admissions, Therapy Centres, Reports |
| 10 KPI Cards | Total Children, Normal, Special, Camps, Screened, Sponsorships (Admin), School Ready, Admissions, Centres, Coordinators (Admin) |
| Child Journey Funnel | 11-stage horizontal pipeline — count at each stage |
| Disability Pie Chart | Donut chart of disability types (CP, Autism, ADHD, Down Syndrome, etc.) |
| Severity Bar Chart | Mild / Moderate / Severe count comparison |
| Camp Area Chart | Recent 6 camps — Registered vs Special screened by Area |
| Recent Children List | 5 most recently registered children with journey badge |
| Pending Follow-ups | 4 most urgent upcoming/overdue follow-up tasks |
| Low Stock Alert | Inventory items currently below threshold quantity |

**Connects to:** Camps, Children, Follow-Ups, Inventory, School Admissions

---

### 3.2 Camp Management — `/renu/camps`
**File:** `src/programmes/renu/pages/Camps.tsx`

**Core Fields:** Camp Name, Area, Date, Venue, Target Count, Registered Count, Special Count, Camp Coordinator, Status (Upcoming / Completed / Cancelled)

**Enhanced Sections:**
- **Camp Team CRUD:** Role (Pediatrician / Neurologist / Therapist / Volunteer / Coordinator), Name, Mobile — Add/Delete rows
- **IEC Materials Tracking:** Item Name, Quantity, Status (Ordered / Ready / Distributed) + fake Upload Sample button
- **Camp Documents:** Camp Report fake upload + status badge; Photos fake upload + status badge

**Connects to:** Children (children screened at camp), Dashboard (camp count & area chart)

---

### 3.3 Children — `/renu/children`
**File:** `src/programmes/renu/pages/Children.tsx`

**Core Fields:** Child Name, DOB, Gender, Address, Parent/Guardian Name, Mobile, Classification (Normal / Special), Disability Type, Severity (Mild / Moderate / Severe), Journey Status, Registration Date, Registered at Camp

**Features:** Search by name, filter by classification / status / journey stage, Add/Edit child form, click row to open full Child Profile

**Connects to:** ChildProfile (row click), Camps (camp dropdown), Diagnosis (child-linked), Follow-Ups (child-linked)

---

### 3.4 Child Profile — `/renu/children/:id`
**File:** `src/programmes/renu/pages/ChildProfile.tsx` (77 KB — most detailed page in the system)

**Card Sections (always visible):**

| Card | Fields |
|---|---|
| Demographics | Name, DOB, Gender, Full Address, Parent/Guardian Name & Mobile, Emergency Contact |
| Clinical Diagnosis | Disability Type, Severity, Diagnosis Date, Diagnosis Centre, IQ Score, Linked Therapy Centre |
| Sponsorship | Sponsor Name, Sponsor Type, Amount, Status |
| School Admission | School Name, Class, Admission Date, Status |
| Journey Tracker | 11-step visual tracker with current stage highlighted in red |
| Follow-up Log | Chronological log of all follow-up visits for this child |
| Document Uploads | Fake upload slots for Birth Certificate, Aadhar, Medical Summary, School Letter |

**6 Tabbed Sections (horizontally scrollable on mobile):**

| Tab | Key Fields & Features |
|---|---|
| **Assessment** | IQ Assessment: Date, Tool (Binet-Kamat / Vineland / Other), Score, Conducted By, Remarks; Functional Assessment: Date, Tool, Finding, Conducted By; Behaviour & Motor assessments (same structure); Assessment Report fake upload |
| **Medical Records** | Scan Records (MRI / CT / EEG): Date, Type, Finding, Centre, Doctor, fake upload; Prescription Records: Date, Doctor, Medicines list, Notes; Immunisation: Vaccine, Date Given, Next Due — all with Add/Delete |
| **IEP** | Plan Period (From / To dates); Short-term Goals list (text + achieved checkbox); Long-term Goals list; Quarterly Review: Date, Reviewed By, Achievement %, Remarks; IEP Document fake upload |
| **Financial Support** | Funding Source (CSR / Govt / NGO / Donor / Self); Amount Sanctioned & Received; Donor/CSR Company, Contact Person, Mobile; Grant Period (From / To); Grant Letter fake upload |
| **Assistive Devices** | Device list: Type (Wheelchair / Hearing Aid / Crutches / Communication Device / Spectacles / Other), Brand/Model, Issued Date, Warranty Until, Issued By; Device Photo fake upload; Add/Delete devices |
| **Parent & Home Visit** | Counselling Log: Date, Counsellor, Topic, Notes, Next Session; Home Visit Log: Date, Visited By, Observations, Home Environment Rating 1-5 stars, Recommendations, Next Visit Date — all with Add/Delete |

**Connects to:** Children (back), Diagnosis, Therapy Centres, School Admissions, Sponsorships, Home Visits (Tab 6 data shared)

---

### 3.5 Follow-Ups — `/renu/follow-ups`
**File:** `src/programmes/renu/pages/FollowUps.tsx`

**Core Fields:** Child (linked), Follow-up Date, Status (Pending / Completed / Missed), Notes, Next Visit Date

**Government Benefits Tracking (expandable section per child):**

| Benefit | Fields |
|---|---|
| UDID Card | Status (Applied / Pending / Received / Expired), Remarks, fake Upload |
| Niramaya Insurance | Status (Active / Pending / Expired), Expiry Date, fake Upload |
| Disability Pension | Status (Applied / Approved / Not Applicable), Amount |
| Bus Pass | Status (Issued / Not Issued), Issue Date |
| Scholarship | Status (Applied / Approved / Not Applicable), Amount, Scheme Name |

**Next Follow-up Date Scheduler** with Set Reminder badge at top of each child section

**Connects to:** Children (child info lookup), Dashboard (pending follow-ups widget)

---

### 3.6 Home Visits — `/renu/home-visits`
**File:** `src/programmes/renu/pages/HomeVisits.tsx`

Standalone global log of all home visits across all children (not inside ChildProfile).

**Core Fields:** Child (select from all children), Visit Date, Visited By, Observations (textarea), Home Environment Rating (1–5 stars picker), Recommendations, Next Visit Date

**Features:** Filter by Child and Month/Year, Add/Edit Modal, sortable table view

**Data:** Stored in localStorage key `vishalwin_home_visits` (separate from main RENU store)

**Connects to:** Children (dropdown populated from children store), ChildProfile Tab 6 (same visit records visible per child)

---

### 3.7 Diagnosis — `/renu/diagnosis`
**File:** `src/programmes/renu/pages/Diagnosis.tsx`

**Core Fields:** Child (linked), Diagnosis Type, Diagnosis Centre, Date, Doctor Name, IQ Score

**Additional Fields:**
- Referring Doctor: Doctor Name, Hospital Name, Contact Mobile
- Disability Certificate: Status (Applied / Received / Expired), Expiry Date, fake Upload
- Diagnosis Report: fake upload button + status badge

**Connects to:** Children, ChildProfile (diagnosis shown in profile card), Therapy Centres (referral target)

---

### 3.8 Medical Database — `/renu/medical-database`
**File:** `src/programmes/renu/pages/MedicalDatabase.tsx`

Cross-child master view that aggregates all medical records from every child's profile.

**Tabs:** Scans | Prescriptions | Immunisations

**Features:** Filter by Child / Record Type / Date Range (From–To); Print button (window.print() hides nav)

**Connects to:** ChildProfile (reads `child.medicalRecords` from all children in the RENU store)

---

### 3.9 Therapy Centres — `/renu/therapy-centres`
**File:** `src/programmes/renu/pages/TherapyCentres.tsx`

**Core Fields:** Centre Name, Address, City, Contact Person, Phone, Email, Specialisation (OT / Speech Therapy / Physiotherapy / Multi-discipline), Accreditation, MOU Status

**Connects to:** ChildProfile (assigned therapy centre shown), Diagnosis (referral target after diagnosis)

---

### 3.10 School Admissions — `/renu/school-admissions`
**File:** `src/programmes/renu/pages/SchoolAdmissions.tsx`

**Core Fields:** Child (linked), School Name, Class, Admission Date, Status (Admitted / Pending / Rejected)

**Additional Fields:**
- Education Type: Inclusive School / Special School / Home Education
- Medium of Instruction: English / Hindi / Gujarati / Marathi / Other
- Current Academic Year (text)
- Transport Support: Bus Pass (Yes/No toggle), Conveyance Allowance (amount)
- Report Cards List: Academic Year, Grade, Remarks, fake Upload per year — Add/Delete

**Connects to:** Children (linked), ChildProfile (admission status shown in profile), Dashboard (School Admissions KPI card)

---

### 3.11 Sponsorships — `/renu/sponsorships` *(Admin only)*
**File:** `src/programmes/renu/pages/Sponsorships.tsx`

**Core Fields:** Child (linked), Sponsor Name, Sponsor Type (Individual / Corporate / CSR / Government), Amount, Period (From / To), Status (Active / Completed / Paused), Grant Letter fake upload

**Connects to:** ChildProfile (sponsorship info shown in profile), Dashboard (Active Sponsorships KPI)

---

### 3.12 Inventory — `/renu/inventory` *(Admin only)*
**File:** `src/programmes/renu/pages/Inventory.tsx`

**Core Fields:** Item Name, Category (IEC Material / Medical Supply / Stationery / Equipment), Unit, Total Quantity, Remaining Quantity, Low-stock Threshold, Last Updated Date

**Connects to:** Dashboard (items below threshold appear in Low Stock Alert widget)

---

### 3.13 Coordinators — `/renu/coordinators` *(Admin only — shared with all portals)*
**File:** `src/programmes/renu/pages/Coordinators.tsx`

Same component is reused at `/awards/coordinators` and `/road-safety/coordinators`.

**Core Fields:** Name, Role, Mobile, Email, Area/Zone Assigned, Active Status

---

### 3.14 Reports — `/renu/reports`
**File:** `src/programmes/renu/pages/Reports.tsx`

**Report Types:** Programme Summary, Child-wise Report, Camp-wise Report, Therapy Centre Report, Monthly Progress Report

**Features:** Date range filter (From / To), Print button (window.print() with @media print hiding nav/sidebar)

**Connects to:** All RENU stores (children, camps, therapy centres, school admissions)

---

### 3.15 Analytics — `/renu/analytics`
**File:** `src/programmes/renu/pages/Analytics.tsx`

Advanced data visualisation with deeper charts: disability distribution over time, full 11-stage journey funnel, monthly intake trends, camp reach by area, therapy attendance rates.

**Connects to:** All RENU stores (reads live data)

---

## 4. Portal 2 — Guardian Angel Awards

**Route Base:** `/awards`
**Purpose:** End-to-end management of the Guardian Angel Awards — from event creation and nominations through verification, shortlisting, ceremony, and post-award engagement tracking.
**Data Store File:** `src/programmes/awards/data/awardsStore.ts`
**Event Key:** `awards_data_updated`

### Award Lifecycle
```
Event Created -> Nominations Received -> Verification -> Shortlisting -> Selection -> Ceremony -> Awarded
```

---

### 4.1 Dashboard — `/awards`
**File:** `src/programmes/awards/pages/Dashboard.tsx`

| Section | Description |
|---|---|
| Hero Banner | Amber/gold gradient, Edition / Nominations / Selected stat pills, Award Programme Portal badge |
| Quick Actions | Add Nominee, Create Event, View Awardees, Ceremony, Reports — 5 icon buttons |
| 8 KPI Cards | Nominations, Verified, Shortlisted, Selected, Events, Awardees, Pending Verification, Ceremonies Done |
| Nomination Pipeline Funnel | 6-stage: Submitted > Verified > Shortlisted > Selected > Ceremony > Awarded |
| Category Bar Chart | Nominations count per award category |
| Top Cities Horizontal Bar | Top 8 cities by nomination count |
| Year Trend Line Chart | Nomination counts per award year |
| Recent Nominations Feed | Last 5 nominees with verification status badge |
| Pending Actions Alert | Unverified nominees + shortlisted awaiting ceremony + upcoming events in 30 days |
| Follow-up Donut Chart | Post-award follow-up status breakdown |

**Connects to:** All Awards pages via Quick Actions and KPI card links

---

### 4.2 Events — `/awards/events`
**File:** `src/programmes/awards/pages/Events.tsx`

**Core Fields:** Event Name, Year, Date, Time, Venue, Address, City, State, Status (Upcoming / Completed / Cancelled)

**Additional Fields:**
- Event Type: Annual / Regional / Special / Inaugural
- Categories: list of award categories configured for this event edition
- Session Schedule CRUD: Session Name, Start Time (time picker), End Time, Speaker Name — Add/Delete rows
- IEC Material Tracking: Material Type (Invitation Card / Banner / Brochure / Backdrop / Other), Quantity, Status (Pending / Ordered / Received / Distributed), fake Upload Sample

**Connects to:** Nominees (award year selection links), Ceremony (events linked to ceremony records), Dashboard (Events KPI + upcoming events alert panel)

---

### 4.3 Nominees — `/awards/nominees`
**File:** `src/programmes/awards/pages/Nominees.tsx`

**Core Fields:** Full Name, Nominee Type (Professional / Caregiver), Award Category, City, State, Award Year, Date of Nomination, Verification Status (Pending / Verified / Rejected / Clarification Required), Selection Status (Pending / Shortlisted / Selected / Not Selected)

**Features:** Search by name, filter by Year / Status / Nominee Type; Add new nomination inline; Click row to open full Nominee Profile

**Connects to:** NomineeProfile (row click opens `/awards/nominees/:id`), Events (year dropdown populated from events store), Ceremony (Selected nominees become ceremony participants)

---

### 4.4 Nominee Profile — `/awards/nominees/:id`
**File:** `src/programmes/awards/pages/NomineeProfile.tsx`

| Section | Fields |
|---|---|
| Personal Info | Full Name, DOB, Gender, Address, Mobile, Email, City, State, Pincode |
| Professional Info | Profession/Role, Organisation Name, Years of Experience |
| Nomination Details | Nominee Type, Award Category, Award Year, Linked Event, Reason for Nomination (textarea) |
| Verification Details | Verified By (text), Verification Date, Verification Remarks (textarea) — editable inline with Save |
| Selection Status | Shortlisted / Selected / Not Selected — dropdown + Selection Remarks |
| Supporting Documents | Profile Photograph, Nominee ID Proof, Nomination Letter, Work Evidence/Certificates, Any Other Document — all fake uploads with Pending/Uploaded status badges |
| Ceremony Link | Appears if selectionStatus = Selected — shows linked ceremony record details |

**Connects to:** Nominees (back navigation), Ceremony (ceremony record shown if Selected), Events (award year links to relevant event)

---

### 4.5 Ceremony — `/awards/ceremony`
**File:** `src/programmes/awards/pages/Ceremony.tsx`

Only nominees with `selectionStatus = Selected` can have ceremony records created.

**Core Fields per record:**
- Linked Nominee (must be Selected), Award Event, Award Category, Award Date, Venue
- Attendance Status: Present / Absent / Virtual
- Award Received: Yes / No
- Certificate Status: Pending / Generated / Issued
- Certificate Number (text, editable)
- Award/Recognition Details (textarea)
- Ceremony Photograph: fake upload + status badge
- Other Documents: fake upload + status badge

**Connects to:** Nominees (reads only Selected nominees for linking), Awardees (ceremony records become awardee base data), NomineeProfile (ceremony shown in profile's Ceremony Link section)

---

### 4.6 Awardees — `/awards/awardees`
**File:** `src/programmes/awards/pages/Awardees.tsx`

Post-ceremony gallery and management of all confirmed awardees.

**Core Fields per card:**
- Name, Category, Profession/Role, Organisation, City, State
- Photograph (or placeholder icon if not uploaded)
- Post-Award Follow-up Status: Not Started / Contacted / In Progress / Completed — colour-coded badge
- Future Engagement Notes: inline editable textarea with Save button

**Connects to:** Ceremony (source data — awardees derived from ceremony records), Reports (Hall of Fame report + Ceremony Attendance), Dashboard (Awardees KPI + follow-up donut chart)

---

### 4.7 Reports — `/awards/reports`
**File:** `src/programmes/awards/pages/Reports.tsx`

| Report Type | Description |
|---|---|
| Annual Summary | All KPIs and overview for selected Award Year |
| Selected Nominees | Filtered list of all Selected nominees |
| Category-wise | Nominees grouped and counted by award category |
| Individual Nominee | Full printable profile of a single nominee |
| Individual Awardee | Full printable profile of a single awardee |
| Awardee Hall of Fame | Styled gallery of all awardees grouped by category |
| Ceremony Attendance | Table of ceremony records with attendance status + certificate status |

**Filters:** Award Year (dropdown), From Date (filters by nomination/award date), To Date

**Connects to:** Reads from awardsStore (nominees, awardees, events, ceremony records). Prints via window.print()

---

## 5. Portal 3 — Road Safety Awareness Programme

**Route Base:** `/road-safety`
**Purpose:** Manage road safety awareness workshops, track participating institutions, log individual participants, manage partnership collaborations, and report programme outreach statistics.
**Data Store File:** `src/programmes/roadsafety/data/roadSafetyStore.ts`
**Event Key:** `roadsafety_data_updated`

---

### 5.1 Dashboard — `/road-safety`
**File:** `src/programmes/roadsafety/pages/Dashboard.tsx`

| Section | Description |
|---|---|
| Hero Banner | Red/orange gradient, Workshops / Reached / Pledges stat pills, animated portal badge |
| Quick Actions | New Workshop, Add Institution, Add Participant, Collaboration, Reports — 5 icon buttons |
| 8 KPI Cards | Total Workshops, Completed Workshops, Total Participants, Pledges Signed, Institutions, Active Collaborations, Upcoming Workshops, Cities Covered |
| Workshop Status Pipeline | Scheduled > In Progress > Completed > Cancelled — animated node funnel |
| Monthly Area Chart | Workshop activity (count) over last 6 months |
| City-wise Reach Horizontal Bar | Top 8 cities sorted by total participants reached |
| Pledge Ratio Progress Card | % of participants who signed the Road Safety Pledge with progress bar |
| Institution Type Pie Chart | School / College / Corporate / Community / Government breakdown |
| Recent Participants Feed | Last 5 participants with pledge badge |
| Upcoming Workshops Alert | Next 5 scheduled workshops with date + expected participant count |

**Connects to:** All Road Safety pages via Quick Actions

---

### 5.2 Workshops — `/road-safety/workshops`
**File:** `src/programmes/roadsafety/pages/Workshops.tsx`

**Core Fields:** Workshop Title, Date, Time, Venue, City, State, Target Audience (Students / Teachers / Public / Corporate / Government), Expected Participants, Status (Scheduled / Completed / Cancelled), Trainer/Facilitator Name

**Additional Sections:**
- Session Details CRUD: Session Name, Duration (e.g. 45 min), Facilitator Name, Key Points (textarea) — Add/Delete
- IEC Materials Used: Type (Pamphlet / Banner / Video / Poster / Other), Quantity, fake Upload Sample
- Media Coverage: News Coverage Yes/No toggle, Media Outlet Name (shown if Yes), Link
- Outcome: Actual Participants, Key Outcomes (textarea), Institutions Covered

**Connects to:** Participants (workshop-participant link), Institutions (workshop history tab), Programme Reach (aggregated), Reports, Dashboard (workshop charts + KPIs)

---

### 5.3 Institutions — `/road-safety/institutions`
**File:** `src/programmes/roadsafety/pages/Institutions.tsx`

**Core Fields:** Institution Name, Type (School / College / Corporate / Community / Government), Address, City, State, Contact Person, Phone, Total Students/Employees

**Additional Fields:**
- MOU Status: Signed / Not Signed / Under Discussion — dropdown
- MOU Document: fake upload button + status badge
- Workshop History: expandable section showing all past workshops covering this institution (reads workshops store dynamically) — shows Workshop Title, Date, Actual Participants

**Connects to:** Workshops (history reads workshops store), Collaborations (institutions can also be collaboration partners)

---

### 5.4 Collaborations — `/road-safety/collaborations`
**File:** `src/programmes/roadsafety/pages/Collaborations.tsx`

**Core Fields:** Organisation Name, Type, City, Contact Person, Phone, Active Status (Active / Inactive), MOU Signed (Yes/No), MOU Date

**Additional Fields:**
- MOU Document: fake upload + status badge
- Collaboration Activities CRUD: Activity Name, Date, Description — Add/Delete list

**Connects to:** Reports (Collaboration Summary report type), Dashboard (Active Collaborations KPI card)

---

### 5.5 Participants — `/road-safety/participants`
**File:** `src/programmes/roadsafety/pages/Participants.tsx`

**Core Fields:** Name, Age, Gender, Occupation, Mobile, Email, Workshop (linked — dropdown), Pledge Signed (Yes/No)

**Additional Features:**
- Feedback Form per participant (expandable): Star Rating 1–5 (radio buttons styled as stars), Key Takeaway, Suggestions — saved to `participant.feedback`
- Pledge Certificate: green outlined fake download button (shows toast 'Certificate PDF generated') — visible only if `pledgeSigned = true`
- Print View button at top: `window.print()` with `@media print` CSS hiding navigation

**Connects to:** Workshops (each participant linked by workshopId), Reports (Participant-wise report type), Dashboard (Pledge count KPI + Recent participants feed)

---

### 5.6 Programme Reach Database — `/road-safety/programme-reach`
**File:** `src/programmes/roadsafety/pages/ProgrammeReachDatabase.tsx`

Aggregated outreach statistics — all data derived from workshop records.

| Section | Description |
|---|---|
| Summary Stats | Total workshops, total participants reached, unique cities covered |
| City-wise Reach Table | City > Total Workshops > Total Participants, sorted by participants descending |
| Target Audience Breakdown Table | Audience Type > Total Workshops > Total Participants |
| Print Report Button | `window.print()` with @media print hiding sidebar and nav |

**Connects to:** Workshops (all aggregation derived from workshops store), Reports (City-wise Reach is also available as a report type)

---

### 5.7 Reports — `/road-safety/reports`
**File:** `src/programmes/roadsafety/pages/Reports.tsx`

| Report Type | Description |
|---|---|
| Programme Summary | KPIs and workshop overview for selected date range |
| Workshop-wise | One row per workshop with outcome and actual participants |
| Participant-wise | Each participant with workshop name, pledge status, feedback star rating |
| Collaboration Summary | All collaborations with MOU status + activities count |
| City-wise Reach | City aggregation table (same as Programme Reach Database) |

**Filters:** From Date, To Date — filters all report data by date range

**Connects to:** Reads from roadSafetyStore (workshops, participants, collaborations, institutions). Prints via `window.print()`

---

## 6. Shared Modules

### Settings Page
**Routes:** `/renu/settings` | `/awards/settings` | `/road-safety/settings`
**File:** `src/shared/pages/Settings.tsx`

- Role toggle: Admin / Coordinator — saved to localStorage as `vishalwin_role`
- Toggling the role changes visibility of admin-only pages and KPI cards throughout the active portal

### Coordinators Page
**Routes:** `/renu/coordinators` | `/awards/coordinators` | `/road-safety/coordinators`
**File:** `src/programmes/renu/pages/Coordinators.tsx` *(Admin only — same component reused in all 3 portals)*

**Core Fields:** Name, Role, Mobile, Email, Area/Zone Assigned, Active Status

---

## 7. Cross-Page Connection Map

```
ProgrammeSwitcher (/)
  |
  +-- RENU Portal (/renu)
  |     Dashboard
  |       -> Camps (Quick Action + area chart data)
  |       -> Children (Quick Action + recent children list)
  |       -> Follow-Ups (pending follow-ups alert widget)
  |       -> Inventory (low stock alert widget)
  |     Camps -> Children (screened children linked by camp)
  |     Children -> ChildProfile (click row -> /renu/children/:id)
  |     ChildProfile
  |       -> Diagnosis (reads diagnosis records for this child)
  |       -> Therapy Centres (linked therapy centre displayed)
  |       -> School Admissions (admission status card)
  |       -> Sponsorships (sponsorship status card)
  |       -> Home Visits (Tab 6 shares same visit records)
  |     Follow-Ups -> Children (child name/info looked up)
  |     Home Visits -> Children (child select dropdown)
  |                 -> ChildProfile Tab 6 (same records appear both places)
  |     Medical Database -> ChildProfile (reads child.medicalRecords from all children)
  |     Diagnosis -> Children + Therapy Centres
  |     School Admissions -> Children (linked)
  |     Inventory -> Dashboard (low stock items feed alert widget)
  |     Reports / Analytics -> All RENU stores
  |
  +-- Awards Portal (/awards)
  |     Dashboard -> All Awards pages (Quick Actions + KPI card links)
  |     Events -> Nominees (award year filter) + Ceremony (event reference)
  |     Nominees -> NomineeProfile (click row -> /awards/nominees/:id)
  |     NomineeProfile -> Ceremony (ceremony record shown if selectionStatus=Selected)
  |                    -> Events (award year links to event)
  |     Ceremony -> Nominees (reads only Selected nominees)
  |              -> Awardees (ceremony records become awardee cards)
  |              -> NomineeProfile (ceremony section in profile)
  |     Awardees -> Ceremony (source data)
  |              -> Reports (Hall of Fame + follow-up chart)
  |     Reports -> All Awards stores
  |
  +-- Road Safety Portal (/road-safety)
        Dashboard -> All Road Safety pages (Quick Actions)
        Workshops -> Participants (linked by workshopId)
                  -> Institutions (workshop history tab reads workshops)
                  -> Programme Reach (aggregated from workshops)
                  -> Reports (workshop data)
        Institutions -> Workshops (history tab)
        Collaborations -> Reports (Collaboration Summary type)
        Participants -> Workshops (linked by workshopId)
                     -> Reports (Participant-wise type)
        Programme Reach -> Workshops (all aggregation)
                        -> Reports (City-wise Reach type)
        Reports -> All Road Safety stores
```

---

## 8. Data Storage Reference

| localStorage Key | Portal | Contents |
|---|---|---|
| `vishalwin_renu` | RENU | children, camps, coordinators, therapy centres, sponsorships, follow-ups, inventory, school admissions, diagnosis records |
| `vishalwin_awards` | Awards | events, nominees, awardees, ceremony records |
| `vishalwin_roadsafety` | Road Safety | workshops, institutions, participants, collaborations |
| `vishalwin_home_visits` | RENU (standalone) | cross-child home visit records |
| `vishalwin_role` | Global | Current user role: `Admin` or `Coordinator` |

### Event Bus (Data Sync Pattern)
When data is saved, a custom window event is fired so all listening components re-render:
- RENU: `window.dispatchEvent(new Event('renu_data_updated'))`
- Awards: `window.dispatchEvent(new Event('awards_data_updated'))`
- Road Safety: `window.dispatchEvent(new Event('roadsafety_data_updated'))`

### Fake Document Upload Pattern
All upload buttons across the system follow this identical pattern:
1. Hidden `<input type="file" className="hidden" ref={uploadRef} />` in the component
2. Styled button triggers the browser file picker via `uploadRef.current?.click()`
3. `onChange` handler reads only the filename from `e.target.files[0].name`
4. Filename stored as a text string in state + localStorage
5. **No actual file is uploaded or stored — only the filename text persists**

---

## 9. Role-Based Access Control

| Feature | Admin | Coordinator |
|---|---|---|
| View all pages and data | YES | YES |
| Sponsorships page (RENU) | YES | Hidden — lock icon shown |
| Inventory page (RENU) | YES | Hidden — lock icon shown |
| Coordinators page (all portals) | YES | Hidden — lock icon shown |
| Active Sponsorships KPI (Dashboard) | YES | Hidden |
| Coordinators KPI (Dashboard) | YES | Hidden |
| Add / Edit / Delete records | YES | YES (most sections) |
| Role toggle | Via /[portal]/settings | Via /[portal]/settings |

Role is stored in localStorage as `vishalwin_role`. The `useRole()` hook exports:
- `isAdmin` — true when role equals Admin
- `isCoordinator` — true when role equals Coordinator

These booleans are used throughout the app via conditional rendering (`item.adminOnly && isCoordinator ? null : render`) to show or hide restricted pages and KPI cards.

---

## 10. Page Count Summary

| Portal | Pages | Key Routes |
|---|---|---|
| RENU Programme | 15 | /renu, /renu/camps, /renu/children, /renu/children/:id, /renu/follow-ups, /renu/home-visits, /renu/diagnosis, /renu/medical-database, /renu/therapy-centres, /renu/school-admissions, /renu/sponsorships, /renu/inventory, /renu/coordinators, /renu/reports, /renu/analytics |
| Guardian Angel Awards | 7 | /awards, /awards/events, /awards/nominees, /awards/nominees/:id, /awards/ceremony, /awards/awardees, /awards/reports |
| Road Safety | 7 | /road-safety, /road-safety/workshops, /road-safety/institutions, /road-safety/collaborations, /road-safety/participants, /road-safety/programme-reach, /road-safety/reports |
| Shared | 2 | /[portal]/settings, /[portal]/coordinators |
| **Total** | **31 routes** | |

---

*Vishalwin Foundation Programme Management System — Demo Version*
*All data is stored in browser localStorage only. No backend server or database is used.*
*Generated: August 2026*