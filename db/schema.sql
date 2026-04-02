PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('학생', '교수'))
);

CREATE TABLE IF NOT EXISTS lectures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  instructor_user_id INTEGER NOT NULL,
  room TEXT,
  semester TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3 CHECK (credits > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lecture_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lecture_enrollments (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  lecture_id INTEGER NOT NULL,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
  UNIQUE (user_id, lecture_id)
);

-- 1 = Monday, 2 = Tuesday, ... , 7 = Sunday
-- Monday 1st~2nd period   => (day_of_week = 1, start_period = 1, end_period = 2)
-- Tuesday 3rd~5th period  => (day_of_week = 2, start_period = 3, end_period = 5)
CREATE TABLE IF NOT EXISTS lecture_meetings (
  id INTEGER PRIMARY KEY,
  lecture_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (
    day_of_week BETWEEN 1
    AND 7
  ),
  start_period INTEGER NOT NULL CHECK (start_period >= 1),
  end_period INTEGER NOT NULL CHECK (end_period >= start_period),
  FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
  UNIQUE (
    lecture_id,
    day_of_week,
    start_period,
    end_period
  )
);

-- Optional: define actual clock times for each period if needed later.
CREATE TABLE IF NOT EXISTS class_periods (
  period INTEGER PRIMARY KEY,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assignments_lecture_id ON assignments (lecture_id);

CREATE INDEX IF NOT EXISTS idx_assignments_due_at ON assignments (due_at);

CREATE INDEX IF NOT EXISTS idx_lecture_enrollments_user_id ON lecture_enrollments (user_id);

CREATE INDEX IF NOT EXISTS idx_lecture_enrollments_lecture_id ON lecture_enrollments (lecture_id);

CREATE INDEX IF NOT EXISTS idx_lecture_meetings_lecture_id ON lecture_meetings (lecture_id);

CREATE INDEX IF NOT EXISTS idx_lecture_meetings_day_period ON lecture_meetings (day_of_week, start_period, end_period);

CREATE INDEX IF NOT EXISTS idx_lectures_instructor_user_id ON lectures (instructor_user_id);

CREATE TRIGGER IF NOT EXISTS validate_lecture_instructor_insert
BEFORE INSERT ON lectures
FOR EACH ROW
WHEN (SELECT role FROM users WHERE id = NEW.instructor_user_id) <> '교수'
BEGIN
  SELECT RAISE(ABORT, 'lecture instructor must reference a 교수 user');
END;

CREATE TRIGGER IF NOT EXISTS validate_lecture_instructor_update
BEFORE UPDATE OF instructor_user_id ON lectures
FOR EACH ROW
WHEN (SELECT role FROM users WHERE id = NEW.instructor_user_id) <> '교수'
BEGIN
  SELECT RAISE(ABORT, 'lecture instructor must reference a 교수 user');
END;

CREATE TRIGGER IF NOT EXISTS validate_enrollment_student_insert
BEFORE INSERT ON lecture_enrollments
FOR EACH ROW
WHEN (SELECT role FROM users WHERE id = NEW.user_id) <> '학생'
BEGIN
  SELECT RAISE(ABORT, 'lecture enrollment must reference a 학생 user');
END;

CREATE TRIGGER IF NOT EXISTS validate_enrollment_student_update
BEFORE UPDATE OF user_id ON lecture_enrollments
FOR EACH ROW
WHEN (SELECT role FROM users WHERE id = NEW.user_id) <> '학생'
BEGIN
  SELECT RAISE(ABORT, 'lecture enrollment must reference a 학생 user');
END;
