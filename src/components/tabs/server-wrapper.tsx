import { ReactNode } from "react";

interface ServerWrapperProps {
  children: ReactNode;
  className?: string;
}

export const ServerWrapper = ({ children, className = "" }: ServerWrapperProps) => {
  return (
    <div className={`server-component ${className}`}>
      {children}
    </div>
  );
};
