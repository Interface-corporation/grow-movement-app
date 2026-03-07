export interface Entrepreneur {
  id: string;
  name: string;
  photo: string;
  businessName: string;
  country: string;
  sector: string;
  stage: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  pitchSummary: string;
  businessDescription: string;
  fundingNeeds: string;
  coachingNeeds: string;
  revenue: string;
  yearFounded: number;
  teamSize: number;
  status: 'Pending' | 'Admitted' | 'Matched' | 'Alumni' | 'Rejected';
  programId?: string;
}

export const sectors = [
  'Agriculture', 'Technology', 'Healthcare', 'Education', 'Finance',
  'Clean Energy', 'E-commerce', 'Manufacturing', 'Tourism', 'Creative Arts',
  'Food & Beverage', 'Real Estate', 'Transportation & Logistics', 'Media & Entertainment',
  'Fashion & Textiles', 'Mining & Resources', 'Water & Sanitation', 'Telecoms',
  'Construction', 'Consulting & Professional Services', 'Other',
];

export const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo (DRC)', 'Congo (Republic)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
  'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

export const stages = [
  'Ideation Stage',
  'Early Stage',
  'Growth Stage',
  'Scale-up Stage',
];

export const qualifications = [
  'No Formal Education',
  'Primary School Certificate',
  'Secondary School Certificate / O-Level',
  'High School Diploma / A-Level',
  'Vocational / Technical Certificate',
  'Diploma',
  'Associate Degree',
  "Bachelor's Degree",
  'Postgraduate Diploma',
  "Master's Degree",
  'Doctorate / PhD',
  'Professional Certification (e.g. CPA, PMP)',
  'Other',
];

export const socialMediaPlatforms = [
  'Facebook', 'Instagram', 'Twitter / X', 'LinkedIn', 'TikTok',
  'YouTube', 'Pinterest', 'Snapchat', 'WhatsApp Business', 'Telegram', 'Other',
];

export const workTypes = ['Full Time', 'Part Time'];

export const helpAreas = [
  'Business Strategy', 'Financial Management', 'Marketing & Sales',
  'Operations & Logistics', 'Human Resources', 'Technology & Digital',
  'Legal & Compliance', 'Fundraising & Investment', 'Product Development',
  'Leadership & Management', 'Exporting & International Trade', 'Other',
];

export const mockEntrepreneurs: Entrepreneur[] = [
  {
    id: '1', name: 'Amina Uwimana',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    businessName: 'AgroFresh Rwanda', country: 'Rwanda', sector: 'Agriculture', stage: 'Growth Stage',
    gender: 'Female',
    pitchSummary: 'Revolutionizing fresh produce distribution with cold-chain logistics for smallholder farmers.',
    businessDescription: 'AgroFresh Rwanda connects smallholder farmers to urban markets through an innovative cold-chain logistics network.',
    fundingNeeds: '$150,000', coachingNeeds: 'Supply chain optimization', revenue: '$85,000/year',
    yearFounded: 2021, teamSize: 12, status: 'Admitted',
  },
  {
    id: '2', name: 'Kwame Asante',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    businessName: 'EduTech Ghana', country: 'Ghana', sector: 'Education', stage: 'Early Stage',
    gender: 'Male',
    pitchSummary: 'Mobile-first learning platform bringing quality STEM education to underserved communities.',
    businessDescription: 'EduTech Ghana delivers interactive STEM curriculum through low-bandwidth mobile apps.',
    fundingNeeds: '$80,000', coachingNeeds: 'Product-market fit validation', revenue: '$25,000/year',
    yearFounded: 2023, teamSize: 5, status: 'Admitted',
  },
];
