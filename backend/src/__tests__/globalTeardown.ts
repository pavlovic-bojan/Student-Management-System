/**
 * Global teardown: runs after ALL test files (unit + integration).
 * Removes any test data from the database (tenants with code containing "TEST").
 * Safe to run even when no test data exists (e.g. unit-only run).
 */
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root (vitest runs from backend/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function cleanupTestData(): Promise<void> {
  const { prisma } = await import('../prisma/client');

  try {
    const testTenants = await prisma.tenant.findMany({
      where: { code: { contains: 'TEST', mode: 'insensitive' } },
      select: { id: true },
    });
    const tenantIds = testTenants.map((t) => t.id);
    if (tenantIds.length === 0) {
      await prisma.$disconnect();
      return;
    }

    const studentIds = await prisma.student.findMany({ where: { tenantId: { in: tenantIds } }, select: { id: true } }).then((r) => r.map((s) => s.id));
    const examTermIds = await prisma.examTerm.findMany({ where: { tenantId: { in: tenantIds } }, select: { id: true } }).then((r) => r.map((e) => e.id));
    const courseIds = await prisma.course.findMany({ where: { tenantId: { in: tenantIds } }, select: { id: true } }).then((r) => r.map((c) => c.id));

    // Delete in order to respect foreign keys (children before parents)
    if (studentIds.length || examTermIds.length) await prisma.examRegistration.deleteMany({ where: { OR: [{ studentId: { in: studentIds } }, { examTermId: { in: examTermIds } }] } });
    if (studentIds.length) await prisma.enrollment.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.examTerm.deleteMany({ where: { tenantId: { in: tenantIds } } });
    if (courseIds.length) await prisma.courseOffering.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.examPeriod.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.course.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.payment.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.transcript.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.student.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.tuition.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.user.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.userTenant.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.program.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.tenant.deleteMany({ where: { id: { in: tenantIds } } });

    // eslint-disable-next-line no-console
    console.log(`[globalTeardown] Cleaned ${tenantIds.length} test tenant(s) from database.`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[globalTeardown] Error cleaning test data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

export default async function globalTeardown(): Promise<void> {
  // Only run DB cleanup when DATABASE_URL is set (e.g. integration tests ran against real DB)
  if (process.env.DATABASE_URL) {
    await cleanupTestData();
  }
}
