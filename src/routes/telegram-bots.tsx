import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Plug,
  RefreshCw,
  Power,
  PowerOff,
  Send,
  Trash2,
  Megaphone,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  loadBots,
  saveBots,
  getMe,
  getAvatarUrl,
  sendMessage,
  fetchUpdates,
  type TelegramBot,
} from "@/lib/telegram";

export const Route = createFileRoute("/telegram-bots")({
  head: () => ({
    meta: [
      { title: "Quản lý Bot Telegram | HQ88.FUN Admin" },
      { name: "description", content: "Kết nối và quản lý các bot Telegram" },
    ],
  }),
  component: TelegramBots,
});

function TelegramBots() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const [msgBot, setMsgBot] = useState<TelegramBot | null>(null);
  const [chatId, setChatId] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [bcBot, setBcBot] = useState<TelegramBot | null>(null);
  const [bcText, setBcText] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => setBots(loadBots()), []);
  const persist = (next: TelegramBot[]) => {
    setBots(next);
    saveBots(next);
  };

  async function connectBot() {
    const t = token.trim();
    if (!t) return toast.error("Vui lòng nhập Bot Token");
    setConnecting(true);
    try {
      const me = await getMe(t);
      if (bots.some((b) => b.id === String(me.id))) {
        toast.error("Bot này đã được thêm trước đó");
        return;
      }
      const avatarUrl = await getAvatarUrl(t, me.id);
      const users = await fetchUpdates(t);
      const newBot: TelegramBot = {
        id: String(me.id),
        token: t,
        name: me.first_name,
        username: me.username,
        avatarUrl,
        enabled: true,
        online: true,
        addedAt: Date.now(),
        users,
      };
      persist([newBot, ...bots]);
      setToken("");
      toast.success(`Đã kết nối bot @${me.username}`);
    } catch (e: any) {
      toast.error(e.message || "Kết nối thất bại");
    } finally {
      setConnecting(false);
    }
  }

  async function reconnect(bot: TelegramBot) {
    setBusy(bot.id);
    try {
      const me = await getMe(bot.token);
      const avatarUrl = await getAvatarUrl(bot.token, me.id);
      const users = await fetchUpdates(bot.token);
      persist(
        bots.map((b) =>
          b.id === bot.id
            ? { ...b, name: me.first_name, username: me.username, avatarUrl, online: true, users }
            : b
        )
      );
      toast.success("Đã kết nối lại");
    } catch (e: any) {
      persist(bots.map((b) => (b.id === bot.id ? { ...b, online: false } : b)));
      toast.error(e.message || "Kết nối lại thất bại");
    } finally {
      setBusy(null);
    }
  }

  async function refresh(bot: TelegramBot) {
    setBusy(bot.id);
    try {
      const users = await fetchUpdates(bot.token);
      persist(bots.map((b) => (b.id === bot.id ? { ...b, users, online: true } : b)));
      toast.success(`Đã làm mới (${users.length} user)`);
    } catch {
      toast.error("Làm mới thất bại");
    } finally {
      setBusy(null);
    }
  }

  function toggle(bot: TelegramBot) {
    persist(bots.map((b) => (b.id === bot.id ? { ...b, enabled: !b.enabled } : b)));
    toast.success(bot.enabled ? "Đã tắt bot" : "Đã bật bot");
  }

  function remove(bot: TelegramBot) {
    if (!confirm(`Xóa bot @${bot.username}?`)) return;
    persist(bots.filter((b) => b.id !== bot.id));
    toast.success("Đã xóa bot");
  }

  async function doSend() {
    if (!msgBot) return;
    if (!chatId.trim() || !content.trim()) return toast.error("Nhập Chat ID và nội dung");
    setSending(true);
    try {
      await sendMessage(msgBot.token, chatId.trim(), content);
      toast.success("Đã gửi tin nhắn");
      setChatId("");
      setContent("");
      setMsgBot(null);
    } catch (e: any) {
      toast.error(e.message || "Gửi thất bại");
    } finally {
      setSending(false);
    }
  }

  async function doBroadcast() {
    if (!bcBot) return;
    if (!bcText.trim()) return toast.error("Nhập nội dung");
    if (!bcBot.users?.length) return toast.error("Bot chưa có user nào");
    setBroadcasting(true);
    let ok = 0,
      fail = 0;
    for (const uid of bcBot.users) {
      try {
        await sendMessage(bcBot.token, uid, bcText);
        ok++;
      } catch {
        fail++;
      }
    }
    setBroadcasting(false);
    setBroadcastOpen(false);
    setBcText("");
    setBcBot(null);
    toast.success(`Broadcast hoàn tất: ${ok} thành công, ${fail} thất bại`);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6" /> Quản lý Bot Telegram
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kết nối bot bằng token, quản lý nhiều bot và gửi tin nhắn dễ dàng.
        </p>
      </div>

      {/* Connect */}
      <Card className="p-5 bg-card border-border">
        <h3 className="font-semibold mb-3">Kết nối bot mới</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Nhập Telegram Bot Token (123456:ABC-...)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1"
          />
          <Button onClick={connectBot} disabled={connecting} className="gap-2">
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
            Kết nối Bot
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Lấy token từ <span className="font-mono">@BotFather</span> trên Telegram.
        </p>
      </Card>

      {/* List */}
      <div>
        <h3 className="font-semibold mb-3">Danh sách bot ({bots.length})</h3>
        {bots.length === 0 ? (
          <Card className="p-10 text-center bg-card border-border border-dashed">
            <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Chưa có bot nào được kết nối</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bots.map((bot) => (
              <Card key={bot.id} className="p-5 bg-card border-border">
                <div className="flex items-start gap-3">
                  {bot.avatarUrl ? (
                    <img src={bot.avatarUrl} alt="" className="h-14 w-14 rounded-full" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{bot.name}</p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                          bot.enabled && bot.online
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            bot.enabled && bot.online ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {bot.enabled ? (bot.online ? "Online" : "Offline") : "Đã tắt"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">@{bot.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">ID: {bot.id}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      Token: {bot.token.slice(0, 12)}...{bot.token.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Users: <span className="font-medium text-foreground">{bot.users?.length || 0}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => reconnect(bot)} disabled={busy === bot.id} className="gap-1">
                    <Plug className="h-3.5 w-3.5" /> Kết nối lại
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => refresh(bot)} disabled={busy === bot.id} className="gap-1">
                    <RefreshCw className={`h-3.5 w-3.5 ${busy === bot.id ? "animate-spin" : ""}`} /> Refresh
                  </Button>
                  {bot.enabled ? (
                    <Button size="sm" variant="outline" onClick={() => toggle(bot)} className="gap-1 text-rose-400 hover:text-rose-300">
                      <PowerOff className="h-3.5 w-3.5" /> Tắt
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => toggle(bot)} className="gap-1 text-emerald-400 hover:text-emerald-300">
                      <Power className="h-3.5 w-3.5" /> Bật
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setMsgBot(bot)} className="gap-1">
                    <Send className="h-3.5 w-3.5" /> Gửi tin
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBcBot(bot);
                      setBroadcastOpen(true);
                    }}
                    className="gap-1"
                  >
                    <Megaphone className="h-3.5 w-3.5" /> Broadcast
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(bot)} className="gap-1 text-rose-400 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Send Message dialog */}
      <Dialog open={!!msgBot} onOpenChange={(o) => !o && setMsgBot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gửi tin nhắn - @{msgBot?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="chatid">Chat ID</Label>
              <Input id="chatid" value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="123456789" />
            </div>
            <div>
              <Label htmlFor="msg">Nội dung</Label>
              <Textarea id="msg" rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMsgBot(null)}>Hủy</Button>
            <Button onClick={doSend} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gửi tin nhắn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast dialog */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Broadcast - @{bcBot?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Gửi tới <span className="font-semibold text-foreground">{bcBot?.users?.length || 0}</span> user.
            </p>
            <Textarea rows={6} value={bcText} onChange={(e) => setBcText(e.target.value)} placeholder="Nội dung thông báo..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastOpen(false)}>Hủy</Button>
            <Button onClick={doBroadcast} disabled={broadcasting} className="gap-2">
              {broadcasting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              Gửi Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
