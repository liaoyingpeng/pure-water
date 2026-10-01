import React, { createContext, useContext, useEffect, useState } from "react";

export const sites = [
  {
    id: "site-001",
    companyId: "company-cht",
    company: "中華電信",
    name: "桃園廠",
    address: "桃園市龜山區科技一路 88 號",
    status: "正常",
    eff: 87,
    approach: 4.2,
    flow: 120,
    wet: 25.8,
    inlet: 31.6,
    outlet: 27.4,
    updated: "2 分鐘前",
    alert: "正常",
  },
  {
    id: "site-002",
    companyId: "company-cht",
    company: "中華電信",
    name: "台中廠",
    address: "台中市西屯區工業三路 16 號",
    status: "正常",
    eff: 91,
    approach: 3.8,
    flow: 142,
    wet: 26.1,
    inlet: 32.2,
    outlet: 28.4,
    updated: "3 分鐘前",
    alert: "正常",
  },
  {
    id: "site-003",
    companyId: "company-cht",
    company: "中華電信",
    name: "高雄廠",
    address: "高雄市前鎮區新生路 58 號",
    status: "異常",
    eff: 72,
    approach: 7.4,
    flow: 108,
    wet: 27.2,
    inlet: 35.1,
    outlet: 28.9,
    updated: "1 分鐘前",
    alert: "趨近溫度",
  },
  {
    id: "site-004",
    companyId: "company-tsmc",
    company: "台積電",
    name: "新竹一廠",
    address: "新竹市科學園區力行六路 8 號",
    status: "異常",
    eff: 62,
    approach: 8.2,
    flow: 118,
    wet: 25.4,
    inlet: 34.8,
    outlet: 28.2,
    updated: "1 分鐘前",
    alert: "散熱效率",
  },
  {
    id: "site-005",
    companyId: "company-tsmc",
    company: "台積電",
    name: "台南廠",
    address: "台南市新市區南科一路 1 號",
    status: "正常",
    eff: 88,
    approach: 4.5,
    flow: 155,
    wet: 26.4,
    inlet: 32.8,
    outlet: 28.3,
    updated: "5 分鐘前",
    alert: "正常",
  },
  {
    id: "site-006",
    companyId: "company-ase",
    company: "日月光",
    name: "高雄廠",
    address: "高雄市楠梓區經三路 26 號",
    status: "異常",
    eff: 65,
    approach: 6.9,
    flow: 104,
    wet: 27.1,
    inlet: 34.1,
    outlet: 28.7,
    updated: "1 分鐘前",
    alert: "水流量",
  },
];

export const engineers = [
  { id: "eng-001", name: "王柏翔" },
  { id: "eng-002", name: "陳志明" },
  { id: "eng-003", name: "林冠宇" },
];

const initialSchedules = [
  {
    id: "sch-001",
    siteId: "site-001",
    engineerId: "eng-001",
    date: "2026-09-30",
    start: "09:00",
    end: "11:00",
    type: "冷卻水塔定期清潔",
    description: "清洗填充材、水盤除垢並確認風扇運轉。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-002",
    siteId: "site-004",
    engineerId: "eng-001",
    date: "2026-09-30",
    start: "14:00",
    end: "16:00",
    type: "設備校正",
    description: "校正流量計與溫度感測器，記錄校正前後數值。",
    status: "進行中",
    source: "admin",
  },
  {
    id: "sch-003",
    siteId: "site-002",
    engineerId: "eng-003",
    date: "2026-10-06",
    start: "14:00",
    end: "16:00",
    type: "例行巡檢",
    description: "檢查皮帶、馬達與補水系統。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-004",
    siteId: "site-003",
    engineerId: "eng-001",
    date: "2026-10-17",
    start: "13:30",
    end: "15:30",
    type: "異常複檢",
    description: "確認趨近溫度偏高原因。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-005",
    siteId: "site-005",
    engineerId: "eng-002",
    date: "2026-09-26",
    start: "09:30",
    end: "11:30",
    type: "冷卻塔清洗",
    description: "例行清洗與水質檢查。",
    status: "已完成",
    source: "admin",
  },
];
const initialLogs = [
  {
    id: "log-001",
    scheduleId: "sch-005",
    siteId: "site-005",
    engineerId: "eng-002",
    date: "2026-09-26",
    type: "冷卻塔清洗",
    notes:
      "完成冷卻水塔填充材清洗與水盤除垢。運轉測試 30 分鐘，各項數據恢復正常。",
    photos: 3,
  },
  {
    id: "log-002",
    scheduleId: null,
    siteId: "site-001",
    engineerId: "eng-003",
    date: "2026-09-22",
    type: "例行巡檢",
    notes: "檢查馬達、風扇與補水系統，設備運作正常。已更換一組老化皮帶。",
    photos: 2,
  },
  {
    id: "log-003",
    scheduleId: null,
    siteId: "site-002",
    engineerId: null,
    date: "2026-09-18",
    type: "水質檢測",
    notes: "完成循環水採樣與藥劑濃度調整，建議下月持續追蹤導電度。",
    photos: 2,
  },
];
const KEY = "wlj-prototype-data-v2";
export function readSharedData() {
  return load();
}
export function addSharedSchedule(item) {
  let state = load();
  state.schedules.push({ ...item, id: "sch-" + Date.now(), status: "待執行" });
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}
const DataContext = createContext(null);
function load() {
  try {
    return (
      JSON.parse(localStorage.getItem(KEY)) || {
        schedules: initialSchedules,
        logs: initialLogs,
      }
    );
  } catch {
    return { schedules: initialSchedules, logs: initialLogs };
  }
}
export function DataProvider({ children }) {
  const [state, setState] = useState(load);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(state)), [state]);
  const addSchedule = (x) =>
    setState((s) => ({
      ...s,
      schedules: [
        ...s.schedules,
        { ...x, id: "sch-" + Date.now(), status: "待執行" },
      ],
    }));
  const completeWork = (schedule, notes, photos) =>
    setState((s) => ({
      schedules: s.schedules.map((x) =>
        x.id === schedule.id ? { ...x, status: "已完成" } : x,
      ),
      logs: [
        {
          id: "log-" + Date.now(),
          scheduleId: schedule.id,
          siteId: schedule.siteId,
          engineerId: schedule.engineerId,
          date: schedule.date,
          type: schedule.type,
          notes,
          photos,
        },
        ...s.logs,
      ],
    }));
  const addLog = (x) =>
    setState((s) => ({
      ...s,
      logs: [{ ...x, id: "log-" + Date.now() }, ...s.logs],
    }));
  return (
    <DataContext.Provider
      value={{ ...state, addSchedule, completeWork, addLog }}
    >
      {children}
    </DataContext.Provider>
  );
}
export const useData = () => useContext(DataContext);
export const getSite = (id) => sites.find((x) => x.id === id);
export const getEngineer = (id) => engineers.find((x) => x.id === id);
export const trend = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  wet: +(25 + Math.sin(i / 3) * 2).toFixed(1),
  inlet: +(31 + Math.sin(i / 4) * 2).toFixed(1),
  outlet: +(27 + Math.sin(i / 4) * 1.5).toFixed(1),
  approach: +(4 + Math.sin(i / 5)).toFixed(1),
  eff: Math.round(84 + Math.sin(i / 3) * 5),
  flow: Math.round(125 + Math.sin(i / 2) * 12),
}));
