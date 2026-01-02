import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function PreviewScreen({ route, navigation }) {
  const { photoUri } = route.params;

  const handleUsePhoto = () => {
    navigation.navigate('Processing', { photoUri });
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: photoUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleUsePhoto}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            Use This Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleRetake}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Retake
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  image: {
    width: screenWidth,
    height: '100%',
  },
  buttonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.large,
  },
  button: {
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray300,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.gray700,
  },
});

