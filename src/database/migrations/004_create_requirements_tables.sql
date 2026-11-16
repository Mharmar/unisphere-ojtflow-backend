CREATE TABLE requirement_definitions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  program_id INT UNSIGNED NOT NULL,
  academic_term_id INT UNSIGNED NOT NULL,
  code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  is_mandatory TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_req_def_program_term_code (program_id, academic_term_id, code),
  KEY idx_req_def_program_term (program_id, academic_term_id),
  CONSTRAINT fk_req_def_program_id FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
  CONSTRAINT fk_req_def_academic_term_id FOREIGN KEY (academic_term_id) REFERENCES academic_terms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_requirements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  requirement_definition_id INT UNSIGNED NOT NULL,
  status ENUM('missing', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'missing',
  remarks TEXT NULL,
  reviewed_by_user_id INT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  submitted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_student_requirement (student_id, requirement_definition_id),
  KEY idx_student_req_status (status),
  CONSTRAINT fk_student_req_student_id FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
  CONSTRAINT fk_student_req_definition_id FOREIGN KEY (requirement_definition_id) REFERENCES requirement_definitions (id) ON DELETE CASCADE,
  CONSTRAINT fk_student_req_reviewed_by FOREIGN KEY (reviewed_by_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
