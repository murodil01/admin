import { format } from "date-fns";

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


// export const formatMonth = (date) => {
//   return date.toLocaleDateString('en-US', {
//     month: 'long',
//     year: 'numeric',
//   });
// };

export const formatMonth = (date) => {
  return format(date, "MMMM, yyyy"); // 🔥 Bu "September, 2025" formatda beradi
};

export const toLocalDateInputValue = (date) => {
  if (!date) return '';
  const localDate = new Date(date);
  // Local vaqt zonasida format qilish
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const fromLocalDateInputValue = (dateString) => {
  if (!dateString) return new Date();
  
  // Local vaqt zonasida Date yaratish (UTC emas!)
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month 0-indexed
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

export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};




