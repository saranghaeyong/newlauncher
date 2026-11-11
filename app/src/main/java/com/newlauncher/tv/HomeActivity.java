package com.newlauncher.tv;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
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
import java.util.List;
import java.util.Locale;

/**
 * NewLauncher – cinematic Android TV home launcher.
 */
public class HomeActivity extends Activity {

    private HomeScreen screen;
    private boolean alive = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
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
        if (screen != null) { screen.reloadApps(); screen.refreshWifi(); screen.invalidate(); }
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
    protected void onDestroy() {
        alive = false;
        try { unregisterReceiver(packageReceiver); } catch (Exception ignored) {}
        super.onDestroy();
    }

    private final BroadcastReceiver packageReceiver = new BroadcastReceiver() {
        @Override public void onReceive(Context ctx, Intent intent) {
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

    void launchApp(String packageName) {
        try {
            Intent i = getPackageManager().getLaunchIntentForPackage(packageName);
            if (i != null) {
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(i);
            }
        } catch (Exception ignored) {}
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
        static final int CARD_FOCUS   = Color.argb(50, 255, 255, 255);
        static final int RED          = Color.rgb(229, 35, 55);
        static final int WHITE        = Color.WHITE;
        static final int TEXT_WHITE   = Color.argb(185, 255, 255, 255);
        static final int TEXT_MUTED   = Color.argb(130, 255, 255, 255);
        static final int TEXT_SUB     = Color.argb(95,  255, 255, 255);
        static final int HINT         = Color.argb(55,  255, 255, 255);
        static final int PILLS_BG     = Color.argb(45, 255, 255, 255);
        static final int PILLS_FOCUS  = Color.argb(70, 255, 255, 255);
        static final int PILLS_BORDER = Color.argb(90, 80, 80, 90);

        // Pre-computed icon strings
        static final String[] PILL_ICONS = {"\uD83D\uDD0C", "\uD83D\uDCE1", "\u2699\uFE0F"};
        static final String[] PILL_LABELS = {"Inputs", null, "Settings"}; // wifi SSID set dynamically

        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final List<AppItem> apps = new ArrayList<>();
        private final Handler clockHandler = new Handler(Looper.getMainLooper());

        private Context activityCtx;
        private int     selectedIdx = 0;
        private int     focusPanel  = -1;  // -1=apps, 0=Inputs, 1=WiFi, 2=Settings
        private float   scrollY     = 0f;
        private float   cellW, cellH, startX, startY, rowSpacing;
        private int     columns     = 5;
        private Typeface boldFont, regFont;

        // Cached layout values (avoid recalculation)
        private float cachedDp24, cachedDp48, cachedDp16, cachedDp12, cachedDp8;
        private float cachedDp64, cachedDp96, cachedDp106, cachedDp44, cachedDp88;
        private float cachedDp36, cachedDp52, cachedDp20;

        // Clock data
        private volatile String clockStr  = "";
        private volatile String dateStr   = "";
        private volatile String greeting  = "";
        private float cachedClockWidth = 0f;

        // Quick-pills
        private volatile String wifiSsid  = "...";
        private float[] pillX = new float[3];
        private float[] pillW = new float[3];
        private float   pillY = 0f, pillH = 0f;
        private float   cachedPillTotalWidth = 0f;
        private boolean pillsDirty = true;

        private static final int NUM_PILLS = 3;

        HomeScreen(Context ctx) {
            super(ctx);
            this.activityCtx = ctx;
            setFocusable(true);
            setFocusableInTouchMode(false);
            loadFonts(ctx);
            reloadApps();
            refreshWifi();
            refreshClock();
            scheduleClock();
        }

        private void loadFonts(Context ctx) {
            try {
                boldFont = Typeface.create("sans-serif-medium", Typeface.NORMAL);
                regFont  = Typeface.create("sans-serif", Typeface.NORMAL);
            } catch (Exception e) {
                boldFont = Typeface.DEFAULT_BOLD;
                regFont  = Typeface.DEFAULT;
            }
        }

        // Pre-cache dp values once
        private void cacheDps() {
            float density = getResources().getDisplayMetrics().density;
            cachedDp8  = 8f  * density;
            cachedDp12 = 12f * density;
            cachedDp16 = 16f * density;
            cachedDp20 = 20f * density;
            cachedDp24 = 24f * density;
            cachedDp36 = 36f * density;
            cachedDp44 = 44f * density;
            cachedDp48 = 48f * density;
            cachedDp52 = 52f * density;
            cachedDp64 = 64f * density;
            cachedDp88 = 88f * density;
            cachedDp96 = 96f * density;
            cachedDp106 = 106f * density;
        }

        private float dp(float v) {
            return v * getResources().getDisplayMetrics().density;
        }

        void reloadApps() {
            PackageManager pm = activityCtx.getPackageManager();
            Intent main = new Intent(Intent.ACTION_MAIN, null);
            main.addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
            List<ResolveInfo> list = pm.queryIntentActivities(main, 0);
            if (list.isEmpty()) {
                main.removeCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
                main.addCategory(Intent.CATEGORY_LAUNCHER);
                list = pm.queryIntentActivities(main, 0);
            }
            apps.clear();
            String myPkg = activityCtx.getPackageName();
            for (ResolveInfo ri : list) {
                String pkg = ri.activityInfo.packageName;
                if (pkg.equals(myPkg)) continue;
                CharSequence label = ri.loadLabel(pm);
                if (label == null) continue;
                // O(1) duplicate check using a simple approach since lists are small
                boolean dup = false;
                for (int j = 0; j < apps.size(); j++) {
                    if (apps.get(j).pkg.equals(pkg)) { dup = true; break; }
                }
                if (!dup) apps.add(new AppItem(label.toString(), pkg, ri.loadIcon(pm)));
            }
            Collections.sort(apps, new Comparator<AppItem>() {
                @Override public int compare(AppItem a, AppItem b) {
                    return a.label.compareToIgnoreCase(b.label);
                }
            });
            // Preserve focus panel selection when reloading
            if (focusPanel == -1) {
                selectedIdx = Math.min(Math.max(0, selectedIdx), Math.max(0, apps.size() - 1));
            }
            scrollY = 0f;
            pillsDirty = true;
        }

        void refreshWifi() {
            try {
                WifiManager wm = (WifiManager) activityCtx.getApplicationContext()
                        .getSystemService(Context.WIFI_SERVICE);
                if (wm != null && wm.getConnectionInfo() != null) {
                    String ssid = wm.getConnectionInfo().getSSID();
                    if (ssid != null) {
                        ssid = ssid.replaceAll("^\"|\"$", "");
                        wifiSsid = ssid.isEmpty() ? "Not connected" : ssid;
                        pillsDirty = true;
                    }
                }
            } catch (Exception ignored) {}
        }

        void refreshClock() {
            Date now = new Date();
            clockStr = new SimpleDateFormat("h:mm a", Locale.getDefault()).format(now);
            dateStr = new SimpleDateFormat("EEEE d MMMMMMMM", Locale.getDefault())
                         .format(now).toUpperCase(Locale.getDefault());
            int hour = now.getHours();
            if (hour < 12) greeting = "GOOD MORNING";
            else if (hour < 17) greeting = "GOOD AFTERNOON";
            else greeting = "GOOD EVENING";
        }

        private void scheduleClock() {
            clockHandler.removeCallbacksAndMessages(null);
            clockHandler.postDelayed(() -> {
                refreshClock();
                invalidate();
                scheduleClock();
            }, 1000);
        }

        private void relayout(float w, float h) {
            cacheDps();

            // Quick-pills dimensions
            pillH = dp(46f);
            pillY = dp(88f);

            // Measure pill widths
            p.setTextSize(dp(15f));
            p.setTypeface(boldFont);
            float inputsW  = p.measureText("Inputs")  + dp(44f);
            float wifiW    = p.measureText(wifiSsid) + dp(44f);
            float settingsW = p.measureText("Settings") + dp(44f);
            float totalPillW = inputsW + dp(12f) + wifiW + dp(12f) + settingsW;
            float pillStartX = w - dp(48f) - totalPillW;

            pillX[0] = pillStartX;                 pillW[0] = inputsW;
            pillX[1] = pillStartX + inputsW + dp(12f);              pillW[1] = wifiW;
            pillX[2] = pillStartX + inputsW + dp(12f) + wifiW + dp(12f); pillW[2] = settingsW;
            cachedPillTotalWidth = totalPillW;

            // App grid
            float padX = dp(48f);
            float availW = w - padX * 2f;
            float topGap = pillY + pillH + dp(36f);
            float availH = h - topGap - dp(64f);

            columns = Math.max(3, Math.min(7, (int)(availW / dp(160f))));
            float gap = dp(16f);
            cellW = (availW - gap * (columns - 1)) / columns;
            cellH = cellW * 1.20f;
            rowSpacing = cellH + dp(20f);
            startX = padX;
            startY = topGap + dp(8f);

            float totalRows = (float)Math.ceil((double)apps.size() / columns);
            float maxScroll = Math.max(0f, totalRows * rowSpacing - availH + cellH);
            scrollY = Math.max(0f, Math.min(scrollY, maxScroll));
        }

        @Override protected void onSizeChanged(int w, int h, int oldw, int oldh) {
            super.onSizeChanged(w, h, oldw, oldh);
            relayout(w, h);
        }

        // ── Drawing ───────────────────────────────
        @Override protected void onDraw(Canvas c) {
            float w = getWidth(), h = getHeight();
            if (w <= 0 || h <= 0) return;

            // Background
            p.setColor(BG_BLACK);
            c.drawRect(0, 0, w, h, p);

            // Top gradient glow (once per frame, cheap)
            LinearGradient glow = new LinearGradient(0f, 0f, 0f, h * 0.3f,
                Color.argb(14, Color.red(RED), Color.green(RED), Color.blue(RED)),
                Color.argb(0,  Color.red(RED), Color.green(RED), Color.blue(RED)),
                android.graphics.Shader.TileMode.CLAMP);
            p.setShader(glow);
            c.drawRect(0, 0, w, h * 0.35f, p);
            p.setShader(null);

            drawGreeting(c, w, h);
            drawQuickPills(c, w, h);
            drawGrid(c, w, h);
            drawFooter(c, w, h);
            if (apps.isEmpty()) drawEmpty(c, w, h);
        }

        private void drawGreeting(Canvas c, float w, float h) {
            float x = cachedDp48;
            // Greeting
            p.setTextSize(dp(13f)); p.setTypeface(regFont);
            p.setColor(TEXT_SUB); p.setTextAlign(Paint.Align.LEFT);
            c.drawText(greeting, x, dp(44f), p);

            // Time (large)
            p.setTextSize(dp(64f)); p.setTypeface(boldFont);
            p.setColor(WHITE);
            c.drawText(clockStr, x, dp(106f), p);
            cachedClockWidth = p.measureText(clockStr);

            // Date
            p.setTextSize(dp(14f)); p.setTypeface(regFont);
            p.setColor(TEXT_MUTED);
            c.drawText(dateStr, x + cachedClockWidth + dp(20f), dp(82f), p);
        }

        private void drawQuickPills(Canvas c, float w, float h) {
            PILL_LABELS[1] = wifiSsid; // update wifi label
            
            for (int i = 0; i < NUM_PILLS; i++) {
                boolean sel = (focusPanel == i);
                float px = pillX[i], pw = pillW[i];
                float r = pillH / 2f;

                // Pill background
                p.setColor(sel ? PILLS_FOCUS : PILLS_BG);
                c.drawRoundRect(px, pillY, px + pw, pillY + pillH, r, r, p);

                // Border
                if (sel) {
                    p.setStrokeWidth(dp(2f)); p.setStyle(Paint.Style.STROKE); p.setColor(RED);
                    c.drawRoundRect(px, pillY, px + pw, pillY + pillH, r, r, p);
                    p.setStyle(Paint.Style.FILL);
                } else {
                    p.setStrokeWidth(dp(1f)); p.setStyle(Paint.Style.STROKE); p.setColor(PILLS_BORDER);
                    c.drawRoundRect(px, pillY, px + pw, pillY + pillH, r, r, p);
                    p.setStyle(Paint.Style.FILL);
                }

                // Icon
                int isz = (int)(pillH * 0.5f);
                p.setTextSize(isz);
                p.setColor(sel ? RED : TEXT_MUTED);
                p.setTextAlign(Paint.Align.CENTER);
                c.drawText(PILL_ICONS[i], px + dp(18f), pillY + pillH * 0.5f + isz * 0.3f, p);

                // Label
                p.setTextSize(dp(15f)); p.setTypeface(boldFont);
                p.setColor(sel ? Color.BLACK : TEXT_WHITE);
                p.setTextAlign(Paint.Align.LEFT);
                c.drawText(PILL_LABELS[i], px + dp(34f), pillY + pillH * 0.5f + dp(5f), p);
            }
        }

        private void drawGrid(Canvas c, float w, float h) {
            if (focusPanel != -1) return;

            // Section title
            p.setTextSize(dp(12f)); p.setTypeface(boldFont);
            p.setColor(TEXT_SUB); p.setTextAlign(Paint.Align.LEFT);
            c.drawText("APPLICATIONS", startX, startY - dp(14f), p);

            float clipTop    = startY - scrollY;
            float clipBottom = h - dp(52f);
            c.save();
            c.clipRect(startX - dp(8f), clipTop, startX + columns * (cellW + dp(16f)) - dp(8f), clipBottom);

            for (int i = 0; i < apps.size(); i++) {
                int col = i % columns;
                int row = i / columns;
                float x = startX + col * (cellW + dp(16f));
                float y = startY + row * rowSpacing - scrollY;
                if (y + cellH < startY || y > h) continue;
                drawCard(c, x, y, cellW, cellH, apps.get(i), i == selectedIdx);
            }
            c.restore();
        }

        private void drawCard(Canvas c, float x, float y, float cw, float ch,
                              AppItem item, boolean sel) {
            float r = dp(16f);
            p.setColor(sel ? CARD_FOCUS : CARD_DIM);
            c.drawRoundRect(x, y, x + cw, y + ch, r, r, p);
            
            if (sel) {
                p.setStrokeWidth(dp(2.5f)); p.setStyle(Paint.Style.STROKE); p.setColor(RED);
                c.drawRoundRect(x, y, x + cw, y + ch, r, r, p);
                p.setStyle(Paint.Style.FILL);
                // Red accent bar
                float barH = dp(4f);
                c.drawRoundRect(new RectF(x + dp(14f), y + ch - barH - 2f,
                                          x + cw - dp(14f), y + ch - 2f),
                                barH, barH, p);
            }
            
            // Icon
            Drawable icon = item.icon;
            int sz = (int)(cw * 0.45f);
            icon.setBounds((int)(x + (cw - sz) / 2f), (int)(y + ch * 0.15f),
                           (int)(x + (cw + sz) / 2f), (int)(y + ch * 0.15f + sz));
            icon.draw(c);
            
            // Label
            p.setTextSize(dp(12f));
            p.setTypeface(sel ? boldFont : regFont);
            p.setColor(sel ? WHITE : TEXT_WHITE);
            p.setTextAlign(Paint.Align.CENTER);
            trimAndDraw(c, item.label, x + cw / 2f, y + ch * 0.78f, cw - dp(16f));
        }

        private void trimAndDraw(Canvas c, String text, float cx, float cy, float maxW) {
            float mw = p.measureText(text);
            if (mw <= maxW) { c.drawText(text, cx, cy, p); return; }
            while (p.measureText(text + "\u2026", 0, text.length() + 1) > maxW && text.length() > 1) {
                text = text.substring(0, text.length() - 1);
            }
            c.drawText(text + "\u2026", cx, cy, p);
        }

        private void drawFooter(Canvas c, float w, float h) {
            p.setTextSize(dp(10f)); p.setTypeface(regFont);
            p.setColor(HINT); p.setTextAlign(Paint.Align.CENTER);
            c.drawText("\u2190 \u2192 switch panel  \u2022  \u2191 \u2193 navigate  \u2022  OK select  \u2022  BACK home",
                       w / 2f, h - dp(24f), p);
        }

        private void drawEmpty(Canvas c, float w, float h) {
            p.setTextSize(dp(16f)); p.setTypeface(boldFont);
            p.setColor(TEXT_WHITE); p.setTextAlign(Paint.Align.CENTER);
            c.drawText("No launchable apps found", w / 2f, h / 2f, p);
        }

        // ── Input handling ──────────────────────────
        @Override
        public boolean onKeyDown(int keyCode, KeyEvent event) {
            switch (keyCode) {
                case KeyEvent.KEYCODE_DPAD_LEFT:
                    if (focusPanel == 0) {
                        focusPanel = -1;
                        selectedIdx = Math.min(Math.max(0, selectedIdx), Math.max(0, apps.size()-1));
                    } else if (focusPanel > 0) {
                        focusPanel--;
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_RIGHT:
                    if (focusPanel == -1) {
                        focusPanel = 0;
                    } else if (focusPanel < NUM_PILLS - 1) {
                        focusPanel++;
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_UP:
                    if (focusPanel == -1 && apps.size() > 0) {
                        if (selectedIdx - columns >= 0) {
                            selectedIdx -= columns;
                        } else if (selectedIdx > 0) {
                            selectedIdx--;
                        }
                        scrollTo(selectedIdx);
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_DOWN:
                    if (focusPanel == -1 && apps.size() > 0) {
                        if (selectedIdx + columns < apps.size()) {
                            selectedIdx += columns;
                        } else if (selectedIdx < apps.size() - 1) {
                            selectedIdx++;
                        }
                        scrollTo(selectedIdx);
                    }
                    invalidate();
                    return true;
                    
                case KeyEvent.KEYCODE_DPAD_CENTER:
                case KeyEvent.KEYCODE_ENTER:
                case KeyEvent.KEYCODE_NUMPAD_ENTER:
                    launchSelected();
                    return true;
                    
                case KeyEvent.KEYCODE_BACK:
                    if (focusPanel != -1) {
                        focusPanel = -1;
                        invalidate();
                        return true;
                    }
                    return true;
                    
                default:
                    return super.onKeyDown(keyCode, event);
            }
        }

        private void scrollTo(int idx) {
            if (idx < 0 || apps.isEmpty()) return;
            int row = idx / columns;
            float top = startY + row * rowSpacing;
            float bot = top + cellH;
            float visBot = scrollY + getHeight() - dp(52f);
            if (top < scrollY) {
                scrollY = Math.max(0f, top - dp(40f));
            } else if (bot > visBot) {
                scrollY = Math.max(0f, bot - visBot + dp(40f));
            }
            float maxScroll = getMaxScroll();
            scrollY = Math.min(scrollY, maxScroll);
        }

        private float getMaxScroll() {
            if (apps.isEmpty()) return 0f;
            float rows = (float) Math.ceil((double) apps.size() / columns);
            float availH = getHeight() - dp(52f) - (startY - dp(96f));
            return Math.max(0f, rows * rowSpacing - availH + cellH);
        }

        private void launchSelected() {
            if (focusPanel == 0) {
                // Inputs - open settings as fallback (no direct input source API)
                ((HomeActivity) activityCtx).openSettings();
            } else if (focusPanel == 1) {
                ((HomeActivity) activityCtx).openWifiSettings();
            } else if (focusPanel == 2) {
                ((HomeActivity) activityCtx).openSettings();
            } else {
                if (apps.isEmpty()) return;
                ((HomeActivity) activityCtx).launchApp(apps.get(selectedIdx).pkg);
            }
        }
    }

    static class AppItem {
        final String label, pkg;
        final Drawable icon;
        AppItem(String label, String pkg, Drawable icon) {
            this.label = label;
            this.pkg = pkg;
            this.icon = icon;
        }
    }
}
