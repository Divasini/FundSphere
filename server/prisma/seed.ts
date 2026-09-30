import { PrismaClient, Role, CampaignStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const generateRef = (prefix: string) => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${ts}-${rand}`;
};

async function main() {
  console.log('🌱 Starting database seeding for FundSphere (Development & Demo Data)...');

  // Clear existing demo data in proper order (child tables first)
  await prisma.campaignInteraction.deleteMany();
  await prisma.campaignUpdate.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing data wiped.');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Supervisor',
      email: 'admin@fundsphere.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      bio: 'FundSphere Global Platform Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const creatorUser1 = await prisma.user.create({
    data: {
      name: 'Dr. Aarav Mehta',
      email: 'aarav@medtech.io',
      passwordHash,
      role: Role.USER,
      bio: 'Biomedical engineer passionate about affordable point-of-care diagnostics.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const creatorUser2 = await prisma.user.create({
    data: {
      name: 'Ananya Sharma',
      email: 'ananya@agrifuture.org',
      passwordHash,
      role: Role.USER,
      bio: 'Agronomist developing solar automated irrigation for smallholder farmers.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const contributorUser = await prisma.user.create({
    data: {
      name: 'Vikram Joshi',
      email: 'vikram@investor.com',
      passwordHash,
      role: Role.USER,
      bio: 'Angel supporter for high-impact social and health innovation.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  console.log('✅ Users created: admin@fundsphere.com (admin123) and demo users (password123)');

  // 2. Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Next-generation computing, hardware, AI, robotics, and consumer tech.',
        icon: 'Cpu',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Health & Medical',
        slug: 'health-medical',
        description: 'Affordable healthcare diagnostics, accessibility devices, and wellbeing.',
        icon: 'Activity',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Agriculture & Food',
        slug: 'agriculture-food',
        description: 'Sustainable farming, hydroponics, soil sensing, and food security.',
        icon: 'Sprout',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Education',
        slug: 'education',
        description: 'EdTech tools, open learning kits, and rural literacy initiatives.',
        icon: 'GraduationCap',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Clean Energy & Planet',
        slug: 'clean-energy',
        description: 'Renewable power, waste recycling, clean water, and green innovation.',
        icon: 'Leaf',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Social Impact',
        slug: 'social-impact',
        description: 'Community initiatives, rural empowerment, and humanitarian aid.',
        icon: 'HeartHandshake',
      },
    }),
  ]);

  const [techCat, healthCat, agriCat, eduCat, cleanEnergyCat, socialCat] = categories;
  console.log('✅ Categories created.');

  // 3. Create Campaigns
  // Campaign 1: Active campaign in Health
  const activeCampaign1 = await prisma.campaign.create({
    data: {
      creatorId: creatorUser1.id,
      categoryId: healthCat.id,
      title: 'NanoPulse: Ultra-Low-Cost Portable ECG for Rural Clinics',
      slug: 'nanopulse-portable-ecg-rural-clinics',
      shortDescription: 'A pocket-sized 12-lead ECG monitor powered by smartphones, bringing cardiac diagnostics to remote village healthcare centers.',
      description: 'Cardiovascular emergencies in rural clinics often suffer fatal delays due to the absence of bulky, expensive ECG machinery. NanoPulse is an ultra-portable, USB/Bluetooth-powered diagnostic instrument costing less than 10% of traditional clinical machines. Designed for healthcare workers with minimal training, it generates instant AI-assisted rhythm analysis and securely uploads telemetry to district specialists.',
      fundingGoal: 250000,
      amountRaised: 185000,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days in future
      status: CampaignStatus.ACTIVE,
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    },
  });

  // Campaign 2: Active campaign in Agriculture
  const activeCampaign2 = await prisma.campaign.create({
    data: {
      creatorId: creatorUser2.id,
      categoryId: agriCat.id,
      title: 'SolarDrip: Smart Automated Irrigation for Small Farms',
      slug: 'solardrip-smart-automated-irrigation',
      shortDescription: 'Zero-grid solar-powered soil moisture sensing system that automates water flow and saves up to 40% groundwater.',
      description: 'Smallholder farmers face severe water stress during peak dry seasons. SolarDrip integrates low-cost LoRa soil moisture probes with DC micro-valves connected directly to a miniature solar panel. It delivers targeted drip irrigation directly to roots when needed, preventing crop failure and reducing groundwater exploitation.',
      fundingGoal: 150000,
      amountRaised: 65000,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in future
      status: CampaignStatus.ACTIVE,
      coverImage: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=800',
    },
  });

  // Campaign 3: Pending review (for Admin approval workflow demo)
  const pendingCampaign = await prisma.campaign.create({
    data: {
      creatorId: creatorUser1.id,
      categoryId: techCat.id,
      title: 'AuraSound: Bone-Conduction Open Assistive Glasses',
      slug: 'aurasound-bone-conduction-assistive-glasses',
      shortDescription: 'Lightweight eyewear equipped with bone-conduction transducers and speech-to-tactile haptic alerts for the hearing impaired.',
      description: 'AuraSound converts directional ambient sounds and spoken voices into subtle bone vibrations and peripheral light indicators. Tested with deaf students, this allows spatial awareness of sirens, traffic, and conversations in classrooms.',
      fundingGoal: 300000,
      amountRaised: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: CampaignStatus.PENDING_REVIEW,
      coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
    },
  });

  // Campaign 4: Funded campaign (reached 100% goal)
  const fundedCampaign = await prisma.campaign.create({
    data: {
      creatorId: creatorUser2.id,
      categoryId: eduCat.id,
      title: 'BhashaKit: STEM Experiment Kits in Regional Indian Languages',
      slug: 'bhashakit-stem-kits-regional-languages',
      shortDescription: 'Hands-on electronics and physics discovery kits translated into 6 regional languages for government primary schools.',
      description: 'Science education should not be locked behind language barriers. BhashaKit provides experiential science modules with pictorial guides and audio narrations in Hindi, Tamil, Telugu, Kannada, Bengali, and Marathi.',
      fundingGoal: 100000,
      amountRaised: 110000,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: CampaignStatus.FUNDED,
      coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    },
  });

  // Campaign 5: Expired & Failed campaign (demonstrating automated refund system)
  const failedCampaign = await prisma.campaign.create({
    data: {
      creatorId: creatorUser1.id,
      categoryId: cleanEnergyCat.id,
      title: 'HydroMesh: Micro-Turbine Water Generator for Mountain Streams',
      slug: 'hydromesh-micro-turbine-water-generator',
      shortDescription: 'Portable vortex water turbine for off-grid Himalayan shelters, which unfortunately did not reach its required production threshold.',
      description: 'A conceptual hydro turbine designed for small streams. While prototype testing succeeded, the campaign concluded without reaching its required minimum production batch capital.',
      fundingGoal: 400000,
      amountRaised: 45000,
      deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Ended 3 days ago
      status: CampaignStatus.FAILED,
      coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800',
    },
  });

  console.log('✅ Campaigns created in diverse states (ACTIVE, PENDING_REVIEW, FUNDED, FAILED).');

  // 4. Create Contributions
  // Contributions to activeCampaign1
  const contrib1 = await prisma.contribution.create({
    data: {
      campaignId: activeCampaign1.id,
      contributorId: contributorUser.id,
      amount: 50000,
      paymentStatus: PaymentStatus.SUCCESS,
      transactionReference: generateRef('TXN'),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const contrib2 = await prisma.contribution.create({
    data: {
      campaignId: activeCampaign1.id,
      contributorId: adminUser.id,
      amount: 135000,
      paymentStatus: PaymentStatus.SUCCESS,
      transactionReference: generateRef('TXN'),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Contribution to failed campaign (with REFUND record)
  const failedContrib = await prisma.contribution.create({
    data: {
      campaignId: failedCampaign.id,
      contributorId: contributorUser.id,
      amount: 45000,
      paymentStatus: PaymentStatus.REFUNDED,
      transactionReference: generateRef('TXN'),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Create refund record for the failed campaign contribution
  const refundRecord = await prisma.refund.create({
    data: {
      contributionId: failedContrib.id,
      amount: 45000,
      status: 'COMPLETED',
      refundReference: generateRef('REF'),
      processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Contributions & Idempotent Refund records created.');

  // 5. Create Campaign Updates
  await prisma.campaignUpdate.create({
    data: {
      campaignId: activeCampaign1.id,
      title: 'First 5 Field Units Deployed in Satara District',
      content: 'We are thrilled to report that our preliminary batch of 5 NanoPulse prototypes have been handed over to village nurses in Satara. Early feedback on ECG noise suppression in rural clinics is outstanding!',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // 6. Create Notifications
  await prisma.notification.create({
    data: {
      userId: contributorUser.id,
      title: 'Refund Processed',
      message: `Your contribution of ₹45,000 for "HydroMesh: Micro-Turbine Water Generator for Mountain Streams" has been refunded. Refund Ref: ${refundRecord.refundReference}.`,
      type: 'REFUND_PROCESSED',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: contributorUser.id,
      title: 'Contribution Successful',
      message: `You successfully contributed ₹50,000 to "NanoPulse: Ultra-Low-Cost Portable ECG for Rural Clinics". Ref: ${contrib1.transactionReference}`,
      type: 'CONTRIBUTION_SUCCESS',
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // 7. Seed Interactions for recommendations
  await prisma.campaignInteraction.create({
    data: {
      userId: contributorUser.id,
      campaignId: activeCampaign1.id,
      categoryId: healthCat.id,
      interactionType: 'CONTRIBUTE',
    },
  });

  console.log('🎉 Seed complete! FundSphere demo database populated with real relational data.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
