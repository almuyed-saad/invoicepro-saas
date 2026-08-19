import { STATUS_LABELS } from "@/lib/invoice";

export default function StatusBadge({ status }: { status: keyof typeof STATUS_LABELS }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>;
}
