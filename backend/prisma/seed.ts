import bcrypt from 'bcrypt';
import { PrismaClient, StudentStatus, UserRole, ExamStatus } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const UNIVERSITIES = [
  { name: 'Univerzitet u Beogradu', code: 'BG' },
  { name: 'Univerzitet u Novom Sadu', code: 'NS' },
  { name: 'Univerzitet u Nišu', code: 'NI' },
  { name: 'Univerzitet u Kragujevcu', code: 'KG' },
  { name: 'Univerzitet u Banjoj Luci', code: 'BL' },
  { name: 'Univerzitet u Sarajevu', code: 'SA' },
  { name: 'Univerzitet u Zagrebu', code: 'ZG' },
  { name: 'Univerzitet u Ljubljani', code: 'LJ' },
  { name: 'Univerzitet u Skoplju', code: 'SK' },
  { name: 'Univerzitet Crne Gore', code: 'CG' },
  { name: 'Univerzitet u Podgorici', code: 'PG' },
  { name: 'Univerzitet u Prištini', code: 'PR' },
  { name: 'Univerzitet u Tuzli', code: 'TZ' },
  { name: 'Univerzitet u Mostaru', code: 'MO' },
  { name: 'Univerzitet u Subotici', code: 'SU' },
  { name: 'Univerzitet u Novom Pazaru', code: 'NP' },
  { name: 'Univerzitet u Čačku', code: 'CA' },
  { name: 'Univerzitet u Leskovcu', code: 'LE' },
  { name: 'Univerzitet u Smederevu', code: 'SM' },
  { name: 'Univerzitet u Zrenjaninu', code: 'ZR' },
  { name: 'Univerzitet u Pančevu', code: 'PA' },
  { name: 'Univerzitet u Šapcu', code: 'SH' },
  { name: 'Univerzitet u Kruševcu', code: 'KR' },
  { name: 'Univerzitet u Vranju', code: 'VR' },
  { name: 'Univerzitet u Užicu', code: 'UZ' },
  { name: 'Univerzitet u Valjevu', code: 'VA' },
  { name: 'Univerzitet u Somboru', code: 'SO' },
  { name: 'Univerzitet u Kikindi', code: 'KI' },
  { name: 'Univerzitet u Jagodini', code: 'JA' },
];

const FIRST_NAMES = [
  'Marko', 'Nikola', 'Stefan', 'Luka', 'Filip', 'Nemanja', 'Aleksandar', 'Miloš', 'Jovan', 'Đorđe',
  'Ana', 'Maria', 'Jelena', 'Milica', 'Tamara', 'Ivana', 'Katarina', 'Sara', 'Teodora', 'Elena',
  'Petar', 'Mihajlo', 'Vuk', 'Uroš', 'Viktor', 'Lazar', 'Ognjen', 'Marko', 'David', 'Andrej',
  'Jovana', 'Nikolina', 'Tijana', 'Maja', 'Sonja', 'Dragana', 'Bojana', 'Sanja', 'Vesna', 'Jelena',
];

const LAST_NAMES = [
  'Jovanović', 'Petrović', 'Nikolić', 'Đorđević', 'Ilić', 'Kostić', 'Stojanović', 'Popović', 'Milošević', 'Marković',
  'Pavlović', 'Simić', 'Todorović', 'Stefanović', 'Nedeljković', 'Milić', 'Antić', 'Vuković', 'Đukić', 'Lazić',
  'Božić', 'Savić', 'Ristić', 'Stanković', 'Cvetković', 'Mladenović', 'Radovanović', 'Grujić', 'Babić', 'Živković',
];

const PROGRAM_NAMES = [
  { name: 'Računarstvo i informatika', code: 'RI' },
  { name: 'Elektrotehnika', code: 'ET' },
  { name: 'Mehanika', code: 'ME' },
  { name: 'Matematika', code: 'MA' },
  { name: 'Fizika', code: 'FI' },
];

const COURSE_NAMES = [
  'Programiranje 1', 'Programiranje 2', 'Strukture podataka', 'Baze podataka', 'Operativni sistemi',
  'Računarske mreže', 'Objektno orijentisano programiranje', 'Algoritmi', 'Web tehnologije', 'Softversko inženjerstvo',
  'Matematika 1', 'Matematika 2', 'Fizika', 'Elektronika', 'Signali i sistemi',
];

const BATCH_SIZE = 100;
const STUDENTS_PER_TENANT = 500;
const ENROLLMENTS_PER_STUDENT_MIN = 3;
const ENROLLMENTS_PER_STUDENT_MAX = 8;
const PAYMENTS_PER_TENANT = 1200;
const EXAM_REGS_PER_TENANT = 800;
const TRANSCRIPTS_PER_TENANT = 150;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomStatus(): StudentStatus {
  const r = Math.random();
  if (r < 0.02) return 'SUSPENDED';
  if (r < 0.05) return 'DROPPED';
  if (r < 0.10) return 'GRADUATED';
  return 'ACTIVE';
}

async function main() {
  console.log('Cleaning existing data...');
  await prisma.payment.deleteMany({});
  await prisma.transcript.deleteMany({});
  await prisma.examRegistration.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.examTerm.deleteMany({});
  await prisma.examPeriod.deleteMany({});
  await prisma.courseOffering.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.tuition.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Creating tenants (universities)...');
  const tenantData = UNIVERSITIES.map((u) => ({ name: u.name, code: u.code, isActive: true }));
  await prisma.tenant.createMany({ data: tenantData });
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'asc' } });
  console.log(`Created ${tenants.length} tenants.`);

  // Platform Admin (one global admin; assigned to first tenant for DB constraint)
  const platformAdminPasswordHash = await bcrypt.hash('seed-platform-admin-change-me', SALT_ROUNDS);
  await prisma.user.create({
    data: {
      email: 'platform-admin@sms.edu',
      password: platformAdminPasswordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      role: UserRole.PLATFORM_ADMIN,
      tenantId: tenants[0].id,
    },
  });
  console.log('Created Platform Admin: platform-admin@sms.edu');

  for (let tIdx = 0; tIdx < tenants.length; tIdx++) {
    const tenant = tenants[tIdx];
    const prefix = tenant.code.toLowerCase();
    console.log(`[${tIdx + 1}/${tenants.length}] Seeding tenant: ${tenant.name}`);

    const adminEmail = `admin@${prefix}.edu`;
    const adminPasswordHash = await bcrypt.hash('seed-admin-change-me', SALT_ROUNDS);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPasswordHash,
        firstName: 'Admin',
        lastName: tenant.name.split(' ')[0],
        role: UserRole.SCHOOL_ADMIN,
        tenantId: tenant.id,
      },
    });

    const professors: { id: string }[] = [];
    const profPasswordHash = await bcrypt.hash('seed-prof-change-me', SALT_ROUNDS);
    for (let i = 0; i < 8; i++) {
      const p = await prisma.user.create({
        data: {
          email: `prof${i + 1}@${prefix}.edu`,
          password: profPasswordHash,
          firstName: pick(FIRST_NAMES),
          lastName: pick(LAST_NAMES),
          role: UserRole.PROFESSOR,
          tenantId: tenant.id,
        },
      });
      professors.push({ id: p.id });
    }

    const programs = await prisma.program.createManyAndReturn({
      data: PROGRAM_NAMES.slice(0, 4).map((p) => ({
        name: p.name,
        code: `${prefix}-${p.code}`,
        tenantId: tenant.id,
        isActive: true,
      })),
    });

    const courses = await prisma.course.createManyAndReturn({
      data: COURSE_NAMES.slice(0, 12).map((c, i) => ({
        name: c,
        code: `${prefix}-${(i + 1).toString().padStart(2, '0')}`,
        tenantId: tenant.id,
        programId: programs[i % programs.length].id,
        professorId: professors[i % professors.length].id,
      })),
    });

    const offerings: { id: string; courseId: string }[] = [];
    for (const course of courses) {
      const o1 = await prisma.courseOffering.create({
        data: { courseId: course.id, term: 'Fall', year: 2024 },
      });
      const o2 = await prisma.courseOffering.create({
        data: { courseId: course.id, term: 'Spring', year: 2025 },
      });
      offerings.push({ id: o1.id, courseId: course.id }, { id: o2.id, courseId: course.id });
    }

    const period1 = await prisma.examPeriod.create({
      data: { name: 'January 2025', term: 'Winter', year: 2025, tenantId: tenant.id },
    });
    const period2 = await prisma.examPeriod.create({
      data: { name: 'June 2025', term: 'Summer', year: 2025, tenantId: tenant.id },
    });

    const examTerms: { id: string }[] = [];
    const baseDate1 = new Date('2025-01-15');
    const baseDate2 = new Date('2025-06-10');
    for (let i = 0; i < offerings.length; i++) {
      const o = offerings[i];
      const et1 = await prisma.examTerm.create({
        data: {
          examPeriodId: period1.id,
          courseOfferingId: o.id,
          date: new Date(baseDate1.getTime() + i * 86400000),
          tenantId: tenant.id,
        },
      });
      const et2 = await prisma.examTerm.create({
        data: {
          examPeriodId: period2.id,
          courseOfferingId: o.id,
          date: new Date(baseDate2.getTime() + i * 86400000),
          tenantId: tenant.id,
        },
      });
      examTerms.push({ id: et1.id }, { id: et2.id });
    }

    await prisma.tuition.createMany({
      data: [
        { tenantId: tenant.id, name: 'Školarina Fall 2024', amount: 50000 },
        { tenantId: tenant.id, name: 'Školarina Spring 2025', amount: 55000 },
      ],
    });
    const tuitions = await prisma.tuition.findMany({ where: { tenantId: tenant.id } });

    for (let batchStart = 0; batchStart < STUDENTS_PER_TENANT; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, STUDENTS_PER_TENANT);
      const data = [];
      for (let i = batchStart; i < batchEnd; i++) {
        const indexNumber = `2020-${(i + 1).toString().padStart(4, '0')}`;
        const programId = programs[i % programs.length].id;
        data.push({
          indexNumber,
          firstName: pick(FIRST_NAMES),
          lastName: pick(LAST_NAMES),
          status: randomStatus(),
          tenantId: tenant.id,
          programId,
        });
      }
      await prisma.student.createMany({ data });
    }

    const students = await prisma.student.findMany({
      where: { tenantId: tenant.id },
      select: { id: true },
    });
    console.log(`  Students: ${students.length}`);

    const enrollmentData: { studentId: string; courseOfferingId: string }[] = [];
    for (const student of students) {
      const n = ENROLLMENTS_PER_STUDENT_MIN + Math.floor(Math.random() * (ENROLLMENTS_PER_STUDENT_MAX - ENROLLMENTS_PER_STUDENT_MIN + 1));
      const selected = pickN(offerings, Math.min(n, offerings.length));
      for (const off of selected) {
        enrollmentData.push({ studentId: student.id, courseOfferingId: off.id });
      }
    }
    for (let i = 0; i < enrollmentData.length; i += 500) {
      const chunk = enrollmentData.slice(i, i + 500);
      await prisma.enrollment.createMany({ data: chunk, skipDuplicates: true });
    }
    console.log(`  Enrollments: ${enrollmentData.length}`);

    for (let i = 0; i < PAYMENTS_PER_TENANT; i++) {
      const student = pick(students);
      const tuition = pick(tuitions);
      const paidAt = new Date(2024, 6 + (i % 6), 1 + (i % 28));
      await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          studentId: student.id,
          tuitionId: tuition.id,
          amount: tuition.amount,
          paidAt,
        },
      });
    }
    console.log(`  Payments: ${PAYMENTS_PER_TENANT}`);

    const examRegData: { studentId: string; examTermId: string; grade: number | null; status: ExamStatus }[] = [];
    for (let i = 0; i < EXAM_REGS_PER_TENANT; i++) {
      const student = pick(students);
      const term = pick(examTerms);
      const grade = Math.random() > 0.3 ? 6 + Math.floor(Math.random() * 5) : null;
      examRegData.push({
        studentId: student.id,
        examTermId: term.id,
        grade,
        status: grade !== null ? (grade >= 6 ? ExamStatus.PASSED : ExamStatus.FAILED) : ExamStatus.REGISTERED,
      });
    }
    await prisma.examRegistration.createMany({ data: examRegData, skipDuplicates: true });
    console.log(`  Exam registrations: ${examRegData.length}`);

    const transcriptStudents = pickN(students, Math.min(TRANSCRIPTS_PER_TENANT, students.length));
    for (const s of transcriptStudents) {
      await prisma.transcript.create({
        data: {
          tenantId: tenant.id,
          studentId: s.id,
          gpa: 7 + Math.random() * 3,
        },
      });
    }
    console.log(`  Transcripts: ${transcriptStudents.length}`);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
