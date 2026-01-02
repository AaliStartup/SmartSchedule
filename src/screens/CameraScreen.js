import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../constants/theme';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const getFlashIcon = () => {
    switch (flash) {
      case 'on':
        return '⚡';
      case 'auto':
        return '⚡A';
      default:
        return '⚡✗';
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && isReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        navigation.navigate('Preview', { photoUri: photo.uri });
      } catch (error) {
        alert('Failed to take picture. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Loading state
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // Permission denied state
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          SmartSchedule needs camera access to scan your schedules and documents.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setIsReady(true)}
      >
        {/* Top Controls */}
        <SafeAreaView style={styles.topControls} edges={['top']}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}
            activeOpacity={0.8}
          >
            <Text style={styles.controlButtonText}>{getFlashIcon()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraFacing}
            activeOpacity={0.8}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Guide Box */}
        <View style={styles.guideContainer}>
          <View style={styles.guideBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.guideText}>Position document within frame</Text>
        </View>

        {/* Bottom Controls */}
        <SafeAreaView style={styles.bottomControls} edges={['bottom']}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            activeOpacity={0.8}
            disabled={!isReady}
          >
            <View style={[styles.captureButtonInner, !isReady && styles.captureButtonDisabled]} />
          </TouchableOpacity>

          <View style={styles.spacer} />
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  permissionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  goBackButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  goBackButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBox: {
    width: '85%',
    aspectRatio: 4 / 3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: BORDER_RADIUS.lg,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.white,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: BORDER_RADIUS.lg,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  guideText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 80,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
  },
  captureButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  spacer: {
    minWidth: 80,
  },
});

