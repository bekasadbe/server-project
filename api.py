"""
API server — web panel uchun ma'lumot beradi.
Port: 8000
"""

from flask import Flask, jsonify, request
from database import (
    get_attendance, get_recent_events,
    get_employees, get_groups,
    add_employee, update_employee, delete_employee, update_employee_schedule,
    add_group, update_group_settings, delete_group,
    get_accounts, add_account, update_account, delete_account, get_account_by_telegram_id,
    save_event, get_direction,
    hash_password, verify_password, is_hashed, get_conn,
    get_leaves, add_leave, delete_leave
)
from datetime import date, datetime, timezone, timedelta
from collections import defaultdict
import os, time

TZ_UZB = timezone(timedelta(hours=5))
def now_uzb():
    return datetime.now(TZ_UZB)

app = Flask(__name__)

# ── RATE LIMITING (/auth uchun) ───────────────────────────
_login_attempts = defaultdict(list)  # ip → [timestamp, ...]

MAX_ATTEMPTS = 5
WINDOW_SEC   = 300  # 5 daqiqa

def check_rate_limit(ip):
    now = time.time()
    attempts = [t for t in _login_attempts[ip] if now - t < WINDOW_SEC]
    _login_attempts[ip] = attempts
    if len(attempts) >= MAX_ATTEMPTS:
        return False, 0
    _login_attempts[ip].append(now)
    remaining = MAX_ATTEMPTS - len(_login_attempts[ip])
    return True, remaining

API_TOKEN = os.environ.get('API_TOKEN', 'Dav0mat@API#2026!')

ALLOWED_ORIGINS = [
    'https://davomatlar.uz',
    'http://davomatlar.uz',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://192.168.5.127:8088',
]


def check_token():
    token = request.headers.get('X-API-Token') or request.args.get('token')
    return token == API_TOKEN


@app.after_request
def add_cors(response):
    origin = request.headers.get('Origin', '')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Headers'] = 'X-API-Token, Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    return response


@app.route('/', methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options(path=''):
    return '', 204


# ── DAVOMAT ──────────────────────────────────────────────

@app.route('/attendance', methods=['GET'])
def attendance():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401

    date_str = request.args.get('date', now_uzb().strftime('%Y-%m-%d'))
    rows     = get_attendance(date_str)

    for r in rows:
        if r.get('first_in'):
            r['first_in'] = r['first_in'][11:16]
        if r.get('last_out'):
            r['last_out'] = r['last_out'][11:16]

    return jsonify({'date': date_str, 'attendance': rows})


# ── JONLI LENTA ──────────────────────────────────────────

@app.route('/events/live', methods=['GET'])
def live_events():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401

    limit  = min(int(request.args.get('limit', 50)), 200)
    events = get_recent_events(limit)

    for e in events:
        if e.get('event_time'):
            e['time_short'] = e['event_time'][11:16]

    return jsonify({'events': events})


# ── XODIMLAR ─────────────────────────────────────────────

@app.route('/employees', methods=['GET'])
def employees_list():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'employees': get_employees(), 'groups': get_groups(), 'accounts': get_accounts()})


@app.route('/employees', methods=['POST'])
def employee_add():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data     = request.json or {}
    emp_id   = data.get('id', '').strip()
    name     = data.get('name', '').strip()
    group_id = data.get('group_id', '').strip()
    lavozim  = data.get('lavozim', '').strip()
    if not emp_id or not name or not group_id:
        return jsonify({'error': 'id, name, group_id majburiy'}), 400
    add_employee(emp_id, name, group_id, lavozim)
    return jsonify({'ok': True})


@app.route('/employees/<emp_id>', methods=['PUT'])
def employee_update(emp_id):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    update_employee(emp_id, data.get('name', ''), data.get('group_id', ''), data.get('lavozim', ''))
    return jsonify({'ok': True})


@app.route('/employees/<emp_id>', methods=['DELETE'])
def employee_delete(emp_id):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    delete_employee(emp_id)
    return jsonify({'ok': True})


@app.route('/employees/<emp_id>/schedule', methods=['PUT'])
def employee_schedule_update(emp_id):
    """Xodimning shaxsiy ish grafigi — bo'sh qoldirilsa guruh sozlamasi ishlatiladi"""
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    update_employee_schedule(
        emp_id,
        work_start=data.get('work_start') or None,
        work_finish=data.get('work_finish') or None,
        work_begin=data.get('work_begin') or None,
        grace_minutes=data.get('grace_minutes') if data.get('grace_minutes') not in ('', None) else None,
    )
    return jsonify({'ok': True})


# ── AKKAUNTLAR ───────────────────────────────────────────

@app.route('/accounts', methods=['GET'])
def accounts_list():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'accounts': get_accounts()})


@app.route('/accounts', methods=['POST'])
def account_add():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data  = request.json or {}
    name  = data.get('name', '').strip()
    login = data.get('login', '').strip()
    plain = data.get('password', '').strip()
    linked = ','.join([g.strip() for g in data.get('linked_groups', []) if g.strip()])
    if not name or not login or not plain:
        return jsonify({'error': 'name, login, password majburiy'}), 400
    hashed = hash_password(plain) if not is_hashed(plain) else plain
    aid = 'acc_' + login.lower().replace(' ', '_')
    role = data.get('role', 'kadrlar')
    add_account(aid, name, login, hashed, linked, role)
    return jsonify({'ok': True})


@app.route('/accounts/<aid>', methods=['PUT'])
def account_update(aid):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data   = request.json or {}
    name   = data.get('name', '').strip()
    login  = data.get('login', '').strip()
    plain  = data.get('password', '').strip()
    linked = ','.join([g.strip() for g in data.get('linked_groups', []) if g.strip()])
    if plain and plain != '[[keep]]':
        hashed = hash_password(plain) if not is_hashed(plain) else plain
    else:
        hashed = '[[keep]]'
    role        = data.get('role', 'kadrlar')
    telegram_id = data.get('telegram_id', '').strip() or None
    update_account(aid, name, login, hashed, linked, role, telegram_id)
    return jsonify({'ok': True})


@app.route('/accounts/<aid>', methods=['DELETE'])
def account_delete(aid):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    delete_account(aid)
    return jsonify({'ok': True})


# ── GURUHLAR ─────────────────────────────────────────────

@app.route('/groups', methods=['POST'])
def group_add():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    gid  = data.get('id', '').strip()
    name = data.get('name', '').strip()
    if not gid or not name:
        return jsonify({'error': 'id va name majburiy'}), 400
    add_group(gid, name,
              work_start=data.get('work_start', '09:00'),
              work_begin=data.get('work_begin', '06:00'))
    return jsonify({'ok': True})


@app.route('/groups/<gid>', methods=['PUT'])
def group_update(gid):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    update_group_settings(gid,
        work_start=data.get('work_start', '09:00'),
        work_begin=data.get('work_begin', '06:00'),
        work_finish=data.get('work_finish', '18:00'),
        work_days=data.get('work_days', '1,2,3,4,5,6'),
        grace_minutes=data.get('grace_minutes', 0))
    return jsonify({'ok': True})


@app.route('/groups/<gid>', methods=['DELETE'])
def group_delete(gid):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    delete_group(gid)
    return jsonify({'ok': True})


# ── BOSHQA ───────────────────────────────────────────────

@app.route('/events/push', methods=['POST'])
def events_push():
    """Lokal forwarder dan camera eventlarni qabul qilish"""
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    employee_id = str(data.get('employee_id', '')).strip()
    event_time  = str(data.get('event_time',  '')).strip()
    camera_ip   = str(data.get('camera_ip',   '')).strip()
    direction   = data.get('direction') or get_direction(camera_ip)

    if not employee_id or not event_time:
        return jsonify({'error': 'employee_id va event_time majburiy'}), 400

    save_event(employee_id, event_time, camera_ip, direction)
    arrow = '→ KIRDI' if direction == 'in' else '← CHIQDI'
    print(f"[{datetime.now().strftime('%H:%M:%S')}] PUSH {arrow} | {employee_id} | {event_time} | {camera_ip}")
    return jsonify({'ok': True})


@app.route('/auth/telegram', methods=['GET'])
def auth_telegram():
    tg_id = request.args.get('tg_id', '').strip()
    if not tg_id:
        return jsonify({'ok': False, 'error': 'tg_id kerak'}), 400
    acc = get_account_by_telegram_id(tg_id)
    if not acc:
        return jsonify({'ok': False, 'error': 'Telegram ID biriktirilmagan'}), 404
    linked = [x.strip() for x in (acc.get('linked_groups') or '').split(',') if x.strip()]
    return jsonify({'ok': True, 'user': {
        'username':      acc['login'],
        'role':          acc.get('role', 'kadrlar'),
        'linkedGroupIds': linked,
        'name':          acc.get('name', ''),
    }})


@app.route('/auth', methods=['POST'])
def auth_login():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()
    allowed, remaining = check_rate_limit(ip)
    if not allowed:
        return jsonify({'ok': False, 'error': "Juda ko'p urinish. 5 daqiqa kuting.", 'blocked': True}), 429

    data     = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'ok': False, 'error': 'Login va parol kiriting', 'remaining': remaining}), 400

    # Super admin
    admin_pass = os.environ.get('ADMIN_PASSWORD', 'Inno@Adm!n2026')
    if username == 'admin':
        ok = verify_password(password, admin_pass) if is_hashed(admin_pass) else (password == admin_pass)
        if ok:
            return jsonify({'ok': True, 'role': 'admin', 'name': 'Administrator', 'groupId': None})

    # Kadrlar — accounts jadvalidan tekshirish
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, name, login, password, linked_groups, role FROM accounts WHERE login=?",
            (username,)
        ).fetchone()
    if row and row['password'] and verify_password(password, row['password']):
        linked = [g.strip() for g in (row['linked_groups'] or '').split(',') if g.strip()]
        acc_role = row['role'] if row['role'] else 'kadrlar'
        all_groups = linked if linked else []
        return jsonify({'ok': True, 'role': acc_role, 'name': row['name'], 'groupId': all_groups[0] if all_groups else None, 'accountId': row['id'], 'username': row['login'], 'linkedGroupIds': linked})

    print(f"[AUTH FAIL] ip={ip} user={username}")
    return jsonify({'ok': False, 'error': "Login yoki parol noto'g'ri", 'remaining': remaining}), 401


@app.route('/leaves', methods=['GET'])
def leaves_list():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    from_date = request.args.get('from', now_uzb().strftime('%Y-%m-%d'))
    to_date   = request.args.get('to',   from_date)
    return jsonify({'leaves': get_leaves(from_date, to_date)})


@app.route('/leaves', methods=['POST'])
def leave_add():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    emp_id     = data.get('employee_id', '').strip()
    leave_type = data.get('leave_type', '').strip()
    start_date = data.get('start_date', '').strip()
    end_date   = data.get('end_date', '').strip()
    note       = data.get('note', '').strip()
    if not emp_id or not leave_type or not start_date or not end_date:
        return jsonify({'error': 'employee_id, leave_type, start_date, end_date majburiy'}), 400
    add_leave(emp_id, leave_type, start_date, end_date, note)
    return jsonify({'ok': True})


@app.route('/leaves/<int:lid>', methods=['DELETE'])
def leave_delete(lid):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    delete_leave(lid)
    return jsonify({'ok': True})


@app.route('/attendance/range', methods=['GET'])
def attendance_range():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401

    from_date = request.args.get('from', now_uzb().strftime('%Y-%m-%d'))
    to_date   = request.args.get('to',   from_date)

    import datetime as dt_mod
    try:
        d0 = dt_mod.date.fromisoformat(from_date)
        d1 = dt_mod.date.fromisoformat(to_date)
    except Exception:
        return jsonify({'error': 'from/to format: YYYY-MM-DD'}), 400

    if d1 < d0:
        d0, d1 = d1, d0
    if (d1 - d0).days > 62:
        return jsonify({'error': 'Maksimal 62 kun'}), 400

    days = [(d0 + dt_mod.timedelta(days=i)).isoformat() for i in range((d1 - d0).days + 1)]
    from_dt = f"{from_date}T00:00:00"
    to_dt   = f"{to_date}T23:59:59"

    from database import get_groups as _get_groups, get_employees as _get_employees
    group_map = {g['id']: g for g in _get_groups()}

    with get_conn() as conn:
        rows = conn.execute('''
            SELECT
                emp.id       as employee_id,
                emp.name,
                emp.group_id,
                emp.lavozim,
                COALESCE(emp.work_start, g.work_start, '09:00')   as work_start,
                COALESCE(emp.work_finish, g.work_finish, '18:00') as work_finish,
                COALESCE(emp.work_begin, g.work_begin, '06:00')   as work_begin,
                COALESCE(emp.grace_minutes, g.grace_minutes, 0)   as grace_minutes,
                CASE WHEN emp.work_start IS NOT NULL OR emp.work_finish IS NOT NULL
                      OR emp.work_begin IS NOT NULL OR emp.grace_minutes IS NOT NULL
                     THEN 1 ELSE 0 END as has_custom_schedule,
                date(e.event_time) as day,
                MIN(CASE
                    WHEN e.direction = 'in'
                     AND time(e.event_time) >= COALESCE(emp.work_begin, g.work_begin, '06:00')
                    THEN time(e.event_time)
                END) as first_in,
                MAX(e.event_time) as last_out
            FROM employees emp
            LEFT JOIN groups g ON g.id = emp.group_id
            LEFT JOIN events e
                ON e.employee_id = emp.id
                AND e.event_time >= ?
                AND e.event_time <= ?
            GROUP BY emp.id, date(e.event_time)
        ''', (from_dt, to_dt)).fetchall()

    emp_days = {}
    for r in rows:
        eid = r['employee_id']
        if eid not in emp_days:
            emp_days[eid] = {
                'id': eid, 'name': r['name'], 'group_id': r['group_id'],
                'lavozim': r['lavozim'] or '',
                'work_start': r['work_start'], 'work_finish': r['work_finish'],
                'work_begin': r['work_begin'], 'grace_minutes': r['grace_minutes'],
                'has_custom_schedule': bool(r['has_custom_schedule']),
                'days': {}
            }
        if r['day'] and r['first_in']:
            fi = r['first_in'][:5]
            lo = r['last_out'][11:16] if r['last_out'] else None
            # worked minutes
            worked = None
            if fi and lo:
                h1, m1 = map(int, fi.split(':'))
                h2, m2 = map(int, lo.split(':'))
                mins = (h2 - h1) * 60 + (m2 - m1)
                if mins > 0:
                    worked = f"{mins // 60}s {mins % 60}d"
            emp_days[eid]['days'][r['day']] = {'in': fi, 'out': lo, 'worked': worked}

    for emp in _get_employees():
        if emp['id'] not in emp_days:
            g = group_map.get(emp['group_id'], {})
            emp_days[emp['id']] = {
                'id': emp['id'], 'name': emp['name'], 'group_id': emp['group_id'],
                'lavozim': emp.get('lavozim', '') or '',
                'work_start': emp.get('work_start') or g.get('work_start', '09:00'),
                'work_finish': emp.get('work_finish') or g.get('work_finish', '18:00'),
                'work_begin': emp.get('work_begin') or g.get('work_begin', '06:00'),
                'grace_minutes': emp.get('grace_minutes') if emp.get('grace_minutes') is not None else g.get('grace_minutes', 0),
                'has_custom_schedule': bool(emp.get('work_start') or emp.get('work_finish') or emp.get('work_begin') or emp.get('grace_minutes') is not None),
                'days': {}
            }

    employees = sorted(emp_days.values(), key=lambda e: (e['group_id'], e['name']))
    return jsonify({'from': from_date, 'to': to_date, 'days': days, 'employees': employees})


@app.route('/attendance/monthly', methods=['GET'])
def attendance_monthly():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401

    month = request.args.get('month', now_uzb().strftime('%Y-%m'))
    try:
        year, mon = int(month[:4]), int(month[5:7])
    except Exception:
        return jsonify({'error': 'month format: YYYY-MM'}), 400

    import calendar as cal_mod
    import datetime as dt_mod
    days_in_month = cal_mod.monthrange(year, mon)[1]
    from_dt = f"{month}-01T00:00:00"
    to_dt   = f"{month}-{days_in_month:02d}T23:59:59"

    from database import get_groups as _get_groups, get_employees as _get_employees
    groups_list = _get_groups()
    group_map   = {g['id']: g for g in groups_list}

    with get_conn() as conn:
        rows = conn.execute('''
            SELECT
                emp.id       as employee_id,
                emp.name,
                emp.group_id,
                emp.lavozim,
                COALESCE(emp.work_start, g.work_start, '09:00')   as work_start,
                COALESCE(emp.work_begin, g.work_begin, '06:00')   as work_begin,
                COALESCE(emp.grace_minutes, g.grace_minutes, 0)   as grace_minutes,
                date(e.event_time) as day,
                MIN(CASE
                    WHEN e.direction = 'in'
                     AND time(e.event_time) >= COALESCE(emp.work_begin, g.work_begin, '06:00')
                    THEN time(e.event_time)
                END) as first_in
            FROM employees emp
            LEFT JOIN groups g ON g.id = emp.group_id
            LEFT JOIN events e
                ON e.employee_id = emp.id
                AND e.event_time >= ?
                AND e.event_time <= ?
            GROUP BY emp.id, date(e.event_time)
            ORDER BY emp.group_id, emp.name, day
        ''', (from_dt, to_dt)).fetchall()

    emp_data = {}
    for r in rows:
        eid = r['employee_id']
        if eid not in emp_data:
            emp_data[eid] = {
                'id': eid, 'name': r['name'], 'group_id': r['group_id'],
                'lavozim': r['lavozim'] or '', 'total_came': 0,
                'total_late_days': 0, 'total_late_minutes': 0
            }
        if r['first_in'] and r['day']:
            emp_data[eid]['total_came'] += 1
            work_start   = r['work_start'] or '09:00'
            grace        = int(r['grace_minutes'] or 0)
            ws_h, ws_m   = map(int, work_start.split(':'))
            fi_h, fi_m   = map(int, r['first_in'][:5].split(':'))
            threshold    = ws_h * 60 + ws_m + grace
            arrived      = fi_h * 60 + fi_m
            late_mins    = arrived - threshold
            if late_mins > 0:
                emp_data[eid]['total_late_days']    += 1
                emp_data[eid]['total_late_minutes'] += late_mins

    # Ensure employees with 0 attendance appear
    for emp in _get_employees():
        if emp['id'] not in emp_data:
            emp_data[emp['id']] = {
                'id': emp['id'], 'name': emp['name'], 'group_id': emp['group_id'],
                'lavozim': emp.get('lavozim', '') or '', 'total_came': 0,
                'total_late_days': 0, 'total_late_minutes': 0
            }

    # Count Mon-Sat working days in the month
    working_days = sum(
        1 for d in range(1, days_in_month + 1)
        if dt_mod.date(year, mon, d).weekday() < 6
    )

    employees = sorted(emp_data.values(), key=lambda e: (e['group_id'], e['name']))
    return jsonify({
        'month': month,
        'days_in_month': days_in_month,
        'working_days': working_days,
        'employees': employees
    })


@app.route('/import/csv', methods=['POST'])
def import_csv():
    """Hikvision CSV eksportidan events bazaga import qilish"""
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401

    import csv, io

    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'file yuborilmadi'}), 400

    content = file.read().decode('utf-8-sig', errors='replace')
    reader  = csv.DictReader(io.StringIO(content))

    # Hikvision ustun nomlarini normallashtirish
    COL_MAP = {
        'person id': 'person_id', 'personid': 'person_id', 'id': 'person_id',
        'date': 'date',
        'first-in': 'first_in', 'firstin': 'first_in', 'first in': 'first_in',
        'last-out': 'last_out', 'lastout': 'last_out', 'last out': 'last_out',
    }

    inserted = 0
    skipped  = 0
    errors   = []

    with get_conn() as conn:
        known_ids = set(r[0] for r in conn.execute('SELECT id FROM employees').fetchall())

        for i, row in enumerate(reader, start=2):
            # Normalize keys
            norm = {COL_MAP.get(k.strip().lower(), k.strip().lower()): v.strip() for k, v in row.items()}

            person_id = norm.get('person_id', '').strip()
            date_str  = norm.get('date', '').strip()   # YYYY-MM-DD
            first_in  = norm.get('first_in', '').strip()
            last_out  = norm.get('last_out', '').strip()

            if not person_id or not date_str or date_str == '-':
                skipped += 1
                continue

            if person_id not in known_ids:
                errors.append(f"Qator {i}: employee_id '{person_id}' bazada yo'q — o'tkazib yuborildi")
                skipped += 1
                continue

            # Sanani normallashtirish: DD.MM.YYYY → YYYY-MM-DD
            if '.' in date_str and len(date_str) == 10:
                parts = date_str.split('.')
                date_str = f"{parts[2]}-{parts[1]}-{parts[0]}"

            # IN event
            if first_in and first_in != '-':
                # vaqt formati: HH:MM yoki HH:MM:SS
                t = first_in[:5]
                event_time = f"{date_str}T{first_in if len(first_in)==8 else t+':00'}"
                conn.execute(
                    'INSERT OR IGNORE INTO events (employee_id, event_time, device_ip, direction) VALUES (?,?,?,?)',
                    (person_id, event_time, 'import', 'in')
                )
                inserted += 1

            # OUT event
            if last_out and last_out != '-':
                event_time = f"{date_str}T{last_out if len(last_out)==8 else last_out[:5]+':00'}"
                conn.execute(
                    'INSERT OR IGNORE INTO events (employee_id, event_time, device_ip, direction) VALUES (?,?,?,?)',
                    (person_id, event_time, 'import', 'out')
                )
                inserted += 1

    return jsonify({
        'ok': True,
        'inserted': inserted,
        'skipped': skipped,
        'errors': errors[:20]  # max 20 ta xato ko'rsatiladi
    })


@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'time': now_uzb().strftime('%Y-%m-%d %H:%M:%S')})


if __name__ == '__main__':
    print("API server ishga tushdi — port 8000")
    app.run(host='0.0.0.0', port=8000, debug=False)
