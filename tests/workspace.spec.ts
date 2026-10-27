import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function navigate(page: Page, name: string) {
  if (await page.getByRole('button', { name: 'Open navigation', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  }
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: new RegExp(`^${name}`) }).click();
}

test('overview identifies the project and creator and has no browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/North Renegades/);
  await expect(page.getByRole('button', { name: 'North Renegades home' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Your next move/ })).toBeVisible();
  await expect(page.locator('.main-footer')).toContainText('Vaibhav Thakur');
  await expect(page.getByText('Demo workspace', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Aegis Web Platform');
  expect(errors).toEqual([]);
});

test('engagement creation, rules of engagement, phase tracking, and browser persistence', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New engagement', exact: true }).click();
  const form = page.getByRole('dialog');
  await form.getByLabel('Engagement name', { exact: true }).fill('Customer Portal Review');
  await form.getByLabel('Client / organization', { exact: true }).fill('Example Research');
  await form.getByLabel(/^In-scope assets/).fill('portal.example.test\n192.0.2.20');
  await form.getByLabel('Out of scope', { exact: true }).fill('Production data and third-party services');
  await form.getByLabel('Written authorization reference').fill('AUTH-TEST-001');
  await form.getByLabel('Testing window & timezone').fill('Monday, 09:00–12:00 IST');
  await form.getByLabel('Communication / escalation contact').fill('Security lead, approved channel');
  await form.getByRole('button', { name: 'Create engagement', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Customer Portal Review');
  await expect(page.getByRole('dialog')).toContainText('portal.example.test');
  await page.getByText('Rules of engagement', { exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('AUTH-TEST-001');
  await page.getByRole('checkbox', { name: 'Complete Pre-engagement', exact: true }).check();
  await expect(page.getByRole('dialog')).toContainText('1 of 7 phases complete');
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await navigate(page, 'Engagements');
  await page.reload();
  await page.getByRole('button', { name: /Customer Portal Review Example Research/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Complete Pre-engagement', exact: true })).toBeChecked();
  await expect(page.getByRole('dialog')).toContainText('1 of 7 phases complete');
});

test('unavailable browser storage shows a warning and preserves session edits in an export', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Browser storage quota exceeded', 'QuotaExceededError');
    };
  });
  await page.goto('/');
  const warning = page.getByRole('alert');
  await expect(warning).toContainText('Browser storage is unavailable or full.');
  await expect(warning).toContainText('Changes are available for this session only.');
  await page.getByRole('button', { name: 'New engagement', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Engagement name', { exact: true }).fill('Session-only Assessment');
  await page.getByRole('dialog').getByLabel('Client / organization', { exact: true }).fill('Session Research');
  await page.getByRole('dialog').getByLabel(/^In-scope assets/).fill('session.example.test');
  await page.getByRole('dialog').getByRole('button', { name: 'Create engagement', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Edit engagement', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Engagement name', { exact: true }).fill('Updated Session Assessment');
  await page.getByRole('dialog').getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Updated Session Assessment');
  await page.getByRole('checkbox', { name: 'Complete Pre-engagement', exact: true }).check();
  await expect(page.getByRole('dialog')).toContainText('1 of 7 phases complete');
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  const downloadEvent = page.waitForEvent('download');
  await warning.getByRole('button', { name: 'Export backup', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('North-Renegades-workspace.json');
  const data = JSON.parse(await readFile((await download.path())!, 'utf8'));
  const entered = data.engagements.find((engagement: { name: string }) => engagement.name === 'Updated Session Assessment');
  expect(entered).toMatchObject({ client: 'Session Research', scope: 'session.example.test', completed: [0] });
  expect(data.findings).toHaveLength(7);
});

test('findings retain evidence, remediation, and verified retest status', async ({ page }) => {
  await page.goto('/');
  await navigate(page, 'Findings');
  await page.getByRole('button', { name: 'Add finding', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Finding title', { exact: true }).fill('Test authorization regression');
  await dialog.getByRole('combobox', { name: 'Severity', exact: true }).selectOption('High');
  await dialog.getByLabel('Description & impact').fill('A test role could access a synthetic record outside its ownership.');
  await dialog.getByLabel(/^Evidence \/ reproduction/).fill('Sanitized test request reference: TEST-101');
  await dialog.getByLabel('Actionable remediation').fill('Enforce object ownership checks and add cross-role regression coverage.');
  await dialog.getByRole('button', { name: 'Save finding', exact: true }).click();
  await page.getByRole('button', { name: /F-.*Test authorization regression/ }).click();
  await page.getByRole('dialog').getByRole('combobox', { name: 'Remediation status', exact: true }).selectOption('Verified');
  await page.getByRole('dialog').getByLabel(/^Evidence \/ reproduction/).fill('Retested 2026-10-27: cross-role request rejected after ownership check update.');
  await page.getByRole('dialog').getByRole('button', { name: 'Save finding', exact: true }).click();
  await page.reload();
  const row = page.getByRole('row').filter({ hasText: 'Test authorization regression' });
  await expect(row).toContainText('Verified');
  await row.getByRole('button', { name: /F-.*Test authorization regression/ }).click();
  await expect(page.getByRole('dialog').getByLabel(/^Evidence \/ reproduction/)).toHaveValue(/Retested 2026-10-27/);
});

test('report export contains scope, evidence, remediation, and creator attribution', async ({ page }) => {
  await page.goto('/');
  await navigate(page, 'Reports');
  await page.getByLabel('Report engagement').selectOption('NR-001');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download report', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('North-Renegades-NR-001-report.md');
  const downloadedPath = await download.path();
  expect(downloadedPath).toBeTruthy();
  const report = await readFile(downloadedPath!, 'utf8');
  for (const content of ['North Renegades', 'Vaibhav Thakur', 'Aegis Web Platform', 'Aegis Technologies', 'app.aegis.example', 'AEG-2026-014', 'Executive summary', 'Evidence / reproduction narrative', 'Enforce server-side ownership checks', 'Closure and retesting']) {
    expect(report).toContain(content);
  }
  const backupEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export workspace data' }).click();
  const backup = await backupEvent;
  const data = JSON.parse(await readFile((await backup.path())!, 'utf8'));
  expect(data.engagements).toHaveLength(3);
  expect(data.findings).toHaveLength(7);
});

test('five-question VAPT quiz scores correct answers and persists personal best', async ({ page }) => {
  await page.goto('/');
  await navigate(page, 'VAPT Academy');
  await expect(page.getByRole('button', { name: 'Check answer', exact: true })).toBeDisabled();
  for (const [index, answer] of [1, 2, 3, 1, 2].entries()) {
    await expect(page.getByRole('radio')).toHaveCount(4);
    await page.getByRole('radio').nth(answer).check();
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Exactly right.');
    await page.getByRole('button', { name: index === 4 ? 'See my results' : 'Next question', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'A strong security mindset.' })).toBeVisible();
  await expect(page.getByText('5 out of 5', { exact: true })).toBeVisible();
  await expect(page.getByText('5 / 5 personal best', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('5 / 5 personal best', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(4);
});

test('methodology search, category filters, and expandable guidance work', async ({ page }) => {
  await page.goto('/');
  await navigate(page, 'Methodology');
  await expect(page.locator('.method-phase')).toHaveCount(7);
  await page.getByLabel('Search methodology phases').fill('Nmap');
  await expect(page.locator('.method-phase')).toHaveCount(1);
  await page.getByRole('button', { name: /Scanning & enumeration/ }).click();
  await expect(page.getByRole('button', { name: /Scanning & enumeration/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Build a service inventory', { exact: true })).toBeVisible();
  await page.getByLabel('Search methodology phases').fill('no-such-phase-999');
  await expect(page.getByRole('heading', { name: 'No matching phases' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('button', { name: 'Discovery', exact: true }).click();
  await expect(page.locator('.method-phase')).toHaveCount(2);
  await page.getByRole('button', { name: 'Expand all', exact: true }).click();
  await expect(page.locator('.method-phase-body')).toHaveCount(2);
  await page.getByRole('button', { name: 'Collapse all', exact: true }).click();
  await expect(page.locator('.method-phase-body')).toHaveCount(0);
});

for (const width of [1440, 1280, 1024, 390]) {
  test(`all views fit a ${width}px viewport at normal zoom`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const view of ['Overview', 'Engagements', 'Methodology', 'Findings', 'Reports', 'VAPT Academy']) {
      if (view !== 'Overview') await navigate(page, view);
      const sizes = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
      expect(sizes.document, `${view} overflows at ${width}px`).toBeLessThanOrEqual(sizes.viewport);
      await expect(page.locator('main h1')).toBeVisible();
    }
  });
}
