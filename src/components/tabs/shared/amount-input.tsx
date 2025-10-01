"use client";

import { Input } from "@/components/ui/input";

interface AmountInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onMaxClick: () => void;
  tokenSymbol: string;
  balance?: string;
  disabled?: boolean;
  maxDisabled?: boolean;
}

export const AmountInput = ({
  label,
  placeholder,
  value,
  onChange,
  onMaxClick,
  tokenSymbol,
  balance,
  disabled = false,
  maxDisabled = false,
}: AmountInputProps) => {
  const handleAmountChange = (inputValue: string) => {
    // Prevent negative numbers and invalid characters
    const cleanValue = inputValue.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    const sanitizedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;
    
    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[var(--neon-green)] rounded-full"></div>
          <label className="text-sm font-medium text-white">
            {label}
          </label>
        </div>
        {balance && (
          <span className="text-sm text-white/70">
            {balance}
          </span>
        )}
      </div>
      
      <div className="relative">
        <Input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleAmountChange(e.target.value)}
          min="0"
          step="0.000001"
          disabled={disabled}
          className="bg-black/30 backdrop-blur-sm border-2 border-[var(--electric-blue)]/30 focus:border-[var(--electric-blue)] focus:ring-4 focus:ring-[var(--electric-blue)]/20 transition-all duration-300 rounded-lg shadow-md pr-24 sm:pr-28 text-white placeholder:text-white/50"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
          <button
            className="bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onMaxClick}
            disabled={maxDisabled}
          >
            Max
          </button>
          <span className="text-sm font-medium text-white">{tokenSymbol}</span>
        </div>
      </div>
    </div>
  );
};
