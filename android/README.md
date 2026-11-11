# DEADPOOL HOME — Premium Minimal Android TV Launcher
A dedicated single-homescreen Android TV launcher engineered in Kotlin, featuring Deadpool's signature deep black AMOLED and crimson identity.

## Architecture & Intent Filters
This launcher registers the standard Android Home and Android TV Leanback filters:
\`\`\`xml
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.HOME" />
    <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
</intent-filter>
\`\`\`

## System Requirements
- Android 9.0 (API level 28) or newer (up to Android 14+ / Google TV)
- Leanback software feature declared
- Hardware touchscreen marked not required (\`android:required="false"\`)
- D-Pad TV Remote optimization

## Building the Release APK
\`\`\`bash
chmod +x gradlew
./gradlew assembleRelease
\`\`\`

The generated APK will be at:
\`app/build/outputs/apk/release/app-release.apk\`

## Installing on Android TV via ADB
\`\`\`bash
adb connect <TV_IP_ADDRESS>:5555
adb install -r app/build/outputs/apk/release/app-release.apk
\`\`\`
Press the HOME button on your TV remote and choose **DEADPOOL HOME** as **Always**.
