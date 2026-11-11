package com.newlauncher.tv;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public final class HomeActivity extends Activity {
    private HomeScreen screen;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        screen = new HomeScreen();
        setContentView(screen);
    }

    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) getWindow().getDecorView().setSystemUiVisibility(5894 | 1024 | 512);
    }

    private void launch(AppEntry entry) {
        try {
            Intent intent = getPackageManager().getLaunchIntentForPackage(entry.packageName);
            if (intent != null) startActivity(intent);
        } catch (Exception ignored) { }
    }

    private final class HomeScreen extends View {
        private final Paint p = new Paint(3);
        private final List<AppEntry> apps = new ArrayList<>();
        private int selected = 0;
        private float cellW, cellH, startX, startY;
        private final int bg = Color.rgb(9, 9, 11);
        private final int red = Color.rgb(229, 35, 55);

        HomeScreen() {
            super(HomeActivity.this);
            setFocusable(true);
            setFocusableInTouchMode(true);
            loadApps();
            post(clockTick);
        }

        private void loadApps() {
            PackageManager pm = getPackageManager();
            Intent query = new Intent(Intent.ACTION_MAIN);
            query.addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
            List<android.content.pm.ResolveInfo> found = pm.queryIntentActivities(query, 0);
            if (found.isEmpty()) {
                query.removeCategory(Intent.CATEGORY_LEANBACK_LAUNCHER);
                query.addCategory(Intent.CATEGORY_LAUNCHER);
                found = pm.queryIntentActivities(query, 0);
            }
            for (android.content.pm.ResolveInfo info : found) {
                String pkg = info.activityInfo.packageName;
                if (pkg.equals(getPackageName())) continue;
                boolean duplicate = false;
                for (AppEntry e : apps) if (e.packageName.equals(pkg)) duplicate = true;
                if (!duplicate) apps.add(new AppEntry(info.loadLabel(pm).toString(), pkg, info.loadIcon(pm)));
            }
            Collections.sort(apps, Comparator.comparing(a -> a.label.toLowerCase(Locale.ROOT)));
        }

        private final Runnable clockTick = new Runnable() {
            @Override public void run() { invalidate(); postDelayed(this, 30000); }
        };

        @Override protected void onDraw(Canvas c) {
            super.onDraw(c);
            float w = getWidth(), h = getHeight();
            c.drawColor(bg);
            text(c, "NEW", 48, 64, 17, red, true);
            text(c, "LAUNCHER", 99, 64, 17, Color.WHITE, true);
            String time = new SimpleDateFormat("h:mm", Locale.getDefault()).format(new Date());
            String date = new SimpleDateFormat("EEE, d MMM", Locale.getDefault()).format(new Date());
            text(c, time, w - 54, 67, 30, Color.WHITE, true, Paint.Align.RIGHT);
            text(c, date.toUpperCase(Locale.getDefault()), w - 55, 91, 10, 0xff99999f, false, Paint.Align.RIGHT);

            text(c, "YOUR APPS", 58, h * .29f, 12, 0xff8d8d94, true);
            int columns = Math.max(1, Math.min(6, (int)((w - 100) / 155)));
            cellW = Math.min(155, (w - 100) / columns);
            cellH = 126;
            startX = 50;
            startY = h * .34f;
            for (int i = 0; i < apps.size(); i++) {
                int col = i % columns, row = i / columns;
                float x = startX + col * cellW, y = startY + row * cellH;
                boolean active = i == selected;
                RectF card = new RectF(x, y, x + cellW - 12, y + 104);
                p.setColor(active ? 0xff242428 : 0xff151518);
                c.drawRoundRect(card, 17, 17, p);
                if (active) {
                    p.setColor(red);
                    c.drawRoundRect(new RectF(card.left + 8, card.bottom - 4, card.right - 8, card.bottom), 3, 3, p);
                }
                Drawable icon = apps.get(i).icon;
                int size = 42, ix = (int)(x + (cellW - 12 - size) / 2), iy = (int)(y + 15);
                icon.setBounds(ix, iy, ix + size, iy + size);
                icon.draw(c);
                text(c, apps.get(i).label, x + (cellW - 12) / 2, y + 79, 12,
                    active ? Color.WHITE : 0xffb9b9be, active, Paint.Align.CENTER);
            }
            if (apps.isEmpty()) {
                text(c, "No launchable apps found", 58, startY + 65, 18, Color.WHITE, false);
            }
            text(c, "SELECT  OPEN     •     BACK  EXIT", 58, h - 38, 10, 0xff66666d, false);
        }

        private void text(Canvas c, String s, float x, float y, float size, int color, boolean bold) {
            text(c, s, x, y, size, color, bold, Paint.Align.LEFT);
        }
        private void text(Canvas c, String s, float x, float y, float size, int color, boolean bold, Paint.Align align) {
            p.setColor(color); p.setTextSize(size); p.setTypeface(Typeface.create("sans-serif", bold ?  Typeface.BOLD : Typeface.NORMAL));
            p.setTextAlign(align); c.drawText(s, x, y, p);
        }

        @Override public boolean onKeyDown(int key, KeyEvent event) {
            int columns = Math.max(1, Math.min(6, (int)((getWidth() - 100) / 155)));
            if (apps.isEmpty()) return super.onKeyDown(key, event);
            switch (key) {
                case KeyEvent.KEYCODE_DPAD_RIGHT: selected = Math.min(apps.size()-1, selected+1); break;
                case KeyEvent.KEYCODE_DPAD_LEFT: selected = Math.max(0, selected-1); break;
                case KeyEvent.KEYCODE_DPAD_DOWN: selected = Math.min(apps.size()-1, selected+columns); break;
                case KeyEvent.KEYCODE_DPAD_UP: selected = Math.max(0, selected-columns); break;
                case KeyEvent.KEYCODE_DPAD_CENTER:
                case KeyEvent.KEYCODE_ENTER:
                case KeyEvent.KEYCODE_NUMPAD_ENTER: launch(apps.get(selected)); break;
                case KeyEvent.KEYCODE_BACK: return true;
                default: return super.onKeyDown(key, event);
            }
            invalidate();
            return true;
        }
    }

    private static final class AppEntry {
        final String label, packageName;
        final Drawable icon;
        AppEntry(String label, String packageName, Drawable icon) {
            this.label = label; this.packageName = packageName; this.icon = icon;
        }
    }
}
