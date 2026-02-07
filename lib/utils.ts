export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDistance(miles: number): string {
  return `${miles.toFixed(1)} mi`;
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function calculateDriverEarnings(offerCents: number): number {
  return Math.floor(offerCents * 0.85);
}

export function calculatePlatformFee(offerCents: number): number {
  return offerCents - calculateDriverEarnings(offerCents);
}

export function calculatePerMileRate(
  offerCents: number,
  miles: number
): string {
  if (miles <= 0) return "$0.00";
  return formatCents(Math.floor(offerCents / miles));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: "Open",
    ACCEPTED: "Accepted",
    PICKED_UP: "Picked Up",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: "text-accent",
    ACCEPTED: "text-warning",
    PICKED_UP: "text-warning",
    DELIVERED: "text-success",
    CANCELLED: "text-danger",
    EXPIRED: "text-muted",
  };
  return colors[status] || "text-muted";
}
