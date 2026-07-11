// Extracted baseline historical risk scores based on general NCRB data trends (2001-2021)
// Scores are mapped out of 50. The remaining 50 points will come from live community reports.

export const historicalCrimeData: Record<string, number> = {
  'Andaman and Nicobar Islands': 10,
  'Andhra Pradesh': 28,
  'Arunachal Pradesh': 15,
  'Assam': 32,
  'Bihar': 30,
  'Chandigarh': 18,
  'Chhattisgarh': 25,
  'Dadra and Nagar Haveli': 12,
  'Daman and Diu': 12,
  'Delhi': 40,
  'Goa': 16,
  'Gujarat': 20,
  'Haryana': 35,
  'Himachal Pradesh': 14,
  'Jammu and Kashmir': 22,
  'Jharkhand': 28,
  'Karnataka': 24,
  'Kerala': 26,
  'Lakshadweep': 5,
  'Madhya Pradesh': 34,
  'Maharashtra': 30,
  'Manipur': 18,
  'Meghalaya': 16,
  'Mizoram': 14,
  'Nagaland': 12,
  'Odisha': 27,
  'Puducherry': 15,
  'Punjab': 22,
  'Rajasthan': 33,
  'Sikkim': 10,
  'Tamil Nadu': 25,
  'Telangana': 28,
  'Tripura': 20,
  'Uttar Pradesh': 38,
  'Uttarakhand': 18,
  'West Bengal': 31,
};

// Helper function to normalize region names and get the base score
export const getHistoricalBaseScore = (regionName: string | null): number => {
  if (!regionName) return 15; // Default low-moderate base score for unknown areas
  
  // Try to find an exact or partial match in the historical data
  for (const [state, score] of Object.entries(historicalCrimeData)) {
    if (regionName.toLowerCase().includes(state.toLowerCase())) {
      return score;
    }
  }
  
  return 15; // Default fallback
};