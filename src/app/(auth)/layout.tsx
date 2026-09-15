import Image from "next/image";
import { PHOTO_SRC } from "@/lib/photos";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ul-cream">
      <div className="relative flex h-60 shrink-0 items-center justify-center overflow-hidden">
        <Image src={PHOTO_SRC.CLUB_INTERIOR} alt="" fill className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(30,50,40,.55) 0%, rgba(30,50,40,.9) 100%)" }}
        />
        <div className="relative flex flex-col items-center px-8">
          <Image src="/brand/logo-cream.png" alt="Urban Links Golf Club" width={78} height={78} priority />
          <div className="mt-4 font-heading text-[9.5px] font-semibold tracking-[0.3em] text-ul-gold">
            FORT THOMAS, KENTUCKY
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center px-6 py-10">{children}</div>
    </div>
  );
}
