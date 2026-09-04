/**
 * Format numerical amounts to Indian Rupees (INR)
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Format ISO date string to human-readable date
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Determine attendance status badge based on percentage
 */
export function getAttendanceBadge(percentage) {
  const num = Number(percentage);
  if (isNaN(num)) return { label: 'Unknown', className: 'badge-gray' };
  if (num >= 85) return { label: 'Good', className: 'badge-success' };
  if (num >= 75) return { label: 'Satisfactory', className: 'badge-info' };
  if (num >= 65) return { label: 'Warning', className: 'badge-warning' };
  return { label: 'Critical', className: 'badge-danger' };
}

/**
 * Determine fee status badge
 */
export function getFeeBadge(status) {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return { label: 'PAID', className: 'badge-success' };
    case 'PARTIAL':
      return { label: 'PARTIAL', className: 'badge-warning' };
    case 'PENDING':
      return { label: 'PENDING', className: 'badge-danger' };
    default:
      return { label: status || 'UNKNOWN', className: 'badge-gray' };
  }
}

/**
 * Determine grade badge styling
 */
export function getGradeBadge(grade) {
  switch (grade?.toUpperCase()) {
    case 'A+':
    case 'A':
      return { label: grade, className: 'badge-success' };
    case 'B+':
    case 'B':
      return { label: grade, className: 'badge-info' };
    case 'C':
    case 'D':
      return { label: grade, className: 'badge-warning' };
    case 'F':
      return { label: grade, className: 'badge-danger' };
    default:
      return { label: grade || 'N/A', className: 'badge-gray' };
  }
}
