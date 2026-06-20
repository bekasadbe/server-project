import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')

script = b"""
import sqlite3
conn = sqlite3.connect('/app/data/davomat.db')
conn.row_factory = sqlite3.Row

print("=== Direction taqsimoti ===")
dirs = conn.execute("SELECT direction, COUNT(*) as cnt FROM events GROUP BY direction").fetchall()
for d in dirs:
    print("  %s: %d ta" % (d['direction'], d['cnt']))

print("\\n=== Oxirgi 10 ta event ===")
sql = "SELECT e.event_time, e.direction, e.device_ip, emp.name FROM events e LEFT JOIN employees emp ON e.employee_id = emp.id ORDER BY e.event_time DESC LIMIT 10"
events = conn.execute(sql).fetchall()
for e in events:
    print("  %s | %s | %s | %s" % (e['event_time'], e['direction'], e['device_ip'], e['name']))

print("\\n=== Kameralar ===")
cams = conn.execute("SELECT device_ip, COUNT(*) as cnt FROM events GROUP BY device_ip ORDER BY cnt DESC").fetchall()
for c in cams:
    print("  %s: %d ta event" % (c['device_ip'], c['cnt']))

conn.close()
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('170.168.6.156', username='root', password='asad4141', timeout=30)

sftp = client.open_sftp()
with sftp.open('/tmp/check2.py', 'wb') as f:
    f.write(script)
sftp.close()

stdin, stdout, stderr = client.exec_command(
    'docker cp /tmp/check2.py davomatlar-api-1:/tmp/check2.py && docker exec davomatlar-api-1 python3 /tmp/check2.py',
    timeout=30
)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
client.close()
