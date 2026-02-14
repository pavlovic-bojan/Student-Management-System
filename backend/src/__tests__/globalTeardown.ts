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

    // Students linked to test tenants via StudentTenant (Student has no tenantId)
    const studentIds = await prisma.studentTenant
      .findMany({ where: { tenantId: { in: tenantIds } }, select: { studentId: true } })
      .then((r) => [...new Set(r.map((s) => s.studentId))]);
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
    await prisma.studentTenant.deleteMany({ where: { tenantId: { in: tenantIds } } });
    // Delete students that no longer have any tenant enrollment (orphans from test data)
    if (studentIds.length) {
      const stillEnrolled = await prisma.studentTenant.findMany({ where: { studentId: { in: studentIds } }, select: { studentId: true } });
      const stillSet = new Set(stillEnrolled.map((s) => s.studentId));
      const toDelete = studentIds.filter((id) => !stillSet.has(id));
      if (toDelete.length) await prisma.student.deleteMany({ where: { id: { in: toDelete } } });
    }
    await prisma.tuition.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.ticket.deleteMany({ where: { tenantId: { in: tenantIds } } });
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
