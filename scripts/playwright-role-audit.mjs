import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8020';
const productId = process.env.PRODUCT_ID || '1';
const supplierId = process.env.SUPPLIER_ID || '1';
const outputDir = path.resolve('output/playwright/role-audit');
const viewports = [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
];

const accounts = {
    manager: {
        email: process.env.MANAGER_EMAIL || 'admin@example.com',
        password: process.env.MANAGER_PASSWORD || 'password',
    },
    staff: {
        email: process.env.STAFF_EMAIL || 'staff.audit@example.com',
        password: process.env.STAFF_PASSWORD || 'password',
    },
};

const pages = [
    ['dashboard', '/dashboard'],
    ['inventory', '/inventory'],
    ['product-detail', `/inventory/${productId}`],
    ['warehouse', '/warehouse'],
    ['supplier', '/supplier'],
    ['supplier-detail', `/supplier/${supplierId}`],
    ['purchase-orders', '/purchase-orders'],
    ['shipments', '/shipments'],
];

const managerOnlyLabels = [
    'Kelola Kategori',
    'Tambah Entri Baru',
    'Edit Entri',
    'Zona Baru',
    'Rak Baru',
    'Hapus Zona',
    'Hapus Rak',
    'Tambah Produk',
    'Ubah',
    'Hapus',
    'Tambah Pemasok',
    'Input Penilaian',
    'Buat PO Baru',
    'Tambah Pengiriman',
    'EDIT',
    'DELETE',
];

const staticStaffForbiddenRoutes = [
    '/settings',
    '/reports',
    '/drivers',
    '/inventory/create',
    '/purchase-orders/create',
    '/shipments/create',
];

async function isAnyVisible(page, text) {
    const locator = page.getByText(text, { exact: true });
    const count = await locator.count();

    for (let index = 0; index < count; index += 1) {
        if (await locator.nth(index).isVisible().catch(() => false)) {
            return true;
        }
    }

    return false;
}

async function login(page, email, password) {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await Promise.all([
        page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }),
        page.getByRole('button', { name: /masuk/i }).click(),
    ]);
    await page.waitForLoadState('networkidle').catch(() => {});
}

async function auditRole(browser, role, viewportName, viewport, managerAudit = null) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const report = { role, viewport: viewportName, pages: [], forbiddenRoutes: [] };
    const discoveredForbiddenRoutes = [];

    await login(page, accounts[role].email, accounts[role].password);

    for (const [name, routePath] of pages) {
        const response = await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.screenshot({ path: path.join(outputDir, `${viewportName}-${role}-${name}.png`), fullPage: true });

        const visibleManagerLabels = [];
        for (const label of managerOnlyLabels) {
            if (await isAnyVisible(page, label)) {
                visibleManagerLabels.push(label);
            }
        }

        if (role === 'manager' && name === 'shipments') {
            const editHref = await page
                .locator('a[href*="/shipments/"][href*="/edit"]')
                .first()
                .getAttribute('href')
                .catch(() => null);

            if (editHref) {
                discoveredForbiddenRoutes.push(new URL(editHref, baseUrl).pathname);
            }
        }

        report.pages.push({
            name,
            path: routePath,
            status: response?.status() ?? null,
            visibleManagerLabels,
        });
    }

    report.discoveredForbiddenRoutes = discoveredForbiddenRoutes;

    if (role === 'staff') {
        const forbiddenRoutes = [
            ...staticStaffForbiddenRoutes,
            ...(managerAudit?.discoveredForbiddenRoutes ?? []),
        ];

        for (const routePath of forbiddenRoutes) {
            const response = await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded' });
            await page.screenshot({
                path: path.join(outputDir, `${viewportName}-staff-forbidden-${routePath.replaceAll('/', '_') || 'root'}.png`),
                fullPage: true,
            });

            report.forbiddenRoutes.push({
                path: routePath,
                status: response?.status() ?? null,
            });
        }
    }

    await context.close();
    return report;
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    audits: [],
};

try {
    for (const [viewportName, viewport] of viewports) {
        const managerAudit = await auditRole(browser, 'manager', viewportName, viewport);
        report.audits.push(managerAudit);
        report.audits.push(await auditRole(browser, 'staff', viewportName, viewport, managerAudit));
    }
} finally {
    await browser.close();
}

const staffAudits = report.audits.filter((audit) => audit.role === 'staff');
const staffVisibleViolations = staffAudits.flatMap((audit) => audit.pages.flatMap((pageReport) =>
    pageReport.visibleManagerLabels.map((label) => ({
        viewport: audit.viewport,
        page: pageReport.name,
        path: pageReport.path,
        label,
    })),
));
const staffForbiddenViolations = staffAudits.flatMap((audit) =>
    audit.forbiddenRoutes
        .filter((route) => route.status !== 403)
        .map((route) => ({ viewport: audit.viewport, ...route })),
);

report.result = {
    staffVisibleViolations,
    staffForbiddenViolations,
    passed: staffVisibleViolations.length === 0 && staffForbiddenViolations.length === 0,
};

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report.result, null, 2));

if (!report.result.passed) {
    process.exitCode = 1;
}
