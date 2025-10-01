import { RefreshCwIcon } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <RefreshCwIcon 
      className={`${sizeClasses[size]} animate-spin text-blue-600 ${className}`} 
    />
  );
}

// Inline spinner untuk mengganti teks "Loader"
export function InlineSpinner({ size = "sm", className = "" }: SpinnerProps) {
  return (
    <span className="inline-flex items-center">
      <Spinner size={size} className={className} />
    </span>
  );
}
