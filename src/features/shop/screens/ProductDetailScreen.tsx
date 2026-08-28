import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle,
  FlaskConical,
  Heart,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react-native';
import i18n from 'i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProductById } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { GradientButton } from '../../../design-system/components/GradientButton';
import { BadgeSeal } from '../../../design-system/components/BadgeSeal';
import { RadialGlowBackground } from '../../../design-system/components/RadialGlowBackground';
import { showToast } from '../../../design-system/components/Toast';
import { usePatientAllergies } from '../../../shared/hooks/usePatientAllergies';

export const ProductDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { productId } = route.params;
  const COLOR = useColor();
  const dispatch = useAppDispatch();
  const allergies = usePatientAllergies();

  const { selectedProduct, loadingProductDetail } = useAppSelector((state) => state.products);
  const isSaved = useAppSelector((state) =>
    state.wishlist.items.some((p) => p.id === productId)
  );

  useEffect(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  const insets = useSafeAreaInsets();

  if (loadingProductDetail || !selectedProduct) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: COLOR.background }]}>
        <ActivityIndicator size="large" color={COLOR.primary} />
      </View>
    );
  }

  const product = selectedProduct;

  const matchedAllergies = product.allergyTags.filter((tag) =>
    allergies.some((a) => a.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(a.toLowerCase()))
  );
  const hasAllergyConflict = matchedAllergies.length > 0;

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Image & Glow */}
        <View style={[styles.imageHero, { backgroundColor: COLOR.surfaceAlt }]}>
          <RadialGlowBackground color={COLOR.accent} opacity={0.25} />
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />

          {product.isCertified && (
            <View style={styles.certifiedStamp}>
              <BadgeSeal size={56} color={COLOR.primary}>
                <Award size={24} color={COLOR.primary} />
              </BadgeSeal>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Allergy Conflict Alert Banner */}
          {hasAllergyConflict && (
            <View style={[styles.allergyAlert, { backgroundColor: COLOR.dangerSoft, borderColor: COLOR.danger }]}>
              <AlertTriangle size={18} color={COLOR.danger} style={{ marginRight: spacing.xs }} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.subtitle, { color: COLOR.danger, fontSize: 13 }]}>
                  Allergy Conflict Detected
                </Text>
                <Text style={[typography.caption, { color: COLOR.danger }]}>
                  Contains <Text style={{ fontWeight: '800' }}>{matchedAllergies.join(', ')}</Text>, matching your clinical record history.
                </Text>
              </View>
            </View>
          )}

          {/* Title, Sanskrit Name, and Shastra Reference */}
          <View style={styles.titleSection}>
            <View style={styles.categoryRow}>
              <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '800' }]}>
                {product.category}
              </Text>
              {product.isBestSeller && (
                <Badge label="BESTSELLER" variant="accent" style={{ marginLeft: spacing.xs }} />
              )}
            </View>

            <Text style={[typography.title, { color: COLOR.text, marginTop: 4 }]}>
              {i18n.language === 'hi' && product.nameHi ? product.nameHi : product.name}
            </Text>

            {product.sanskritName ? (
              <Text style={[typography.subtitle, { color: COLOR.accent, fontStyle: 'italic', marginTop: 2 }]}>
                {product.sanskritName}
              </Text>
            ) : null}

            {product.shastraReference ? (
              <View style={styles.shastraRow}>
                <BookOpen size={13} color={COLOR.textMuted} style={{ marginRight: 4 }} />
                <Text style={[typography.caption, { color: COLOR.textMuted }]}>
                  Classical Treatise: {product.shastraReference}
                </Text>
              </View>
            ) : null}

            <View style={styles.ratingAndPriceRow}>
              <View style={[styles.ratingPill, { backgroundColor: COLOR.surfaceAlt }]}>
                <Star size={14} color={COLOR.accent} fill={COLOR.accent} />
                <Text style={[typography.subtitle, { color: COLOR.text, marginLeft: 4 }]}>
                  {product.rating.toFixed(1)}
                </Text>
                <Text style={[typography.caption, { color: COLOR.textMuted, marginLeft: 2 }]}>
                  ({product.ratingCount} reviews)
                </Text>
              </View>

              <View style={styles.priceCol}>
                <Text style={[typography.display, { color: COLOR.text, fontSize: 24 }]}>
                  ₹{product.price}
                </Text>
                {discount > 0 && (
                  <Text style={[typography.caption, styles.strikethrough, { color: COLOR.textMuted }]}>
                    ₹{product.originalPrice} ({discount}% off)
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Ayurvedic Pharmacology (Dravyaguna) */}
          {product.ayurvedicPharmacology && (
            <Card style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <FlaskConical size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
                <Text style={[typography.subtitle, { color: COLOR.text }]}>
                  Ayurvedic Pharmacology (Dravyaguna)
                </Text>
              </View>
              <View style={styles.pharmaGrid}>
                <View style={[styles.pharmaBox, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>RASA (TASTE)</Text>
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700', marginTop: 2 }]}>
                    {product.ayurvedicPharmacology.rasa}
                  </Text>
                </View>
                <View style={[styles.pharmaBox, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>GUNA (QUALITY)</Text>
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700', marginTop: 2 }]}>
                    {product.ayurvedicPharmacology.guna}
                  </Text>
                </View>
                <View style={[styles.pharmaBox, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>VIRYA (POTENCY)</Text>
                  <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '800', marginTop: 2 }]}>
                    {product.ayurvedicPharmacology.virya}
                  </Text>
                </View>
                <View style={[styles.pharmaBox, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>VIPAKA</Text>
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700', marginTop: 2 }]}>
                    {product.ayurvedicPharmacology.vipaka}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Dosha Suitability Chips */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Sparkles size={18} color={COLOR.accent} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Dosha Harmonization</Text>
            </View>
            <View style={styles.doshaChipsRow}>
              {product.recommendedForDosha.map((dosha) => (
                <Badge
                  key={dosha}
                  label={`Pacifies ${dosha.toUpperCase()} Dosha`}
                  variant="primary"
                  style={{ marginRight: spacing.xs, marginVertical: 2 }}
                />
              ))}
            </View>
          </Card>

          {/* Description */}
          <Card style={styles.card}>
            <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.xs }]}>
              Clinical Description & Vedic Context
            </Text>
            <Text style={[typography.body, { color: COLOR.textMuted, lineHeight: 22 }]}>
              {product.description}
            </Text>
          </Card>

          {/* Ingredients */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Leaf size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Standardized Herbs & Extract Ratio</Text>
            </View>
            <View style={styles.ingredientPills}>
              {product.ingredients.map((ing) => (
                <View key={ing} style={[styles.ingPill, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700' }]}>{ing}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Anupana & Dosage */}
          <Card style={styles.card}>
            <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.xs }]}>
              Dosage & Anupana (Carrier Vehicle)
            </Text>
            <Text style={[typography.body, { color: COLOR.textMuted, lineHeight: 22 }]}>
              {product.dosageInstructions}
            </Text>
            {product.anupanaCarrier ? (
              <View style={[styles.anupanaBox, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
                <Text style={[typography.label, { color: COLOR.primary }]}>RECOMMENDED ANUPANA (VEHICLE):</Text>
                <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700', marginTop: 2 }]}>
                  {product.anupanaCarrier}
                </Text>
              </View>
            ) : null}
          </Card>

          {/* Quality & Certifications */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ShieldCheck size={18} color={COLOR.success} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Quality & Authenticity Seals</Text>
            </View>
            <View style={{ marginTop: spacing.xs }}>
              {(product.certificationMarks || [
                'Ministry of AYUSH Premium Mark',
                'GMP Certified Facility',
                '100% Wildcrafted Botanical Herbs',
                'Heavy Metal Lab Tested',
              ]).map((cert, i) => (
                <View key={i} style={styles.certRow}>
                  <CheckCircle size={14} color={COLOR.success} style={{ marginRight: 6 }} />
                  <Text style={[typography.caption, { color: COLOR.textMuted, fontWeight: '600' }]}>
                    {cert}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Floating Bar */}
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
        <Button
          title="Add to Cart"
          variant="outline"
          icon={<ShoppingBag size={18} color={COLOR.primary} />}
          onPress={() => {
            dispatch(addToCart({ product, quantity: 1 }));
            showToast.success(`Added ${i18n.language === 'hi' && product.nameHi ? product.nameHi : product.name} to Cart`);
          }}
          style={{ flex: 1, marginRight: spacing.md }}
        />

        <GradientButton
          title="Buy Now"
          onPress={() => {
            dispatch(addToCart({ product, quantity: 1 }));
            navigation.navigate('Cart');
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageHero: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  certifiedStamp: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  body: {
    padding: spacing.lg,
  },
  allergyAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shastraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingAndPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pharmaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  pharmaBox: {
    width: '48%',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  doshaChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  ingredientPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  ingPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  anupanaBox: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
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
