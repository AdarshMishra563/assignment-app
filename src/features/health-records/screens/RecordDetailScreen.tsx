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
  Activity,
  Calendar,
  Download,
  FileText,
  HeartPulse,
  Paperclip,
  Pill,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Syringe,
  Tag,
  User,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchRecordById } from '../store/healthRecordsSlice';
import { addToCart } from '../../shop/store/cartSlice';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Card } from '../../../design-system/components/Card';
import { RecordTypeTag } from '../components/RecordTypeTag';
import { GradientButton } from '../../../design-system/components/GradientButton';
import { DashedDivider } from '../../../design-system/components/DashedDivider';
import { showToast } from '../../../design-system/components/Toast';
import { Badge } from '../../../design-system/components/Badge';

export const RecordDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { recordId } = route.params;
  const COLOR = useColor();
  const dispatch = useAppDispatch();

  const { selectedRecord, loadingRecordDetail } = useAppSelector((state) => state.healthRecords);
  const products = useAppSelector((state) => state.products.products);

  useEffect(() => {
    dispatch(fetchRecordById(recordId));
  }, [dispatch, recordId]);

  const insets = useSafeAreaInsets();

  if (loadingRecordDetail || !selectedRecord) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: COLOR.background }]}>
        <ActivityIndicator size="large" color={COLOR.primary} />
      </View>
    );
  }

  const record = selectedRecord;
  const formattedDate = new Date(record.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Cross-module action: Reorder all prescribed medicines directly into the cart
  const handleReorderMedicines = () => {
    if (!record.prescribedMedicines || record.prescribedMedicines.length === 0) return;

    record.prescribedMedicines.forEach((med) => {
      const matchedProd = products.find((p) => p.id === med.productId);
      const productToAdd = matchedProd || {
        id: med.productId || `prod_prescribed_${Math.random()}`,
        name: med.medicineName,
        subtitle: `Prescribed by ${record.doctorName}`,
        category: 'Prescription Formulation',
        price: med.price || 499,
        originalPrice: Math.round((med.price || 499) * 1.2),
        rating: 4.9,
        ratingCount: 150,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'],
        description: `Prescribed Ayurvedic remedy: ${med.dosage} ${med.frequency}`,
        ingredients: ['Classical Botanical Extracts'],
        keyBenefits: ['Prescribed by Ayurvedic Practitioner'],
        recommendedForDosha: ['pitta', 'vata', 'kapha'],
        allergyTags: [],
        inStock: true,
        stockCount: 50,
        dosageInstructions: med.instructions,
      };

      dispatch(addToCart({ product: productToAdd, quantity: 1 }));
    });

    showToast.success('Prescribed medicines added to cart!');
    navigation.navigate('Cart');
  };

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingBottom: insets.bottom || spacing.md }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Record Header */}
        <Card style={styles.headerCard}>
          <View style={styles.tagRow}>
            <RecordTypeTag type={record.type} />
            <Text style={[typography.caption, { color: COLOR.textMuted }]}>
              {formattedDate}
            </Text>
          </View>

          <Text style={[typography.title, { color: COLOR.text, marginTop: spacing.xs }]}>
            {record.title}
          </Text>

          <View style={styles.doctorInfoRow}>
            {record.doctorPhoto ? (
              <Image
                source={{ uri: record.doctorPhoto }}
                style={styles.docAvatar}
                accessibilityRole="image"
                accessibilityLabel={`Photo of ${record.doctorName}`}
              />
            ) : (
              <User size={20} color={COLOR.textMuted} />
            )}
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>
                {record.doctorName}
              </Text>
              {record.doctorSpecialty ? (
                <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '700' }]}>
                  {record.doctorSpecialty}
                </Text>
              ) : null}
            </View>
          </View>

          {record.tags && record.tags.length > 0 && (
            <View style={{ marginTop: spacing.md }}>
              <View style={styles.cardHeaderRow}>
                <Tag size={14} color={COLOR.textMuted} style={{ marginRight: spacing.xs }} />
                <Text style={[typography.label, { color: COLOR.textMuted }]}>TAGS</Text>
              </View>
              <View
                style={styles.tagsWrap}
                accessibilityLabel={`Tags: ${record.tags.join(', ')}`}
              >
                {record.tags.map((tag, idx) => (
                  <Badge key={`${tag}_${idx}`} label={tag} variant="default" style={styles.tagBadge} />
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Diagnosis & Clinical Findings */}
        {record.diagnosis && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Sparkles size={18} color={COLOR.accent} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Clinical Diagnosis</Text>
            </View>
            <Text style={[typography.body, { color: COLOR.text, fontWeight: '700', marginTop: 4 }]}>
              {record.diagnosis}
            </Text>
          </Card>
        )}

        {/* Doctor's Notes */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.xs }]}>
            Clinical Evaluation & Notes
          </Text>
          <Text style={[typography.body, { color: COLOR.textMuted, lineHeight: 22 }]}>
            {record.notes}
          </Text>
        </Card>

        {/* Vitals / Ayurvedic Diagnostics */}
        {record.vitals && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <HeartPulse size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Ayurvedic Diagnostic Vitals</Text>
            </View>

            <View style={styles.vitalsGrid}>
              {record.vitals.prakritiDiagnosis && (
                <View style={[styles.vitalItem, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>NADI & PRAKRITI</Text>
                  <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '800', marginTop: 2 }]}>
                    {record.vitals.prakritiDiagnosis}
                  </Text>
                </View>
              )}
              {record.vitals.bloodPressure && (
                <View style={[styles.vitalItem, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>BLOOD PRESSURE</Text>
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800', marginTop: 2 }]}>
                    {record.vitals.bloodPressure}
                  </Text>
                </View>
              )}
              {record.vitals.pulseRate && (
                <View style={[styles.vitalItem, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>PULSE (NADI GATI)</Text>
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800', marginTop: 2 }]}>
                    {record.vitals.pulseRate}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Immunization Details */}
        {record.vaccination && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Syringe size={18} color={COLOR.warning} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Immunization Details</Text>
            </View>

            <View style={styles.vitalsGrid}>
              <View style={[styles.vitalItem, { backgroundColor: COLOR.surfaceAlt }]}>
                <Text style={[typography.label, { color: COLOR.textMuted }]}>VACCINE</Text>
                <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800', marginTop: 2 }]}>
                  {record.vaccination.vaccineName}
                </Text>
              </View>
              <View style={[styles.vitalItem, { backgroundColor: COLOR.surfaceAlt }]}>
                <Text style={[typography.label, { color: COLOR.textMuted }]}>DOSE</Text>
                <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800', marginTop: 2 }]}>
                  {record.vaccination.doseNumber}
                  {record.vaccination.totalDoses ? ` of ${record.vaccination.totalDoses}` : ''}
                </Text>
              </View>
              {record.vaccination.nextDueDate && (
                <View style={[styles.vitalItem, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>NEXT DUE</Text>
                  <Text style={[typography.caption, { color: COLOR.warning, fontWeight: '800', marginTop: 2 }]}>
                    {new Date(record.vaccination.nextDueDate).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              )}
              {record.vaccination.batchNumber && (
                <View style={[styles.vitalItem, { backgroundColor: COLOR.surfaceAlt }]}>
                  <Text style={[typography.label, { color: COLOR.textMuted }]}>BATCH NO.</Text>
                  <Text style={[typography.caption, { color: COLOR.text, fontWeight: '800', marginTop: 2 }]}>
                    {record.vaccination.batchNumber}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Prescribed Formulations */}
        {record.prescribedMedicines && record.prescribedMedicines.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.prescribeHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pill size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
                <Text style={[typography.subtitle, { color: COLOR.text }]}>Prescribed Remedies</Text>
              </View>
              <Text style={[typography.label, { color: COLOR.primary }]}>
                {record.prescribedMedicines.length} ITEMS
              </Text>
            </View>

            {record.prescribedMedicines.map((med, i) => (
              <View key={i} style={[styles.medCard, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
                <View style={styles.medTitleRow}>
                  <Text style={[typography.subtitle, { color: COLOR.text }]}>
                    {i + 1}. {med.medicineName}
                  </Text>
                  {med.price ? (
                    <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '800' }]}>
                      ₹{med.price}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.medDetailsRow}>
                  <Text style={[typography.caption, { color: COLOR.textMuted }]}>
                    Dosage: <Text style={{ fontWeight: '700', color: COLOR.text }}>{med.dosage}</Text> · {med.frequency}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 2 }]}>
                  Duration: {med.duration} | Instructions: {med.instructions}
                </Text>
              </View>
            ))}

            <GradientButton
              title="Reorder Prescribed Medicines"
              icon={<ShoppingBag size={18} color="#FFFFFF" />}
              onPress={handleReorderMedicines}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Attachments / PDFs */}
        {record.attachments && record.attachments.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Paperclip size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Clinical Attachments & PDFs</Text>
            </View>

            {record.attachments.map((att) => {
              const isImage = att.fileType === 'image';
              const imageSource = att.thumbnail || (isImage ? att.url : undefined);
              const isLabDoc = att.fileType === 'lab_doc';
              const docIconColor = isLabDoc ? COLOR.info : COLOR.danger;
              const docIconBg = isLabDoc ? COLOR.infoSoft : COLOR.dangerSoft;

              return (
                <View
                  key={att.id}
                  style={[styles.attachmentItem, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}
                >
                  {imageSource ? (
                    <Image
                      source={{ uri: imageSource }}
                      style={styles.attachmentThumbnail}
                      accessibilityRole="image"
                      accessibilityLabel={`Thumbnail preview of ${att.title}`}
                    />
                  ) : (
                    <View
                      style={[styles.attachmentIconBox, { backgroundColor: docIconBg }]}
                      accessibilityRole="image"
                      accessibilityLabel={`${isLabDoc ? 'Lab document' : 'PDF document'} icon for ${att.title}`}
                    >
                      <FileText size={22} color={docIconColor} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.subtitle, { color: COLOR.text, fontSize: 13 }]} numberOfLines={1}>
                      {att.title}
                    </Text>
                    <Text style={[typography.caption, { color: COLOR.textMuted }]}>
                      {att.fileType.toUpperCase()} · {att.fileSize}
                    </Text>
                  </View>
                  <Download
                    size={18}
                    color={COLOR.primary}
                    accessibilityRole="button"
                    accessibilityLabel={`Download ${att.title}`}
                  />
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
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
    padding: spacing.lg,
    paddingBottom: 60,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  vitalsGrid: {
    marginTop: spacing.xs,
  },
  vitalItem: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  prescribeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  medCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xs + 2,
  },
  medTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  attachmentThumbnail: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  attachmentIconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
});
