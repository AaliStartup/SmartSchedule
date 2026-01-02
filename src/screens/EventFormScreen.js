import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function EventFormScreen({ route, navigation }) {
  const { photoUri, ocrData } = route.params || {};

  // Form state
  const [title, setTitle] = useState(ocrData?.title || '');
  const [date, setDate] = useState(ocrData?.date || '');
  const [startTime, setStartTime] = useState(ocrData?.start_time || '');
  const [endTime, setEndTime] = useState(ocrData?.end_time || '');
  const [location, setLocation] = useState(ocrData?.location || '');
  const [description, setDescription] = useState(ocrData?.description || '');
  const [showRawText, setShowRawText] = useState(false);

  const confidence = ocrData?.confidence || 0;
  const textType = ocrData?.text_type || 'unknown';
  const rawText = ocrData?.raw_text || '';

  const isLowConfidence = confidence < 0.8;
  const isFieldLowConfidence = confidence < 0.7;

  const getConfidenceColor = () => {
    if (confidence >= 0.85) return COLORS.highConfidence;
    if (confidence >= 0.7) return COLORS.mediumConfidence;
    if (confidence >= 0.55) return COLORS.lowConfidence;
    return COLORS.veryLowConfidence;
  };

  const handleAddToCalendar = () => {
    if (!title.trim()) {
      alert('Please enter an event title');
      return;
    }

    const eventData = {
      title,
      date,
      startTime,
      endTime,
      location,
      description,
    };

    navigation.navigate('Success', { eventData });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderInputField = (label, value, onChangeText, options = {}) => {
    const { placeholder, multiline, keyboardType, required } = options;
    const shouldHighlight = isFieldLowConfidence && value && ocrData;

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            shouldHighlight && styles.lowConfidenceInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Low Confidence Warning */}
          {isLowConfidence && ocrData && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningTextContainer}>
                <Text style={styles.warningTitle}>Low Confidence Reading</Text>
                <Text style={styles.warningText}>
                  Some fields may need correction. Please review carefully.
                </Text>
              </View>
            </View>
          )}

          {/* Text Type Badge */}
          {ocrData && (
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { borderColor: getConfidenceColor() }]}>
                <Text style={styles.badgeEmoji}>
                  {textType === 'handwritten' ? '✍️' : '🖨️'}
                </Text>
                <Text style={styles.badgeText}>
                  {textType === 'handwritten' ? 'Handwritten' : 'Printed'}
                </Text>
              </View>
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor() }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(confidence * 100)}% confidence
                </Text>
              </View>
            </View>
          )}

          {/* Form Fields */}
          {renderInputField('Event Title', title, setTitle, {
            placeholder: 'Enter event title',
            required: true,
          })}

          {renderInputField('Date', date, setDate, {
            placeholder: 'YYYY-MM-DD',
          })}

          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              {renderInputField('Start Time', startTime, setStartTime, {
                placeholder: 'HH:MM',
              })}
            </View>
            <View style={styles.timeField}>
              {renderInputField('End Time', endTime, setEndTime, {
                placeholder: 'HH:MM',
              })}
            </View>
          </View>

          {renderInputField('Location', location, setLocation, {
            placeholder: 'Enter location',
          })}

          {renderInputField('Description', description, setDescription, {
            placeholder: 'Add notes or description',
            multiline: true,
          })}

          {/* Raw Text Collapsible */}
          {rawText && (
            <View style={styles.rawTextContainer}>
              <TouchableOpacity
                style={styles.rawTextHeader}
                onPress={() => setShowRawText(!showRawText)}
                activeOpacity={0.7}
              >
                <Text style={styles.rawTextToggle}>
                  {showRawText ? '▼' : '▶'} View Raw Text
                </Text>
              </TouchableOpacity>
              {showRawText && (
                <View style={styles.rawTextContent}>
                  <Text style={styles.rawTextValue}>{rawText}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Button Container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleAddToCalendar}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Add to Calendar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.sm,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    backgroundColor: COLORS.white,
  },
  badgeEmoji: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  badgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray700,
  },
  confidenceBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  confidenceText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.white,
  },
  fieldContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray900,
    ...SHADOWS.small,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  lowConfidenceInput: {
    backgroundColor: '#FFFDE7',
    borderColor: COLORS.warning,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timeField: {
    flex: 1,
  },
  rawTextContainer: {
    marginTop: SPACING.md,
  },
  rawTextHeader: {
    paddingVertical: SPACING.sm,
  },
  rawTextToggle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  rawTextContent: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  rawTextValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.md,
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

