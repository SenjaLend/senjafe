import { getTransactionTypeLabel } from "./utils";
import { Transaction } from "./types";

interface TransactionTypeBadgeProps {
  type: Transaction['type'];
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  const label = getTransactionTypeLabel(type);

  return (
    <span className="text-gray-800 text-sm">{label}</span>
  );
}