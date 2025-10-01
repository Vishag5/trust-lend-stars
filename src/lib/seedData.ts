import { getDataClient, User, Contract } from './dataClient';

export const QA_USERS = {
  BORROWER_A: { phone: '+919000011111', name: 'Borrower A' },
  LENDER_L1: { phone: '+919000022222', name: 'Lender L1' },
  BORROWER_B: { phone: '+919000033333', name: 'Borrower B' },
};

export async function seedDemoData(): Promise<void> {
  const client = getDataClient();

  // Check if data already exists
  const existingUser = await client.getUserByPhone(QA_USERS.BORROWER_A.phone);
  if (existingUser) {
    console.log('Demo data already seeded');
    return;
  }

  // Create QA users
  const borrowerA = await client.createUser(QA_USERS.BORROWER_A);
  const lenderL1 = await client.createUser(QA_USERS.LENDER_L1);
  const borrowerB = await client.createUser(QA_USERS.BORROWER_B);

  // Seed sample contracts
  
  // Good borrower (Borrower A) - 90%+ reliability
  await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 5000,
    due_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    reason: 'Medical emergency',
  });

  await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 10000,
    due_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    reason: 'Business expense',
  });

  // Mixed borrower (Borrower B) - 67% with unresolved negative
  await client.createContract({
    borrower_id: borrowerB.id,
    lender_id: lenderL1.id,
    amount: 3000,
    due_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    reason: 'Rent payment',
  });

  // Create a negative review for Borrower B
  const borrowerBContracts = await client.getContractsForUser(borrowerB.id);
  if (borrowerBContracts.length > 0) {
    await client.createReview({
      contract_id: borrowerBContracts[0].id,
      reviewer_id: lenderL1.id,
      reviewee_id: borrowerB.id,
      stars: 2,
      text: 'Payment delayed significantly without communication',
    });
  }

  // Update reliability scores
  await client.updateUserReliability(borrowerA.id, 92);
  await client.updateUserReliability(borrowerB.id, 67);
  await client.updateUserReliability(lenderL1.id, 0); // Lender, no borrower history

  console.log('Demo data seeded successfully');
}
