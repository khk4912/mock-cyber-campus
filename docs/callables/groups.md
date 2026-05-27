# 그룹 함수

이 문서는 강의 안에서 그룹을 만들고, 그룹 멤버를 관리하고, 그룹원들의 공통 가능
시간대를 찾는 callable 함수를 설명합니다.

## create_group

현재 로그인한 사용자가 특정 강의 안에서 그룹을 생성합니다. 생성자는 그룹 owner로 자동
등록됩니다.

- 권한: 로그인 필요, 강의 멤버 필요
- 요청: `course_id`, `name`
- 응답: `group_id`
- 관련 경로: `groups/{groupId}`, `groups/{groupId}/members/{uid}`,
  `users/{uid}/groups/{groupId}`

```kotlin
suspend fun createGroup(courseId: String, name: String): String {
    val payload = hashMapOf(
        "course_id" to courseId,
        "name" to name
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("create_group")
        .call(payload)
        .await()

    val data = result.data as Map<*, *>
    return data["group_id"] as String
}
```

요청입니다.

```json
{
  "course_id": "course-appserver-2026",
  "name": "모바일프로그래밍 3그룹"
}
```

응답입니다.

```json
{
  "group_id": "<group_ref.id>"
}
```

`course_id` 또는 `name`이 없으면 `INVALID_ARGUMENT`, 강의 멤버가 아니면
`PERMISSION_DENIED` 오류가 발생합니다.

## list_groups

현재 로그인한 사용자가 속한 활성 그룹 목록을 가져옵니다.

- 권한: 로그인 필요
- 요청: 빈 객체
- 응답: 그룹 marker 배열
- 관련 경로: `users/{uid}/groups/{groupId}`

```kotlin
suspend fun listGroups(): List<*> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_groups")
        .call(emptyMap<String, Any>())
        .await()

    return result.data as List<*>
}
```

응답입니다.

함수는 `users/{uid}/groups`의 활성 marker 문서를 `to_dict()`로 반환합니다.
서버가 생성한 marker에는 `updated_at`이 포함됩니다.

```json
[
  {
    "group_id": "group-alpha",
    "course_id": "course-appserver-2026",
    "name": "모바일프로그래밍 3그룹",
    "role": "owner",
    "status": "active",
    "updated_at": "<server timestamp>"
  }
]
```

## get_group

`group_id`로 그룹 상세 정보와 활성 멤버 목록을 가져옵니다.

- 권한: 로그인 필요, 그룹 멤버 필요
- 요청: `group_id`
- 응답: 그룹 문서와 `members`
- 관련 경로: `groups/{groupId}`, `groups/{groupId}/members/{uid}`

```kotlin
suspend fun getGroup(groupId: String): Map<*, *> {
    val payload = hashMapOf("group_id" to groupId)

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_group")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

응답입니다.

```json
{
  "group_id": "group-alpha",
  "course_id": "course-appserver-2026",
  "name": "모바일프로그래밍 3그룹",
  "owner_uid": "student-kim",
  "status": "active",
  "created_at": "<server timestamp>",
  "updated_at": "<server timestamp>",
  "members": [
    {
      "uid": "student-kim",
      "role": "owner",
      "status": "active",
      "created_at": "<server timestamp>",
      "updated_at": "<server timestamp>"
    }
  ]
}
```

그룹이 없거나 활성 상태가 아니면 `NOT_FOUND`, 그룹 멤버가 아니면
`PERMISSION_DENIED` 오류가 발생합니다.

## add_group_member

그룹 owner가 같은 강의의 활성 멤버를 그룹에 추가합니다.

- 권한: 로그인 필요, 그룹 owner 필요
- 요청: `group_id`, `target_uid`
- 응답: `group_id`, `target_uid`
- 관련 경로: `groups/{groupId}/members/{targetUid}`,
  `users/{targetUid}/groups/{groupId}`

```kotlin
suspend fun addGroupMember(groupId: String, targetUid: String): Map<*, *> {
    val payload = hashMapOf(
        "group_id" to groupId,
        "target_uid" to targetUid
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("add_group_member")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

대상 사용자가 같은 강의의 활성 멤버가 아니면 `PERMISSION_DENIED`, 이미 활성 그룹
멤버이면 `ALREADY_EXISTS` 오류가 발생합니다.

## remove_group_member

그룹 owner가 그룹 멤버를 제거합니다. 그룹 owner 자신은 제거할 수 없습니다.

- 권한: 로그인 필요, 그룹 owner 필요
- 요청: `group_id`, `target_uid`
- 응답: `group_id`, `target_uid`
- 관련 경로: `groups/{groupId}/members/{targetUid}`,
  `users/{targetUid}/groups/{groupId}`

```kotlin
suspend fun removeGroupMember(groupId: String, targetUid: String): Map<*, *> {
    val payload = hashMapOf(
        "group_id" to groupId,
        "target_uid" to targetUid
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("remove_group_member")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

대상 멤버가 없으면 `NOT_FOUND`, owner를 제거하려고 하면 `FAILED_PRECONDITION` 오류가
발생합니다.

## get_group_time_candidates

그룹원들의 `free_time_masks`를 비교해 함께 가능한 시간 후보를 반환합니다. 후보는 가능한
인원이 많은 순서, 같은 인원 수라면 요일과 시작 시간이 빠른 순서로 정렬됩니다.

- 권한: 로그인 필요, 그룹 멤버 필요
- 요청: `group_id`, `duration_hours`, `top_k`
- 응답: `candidates`
- 관련 경로: `groups/{groupId}/members/{uid}`, `users/{uid}`

`duration_hours`는 `1..24`, `top_k`는 `1..50` 범위입니다. 생략하면 각각 `1`, `10`을
사용합니다.

```kotlin
suspend fun getGroupTimeCandidates(groupId: String): List<*> {
    val payload = hashMapOf(
        "group_id" to groupId,
        "duration_hours" to 2,
        "top_k" to 10
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_group_time_candidates")
        .call(payload)
        .await()

    val data = result.data as Map<*, *>
    return data["candidates"] as List<*>
}
```

응답입니다.

```json
{
  "candidates": [
    {
      "day": 1,
      "start_hour": 14,
      "end_hour": 16,
      "available_count": 3,
      "total_count": 4,
      "available_uids": ["student-kim", "student-lee", "student-park"],
      "missing_uids": ["student-choi"]
    }
  ]
}
```

`day`는 `0..6` 범위이고, `start_hour`, `end_hour`는 24시간 기준 정수입니다.
그룹 멤버가 아니면 `PERMISSION_DENIED` 오류가 발생합니다.
