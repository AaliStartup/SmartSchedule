import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import { processPDFForCalendar } from '../services/pdfParser';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function PDFUploadScreen({ navigation }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState('');

  const handleSelectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const handleProcessPDF = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setProgress('Reading document...');

    try {
      // Simulate progress updates
      setTimeout(() => setProgress('Extracting text...'), 500);
      setTimeout(() => setProgress('Finding dates...'), 1000);
      setTimeout(() => setProgress('Identifying events...'), 1500);

      const result = await processPDFForCalendar(selectedFile.uri);

      setProgress('Processing complete!');

      if (result.success && result.events.length > 0) {
        // Navigate to extracted events screen
        navigation.navigate('ExtractedEvents', {
          events: result.events,
          metadata: result.metadata,
          fileName: selectedFile.name,
        });
      } else if (result.success && result.events.length === 0) {
        Alert.alert(
          'No Events Found',
          'Could not find any dates or events in this document. Try a different file.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Processing Error', result.error || 'Failed to process the document.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>📄</Text>
          <Text style={styles.title}>Import from PDF</Text>
          <Text style={styles.subtitle}>
            Upload a course syllabus or schedule to automatically extract important dates
          </Text>
        </View>

        {/* Upload Area */}
        <TouchableOpacity
          style={[styles.uploadArea, selectedFile && styles.uploadAreaSelected]}
          onPress={handleSelectPDF}
          activeOpacity={0.7}
          disabled={isProcessing}
        >
          {selectedFile ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileIcon}>📋</Text>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleSelectPDF}
                disabled={isProcessing}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📁</Text>
              <Text style={styles.uploadText}>Tap to select a PDF file</Text>
              <Text style={styles.uploadHint}>
                Supports course syllabi, schedules, and calendars
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Supported Formats */}
        <View style={styles.formatsContainer}>
          <Text style={styles.formatsTitle}>Works best with:</Text>
          <View style={styles.formatsList}>
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>📚 Course Syllabi</Text>
            </View>
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>📅 Class Schedules</Text>
            </View>
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>📝 Assignment Lists</Text>
            </View>
          </View>
        </View>

        {/* Processing Status */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.processingText}>{progress}</Text>
          </View>
        )}
      </View>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            (!selectedFile || isProcessing) && styles.buttonDisabled,
          ]}
          onPress={handleProcessPDF}
          activeOpacity={0.8}
          disabled={!selectedFile || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.buttonEmoji}>🔍</Text>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Extract Events
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Cancel
          </Text>
        </TouchableOpacity>
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
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
  uploadArea: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  uploadAreaSelected: {
    borderColor: COLORS.primary,
    borderStyle: 'solid',
    backgroundColor: COLORS.primary + '08',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  uploadText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  uploadHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  fileSize: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  changeButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  changeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  formatsContainer: {
    marginBottom: SPACING.lg,
  },
  formatsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  formatsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  formatBadge: {
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  formatText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  processingContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  processingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
  },
  buttonContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.md,
  },
  button: {
    flexDirection: 'row',
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
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  buttonEmoji: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
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

