import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function SuccessScreen({ route, navigation }) {
  const { eventData } = route.params || {};

  const handleScanAnother = () => {
    navigation.navigate('Home');
  };

  const handleViewCalendar = () => {
    navigation.navigate('Calendar');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return 'Not specified';
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✅</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Event Added Successfully!</Text>
        <Text style={styles.subtitle}>
          Your event has been saved to the calendar
        </Text>

        {/* Event Summary */}
        {eventData && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.eventTitle}>{eventData.title || 'Untitled Event'}</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detailText}>{formatDate(eventData.date)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🕐</Text>
                <Text style={styles.detailText}>
                  {formatTime(eventData.startTime, eventData.endTime)}
                </Text>
              </View>
              
              {eventData.location && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{eventData.location}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleScanAnother}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonEmoji}>📷</Text>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Scan Another
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewCalendar}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonEmoji}>📅</Text>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              View Calendar
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.successLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  summaryContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    ...SHADOWS.medium,
  },
  eventTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
    width: 24,
  },
  detailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray700,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
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
    borderColor: COLORS.primary,
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
    color: COLORS.primary,
  },
});

