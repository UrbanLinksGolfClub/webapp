import Image from "next/image";
import { PHOTO_SRC } from "@/lib/photos";

/** Renders an event's photo: the admin-uploaded one if there is one,
 * otherwise the stock photoKey fallback. An uploaded photo is stored as a
 * data: URI (see lib/actions/event-actions.ts), which next/image doesn't
 * optimize the same way as a static asset, so that case uses a plain
 * <img> sized to fill its (already `relative`) parent, matching how the
 * stock-photo <Image fill> usages behave. */
export function EventPhoto({
  photoUrl,
  photoKey,
  alt = "",
  sizes,
  priority,
  className = "",
}: {
  photoUrl: string | null;
  photoKey: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  }

  return (
    <Image
      src={PHOTO_SRC[photoKey]}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
