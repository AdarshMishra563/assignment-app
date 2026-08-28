import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { radius, spacing } from '../theme/spacing';

let FastImageComponent: any = null;
try {
  FastImageComponent = require('@d11/react-native-fast-image').default;
} catch {
  FastImageComponent = null;
}

const SafeImage = ({ uri, style }: { uri: string; style: any }) => {
  if (FastImageComponent) {
    return (
      <FastImageComponent
        source={{ uri, priority: FastImageComponent.priority?.normal }}
        resizeMode={FastImageComponent.resizeMode?.cover}
        style={style}
      />
    );
  }
  return <Image source={{ uri }} resizeMode="cover" style={style} />;
};

export type HeroCaption = {
  label?: string;
  title: string;
  subtitle?: string;
  cta?: string;
};

const BASE_BACKGROUND = '#0F130F';

export const ZAxisHeroBanner = ({
  height = 200,
  images,
  captions,
  onPressCaption,
  style,
  fadeDuration = 900,
  holdDuration = 4200,
}: {
  height?: number;
  images: string[];
  captions?: HeroCaption[];
  onPressCaption?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
  fadeDuration?: number;
  holdDuration?: number;
}) => {
  const hasCaptions = Boolean(captions?.length);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [slotA, setSlotA] = useState(images[0] || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800');
  const [slotB, setSlotB] = useState(images[1 % images.length] || images[0]);

  const progress = useRef(new Animated.Value(0)).current;
  const showingA = useRef(true);
  const nextImage = useRef(images.length > 1 ? 2 % images.length : 0);
  const animating = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;
    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled || animating.current) return;
      animating.current = true;
      Animated.timing(progress, {
        toValue: showingA.current ? 1 : 0,
        duration: fadeDuration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        animating.current = false;
        if (cancelled || !finished) return;
        showingA.current = !showingA.current;
        if (hasCaptions) setCaptionIndex((i) => (i + 1) % captions!.length);
        const uri = images[nextImage.current];
        nextImage.current = (nextImage.current + 1) % images.length;
        if (showingA.current) setSlotB(uri);
        else setSlotA(uri);
      });
    }, holdDuration);
    return () => {
      cancelled = true;
      clearInterval(interval);
      progress.stopAnimation();
    };
  }, [progress, images, hasCaptions, captions, fadeDuration, holdDuration]);

  const layers = useMemo(
    () => ({
      opacityA: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
      opacityB: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
      scaleA: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }),
      scaleB: progress.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1] }),
    }),
    [progress]
  );

  const caption = hasCaptions ? captions![captionIndex] : undefined;
  const onPress = useCallback(() => onPressCaption?.(captionIndex), [onPressCaption, captionIndex]);

  return (
    <View style={[styles.container, { height, borderRadius: radius.lg }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: layers.opacityB, transform: [{ scale: layers.scaleB }] },
        ]}
      >
        <SafeImage uri={slotB} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: layers.opacityA, transform: [{ scale: layers.scaleA }] },
        ]}
      >
        <SafeImage uri={slotA} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {caption ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <LinearGradient id="hero-scrim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={BASE_BACKGROUND} stopOpacity={0.1} />
                <Stop offset="0.5" stopColor={BASE_BACKGROUND} stopOpacity={0.4} />
                <Stop offset="1" stopColor={BASE_BACKGROUND} stopOpacity={0.92} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#hero-scrim)" />
          </Svg>
          <View style={styles.caption} pointerEvents="box-none">
            {caption.label ? <Text style={styles.label}>{caption.label}</Text> : null}
            <Text style={styles.title} numberOfLines={2}>
              {caption.title}
            </Text>
            {caption.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {caption.subtitle}
              </Text>
            ) : null}
            {caption.cta ? (
              <Pressable onPress={onPress} style={styles.ctaButton}>
                <Text style={styles.ctaText}>{caption.cta}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: BASE_BACKGROUND },
  caption: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.md },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#D9AE55',
    marginBottom: 4,
  },
  title: { fontSize: 20, lineHeight: 25, fontWeight: '900', color: '#FFFFFF' },
  subtitle: { fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  ctaButton: {
    minHeight: 36,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#1F6E43',
    alignSelf: 'flex-start',
  },
  ctaText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
});
