# 알림 함수

이 문서에서는 Android FCM registration token을 저장하고 삭제하는 callable 함수를
정리합니다. 서버는 저장된 token을 이용해 과제, 공지, VOD, 그룹 관련 알림을 보냅니다.

## register_fcm_token

현재 로그인한 사용자의 FCM registration token을 저장합니다. token 값의 SHA-256 해시를
문서 ID로 쓰기 때문에, 같은 token을 여러 번 등록해도 항상 같은 문서가 갱신될 뿐입니다.

- 권한: 로그인 필요
- 요청: `token`, `platform`
- 응답: `token_id`
- 관련 경로: `users/{uid}/fcmTokens/{tokenId}`

`platform`을 생략하면 `android`로 처리되며, 지금은 `android` 값만 허용합니다.

```kotlin
suspend fun registerFcmToken(): String {
    val token = FirebaseMessaging.getInstance().token.await()
    val payload = hashMapOf(
        "token" to token,
        "platform" to "android"
    )

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("register_fcm_token")
        .call(payload)
        .await()

    val data = result.data as Map<*, *>
    return data["token_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "token": "fcm-registration-token",
  "platform": "android"
}
```

응답 예시는 다음과 같습니다.

```json
{
  "token_id": "<sha256(token)>"
}
```

`token`이 비어 있거나 지원하지 않는 platform 값을 보내면 `INVALID_ARGUMENT` 오류로
응답합니다.

## delete_fcm_token

현재 로그인한 사용자의 FCM registration token 문서를 삭제합니다. `token_id`를 바로
보내도 되고, 원본 `token`을 보내면 서버가 같은 SHA-256 방식으로 `token_id`를 계산해
처리합니다.

- 권한: 로그인 필요
- 요청: `token_id` 또는 `token`
- 응답: `token_id`
- 관련 경로: `users/{uid}/fcmTokens/{tokenId}`

`token_id`를 이미 알고 있는 경우의 호출 예시입니다.

```kotlin
suspend fun deleteFcmTokenById(tokenId: String): String {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("delete_fcm_token")
        .call(hashMapOf("token_id" to tokenId))
        .await()

    val data = result.data as Map<*, *>
    return data["token_id"] as String
}
```

원본 token 값만 가지고 있는 경우의 호출 예시입니다.

```kotlin
suspend fun deleteCurrentFcmToken(): String {
    val token = FirebaseMessaging.getInstance().token.await()

    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable("delete_fcm_token")
        .call(hashMapOf("token" to token))
        .await()

    val data = result.data as Map<*, *>
    return data["token_id"] as String
}
```

요청 예시는 다음과 같습니다.

```json
{
  "token_id": "d329f4..."
}
```

응답 예시는 다음과 같습니다.

```json
{
  "token_id": "d329f4..."
}
```

`token_id`와 `token` 중 어느 쪽도 주지 않으면 `INVALID_ARGUMENT` 오류로 응답합니다.
