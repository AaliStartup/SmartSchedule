import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function ConflictScreen({ route, navigation }) {
  const { newEvent, conflictingEvent } = route.params || {};

  // Default mock data if not provided
  const newEventData = newEvent || {
    title: 'New Event',
    date: '2025-01-20',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Conference Room A',
  };

  const conflictingEventData = conflictingEvent || {
    title: 'Team Meeting',
    date: '2025-01-20',
    startTime: '14:30',
    endTime: '15:30',
    location: 'Conference Room B',
  };

  const handleAddAnyway = () => {
    navigation.navigate('Success', { eventData: newEventData });
  };

  const handleEditEvent = () => {
    navigation.goBack();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return 'Time not specified';
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  const renderEventCard = (event, isConflicting = false) => (
    <View style={[styles.eventCard, isConflicting && styles.conflictingCard]}>
      <Text style={styles.eventLabel}>
        {isConflicting ? '🔴 Existing Event' : '🟢 New Event'}
      </Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🕐</Text>
          <Text style={styles.detailText}>
            {formatTime(event.startTime, event.endTime)}
          </Text>
        </View>
        {event.location && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Schedule Conflict Detected</Text>
            <Text style={styles.warningText}>
              This event overlaps with an existing event in your calendar.
            </Text>
          </View>
        </View>

        {/* New Event */}
        <Text style={styles.sectionTitle}>New Event</Text>
        {renderEventCard(newEventData, false)}

        {/* Conflicting Event */}
        <Text style={styles.sectionTitle}>Conflicting Event</Text>
        {renderEventCard(conflictingEventData, true)}

        {/* Timeline Description */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>⏱️ Timeline Overlap</Text>
          <Text style={styles.timelineText}>
            The new event ({newEventData.startTime} - {newEventData.endTime}) overlaps with{' '}
            "{conflictingEventData.title}" ({conflictingEventData.startTime} - {conflictingEventData.endTime}).
          </Text>
          <Text style={styles.suggestionText}>
            Consider adjusting the time of your new event to avoid the conflict.
          </Text>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={handleAddAnyway}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.warningButtonText]}>
            Add Anyway
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleEditEvent}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            Edit Event
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.dangerLight + '30',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: FONT_SIZES.xxl,
    marginRight: SPACING.md,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    ...SHADOWS.medium,
  },
  conflictingCard: {
    backgroundColor: COLORS.dangerLight + '15',
    borderLeftColor: COLORS.danger,
  },
  eventLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  eventDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.sm,
    width: 20,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    flex: 1,
  },
  timelineContainer: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  timelineTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  timelineText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    fontStyle: 'italic',
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
  warningButton: {
    backgroundColor: COLORS.lowConfidence,
    ...SHADOWS.medium,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  warningButtonText: {
    color: COLORS.white,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
});

