import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  Compass,
  FileCheck2,
  Fingerprint,
  FlaskConical,
  Layers3,
  LockKeyhole,
  Radar,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import "./Methodology.css";

type PhaseCategory = "Planning" | "Discovery" | "Validation" | "Delivery";

const phases = [
  {
    id: "pre-engagement",
    number: "01",
    name: "Pre-engagement & scoping",
    category: "Planning" as PhaseCategory,
    summary: "Agree on the boundaries before the first request.",
    icon: ClipboardCheck,
    items: [
      {
        title: "Define the scope",
        description:
          "List the exact IP addresses, domains, applications, cloud instances, and network ranges that are in scope. Record explicit exclusions and third-party dependencies.",
      },
      {
        title: "Document rules of engagement",
        description:
          "Obtain written authorization; agree on testing windows, named contacts, communication channels, evidence handling, and an emergency stop procedure.",
      },
      {
        title: "Choose an approach",
        description:
          "Select black box, gray box, or white box testing according to the access provided. Align objectives with PTES, OWASP WSTG, and NIST SP 800-115.",
      },
    ],
    deliverable: "Signed scope, authorization, and rules of engagement",
    checkpoint:
      "The owner approves the scope and escalation contacts before testing begins.",
  },
  {
    id: "reconnaissance",
    number: "02",
    name: "Reconnaissance",
    category: "Discovery" as PhaseCategory,
    summary: "Understand the environment and its exposed attack surface.",
    icon: Compass,
    items: [
      {
        title: "Start with passive intelligence",
        description:
          "Review approved public sources, DNS records, certificate information, published documentation, and other OSINT to understand the organization’s exposure.",
      },
      {
        title: "Validate assets carefully",
        description:
          "Distinguish confirmed owned assets from third-party systems. Add newly discovered candidates to a review list instead of assuming permission.",
      },
      {
        title: "Use agreed active footprinting",
        description:
          "Interact only with authorized assets, at the approved rate and time. Record observations, data sources, and confidence levels.",
      },
    ],
    deliverable: "Verified asset inventory and attack surface map",
    checkpoint:
      "Every asset carried into active testing maps to the approved scope.",
  },
  {
    id: "scanning",
    number: "03",
    name: "Scanning & enumeration",
    category: "Discovery" as PhaseCategory,
    summary: "Map services, technologies, and potential entry points.",
    icon: Radar,
    items: [
      {
        title: "Build a service inventory",
        description:
          "Use approved tools such as Nmap to identify reachable ports and services. Capture host, port, protocol, and service-version evidence.",
      },
      {
        title: "Enumerate application surfaces",
        description:
          "Identify web technologies, authentication flows, exposed interfaces, and configuration details without collecting unnecessary sensitive data.",
      },
      {
        title: "Run scoped scanning",
        description:
          "Configure tools such as Nessus with agreed targets, safe checks, exclusions, and rate limits. Monitor service health and preserve raw results.",
      },
    ],
    deliverable: "Service inventory, technology map, and scanner results",
    checkpoint:
      "Validate scanner coverage and record inaccessible or excluded assets.",
  },
  {
    id: "analysis",
    number: "04",
    name: "Vulnerability analysis",
    category: "Validation" as PhaseCategory,
    summary: "Turn scanner signals into evidence-backed findings.",
    icon: Fingerprint,
    items: [
      {
        title: "Correlate the evidence",
        description:
          "Compare scanner output with service versions, configuration, application behavior, and relevant vendor advisories.",
      },
      {
        title: "Verify manually",
        description:
          "Reproduce suspected weaknesses with controlled checks. Separate confirmed issues, false positives, and unverified observations.",
      },
      {
        title: "Assess real impact",
        description:
          "Consider exploitability, business impact, affected assets, and existing controls. Assign a severity with a documented rationale.",
      },
    ],
    deliverable: "Validated findings register with evidence and severity",
    checkpoint:
      "Every confirmed finding has reproducible evidence and an affected asset.",
  },
  {
    id: "exploitation",
    number: "05",
    name: "Controlled exploitation",
    category: "Validation" as PhaseCategory,
    summary: "Demonstrate practical impact with the minimum necessary action.",
    icon: FlaskConical,
    items: [
      {
        title: "Review the approved validation plan",
        description:
          "Confirm that the technique, test account, data, and impact are allowed by the rules of engagement before attempting validation.",
      },
      {
        title: "Validate vulnerabilities safely",
        description:
          "Use controlled proofs of concept to assess issues such as SQL injection or broken authentication on authorized systems. Prefer test records and reversible actions.",
      },
      {
        title: "Capture a clear attack narrative",
        description:
          "Record prerequisites, observed behavior, limited evidence, and business impact. Stop when the agreed objective is demonstrated or a stop condition is reached.",
      },
    ],
    deliverable: "Reproducible proof of concept and impact narrative",
    checkpoint:
      "The proof demonstrates the claim without exceeding authorized boundaries.",
  },
  {
    id: "post-exploitation",
    number: "06",
    name: "Post-exploitation & cleanup",
    category: "Validation" as PhaseCategory,
    summary: "Evaluate control boundaries, then restore the environment.",
    icon: LockKeyhole,
    items: [
      {
        title: "Assess agreed attack paths",
        description:
          "Evaluate privilege escalation and lateral movement only where separately authorized. Document reachable trust boundaries and the controls that prevent further access.",
      },
      {
        title: "Simulate persistence and detection",
        description:
          "Use an explicitly agreed, time-limited simulation to assess whether continued access would be detected. Coordinate observations with the designated security contacts.",
      },
      {
        title: "Remove test artifacts",
        description:
          "Revoke temporary access, remove approved simulation artifacts, restore configuration changes, and confirm cleanup with the system owner.",
      },
    ],
    deliverable:
      "Attack-path assessment, detection observations, and cleanup record",
    checkpoint:
      "The owner confirms that temporary accounts, artifacts, and access are removed.",
  },
  {
    id: "reporting",
    number: "07",
    name: "Reporting & retesting",
    category: "Delivery" as PhaseCategory,
    summary: "Make every finding understandable, actionable, and verifiable.",
    icon: FileCheck2,
    items: [
      {
        title: "Communicate to each audience",
        description:
          "Write an executive summary of business risk, alongside a technical report with attack narratives, reproduction steps, screenshots, and appropriately redacted logs.",
      },
      {
        title: "Prioritize remediation",
        description:
          "Rank Critical, High, Medium, and Low findings. Specify concrete patches or configuration changes, accountable owners, target dates, and compensating controls.",
      },
      {
        title: "Retest and close the loop",
        description:
          "Recheck the original issue and relevant regressions after remediation. Mark each result as fixed, partially fixed, not fixed, or not retested, with new evidence.",
      },
    ],
    deliverable:
      "Executive report, technical report, remediation plan, and retest results",
    checkpoint:
      "Stakeholders receive clear residual risk, ownership, and a verified closure status.",
  },
];

const categories: Array<"All phases" | PhaseCategory> = [
  "All phases",
  "Planning",
  "Discovery",
  "Validation",
  "Delivery",
];

export default function Methodology() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All phases" | PhaseCategory>(
    "All phases",
  );
  const [expanded, setExpanded] = useState<string[]>(["pre-engagement"]);
  const filteredPhases = useMemo(
    () =>
      phases.filter((phase) => {
        const matchesCategory =
          category === "All phases" || phase.category === category;
        const content = `${phase.name} ${phase.summary} ${phase.deliverable} ${phase.items.map((item) => `${item.title} ${item.description}`).join(" ")}`;
        return (
          matchesCategory &&
          content.toLowerCase().includes(query.trim().toLowerCase())
        );
      }),
    [query, category],
  );
  const allExpanded =
    filteredPhases.length > 0 &&
    filteredPhases.every((phase) => expanded.includes(phase.id));

  function togglePhase(id: string) {
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    setExpanded((current) =>
      allExpanded
        ? current.filter(
            (id) => !filteredPhases.some((phase) => phase.id === id),
          )
        : [
            ...new Set([
              ...current,
              ...filteredPhases.map((phase) => phase.id),
            ]),
          ],
    );
  }

  return (
    <div className="method-page">
      <div className="method-heading">
        <div>
          <span className="method-eyebrow">THE PLAYBOOK</span>
          <h1>Methodology</h1>
          <p>
            A deliberate process. Defensible results. Follow the path from scope
            to sign-off.
          </p>
        </div>
        <div className="method-heading-badge">
          <ShieldCheck size={17} /> Built on industry standards
        </div>
      </div>

      <section className="method-intro" aria-label="Methodology overview">
        <div className="method-intro-copy">
          <span className="method-intro-label">
            <Layers3 size={15} /> THE COMPLETE ENGAGEMENT
          </span>
          <h2>Seven phases. One stronger security posture.</h2>
          <p>
            Move with purpose through an evidence-led VAPT engagement. Each
            phase has a clear objective, a tangible deliverable, and a quality
            checkpoint.
          </p>
          <div className="method-standards">
            <span>PTES</span>
            <span>OWASP WSTG</span>
            <span>NIST SP 800-115</span>
          </div>
        </div>
        <div className="method-intro-visual" aria-hidden="true">
          <div className="method-orbit method-orbit-outer" />
          <div className="method-orbit method-orbit-inner" />
          <div className="method-orbit-core">
            <ShieldCheck size={36} strokeWidth={1.45} />
          </div>
          <span className="method-orbit-dot method-orbit-dot-one" />
          <span className="method-orbit-dot method-orbit-dot-two" />
          <div className="method-visual-label">
            <span>07</span>
            <small>CONNECTED PHASES</small>
          </div>
        </div>
      </section>

      <div className="method-toolbar">
        <div
          className="method-filters"
          aria-label="Filter methodology by category"
        >
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={
                category === item
                  ? "method-filter method-filter-active"
                  : "method-filter"
              }
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="method-search">
          <Search size={17} />
          <input
            aria-label="Search methodology phases"
            placeholder="Search the playbook…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear methodology search"
            >
              ×
            </button>
          )}
        </label>
      </div>

      <div className="method-list-heading">
        <span>
          {filteredPhases.length}{" "}
          {filteredPhases.length === 1 ? "phase" : "phases"}{" "}
          {category === "All phases" && !query ? "in your playbook" : "found"}
        </span>
        <button
          type="button"
          onClick={toggleAll}
          disabled={!filteredPhases.length}
        >
          {allExpanded ? "Collapse all" : "Expand all"}
          <SlidersHorizontal size={14} />
        </button>
      </div>

      <div className="method-phase-list">
        {filteredPhases.map((phase) => {
          const Icon = phase.icon;
          const isExpanded = expanded.includes(phase.id);
          return (
            <article
              key={phase.id}
              className={`method-phase${isExpanded ? " method-phase-open" : ""}`}
            >
              <button
                type="button"
                className="method-phase-toggle"
                onClick={() => togglePhase(phase.id)}
                aria-expanded={isExpanded}
                aria-controls={`method-body-${phase.id}`}
              >
                <span className="method-phase-number">{phase.number}</span>
                <span className="method-phase-icon">
                  <Icon size={20} strokeWidth={1.65} />
                </span>
                <span className="method-phase-title">
                  <span>{phase.name}</span>
                  <small>{phase.summary}</small>
                </span>
                <span
                  className={`method-category method-category-${phase.category.toLowerCase()}`}
                >
                  {phase.category}
                </span>
                <ChevronDown size={18} className="method-phase-chevron" />
              </button>
              {isExpanded && (
                <div
                  id={`method-body-${phase.id}`}
                  className="method-phase-body"
                >
                  <div className="method-steps">
                    {phase.items.map((item, index) => (
                      <div className="method-step" key={item.title}>
                        <span className="method-step-index">0{index + 1}</span>
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="method-deliverable">
                    <div className="method-deliverable-label">
                      <ArrowDownRight size={17} /> PHASE DELIVERABLE
                    </div>
                    <p>{phase.deliverable}</p>
                    <div className="method-checkpoint">
                      <Check size={15} />
                      <span>{phase.checkpoint}</span>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
        {!filteredPhases.length && (
          <div className="method-empty">
            <Search size={28} />
            <h2>No matching phases</h2>
            <p>Try another keyword or choose a different category.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All phases");
              }}
            >
              Reset filters
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="method-footer-note">
        <ShieldCheck size={17} />
        <p>
          Start every engagement with written authorization and an agreed scope.
          Revisit the rules of engagement whenever the scope changes.
        </p>
      </div>
    </div>
  );
}
