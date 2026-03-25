/**
 * Formats a number into Kenyan Shillings (Ksh)
 * Usage: formatCurrency(180) -> Ksh 180
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('KES', 'Ksh'); // Replaces the ISO code with the local prefix
};