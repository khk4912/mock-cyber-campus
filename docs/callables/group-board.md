# 그룹 게시판과 일정 함수

이 문서에서는 그룹 화면의 게시판, 게시글 상세, 캘린더, 일정 추가 화면에서 사용하는
callable 함수들을 정리합니다. 모든 함수는 호출자가 해당 그룹의 활성 멤버일 때만
동작합니다.

## create_group_post

그룹 게시글을 만듭니다. 일반 글, 파일, 링크, 투표, 할 일은 모두 하나의 게시글 모델로
함께 저장됩니다. 게시글 고정 여부는 생성 요청이 아니라 `pin_group_post`에서
변경합니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, `post`
- 응답: `post_id`
- 관련 경로: `groups/{groupId}/posts/{postId}`

```kotlin
suspend fun createGroupPost(groupId: String): String {
    val payload = hashMapOf(
        "group_id" to groupId,
        "post" to hashMapOf(
            "post_type" to "note",
            "title" to "게시글 제목",
            "content" to "회의에서 논의한 내용을 공유합니다.",
            "event_date" to "2026-04-15",
            "attachments" to listOf(
                hashMapOf(
                    "type" to "link",
                    "title" to "링크 제목",
                    "url" to "https://github.com/losum/1234"
                ),
                hashMapOf(
                    "type" to "file",
                    "name" to "파일명.pdf",
                    "url" to "https://storage.example.com/group/file.pdf",
                    "content_type" to "application/pdf",
                    "size" to 1258291
                )
            )
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("create_group_post")
        .call(payload)
        .await()

    return (result.data as Map<*, *>)["post_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "post": {
    "post_type": "note",
    "title": "게시글 제목",
    "content": "회의에서 논의한 내용을 공유합니다.",
    "event_date": "2026-04-15",
    "attachments": [
      {
        "type": "link",
        "title": "링크 제목",
        "url": "https://github.com/losum/1234"
      },
      {
        "type": "file",
        "name": "파일명.pdf",
        "url": "https://storage.example.com/group/file.pdf",
        "content_type": "application/pdf",
        "size": 1258291
      }
    ]
  }
}
```

응답 예시는 다음과 같습니다.

```json
{
  "post_id": "<post_ref.id>"
}
```

## create_group_post: 할 일 예시

`post_type`이 `task`이면 `get_todo`에서도 그룹 할 일로 같이 조회됩니다.
`assignee_uid`가 지정된 경우에는 해당 사용자에게만 할 일로 표시되고, 비워 두면
그룹 전체의 공통 할 일로 처리됩니다.

```json
{
  "group_id": "group-alpha",
  "post": {
    "post_type": "task",
    "title": "회의록 작성",
    "content": "이번 주 회의 내용을 정리합니다.",
    "status": "in_progress",
    "assignee_uid": "student-kim",
    "due_at": "2026-04-15T23:59:00+09:00"
  }
}
```

## create_group_post: 투표 예시

```json
{
  "group_id": "group-alpha",
  "post": {
    "post_type": "vote",
    "title": "다음 회의 시간 투표",
    "content": "가능한 시간을 선택해 주세요.",
    "vote": {
      "options": ["월요일 14시", "화요일 16시", "수요일 20시"],
      "closes_at": "2026-04-15T23:59:00+09:00"
    }
  }
}
```

## list_group_posts

그룹 게시글 목록을 가져옵니다. 서버는 전체 목록과 함께 고정글 목록, 그리고 날짜별로
묶은 section을 한 번에 돌려줍니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, 선택 `post_type`, `status`, `query`
- 응답: `posts`, `pinned`, `sections`
- 관련 경로: `groups/{groupId}/posts`

```kotlin
suspend fun listGroupPosts(groupId: String): Map<*, *> {
    val payload = hashMapOf(
        "group_id" to groupId,
        "post_type" to "all",
        "status" to "all",
        "query" to "회의"
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_group_posts")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "post_type": "all",
  "status": "all",
  "query": "회의"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "posts": [
    {
      "post_id": "post-1",
      "group_id": "group-alpha",
      "post_type": "note",
      "title": "게시글 제목",
      "content": "회의에서 논의한 내용을 공유합니다.",
      "status": "todo",
      "pinned": true,
      "author_uid": "student-kim",
      "author_name": "김가천",
      "event_date": "2026-04-15",
      "attachments": [],
      "created_at": "<server timestamp>",
      "updated_at": "<server timestamp>"
    },
    {
      "post_id": "post-2",
      "group_id": "group-alpha",
      "post_type": "task",
      "title": "회의록 작성",
      "content": "이번 주 회의 내용을 정리합니다.",
      "status": "in_progress",
      "pinned": false,
      "author_uid": "student-lee",
      "author_name": "이무한",
      "due_at": "2026-04-15T23:59:00+09:00",
      "attachments": [],
      "created_at": "<server timestamp>",
      "updated_at": "<server timestamp>"
    }
  ],
  "pinned": [
    {
      "post_id": "post-1",
      "group_id": "group-alpha",
      "post_type": "note",
      "title": "게시글 제목",
      "content": "회의에서 논의한 내용을 공유합니다.",
      "status": "todo",
      "pinned": true,
      "author_uid": "student-kim",
      "author_name": "김가천",
      "event_date": "2026-04-15",
      "attachments": [],
      "created_at": "<server timestamp>",
      "updated_at": "<server timestamp>"
    }
  ],
  "sections": [
    {
      "date": "2026-04-15",
      "items": [
        {
          "post_id": "post-2",
          "group_id": "group-alpha",
          "post_type": "task",
          "title": "회의록 작성",
          "content": "이번 주 회의 내용을 정리합니다.",
          "status": "in_progress",
          "pinned": false,
          "author_uid": "student-lee",
          "author_name": "이무한",
          "due_at": "2026-04-15T23:59:00+09:00",
          "attachments": [],
          "created_at": "<server timestamp>",
          "updated_at": "<server timestamp>"
        }
      ]
    }
  ]
}
```

## get_group_post

게시글 상세 화면에서 사용할 게시글 하나를 가져옵니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, `post_id`
- 응답: 게시글 map
- 관련 경로: `groups/{groupId}/posts/{postId}`

```kotlin
suspend fun getGroupPost(groupId: String, postId: String): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_group_post")
        .call(hashMapOf("group_id" to groupId, "post_id" to postId))
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "post_id": "post-1"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "post_id": "post-1",
  "group_id": "group-alpha",
  "post_type": "note",
  "title": "게시글 제목",
  "content": "회의에서 논의한 내용을 공유합니다.",
  "status": "todo",
  "pinned": true,
  "author_uid": "student-kim",
  "author_name": "김가천",
  "attachments": [
    {
      "type": "link",
      "title": "링크 제목",
      "url": "https://github.com/losum/1234"
    }
  ]
}
```

게시글이 없으면 `NOT_FOUND`, 그룹 멤버가 아니면 `PERMISSION_DENIED` 오류로
응답합니다.

## update_group_post

작성자 또는 그룹 owner가 게시글을 수정합니다. `pinned`는 이 함수에서 다루지 않고
`pin_group_post`로 따로 변경해야 하며, `post`에는 수정할 필드만 담아서 보내면 됩니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `post_id`, `post`
- 응답: `post_id`

```kotlin
suspend fun updateGroupPost(groupId: String, postId: String): String {
    val payload = hashMapOf(
        "group_id" to groupId,
        "post_id" to postId,
        "post" to hashMapOf(
            "content" to "수정된 본문입니다.",
            "status" to "done"
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("update_group_post")
        .call(payload)
        .await()

    return (result.data as Map<*, *>)["post_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "post_id": "post-1",
  "post": {
    "content": "수정된 본문입니다.",
    "status": "done"
  }
}
```

응답 예시는 다음과 같습니다.

```json
{
  "post_id": "post-1"
}
```

## delete_group_post

작성자 또는 그룹 owner가 게시글을 삭제합니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `post_id`
- 응답: `post_id`

```kotlin
suspend fun deleteGroupPost(groupId: String, postId: String): String {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("delete_group_post")
        .call(hashMapOf("group_id" to groupId, "post_id" to postId))
        .await()

    return (result.data as Map<*, *>)["post_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "post_id": "post-1"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "post_id": "post-1"
}
```

## pin_group_post

그룹 owner가 게시글의 고정 상태를 변경합니다.

- 권한: 그룹 owner
- 요청: `group_id`, `post_id`, `pinned`
- 응답: `post_id`, `pinned`

```kotlin
suspend fun pinGroupPost(groupId: String, postId: String, pinned: Boolean): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("pin_group_post")
        .call(
            hashMapOf(
                "group_id" to groupId,
                "post_id" to postId,
                "pinned" to pinned
            )
        )
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "post_id": "post-1",
  "pinned": true
}
```

응답 예시는 다음과 같습니다.

```json
{
  "post_id": "post-1",
  "pinned": true
}
```

## create_group_schedule

그룹 캘린더에 일정을 추가합니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, `schedule`
- 응답: `schedule_id`
- 관련 경로: `groups/{groupId}/schedules/{scheduleId}`

```kotlin
suspend fun createGroupSchedule(groupId: String): String {
    val payload = hashMapOf(
        "group_id" to groupId,
        "schedule" to hashMapOf(
            "title" to "일정 제목",
            "description" to "회의를 진행합니다.",
            "starts_at" to "2026-04-15T21:00:00+09:00",
            "ends_at" to "2026-04-15T22:00:00+09:00",
            "all_day" to false,
            "location" to "온라인",
            "status" to "scheduled"
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("create_group_schedule")
        .call(payload)
        .await()

    return (result.data as Map<*, *>)["schedule_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "schedule": {
    "title": "일정 제목",
    "description": "회의를 진행합니다.",
    "starts_at": "2026-04-15T21:00:00+09:00",
    "ends_at": "2026-04-15T22:00:00+09:00",
    "all_day": false,
    "location": "온라인",
    "status": "scheduled"
  }
}
```

응답 예시는 다음과 같습니다.

```json
{
  "schedule_id": "<schedule_ref.id>"
}
```

## list_group_schedules

그룹 일정을 기간 단위로 가져옵니다. 캘린더 화면에서는 `start_date`, `end_date`로
보고 있는 달의 범위를 그대로 넘기면 됩니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, 선택 `start_date`, `end_date`, `status`
- 응답: `schedules`, `sections`
- 관련 경로: `groups/{groupId}/schedules`

```kotlin
suspend fun listGroupSchedules(groupId: String): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_group_schedules")
        .call(
            hashMapOf(
                "group_id" to groupId,
                "start_date" to "2026-04-01",
                "end_date" to "2026-04-30",
                "status" to "scheduled"
            )
        )
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "start_date": "2026-04-01",
  "end_date": "2026-04-30",
  "status": "scheduled"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "schedules": [
    {
      "schedule_id": "schedule-1",
      "group_id": "group-alpha",
      "title": "일정 제목",
      "description": "회의를 진행합니다.",
      "starts_at": "2026-04-15T21:00:00+09:00",
      "ends_at": "2026-04-15T22:00:00+09:00",
      "all_day": false,
      "location": "온라인",
      "status": "scheduled",
      "author_uid": "student-kim",
      "author_name": "김가천"
    }
  ],
  "sections": [
    {
      "date": "2026-04-15",
      "items": [
        {
          "schedule_id": "schedule-1",
          "group_id": "group-alpha",
          "title": "일정 제목",
          "description": "회의를 진행합니다.",
          "starts_at": "2026-04-15T21:00:00+09:00",
          "ends_at": "2026-04-15T22:00:00+09:00",
          "all_day": false,
          "location": "온라인",
          "status": "scheduled",
          "author_uid": "student-kim",
          "author_name": "김가천"
        }
      ]
    }
  ]
}
```

## get_group_schedule

일정 하나를 가져옵니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, `schedule_id`
- 응답: 일정 map

```kotlin
suspend fun getGroupSchedule(groupId: String, scheduleId: String): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_group_schedule")
        .call(hashMapOf("group_id" to groupId, "schedule_id" to scheduleId))
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "schedule_id": "schedule-1"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "schedule_id": "schedule-1",
  "group_id": "group-alpha",
  "title": "일정 제목",
  "description": "회의를 진행합니다.",
  "starts_at": "2026-04-15T21:00:00+09:00",
  "ends_at": "2026-04-15T22:00:00+09:00",
  "all_day": false,
  "location": "온라인",
  "status": "scheduled",
  "author_uid": "student-kim",
  "author_name": "김가천"
}
```

## update_group_schedule

작성자 또는 그룹 owner가 일정을 수정합니다. `schedule`에는 수정할 필드만 담아서
보내면 됩니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `schedule_id`, `schedule`
- 응답: `schedule_id`

```kotlin
suspend fun updateGroupSchedule(groupId: String, scheduleId: String): String {
    val payload = hashMapOf(
        "group_id" to groupId,
        "schedule_id" to scheduleId,
        "schedule" to hashMapOf(
            "starts_at" to "2026-04-16T13:00:00+09:00",
            "ends_at" to "2026-04-16T14:00:00+09:00"
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("update_group_schedule")
        .call(payload)
        .await()

    return (result.data as Map<*, *>)["schedule_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "schedule_id": "schedule-1",
  "schedule": {
    "starts_at": "2026-04-16T13:00:00+09:00",
    "ends_at": "2026-04-16T14:00:00+09:00"
  }
}
```

응답 예시는 다음과 같습니다.

```json
{
  "schedule_id": "schedule-1"
}
```

## delete_group_schedule

작성자 또는 그룹 owner가 일정을 삭제합니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `schedule_id`
- 응답: `schedule_id`

```kotlin
suspend fun deleteGroupSchedule(groupId: String, scheduleId: String): String {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("delete_group_schedule")
        .call(hashMapOf("group_id" to groupId, "schedule_id" to scheduleId))
        .await()

    return (result.data as Map<*, *>)["schedule_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "group_id": "group-alpha",
  "schedule_id": "schedule-1"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "schedule_id": "schedule-1"
}
```
