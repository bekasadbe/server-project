"""
SQLite database — xodimlar va eventlar saqlanadi.
"""
import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'davomat.db')

# Kirish/chiqish kameralari
ENTRY_CAMERAS = {'10.0.3.1', '10.0.3.2'}
EXIT_CAMERAS  = {'10.0.3.3', '10.0.3.4'}

def get_direction(camera_ip):
    if camera_ip in ENTRY_CAMERAS:
        return 'in'
    if camera_ip in EXIT_CAMERAS:
        return 'out'
    return 'in'

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS groups (
                id   TEXT PRIMARY KEY,
                name TEXT NOT NULL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS employees (
                id       TEXT PRIMARY KEY,
                name     TEXT NOT NULL,
                group_id TEXT,
                lavozim  TEXT DEFAULT '',
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )
        ''')
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

        # Default guruhlar
        conn.execute("INSERT OR IGNORE INTO groups (id, name) VALUES ('inno',   'Inno Texnopark')")
        conn.execute("INSERT OR IGNORE INTO groups (id, name) VALUES ('milliy', 'Milliy Offis')")

        # Default xodimlar
        employees = [
            ('00000014','Urinboyev Sadriddin','inno'),
            ('00000016','Abdunofiyev Suxbatjon','inno'),
            ('00000017',"Ne'matov Asadbek",'inno'),
            ('00000021','Toshmatov Shoxruh','inno'),
            ('00000022','Maxamatov Xamidulla','inno'),
            ('00000024','Abdujabbarov Abdumuxtor','inno'),
            ('00000025','Yusupov Baxrom','inno'),
            ('00000026','Atabayev Murodjon','inno'),
            ('00000028','Torayev Mixritdin','inno'),
            ('00000029','Ermatov Xamid','inno'),
            ('00000030','Xaydarova Shaxnoza','inno'),
            ('00000031','Darvisheva Nodira','inno'),
            ('00000032','Yakubova Rano','inno'),
            ('00000099','Doniyorov Ahror','inno'),
            ('00000100','Sardor Madrimov','inno'),
            ('00000137','Begzod Qodirov','inno'),
            ('00000142','Shoxrux Asqaraliyev','inno'),
            ('00000143','Salohiddinov Mahmud','inno'),
            ('00000147','Sobirjon Boriyev','inno'),
            ('00000166','Akbarova Dilsora','inno'),
            ('00000185','Umid Buxgalter','inno'),
            ('00000259','Buxgalter Nematjon','inno'),
            ('00000346','Kamola Rasulova','inno'),
            ('00000381','Nargiza Vazliyeva','inno'),
            ('00000401','Sarimov Fahriddin','inno'),
            ('00000405','Nodir Avezimbetov','inno'),
            ('00000415','Boymatov Elbek','inno'),
            ('00000425','Isayeva Feruza','inno'),
            ('00000426','Muzaffar Eshonqulov','inno'),
            ('00000500','Akbarxon Sobirxonov','inno'),
            ('00000009','Zafar Asrorov','milliy'),
            ('00000010','Erkin Davirov','milliy'),
            ('00000013','Allabergenov Shokhrukhbek','milliy'),
            ('00000019','Otaxonov Obidxon','milliy'),
            ('00000090','Baxtiyor Islomov','milliy'),
            ('00000149','Aziz Akramov','milliy'),
            ('00000154','Kenjayev Nuriddin','milliy'),
            ('00000414','Yaqubov Oktam','milliy'),
            ('00000422','Akbarali Yakubov','milliy'),
            ('00000423','Sanjarbek Usmonov','milliy'),
            ('00000424','Shaxobiddin Shamsiyev','milliy'),
            ('00000427','Malik Rashidov','milliy'),
            ('00000434','Otaxojayeva Madina','milliy'),
            ('00000436','Sultonova Aziza','milliy'),
            ('00000437','Saydivaliyeva Saida','milliy'),
            ('00000438','Pulatova Shaxnoza','milliy'),
            ('00000456','Sadirov Jamoliddin','milliy'),
            ('00000466','Ermataliyev Mehmonali','milliy'),
            ('00000467','Madaminova Shaxnoza','milliy'),
            ('00000473','Ibragimova Feruza','milliy'),
            ('00000490','Qurbonov Behzod','milliy'),
        ]
        for emp_id, name, group_id in employees:
            conn.execute(
                "INSERT OR IGNORE INTO employees (id, name, group_id) VALUES (?, ?, ?)",
                (emp_id, name, group_id)
            )
        conn.commit()
    print("✅ Database tayyor")


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
    """Bir kun uchun: birinchi kirish + oxirgi chiqish"""
    with get_conn() as conn:
        rows = conn.execute('''
            SELECT
                emp.id         as employee_id,
                emp.name,
                emp.group_id,
                emp.lavozim,
                MIN(CASE WHEN e.direction='in'  THEN e.event_time END) as first_in,
                MAX(CASE WHEN e.direction='out' THEN e.event_time END) as last_out
            FROM employees emp
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


def delete_employee(emp_id):
    with get_conn() as conn:
        conn.execute('DELETE FROM employees WHERE id = ?', (emp_id,))
        conn.commit()


# Eski funksiya — backward compatibility
def get_first_entries(date_str, end_time):
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


init_db()
