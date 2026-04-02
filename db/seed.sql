INSERT INTO
  users (id, username, display_name, role)
VALUES
  (1, 'user1', '김철수', '학생') ON CONFLICT(id) DO
UPDATE
SET
  username = excluded.username,
  display_name = excluded.display_name,
  role = excluded.role;

INSERT INTO
  users (id, username, display_name, role)
VALUES
  (2, 'user2', '김영희', '학생') ON CONFLICT(id) DO
UPDATE
SET
  username = excluded.username,
  display_name = excluded.display_name,
  role = excluded.role;

INSERT INTO
  users (id, username, display_name, role)
VALUES
  (3, 'user3', '김이박', '학생') ON CONFLICT(id) DO
UPDATE
SET
  username = excluded.username,
  display_name = excluded.display_name,
  role = excluded.role;

INSERT INTO
  users (id, username, display_name, role)
VALUES
  (4, 'user4', '홍길동', '교수') ON CONFLICT(id) DO
UPDATE
SET
  username = excluded.username,
  display_name = excluded.display_name,
  role = excluded.role;

INSERT INTO
  users (id, username, display_name, role)
VALUES
  (5, 'user5', '김교수', '교수') ON CONFLICT(id) DO
UPDATE
SET
  username = excluded.username,
  display_name = excluded.display_name,
  role = excluded.role;

INSERT
  OR IGNORE INTO class_periods (period, start_time, end_time)
VALUES
  (1, '09:00', '09:50'),
  (2, '10:00', '10:50'),
  (3, '11:00', '11:50'),
  (4, '12:00', '12:50'),
  (5, '13:00', '13:50'),
  (6, '14:00', '14:50'),
  (7, '15:00', '15:50'),
  (8, '16:00', '16:50'),
  (9, '17:00', '17:50');

INSERT
  OR IGNORE INTO lectures (
    id,
    code,
    title,
    description,
    instructor_user_id,
    room,
    semester,
    credits
  )
VALUES
  (
    101,
    '12345_678',
    '고급웹프로그래밍',
    'React와 Next.js 심화',
    4,
    'IT-201',
    '2026-1',
    3
  ),
  (
    102,
    '12345_234',
    '모바일프로그래밍',
    '모바일 앱 개발 기초',
    5,
    'IT-305',
    '2026-1',
    3
  );

INSERT
  OR IGNORE INTO lecture_meetings (
    lecture_id,
    day_of_week,
    start_period,
    end_period
  )
VALUES
  (101, 1, 1, 2),
  (101, 3, 3, 4),
  (102, 2, 3, 5);

INSERT
  OR IGNORE INTO assignments (
    id,
    lecture_id,
    title,
    description,
    due_at
  )
VALUES
  (
    1001,
    101,
    '과제 1',
    'Next.js 페이지 구현',
    '2026-04-10 23:59:59'
  ),
  (
    1002,
    101,
    '과제 2',
    'Server Action 연습',
    '2026-04-17 23:59:59'
  ),
  (
    1003,
    102,
    '과제 1',
    '모바일 UI 시안 제출',
    '2026-04-12 18:00:00'
  );

INSERT
  OR IGNORE INTO lecture_enrollments (user_id, lecture_id)
VALUES
  (1, 101),
  (1, 102),
  (2, 101),
  (3, 102);
