// Convert any video link (YouTube / Vimeo / Google Drive / direct file) into an
// embeddable iframe URL. Returns null when the input can't be parsed.
export function toEmbedUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!url) return null;

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`;

  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([A-Za-z0-9_-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;

  if (/^https?:\/\//i.test(url)) return url;
  return null;
}

export const isDirectVideoFile = (url: string) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
