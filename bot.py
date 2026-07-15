"""
Davomatlar.uz — Telegram Bot
Funksiyalar:
  - /start — xush kelibsiz + platforma tugmasi
  - Har kuni 10:00 da avtomatik eslatma: "Xodimlarning davomatini tekshiring"
"""

import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta, time as dtime

import requests
from telegram import (
    Bot, Update,
    InlineKeyboardButton, InlineKeyboardMarkup,
    ReplyKeyboardMarkup, KeyboardButton, WebAppInfo,
    MenuButtonWebApp,
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
        [[KeyboardButton('✅ Platformani ochish', web_app=WebAppInfo(url=url))]],
        resize_keyboard=True,
    )

def open_button(tg_id=None):
    url = f'{WEB_URL}?tg_id={tg_id}' if tg_id else WEB_URL
    return InlineKeyboardMarkup([[
        InlineKeyboardButton('🌐 Platformani ochish', url=url)
    ]])

# ── BUYRUQLAR ─────────────────────────────────────────────────────────────────
async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    name  = update.effective_user.first_name or 'Salom'
    tg_id = update.effective_user.id
    text  = f'👋 Salom, {name}!\n\n🏢 <b>Davomatlar.uz</b> — xodimlar davomat tizimi\n\n⬇️ Pastdagi tugmani bosib platformani oching:'
    await update.message.reply_text(text, parse_mode='HTML', reply_markup=main_keyboard(tg_id))

async def handle_webapp(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """Web app ochilganda qayta ko'rsatish"""
    await update.message.reply_text('✅ Platforma ochildi!', reply_markup=main_keyboard())

# ── AVTOMATIK ESLATMA ─────────────────────────────────────────────────────────
async def send_morning_reminder(bot: Bot):
    """Har kuni 10:00 — oddiy eslatma"""
    if not CHAT_IDS:
        log.info('CHAT_IDS sozlanmagan, eslatma o\'tkazib yuborildi')
        return

    text = '⏰ Xodimlarning davomatini tekshiring'

    for chat_id in CHAT_IDS:
        try:
            await bot.send_message(chat_id, text, reply_markup=open_button())
            log.info(f'Eslatma yuborildi → {chat_id}')
        except Exception as e:
            log.error(f'Chat {chat_id} ga yuborishda xato: {e}')

async def scheduler(bot: Bot):
    """Har daqiqa tekshiradi — 10:00 da eslatma yuboradi"""
    sent_morning = set()

    while True:
        now = now_uzb()
        today = now.date().isoformat()

        if now.hour == 10 and now.minute == 0 and today not in sent_morning:
            log.info('Ertalabki eslatma yuborilmoqda...')
            await send_morning_reminder(bot)
            sent_morning.add(today)

        await asyncio.sleep(60)

# ── MAIN ──────────────────────────────────────────────────────────────────────
async def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler('start', cmd_start))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp))

    log.info('Bot ishga tushdi...')

    # Xabar maydonining yonida "Ilova" tugmasini o'rnatish
    try:
        await app.bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(text='Davomatlar.uz', web_app=WebAppInfo(url=WEB_URL))
        )
        log.info('Menu button (Ilova) o\'rnatildi')
    except Exception as e:
        log.warning(f'Menu button o\'rnatishda xato: {e}')

    # Scheduler ni fon da ishlatamiz
    async with app:
        await app.start()
        await app.updater.start_polling(drop_pending_updates=True)
        await scheduler(app.bot)   # bu cheksiz loop
        await app.updater.stop()
        await app.stop()

if __name__ == '__main__':
    asyncio.run(main())
