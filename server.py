"""
Hikvision qurilmalaridan HTTP Push eventlarni qabul qiluvchi server.
Port: 6610
"""

from flask import Flask, request, jsonify
from database import save_event, get_direction
import xml.etree.ElementTree as ET
from datetime import datetime

app = Flask(__name__)


@app.route('/', methods=['POST'])
@app.route('/event', methods=['POST'])
@app.route('/hikvision', methods=['POST'])
def receive_event():
    try:
        if len(request.data) > 64 * 1024:
            return jsonify({'result': 'ok'}), 200

        raw = request.data.decode('utf-8', errors='ignore')
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Event keldi: {raw[:300]}")

        root = ET.fromstring(raw)
        ns   = {'h': 'http://www.hikvision.com/ver20/XMLSchema'}

        def find(tag):
            el = root.find(f'h:{tag}', ns)
            if el is None:
                el = root.find(tag)
            return el.text.strip() if el is not None and el.text else ''

        employee_id = find('employeeNoString') or find('cardNo')
        event_time  = find('dateTime') or find('time')

        # Kamera IP — XML dan olamiz, bo'lmasa request IP
        camera_ip   = find('ipAddress') or request.remote_addr
        direction   = get_direction(camera_ip)

        if employee_id and event_time:
            save_event(employee_id, event_time, camera_ip, direction)
            arrow = '→ KIRDI' if direction == 'in' else '← CHIQDI'
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ {arrow} | {employee_id} | {event_time} | {camera_ip}")
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️ ID yoki vaqt yo'q")

    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Xatolik: {e}")

    return jsonify({'result': 'ok'}), 200


if __name__ == '__main__':
    print("Hikvision server ishga tushdi — port 6610")
    app.run(host='0.0.0.0', port=6610, debug=False)
