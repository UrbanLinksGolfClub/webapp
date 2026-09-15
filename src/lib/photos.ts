// Maps the PhotoKey enum to a static asset in public/photos.
// BAY_LOUNGE_WIDE, BAY_LOUNGE_FULL, CLUB_INTERIOR, LOUNGE, and SWING are real
// club photography. SIMULATOR, UNEEKOR_CAMERA, DATA_OVERLAY, and PEBBLE_BEACH
// are brand-gradient placeholders pending real photos at the same paths.
export const PHOTO_SRC: Record<string, string> = {
  BAY_LOUNGE_WIDE: "/photos/photo-bay-lounge-wide.jpg",
  BAY_LOUNGE_FULL: "/photos/photo-bay-lounge-full.jpg",
  CLUB_INTERIOR: "/photos/photo-club-interior.jpg",
  LOUNGE: "/photos/photo-lounge.jpg",
  SIMULATOR: "/photos/photo-simulator.jpg",
  UNEEKOR_CAMERA: "/photos/photo-uneekor-camera.jpg",
  DATA_OVERLAY: "/photos/photo-data-overlay.jpg",
  SWING: "/photos/photo-swing.jpg",
  PEBBLE_BEACH: "/photos/photo-pebble-beach.jpg",
};
