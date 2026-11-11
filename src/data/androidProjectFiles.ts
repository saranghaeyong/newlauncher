export interface AndroidFileDefinition {
  title: string;
  path: string;
  content: string;
}

export const ANDROID_STUDIO_PROJECT_FILES: Record<string, AndroidFileDefinition> = {
  manifest: {
    title: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.deadpool.home.launcher">

    <!-- Android TV Leanback Hardware Features -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />

    <!-- Query launchable apps on Android 11+ (API 30+) -->
    <queries>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        </intent>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>

    <application
        android:allowBackup="true"
        android:banner="@drawable/deadpool_banner"
        android:icon="@drawable/ic_deadpool_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.DeadpoolHome.NoActionBar"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:banner="@drawable/deadpool_banner"
            android:configChanges="keyboard|keyboardHidden|navigation|orientation|screenLayout|screenSize|smallestScreenSize"
            android:exported="true"
            android:icon="@drawable/ic_deadpool_launcher"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:stateNotNeeded="true"
            android:screenOrientation="landscape"
            android:theme="@style/Theme.DeadpoolHome.Wallpaper">

            <!-- Primary Home Launcher Intent Filter -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>

            <!-- Android TV Leanback Launcher Intent Filter -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>`,
  },

  mainActivity: {
    title: 'MainActivity.kt',
    path: 'app/src/main/java/com/deadpool/home/launcher/MainActivity.kt',
    content: `package com.deadpool.home.launcher

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.os.Bundle
import android.provider.Settings
import android.view.KeyEvent
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.deadpool.home.launcher.adapter.AppBubbleAdapter
import com.deadpool.home.launcher.model.TvAppItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * DEADPOOL HOME - Premium Minimal Android TV Launcher
 * Single Homescreen Architecture
 */
class MainActivity : AppCompatActivity() {

    private lateinit var clockView: TextView
    private lateinit var dateView: TextView
    private lateinit var appDockRecycler: RecyclerView
    private lateinit var appAdapter: AppBubbleAdapter
    private lateinit var wifiShortcut: View
    private lateinit var settingsShortcut: View
    private lateinit var inputsShortcut: View

    private val timeTickReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            updateClockAndDate()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupDockRecyclerView()
        updateClockAndDate()
        loadInstalledApplications()
    }

    override fun onStart() {
        super.onStart()
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_TIME_TICK)
            addAction(Intent.ACTION_TIME_CHANGED)
            addAction(Intent.ACTION_TIMEZONE_CHANGED)
        }
        registerReceiver(timeTickReceiver, filter)
    }

    override fun onStop() {
        super.onStop()
        unregisterReceiver(timeTickReceiver)
    }

    private fun initViews() {
        clockView = findViewById(R.id.tv_clock)
        dateView = findViewById(R.id.tv_date)
        appDockRecycler = findViewById(R.id.rv_app_dock)
        wifiShortcut = findViewById(R.id.btn_wifi_shortcut)
        settingsShortcut = findViewById(R.id.btn_settings_shortcut)
        inputsShortcut = findViewById(R.id.btn_inputs_shortcut)

        wifiShortcut.setOnClickListener {
            startActivity(Intent(Settings.ACTION_WIFI_SETTINGS))
        }

        settingsShortcut.setOnClickListener {
            startActivity(Intent(Settings.ACTION_SETTINGS))
        }

        inputsShortcut.setOnClickListener {
            try {
                startActivity(Intent("android.media.tv.action.VIEW_INPUTS"))
            } catch (e: Exception) {
                Toast.makeText(this, "Inputs: TV Tuner / HDMI Active", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupDockRecyclerView() {
        appAdapter = AppBubbleAdapter { selectedApp ->
            launchApplication(selectedApp)
        }
        appDockRecycler.apply {
            layoutManager = LinearLayoutManager(this@MainActivity, LinearLayoutManager.HORIZONTAL, false)
            adapter = appAdapter
            setHasFixedSize(true)
        }
    }

    private fun updateClockAndDate() {
        val now = Date()
        val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
        val dateFormat = SimpleDateFormat("EEEE · MMM d", Locale.getDefault())

        clockView.text = timeFormat.format(now)
        dateView.text = dateFormat.format(now).uppercase(Locale.getDefault())
    }

    /**
     * Query all launchable applications using Leanback and default launcher categories
     */
    private fun loadInstalledApplications() {
        lifecycleScope.launch(Dispatchers.IO) {
            val pm = packageManager
            val apps = mutableListOf<TvAppItem>()

            // 1. Discover Leanback TV Apps
            val leanbackIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER)
            }
            val leanbackActivities: List<ResolveInfo> = pm.queryIntentActivities(leanbackIntent, 0)

            for (resolveInfo in leanbackActivities) {
                if (resolveInfo.activityInfo.packageName != packageName) {
                    apps.add(
                        TvAppItem(
                            packageName = resolveInfo.activityInfo.packageName,
                            activityName = resolveInfo.activityInfo.name,
                            label = resolveInfo.loadLabel(pm).toString(),
                            icon = resolveInfo.loadIcon(pm)
                        )
                    )
                }
            }

            // 2. Discover standard apps if not already present
            val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val mainActivities: List<ResolveInfo> = pm.queryIntentActivities(mainIntent, 0)
            for (resolveInfo in mainActivities) {
                if (resolveInfo.activityInfo.packageName != packageName &&
                    apps.none { it.packageName == resolveInfo.activityInfo.packageName }
                ) {
                    apps.add(
                        TvAppItem(
                            packageName = resolveInfo.activityInfo.packageName,
                            activityName = resolveInfo.activityInfo.name,
                            label = resolveInfo.loadLabel(pm).toString(),
                            icon = resolveInfo.loadIcon(pm)
                        )
                    )
                }
            }

            withContext(Dispatchers.Main) {
                appAdapter.submitList(apps)
            }
        }
    }

    private fun launchApplication(app: TvAppItem) {
        val launchIntent = packageManager.getLeanbackLaunchIntentForPackage(app.packageName)
            ?: packageManager.getLaunchIntentForPackage(app.packageName)

        if (launchIntent != null) {
            startActivity(launchIntent)
        } else {
            Toast.makeText(this, "Cannot launch \${app.label}", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_UP -> {
                // Focus system status shortcuts when pressing UP from dock
                if (appDockRecycler.hasFocus()) {
                    settingsShortcut.requestFocus()
                    true
                } else {
                    super.onKeyDown(keyCode, event)
                }
            }
            KeyEvent.KEYCODE_DPAD_DOWN -> {
                // Return to dock from top bar
                if (!appDockRecycler.hasFocus()) {
                    appDockRecycler.requestFocus()
                    true
                } else {
                    super.onKeyDown(keyCode, event)
                }
            }
            KeyEvent.KEYCODE_BACK -> {
                // Launcher is the root homescreen; keep user on the dock
                if (!appDockRecycler.hasFocus()) {
                    appDockRecycler.requestFocus()
                    true
                } else {
                    true
                }
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }
}`,
  },

  appBubbleAdapter: {
    title: 'AppBubbleAdapter.kt',
    path: 'app/src/main/java/com/deadpool/home/launcher/adapter/AppBubbleAdapter.kt',
    content: `package com.deadpool.home.launcher.adapter

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.deadpool.home.launcher.R
import com.deadpool.home.launcher.model.TvAppItem

class AppBubbleAdapter(
    private val onAppClick: (TvAppItem) -> Unit
) : RecyclerView.Adapter<AppBubbleAdapter.BubbleViewHolder>() {

    private val items = mutableListOf<TvAppItem>()

    fun submitList(newItems: List<TvAppItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BubbleViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_bubble_app, parent, false)
        return BubbleViewHolder(view, onAppClick)
    }

    override fun onBindViewHolder(holder: BubbleViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    class BubbleViewHolder(
        itemView: View,
        private val onAppClick: (TvAppItem) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {

        private val iconView: ImageView = itemView.findViewById(R.id.iv_app_icon)
        private val titleView: TextView = itemView.findViewById(R.id.tv_app_title)
        private val bubbleContainer: View = itemView.findViewById(R.id.fl_bubble_container)

        fun bind(app: TvAppItem) {
            iconView.setImageDrawable(app.icon)
            titleView.text = app.label

            itemView.setOnClickListener {
                onAppClick(app)
            }

            // TV Remote Focus animation: smooth scale up & floating translation
            itemView.setOnFocusChangeListener { _, hasFocus ->
                if (hasFocus) {
                    val scaleX = ObjectAnimator.ofFloat(bubbleContainer, "scaleX", 1.0f, 1.22f)
                    val scaleY = ObjectAnimator.ofFloat(bubbleContainer, "scaleY", 1.0f, 1.22f)
                    val transY = ObjectAnimator.ofFloat(bubbleContainer, "translationY", 0f, -14f)
                    titleView.visibility = View.VISIBLE

                    AnimatorSet().apply {
                        playTogether(scaleX, scaleY, transY)
                        duration = 180
                        interpolator = OvershootInterpolator(1.2f)
                        start()
                    }
                } else {
                    val scaleX = ObjectAnimator.ofFloat(bubbleContainer, "scaleX", 1.22f, 1.0f)
                    val scaleY = ObjectAnimator.ofFloat(bubbleContainer, "scaleY", 1.22f, 1.0f)
                    val transY = ObjectAnimator.ofFloat(bubbleContainer, "translationY", -14f, 0f)
                    titleView.visibility = View.INVISIBLE

                    AnimatorSet().apply {
                        playTogether(scaleX, scaleY, transY)
                        duration = 150
                        start()
                    }
                }
            }
        }
    }
}`,
  },

  tvAppModel: {
    title: 'TvAppItem.kt',
    path: 'app/src/main/java/com/deadpool/home/launcher/model/TvAppItem.kt',
    content: `package com.deadpool.home.launcher.model

import android.graphics.drawable.Drawable

data class TvAppItem(
    val packageName: String,
    val activityName: String,
    val label: String,
    val icon: Drawable
)`,
  },

  buildGradleApp: {
    title: 'build.gradle.kts (app)',
    path: 'app/build.gradle.kts',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.deadpool.home.launcher"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.deadpool.home.launcher"
        minSdk = 28 // Android 9 (Pie)
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.leanback:leanback:1.0.0")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}`,
  },

  colorsXml: {
    title: 'colors.xml',
    path: 'app/src/main/res/values/colors.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Deadpool Palette -->
    <color name="amoled_black">#050505</color>
    <color name="deadpool_red">#D00F1F</color>
    <color name="deadpool_crimson">#990000</color>
    <color name="deadpool_dark_crimson">#4D0008</color>
    <color name="deadpool_focus_glow">#B3D00F1F</color>
    <color name="glass_bubble_bg">#33FFFFFF</color>
    <color name="glass_bubble_stroke">#1FFFFFFF</color>
    <color name="text_primary">#F5F5F7</color>
    <color name="text_secondary">#8E8E93</color>
</resources>`,
  },

  stylesXml: {
    title: 'styles.xml',
    path: 'app/src/main/res/values/styles.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.DeadpoolHome.NoActionBar" parent="Theme.AppCompat.NoActionBar">
        <item name="android:windowBackground">@color/amoled_black</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:colorBackground">@color/amoled_black</item>
    </style>

    <style name="Theme.DeadpoolHome.Wallpaper" parent="Theme.DeadpoolHome.NoActionBar">
        <item name="android:windowShowWallpaper">false</item>
    </style>
</resources>`,
  },

  layoutMain: {
    title: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/amoled_black"
    android:padding="48dp">

    <!-- Top Left: Digital Clock & Date -->
    <LinearLayout
        android:id="@+id/ll_clock_container"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentStart="true"
        android:layout_alignParentTop="true"
        android:orientation="vertical">

        <TextView
            android:id="@+id/tv_clock"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:fontFamily="sans-serif-thin"
            android:text="21:45"
            android:textColor="@color/text_primary"
            android:textSize="54sp" />

        <TextView
            android:id="@+id/tv_date"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:fontFamily="sans-serif-medium"
            android:letterSpacing="0.08"
            android:text="TUESDAY · NOV 11"
            android:textColor="@color/deadpool_red"
            android:textSize="12sp" />
    </LinearLayout>

    <!-- Top Right: System Status & Shortcuts -->
    <LinearLayout
        android:id="@+id/ll_system_status"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentEnd="true"
        android:layout_alignParentTop="true"
        android:background="@drawable/bg_status_bar_pill"
        android:orientation="horizontal"
        android:padding="8dp">

        <ImageButton
            android:id="@+id/btn_wifi_shortcut"
            android:layout_width="36dp"
            android:layout_height="36dp"
            android:background="?selectableItemBackgroundBorderless"
            android:contentDescription="Wi-Fi"
            android:focusable="true"
            android:src="@drawable/ic_wifi" />

        <ImageButton
            android:id="@+id/btn_inputs_shortcut"
            android:layout_width="36dp"
            android:layout_height="36dp"
            android:layout_marginStart="12dp"
            android:background="?selectableItemBackgroundBorderless"
            android:contentDescription="Inputs"
            android:focusable="true"
            android:src="@drawable/ic_tv_inputs" />

        <ImageButton
            android:id="@+id/btn_settings_shortcut"
            android:layout_width="36dp"
            android:layout_height="36dp"
            android:layout_marginStart="12dp"
            android:background="?selectableItemBackgroundBorderless"
            android:contentDescription="Settings"
            android:focusable="true"
            android:src="@drawable/ic_settings" />
    </LinearLayout>

    <!-- Center: Floating Circular App Bubble Dock -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rv_app_dock"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true"
        android:clipToPadding="false"
        android:focusable="true"
        android:orientation="horizontal"
        android:paddingStart="40dp"
        android:paddingEnd="40dp" />

</RelativeLayout>`,
  },

  layoutItemBubble: {
    title: 'item_bubble_app.xml',
    path: 'app/src/main/res/layout/item_bubble_app.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:focusable="true"
    android:gravity="center_horizontal"
    android:orientation="vertical"
    android:padding="16dp">

    <!-- Circular Bubble with Glass Highlight and Focus Glow -->
    <FrameLayout
        android:id="@+id/fl_bubble_container"
        android:layout_width="96dp"
        android:layout_height="96dp"
        android:background="@drawable/bg_glass_bubble"
        android:clipToOutline="true">

        <ImageView
            android:id="@+id/iv_app_icon"
            android:layout_width="52dp"
            android:layout_height="52dp"
            android:layout_gravity="center"
            android:contentDescription="App Icon" />
    </FrameLayout>

    <!-- App Name Label (Appears upon focus) -->
    <TextView
        android:id="@+id/tv_app_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:fontFamily="sans-serif-medium"
        android:textColor="@color/text_primary"
        android:textSize="13sp"
        android:visibility="invisible" />

</LinearLayout>`,
  },
};
