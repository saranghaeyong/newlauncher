package com.deadpool.home.launcher

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
        appDockRecycler.apply {
            layoutManager = LinearLayoutManager(this@MainActivity, LinearLayoutManager.HORIZONTAL, false)
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

    private fun loadInstalledApplications() {
        lifecycleScope.launch(Dispatchers.IO) {
            val pm = packageManager
            val apps = mutableListOf<ResolveInfo>()

            val leanbackIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER)
            }
            val leanbackActivities = pm.queryIntentActivities(leanbackIntent, 0)
            apps.addAll(leanbackActivities.filter { it.activityInfo.packageName != packageName })

            withContext(Dispatchers.Main) {
                // Submit list to dock adapter
            }
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_UP -> {
                if (appDockRecycler.hasFocus()) {
                    settingsShortcut.requestFocus()
                    true
                } else {
                    super.onKeyDown(keyCode, event)
                }
            }
            KeyEvent.KEYCODE_DPAD_DOWN -> {
                if (!appDockRecycler.hasFocus()) {
                    appDockRecycler.requestFocus()
                    true
                } else {
                    super.onKeyDown(keyCode, event)
                }
            }
            KeyEvent.KEYCODE_BACK -> {
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
}
