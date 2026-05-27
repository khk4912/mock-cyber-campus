# 강의 멤버 함수

이 문서에서는 관리자가 강의 멤버를 추가하거나 제거할 때 쓰는 callable 함수를
정리합니다. 일반 학생 앱 화면에서 직접 호출하는 함수가 아니라 운영자나 관리자용
기능입니다.

## add_member

특정 사용자를 강의에 학생 멤버로 등록합니다. 등록하려는 강의는 활성 상태여야 합니다.

- 권한: admin role 필요
- 요청: `course_id`, `target_uid`
- 응답: 성공 메시지
- 관련 경로: `courses/{courseId}/members/{targetUid}`,
  `users/{targetUid}/courses/{courseId}`

```kotlin
suspend fun addMember(courseId: String, targetUid: String): Map<*, *> {
    val payload = hashMapOf(
        "course_id" to courseId,
        "target_uid" to targetUid
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("add_member")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "course_id": "course-appserver-2026",
  "target_uid": "student-kim"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "message": "Member added successfully"
}
```

강의가 없거나 활성 상태가 아니면 `NOT_FOUND`, 이미 활성 멤버라면 `ALREADY_EXISTS`
오류로 응답합니다.

## remove_member

특정 사용자를 강의에서 제외합니다. 멤버 문서를 삭제하지는 않고 `status`만 `removed`로
바꿉니다.

- 권한: admin role 필요
- 요청: `course_id`, `target_uid`
- 응답: 성공 메시지
- 관련 경로: `courses/{courseId}/members/{targetUid}`,
  `users/{targetUid}/courses/{courseId}`

```kotlin
suspend fun removeMember(courseId: String, targetUid: String): Map<*, *> {
    val payload = hashMapOf(
        "course_id" to courseId,
        "target_uid" to targetUid
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("remove_member")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "course_id": "course-appserver-2026",
  "target_uid": "student-kim"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "message": "Member removed successfully"
}
```

강의를 찾지 못하거나 활성 멤버가 아니면 `NOT_FOUND` 오류로 응답합니다.
