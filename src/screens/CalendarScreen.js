import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// Mock events data
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Team Meeting',
    date: '2025-01-20',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Conference Room B',
    color: COLORS.primary,
  },
  {
    id: '2',
    title: 'Doctor Appointment',
    date: '2025-01-18',
    startTime: '10:30',
    endTime: '11:00',
    location: 'City Medical Center',
    color: COLORS.success,
  },
  {
    id: '3',
    title: 'Study Session',
    date: '2025-01-25',
    startTime: '18:00',
    endTime: '20:00',
    location: 'Main Library',
    color: COLORS.warning,
  },
  {
    id: '4',
    title: 'Project Deadline',
    date: '2025-01-30',
    startTime: '23:59',
    endTime: null,
    location: 'Online Submission',
    color: COLORS.danger,
  },
];

export default function CalendarScreen({ navigation }) {
  const [events] = useState(MOCK_EVENTS);

  const handleAddEvent = () => {
    navigation.navigate('Home');
  };

  const handleEventPress = (event) => {
    Alert.alert(
      event.title,
      `📅 ${formatDate(event.date)}\n🕐 ${formatTime(event.startTime, event.endTime)}\n📍 ${event.location || 'No location'}`,
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return 'All day';
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.colorBar, { backgroundColor: item.color }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>
              {formatTime(item.startTime, item.endTime)}
            </Text>
          </View>
          {item.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>No Events Yet</Text>
      <Text style={styles.emptyText}>
        Scan a schedule or appointment card to add your first event
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddEvent}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyButtonText}>Add Your First Event</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddEvent}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  addButtonIcon: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginRight: SPACING.xs,
  },
  addButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    flexGrow: 1,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  colorBar: {
    width: 6,
  },
  eventContent: {
    flex: 1,
    padding: SPACING.md,
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
  separator: {
    height: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
});

