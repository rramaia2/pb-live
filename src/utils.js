export const calculatePercentage = (allocated, totalBudget) => {
    return ((allocated / totalBudget) * 100).toFixed(2);
  }
  