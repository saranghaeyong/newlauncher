package com.deadpool.home.launcher.adapter

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
}
