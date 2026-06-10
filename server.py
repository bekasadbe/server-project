"""
Hikvision qurilmalaridan HTTP Push eventlarni qabul qiluvchi server.
Port: 6610
Kamera multipart/form-data + JSON yuboradi (event_log field)
"""

from flask import Flask, request, jsonify
from database import save_event, get_direction
import xml.etree.ElementTree as ET
from datetime import datetime
import json

app = Flask(__name__)


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
            print(f"[{datetime.now().strftime('%H:%M:%S')}] event_log: {event_log[:500]}")
            try:
                data = json.loads(event_log)
                ac = data.get('AccessControllerEvent', data)
                employee_id = str(ac.get('employeeNoString', '') or ac.get('cardNo', ''))
                event_time  = data.get('dateTime') or data.get('time') or datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
                camera_ip   = data.get('ipAddress') or camera_ip
            except Exception as je:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] JSON parse xato: {je}")

        # 2. XML body
        elif request.data:
            raw = request.data.decode('utf-8', errors='ignore').strip()
            if raw:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] XML: {raw[:500]}")
                root = ET.fromstring(raw)
                ns   = {'h': 'http://www.hikvision.com/ver20/XMLSchema'}

                def find(tag):
                    el = root.find(f'h:{tag}', ns)
                    if el is None:
                        el = root.find(tag)
                    return el.text.strip() if el is not None and el.text else ''

                employee_id = find('employeeNoString') or find('cardNo')
                event_time  = find('dateTime') or find('time')
                camera_ip   = find('ipAddress') or camera_ip

        # 3. JSON body
        elif request.is_json:
            data = request.get_json(silent=True) or {}
            print(f"[{datetime.now().strftime('%H:%M:%S')}] JSON body: {str(data)[:500]}")
            ac = data.get('AccessControllerEvent', data)
            employee_id = str(ac.get('employeeNoString', '') or ac.get('cardNo', ''))
            event_time  = data.get('dateTime') or datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
            camera_ip   = data.get('ipAddress') or camera_ip

        else:
            # Heartbeat ping — qaytaramiz
            return jsonify({'result': 'ok'}), 200

        # Saqlash
        if employee_id and event_time:
            direction = get_direction(camera_ip)
            save_event(employee_id, event_time, camera_ip, direction)
            arrow = '→ KIRDI' if direction == 'in' else '← CHIQDI'
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ {arrow} | {employee_id} | {event_time} | {camera_ip}")
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️ ID yoki vaqt topilmadi")

    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Xatolik: {e}")

    return jsonify({'result': 'ok'}), 200


if __name__ == '__main__':
    print("Hikvision server ishga tushdi — port 6610")
    app.run(host='0.0.0.0', port=6610, debug=False)
