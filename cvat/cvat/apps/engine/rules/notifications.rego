package notifications

default allow = false

allow {
    # Allow authenticated users to view their notifications
    input.scope == "view"
    input.auth.user.id != null
}

allow {
    # Allow marking notifications as read
    input.scope == "mark_as_read"
    input.auth.user.id != null
}