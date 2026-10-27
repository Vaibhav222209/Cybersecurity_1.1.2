# North Renegades — Engagement plan

Project by **Vaibhav Thakur**. Complete this template with the authorized asset owner before testing. The workspace can record these details in each engagement.

## Engagement overview

- Client and engagement name:
- Assessment owner and tester(s):
- Business objectives and success criteria:
- Approach: Black box / Gray box / White box
- Methodology: PTES / OWASP WSTG / NIST SP 800-115
- Start, end, and approved testing windows (including timezone):

## Authorized scope

| Asset / IP / domain / application / cloud account | Owner | Environment | Permitted techniques | Constraints |
| --- | --- | --- | --- | --- |
| | | | | |

Explicit exclusions: production data, third-party assets, shared infrastructure, availability testing, or any other excluded targets and techniques.

## Rules of engagement

- Written authorization: reference, approver, and signed approval location.
- Access provided: test account roles and approved access path; retain credentials securely outside the report.
- Testing intensity: rate limits, concurrency, prohibited actions, and conditions for escalation.
- Communication: primary contact, backup contact, approved channel, and update cadence.
- Critical findings: immediate escalation recipient and expected response time.
- Emergency stop: agreed stop signal, immediate contact, pause procedure, and written approval required to resume.
- Data handling: permitted evidence, redaction, storage, retention, and deletion requirements.
- Post-exploitation: separately approved privilege, lateral movement, and persistence simulations; agreed stopping boundary.
- Cleanup: test accounts, artifacts, temporary access, and verification owner.

## Execution and evidence

| Phase | Expected output | Completion / evidence reference |
| --- | --- | --- |
| Pre-engagement | Approved scope, authorization, objectives, and RoE | |
| Reconnaissance | Passive intelligence and approved active footprinting notes | |
| Scanning & enumeration | Approved host, port, service, and technology inventory | |
| Vulnerability analysis | Manually verified findings, impact, and false-positive disposition | |
| Controlled exploitation | Minimal approved proof and a documented stopping point | |
| Post-exploitation & cleanup | Approved scenario outcomes, detection results, and artifact removal | |
| Reporting & retesting | Executive summary, technical evidence, remediation plan, and retest results | |

## Finding and remediation record

- Identifier and title:
- Affected in-scope assets and versions:
- Severity: Critical / High / Medium / Low
- Severity rationale: impact, likelihood, exposure, and business context.
- Description and observed behavior:
- Authorized reproduction steps, expected result, and actual result:
- Sanitized evidence: timestamps, request/response references, screenshots, and raw log references.
- Specific remediation or compensating control:
- Accountable owner and target date:
- Retest environment, version, date, and method:
- Retest result: Fixed / Partially fixed / Unresolved / Not tested
- Residual risk and closure approval:

## Handoff and closure

- Executive summary for leadership: business risk, overall exposure, key priorities, and testing limitations.
- Technical report: attack narrative, affected assets, reproducible evidence, and severity rationale.
- Prioritized remediation: severity-ranked fixes with owners and deadlines.
- Retesting: independently verify the original behavior after remediation and record new evidence.
- Cleanup: confirm removal of all approved testing artifacts and access.
- Final acceptance: delivery date, recipients, unresolved risks, and agreed next actions.

Use **Reports → Download report** for an engagement-specific Markdown report. This template records the plan and evidence requirements; it does not perform an assessment.
