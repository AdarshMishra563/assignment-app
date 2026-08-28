# 🌿 Amrutam Pharma App

> **Ayurvedic Telemedicine & Holistic Healthcare Super-App**  
> *Consultations with Senior Vaidyas · Classical Ayurvedic Pharmacy · Encrypted AYUSH Health Records · Offline-First Engine*

Built with **React Native (v0.86)**, **TypeScript**, **Redux Toolkit**, **redux-persist**, **React Navigation v7**, and **toastify-react-native**.

---

## 🌟 Architecture & Highlights

The **Amrutam Pharma App** connects classical Ayurvedic treatises (*Charaka Samhita*, *Ashtanga Hridaya*, *Sharangadhara Samhita*) with cutting-edge mobile architecture.

```
Amrutam Pharma App  (App.tsx root: Biometric Vault Lock gates the whole app on launch)
├── Tab 1: Home            (Z-Axis Hero Banner · Quick Booking / Pharmacy Shortcuts)
├── Tab 2: Consultations   (5,000 Doctors · Optimistic Slot Concurrency · 1-on-1 HD Video)
├── Tab 3: Shop             (20,000 Remedies · Dravyaguna Pharmacology · Allergy Alerts · Offline Cart)
├── Tab 4: Health Records  (10,000 Records · Pulse Diagnostics · SVG Timeline)
└── Tab 5: Profile          (Dosha Quiz · Default Light Mode · Hindi / English i18n · Biometrics)
```

---

## 🧭 State Management Choice

**Redux Toolkit + redux-persist** was chosen over plain React Context/`useState` or a data-fetching library alone because the app has genuinely global, deeply-shared state that many unrelated screens read and write — cart contents affect the Shop tab, the Home tab badge, and the Bottom Tab Bar cart counter; Dosha and allergy profile affect Home, Shop, Consultations, and Profile; the offline sync queue is read by `NetworkProvider` (mounted above the navigator) and written from screens several levels deep in the stack. Prop-drilling or a maze of Context providers for this many cross-cutting concerns would be harder to reason about than one predictable store.

- **RTK's `createSlice` / `createAsyncThunk`** removes the classic Redux boilerplate (hand-written action types, action creators, and switch-based reducers) — each domain (`cartSlice`, `consultationsSlice`, `productsSlice`, `healthRecordsSlice`, `patientProfileSlice`, `authSlice`, `syncQueue`) is a single file with co-located reducers, actions, and async thunks, using Immer under the hood so reducers can be written as if state were mutable.
- **`redux-persist`** gives offline-first persistence "for free" via a `whitelist` (`auth`, `cart`, `wishlist`, `syncQueue`, `healthRecords`, `patientProfile` — see `src/store/index.ts`) instead of hand-rolling `AsyncStorage.getItem`/`setItem` calls in every feature slice. One `PersistGate` in `App.tsx` blocks rendering until rehydration completes, and every whitelisted slice survives app restarts automatically.
- **Trade-off accepted**: this means more re-render surface than a fully normalized/selector-optimized store would have, and the whitelist is coarse-grained rather than a dedicated cache layer (see Trade-offs Made below) — but for an app this size, the simplicity win outweighs the cost.

---

## 📂 Comprehensive Directory & Folder Structure

```
frontend-new/
├── android/                         # Native Android project files
│   └── app/src/main/
│       ├── AndroidManifest.xml      # Camera, Mic, NetworkState, Biometric permissions
│       └── java/                    # Native Android application & main activity
├── ios/                             # Native iOS project & Podfile (macOS)
├── src/
│   ├── api/                         # Mock network layer & HTTP clients
│   │   ├── client.ts                # Axios instance with interceptors
│   │   ├── errorMapper.ts           # Standardized clinical error mappings
│   │   └── mockServer.ts            # High-performance in-memory mock engine (5k docs, 20k remedies)
│   ├── app/
│   │   └── RootErrorBoundary.tsx    # Global React error boundary with fallback recovery
│   ├── design-system/               # Ayurvedic Medical Design System
│   │   ├── components/              # Core reusable UI primitives & SVGs
│   │   │   ├── Badge.tsx            # Dosha, certification, and discount chips
│   │   │   ├── BadgeSeal.tsx        # 100% Ayurvedic verification seal
│   │   │   ├── BiometricPromptModal.tsx # Medical-grade FaceID/Fingerprint authentication modal
│   │   │   ├── Button.tsx           # Standard button with safe high-contrast typography
│   │   │   ├── Card.tsx             # Surface card with border and elevation tokens
│   │   │   ├── Chip.tsx             # Specialty, city, and filter chips
│   │   │   ├── DashedDivider.tsx    # SVG dashed line separator
│   │   │   ├── DeliveryInstructionChips.tsx # SVG delivery instruction chips (ported from mobilev2)
│   │   │   ├── EmptyState.tsx       # State placeholder for empty lists & search misses
│   │   │   ├── GradientButton.tsx   # Solid-color primary CTA button (flat, safe contrast — no SVG/gradient)
│   │   │   ├── LeafPatternBackground.tsx # Botanical decorative background
│   │   │   ├── ProgressRing.tsx     # Circular progress indicator for slot availability
│   │   │   ├── RadialGlowBackground.tsx # Radiant glow background overlay
│   │   │   ├── SearchBar.tsx        # Reusable search bar with clear button
│   │   │   ├── SectionHeader.tsx    # Header with title, subtitle, and action link
│   │   │   ├── ShimmerPlaceholder.tsx # Animated skeleton loading state
│   │   │   ├── TimelineConnector.tsx # Vertical SVG connector for medical timeline
│   │   │   ├── Toast.tsx            # Toastify wrapper for success/error/info toasts
│   │   │   ├── UpdateRequiredModal.tsx # Force/soft app-update popup (Firebase Remote Config gated)
│   │   │   ├── WaveDivider.tsx      # Botanical SVG wave curve
│   │   │   └── ZAxisHeroBanner.tsx  # Dual-layer hero carousel with depth animation
│   │   ├── theme/                   # Theme tokens and provider
│   │   │   ├── colors.ts            # Light and dark palettes with Amrutam green & gold
│   │   │   ├── spacing.ts           # Consistent spacing (4, 8, 12, 16, 24, 32) and radiuses
│   │   │   ├── typography.ts        # Modular typography scales
│   │   │   └── ThemeProvider.tsx    # Theme context provider (defaults to LIGHT mode)
│   │   └── index.ts                 # Design system barrel export
│   ├── features/
│   │   ├── consultations/           # Doctor consultations & appointment booking
│   │   │   ├── components/
│   │   │   │   ├── DoctorCard.tsx   # Doctor card with portrait, specialty, rating, fee & spacing (first-in-list gets a featured hero-photo layout)
│   │   │   │   └── SlotGrid.tsx     # Slot selector with past-time strikethrough & night slots
│   │   │   ├── data/
│   │   │   │   └── mockDoctors.ts   # 5,000 doctor generator & slot generator (up to 11:30 PM)
│   │   │   ├── screens/
│   │   │   │   ├── BookingScreen.tsx # Slot reservation with patient notes & success toast
│   │   │   │   ├── DoctorDetailScreen.tsx # Full Vaidya profile, qualifications & reviews
│   │   │   │   ├── DoctorListScreen.tsx # Searchable, filterable 5,000 doctor directory
│   │   │   │   └── MyConsultationsScreen.tsx # Booked appointments & join video consultation
│   │   │   ├── store/
│   │   │   │   └── consultationsSlice.ts # Redux slice for doctors, slots, and bookings
│   │   │   └── types.ts             # Doctor, Slot, and Booking TypeScript interfaces
│   │   ├── shop/                    # Ayurvedic pharmacy & e-commerce
│   │   │   ├── components/
│   │   │   │   ├── CartLineItem.tsx # Stepper, item thumbnail, and allergy alert
│   │   │   │   └── ProductCard.tsx  # 2-column product card with price & Sanskrit names
│   │   │   ├── data/
│   │   │   │   └── mockProducts.ts  # 20,000 classical botanical formulations generator
│   │   │   ├── screens/
│   │   │   │   ├── CartScreen.tsx   # Shopping cart with coupon engine & checkout CTA
│   │   │   │   ├── CheckoutScreen.tsx # Delivery instructions (SVGs), payment methods & confirmation
│   │   │   │   ├── ProductDetailScreen.tsx # Ingredients, Dravyaguna, and allergy collision alerts
│   │   │   │   ├── ProductListScreen.tsx # 2-column infinite scrolling catalog
│   │   │   │   └── WishlistScreen.tsx # Saved remedies screen
│   │   │   └── store/
│   │   │       ├── cartSlice.ts     # Cart items, quantity, coupons, and delivery fee
│   │   │       ├── productsSlice.ts # Products catalog and search/filter state
│   │   │       └── wishlistSlice.ts # Wishlisted items slice
│   │   └── health-records/          # Encrypted AYUSH medical records
│   │       ├── components/
│   │       │   ├── MonthSectionHeader.tsx # Chronological month-year grouping header
│   │       │   └── TimelineEntry.tsx # Record card with Nadi stats & prescription reorder
│   │       ├── data/
│   │       │   └── mockHealthRecords.ts # 10,000 records generator (prescriptions, labs, diet)
│   │       ├── screens/
│   │       │   ├── RecordDetailScreen.tsx # Diagnostic details, Vitals, and attachments
│   │       │   └── TimelineScreen.tsx # Chronological clinical timeline (records only — vault lock now lives at app root)
│   │       └── store/
│   │           └── healthRecordsSlice.ts # Health records Redux slice
│   ├── i18n/                        # Internationalization
│   │   ├── en.json                  # English translations for all screens and modules
│   │   ├── hi.json                  # Hindi translations for all screens and modules
│   │   └── index.ts                 # i18next initialization with react-i18next
│   ├── navigation/                  # React Navigation v7 setup
│   │   ├── AppNavigator.tsx         # Root stack and bottom tab navigation
│   │   ├── BottomTabBar.tsx         # Custom bottom tab bar with dynamic safe area insets
│   │   ├── linking.ts               # Deep linking configuration
│   │   └── types.ts                 # Navigation route parameters TypeScript definitions
│   ├── offline/                     # Offline engine & sync
│   │   ├── NetworkProvider.tsx      # Connectivity listener, offline banner & sync drain popup
│   │   └── syncQueue.ts             # Offline action queue with retry logic
│   ├── screens/                     # Global screens
│   │   ├── DoshaQuizScreen.tsx      # 5-question Prakriti evaluation quiz
│   │   ├── HomeScreen.tsx           # Home dashboard with hero carousel & quick actions
│   │   ├── ProfileScreen.tsx        # User profile, theme mode, language switch & biometrics
│   │   └── TeleconsultationRoomScreen.tsx # 1-on-1 HD encrypted video consultation room
│   ├── shared/                      # Shared hooks, utilities, and security
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts       # Debounce hook for search queries
│   │   │   ├── usePatientAllergies.ts # Cross-module allergy collision detector
│   │   │   └── usePressScale.ts     # Micro-interaction press animation
│   │   ├── logging/
│   │   │   └── logger.ts            # Clinical action audit logger
│   │   ├── patientProfile/
│   │   │   └── patientProfileSlice.ts # Patient profile, Dosha, language, and biometrics
│   │   ├── remoteConfig/
│   │   │   └── RemoteConfigService.ts # Firebase Remote Config fetch + semver-style version compare
│   │   └── security/
│   │       ├── authSlice.ts         # User authentication state
│   │       └── BiometricService.ts  # Real react-native-biometrics wrapper (isSensorAvailable & simplePrompt, no fake fallback)
│   └── store/                       # Redux store configuration
│       ├── hooks.ts                 # Typed useAppDispatch and useAppSelector
│       └── index.ts                 # configureStore with redux-persist AsyncStorage whitelist
├── App.tsx                          # Application root with Providers and i18n init
├── index.js                         # React Native app entry point
└── package.json                     # Project dependencies & scripts
```

---

## ⚡ Key Feature Implementations & Enhancements

### 1. Consistent SafeArea Handling
- **Tab Screens** (`HomeScreen`, `DoctorListScreen`, `ProductListScreen`, `TimelineScreen`, `ProfileScreen`): Use `useSafeAreaInsets().top` to avoid notch/status bar collisions.
- **Nested Stack Screens** (`DoctorDetailScreen`, `BookingScreen`, `CartScreen`, `CheckoutScreen`, etc.): Rely on native stack headers for top padding, avoiding redundant top spacing. Apply `useSafeAreaInsets().bottom` to sticky bottom CTAs.
- **BottomTabBar**: Dynamically calculates `height: 58 + insets.bottom` with bottom padding to ensure navigation icons never overlap with modern Android navigation pills or iOS home indicators.

### 2. Default Theme Light Mode
- `ThemeProvider.tsx` initiates with `mode = 'light'`.
- Supports manual toggle between **Light**, **Dark**, and **System** in `ProfileScreen`.

### 3. Comprehensive English & Hindi i18n
- Complete translations in `src/i18n/en.json` and `src/i18n/hi.json`.
- Dynamic language switching in `ProfileScreen` via `i18n.changeLanguage()` with Redux persistence.

### 4. Biometric Vault Lock (real device authentication, gated at app root)
- Ported from `BRKCARTAPP`'s `react-native-biometrics` pattern (`isSensorAvailable` & `simplePrompt`), but the package was previously declared in `package.json` and never actually installed — `BiometricService.ts` silently caught the failed `require()` and returned `{ success: true }` unconditionally, so the old flow was a fake, always-passing popup.
- Now genuinely installed and wired: `BiometricPromptModal.tsx` checks real sensor availability on open (`checking` → `ready`/`unavailable` → `authenticating` → `success`/`error`), shows the device's actual FaceID/Fingerprint/Biometrics prompt, and offers retry on failure instead of silently passing.
- **Gated at the app root, not per-screen**: `App.tsx` checks `patientProfile.biometricsEnabled` before mounting `NavigationContainer`/`AppNavigator` at all — while locked, the entire app is replaced by the full-screen `BiometricPromptModal` (matching `BRKCARTAPP`'s app-launch lock), not just the Health Records tab it originally gated. `TimelineScreen.tsx` no longer has its own biometric check.
- Unlike `BRKCARTAPP` (which hard-kills the app on failure with no escape), cancelling or failing at the root here disables the lock and lets the user in (`dispatch(setBiometricsEnabled(false))`) rather than stranding them — since this is a demo app with no PIN fallback, a dead-end lock would just brick it for anyone without enrolled biometrics. A toast confirms the lock was turned off and that it can be re-enabled from Profile.
- Native permissions declared for real hardware access: `NSFaceIDUsageDescription` (`ios/PulseChatApp/Info.plist`) and `USE_BIOMETRIC`/`USE_FINGERPRINT` (`android/app/src/main/AndroidManifest.xml`).

### 5. Flat, High-Contrast Buttons (no SVG gradients)
- `GradientButton.tsx` previously rendered an `react-native-svg` linear-gradient `<Rect>` inside a full pill (999px radius) container — a green, elliptical/stadium-shaped CTA used across 13 screens (cart, checkout, biometric modal, product detail, etc.).
- Rewritten to a plain flat `Pressable` with a solid background color and standard rounded corners (`radius.md`), matching `Button.tsx`'s primary variant — same external API, so every screen using it updated automatically.
- `Button.tsx` and `GradientButton.tsx` both enforce high-contrast `#FFFFFF` typography with minimum 46-48px touch targets, ensuring text is clearly visible in both light and dark modes.

### 6. DoctorCard Horizontal Margins
- Added `marginHorizontal: spacing.lg` in `DoctorCard.tsx` so cards maintain comfortable padding on all screen sizes.

### 7. Slot Grid Past-Time Strikethrough & Night Slots
- Added night slots up to 11:30 PM in `mockDoctors.ts`.
- `SlotGrid.tsx` automatically detects whether a slot's time has already passed today and renders strikethrough text with disabled state.

### 8. Delivery Instructions Card (Ported from mobilev2)
- `DeliveryInstructionChips.tsx` implements native SVGs for:
  - *Leave at door* (`DoorstepIcon`)
  - *Ring the bell* (`RingBellIcon`)
  - *Call on arrival* (`CallBeforeIcon`)
  - *Other instructions* (`InstructionNoteIcon` with expandable instruction text input)
- Fully integrated into `CheckoutScreen.tsx` along with address, payment selection, and confirmation flow.

### 9. Offline Engine & Toastify Notifications
- `NetworkProvider.tsx` displays an offline banner when disconnected.
- When transitioning from offline to online with queued actions, it displays a visual draining banner and fires `showToast.info` / `showToast.success` via `toastify-react-native`.

### 10. Featured First Doctor Card
- `DoctorListScreen.tsx` passes `featured={index === 0}` into `DoctorCard.tsx` via `FlatList`'s `renderItem`, so the first doctor in whatever list is currently showing (default, filtered, or searched) always gets a distinct treatment.
- The featured card swaps the small 62×62 circular avatar every other card uses for a full-width 150px hero photo banner with a "TOP RATED VAIDYA" badge overlay.

### 11. Remote Config Force/Soft Update Modal
- Ported from `customer-app`'s `SplashScreen.tsx` pattern using `@react-native-firebase/remote-config` (reusing the same Firebase app already initialized for FCM push — no extra native setup needed on Android) and `react-native-device-info` for the installed app version.
- `RemoteConfigService.ts` fetches 4 platform-specific keys (`{platform}_min_version`, `{platform}_latest_version`, `{platform}_store_url`) with a 12-hour minimum fetch interval, and does a simple major.minor.patch comparison against the installed version.
- Unlike the source app — which tracked an `isRequired` flag but never enforced it (both "Skip" and "Update Now" always rendered) — this port distinguishes two real states: below `min_version` is a **hard** force-update (only "Update Now", no dismiss, back button no-ops) via `UpdateRequiredModal.tsx`; below `latest_version` but above `min_version` is a **soft** nudge (adds a "Later" button).
- Checked once on launch from `App.tsx`. Requires the remote-config keys to be created in the Firebase console (same project as `google-services.json`) — until then it silently falls back to the in-code defaults and shows nothing.

---

## 📦 Key Dependencies & Why They're Used

| Package | Used for |
|---|---|
| `@react-navigation/native`, `-/stack`, `-/bottom-tabs`, `-/elements` | Root stack + bottom tab navigation (`AppNavigator.tsx`, `BottomTabBar.tsx`), deep linking (`linking.ts`). |
| `react-native-screens`, `react-native-gesture-handler` | Required peer dependencies of React Navigation — native screen optimization and swipe-back gestures. Not imported directly by app code, but needed for navigation to work. |
| `@reduxjs/toolkit`, `react-redux` | App state — one slice per domain (`cartSlice`, `consultationsSlice`, `healthRecordsSlice`, `patientProfileSlice`, `authSlice`, etc.), combined in `src/store/index.ts`. |
| `redux-persist`, `@react-native-async-storage/async-storage` | Persists a whitelisted subset of Redux state (auth, cart, wishlist, syncQueue, healthRecords, patientProfile) to on-device storage so it survives app restarts; wired via `PersistGate` in `App.tsx`. |
| `axios` | HTTP client for backend API calls (`src/api/client.ts`), with interceptors and standardized error mapping. |
| `@react-native-community/netinfo` | Detects online/offline transitions to drive `NetworkProvider.tsx`'s offline banner and offline-action-queue draining. |
| `i18next`, `react-i18next` | English/Hindi translations (`src/i18n/en.json`, `hi.json`) and the language switch in `ProfileScreen.tsx`. |
| `react-native-svg` | Custom vector graphics used throughout the design system — `ProgressRing`, `TimelineConnector`, `RadialGlowBackground`, `LeafPatternBackground`, `WaveDivider`, `DashedDivider`, `BadgeSeal`, `DeliveryInstructionChips`, `ZAxisHeroBanner`. |
| `lucide-react-native` | The app's icon set — used across 27+ files (every screen and most design-system components). |
| `toastify-react-native` | Success/error/info toast notifications, wrapped by `Toast.tsx` and mounted globally in `App.tsx`. |
| `react-native-biometrics` | Real FaceID/Fingerprint/Biometrics device authentication for the Health Vault Lock (`BiometricService.ts`, see §4 above). |
| `@react-native-firebase/app`, `-/messaging` | Firebase app init + push notifications (FCM). |
| `@react-native-firebase/remote-config`, `react-native-device-info` | The force/soft app-update modal (§11 above) — fetches remote version thresholds and reads the installed app version to compare against them. |
| `@d11/react-native-fast-image` | Optional faster `<Image>` used only in `ZAxisHeroBanner.tsx`, loaded defensively via `require()` with a fallback to core RN `Image` if unavailable. |

### Installed but not currently used by the active app
A few packages remain in `package.json` from earlier iterations and aren't imported anywhere in the current `src/` tree — flagged here for honesty rather than silently carried:
- `@shopify/flash-list`, `dayjs`, `react-native-linear-gradient`, `react-native-vector-icons` — no imports anywhere.
- `react-native-reanimated`, `react-native-worklets` — the Babel worklets plugin is wired in `babel.config.js`, but no component actually uses Reanimated.
- `@react-native-google-signin/google-signin`, `react-native-image-crop-picker`, `react-native-video`, `socket.io-client` — only referenced by the orphaned `src_temp/` folder (the original "pulse chat app" this project was repurposed from), which nothing in the active `src/` tree imports.

These are safe to remove if you want a leaner `node_modules`, or safe to leave if you expect to reuse them later — neither choice affects the app as it stands today.

---

## ⚙️ Performance Optimizations

The three core modules generate 5,000 / 20,000 / 10,000 mock records respectively, so list performance was treated as a first-class concern rather than an afterthought:

- **`FlatList` virtualization everywhere** — `DoctorListScreen`, `ProductListScreen`, `WishlistScreen`, `CartScreen`, `MyConsultationsScreen`, and `TimelineScreen` (Health Records) all render their data through `FlatList` instead of `ScrollView.map()`, so only the rows near the viewport are mounted at once regardless of dataset size.
- **Pagination instead of loading full datasets** — `fetchDoctors`, `fetchProducts`, and `fetchHealthRecords` thunks fetch page-by-page (`onEndReached` / `onEndReachedThreshold={0.5}` triggers the next page) rather than pulling all 5k/20k/10k records into memory and Redux state up front.
- **`React.memo` on card/row components** — `DoctorCard`, `ProductCard`, `CartLineItem`, and `TimelineEntry` are wrapped in `React.memo` so a `FlatList` re-render (e.g. from an unrelated Redux state change) doesn't re-render every visible row, only the ones whose props actually changed.
- **`useCallback` on `renderItem` and list handlers** — `renderItem`, `handleRefresh`, and similar handlers passed to `FlatList` are memoized with `useCallback` in `DoctorListScreen`, `ProductListScreen`, `CartScreen`, `WishlistScreen`, and `TimelineScreen`, so `FlatList` doesn't see a new function identity (and skip its own internal memoization) on every parent render.
- **`useMemo` for derived/grouped data** — `TimelineScreen`'s month-year grouping of health records (`groupedData`) is computed with `useMemo`, keyed on the records array, so the O(n) grouping pass over up to 10,000 records only reruns when the underlying data actually changes, not on every render.
- **Debounced search** — `useDebounce` (300ms) sits between the search `TextInput` and the Redux dispatch in `DoctorListScreen` and `ProductListScreen`, so typing doesn't fire a new filtered fetch/render pass on every keystroke.

---

## 📡 Offline Strategy

The app is designed to stay usable — not just show an error — when connectivity drops mid-session:

- **`redux-persist` whitelist** (`src/store/index.ts`) persists `auth`, `cart`, `wishlist`, `syncQueue`, `healthRecords`, and `patientProfile` to `AsyncStorage`, so cart contents, wishlist, and queued offline actions all survive an app restart, not just a network drop.
- **Offline action queue** (`src/offline/syncQueue.ts`) — a dedicated Redux slice (`queue: QueuedAction[]`) that any feature can push typed actions onto (currently `BOOK_CONSULTATION`, with `SYNC_CART`/`UPLOAD_RECORD` reserved for the same pattern) via `enqueueAction`. Each queued action tracks `retryCount` and `createdAt`, so failed replays can be retried instead of silently dropped.
- **`NetworkProvider`'s real replay-on-reconnect logic** (`src/offline/NetworkProvider.tsx`) — listens for the offline→online transition via `@react-native-community/netinfo`, then replays every queued action against the *real* Redux thunks (e.g. `bookConsultationSlot`), one at a time. This was recently changed from a fake fixed-delay timer to a genuine per-action replay: each action either succeeds (dequeued, offline placeholder removed) or fails (left in the queue with `retryCount` incremented for the next reconnect attempt), and the drain banner/toast reflects the real "X of Y synced" outcome rather than an assumed 100% success.
- **Offline booking placeholders** — booking while offline (`BookingScreen.handleConfirmBooking`) immediately creates a local booking with `status: 'pending_sync'` via `addOfflineBooking`, shown in `MyConsultationsScreen` with an "OFFLINE QUEUE" badge, so the user sees their action reflected instantly instead of staring at a spinner or an error. Once the queued `BOOK_CONSULTATION` action replays successfully, the placeholder is removed and replaced by the confirmed booking from the thunk.
- **Offline banner** — a persistent banner renders while `isConnected` is false (`NetworkProvider`), and a separate "draining N offline tasks" banner renders during the replay pass, so the user always has visibility into current sync state.

---

## ⚖️ Trade-offs Made

Being upfront about the corners cut for a take-home-scale project rather than a production app:

- **Mock server instead of a real backend** (`src/api/mockServer.ts`) — chosen for fast iteration and zero infrastructure dependency (no server to deploy, no database to seed, works fully offline in development). The trade-off: true network conditions — real timeouts, DNS failures, TLS errors, backend-side race conditions — aren't exercised, since the mock server runs in-process and always "succeeds" or "fails" deterministically rather than the messier ways real networks fail.
- **Broad `redux-persist` whitelist rather than a normalized cache layer** — persisting whole slices (`cart`, `wishlist`, `healthRecords`, etc.) as-is is simpler than building a normalized entity-adapter cache with fine-grained invalidation, but it means larger AsyncStorage payloads and coarser rehydration than a purpose-built offline cache would give.
- **Localization covers UI chrome + a handful of curated names, not the full generated dataset** — `src/i18n/en.json`/`hi.json` translate every screen's static text, and a curated subset of doctor/product names ship with `nameHi` fields, but the full 5,000/20,000/10,000 procedurally-generated mock records are not individually translated. Machine-translating or hand-authoring Hindi strings for every generated record isn't a realistic scope for a demo dataset this size — the curated subset demonstrates the i18n pattern without pretending the entire mock catalog is production-localized content.
- **No real authentication/login screen** — `authSlice` holds a pre-populated demo user rather than gating the app behind a sign-up/login flow. This is a deliberate scope decision: the assignment centers on the Consultations, Shop, and Health Records modules, and a real auth flow (password reset, token refresh, session expiry) would add surface area without exercising anything those three modules are meant to demonstrate.

---

## 🔭 Future Improvements

- **Normalized entity-adapter state** (RTK's `createEntityAdapter`) instead of array-based slices for the largest lists (doctors, products, health records), for O(1) lookups and more surgical re-renders at scale.
- **A real backend + auth flow** — replacing `mockServer.ts` with an actual API and adding sign-up/login/session management.
- **Full end-to-end test suite** run against a real device/simulator (Detox or Maestro), complementing the current unit/reducer/hook-level Jest coverage.
- **Background sync** — the current offline queue only drains when the app is foregrounded and detects a reconnect; a production version would use a background task/headless JS to sync even while the app isn't active.
- **Crash reporting integration** (e.g. Sentry or Firebase Crashlytics) — there's currently no centralized crash/error telemetry beyond local console warnings and the `RootErrorBoundary` fallback UI.
- **A feature flag system beyond the current remote-config version-gate** — `RemoteConfigService.ts` today only drives the force/soft update modal; a fuller feature-flagging setup would let individual features be toggled remotely without an app release.

---

## 🚀 Running the Project

```bash
# 1. Navigate to frontend-new
cd frontend-new

# 2. Start Metro Bundler
npm start

# 3. Build & Run Android APK
npm run android
```
