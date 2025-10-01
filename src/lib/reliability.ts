import { getDataClient } from './dataClient';

export interface ReliabilityData {
  percentage: number;
  stars: number;
  label: string;
  numerator: number;
  denominator: number;
  isNew: boolean;
}

/**
 * Compute reliability score based on 12-month contract history
 * Formula: (on-time + ≤7-day late + resolved-after-negative) / (all settled + currently overdue/unresolved) × 100
 * 
 * Stars mapping:
 * 90-100 → ★★★★★
 * 75-89  → ★★★★☆
 * 60-74  → ★★★☆☆
 * 40-59  → ★★☆☆☆
 * 0-39   → ★☆☆☆☆
 * 
 * If fewer than 2 completed contracts in last 12 months → "New — no history yet"
 */
export async function computeReliability(userId: string): Promise<ReliabilityData> {
  const client = getDataClient();
  const contracts = await client.getContractsForUser(userId);
  const reviews = await client.getReviewsForUser(userId);
  
  const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  
  // Filter contracts where user is borrower and within 12 months
  const borrowerContracts = contracts.filter(
    c => c.borrower_id === userId && new Date(c.created_at).getTime() > twelveMonthsAgo
  );
  
  // Get completed contracts (SETTLED or currently overdue/unresolved)
  const settledContracts = borrowerContracts.filter(c => c.status === 'SETTLED');
  const overdueContracts = borrowerContracts.filter(c => {
    if (c.status !== 'ACTIVE' && c.status !== 'DUE') return false;
    return new Date(c.due_at).getTime() < Date.now();
  });
  
  const completedCount = settledContracts.length + overdueContracts.length;
  
  // If fewer than 2 completed contracts, return "New"
  if (completedCount < 2) {
    return {
      percentage: 0,
      stars: 0,
      label: 'New',
      numerator: 0,
      denominator: completedCount,
      isNew: true,
    };
  }
  
  let goodCount = 0;
  
  // Count on-time and ≤7-day late settlements
  for (const contract of settledContracts) {
    const dueDate = new Date(contract.due_at).getTime();
    const settledDate = new Date(contract.updated_at).getTime(); // Assume updated_at is settlement date
    const daysLate = Math.floor((settledDate - dueDate) / (24 * 60 * 60 * 1000));
    
    if (daysLate <= 7) {
      goodCount++;
    }
  }
  
  // Count resolved negative reviews (payment after negative review)
  const negativeReviews = reviews.filter(r => r.stars < 3);
  const resolvedNegatives = negativeReviews.filter(r => r.resolved).length;
  goodCount += resolvedNegatives;
  
  const percentage = Math.round((goodCount / completedCount) * 100);
  
  // Map to stars
  let stars: number;
  let label: string;
  
  if (percentage >= 90) {
    stars = 5;
    label = 'Excellent';
  } else if (percentage >= 75) {
    stars = 4;
    label = 'Very Good';
  } else if (percentage >= 60) {
    stars = 3;
    label = 'Good';
  } else if (percentage >= 40) {
    stars = 2;
    label = 'Fair';
  } else {
    stars = 1;
    label = 'Poor';
  }
  
  return {
    percentage,
    stars,
    label,
    numerator: goodCount,
    denominator: completedCount,
    isNew: false,
  };
}

export async function updateUserReliability(userId: string): Promise<void> {
  const data = await computeReliability(userId);
  const client = getDataClient();
  await client.updateUserReliability(userId, data.percentage);
}
