"""
API server — web panel uchun ma'lumot beradi.
Port: 8000
"""

from flask import Flask, jsonify, request
from database import (
    get_attendance, get_recent_events,
    get_employees, get_groups,
    add_employee, update_employee, delete_employee,
    get_first_entries
)
from datetime import date, datetime
import os

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

    date_str = request.args.get('date', date.today().strftime('%Y-%m-%d'))
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


# ── BOSHQA ───────────────────────────────────────────────

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')})


if __name__ == '__main__':
    print("API server ishga tushdi — port 8000")
    app.run(host='0.0.0.0', port=8000, debug=False)
