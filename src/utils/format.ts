const nprFormatter = new Intl.NumberFormat("en-NP", {
  maximumFractionDigits: 0,
});

export function formatNpr(amount: number, currency = "NPR"): string {
  const prefix = currency === "NPR" ? "रू " : `${currency} `;
  return `${prefix}${nprFormatter.format(amount)}`;
}

export function formatCompactNpr(amount: number, currency = "NPR"): string {
  if (amount >= 1000) {
    const compact = amount / 1000;
    const prefix = currency === "NPR" ? "रू " : `${currency} `;
    return `${prefix}${compact % 1 === 0 ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }
  return formatNpr(amount, currency);
}
