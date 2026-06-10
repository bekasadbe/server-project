"""
Hikvision qurilmalaridan HTTP Push eventlarni qabul qiluvchi server.
Port: 6610
"""

from flask import Flask, request, jsonify
from database import save_event
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
import json

# Toshkent vaqti (UTC+5)
TZ_UZB = timezone(timedelta(hours=5))

def now_uzb():
    return datetime.now(TZ_UZB)

app = Flask(__name__)

# Deduplicate: {employee_id: last_saved_timestamp}
_last_seen    = {}
DEDUP_SECONDS = 60  # Bir xodim 60 soniyada bir marta saqlanadi


def is_duplicate(employee_id):
    now  = now_uzb().timestamp()
    last = _last_seen.get(employee_id, 0)
    if now - last < DEDUP_SECONDS:
        return True
    _last_seen[employee_id] = now
    return False


@app.route('/', methods=['POST'])
@app.route('/event', methods=['POST'])
@app.route('/hikvision', methods=['POST'])
def receive_event():
    try:
        if len(request.data) > 64 * 1024:
            return jsonify({'result': 'ok'}), 200

        employee_id = None
        event_time  = None
        camera_ip   = request.remote_addr

        # 1. Multipart form-data: event_log (JSON)
        if request.form and 'event_log' in request.form:
            event_log = request.form.get('event_log', '')
            try:
                data = json.loads(event_log)
                ac = data.get('AccessControllerEvent', data)
                employee_id = str(ac.get('employeeNoString', '') or ac.get('cardNo', ''))
                camera_ip   = data.get('ipAddress') or camera_ip
                event_time  = data.get('dateTime') or data.get('time') or ''
            except Exception:
                pass

        # 2. XML body
        elif request.data:
            raw = request.data.decode('utf-8', errors='ignore').strip()
            if raw:
                root = ET.fromstring(raw)
                ns   = {'h': 'http://www.hikvision.com/ver20/XMLSchema'}
                def find(tag):
                    el = root.find(f'h:{tag}', ns)
                    if el is None:
                        el = root.find(tag)
                    return el.text.strip() if el is not None and el.text else ''
                employee_id = find('employeeNoString') or find('cardNo')
                camera_ip   = find('ipAddress') or camera_ip

        # 3. JSON body
        elif request.is_json:
            data = request.get_json(silent=True) or {}
            ac = data.get('AccessControllerEvent', data)
            employee_id = str(ac.get('employeeNoString', '') or ac.get('cardNo', ''))
            camera_ip   = data.get('ipAddress') or camera_ip

        else:
            return jsonify({'result': 'ok'}), 200

        if not employee_id:
            return jsonify({'result': 'ok'}), 200

        # Kamera event sanasini tekshiramiz — faqat bugun bo'lsa saqlaymiz
        if event_time:
            try:
                event_date = event_time[:10]
                today = now_uzb().strftime('%Y-%m-%d')
                if event_date != today:
                    return jsonify({'result': 'ok'}), 200
            except Exception:
                pass

        # Deduplicate — 60 soniyada bir marta
        if is_duplicate(employee_id):
            return jsonify({'result': 'ok'}), 200

        # Server vaqtini saqlash (Toshkent UTC+5)
        server_time = now_uzb().strftime('%Y-%m-%dT%H:%M:%S')
        save_event(employee_id, server_time, camera_ip)
        print(f"[{now_uzb().strftime('%H:%M:%S')}] EVENT | {employee_id} | {server_time} | {camera_ip}", flush=True)

    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] XATOLIK: {e}", flush=True)

    return jsonify({'result': 'ok'}), 200


if __name__ == '__main__':
    print("Hikvision server ishga tushdi — port 6610", flush=True)
    app.run(host='0.0.0.0', port=6610, debug=False)
