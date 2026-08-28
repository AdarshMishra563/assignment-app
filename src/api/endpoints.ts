export const ENDPOINTS = {
  // Consultations
  DOCTORS: '/doctors',
  DOCTOR_BY_ID: (id: string) => `/doctors/${id}`,
  DOCTOR_SLOTS: (doctorId: string) => `/doctors/${doctorId}/slots`,
  BOOK_SLOT: '/consultations/book',
  MY_BOOKINGS: '/consultations/my-bookings',
  CANCEL_BOOKING: (id: string) => `/consultations/bookings/${id}/cancel`,

  // Shop
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  CATEGORIES: '/categories',
  CART: '/cart',
  CHECKOUT: '/checkout',
  VALIDATE_COUPON: '/coupons/validate',

  // Health Records
  HEALTH_RECORDS: '/health-records',
  RECORD_BY_ID: (id: string) => `/health-records/${id}`,
  UPLOAD_RECORD: '/health-records/upload',

  // Patient Profile & Dosha Quiz
  PATIENT_PROFILE: '/patient/profile',
  DOSHA_QUIZ_SUBMIT: '/patient/dosha-quiz',
};
