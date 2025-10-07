import { getDataClient, User } from './dataClient';

export const DEMO_USERS = {
  BORROWER_A: { phone: '+919000011111', name: 'Borrower A' },
  BORROWER_B: { phone: '+919000033333', name: 'Borrower B' },
  LENDER_L1: { phone: '+919000022222', name: 'Lender L1' },
  ADMIN: { phone: '+917012938275', name: 'Admin User', email: 'info.vishag@gmail.com' },
};

export async function seedDemoData(): Promise<void> {
  const client = getDataClient();

  // Check if data already exists by looking for contracts (not just users)
  try {
  const existingUser = await client.getUserByPhone(DEMO_USERS.BORROWER_A.phone);
  if (existingUser) {
      const existingContracts = await client.getContractsForUser(existingUser.id);
      if (existingContracts.length > 0) {
        console.log('Demo data already seeded (contracts exist)');
    return;
      } else {
        console.log('Users exist but no contracts found, seeding contracts...');
      }
    }
  } catch (error) {
    console.log('No existing data found, seeding from scratch...');
  }

  // Create demo users (or get existing ones)
  console.log('seedData: Creating/getting demo users...');
  const borrowerA = await client.createUser(DEMO_USERS.BORROWER_A);
  const borrowerB = await client.createUser(DEMO_USERS.BORROWER_B);
  const lenderL1 = await client.createUser(DEMO_USERS.LENDER_L1);
  const adminUser = await client.createUser(DEMO_USERS.ADMIN);
  console.log('seedData: Users ready:', { borrowerA: borrowerA.id, borrowerB: borrowerB.id, lenderL1: lenderL1.id, adminUser: adminUser.id });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  console.log('seedData: Creating contracts...');

  // Borrower A contracts (90% reliability)
  
  // 1. PENDING_DISBURSAL - Lender uploaded proof, waiting for borrower to verify
  const pendingDisbursalContract = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 12000,
    due_at: new Date(now + 30 * day).toISOString(),
    reason: 'Home renovation',
  });
  await client.updateContract(pendingDisbursalContract.id, { 
    status: 'PENDING_DISBURSAL', 
    disbursal_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjlmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iMzAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDdhZDkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj5QYXltZW50IFN1Y2Nlc3NmdWw8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzAwNWY3MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPuKCuTEyLDAwMDwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VUEkgUmVmOiAxMjM0NTY3ODkwPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNzUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRvOiBCb3Jyb3dlciBBPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iODUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNhYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRhdGU6ICcgKyBuZXcgRGF0ZSgpLnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJzwvdGV4dD48L3N2Zz4='
  });
  
  // 2. Active contract due in ~7 days
  const activeContract = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 8000,
    due_at: new Date(now + 7 * day).toISOString(),
    reason: 'Business inventory purchase',
  });
  await client.updateContract(activeContract.id, { 
    status: 'ACTIVE', 
    disbursal_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmZjZlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iMzAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzODgyNGEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj5UcmFuc2ZlciBDb21wbGV0ZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjMjI1NTMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+4oK5OCwwMDA8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TkVGVCBSZWY6IDk4NzY1NDMyMTA8L3RleHQ+PC9zdmc+'
  });

  // 3. PENDING_SETTLEMENT - Borrower uploaded repayment proof, waiting for lender to verify
  const pendingSettlementContract = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 5000,
    due_at: new Date(now - 1 * day).toISOString(),
    reason: 'Medical bills',
  });
  await client.updateContract(pendingSettlementContract.id, { 
    status: 'PENDING_SETTLEMENT',
    settlement_pending: true,
    disbursal_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmZjZlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iMzAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzODgyNGEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj5UcmFuc2ZlciBDb21wbGV0ZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjMjI1NTMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+4oK5NSwwMDA8L3RleHQ+PC9zdmc+',
    repayment_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmZmVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iMzAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMGM4NTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj5SZXBBTSBNYXR1cmU8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzAwOGEzZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPuKCuTUsMDAwPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlVQSSBSZWY6IDU1NTY2Njc3Nzg8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI3NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VG86IExlbmRlciBMMTwvdGV4dD48L3N2Zz4='
  });
  
  // 4. Overdue contract (2 days overdue)
  const overdueContract = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 3000,
    due_at: new Date(now - 2 * day).toISOString(),
    reason: 'Emergency medical expense',
  });
  await client.updateContract(overdueContract.id, { 
    status: 'DUE', 
    disbursal_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZWJlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iMzAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNkOTQ0MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj5QYXltZW50IFNlbnQ8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iI2I5MzYwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPuKCuTMsMDAwPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPklNUFMgUmVmOiAxMTExMTExMTExPC90ZXh0Pjwvc3ZnPg=='
  });

  // 5. Completed settled contract with positive review
  const settledContract1 = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 7000,
    due_at: new Date(now - 40 * day).toISOString(),
    reason: 'Rent payment',
  });
  await client.updateContract(settledContract1.id, { 
    status: 'SETTLED', 
    disbursal_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmZjZlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMyMjU1MzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj7igrkNLDAwMDwvdGV4dD48L3N2Zz4=',
    repayment_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmZmVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMwMDhhM2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj7igrkNLDAwMDwvdGV4dD48L3N2Zz4='
  });
  await client.createReview({
    contract_id: settledContract1.id,
    reviewer_id: lenderL1.id,
    reviewee_id: borrowerA.id,
    stars: 5,
    text: 'Paid on time, great borrower!',
  });

  // 6. Another completed contract (for reliability calculation) - NO REVIEW (for testing)
  const settledContract2 = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 6000,
    due_at: new Date(now - 60 * day).toISOString(),
    reason: 'School fees',
  });
  await client.updateContract(settledContract2.id, { 
    status: 'SETTLED', 
    disbursal_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmZjZlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMyMjU1MzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj7igrkGLDAwMDwvdGV4dD48L3N2Zz4=',
    repayment_proof_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmZmVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMwMDhhM2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj7igrkGLDAwMDwvdGV4dD48L3N2Zz4='
  });
  // NO REVIEW - This will show "Rate & Review" button for testing

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

  // 3. Another completed contract for B - NO REVIEW (for testing)
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
  // NO REVIEW - This will show "Rate & Review" button for testing

  // 4. Additional settled contract for testing - NO REVIEW
  const testSettledContract = await client.createContract({
    borrower_id: borrowerA.id,
    lender_id: lenderL1.id,
    amount: 2000,
    due_at: new Date(now - 30 * day).toISOString(),
    reason: 'Emergency fund',
  });
  await client.updateContract(testSettledContract.id, { 
    status: 'SETTLED', 
    disbursal_proof_url: 'mock://proof8.jpg',
    repayment_proof_url: 'mock://repay5.jpg' 
  });
  // NO REVIEW - This will show "Rate & Review" button for testing

  // Update reliability scores
  console.log('seedData: Updating reliability scores...');
  await client.updateUserReliability(borrowerA.id, 90);
  await client.updateUserReliability(borrowerB.id, 67);
  await client.updateUserReliability(lenderL1.id, 0); // Lender, no borrower history

  console.log('✅ Demo data seeded successfully! Contracts created and users ready.');
}

export async function clearDemoData(): Promise<void> {
  localStorage.clear();
  console.log('Demo data cleared');
}
