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

export default function ExtractedEventsScreen({ route, navigation }) {
  const { events: initialEvents, metadata, fileName } = route.params || {};
  const [events, setEvents] = useState(initialEvents || []);

  const selectedCount = events.filter(e => e.selected).length;

  const toggleEventSelection = (eventId) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, selected: !event.selected } : event
      )
    );
  };

  const selectAll = () => {
    setEvents(prevEvents => prevEvents.map(event => ({ ...event, selected: true })));
  };

  const deselectAll = () => {
    setEvents(prevEvents => prevEvents.map(event => ({ ...event, selected: false })));
  };

  const handleAddToCalendar = () => {
    const selectedEvents = events.filter(e => e.selected);
    
    if (selectedEvents.length === 0) {
      Alert.alert('No Events Selected', 'Please select at least one event to add.');
      return;
    }

    // Navigate to success with the selected events
    navigation.navigate('Success', {
      eventData: {
        title: `${selectedEvents.length} Events Added`,
        date: selectedEvents[0]?.date,
        description: `Imported from ${fileName || 'PDF'}`,
      },
      bulkImport: true,
      importedCount: selectedEvents.length,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
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
    if (!startTime) return '';
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'exam':
        return '📝';
      case 'deadline':
        return '⏰';
      case 'lecture':
        return '📚';
      case 'holiday':
        return '🎉';
      default:
        return '📅';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'exam':
        return COLORS.danger;
      case 'deadline':
        return COLORS.warning;
      case 'lecture':
        return COLORS.primary;
      case 'holiday':
        return COLORS.success;
      default:
        return COLORS.gray600;
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, item.selected && styles.eventCardSelected]}
      onPress={() => toggleEventSelection(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {item.selected ? (
          <View style={styles.checkboxChecked}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ) : (
          <View style={styles.checkboxUnchecked} />
        )}
      </View>

      <View style={[styles.eventTypeBar, { backgroundColor: getEventTypeColor(item.type) }]} />

      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventIcon}>{getEventTypeIcon(item.type)}</Text>
          <Text style={styles.eventType}>{item.type.toUpperCase()}</Text>
        </View>

        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.eventDetails}>
          <Text style={styles.eventDate}>📅 {formatDate(item.date)}</Text>
          {item.startTime && (
            <Text style={styles.eventTime}>
              🕐 {formatTime(item.startTime, item.endTime)}
            </Text>
          )}
        </View>

        {item.description && item.description !== item.title && (
          <Text style={styles.eventDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryIcon}>📄</Text>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>{fileName || 'Document'}</Text>
          <Text style={styles.summarySubtitle}>
            Found {events.length} events • {selectedCount} selected
          </Text>
        </View>
      </View>

      <View style={styles.selectionActions}>
        <TouchableOpacity onPress={selectAll} style={styles.selectionButton}>
          <Text style={styles.selectionButtonText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deselectAll} style={styles.selectionButton}>
          <Text style={styles.selectionButtonText}>Deselect All</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Extracted Events</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No events found in document</Text>
          </View>
        }
      />

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedCount}>{selectedCount}</Text>
          <Text style={styles.selectedLabel}>events selected</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            selectedCount === 0 && styles.addButtonDisabled,
          ]}
          onPress={handleAddToCalendar}
          activeOpacity={0.8}
          disabled={selectedCount === 0}
        >
          <Text style={styles.addButtonText}>
            Add to Calendar
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
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  listHeader: {
    marginBottom: SPACING.md,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryIcon: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  summarySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  selectionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  selectionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  eventCardSelected: {
    backgroundColor: COLORS.primary + '08',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: SPACING.md,
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  eventTypeBar: {
    width: 4,
    marginLeft: SPACING.md,
  },
  eventContent: {
    flex: 1,
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  eventIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  eventType: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray500,
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  eventDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  eventTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  eventDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  separator: {
    height: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray500,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.md,
  },
  selectedInfo: {
    alignItems: 'center',
  },
  selectedCount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  selectedLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  addButton: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  addButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
});

