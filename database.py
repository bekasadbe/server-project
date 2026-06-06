"""
SQLite database — barcha eventlar saqlanadi.
"""

import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'davomat.db')


def get_conn():
    return sqlite3.connect(DB_FILE)


def init_db():
    with get_conn() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT    NOT NULL,
                event_time  TEXT    NOT NULL,
                device_ip   TEXT,
                created_at  TEXT    DEFAULT (datetime('now'))
            )
        ''')
        conn.commit()
    print("✅ Database tayyor")


def save_event(employee_id: str, event_time: str, device_ip: str):
    with get_conn() as conn:
        conn.execute(
            'INSERT INTO events (employee_id, event_time, device_ip) VALUES (?, ?, ?)',
            (employee_id.zfill(8), event_time, device_ip)
        )
        conn.commit()


def get_first_entries(date_str: str, end_time: str):
    """
    Berilgan sana va vaqtgacha har bir xodimning birinchi kirish vaqtini qaytaradi.
    date_str: '2026-06-05'
    end_time: '10:30'
    """
    query = '''
        SELECT employee_id, MIN(event_time) as first_time
        FROM events
        WHERE event_time >= ? AND event_time <= ?
        GROUP BY employee_id
    '''
    start = f"{date_str}T00:00:00"
    end   = f"{date_str}T{end_time}:00"
    with get_conn() as conn:
        rows = conn.execute(query, (start, end)).fetchall()
    return {row[0]: row[1] for row in rows}


# Database ishga tushganda jadval yaratiladi
init_db()
