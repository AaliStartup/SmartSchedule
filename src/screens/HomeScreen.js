import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const handleTakePhoto = () => {
    navigation.navigate('Camera');
  };

  const handleUploadImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('Preview', { photoUri: result.assets[0].uri });
      }
    } catch (error) {
      alert('Failed to open image picker. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>SmartSchedule</Text>
          <Text style={styles.subtitle}>
            Scan schedules into your calendar instantly
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonEmoji}>📷</Text>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleUploadImage}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonEmoji}>🖼️</Text>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Upload Image
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Works with appointment cards, schedules, and handwritten notes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.medium,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonEmoji: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.md,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
});

