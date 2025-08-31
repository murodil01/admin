// utils/dateUtils.js
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
  
  export const toApiDateString = (date) => {
    if (!date) return '';
    
    // Local vaqt zonasida ISO string yaratish
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  
  // Debugging uchun
  export const debugDate = (date, label = 'Date') => {
    console.log(`${label}:`, {
      original: date,
      toISOString: date.toISOString(),
      toLocaleDateString: date.toLocaleDateString(),
      getTimezoneOffset: date.getTimezoneOffset(),
      toString: date.toString()
    });
  };