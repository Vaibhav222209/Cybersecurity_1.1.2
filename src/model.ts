export type Page =
  | "Overview"
  | "Engagements"
  | "Methodology"
  | "Findings"
  | "Reports"
  | "VAPT Academy";
export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Finding = {
  id: string;
  title: string;
  engagementId: string;
  severity: Severity;
  status: "Open" | "In progress" | "Verified";
  description: string;
  remediation: string;
  evidence: string;
};
export type Engagement = {
  id: string;
  name: string;
  client: string;
  type: string;
  approach: string;
  status: "In progress" | "Planned" | "Completed";
  scope: string;
  excluded: string;
  authorization: string;
  window: string;
  contact: string;
  emergency: string;
  completed: number[];
  created: string;
};
export const phases = [
  "Pre-engagement",
  "Reconnaissance",
  "Scanning",
  "Vulnerability analysis",
  "Exploitation",
  "Post-exploitation",
  "Reporting & retesting",
];
export const phaseTasks = [
  [
    "Document in-scope and excluded assets.",
    "Record written authorization and testing windows.",
    "Agree on communication and emergency stop procedures.",
  ],
  [
    "Collect public intelligence from approved sources.",
    "Record technologies and exposed attack surfaces.",
    "Confirm permission before active footprinting.",
  ],
  [
    "Inventory approved hosts, ports, and services.",
    "Use agreed scan rates and avoid excluded assets.",
    "Capture timestamped service inventory.",
  ],
  [
    "Correlate automated results with manual verification.",
    "Remove false positives and record affected assets.",
    "Prioritize reproducible risks by impact and likelihood.",
  ],
  [
    "Validate impact using the least disruptive approved technique.",
    "Record reproducible evidence without collecting unnecessary data.",
    "Stop at the agreed boundary of proof.",
  ],
  [
    "Evaluate approved privilege and lateral movement scenarios.",
    "Assess detection of explicitly permitted persistence simulations.",
    "Remove test accounts, payloads, and temporary access.",
  ],
  [
    "Deliver executive and technical reports.",
    "Assign owners and deadlines for remediation.",
    "Retest fixes, document evidence, and close verified findings.",
  ],
];
export const initialEngagements: Engagement[] = [
  {
    id: "NR-001",
    name: "Aegis Web Platform",
    client: "Aegis Technologies",
    type: "Web application",
    approach: "Gray box",
    status: "In progress",
    scope: "app.aegis.example\napi.aegis.example",
    excluded: "Production customer data\nThird-party payment provider",
    authorization: "Demo written approval · AEG-2026-014",
    window: "Weekdays, 09:00–17:00 IST",
    contact: "Security lead · security@aegis.example",
    emergency:
      "Stop testing immediately. Notify the security lead and await written clearance.",
    completed: [0, 1, 2, 3],
    created: "2026-10-20",
  },
  {
    id: "NR-002",
    name: "Cloud Infrastructure",
    client: "Meridian Labs",
    type: "Cloud security",
    approach: "White box",
    status: "In progress",
    scope: "staging.meridian.example\n192.0.2.10\n192.0.2.11",
    excluded: "Production cloud accounts\nShared identity provider",
    authorization: "Demo written approval · MER-2026-008",
    window: "Tuesday–Thursday, 10:00–16:00 IST",
    contact: "Cloud security · cloud@meridian.example",
    emergency: "Pause all activity and contact the cloud security lead.",
    completed: [0, 1],
    created: "2026-10-22",
  },
  {
    id: "NR-003",
    name: "Internal Network Audit",
    client: "Vertex Systems",
    type: "Network",
    approach: "Black box",
    status: "Completed",
    scope: "198.51.100.10\n198.51.100.11\n198.51.100.12",
    excluded: "Employee devices\nAvailability and denial-of-service testing",
    authorization: "Demo written approval · VTX-2026-003",
    window: "Completed engagement · approved lab window",
    contact: "IT security · it@vertex.example",
    emergency: "Stop testing and notify the incident coordinator.",
    completed: [0, 1, 2, 3, 4, 5, 6],
    created: "2026-10-10",
  },
];
export const initialFindings: Finding[] = [
  {
    id: "F-001",
    title: "Broken object-level authorization",
    engagementId: "NR-001",
    severity: "Critical",
    status: "Open",
    description:
      "In this demonstration, an authenticated test account can access another test account’s record by changing an object identifier.",
    remediation:
      "Enforce server-side ownership checks on every object access. Add authorization regression tests for each role.",
    evidence:
      "Demo evidence: cross-account test request returned a record belonging to a second synthetic account. Replace with sanitized request/response evidence in a real engagement.",
  },
  {
    id: "F-002",
    title: "Overly permissive cloud role",
    engagementId: "NR-002",
    severity: "High",
    status: "In progress",
    description:
      "A demonstration service role has permissions beyond its documented operational need.",
    remediation:
      "Apply least privilege, constrain resource scope, and review effective permissions with the service owner.",
    evidence:
      "Demo evidence: policy review identified wildcard actions and resources in a staging role.",
  },
  {
    id: "F-003",
    title: "Stored cross-site scripting",
    engagementId: "NR-001",
    severity: "High",
    status: "Open",
    description:
      "Untrusted profile content is rendered without appropriate output encoding in this sample finding.",
    remediation:
      "Encode output for its context, sanitize permitted HTML, and introduce a restrictive Content Security Policy.",
    evidence:
      "Demo evidence: controlled test content executed in a separate synthetic user session.",
  },
  {
    id: "F-004",
    title: "Missing rate limits on authentication",
    engagementId: "NR-001",
    severity: "Medium",
    status: "Open",
    description:
      "The demonstration sign-in endpoint does not enforce a documented retry policy.",
    remediation:
      "Use account-aware throttling, progressive delays, and monitoring without allowing easy account denial of service.",
    evidence:
      "Demo evidence: a small, pre-agreed series of failed test logins did not trigger throttling.",
  },
  {
    id: "F-005",
    title: "Storage access logging disabled",
    engagementId: "NR-002",
    severity: "Medium",
    status: "Open",
    description: "A sample staging storage resource lacks access audit logs.",
    remediation:
      "Enable centralized access logging, retention, alerting, and a protected destination for logs.",
    evidence:
      "Demo evidence: staging configuration inspection showed audit logging disabled.",
  },
  {
    id: "F-006",
    title: "Verbose server response headers",
    engagementId: "NR-001",
    severity: "Low",
    status: "Open",
    description:
      "Responses disclose unnecessary software and version information in the sample application.",
    remediation:
      "Remove unnecessary technology headers and use consistent error responses.",
    evidence:
      "Demo evidence: sanitized response headers contained a detailed server version.",
  },
  {
    id: "F-007",
    title: "Legacy TLS configuration",
    engagementId: "NR-003",
    severity: "Low",
    status: "Verified",
    description:
      "A legacy protocol was enabled on a demonstration internal service and has been remediated.",
    remediation:
      "Require current TLS versions and supported cipher suites, then verify with an approved configuration check.",
    evidence:
      "Demo retest: legacy protocol negotiation rejected after the configuration update.",
  },
];

export function downloadFile(
  name: string,
  text: string,
  type = "text/markdown",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createReport(engagement: Engagement, findings: Finding[]) {
  const related = findings.filter((f) => f.engagementId === engagement.id);
  const open = related.filter((f) => f.status !== "Verified");
  return `# North Renegades — Penetration Testing Report\n\nPrepared by Vaibhav Thakur\nGenerated: ${new Date().toISOString()}\nEngagement: ${engagement.name} (${engagement.id})\nClient: ${engagement.client}\nClassification: Confidential\n\n> This workspace begins with synthetic demonstration data. This export documents the entered information; it is not evidence of a security assessment.\n\n## Executive summary\n\n${related.length} findings are recorded, with ${open.length} awaiting verified remediation. ${related.filter((f) => f.severity === "Critical" && f.status !== "Verified").length} open critical findings require priority review. Testing approach: ${engagement.approach}. Engagement status: ${engagement.status}.\n\n## Scope and rules of engagement\n\n### In scope\n${engagement.scope}\n\n### Out of scope\n${engagement.excluded || "Not recorded"}\n\nAuthorization: ${engagement.authorization || "Not recorded"}\nTesting window: ${engagement.window || "Not recorded"}\nCommunication: ${engagement.contact || "Not recorded"}\nEmergency stop: ${engagement.emergency || "Not recorded"}\n\n## Methodology\n\nAligned to PTES, OWASP WSTG, and NIST SP 800-115. Completed phases: ${engagement.completed.map((i) => phases[i]).join(", ") || "None"}. Phase completion is recorded by the operator and does not represent automated testing.\n\n## Technical findings and prioritized remediation\n\n${
    [...related]
      .sort(
        (a, b) =>
          ["Critical", "High", "Medium", "Low"].indexOf(a.severity) -
          ["Critical", "High", "Medium", "Low"].indexOf(b.severity),
      )
      .map(
        (f) =>
          `### ${f.id}: ${f.title}\n\nSeverity: ${f.severity}\nStatus: ${f.status}\n\n${f.description}\n\n**Evidence / reproduction narrative**\n${f.evidence || "No evidence recorded. Add sanitized proof of concept, timestamps, and affected assets."}\n\n**Remediation**\n${f.remediation}\n\n**Owner / target date:** To be assigned by the engagement owner.\n\n**Retest outcome:** ${f.status === "Verified" ? "Marked verified by the operator; review supporting evidence." : "Pending remediation and retest."}`,
      )
      .join("\n\n") ||
    "No findings recorded. This alone does not establish the absence of vulnerabilities."
  }\n\n## Closure and retesting\n\nAgree remediation owners and deadlines, repeat the original validation safely, record new evidence, and verify cleanup of test accounts and artifacts. Close findings only after confirmed retest.\n`;
}
