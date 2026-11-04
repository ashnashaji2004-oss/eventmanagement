# SchoolFest — Complete School Event Management System
## Chaldean Syrian Higher Secondary School, Thrissur, Kerala

> **A modern, production-grade, bilingual school event management and live championship tracking system for arts competitions, sports meets, house points standings, and cryptographically verified certificates.**

---

## 1. System Overview & Core Highlights

SchoolFest is tailored specifically for **Chaldean Syrian Higher Secondary School (CSHSS), Thrissur**, established in 1927. The system provides complete end-to-end management for arts festivals, annual sports meets, house championships, and student achievements across academic years.

### Key Highlights:
- **Exactly Three Portals:** Admin, Teacher, and Parent portals with strict role-based access control (RBAC). In strict compliance with school requirements, **there is NO student login or student portal**.
- **Four Official School Houses:**
  - 🟧 **Orange House** (`#F97316`) — *"Courage, Valor & Honor"*
  - 🟦 **Blue House** (`#3B82F6`) — *"Wisdom, Integrity & Truth"*
  - 🟨 **Yellow House** (`#F59E0B`) — *"Perseverance, Radiance & Glory"*
  - 🟩 **Green House** (`#10B981`) — *"Growth, Unity & Harmony"*
- **Two School Divisions:**
  - **UP School** (Classes 5 to 7)
  - **High School** (Classes 8 to 12)
- **Competition Types:** Individual and Team events with strict backend capacity and division compatibility checks.
- **Annual Sports Day Scoreboard & Full-Screen Projector Display:**
  - Live public scoreboard at `/scoreboard` with auto-polling.
  - Dedicated auditorium full-screen projector view at `/projector/scoreboard` with confetti celebrations on leader changes.
- **Cryptographic QR Verification & PDF Generation:**
  - Every certificate has an unpredictable UUID token verifiable at `/verify-certificate/:token`.
  - Backend ReportLab PDF engine generates high-resolution certificates with embedded QR codes.
- **Academic Year Isolation:** Clean partition across academic years (e.g., 2024–2025, 2025–2026, 2026–2027) with no data contamination.
- **Bilingual Interface:** Full English & Malayalam (മലയാളം) localization with an instant language toggle.

---

## 2. User Portals & Access Control

### A. Admin Portal
Overall administrative authority and governance over festival operations:
- **Dashboard & Analytics:** Overall festival metrics, active registrations, house standings, and recent transactions.
- **User Account Verification:** Review, approve, reject, activate, or deactivate Teacher and Parent accounts.
- **Event & Category Management:** Create and oversee events across UP School and High School divisions.
- **Academic Year Management:** Toggle the active academic year without deleting previous records.
- **House Points & Standings:** Configure point allocations (1st, 2nd, 3rd, participation) and manual point adjustments with mandatory audit justification.
- **Certificates & Revocation:** Oversee generated certificates and revoke compromised or invalid awards.

### B. Teacher Portal
Authorized teachers manage festival competitions and participant rosters:
- **Teacher Dashboard:** Event statistics, assigned events, and pending results.
- **Event Management:** Create and edit events, set venues, configure registration deadlines, and monitor participant limits.
- **Assigned Events:** Quick view of competitions assigned directly to the logged-in teacher.
- **Student Roster Management:** Add, edit, and search students; enforce house and division assignments.
- **Participant Enrollment:** Register students for individual or team events with automatic division compatibility and deadline checks.
- **Results Entry:** Enter marks, positions (1st, 2nd, 3rd), and grades; assign house points automatically.
- **Certificate Issuance:** Generate authentic certificates for prize winners.

### C. Parent Portal
Secure, private window into a child's school fest achievements:
- **Parent Dashboard:** Quick overview of linked children, their events, and awards.
- **Child Profiles:** View student house, section, and enrolled competitions.
- **Achievements & Results:** Detailed breakdown of competition scores, awards, and event rankings.
- **Certificate Gallery:** View and download official achievement certificates with cryptographic QR codes.
- **Strict Privacy Isolation:** Parents can **only** view records of verified linked children. Unlinked student records are blocked with HTTP 403 Forbidden.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Recharts, i18next (English & Malayalam), Canvas Confetti.
- **Backend:** Python 3.12, Django 5.x, Django REST Framework, SimpleJWT (JWT Auth), ReportLab (PDF Generation), Pillow, QRCode.
- **Database:** SQLite (`backend/db.sqlite3`).
- **Security:** Strict permission classes (`IsTeacherUserRole`, `IsParentUserRole`, `IsAdminRole`), token expiration/refresh, and division/capacity validation on backend.

---

## 4. Default Seeded Credentials & Self-Healing Demo Access

The backend features **self-healing on-demand authentication**: on ANY fresh deployment (e.g. Vercel serverless, Render, Railway, Neon, or Supabase PostgreSQL), if the database is unseeded, logging in with any official demo credentials will automatically provision the user, assign their role, grant approved verification status, and attach necessary profile relationships on-the-fly.

| Role | Username | Password | Status / Notes |
| :--- | :--- | :--- | :--- |
| **Admin (Primary)** | `binu` | `Binu@123` | Binu K P (System Administrator, Superuser) |
| **Teacher (Demo)** | `teacher` | `Teacher@123` | Verified Teacher (Anita George — Cultural Coordinator) |
| **Parent (Demo)** | `parent` | `Parent@123` | Verified Parent (Priya Nair — Linked to Lasib C H & Angela K Lenin) |
| **Admin (Fallback)** | `admin` | `Admin@123` | Master Superuser |
| **Teacher** | `teacher_anita` | `Teacher@123` | Approved — Senior Cultural Coordinator |
| **Teacher** | `teacher_rahul` | `Teacher@123` | Approved — Science & Literary Convener |
| **Teacher (Pending)** | `teacher_kavitha` | `Teacher@123` | Pending Verification Demo |
| **Parent** | `parent_priya` | `Parent@123` | Approved — Linked to Lasib C H & Angela K Lenin |
| **Parent** | `parent_suresh` | `Parent@123` | Approved — Linked to Devika Suresh |
| **Parent (Pending)** | `parent_rajesh` | `Parent@123` | Pending Verification Demo |

---

## 5. Setup & Running Instructions

### Prerequisites:
- Python 3.12+
- Node.js 18+ and npm

### Quick Start (PowerShell):
```powershell
# 1. Run Backend Server
cd backend
..\backend_venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py seed_data
python manage.py runserver 8000

# 2. Run Frontend Dev Server (in a second terminal)
cd frontend
npm install
npm run dev
```

### Running Tests:
```powershell
cd backend
..\backend_venv\Scripts\python.exe manage.py test
```

### Building for Production:
```powershell
cd frontend
npm run build
```

---

## 6. Route Reference

| URL Path | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Homepage with hero section, leading house, and quick navigation |
| `/events` | Public | Event directory with filters for division, category, and status |
| `/scoreboard` | Public | Annual sports day scoreboard with house points chart |
| `/projector/scoreboard` | Public | Full-screen projector scoreboard for school auditorium |
| `/registration-status` | Public | Track pending teacher/parent registration status |
| `/verify-certificate/:token` | Public | Public cryptographic certificate verification |
| `/login` | Public | Secure login with role-based redirection |
| `/register` | Public | Registration for Teachers and Parents |
| `/admin/*` | Admin Only | Full festival administration, user approvals, and house points |
| `/teacher/*` | Teacher Only | Event scheduling, student registration, results, certificates |
| `/parent/*` | Parent Only | Linked children profiles, achievements, and certificate downloads |
#   s c h o o l e v e n t s  
 #   s c h o o l e v e n t s  
 #   s c h o o l e v e n t s  
 #   s c h o o l e v e n t s  
 #   s c h o o l e v e n t s  
 #   s c h o o l e v e n t s  
 #   s c h o o l e v e n t s  
 #   e v e n t s  
 #   e v e n t s m a n a g e  
 #   e v e n t s m a n a g e  
 #   e v e n t s m a n a g e  
 #   m a n a g e e v e n t  
 #   e v e n t m a n a g e m e n t  
 #   e v e n t m a n a g e m e n t  
 