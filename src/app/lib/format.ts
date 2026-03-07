const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function parseValidDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatDateTime(value: string | null | undefined, fallback = "-") {
  const date = parseValidDate(value);
  return date ? dateTimeFormatter.format(date) : fallback;
}

export function formatDate(value: string | null | undefined, fallback = "-") {
  const date = parseValidDate(value);
  return date ? dateFormatter.format(date) : fallback;
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value.toFixed(fractionDigits)}%`;
}
