// utils/departmentMapper.js
import { rawDepartments } from './department';

// API departments ni rawDepartments bilan birlashtirish
export const enrichDepartmentsWithLocalData = (apiDepartments) => {
  if (!Array.isArray(apiDepartments)) return [];
  
  return apiDepartments.map(apiDept => {
    // rawDepartments dan avatar va boshqa ma'lumotlarni topish
    const localDept = rawDepartments.find(local => local.id === apiDept.id);
    
    return {
      id: apiDept.id,
      name: apiDept.name,
      avatar: localDept?.avatar || localDept?.photo || null,
      color: localDept?.color || null,
      ...localDept // boshqa ma'lumotlar ham kerak bo'lsa
    };
  });
};

// Transform function yangilash
export const transformApiEventToFrontend = (apiEvent) => {
  return {
    id: apiEvent.id.toString(),
    title: apiEvent.title,
    description: apiEvent.description,
    date: new Date(apiEvent.event_time),
    image: apiEvent.image,
    file: apiEvent.file,
    departments: enrichDepartmentsWithLocalData(apiEvent.departments), // enriched data
    department: enrichDepartmentsWithLocalData(apiEvent.departments), // backward compatibility
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
  
  if (Array.isArray(frontendEvent.department)) {
    departmentIds = frontendEvent.department.map(dept => dept.id);
  } else if (Array.isArray(frontendEvent.departments)) {
    departmentIds = frontendEvent.departments.map(dept => dept.id);
  } else if (frontendEvent.department?.id) {
    departmentIds = [frontendEvent.department.id];
  }

  return {
    title: frontendEvent.title,
    description: frontendEvent.description || '',
    event_time: frontendEvent.date instanceof Date 
      ? frontendEvent.date.toISOString() 
      : new Date(frontendEvent.date).toISOString(),
    notification_time: mapNotificationStringToMinutes(frontendEvent.notification),
    departments: departmentIds, // API faqat ID larni kutadi
    link: frontendEvent.link || '',
    view_options: frontendEvent.viewOption || 'private'
  };
};