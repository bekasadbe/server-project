"""
API server — bot va web panel uchun ma'lumot beradi.
Port: 8000
"""

from flask import Flask, jsonify, request
from database import get_first_entries
from datetime import date, datetime

app = Flask(__name__)


@app.route('/attendance', methods=['GET'])
def attendance():
    """
    GET /attendance?date=2026-06-05&until=10:30
    """
    date_str = request.args.get('date', date.today().strftime('%Y-%m-%d'))
    until    = request.args.get('until', datetime.now().strftime('%H:%M'))

    entries = get_first_entries(date_str, until)
    return jsonify({
        'date':    date_str,
        'until':   until,
        'entries': entries   # {employee_id: first_time}
    })


@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')})


if __name__ == '__main__':
    print("API server ishga tushdi — port 8000")
    app.run(host='0.0.0.0', port=8000, debug=False)
