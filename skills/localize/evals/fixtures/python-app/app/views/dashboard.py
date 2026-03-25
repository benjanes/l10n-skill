from flask import render_template, flash, redirect, url_for
from app.auth import login_required


@login_required
def dashboard(user):
    if not user.has_completed_onboarding:
        flash("Welcome! Let's get your account set up.")
        return redirect(url_for("onboarding"))

    stats = get_user_stats(user.id)
    notifications = get_notifications(user.id)

    unread_count = sum(1 for n in notifications if not n.read)
    if unread_count == 1:
        flash("You have 1 unread notification")
    elif unread_count > 1:
        flash(f"You have {unread_count} unread notifications")

    return render_template(
        "dashboard.html",
        page_title="Dashboard",
        welcome_message=f"Welcome back, {user.display_name}!",
        stats_header="Your Activity",
        no_data_message="No activity yet. Start by creating your first project.",
        export_button="Export Report",
        last_updated_label="Last updated",
    )
