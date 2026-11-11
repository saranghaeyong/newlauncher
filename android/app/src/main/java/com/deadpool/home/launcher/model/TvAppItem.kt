package com.deadpool.home.launcher.model

import android.graphics.drawable.Drawable

data class TvAppItem(
    val packageName: String,
    val activityName: String,
    val label: String,
    val icon: Drawable
)
