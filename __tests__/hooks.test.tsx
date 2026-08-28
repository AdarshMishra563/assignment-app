import React from 'react';
import { act, create } from 'react-test-renderer';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { useDebounce } from '../src/shared/hooks/useDebounce';
import { usePatientAllergies } from '../src/shared/hooks/usePatientAllergies';
import { usePressScale } from '../src/shared/hooks/usePressScale';
import patientProfileReducer from '../src/shared/patientProfile/patientProfileSlice';
import healthRecordsReducer from '../src/features/health-records/store/healthRecordsSlice';
import { HealthRecord } from '../src/features/health-records/types';

// ---------------------------------------------------------------------------
// useDebounce
// ---------------------------------------------------------------------------

describe('useDebounce', () => {
  function DebounceHarness({
    value,
    delay,
    onValue,
  }: {
    value: string;
    delay: number;
    onValue: (v: string) => void;
  }) {
    const debounced = useDebounce(value, delay);
    onValue(debounced);
    return null;
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately, without waiting for the debounce interval', () => {
    let latest = '';
    act(() => {
      create(<DebounceHarness value="amrutam" delay={300} onValue={(v) => (latest = v)} />);
    });

    expect(latest).toBe('amrutam');
  });

  it('delays updating the returned value until after the debounce interval elapses', () => {
    let latest = '';
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<DebounceHarness value="ash" delay={300} onValue={(v) => (latest = v)} />);
    });
    expect(latest).toBe('ash');

    // Change the input value — the debounced output should NOT update right away.
    act(() => {
      renderer.update(<DebounceHarness value="ashwagandha" delay={300} onValue={(v) => (latest = v)} />);
    });
    expect(latest).toBe('ash');

    // Advance time short of the delay — still should not have updated.
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(latest).toBe('ash');

    // Advance past the delay — now it should reflect the latest value.
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(latest).toBe('ashwagandha');
  });

  it('resets the timer on rapid successive changes (only the final value is committed)', () => {
    let latest = '';
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(<DebounceHarness value="a" delay={300} onValue={(v) => (latest = v)} />);
    });

    act(() => {
      renderer.update(<DebounceHarness value="as" delay={300} onValue={(v) => (latest = v)} />);
      jest.advanceTimersByTime(150);
      renderer.update(<DebounceHarness value="ash" delay={300} onValue={(v) => (latest = v)} />);
      jest.advanceTimersByTime(150);
      renderer.update(<DebounceHarness value="ashw" delay={300} onValue={(v) => (latest = v)} />);
    });

    // None of the intermediate values should have committed yet.
    expect(latest).toBe('a');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(latest).toBe('ashw');
  });
});

// ---------------------------------------------------------------------------
// usePatientAllergies
// ---------------------------------------------------------------------------

describe('usePatientAllergies', () => {
  function AllergiesHarness({ onValue }: { onValue: (v: string[]) => void }) {
    const allergies = usePatientAllergies();
    onValue(allergies);
    return null;
  }

  const makeRecord = (overrides: Partial<HealthRecord>): HealthRecord => ({
    id: 'r1',
    type: 'prescription',
    title: 'Test Record',
    doctorName: 'Dr. Test',
    date: new Date().toISOString(),
    notes: '',
    tags: [],
    ...overrides,
  });

  function buildStore(opts: { profileAllergies: string[]; records: HealthRecord[] }) {
    const patientProfileDefault = patientProfileReducer(undefined, { type: '@@INIT' });
    const healthRecordsDefault = healthRecordsReducer(undefined, { type: '@@INIT' });

    return configureStore({
      reducer: {
        patientProfile: patientProfileReducer,
        healthRecords: healthRecordsReducer,
      },
      preloadedState: {
        patientProfile: { ...patientProfileDefault, allergies: opts.profileAllergies },
        healthRecords: { ...healthRecordsDefault, records: opts.records },
      },
    });
  }

  it('returns the patient profile allergy list when there are no allergy-type health records', () => {
    const store = buildStore({
      profileAllergies: ['Peanuts', 'Gluten'],
      records: [makeRecord({ id: 'r1', type: 'prescription', tags: ['Digestive'] })],
    });

    let latest: string[] = [];
    act(() => {
      create(
        <Provider store={store}>
          <AllergiesHarness onValue={(v) => (latest = v)} />
        </Provider>
      );
    });

    expect(latest).toEqual(['Peanuts', 'Gluten']);
  });

  it('merges profile allergies with tags from allergy-type health records, deduping and dropping the literal "allergy" tag', () => {
    const store = buildStore({
      profileAllergies: ['Peanuts', 'Gluten'],
      records: [
        makeRecord({ id: 'r1', type: 'allergy', tags: ['allergy', 'Shellfish', 'Peanuts'] }),
        makeRecord({ id: 'r2', type: 'prescription', tags: ['Not An Allergy Tag'] }),
      ],
    });

    let latest: string[] = [];
    act(() => {
      create(
        <Provider store={store}>
          <AllergiesHarness onValue={(v) => (latest = v)} />
        </Provider>
      );
    });

    // Combined, deduped set of profile allergies + allergy-record tags.
    expect(latest).toEqual(expect.arrayContaining(['Peanuts', 'Gluten', 'Shellfish']));
    expect(latest).not.toContain('allergy');
    expect(latest).not.toContain('Not An Allergy Tag');
    // No duplicate 'Peanuts' entry even though it appears in both sources.
    expect(latest.filter((a) => a === 'Peanuts')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// usePressScale
// ---------------------------------------------------------------------------

describe('usePressScale', () => {
  function PressScaleHarness({ onValue }: { onValue: (v: ReturnType<typeof usePressScale>) => void }) {
    const result = usePressScale();
    onValue(result);
    return null;
  }

  it('returns an animated style plus press handlers without throwing', () => {
    let captured: ReturnType<typeof usePressScale> | undefined;

    expect(() => {
      act(() => {
        create(<PressScaleHarness onValue={(v) => (captured = v)} />);
      });
    }).not.toThrow();

    expect(captured).toBeDefined();
    expect(typeof captured!.onPressIn).toBe('function');
    expect(typeof captured!.onPressOut).toBe('function');
    expect(captured!.animatedStyle).toBeDefined();
    expect(captured!.animatedStyle.transform).toHaveLength(1);
  });

  it('does not throw when the press-in/press-out handlers are invoked', () => {
    let captured: ReturnType<typeof usePressScale> | undefined;

    act(() => {
      create(<PressScaleHarness onValue={(v) => (captured = v)} />);
    });

    expect(() => {
      act(() => {
        captured!.onPressIn();
        captured!.onPressOut();
      });
    }).not.toThrow();
  });
});
