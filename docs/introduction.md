# Kotlin에서 시작하기

이 문서에서는 Android Kotlin 앱이 Firebase AppServer와 통신하는 기본 흐름을 설명합니다.
Android 앱은 Firebase 클라이언트 SDK를 사용하고, Firebase Functions callable 함수는
로그인된 사용자의 Firebase Auth 정보를 자동으로 함께 전달합니다.

## 프로젝트 정보

현재 백엔드는 다음 Firebase 프로젝트 위에서 동작합니다.

- Firebase project ID: `appserver-e547b`
- Android package: `com.kosame.moa`
- Cloud Functions region: `asia-northeast3`
- Firestore database: `(default)`

Android 앱에는 `google-services.json`을 앱 모듈에 추가해야 합니다. Firebase Console에서
`com.kosame.moa` Android 앱 설정을 확인한 뒤 파일을 내려받으면 됩니다.

## Gradle 설정

Firebase Android SDK는 BoM으로 버전을 한꺼번에 맞추는 방식을 권장합니다. Firebase Android
BoM `34.0.0`부터는 별도의 `-ktx` 모듈이 BoM에서 제외되었으므로, Kotlin 앱에서도
`firebase-auth`, `firebase-firestore`, `firebase-functions`, `firebase-messaging`
같은 메인 모듈을 그대로 사용하면 됩니다.

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:34.13.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-functions")
    implementation("com.google.firebase:firebase-messaging")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.10.2")
}
```

위 예시의 BoM 버전은 2026년 5월 기준입니다. 실제 Android 앱에서는 팀에서 검증한
BoM 버전을 사용하면 됩니다.

## 공통 imports

이 문서의 예제는 coroutine에서 Firebase `Task`를 `await()`로 받는 방식으로 작성되어 있습니다.

```kotlin
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
```

## 로그인 먼저 처리하기

대부분의 callable 함수는 Firebase Auth 로그인을 전제로 합니다. Google Sign-In,
email/password, 또는 팀에서 정한 로그인 방식으로 Firebase Auth 세션을 먼저 만든 뒤
함수를 호출하세요.

```kotlin
val currentUser = FirebaseAuth.getInstance().currentUser
requireNotNull(currentUser) { "Firebase Auth 로그인 후 호출해야 합니다." }
```

Callable 함수는 로그인된 사용자의 ID token을 자동으로 실어 보냅니다. 그래서 Kotlin
코드에서 Authorization header를 직접 붙일 필요가 없습니다.

## Functions 클라이언트 만들기

백엔드는 `asia-northeast3` region에 배포되어 있습니다. Android에서도 같은 region을
명시해야 요청이 올바른 callable 함수로 전달됩니다.

```kotlin
val functions = FirebaseFunctions.getInstance("asia-northeast3")
```

공통 호출 helper를 하나 만들어 두면 각 화면 코드가 훨씬 간결해집니다.

```kotlin
suspend fun callFunction(
    name: String,
    data: Map<String, Any?> = emptyMap()
): Map<*, *> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable(name)
        .call(data)
        .await()

    return result.data as Map<*, *>
}
```

목록을 반환하는 함수는 `List<*>`로 받으면 됩니다.

```kotlin
suspend fun callListFunction(
    name: String,
    data: Map<String, Any?> = emptyMap()
): List<*> {
    val result = FirebaseFunctions
        .getInstance("asia-northeast3")
        .getHttpsCallable(name)
        .call(data)
        .await()

    return result.data as List<*>
}
```

실제 앱 코드에서는 `Map<*, *>` 값을 화면에서 바로 사용하기보다 DTO로 변환해서 쓰는 편을
권장합니다.

## Firestore에서 직접 읽기

일부 데이터는 callable 함수를 거치지 않고 Firestore SDK로 바로 읽을 수도 있습니다.
Firestore Security Rules가 로그인 여부와 강의/그룹 멤버십을 기준으로 접근을 제한합니다.

```kotlin
val db = FirebaseFirestore.getInstance()
val uid = FirebaseAuth.getInstance().currentUser?.uid
    ?: error("로그인이 필요합니다.")

val myCourseDocs = db.collection("users")
    .document(uid)
    .collection("courses")
    .get()
    .await()
```

서버가 관리하는 강의 콘텐츠는 Android에서 직접 쓰지 않습니다. 앱은 본인이 멤버로 속한
강의의 과제, 공지, VOD를 읽기만 할 수 있습니다.

## Android에서 호출하지 않는 endpoint

`campus`와 `web` HTTP endpoint는 신뢰된 서버나 mock cybercampus 쪽에서 사용하는
surface입니다. 이 endpoint들은 `X-Campus-Secret` 같은 서버용 비밀 값을 요구하기 때문에
Android 앱에 포함시키면 안 됩니다. Android 앱에서는 이 문서에 나온 callable 함수와
Firestore SDK만 사용합니다.

## 에러 처리

Callable 함수 호출이 실패하면 Android에서는 `FirebaseFunctionsException`으로 받게 됩니다.
권한 문제와 입력값 오류는 코드별로 화면에 맞게 분기해 주세요.

```kotlin
import com.google.firebase.functions.FirebaseFunctionsException

try {
    val profile = callFunction("get_me")
} catch (error: FirebaseFunctionsException) {
    when (error.code) {
        FirebaseFunctionsException.Code.UNAUTHENTICATED -> {
            // 로그인 화면으로 이동
        }
        FirebaseFunctionsException.Code.PERMISSION_DENIED -> {
            // 권한이 없다는 안내를 표시
        }
        FirebaseFunctionsException.Code.INVALID_ARGUMENT -> {
            // 입력값을 다시 확인
        }
        else -> {
            // 서버 오류 또는 네트워크 오류 처리
        }
    }
}
```

## 참고 자료

- [Firebase Android 프로젝트 설정](https://firebase.google.com/docs/android/setup)
- [Firebase KTX API main module 이전 안내](https://firebase.google.com/docs/android/kotlin-migration)
- [Firebase BoM 버전 목록](https://mvnrepository.com/artifact/com.google.firebase/firebase-bom/versions)
