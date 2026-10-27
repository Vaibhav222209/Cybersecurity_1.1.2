import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FileText,
  Fingerprint,
  Flag,
  Globe2,
  LayoutDashboard,
  ListFilter,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Plus,
  Radar,
  Search,
  Shield,
  ShieldCheck,
  Target,
  X,
  type LucideIcon,
} from "lucide-react";
import Quiz from "./components/Quiz";
import Methodology from "./components/Methodology";
import {
  createReport,
  downloadFile,
  initialEngagements,
  initialFindings,
  phases,
  phaseTasks,
  type Engagement,
  type Finding,
  type Page,
  type Severity,
} from "./model";

const navigation: { name: Page; icon: LucideIcon }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Engagements", icon: Target },
  { name: "Methodology", icon: Fingerprint },
  { name: "Findings", icon: Flag },
  { name: "Reports", icon: FileText },
  { name: "VAPT Academy", icon: BookOpen },
];
const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low"];
type DialogState = {
  kind:
    | "new-engagement"
    | "edit-engagement"
    | "engagement"
    | "new-finding"
    | "finding"
    | "help";
  id?: string;
} | null;

function useStored<T>(
  key: string,
  initial: T,
): [T, (next: T | ((current: T) => T)) => void, boolean] {
  const [initialRead] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return {
        value: stored ? (JSON.parse(stored) as T) : initial,
        error: false,
      };
    } catch {
      return { value: initial, error: true };
    }
  });
  const [value, setValue] = useState<T>(initialRead.value);
  const [storageError, setStorageError] = useState(initialRead.error);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [key, value]);
  return [value, setValue, storageError];
}
function getPage(): Page {
  try {
    const page = decodeURIComponent(location.hash.slice(1));
    return navigation.some((n) => n.name === page)
      ? (page as Page)
      : "Overview";
  } catch {
    return "Overview";
  }
}
function Status({ value }: { value: string }) {
  return (
    <span
      className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}
    >
      <i />
      {value}
    </span>
  );
}
function SeverityBadge({ value }: { value: Severity }) {
  return (
    <span className={`severity severity-${value.toLowerCase()}`}>
      <i />
      {value}
    </span>
  );
}
function Progress({ count }: { count: number }) {
  return (
    <div className="progress-cell">
      <div className="progress-track">
        <span style={{ width: `${(count / 7) * 100}%` }} />
      </div>
      <span>{Math.round((count / 7) * 100)}%</span>
    </div>
  );
}
function ProjectIcon({ type }: { type: string }) {
  const Icon =
    type === "Cloud security"
      ? Globe2
      : type === "Network"
        ? Radar
        : LayoutDashboard;
  return (
    <span
      className={`project-icon ${type === "Cloud security" ? "purple" : type === "Network" ? "orange" : ""}`}
    >
      <Icon size={20} strokeWidth={1.6} />
    </span>
  );
}
function Dialog({
  title,
  close,
  children,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const element = ref.current;
    const focusable = () =>
      element?.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [tabindex="0"]',
      );
    focusable()?.[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const nodes = focusable();
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = scroll;
      before?.focus();
    };
  }, [close]);
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`dialog ${wide ? "dialog-wide" : ""}`}
      >
        <div className="dialog-header">
          <div>
            <span className="eyebrow">NORTH RENEGADES</span>
            <h2 id="dialog-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="dialog-content">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(getPage);
  const [engagements, setEngagements, engagementStorageError] = useStored<
    Engagement[]
  >("north-renegades-engagements-v1", initialEngagements);
  const [findings, setFindings, findingStorageError] = useStored<Finding[]>(
    "north-renegades-findings-v1",
    initialFindings,
  );
  const storageError = engagementStorageError || findingStorageError;
  const [dialog, setDialog] = useState<DialogState>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All engagements");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [findingQuery, setFindingQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [toast, setToast] = useState("");
  const [reportId, setReportId] = useState(engagements[0]?.id || "");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const listener = () => setPage(getPage());
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const navigate = (next: Page) => {
    setPage(next);
    location.hash = next;
    setMobileOpen(false);
    setNotifications(false);
    window.scrollTo({ top: 0 });
  };
  const active = engagements.filter((e) => e.status === "In progress");
  const openFindings = findings.filter((f) => f.status !== "Verified");
  const verified = findings.filter((f) => f.status === "Verified");
  const assetCount = new Set(
    engagements.flatMap((e) =>
      e.scope
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean),
    ),
  ).size;
  const selectedEngagement = engagements.find((e) => e.id === dialog?.id);
  const selectedFinding = findings.find((f) => f.id === dialog?.id);
  const reportEngagement =
    engagements.find((e) => e.id === reportId) || engagements[0];
  const closeDialog = useCallback(() => setDialog(null), []);
  const exportReport = (engagement: Engagement) => {
    downloadFile(
      `North-Renegades-${engagement.id}-report.md`,
      createReport(engagement, findings),
    );
    setToast("Report downloaded. Review evidence before sharing.");
  };
  const togglePhase = (id: string, phase: number) =>
    setEngagements((list) =>
      list.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              completed: e.completed.includes(phase)
                ? e.completed.filter((p) => p !== phase)
                : [...e.completed, phase].sort(),
              status: e.completed.includes(phase)
                ? "In progress"
                : e.completed.length === 6
                  ? "Completed"
                  : "In progress",
            },
      ),
    );
  const filteredEngagements = engagements.filter(
    (e) =>
      `${e.name} ${e.client} ${e.id} ${e.scope}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (statusFilter === "All engagements" || e.status === statusFilter),
  );
  const filteredFindings = findings.filter(
    (f) =>
      (severityFilter === "All severities" || f.severity === severityFilter) &&
      `${f.title} ${f.id} ${f.description}`
        .toLowerCase()
        .includes(findingQuery.toLowerCase()),
  );

  const engagementTable = (items: Engagement[]) => (
    <div className="table-scroll">
      <table className="engagement-table">
        <thead>
          <tr>
            <th>ENGAGEMENT</th>
            <th>STATUS</th>
            <th>PROGRESS</th>
            <th>FINDINGS</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td>
                <button
                  className="project-link"
                  onClick={() => setDialog({ kind: "engagement", id: e.id })}
                >
                  <ProjectIcon type={e.type} />
                  <span>
                    <strong>{e.name}</strong>
                    <small>
                      {e.client} <span>·</span> {e.type}
                    </small>
                  </span>
                </button>
              </td>
              <td>
                <Status value={e.status} />
              </td>
              <td>
                <Progress count={e.completed.length} />
              </td>
              <td>
                <span className="finding-count">
                  {findings
                    .filter(
                      (f) => f.engagementId === e.id && f.status !== "Verified",
                    )
                    .length.toString()
                    .padStart(2, "0")}
                </span>
              </td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => setDialog({ kind: "engagement", id: e.id })}
                  aria-label={`Open ${e.name}`}
                >
                  <ArrowUpRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("Overview")}
          aria-label="North Renegades home"
        >
          <span className="brand-mark">
            <Shield size={35} strokeWidth={1.25} />
            <b>N</b>
          </span>
          <span>
            NORTH
            <br />
            <strong>RENEGADES</strong>
          </span>
        </button>
        <div className="workspace-label">
          <span className="workspace-symbol">
            <ShieldCheck size={17} />
          </span>
          <div>
            <strong>Security workspace</strong>
            <small>Personal workspace</small>
          </div>
          <LockKeyhole size={13} className="workspace-lock" />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name ? "nav-active" : ""}`}
              onClick={() => navigate(name)}
              aria-current={page === name ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.6} />
              <span>{name}</span>
              {name === "Findings" && (
                <span className="nav-count">{openFindings.length}</span>
              )}
              {name === "VAPT Academy" && (
                <span className="new-label">NEW</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="academy-promo">
            <span className="promo-icon">
              <BookOpen size={21} strokeWidth={1.5} />
              <span>✦</span>
            </span>
            <h3>Sharpen your instincts.</h3>
            <p>
              Five questions. A stronger
              <br />
              security mindset.
            </p>
            <button onClick={() => navigate("VAPT Academy")}>
              Take the VAPT quiz <ArrowUpRight size={16} />
            </button>
          </div>
          <button
            className="help-link"
            onClick={() => setDialog({ kind: "help" })}
          >
            <CircleHelp size={17} /> Workspace guide <ArrowUpRight size={15} />
          </button>
          <div className="profile">
            <span className="avatar">VT</span>
            <div>
              <strong>Vaibhav Thakur</strong>
              <small>Creator & security enthusiast</small>
            </div>
            <span className="profile-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={15} />
              <input
                ref={searchRef}
                aria-label="Search engagements"
                placeholder="Search engagements..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) navigate("Engagements");
                }}
              />
              <kbd>⌘ K</kbd>
            </label>
            <span className="local-status">
              <i /> Local workspace
            </span>
            <div className="notification-wrap">
              <button
                className={`icon-button notification-button ${notifications ? "is-active" : ""}`}
                onClick={() => setNotifications(!notifications)}
                aria-label="Workspace activity"
                aria-expanded={notifications}
              >
                <Bell size={19} />
                <i />
              </button>
              {notifications && (
                <div className="notification-panel">
                  <div className="panel-heading">
                    <h3>Workspace activity</h3>
                    <span className="tiny-label">DEMO DATA</span>
                  </div>
                  <p>
                    <span className="activity-dot red" />
                    {
                      openFindings.filter((f) => f.severity === "Critical")
                        .length
                    }{" "}
                    critical findings await review.
                  </p>
                  <p>
                    <span className="activity-dot" />
                    {active.length} engagements are in progress.
                  </p>
                  <p>
                    <CheckCheck size={15} />
                    {verified.length} findings marked verified.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => navigate("Findings")}
                  >
                    Review findings <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
            <span className="top-avatar">VT</span>
          </div>
        </header>
        <main id="main-content">
          {storageError && (
            <div className="storage-warning" role="alert">
              <CircleHelp size={19} />
              <div>
                <strong>Browser storage is unavailable or full.</strong>
                <p>
                  Changes are available for this session only. Export your
                  workspace before closing or reloading.
                </p>
              </div>
              <button
                className="button button-secondary"
                onClick={() =>
                  downloadFile(
                    "North-Renegades-workspace.json",
                    JSON.stringify(
                      {
                        version: 1,
                        exportedAt: new Date().toISOString(),
                        engagements,
                        findings,
                      },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                <ArrowDownToLine size={15} /> Export backup
              </button>
            </div>
          )}
          {page === "Overview" && (
            <>
              <section className="page-heading">
                <div>
                  <div className="heading-eyebrow">
                    <span className="eyebrow">THE BIG PICTURE</span>
                    <span className="demo-badge">Demo workspace</span>
                  </div>
                  <h1>
                    Your next move. In focus
                    <span className="lime-period">.</span>
                  </h1>
                  <p>
                    A clear view of your engagements, findings, and everything
                    in between.
                  </p>
                </div>
                <div className="heading-actions">
                  <button
                    className="button button-secondary"
                    onClick={() => navigate("Reports")}
                  >
                    <ArrowDownToLine size={16} /> Export report
                  </button>
                  <button
                    className="button button-primary"
                    onClick={() => setDialog({ kind: "new-engagement" })}
                  >
                    <Plus size={17} /> New engagement
                  </button>
                </div>
              </section>
              <section className="hero-banner">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <span /> PURPOSE-DRIVEN SECURITY
                  </span>
                  <h2>
                    Think like an adversary.
                    <br />
                    Build a stronger defense.
                  </h2>
                  <p>
                    From the first handshake to the final retest.
                    <br className="desktop-break" /> A structured approach to
                    every engagement.
                  </p>
                  <button onClick={() => navigate("Methodology")}>
                    Explore the methodology <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="radar-orbit orbit-one" />
                  <div className="radar-orbit orbit-two" />
                  <div className="radar-orbit orbit-three" />
                  <div className="radar-axis axis-h" />
                  <div className="radar-axis axis-v" />
                  <div className="radar-sweep" />
                  <div className="radar-point point-one" />
                  <div className="radar-point point-two" />
                  <div className="radar-point point-three" />
                  <div className="radar-center">
                    <ShieldCheck size={39} strokeWidth={1.15} />
                  </div>
                  <span className="radar-coordinate">27° N / 76° E</span>
                  <span className="radar-label">
                    <span /> DEFENSE IN DEPTH
                  </span>
                </div>
                <div className="hero-number">
                  01 — 07<span>ONE CONNECTED METHODOLOGY</span>
                </div>
              </section>
              <section className="stats-grid" aria-label="Workspace metrics">
                {[
                  {
                    label: "Active engagements",
                    value: active.length.toString().padStart(2, "0"),
                    icon: Target,
                    meta: `${engagements.length} total engagements`,
                    pill: "In motion",
                    color: "green",
                  },
                  {
                    label: "Open findings",
                    value: openFindings.length.toString().padStart(2, "0"),
                    icon: Flag,
                    meta: "Across all engagements",
                    pill: `${openFindings.filter((f) => f.severity === "Critical").length} critical`,
                    color: "red",
                  },
                  {
                    label: "Assets in scope",
                    value: assetCount.toString().padStart(2, "0"),
                    icon: Globe2,
                    meta: "Unique recorded targets",
                    pill: "Defined scope",
                    color: "gray",
                  },
                  {
                    label: "Verified fixes",
                    value: verified.length.toString().padStart(2, "0"),
                    icon: ShieldCheck,
                    meta: "Retested and marked verified",
                    pill: "Closing the loop",
                    color: "green",
                  },
                ].map(({ label, value, icon: Icon, meta, pill, color }) => (
                  <article className="stat-card" key={label}>
                    <div className="stat-top">
                      <span>{label}</span>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div className="stat-number">
                      {value}
                      <span className={`stat-pill pill-${color}`}>{pill}</span>
                    </div>
                    <p>{meta}</p>
                  </article>
                ))}
              </section>
              <div className="overview-grid">
                <section className="card engagements-card">
                  <div className="section-heading">
                    <div>
                      <h2>
                        Engagements at a glance{" "}
                        <span className="count-tag">{engagements.length}</span>
                      </h2>
                      <p>Every assessment. A clear path forward.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("Engagements")}
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>
                  {engagementTable(engagements.slice(0, 3))}
                  <div className="card-footer">
                    <span>
                      <span className="small-live-dot" />{" "}
                      {storageError
                        ? "Progress is available for this session only"
                        : "Your progress is saved in this browser"}
                    </span>
                    <span>
                      PTES aligned <ShieldCheck size={13} />
                    </span>
                  </div>
                </section>
                <section className="card severity-card">
                  <div className="section-heading">
                    <div>
                      <h2>Risk snapshot</h2>
                      <p>All recorded findings by severity</p>
                    </div>
                    <Flag size={17} className="muted" />
                  </div>
                  <div className="risk-chart">
                    <div
                      className="donut"
                      style={{
                        background: findings.length
                          ? `conic-gradient(${severityOrder
                              .map((s, i) => {
                                const before = severityOrder
                                  .slice(0, i)
                                  .reduce(
                                    (n, level) =>
                                      n +
                                      findings.filter(
                                        (f) => f.severity === level,
                                      ).length,
                                    0,
                                  );
                                const count = findings.filter(
                                  (f) => f.severity === s,
                                ).length;
                                return `${["#c76357", "#e4a466", "#d9c97c", "#a3b9a3"][i]} ${(before / findings.length) * 100}% ${((before + count) / findings.length) * 100}%`;
                              })
                              .join(",")})`
                          : "#e9ece5",
                      }}
                    >
                      <div>
                        <strong>
                          {findings.length.toString().padStart(2, "0")}
                        </strong>
                        <span>Total findings</span>
                      </div>
                    </div>
                    <div className="risk-legend">
                      {severityOrder.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSeverityFilter(s);
                            navigate("Findings");
                          }}
                        >
                          <span>
                            <i className={`dot-${s.toLowerCase()}`} />
                            {s}
                          </span>
                          <strong>
                            {findings
                              .filter((f) => f.severity === s)
                              .length.toString()
                              .padStart(2, "0")}
                          </strong>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="risk-note">
                    <Shield size={14} />
                    Small fixes. Meaningful impact.
                  </div>
                </section>
              </div>
              <section className="card journey-card">
                <div className="section-heading">
                  <div>
                    <h2>A method behind every move.</h2>
                    <p>
                      Seven connected phases. From agreed scope to verified
                      fixes.
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("Methodology")}
                  >
                    See the framework <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="phase-journey">
                  {phases.map((p, i) => (
                    <button key={p} onClick={() => navigate("Methodology")}>
                      <span
                        className={`journey-number ${i < 4 ? "journey-filled" : ""}`}
                      >
                        {i < 4 ? <Check size={13} /> : `0${i + 1}`}
                      </span>
                      <strong>{p}</strong>
                      {i !== 6 && (
                        <ChevronRight className="journey-arrow" size={12} />
                      )}
                    </button>
                  ))}
                </div>
                <span className="journey-caption">
                  Illustrative workflow · View an engagement for its recorded
                  progress
                </span>
              </section>
            </>
          )}

          {page === "Engagements" && (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">PLAN. EXECUTE. VERIFY.</span>
                  <h1>
                    Engagements<span className="lime-period">.</span>
                  </h1>
                  <p>
                    Your assessments, with scope and rules of engagement built
                    in.
                  </p>
                </div>
                <button
                  className="button button-primary"
                  onClick={() => setDialog({ kind: "new-engagement" })}
                >
                  <Plus size={17} /> New engagement
                </button>
              </section>
              <div className="summary-strip">
                <span>
                  <strong>{engagements.length}</strong> total engagements
                </span>
                <span>
                  <i className="small-live-dot" />
                  <strong>{active.length}</strong> in progress
                </span>
                <span>
                  <CheckCheck size={15} />
                  <strong>
                    {engagements.filter((e) => e.status === "Completed").length}
                  </strong>{" "}
                  completed
                </span>
              </div>
              <section className="card">
                <div className="list-toolbar">
                  <label className="search-field">
                    <Search size={17} />
                    <input
                      aria-label="Filter engagements"
                      placeholder="Search by name, client, or asset..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <label className="filter-select">
                    <ListFilter size={16} />
                    <select
                      aria-label="Engagement status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {[
                        "All engagements",
                        "Planned",
                        "In progress",
                        "Completed",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {filteredEngagements.length ? (
                  engagementTable(filteredEngagements)
                ) : (
                  <EmptyState
                    icon={Search}
                    title="No engagements found"
                    text="Try another search or create your first engagement."
                    action={() => {
                      setQuery("");
                      setStatusFilter("All engagements");
                    }}
                    actionText="Clear filters"
                  />
                )}
              </section>
              <div className="info-callout">
                <LockKeyhole size={19} />
                <div>
                  <strong>Good security starts with clear boundaries.</strong>
                  <p>
                    Record written authorization, approved assets, and stop
                    procedures before marking pre-engagement complete.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => navigate("Methodology")}
                >
                  Read the framework <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
          {page === "Methodology" && <Methodology />}
          {page === "VAPT Academy" && <Quiz />}
          {page === "Findings" && (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">TURN INSIGHT INTO ACTION</span>
                  <h1>
                    Findings & remediation<span className="lime-period">.</span>
                  </h1>
                  <p>
                    Document the evidence. Prioritize the fix. Verify the
                    outcome.
                  </p>
                </div>
                <button
                  className="button button-primary"
                  onClick={() => setDialog({ kind: "new-finding" })}
                >
                  <Plus size={17} /> Add finding
                </button>
              </section>
              <div className="finding-stats">
                {severityOrder.map((s) => (
                  <button
                    key={s}
                    className={`card finding-stat ${severityFilter === s ? "selected" : ""}`}
                    onClick={() =>
                      setSeverityFilter(
                        severityFilter === s ? "All severities" : s,
                      )
                    }
                  >
                    <SeverityBadge value={s} />
                    <strong>
                      {findings
                        .filter(
                          (f) => f.severity === s && f.status !== "Verified",
                        )
                        .length.toString()
                        .padStart(2, "0")}
                    </strong>
                    <span>
                      open findings <ArrowUpRight size={14} />
                    </span>
                  </button>
                ))}
              </div>
              <section className="card">
                <div className="list-toolbar">
                  <label className="search-field">
                    <Search size={17} />
                    <input
                      aria-label="Search findings"
                      placeholder="Search findings..."
                      value={findingQuery}
                      onChange={(e) => setFindingQuery(e.target.value)}
                    />
                  </label>
                  <label className="filter-select">
                    <ListFilter size={16} />
                    <select
                      aria-label="Filter severity"
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                    >
                      {["All severities", ...severityOrder].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="table-scroll">
                  <table className="findings-table">
                    <thead>
                      <tr>
                        <th>FINDING</th>
                        <th>ENGAGEMENT</th>
                        <th>SEVERITY</th>
                        <th>STATUS</th>
                        <th>
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFindings.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <button
                              className="finding-title"
                              onClick={() =>
                                setDialog({ kind: "finding", id: f.id })
                              }
                            >
                              <small>{f.id}</small>
                              <strong>{f.title}</strong>
                            </button>
                          </td>
                          <td className="muted">
                            {engagements.find((e) => e.id === f.engagementId)
                              ?.name || "Unknown engagement"}
                          </td>
                          <td>
                            <SeverityBadge value={f.severity} />
                          </td>
                          <td>
                            <Status value={f.status} />
                          </td>
                          <td>
                            <button
                              className="icon-button"
                              aria-label={`Edit ${f.title}`}
                              onClick={() =>
                                setDialog({ kind: "finding", id: f.id })
                              }
                            >
                              <ArrowUpRight size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!filteredFindings.length && (
                  <EmptyState
                    icon={ShieldCheck}
                    title="No matching findings"
                    text="Try a different severity or search term."
                    action={() => {
                      setSeverityFilter("All severities");
                      setFindingQuery("");
                    }}
                    actionText="Clear filters"
                  />
                )}
              </section>
              <p className="page-note">
                <CircleHelp size={14} />
                Severity is assigned by the operator. Verify impact, likelihood,
                and evidence before sharing a report.
              </p>
            </>
          )}
          {page === "Reports" && (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">MAKE YOUR WORK MATTER</span>
                  <h1>
                    Reports & deliverables<span className="lime-period">.</span>
                  </h1>
                  <p>
                    From technical evidence to decisions your stakeholders can
                    act on.
                  </p>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => {
                    downloadFile(
                      "North-Renegades-workspace.json",
                      JSON.stringify(
                        {
                          version: 1,
                          exportedAt: new Date().toISOString(),
                          engagements,
                          findings,
                        },
                        null,
                        2,
                      ),
                      "application/json",
                    );
                    setToast("Workspace JSON backup downloaded.");
                  }}
                >
                  <ArrowDownToLine size={16} /> Export workspace data
                </button>
              </section>
              <div className="report-layout">
                <section className="card report-preview">
                  <div className="report-toolbar">
                    <label>
                      ENGAGEMENT
                      <select
                        aria-label="Report engagement"
                        value={reportEngagement?.id || ""}
                        onChange={(e) => setReportId(e.target.value)}
                      >
                        {engagements.map((e) => (
                          <option value={e.id} key={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="confidential">
                      <LockKeyhole size={12} />
                      CONFIDENTIAL
                    </span>
                  </div>
                  {reportEngagement ? (
                    <>
                      <div className="report-document">
                        <div className="report-brand">
                          <Shield size={23} />
                          <strong>NORTH RENEGADES</strong>
                          <span>ASSESSMENT REPORT</span>
                        </div>
                        <span className="eyebrow">
                          VULNERABILITY ASSESSMENT & PENETRATION TESTING
                        </span>
                        <h2>{reportEngagement.name}</h2>
                        <p className="report-byline">
                          Prepared for {reportEngagement.client} · By Vaibhav
                          Thakur
                        </p>
                        <div className="report-divider" />
                        <h3>
                          01 <span>Executive summary</span>
                        </h3>
                        <p>
                          This engagement records{" "}
                          <strong>
                            {
                              findings.filter(
                                (f) => f.engagementId === reportEngagement.id,
                              ).length
                            }{" "}
                            findings
                          </strong>{" "}
                          across the agreed{" "}
                          {reportEngagement.type.toLowerCase()} scope.{" "}
                          <strong>
                            {
                              findings.filter(
                                (f) =>
                                  f.engagementId === reportEngagement.id &&
                                  f.status !== "Verified",
                              ).length
                            }{" "}
                            findings
                          </strong>{" "}
                          await verified remediation. Prioritize critical and
                          high severity issues and agree ownership before
                          closure.
                        </p>
                        <div className="report-mini-stats">
                          {severityOrder.map((s) => (
                            <div key={s}>
                              <strong>
                                {
                                  findings.filter(
                                    (f) =>
                                      f.engagementId === reportEngagement.id &&
                                      f.severity === s,
                                  ).length
                                }
                              </strong>
                              <SeverityBadge value={s} />
                            </div>
                          ))}
                        </div>
                        <h3>
                          02 <span>Scope & methodology</span>
                        </h3>
                        <p>
                          <strong>{reportEngagement.approach}</strong>{" "}
                          assessment aligned with PTES, OWASP WSTG, and NIST SP
                          800-115. {reportEngagement.completed.length} of 7
                          phases recorded as complete.
                        </p>
                        <div className="scope-preview">
                          {reportEngagement.scope
                            .split("\n")
                            .filter(Boolean)
                            .map((s, i) => (
                              <span key={i}>
                                <Globe2 size={12} />
                                {s}
                              </span>
                            ))}
                        </div>
                        <h3>
                          03 <span>Prioritized remediation</span>
                        </h3>
                        {findings.filter(
                          (f) => f.engagementId === reportEngagement.id,
                        ).length ? (
                          [...findings]
                            .filter(
                              (f) => f.engagementId === reportEngagement.id,
                            )
                            .sort(
                              (a, b) =>
                                severityOrder.indexOf(a.severity) -
                                severityOrder.indexOf(b.severity),
                            )
                            .slice(0, 3)
                            .map((f) => (
                              <div className="report-finding" key={f.id}>
                                <SeverityBadge value={f.severity} />
                                <div>
                                  <strong>{f.title}</strong>
                                  <p>{f.remediation}</p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p>
                            No findings recorded. This does not establish the
                            absence of vulnerabilities.
                          </p>
                        )}
                        <div className="report-watermark">
                          DOCUMENT PREVIEW · FULL EVIDENCE & RETEST DETAILS
                          INCLUDED IN EXPORT
                        </div>
                      </div>
                      <div className="report-download">
                        <div>
                          <FileText size={20} />
                          <span>
                            <strong>Ready for your review</strong>
                            <small>
                              Editable Markdown · Includes entered evidence and
                              RoE
                            </small>
                          </span>
                        </div>
                        <button
                          className="button button-primary"
                          onClick={() => exportReport(reportEngagement)}
                        >
                          <ArrowDownToLine size={16} /> Download report
                        </button>
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No engagement to report"
                      text="Create an engagement to get started."
                      action={() => setDialog({ kind: "new-engagement" })}
                      actionText="Create engagement"
                    />
                  )}
                </section>
                <aside className="report-aside">
                  <div className="card deliverables-card">
                    <span className="eyebrow">A COMPLETE HANDOFF</span>
                    <h2>Built for every audience.</h2>
                    {[
                      {
                        icon: LayoutDashboard,
                        title: "Executive summary",
                        text: "A clear risk overview for decision-makers.",
                      },
                      {
                        icon: FileText,
                        title: "Technical report",
                        text: "Attack narratives, evidence, and reproduction notes.",
                      },
                      {
                        icon: ClipboardCheck,
                        title: "Remediation plan",
                        text: "Prioritized fixes and ownership prompts.",
                      },
                      {
                        icon: ShieldCheck,
                        title: "Retest & verification",
                        text: "Recorded status and closure evidence.",
                      },
                    ].map(({ icon: Icon, title, text }) => (
                      <div className="deliverable" key={title}>
                        <span>
                          <Icon size={19} strokeWidth={1.5} />
                        </span>
                        <div>
                          <h3>{title}</h3>
                          <p>{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="report-tip">
                    <ShieldCheck size={25} strokeWidth={1.4} />
                    <h3>Evidence earns trust.</h3>
                    <p>
                      Review every finding before sharing. Replace sample data,
                      add sanitized proof, and agree owners and retest dates.
                    </p>
                    <span>THOUGHTFUL TESTING. CLEAR OUTCOMES.</span>
                  </div>
                </aside>
              </div>
            </>
          )}
          <footer className="main-footer">
            <span>
              © {new Date().getFullYear()} North Renegades <span>·</span> Made
              by <strong>Vaibhav Thakur</strong>
            </span>
            <span>
              Clarity. Precision. Resilience. <ShieldCheck size={13} />
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCheck size={18} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {dialog && (
        <Dialog
          title={
            dialog.kind === "help"
              ? "A workspace with a purpose."
              : dialog.kind === "new-engagement"
                ? "Plan a new engagement"
                : dialog.kind === "edit-engagement"
                  ? "Edit engagement"
                  : dialog.kind === "new-finding"
                    ? "Document a finding"
                    : dialog.kind === "finding"
                      ? "Finding details"
                      : selectedEngagement?.name || "Engagement"
          }
          close={closeDialog}
          wide={dialog.kind === "engagement"}
        >
          {dialog.kind === "help" && (
            <div className="help-content">
              <div className="help-hero">
                <ShieldCheck size={35} />
                <p>
                  North Renegades by <strong>Vaibhav Thakur</strong> connects
                  engagement planning, structured testing, remediation, and
                  learning.
                </p>
              </div>
              <h3>Your workflow</h3>
              <ol>
                <li>
                  Create an engagement and record approved scope and rules of
                  engagement.
                </li>
                <li>Open an engagement to track its seven execution phases.</li>
                <li>
                  Record findings, sanitized evidence, and actionable
                  remediation.
                </li>
                <li>
                  Retest fixes and mark findings verified, then export a report.
                </li>
                <li>Challenge yourself with the five-question VAPT quiz.</li>
              </ol>
              <div className="info-callout">
                <LockKeyhole size={20} />
                <p>
                  This is a local project workspace. Data is saved in this
                  browser, without accounts or a backend. Export a JSON backup
                  from Reports before clearing browser data. It does not run
                  scans or perform attacks. Initial records are synthetic
                  examples.
                </p>
              </div>
            </div>
          )}
          {(dialog.kind === "new-engagement" ||
            dialog.kind === "edit-engagement") && (
            <EngagementForm
              existing={
                dialog.kind === "edit-engagement"
                  ? selectedEngagement
                  : undefined
              }
              onSave={(e) => {
                setEngagements((list) =>
                  list.some((old) => old.id === e.id)
                    ? list.map((old) => (old.id === e.id ? e : old))
                    : [...list, e],
                );
                setDialog({ kind: "engagement", id: e.id });
                setToast("Engagement updated.");
              }}
              cancel={closeDialog}
            />
          )}
          {(dialog.kind === "new-finding" || dialog.kind === "finding") && (
            <FindingForm
              existing={selectedFinding}
              engagements={engagements}
              onSave={(f) => {
                setFindings((list) =>
                  list.some((old) => old.id === f.id)
                    ? list.map((old) => (old.id === f.id ? f : old))
                    : [...list, f],
                );
                closeDialog();
                setToast(
                  f.status === "Verified"
                    ? "Finding marked verified. Keep retest evidence with the record."
                    : "Finding updated.",
                );
              }}
              cancel={closeDialog}
            />
          )}
          {dialog.kind === "engagement" && selectedEngagement && (
            <div className="engagement-detail">
              <div className="detail-summary">
                <div>
                  <span className="mono-label">{selectedEngagement.id}</span>
                  <Status value={selectedEngagement.status} />
                  <p>
                    {selectedEngagement.client} <span>·</span>{" "}
                    {selectedEngagement.type} <span>·</span>{" "}
                    {selectedEngagement.approach}
                  </p>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() =>
                    setDialog({
                      kind: "edit-engagement",
                      id: selectedEngagement.id,
                    })
                  }
                >
                  Edit engagement
                </button>
              </div>
              <div className="scope-grid">
                <div>
                  <h3>
                    <Target size={16} />
                    In scope
                  </h3>
                  <p className="preserve-lines">{selectedEngagement.scope}</p>
                </div>
                <div>
                  <h3>
                    <Shield size={16} />
                    Out of scope
                  </h3>
                  <p className="preserve-lines">
                    {selectedEngagement.excluded || "Not recorded"}
                  </p>
                </div>
              </div>
              <details className="roe-details">
                <summary>
                  <LockKeyhole size={16} />
                  Rules of engagement <ChevronDown size={16} />
                </summary>
                <dl>
                  <dt>Written authorization</dt>
                  <dd>
                    {selectedEngagement.authorization ||
                      "Not recorded — obtain approval before testing."}
                  </dd>
                  <dt>Testing window</dt>
                  <dd>{selectedEngagement.window || "Not recorded"}</dd>
                  <dt>Communication channel</dt>
                  <dd>{selectedEngagement.contact || "Not recorded"}</dd>
                  <dt>Emergency stop procedure</dt>
                  <dd>{selectedEngagement.emergency || "Not recorded"}</dd>
                </dl>
              </details>
              <div className="detail-section-heading">
                <h3>Execution checklist</h3>
                <span>
                  {selectedEngagement.completed.length} of 7 phases complete
                </span>
              </div>
              <div className="phase-checklist">
                {phases.map((phase, i) => (
                  <details
                    key={phase}
                    className={
                      selectedEngagement.completed.includes(i)
                        ? "phase-complete"
                        : ""
                    }
                  >
                    <summary>
                      <input
                        type="checkbox"
                        aria-label={`Complete ${phase}`}
                        checked={selectedEngagement.completed.includes(i)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => togglePhase(selectedEngagement.id, i)}
                      />
                      <span className="phase-index">0{i + 1}</span>
                      <strong>{phase}</strong>
                      <ChevronDown size={16} />
                    </summary>
                    <ul>
                      {phaseTasks[i].map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
              <div className="detail-bottom">
                <p>
                  <CircleHelp size={15} />
                  Completion is recorded manually. No automated tests are
                  performed.
                </p>
                <button
                  className="button button-primary"
                  onClick={() => exportReport(selectedEngagement)}
                >
                  <ArrowDownToLine size={16} /> Export report
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  actionText,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action: () => void;
  actionText: string;
}) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={27} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <button className="button button-secondary" onClick={action}>
        {actionText}
      </button>
    </div>
  );
}

function EngagementForm({
  existing,
  onSave,
  cancel,
}: {
  existing?: Engagement;
  onSave: (e: Engagement) => void;
  cancel: () => void;
}) {
  const [form, setForm] = useState({
    name: existing?.name || "",
    client: existing?.client || "",
    type: existing?.type || "Web application",
    approach: existing?.approach || "Gray box",
    status: existing?.status || "Planned",
    scope: existing?.scope || "",
    excluded: existing?.excluded || "",
    authorization: existing?.authorization || "",
    window: existing?.window || "",
    contact: existing?.contact || "",
    emergency:
      existing?.emergency ||
      "Stop all testing immediately, notify the designated security contact, and await written clearance.",
  });
  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setForm({ ...form, [name]: e.target.value }),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.client.trim() || !form.scope.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      client: form.client.trim(),
      scope: form.scope.trim(),
      status: form.status as Engagement["status"],
      id: existing?.id || `NR-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      created: existing?.created || new Date().toISOString().slice(0, 10),
      completed: existing?.completed || [],
    });
  };
  return (
    <form onSubmit={submit} className="workspace-form">
      <p className="form-intro">
        Start with a clear scope. You can refine the details as your engagement
        takes shape.
      </p>
      <div className="form-grid">
        <label className="full-width">
          Engagement name{" "}
          <input
            required
            maxLength={100}
            placeholder="e.g. Customer Portal Assessment"
            {...field("name")}
          />
        </label>
        <label>
          Client / organization
          <input
            required
            maxLength={100}
            placeholder="Organization name"
            {...field("client")}
          />
        </label>
        <label>
          Assessment type
          <select {...field("type")}>
            {[
              "Web application",
              "Cloud security",
              "Network",
              "API security",
              "Mobile application",
            ].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Testing approach
          <select {...field("approach")}>
            {["Black box", "Gray box", "White box"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select {...field("status")}>
            {["Planned", "In progress", "Completed"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="full-width">
          In-scope assets{" "}
          <small>
            One approved IP, domain, application, or cloud resource per line.
          </small>
          <textarea
            required
            rows={3}
            maxLength={5000}
            placeholder={"staging.example.com\n192.0.2.20"}
            {...field("scope")}
          />
        </label>
        <label className="full-width">
          Out of scope
          <textarea
            rows={2}
            maxLength={5000}
            placeholder="Excluded assets, data, and prohibited techniques"
            {...field("excluded")}
          />
        </label>
      </div>
      <div className="form-section-title">
        <LockKeyhole size={16} />
        <h3>Rules of engagement</h3>
      </div>
      <div className="form-grid">
        <label className="full-width">
          Written authorization reference
          <input
            maxLength={500}
            placeholder="Approval reference or signed agreement location"
            {...field("authorization")}
          />
        </label>
        <label>
          Testing window & timezone
          <input
            maxLength={250}
            placeholder="e.g. Mon–Fri, 09:00–17:00 IST"
            {...field("window")}
          />
        </label>
        <label>
          Communication / escalation contact
          <input
            maxLength={250}
            placeholder="Named contact and approved channel"
            {...field("contact")}
          />
        </label>
        <label className="full-width">
          Emergency stop procedure
          <textarea rows={3} maxLength={2000} {...field("emergency")} />
        </label>
      </div>
      <p className="form-note">
        A workspace record does not replace written authorization. Add approved
        testing boundaries before execution.
      </p>
      <div className="form-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={cancel}
        >
          Cancel
        </button>
        <button className="button button-primary" type="submit">
          <Check size={16} />
          {existing ? "Save changes" : "Create engagement"}
        </button>
      </div>
    </form>
  );
}

function FindingForm({
  existing,
  engagements,
  onSave,
  cancel,
}: {
  existing?: Finding;
  engagements: Engagement[];
  onSave: (f: Finding) => void;
  cancel: () => void;
}) {
  const [form, setForm] = useState({
    title: existing?.title || "",
    engagementId: existing?.engagementId || engagements[0]?.id || "",
    severity: existing?.severity || "Medium",
    status: existing?.status || "Open",
    description: existing?.description || "",
    remediation: existing?.remediation || "",
    evidence: existing?.evidence || "",
  });
  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setForm({ ...form, [name]: e.target.value }),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.remediation.trim()
    )
      return;
    onSave({
      ...form,
      title: form.title.trim(),
      severity: form.severity as Severity,
      status: form.status as Finding["status"],
      id: existing?.id || `F-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    });
  };
  return (
    <form className="workspace-form" onSubmit={submit}>
      <p className="form-intro">
        Clear evidence and specific remediation turn a finding into a fix.
      </p>
      <div className="form-grid">
        <label className="full-width">
          Finding title
          <input
            required
            maxLength={160}
            placeholder="Describe the vulnerability"
            {...field("title")}
          />
        </label>
        <label className="full-width">
          Engagement
          <select required {...field("engagementId")}>
            {engagements.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Severity
          <select {...field("severity")}>
            {severityOrder.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Remediation status
          <select {...field("status")}>
            {["Open", "In progress", "Verified"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="full-width">
          Description & impact
          <textarea
            required
            rows={3}
            maxLength={10000}
            placeholder="Affected assets, observed behavior, and business impact"
            {...field("description")}
          />
        </label>
        <label className="full-width">
          Evidence / reproduction & retest notes
          <small>
            Use sanitized evidence. Include timestamps and verified retest
            outcomes.
          </small>
          <textarea
            rows={4}
            maxLength={15000}
            placeholder="Record proof, expected vs. observed results, and evidence references"
            {...field("evidence")}
          />
        </label>
        <label className="full-width">
          Actionable remediation
          <textarea
            required
            rows={3}
            maxLength={10000}
            placeholder="Specific fixes, configuration changes, or patches"
            {...field("remediation")}
          />
        </label>
      </div>
      {form.status === "Verified" && (
        <p className="form-note">
          Mark a finding verified only after a successful retest. Record its
          date, method, and outcome in the evidence field.
        </p>
      )}
      <div className="form-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={cancel}
        >
          Cancel
        </button>
        <button className="button button-primary" type="submit">
          <Check size={16} />
          Save finding
        </button>
      </div>
    </form>
  );
}
