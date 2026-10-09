export const toBengaliNumber = (num) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => bengaliDigits[digit] || digit).join('');
};

export const getPujoText = () => {
  const today = new Date();
  
  // Set to midnight to avoid time-of-day offset issues
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Note: Month is 0-indexed in JS Date. October is 9.
  const dates = {
    panchami: new Date(2026, 9, 16),
    shashthi: new Date(2026, 9, 17),
    saptami: new Date(2026, 9, 18),
    ashtami: new Date(2026, 9, 19),
    navami: new Date(2026, 9, 20),
    dashami: new Date(2026, 9, 21),
  };

  const diffTime = dates.panchami.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `অপেক্ষার আর মাত্র ${toBengaliNumber(diffDays)} দিন`;
  }

  // If we are on or after panchami, check exact dates
  if (current.getTime() === dates.panchami.getTime()) return "মহা পঞ্চমী";
  if (current.getTime() === dates.shashthi.getTime()) return "মহাষষ্ঠী";
  if (current.getTime() === dates.saptami.getTime()) return "মহাসপ্তমী";
  if (current.getTime() === dates.ashtami.getTime()) return "মহাষ্টমী";
  if (current.getTime() === dates.navami.getTime()) return "মহানবমী";
  if (current.getTime() === dates.dashami.getTime()) return "বিজয়া দশমী";

  // Default after pujo
  return "শুভ বিজয়া"; 
};
