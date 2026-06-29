from backend.db.database import get_connection


def create_session(session_id: str, title: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO sessions (id, title, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """,
        (session_id, title),
    )

    conn.commit()

    cursor.execute(
        """
        SELECT id, title, created_at, updated_at
        FROM sessions
        WHERE id = ?
        """,
        (session_id,),
    )

    row = cursor.fetchone()
    conn.close()

    return {
        "session_id": row["id"],
        "title": row["title"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }