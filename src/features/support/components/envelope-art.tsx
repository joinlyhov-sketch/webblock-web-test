import Image from "next/image";
import { Headphone, Send2 } from "iconsax-reactjs";

const sparkle = "absolute flex items-center justify-center";

/** Hero illustration (Figma "Hero art", 380 x 187.5): letter, flight path, plane and support badge. */
export function EnvelopeArt({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className ?? "relative hidden h-[187.5px] w-[380px] shrink-0 lg:block"}>
      <Image
        src="/images/support/flight-path.svg"
        alt=""
        width={250}
        height={120}
        unoptimized
        className="absolute top-[30px] left-[110px]"
      />
      <Image
        src="/images/support/open-letter.svg"
        alt=""
        width={196}
        height={168.75}
        unoptimized
        className="absolute top-[31px] left-[7px] max-w-none"
      />
      <span className="absolute top-3.5 left-[316px] flex size-[52px] items-center justify-center rounded-[26px] bg-linear-to-br from-plane-from from-[14.286%] to-plane-to to-[85.714%] text-primary-foreground shadow-[0_8px_18px_rgb(47_107_196/0.35)]">
        <Send2 variant="Outline" className="size-[22px]" />
      </span>
      <span className="absolute top-[125.5px] left-[250px] flex rounded-3xl bg-background p-1.5 shadow-[0_8px_18px_rgb(60_120_207/0.16)]">
        <span className="flex size-9 items-center justify-center rounded-[18px] bg-brand-soft text-primary">
          <Headphone variant="Outline" className="size-5" />
        </span>
      </span>
      <Image
        src="/images/support/online.svg"
        alt=""
        width={11}
        height={11}
        unoptimized
        className="absolute top-[158.5px] left-[283px]"
      />
      <span className={`${sparkle} top-[14.34px] left-[205px] size-[11.314px]`}>
        <span className="size-2 -rotate-45 rounded-[2px] bg-primary/50" />
      </span>
      <span className={`${sparkle} top-[90.76px] left-[290px] size-[8.485px]`}>
        <span className="size-1.5 -rotate-45 rounded-[2px] bg-primary/35" />
      </span>
      <span className={`${sparkle} top-[153.26px] left-[175px] size-[8.485px]`}>
        <span className="size-1.5 -rotate-45 rounded-[2px] bg-primary/30" />
      </span>
    </div>
  );
}

/** "Message sent" illustration: open letter with the green success badge (Figma "Illustration"). */
export function SentArt() {
  return (
    <div aria-hidden className="bg-dots relative h-[170px] w-full overflow-clip bg-linear-to-b from-sent-from to-sent-to">
      <Image
        src="/images/support/open-letter-sent.svg"
        alt=""
        width={186.2}
        height={160.3}
        unoptimized
        className="absolute top-[19.7px] left-[calc(50%-93.1px)] max-w-none"
      />
      <span className="absolute top-[108px] left-1/2 ml-[41.25px] flex size-10 items-center justify-center rounded-[20px] border-3 border-background bg-success shadow-[0_6px_14px_rgb(60_120_207/0.2)]">
        <Image src="/images/support/check.svg" alt="" width={18} height={18} unoptimized />
      </span>
    </div>
  );
}
