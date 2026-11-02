import Image from "next/image";
import { Card, Link21, Lock1, Setting2, User } from "iconsax-reactjs";

const satellite =
  "absolute flex size-[38px] items-center justify-center rounded-full border border-border bg-background text-brand shadow-panel [&_svg]:size-[18px]";

/** Decorative dotted banner with orbiting icons in the top-right of Settings (680 × 152). */
export function SettingsArt() {
  return (
    <div aria-hidden className="pointer-events-none absolute top-0 right-[25px] hidden h-[152px] w-[680px] lg:block">
      <Image src="/images/settings/header-art.svg" alt="" width={680} height={152} unoptimized priority />
      <span className="absolute top-12 left-[560px] flex size-14 items-center justify-center rounded-[28px] bg-brand text-primary-foreground shadow-badge [&_svg]:size-[26px]">
        <Setting2 />
      </span>
      <span className={`${satellite} top-[26px] left-[483px]`}>
        <User />
      </span>
      <span className={`${satellite} top-[89px] left-[441px]`}>
        <Lock1 />
      </span>
      <span className={`${satellite} top-[21px] left-[401px]`}>
        <Link21 />
      </span>
      <span className={`${satellite} top-[87px] left-[359px]`}>
        <Card />
      </span>
    </div>
  );
}
