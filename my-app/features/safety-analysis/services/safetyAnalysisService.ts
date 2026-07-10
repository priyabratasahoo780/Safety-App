export const calculateOverallScore = (
  lifestyleScore: number,
  travelScore: number,
  homeScore: number,
  digitalScore: number
): number => {
  // Weights based on specification
  const lWeighted = lifestyleScore * 0.25;
  const tWeighted = travelScore * 0.30;
  const hWeighted = homeScore * 0.20;
  const dWeighted = digitalScore * 0.25;

  const total = lWeighted + tWeighted + hWeighted + dWeighted;
  return Math.round(total);
};

export const determineSafetyStatus = (score: number): import('../types/safety-analysis.types').SafetyStatus => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'High Risk';
};
