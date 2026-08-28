import { Doctor, Slot } from '../types';

export const SPECIALTIES = [
  'All Specialties',
  'Panchakarma',
  'Ayurvedic Dermatology',
  'Gut & Digestion',
  'Stress & Rasayana',
  'Women\'s Health',
  'Kayachikitsa (Internal Medicine)',
  'Joint & Spine Care',
];

export const CITIES = ['All Cities', 'Varanasi', 'Haridwar', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Kerala', 'Pune', 'Jaipur'];

const DOCTOR_PORTRAITS = [
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=500',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500',
  'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=500',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500',
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

let cachedDoctors: Doctor[] | null = null;

export function generateDoctors(count = 5000): Doctor[] {
  if (cachedDoctors && cachedDoctors.length === count) {
    return cachedDoctors;
  }

  const rand = seededRandom(42);

  const curatedDoctors: Doctor[] = [
    {
      id: 'doc_1',
      name: 'Dr. Anjali Verma, MD',
      nameHi: 'डॉ. अंजलि वर्मा, एमडी',
      specialty: 'Panchakarma',
      subSpecialties: ['Vamana & Virechana Detox', 'Shirodhara Stress Relief', 'Prakriti Pulse Diagnosis'],
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=500',
      rating: 4.9,
      ratingCount: 480,
      yearsExperience: 15,
      consultationFee: 799,
      languages: ['English', 'Hindi', 'Sanskrit'],
      city: 'Varanasi',
      clinicName: 'Amrutam Wellness Shala, Assi Ghat',
      about: 'Senior Ayurvedic Physician specializing in classical detoxification (Panchakarma), chronobiological dietetics, and metabolic rejuvenation. Practicing classical Ayurveda for over 15 years with thousands of successful chronic recovery cases.',
      verified: true,
      ccimRegNo: 'CCIM/UP/AYUR/8492',
      education: 'BAMS, MD (Ayurveda Panchakarma) - Banaras Hindu University',
      opdTimings: 'Mon - Sat: 09:00 AM - 07:00 PM',
      nadiParikshaExpert: true,
      availableSlotsCount: 5,
      totalSlotsToday: 8,
    },
    {
      id: 'doc_2',
      name: 'Dr. Ravi Shankar Iyer',
      nameHi: 'डॉ. रवि शंकर अय्यर',
      specialty: 'Gut & Digestion',
      subSpecialties: ['IBS & Ulcerative Colitis', 'GERD & Hyperacidity', 'Metabolic Ama Detox'],
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500',
      rating: 4.8,
      ratingCount: 390,
      yearsExperience: 12,
      consultationFee: 649,
      languages: ['English', 'Hindi', 'Tamil'],
      city: 'Bengaluru',
      clinicName: 'Prakriti Nadi Clinic, Indiranagar',
      about: 'Expert in eight-fold pulse diagnosis (Ashtavidha Pariksha) and curing stubborn gastrointestinal disorders through personalized herbal formulations and Ahara dietary modifications.',
      verified: true,
      ccimRegNo: 'CCIM/KA/AYUR/6104',
      education: 'BAMS, MD (Kayachikitsa) - Govt Ayurveda Medical College',
      opdTimings: 'Mon - Fri: 10:00 AM - 06:00 PM',
      nadiParikshaExpert: true,
      availableSlotsCount: 4,
      totalSlotsToday: 8,
    },
    {
      id: 'doc_3',
      name: 'Dr. Priya Deshmukh',
      nameHi: 'डॉ. प्रिया देशमुख',
      specialty: 'Ayurvedic Dermatology',
      subSpecialties: ['Psoriasis & Eczema', 'Hormonal Adult Acne', 'Rakta Shodhana Therapy'],
      photo: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500',
      rating: 4.9,
      ratingCount: 520,
      yearsExperience: 16,
      consultationFee: 899,
      languages: ['English', 'Hindi', 'Marathi'],
      city: 'Pune',
      clinicName: 'Kaya Shuddhi Ayurvedic Skin Institute',
      about: 'Pitta dosha specialist curing chronic autoimmune skin flares, vitiligo, and fungal dermatoses via internal blood purification and classical herbal paste Lepam therapies.',
      verified: true,
      ccimRegNo: 'CCIM/MH/AYUR/9821',
      education: 'BAMS, Fellowship in Ayurvedic Cosmetology - Tilak Ayurveda Mahavidyalaya',
      opdTimings: 'Tue - Sun: 09:30 AM - 05:30 PM',
      nadiParikshaExpert: true,
      availableSlotsCount: 6,
      totalSlotsToday: 8,
    },
  ];

  const doctors: Doctor[] = [...curatedDoctors];

  const firstNames = ['Anjali', 'Ravi', 'Meera', 'Suresh', 'Priya', 'Arjun', 'Devika', 'Vikram', 'Shalini', 'Kalyan', 'Sunil', 'Bhavna', 'Rohit', 'Geeta'];
  const lastNames = ['Verma', 'Sharma', 'Iyer', 'Nair', 'Rao', 'Patel', 'Deshmukh', 'Mishra', 'Chopra', 'Banerjee', 'Joshi', 'Gupta', 'Menon'];
  const educations = [
    'BAMS, MD (Kayachikitsa) - Banaras Hindu University',
    'BAMS, MD (Panchakarma) - Gujarat Ayurved University',
    'BAMS, MS (Shalya Tantra) - National Institute of Ayurveda, Jaipur',
    'BAMS, Fellowship in Nadi Pariksha - Kerala Ayurveda Academy',
    'BAMS, MD (Dravyaguna) - Govt Ayurvedic College, Thiruvananthapuram',
  ];

  for (let i = doctors.length; i < count; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const spec = SPECIALTIES[1 + (i % (SPECIALTIES.length - 1))];
    const city = CITIES[1 + (i % (CITIES.length - 1))];
    const fee = 450 + Math.floor(rand() * 750);
    const exp = 4 + Math.floor(rand() * 26);
    const rating = Math.round((4.3 + rand() * 0.69) * 10) / 10;
    const ratingCount = 30 + Math.floor(rand() * 600);
    const photo = DOCTOR_PORTRAITS[i % DOCTOR_PORTRAITS.length];
    const edu = educations[i % educations.length];
    const avail = 2 + Math.floor(rand() * 6);

    doctors.push({
      id: `doc_${i + 1}`,
      name: `Dr. ${fn} ${ln}, ${edu.split(',')[1]?.split('-')[0]?.trim() || 'BAMS'}`,
      specialty: spec,
      subSpecialties: [`Classical ${spec}`, 'Pulse Diagnosis', 'Constitutional Dietetics'],
      photo,
      rating,
      ratingCount,
      yearsExperience: exp,
      consultationFee: fee,
      languages: ['English', 'Hindi', city === 'Chennai' ? 'Tamil' : city === 'Bengaluru' ? 'Kannada' : 'Sanskrit'],
      city,
      clinicName: `Amrutam Vaidya Kendra, ${city}`,
      about: `Senior Ayurvedic specialist with ${exp} years of clinical expertise treating chronic ${spec} disorders with botanical extracts and personalized Ahara-Vihara lifestyle guidance.`,
      verified: true,
      ccimRegNo: `CCIM/${city.substring(0, 2).toUpperCase()}/AYUR/${1000 + i}`,
      education: edu,
      opdTimings: 'Mon - Sat: 09:00 AM - 06:30 PM',
      nadiParikshaExpert: i % 2 === 0,
      availableSlotsCount: avail,
      totalSlotsToday: 8,
    });
  }

  cachedDoctors = doctors;
  return doctors;
}

export function generateSlotsForDoctor(doctorId: string, dateStr?: string): Slot[] {
  const times = [
    { start: '09:00 AM', end: '09:30 AM', hour: 9, min: 0 },
    { start: '10:00 AM', end: '10:30 AM', hour: 10, min: 0 },
    { start: '11:00 AM', end: '11:30 AM', hour: 11, min: 0 },
    { start: '02:00 PM', end: '02:30 PM', hour: 14, min: 0 },
    { start: '03:30 PM', end: '04:00 PM', hour: 15, min: 30 },
    { start: '05:00 PM', end: '05:30 PM', hour: 17, min: 0 },
    { start: '06:00 PM', end: '06:30 PM', hour: 18, min: 0 },
    { start: '07:00 PM', end: '07:30 PM', hour: 19, min: 0 },
    { start: '08:00 PM', end: '08:30 PM', hour: 20, min: 0 },
    { start: '08:30 PM', end: '09:00 PM', hour: 20, min: 30 },
    { start: '09:00 PM', end: '09:30 PM', hour: 21, min: 0 },
    { start: '09:30 PM', end: '10:00 PM', hour: 21, min: 30 },
    { start: '10:00 PM', end: '10:30 PM', hour: 22, min: 0 },
    { start: '10:30 PM', end: '11:00 PM', hour: 22, min: 30 },
    { start: '11:00 PM', end: '11:30 PM', hour: 23, min: 0 },
  ];

  const baseDate = dateStr ? new Date(dateStr) : new Date();

  return times.map((t, idx) => {
    const slotDate = new Date(baseDate);
    slotDate.setHours(t.hour, t.min, 0, 0);

    const endDate = new Date(slotDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const isBooked = (parseInt(doctorId.replace('doc_', ''), 10) + idx) % 4 === 0;

    return {
      id: `slot_${doctorId}_${idx + 1}`,
      doctorId,
      startsAt: slotDate.toISOString(),
      endsAt: endDate.toISOString(),
      status: isBooked ? 'booked' : 'available',
      version: 1,
    };
  });
}
