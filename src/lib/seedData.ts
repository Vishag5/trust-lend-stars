import { getDataClient, User } from './dataClient';

export const DEMO_USERS = {
  BORROWER_A: { phone: '+919000011111', name: 'Borrower A' },
  BORROWER_B: { phone: '+919000033333', name: 'Borrower B' },
  LENDER_L1: { phone: '+919000022222', name: 'Lender L1' },
};

export async function seedDemoData(): Promise<void> {
  const client = getDataClient();

  // Check if data already exists
  const existingUser = await client.getUserByPhone(DEMO_USERS.BORROWER_A.phone);
  if (existingUser) {
    console.log('Demo data already seeded');
    return;
  }

  // Create demo users
  const borrowerA = await client.createUser(DEMO_USERS.BORROWER_A);
  const borrowerB = await client.createUser(DEMO_USERS.BORROWER_B);
  const lenderL1 = await client.createUser(DEMO_USERS.LENDER_L1);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Borrower A contracts (90% reliability)
  
  // 1. Active contract due in ~7 days
  const activeContract = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 8000,
    due_at: new Date(now + 7 * day).toISOString(),
    reason: 'Business inventory purchase',
  });
  await client.updateContract(activeContract.id, { 
    status: 'ACTIVE', 
    disbursal_proof_url: 'mock://proof1.jpg' 
  });

  // 2. Overdue contract (2 days overdue)
  const overdueContract = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 3000,
    due_at: new Date(now - 2 * day).toISOString(),
    reason: 'Emergency medical expense',
  });
  await client.updateContract(overdueContract.id, { 
    status: 'DUE', 
    disbursal_proof_url: 'mock://proof2.jpg' 
  });

  // 3. Completed settled contract with positive review
  const settledContract1 = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 5000,
    due_at: new Date(now - 40 * day).toISOString(),
    reason: 'Rent payment',
  });
  await client.updateContract(settledContract1.id, { 
    status: 'SETTLED', 
    disbursal_proof_url: 'mock://proof3.jpg',
    repayment_proof_url: 'mock://repay1.jpg' 
  });
  await client.createReview({
    contract_id: settledContract1.id,
    reviewer_id: lenderL1.id,
    reviewee_id: borrowerA.id,
    stars: 5,
    text: 'Paid on time, great borrower!',
  });

  // 4. Another completed contract (for reliability calculation)
  const settledContract2 = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 6000,
    due_at: new Date(now - 60 * day).toISOString(),
    reason: 'School fees',
  });
  await client.updateContract(settledContract2.id, { 
    status: 'SETTLED', 
    disbursal_proof_url: 'mock://proof4.jpg',
    repayment_proof_url: 'mock://repay2.jpg' 
  });
  await client.createReview({
    contract_id: settledContract2.id,
    reviewer_id: lenderL1.id,
    reviewee_id: borrowerA.id,
    stars: 5,
    text: 'Excellent as always',
  });

  // Borrower B contracts (67% reliability with pinned negative)
  
  // 1. Active with 2 extensions already approved
  const borrowerBActive = await client.createContract({
    borrower_id: borrowerB.id,
    lender_id: lenderL1.id,
    amount: 4000,
    due_at: new Date(now + 10 * day).toISOString(),
    reason: 'Vehicle repair',
  });
  await client.updateContract(borrowerBActive.id, { 
    status: 'ACTIVE', 
    disbursal_proof_url: 'mock://proof5.jpg' 
  });
  
  // Create 2 approved extensions
  const ext1 = await client.createExtension({
    contract_id: borrowerBActive.id,
    new_due_at: new Date(now + 5 * day).toISOString(),
    extra_days: 3,
  });
  await client.approveExtension(ext1.id, true);
  
  const ext2 = await client.createExtension({
    contract_id: borrowerBActive.id,
    new_due_at: new Date(now + 10 * day).toISOString(),
    extra_days: 5,
  });
  await client.approveExtension(ext2.id, true);

  // 2. Past negative review (unresolved) - this lowers Borrower B's reliability
  const borrowerBNegative = await client.createContract({
    borrower_id: borrowerB.id,
    lender_id: lenderL1.id,
    amount: 2500,
    due_at: new Date(now - 50 * day).toISOString(),
    reason: 'Personal loan',
  });
  await client.updateContract(borrowerBNegative.id, { 
    status: 'SETTLED', 
    disbursal_proof_url: 'mock://proof6.jpg',
    repayment_proof_url: 'mock://repay3.jpg' 
  });
  await client.createReview({
    contract_id: borrowerBNegative.id,
    reviewer_id: lenderL1.id,
    reviewee_id: borrowerB.id,
    stars: 2,
    text: 'Payment delayed significantly without communication. Required multiple reminders.',
  });

  // 3. Another completed contract for B
  const borrowerBSettled = await client.createContract({
    borrower_id: borrowerB.id,
    lender_id: lenderL1.id,
    amount: 3500,
    due_at: new Date(now - 80 * day).toISOString(),
    reason: 'Business expense',
  });
  await client.updateContract(borrowerBSettled.id, { 
    status: 'SETTLED', 
    disbursal_proof_url: 'mock://proof7.jpg',
    repayment_proof_url: 'mock://repay4.jpg' 
  });
  await client.createReview({
    contract_id: borrowerBSettled.id,
    reviewer_id: lenderL1.id,
    reviewee_id: borrowerB.id,
    stars: 4,
    text: 'Paid but took a bit longer than expected',
  });

  // Update reliability scores
  await client.updateUserReliability(borrowerA.id, 90);
  await client.updateUserReliability(borrowerB.id, 67);
  await client.updateUserReliability(lenderL1.id, 0); // Lender, no borrower history

  console.log('Demo data seeded successfully');
}

export async function clearDemoData(): Promise<void> {
  localStorage.clear();
  console.log('Demo data cleared');
}
