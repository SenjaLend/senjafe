interface TransactionFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function TransactionFilter({ selectedType, onTypeChange }: TransactionFilterProps) {
  const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'supply_liquidity', label: 'Supply Liquidity' },
    { value: 'withdraw_liquidity', label: 'Withdraw Liquidity' },
    { value: 'borrow_debt_crosschain', label: 'Borrow' },
    { value: 'supply_collateral', label: 'Supply Collateral' },
  ];

  return (
    <div className="w-full bg-[var(--electric-blue)]/10 backdrop-blur-sm rounded-2xl p-3 border border-[var(--electric-blue)]/20 mb-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onTypeChange(option.value)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              selectedType === option.value
                ? 'bg-gradient-to-r from-[var(--electric-blue)] to-[var(--neon-green)] text-white'
                : 'bg-[#004488]/30 text-white hover:bg-[var(--electric-blue)]/30'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}