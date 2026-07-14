"""
SQLite database — xodimlar va eventlar saqlanadi.
"""
import sqlite3
import os
import bcrypt

DB_FILE = os.environ.get('DB_FILE', os.path.join(os.path.dirname(__file__), 'davomat.db'))

def hash_password(plain: str) -> str:
    """Parolni bcrypt bilan hash qilish"""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    """Kiritilgan parolni hash bilan solishtirish"""
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False

def is_hashed(password: str) -> bool:
    """Parol allaqachon hash qilinganmi?"""
    return password.startswith('$2b$') or password.startswith('$2a$')


def get_direction(camera_ip):
    return 'in'

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS groups (
                id         TEXT PRIMARY KEY,
                name       TEXT NOT NULL,
                work_start TEXT DEFAULT '09:00',
                work_begin TEXT DEFAULT '06:00',
                work_finish TEXT DEFAULT '18:00',
                work_days  TEXT DEFAULT '1,2,3,4,5,6'
            )
        ''')
        # Eski bazaga ustunlar qo'shish (agar yo'q bo'lsa)
        for col, default in [
            ('work_start',    "'09:00'"),
            ('work_begin',    "'06:00'"),
            ('work_finish',   "'18:00'"),
            ('work_days',     "'1,2,3,4,5,6'"),
            ('grace_minutes', '0'),
        ]:
            try:
                conn.execute(f"ALTER TABLE groups ADD COLUMN {col} TEXT DEFAULT {default}")
            except Exception:
                pass

        conn.execute('''
            CREATE TABLE IF NOT EXISTS accounts (
                id            TEXT PRIMARY KEY,
                name          TEXT NOT NULL,
                login         TEXT UNIQUE DEFAULT '',
                password      TEXT DEFAULT '',
                linked_groups TEXT DEFAULT '',
                role          TEXT DEFAULT 'kadrlar'
            )
        ''')
        for col, default in [
            ("role",        "'kadrlar'"),
            ("telegram_id", "NULL"),
        ]:
            try:
                conn.execute(f"ALTER TABLE accounts ADD COLUMN {col} TEXT DEFAULT {default}")
            except Exception:
                pass

        # Eski groups jadvalidagi login/password ma'lumotlarini accounts ga ko'chirish
        try:
            old_groups = conn.execute("SELECT id, name, login, password, linked_groups FROM groups WHERE login != ''").fetchall()
            for g in old_groups:
                conn.execute(
                    "INSERT OR IGNORE INTO accounts (id, name, login, password, linked_groups) VALUES (?, ?, ?, ?, ?)",
                    (g['id'], g['name'], g['login'], g['password'], g.get('linked_groups', ''))
                )
        except Exception:
            pass
        conn.execute('''
            CREATE TABLE IF NOT EXISTS employees (
                id       TEXT PRIMARY KEY,
                name     TEXT NOT NULL,
                group_id TEXT,
                lavozim  TEXT DEFAULT '',
                work_start    TEXT DEFAULT NULL,
                work_finish   TEXT DEFAULT NULL,
                work_begin    TEXT DEFAULT NULL,
                grace_minutes INTEGER DEFAULT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )
        ''')
        # Eski bazaga xodim-shaxsiy ish grafigi ustunlari (agar yo'q bo'lsa)
        for col in ['work_start', 'work_finish', 'work_begin', 'grace_minutes']:
            try:
                conn.execute(f"ALTER TABLE employees ADD COLUMN {col} TEXT DEFAULT NULL")
            except Exception:
                pass
        # events jadvaliga direction ustuni qo'shamiz (agar yo'q bo'lsa)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT NOT NULL,
                event_time  TEXT NOT NULL,
                device_ip   TEXT,
                direction   TEXT DEFAULT 'in',
                created_at  TEXT DEFAULT (datetime('now'))
            )
        ''')
        try:
            conn.execute("ALTER TABLE events ADD COLUMN direction TEXT DEFAULT 'in'")
        except Exception:
            pass

        conn.execute('''
            CREATE TABLE IF NOT EXISTS leaves (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT NOT NULL,
                leave_type  TEXT NOT NULL,
                start_date  TEXT NOT NULL,
                end_date    TEXT NOT NULL,
                note        TEXT DEFAULT ''
            )
        ''')

        # Default guruhlar
        conn.execute("INSERT OR IGNORE INTO groups (id, name, work_start, work_begin) VALUES ('inno',   'Inno Texnopark', '09:00', '06:00')")
        conn.execute("INSERT OR IGNORE INTO groups (id, name, work_start, work_begin) VALUES ('milliy', 'Milliy Offis',   '09:00', '06:00')")
        conn.execute("INSERT OR IGNORE INTO groups (id, name, work_start, work_begin) VALUES ('markaz', 'Markaz',         '09:00', '06:00')")

        conn.commit()

    # Parollarni hash qilish (agar hali hash qilinmagan bo'lsa)
    _migrate_passwords()
    print("✅ Database tayyor")


def _migrate_passwords():
    """Plain text parollarni bcrypt hash ga o'tkazish"""
    with get_conn() as conn:
        groups = conn.execute("SELECT id, password FROM groups WHERE password != ''").fetchall()
        for g in groups:
            if g['password'] and not is_hashed(g['password']):
                hashed = hash_password(g['password'])
                conn.execute("UPDATE groups SET password=? WHERE id=?", (hashed, g['id']))
                print(f"  🔒 {g['id']} paroli hash qilindi")
        conn.commit()


def save_event(employee_id, event_time, device_ip, direction='in'):
    with get_conn() as conn:
        conn.execute(
            'INSERT INTO events (employee_id, event_time, device_ip, direction) VALUES (?, ?, ?, ?)',
            (employee_id.zfill(8), event_time, device_ip, direction)
        )
        conn.commit()


def get_recent_events(limit=50):
    """Oxirgi N ta event — jonli lenta uchun"""
    with get_conn() as conn:
        rows = conn.execute('''
            SELECT e.id, e.employee_id, e.event_time, e.device_ip, e.direction, e.created_at,
                   emp.name, emp.group_id
            FROM events e
            LEFT JOIN employees emp ON e.employee_id = emp.id
            ORDER BY e.id DESC
            LIMIT ?
        ''', (limit,)).fetchall()
    return [dict(r) for r in rows]


def get_attendance(date_str):
    """Bir kun uchun: birinchi kirish (work_begin dan keyin) + oxirgi chiqish.
    Xodimning shaxsiy ish grafigi bo'lsa, guruh sozlamasidan ustun turadi (COALESCE)."""
    with get_conn() as conn:
        rows = conn.execute('''
            SELECT
                emp.id         as employee_id,
                emp.name,
                emp.group_id,
                emp.lavozim,
                COALESCE(emp.work_start, g.work_start, '09:00')     as work_start,
                COALESCE(emp.work_finish, g.work_finish, '18:00')   as work_finish,
                COALESCE(emp.work_begin, g.work_begin, '06:00')     as work_begin,
                COALESCE(emp.grace_minutes, g.grace_minutes, 0)     as grace_minutes,
                CASE WHEN emp.work_start IS NOT NULL OR emp.work_finish IS NOT NULL
                      OR emp.work_begin IS NOT NULL OR emp.grace_minutes IS NOT NULL
                     THEN 1 ELSE 0 END as has_custom_schedule,
                MIN(CASE
                    WHEN e.direction = 'in'
                     AND time(e.event_time) >= COALESCE(emp.work_begin, g.work_begin, '06:00')
                    THEN e.event_time
                END) as first_in,
                MAX(e.event_time) as last_out
            FROM employees emp
            LEFT JOIN groups g ON g.id = emp.group_id
            LEFT JOIN events e
                ON e.employee_id = emp.id
                AND e.event_time >= ?
                AND e.event_time <  ?
            GROUP BY emp.id
            ORDER BY emp.group_id, emp.name
        ''', (f"{date_str}T00:00:00", f"{date_str}T23:59:59")).fetchall()
    return [dict(r) for r in rows]


def get_employees():
    with get_conn() as conn:
        rows = conn.execute(
            'SELECT * FROM employees ORDER BY group_id, name'
        ).fetchall()
    return [dict(r) for r in rows]


def get_groups():
    with get_conn() as conn:
        rows = conn.execute('SELECT * FROM groups ORDER BY name').fetchall()
    return [dict(r) for r in rows]


def add_group(gid, name, work_start='09:00', work_begin='06:00', **kwargs):
    with get_conn() as conn:
        conn.execute(
            'INSERT OR REPLACE INTO groups (id, name, work_start, work_begin) VALUES (?, ?, ?, ?)',
            (gid, name, work_start, work_begin)
        )
        conn.commit()


def update_group_settings(gid, work_start='09:00', work_begin='06:00', work_finish='18:00', work_days='1,2,3,4,5,6', grace_minutes=0, **kwargs):
    with get_conn() as conn:
        conn.execute(
            'UPDATE groups SET work_start=?, work_begin=?, work_finish=?, work_days=?, grace_minutes=? WHERE id=?',
            (work_start, work_begin, work_finish, work_days, int(grace_minutes), gid)
        )
        conn.commit()


def get_accounts():
    with get_conn() as conn:
        rows = conn.execute('SELECT * FROM accounts ORDER BY name').fetchall()
    return [dict(r) for r in rows]


def add_account(aid, name, login, password, linked_groups='', role='kadrlar'):
    with get_conn() as conn:
        conn.execute(
            'INSERT OR REPLACE INTO accounts (id, name, login, password, linked_groups, role) VALUES (?, ?, ?, ?, ?, ?)',
            (aid, name, login, password, linked_groups, role)
        )
        conn.commit()


def update_account(aid, name, login, password, linked_groups='', role='kadrlar', telegram_id=None):
    with get_conn() as conn:
        if password and password != '[[keep]]':
            conn.execute(
                'UPDATE accounts SET name=?, login=?, password=?, linked_groups=?, role=?, telegram_id=? WHERE id=?',
                (name, login, password, linked_groups, role, telegram_id, aid)
            )
        else:
            conn.execute(
                'UPDATE accounts SET name=?, login=?, linked_groups=?, role=?, telegram_id=? WHERE id=?',
                (name, login, linked_groups, role, telegram_id, aid)
            )
        conn.commit()


def get_account_by_telegram_id(tg_id):
    with get_conn() as conn:
        row = conn.execute(
            'SELECT * FROM accounts WHERE telegram_id=?', (str(tg_id),)
        ).fetchone()
    return dict(row) if row else None


def delete_account(aid):
    with get_conn() as conn:
        conn.execute('DELETE FROM accounts WHERE id=?', (aid,))
        conn.commit()


def delete_group(gid):
    with get_conn() as conn:
        conn.execute('DELETE FROM groups WHERE id = ?', (gid,))
        conn.commit()


def add_employee(emp_id, name, group_id, lavozim=''):
    with get_conn() as conn:
        conn.execute(
            'INSERT OR REPLACE INTO employees (id, name, group_id, lavozim) VALUES (?, ?, ?, ?)',
            (emp_id.zfill(8), name, group_id, lavozim)
        )
        conn.commit()


def update_employee(emp_id, name, group_id, lavozim=''):
    with get_conn() as conn:
        conn.execute(
            'UPDATE employees SET name=?, group_id=?, lavozim=? WHERE id=?',
            (name, group_id, lavozim, emp_id)
        )
        conn.commit()


def update_employee_schedule(emp_id, work_start=None, work_finish=None, work_begin=None, grace_minutes=None):
    """Xodimning shaxsiy ish grafigi — None bo'lsa guruh sozlamasi ishlatiladi"""
    with get_conn() as conn:
        conn.execute(
            'UPDATE employees SET work_start=?, work_finish=?, work_begin=?, grace_minutes=? WHERE id=?',
            (work_start, work_finish, work_begin,
             None if grace_minutes in (None, '') else int(grace_minutes), emp_id)
        )
        conn.commit()


def delete_employee(emp_id):
    with get_conn() as conn:
        conn.execute('DELETE FROM employees WHERE id = ?', (emp_id,))
        conn.commit()


def get_leaves(from_date, to_date):
    with get_conn() as conn:
        rows = conn.execute(
            'SELECT * FROM leaves WHERE end_date >= ? AND start_date <= ? ORDER BY start_date',
            (from_date, to_date)
        ).fetchall()
    return [dict(r) for r in rows]


def add_leave(employee_id, leave_type, start_date, end_date, note=''):
    with get_conn() as conn:
        conn.execute(
            'INSERT INTO leaves (employee_id, leave_type, start_date, end_date, note) VALUES (?,?,?,?,?)',
            (employee_id, leave_type, start_date, end_date, note)
        )
        conn.commit()


def delete_leave(lid):
    with get_conn() as conn:
        conn.execute('DELETE FROM leaves WHERE id=?', (lid,))
        conn.commit()


init_db()
