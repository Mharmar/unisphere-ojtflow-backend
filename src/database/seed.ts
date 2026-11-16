import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../config/database';
import { env } from '../config/env';

export async function runSeed(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    throw new Error('Refusing to run development seed in production environment.');
  }

  await withTransaction(async (conn) => {
    // 1. College
    await conn.query(
      `INSERT INTO colleges (code, name)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['CICS', 'College of Informatics and Computing Sciences']
    );
    const [collegeRows] = await conn.query('SELECT id FROM colleges WHERE code = ?', ['CICS']);
    const collegeId = (collegeRows as Array<{ id: number }>)[0].id;

    // 2. Programs
    const programs = [
      { code: 'BSIT', name: 'Bachelor of Science in Information Technology', label: 'OJT / Practicum', hours: 486 },
      { code: 'BSCS', name: 'Bachelor of Science in Computer Science', label: 'CS Practicum', hours: 300 },
    ];
    for (const p of programs) {
      await conn.query(
        `INSERT INTO programs (college_id, code, name, practicum_label, required_hours)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           college_id = VALUES(college_id),
           name = VALUES(name),
           practicum_label = VALUES(practicum_label),
           required_hours = VALUES(required_hours)`,
        [collegeId, p.code, p.name, p.label, p.hours]
      );
    }
    const [bsitRows] = await conn.query('SELECT id FROM programs WHERE code = ?', ['BSIT']);
    const bsitProgramId = (bsitRows as Array<{ id: number }>)[0].id;

    // 3. Current Academic Term
    await conn.query(
      `INSERT INTO academic_terms (term_key, label, start_date, end_date, is_current, current_key)
       VALUES (?, ?, ?, ?, 1, 'CURRENT')
       ON DUPLICATE KEY UPDATE
         label = VALUES(label),
         start_date = VALUES(start_date),
         end_date = VALUES(end_date),
         is_current = 1,
         current_key = 'CURRENT'`,
      ['2026-2027-1', '1st Semester, AY 2026-2027', '2026-08-10', '2026-12-18']
    );
    const [termRows] = await conn.query('SELECT id FROM academic_terms WHERE term_key = ?', ['2026-2027-1']);
    const termId = (termRows as Array<{ id: number }>)[0].id;

    // 4. Requirement Definitions for BSIT in Current Term
    const reqDefs = [
      { code: 'REQ_ENDORSEMENT', title: 'Endorsement Letter Request Form', desc: 'Signed endorsement request approved by department chair.', order: 1 },
      { code: 'REQ_RESUME', title: 'Updated Curriculum Vitae / Resume', desc: 'Formatted resume highlighting technical skills and projects.', order: 2 },
      { code: 'REQ_WAIVER', title: 'Notarized Parent/Guardian Waiver', desc: 'Signed and notarized OJT liability waiver.', order: 3 },
      { code: 'REQ_MEDICAL', title: 'Medical Certificate', desc: 'Fit-to-work clearance from university clinic or accredited physician.', order: 4 },
      { code: 'REQ_COR', title: 'Certificate of Registration (COR)', desc: 'Official current semester enrollment proof.', order: 5 },
    ];
    for (const r of reqDefs) {
      await conn.query(
        `INSERT INTO requirement_definitions (program_id, academic_term_id, code, title, description, is_mandatory, sort_order)
         VALUES (?, ?, ?, ?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           description = VALUES(description),
           sort_order = VALUES(sort_order)`,
        [bsitProgramId, termId, r.code, r.title, r.desc, r.order]
      );
    }

    // 5. Demo Coordinator Account
    const coordHash = await bcrypt.hash('Coordinator123!', 10);
    await conn.query(
      `INSERT INTO users (email, password_hash, role, is_active)
       VALUES (?, ?, 'coordinator', 1)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1`,
      ['coordinator@ojtflow.local', coordHash]
    );
    const [coordUserRows] = await conn.query('SELECT id FROM users WHERE email = ?', ['coordinator@ojtflow.local']);
    const coordUserId = (coordUserRows as Array<{ id: number }>)[0].id;

    await conn.query(
      `INSERT INTO coordinators (user_id, college_id, employee_number, first_name, last_name, position_title, contact_number)
       VALUES (?, ?, 'EMP-2026-001', 'Elena', 'Reyes', 'OJT Coordinator', '09171234567')
       ON DUPLICATE KEY UPDATE
         college_id = VALUES(college_id),
         first_name = VALUES(first_name),
         last_name = VALUES(last_name)`,
      [coordUserId, collegeId]
    );

    // 6. Demo Student Accounts
    const studentHash = await bcrypt.hash('Student123!', 10);
    const demoStudents = [
      {
        email: 'student1@ojtflow.local',
        studentNumber: '23-00101',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        section: 'IT-4101',
        eligibility: 'eligible',
      },
      {
        email: 'student2@ojtflow.local',
        studentNumber: '23-00102',
        firstName: 'Maria',
        lastName: 'Santos',
        section: 'IT-4102',
        eligibility: 'incomplete',
      },
    ];

    for (const s of demoStudents) {
      await conn.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES (?, ?, 'student', 1)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1`,
        [s.email, studentHash]
      );
      const [uRows] = await conn.query('SELECT id FROM users WHERE email = ?', [s.email]);
      const userId = (uRows as Array<{ id: number }>)[0].id;

      await conn.query(
        `INSERT INTO students (
           user_id, college_id, program_id, academic_term_id,
           student_number, first_name, last_name, year_level, section, eligibility_status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, 4, ?, ?)
         ON DUPLICATE KEY UPDATE
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           section = VALUES(section),
           eligibility_status = VALUES(eligibility_status)`,
        [userId, collegeId, bsitProgramId, termId, s.studentNumber, s.firstName, s.lastName, s.section, s.eligibility]
      );
    }

    // 7. Partner Companies
    const companies = [
      {
        code: 'PARTNER-001',
        name: 'CALABARZON Cloud Solutions Inc.',
        industry: 'Information Technology',
        label: 'MOA Active',
        desc: 'Enterprise cloud engineering and full-stack web development firm.',
        focus: 'Full-Stack Web & Cloud Engineering',
        skills: JSON.stringify(['TypeScript', 'React', 'Node.js', 'MySQL', 'Docker']),
        address: 'LIMA Technology Center',
        city: 'Lipa City',
        province: 'Batangas',
        person: 'Engr. Marco Villanueva',
        email: 'internships@calabarzoncloud.example.com',
        phone: '043-756-1001',
        quota: 5,
      },
      {
        code: 'PARTNER-002',
        name: 'Batangas Smart Systems Corp.',
        industry: 'Software & Data Analytics',
        label: 'MOA Active',
        desc: 'Data platforms, business intelligence dashboards, and enterprise automation.',
        focus: 'Data Engineering & Backend APIs',
        skills: JSON.stringify(['Python', 'SQL', 'REST APIs', 'Power BI']),
        address: 'Pallocan West',
        city: 'Batangas City',
        province: 'Batangas',
        person: 'Ms. Camille Mendoza',
        email: 'hr@batangassmart.example.com',
        phone: '043-723-2002',
        quota: 4,
      },
    ];

    for (const c of companies) {
      await conn.query(
        `INSERT INTO companies (
           partner_code, name, industry, partnership_label, description, focus_area,
           skills_json, address, city, province, contact_person, contact_email,
           contact_phone, slot_quota, status, created_by_user_id
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           industry = VALUES(industry),
           slot_quota = VALUES(slot_quota),
           status = 'active'`,
        [
          c.code, c.name, c.industry, c.label, c.desc, c.focus,
          c.skills, c.address, c.city, c.province, c.person, c.email,
          c.phone, c.quota, coordUserId,
        ]
      );
    }
  });

  console.log(`[${env.DB_NAME}] Seed completed successfully.`);
}

if (require.main === module) {
  runSeed()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed failed:', err);
      await pool.end();
      process.exit(1);
    });
}
