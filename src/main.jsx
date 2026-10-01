import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import * as I from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./style.css";
import "./portals.css";
import { PortalRoot } from "./portals";
import {
  readSharedData,
  addSharedSchedule,
  sites as sharedSites,
  getSite as sharedSite,
  getEngineer as sharedEngineer,
  engineers as sharedEngineers,
} from "./shared.jsx";

const sites = [
  ["中華電信", "桃園廠", "正常", 86, 128, "正常", "2 分鐘前"],
  ["中華電信", "台中廠", "正常", 91, 142, "正常", "3 分鐘前"],
  ["台積電", "新竹一廠", "異常", 62, 118, "散熱效率", "1 分鐘前"],
  ["台積電", "台南廠", "正常", 88, 155, "正常", "5 分鐘前"],
  ["聯華電子", "南科廠", "正常", 84, 136, "正常", "4 分鐘前"],
  ["國泰醫院", "台北院區", "異常", 69, 94, "趨近溫度", "2 分鐘前"],
  ["長庚醫院", "林口院區", "正常", 93, 168, "正常", "6 分鐘前"],
  ["遠東百貨", "信義店", "停止", 0, 0, "正常", "18 分鐘前"],
  ["新光三越", "台中店", "正常", 82, 110, "正常", "5 分鐘前"],
  ["台灣高鐵", "左營站", "正常", 89, 126, "正常", "4 分鐘前"],
  ["日月光", "高雄廠", "異常", 65, 104, "水流量", "1 分鐘前"],
  ["台塑企業", "麥寮廠", "正常", 87, 178, "正常", "7 分鐘前"],
  ["宏碁科技", "汐止總部", "正常", 90, 98, "正常", "8 分鐘前"],
  ["華碩電腦", "關渡總部", "正常", 85, 105, "正常", "3 分鐘前"],
  ["台北 101", "信義案場", "正常", 92, 160, "正常", "2 分鐘前"],
  ["統一企業", "永康廠", "停止", 0, 0, "正常", "22 分鐘前"],
].map((x, i) => ({
  id: i + 1,
  company: x[0],
  name: x[1],
  status: x[2],
  eff: x[3],
  flow: x[4],
  alert: x[5],
  updated: x[6],
}));
const trend = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  wet: +(25 + Math.sin(i / 3) * 2).toFixed(1),
  inlet: +(31 + Math.sin(i / 4) * 2).toFixed(1),
  outlet: +(27 + Math.sin(i / 4) * 1.5).toFixed(1),
  approach: +(4 + Math.sin(i / 5)).toFixed(1),
  eff: Math.round(84 + Math.sin(i / 3) * 5),
  flow: Math.round(125 + Math.sin(i / 2) * 12),
}));
const alerts = [
  [
    "2026/09/29 14:32",
    "台積電",
    "新竹一廠",
    "散熱效率",
    "62%",
    "75–100%",
    "處理中",
  ],
  [
    "2026/09/29 13:48",
    "國泰醫院",
    "台北院區",
    "趨近溫度",
    "8.2°C",
    "2–6°C",
    "待確認",
  ],
  [
    "2026/09/29 11:20",
    "日月光",
    "高雄廠",
    "水流量",
    "104 CMH",
    "115–165 CMH",
    "處理中",
  ],
  [
    "2026/09/28 16:05",
    "中華電信",
    "桃園廠",
    "進水溫度",
    "36.5°C",
    "24–34°C",
    "已排除",
  ],
  [
    "2026/09/28 09:12",
    "台積電",
    "台南廠",
    "濕球溫度",
    "30.1°C",
    "18–29°C",
    "已確認",
  ],
];
const maintenance = [
  {
    day: 2,
    time: "09:30",
    company: "台積電",
    site: "新竹一廠",
    type: "冷卻塔清洗",
    person: "陳志明",
  },
  {
    day: 6,
    time: "14:00",
    company: "中華電信",
    site: "桃園廠",
    type: "例行巡檢",
    person: "林冠宇",
  },
  {
    day: 11,
    time: "10:00",
    company: "長庚醫院",
    site: "林口院區",
    type: "水質檢測",
    person: "王柏翔",
  },
  {
    day: 17,
    time: "13:30",
    company: "日月光",
    site: "高雄廠",
    type: "設備校正",
    person: "陳志明",
  },
  {
    day: 23,
    time: "09:00",
    company: "台塑企業",
    site: "麥寮廠",
    type: "年度保養",
    person: "張家豪",
  },
  {
    day: 28,
    time: "15:00",
    company: "國泰醫院",
    site: "台北院區",
    type: "異常複檢",
    person: "林冠宇",
  },
];
const nav = [
  ["總覽", I.LayoutDashboard],
  ["案場管理", I.Building2],
  ["預警管理", I.TriangleAlert],
  ["維護日曆", I.CalendarDays],
  ["維護日誌", I.ClipboardList],
  ["數據記錄", I.ChartNoAxesCombined],
  ["節能分析", I.Leaf],
  ["帳號管理", I.Users],
];
const labels = {
  wet: ["濕球溫度", "°C"],
  inlet: ["進水溫度", "°C"],
  outlet: ["出水溫度", "°C"],
  approach: ["趨近溫度", "°C"],
  eff: ["散熱效率", "%"],
  flow: ["水流量", "CMH"],
};

function Badge({ children, tone }) {
  return (
    <span
      className={
        "badge " +
        (tone ||
          (/異常|待|處理/.test(children)
            ? "danger"
            : /停止/.test(children)
              ? "muted"
              : "ok"))
      }
    >
      {children}
    </span>
  );
}
function Button({ children, kind = "", ...p }) {
  return (
    <button className={"btn " + kind} {...p}>
      {children}
    </button>
  );
}
function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={"modal " + (wide ? "wide" : "")}>
        <header>
          <h2>{title}</h2>
          <button className="icon" onClick={onClose} aria-label="關閉">
            <I.X />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
function Chart({
  dataKey = "eff",
  height = 180,
  color = "#176b58",
  data = trend,
  tickInterval = 5,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={"g" + dataKey} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".22" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e8ece9" vertical={false} />
        <XAxis dataKey="t" tick={{ fontSize: 11 }} interval={tickInterval} />
        <YAxis tick={{ fontSize: 11 }} width={32} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={"url(#g" + dataKey + ")"}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
function Header({ title, desc, children }) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      <div className="actions">{children}</div>
    </div>
  );
}
function Filters({ children }) {
  return <div className="filters">{children}</div>;
}

function Overview({ go }) {
  return (
    <>
      <Header title="總覽" desc="掌握所有案場的即時運作狀況">
        <Button kind="ghost">
          <I.RefreshCw />
          更新資料
        </Button>
      </Header>
      <div className="stats">
        {[
          ["案場總數", "16", "較上月 +2", I.Building2],
          ["正常案場", "11", "運作率 68.8%", I.CircleCheck],
          ["異常案場", "3", "需要關注", I.TriangleAlert],
          ["今日預警", "5", "2 筆待處理", I.BellRing],
          ["近期維護", "6", "未來 30 天", I.Wrench],
        ].map((x, i) => {
          let C = x[3];
          return (
            <div className="stat" key={x[0]}>
              <div className={"stat-icon s" + i}>
                <C />
              </div>
              <div>
                <span>{x[0]}</span>
                <strong>{x[1]}</strong>
                <small>{x[2]}</small>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dash-grid">
        <section className="panel span2">
          <div className="section-title">
            <div>
              <h2>異常案場</h2>
              <p>目前需優先處理的案場</p>
            </div>
            <Button kind="link" onClick={() => go("預警管理")}>
              查看全部
              <I.ArrowRight />
            </Button>
          </div>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>公司名稱</th>
                  <th>案場名稱</th>
                  <th>異常項目</th>
                  <th>發生時間</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {sites
                  .filter((s) => s.status === "異常")
                  .map((s) => (
                    <tr key={s.id} onClick={() => go("戰情室", s)}>
                      <td>{s.company}</td>
                      <td className="strong">{s.name}</td>
                      <td>{s.alert}</td>
                      <td>今天 {["14:32", "13:48", "11:20"][s.id % 3]}</td>
                      <td>
                        <Badge>處理中</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <div>
              <h2>近期維護</h2>
              <p>未來 30 天排程</p>
            </div>
            <Button kind="link" onClick={() => go("維護日曆")}>
              查看日曆
              <I.ArrowRight />
            </Button>
          </div>
          <div className="event-list">
            {maintenance.slice(0, 4).map((e) => (
              <div className="event" key={e.day}>
                <div className="datebox">
                  <b>{e.day}</b>
                  <span>10月</span>
                </div>
                <div>
                  <strong>{e.type}</strong>
                  <p>
                    {e.company} · {e.site}
                  </p>
                  <small>
                    {e.time}　{e.person}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel span3">
          <div className="section-title">
            <div>
              <h2>近期預警</h2>
              <p>最近 24 小時系統偵測紀錄</p>
            </div>
          </div>
          <div className="alert-row">
            {alerts.slice(0, 3).map((a) => (
              <div key={a[0]}>
                <I.AlertCircle />
                <span>
                  <b>{a[2]}</b>
                  <small>
                    {a[3]} · {a[4]}
                  </small>
                </span>
                <time>{a[0].split(" ")[1]}</time>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Sites({ go }) {
  const [q, setQ] = useState(""),
    [company, setCompany] = useState("全部公司"),
    [status, setStatus] = useState("全部狀態"),
    [alert, setAlert] = useState("全部"),
    [modal, setModal] = useState(false);
  const rows = sites.filter(
    (s) =>
      (s.company + s.name).includes(q) &&
      (company === "全部公司" || s.company === company) &&
      (status === "全部狀態" || s.status === status) &&
      (alert === "全部" ||
        (alert === "異常" ? s.alert !== "正常" : s.alert === "正常")),
  );
  return (
    <>
      <Header
        title="案場管理"
        desc={`共 ${sites.length} 個案場，集中管理設備狀態與監測資料`}
      >
        <Button onClick={() => setModal(true)}>
          <I.Plus />
          新增案場
        </Button>
      </Header>
      <Filters>
        <div className="search">
          <I.Search />
          <input
            placeholder="搜尋公司或案場名稱"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select value={company} onChange={(e) => setCompany(e.target.value)}>
          <option>全部公司</option>
          {[...new Set(sites.map((s) => s.company))].map((x) => (
            <option>{x}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>全部狀態</option>
          <option>正常</option>
          <option>異常</option>
          <option>停止</option>
        </select>
        <select value={alert} onChange={(e) => setAlert(e.target.value)}>
          <option>全部</option>
          <option>正常</option>
          <option>異常</option>
        </select>
        <span className="result">顯示 {rows.length} 筆</span>
      </Filters>
      <div className="panel tablewrap">
        <table>
          <thead>
            <tr>
              <th>公司名稱</th>
              <th>案場名稱</th>
              <th>設備狀態</th>
              <th>散熱效率</th>
              <th>水流量</th>
              <th>異常狀態</th>
              <th>最後更新</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} onClick={() => go("戰情室", s)}>
                <td>{s.company}</td>
                <td className="strong">{s.name}</td>
                <td>
                  <span className={"dot " + s.status} />
                  {s.status}
                </td>
                <td className="num">{s.eff ? s.eff + "%" : "—"}</td>
                <td className="num">{s.flow ? s.flow + " CMH" : "—"}</td>
                <td>
                  <Badge>{s.alert}</Badge>
                </td>
                <td className="muted-text">{s.updated}</td>
                <td>
                  <I.ChevronRight size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title="新增案場" onClose={() => setModal(false)}>
          <SiteForm />
          <div className="modal-actions">
            <Button kind="ghost" onClick={() => setModal(false)}>
              取消
            </Button>
            <Button onClick={() => setModal(false)}>建立案場</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
function SiteForm() {
  return (
    <div className="form-grid">
      <Field label="公司名稱">
        <input defaultValue="台灣科技股份有限公司" />
      </Field>
      <Field label="案場名稱">
        <input placeholder="例：桃園一廠" />
      </Field>
      <Field label="地址">
        <input placeholder="請輸入完整地址" />
      </Field>
      <Field label="資料拋接驗證碼">
        <input defaultValue="WLJ-2026-00017" />
      </Field>
    </div>
  );
}
function WarRoom({ site, go }) {
  site = site || sites[2];
  let metrics = [
    ["wet", trend[23].wet, "正常"],
    ["inlet", trend[23].inlet, "正常"],
    ["outlet", trend[23].outlet, "正常"],
    ["approach", 8.2, "異常"],
    ["eff", site.eff, site.eff < 75 ? "異常" : "正常"],
    ["flow", site.flow, site.flow === 0 ? "停止運轉" : "正常"],
  ];
  return (
    <>
      <div className="breadcrumb">
        <button onClick={() => go("案場管理")}>案場管理</button>
        <I.ChevronRight />
        案場戰情室
      </div>
      <Header
        title={site.name}
        desc={`${site.company}　·　桃園市龜山區科技一路 88 號`}
      >
        <Badge tone={site.status === "異常" ? "danger" : "ok"}>
          {site.status === "停止" ? "設備停止運轉" : "設備" + site.status}
        </Badge>
        <Button kind="ghost" onClick={() => go("案場設定", site)}>
          <I.Settings />
          案場設定
        </Button>
      </Header>
      <div className="updatebar">
        <I.Radio /> 即時監測中 <span>最後更新：2026/09/29 15:42:18</span>
        <button onClick={() => go("歷史資料", site)}>
          查看歷史資料
          <I.ArrowRight />
        </button>
      </div>
      <div className="metric-grid">
        {metrics.map(([k, v, state]) => (
          <div className="metric" key={k}>
            <div className="metric-head">
              <span>{labels[k][0]}</span>
              <Badge
                tone={
                  state === "正常"
                    ? "ok"
                    : state === "異常"
                      ? "danger"
                      : "muted"
                }
              >
                {state}
              </Badge>
            </div>
            <div className="metric-value">
              <strong>{v}</strong>
              <span>{labels[k][1]}</span>
            </div>
            <Chart
              dataKey={k}
              height={130}
              color={state === "異常" ? "#c94b45" : "#176b58"}
            />
            <small>最近 24 小時趨勢</small>
          </div>
        ))}
      </div>
    </>
  );
}

function History({ site }) {
  const [type, setType] = useState("eff"),
    [start, setStart] = useState("2026-04-01"),
    [end, setEnd] = useState("2026-09-29");
  const csv = () => {
    let c =
      "時間," +
      labels[type].join("(") +
      ")\n" +
      trend.map((x) => `${x.t},${x[type]}`).join("\n");
    let a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(["\ufeff" + c], { type: "text/csv" }),
    );
    a.download = "歷史資料.csv";
    a.click();
  };
  return (
    <>
      <Header
        title="歷史資料"
        desc={`${site?.company || "台積電"} · ${site?.name || "新竹一廠"}`}
      >
        <Button kind="ghost" onClick={csv}>
          <I.Download />
          匯出 CSV
        </Button>
      </Header>
      <Filters>
        <Field label="開始日期">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        <Field label="結束日期">
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
        <Field label="監測數據">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(labels).map(([k, v]) => (
              <option value={k}>{v[0]}</option>
            ))}
          </select>
        </Field>
        <Button>套用查詢</Button>
      </Filters>
      <section className="panel chart-panel">
        <div className="section-title">
          <div>
            <h2>{labels[type][0]}趨勢</h2>
            <p>
              {start} 至 {end} · 每日平均
            </p>
          </div>
          <div className="legend">
            <span /> {labels[type][0]}（{labels[type][1]}）
          </div>
        </div>
        <Chart dataKey={type} height={410} />
      </section>
    </>
  );
}
function Alerts() {
  const [detail, setDetail] = useState(null),
    [settings, setSettings] = useState(false),
    [q, setQ] = useState("全部公司"),
    [siteFilter, setSiteFilter] = useState("全部案場");
  const availableSites = [
    ...new Set(
      alerts.filter((a) => q === "全部公司" || a[1] === q).map((a) => a[2]),
    ),
  ];
  let rows = alerts.filter(
    (a) =>
      (q === "全部公司" || a[1] === q) &&
      (siteFilter === "全部案場" || a[2] === siteFilter),
  );
  return (
    <>
      <Header title="預警管理" desc="檢視與處理所有案場的異常紀錄">
        <Button kind="ghost" onClick={() => setSettings(true)}>
          <I.SlidersHorizontal />
          預警設定
        </Button>
      </Header>
      <Filters>
        <select
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSiteFilter("全部案場");
          }}
        >
          <option>全部公司</option>
          {[...new Set(alerts.map((x) => x[1]))].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
        >
          <option>全部案場</option>
          {availableSites.map((site) => (
            <option key={site}>{site}</option>
          ))}
        </select>
        <select>
          <option>全部異常類型</option>
          <option>溫度異常</option>
          <option>效率異常</option>
          <option>流量異常</option>
        </select>
        <input type="date" defaultValue="2026-09-29" />
        <span className="result">共 {rows.length} 筆</span>
      </Filters>
      <div className="panel tablewrap">
        <table>
          <thead>
            <tr>
              <th>發生時間</th>
              <th>公司</th>
              <th>案場</th>
              <th>異常項目</th>
              <th>異常數值</th>
              <th>正常範圍</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr onClick={() => setDetail(a)}>
                <td>{a[0]}</td>
                <td>{a[1]}</td>
                <td className="strong">{a[2]}</td>
                <td>{a[3]}</td>
                <td className="danger-text strong">{a[4]}</td>
                <td>{a[5]}</td>
                <td>
                  <Badge>{a[6]}</Badge>
                </td>
                <td>
                  <I.ChevronRight size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <Modal title="預警詳細資訊" onClose={() => setDetail(null)}>
          <div className="detail-grid">
            {[
              "發生時間",
              "公司",
              "案場",
              "異常項目",
              "異常數值",
              "正常範圍",
            ].map((x, i) => (
              <div>
                <span>{x}</span>
                <strong>{detail[i]}</strong>
              </div>
            ))}
          </div>
          <div className="note">
            <I.Info />
            系統偵測到數值超出正常範圍，建議安排工程人員檢查設備運作狀況。
          </div>
          <div className="modal-actions">
            <Button kind="ghost" onClick={() => setDetail(null)}>
              關閉
            </Button>
            <Button onClick={() => setDetail(null)}>標記為已確認</Button>
          </div>
        </Modal>
      )}
      {settings && (
        <Modal title="預警範圍設定" wide onClose={() => setSettings(false)}>
          <div className="range-list">
            {Object.values(labels).map((v, i) => (
              <div>
                <b>{v[0]}</b>
                <Field label="最低值">
                  <input
                    type="number"
                    defaultValue={[18, 24, 20, 2, 75, 100][i]}
                  />
                </Field>
                <span>—</span>
                <Field label="最高值">
                  <input
                    type="number"
                    defaultValue={[29, 34, 30, 6, 100, 180][i]}
                  />
                </Field>
                <em>{v[1]}</em>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <Button kind="ghost" onClick={() => setSettings(false)}>
              取消
            </Button>
            <Button onClick={() => setSettings(false)}>儲存設定</Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Calendar() {
  const [modal, setModal] = useState(null),
    [month, setMonth] = useState(9),
    [sharedSchedules, setSharedSchedules] = useState(
      () => readSharedData().schedules,
    ),
    [draft, setDraft] = useState({
      siteId: "site-001",
      engineerId: "eng-001",
      date: "2026-10-15",
      start: "09:00",
      end: "11:00",
      type: "例行巡檢",
      description: "",
      source: "admin",
    }),
    [companyFilter, setCompanyFilter] = useState("全部公司"),
    [siteFilter, setSiteFilter] = useState("全部案場"),
    [engineerFilter, setEngineerFilter] = useState("全部工程人員"),
    [typeFilter, setTypeFilter] = useState("全部維護類型");
  const filteredSchedules = sharedSchedules.filter((schedule) => {
    const site = sharedSite(schedule.siteId);
    return (
      (companyFilter === "全部公司" || site?.company === companyFilter) &&
      (siteFilter === "全部案場" || schedule.siteId === siteFilter) &&
      (engineerFilter === "全部工程人員" ||
        schedule.engineerId === engineerFilter) &&
      (typeFilter === "全部維護類型" || schedule.type === typeFilter)
    );
  });
  let days = Array.from({ length: 35 }, (_, i) => i - 2);
  const selectedSiteId = modal && modal !== "add" ? modal.siteId : draft.siteId;
  const selectedCompany =
    sharedSite(selectedSiteId)?.company || sharedSites[0]?.company || "";
  const companySites = sharedSites.filter(
    (site) => site.company === selectedCompany,
  );
  return (
    <>
      <Header title="維護日曆" desc="安排與追蹤各案場的維護工作">
        <Button onClick={() => setModal("add")}>
          <I.Plus />
          新增維護排程
        </Button>
      </Header>
      <Filters>
        <select
          value={companyFilter}
          onChange={(e) => {
            setCompanyFilter(e.target.value);
            setSiteFilter("全部案場");
          }}
        >
          <option>全部公司</option>
          {[...new Set(sharedSites.map((site) => site.company))].map(
            (company) => (
              <option key={company}>{company}</option>
            ),
          )}
        </select>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
        >
          <option>全部案場</option>
          {sharedSites
            .filter(
              (site) =>
                companyFilter === "全部公司" || site.company === companyFilter,
            )
            .map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
        </select>
        <select
          value={engineerFilter}
          onChange={(e) => setEngineerFilter(e.target.value)}
        >
          <option>全部工程人員</option>
          {sharedEngineers.map((engineer) => (
            <option key={engineer.id} value={engineer.id}>
              {engineer.name}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option>全部維護類型</option>
          {[...new Set(sharedSchedules.map((schedule) => schedule.type))].map(
            (type) => (
              <option key={type}>{type}</option>
            ),
          )}
        </select>
      </Filters>
      <section className="panel calendar">
        <div className="cal-head">
          <div>
            <button className="icon" onClick={() => setMonth(month - 1)}>
              <I.ChevronLeft />
            </button>
            <button className="icon" onClick={() => setMonth(month + 1)}>
              <I.ChevronRight />
            </button>
            <Button kind="ghost">今天</Button>
          </div>
          <h2>2026 年 {month + 1} 月</h2>
          <div className="seg">
            <button className="active">月</button>
            <button>週</button>
          </div>
        </div>
        <div className="week">
          {["日", "一", "二", "三", "四", "五", "六"].map((x) => (
            <b key={x}>{x}</b>
          ))}
        </div>
        <div className="days">
          {days.map((d, i) => {
            let dateDay = d < 1 ? 30 + d : d > 31 ? d - 31 : d;
            let events = filteredSchedules.filter(
              (x) =>
                +x.date.slice(5, 7) === month + 1 &&
                +x.date.slice(8) === dateDay,
            );
            return (
              <div key={i} className={d < 1 || d > 31 ? "outside" : ""}>
                <span>{dateDay}</span>
                {events.map((e) => (
                  <button
                    key={e.id}
                    className="cal-event"
                    onClick={() => setModal(e)}
                  >
                    <b>{e.start}</b> {e.type}
                    <small>
                      {sharedSite(e.siteId)?.name} · {e.status}
                    </small>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>
      {modal && (
        <Modal
          title={modal === "add" ? "新增維護排程" : "維護排程詳細"}
          onClose={() => setModal(null)}
        >
          <div className="form-grid">
            <Field label="日期">
              <input
                type="date"
                value={modal.date || draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </Field>
            <Field label="時間">
              <input
                type="time"
                value={modal.start || draft.start}
                onChange={(e) => setDraft({ ...draft, start: e.target.value })}
              />
            </Field>
            <Field label="公司">
              <select
                value={selectedCompany}
                onChange={(e) => {
                  const firstSite = sharedSites.find(
                    (site) => site.company === e.target.value,
                  );
                  if (firstSite) setDraft({ ...draft, siteId: firstSite.id });
                }}
              >
                {[...new Set(sharedSites.map((site) => site.company))].map(
                  (company) => (
                    <option key={company}>{company}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="案場">
              <select
                value={selectedSiteId}
                onChange={(e) => setDraft({ ...draft, siteId: e.target.value })}
              >
                {companySites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="維護項目">
              <input
                value={modal.type || draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                placeholder="請輸入維護項目"
              />
            </Field>
            <Field label="負責工程人員">
              <select
                value={modal.engineerId || draft.engineerId}
                onChange={(e) =>
                  setDraft({ ...draft, engineerId: e.target.value })
                }
              >
                {sharedEngineers.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="modal-actions">
            <Button kind="ghost" onClick={() => setModal(null)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (modal === "add")
                  setSharedSchedules(addSharedSchedule(draft).schedules);
                setModal(null);
              }}
            >
              儲存排程
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Logs() {
  const [add, setAdd] = useState(false);
  let logs = readSharedData().logs.map((x) => {
    let site = sharedSite(x.siteId);
    return [
      site?.company || "—",
      site?.name || "—",
      x.date.replaceAll("-", "/"),
      x.type,
      sharedEngineer(x.engineerId)?.name || "客戶自行維護",
      x.notes,
      x.photos || 0,
      x.id,
    ];
  });
  return (
    <>
      <Header title="維護日誌" desc="保存工程完成後的檢修紀錄與現場照片">
        <Button onClick={() => setAdd(true)}>
          <I.Plus />
          新增維護日誌
        </Button>
      </Header>
      <Filters>
        <div className="search">
          <I.Search />
          <input placeholder="搜尋公司、案場或維護項目" />
        </div>
        <select>
          <option>全部公司</option>
        </select>
        <input type="date" />
      </Filters>
      <div className="log-grid">
        {logs.map((l, i) => (
          <article className="log" key={l[7]}>
            <div className="log-top">
              <div className="avatar">{l[4][0]}</div>
              <div>
                <h3>
                  {l[2]} · {l[3]}
                </h3>
                <p>
                  {l[0]}　{l[1]}　·　{l[4]}
                </p>
              </div>
              <Button kind="link">查看排程</Button>
            </div>
            <p className="log-text">{l[5]}</p>
            <div className="photos">
              {Array.from({ length: l[6] }, (_, j) => (
                <div key={j} className={"photo p" + (i + j)}>
                  <I.Image />
                  <span>現場照片 {j + 1}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      {add && (
        <Modal title="新增維護日誌" wide onClose={() => setAdd(false)}>
          <div className="form-grid">
            <Field label="排程日期">
              <input type="date" defaultValue="2026-10-02" />
            </Field>
            <Field label="公司">
              <select>
                {[...new Set(sharedSites.map((site) => site.company))].map(
                  (company) => (
                    <option key={company}>{company}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="案場">
              <select defaultValue="site-004">
                {sharedSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="事件">
              <select defaultValue="冷卻塔清洗">
                {[
                  ...new Set(
                    readSharedData().schedules.map((schedule) => schedule.type),
                  ),
                ].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="工程人員">
              <input defaultValue="陳志明" />
            </Field>
            <Field label="文字紀錄">
              <textarea placeholder="輸入本次維護內容、處理結果與後續建議" />
            </Field>
            <Field label="現場照片">
              <div className="upload">
                <I.UploadCloud />
                點擊上傳照片<small>可選擇多張 JPG、PNG</small>
              </div>
            </Field>
          </div>
          <div className="modal-actions">
            <Button kind="ghost" onClick={() => setAdd(false)}>
              取消
            </Button>
            <Button onClick={() => setAdd(false)}>建立日誌</Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function buildAnalyticsData(range, customStart, customEnd) {
  const rangeDays = {
    "7 天": 7,
    "1 個月": 30,
    "1 季": 90,
    半年: 180,
    "1 年": 365,
  };
  const fallbackEnd = new Date(Date.UTC(2026, 8, 29));
  let end =
    range === "自訂日期" ? new Date(`${customEnd}T00:00:00Z`) : fallbackEnd;
  let days = rangeDays[range] || 30;
  if (range === "自訂日期") {
    const start = new Date(`${customStart}T00:00:00Z`);
    const customDays = Math.floor((end - start) / 86400000) + 1;
    if (Number.isFinite(customDays) && customDays > 0)
      days = Math.min(customDays, 366);
  }
  if (Number.isNaN(end.getTime())) end = fallbackEnd;
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (days - 1 - index));
    return {
      t: `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(
        date.getUTCDate(),
      ).padStart(2, "0")}`,
      wet: +(25 + Math.sin(index / 3) * 2).toFixed(1),
      inlet: +(31 + Math.sin(index / 4) * 2).toFixed(1),
      outlet: +(27 + Math.sin(index / 4) * 1.5).toFixed(1),
      approach: +(4 + Math.sin(index / 5)).toFixed(1),
      eff: Math.round(84 + Math.sin(index / 3) * 5),
      flow: Math.round(125 + Math.sin(index / 2) * 12),
    };
  });
}

function Analytics() {
  const [type, setType] = useState("eff"),
    [range, setRange] = useState("1 個月"),
    [ai, setAi] = useState(false),
    [customStart, setCustomStart] = useState("2026-09-01"),
    [customEnd, setCustomEnd] = useState("2026-09-29");
  const chartData = buildAnalyticsData(range, customStart, customEnd);
  const rangeStart = chartData[0]?.t;
  const rangeEnd = chartData.at(-1)?.t;
  return (
    <>
      <Header title="數據記錄" desc="跨期間檢視案場運作表現與數據趨勢">
        <Button kind="ghost">
          <I.Download />
          CSV 匯出
        </Button>
        <Button onClick={() => setAi(true)}>
          <I.Sparkles />
          AI 智能尋優
        </Button>
      </Header>
      <Filters>
        <select>
          <option>台積電｜新竹一廠</option>
          {sites.map((s) => (
            <option>
              {s.company}｜{s.name}
            </option>
          ))}
        </select>
        <div className="range-tabs">
          {["7 天", "1 個月", "1 季", "半年", "1 年", "自訂日期"].map((x) => (
            <button
              className={range === x ? "active" : ""}
              onClick={() => setRange(x)}
            >
              {x}
            </button>
          ))}
        </div>
        {range === "自訂日期" && (
          <>
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <input
              type="date"
              value={customEnd}
              min={customStart}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </>
        )}
      </Filters>
      <div className="analysis-layout">
        <aside className="metric-menu">
          {Object.entries(labels).map(([k, v]) => (
            <button
              className={type === k ? "active" : ""}
              onClick={() => setType(k)}
            >
              <span>{v[0]}</span>
              <b>
                {trend[23][k]} {v[1]}
              </b>
            </button>
          ))}
        </aside>
        <section className="panel chart-panel">
          <div className="section-title">
            <div>
              <h2>{labels[type][0]}記錄</h2>
              <p>
                {range}趨勢 · 2026/{rangeStart} 至 2026/{rangeEnd}
              </p>
            </div>
            <Button kind="ghost">
              <I.GitCompareArrows />
              數據比對
            </Button>
          </div>
          <Chart
            dataKey={type}
            height={390}
            data={chartData}
            tickInterval={Math.max(0, Math.floor(chartData.length / 7) - 1)}
          />
          <div className="summary">
            <div>
              <span>期間平均</span>
              <b>
                {type === "eff" ? "85.6" : trend[12][type]} {labels[type][1]}
              </b>
            </div>
            <div>
              <span>最高值</span>
              <b>
                {type === "eff" ? "94" : trend[7][type]} {labels[type][1]}
              </b>
            </div>
            <div>
              <span>最低值</span>
              <b>
                {type === "eff" ? "76" : trend[18][type]} {labels[type][1]}
              </b>
            </div>
          </div>
        </section>
      </div>
      {ai && (
        <Modal title="AI 智能尋優" onClose={() => setAi(false)}>
          <div className="coming">
            <I.Sparkles />
            <h3>功能準備中</h3>
            <p>
              未來將依據設備運轉與環境資料，提供節能參數建議與異常原因分析。
            </p>
          </div>
          <div className="modal-actions">
            <Button onClick={() => setAi(false)}>我知道了</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
function EnergyAnalysis() {
  const [tab, setTab] = useState("節能分析中控台"),
    [fileName, setFileName] = useState("未選擇任何檔案"),
    [hourStart, setHourStart] = useState(9),
    [hourEnd, setHourEnd] = useState(18),
    [interval, setInterval] = useState(10),
    [iterations, setIterations] = useState(500),
    [topK, setTopK] = useState(5),
    [message, setMessage] = useState("");
  const resultData = Array.from({ length: 30 }, (_, index) => ({
    t: `${String(index + 1).padStart(2, "0")} 日`,
    before: Math.round(78 + Math.sin(index / 4) * 4),
    after: Math.round(86 + Math.sin(index / 5) * 3),
  }));
  const savedParams = [
    ["新竹一廠｜夏季高負載", "09:00–18:00", "25–28°C", "80–100%", "2026/09/28"],
    ["桃園廠｜日間標準", "08:00–17:00", "24–29°C", "75–100%", "2026/09/22"],
    ["高雄廠｜流量優化", "10:00–19:00", "26–31°C", "78–100%", "2026/09/18"],
  ];
  return (
    <>
      <Header title="節能分析" desc="設備數據分析、AI 尋優與參數方案管理" />
      <section className="panel energy-upload">
        <div>
          <I.FileSpreadsheet />
          <span>
            <b>設備數據檔案</b>
            <small>支援 Excel（.xlsx、.xls）與 CSV</small>
          </span>
        </div>
        <label className="btn ghost energy-file-button">
          選擇檔案
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) =>
              setFileName(event.target.files[0]?.name || "未選擇任何檔案")
            }
          />
        </label>
        <span className="energy-file-name">{fileName}</span>
      </section>
      <div className="energy-tabs" role="tablist">
        {["節能分析中控台", "AI 智能尋優引擎", "參數儲存庫"].map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => {
              setTab(item);
              setMessage("");
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "節能分析中控台" && (
        <>
          <div className="energy-workspace">
            <section className="panel energy-control-card">
              <h2>分析區間與時間設定</h2>
              <div className="energy-date-row">
                <b>基準期間 Before</b>
                <input type="date" defaultValue="2025-07-19" />
                <span>—</span>
                <input type="date" defaultValue="2025-08-19" />
              </div>
              <div className="energy-date-row">
                <b>優化期間 After</b>
                <input type="date" defaultValue="2025-09-01" />
                <span>—</span>
                <input type="date" defaultValue="2025-09-07" />
              </div>
              <div className="energy-range-field">
                <label>
                  統計時間：{hourStart}:00－{hourEnd}:00
                </label>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={hourStart}
                    onChange={(e) => setHourStart(+e.target.value)}
                  />
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={hourEnd}
                    onChange={(e) => setHourEnd(+e.target.value)}
                  />
                </div>
              </div>
              <Field label={`截取頻率：${interval} 分鐘`}>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={interval}
                  onChange={(e) => setInterval(+e.target.value)}
                />
              </Field>
            </section>
            <section className="panel energy-control-card">
              <h2>數據過濾與清洗條件</h2>
              <div className="energy-condition-grid">
                <Field label="總管流量下限（CMH）">
                  <input type="number" defaultValue="0" />
                </Field>
                <Field label="總管流量上限（CMH）">
                  <input type="number" defaultValue="1000" />
                </Field>
                <Field label="濕球溫度下限（°C）">
                  <input type="number" defaultValue="25" step="0.5" />
                </Field>
                <Field label="濕球溫度上限（°C）">
                  <input type="number" defaultValue="28" step="0.5" />
                </Field>
                <Field label="散熱效率下限（%）">
                  <input type="number" defaultValue="0" />
                </Field>
                <Field label="散熱效率上限（%）">
                  <input type="number" defaultValue="100" />
                </Field>
                <Field label="趨近溫度大於（°C）">
                  <input type="number" defaultValue="0" step="0.1" />
                </Field>
                <Field label="去雜訊百分位（%）">
                  <input type="text" defaultValue="5－95" />
                </Field>
              </div>
            </section>
          </div>
          <div className="energy-actions">
            <Button
              onClick={() =>
                setMessage("分析完成，已產生 Before／After 成效比較。")
              }
            >
              執行分析
            </Button>
            <Button
              kind="ghost"
              onClick={() => setMessage("參數已保存至參數儲存庫。")}
            >
              保存參數
            </Button>
            <Button kind="ghost">
              <I.Copy /> 複製報告
            </Button>
            <Button kind="ghost">
              <I.Download /> 下載 Excel
            </Button>
          </div>
          {message && <div className="updatebar">{message}</div>}
          <section className="panel chart-panel energy-chart">
            <div className="section-title">
              <div>
                <h2>Before／After 散熱效率比較</h2>
                <p>優化後平均散熱效率提升 8.4%</p>
              </div>
              <Badge>分析完成</Badge>
            </div>
            <Chart
              dataKey="after"
              data={resultData}
              height={320}
              tickInterval={4}
            />
          </section>
        </>
      )}
      {tab === "AI 智能尋優引擎" && (
        <>
          <div className="energy-ai-intro">
            <I.Sparkles />
            <div>
              <h2>AI 智能尋優引擎</h2>
              <p>
                從指定日期母體隨機取樣，自動尋找最佳趨近溫度降幅與散熱效率的參數組合；留白欄位將由系統自動探索。
              </p>
            </div>
          </div>
          <div className="energy-workspace ai">
            <section className="panel energy-control-card">
              <h2>1. 搜尋母體範圍</h2>
              <Field label="Before 開始">
                <input type="date" defaultValue="2025-07-19" />
              </Field>
              <Field label="Before 結束">
                <input type="date" defaultValue="2025-08-19" />
              </Field>
              <Field label="After 開始">
                <input type="date" defaultValue="2025-09-01" />
              </Field>
              <Field label="After 結束">
                <input type="date" defaultValue="2025-09-07" />
              </Field>
            </section>
            <section className="panel energy-control-card">
              <h2>2. 自訂條件鎖定</h2>
              <div className="energy-condition-grid">
                <Field label="統計開始時間">
                  <input type="number" placeholder="自動運算" />
                </Field>
                <Field label="統計結束時間">
                  <input type="number" placeholder="自動運算" />
                </Field>
                <Field label="濕球溫度下限">
                  <input type="number" placeholder="例如 25" />
                </Field>
                <Field label="濕球溫度上限">
                  <input type="number" placeholder="例如 28" />
                </Field>
                <Field label="散熱效率下限">
                  <input type="number" defaultValue="0" />
                </Field>
                <Field label="散熱效率上限">
                  <input type="number" placeholder="例如 100" />
                </Field>
                <Field label="總管流量下限">
                  <input type="number" placeholder="例如 150" />
                </Field>
                <Field label="趨近溫度大於">
                  <input type="number" defaultValue="0" />
                </Field>
              </div>
            </section>
          </div>
          <div className="energy-runbar">
            <Field label="測算次數">
              <input
                type="number"
                min="10"
                value={iterations}
                onChange={(e) => setIterations(+e.target.value)}
              />
            </Field>
            <Field label="產出名次數量">
              <input
                type="number"
                min="1"
                value={topK}
                onChange={(e) => setTopK(+e.target.value)}
              />
            </Field>
            <Button kind="ghost" onClick={() => setMessage("")}>
              清空設定
            </Button>
            <Button
              onClick={() =>
                setMessage(
                  `已完成 ${iterations} 次測算，產出最佳 ${topK} 組參數。`,
                )
              }
            >
              開始分析與測算
            </Button>
          </div>
          {message && <div className="updatebar">{message}</div>}
        </>
      )}
      {tab === "參數儲存庫" && (
        <>
          <div className="energy-library-head">
            <div>
              <h2>已保存參數庫</h2>
              <p>保存的分析條件可再次套用、備註或匯出備份。</p>
            </div>
            <div>
              <Button kind="ghost">
                <I.Upload /> 匯入參數
              </Button>
              <Button kind="ghost">
                <I.Download /> 匯出備份
              </Button>
            </div>
          </div>
          <div className="energy-library-grid">
            {savedParams.map((item, index) => (
              <article className="panel energy-param-card" key={item[0]}>
                <header>
                  <span>方案 {index + 1}</span>
                  <Badge>已保存</Badge>
                </header>
                <h3>{item[0]}</h3>
                <dl>
                  <div>
                    <dt>統計時間</dt>
                    <dd>{item[1]}</dd>
                  </div>
                  <div>
                    <dt>濕球溫度</dt>
                    <dd>{item[2]}</dd>
                  </div>
                  <div>
                    <dt>散熱效率</dt>
                    <dd>{item[3]}</dd>
                  </div>
                  <div>
                    <dt>保存日期</dt>
                    <dd>{item[4]}</dd>
                  </div>
                </dl>
                <footer>
                  <Button kind="ghost">套用參數</Button>
                  <Button kind="link">編輯備註</Button>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
function Accounts() {
  const [modal, setModal] = useState(false);
  let data = [
    ["王怡婷", "後台管理員", "水利淨", "全部案場", "—", "啟用"],
    ["李宗翰", "唯讀管理員", "水利淨", "全部案場", "—", "啟用"],
    ["陳志明", "工程人員", "水利淨", "8 個案場", "—", "啟用"],
    ["林冠宇", "工程人員", "水利淨", "6 個案場", "—", "啟用"],
    ["林建宏", "客戶帳號", "中華電信", "桃園廠、台中廠", "2027/06/30", "啟用"],
    ["張雅雯", "客戶帳號", "台積電", "新竹一廠、台南廠", "2027/12/31", "啟用"],
    ["周志遠", "客戶帳號", "日月光", "高雄廠", "2026/10/31", "停用"],
  ];
  return (
    <>
      <Header title="帳號管理" desc="管理後台、客戶與工程人員的使用權限">
        <Button onClick={() => setModal(true)}>
          <I.UserPlus />
          新增帳號
        </Button>
      </Header>
      <Filters>
        <div className="search">
          <I.Search />
          <input placeholder="搜尋姓名或公司" />
        </div>
        <select>
          <option>全部角色</option>
          <option>後台管理員</option>
          <option>客戶帳號</option>
          <option>工程人員</option>
        </select>
        <select>
          <option>全部狀態</option>
          <option>啟用</option>
          <option>停用</option>
        </select>
      </Filters>
      <div className="panel tablewrap">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>角色</th>
              <th>所屬公司</th>
              <th>可查看案場</th>
              <th>合約到期日</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((x) => (
              <tr>
                <td className="strong">{x[0]}</td>
                <td>{x[1]}</td>
                <td>{x[2]}</td>
                <td>{x[3]}</td>
                <td>{x[4]}</td>
                <td>
                  <Badge tone={x[5] === "停用" ? "muted" : "ok"}>{x[5]}</Badge>
                </td>
                <td>
                  <Button kind="link" onClick={() => setModal(true)}>
                    查看／編輯
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title="帳號資料" onClose={() => setModal(false)}>
          <div className="form-grid">
            <Field label="姓名">
              <input defaultValue="林建宏" />
            </Field>
            <Field label="帳號角色">
              <select>
                <option>客戶帳號</option>
                <option>後台管理員</option>
                <option>唯讀管理員</option>
                <option>工程人員</option>
              </select>
            </Field>
            <Field label="所屬公司">
              <select>
                <option>中華電信</option>
              </select>
            </Field>
            <Field label="合約到期日">
              <input type="date" defaultValue="2027-06-30" />
            </Field>
            <Field label="可查看案場">
              <div className="checks">
                <label>
                  <input type="checkbox" defaultChecked />
                  桃園廠
                </label>
                <label>
                  <input type="checkbox" defaultChecked />
                  台中廠
                </label>
              </div>
            </Field>
            <Field label="帳號狀態">
              <select>
                <option>啟用</option>
                <option>停用</option>
              </select>
            </Field>
          </div>
          <div className="modal-actions">
            <Button kind="ghost" onClick={() => setModal(false)}>
              取消
            </Button>
            <Button onClick={() => setModal(false)}>儲存變更</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Settings({ site }) {
  const [tab, setTab] = useState("基本資料");
  return (
    <>
      <Header
        title="案場設定"
        desc={`${site?.company || "台積電"} · ${site?.name || "新竹一廠"}`}
      >
        <Button>儲存變更</Button>
      </Header>
      <div className="settings-layout">
        <aside>
          {["基本資料", "資料串接", "營業／休假", "預警設定"].map((x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
            >
              {x}
            </button>
          ))}
        </aside>
        <section className="panel settings-panel">
          <h2>{tab}</h2>
          <p>設定此案場的{tab}。</p>
          {tab === "基本資料" && <SiteForm />}
          {tab === "資料串接" && (
            <>
              <Field label="資料拋接驗證碼">
                <div className="copy-input">
                  <input defaultValue="WLJ-XC9K-260929" readOnly />
                  <Button kind="ghost">
                    <I.Copy />
                    複製
                  </Button>
                </div>
              </Field>
              <div className="note">
                <I.ShieldCheck />
                驗證碼用於識別案場資料來源，請妥善保管並避免公開。
              </div>
            </>
          )}
          {tab === "營業／休假" && (
            <div className="schedule">
              <h3>固定營業日</h3>
              <div className="weekday">
                {["一", "二", "三", "四", "五", "六", "日"].map((x, i) => (
                  <label className={i < 5 ? "on" : ""}>
                    <input type="checkbox" defaultChecked={i < 5} />
                    {x}
                  </label>
                ))}
              </div>
              <h3>特殊日期</h3>
              <div className="special">
                <input type="date" />
                <select>
                  <option>臨時休假日</option>
                  <option>臨時營業日</option>
                </select>
                <Button kind="ghost">
                  <I.Plus />
                  新增
                </Button>
              </div>
            </div>
          )}
          {tab === "預警設定" && (
            <div className="range-list">
              {Object.values(labels).map((v, i) => (
                <div>
                  <b>{v[0]}</b>
                  <Field label="最低值">
                    <input
                      type="number"
                      defaultValue={[18, 24, 20, 2, 75, 100][i]}
                    />
                  </Field>
                  <span>—</span>
                  <Field label="最高值">
                    <input
                      type="number"
                      defaultValue={[29, 34, 30, 6, 100, 180][i]}
                    />
                  </Field>
                  <em>{v[1]}</em>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function App() {
  const [page, setPage] = useState("總覽"),
    [site, setSite] = useState(null),
    [open, setOpen] = useState(false);
  const go = (p, s) => {
    setPage(p);
    if (s) setSite(s);
    setOpen(false);
    window.scrollTo(0, 0);
  };
  let comp = {
    總覽: <Overview go={go} />,
    案場管理: <Sites go={go} />,
    戰情室: <WarRoom site={site} go={go} />,
    歷史資料: <History site={site} />,
    預警管理: <Alerts />,
    維護日曆: <Calendar />,
    維護日誌: <Logs />,
    數據記錄: <Analytics />,
    節能分析: <EnergyAnalysis />,
    帳號管理: <Accounts />,
    案場設定: <Settings site={site} />,
  }[page];
  return (
    <div className="app">
      <aside className={"sidebar " + (open ? "open" : "")}>
        <div className="brand">
          <div className="brandmark">
            <I.Droplets />
          </div>
          <div>
            <b>水利淨</b>
            <span>節能管理系統</span>
          </div>
          <button className="icon close" onClick={() => setOpen(false)}>
            <I.X />
          </button>
        </div>
        <nav>
          <small>管理中心</small>
          {nav.map(([n, C]) => (
            <button
              key={n}
              className={page === n ? "active" : ""}
              onClick={() => go(n)}
            >
              <C />
              {n}
            </button>
          ))}
          <small>個別案場</small>
          {site && (
            <>
              <button
                className={page === "戰情室" ? "active" : ""}
                onClick={() => go("戰情室")}
              >
                <I.Gauge />
                案場戰情室
              </button>
              <button
                className={page === "歷史資料" ? "active" : ""}
                onClick={() => go("歷史資料")}
              >
                <I.History />
                歷史資料
              </button>
            </>
          )}
        </nav>
        <div className="user">
          <div>管</div>
          <span>
            <b>管理員</b>
            <small>系統管理者</small>
          </span>
          <I.MoreHorizontal />
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="shell">
        <header className="topbar">
          <button className="icon hamburger" onClick={() => setOpen(true)}>
            <I.Menu />
          </button>
          <div className="site-select">
            <span>目前檢視</span>
            <b>{site ? site.company + "｜" + site.name : "全部案場"}</b>
            <I.ChevronDown />
          </div>
          <div className="top-actions">
            <button className="icon" aria-label="說明">
              <I.HelpCircle />
            </button>
            <button className="icon notif" aria-label="通知">
              <I.Bell />
              <i />
            </button>
          </div>
        </header>
        <main>{comp}</main>
      </div>
    </div>
  );
}
function Root() {
  const getPath = () => {
    if (location.protocol !== "file:") return location.pathname;
    if (location.hash.startsWith("#/")) return location.hash.slice(1);
    const file = decodeURIComponent(location.pathname.split("/").pop() || "");
    if (file === "customer.html") return "/customer";
    if (file === "maintenance.html") return "/maintenance";
    return "/admin";
  };
  const [path, setPath] = useState(getPath);
  useEffect(() => {
    if (path === "/") history.replaceState({}, "", "/admin");
    const sync = () => setPath(getPath());
    addEventListener("popstate", sync);
    addEventListener("hashchange", sync);
    return () => {
      removeEventListener("popstate", sync);
      removeEventListener("hashchange", sync);
    };
  }, []);
  return path.startsWith("/customer") || path.startsWith("/maintenance") ? (
    <PortalRoot path={path} />
  ) : (
    <App />
  );
}
createRoot(document.getElementById("root")).render(<Root />);
