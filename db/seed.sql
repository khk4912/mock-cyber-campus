INSERT INTO
  users (
    user_id,
    student_id,
    username,
    name,
    role,
    alarm_settings
  )
VALUES
  (
    '1',
    '20260001',
    'user1',
    '김철수',
    '학생',
    '{"assignmentReminders":true,"teamAlerts":true,"noticeAlerts":true}'
  ),
  (
    '2',
    '20260002',
    'user2',
    '김영희',
    '학생',
    '{"assignmentReminders":true,"teamAlerts":false,"noticeAlerts":true}'
  ),
  (
    '3',
    '20260003',
    'user3',
    '김이박',
    '학생',
    '{"assignmentReminders":false,"teamAlerts":true,"noticeAlerts":true}'
  ),
  (
    '4',
    NULL,
    'user4',
    '홍길동',
    '교수',
    '{"assignmentReminders":true,"teamAlerts":true,"noticeAlerts":true}'
  ),
  (
    '5',
    NULL,
    'user5',
    '김교수',
    '교수',
    '{"assignmentReminders":true,"teamAlerts":true,"noticeAlerts":false}'
  );

INSERT INTO
  free_times (user_id, weekly_bits, is_public)
VALUES
  ('1', X'000000000000000000000000000000000000000000', 1),
  ('2', X'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 0),
  ('3', X'00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00', 1);

INSERT INTO
  class_periods (period, start_time, end_time)
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

INSERT INTO
  courses (
    course_id,
    course_name,
    professor,
    description,
    room,
    semester,
    credits
  )
VALUES
  (
    '101',
    '고급웹프로그래밍',
    '홍길동',
    'React와 Next.js 심화',
    'IT-201',
    '2026-1',
    3
  ),
  (
    '102',
    '모바일프로그래밍',
    '김교수',
    '모바일 앱 개발 기초',
    'IT-305',
    '2026-1',
    3
  );

INSERT INTO
  course_enrollments (user_id, course_id)
VALUES
  ('1', '101'),
  ('1', '102'),
  ('2', '101'),
  ('3', '102');

INSERT INTO
  course_meetings (
    course_id,
    day_of_week,
    start_period,
    end_period
  )
VALUES
  ('101', 1, 1, 2),
  ('101', 3, 3, 4),
  ('102', 2, 3, 5);

INSERT INTO
  lms_assignments (
    lms_as_id,
    course_id,
    title,
    description,
    deadline,
    link_url
  )
VALUES
  (
    '1001',
    '101',
    '과제 1',
    'Next.js 페이지 구현',
    '2026-04-10 23:59:59',
    'https://cybercampus.example.com/course/101/assignments/1001'
  ),
  (
    '1002',
    '101',
    '과제 2',
    'Server Action 연습',
    '2026-04-17 23:59:59',
    'https://cybercampus.example.com/course/101/assignments/1002'
  ),
  (
    '1003',
    '102',
    '과제 1',
    '모바일 UI 시안 제출',
    '2026-04-12 18:00:00',
    'https://cybercampus.example.com/course/102/assignments/1003'
  );

INSERT INTO
  lms_lectures (
    lms_lec_id,
    course_id,
    title,
    content,
    opened_at,
    deadline,
    link_url
  )
VALUES
  (
    '2001',
    '101',
    '1주차 강의자료',
    'React Server Components 소개',
    '2026-03-02 09:00:00',
    '2026-03-09 23:59:59',
    'https://cybercampus.example.com/course/101/lectures/2001'
  ),
  (
    '2002',
    '101',
    '2주차 강의자료',
    'App Router 실습',
    '2026-03-09 09:00:00',
    '2026-03-16 23:59:59',
    'https://cybercampus.example.com/course/101/lectures/2002'
  ),
  (
    '2003',
    '102',
    '1주차 강의영상',
    '모바일 UI 기본 원칙',
    '2026-03-04 09:00:00',
    '2026-03-11 23:59:59',
    'https://cybercampus.example.com/course/102/lectures/2003'
  );

INSERT INTO
  lms_notices (
    notice_id,
    course_id,
    title,
    content,
    posted_at,
    link_url
  )
VALUES
  (
    '3001',
    '101',
    '[안내] 과제 2 제출 형식',
    'README와 실행 스크린샷을 함께 제출해주세요.',
    '2026-04-11 10:00:00',
    'https://cybercampus.example.com/course/101/notices/3001'
  ),
  (
    '3002',
    '102',
    '[공지] 팀 프로젝트 조 편성',
    '다음 주 수업 전까지 팀을 확정합니다.',
    '2026-04-08 09:30:00',
    'https://cybercampus.example.com/course/102/notices/3002'
  );

INSERT INTO
  user_assignments (
    user_as_id,
    user_id,
    lms_as_id,
    is_completed,
    custom_remind_time,
    remind_interval
  )
VALUES
  ('4001', '1', '1001', 1, '2026-04-09 21:00:00', 60),
  ('4002', '1', '1002', 0, '2026-04-17 20:00:00', 30),
  ('4003', '1', '1003', 0, '2026-04-12 12:00:00', 120),
  ('4004', '2', '1001', 0, NULL, NULL),
  ('4005', '2', '1002', 0, '2026-04-17 21:30:00', 45),
  ('4006', '3', '1003', 1, NULL, NULL);

INSERT INTO
  user_lecture_progress (
    user_lec_progress_id,
    user_id,
    lms_lec_id,
    progress_rate,
    is_completed,
    custom_remind_time,
    remind_interval
  )
VALUES
  ('5001', '1', '2001', 100, 1, NULL, NULL),
  ('5002', '1', '2002', 35, 0, '2026-03-15 20:00:00', 60),
  ('5003', '1', '2003', 60, 0, NULL, NULL),
  ('5004', '2', '2001', 80, 0, NULL, NULL),
  ('5005', '3', '2003', 100, 1, NULL, NULL);

INSERT INTO
  teams (team_id, team_name, creator_id)
VALUES
  ('6001', '웹프론트 팀', '1'),
  ('6002', '모바일 UI 팀', '3');

INSERT INTO
  team_members (team_id, user_id, role_name, is_admin)
VALUES
  ('6001', '1', '팀장', 1),
  ('6001', '2', '프론트엔드', 0),
  ('6002', '1', '디자인', 0),
  ('6002', '3', '팀장', 1);

INSERT INTO
  team_tasks (
    task_id,
    team_id,
    creator_id,
    title,
    content,
    file_url,
    link_url,
    deadline
  )
VALUES
  (
    '7001',
    '6001',
    '1',
    '대시보드 와이어프레임 정리',
    'Figma 초안을 정리하고 공유한다.',
    NULL,
    'https://figma.example.com/file/team-6001',
    '2026-04-14 18:00:00'
  ),
  (
    '7002',
    '6002',
    '3',
    '모바일 메인 화면 시안 제출',
    '교수님 피드백 반영 전 버전까지 업로드한다.',
    'https://files.example.com/mobile-main-v1.pdf',
    NULL,
    '2026-04-15 12:00:00'
  );

INSERT INTO
  team_task_followers (task_id, user_id)
VALUES
  ('7001', '2'),
  ('7002', '1');

INSERT INTO
  team_votes (vote_id, team_id, suggested_time, participant_responses)
VALUES
  ('8001', '6001', '2026-04-16 19:00:00', '["1","2"]'),
  ('8002', '6002', '2026-04-17 17:00:00', '["1","3"]');
