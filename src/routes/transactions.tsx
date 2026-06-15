import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Check, X, Clock, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Nạp / Rút | HQ88.FUN Admin" },
      { name: "description", content: "Quản lý nạp rút HQ88.FUN" },
    ],
  }),
  component: Transactions,
});

type TxType = "deposit" | "withdraw";
type TxStatus = "pending" | "approved" | "rejected";

interface Tx {
  id: string;
  type: TxType;
  username: string;
  amount: number;
  method: string;
  note?: string;
  status: TxStatus;
  createdAt: number;
}

const KEY = "hq88_transactions";

function load(): Tx[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function save(list: Tx[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

function Transactions() {
  const [list, setList] = useState<Tx[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TxType>("deposit");
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank");
  const [note, setNote] = useState("");

  useEffect(() => setList(load()), []);
  const persist = (n: Tx[]) => {
    setList(n);
    save(n);
  };

  function add() {
    if (!username.trim() || !amount.trim()) return toast.error("Nhập username và số tiền");
    const n = Number(amount.replace(/[^\d]/g, ""));
    if (!n || n <= 0) return toast.error("Số tiền không hợp lệ");
    const tx: Tx = {
      id: crypto.randomUUID(),
      type,
      username: username.trim(),
      amount: n,
      method,
      note: note.trim() || undefined,
      status: "pending",
      createdAt: Date.now(),
    };
    persist([tx, ...list]);
    setOpen(false);
    setUsername("");
    setAmount("");
    setNote("");
    toast.success("Đã thêm giao dịch");
  }

  function setStatus(id: string, status: TxStatus) {
    persist(list.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(status === "approved" ? "Đã duyệt" : status === "rejected" ? "Đã từ chối" : "Đã đặt chờ");
  }
  function remove(id: string) {
    if (!confirm("Xóa giao dịch?")) return;
    persist(list.filter((t) => t.id !== id));
  }

  const stats = {
    pending: list.filter((t) => t.status === "pending").length,
    depositToday: list
      .filter((t) => t.type === "deposit" && t.status === "approved")
      .reduce((s, t) => s + t.amount, 0),
    withdrawToday: list
      .filter((t) => t.type === "withdraw" && t.status === "approved")
      .reduce((s, t) => s + t.amount, 0),
  };

  const filterTab = (tab: "all" | TxType) =>
    tab === "all" ? list : list.filter((t) => t.type === tab);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" /> Quản lý Nạp / Rút
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo, duyệt và theo dõi các giao dịch nạp rút của user.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm giao dịch
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Đang chờ duyệt</p>
              <p className="text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tổng nạp (đã duyệt)</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">{fmt(stats.depositToday)}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tổng rút (đã duyệt)</p>
              <p className="text-2xl font-bold mt-1 text-rose-400">{fmt(stats.withdrawToday)}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <ArrowUpFromLine className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="deposit">Nạp</TabsTrigger>
          <TabsTrigger value="withdraw">Rút</TabsTrigger>
        </TabsList>
        {(["all", "deposit", "withdraw"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <TxList list={filterTab(tab)} setStatus={setStatus} remove={remove} />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm giao dịch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Loại</Label>
              <Select value={type} onValueChange={(v) => setType(v as TxType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Nạp tiền</SelectItem>
                  <SelectItem value="withdraw">Rút tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user123" />
            </div>
            <div>
              <Label>Số tiền (VNĐ)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500000" inputMode="numeric" />
            </div>
            <div>
              <Label>Phương thức</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank">Ngân hàng</SelectItem>
                  <SelectItem value="Momo">Momo</SelectItem>
                  <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={add}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TxList({
  list,
  setStatus,
  remove,
}: {
  list: Tx[];
  setStatus: (id: string, s: TxStatus) => void;
  remove: (id: string) => void;
}) {
  if (!list.length)
    return (
      <Card className="p-10 text-center bg-card border-border border-dashed">
        <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Chưa có giao dịch nào</p>
      </Card>
    );
  return (
    <div className="space-y-3">
      {list.map((t) => (
        <Card key={t.id} className="p-4 bg-card border-border">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  t.type === "deposit"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {t.type === "deposit" ? <ArrowDownToLine className="h-5 w-5" /> : <ArrowUpFromLine className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {t.username}{" "}
                  <span className={t.type === "deposit" ? "text-emerald-400" : "text-rose-400"}>
                    {t.type === "deposit" ? "+" : "-"}
                    {fmt(t.amount)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.method} · {new Date(t.createdAt).toLocaleString("vi-VN")}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] px-2 py-1 rounded-full ${
                  t.status === "approved"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : t.status === "rejected"
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {t.status === "approved" ? "Đã duyệt" : t.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
              </span>
              {t.status !== "approved" && (
                <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "approved")} className="gap-1 text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> Duyệt
                </Button>
              )}
              {t.status !== "rejected" && (
                <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "rejected")} className="gap-1 text-rose-400">
                  <X className="h-3.5 w-3.5" /> Từ chối
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => remove(t.id)} className="gap-1">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
