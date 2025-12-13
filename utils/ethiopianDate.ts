// Simple mock utility to display Ethiopian Date
// In a production app, use 'ethiopian-date' library

const ETHIOPIAN_MONTHS = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miyaziy", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

export const getEthiopianDateString = (): string => {
  const today = new Date();
  
  // This is a rough approximation for demo purposes
  // Real conversion requires complex logic handling leap years
  const gMonth = today.getMonth(); // 0-11
  const gDay = today.getDate();
  const gYear = today.getFullYear();

  // Approx conversion logic (simplified)
  let eYear = gYear - 8;
  let eMonthIndex = (gMonth + 4) % 13; 
  let eDay = gDay;

  // Adjust for Ethiopian New Year (Meskerem 1 is usually Sep 11)
  if (gMonth === 8 && gDay < 11) {
    eYear -= 1;
    eMonthIndex = 12; // Pagume
  } else if (gMonth < 8) {
    // Before September
    if (gMonth === 0) eYear = gYear - 8; 
  }

  // Format: "Meskerem 12, 2016"
  return `${ETHIOPIAN_MONTHS[eMonthIndex]} ${eDay}, ${eYear}`;
};