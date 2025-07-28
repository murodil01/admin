export const getMonthData = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const mondayStartAdjustment = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  const weeks = [];
  let currentWeek = [];

  // 🔁 Add previous month's trailing days
  for (let i = 0; i < mondayStartAdjustment; i++) {
    const prevDate = new Date(year, month, -mondayStartAdjustment + i + 1);
    currentWeek.push(prevDate); // ✅ real date
  }

  // 🔁 Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // 🔁 Add next month's leading days
  let nextDay = 1;
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push(new Date(year, month + 1, nextDay));
    nextDay++;
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
};


export const formatMonth = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const toLocalDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 1-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const isSameMonth = (date1, date2) => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

