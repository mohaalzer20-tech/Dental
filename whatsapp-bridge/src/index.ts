import express from "express";
import qrcode from "qrcode";
import { pino } from "pino";
import makeWASocket, { useMultiFileAuthState, DisconnectReason, type WASocket } from "@whiskeysockets/baileys";

const PORT = process.env.PORT ?? 3100;
const SECRET = process.env.BRIDGE_SECRET;
if (!SECRET) throw new Error("BRIDGE_SECRET غير مضبوط");

const logger = pino({ level: "warn" });

type Session = {
  sock: WASocket | null;
  status: "disconnected" | "connecting" | "qr" | "connected";
  qrDataUrl: string | null;
  // ponytail: عدّاد يومي بسيط بالذاكرة لتحديد سقف إرسال يومي لكل عيادة (يعيد نفسه بإعادة تشغيل
  // الخدمة) — لو صار حجم استخدام حقيقي، رح يحتاج تخزين دائم (Redis/DB) بدل الذاكرة.
  sentToday: number;
  dayKey: string;
};

const sessions = new Map<string, Session>();

function getSession(practiceId: string): Session {
  let s = sessions.get(practiceId);
  if (!s) {
    s = { sock: null, status: "disconnected", qrDataUrl: null, sentToday: 0, dayKey: "" };
    sessions.set(practiceId, s);
  }
  return s;
}

// تحقّق وصفّر عدّاد اليوم عند تغيّر التاريخ + سقف يومي متدرّج (تسخين رقم جديد تدريجياً).
function checkDailyCap(session: Session): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (session.dayKey !== today) {
    session.dayKey = today;
    session.sentToday = 0;
  }
  const DAILY_CAP = 150; // ponytail: سقف ثابت مبسّط، ارفعه لكل عيادة يدوياً لو احتاج حجم أكبر
  return session.sentToday < DAILY_CAP;
}

async function connectPractice(practiceId: string) {
  const session = getSession(practiceId);
  if (session.sock || session.status === "connecting") return;

  session.status = "connecting";
  const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${practiceId}`);

  const sock = makeWASocket({ auth: state, logger, printQRInTerminal: false });
  session.sock = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      session.qrDataUrl = await qrcode.toDataURL(qr);
      session.status = "qr";
    }

    if (connection === "open") {
      session.status = "connected";
      session.qrDataUrl = null;
    }

    if (connection === "close") {
      session.sock = null;
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output
        ?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      session.status = "disconnected";
      if (!loggedOut) {
        // انقطاع مؤقت (شبكة، إعادة تشغيل واتساب) — أعد المحاولة، مو حظر بالضرورة
        setTimeout(() => connectPractice(practiceId), 5000);
      } else {
        session.qrDataUrl = null;
      }
    }
  });
}

function randomDelay(minMs: number, maxMs: number) {
  return new Promise((resolve) => setTimeout(resolve, minMs + Math.random() * (maxMs - minMs)));
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (req.headers.authorization !== `Bearer ${SECRET}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
});

app.post("/connect/:practiceId", async (req, res) => {
  await connectPractice(req.params.practiceId);
  res.json({ ok: true });
});

app.get("/status/:practiceId", (req, res) => {
  const session = getSession(req.params.practiceId);
  res.json({ status: session.status, qr: session.qrDataUrl });
});

app.post("/disconnect/:practiceId", async (req, res) => {
  const session = getSession(req.params.practiceId);
  await session.sock?.logout().catch(() => {});
  session.sock = null;
  session.status = "disconnected";
  session.qrDataUrl = null;
  res.json({ ok: true });
});

app.post("/send", async (req, res) => {
  const { practiceId, phone, message } = req.body as { practiceId?: string; phone?: string; message?: string };
  if (!practiceId || !phone || !message) {
    res.status(400).json({ error: "practiceId, phone, message مطلوبين" });
    return;
  }

  const session = getSession(practiceId);
  if (session.status !== "connected" || !session.sock) {
    res.status(409).json({ error: "الجلسة غير متصلة لهذه العيادة" });
    return;
  }

  if (!checkDailyCap(session)) {
    res.status(429).json({ error: "تم الوصول للحد اليومي المسموح لهذه العيادة" });
    return;
  }

  try {
    // تأخير عشوائي قبل كل إرسال — يقلل نمط "إرسال آلي منتظم" اللي تكشفه أنظمة واتساب
    await randomDelay(1500, 3500);
    const digits = phone.replace(/[^\d]/g, "");
    const jid = `${digits.startsWith("963") ? digits : "963" + digits.replace(/^0/, "")}@s.whatsapp.net`;
    await session.sock.sendMessage(jid, { text: message });
    session.sentToday++;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "فشل الإرسال" });
  }
});

app.listen(PORT, () => {
  logger.info(`whatsapp-bridge listening on ${PORT}`);
});
