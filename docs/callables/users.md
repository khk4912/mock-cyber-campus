# 사용자 함수

이 문서는 사용자 프로필, 역할, 주간 여유 시간과 관련된 callable 함수를 설명합니다.
모든 함수는 `asia-northeast3` region의 Firebase Functions에서 호출합니다.

## get_me

현재 로그인한 사용자의 프로필을 가져옵니다. `users/{uid}` 문서가 있으면 해당 문서를
반환하고, 없으면 Firebase Auth token에서 읽은 기본 프로필을 반환합니다.

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

응답입니다.

`users/{uid}` 문서가 없는 경우 함수는 Auth token 기반 기본 프로필만 반환합니다.

```json
{
  "uid": "student-kim",
  "email": "student@example.com",
  "display_name": "김학생",
  "role": "student"
}
```

`users/{uid}` 문서가 이미 있으면 Firestore 문서의 필드가 그대로 반환됩니다.

로그인하지 않은 상태에서 호출하면 `UNAUTHENTICATED` 오류가 발생합니다.

## upsert_me

현재 로그인한 사용자의 프로필을 생성하거나 갱신합니다. Firebase Auth에서 얻은
`uid`, `email`, 기본 이름을 함께 반영하고, 클라이언트가 보낸 profile 값을 병합합니다.

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

요청입니다.

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

응답입니다.

함수는 저장 직후 `users/{uid}` 문서를 다시 읽어서 `to_dict()` 결과를 반환합니다.
새 문서를 만든 경우 `created_at`이 포함되고, 생성/갱신 모두 `updated_at`이 포함됩니다.

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

`profile`이 객체가 아니거나 허용되지 않은 필드가 있으면 `INVALID_ARGUMENT` 오류가
발생합니다.

## get_free_time

현재 로그인한 사용자의 주간 여유 시간을 가져옵니다. 서버는 저장된 `free_time_masks`를
함께 반환하고, Android에서 바로 쓰기 쉬운 `slots` 배열도 함께 반환합니다.

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

응답입니다.

저장된 여유 시간이 없는 경우입니다.

```json
{
  "free_time_masks": [0, 0, 0, 0, 0, 0],
  "slots": []
}
```

`day`는 `0..6`, `hour`는 `0..23` 범위입니다. 한 slot은 1시간 단위입니다.

## set_free_time

현재 로그인한 사용자의 주간 여유 시간을 저장합니다. Android는 사람이 이해하기 쉬운
`slots` 배열을 보내고, 서버는 Firestore에 6개 정수로 구성된 `free_time_masks`를 저장합니다.

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

요청입니다.

```json
{
  "slots": [
    { "day": 0, "hour": 9 },
    { "day": 0, "hour": 10 },
    { "day": 2, "hour": 14 }
  ]
}
```

응답입니다.

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

`slots`가 배열이 아니거나 `day`, `hour` 범위가 맞지 않으면 `INVALID_ARGUMENT`
오류가 발생합니다.

## set_user_role

특정 사용자의 Firebase Auth custom claim `role`과 Firestore 프로필의 `role`을 설정합니다.
일반 Android 사용자 화면에서 호출하는 함수가 아니라 관리자용 기능입니다.

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

요청입니다.

```json
{
  "target_uid": "student-kim",
  "role": "professor"
}
```

응답입니다.

```json
{
  "target_uid": "student-kim",
  "role": "professor"
}
```

호출자가 admin이 아니면 `PERMISSION_DENIED`, 대상 사용자가 Firebase Auth에 없으면
`NOT_FOUND` 오류가 발생합니다. custom claim은 토큰 갱신 후 클라이언트에 반영됩니다.
