import React, { useMemo, useState } from "react";
import * as I from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DataProvider,
  useData,
  sites,
  getSite,
  getEngineer,
  engineers,
  trend,
} from "./shared.jsx";

const customerSites = sites.filter((x) => x.companyId === "company-cht");
const metricLabels = {
  wet: ["濕球溫度", "°C"],
  inlet: ["進水溫度", "°C"],
  outlet: ["出水溫度", "°C"],
  approach: ["趨近溫度", "°C"],
  eff: ["散熱效率", "%"],
  flow: ["水流量", "CMH"],
};
const today = "2026-09-30";
function Badge({ children, tone }) {
  let c =
    tone ||
    (/異常|待執行/.test(children)
      ? "danger"
      : /進行中/.test(children)
        ? "warn"
        : "ok");
  return <span className={"portal-badge " + c}>{children}</span>;
}
function Btn({ children, kind = "", ...p }) {
  return (
    <button className={"portal-btn " + kind} {...p}>
      {children}
    </button>
  );
}
function MiniChart({ site, keyName = "eff", height = 70 }) {
  let data = trend.map((x, i) => ({
    ...x,
    [keyName]:
      keyName === "eff"
        ? x.eff + (site.eff - 87)
        : keyName === "approach"
          ? +(x.approach + (site.approach - 4.2)).toFixed(1)
          : keyName === "flow"
            ? x.flow + (site.flow - trend.at(-1).flow)
            : x[keyName],
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <Area
          dataKey={keyName}
          type="monotone"
          stroke="#2f718f"
          strokeWidth={2.5}
          fill="#dcebf1"
        />
        <Tooltip />
        <XAxis dataKey="t" hide />
        <YAxis hide domain={["dataMin-2", "dataMax+2"]} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
function FullChart({ keyName }) {
  return (
    <ResponsiveContainer width="100%" height={330}>
      <AreaChart data={trend}>
        <CartesianGrid stroke="#e7ece9" vertical={false} />
        <XAxis dataKey="t" interval={4} />
        <YAxis width={38} />
        <Tooltip />
        <Area
          dataKey={keyName}
          type="monotone"
          stroke="#2f718f"
          strokeWidth={2.5}
          fill="#dcebf1"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
function PortalModal({ title, onClose, children }) {
  return (
    <div
      className="portal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="portal-modal">
        <header>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="關閉">
            <I.X />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function go(path) {
  if (location.protocol === "file:") {
    location.hash = path;
    window.scrollTo(0, 0);
    return;
  }
  history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

function CustomerLayout({ page, children }) {
  let nav = [
    ["/customer", "總覽", I.LayoutDashboard],
    ["/customer/sites", "我的案場", I.Building2],
    ["/customer/calendar", "維護日曆", I.CalendarDays],
    ["/customer/logs", "維護紀錄", I.ClipboardList],
  ];
  return (
    <div className="customer-app">
      <header className="customer-top">
        <button className="customer-brand" onClick={() => go("/customer")}>
          <span>
            <I.Droplets />
          </span>
          <b>水利淨</b>
          <small>客戶服務平台</small>
        </button>
        <nav>
          {nav.map(([p, n, C]) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              onClick={() => go(p)}
            >
              <C />
              {n}
            </button>
          ))}
        </nav>
        <div className="customer-user">
          <span>中華電信</span>
          <div>林</div>
        </div>
      </header>
      <main className="customer-main">{children}</main>
      <nav className="customer-bottom">
        {nav.map(([p, n, C]) => (
          <button
            key={p}
            className={page === p ? "active" : ""}
            onClick={() => go(p)}
          >
            <C />
            <span>{n}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
function CustomerHome() {
  const { schedules } = useData();
  let upcoming = schedules
    .filter(
      (x) =>
        customerSites.some((s) => s.id === x.siteId) && x.status !== "已完成",
    )
    .slice(0, 4);
  return (
    <>
      <div className="portal-heading customer-overview-hero">
        <div>
          <p>2026 年 9 月 30 日，星期三</p>
          <h1>午安，中華電信</h1>
          <span>以下是您公司案場的最新運作概況。</span>
        </div>
      </div>
      <section className="customer-summary">
        {[
          ["案場總數", 3, I.Building2],
          ["正常案場", 2, I.CircleCheck],
          ["異常案場", 1, I.TriangleAlert],
          ["近期維護", upcoming.length, I.Wrench],
        ].map(([n, v, C]) => (
          <article key={n}>
            <C />
            <span>{n}</span>
            <b>{v}</b>
          </article>
        ))}
      </section>
      <div className="portal-section-head">
        <div>
          <h2>我的案場</h2>
          <p>您目前獲授權查看的冷卻水塔案場</p>
        </div>
        <button onClick={() => go("/customer/sites")}>
          查看全部 <I.ArrowRight />
        </button>
      </div>
      <div className="customer-site-grid">
        {customerSites.map((s) => (
          <SiteCard key={s.id} site={s} />
        ))}
      </div>
      <div className="portal-section-head">
        <div>
          <h2>待辦與近期維護</h2>
          <p>即將進行的維護安排</p>
        </div>
        <button onClick={() => go("/customer/calendar")}>
          查看日曆 <I.ArrowRight />
        </button>
      </div>
      <div className="customer-upcoming">
        {upcoming.map((x) => {
          let s = getSite(x.siteId);
          return (
            <button key={x.id} onClick={() => go("/customer/calendar")}>
              <time>
                <b>{x.date.slice(8)}</b>
                <span>{x.date.slice(5, 7)} 月</span>
              </time>
              <div>
                <b>
                  {s.name} · {x.type}
                </b>
                <span>
                  {x.start}–{x.end}　
                  {getEngineer(x.engineerId)?.name || "待指派"}
                </span>
              </div>
              <Badge>{x.status}</Badge>
              <I.ChevronRight />
            </button>
          );
        })}
      </div>
    </>
  );
}
function SiteCard({ site }) {
  return (
    <button
      className="customer-site-card"
      onClick={() => go("/customer/site/" + site.id)}
    >
      <div className="site-card-top">
        <div>
          <small>{site.company}</small>
          <h3>{site.name}</h3>
        </div>
        <Badge tone={site.status === "異常" ? "danger" : "ok"}>
          {site.status === "異常" ? "運轉異常" : "運轉正常"}
        </Badge>
      </div>
      <div className="site-kpis">
        <span>
          散熱效率<b>{site.eff}%</b>
        </span>
        <span>
          趨近溫度<b>{site.approach}°C</b>
        </span>
        <span>
          水流量
          <b>
            {site.flow}
            <small> CMH</small>
          </b>
        </span>
      </div>
      <MiniChart site={site} keyName="flow" />
      <footer>
        <span className={site.alert === "正常" ? "ok" : "danger"}>
          <I.CircleAlert />
          {site.alert === "正常" ? "無異常" : "異常：" + site.alert}
        </span>
        <time>更新於 {site.updated}</time>
      </footer>
    </button>
  );
}
function CustomerSites() {
  const [q, setQ] = useState("");
  let rows = customerSites.filter((x) => x.name.includes(q));
  return (
    <>
      <div className="portal-heading">
        <div>
          <p>案場</p>
          <h1>我的案場</h1>
          <span>查看所有獲授權案場的即時運作資訊。</span>
        </div>
      </div>
      <div className="portal-filter">
        <I.Search />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋案場名稱"
        />
        <select>
          <option>全部狀態</option>
          <option>正常</option>
          <option>異常</option>
        </select>
      </div>
      <div className="customer-site-grid roomy">
        {rows.map((s) => (
          <SiteCard key={s.id} site={s} />
        ))}
      </div>
    </>
  );
}
function CustomerWarRoom({ site }) {
  let ms = [
    ["wet", site.wet, "正常"],
    ["inlet", site.inlet, "正常"],
    ["outlet", site.outlet, "正常"],
    ["approach", site.approach, site.approach > 6 ? "異常" : "正常"],
    ["eff", site.eff, site.eff < 75 ? "異常" : "正常"],
    ["flow", site.flow, site.flow === 0 ? "停止運轉" : "正常"],
  ];
  return (
    <>
      <button className="portal-back" onClick={() => go("/customer/sites")}>
        <I.ArrowLeft />
        返回我的案場
      </button>
      <div className="portal-heading site-title">
        <div>
          <p>{site.company}</p>
          <h1>{site.name}</h1>
          <span>
            <I.MapPin />
            {site.address}
          </span>
        </div>
        <div>
          <Badge tone={site.status === "異常" ? "danger" : "ok"}>
            設備{site.status}
          </Badge>
          <Btn
            kind="outline"
            onClick={() => go("/customer/history/" + site.id)}
          >
            <I.History />
            歷史資料
          </Btn>
        </div>
      </div>
      <div className="live-strip">
        <span>
          <i />
          即時監測中
        </span>
        <time>最後更新：{site.updated}</time>
      </div>
      <div className="customer-metrics">
        {ms.map(([k, v, state]) => (
          <article key={k}>
            <header>
              <span>{metricLabels[k][0]}</span>
              <Badge tone={state === "正常" ? "ok" : "danger"}>{state}</Badge>
            </header>
            <strong>
              {v}
              <small>{metricLabels[k][1]}</small>
            </strong>
            <MiniChart site={site} keyName={k} height={115} />
            <footer>最近 24 小時趨勢</footer>
          </article>
        ))}
      </div>
    </>
  );
}
function CustomerHistory({ site }) {
  const [type, setType] = useState("eff"),
    [start, setStart] = useState("2026-04-01"),
    [end, setEnd] = useState("2026-09-30");
  return (
    <>
      <button
        className="portal-back"
        onClick={() => go("/customer/site/" + site.id)}
      >
        <I.ArrowLeft />
        返回案場戰情室
      </button>
      <div className="portal-heading">
        <div>
          <p>
            {site.company} · {site.name}
          </p>
          <h1>歷史資料</h1>
          <span>依日期區間查看各項監測數據。</span>
        </div>
      </div>
      <div className="history-controls">
        <label>
          開始日期
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          結束日期
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <label>
          數據項目
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(metricLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v[0]}
              </option>
            ))}
          </select>
        </label>
        <Btn>套用查詢</Btn>
      </div>
      <section className="customer-chart">
        <header>
          <div>
            <h2>{metricLabels[type][0]}趨勢</h2>
            <p>
              {start} 至 {end} · 每日平均
            </p>
          </div>
          <span>{metricLabels[type][1]}</span>
        </header>
        <FullChart keyName={type} />
      </section>
    </>
  );
}
function ScheduleForm({ onClose }) {
  const { addSchedule } = useData();
  const [form, setForm] = useState({
    siteId: "site-001",
    date: "2026-10-02",
    start: "09:00",
    end: "11:00",
    type: "冷卻水塔清潔",
    description: "",
  });
  let set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addSchedule({ ...form, engineerId: "eng-001", source: "customer" });
        onClose();
      }}
      className="portal-form"
    >
      <label>
        案場
        <select
          value={form.siteId}
          onChange={(e) => set("siteId", e.target.value)}
        >
          {customerSites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div>
        <label>
          日期
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </label>
        <label>
          開始時間
          <input
            required
            type="time"
            value={form.start}
            onChange={(e) => set("start", e.target.value)}
          />
        </label>
        <label>
          結束時間
          <input
            required
            type="time"
            value={form.end}
            onChange={(e) => set("end", e.target.value)}
          />
        </label>
      </div>
      <label>
        維護項目
        <input
          required
          value={form.type}
          onChange={(e) => set("type", e.target.value)}
        />
      </label>
      <label>
        說明
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="請描述維護需求與現場注意事項"
        />
      </label>
      <footer>
        <Btn type="button" kind="outline" onClick={onClose}>
          取消
        </Btn>
        <Btn type="submit">建立排程</Btn>
      </footer>
    </form>
  );
}
function CustomerCalendar() {
  const { schedules } = useData();
  const [modal, setModal] = useState(false),
    [siteId, setSiteId] = useState("all"),
    [month, setMonth] = useState(9);
  let list = schedules.filter(
    (x) =>
      customerSites.some((s) => s.id === x.siteId) &&
      (siteId === "all" || x.siteId === siteId),
  );
  return (
    <>
      <div className="portal-heading">
        <div>
          <p>維護管理</p>
          <h1>維護日曆</h1>
          <span>查看與安排您公司案場的維護工作。</span>
        </div>
        <Btn onClick={() => setModal(true)}>
          <I.Plus />
          新增維護排程
        </Btn>
      </div>
      <div className="portal-filter">
        <label>案場</label>
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="all">全部案場</option>
          {customerSites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <section className="customer-calendar">
        <header>
          <button onClick={() => setMonth((x) => x - 1)}>
            <I.ChevronLeft />
          </button>
          <h2>2026 年 {month + 1} 月</h2>
          <button onClick={() => setMonth((x) => x + 1)}>
            <I.ChevronRight />
          </button>
        </header>
        <div className="cal-week">
          {["日", "一", "二", "三", "四", "五", "六"].map((x) => (
            <b key={x}>{x}</b>
          ))}
        </div>
        <div className="cal-days">
          {Array.from({ length: 35 }, (_, i) => i - 2).map((d, i) => {
            let actual = d < 1 ? 30 + d : d > 31 ? d - 31 : d;
            let ev = list.filter(
              (x) =>
                +x.date.slice(8) === actual &&
                +x.date.slice(5, 7) === month + 1,
            );
            return (
              <div key={i} className={d < 1 || d > 31 ? "outside" : ""}>
                <span>{actual}</span>
                {ev.map((x) => (
                  <button key={x.id}>
                    <b>
                      {x.start} {x.type}
                    </b>
                    <small>
                      {getSite(x.siteId).name} · {x.status}
                    </small>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>
      <div className="mobile-schedule-list">
        {list.map((x) => (
          <ScheduleRow key={x.id} item={x} />
        ))}
      </div>
      {modal && (
        <PortalModal title="新增維護排程" onClose={() => setModal(false)}>
          <ScheduleForm onClose={() => setModal(false)} />
        </PortalModal>
      )}
    </>
  );
}
function ScheduleRow({ item, onClick }) {
  let s = getSite(item.siteId);
  return (
    <button className="schedule-row" onClick={onClick}>
      <time>
        <b>{item.date.slice(8)}</b>
        <span>{item.date.slice(5, 7)} 月</span>
      </time>
      <div>
        <b>
          {s.company}｜{s.name}
        </b>
        <span>
          {item.start}–{item.end}
        </span>
        <strong>{item.type}</strong>
      </div>
      <Badge>{item.status}</Badge>
      <I.ChevronRight />
    </button>
  );
}
function CustomerLogs() {
  const { logs, addLog } = useData();
  const [siteId, setSiteId] = useState("all"),
    [modal, setModal] = useState(false);
  let list = logs.filter(
    (x) =>
      customerSites.some((s) => s.id === x.siteId) &&
      (siteId === "all" || x.siteId === siteId),
  );
  return (
    <>
      <div className="portal-heading">
        <div>
          <p>維護管理</p>
          <h1>維護紀錄</h1>
          <span>查看施工內容與現場照片。</span>
        </div>
        <Btn onClick={() => setModal(true)}>
          <I.Plus />
          新增維護紀錄
        </Btn>
      </div>
      <div className="portal-filter">
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="all">全部案場</option>
          {customerSites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select>
          <option>全部維護類型</option>
          <option>冷卻塔清洗</option>
          <option>例行巡檢</option>
        </select>
      </div>
      <div className="customer-log-grid">
        {list.length ? (
          list.map((x) => <LogCard key={x.id} log={x} />)
        ) : (
          <div className="empty">
            <I.ClipboardList />
            <h3>尚無維護紀錄</h3>
            <p>完成維護後，紀錄會顯示在這裡。</p>
          </div>
        )}
      </div>
      {modal && (
        <PortalModal title="新增維護紀錄" onClose={() => setModal(false)}>
          <LogForm
            onClose={() => setModal(false)}
            submit={(x) => addLog({ ...x, engineerId: null })}
          />
        </PortalModal>
      )}
    </>
  );
}
function LogCard({ log }) {
  let s = getSite(log.siteId);
  return (
    <article className="customer-log">
      <header>
        <div>
          <small>{log.date}</small>
          <h3>
            {s.name} · {log.type}
          </h3>
          <p>執行人員：{getEngineer(log.engineerId)?.name || "客戶自行維護"}</p>
        </div>
      </header>
      <p>{log.notes}</p>
      <div className="log-photos">
        {Array.from({ length: log.photos || 0 }, (_, i) => (
          <div key={i}>
            <I.Image />
            <span>維護照片 {i + 1}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
function LogForm({ onClose, submit }) {
  const [siteId, setSite] = useState("site-001"),
    [date, setDate] = useState(today),
    [notes, setNotes] = useState(""),
    [photos, setPhotos] = useState([]);
  return (
    <form
      className="portal-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          siteId,
          date,
          type: "自主維護",
          notes,
          photos: photos.length,
        });
        onClose();
      }}
    >
      <label>
        案場
        <select value={siteId} onChange={(e) => setSite(e.target.value)}>
          {customerSites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        維護日期
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label>
        維護說明
        <textarea
          required
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="請記錄本次維護內容與結果"
        />
      </label>
      <label className="upload-zone">
        <I.Camera />
        <b>上傳維護照片</b>
        <span>可一次選擇多張圖片</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos([...e.target.files])}
        />
      </label>
      {photos.length > 0 && (
        <div className="selected-photos">已選擇 {photos.length} 張照片</div>
      )}
      <footer>
        <Btn type="button" kind="outline" onClick={onClose}>
          取消
        </Btn>
        <Btn type="submit">發布紀錄</Btn>
      </footer>
    </form>
  );
}

function MaintenanceLayout({ page, children }) {
  let nav = [
    ["/maintenance", "今日工作", I.Briefcase],
    ["/maintenance/calendar", "工作日曆", I.CalendarDays],
    ["/maintenance/history", "工作紀錄", I.ClipboardCheck],
  ];
  return (
    <div className="maint-app">
      <header className="maint-top">
        <div>
          <span>
            <I.Droplets />
          </span>
          <b>水利淨工程端</b>
        </div>
        <button aria-label="通知">
          <I.Bell />
          <i />
        </button>
      </header>
      <main>{children}</main>
      <nav className="maint-nav">
        {nav.map(([p, n, C]) => (
          <button
            key={p}
            className={page === p ? "active" : ""}
            onClick={() => go(p)}
          >
            <C />
            <span>{n}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
function MaintenanceHome() {
  const { schedules } = useData();
  let jobs = schedules.filter(
    (x) => x.engineerId === "eng-001" && x.date === today,
  );
  return (
    <>
      <div className="maint-welcome">
        <p>9 月 30 日，星期三</p>
        <h1>早安，王柏翔</h1>
        <span>今天共有 {jobs.length} 項維護工作</span>
      </div>
      <div className="maint-progress">
        <div>
          <span>今日進度</span>
          <b>
            {jobs.filter((x) => x.status === "已完成").length} / {jobs.length}
          </b>
        </div>
        <div>
          <i
            style={{
              width:
                ((jobs.filter((x) => x.status === "已完成").length /
                  jobs.length) *
                  100 || 0) + "%",
            }}
          />
        </div>
      </div>
      <div className="maint-section-title">
        <h2>今天的工作</h2>
        <button onClick={() => go("/maintenance/calendar")}>查看日曆</button>
      </div>
      <div className="job-list">
        {jobs.map((x, i) => (
          <JobCard key={x.id} job={x} index={i} />
        ))}
      </div>
    </>
  );
}
function JobCard({ job, index }) {
  let s = getSite(job.siteId);
  return (
    <button
      className="job-card"
      onClick={() => go("/maintenance/job/" + job.id)}
    >
      <div className="job-time">
        <b>{job.start}</b>
        <span>{job.end}</span>
        <i />
      </div>
      <div className="job-info">
        <div>
          <span>工作 {index + 1}</span>
          <Badge>{job.status}</Badge>
        </div>
        <h3>{job.type}</h3>
        <p>
          {s.company}｜{s.name}
        </p>
        <small>
          <I.MapPin />
          {s.address}
        </small>
      </div>
      <I.ChevronRight className="job-arrow" />
    </button>
  );
}
function WorkDetail({ job }) {
  let s = getSite(job.siteId);
  return (
    <>
      <button className="maint-back" onClick={() => history.back()}>
        <I.ArrowLeft />
        工作詳情
      </button>
      <div className="work-hero">
        <span>維護工作</span>
        <Badge>{job.status}</Badge>
        <h1>{job.type}</h1>
        <p>
          {s.company}｜{s.name}
        </p>
      </div>
      <section className="work-detail">
        <h2>工作資訊</h2>
        {[
          [I.MapPin, "案場地址", s.address],
          [I.CalendarDays, "維護日期", job.date],
          [I.Clock3, "維護時間", job.start + "–" + job.end],
          [I.UserRound, "負責工程人員", "王柏翔"],
        ].map(([C, l, v]) => (
          <div key={l}>
            <C />
            <span>
              {l}
              <b>{v}</b>
            </span>
          </div>
        ))}
      </section>
      <section className="work-note">
        <h2>工作說明</h2>
        <p>{job.description}</p>
      </section>
      <div className="work-actions">
        <Btn kind="outline" onClick={() => go("/maintenance/data/" + s.id)}>
          <I.Activity />
          查看案場數據
        </Btn>
        <Btn
          onClick={() => go("/maintenance/log/" + job.id)}
          disabled={job.status === "已完成"}
        >
          <I.ClipboardPen />
          {job.status === "已完成" ? "工作已完成" : "填寫維護紀錄"}
        </Btn>
      </div>
    </>
  );
}
function MaintenanceData({ site }) {
  return (
    <>
      <button className="maint-back" onClick={() => history.back()}>
        <I.ArrowLeft />
        案場數據
      </button>
      <div className="maint-page-title">
        <small>{site.company}</small>
        <h1>{site.name}</h1>
        <p>即時監測 · 更新於 {site.updated}</p>
      </div>
      <div className="compact-metrics">
        {[
          ["eff", site.eff],
          ["approach", site.approach],
          ["flow", site.flow],
          ["wet", site.wet],
          ["inlet", site.inlet],
          ["outlet", site.outlet],
        ].map(([k, v]) => (
          <article key={k}>
            <span>{metricLabels[k][0]}</span>
            <b>
              {v}
              <small>{metricLabels[k][1]}</small>
            </b>
            <MiniChart site={site} keyName={k} height={55} />
          </article>
        ))}
      </div>
    </>
  );
}
function MaintenanceCalendar() {
  const { schedules } = useData();
  const [mode, setMode] = useState("本月");
  const ranges = {
    今天: { start: today, end: today, label: "2026/09/30" },
    本週: {
      start: "2026-09-28",
      end: "2026-10-04",
      label: "2026/09/28－2026/10/04",
    },
    本月: {
      start: "2026-09-01",
      end: "2026-09-30",
      label: "2026/09/01－2026/09/30",
    },
  };
  const activeRange = ranges[mode];
  let jobs = schedules.filter(
    (job) =>
      job.engineerId === "eng-001" &&
      job.date >= activeRange.start &&
      job.date <= activeRange.end,
  );
  return (
    <>
      <div className="maint-page-title">
        <small>我的排程</small>
        <h1>工作日曆</h1>
      </div>
      <div className="maint-tabs">
        {["今天", "本週", "本月"].map((x) => (
          <button
            key={x}
            className={mode === x ? "active" : ""}
            onClick={() => setMode(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="maint-date-range">
        <I.CalendarDays />
        <span>{mode === "今天" ? "當日" : `${mode}日期區間`}</span>
        <b>{activeRange.label}</b>
      </div>
      <div className="job-list simple">
        {jobs.length ? (
          jobs.map((x, i) => <JobCard key={x.id} job={x} index={i} />)
        ) : (
          <div className="empty">
            <I.CalendarDays />
            <h3>此區間沒有工作</h3>
            <p>請切換其他時間區段查看排程。</p>
          </div>
        )}
      </div>
    </>
  );
}
function MaintenanceHistory() {
  const { logs } = useData();
  let list = logs.filter((x) => x.engineerId === "eng-001");
  return (
    <>
      <div className="maint-page-title">
        <small>維護工作</small>
        <h1>工作紀錄</h1>
      </div>
      {list.length ? (
        <div className="maint-history-list">
          {list.map((x) => (
            <LogCard key={x.id} log={x} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <I.ClipboardCheck />
          <h3>尚無維護紀錄</h3>
          <p>提交維護日誌後會顯示在這裡。</p>
        </div>
      )}
    </>
  );
}
function CompleteForm({ job }) {
  const { completeWork } = useData();
  const [notes, setNotes] = useState(""),
    [photos, setPhotos] = useState([]),
    [done, setDone] = useState(false);
  let s = getSite(job.siteId);
  if (done)
    return (
      <div className="success-screen">
        <span>
          <I.Check />
        </span>
        <h1>維護紀錄已送出</h1>
        <p>
          {s.company}｜{s.name}
          <br />
          {job.type}
        </p>
        <Btn onClick={() => go("/maintenance")}>返回今日工作</Btn>
      </div>
    );
  return (
    <>
      <button className="maint-back" onClick={() => history.back()}>
        <I.ArrowLeft />
        填寫維護紀錄
      </button>
      <div className="prefill">
        <span>關聯排程</span>
        <h2>{job.type}</h2>
        <p>
          {s.company}｜{s.name}
        </p>
        <small>
          {job.date}　{job.start}–{job.end}
        </small>
      </div>
      <form
        className="maint-form"
        onSubmit={(e) => {
          e.preventDefault();
          completeWork(job, notes, photos.length);
          setDone(true);
        }}
      >
        <label>
          維護說明 <em>必填</em>
          <textarea
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="請記錄執行項目、設備狀況與處理結果"
          />
        </label>
        <label className="maint-upload">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos([...e.target.files])}
          />
          <I.Camera />
          <b>拍照或上傳照片</b>
          <span>支援多張照片</span>
        </label>
        {photos.length > 0 && (
          <div className="photo-previews">
            {photos.map((p, i) => (
              <div key={i}>
                <I.Image />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        )}
        <div className="submit-bar">
          <Btn type="submit">
            <I.Check />
            完成並送出紀錄
          </Btn>
        </div>
      </form>
    </>
  );
}

function CustomerRouter({ path }) {
  let siteId = path.split("/").pop(),
    site = getSite(siteId);
  let body =
    path === "/customer" ? (
      <CustomerHome />
    ) : path === "/customer/sites" ? (
      <CustomerSites />
    ) : path === "/customer/calendar" ? (
      <CustomerCalendar />
    ) : path === "/customer/logs" ? (
      <CustomerLogs />
    ) : path.startsWith("/customer/history/") && site ? (
      <CustomerHistory site={site} />
    ) : site ? (
      <CustomerWarRoom site={site} />
    ) : (
      <CustomerHome />
    );
  let navPage =
    path.startsWith("/customer/site") || path.startsWith("/customer/history")
      ? "/customer/sites"
      : path;
  return <CustomerLayout page={navPage}>{body}</CustomerLayout>;
}
function MaintenanceRouter({ path }) {
  const { schedules } = useData();
  let id = path.split("/").pop(),
    job = schedules.find((x) => x.id === id),
    site = getSite(id);
  let body =
    path === "/maintenance" ? (
      <MaintenanceHome />
    ) : path === "/maintenance/calendar" ? (
      <MaintenanceCalendar />
    ) : path === "/maintenance/history" ? (
      <MaintenanceHistory />
    ) : path.startsWith("/maintenance/job/") && job ? (
      <WorkDetail job={job} />
    ) : path.startsWith("/maintenance/log/") && job ? (
      <CompleteForm job={job} />
    ) : path.startsWith("/maintenance/data/") && site ? (
      <MaintenanceData site={site} />
    ) : (
      <MaintenanceHome />
    );
  let nav = path.startsWith("/maintenance/calendar")
    ? "/maintenance/calendar"
    : path.startsWith("/maintenance/history")
      ? "/maintenance/history"
      : "/maintenance";
  return <MaintenanceLayout page={nav}>{body}</MaintenanceLayout>;
}
export function PortalRoot({ path }) {
  return (
    <DataProvider>
      {path.startsWith("/customer") ? (
        <CustomerRouter path={path} />
      ) : (
        <MaintenanceRouter path={path} />
      )}
    </DataProvider>
  );
}
