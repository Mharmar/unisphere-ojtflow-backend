# OJTFlow Backend

Backend REST API service for **OJTFlow** (Student Portal and OJT Coordinator Portal) at Batangas State University, implemented with Node.js, Express.js 4, TypeScript 5, and MySQL 8.

---

## Technology Stack

* **Runtime:** Node.js 20 or 22 LTS
* **Framework:** Express.js 4
* **Language:** TypeScript 5 (`strict`)
* **Database:** MySQL 8, InnoDB, `utf8mb4`
* **Driver:** `mysql2` (promise API)
* **API:** REST over JSON under `/api/v1`
* **Authentication:** JWT in an `httpOnly` cookie (`ojtflow_token`) plus an `Origin` check
* **Passwords:** `bcrypt` cost 12
* **Validation:** `zod`
* **Uploads:** `multer` (memory storage, company logo only)
* **Security Helpers:** `helmet`, `cors`, `cookie-parser`, `express-rate-limit`
* **Testing:** `jest`, `ts-jest`, `supertest`

---

## Naming and Data Conventions

| Item | Convention | Example |
| :--- | :--- | :--- |
| **Files** | `kebab-case` with role suffix | `coordinator-companies.controller.ts` |
| **Routes** | `kebab-case` under `/api/v1` | `/coordinator/companies` |
| **Tables** | `snake_case`, plural | `student_requirements` |
| **Columns** | `snake_case`; primary key `id`; foreign key `<singular>_id` | `student_requirements.student_id` |
| **JSON Fields** | `camelCase` (aliased in repositories via SQL `AS`) | `student_number AS studentNumber` |
| **Status Values** | Lower `snake_case` codes in the API (labels belong to the frontend) | `under_review` |
| **Identifiers** | `INT UNSIGNED AUTO_INCREMENT` | `id INT UNSIGNED AUTO_INCREMENT` |
| **Times** | Stored in UTC; API returns ISO 8601 | `2026-11-10T00:00:00.000Z` |
| **Role Names** | `student`, `coordinator` | `role: 'coordinator'` |
| **Migrations** | Three-digit prefix, never edited after applied | `006_create_application_tables.sql` |
| **Environment Variables** | `UPPER_SNAKE_CASE`, read only in `src/config/env.ts` | `JWT_SECRET` |

---

## Unresolved Decisions and Defaults (`B-01` to `B-26`)

Nothing outside the product screens is assumed beyond the defaults recorded below.

| ID | Decision or Item | Default Used | Status | Affected Phases | Frontend Ref |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B-01** | How student and coordinator accounts are created (Create Account link, import, or sync with a portal database) | Provisioning tool (`provision.ts`); no registration endpoint | Open | Phase 3, 4, 5, 7, 16 | G-02 |
| **B-02** | Password reset or change and handling of initial credentials | None; temporary passwords from provisioning | Open | Phase 4, 9 | G-03 |
| **B-03** | Coordinator scope: college, program or section; company editing across colleges | College (`college_id`); companies shared | Open | Phase 1, 4, 5, 6, 9 | G-18 |
| **B-04** | Eligibility rule for Eligible, For Review, Incomplete, Not Eligible | Default derivation in Part XI (`config/eligibility-rules.ts`) | Open | Phase 7 | G-14 |
| **B-05** | Overall OJT status rules | Default view rules in Part XI (`v_student_ojt_status`) | Open | Phase 9, 10 | G-14 |
| **B-06** | Who confirms a placement and marks deployment, and how | No write endpoint (storage and read access only) | Open | Phase 2, 9 | G-01 |
| **B-07** | What counts against company slots; quota edit rules | Default in Part XI (`slot.service.ts`); quota edit below committed returns 409 | Open | Phase 2, 6, 8, 9 | G-28, G-31 |
| **B-08** | Application rules: eligibility gate, limits, status transitions | Gate on (`APPLY_REQUIRES_ELIGIBLE`), no limit, any transition allowed | Open | Phase 2, 8 | G-31 |
| **B-09** | Official requirement list per program and term; how definitions are maintained | Data maintained by seed or SQL; no definition management endpoint | Open | Phase 2, 7 | G-14, G-15 |
| **B-10** | Digital upload versus physical submission; behavior of Submit Request | Physical documents, no upload, no endorsement endpoint unless approved | Open | Phase 2, 7 | G-06 |
| **B-11** | Required hours and practicum label: per program, company or student (486, 500, 540 appear) | Per program columns (`programs.required_hours`, `programs.practicum_label`) | Open | Phase 3, 6, 9 | G-16 |
| **B-12** | Student identifier name and format; email format | `students.student_number` (e.g., `22-00125`); lowercase email | Open | Phase 3, 6 | G-17 |
| **B-13** | Company fields without forms: partner code, partnership label, description, focus area, skills | Display only; code `HTE-YYYY-NNNN` generated from `id` | Open | Phase 3, 6 | G-28, G-30 |
| **B-14** | Logo formats and SVG handling | `png`, `jpg` and checked `svg` served sandboxed | Open | Phase 6 | G-29 |
| **B-15** | Notification triggers and any notification page | Default triggers in Phase 11; bell dropdown only, no notification page | Open | Phase 2, 11 | G-05 |
| **B-16** | Audit log scope and screen | Write only (`audit_logs`); no audit screen or read endpoint | Open | Phase 2, 11 | G-04 |
| **B-17** | AI provider, privacy, stored conversations, behavior of action prompts | Provider-agnostic adapter; no conversation storage; actions refused | Open | Phase 12 | G-08 |
| **B-18** | Dashboard projections, targets, velocity, active percent; sample distribution summing to 270 | Real data only, partition rule (`v_student_ojt_status`) | Open | Phase 10 | G-20 |
| **B-19** | Academic term model and the meaning of cohort | `academic_terms` rows with dates and `current_key` | Open | Phase 3, 10 | G-13 |
| **B-20** | Authentication delivery: `httpOnly` cookie or Bearer token | Cookie (`ojtflow_token`) plus `Origin` check | Open | Phase 4, 13 | G-13 |
| **B-21** | Remember Me duration and idle timeout | 7 days (`JWT_REMEMBER_EXPIRES_IN`); 2 hours (`JWT_EXPIRES_IN`) otherwise | Open | Phase 4 | G-32 |
| **B-22** | Hosting, backups and recovery targets | Default in Phase 16 (Linux server, process manager, HTTPS reverse proxy, daily `mysqldump`) | Open | Phase 16 | None |
| **B-23** | Global search scope | Not built | Open | Phase 2 | G-07 |
| **B-24** | Reports and exports | Not built | Open | Phase 2 | G-09 |
| **B-25** | Requirement status transitions and who may set Pending Review | Coordinator may set any of the four statuses | Open | Phase 7 | G-14 |
| **B-26** | Whether a coordinator may edit companies used by other colleges | Allowed (shared directory) | Open | Phase 6 | G-18 |

---

## Documentation

* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Layer rules, request lifecycle, transaction ownership, and single-place rule locations.
* `docs/DATABASE.md` — Data dictionary, table constraints, relationships, and schema decisions *(Phase 3)*.
* `docs/API.md` — Complete endpoint specifications, request/response examples, and error codes *(Phase 13)*.
* `docs/SETUP.md` — Local environment setup, migrations, seeding, and test execution *(Phase 16)*.
* `docs/DEPLOYMENT.md` — Production configuration, backups, restore verification, and rollback steps *(Phase 16)*.