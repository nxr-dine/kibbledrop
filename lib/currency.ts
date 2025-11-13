/**
 * Currency formatting utilities for South African Rands (ZAR)
 */

/**
 * Format a price in ZAR currency
 * @param amount - The amount to format (in ZAR)
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

  const formatter = new Intl.NumberFormat("en-ZA", {
    style: showSymbol ? "currency" : "decimal",
    currency: "ZAR",
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const formatted = formatter.format(amount);

  // If showing code, append it
  if (showCode && !showSymbol) {
    return `${formatted} ZAR`;
  }

  return formatted;
}

/**
 * Format a price range in ZAR
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
 * Parse a ZAR string back to number
 * @param zarString - String like "R 123.45" or "123.45"
 * @returns Parsed number or null if invalid
 */
export function parseZAR(zarString: string): number | null {
  // Remove currency symbols and whitespace
  const cleanString = zarString.replace(/[R\s,]/g, "");
  const number = parseFloat(cleanString);

  return isNaN(number) ? null : number;
}

/**
 * Convert USD prices to ZAR (rough conversion - should be updated with real exchange rates)
 * @param usdAmount - Amount in USD
 * @param exchangeRate - Current USD to ZAR exchange rate (default: 18.5)
 * @returns Amount in ZAR
 */
export function convertUSDToZAR(
  usdAmount: number,
  exchangeRate: number = 18.5
): number {
  return Math.round(usdAmount * exchangeRate * 100) / 100; // Round to 2 decimal places
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
