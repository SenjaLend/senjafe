import { ProfileLayout } from "@/components/profile/profile-layout";
import { ProfileHeader } from "@/components/profile/profile-header";
import { WalletConnectionCard } from "@/components/card/wallet-connection-card";
import { UserPortfolioWrapper } from "@/components/profile/user-portfolio-wrapper";

export default function ProfilePage() {
  return (
    <ProfileLayout>
      <ProfileHeader />
      <WalletConnectionCard />
      <UserPortfolioWrapper />
    </ProfileLayout>
  );
}
