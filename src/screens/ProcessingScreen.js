import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { callOCRAPI } from '../services/mockOCR';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProcessingScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const [statusMessage, setStatusMessage] = useState('Preparing image...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    processOCR();
  }, []);

  const processOCR = async () => {
    try {
      // Stage 1: Checking image format
      setStatusMessage('Checking image format...');
      setProgress(20);
      await sleep(500);

      // Stage 2: Reading text
      setStatusMessage('Reading text from image...');
      setProgress(40);
      await sleep(500);

      // Stage 3: Processing with OCR
      setStatusMessage('Processing with OCR...');
      setProgress(60);
      
      const result = await callOCRAPI(photoUri);

      // Stage 4: Finalizing
      setStatusMessage('Almost done...');
      setProgress(100);
      await sleep(300);

      if (result.success) {
        navigation.replace('EventForm', {
          photoUri,
          ocrData: result.data,
        });
      } else {
        handleError(result.error || 'Failed to process image');
      }
    } catch (error) {
      handleError(error.message || 'An unexpected error occurred');
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleError = (errorMessage) => {
    Alert.alert(
      'Processing Error',
      errorMessage,
      [
        {
          text: 'Try Again',
          onPress: () => {
            setProgress(0);
            processOCR();
          },
        },
        {
          text: 'Enter Manually',
          onPress: () => {
            navigation.replace('EventForm', {
              photoUri,
              ocrData: null,
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Image (Dimmed) */}
      <Image
        source={{ uri: photoUri }}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={3}
      />
      <View style={styles.overlay} />

      {/* Bottom Sheet */}
      <SafeAreaView style={styles.bottomSheet} edges={['bottom']}>
        <View style={styles.sheetContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          
          <Text style={styles.statusText}>{statusMessage}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          <Text style={styles.tipText}>
            💡 Tip: For best results, ensure the text is well-lit and in focus
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    ...SHADOWS.large,
  },
  sheetContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  statusText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray800,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
  },
  progressText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  tipText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
});

