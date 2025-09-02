// utils/calendarDataTransformer.js
import { getDepartments } from '../api/services/departmentService';
import { toApiDateString } from './dateUtils';
// Cache for departments to avoid repeated API calls
let departmentsCache = null;

// Fetch departments and cache them
export const fetchAndCacheDepartments = async () => {
  if (!departmentsCache) {
    try {
      departmentsCache = await getDepartments();
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return [];
    }
  }
  return departmentsCache;
};

// Clear cache when needed (e.g., after department updates)
export const clearDepartmentsCache = () => {
  departmentsCache = null;
};

// API departments ni enriched data bilan birlashtirish
export const enrichDepartmentsWithLocalData = (apiDepartments, allDepartments = []) => {
  if (!Array.isArray(apiDepartments)) return [];
  
  return apiDepartments.map(apiDept => {
    // allDepartments dan avatar va boshqa ma'lumotlarni topish
    const localDept = allDepartments.find(local => local.id === apiDept.id);
    
    return {
      id: apiDept.id,
      name: apiDept.name,
      avatar: apiDept.photo || '/default-avatar.png', // API dan photo field
      color: localDept?.color || '#gray-500',
      description: apiDept.description,
      head: apiDept.head,
      ...localDept // boshqa ma'lumotlar ham kerak bo'lsa
    };
  });
};

// Transform function yangilash
export const transformApiEventToFrontend = async (apiEvent) => {
  const allDepartments = await fetchAndCacheDepartments();
  
  return {
    id: apiEvent.id.toString(),
    title: apiEvent.title,
    description: apiEvent.description,
    date: new Date(apiEvent.event_time),
    image: apiEvent.image,
    file: apiEvent.file,
    departments: enrichDepartmentsWithLocalData(apiEvent.departments, allDepartments),
    department: enrichDepartmentsWithLocalData(apiEvent.departments, allDepartments), // backward compatibility
    link: apiEvent.link,
    notification: mapNotificationTimeToString(apiEvent.notification_time),
    viewOption: apiEvent.view_options,
    canEdit: apiEvent.can_edit,
    canDelete: apiEvent.can_delete,
    createdBy: apiEvent.created_by_name,
    createdAt: new Date(apiEvent.created_at),
    isActive: apiEvent.is_active
  };
};

// Notification time mapping
const mapNotificationTimeToString = (minutes) => {
  const notificationMap = {
    0: 'No notification',
    5: '5 minutes before', 
    15: '15 minutes before',
    30: '30 minutes before',
    60: '1 hour before',
    1440: '1 day before'
  };
  return notificationMap[minutes] || 'Select Time';
};

const mapNotificationStringToMinutes = (notificationString) => {
  const timeMap = {
    'No notification': 0,
    '5 minutes before': 5,
    '15 minutes before': 15, 
    '30 minutes before': 30,
    '1 hour before': 60,
    '1 day before': 1440,
    'Select Time': 0
  };
  return timeMap[notificationString] || 0;
};

// Frontend data ni API format ga o'tkazish
export const transformFrontendEventToApi = (frontendEvent) => {
  let departmentIds = [];
  
  if (Array.isArray(frontendEvent.departments)) {
    departmentIds = frontendEvent.departments.map(dept => dept.id);
  } else if (Array.isArray(frontendEvent.department)) {
    departmentIds = frontendEvent.department.map(dept => dept.id);
  } else if (frontendEvent.department?.id) {
    departmentIds = [frontendEvent.department.id];
  }

   // Agar department tanlanmagan bo'lsa, kamida bitta ID qo'yish
   if (departmentIds.length === 0) {
    console.warn('No departments selected for event');
  }

   // View option ni to'g'ri formatga o'tkazish
   let viewOption = 'private'; // default
   if (frontendEvent.viewOption) {
     switch (frontendEvent.viewOption.toLowerCase()) {
       case 'public':
         viewOption = 'public';
         break;
       case 'private':
         viewOption = 'private';
         break;
       case 'chosen':
         viewOption = 'chosen';
         break;
       default:
         viewOption = 'chosen';
     }
   }

  return {
    title: frontendEvent.title,
    description: frontendEvent.description || '',
    event_time: toApiDateString(frontendEvent.date),
    notification_time: mapNotificationStringToMinutes(frontendEvent.notification),
    department_ids: departmentIds,
    link: frontendEvent.link || '',
    view_options: viewOption || '',
    is_active: frontendEvent.isActive !== undefined ? frontendEvent.isActive : true // Default true
  };
};