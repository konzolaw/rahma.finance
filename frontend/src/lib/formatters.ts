/**
 * Utility functions for formatting financial and date values
 */

/**
 * Format amount in Kenyan Shillings (Ksh)
 * Handles null, undefined, negative values, and Decimal strings from API
 *
 * @param amount - Amount as number, string, or null/undefined
 * @returns Formatted string like "Ksh 15,000" or "Ksh -5,000"
 */
export const formatKsh = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return 'Ksh 0';
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle NaN
  if (isNaN(numAmount)) {
    return 'Ksh 0';
  }

  // Format with thousand separators
  const formatted = Math.abs(numAmount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const sign = numAmount < 0 ? '-' : '';
  return `${sign}Ksh ${formatted}`;
};

/**
 * Format amount with 2 decimal places
 * Useful for showing detailed financial values
 *
 * @param amount - Amount as number, string, or null/undefined
 * @returns Formatted string like "Ksh 15,000.50"
 */
export const formatKshDetailed = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return 'Ksh 0.00';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Ksh 0.00';
  }

  const parts = Math.abs(numAmount).toFixed(2).split('.');
  const integerPart = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1] || '00';

  const sign = numAmount < 0 ? '-' : '';
  return `${sign}Ksh ${integerPart}.${decimalPart}`;
};

/**
 * Format date string to DD/MM/YYYY format
 * Handles ISO date strings from API (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
 *
 * @param dateStr - ISO date string or Date object
 * @returns Formatted date like "06/05/2026"
 */
export const formatDate = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date as ISO string (YYYY-MM-DD)
 * Useful for sending to API
 *
 * @param date - Date object or ISO string
 * @returns ISO date string like "2026-05-06"
 */
export const formatDateISO = (date: Date | string): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0] || '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0] || '';
  }
};

/**
 * Format percentage value
 * Handles decimal strings from API and displays with 1 decimal place
 *
 * @param value - Percentage value as number, string, or null/undefined
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "47.3%" or "100%"
 */
export const formatPercent = (
  value: number | string | null | undefined,
  decimals: number = 1,
): string => {
  if (value === null || value === undefined) {
    return '0%';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0%';
  }

  const formatted = numValue.toFixed(decimals);

  // Remove trailing zeros after decimal if not needed
  if (decimals > 0 && formatted.includes('.')) {
    return `${parseFloat(formatted)}%`;
  }

  return `${formatted}%`;
};

/**
 * Format day of week from date
 * Returns short format like "Mon", "Tue", etc.
 *
 * @param dateStr - ISO date string or Date object
 * @returns Short day name like "Mon"
 */
export const formatDayOfWeek = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      return 'Unknown';
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()] || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

/**
 * Format full day name from date
 * Returns full format like "Monday", "Tuesday", etc.
 *
 * @param dateStr - ISO date string or Date object
 * @returns Full day name like "Monday"
 */
export const formatDayOfWeekFull = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      return 'Unknown';
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()] || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

/**
 * Format month and year from date
 * Returns format like "May 2026"
 *
 * @param dateStr - ISO date string or Date object
 * @returns Month year like "May 2026"
 */
export const formatMonthYear = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      return 'Unknown';
    }

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return 'Unknown';
  }
};

/**
 * Format day name short (e.g., "Mon")
 */
export const formatDayShort = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '...';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()] || '...';
  } catch {
    return '...';
  }
};

/**
 * Format month name short (e.g., "Oct")
 */
export const formatMonthShort = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '...';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] || '...';
  } catch {
    return '...';
  }
};

/**
 * Format time from ISO datetime string
 * Returns format like "14:30"
 *
 * @param dateStr - ISO datetime string
 * @returns Time like "14:30"
 */
export const formatTime = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      return 'Unknown';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch {
    return 'Unknown';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 * Useful for activity feeds and recent transactions
 *
 * @param dateStr - ISO date string or Date object
 * @returns Relative time like "2 days ago"
 */
export const formatRelativeTime = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      return 'Unknown';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  } catch {
    return 'Unknown';
  }
};

/**
 * Format number with thousand separators
 * Useful for quantities and counts
 *
 * @param value - Number to format
 * @returns Formatted number like "1,000"
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) {
    return '0';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0';
  }

  return numValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
