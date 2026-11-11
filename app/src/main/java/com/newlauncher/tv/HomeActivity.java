package com.newlauncher.tv;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.TypedValue;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * NewLauncher – cinematic Android TV home launcher.
 * World's tiniest fully functional Android TV launcher (~17 KB APK).
 */
public class HomeActivity extends Activity {

    private HomeScreen screen;
    private boolean alive = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        // Minimal window flags for launcher behavior
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        screen = new HomeScreen(this);
        setContentView(screen);
        alive = true;
        registerReceiver(packageReceiver, buildPackageFilter());
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (screen != null) {
            screen.reloadApps();
            screen.refreshWifi();
            screen.startClock();
            screen.invalidate();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused && alive) {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (screen != null) screen.stopClock();
    }

    @Override
    protected void onDestroy() {
        alive = false;
        if (screen != null) screen.stopClock();
        try { unregisterReceiver(packageReceiver); } catch (Exception ignored) {}
        super.onDestroy();
    }

    private final BroadcastReceiver packageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context ctx, Intent intent) {
            if (!alive) return;
            String action = intent.getAction();
            if ((Intent.ACTION_PACKAGE_ADDED.equals(action)
                    || Intent.ACTION_PACKAGE_REMOVED.equals(action)
                    || Intent.ACTION_PACKAGE_CHANGED.equals(action))
                    && intent.getDataString() != null
                    && !intent.getDataString().contains(getPackageName())) {
                screen.reloadApps();
                screen.postInvalidate();
            }
        }
    };

    private IntentFilter buildPackageFilter() {
        IntentFilter f = new IntentFilter();
        f.addAction(Intent.ACTION_PACKAGE_ADDED);
        f.addAction(Intent.ACTION_PACKAGE_REMOVED);
        f.addAction(Intent.ACTION_PACKAGE_CHANGED);
        f.addDataScheme("package");
        return f;
    }

    void launchApp(String packageName, String activityName) {
        try {
            Intent i = getPackageManager().getLaunchIntentForPackage(packageName);
            if (i != null) {
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(i);
            }
        } catch (Exception e) {
            // Launch failure handled gracefully
        }
    }

    void openWifiSettings() {
        try { startActivity(new Intent(Settings.ACTION_WIFI_SETTINGS)); } catch (Exception ignored) {}
    }

    void openSettings() {
        try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch (Exception ignored) {}
    }

    // ── Main canvas view ──────────────────────────
    static class HomeScreen extends View {

        // Colors
        static final int BG_BLACK     = Color.rgb(8,  8,  10);
        static final int CARD_DIM     = Color.argb(28, 255, 255, 255);
        static final int CARD_FOCUS   = Color.argb(55, 255, 255, 255);
        static final int RED          = Color.rgb(229, 35, 55);
        static final int WHITE        = Color.WHITE;
        static final int TEXT_WHITE   = Color.argb(185, 255, 255, 255);
        static final int TEXT_MUTED   = Color.argb(130, 255, 255, 255);
        static final int TEXT_SUB     = Color.argb(95,  255, 255, 255);
        static final int HINT         = Color.argb(55,  255, 255, 255);
        static final int PILLS_BG     = Color.argb(45, 255, 255, 255);
        static final int PILLS_FOCUS  = Color.argb(75, 255, 255, 255);
        static final int PILLS_BORDER = Color.argb(90, 80, 80, 90);

        // Icon strings
        static final String[] PILL_ICONS = {"\uD83D\uDD0C", "\uD83D\uDCE1", "\u2699\uFE0F"};
        static final String[] PILL_LABELS = {"Inputs", "WiFi", "Settings"};

        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final List<AppItem> apps = new ArrayList<>();
        private final Handler clockHandler = new Handler(Looper.getMainLooper());

        private Context activityCtx;
        
        // Navigation state
        private int selectedRow = 0;
        private int selectedCol = 0;
        private int columns = 5;
        private int focusMode = 0; // 0=apps, 1=inputs, 2=wifi, 3=settings
        
        // Scroll state
        private float scrollY = 0f;
        private float cellW, cellH, startX, startY, rowSpacing;
        
        // Fonts
        private Typeface boldFont, regFont;
        
        // Clock data
        private volatile String clockStr = "";
        private volatile String dateStr = "";
        private volatile String greeting = "";
        private volatile int currentHour = 0;
        
        // Quick pills
        private volatile String wifiLabel = "WiFi";
        private float[] pillX = new float[3];
        private float[] pillW = new float[3];
        private float pillY = 0f, pillH = 0f;
        
        // Layout constants
        private static final int NUM_PILLS = 3;
        private static final int GRID_AREA_TOP = 140; // Space for header + pills
        private static final int GRID_AREA_BOTTOM = 60; // Space for footer

        HomeScreen(Context ctx) {
            super(ctx);
            this.activityCtx = ctx;
            setFocusable(true);
            setFocusableInTouchMode(false);
            loadFonts(ctx);
            reloadApps();
            refreshWifi();
            refreshClock();
            startClock();
        }

        private void loadFonts(Context ctx) {
            try {
                boldFont = Typeface.create("sans-serif-medium", Typeface.NORMAL);
                regFont = Typeface.create("sans-serif", Typeface.NORMAL);
            } catch (Exception e) {
                boldFont = Typeface.DEFAULT_BOLD;
                regFont = Typeface.DEFAULT;
            }
        }

        // ── App Discovery ───────────────────────────
        void reloadApps() {
            PackageManager pm = activityCtx.getPackageManager();
            
            // Collect from both categories
            List<ResolveInfo> allResolves = new ArrayList<>();
            
            Intent leanbackIntent = new Intent(Intent.ACTION_MAIN, null);
            leanbackIntent.addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
            allResolves.addAll(pm.queryIntentActivities(leanbackIntent, 0));
            
            Intent launcherIntent = new Intent(Intent.ACTION_MAIN, null);
            launcherIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            allResolves.addAll(pm.queryIntentActivities(launcherIntent, 0));
            
            // Deduplicate by component name using LinkedHashMap
            Map<String, ResolveInfo> seen = new LinkedHashMap<>();
            String myPkg = activityCtx.getPackageName();
            
            for (ResolveInfo ri : allResolves) {
                String pkg = ri.activityInfo.packageName;
                String comp = pkg + "/" + ri.activityInfo.name;
                
                // Skip own app and duplicates
                if (pkg.equals(myPkg)) continue;
                if (seen.containsKey(comp)) continue;
                
                CharSequence label = ri.loadLabel(pm);
                if (label == null) continue;
                
                seen.put(comp, ri);
            }
            
            // Convert to sorted list
            apps.clear();
            for (Map.Entry<String, ResolveInfo> entry : seen.entrySet()) {
                ResolveInfo ri = entry.getValue();
                String pkg = ri.activityInfo.packageName;
                String label = ri.loadLabel(pm).toString();
                Drawable icon = ri.loadIcon(pm);
                apps.add(new AppItem(label, pkg, ri.activityInfo.name, icon));
            }
            
            // Sort alphabetically
            Collections.sort(apps, new Comparator<AppItem>() {
                @Override
                public int compare(AppItem a, AppItem b) {
                    return a.label.compareToIgnoreCase(b.label);
                }
            });
            
            // Preserve selection if possible
            if (!apps.isEmpty()) {
                // Try to find previously selected app
                boolean found = false;
                for (int i = 0; i < apps.size(); i++) {
                    // If we had a selection before, try to maintain it
                    if (i == selectedCol + selectedRow * columns) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    selectedCol = 0;
                    selectedRow = 0;
                }
                clampSelection();
            }
            
            recalculateLayout(getWidth(), getHeight());
        }

        private void clampSelection() {
            if (apps.isEmpty()) return;
            int maxCol = Math.min(columns - 1, apps.size() - 1);
            int maxRow = (apps.size() - 1) / columns;
            selectedCol = Math.max(0, Math.min(selectedCol, maxCol));
            selectedRow = Math.max(0, Math.min(selectedRow, maxRow));
        }

        // ── Wi-Fi ───────────────────────────────────
        void refreshWifi() {
            try {
                WifiManager wm = (WifiManager) activityCtx.getApplicationContext()
                        .getSystemService(Context.WIFI_SERVICE);
                if (wm != null && wm.getConnectionInfo() != null) {
                    String ssid = wm.getConnectionInfo().getSSID();
                    if (ssid != null) {
                        ssid = ssid.replaceAll("^\"|\"$", "");
                        if (!ssid.isEmpty() && !ssid.equals("Unknown SSID")) {
                            // Truncate long SSIDs
                            if (ssid.length() > 18) {
                                ssid = ssid.substring(0, 15) + "...";
                            }
                            wifiLabel = ssid;
                        } else {
                            wifiLabel = "WiFi";
                        }
                    }
                }
            } catch (Exception ignored) {
                wifiLabel = "WiFi";
            }
        }

        // ── Clock ───────────────────────────────────
        void refreshClock() {
            Date now = new Date();
            clockStr = new SimpleDateFormat("h:mm a", Locale.getDefault()).format(now);
            dateStr = new SimpleDateFormat("EEEE, d MMMM yyyy", Locale.getDefault())
                         .format(now).toUpperCase(Locale.getDefault());
            currentHour = now.getHours();
            
            if (currentHour < 12) greeting = "GOOD MORNING";
            else if (currentHour < 17) greeting = "GOOD AFTERNOON";
            else greeting = "GOOD EVENING";
        }

        void startClock() {
            clockHandler.removeCallbacksAndMessages(null);
            clockHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    refreshClock();
                    invalidate();
                    clockHandler.postDelayed(this, 1000);
                }
            }, 1000);
        }

        void stopClock() {
            clockHandler.removeCallbacksAndMessages(null);
        }

        // ── Layout ──────────────────────────────────
        private void recalculateLayout(float w, float h) {
            if (w <= 0 || h <= 0) return;
            
            float density = getResources().getDisplayMetrics().density;
            
            // Pill dimensions
            pillH = 46f * density;
            pillY = 88f * density;
            
            // Measure pills
            p.setTextSize(15f * density);
            p.setTypeface(boldFont);
            
            float inputsW = p.measureText("Inputs") + 44f * density;
            float wifiW = p.measureText(wifiLabel) + 44f * density;
            float settingsW = p.measureText("Settings") + 44f * density;
            
            float totalPillW = inputsW + 12f * density + wifiW + 12f * density + settingsW;
            float pillStartX = w - 48f * density - totalPillW;
            
            pillX[0] = pillStartX;
            pillW[0] = inputsW;
            pillX[1] = pillStartX + inputsW + 12f * density;
            pillW[1] = wifiW;
            pillX[2] = pillStartX + inputsW + 12f * density + wifiW + 12f * density;
            pillW[2] = settingsW;
            
            // Grid dimensions
            float padX = 48f * density;
            float availW = w - padX * 2f;
            float gridTop = pillY + pillH + 24f * density;
            float availH = h - gridTop - 64f * density;
            
            columns = Math.max(3, Math.min(7, (int)(availW / (160f * density))));
            float gap = 16f * density;
            cellW = (availW - gap * (columns - 1)) / columns;
            cellH = cellW * 1.20f;
            rowSpacing = cellH + 20f * density;
            startX = padX;
            startY = gridTop;
            
            // Clamp scroll
            clampScroll();
        }

        private void clampScroll() {
            if (apps.isEmpty()) {
                scrollY = 0;
                return;
            }
            
            float h = getHeight();
            if (h <= 0) return;
            
            float availableHeight = h - startY - 64f * getResources().getDisplayMetrics().density;
            int totalRows = (apps.size() + columns - 1) / columns;
            float totalContentHeight = totalRows * rowSpacing;
            
            float maxScroll = Math.max(0f, totalContentHeight - availableHeight + cellH);
            scrollY = Math.max(0f, Math.min(scrollY, maxScroll));
        }

        @Override
        protected void onSizeChanged(int w, int h, int oldw, int oldh) {
            super.onSizeChanged(w, h, oldw, oldh);
            recalculateLayout(w, h);
        }

        // ── Drawing ───────────────────────────────
        @Override
        protected void onDraw(Canvas c) {
            float w = getWidth();
            float h = getHeight();
            if (w <= 0 || h <= 0) return;
            
            float density = getResources().getDisplayMetrics().density;
            
            // Background
            p.setColor(BG_BLACK);
            c.drawRect(0, 0, w, h, p);
            
            // Subtle gradient glow
            LinearGradient glow = new LinearGradient(
                0, 0, 0, h * 0.25f,
                Color.argb(12, Color.red(RED), Color.green(RED), Color.blue(RED)),
                Color.argb(0, Color.red(RED), Color.green(RED), Color.blue(RED)),
                android.graphics.Shader.TileMode.CLAMP
            );
            p.setShader(glow);
            c.drawRect(0, 0, w, h * 0.3f, p);
            p.setShader(null);
            
            // Draw greeting and clock
            drawHeader(c, w, h, density);
            
            // Draw quick pills
            drawQuickPills(c, w, h, density);
            
            // Draw app grid
            if (focusMode == 0) {
                drawAppGrid(c, w, h, density);
            }
            
            // Draw footer hints
            drawFooter(c, w, h, density);
            
            // Empty state
            if (apps.isEmpty() && focusMode == 0) {
                drawEmptyState(c, w, h, density);
            }
        }

        private void drawHeader(Canvas c, float w, float h, float density) {
            float x = 48f * density;
            
            // Greeting
            p.setTextSize(13f * density);
            p.setTypeface(regFont);
            p.setColor(TEXT_SUB);
            p.setTextAlign(Paint.Align.LEFT);
            c.drawText(greeting, x, 44f * density, p);
            
            // Time
            p.setTextSize(64f * density);
            p.setTypeface(boldFont);
            p.setColor(WHITE);
            c.drawText(clockStr, x, 106f * density, p);
            
            // Date
            p.setTextSize(14f * density);
            p.setTypeface(regFont);
            p.setColor(TEXT_MUTED);
            float timeWidth = p.measureText(clockStr);
            c.drawText(dateStr, x + timeWidth + 20f * density, 82f * density, p);
        }

        private void drawQuickPills(Canvas c, float w, float h, float density) {
            String[] labels = {"Inputs", wifiLabel, "Settings"};
            
            for (int i = 0; i < NUM_PILLS; i++) {
                boolean selected = (focusMode == i + 1);
                float px = pillX[i];
                float pw = pillW[i];
                float r = pillH / 2f;
                
                // Pill background
                p.setColor(selected ? PILLS_FOCUS : PILLS_BG);
                p.setStyle(Paint.Style.FILL);
                c.drawRoundRect(px, pillY, px + pw, pillY + pillH, r, r, p);
                
                // Border
                p.setStrokeWidth(1f * density);
                p.setStyle(Paint.Style.STROKE);
                p.setColor(selected ? RED : PILLS_BORDER);
                c.drawRoundRect(px, pillY, px + pw, pillY + pillH, r, r, p);
                p.setStyle(Paint.Style.FILL);
                
                // Icon
                int iconSize = (int)(pillH * 0.45f);
                p.setTextSize(iconSize);
                p.setColor(selected ? RED : TEXT_MUTED);
                p.setTextAlign(Paint.Align.CENTER);
                float iconX = px + 18f * density;
                float iconY = pillY + pillH * 0.5f + iconSize * 0.3f;
                c.drawText(PILL_ICONS[i], iconX, iconY, p);
                
                // Label
                p.setTextSize(15f * density);
                p.setTypeface(boldFont);
                p.setColor(selected ? Color.BLACK : TEXT_WHITE);
                p.setTextAlign(Paint.Align.LEFT);
                float labelX = px + 34f * density;
                float labelY = pillY + pillH * 0.5f + 5f * density;
                
                // Trim long labels
                String displayLabel = labels[i];
                float textWidth = p.measureText(displayLabel);
                if (textWidth > pw - 40f * density) {
                    while (p.measureText(displayLabel + "\u2026", 0, displayLabel.length() + 1) > pw - 40f * density 
                           && displayLabel.length() > 1) {
                        displayLabel = displayLabel.substring(0, displayLabel.length() - 1);
                    }
                    displayLabel += "\u2026";
                }
                c.drawText(displayLabel, labelX, labelY, p);
            }
        }

        private void drawAppGrid(Canvas c, float w, float h, float density) {
            // Section title
            p.setTextSize(12f * density);
            p.setTypeface(boldFont);
            p.setColor(TEXT_SUB);
            p.setTextAlign(Paint.Align.LEFT);
            c.drawText("APPLICATIONS", startX, startY - 14f * density, p);
            
            // Calculate visible area
            float clipTop = startY - scrollY;
            float clipBottom = h - 64f * density;
            float gridRight = startX + columns * (cellW + 16f * density);
            
            c.save();
            c.clipRect(startX - 8f * density, clipTop, gridRight, clipBottom);
            
            // Draw each app
            for (int i = 0; i < apps.size(); i++) {
                int row = i / columns;
                int col = i % columns;
                float x = startX + col * (cellW + 16f * density);
                float y = startY + row * rowSpacing - scrollY;
                
                // Skip off-screen items
                if (y + cellH < startY || y > h) continue;
                
                boolean selected = (row == selectedRow && col == selectedCol);
                drawCard(c, x, y, cellW, cellH, apps.get(i), selected, density);
            }
            
            c.restore();
        }

        private void drawCard(Canvas c, float x, float y, float cw, float ch,
                             AppItem item, boolean selected, float density) {
            float r = 16f * density;
            
            // Card background
            p.setColor(selected ? CARD_FOCUS : CARD_DIM);
            p.setStyle(Paint.Style.FILL);
            c.drawRoundRect(x, y, x + cw, y + ch, r, r, p);
            
            if (selected) {
                // Red border
                p.setStrokeWidth(2.5f * density);
                p.setStyle(Paint.Style.STROKE);
                p.setColor(RED);
                c.drawRoundRect(x, y, x + cw, y + ch, r, r, p);
                p.setStyle(Paint.Style.FILL);
                
                // Bottom accent bar
                float barH = 4f * density;
                c.drawRoundRect(new RectF(
                    x + 14f * density, y + ch - barH - 2f,
                    x + cw - 14f * density, y + ch - 2f
                ), barH, barH, p);
            }
            
            // Icon
            Drawable icon = item.icon;
            int iconSize = (int)(cw * 0.45f);
            icon.setBounds(
                (int)(x + (cw - iconSize) / 2f),
                (int)(y + ch * 0.15f),
                (int)(x + (cw + iconSize) / 2f),
                (int)(y + ch * 0.15f + iconSize)
            );
            icon.draw(c);
            
            // Label
            p.setTextSize(12f * density);
            p.setTypeface(selected ? boldFont : regFont);
            p.setColor(selected ? WHITE : TEXT_WHITE);
            p.setTextAlign(Paint.Align.CENTER);
            
            String label = item.label;
            float maxWidth = cw - 16f * density;
            float textWidth = p.measureText(label);
            
            if (textWidth > maxWidth) {
                while (p.measureText(label + "\u2026", 0, label.length() + 1) > maxWidth 
                       && label.length() > 1) {
                    label = label.substring(0, label.length() - 1);
                }
                label += "\u2026";
            }
            
            c.drawText(label, x + cw / 2f, y + ch * 0.78f, p);
        }

        private void drawFooter(Canvas c, float w, float h, float density) {
            p.setTextSize(10f * density);
            p.setTypeface(regFont);
            p.setColor(HINT);
            p.setTextAlign(Paint.Align.CENTER);
            
            String hint;
            if (focusMode == 0) {
                hint = "\u2190 \u2192 navigate  \u2022  \u2191 \u2193 rows  \u2022  OK launch  \u2022  MENU panels  \u2022  BACK home";
            } else {
                hint = "\u2190 \u2192 select panel  \u2022  OK open  \u2022  BACK apps";
            }
            c.drawText(hint, w / 2f, h - 24f * density, p);
        }

        private void drawEmptyState(Canvas c, float w, float h, float density) {
            p.setTextSize(16f * density);
            p.setTypeface(boldFont);
            p.setColor(TEXT_WHITE);
            p.setTextAlign(Paint.Align.CENTER);
            c.drawText("No launchable apps found", w / 2f, h / 2f, p);
            
            p.setTextSize(11f * density);
            p.setTypeface(regFont);
            p.setColor(TEXT_SUB);
            c.drawText("Install some apps to see them here", w / 2f, h / 2f + 26f * density, p);
        }

        // ── Input Handling ──────────────────────────
        @Override
        public boolean onKeyDown(int keyCode, KeyEvent event) {
            float density = getResources().getDisplayMetrics().density;
            
            switch (keyCode) {
                case KeyEvent.KEYCODE_MENU:
                    // Toggle between app grid and quick panels
                    if (focusMode == 0) {
                        focusMode = 1; // Start at Inputs
                    } else {
                        focusMode = 0;
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_LEFT:
                    if (focusMode == 0) {
                        // Navigate left in grid
                        if (selectedCol > 0) {
                            selectedCol--;
                            scrollToSelected();
                        }
                    } else if (focusMode > 1) {
                        // Navigate left in pills
                        focusMode--;
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_RIGHT:
                    if (focusMode == 0) {
                        // Navigate right in grid
                        int maxCol = Math.min(columns - 1, apps.size() - 1);
                        if (selectedCol < maxCol) {
                            selectedCol++;
                            scrollToSelected();
                        }
                    } else if (focusMode < NUM_PILLS) {
                        // Navigate right in pills
                        focusMode++;
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_UP:
                    if (focusMode == 0 && !apps.isEmpty()) {
                        // Navigate up in grid (full row)
                        int maxRow = (apps.size() - 1) / columns;
                        if (selectedRow > 0) {
                            selectedRow--;
                            // Recalculate column based on new row
                            int newIndex = selectedRow * columns + selectedCol;
                            if (newIndex >= apps.size()) {
                                selectedCol = apps.size() - 1 - selectedRow * columns;
                            }
                            scrollToSelected();
                        }
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_DOWN:
                    if (focusMode == 0 && !apps.isEmpty()) {
                        // Navigate down in grid (full row)
                        int maxRow = (apps.size() - 1) / columns;
                        if (selectedRow < maxRow) {
                            selectedRow++;
                            // Recalculate column based on new row
                            int newIndex = selectedRow * columns + selectedCol;
                            if (newIndex >= apps.size()) {
                                selectedCol = apps.size() - 1 - selectedRow * columns;
                                if (selectedCol < 0) selectedCol = 0;
                            }
                            scrollToSelected();
                        }
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_CENTER:
                case KeyEvent.KEYCODE_ENTER:
                case KeyEvent.KEYCODE_NUMPAD_ENTER:
                    launchSelected();
                    return true;
                    
                case KeyEvent.KEYCODE_BACK:
                    if (focusMode != 0) {
                        focusMode = 0;
                        invalidate();
                        return true;
                    }
                    // Stay on launcher
                    return true;
                    
                default:
                    return super.onKeyDown(keyCode, event);
            }
        }

        private void scrollToSelected() {
            if (apps.isEmpty() || focusMode != 0) return;
            
            float h = getHeight();
            if (h <= 0) return;
            
            int index = selectedRow * columns + selectedCol;
            if (index < 0 || index >= apps.size()) return;
            
            float itemTop = startY + selectedRow * rowSpacing;
            float itemBottom = itemTop + cellH;
            float visibleTop = scrollY;
            float visibleBottom = scrollY + h - startY - 64f * getResources().getDisplayMetrics().density;
            
            if (itemTop < visibleTop) {
                scrollY = Math.max(0f, itemTop - 20f * getResources().getDisplayMetrics().density);
            } else if (itemBottom > visibleBottom) {
                scrollY = Math.max(0f, itemBottom - visibleBottom + 20f * getResources().getDisplayMetrics().density);
            }
            
            clampScroll();
        }

        private void launchSelected() {
            if (focusMode == 0 && !apps.isEmpty()) {
                // Launch app
                int index = selectedRow * columns + selectedCol;
                if (index >= 0 && index < apps.size()) {
                    AppItem item = apps.get(index);
                    ((HomeActivity) activityCtx).launchApp(item.pkg, item.activityName);
                }
            } else if (focusMode == 1) {
                // Inputs - fallback to settings
                ((HomeActivity) activityCtx).openSettings();
            } else if (focusMode == 2) {
                // WiFi
                ((HomeActivity) activityCtx).openWifiSettings();
            } else if (focusMode == 3) {
                // Settings
                ((HomeActivity) activityCtx).openSettings();
            }
        }

        // ── Data model ──────────────────────────────
        static class AppItem {
            final String label;
            final String pkg;
            final String activityName;
            final Drawable icon;
            
            AppItem(String label, String pkg, String activityName, Drawable icon) {
                this.label = label;
                this.pkg = pkg;
                this.activityName = activityName;
                this.icon = icon;
            }
        }
    }
}
