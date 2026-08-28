import { HealthRecord } from '../types';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

let cachedRecords: HealthRecord[] | null = null;

export function generateHealthRecords(count = 10000): HealthRecord[] {
  if (cachedRecords && cachedRecords.length === count) {
    return cachedRecords;
  }

  const rand = seededRandom(77);

  const curatedRecords: HealthRecord[] = [
    {
      id: 'rec_1',
      type: 'prescription',
      title: 'Panchakarma Detox & Vata Shamana Regimen',
      doctorName: 'Dr. Anjali Verma, MD',
      doctorSpecialty: 'Panchakarma Specialist',
      doctorPhoto: 'https://images.unsplash.com/photo-1594824813580-ff677464d509?w=400',
      date: '2026-08-20T10:30:00.000Z',
      notes: 'Patient showed signs of aggravated Vata and sluggish digestive fire (Mandaagni). Prescribed 21-day botanical cleansing protocol with Rasayana herbs.',
      diagnosis: 'Vata-Pitta Imbalance, Chronic Fatigue & Mild Dyspepsia',
      tags: ['Prescription', 'Panchakarma', 'Vata Care'],
      prescribedMedicines: [
        {
          productId: 'prod_2',
          medicineName: 'Amrutam Ashwagandha Churna',
          dosage: '1 tsp (3g)',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with warm milk or almond drink at night.',
          price: 549,
        },
        {
          productId: 'prod_4',
          medicineName: 'Amrutam Triphala Guggul Tablets',
          dosage: '2 tablets',
          frequency: 'Nightly',
          duration: '21 days',
          instructions: 'Take 30 mins after dinner with warm water.',
          price: 449,
        },
        {
          productId: 'prod_1',
          medicineName: 'Amrutam Kuntal Care Hair Spa',
          dosage: 'Generous application',
          frequency: 'Twice weekly',
          duration: 'Ongoing',
          instructions: 'Scalp Shiro-Abhyanga before bath.',
          price: 899,
        },
      ],
      attachments: [
        {
          id: 'att_1',
          title: 'Prescription_Dr_Verma_Aug2026.pdf',
          fileType: 'pdf',
          fileSize: '1.4 MB',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        {
          id: 'att_2',
          title: 'Nadi_Pulse_Waveform.png',
          fileType: 'image',
          fileSize: '850 KB',
          url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
          thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200',
        },
      ],
      vitals: {
        bloodPressure: '118/76 mmHg',
        pulseRate: '72 bpm (Sarpagati - Pitta dominant)',
        prakritiDiagnosis: 'Vata-Pitta (62% Vata, 38% Pitta)',
        temperature: '98.4 °F',
        bmi: '22.4 kg/m²',
      },
    },
    {
      id: 'rec_2',
      type: 'lab_report',
      title: 'Complete Lipid & Metabolic Biomarker Panel',
      doctorName: 'Dr. Ravi Shankar Iyer',
      doctorSpecialty: 'Gut & Digestion',
      doctorPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      date: '2026-07-14T08:15:00.000Z',
      notes: 'Triglycerides and fasting glucose within optimal Ayurvedic biological rhythms. Elevated serum bilirubin settled after Pitta-shamak formulation.',
      diagnosis: 'Hepato-Biliary Wellness & Serum Profile',
      tags: ['Lab Report', 'Lipid Profile', 'Blood Chemistry'],
      attachments: [
        {
          id: 'att_3',
          title: 'Metabolic_Panel_Thyrocare.pdf',
          fileType: 'pdf',
          fileSize: '2.8 MB',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
      vitals: {
        bloodPressure: '120/78 mmHg',
        pulseRate: '70 bpm',
      },
    },
    {
      id: 'rec_3',
      type: 'allergy',
      title: 'Patient Allergy & Hypersensitivity Assessment',
      doctorName: 'Dr. Priya Deshmukh',
      doctorSpecialty: 'Ayurvedic Dermatology',
      doctorPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      date: '2026-06-02T11:00:00.000Z',
      notes: 'Confirmed contact dermatitis and histamine flares triggered by synthetic fragrance and synthetic preservatives. Recommended strict 100% natural organic topical formulations.',
      diagnosis: 'Cutaneous Hypersensitivity (Twak Rog)',
      tags: ['Allergy', 'Peanuts', 'Gluten', 'Synthetic Preservatives'],
      attachments: [
        {
          id: 'att_4',
          title: 'Allergy_Patch_Test_Results.pdf',
          fileType: 'pdf',
          fileSize: '950 KB',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
    },
    {
      id: 'rec_4',
      type: 'diet_plan',
      title: 'Monsoon (Varsha Ritu) Seasonal Ahara Chart',
      doctorName: 'Dr. Arjun Nair',
      doctorSpecialty: 'Stress & Rasayana',
      doctorPhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      date: '2026-05-18T16:45:00.000Z',
      notes: 'Warm sour-salty-sweet diet with light digestive spices (cumin, ginger, black pepper) to protect digestive fire during monsoon dampness.',
      diagnosis: 'Ritucharya Seasonal Guidance',
      tags: ['Diet Plan', 'Ritucharya', 'Agni Deepana'],
      attachments: [
        {
          id: 'att_5',
          title: 'Varsha_Ritu_Diet_Chart.pdf',
          fileType: 'pdf',
          fileSize: '1.1 MB',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
    },
    {
      id: 'rec_5',
      type: 'vaccination',
      title: 'Hepatitis B Booster — Dose 2 of 3',
      doctorName: 'Dr. Meera Kulkarni',
      doctorSpecialty: 'Immunization & Preventive Care',
      doctorPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
      date: '2026-04-10T09:00:00.000Z',
      notes: 'Administered second dose of the Hepatitis B vaccination series as part of the preventive immunization schedule. No adverse reaction observed at the injection site; patient tolerated the dose well.',
      diagnosis: 'Preventive Immunization — Hepatitis B Series',
      tags: ['Vaccination', 'Immunization', 'Preventive Care'],
      vaccination: {
        vaccineName: 'Hepatitis B Booster',
        doseNumber: 2,
        totalDoses: 3,
        nextDueDate: '2026-10-10T09:00:00.000Z',
        batchNumber: 'HBV-2291-IN',
        manufacturer: 'Serum Institute of India',
      },
      attachments: [
        {
          id: 'att_6',
          title: 'Immunization_Certificate_HepB_Dose2.pdf',
          fileType: 'pdf',
          fileSize: '620 KB',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
    },
  ];

  const records: HealthRecord[] = [...curatedRecords];

  // All 5 spec'd record types cycle through the generator (diet_plan kept as a 6th
  // bonus type). Previously `allergy` and the not-yet-existing `vaccination` type
  // were entirely missing from this list, so ~9,999 of 10,000 generated records
  // could never be an allergy or vaccination record.
  const types: HealthRecord['type'][] = [
    'prescription',
    'lab_report',
    'consultation_summary',
    'allergy',
    'vaccination',
    'diet_plan',
  ];
  const docNames = ['Dr. Anjali Verma', 'Dr. Ravi Shankar Iyer', 'Dr. Priya Deshmukh', 'Dr. Arjun Nair', 'Dr. Devika Rao', 'Dr. Kalyan Chopra'];

  const TYPE_TITLE_PREFIX: Record<HealthRecord['type'], string> = {
    prescription: 'Ayurvedic Prescription & Regimen',
    lab_report: 'Diagnostic Blood & Urine Screen',
    consultation_summary: 'Clinical Consultation Summary',
    diet_plan: 'Prakriti Nutritional Protocol',
    allergy: 'Allergy & Hypersensitivity Screening',
    vaccination: 'Immunization Record',
  };

  const ALLERGY_TRIGGERS = [
    'Peanuts',
    'Shellfish',
    'Seasonal Pollen',
    'Dust Mites',
    'Synthetic Fragrance',
    'Gluten',
    'Lactose',
    'Penicillin',
    'Latex',
    'Sesame',
  ];

  const VACCINE_NAMES = [
    'Hepatitis B Booster',
    'Influenza (Seasonal)',
    'Tetanus-Diphtheria (Td)',
    'Typhoid Conjugate',
    'COVID-19 Booster',
    'Pneumococcal (PCV13)',
    'MMR (Measles-Mumps-Rubella)',
    'Varicella (Chickenpox)',
  ];
  // Vaccines administered as a single annual/one-off dose rather than a multi-dose series.
  const SINGLE_DOSE_VACCINES = new Set(['Influenza (Seasonal)', 'COVID-19 Booster', 'Tetanus-Diphtheria (Td)']);

  const startDate = new Date('2026-01-01T00:00:00.000Z').getTime();

  for (let i = records.length; i < count; i++) {
    const t = types[i % types.length];
    const doc = docNames[i % docNames.length];
    const timeOffset = (i * 86400000 * 0.4) + (rand() * 43200000);
    const recDate = new Date(startDate - timeOffset).toISOString();

    let title = `${TYPE_TITLE_PREFIX[t]} #${i + 1}`;
    let tags: string[] = [t.toUpperCase(), 'Ayurveda', 'Wellness'];
    let vaccinationDetails: HealthRecord['vaccination'];

    if (t === 'allergy') {
      const trigger = ALLERGY_TRIGGERS[i % ALLERGY_TRIGGERS.length];
      title = `${TYPE_TITLE_PREFIX[t]} — ${trigger} #${i + 1}`;
      tags = [t.toUpperCase(), trigger, 'Hypersensitivity'];
    } else if (t === 'vaccination') {
      const vaccineName = VACCINE_NAMES[i % VACCINE_NAMES.length];
      const isSingleDose = SINGLE_DOSE_VACCINES.has(vaccineName);
      const doseNumber = isSingleDose ? 1 : (i % 3) + 1;
      const totalDoses = isSingleDose ? 1 : 3;
      const nextDueDate = new Date(
        new Date(recDate).getTime() + (150 + rand() * 60) * 86400000
      ).toISOString();

      title = `${vaccineName} — Dose ${doseNumber} of ${totalDoses} #${i + 1}`;
      tags = [t.toUpperCase(), vaccineName, 'Immunization'];
      vaccinationDetails = {
        vaccineName,
        doseNumber,
        totalDoses,
        nextDueDate,
        batchNumber: `VAC-${1000 + (i % 8999)}-IN`,
      };
    }

    records.push({
      id: `rec_${i + 1}`,
      type: t,
      title,
      doctorName: doc,
      doctorSpecialty: 'Ayurvedic Medicine',
      doctorPhoto: 'https://images.unsplash.com/photo-1594824813580-ff677464d509?w=400',
      date: recDate,
      notes: `Patient evaluated for seasonal constitutional balance. Dosha harmony observed. Continued lifestyle therapy and Rasayana botanical supplementation.`,
      diagnosis: `Doshic Assessment & General Rejuvenation`,
      tags,
      prescribedMedicines: t === 'prescription' ? [
        {
          productId: 'prod_2',
          medicineName: 'Amrutam Ashwagandha Churna',
          dosage: '1 tsp',
          frequency: 'Bedtime',
          duration: '14 days',
          instructions: 'With lukewarm milk',
          price: 549,
        },
      ] : undefined,
      attachments: [
        {
          id: `att_${i + 100}`,
          title: `Report_Record_${i + 1}.pdf`,
          fileType: 'pdf',
          fileSize: '1.2 MB',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
      vitals: {
        bloodPressure: '120/80 mmHg',
        pulseRate: '72 bpm',
        temperature: '98.6 °F',
      },
      vaccination: vaccinationDetails,
    });
  }

  cachedRecords = records;
  return records;
}
