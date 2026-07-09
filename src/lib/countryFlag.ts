// Maps common country names → ISO alpha-2 → emoji flag.
// Covers the countries Grow Movement operates in, plus common partner nations.
const NAME_TO_ISO: Record<string, string> = {
  rwanda: 'RW', kenya: 'KE', uganda: 'UG', tanzania: 'TZ', 'united republic of tanzania': 'TZ',
  nigeria: 'NG', ghana: 'GH', ethiopia: 'ET', zambia: 'ZM', malawi: 'MW',
  'south africa': 'ZA', 'ivory coast': 'CI', "côte d'ivoire": 'CI', "cote d'ivoire": 'CI',
  cameroon: 'CM', senegal: 'SN', 'sierra leone': 'SL', liberia: 'LR',
  zimbabwe: 'ZW', mozambique: 'MZ', burundi: 'BI', 'democratic republic of congo': 'CD', drc: 'CD',
  benin: 'BJ', togo: 'TG', mali: 'ML', 'burkina faso': 'BF', mauritius: 'MU',
  madagascar: 'MG', somalia: 'SO', 'south sudan': 'SS', sudan: 'SD',
  egypt: 'EG', morocco: 'MA', tunisia: 'TN', algeria: 'DZ',
  india: 'IN', bangladesh: 'BD', pakistan: 'PK', nepal: 'NP', 'sri lanka': 'LK',
  cambodia: 'KH', indonesia: 'ID', philippines: 'PH', vietnam: 'VN', 'viet nam': 'VN',
  myanmar: 'MM', laos: 'LA', thailand: 'TH', malaysia: 'MY',
  'united kingdom': 'GB', uk: 'GB', 'great britain': 'GB', england: 'GB',
  'united states': 'US', usa: 'US', 'united states of america': 'US',
  canada: 'CA', australia: 'AU', france: 'FR', germany: 'DE', spain: 'ES', italy: 'IT',
  netherlands: 'NL', belgium: 'BE', ireland: 'IE', switzerland: 'CH', sweden: 'SE',
  norway: 'NO', denmark: 'DK', finland: 'FI', portugal: 'PT',
};

function isoToFlag(iso: string): string {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

export function countryFlag(country?: string | null): string {
  if (!country) return '🌍';
  const iso = NAME_TO_ISO[country.trim().toLowerCase()];
  return iso ? isoToFlag(iso) : '🌍';
}
