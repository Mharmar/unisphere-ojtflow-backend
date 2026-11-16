# OJTFlow Database Architecture (`docs/DATABASE.md`)

## 1. Engine & Conventions
- **Engine:** InnoDB (`utf8mb4` / `utf8mb4_unicode_ci`)
- **Timestamps:** Stored in UTC (`timezone: 'Z'` in `mysql2` pool)
- **Naming:** `snake_case` plural table names, `INT UNSIGNED AUTO_INCREMENT` PKs, `<singular>_id` FKs, lower `snake_case` `ENUM` values.

## 2. Core Tables & Views
1. **`colleges`**, **`programs`**, **`academic_terms`**: Academic hierarchy; `academic_terms.current_key = 'CURRENT'` enforces at most one active term.
2. **`users`**, **`coordinators`**, **`students`**: Role-based authentication (`student`, `coordinator`) and profile records.
3. **`companies`**: Partner host organizations with `slot_quota` and `status` (`active`, `inactive`).
4. **`requirement_definitions`**, **`student_requirements`**: Program/term requirement templates and per-student submission/review status.
5. **`applications`**, **`placements`**: OJT applications and confirmed/deployed/completed student placements (`uq_placements_student_term` prevents duplicate active placements per term).
6. **`notifications`**, **`audit_logs`**: User notifications and immutable audit trail for key workflow mutations.
7. **`v_student_ojt_status` (View)**: Computes each student's `overall_ojt_status` (`preparing`, `eligible`, `applying`, `placed`, `deployed`, `completed`).

## 3. Commands
- `npm run migrate` — Applies pending `.sql` migrations from `src/database/migrations/` in order.
- `npm run seed` — Idempotently seeds academic structure, demo users, and partner companies (blocked in `production`).
