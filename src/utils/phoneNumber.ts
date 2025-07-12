// Phone number utilities for Kenyan numbers and PesaPal integration

export const formatPhoneNumber = (input: string): string => {
  // Remove all non-digit characters
  const cleaned = input.replace(/\D/g, '');
  
  // If it starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  
  // If it starts with +254, remove the +
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // If it's 9 digits (local format), add 254
  if (cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  // If it's 10 digits and starts with 7, add 254
  if (cleaned.length === 10 && cleaned.startsWith('7')) {
    return '254' + cleaned;
  }
  
  // If it's already in international format, return as is
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // Default: assume it's a local number and add 254
  return '254' + cleaned;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatPhoneNumber(phoneNumber);
  
  // Must be exactly 12 digits starting with 254
  if (!/^254\d{9}$/.test(formatted)) {
    return false;
  }
  
  // Must start with 2547 (Kenyan mobile numbers)
  if (!formatted.startsWith('2547')) {
    return false;
  }
  
  return true;
};

export const getPhoneNumberError = (phoneNumber: string): string | null => {
  if (!phoneNumber) {
    return 'Phone number is required';
  }
  
  const formatted = formatPhoneNumber(phoneNumber);
  
  if (!/^254\d{9}$/.test(formatted)) {
    return 'Phone number must be 12 digits (including country code)';
  }
  
  if (!formatted.startsWith('2547')) {
    return 'Phone number must be a valid Kenyan mobile number';
  }
  
  return null;
};

// Common Kenyan phone number formats
export const phoneNumberExamples = [
  '0700000000',  // Local format
  '700000000',   // Local format without 0
  '254700000000', // International format
  '+254700000000' // International format with +
]; 