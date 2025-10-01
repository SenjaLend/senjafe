import Image from "next/image";

export function ProfileHeader() {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--electric-blue)] via-[var(--soft-teal)] to-[var(--deep-mid-blue)] rounded-full blur-xl opacity-30 scale-110"></div>
        <div className="relative inline-flex items-center justify-center overflow-hidden">
          <Image
            src="/beary/beary.png"
            alt="Profile Picture"
            width={128}
            height={128}
            className="object-cover rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-white"
            priority
          />
        </div>
      </div>
    </div>
  );
}
