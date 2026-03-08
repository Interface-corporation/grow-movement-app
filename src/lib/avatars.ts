import avatarFemale from '@/assets/avatar-female.png';
import avatarMale from '@/assets/avatar-male.png';
import avatarNeutral from '@/assets/avatar-neutral.png';

export function getAvatarByGender(gender?: string | null): string {
  if (!gender) return avatarNeutral;
  const g = gender.toLowerCase();
  if (g === 'female') return avatarFemale;
  if (g === 'male') return avatarMale;
  return avatarNeutral;
}

export function getProfilePhoto(photoUrl?: string | null, gender?: string | null): string {
  if (photoUrl && photoUrl.trim()) return photoUrl;
  return getAvatarByGender(gender);
}

/**
 * Converts YouTube or Google Drive share links into embeddable URLs.
 * Returns null if the URL is not recognized.
 */
export function getVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;

  // YouTube: watch, embed, or short link
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Google Drive: /file/d/FILE_ID/... → preview embed
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

  return null;
}
