export const getMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
  
    const mondayStartAdjustment = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
  
    const weeks = [];
    let currentWeek = [];
  
    for (let i = 0; i < mondayStartAdjustment; i++) {
      currentWeek.push(null);
    }
  
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
  
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
  
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push(null);
    }
  
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
  
    return weeks;
  };
  
  export const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  export const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };
  