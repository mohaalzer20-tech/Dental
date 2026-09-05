# whatsapp-bridge

خدمة صغيرة مستقلة تدير جلسات واتساب غير رسمية (Baileys) لعدة عيادات بنفس الوقت. **لازم تشتغل
على سيرفر يضل شغال 24/7** (مو Vercel — الاتصال دائم، مو دالة تنتهي بعد الطلب). خدمة dental-saas
الرئيسية (على Vercel) تناديها عبر HTTP.

## التشغيل

```bash
npm install
cp .env.example .env   # وعبّي BRIDGE_SECRET بقيمة عشوائية طويلة
npm run build
npm start
```

بالتطوير المحلي: `npm run dev` (إعادة تحميل تلقائي).

**استخدم مدير عمليات** (pm2 أو systemd) عشان تعيد تشغيلها تلقائياً لو وقعت أو السيرفر أعاد التشغيل:
```bash
npm install -g pm2
pm2 start dist/index.js --name whatsapp-bridge
pm2 save && pm2 startup
```

## الربط بـ dental-saas

بمتغيرات بيئة تطبيق dental-saas (Vercel + `.env.local`):
```
WHATSAPP_BRIDGE_URL=https://your-server:3100
WHATSAPP_BRIDGE_SECRET=<نفس BRIDGE_SECRET هون>
```

## نقاط النهاية (كلها تحتاج `Authorization: Bearer <BRIDGE_SECRET>`)

- `POST /connect/:practiceId` — يبدأ جلسة جديدة لهذه العيادة (أو يتجاهل لو موجودة أصلاً)
- `GET /status/:practiceId` — `{ status: "disconnected"|"connecting"|"qr"|"connected", qr: dataURL|null }`
- `POST /disconnect/:practiceId` — يفصل ويحذف الجلسة (تحتاج مسح QR من جديد لاحقاً)
- `POST /send` — `{ practiceId, phone, message }`

## ملاحظات مهمة

- مجلد `sessions/` فيه مفاتيح جلسات واتساب الحقيقية — **لا يُرفع لأي مستودع Git إطلاقاً** (موجود
  بـ `.gitignore` أصلاً). لو غيّرت سيرفر، انقل هذا المجلد يدوياً وبأمان، ما تنشئه من الصفر إلا لو
  قابل تعيد مسح QR كود لكل العيادات.
- هذا حل غير رسمي (مو WhatsApp Business API الرسمي) — فيه خطر حظر حقيقي على رقم أي عيادة تربطه.
  راجع الشرح الكامل بالمحادثة مع فريق التطوير قبل تفعيله لأي عيادة.
- سقف الإرسال اليومي لكل عيادة مضبوط بمتغيّر `DAILY_CAP` بـ `src/index.ts` (150 افتراضياً) —
  عدّاد بالذاكرة يتصفّر بإعادة تشغيل الخدمة، لازم ينتقل لتخزين دائم (Redis/DB) لو الحجم كبر.
