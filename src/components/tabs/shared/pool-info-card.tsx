import { Card } from "@/components/ui/card";
import Image from "next/image";

interface PoolInfoCardProps {
  collateralToken: {
    symbol: string;
    logo: string;
  };
  borrowToken: {
    symbol: string;
    logo: string;
  };
  apy?: string;
  ltv: string;
  apyLabel?: string;
  showApy?: boolean;
}

export const PoolInfoCard = ({ 
  collateralToken, 
  borrowToken, 
  apy, 
  ltv,
  apyLabel = "APY",
  showApy = true
}: PoolInfoCardProps) => {
  return (
    <Card className="p-4 bg-[var(--electric-blue)]/10 backdrop-blur-xl border-2 border-[var(--electric-blue)]/30 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-white/70 mb-1">Collateral Token:</p>
          <div className="flex items-center space-x-2">
            <Image
              src={collateralToken.logo}
              alt={collateralToken.symbol}
              width={20}
              height={20}
              className="rounded-full"
            />
            <p className="font-semibold text-white">{collateralToken.symbol}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-white/70 mb-1">Borrow Token:</p>
          <div className="flex items-center space-x-2">
            <Image
              src={borrowToken.logo}
              alt={borrowToken.symbol}
              width={20}
              height={20}
              className="rounded-full"
            />
            <p className="font-semibold text-white">{borrowToken.symbol}</p>
          </div>
        </div>
        {showApy && (
          <div>
            <p className="text-sm text-white/70 mb-1">{apyLabel}:</p>
            <p className="font-semibold text-[var(--neon-green)]">{apy}%</p>
          </div>
        )}
        <div>
          <p className="text-sm text-white/70 mb-1">LTV:</p>
          <p className="font-semibold text-cyan-300">{ltv}%</p>
        </div>
      </div>
    </Card>
  );
};
