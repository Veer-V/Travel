import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItineraryItem } from '../types';
import { colors, borderRadius, spacing } from '../theme/theme';

interface ItineraryItemRowProps {
  item: ItineraryItem;
  isLast?: boolean;
}

export const ItineraryItemRow: React.FC<ItineraryItemRowProps> = ({ item, isLast = false }) => {
  const getSlotColor = (slot: string) => {
    switch (slot) {
      case 'morning': return '#F59E0B'; // Amber
      case 'afternoon': return '#0EA5E9'; // Sky
      case 'evening': return '#F97316'; // Sunset
      case 'night': return '#6366F1'; // Indigo
      default: return colors.primary;
    }
  };

  const getSlotIcon = (slot: string, type: string): any => {
    if (type === 'restaurant') return 'restaurant';
    switch (slot) {
      case 'morning': return 'sunny';
      case 'afternoon': return 'partly-sunny';
      case 'evening': return 'sunset';
      case 'night': return 'moon';
      default: return 'location';
    }
  };

  const slotColor = getSlotColor(item.time_slot);

  return (
    <View style={styles.container}>
      {/* Time & Timeline Node */}
      <View style={styles.timelineColumn}>
        <Text style={styles.timeLabel}>{item.start_time}</Text>
        <View style={[styles.nodeCircle, { borderColor: slotColor }]}>
          <Ionicons name={getSlotIcon(item.time_slot, item.activity_type)} size={14} color={slotColor} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Activity Card */}
      <View style={[styles.card, item.activity_type === 'restaurant' && styles.restaurantCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.activityName}>{item.activity_name}</Text>
          {item.estimated_cost > 0 && (
            <Text style={styles.costBadge}>₹{item.estimated_cost.toFixed(0)}</Text>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.locationText}>{item.location_name}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaBadgeText}>{item.visit_duration_minutes}m</Text>
          </View>

          <View style={styles.metaBadge}>
            <Ionicons name="car-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaBadgeText}>{item.travel_mode} (~{item.travel_duration_minutes}m)</Text>
          </View>

          {item.booking_required && (
            <View style={styles.bookingBadge}>
              <Text style={styles.bookingText}>Booking Recommended</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  timelineColumn: {
    width: 65,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: spacing.xs,
  },
  restaurantCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  costBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    flexWrap: 'wrap',
    gap: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  metaBadgeText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 3,
  },
  bookingBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  bookingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
  },
});
