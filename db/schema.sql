PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  student_id TEXT UNIQUE,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('학생', '교수')),
  fcm_token TEXT,
  alarm_settings TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS free_times (
  user_id TEXT PRIMARY KEY,
  weekly_bits BLOB NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  course_id TEXT PRIMARY KEY,
  course_name TEXT NOT NULL,
  professor TEXT NOT NULL,
  description TEXT,
  room TEXT,
  semester TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3 CHECK (credits > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_meetings (
  course_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (
    day_of_week BETWEEN 1
    AND 7
  ),
  start_period INTEGER NOT NULL CHECK (start_period >= 1),
  end_period INTEGER NOT NULL CHECK (end_period >= start_period),
  PRIMARY KEY (course_id, day_of_week, start_period, end_period),
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_periods (
  period INTEGER PRIMARY KEY,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lms_assignments (
  lms_as_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TEXT NOT NULL,
  link_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lms_lectures (
  lms_lec_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  opened_at TEXT,
  deadline TEXT,
  link_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lms_notices (
  notice_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  posted_at TEXT NOT NULL,
  link_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_assignments (
  user_as_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lms_as_id TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  custom_remind_time TEXT,
  remind_interval INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lms_as_id) REFERENCES lms_assignments(lms_as_id) ON DELETE CASCADE,
  UNIQUE (user_id, lms_as_id)
);

CREATE TABLE IF NOT EXISTS user_lecture_progress (
  user_lec_progress_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lms_lec_id TEXT NOT NULL,
  progress_rate INTEGER NOT NULL DEFAULT 0 CHECK (
    progress_rate BETWEEN 0
    AND 100
  ),
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  custom_remind_time TEXT,
  remind_interval INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lms_lec_id) REFERENCES lms_lectures(lms_lec_id) ON DELETE CASCADE,
  UNIQUE (user_id, lms_lec_id)
);

CREATE TABLE IF NOT EXISTS teams (
  team_id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role_name TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)),
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_tasks (
  task_id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  link_url TEXT,
  deadline TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS team_task_followers (
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES team_tasks(task_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_votes (
  vote_id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  suggested_time TEXT NOT NULL,
  participant_responses TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments (user_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments (course_id);

CREATE INDEX IF NOT EXISTS idx_course_meetings_course_id ON course_meetings (course_id);

CREATE INDEX IF NOT EXISTS idx_lms_assignments_course_id ON lms_assignments (course_id);

CREATE INDEX IF NOT EXISTS idx_lms_assignments_deadline ON lms_assignments (deadline);

CREATE INDEX IF NOT EXISTS idx_lms_lectures_course_id ON lms_lectures (course_id);

CREATE INDEX IF NOT EXISTS idx_lms_notices_course_id ON lms_notices (course_id);

CREATE INDEX IF NOT EXISTS idx_lms_notices_posted_at ON lms_notices (posted_at);

CREATE INDEX IF NOT EXISTS idx_user_assignments_user_id ON user_assignments (user_id);

CREATE INDEX IF NOT EXISTS idx_user_assignments_lms_as_id ON user_assignments (lms_as_id);

CREATE INDEX IF NOT EXISTS idx_user_lecture_progress_user_id ON user_lecture_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_user_lecture_progress_lms_lec_id ON user_lecture_progress (lms_lec_id);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members (user_id);

CREATE INDEX IF NOT EXISTS idx_team_tasks_team_id ON team_tasks (team_id);

CREATE INDEX IF NOT EXISTS idx_team_tasks_deadline ON team_tasks (deadline);

CREATE INDEX IF NOT EXISTS idx_team_task_followers_user_id ON team_task_followers (user_id);

CREATE INDEX IF NOT EXISTS idx_team_votes_team_id ON team_votes (team_id);

CREATE TRIGGER IF NOT EXISTS validate_course_enrollment_student_insert
BEFORE INSERT ON course_enrollments
FOR EACH ROW
WHEN (SELECT role FROM users WHERE user_id = NEW.user_id) <> '학생'
BEGIN
  SELECT RAISE(ABORT, 'course enrollment must reference a 학생 user');
END;

CREATE TRIGGER IF NOT EXISTS validate_course_enrollment_student_update
BEFORE UPDATE OF user_id ON course_enrollments
FOR EACH ROW
WHEN (SELECT role FROM users WHERE user_id = NEW.user_id) <> '학생'
BEGIN
  SELECT RAISE(ABORT, 'course enrollment must reference a 학생 user');
END;
