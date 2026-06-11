# Davomatlar.uz — Loyiha Xotirasi
**Oxirgi yangilanish:** 2026-06-11

## Loyiha nima?
Hikvision Face ID kameralardan xodimlar davomatini real vaqtda kuzatuvchi tizim.
- Kameralar HTTP Push orqali event yuboradi → server.py qabul qiladi → SQLite ga saqlaydi
- Web panel orqali admin va kadrlar davomatni ko'radi

---

## Fayl joylashuvi
- **Lokal:** `C:\Users\admin\Desktop\davomatlar`
- **Server:** `/var/www/davomatlar`
- **GitHub:** `https://github.com/bekasadbe/server-project`

---

## Server ma'lumotlari
| | |
|---|---|
| **VPS IP** | 170.168.6.156 |
| **SSH login** | root |
| **SSH parol** | asad4141 |
| **OS** | Ubuntu 24.04.4 LTS |
| **Python** | 3.12.3 |
| **Xotira** | 1vCPU, 1GB RAM, 20GB disk |
| **Domen** | davomatlar.uz → 170.168.6.156 |

---

## Arxitektura
```
Internet → davomatlar.uz (170.168.6.156)
                ↓
           nginx (Docker, port 80 + 443)
           ├── / → frontend (React/Vite, dist/)
           ├── /api → api.py (:8001)
           └── :6610 → server.py (Hikvision HTTP Push)
```

---

## Docker konteynerlar
```bash
docker ps
# davomatlar-frontend-1  → nginx + React build
# davomatlar-api-1       → Flask API (port 8001)
# davomatlar-hikvision-1 → server.py (port 6610)
```

**Rebuild API (kod o'zgarganda):**
```bash
cd /var/www/davomatlar && docker compose up -d --build api
```

**Frontend deploy (lokal → server):**
```bash
python "C:\Users\admin\Desktop\deploy2.py"
# Bu: git pull → npm run build → docker compose restart frontend
```

---

## Portlar
| Port | Nima |
|------|------|
| 80   | HTTP → HTTPS redirect |
| 443  | HTTPS (Let's Encrypt) ✅ |
| 6610 | Hikvision event qabul qiluvchi |
| 8001 | API (ichki, nginx proxy) |

---

## SSL
- Let's Encrypt sertifikati o'rnatilgan (`certbot standalone`)
- Sertifikat: `/etc/letsencrypt/live/davomatlar.uz/`
- docker-compose.yml da port 443 va `/etc/letsencrypt` volume mount bor

---

## Tizim login/parollari
| Login | Parol | Rol |
|-------|-------|-----|
| admin | Inno@Adm!n2026 | Super Admin (hardcoded api.py da) |
| inno | (bazada bcrypt) | Kadrlar — Inno Texnopark |
| milliy | (bazada bcrypt) | Kadrlar — Milliy Offis |

**API token:** `Dav0mat@API#2026!` (X-API-Token header)

> ⚠️ Kadrlar parollari bcrypt bilan bazada saqlanadi. Login sahifasi API `/auth` endpointga murojaat qiladi.

---

## Loyiha fayllari
| Fayl | Nima qiladi |
|------|------------|
| server.py | Hikvision HTTP Push eventlarni qabul qiladi, port 6610 |
| api.py | REST API (Flask). Token: X-API-Token header |
| database.py | SQLite (davomat.db) — groups, employees, events jadvallar |
| requirements.txt | flask, bcrypt |
| nginx.conf | SSL + reverse proxy |
| docker-compose.yml | 3 servis: frontend, api, hikvision |
| frontend/ | React + Vite ilovasi |
| frontend/src/auth.js | `loginAsync()` — API `/auth` orqali login tekshiradi |
| frontend/src/App.jsx | Asosiy ilova, routing, state, API chaqiruvlar |
| frontend/src/store.js | (eski, hozir ishlatilmaydi) |
| frontend/src/pages/Dashboard.jsx | Davomat sahifasi (bugungi holat) |
| frontend/src/pages/History.jsx | Hisobotlar — sana bo'yicha, PDF, print |
| frontend/src/pages/Reports.jsx | Statistika — grafiklar, trendlar |
| frontend/src/pages/Employees.jsx | Xodimlar ro'yxati (kadrlar view) |
| frontend/src/pages/Settings.jsx | Sozlamalar (work_start, work_begin, login, parol) |
| frontend/src/pages/AdminPanel.jsx | Super admin paneli |
| frontend/src/pages/Login.jsx | Kirish sahifasi (ko'k gradient fon) |
| frontend/src/components/Sidebar.jsx | Yon menyu |
| frontend/index.html | SEO meta teglari, Inter font |
| frontend/public/favicon.svg | Ko'k checkmark favicon |
| frontend/public/robots.txt | Google uchun |
| frontend/public/sitemap.xml | Google Search Console ga yuborilgan ✅ |
| C:\Users\admin\Desktop\deploy2.py | SSH deploy script (paramiko) |
| C:\Users\admin\Desktop\fix_groups.py | DB tuzatish script (kerak bo'lganda) |

---

## Baza (SQLite) — davomat.db
**Joyi konteyner ichida:** `/app/data/davomat.db`

```sql
-- Jadvallar:
groups     (id, name, login, password[bcrypt], work_start, work_begin)
employees  (id, name, group_id, lavozim)
events     (id, employee_id, event_time, device_ip, direction, created_at)
```

**Baza ichiga kirish:**
```bash
docker exec davomatlar-api-1 python3 /tmp/fix_db.py
# yoki
docker cp skript.py davomatlar-api-1:/tmp/ && docker exec davomatlar-api-1 python3 /tmp/skript.py
```

---

## API Endpointlar
| Method | URL | Nima |
|--------|-----|------|
| POST | `/auth` | Login tekshirish (bazadan) |
| GET | `/attendance?date=YYYY-MM-DD` | Davomat ma'lumoti |
| GET | `/employees` | Xodimlar + guruhlar ro'yxati |
| POST | `/employees` | Xodim qo'shish |
| PUT | `/employees/<id>` | Xodimni tahrirlash |
| DELETE | `/employees/<id>` | Xodimni o'chirish |
| POST | `/groups` | Guruh qo'shish |
| PUT | `/groups/<id>` | Guruh sozlamalarini saqlash |
| DELETE | `/groups/<id>` | Guruhni o'chirish |
| GET | `/events/live` | Jonli lenta |
| POST | `/events/push` | Hikvision forwarder dan event |
| GET | `/ping` | Server holati |

---

## Frontend texnik tafsilotlar

### work_begin / work_start mantiq
- **work_begin** — kecha kech qolgan ishchilarni keyingi kunga sanashdan oldini olish (default: **06:00**)
- **work_start** — kechikish chegarasi (default: **09:00**)
- `getEffectiveFirstIn(first_in, group_id)` — work_begin dan oldingi vaqtni null qaytaradi
- API `first_in` ni **"HH:MM"** formatida qaytaradi — to'liq datetime emas!

### Autentifikatsiya
- `loginAsync(username, password)` → `POST /auth` → bazadan tekshiradi
- Muvaffaqiyatli bo'lsa `localStorage` ga saqlanadi
- Admin paroli `api.py` da hardcoded (`ADMIN_PASSWORD` env yoki `Inno@Adm!n2026`)
- Kadrlar parollari **bcrypt** bilan bazada

### Sozlamalar saqlash
- Barcha sozlamalar (login, parol, work_start, work_begin) **SQLite bazada**
- localStorage ishlatilmaydi (eski kod olib tashlandi)
- `PUT /groups/<id>` — parol avtomatik bcrypt hash qilinadi

### Menyu nomlari (Sidebar)
| key | Label | Rol |
|-----|-------|-----|
| dashboard | Davomat | admin + kadrlar |
| live | Jonli lenta | admin |
| history | Hisobotlar | kadrlar |
| employees | Xodimlar | kadrlar |
| reports | Statistika | kadrlar |
| settings | Sozlamalar | kadrlar |
| admin | Admin panel | admin |

---

## PDF Hisobot (History.jsx)
- **Orientatsiya:** Portrait (vertikal) A4
- **Tarkib:** Brend logo (o'ng yuqori), sarlavha, 4 ta statistika qutisi, jadval
- **Brend:** Ko'k checkmark + "Davomatlar.uz" (9pt) + "Boshqaruv tizimi" (8pt)
- **Har sahifa pastida:** `davomatlar.uz` (kul rang)
- **Saralash:** Birinchi kelgan xodim yuqorida, kelmaganlar pastda
- **Chop etish:** Xuddi PDF ko'rinishida printer dialog ochiladi

---

## Admin panel imkoniyatlari
- Tashkilot (guruh) qo'shish / o'chirish (tasdiqlash bilan)
- Xodim qo'shish / tahrirlash / o'chirish (tasdiqlash bilan)
- Sozlamalar: login, parol, work_start, work_begin — bazaga saqlanadi
- Guruh ustuni olib tashlangan (tab filter yetarli)

---

## SEO holati
- [x] Meta teglari: title, description, keywords, og:tags
- [x] Google Search Console — tasdiqlandi ✅
- [x] robots.txt + sitemap.xml — Google ga yuborildi ✅
- [x] HTTPS — Let's Encrypt ✅
- [x] canonical URL: `https://davomatlar.uz`
- Google indeksatsiya: 1-2 hafta ichida ko'rinadi

---

## Deploy tartibi
```bash
# 1. Lokal o'zgartirish
git add . && git commit -m "..." && git push

# 2. Frontend deploy (faqat React o'zgarganda)
python "C:\Users\admin\Desktop\deploy2.py"

# 3. Backend deploy (api.py yoki database.py o'zgarganda)
# SSH orqali:
cd /var/www/davomatlar && git pull && docker compose up -d --build api

# 4. Tekshirish
# https://davomatlar.uz
```

---

## Muhim eslatmalar
- `frontend/dist` — build papkasi, `npm run build` bilan yangilanadi
- API `first_in` ni **"HH:MM"** formatida qaytaradi — `slice(11,16)` EMAS!
- `window.confirm()` kelajakda modal dialog bilan almashtirish mumkin
- Docker konteyner ichida baza: `/app/data/davomat.db` (volume)
- bcrypt `rounds=12` — login ~0.3 soniya, serverga nagruska yo'q

---

## Qilingan barcha ishlar ✅
- [x] Landing page — particles animatsiya, feature kartalar
- [x] Ko'k gradient login sahifasi
- [x] Sidebar — gradient SVG logo + "Davomatlar.uz"
- [x] Inter font, tozalangan global CSS
- [x] Favicon — ko'k checkmark SVG
- [x] Docker deploy (3 konteyner)
- [x] SSL/HTTPS — Let's Encrypt
- [x] Admin panelda lavozim maydoni
- [x] **work_begin** sozlamasi (kechki xodimlar filtri)
- [x] Admin paneldan Guruh ustunini olib tashlash
- [x] Tashkilot + xodim o'chirishda tasdiqlash
- [x] Xodim tahrirlash + o'chirish (admin va kadrlar)
- [x] "Dashboard" → "Davomat"
- [x] "Tarix" → "Hisobotlar", "Hisobotlar" → "Statistika"
- [x] Kadrlar login blank page tuzatildi
- [x] **Sozlamalar bazaga ko'chirildi** (localStorage o'rniga SQLite)
- [x] **bcrypt parol xavfsizligi**
- [x] **Login API orqali** (bazadan tekshiradi)
- [x] Xodim tahrirlashda group_id yo'qolish muammosi tuzatildi
- [x] Guruhsiz qolgan 6 xodim tiklandi
- [x] History sahifasiga work_begin filtri qo'shildi
- [x] PDF: portrait, brend logo, statistika qutilari, saralash
- [x] Chop etish = PDF ko'rinishida printer dialog
- [x] SEO meta teglari, Google Search Console, sitemap ✅
- [x] Telegram link tuzatildi → `t.me/davomatlaruz`

---

## Keyingi rejalangan ishlar
- [ ] Hikvision kameralarni `davomatlar.uz:6610` ga yo'naltirish
- [ ] Router da port 6610 forward qilish
- [ ] Face ID sozlash va to'liq test
- [ ] Telegram bot — xodim kelmasa kadrga xabar
- [ ] Hisobot Excel export
- [ ] Certbot auto-renew tekshirish (`certbot renew --dry-run`)
- [ ] GitHub → server avtomatik deploy (webhook)
