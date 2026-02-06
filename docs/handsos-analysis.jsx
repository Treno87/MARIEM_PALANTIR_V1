import { useState } from "react";

const columnMap = [
  { idx: 0, name: "날짜", dbField: "service_date + service_time", type: "string", format: "YY-MM-DD HH:MM", unique: 270, notes: "날짜+시간 분리 필요" },
  { idx: 1, name: "고객명", dbField: "customers.name", type: "string", format: "한글 이름", unique: 105, notes: "→ customers 테이블 FK" },
  { idx: 2, name: "성별", dbField: "customers.gender", type: "string", format: "남/여", unique: 1, notes: "고객 속성" },
  { idx: 3, name: "구분", dbField: "transaction_type", type: "string", format: "시술/상품/회원", unique: 3, notes: "거래 유형 분류" },
  { idx: 4, name: "메뉴", dbField: "service_menus.category", type: "string", format: "카테고리명", unique: 12, notes: "→ service_menus 테이블" },
  { idx: 5, name: "상세메뉴", dbField: "service_menus.name", type: "string", format: "시술/상품명", unique: 53, notes: "→ service_menus 테이블" },
  { idx: 6, name: "수량", dbField: "quantity", type: "int", format: "정수", unique: 2, notes: "대부분 1" },
  { idx: 7, name: "담당자", dbField: "stylists.name", type: "string", format: "이름", unique: 4, notes: "→ stylists 테이블 FK" },
  { idx: 8, name: "판매가", dbField: "list_price", type: "int", format: "원", unique: 46, notes: "정가" },
  { idx: 9, name: "할인율(%)", dbField: "discount_rate", type: "int", format: "0~50", unique: 8, notes: "퍼센트" },
  { idx: 10, name: "할인액", dbField: "discount_amount", type: "int", format: "원", unique: 1, notes: "현재 모두 0" },
  { idx: 11, name: "이벤트할인", dbField: "event_name", type: "string", format: "이벤트명", unique: 9, notes: "할인 이벤트 설명, NaN 많음" },
  { idx: 12, name: "결제금액", dbField: "paid_amount", type: "int", format: "원", unique: 87, notes: "★ 실제 결제된 금액" },
  { idx: 13, name: "현금", dbField: "pay_cash", type: "int", format: "원", unique: 11, notes: "결제수단별 분배" },
  { idx: 14, name: "(구분2)", dbField: "—", type: "string", format: "—", unique: 1, notes: "거의 비어있음, 무시" },
  { idx: 15, name: "카드", dbField: "pay_card", type: "int", format: "원", unique: 48, notes: "결제수단별 분배" },
  { idx: 16, name: "이체", dbField: "pay_transfer", type: "int", format: "원", unique: 11, notes: "결제수단별 분배" },
  { idx: 17, name: "(빈 컬럼)", dbField: "—", type: "—", format: "—", unique: 0, notes: "모두 NaN, 무시" },
  { idx: 18, name: "Pay", dbField: "pay_mobile", type: "int", format: "원", unique: 44, notes: "모바일결제" },
  { idx: 19, name: "기타", dbField: "pay_other", type: "int", format: "원", unique: 1, notes: "모두 0" },
  { idx: 20, name: "할인결제", dbField: "pay_discount", type: "int", format: "원", unique: 46, notes: "정액권/할인 사용액" },
  { idx: 21, name: "회원권", dbField: "pay_membership", type: "int", format: "원", unique: 7, notes: "회원권 사용액" },
  { idx: 22, name: "외상", dbField: "pay_credit", type: "int", format: "원", unique: 1, notes: "모두 0" },
  { idx: 23, name: "포인트(사용)", dbField: "point_used", type: "int", format: "원", unique: 1, notes: "모두 0" },
  { idx: 24, name: "포인트(적립)", dbField: "point_earned", type: "int", format: "원", unique: 1, notes: "모두 0" },
  { idx: 25, name: "방문유형", dbField: "visit_type", type: "string", format: "기존/신규/소개/불구", unique: 4, notes: "고객 방문 분류" },
  { idx: 26, name: "(빈 컬럼)", dbField: "—", type: "—", format: "—", unique: 0, notes: "무시" },
  { idx: 27, name: "(빈 컬럼)", dbField: "—", type: "—", format: "—", unique: 0, notes: "무시" },
  { idx: 28, name: "메모", dbField: "memo", type: "string", format: "텍스트", unique: 237, notes: "시술 메모, 상담내용" },
];

const dbTables = [
  {
    name: "transactions",
    desc: "거래 내역 (핵심 팩트 테이블)",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "tenant_id", type: "bigint FK", note: "멀티테넌시" },
      { name: "customer_id", type: "bigint FK", note: "→ customers" },
      { name: "stylist_id", type: "bigint FK", note: "→ stylists" },
      { name: "service_menu_id", type: "bigint FK", note: "→ service_menus" },
      { name: "service_date", type: "date", note: "시술 날짜" },
      { name: "service_time", type: "time", note: "시술 시간" },
      { name: "transaction_type", type: "varchar", note: "시술/상품/회원" },
      { name: "quantity", type: "integer", note: "수량" },
      { name: "list_price", type: "integer", note: "정가" },
      { name: "discount_rate", type: "integer", note: "할인율 %" },
      { name: "discount_amount", type: "integer", note: "할인액" },
      { name: "event_name", type: "varchar", note: "이벤트/할인명" },
      { name: "paid_amount", type: "integer", note: "★ 실결제액" },
      { name: "visit_type", type: "varchar", note: "기존/신규/소개" },
      { name: "memo", type: "text", note: "메모" },
      { name: "source", type: "varchar", note: "handsos/manual" },
      { name: "external_hash", type: "varchar", note: "중복방지 해시" },
    ],
  },
  {
    name: "payments",
    desc: "결제 수단 상세 (1:N 관계)",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "transaction_id", type: "bigint FK", note: "→ transactions" },
      { name: "method", type: "varchar", note: "cash/card/transfer/pay/membership/point" },
      { name: "amount", type: "integer", note: "결제 금액" },
    ],
  },
  {
    name: "customers",
    desc: "고객 마스터",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "tenant_id", type: "bigint FK", note: "멀티테넌시" },
      { name: "name", type: "varchar", note: "고객명" },
      { name: "gender", type: "varchar", note: "성별" },
    ],
  },
  {
    name: "stylists",
    desc: "스타일리스트 마스터",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "tenant_id", type: "bigint FK", note: "멀티테넌시" },
      { name: "name", type: "varchar", note: "이름" },
    ],
  },
  {
    name: "service_menus",
    desc: "시술/상품 메뉴 마스터",
    columns: [
      { name: "id", type: "bigint", pk: true },
      { name: "tenant_id", type: "bigint FK", note: "멀티테넌시" },
      { name: "category", type: "varchar", note: "메뉴 카테고리" },
      { name: "name", type: "varchar", note: "상세메뉴명" },
      { name: "base_price", type: "integer", note: "기본 가격" },
    ],
  },
];

const stats = {
  totalRows: 440,
  totalRevenue: "30,147,100원",
  totalSales: "40,003,210원 (총영업합계)",
  customers: 105,
  stylists: 4,
  services: 53,
  categories: 12,
  dateRange: "2026-01-01 ~ 2026-01-31",
  discountDist: [
    { rate: "0%", count: 172 },
    { rate: "30%", count: 153 },
    { rate: "35%", count: 48 },
    { rate: "50%", count: 29 },
    { rate: "20%", count: 17 },
    { rate: "15%", count: 14 },
    { rate: "25%", count: 5 },
    { rate: "10%", count: 2 },
  ],
  visitDist: [
    { type: "기존", count: 338, pct: 76.8 },
    { type: "신규", count: 75, pct: 17.0 },
    { type: "소개", count: 15, pct: 3.4 },
    { type: "기타", count: 12, pct: 2.7 },
  ],
  txTypeDist: [
    { type: "시술", count: 418, pct: 95.0 },
    { type: "상품", count: 21, pct: 4.8 },
    { type: "회원", count: 1, pct: 0.2 },
  ],
};

const pipelineSteps = [
  {
    step: 1,
    title: "파일 읽기",
    desc: "HTML 형식의 .xls → pandas read_html",
    code: `# Windows 환경 (cp949/euc-kr)
with open(filepath, 'r', encoding='euc-kr') as f:
    html = f.read()
tables = pd.read_html(html)
df = tables[3]  # 4번째 테이블 = 데이터`,
    warn: "핸드SOS는 HTML을 .xls로 내보냄. Excel이 아님!",
  },
  {
    step: 2,
    title: "컬럼 매핑",
    desc: "인덱스 기반으로 컬럼명 재지정",
    code: `COLUMN_MAP = {
    0: 'datetime_str',
    1: 'customer_name',
    2: 'gender',
    3: 'tx_type',       # 시술/상품/회원
    4: 'menu_category',
    5: 'menu_detail',
    6: 'quantity',
    7: 'stylist_name',
    8: 'list_price',
    9: 'discount_rate',
    10: 'discount_amount',
    11: 'event_name',
    12: 'paid_amount',
    13: 'pay_cash',
    15: 'pay_card',
    16: 'pay_transfer',
    18: 'pay_mobile',
    20: 'pay_discount',
    21: 'pay_membership',
    25: 'visit_type',
    28: 'memo'
}
df = df.iloc[:, list(COLUMN_MAP.keys())]
df.columns = list(COLUMN_MAP.values())`,
  },
  {
    step: 3,
    title: "날짜/시간 파싱",
    desc: "YY-MM-DD HH:MM → date + time 분리",
    code: `df['service_date'] = pd.to_datetime(
    '20' + df['datetime_str'].str[:8],
    format='%Y-%m-%d'
).dt.date

df['service_time'] = df['datetime_str'].str[9:].str.strip()
df.drop('datetime_str', axis=1, inplace=True)`,
  },
  {
    step: 4,
    title: "숫자 정제",
    desc: "콤마 제거 + int 변환",
    code: `NUMERIC_COLS = [
    'list_price', 'discount_rate', 'discount_amount',
    'paid_amount', 'pay_cash', 'pay_card',
    'pay_transfer', 'pay_mobile',
    'pay_discount', 'pay_membership'
]
for col in NUMERIC_COLS:
    df[col] = (df[col].astype(str)
               .str.replace(',', '')
               .str.strip()
               .replace('', '0')
               .astype(int))`,
  },
  {
    step: 5,
    title: "중복 방지 해시 생성",
    desc: "날짜+시간+고객+시술+금액 → SHA256",
    code: `import hashlib
def make_hash(row):
    key = f"{row['service_date']}-{row['service_time']}"\\
          f"-{row['customer_name']}-{row['menu_detail']}"\\
          f"-{row['paid_amount']}"
    return hashlib.sha256(key.encode()).hexdigest()

df['external_hash'] = df.apply(make_hash, axis=1)`,
  },
  {
    step: 6,
    title: "결제 수단 정규화",
    desc: "결제 컬럼들 → payments 테이블로 분리",
    code: `PAYMENT_MAP = {
    'pay_cash': 'cash',
    'pay_card': 'card',
    'pay_transfer': 'transfer',
    'pay_mobile': 'mobile_pay',
    'pay_discount': 'prepaid_voucher',
    'pay_membership': 'membership',
}

payments = []
for idx, row in df.iterrows():
    for col, method in PAYMENT_MAP.items():
        if row[col] > 0:
            payments.append({
                'external_hash': row['external_hash'],
                'method': method,
                'amount': row[col]
            })
payments_df = pd.DataFrame(payments)`,
  },
  {
    step: 7,
    title: "API 전송",
    desc: "Rails 백엔드 bulk_import 엔드포인트 호출",
    code: `import requests
payload = {
    "transactions": df[TX_COLS].to_dict('records'),
    "payments": payments_df.to_dict('records')
}
resp = requests.post(
    f"{API_URL}/api/v1/transactions/bulk_import",
    json=payload,
    headers={"Authorization": f"Bearer {TOKEN}"}
)
print(resp.json())`,
  },
];

function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-sky-100 text-sky-700 border-sky-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-rose-100 text-rose-700 border-rose-200",
    gray: "bg-zinc-100 text-zinc-600 border-zinc-200",
    purple: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
      <div className="text-xs text-zinc-500 font-medium mb-1">{label}</div>
      <div className="text-xl font-bold text-zinc-900">{value}</div>
      {sub && <div className="text-xs text-zinc-400 mt-1">{sub}</div>}
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, maxVal }) {
  const max = maxVal || Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="text-xs text-zinc-600 w-12 text-right font-mono">{d[labelKey]}</div>
          <div className="flex-1 h-6 bg-zinc-100 rounded-md overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-md transition-all"
              style={{ width: `${(d[valueKey] / max) * 100}%` }}
            />
            <span className="absolute right-2 top-0.5 text-xs text-zinc-600 font-mono">
              {d[valueKey]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HandSOSAnalysis() {
  const [tab, setTab] = useState("overview");
  const [expandedStep, setExpandedStep] = useState(null);

  const tabs = [
    { id: "overview", label: "📊 데이터 분석" },
    { id: "columns", label: "📋 컬럼 매핑" },
    { id: "schema", label: "🗄️ DB 스키마" },
    { id: "pipeline", label: "⚙️ 전처리 코드" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6" style={{ fontFamily: "'Pretendard', 'Noto Sans KR', system-ui, sans-serif" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              H
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">핸드SOS → DB 전처리 분석</h1>
              <p className="text-sm text-zinc-500">매출상세조회 파일 구조 분석 및 전처리 파이프라인</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge color="green">440행</Badge>
            <Badge color="blue">29컬럼</Badge>
            <Badge color="amber">HTML → .xls 형식</Badge>
            <Badge color="purple">euc-kr 인코딩</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-zinc-200 p-1 mb-5 overflow-x-auto shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="기간" value={stats.dateRange.split("~")[1]?.trim()} sub="2026년 1월" />
              <StatCard label="총 거래건수" value="440건" sub="489건 (결제기준)" />
              <StatCard label="총 매출액" value="30,147,100" sub="판매가 기준" />
              <StatCard label="고객 수" value="105명" sub="4명 스타일리스트" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-800 mb-3">할인율 분포</h3>
                <BarChart data={stats.discountDist} labelKey="rate" valueKey="count" />
              </div>
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-800 mb-3">방문 유형</h3>
                <div className="space-y-3">
                  {stats.visitDist.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-700 w-8">{v.type}</span>
                      <div className="flex-1 h-8 bg-zinc-100 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all"
                          style={{
                            width: `${v.pct}%`,
                            background: ["#38bdf8", "#34d399", "#fbbf24", "#a78bfa"][i],
                          }}
                        />
                        <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-mono text-zinc-600">
                          {v.count}건 ({v.pct}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <h4 className="text-xs font-bold text-zinc-500 mb-2">거래 유형</h4>
                  <div className="flex gap-2">
                    {stats.txTypeDist.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ["#38bdf8", "#34d399", "#fbbf24"][i] }} />
                        <span className="text-xs text-zinc-600">{t.type} {t.count}건</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <div className="flex gap-2">
                <span className="text-amber-500 text-lg">⚠️</span>
                <div>
                  <div className="text-sm font-bold text-amber-800">인코딩 주의사항</div>
                  <div className="text-xs text-amber-700 mt-1 leading-relaxed">
                    핸드SOS 파일은 <strong>HTML을 .xls 확장자로 저장</strong>한 형태입니다. 인코딩은 <code className="bg-amber-100 px-1 rounded">euc-kr (ks_c_5601-1987)</code>이며, Windows 환경에서 Python으로 읽을 때 반드시 encoding 파라미터를 지정해야 합니다. 일부 환경에서 한글이 깨질 수 있으므로 <code className="bg-amber-100 px-1 rounded">cp949</code>로 fallback 처리를 권장합니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Column Mapping */}
        {tab === "columns" && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-sm font-bold text-zinc-800">원본 컬럼 → DB 필드 매핑</h3>
              <p className="text-xs text-zinc-500 mt-1">
                <Badge color="green">사용</Badge> 전처리 대상 &nbsp;
                <Badge color="gray">무시</Badge> 빈 컬럼/불필요 &nbsp;
                <Badge color="purple">분리</Badge> payments 테이블로 이동
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-3 py-2 text-left text-zinc-500 font-medium">IDX</th>
                    <th className="px-3 py-2 text-left text-zinc-500 font-medium">원본 컬럼</th>
                    <th className="px-3 py-2 text-left text-zinc-500 font-medium">DB 필드</th>
                    <th className="px-3 py-2 text-left text-zinc-500 font-medium">타입</th>
                    <th className="px-3 py-2 text-left text-zinc-500 font-medium">Unique</th>
                    <th className="px-3 py-2 text-left text-zinc-500 font-medium">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {columnMap.map((col) => {
                    const isIgnored = col.dbField === "—";
                    const isPayment = col.dbField.startsWith("pay_");
                    return (
                      <tr
                        key={col.idx}
                        className={`border-b border-zinc-50 ${isIgnored ? "opacity-40" : ""} hover:bg-sky-50/50 transition-colors`}
                      >
                        <td className="px-3 py-2 font-mono text-zinc-400">{col.idx}</td>
                        <td className="px-3 py-2 font-medium text-zinc-800">{col.name}</td>
                        <td className="px-3 py-2">
                          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">{col.dbField}</code>
                        </td>
                        <td className="px-3 py-2">
                          <Badge color={col.type === "int" ? "blue" : col.type === "string" ? "green" : "gray"}>
                            {col.type}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-zinc-500">{col.unique || "—"}</td>
                        <td className="px-3 py-2 text-zinc-500">
                          {isPayment && <Badge color="purple">payments↗</Badge>}{" "}
                          {isIgnored && <Badge color="gray">무시</Badge>}{" "}
                          {col.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: DB Schema */}
        {tab === "schema" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-800 mb-4">ER 다이어그램 (간략)</h3>
              <div className="bg-zinc-900 rounded-lg p-4 text-xs font-mono text-green-400 leading-relaxed overflow-x-auto">
                <pre>{`  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
  │  customers  │     │   stylists   │     │ service_menus│
  │─────────────│     │──────────────│     │──────────────│
  │ id          │     │ id           │     │ id           │
  │ name        │     │ name         │     │ category     │
  │ gender      │     │              │     │ name         │
  └──────┬──────┘     └──────┬───────┘     │ base_price   │
         │                   │             └──────┬───────┘
         │    ┌──────────────┴──────────────┐     │
         └───→│       transactions          │←────┘
              │─────────────────────────────│
              │ id, tenant_id               │
              │ customer_id, stylist_id     │
              │ service_menu_id             │
              │ service_date, service_time  │
              │ transaction_type            │
              │ list_price, discount_rate   │
              │ paid_amount                 │
              │ visit_type, memo, source    │
              │ external_hash (unique)      │
              └──────────────┬──────────────┘
                             │ 1:N
                    ┌────────┴────────┐
                    │    payments     │
                    │─────────────────│
                    │ transaction_id  │
                    │ method          │
                    │ amount          │
                    └─────────────────┘`}</pre>
              </div>
            </div>

            {dbTables.map((table) => (
              <div key={table.name} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-zinc-900 text-white flex items-center gap-2">
                  <span className="text-base">🗄️</span>
                  <span className="font-bold text-sm">{table.name}</span>
                  <span className="text-zinc-400 text-xs ml-2">{table.desc}</span>
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {table.columns.map((col, i) => (
                      <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-2 w-40">
                          <code className={`font-medium ${col.pk ? "text-amber-600" : col.type.includes("FK") ? "text-sky-600" : "text-zinc-800"}`}>
                            {col.name}
                          </code>
                        </td>
                        <td className="px-3 py-2 w-28">
                          <Badge color={col.pk ? "amber" : col.type.includes("FK") ? "blue" : "gray"}>
                            {col.type}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-zinc-500">{col.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <div className="text-sm font-bold text-sky-800 mb-1">💡 설계 포인트</div>
              <ul className="text-xs text-sky-700 space-y-1 list-disc list-inside">
                <li><strong>payments 분리</strong>: 하나의 거래에 복합 결제(카드+현금 등) 가능 → 1:N 관계</li>
                <li><strong>external_hash</strong>: 날짜+시간+고객+시술+금액 조합 → 중복 import 방지</li>
                <li><strong>source 컬럼</strong>: 핸드SOS 데이터 vs 직접 입력 구분</li>
                <li><strong>acts_as_tenant</strong>: 모든 테이블에 tenant_id 적용 (기존 패턴 유지)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab: Pipeline Code */}
        {tab === "pipeline" && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-800 mb-2">전처리 파이프라인 (7단계)</h3>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {pipelineSteps.map((s, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {s.step}
                    </div>
                    {i < pipelineSteps.length - 1 && <div className="w-6 h-0.5 bg-sky-200 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {pipelineSteps.map((step) => (
              <div key={step.step} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-zinc-800">{step.title}</div>
                    <div className="text-xs text-zinc-500 truncate">{step.desc}</div>
                  </div>
                  <span className="text-zinc-400 text-lg transition-transform" style={{ transform: expandedStep === step.step ? "rotate(180deg)" : "" }}>
                    ▾
                  </span>
                </button>
                {expandedStep === step.step && (
                  <div className="border-t border-zinc-100">
                    {step.warn && (
                      <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                        ⚠️ {step.warn}
                      </div>
                    )}
                    <pre className="p-4 bg-zinc-950 text-green-400 text-xs overflow-x-auto leading-relaxed font-mono">
                      {step.code}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="text-sm font-bold text-emerald-800 mb-2">✅ 전체 실행 흐름 요약</div>
              <pre className="text-xs text-emerald-700 font-mono leading-relaxed">
{`[Windows] Selenium → .xls 다운로드
    ↓
[Python] read_html(encoding='euc-kr') → 4번째 테이블
    ↓
[Python] 컬럼 매핑 (인덱스 기반)
    ↓
[Python] 날짜 파싱 + 숫자 정제 + 해시 생성
    ↓
[Python] 결제수단 분리 → payments 배열
    ↓
[HTTP] POST /api/v1/transactions/bulk_import
    ↓
[Rails] TransactionImportService.call
    ├─ 중복 체크 (external_hash)
    ├─ Customer.find_or_create_by
    ├─ Stylist.find_by
    ├─ ServiceMenu.find_or_create_by
    └─ Transaction.create! + Payment.create!`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
