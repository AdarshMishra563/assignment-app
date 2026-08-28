import { generateDoctors, generateSlotsForDoctor } from '../features/consultations/data/mockDoctors';
import { generateProducts } from '../features/shop/data/mockProducts';
import { generateHealthRecords } from '../features/health-records/data/mockRecords';
import { Booking, Doctor, Slot } from '../features/consultations/types';
import { Product } from '../features/shop/types';
import { HealthRecord } from '../features/health-records/types';
import { ApiError } from './errors';
import { env } from '../config/env';

/**
 * A small, curated set of realistic failure shapes a real backend might
 * produce, used by the random-failure simulation below.
 */
function randomChaosError(): ApiError {
  const roll = Math.random();
  if (roll < 0.34) {
    return new ApiError('Network request failed. Please check your connection.', 0, 'NETWORK_ERROR');
  }
  if (roll < 0.67) {
    return new ApiError('Internal server error. Please try again.', 500, 'SERVER_ERROR');
  }
  return new ApiError('Service temporarily unavailable. Please try again shortly.', 503, 'SERVER_ERROR');
}

class MockServer {
  private doctors: Doctor[];
  private slotsMap: Map<string, Slot[]> = new Map();
  private products: Product[];
  private records: HealthRecord[];
  private bookings: Booking[] = [];

  public simulateSlowNetwork = false;
  public simulateSlotConflict = false;

  constructor() {
    this.doctors = generateDoctors(5000);
    this.products = generateProducts(20000);
    this.records = generateHealthRecords(10000);

    // Seed some initial bookings
    this.bookings = [
      {
        id: 'book_initial_1',
        doctorId: 'doc_1',
        doctorName: 'Dr. Anjali Verma, MD',
        doctorSpecialty: 'Panchakarma',
        doctorPhoto: 'https://images.unsplash.com/photo-1594824813580-ff677464d509?w=400',
        slotId: 'slot_doc_1_2',
        slotTime: 'Tomorrow at 10:00 AM',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        patientNote: 'Follow-up consultation for Pitta skin cleansing regimen.',
        consultationFee: 799,
        meetingLink: 'https://amrutam.health/meet/room-doc-1-xyz',
      },
    ];
  }

  private async delay(ms = env.MOCK_BASE_DELAY_MS): Promise<void> {
    const extra = this.simulateSlowNetwork ? env.MOCK_SLOW_NETWORK_EXTRA_MS : 0;
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms + extra);
    });
  }

  /**
   * Shared reliability-simulation helper — called at the top of every
   * request-handling method below instead of scattering `Math.random()`
   * calls throughout the file. Applies the baseline (+ slow-network)
   * latency, then, only when `env.SIMULATE_NETWORK_ISSUES` is on (dev
   * builds only, never in production and never under Jest):
   *  - occasionally hangs far longer than `env.API_TIMEOUT_MS` so
   *    client.ts's Promise.race can genuinely observe a timeout, and
   *  - occasionally rejects outright with a realistic network/500/503
   *    error before the handler's normal logic runs.
   */
  private async simulateNetworkConditions(): Promise<void> {
    await this.delay();

    if (!env.SIMULATE_NETWORK_ISSUES) {
      return;
    }

    if (Math.random() < env.TIMEOUT_SIMULATION_RATE) {
      await new Promise<void>((resolve) => setTimeout(resolve, env.API_TIMEOUT_MS * 3));
    }

    if (Math.random() < env.RANDOM_FAILURE_RATE) {
      throw randomChaosError();
    }
  }

  /**
   * Occasionally (dev-only) hands back a shallow-corrupted clone of an
   * object response — one of the given "critical" keys deleted — to
   * simulate a partial/invalid payload a flaky real backend might send.
   * The original stored data is never mutated, only the returned copy.
   */
  private maybeCorrupt<T extends Record<string, any>>(data: T, criticalKeys: Array<keyof T>): T {
    if (!env.SIMULATE_NETWORK_ISSUES || criticalKeys.length === 0) {
      return data;
    }
    if (Math.random() >= env.MALFORMED_RESPONSE_RATE) {
      return data;
    }
    const victim = criticalKeys[Math.floor(Math.random() * criticalKeys.length)];
    const corrupted: any = { ...data };
    delete corrupted[victim as string];
    return corrupted;
  }

  /**
   * Same idea as maybeCorrupt, but for list endpoints: clones the array
   * and deletes a critical key from one random item.
   */
  private maybeCorruptListItem<T extends Record<string, any>>(list: T[], criticalKey: keyof T): T[] {
    if (!env.SIMULATE_NETWORK_ISSUES || list.length === 0) {
      return list;
    }
    if (Math.random() >= env.MALFORMED_RESPONSE_RATE) {
      return list;
    }
    const idx = Math.floor(Math.random() * list.length);
    const clone = [...list];
    const corruptedItem: any = { ...clone[idx] };
    delete corruptedItem[criticalKey as string];
    clone[idx] = corruptedItem;
    return clone;
  }

  // --- CONSULTATIONS ---

  async getDoctors(params: {
    page?: number;
    limit?: number;
    search?: string;
    specialty?: string;
    city?: string;
  }) {
    await this.simulateNetworkConditions();
    const page = params.page || 1;
    const limit = params.limit || 20;
    let filtered = this.doctors;

    if (params.specialty && params.specialty !== 'All Specialties') {
      filtered = filtered.filter((d) => d.specialty === params.specialty);
    }
    if (params.city && params.city !== 'All Cities') {
      filtered = filtered.filter((d) => d.city === params.city);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.clinicName.toLowerCase().includes(q)
      );
    }

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return this.maybeCorrupt(
      {
        items,
        total: filtered.length,
        page,
        limit,
        hasMore: startIndex + limit < filtered.length,
      },
      ['items', 'total', 'hasMore']
    );
  }

  async getDoctorById(id: string): Promise<Doctor> {
    await this.simulateNetworkConditions();
    const doc = this.doctors.find((d) => d.id === id);
    if (!doc) {
      throw new ApiError('Doctor not found with specified ID', 404);
    }
    return this.maybeCorrupt(doc, ['id', 'name', 'specialty']);
  }

  async getSlotsForDoctor(doctorId: string): Promise<Slot[]> {
    await this.simulateNetworkConditions();
    if (!this.slotsMap.has(doctorId)) {
      this.slotsMap.set(doctorId, generateSlotsForDoctor(doctorId));
    }
    return this.maybeCorruptListItem(this.slotsMap.get(doctorId)!, 'status');
  }

  async bookSlot(payload: {
    doctorId: string;
    slotId: string;
    patientNote?: string;
    slotVersion?: number;
  }): Promise<{ booking: Booking; slot: Slot }> {
    await this.simulateNetworkConditions();

    if (this.simulateSlotConflict) {
      throw new ApiError('Double-booking conflict: This slot was just booked by another patient. Please choose another time.', 409, 'SLOT_ALREADY_BOOKED');
    }

    const slots = await this.getSlotsForDoctor(payload.doctorId);
    const slotIndex = slots.findIndex((s) => s.id === payload.slotId);

    if (slotIndex === -1) {
      throw new ApiError('Selected consultation slot not found', 404);
    }

    const slot = slots[slotIndex];

    if (slot.status === 'booked') {
      throw new ApiError('Slot is no longer available. Please select another slot.', 409, 'SLOT_ALREADY_BOOKED');
    }

    // Optimistic concurrency verification
    if (payload.slotVersion !== undefined && slot.version !== payload.slotVersion) {
      throw new ApiError('Slot state has changed. Please refresh and retry.', 409, 'CONCURRENCY_ERROR');
    }

    // Update slot
    const updatedSlot: Slot = {
      ...slot,
      status: 'booked',
      version: slot.version + 1,
    };
    slots[slotIndex] = updatedSlot;

    const doc = await this.getDoctorById(payload.doctorId);

    const newBooking: Booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialty,
      doctorPhoto: doc.photo,
      slotId: slot.id,
      slotTime: new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      patientNote: payload.patientNote,
      consultationFee: doc.consultationFee,
      meetingLink: `https://amrutam.health/meet/room-${doc.id}-${Math.random().toString(36).substr(2, 4)}`,
    };

    this.bookings.unshift(newBooking);
    return this.maybeCorrupt({ booking: newBooking, slot: updatedSlot }, ['booking', 'slot']);
  }

  async getMyBookings(): Promise<Booking[]> {
    await this.simulateNetworkConditions();
    return this.maybeCorruptListItem([...this.bookings], 'status');
  }

  async cancelBooking(bookingId: string): Promise<{ booking: Booking; slot: Slot | null }> {
    await this.simulateNetworkConditions();

    const bookingIndex = this.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      throw new ApiError('Booking not found', 404);
    }

    const existing = this.bookings[bookingIndex];
    if (existing.status === 'cancelled') {
      throw new ApiError('This booking has already been cancelled', 409, 'ALREADY_CANCELLED');
    }

    const cancelledBooking: Booking = { ...existing, status: 'cancelled' };
    this.bookings[bookingIndex] = cancelledBooking;

    // Free the associated slot back up so another patient can rebook it
    let updatedSlot: Slot | null = null;
    const slots = this.slotsMap.get(existing.doctorId);
    if (slots) {
      const slotIndex = slots.findIndex((s) => s.id === existing.slotId);
      if (slotIndex !== -1) {
        updatedSlot = {
          ...slots[slotIndex],
          status: 'available',
          version: slots[slotIndex].version + 1,
        };
        slots[slotIndex] = updatedSlot;
      }
    }

    return this.maybeCorrupt({ booking: cancelledBooking, slot: updatedSlot }, ['booking']);
  }

  // --- SHOP ---

  async getProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    dosha?: string;
    sortBy?: 'popular' | 'price_low' | 'price_high' | 'rating';
  }) {
    await this.simulateNetworkConditions();
    const page = params.page || 1;
    const limit = params.limit || 20;
    let filtered = this.products;

    if (params.category && params.category !== 'All Remedies') {
      filtered = filtered.filter((p) => p.category === params.category);
    }
    if (params.dosha) {
      filtered = filtered.filter((p) => p.recommendedForDosha.includes(params.dosha as any));
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_low':
          filtered = [...filtered].sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          filtered = [...filtered].sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered = [...filtered].sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
        default:
          filtered = [...filtered].sort((a, b) => b.ratingCount - a.ratingCount);
          break;
      }
    }

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return this.maybeCorrupt(
      {
        items,
        total: filtered.length,
        page,
        limit,
        hasMore: startIndex + limit < filtered.length,
      },
      ['items', 'total', 'hasMore']
    );
  }

  async getProductById(id: string): Promise<Product> {
    await this.simulateNetworkConditions();
    const prod = this.products.find((p) => p.id === id);
    if (!prod) {
      throw new ApiError('Product not found with specified ID', 404);
    }
    return this.maybeCorrupt(prod, ['id', 'name', 'price']);
  }

  // --- HEALTH RECORDS ---

  async getHealthRecords(params: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  }) {
    await this.simulateNetworkConditions();
    const page = params.page || 1;
    const limit = params.limit || 20;
    let filtered = this.records;

    if (params.type && params.type !== 'all') {
      filtered = filtered.filter((r) => r.type === params.type);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.doctorName.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          (r.diagnosis && r.diagnosis.toLowerCase().includes(q)) ||
          (r.tags && r.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return this.maybeCorrupt(
      {
        items,
        total: filtered.length,
        page,
        limit,
        hasMore: startIndex + limit < filtered.length,
      },
      ['items', 'total', 'hasMore']
    );
  }

  async getHealthRecordById(id: string): Promise<HealthRecord> {
    await this.simulateNetworkConditions();
    const rec = this.records.find((r) => r.id === id);
    if (!rec) {
      throw new ApiError('Health record not found', 404);
    }
    return this.maybeCorrupt(rec, ['id', 'title', 'type']);
  }
}

export const mockServer = new MockServer();
