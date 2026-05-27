# 강의 함수

이 문서에서는 강의 목록 조회, 상세 조회, 생성, 삭제와 관련된 callable 함수를 정리합니다.
강의 생성과 삭제는 professor role 사용자만 호출할 수 있습니다.

## list_courses

현재 로그인한 사용자가 수강 중이거나 강의 중인 활성 강의 목록을 가져옵니다.

- 권한: 로그인 필요
- 요청: 빈 객체
- 응답: 강의 marker 배열
- 관련 경로: `users/{uid}/courses/{courseId}`

```kotlin
suspend fun listCourses(): List<*> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_courses")
        .call(emptyMap<String, Any>())
        .await()

    return result.data as List<*>
}
```

응답 예시는 다음과 같습니다.

`users/{uid}/courses` 아래의 활성 marker 문서를 `to_dict()` 결과로 반환합니다.
서버가 만든 marker에는 `updated_at`이 포함되어 있습니다.

```json
[
  {
    "course_id": "course-appserver-2026",
    "role": "student",
    "status": "active",
    "title": "앱서버 프로젝트",
    "title_snapshot": "앱서버 프로젝트",
    "updated_at": "<server timestamp>"
  }
]
```

## get_course

`course_id`로 강의의 상세 정보를 가져옵니다. 해당 강의의 활성 멤버만 호출할 수 있습니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`
- 응답: 강의 문서 map
- 관련 경로: `courses/{courseId}`

```kotlin
suspend fun getCourse(courseId: String): Map<*, *> {
    val payload = hashMapOf("course_id" to courseId)

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_course")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "course_id": "course-appserver-2026"
}
```

응답 예시는 다음과 같습니다.

`courses/{courseId}` 문서를 `to_dict()` 결과로 그대로 반환합니다.

```json
{
  "course_id": "course-appserver-2026",
  "title": "앱서버 프로젝트",
  "description": "Firebase 기반 팀 프로젝트 강의",
  "professor_uid": "professor-kim",
  "status": "active",
  "created_at": "<server timestamp>",
  "updated_at": "<server timestamp>"
}
```

`course_id`를 빠뜨리면 `INVALID_ARGUMENT`, 강의 자체가 없으면 `NOT_FOUND`, 멤버가
아니면 `PERMISSION_DENIED` 오류로 응답합니다.

## create_course

새 강의를 만듭니다. 호출자는 professor role이어야 하며, 호출한 사용자는 해당 강의의
교수 멤버로 자동 등록됩니다.

- 권한: professor role 필요
- 요청: `course_data`
- 응답: `course_id`
- 관련 경로: `courses/{courseId}`, `courses/{courseId}/members/{uid}`,
  `users/{uid}/courses/{courseId}`

```kotlin
suspend fun createCourse(): String {
    val payload = hashMapOf(
        "course_data" to hashMapOf(
            "title" to "앱서버 프로젝트",
            "description" to "Firebase 기반 팀 프로젝트 강의",
            "status" to "active"
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("create_course")
        .call(payload)
        .await()

    val data = result.data as Map<*, *>
    return data["course_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "course_data": {
    "title": "앱서버 프로젝트",
    "description": "Firebase 기반 팀 프로젝트 강의",
    "status": "active"
  }
}
```

응답 예시는 다음과 같습니다.

```json
{
  "course_id": "<course_ref.id>"
}
```

`course_data`가 비어 있거나 객체 형식이 아니면 `INVALID_ARGUMENT`, professor role이
아니면 `PERMISSION_DENIED` 오류로 응답합니다.

## delete_course

강의를 삭제 상태로 표시합니다. 문서를 실제로 지우는 대신 `status`를 `deleted`로
바꾸며, 멤버 marker도 함께 삭제 상태로 갱신합니다.

- 권한: professor role 필요, 강의 owner 필요
- 요청: `course_id`
- 응답: 성공 메시지
- 관련 경로: `courses/{courseId}`, `courses/{courseId}/members/{uid}`,
  `users/{uid}/courses/{courseId}`

```kotlin
suspend fun deleteCourse(courseId: String): Map<*, *> {
    val payload = hashMapOf("course_id" to courseId)

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("delete_course")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "course_id": "course-appserver-2026"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "message": "Course deleted successfully"
}
```

강의가 없거나 이미 삭제된 상태라면 `NOT_FOUND`, 호출자가 강의 owner가 아니면
`PERMISSION_DENIED` 오류로 응답합니다.
