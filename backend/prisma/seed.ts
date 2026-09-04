import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Use deterministic dates
const BASE_DATE = new Date('2026-09-01T10:00:00Z');
const d = (offsetDays: number) => new Date(BASE_DATE.getTime() + offsetDays * 24 * 60 * 60 * 1000);

async function main() {
  console.log('Starting DB seed (Idempotent)...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Permissions
  const permissionsList = [
    'patient.read', 'patient.create', 'encounter.create',
    'assessment.read', 'assessment.create', 'facility.read', 'facility.update'
  ];

  const permissionRecords = [];
  for (const action of permissionsList) {
    const perm = await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action }
    });
    permissionRecords.push(perm);
  }

  // 2. Roles
  const workerRole = await prisma.role.upsert({
    where: { name: 'WORKER' },
    update: { permissions: { connect: permissionRecords.map(p => ({ id: p.id })) } },
    create: {
      name: 'WORKER',
      permissions: { connect: permissionRecords.map(p => ({ id: p.id })) }
    }
  });

  const doctorRole = await prisma.role.upsert({
    where: { name: 'DOCTOR' },
    update: { permissions: { connect: permissionRecords.map(p => ({ id: p.id })) } },
    create: {
      name: 'DOCTOR',
      permissions: { connect: permissionRecords.map(p => ({ id: p.id })) }
    }
  });

  // 3. Facilities
  const facChc = await prisma.facility.upsert({
    where: { id: 'fac-chc-1' },
    update: {},
    create: {
      id: 'fac-chc-1',
      name: 'Mokama CHC',
      type: 'CHC',
      level: 2,
      address: 'Mokama, Bihar',
      latitude: 25.3857,
      longitude: 85.9189,
    }
  });

  await prisma.facilityAvailability.upsert({
    where: { facilityId: 'fac-chc-1' },
    update: { status: 'ACTIVE', readinessScore: 85 },
    create: { facilityId: 'fac-chc-1', status: 'ACTIVE', readinessScore: 85 }
  });

  const facPhc = await prisma.facility.upsert({
    where: { id: 'fac-phc-1' },
    update: {},
    create: {
      id: 'fac-phc-1',
      name: 'Barh PHC',
      type: 'PHC',
      level: 1,
      address: 'Barh, Bihar',
      latitude: 25.4000,
      longitude: 85.7000,
    }
  });
  await prisma.facilityAvailability.upsert({
    where: { facilityId: 'fac-phc-1' },
    update: { status: 'ACTIVE', readinessScore: 70 },
    create: { facilityId: 'fac-phc-1', status: 'ACTIVE', readinessScore: 70 }
  });

  const facDist = await prisma.facility.upsert({
    where: { id: 'fac-dist-1' },
    update: {},
    create: {
      id: 'fac-dist-1',
      name: 'Patna District Hospital',
      type: 'DISTRICT',
      level: 3,
      address: 'Patna, Bihar',
      latitude: 25.6000,
      longitude: 85.1000,
    }
  });
  await prisma.facilityAvailability.upsert({
    where: { facilityId: 'fac-dist-1' },
    update: { status: 'ACTIVE', readinessScore: 92 },
    create: { facilityId: 'fac-dist-1', status: 'ACTIVE', readinessScore: 92 }
  });

  // 4. Users (Worker and Doctor)
  const doctorUser = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      password: passwordHash,
      isActive: true,
      roles: { connect: { id: doctorRole.id } },
    }
  });
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      id: 'doc-1',
      userId: doctorUser.id,
      facilities: {
        create: { facilityId: facChc.id }
      }
    }
  });

  const workerUser = await prisma.user.upsert({
    where: { phone: '+919998887776' },
    update: {},
    create: {
      phone: '+919998887776',
      password: passwordHash,
      isActive: true,
      roles: { connect: { id: workerRole.id } },
    }
  });
  const worker = await prisma.worker.upsert({
    where: { userId: workerUser.id },
    update: {},
    create: {
      id: 'worker-1',
      userId: workerUser.id,
      type: 'ASHA',
      facilityId: facPhc.id
    }
  });

  // 5. Patients
  const patientsData = [
    { id: 'pat-1', name: 'Ramesh Kumar', gender: 'M', age: 45, phone: '9000000001', village: 'Mokama' },
    { id: 'pat-2', name: 'Sita Devi', gender: 'F', age: 32, phone: '9000000002', village: 'Barh' },
    { id: 'pat-3', name: 'Anil Singh', gender: 'M', age: 58, phone: '9000000003', village: 'Mokama' },
    { id: 'pat-4', name: 'Geeta Rani', gender: 'F', age: 25, phone: '9000000004', village: 'Barh' },
    { id: 'pat-5', name: 'Birendra Paswan', gender: 'M', age: 62, phone: '9000000005', village: 'Mokama' },
    { id: 'pat-6', name: 'Sunita Kumari', gender: 'F', age: 40, phone: '9000000006', village: 'Patna' },
    { id: 'pat-7', name: 'Kishan Lal', gender: 'M', age: 70, phone: '9000000007', village: 'Mokama' },
    { id: 'pat-8', name: 'Meena Devi', gender: 'F', age: 28, phone: '9000000008', village: 'Barh' },
    { id: 'pat-9', name: 'Rahul Verma', gender: 'M', age: 18, phone: '9000000009', village: 'Patna' },
    { id: 'pat-10', name: 'Pooja Singh', gender: 'F', age: 35, phone: '9000000010', village: 'Mokama' },
  ];

  for (const p of patientsData) {
    await prisma.patient.upsert({
      where: { id: p.id },
      update: { name: p.name, age: p.age, phone: p.phone, village: p.village },
      create: {
        id: p.id,
        name: p.name,
        gender: p.gender,
        age: p.age,
        phone: p.phone,
        village: p.village
      }
    });
  }

  // 6. Encounters
  const encountersData = [
    { id: 'enc-1', patientId: 'pat-1', facilityId: facPhc.id, type: 'FIELD_VISIT', status: 'COMPLETED', start: d(-10) },
    { id: 'enc-2', patientId: 'pat-1', facilityId: facChc.id, type: 'CLINIC_VISIT', status: 'COMPLETED', start: d(-5) },
    { id: 'enc-3', patientId: 'pat-2', facilityId: facPhc.id, type: 'FIELD_VISIT', status: 'COMPLETED', start: d(-2) },
    { id: 'enc-4', patientId: 'pat-3', facilityId: facPhc.id, type: 'FIELD_VISIT', status: 'IN_PROGRESS', start: d(0) },
    { id: 'enc-5', patientId: 'pat-4', facilityId: facChc.id, type: 'CLINIC_VISIT', status: 'COMPLETED', start: d(-1) },
    { id: 'enc-6', patientId: 'pat-5', facilityId: facDist.id, type: 'CLINIC_VISIT', status: 'IN_PROGRESS', start: d(0) },
  ];

  for (const e of encountersData) {
    await prisma.encounter.upsert({
      where: { id: e.id },
      update: { status: e.status },
      create: {
        id: e.id,
        patientId: e.patientId,
        facilityId: e.facilityId,
        type: e.type,
        status: e.status,
        start: e.start
      }
    });
  }

  // 7. Assessments
  const assessmentsData = [
    { id: 'ass-1', patientId: 'pat-1', encounterId: 'enc-1', provenance: 'WORKER_RECORDED', createdAt: d(-10) },
    { id: 'ass-2', patientId: 'pat-2', encounterId: 'enc-3', provenance: 'WORKER_RECORDED', createdAt: d(-2) },
    { id: 'ass-3', patientId: 'pat-4', encounterId: 'enc-5', provenance: 'SYSTEM_DERIVED', createdAt: d(-1) },
  ];

  for (const a of assessmentsData) {
    await prisma.assessment.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        patientId: a.patientId,
        encounterId: a.encounterId,
        provenance: a.provenance,
        createdAt: a.createdAt,
      }
    });
  }

  const symptomsData = [
    { id: 'sym-1', assessmentId: 'ass-1', name: 'Fever', duration: '3 days', severity: 'MODERATE' },
    { id: 'sym-2', assessmentId: 'ass-1', name: 'Cough', duration: '5 days', severity: 'MILD' },
    { id: 'sym-3', assessmentId: 'ass-2', name: 'Chest Pain', duration: '1 day', severity: 'SEVERE' },
    { id: 'sym-4', assessmentId: 'ass-3', name: 'Headache', duration: '2 days', severity: 'MILD' },
  ];

  for (const s of symptomsData) {
    await prisma.symptom.upsert({
      where: { id: s.id },
      update: { severity: s.severity },
      create: {
        id: s.id,
        assessmentId: s.assessmentId,
        name: s.name,
        duration: s.duration,
        severity: s.severity
      }
    });
  }

  // 8. Referrals
  const referralsData = [
    { id: 'ref-1', patientId: 'pat-2', originId: facPhc.id, destinationId: facChc.id, reason: 'Severe chest pain, suspected cardiac issue', urgency: 'URGENT', status: 'SUBMITTED' },
    { id: 'ref-2', patientId: 'pat-4', originId: facChc.id, destinationId: facDist.id, reason: 'Requires advanced diagnostics', urgency: 'ROUTINE', status: 'ACCEPTED' },
  ];

  for (const r of referralsData) {
    await prisma.referral.upsert({
      where: { id: r.id },
      update: { status: r.status },
      create: {
        id: r.id,
        patientId: r.patientId,
        originId: r.originId,
        destinationId: r.destinationId,
        reason: r.reason,
        urgency: r.urgency,
        status: r.status
      }
    });
  }

  // 9. Appointments & Queue
  const apptsData = [
    { id: 'appt-1', patientId: 'pat-1', facilityId: facChc.id, doctorId: doctor.id, scheduledAt: d(1), status: 'BOOKED' },
    { id: 'appt-emergency-1', patientId: 'pat-2', facilityId: facChc.id, doctorId: doctor.id, scheduledAt: d(0), status: 'COMPLETED' }
  ];

  for (const appt of apptsData) {
    await prisma.appointment.upsert({
      where: { id: appt.id },
      update: { status: appt.status },
      create: {
        id: appt.id,
        patientId: appt.patientId,
        facilityId: appt.facilityId,
        doctorId: appt.doctorId,
        scheduledAt: appt.scheduledAt,
        status: appt.status
      }
    });
  }

  const queueData = [
    { id: 'queue-1', appointmentId: 'appt-emergency-1', doctorId: doctor.id, priority: 1, status: 'WAITING', arrivalTime: d(0) },
    { id: 'queue-2', appointmentId: 'appt-1', doctorId: doctor.id, priority: 0, status: 'WAITING', arrivalTime: d(1) },
  ];

  for (const q of queueData) {
    await prisma.queueEntry.upsert({
      where: { id: q.id },
      update: { status: q.status },
      create: {
        id: q.id,
        appointmentId: q.appointmentId,
        doctorId: q.doctorId,
        priority: q.priority,
        status: q.status,
        arrivalTime: q.arrivalTime
      }
    });
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
