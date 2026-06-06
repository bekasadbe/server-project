"""
API server — bot va web panel uchun ma'lumot beradi.
Port: 8000
"""

from flask import Flask, jsonify, request
from database import get_first_entries
from datetime import date, datetime
import os

app = Flask(__name__)

# Token muhit o'zgaruvchisidan olinadi, bo'lmasa default
API_TOKEN = os.environ.get('API_TOKEN', 'Dav0mat@API#2026!')

# Ruxsat berilgan originlar
ALLOWED_ORIGINS = ['https://davomatlar.uz', 'http://localhost:5173', 'http://localhost:3000']


def check_token():
    token = request.headers.get('X-API-Token') or request.args.get('token')
    return token == API_TOKEN


@app.after_request
def add_cors(response):
    origin = request.headers.get('Origin', '')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Headers'] = 'X-API-Token, Content-Type'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    return response


@app.route('/attendance', methods=['GET'])
def attendance():
    if not check_token():
        return jsonify({'error': 'Unauthorized'}), 401

    date_str = request.args.get('date', date.today().strftime('%Y-%m-%d'))
    until    = request.args.get('until', datetime.now().strftime('%H:%M'))

    entries = get_first_entries(date_str, until)
    return jsonify({
        'date':    date_str,
        'until':   until,
        'entries': entries
    })


@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')})


if __name__ == '__main__':
    print("API server ishga tushdi — port 8000")
    app.run(host='127.0.0.1', port=8000, debug=False)
