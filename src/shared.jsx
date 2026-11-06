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
    tda: null,
    tds: null,
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
    tda: null,
    tds: null,
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
    tda: null,
    tds: null,
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
    tda: null,
    tds: null,
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
    tda: null,
    tds: null,
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
    tda: null,
    tds: null,
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
// Additional demo work shares the prototype calendar date used by the portals.
const additionalSchedules = [
  {
    id: "sch-006",
    siteId: "site-001",
    engineerId: "eng-001",
    date: "2026-09-30",
    start: "08:00",
    end: "08:45",
    type: "例行巡檢",
    description: "檢查水盤水位、補水浮球與管路接頭，記錄滲漏及設備運轉聲音。",
    status: "已完成",
    source: "admin",
  },
  {
    id: "sch-007",
    siteId: "site-001",
    engineerId: "eng-001",
    date: "2026-11-06",
    start: "11:15",
    end: "12:00",
    type: "水質檢測",
    description: "採集循環水，記錄酸鹼值、導電度與外觀，核對現場水質紀錄。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-008",
    siteId: "site-004",
    engineerId: "eng-001",
    date: "2026-11-12",
    start: "16:15",
    end: "17:00",
    type: "例行巡檢",
    description: "檢查風扇護網、皮帶外觀及馬達振動，拍照記錄異常位置。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-009",
    siteId: "site-002",
    engineerId: "eng-002",
    date: "2026-09-30",
    start: "09:00",
    end: "10:30",
    type: "補水系統檢查",
    description: "確認補水閥、浮球與水位訊號，觀察補水及溢流狀況。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-010",
    siteId: "site-006",
    engineerId: "eng-003",
    date: "2026-09-30",
    start: "13:00",
    end: "15:00",
    type: "異常複檢",
    description: "追蹤水流量偏低，檢查濾網阻塞、閥門開度與泵浦運轉紀錄。",
    status: "進行中",
    source: "admin",
  },
  {
    id: "sch-011",
    siteId: "site-001",
    engineerId: "eng-001",
    date: "2026-10-01",
    start: "09:00",
    end: "10:00",
    type: "例行巡檢",
    description: "巡查風扇、馬達及水盤，核對進出水溫度與現場儀表。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-012",
    siteId: "site-002",
    engineerId: "eng-001",
    date: "2026-10-02",
    start: "09:00",
    end: "10:30",
    type: "水質檢測",
    description: "採樣記錄水質，檢視加藥桶存量、加藥泵及管路有無滲漏。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-013",
    siteId: "site-003",
    engineerId: "eng-002",
    date: "2026-10-05",
    start: "10:00",
    end: "12:00",
    type: "異常複檢",
    description: "比對趨近溫度趨勢，檢視填充材堵塞與噴淋分布並記錄改善建議。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-014",
    siteId: "site-004",
    engineerId: "eng-001",
    date: "2026-10-07",
    start: "09:00",
    end: "11:00",
    type: "馬達與風扇保養",
    description:
      "安排停機後檢視皮帶張力、軸承與固定螺栓，完成後記錄試運轉結果。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-015",
    siteId: "site-005",
    engineerId: "eng-002",
    date: "2026-10-08",
    start: "13:30",
    end: "15:00",
    type: "補水系統檢查",
    description: "檢視浮球閥動作、補水管路及溢流口，確認水位訊號正常。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-016",
    siteId: "site-006",
    engineerId: "eng-003",
    date: "2026-10-09",
    start: "09:00",
    end: "11:00",
    type: "泵浦保養",
    description: "檢視泵浦振動、異音與軸封滲漏，記錄運轉電流及流量。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-017",
    siteId: "site-001",
    engineerId: "eng-001",
    date: "2026-10-12",
    start: "09:00",
    end: "11:00",
    type: "冷卻塔清洗",
    description: "安排停機清除水盤沉積物與濾網雜物，檢視填充材並拍攝前後照片。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-018",
    siteId: "site-002",
    engineerId: "eng-003",
    date: "2026-10-14",
    start: "14:00",
    end: "16:00",
    type: "設備校正",
    description: "比對現場溫度與流量感測器讀值，記錄偏差及校正結果。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-019",
    siteId: "site-005",
    engineerId: "eng-002",
    date: "2026-10-16",
    start: "09:00",
    end: "10:00",
    type: "例行巡檢",
    description: "檢查塔體外觀、護網、檢修門與周邊排水，回報鏽蝕及積水位置。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-020",
    siteId: "site-004",
    engineerId: "eng-001",
    date: "2026-10-20",
    start: "09:00",
    end: "10:30",
    type: "水質檢測",
    description: "追蹤清洗後水質與導電度變化，核對加藥及排污紀錄。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-021",
    siteId: "site-006",
    engineerId: "eng-003",
    date: "2026-10-22",
    start: "13:30",
    end: "15:00",
    type: "管路與閥件檢查",
    description: "巡查循環水管路、法蘭與閥件，標記滲漏、鏽蝕及保溫破損位置。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-022",
    siteId: "site-003",
    engineerId: "eng-001",
    date: "2026-10-26",
    start: "09:00",
    end: "11:00",
    type: "年度保養",
    description: "彙整設備運轉與保養紀錄，檢視耗材狀態並安排後續更換項目。",
    status: "待執行",
    source: "admin",
  },
  {
    id: "sch-023",
    siteId: "site-001",
    engineerId: "eng-001",
    date: "2026-10-28",
    start: "14:00",
    end: "15:30",
    type: "異常複檢",
    description: "複查前次巡檢缺失，確認修復照片、運轉數據及待追蹤事項。",
    status: "待執行",
    source: "admin",
  },
];
initialSchedules.push(...additionalSchedules);

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
initialLogs.push({
  id: "log-seed-006",
  scheduleId: "sch-006",
  siteId: "site-001",
  engineerId: "eng-001",
  date: "2026-09-30",
  type: "例行巡檢",
  notes:
    "已完成水盤水位、補水浮球與管路接頭巡查，未發現滲漏，設備運轉聲音正常。",
  photos: 2,
});
const KEY = "wlj-prototype-data-v2";
const SEED_VERSION = 2;
const rescheduledDates = { "sch-007": "2026-11-06", "sch-008": "2026-11-12" };
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
  const defaults = () => ({
    schedules: [...initialSchedules],
    logs: [...initialLogs],
    seedVersion: SEED_VERSION,
  });
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (
      !saved ||
      !Array.isArray(saved.schedules) ||
      !Array.isArray(saved.logs)
    ) {
      return defaults();
    }
    if (saved.seedVersion !== SEED_VERSION) {
      const ids = new Set(saved.schedules.map((item) => item.id));
      const logIds = new Set(saved.logs.map((item) => item.id));
      return {
        ...saved,
        schedules: [
          ...saved.schedules.map((item) =>
            rescheduledDates[item.id] &&
            item.date === "2026-09-30" &&
            item.status === "待執行"
              ? { ...item, date: rescheduledDates[item.id] }
              : item,
          ),
          ...additionalSchedules.filter((item) => !ids.has(item.id)),
        ],
        logs: [
          ...saved.logs,
          ...initialLogs.filter(
            (item) => item.id === "log-seed-006" && !logIds.has(item.id),
          ),
        ],
        seedVersion: SEED_VERSION,
      };
    }
    return saved;
  } catch {
    return defaults();
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
      ...s,
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

export function calendarMonth(year, month) {
  const first = new Date(year, month, 1);
  const normalizedYear = first.getFullYear();
  const normalizedMonth = first.getMonth();
  const count =
    Math.ceil(
      (first.getDay() +
        new Date(normalizedYear, normalizedMonth + 1, 0).getDate()) /
        7,
    ) * 7;
  return {
    year: normalizedYear,
    month: normalizedMonth,
    days: Array.from({ length: count }, (_, index) => {
      const date = new Date(
        normalizedYear,
        normalizedMonth,
        index - first.getDay() + 1,
      );
      return {
        day: date.getDate(),
        outside: date.getMonth() !== normalizedMonth,
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      };
    }),
  };
}
