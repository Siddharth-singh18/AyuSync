import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Seed Roles
  const workerRole = await prisma.role.upsert({
    where: { name: 'WORKER' },
    update: {},
    create: { name: 'WORKER' }
  });

  const doctorRole = await prisma.role.upsert({
    where: { name: 'DOCTOR' },
    update: {},
    create: { name: 'DOCTOR' }
  });

  // Seed Facility
  const facility = await prisma.facility.upsert({
    where: { id: 'fac-1' },
    update: {},
    create: {
      id: 'fac-1',
      name: 'Mokama CHC',
      type: 'CHC',
      level: 2,
      address: 'Mokama, Bihar',
      latitude: 25.3857,
      longitude: 85.9189,
      availability: {
        create: {
          status: 'ACTIVE',
          readinessScore: 85
        }
      }
    }
  });
  console.log(`Created Facility: ${facility.name}`);

  // Seed User (Doctor)
  const doctorUser = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      password: passwordHash,
      isActive: true,
      roles: {
        connect: { id: doctorRole.id }
      },
      doctor: {
        create: {
          facilities: {
            create: {
              facilityId: facility.id
            }
          }
        }
      }
    }
  });
  console.log(`Created Doctor: ${doctorUser.phone}`);

  // Seed User (Worker)
  const workerUser = await prisma.user.upsert({
    where: { phone: '+919998887776' },
    update: {},
    create: {
      phone: '+919998887776',
      password: passwordHash,
      isActive: true,
      roles: {
        connect: { id: workerRole.id }
      },
      worker: {
        create: {
          type: 'ASHA',
          facilityId: facility.id
        }
      }
    }
  });
  console.log(`Created Worker: ${workerUser.phone}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
