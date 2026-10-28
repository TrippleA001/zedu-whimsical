import Image from "next/image";

/**
 * The Zedu bell. One mark, used everywhere the product signs itself, so the
 * nav, the studio rail and the footer all carry the real logo rather than a
 * stand-in. Size it from CSS on the class you pass in.
 */
export default function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/zedu-mark.png"
      alt=""
      aria-hidden="true"
      width={160}
      height={200}
      priority={priority}
      draggable={false}
      className={className}
    />
  );
}
