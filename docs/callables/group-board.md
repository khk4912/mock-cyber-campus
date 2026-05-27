# 그룹 게시판과 일정 함수

이 문서는 그룹 화면의 게시판, 게시글 상세, 캘린더, 일정 추가 화면에서 사용하는 callable
함수를 설명합니다. 모든 함수는 로그인한 사용자가 해당 그룹의 활성 멤버일 때만 동작합니다.

## create_group_post

그룹 게시글을 생성합니다. 게시글은 일반 글, 파일, 링크, 투표, 할 일을 같은 모델로
저장합니다.

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
            "pinned" to true,
            "attachments" to listOf(
                hashMapOf(
                    "type" to "link",
                    "title" to "링크 제목",
                    "url" to "https://github.com/losum/1234"
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

## list_group_posts

그룹 게시글 목록을 가져옵니다. 서버는 전체 목록, 고정글 목록, 날짜별 section을 함께
반환합니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, 선택 `post_type`, `status`, `query`
- 응답: `posts`, `pinned`, `sections`
- 관련 경로: `groups/{groupId}/posts`

```kotlin
suspend fun listGroupPosts(groupId: String): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("list_group_posts")
        .call(hashMapOf("group_id" to groupId))
        .await()

    return result.data as Map<*, *>
}
```

## get_group_post

게시글 상세 화면에 필요한 단일 게시글을 가져옵니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, `post_id`
- 응답: 게시글 map
- 관련 경로: `groups/{groupId}/posts/{postId}`

## update_group_post

작성자 또는 그룹 owner가 게시글을 수정합니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `post_id`, `post`
- 응답: `post_id`

## delete_group_post

작성자 또는 그룹 owner가 게시글을 삭제합니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `post_id`
- 응답: `post_id`

## pin_group_post

그룹 owner가 게시글의 고정 상태를 변경합니다.

- 권한: 그룹 owner
- 요청: `group_id`, `post_id`, `pinned`
- 응답: `post_id`, `pinned`

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
            "starts_at" to "2026-04-15T21:00:00+09:00",
            "ends_at" to "2026-04-17T22:00:00+09:00",
            "all_day" to false
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

## list_group_schedules

그룹 일정을 기간별로 가져옵니다. 캘린더 화면은 `start_date`, `end_date`로 월 범위를
보내면 됩니다.

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
                "end_date" to "2026-04-30"
            )
        )
        .await()

    return result.data as Map<*, *>
}
```

## get_group_schedule

일정 하나를 가져옵니다.

- 권한: 그룹 멤버 필요
- 요청: `group_id`, `schedule_id`
- 응답: 일정 map

## update_group_schedule

작성자 또는 그룹 owner가 일정을 수정합니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `schedule_id`, `schedule`
- 응답: `schedule_id`

## delete_group_schedule

작성자 또는 그룹 owner가 일정을 삭제합니다.

- 권한: 작성자 또는 그룹 owner
- 요청: `group_id`, `schedule_id`
- 응답: `schedule_id`
