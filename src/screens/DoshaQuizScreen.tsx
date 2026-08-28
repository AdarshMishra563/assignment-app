import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Sparkles, Wind, Flame, Mountain } from 'lucide-react-native';
import { useAppDispatch } from '../store/hooks';
import { Dosha, setDosha } from '../shared/patientProfile/patientProfileSlice';
import { useColor } from '../design-system/theme/ThemeProvider';
import { radius, spacing } from '../design-system/theme/spacing';
import { typography } from '../design-system/theme/typography';
import { Card } from '../design-system/components/Card';
import { GradientButton } from '../design-system/components/GradientButton';
import { RadialGlowBackground } from '../design-system/components/RadialGlowBackground';
import { showToast } from '../design-system/components/Toast';

interface Question {
  id: number;
  question: string;
  options: {
    label: string;
    dosha: Dosha;
    description: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'How would you describe your body frame and bone structure?',
    options: [
      { label: 'Slender & Light', dosha: 'vata', description: 'Hard to gain weight, prominent joints' },
      { label: 'Medium & Athletic', dosha: 'pitta', description: 'Moderate muscle tone, easy weight balance' },
      { label: 'Solid & Broad', dosha: 'kapha', description: 'Heavy bone structure, gains weight easily' },
    ],
  },
  {
    id: 2,
    question: 'How does your digestive fire (Agni) typically behave?',
    options: [
      { label: 'Irregular & Gassy', dosha: 'vata', description: 'Sometimes high appetite, sometimes none; bloating' },
      { label: 'Sharp & Intense', dosha: 'pitta', description: 'Strong appetite, irritates if meals are delayed' },
      { label: 'Slow & Steady', dosha: 'kapha', description: 'Can easily skip meals, heavy digestion' },
    ],
  },
  {
    id: 3,
    question: 'How would you describe your natural skin quality?',
    options: [
      { label: 'Dry & Cool', dosha: 'vata', description: 'Prone to roughness, chapping, or dullness' },
      { label: 'Warm & Sensitive', dosha: 'pitta', description: 'Prone to redness, freckles, or breakouts' },
      { label: 'Smooth & Oily', dosha: 'kapha', description: 'Thick, hydrated, glowing, cool to touch' },
    ],
  },
  {
    id: 4,
    question: 'Under psychological stress or work pressure, you tend to feel:',
    options: [
      { label: 'Anxious & Restless', dosha: 'vata', description: 'Overthinking, racing mind, difficulty falling asleep' },
      { label: 'Irritable & Impatient', dosha: 'pitta', description: 'Frustrated, critical, demanding perfection' },
      { label: 'Withdrawn & Sluggish', dosha: 'kapha', description: 'Resistance to change, procrastination, lethargy' },
    ],
  },
  {
    id: 5,
    question: 'What weather or climate conditions do you tolerate best?',
    options: [
      { label: 'Warm & Humid', dosha: 'vata', description: 'Cold and wind make you stiff and uncomfortable' },
      { label: 'Cool & Well-Ventilated', dosha: 'pitta', description: 'Direct sun and humid heat exhaust you quickly' },
      { label: 'Warm & Dry', dosha: 'kapha', description: 'Damp and cold weather causes congestion' },
    ],
  },
];

export const DoshaQuizScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const dispatch = useAppDispatch();

  const [answers, setAnswers] = useState<Record<number, Dosha>>({
    1: 'pitta',
    2: 'pitta',
    3: 'vata',
  });

  const handleSelect = (questionId: number, dosha: Dosha) => {
    setAnswers((prev) => ({ ...prev, [questionId]: dosha }));
  };

  const handleCalculateDosha = () => {
    const counts: Record<Dosha, number> = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(answers).forEach((d) => {
      counts[d] += 1;
    });

    let winningDosha: Dosha = 'pitta';
    let max = 0;
    (Object.keys(counts) as Dosha[]).forEach((d) => {
      if (counts[d] > max) {
        max = counts[d];
        winningDosha = d;
      }
    });

    dispatch(setDosha(winningDosha));
    showToast.success(`Your Prakriti is diagnosed as ${winningDosha.toUpperCase()}! Personalizing your experience.`);
    navigation.goBack();
  };

  const isComplete = Object.keys(answers).length === QUESTIONS.length;

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
        {/* Top Hero Banner */}
        <View style={styles.hero}>
          <RadialGlowBackground color={COLOR.primary} opacity={0.15} />
          <Sparkles size={36} color={COLOR.accent} style={{ marginBottom: spacing.xs }} />
          <Text style={[typography.title, { color: COLOR.text, textAlign: 'center' }]}>
            Determine Your Prakriti (Dosha)
          </Text>
          <Text style={[typography.caption, { color: COLOR.textMuted, textAlign: 'center', marginTop: 4, paddingHorizontal: spacing.md }]}>
            Answer 5 clinical questions based on Charaka Samhita to discover your dominant bio-energy.
          </Text>
        </View>

        {/* Questions */}
        {QUESTIONS.map((q) => {
          const selected = answers[q.id];

          return (
            <Card key={q.id} style={styles.questionCard}>
              <Text style={[typography.label, { color: COLOR.accent }]}>QUESTION {q.id} OF 5</Text>
              <Text style={[typography.subtitle, { color: COLOR.text, marginTop: 4, marginBottom: spacing.sm }]}>
                {q.question}
              </Text>

              {q.options.map((opt) => {
                const isSelected = selected === opt.dosha;

                return (
                  <Pressable
                    key={opt.dosha}
                    onPress={() => handleSelect(q.id, opt.dosha)}
                    style={[
                      styles.optionTile,
                      {
                        backgroundColor: isSelected ? COLOR.surfaceAlt : COLOR.surface,
                        borderColor: isSelected ? COLOR.primary : COLOR.border,
                      },
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionLabelRow}>
                        <Text style={[typography.subtitle, { color: COLOR.text, fontSize: 14 }]}>
                          {opt.label}
                        </Text>
                        <Text style={[typography.label, { color: COLOR.primary, textTransform: 'uppercase' }]}>
                          ({opt.dosha})
                        </Text>
                      </View>
                      <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 2 }]}>
                        {opt.description}
                      </Text>
                    </View>
                    {isSelected ? (
                      <CheckCircle2 size={18} color={COLOR.primary} style={{ marginLeft: spacing.sm }} />
                    ) : null}
                  </Pressable>
                );
              })}
            </Card>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: COLOR.surface,
            borderColor: COLOR.border,
            paddingBottom: insets.bottom ? insets.bottom + spacing.sm : spacing.md,
          },
        ]}
      >
        <GradientButton
          title={isComplete ? 'Analyze & Save My Dosha' : 'Answer all 5 questions to save'}
          onPress={handleCalculateDosha}
          disabled={!isComplete}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  questionCard: {
    marginBottom: spacing.md,
  },
  optionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: spacing.xs + 2,
  },
  optionContent: {
    flex: 1,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
  },
});
