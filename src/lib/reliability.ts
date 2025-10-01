import { Contract, Review, getDataClient } from './dataClient';

export interface ReliabilityData {
  percentage: number;
  stars: number;
  label: string;
  numerator: number;
  denominator: number;
  isNew: boolean;
}

export async function computeReliability(userId: string): Promise<ReliabilityData> {
  const client = getDataClient();
  const contracts = await client.getContractsForUser(userId);
  const reviews = await client.getReviewsForUser(userId);

  // Filter contracts where user is borrower, settled in last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const borrowerContracts = contracts.filter(
    (c) => c.borrower_id === userId && new Date(c.created_at) >= twelveMonthsAgo
  );

  const settledContracts = borrowerContracts.filter((c) => c.status === 'SETTLED');
  const unresolvedNegatives = reviews.filter((r) => r.stars <= 2 && !r.resolved).length;

  // If fewer than 2 completed contracts, show "New"
  if (settledContracts.length + unresolvedNegatives < 2) {
    return {
      percentage: 0,
      stars: 0,
      label: 'New — no history yet',
      numerator: 0,
      denominator: 0,
      isNew: true,
    };
  }

  // Count on-time, late (≤7 days), and resolved negatives
  let onTime = 0;
  let lateButWithin7Days = 0;
  let resolvedAfterNegative = 0;

  settledContracts.forEach((c) => {
    const dueDate = new Date(c.due_at);
    const settledDate = new Date(c.updated_at);
    const diffDays = Math.floor((settledDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      onTime++;
    } else if (diffDays <= 7) {
      lateButWithin7Days++;
    }

    // Check if there was a negative review that got resolved
    const negativeResolved = reviews.some(
      (r) => r.contract_id === c.id && r.stars <= 2 && r.resolved
    );
    if (negativeResolved) {
      resolvedAfterNegative++;
    }
  });

  const numerator = onTime + lateButWithin7Days + resolvedAfterNegative;
  const denominator = settledContracts.length + unresolvedNegatives;
  const percentage = denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

  let stars = 1;
  if (percentage >= 90) stars = 5;
  else if (percentage >= 75) stars = 4;
  else if (percentage >= 60) stars = 3;
  else if (percentage >= 40) stars = 2;

  return {
    percentage,
    stars,
    label: `${percentage}%`,
    numerator,
    denominator,
    isNew: false,
  };
}

export async function updateUserReliability(userId: string): Promise<void> {
  const client = getDataClient();
  const reliabilityData = await computeReliability(userId);
  await client.updateUserReliability(userId, reliabilityData.percentage);
}
