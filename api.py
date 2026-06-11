"""
API server — web panel uchun ma'lumot beradi.
Port: 8000
"""

from flask import Flask, jsonify, request
from database import (
    get_attendance, get_recent_events,
    get_employees, get_groups,
    add_employee, update_employee, delete_employee,
    add_group, update_group_settings, delete_group,
    save_event, get_direction,
    hash_password, verify_password, is_hashed, get_conn
)
from datetime import date, datetime, timezone, timedelta
import os

TZ_UZB = timezone(timedelta(hours=5))
def now_uzb():
    return datetime.now(TZ_UZB)

app = Flask(__name__)

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
    return jsonify({'employees': get_employees(), 'groups': get_groups()})


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
    plain_pass = data.get('password', '')
    hashed = hash_password(plain_pass) if plain_pass and not is_hashed(plain_pass) else plain_pass
    add_group(gid, name,
              login=data.get('login', ''),
              password=hashed,
              work_start=data.get('work_start', '09:00'),
              work_begin=data.get('work_begin', '06:00'))
    return jsonify({'ok': True})


@app.route('/groups/<gid>', methods=['PUT'])
def group_update(gid):
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    plain_pass = data.get('password', '')
    # Agar yangi parol berilgan bo'lsa — hash qilamiz
    hashed = hash_password(plain_pass) if plain_pass and not is_hashed(plain_pass) else plain_pass
    update_group_settings(
        gid,
        login=data.get('login', ''),
        password=hashed,
        work_start=data.get('work_start', '09:00'),
        work_begin=data.get('work_begin', '06:00'),
    )
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


@app.route('/auth', methods=['POST'])
def auth_login():
    data     = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    # Super admin
    admin_pass = os.environ.get('ADMIN_PASSWORD', 'Inno@Adm!n2026')
    if username == 'admin':
        ok = verify_password(password, admin_pass) if is_hashed(admin_pass) else (password == admin_pass)
        if ok:
            return jsonify({'ok': True, 'role': 'admin', 'name': 'Administrator', 'groupId': None})

    # Kadrlar — bazadan tekshirish (bcrypt)
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, name, login, password FROM groups WHERE login=?",
            (username,)
        ).fetchone()
    if row and row['password'] and verify_password(password, row['password']):
        return jsonify({'ok': True, 'role': 'kadrlar', 'name': row['name'], 'groupId': row['id'], 'username': row['login']})

    return jsonify({'ok': False, 'error': "Login yoki parol noto'g'ri"}), 401


@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'time': now_uzb().strftime('%Y-%m-%d %H:%M:%S')})


if __name__ == '__main__':
    print("API server ishga tushdi — port 8000")
    app.run(host='0.0.0.0', port=8000, debug=False)
