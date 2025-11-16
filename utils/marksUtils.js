// utils/marksUtils.js
function calcTotals(subjects) {
  let totalFull = 0, totalObtained = 0;
  for (const s of subjects) {
    totalFull += (s.fullMarks || 100);
    totalObtained += Number(s.obtainedMarks || 0);
  }
  const percentage = totalFull ? (totalObtained / totalFull) * 100 : 0;
  return { totalFull, totalObtained, percentage };
}

function calcGrade(percentage) {
  if (percentage >= 80) return { grade: 'A+', gpa: 5.0 };
  if (percentage >= 70) return { grade: 'A', gpa: 4.0 };
  if (percentage >= 60) return { grade: 'A-', gpa: 3.5 };
  if (percentage >= 50) return { grade: 'B', gpa: 3.0 };
  if (percentage >= 40) return { grade: 'C', gpa: 2.0 };
  return { grade: 'F', gpa: 0.0 };
}

module.exports = { calcTotals, calcGrade };
