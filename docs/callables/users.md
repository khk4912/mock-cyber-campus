# 사용자 함수

이 문서에서는 사용자 프로필, 역할, 주간 여유 시간을 다루는 callable 함수들을 정리합니다.
모든 함수는 `asia-northeast3` region에 배포된 Firebase Functions에서 호출합니다.

## get_me

현재 로그인한 사용자의 프로필을 가져옵니다. `users/{uid}` 문서가 있으면 그 문서를
그대로 반환하고, 없으면 Firebase Auth token에서 얻은 기본 프로필을 돌려줍니다.

- 권한: 로그인 필요
- 요청: 빈 객체
- 응답: 사용자 프로필 map
- 관련 경로: `users/{uid}`

```kotlin
suspend fun getMe(): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_me")
        .call(emptyMap<String, Any>())
        .await()

    return result.data as Map<*, *>
}
```

응답 예시는 다음과 같습니다.

`users/{uid}` 문서가 아직 없는 경우에는 Auth token에서 만든 기본 프로필만 반환됩니다.

```json
{
  "uid": "student-kim",
  "email": "student@example.com",
  "display_name": "김학생",
  "role": "student"
}
```

이미 `users/{uid}` 문서가 있는 경우라면 Firestore 문서의 필드가 그대로 응답에 담깁니다.

로그인하지 않은 상태에서 호출하면 `UNAUTHENTICATED` 오류로 응답합니다.

## upsert_me

현재 로그인한 사용자의 프로필을 새로 만들거나 갱신합니다. Firebase Auth에서 얻은
`uid`, `email`, 기본 이름을 기본값으로 적용한 다음, 클라이언트가 보낸 profile 값을 덮어쓰는 방식으로 병합합니다.

- 권한: 로그인 필요
- 요청: `profile`
- 응답: 저장된 사용자 프로필 map
- 관련 경로: `users/{uid}`

허용되는 profile 필드는 다음과 같습니다.

- `display_name`
- `student_no`
- `notification_settings`

```kotlin
suspend fun upsertMe(): Map<*, *> {
    val payload = hashMapOf(
        "profile" to hashMapOf(
            "display_name" to "김학생",
            "student_no" to "20260001",
            "notification_settings" to hashMapOf(
                "enabled" to true,
                "disabled_types" to emptyList<String>(),
                "assignment_reminder_hours" to listOf(24, 3)
            )
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("upsert_me")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "profile": {
    "display_name": "김학생",
    "student_no": "20260001",
    "notification_settings": {
      "enabled": true,
      "disabled_types": [],
      "assignment_reminder_hours": [24, 3]
    }
  }
}
```

응답 예시는 다음과 같습니다.

저장이 끝나면 서버가 `users/{uid}` 문서를 다시 읽어 `to_dict()` 결과로 응답합니다.
새로 만든 경우에는 `created_at`이 포함되고, 생성/갱신 모두 `updated_at`이 같이 들어갑니다.

```json
{
  "uid": "student-kim",
  "email": "student@example.com",
  "display_name": "김학생",
  "student_no": "20260001",
  "role": "student",
  "created_at": "<server timestamp>",
  "updated_at": "<server timestamp>",
  "notification_settings": {
    "enabled": true,
    "disabled_types": [],
    "assignment_reminder_hours": [24, 3]
  }
}
```

`profile`이 객체가 아니거나 허용되지 않은 필드가 섞여 있으면 `INVALID_ARGUMENT`
오류로 응답합니다.

## get_free_time

현재 로그인한 사용자의 주간 여유 시간을 가져옵니다. 서버는 저장된 `free_time_masks`와
함께, Android에서 그대로 쓰기 쉽도록 풀어 놓은 `slots` 배열을 같이 돌려줍니다.

- 권한: 로그인 필요
- 요청: 빈 객체
- 응답: `free_time_masks`, `slots`
- 관련 경로: `users/{uid}`

```kotlin
suspend fun getFreeTime(): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("get_free_time")
        .call(emptyMap<String, Any>())
        .await()

    return result.data as Map<*, *>
}
```

응답 예시는 다음과 같습니다. 저장된 여유 시간이 아직 없을 때의 응답입니다.

```json
{
  "free_time_masks": [0, 0, 0, 0, 0, 0],
  "slots": []
}
```

`day`는 `0..6`, `hour`는 `0..23` 범위이며, 한 slot은 1시간 단위입니다.

## set_free_time

현재 로그인한 사용자의 주간 여유 시간을 저장합니다. Android에서는 사람이 읽기 쉬운
`slots` 배열만 보내면 되고, Firestore에는 6개의 정수로 구성된 `free_time_masks` 형태로
저장됩니다.

- 권한: 로그인 필요
- 요청: `slots`
- 응답: `free_time_masks`, `slots`
- 관련 경로: `users/{uid}`

```kotlin
suspend fun setFreeTime(): Map<*, *> {
    val payload = hashMapOf(
        "slots" to listOf(
            hashMapOf("day" to 0, "hour" to 9),
            hashMapOf("day" to 0, "hour" to 10),
            hashMapOf("day" to 2, "hour" to 14)
        )
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("set_free_time")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "slots": [
    { "day": 0, "hour": 9 },
    { "day": 0, "hour": 10 },
    { "day": 2, "hour": 14 }
  ]
}
```

응답 예시는 다음과 같습니다.

```json
{
  "free_time_masks": [1536, 1073741824, 0, 0, 0, 0],
  "slots": [
    { "day": 0, "hour": 9 },
    { "day": 0, "hour": 10 },
    { "day": 2, "hour": 14 }
  ]
}
```

`slots`가 배열이 아니거나 `day`, `hour` 범위를 벗어나면 `INVALID_ARGUMENT` 오류로
응답합니다.

## set_user_role

특정 사용자의 Firebase Auth custom claim `role`과 Firestore 프로필의 `role`을 함께
설정합니다. 일반 Android 사용자 화면에서 쓰는 함수가 아니라 관리자용 기능입니다.

- 권한: admin role 필요
- 요청: `target_uid`, `role`
- 응답: `target_uid`, `role`
- 관련 경로: `users/{target_uid}`

`role`은 다음 값 중 하나여야 합니다.

- `student`
- `professor`
- `admin`

```kotlin
suspend fun setUserRole(targetUid: String, role: String): Map<*, *> {
    val payload = hashMapOf(
        "target_uid" to targetUid,
        "role" to role
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("set_user_role")
        .call(payload)
        .await()

    return result.data as Map<*, *>
}
```

요청 예시는 다음과 같습니다.

```json
{
  "target_uid": "student-kim",
  "role": "professor"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "target_uid": "student-kim",
  "role": "professor"
}
```

호출자가 admin이 아니면 `PERMISSION_DENIED`, 대상 사용자가 Firebase Auth에 없으면
`NOT_FOUND` 오류로 응답합니다. custom claim 변경 사항은 토큰이 갱신된 뒤에야
클라이언트에 반영됩니다.
