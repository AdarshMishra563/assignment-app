import { Product } from '../types';
import { Dosha } from '../../../shared/patientProfile/patientProfileSlice';

export const CATEGORIES = [
  'All Remedies',
  'Herbal Oils & Kuntal Care',
  'Churna & Kwath',
  'Immunity & Rasayana',
  'Ayurvedic Skincare',
  'Digestion & Gut Care',
  'Sleep & Mind Tonics',
];

const BOTANICAL_IMAGES = [
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=600',
  'https://images.unsplash.com/photo-1512290900672-1f00b7b64009?w=600',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600',
];

const SHASTRA_REFS = [
  'Charaka Samhita (Chikitsa Sthana)',
  'Ashtanga Hridaya (Sutrasthana)',
  'Sharangadhara Samhita (Madhyama Khanda)',
  'Bhaishajya Ratnavali',
  'Sushruta Samhita (Uttara Tantra)',
  'Sahasrayogam (Taila Prakarana)',
  'Chakradatta (Rasayana Adhyaya)',
];

const FORMULATIONS = [
  { name: 'Kuntal Care Hair Spa', nameHi: 'कुंतल केयर हेयर स्पा', sanskrit: 'कुन्तल केश रसायनम्', category: 'Herbal Oils & Kuntal Care', herbs: ['Bhringraj (Eclipta alba)', 'Amalaki (Phyllanthus emblica)', 'Brahmi (Bacopa monnieri)', 'Cold-Pressed Sesame Oil'], benefits: ['Strengthens hair follicles', 'Cools excessive Pitta in head', 'Prevents premature greying'], dosha: ['pitta', 'vata'] as Dosha[], anupana: 'Apply directly onto scalp, followed by warm towel wrap' },
  { name: 'Ashwagandha Rasayana Churna', nameHi: 'अश्वगंधा रसायन चूर्ण', sanskrit: 'अश्वगन्धा रसायनम्', category: 'Immunity & Rasayana', herbs: ['Shuddha Ashwagandha (Withania somnifera)', 'Pippali (Piper longum)', 'Yastimadhu (Glycyrrhiza glabra)'], benefits: ['Reduces elevated serum cortisol', 'Deep restorative sleep', 'Builds vital essence (Ojas)'], dosha: ['vata', 'kapha'] as Dosha[], anupana: 'Warm spiced cow milk or almond milk at bedtime' },
  { name: 'Kumkumadi Radiance Tailam', nameHi: 'कुंकुमादि रेडियंस तैलम्', sanskrit: 'कुङ्कुमादि तैलम्', category: 'Ayurvedic Skincare', herbs: ['Kashmiri Kesar (Crocus sativus)', 'Rakta Chandana (Pterocarpus santalinus)', 'Manjistha (Rubia cordifolia)', 'Padmaka (Prunus cerasoides)'], benefits: ['Illuminates skin Tejas (glow)', 'Fades dark spots and blemishes', 'Strengthens epidermal barrier'], dosha: ['pitta', 'vata'] as Dosha[], anupana: '3-4 drops pressed into damp cleansed skin overnight' },
  { name: 'Triphala Guggulu Vati', nameHi: 'त्रिफला गुग्गुलु वटी', sanskrit: 'त्रिफला गुग्गुलु वटी', category: 'Digestion & Gut Care', herbs: ['Haritaki (Terminalia chebula)', 'Bibhitaki (Terminalia bellirica)', 'Amalaki (Emblica officinalis)', 'Shuddha Guggulu'], benefits: ['Gentle colon detoxification', 'Kindles metabolic Agni', 'Flushes stagnant Ama toxins'], dosha: ['vata', 'pitta', 'kapha'] as Dosha[], anupana: 'Warm water 30 minutes after dinner' },
  { name: 'Brahmi Medhya Ghrita', nameHi: 'ब्राह्मी मेध्य घृत', sanskrit: 'ब्राह्मी घृतम्', category: 'Sleep & Mind Tonics', herbs: ['Brahmi (Bacopa monnieri)', 'Shankhpushpi (Convolvulus pluricaulis)', 'Vacha (Acorus calamus)', 'Pure Gir Cow Ghee'], benefits: ['Calms overactive Vata nervous system', 'Enhances memory & cognitive clarity', 'Alleviates mental fatigue'], dosha: ['vata', 'pitta'] as Dosha[], anupana: '1 teaspoon on empty stomach with warm water' },
  { name: 'Mahamanjisthadi Blood Purifier Kwath', nameHi: 'महामंजिष्ठादि रक्त शोधक क्वाथ', sanskrit: 'महामञ्जिष्ठादि क्वाथ', category: 'Ayurvedic Skincare', herbs: ['Manjistha (Rubia cordifolia)', 'Sariva (Hemidesmus indicus)', 'Neem (Azadirachta indica)', 'Guduchi (Tinospora cordifolia)'], benefits: ['Deep blood purification (Rakta Shodhana)', 'Clears chronic acne and eczema', 'Balances hepatic Pitta'], dosha: ['pitta'] as Dosha[], anupana: 'Equal quantity of lukewarm water twice daily after meals' },
  { name: 'Chandraprabha Vati Uro-Tonic', nameHi: 'चंद्रप्रभा वटी यूरो-टॉनिक', sanskrit: 'चन्द्रप्रभावटी', category: 'Immunity & Rasayana', herbs: ['Shilajit (Purified Asphaltum)', 'Guggulu', 'Chavya', 'Gokshura (Tribulus terrestris)'], benefits: ['Revitalizes urinary and renal tract', 'Enhances physical stamina', 'Supports healthy blood glucose levels'], dosha: ['kapha', 'vata'] as Dosha[], anupana: 'Lukewarm water or fresh tender coconut water' },
  { name: 'Dashamularishta Restorative Arishta', nameHi: 'दशमूलारिष्ट पौष्टिक अरिष्ट', sanskrit: 'दशमूलारिष्टम्', category: 'Immunity & Rasayana', herbs: ['Dashamula (10 classical roots)', 'Dhataki Pushpa', 'Draksha', 'Amalaki'], benefits: ['Alleviates full-body fatigue and aches', 'Post-natal recovery and stamina', 'Balances post-stress Vata depletion'], dosha: ['vata', 'kapha'] as Dosha[], anupana: '15-20ml mixed with equal parts water after lunch and dinner' },
  { name: 'Haridra Khanda Anti-Allergy Granules', nameHi: 'हरिद्रा खंड एंटी-एलर्जी ग्रैन्यूल्स', sanskrit: 'हरिद्रा खण्डम्', category: 'Immunity & Rasayana', herbs: ['Shuddha Haridra (Curcuma longa)', 'Triphala', 'Trikatu', 'Vidanga', 'Cow Milk Ghee'], benefits: ['Combats histamine intolerance & skin urticaria', 'Protects respiratory mucosal lining', 'Natural anti-inflammatory'], dosha: ['kapha', 'pitta'] as Dosha[], anupana: '1 teaspoon with warm milk twice daily' },
  { name: 'Nalpamaradi Brightening Body Oil', nameHi: 'नालपामरादि ब्राइटनिंग बॉडी ऑयल', sanskrit: 'नाल्पादि तैलम्', category: 'Herbal Oils & Kuntal Care', herbs: ['Nalpamara (4 sacred ficus barks)', 'Haridra', 'Manjistha', 'Cold-Pressed Coconut Oil'], benefits: ['De-tans sun-exposed skin', 'Soothes inflammatory skin flares', 'Deep dermal hydration'], dosha: ['pitta', 'vata'] as Dosha[], anupana: 'Warm oil Abhyanga massage 30 mins before bathing' },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

let cachedProducts: Product[] | null = null;

export function generateProducts(count = 20000): Product[] {
  if (cachedProducts && cachedProducts.length === count) {
    return cachedProducts;
  }

  const rand = seededRandom(108);
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const template = FORMULATIONS[i % FORMULATIONS.length];
    const imageIndex = i % BOTANICAL_IMAGES.length;
    const baseImage = BOTANICAL_IMAGES[imageIndex];
    
    // Generate distinct, high-res CDN image with deterministic seeds
    const imageUrl = i < 50
      ? baseImage
      : `https://images.unsplash.com/photo-${[
          '1608571423902-eed4a5ad8108',
          '1540555700478-4be289fbecef',
          '1563178406-4cdc2923acbc',
          '1512290900672-1f00b7b64009',
          '1584308666744-24d5c474f2ae',
          '1620916566398-39f1143ab7be',
          '1546069901-ba9599a7e63c',
          '1514733670139-4d87a1941d55',
          '1576091160550-2173dba999ef',
          '1570172619644-dfd03ed5d881',
        ][i % 10]}?w=600&auto=format&fit=crop&q=80`;

    const price = 299 + Math.floor(rand() * 1400);
    const originalPrice = Math.round(price * (1.15 + rand() * 0.35));
    const rating = Math.round((4.2 + rand() * 0.79) * 10) / 10;
    const ratingCount = 25 + Math.floor(rand() * 1800);
    const shastra = SHASTRA_REFS[i % SHASTRA_REFS.length];

    const allergyTags: string[] = [];
    if (i % 8 === 0) allergyTags.push('Peanuts');
    if (i % 11 === 0) allergyTags.push('Gluten');
    if (i % 13 === 0) allergyTags.push('Dairy / Goat Milk');
    if (i % 17 === 0) allergyTags.push('Synthetic Preservatives');

    const suffix = i < FORMULATIONS.length ? '' : ` Batch #${Math.floor(i / FORMULATIONS.length) + 100}`;
    const name = `Amrutam ${template.name}${suffix}`;
    const nameHi = i < FORMULATIONS.length ? `अमृतम् ${template.nameHi}` : undefined;

    products.push({
      id: `prod_${i + 1}`,
      name,
      nameHi,
      sanskritName: template.sanskrit,
      shastraReference: shastra,
      subtitle: `Authentic Vedic formula according to ${shastra}`,
      category: template.category,
      price,
      originalPrice,
      rating,
      ratingCount,
      image: imageUrl,
      images: [imageUrl, BOTANICAL_IMAGES[(imageIndex + 1) % BOTANICAL_IMAGES.length]],
      description: `Crafted in strict adherence to ${shastra}. Contains wildcrafted ${template.herbs[0]} to naturally pacify aggravated ${template.dosha.join(' and ')} doshas and restore constitutional vitality without side effects.`,
      ingredients: template.herbs,
      keyBenefits: template.benefits,
      recommendedForDosha: template.dosha,
      allergyTags,
      isBestSeller: i % 12 === 0,
      isCertified: true,
      certificationMarks: [
        'Ministry of AYUSH Premium Mark',
        'GMP Certified Facility',
        '100% Organically Farmed Herbs',
        'Heavy Metal & Microbial Tested',
      ],
      inStock: true,
      stockCount: 15 + Math.floor(rand() * 120),
      dosageInstructions: `Take 1 prescribed measure twice daily after meals, or as directed by your Ayurvedic physician.`,
      anupanaCarrier: template.anupana,
      ayurvedicPharmacology: {
        rasa: ['Tikta (Bitter)', 'Kashaya (Astringent)', 'Madhura (Sweet)', 'Katu (Pungent)'][i % 4],
        guna: ['Laghu (Light)', 'Snigdha (Unctuous)', 'Ruksha (Dry)', 'Guru (Heavy)'][i % 4],
        virya: i % 2 === 0 ? 'Sheeta (Cooling)' : 'Ushna (Heating)',
        vipaka: i % 2 === 0 ? 'Madhura (Nourishing)' : 'Katu (Metabolizing)',
      },
    });
  }

  cachedProducts = products;
  return products;
}
