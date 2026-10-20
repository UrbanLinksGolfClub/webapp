import Image from "next/image";
import { PHOTO_SRC } from "@/lib/photos";

/** Renders an event's photo: the admin-uploaded one if there is one,
 * otherwise the stock photoKey fallback. An uploaded photo is stored as a
 * data: URI (see lib/actions/event-actions.ts), which next/image doesn't
 * optimize the same way as a static asset, so that case uses a plain
 * <img> sized to fill its (already `relative`) parent, matching how the
 * stock-photo <Image fill> usages behave.
 *
 * Uploaded photos deliberately use object-contain, not the object-cover
 * passed in for the stock-photo case: our own stock photos are shot/cropped
 * specifically for these wide banner proportions, but an arbitrary admin
 * upload (e.g. a square logo) would get aggressively cropped by cover --
 * fit-without-cropping is the safer default when we don't control the
 * source image's aspect ratio. */
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
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-ul-green-dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={alt} className="h-full w-full object-contain" />
      </div>
    );
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
