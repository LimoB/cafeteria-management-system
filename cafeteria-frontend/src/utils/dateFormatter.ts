/**
 * Formats a date string into a human-readable format.
 * Examples: "Today, 2:30 PM", "Yesterday, 10:15 AM", or "Mar 21, 2026"
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '---';

  const date = new Date(dateString);
  const now = new Date();
  
  // Check if it's the same day
  const isToday = date.toDateString() === now.toDateString();
  
  // Check if it was yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  if (isToday) {
    return `Today, ${date.toLocaleTimeString('en-KE', timeOptions)}`;
  }

  if (isYesterday) {
    return `Yesterday, ${date.toLocaleTimeString('en-KE', timeOptions)}`;
  }

  // Fallback for older dates
  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};