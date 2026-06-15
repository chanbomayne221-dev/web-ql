import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, Power, PowerOff, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { loadBots, type TelegramBot } from "@/lib/telegram";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | HQ88.FUN Admin" },
      { name: "description", content: "HQ88.FUN admin dashboard" },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: typeof Bot;
  color: string;
}) {
  return (
    <Card className="p-5 bg-card border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  useEffect(() => setBots(loadBots()), []);

  const total = bots.length;
  const active = bots.filter((b) => b.enabled).length;
  const off = total - active;
  const totalUsers = bots.reduce((a, b) => a + (b.users?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng quan hệ thống quản lý bot Telegram.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tổng số bot" value={total} icon={Bot} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <Stat label="Đang hoạt động" value={active} icon={Power} color="bg-gradient-to-br from-emerald-500 to-green-600" />
        <Stat label="Đã tắt" value={off} icon={PowerOff} color="bg-gradient-to-br from-rose-500 to-red-600" />
        <Stat label="Tổng user" value={totalUsers} icon={Users} color="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>

      <Card className="p-5 bg-card border-border">
        <h3 className="font-semibold mb-4">User của từng bot</h3>
        {bots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có bot nào. Vào "Quản lý Bot Telegram" để thêm bot.
          </p>
        ) : (
          <div className="space-y-2">
            {bots.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {b.avatarUrl ? (
                    <img src={b.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{b.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{b.users?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
