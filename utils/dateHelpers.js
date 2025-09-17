// utils/dateHelpers.js
function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  const newMonth = d.getMonth() + months;
  const result = new Date(d.getFullYear(), newMonth, day);

  // handle month day overflow (e.g., Jan 31 + 1 month -> Feb 28/29)
  if (result.getDate() !== day) {
    // set to last day of previous month
    result.setDate(0);
  }
  return result;
}

function billingMonthsSince(startDate, toDate = new Date()) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = new Date(toDate);

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() >= start.getDate()) months += 1;
  return Math.max(0, months);
}

module.exports = { addMonths, billingMonthsSince };
