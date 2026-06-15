export interface TelegramBot {
  id: string; // bot id from telegram
  token: string;
  name: string;
  username: string;
  avatarUrl?: string;
  enabled: boolean;
  online: boolean;
  addedAt: number;
  users: number[]; // chat ids seen
}

const KEY = "hq88_telegram_bots";

export function loadBots(): TelegramBot[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveBots(bots: TelegramBot[]) {
  localStorage.setItem(KEY, JSON.stringify(bots));
}

const API = (token: string, method: string) =>
  `https://api.telegram.org/bot${token}/${method}`;
const FILE = (token: string, path: string) =>
  `https://api.telegram.org/file/bot${token}/${path}`;

export async function getMe(token: string) {
  const res = await fetch(API(token, "getMe"));
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Token không hợp lệ");
  return data.result as { id: number; first_name: string; username: string };
}

export async function getAvatarUrl(token: string, userId: number): Promise<string | undefined> {
  try {
    const r1 = await fetch(API(token, `getUserProfilePhotos?user_id=${userId}&limit=1`));
    const d1 = await r1.json();
    if (!d1.ok || !d1.result.total_count) return undefined;
    const fileId = d1.result.photos[0][0].file_id;
    const r2 = await fetch(API(token, `getFile?file_id=${fileId}`));
    const d2 = await r2.json();
    if (!d2.ok) return undefined;
    return FILE(token, d2.result.file_path);
  } catch {
    return undefined;
  }
}

export async function sendMessage(token: string, chatId: string | number, text: string) {
  const res = await fetch(API(token, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Gửi thất bại");
  return data.result;
}

export async function fetchUpdates(token: string): Promise<number[]> {
  try {
    const res = await fetch(API(token, "getUpdates"));
    const data = await res.json();
    if (!data.ok) return [];
    const ids = new Set<number>();
    for (const u of data.result) {
      const cid = u.message?.chat?.id || u.edited_message?.chat?.id;
      if (cid) ids.add(cid);
    }
    return [...ids];
  } catch {
    return [];
  }
}
