/**
 * Currency formatting utilities for US Dollars (USD)
 */

/**
 * Format a price in USD currency
 * @param amount - The amount to format (in USD)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatZAR(
  amount: number,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const formatter = new Intl.NumberFormat("en-US", {
    style: showSymbol ? "currency" : "decimal",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const formatted = formatter.format(amount);

  // If showing code, append it
  if (showCode && !showSymbol) {
    return `${formatted} USD`;
  }

  return formatted;
}

/**
 * Format a price range in USD
 * @param minAmount - Minimum amount
 * @param maxAmount - Maximum amount
 * @returns Formatted price range string
 */
export function formatZARRange(minAmount: number, maxAmount: number): string {
  if (minAmount === maxAmount) {
    return formatZAR(minAmount);
  }
  return `${formatZAR(minAmount)} - ${formatZAR(maxAmount)}`;
}

/**
 * Parse a USD string back to number
 * @param zarString - String like "$123.45" or "123.45"
 * @returns Parsed number or null if invalid
 */
export function parseZAR(zarString: string): number | null {
  // Remove currency symbols and whitespace
  const cleanString = zarString.replace(/[$\s,]/g, "");
  const number = parseFloat(cleanString);

  return isNaN(number) ? null : number;
}

/**
 * Convert ZAR prices to USD (rough conversion - should be updated with real exchange rates)
 * @param zarAmount - Amount in ZAR
 * @param exchangeRate - Current ZAR to USD exchange rate (default: 0.054)
 * @returns Amount in USD
 */
export function convertUSDToZAR(
  zarAmount: number,
  exchangeRate: number = 0.054
): number {
  return Math.round(zarAmount * exchangeRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get subscription frequency display text
 * @param frequency - Subscription frequency
 * @returns Human-readable frequency text
 */
export function getSubscriptionFrequencyText(frequency: string): string {
  switch (frequency.toLowerCase()) {
    case "weekly":
      return "per week";
    case "bi-weekly":
      return "every 2 weeks";
    case "tri-weekly":
      return "every 3 weeks";
    case "monthly":
      return "per month";
    default:
      return `per ${frequency}`;
  }
}
