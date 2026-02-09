export const USER_TYPES = {
  FARMER: 'farmer',
  LABOUR: 'labour',
};

export const JOB_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  IN_PROGRESS: 'in_progress',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const CROP_TYPES = [
  'Rice',
  'Wheat',
  'Cotton',
  'Sugarcane',
  'Maize',
  'Pulses',
  'Vegetables',
  'Fruits',
  'Others',
];

export const SOIL_TYPES = [
  'Alluvial',
  'Black',
  'Red',
  'Laterite',
  'Desert',
  'Mountain',
];

export const SEASONS = [
  'Kharif',
  'Rabi',
  'Zaid',
];

// Helper function to format location object to string
export const formatLocation = (location) => {
  if (!location) return 'N/A';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    const parts = [];
    if (location.village) parts.push(location.village);
    if (location.district) parts.push(location.district);
    if (location.state) parts.push(location.state);
    return parts.join(', ') || 'N/A';
  }
  
  return 'N/A';
};
