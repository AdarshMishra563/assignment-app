import React from 'react';
import { Linking, Modal, StyleSheet, Text, View } from 'react-native';
import { Download, Sparkles } from 'lucide-react-native';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';
import { GradientButton } from './GradientButton';

interface UpdateRequiredModalProps {
  visible: boolean;
  forceUpdate: boolean;
  storeUrl: string;
  latestVersion: string;
  onLater: () => void;
}

export const UpdateRequiredModal: React.FC<UpdateRequiredModalProps> = ({
  visible,
  forceUpdate,
  storeUrl,
  latestVersion,
  onLater,
}) => {
  const COLOR = useColor();

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!forceUpdate) onLater();
      }}
    >
      <View style={styles.scrim}>
        <View style={[styles.card, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: COLOR.primarySoft }]}>
            <Download size={38} color={COLOR.primary} />
          </View>

          <Text style={[typography.title, { color: COLOR.text, textAlign: 'center', marginTop: spacing.md }]}>
            {forceUpdate ? 'Update Required' : 'New Version Available'}
          </Text>

          <Text style={[typography.caption, { color: COLOR.textMuted, textAlign: 'center', marginTop: 4, paddingHorizontal: spacing.sm }]}>
            {forceUpdate
              ? `Version ${latestVersion} includes important fixes and is required to keep using Amrutam.`
              : `Version ${latestVersion} is now available with new Ayurvedic features and improvements.`}
          </Text>

          <View style={styles.buttonRow}>
            <GradientButton
              title="Update Now"
              icon={<Sparkles size={16} color="#FFFFFF" />}
              onPress={handleUpdate}
              style={{ width: '100%', marginBottom: forceUpdate ? 0 : spacing.sm }}
            />

            {!forceUpdate && (
              <Button title="Later" variant="ghost" onPress={onLater} style={{ width: '100%' }} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    width: '100%',
    marginTop: spacing.lg,
  },
});
