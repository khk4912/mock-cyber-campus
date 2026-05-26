# 강의 콘텐츠 함수

이 문서는 과제, 공지사항, VOD callable 함수를 설명합니다. 조회 함수는 강의 멤버가
호출할 수 있고, 생성 함수는 professor role 사용자만 호출할 수 있습니다.

## list_assignments

특정 강의의 과제 목록을 가져옵니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`
- 응답: 과제 배열
- 관련 경로: `courses/{courseId}/assignments/{assignmentId}`

```kotlin
suspend fun listAssignments(courseId: String): List<*> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_assignments")
        .call(hashMapOf("course_id" to courseId))
        .await()

    return result.data as List<*>
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026"
}
```

응답입니다.

함수는 `courses/{courseId}/assignments` 하위 문서들의 `to_dict()` 배열을 반환합니다.
문서 ID는 문서 필드에 저장되어 있지 않으면 응답에 포함되지 않습니다.

```json
[
  {
    "title": "기획서 제출",
    "description": "프로젝트 기획서를 제출합니다.",
    "due_at": "2026-05-30T23:59:00+09:00"
  }
]
```

`course_id`가 없으면 `INVALID_ARGUMENT`, 강의 멤버가 아니면 `PERMISSION_DENIED`
오류가 발생합니다.

## get_assignment

특정 강의의 과제 상세 정보를 가져옵니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`, `assignment_id`
- 응답: 과제 문서 map
- 관련 경로: `courses/{courseId}/assignments/{assignmentId}`

```kotlin
suspend fun getAssignment(courseId: String, assignmentId: String): Map<*, *> {
    val payload = hashMapOf(
        "course_id" to courseId,
        "assignment_id" to assignmentId
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_assignment")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026",
  "assignment_id": "assignment-proposal"
}
```

응답입니다.

함수는 `courses/{courseId}/assignments/{assignmentId}` 문서를 `to_dict()`로 반환합니다.

```json
{
  "title": "기획서 제출",
  "description": "프로젝트 기획서를 제출합니다.",
  "due_at": "2026-05-30T23:59:00+09:00"
}
```

과제가 없으면 `NOT_FOUND` 오류가 발생합니다.

## create_assignment

특정 강의에 새 과제를 생성합니다.

- 권한: professor role 필요, 강의 멤버 필요
- 요청: `course_id`, `assignment_data`
- 응답: `assignment_id`
- 관련 경로: `courses/{courseId}/assignments/{assignmentId}`

```kotlin
suspend fun createAssignment(courseId: String): String {
    val payload = hashMapOf(
        "course_id" to courseId,
        "assignment_data" to hashMapOf(
            "title" to "기획서 제출",
            "description" to "프로젝트 기획서를 제출합니다.",
            "due_at" to "2026-05-30T23:59:00+09:00"
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("create_assignment")
        .call(payload)
        .await()

    val data = result.data as Map<*, *>
    return data["assignment_id"] as String
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026",
  "assignment_data": {
    "title": "기획서 제출",
    "description": "프로젝트 기획서를 제출합니다.",
    "due_at": "2026-05-30T23:59:00+09:00"
  }
}
```

응답입니다.

```json
{
  "assignment_id": "<assignment_ref.id>"
}
```

`course_id` 또는 `assignment_data`가 없으면 `INVALID_ARGUMENT` 오류가 발생합니다.

## list_notices

특정 강의의 공지사항 목록을 가져옵니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`
- 응답: 공지사항 배열
- 관련 경로: `courses/{courseId}/notices/{noticeId}`

```kotlin
suspend fun listNotices(courseId: String): List<*> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_notices")
        .call(hashMapOf("course_id" to courseId))
        .await()

    return result.data as List<*>
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026"
}
```

응답입니다.

함수는 `courses/{courseId}/notices` 하위 문서들의 `to_dict()` 배열을 반환합니다.
문서 ID는 문서 필드에 저장되어 있지 않으면 응답에 포함되지 않습니다.

```json
[
  {
    "title": "중간 발표 안내",
    "content": "중간 발표 일정과 제출물을 확인합니다.",
    "type": "exam"
  }
]
```

강의 멤버가 아니면 `PERMISSION_DENIED` 오류가 발생합니다.

## get_notice

특정 강의의 공지사항 상세 정보를 가져옵니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`, `notice_id`
- 응답: 공지사항 문서 map
- 관련 경로: `courses/{courseId}/notices/{noticeId}`

```kotlin
suspend fun getNotice(courseId: String, noticeId: String): Map<*, *> {
    val payload = hashMapOf(
        "course_id" to courseId,
        "notice_id" to noticeId
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_notice")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026",
  "notice_id": "notice-exam-1"
}
```

응답입니다.

함수는 `courses/{courseId}/notices/{noticeId}` 문서를 `to_dict()`로 반환합니다.

```json
{
  "title": "중간 발표 안내",
  "content": "중간 발표 일정과 제출물을 확인합니다.",
  "type": "exam"
}
```

공지사항이 없으면 `NOT_FOUND` 오류가 발생합니다.

## create_notice

특정 강의에 새 공지사항을 생성합니다.

- 권한: professor role 필요, 강의 멤버 필요
- 요청: `course_id`, `notice_data`
- 응답: `notice_id`
- 관련 경로: `courses/{courseId}/notices/{noticeId}`

```kotlin
suspend fun createNotice(courseId: String): String {
    val payload = hashMapOf(
        "course_id" to courseId,
        "notice_data" to hashMapOf(
            "title" to "중간 발표 안내",
            "content" to "중간 발표 일정과 제출물을 확인합니다.",
            "type" to "exam"
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("create_notice")
        .call(payload)
        .await()

    val data = result.data as Map<*, *>
    return data["notice_id"] as String
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026",
  "notice_data": {
    "title": "중간 발표 안내",
    "content": "중간 발표 일정과 제출물을 확인합니다.",
    "type": "exam"
  }
}
```

응답입니다.

```json
{
  "notice_id": "<notice_ref.id>"
}
```

`course_id` 또는 `notice_data`가 없으면 `INVALID_ARGUMENT` 오류가 발생합니다.

## list_vods

특정 강의의 VOD 목록을 가져옵니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`
- 응답: VOD 배열
- 관련 경로: `courses/{courseId}/vods/{vodId}`

```kotlin
suspend fun listVods(courseId: String): List<*> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_vods")
        .call(hashMapOf("course_id" to courseId))
        .await()

    return result.data as List<*>
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026"
}
```

응답입니다.

함수는 `courses/{courseId}/vods` 하위 문서들의 `to_dict()` 배열을 반환합니다.
문서 ID는 문서 필드에 저장되어 있지 않으면 응답에 포함되지 않습니다.

```json
[
  {
    "title": "1주차 강의",
    "url": "https://example.com/vods/week-1",
    "duration_minutes": 75
  }
]
```

강의 멤버가 아니면 `PERMISSION_DENIED` 오류가 발생합니다.

## get_vod

특정 강의의 VOD 상세 정보를 가져옵니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`, `vod_id`
- 응답: VOD 문서 map
- 관련 경로: `courses/{courseId}/vods/{vodId}`

```kotlin
suspend fun getVod(courseId: String, vodId: String): Map<*, *> {
    val payload = hashMapOf(
        "course_id" to courseId,
        "vod_id" to vodId
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_vod")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026",
  "vod_id": "vod-week-1"
}
```

응답입니다.

함수는 `courses/{courseId}/vods/{vodId}` 문서를 `to_dict()`로 반환합니다.

```json
{
  "title": "1주차 강의",
  "url": "https://example.com/vods/week-1",
  "duration_minutes": 75
}
```

VOD가 없으면 `NOT_FOUND` 오류가 발생합니다.

## create_vod

특정 강의에 새 VOD를 생성합니다.

- 권한: professor role 필요, 강의 멤버 필요
- 요청: `course_id`, `vod_data`
- 응답: `vod_id`
- 관련 경로: `courses/{courseId}/vods/{vodId}`

```kotlin
suspend fun createVod(courseId: String): String {
    val payload = hashMapOf(
        "course_id" to courseId,
        "vod_data" to hashMapOf(
            "title" to "1주차 강의",
            "url" to "https://example.com/vods/week-1",
            "duration_minutes" to 75
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("create_vod")
        .call(payload)
        .await()

    val data = result.data as Map<*, *>
    return data["vod_id"] as String
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026",
  "vod_data": {
    "title": "1주차 강의",
    "url": "https://example.com/vods/week-1",
    "duration_minutes": 75
  }
}
```

응답입니다.

```json
{
  "vod_id": "<vod_ref.id>"
}
```

`course_id` 또는 `vod_data`가 없으면 `INVALID_ARGUMENT` 오류가 발생합니다.
