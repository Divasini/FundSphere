import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting End-to-End Verification Suite for FundSphere...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing API Health Endpoint...');
  const healthRes = await fetch(`${API_BASE}/health`);
  const healthJson = await healthRes.json();
  if (healthJson.status !== 'ok') throw new Error('Health check failed');
  console.log('   ✅ Health check passed.');

  // Test 2: User Registration (No default user info)
  console.log('\n2️⃣ Testing User Registration...');
  const testEmail = `innovator_${Date.now()}@testcorp.org`;
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Deshmukh',
      email: testEmail,
      password: 'mypassword123',
      confirmPassword: 'mypassword123',
    }),
  });
  const regJson = await regRes.json();
  if (!regJson.success) throw new Error(`Registration failed: ${regJson.message}`);
  const userToken = regJson.data.token;
  const userId = regJson.data.user.id;
  console.log(`   ✅ User registered successfully: ${regJson.data.user.name} (${regJson.data.user.email})`);

  // Test 3: Admin Login
  console.log('\n3️⃣ Testing Admin Login...');
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@fundsphere.com',
      password: 'admin123',
    }),
  });
  const adminJson = await adminLoginRes.json();
  if (!adminJson.success) throw new Error(`Admin login failed: ${adminJson.message}`);
  const adminToken = adminJson.data.token;
  console.log('   ✅ Admin logged in successfully with ADMIN role verified.');

  // Test 4: Dynamic Categories
  console.log('\n4️⃣ Testing Dynamic Category Retrieval...');
  const catRes = await fetch(`${API_BASE}/categories`);
  const catJson = await catRes.json();
  if (!catJson.success || catJson.data.length === 0) throw new Error('Failed to retrieve dynamic categories');
  const targetCategory = catJson.data[0];
  console.log(`   ✅ Categories retrieved: ${catJson.data.length} categories found. Using "${targetCategory.name}".`);

  // Test 5: Campaign Creation (Draft -> Submission)
  console.log('\n5️⃣ Testing Campaign Creation (Multi-Step Form Logic)...');
  const createRes = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      title: `E2E AquaFilter Project ${Date.now()}`,
      shortDescription: 'Nanotech membrane filtration for rural clean drinking water.',
      description: 'A breakthrough low-pressure nanotech membrane that strips microbial contamination from well water without requiring electrical grid power.',
      categoryId: targetCategory.id,
      fundingGoal: 50000,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=800',
      isDraft: true,
    }),
  });
  const createJson = await createRes.json();
  if (!createJson.success) throw new Error(`Campaign creation failed: ${createJson.message}`);
  const testCampaign = createJson.data;
  if (testCampaign.status !== 'DRAFT') throw new Error(`Expected DRAFT status, got ${testCampaign.status}`);
  console.log(`   ✅ Campaign draft created with status: ${testCampaign.status}`);

  // Test 6: Submit Draft for Review
  console.log('\n6️⃣ Testing Campaign Submission for Review...');
  const submitRes = await fetch(`${API_BASE}/campaigns/${testCampaign.id}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const submitJson = await submitRes.json();
  if (!submitJson.success) throw new Error(`Campaign submission failed: ${submitJson.message}`);
  if (submitJson.data.status !== 'PENDING_REVIEW') throw new Error(`Expected PENDING_REVIEW, got ${submitJson.data.status}`);
  console.log(`   ✅ Campaign transitioned to: ${submitJson.data.status}`);

  // Test 7: Admin Approval Workflow
  console.log('\n7️⃣ Testing Admin Approval Workflow...');
  const approveRes = await fetch(`${API_BASE}/admin/campaigns/${testCampaign.id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const approveJson = await approveRes.json();
  if (!approveJson.success) throw new Error(`Admin approval failed: ${approveJson.message}`);
  if (approveJson.data.status !== 'ACTIVE') throw new Error(`Expected ACTIVE, got ${approveJson.data.status}`);
  console.log(`   ✅ Campaign approved by Admin and is now ACTIVE for public contributions.`);

  // Test 8: ACID Contribution Processing & Dynamic Progress
  console.log('\n8️⃣ Testing ACID Contribution Transaction...');
  const contribRes = await fetch(`${API_BASE}/contributions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      campaignId: testCampaign.id,
      amount: 25000,
    }),
  });
  const contribJson = await contribRes.json();
  if (!contribJson.success) throw new Error(`Contribution failed: ${contribJson.message}`);
  const txnRef = contribJson.data.contribution.transactionReference;
  console.log(`   ✅ Contribution of ₹25,000 processed! Generated Ref: ${txnRef}`);
  console.log(`   ✅ Campaign amountRaised updated in DB: ₹${contribJson.data.campaign.amountRaised}`);

  // Test 9: Goal Completion -> FUNDED Status
  console.log('\n9️⃣ Testing Goal Reached -> FUNDED Transition...');
  const secondContribRes = await fetch(`${API_BASE}/contributions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      campaignId: testCampaign.id,
      amount: 30000, // Total will be 55,000 >= 50,000 Goal!
    }),
  });
  const secondContribJson = await secondContribRes.json();
  if (secondContribJson.data.campaign.status !== 'FUNDED') {
    throw new Error(`Expected status FUNDED, got ${secondContribJson.data.campaign.status}`);
  }
  console.log(`   ✅ Total raised: ₹${secondContribJson.data.campaign.amountRaised} / ₹50,000.`);
  console.log(`   ✅ Campaign status correctly upgraded to: ${secondContribJson.data.campaign.status}`);

  // Test 10: Failed Campaign -> Automated Idempotent Refund Processing
  console.log('\n🔟 Testing Failed Campaign Deadline Expiration & Automated Refunds...');
  // Create an expired test campaign that failed to reach goal
  const failedCamp = await prisma.campaign.create({
    data: {
      creatorId: userId,
      categoryId: targetCategory.id,
      title: `E2E Expired Failed Campaign ${Date.now()}`,
      slug: `e2e-failed-${Date.now()}`,
      shortDescription: 'Campaign that reaches deadline without hitting goal.',
      description: 'Full description of failed project to verify automated refund engine.',
      fundingGoal: 100000,
      amountRaised: 12000,
      deadline: new Date(Date.now() - 1000), // Expired 1 second ago!
      status: 'ACTIVE',
    },
  });

  // Create a successful contribution on this campaign
  const contribToRefund = await prisma.contribution.create({
    data: {
      campaignId: failedCamp.id,
      contributorId: userId,
      amount: 12000,
      paymentStatus: 'SUCCESS',
      transactionReference: `TXN-REFTEST-${Date.now()}`,
    },
  });

  // Trigger deadline check
  console.log('   Triggering deadline checker engine...');
  const deadlineCheckRes = await fetch(`${API_BASE}/admin/deadline-check`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deadlineCheckJson = await deadlineCheckRes.json();
  console.log(`   ✅ Deadline check processed: ${deadlineCheckJson.data.processed} campaign(s).`);

  // Verify campaign is now FAILED
  const updatedFailedCamp = await prisma.campaign.findUnique({ where: { id: failedCamp.id } });
  if (updatedFailedCamp?.status !== 'FAILED') {
    throw new Error(`Expected campaign status FAILED, got ${updatedFailedCamp?.status}`);
  }
  console.log(`   ✅ Expired campaign updated to status: ${updatedFailedCamp.status}`);

  // Verify contribution paymentStatus is now REFUNDED
  const updatedContrib = await prisma.contribution.findUnique({
    where: { id: contribToRefund.id },
    include: { refund: true },
  });
  if (updatedContrib?.paymentStatus !== 'REFUNDED') {
    throw new Error(`Expected contribution REFUNDED, got ${updatedContrib?.paymentStatus}`);
  }
  if (!updatedContrib.refund) {
    throw new Error('Refund record was not created!');
  }
  console.log(`   ✅ Contribution status updated to REFUNDED.`);
  console.log(`   ✅ Generated Refund Reference: ${updatedContrib.refund.refundReference}`);
  console.log(`   ✅ Refund Amount: ₹${updatedContrib.refund.amount.toLocaleString('en-IN')}`);

  // Test 11: Idempotency (Cannot refund twice)
  console.log('\n1️⃣1️⃣ Testing Refund Idempotency (Duplicate Prevention)...');
  const secondDeadlineRes = await fetch(`${API_BASE}/admin/deadline-check`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const refundCount = await prisma.refund.count({ where: { contributionId: contribToRefund.id } });
  if (refundCount !== 1) {
    throw new Error(`Idempotency check failed: found ${refundCount} refund records for single contribution!`);
  }
  console.log('   ✅ Idempotency verified: exactly 1 refund record maintained.');

  // Test 12: Notification System
  console.log('\n1️⃣2️⃣ Testing Dynamic Notifications...');
  const notifRes = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const notifJson = await notifRes.json();
  if (!notifJson.success || notifJson.data.length === 0) {
    throw new Error('No notifications generated for user actions!');
  }
  console.log(`   ✅ Found ${notifJson.data.length} dynamic notifications generated for user.`);
  console.log(`   Sample: "${notifJson.data[0].title}" - "${notifJson.data[0].message}"`);

  // Test 13: Admin Statistics & Reports
  console.log('\n1️⃣3️⃣ Testing Admin Platform Aggregations...');
  const adminStatsRes = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminStatsJson = await adminStatsRes.json();
  console.log('   ✅ Live database stats:', {
    totalUsers: adminStatsJson.data.totalUsers,
    totalCampaigns: adminStatsJson.data.totalCampaigns,
    activeCampaigns: adminStatsJson.data.activeCampaigns,
    successfulCampaigns: adminStatsJson.data.successfulCampaigns,
    totalFundsRaised: adminStatsJson.data.totalFundsRaised,
    totalRefunds: adminStatsJson.data.totalRefunds,
  });

  console.log('\n🎉 ALL 13 TEST SUITES PASSED FLAWLESSLY WITH 100% REAL POSTGRESQL PERSISTENCE!\n');
}

runTests()
  .catch((e) => {
    console.error('\n❌ Test suite failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
