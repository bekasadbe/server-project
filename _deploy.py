import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('170.168.6.156', username='root', password='asad4141', timeout=30)

cmd = (
    'cd /var/www/davomatlar && git stash && git pull && '
    'cd frontend && npm run build && cd .. && '
    'docker compose restart frontend && echo "=== DONE ==="'
)

print('Deploying frontend...')
stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
print(stdout.read().decode('utf-8', errors='replace'))
err = stderr.read().decode('utf-8', errors='replace')
if err: print('STDERR:', err[-500:])
client.close()
