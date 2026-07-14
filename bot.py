"""
Davomatlar.uz — Telegram Bot
Funksiyalar:
  - /start — xush kelibsiz + platforma tugmasi
  - /davomat — bugungi holat (qancha keldi/kelmadi)
  - /kelmadi — kelmagan xodimlar ro'yxati
  - Har kuni 10:00 da avtomatik: kelmagan xodimlar
  - Har kuni 18:00 da avtomatik: kunlik yakuniy hisobot
"""

import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta, time as dtime

import requests
from telegram import (
    Bot, Update,
    InlineKeyboardButton, InlineKeyboardMarkup,
    ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
)
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    ContextTypes, filters
)

# ── SOZLAMALAR ────────────────────────────────────────────────────────────────
BOT_TOKEN  = os.environ.get('BOT_TOKEN', '8970318623:AAHWKODAnSnUcRIvxqHCD3iSEsgrv9Gn6WM')
API_URL    = os.environ.get('API_URL',   'http://api:8001')
API_TOKEN  = os.environ.get('API_TOKEN', 'Dav0mat@API#2026!')
WEB_URL    = 'https://davomatlar.uz'

# Bildirishnoma yuboriladigan chat IDlar (admin panel dan boshqarish mumkin)
# Hozircha env orqali sozlanadi: CHAT_IDS="-100123456,-100789012"
CHAT_IDS_STR = os.environ.get('CHAT_IDS', '')
CHAT_IDS = [int(x.strip()) for x in CHAT_IDS_STR.split(',') if x.strip()]

TZ = timezone(timedelta(hours=5))  # O'zbekiston vaqti

logging.basicConfig(
    format='%(asctime)s [%(levelname)s] %(message)s',
    level=logging.INFO
)
log = logging.getLogger(__name__)

# ── API YORDAMCHILAR ──────────────────────────────────────────────────────────
def api_get(path):
    try:
        r = requests.get(
            f'{API_URL}{path}',
            headers={'X-API-Token': API_TOKEN},
            timeout=10
        )
        return r.json()
    except Exception as e:
        log.error(f'API xato {path}: {e}')
        return {}

def today_str():
    return datetime.now(TZ).strftime('%Y-%m-%d')

def now_uzb():
    return datetime.now(TZ)

# ── PASTKI PANEL TUGMALARI (har doim ko'rinadi) ───────────────────────────────
def main_keyboard(tg_id=None):
    url = f'{WEB_URL}?tg_id={tg_id}' if tg_id else f'{WEB_URL}?tg=1'
    return ReplyKeyboardMarkup(
        [[KeyboardButton('🌐 Platformani ochish', web_app=WebAppInfo(url=url))]],
        resize_keyboard=True,
    )

def open_button(tg_id=None):
    url = f'{WEB_URL}?tg_id={tg_id}' if tg_id else WEB_URL
    return InlineKeyboardMarkup([[
        InlineKeyboardButton('🌐 Platformani ochish', url=url)
    ]])

# ── DAVOMAT MA'LUMOTINI TAHLIL QILISH ────────────────────────────────────────
def get_today_stats():
    date = today_str()
    data = api_get(f'/attendance?date={date}')
    rows = data.get('attendance', [])

    keldi    = [r for r in rows if r.get('first_in')]
    kelmadi  = [r for r in rows if not r.get('first_in')]
    kechikdi = []

    for r in keldi:
        ws = r.get('work_start', '09:00')
        gm = int(r.get('grace_minutes') or 0)
        fi = r.get('first_in', '')
        if fi:
            h, m = map(int, ws.split(':'))
            limit_min = h * 60 + m + gm
            fh, fm = map(int, fi.split(':'))
            if fh * 60 + fm > limit_min:
                kechikdi.append(r)

    return {
        'date': date,
        'jami': len(rows),
        'keldi': len(keldi),
        'kelmadi': len(kelmadi),
        'kechikdi': len(kechikdi),
        'kelmadi_list': kelmadi,
        'kechikdi_list': kechikdi,
    }

# ── BUYRUQLAR ─────────────────────────────────────────────────────────────────
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    name  = update.effective_user.first_name or 'Salom'
    tg_id = update.effective_user.id
    text  = f'👋 Salom, {name}!\n\n🏢 <b>Davomatlar.uz</b> — xodimlar davomat tizimi\n\n⬇️ Pastdagi tugmani bosib platformani oching:'
    await update.message.reply_text(text, parse_mode='HTML', reply_markup=main_keyboard(tg_id))

async def handle_webapp(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """Web app ochilganda qayta ko'rsatish"""
    await update.message.reply_text('✅ Platforma ochildi!', reply_markup=main_keyboard())

async def cmd_davomat(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    st = get_today_stats()
    emoji_keldi   = '🟢' if st['keldi'] > 0 else '⚪'
    emoji_kelmadi = '🔴' if st['kelmadi'] > 0 else '⚪'
    emoji_kech    = '🟡' if st['kechikdi'] > 0 else '⚪'

    text = (
        f'📊 <b>Bugungi davomat</b> — {st["date"]}\n\n'
        f'{emoji_keldi} Keldi:      <b>{st["keldi"]}</b> ta\n'
        f'{emoji_kelmadi} Kelmadi:   <b>{st["kelmadi"]}</b> ta\n'
        f'{emoji_kech} Kechikdi:  <b>{st["kechikdi"]}</b> ta\n'
        f'━━━━━━━━━━━━\n'
        f'👥 Jami:      <b>{st["jami"]}</b> ta xodim'
    )
    await update.message.reply_text(text, parse_mode='HTML', reply_markup=open_button())

async def cmd_kelmadi(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    st = get_today_stats()
    lst = st['kelmadi_list']

    if not lst:
        await update.message.reply_text(
            f'✅ <b>{st["date"]}</b> — barcha xodimlar kelgan!',
            parse_mode='HTML', reply_markup=open_button()
        )
        return

    lines = [f'🔴 <b>Kelmagan xodimlar</b> — {st["date"]}\n']
    for i, r in enumerate(lst[:30], 1):
        lines.append(f'{i}. {r["name"]}')
    if len(lst) > 30:
        lines.append(f'... va yana {len(lst)-30} ta')

    await update.message.reply_text(
        '\n'.join(lines), parse_mode='HTML', reply_markup=open_button()
    )

# ── AVTOMATIK XABARLAR ────────────────────────────────────────────────────────
async def send_morning_report(bot: Bot):
    """Har kuni 10:00 — kelmagan xodimlar"""
    if not CHAT_IDS:
        log.info('CHAT_IDS sozlanmagan, morning report o\'tkazib yuborildi')
        return

    st = get_today_stats()
    lst = st['kelmadi_list']

    if not lst:
        text = f'✅ <b>{st["date"]}</b> — hamma xodim kelgan!'
    else:
        lines = [f'⏰ <b>Soat 10:00 — Kelmagan xodimlar</b> ({st["date"]})\n']
        for i, r in enumerate(lst[:30], 1):
            lines.append(f'{i}. {r["name"]}')
        if len(lst) > 30:
            lines.append(f'... va yana {len(lst)-30} ta')
        lines.append(f'\n🔴 Jami: <b>{len(lst)}</b> ta kelmagan')
        text = '\n'.join(lines)

    for chat_id in CHAT_IDS:
        try:
            await bot.send_message(chat_id, text, parse_mode='HTML', reply_markup=open_button())
            log.info(f'Morning report yuborildi → {chat_id}')
        except Exception as e:
            log.error(f'Chat {chat_id} ga yuborishda xato: {e}')

async def send_evening_report(bot: Bot):
    """Har kuni 18:00 — kunlik yakuniy hisobot"""
    if not CHAT_IDS:
        return

    st = get_today_stats()
    pct = round(st['keldi'] / st['jami'] * 100) if st['jami'] else 0

    bar_filled = round(pct / 10)
    bar = '█' * bar_filled + '░' * (10 - bar_filled)

    text = (
        f'📈 <b>Kunlik yakuniy hisobot</b> — {st["date"]}\n\n'
        f'[{bar}] {pct}%\n\n'
        f'🟢 Keldi:     <b>{st["keldi"]}</b> ta\n'
        f'🔴 Kelmadi:  <b>{st["kelmadi"]}</b> ta\n'
        f'🟡 Kechikdi: <b>{st["kechikdi"]}</b> ta\n'
        f'━━━━━━━━━━━━\n'
        f'👥 Jami: <b>{st["jami"]}</b> ta xodim'
    )

    for chat_id in CHAT_IDS:
        try:
            await bot.send_message(chat_id, text, parse_mode='HTML', reply_markup=open_button())
        except Exception as e:
            log.error(f'Evening report xato {chat_id}: {e}')

async def scheduler(bot: Bot):
    """Har daqiqa tekshiradi — 10:00 va 18:00 da xabar yuboradi"""
    sent_morning = set()
    sent_evening = set()

    while True:
        now = now_uzb()
        today = now.date().isoformat()

        if now.hour == 10 and now.minute == 0 and today not in sent_morning:
            log.info('Morning report yuborilmoqda...')
            await send_morning_report(bot)
            sent_morning.add(today)

        if now.hour == 18 and now.minute == 0 and today not in sent_evening:
            log.info('Evening report yuborilmoqda...')
            await send_evening_report(bot)
            sent_evening.add(today)

        await asyncio.sleep(60)

# ── MAIN ──────────────────────────────────────────────────────────────────────
async def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler('start', cmd_start))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp))

    log.info('Bot ishga tushdi...')

    # Scheduler ni fon da ishlatamiz
    async with app:
        await app.start()
        await app.updater.start_polling(drop_pending_updates=True)
        await scheduler(app.bot)   # bu cheksiz loop
        await app.updater.stop()
        await app.stop()

if __name__ == '__main__':
    asyncio.run(main())
