CREATE OR REPLACE VIEW v_student_ojt_status AS
SELECT
  s.id AS student_id,
  s.user_id,
  s.college_id,
  s.program_id,
  s.academic_term_id,
  s.eligibility_status,
  p.id AS placement_id,
  p.company_id AS placement_company_id,
  p.status AS placement_status,
  CASE
    WHEN p.status = 'completed' THEN 'completed'
    WHEN p.status = 'deployed' THEN 'deployed'
    WHEN p.status = 'confirmed' THEN 'placed'
    WHEN EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.student_id = s.id
        AND a.academic_term_id = s.academic_term_id
        AND a.status = 'accepted'
    ) THEN 'placed'
    WHEN EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.student_id = s.id
        AND a.academic_term_id = s.academic_term_id
        AND a.status IN ('submitted', 'under_review', 'shortlisted')
    ) THEN 'applying'
    WHEN s.eligibility_status = 'eligible' THEN 'eligible'
    ELSE 'preparing'
  END AS overall_ojt_status
FROM students s
LEFT JOIN placements p
  ON p.student_id = s.id
 AND p.academic_term_id = s.academic_term_id
 AND p.status <> 'cancelled';
