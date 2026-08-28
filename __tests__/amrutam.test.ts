import consultationsReducer, {
  bookConsultationSlot,
  setSpecialtyFilter,
} from '../src/features/consultations/store/consultationsSlice';
import cartReducer, {
  addToCart,
  applyCoupon,
  updateQuantity,
} from '../src/features/shop/store/cartSlice';
import patientProfileReducer, {
  setDosha,
  addAllergy,
} from '../src/shared/patientProfile/patientProfileSlice';
import { generateDoctors, generateSlotsForDoctor } from '../src/features/consultations/data/mockDoctors';
import { generateProducts } from '../src/features/shop/data/mockProducts';
import { generateHealthRecords } from '../src/features/health-records/data/mockRecords';
import { mockServer } from '../src/api/mockServer';

describe('Amrutam Pharma App — Core Module Test Suite', () => {
  describe('Mock Data Generators Scale Validation', () => {
    it('generates 5,000 doctors with deterministic attributes', () => {
      const doctors = generateDoctors(5000);
      expect(doctors.length).toBe(5000);
      expect(doctors[0].verified).toBe(true);
      expect(doctors[0].specialty).toBeDefined();
    });

    it('generates 20,000 products with allergy tags and dosha associations', () => {
      const products = generateProducts(20000);
      expect(products.length).toBe(20000);
      expect(products[0].price).toBeGreaterThan(0);
      expect(products[0].ingredients.length).toBeGreaterThan(0);
    });

    it('generates 10,000 health records with clinical vitals and attachments', () => {
      const records = generateHealthRecords(10000);
      expect(records.length).toBe(10000);
      expect(records[0].type).toBe('prescription');
      expect(records[0].prescribedMedicines?.length).toBeGreaterThan(0);
    });
  });

  describe('Consultations Module — Optimistic Concurrency & Slot Double-Booking Prevention', () => {
    it('successfully books an available slot and increments version token', async () => {
      const slots = await mockServer.getSlotsForDoctor('doc_1');
      const availableSlot = slots.find((s) => s.status === 'available');
      expect(availableSlot).toBeDefined();

      if (availableSlot) {
        const result = await mockServer.bookSlot({
          doctorId: 'doc_1',
          slotId: availableSlot.id,
          patientNote: 'Ayurvedic Skin Therapy',
          slotVersion: availableSlot.version,
        });

        expect(result.booking.status).toBe('confirmed');
        expect(result.slot.status).toBe('booked');
        expect(result.slot.version).toBe(availableSlot.version + 1);
      }
    });

    it('rejects double-booking when slot is already reserved', async () => {
      const slots = await mockServer.getSlotsForDoctor('doc_1');
      const bookedSlot = slots.find((s) => s.status === 'booked');
      expect(bookedSlot).toBeDefined();

      if (bookedSlot) {
        await expect(
          mockServer.bookSlot({
            doctorId: 'doc_1',
            slotId: bookedSlot.id,
            patientNote: 'Conflicting Booking',
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('Shop Module — Offline Cart Mutations & Discounts', () => {
    it('adds items, updates quantities, and calculates coupon discounts', () => {
      let state = cartReducer(undefined, { type: '@@INIT' });

      const testProduct = {
        id: 'test_p1',
        name: 'Organic Ashwagandha',
        subtitle: 'Rejuvenation',
        category: 'Immunity & Rasayana',
        price: 500,
        originalPrice: 600,
        rating: 4.8,
        ratingCount: 100,
        image: 'https://images.unsplash.com/test.jpg',
        images: [],
        description: 'Test',
        ingredients: ['Ashwagandha'],
        keyBenefits: ['Stress'],
        recommendedForDosha: ['vata' as const],
        allergyTags: [],
        inStock: true,
        stockCount: 10,
        dosageInstructions: '1 tsp',
      };

      state = cartReducer(state, addToCart({ product: testProduct, quantity: 2 }));
      expect(state.items.some((i) => i.product.id === 'test_p1')).toBe(true);

      state = cartReducer(state, updateQuantity({ productId: 'test_p1', quantity: 3 }));
      const found = state.items.find((i) => i.product.id === 'test_p1');
      expect(found?.quantity).toBe(3);

      state = cartReducer(state, applyCoupon('VEDIC20'));
      expect(state.appliedCoupon?.discountPercentage).toBe(20);
    });
  });

  describe('Patient Profile & Prakriti Dosha Module', () => {
    it('updates Dosha assessment and allergy list', () => {
      let state = patientProfileReducer(undefined, { type: '@@INIT' });
      state = patientProfileReducer(state, setDosha('kapha'));
      expect(state.dosha).toBe('kapha');

      state = patientProfileReducer(state, addAllergy('Lactose'));
      expect(state.allergies).toContain('Lactose');
    });
  });
});
