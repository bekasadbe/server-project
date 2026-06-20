import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('170.168.6.156', username='root', password='asad4141', timeout=30)

# Bitta buyruqda hamma narsani chiqar
cmd = """
docker exec davomatlar-frontend-1 sh -c '
  LOG=/var/log/nginx/access.log
  echo "=== LOG HAJMI ==="
  wc -l $LOG
  echo "=== BUGUNGI NOYOB IP ==="
  grep $(date +%d/%b/%Y) $LOG | awk "{print \$1}" | grep -v "127.0.0.1" | sort -u | wc -l
  echo "=== JAMI NOYOB IP ==="
  awk "{print \$1}" $LOG | grep -v "127.0.0.1" | sort -u | wc -l
  echo "=== KUNLIK (oxirgi 5000 qator) ==="
  tail -5000 $LOG | awk "{print \$4}" | grep -oE "[0-9]+/[A-Za-z]+/[0-9]+" | sort | uniq -c | tail -10
'
"""

transport = client.get_transport()
transport.set_keepalive(10)
channel = transport.open_session()
channel.exec_command(cmd)
channel.settimeout(60)

out = b''
while True:
    try:
        data = channel.recv(4096)
        if not data:
            break
        out += data
    except Exception:
        break

print(out.decode('utf-8', errors='replace'))
client.close()
