import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { tripService } from '../../src/services/tripService';
import { Trip, ItineraryDay } from '../../src/types';
import { ItineraryItemRow } from '../../src/components/ItineraryItemRow';
import { SafetyBadge } from '../../src/components/SafetyBadge';
import { useTripStore } from '../../src/store/useTripStore';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function TripItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const setCurrentTrip = useTripStore((s) => s.setCurrentTrip);
  const savedTrips = useTripStore((s) => s.savedTrips);

  useEffect(() => {
    async function fetchTrip() {
      if (!id) return;
      // Check local store first
      const local = savedTrips.find((t) => t.id === id);
      if (local) {
        setTrip(local);
        setCurrentTrip(local);
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        const remote = await tripService.getTripById(id);
        setTrip(remote);
        setCurrentTrip(remote);
      } catch (e) {
        console.warn('Could not fetch trip by id:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id]);

  const handleShare = async () => {
    if (!trip) return;
    try {
      await Share.share({
        title: trip.title,
        message: `Plan for ${trip.title} (${trip.total_days} Days in ${trip.destination_name}) curated by SmartVoyage AI! Budget: ₹${trip.total_budget?.toLocaleString()}`,
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading AI Itinerary...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Trip Not Found</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  const selectedDay: ItineraryDay | undefined = trip.itineraries.find(
    (d) => d.day_number === selectedDayNumber
  ) || trip.itineraries[0];

  return (
    <View style={styles.container}>
      {/* Trip Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tripTitle}>{trip.title}</Text>
            <Text style={styles.tripSubtitle}>
              <Ionicons name="location" size={14} color={colors.primaryLight} /> {trip.origin} → {trip.destination_name}
            </Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tripStatsRow}>
          <Text style={styles.statText}>
            <Ionicons name="calendar-outline" size={13} color="#FFFFFF" /> {trip.start_date} ({trip.total_days}d)
          </Text>
          <Text style={styles.statText}>
            <Ionicons name="people-outline" size={13} color="#FFFFFF" /> {trip.num_travelers} traveler(s)
          </Text>
          <Text style={styles.statText}>
            <Ionicons name="wallet-outline" size={13} color="#FFFFFF" /> ₹{trip.total_budget?.toLocaleString()}
          </Text>
        </View>

        {/* Action Pills to Safety, Budget, Map */}
        <View style={styles.actionPillsRow}>
          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => router.push('/trip/safety')}
          >
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.actionPillText}>Safety Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => router.push('/trip/budget')}
          >
            <Ionicons name="cash-outline" size={14} color="#F59E0B" />
            <Text style={styles.actionPillText}>Budget Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => router.push('/trip/map')}
          >
            <Ionicons name="map-outline" size={14} color="#06B6D4" />
            <Text style={styles.actionPillText}>Route Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Selector Tabs */}
      <View style={styles.daysTabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
          {trip.itineraries.map((itin) => (
            <TouchableOpacity
              key={itin.day_number}
              onPress={() => setSelectedDayNumber(itin.day_number)}
              style={[
                styles.dayTab,
                selectedDayNumber === itin.day_number && styles.dayTabActive,
              ]}
            >
              <Text
                style={[
                  styles.dayTabText,
                  selectedDayNumber === itin.day_number && styles.dayTabTextActive,
                ]}
              >
                Day {itin.day_number}
              </Text>
              <Text
                style={[
                  styles.dayTabDate,
                  selectedDayNumber === itin.day_number && styles.dayTabDateActive,
                ]}
              >
                {itin.date.slice(5)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Day Itinerary Timeline */}
      <ScrollView style={styles.timelineScroll} contentContainerStyle={styles.timelineContent}>
        {selectedDay ? (
          <>
            <View style={styles.dayOverviewBox}>
              <View>
                <Text style={styles.dayOverviewTitle}>Day {selectedDay.day_number} Overview</Text>
                <Text style={styles.dayOverviewNotes}>{selectedDay.notes}</Text>
              </View>
              <View style={styles.dailyExpenseBadge}>
                <Text style={styles.dailyExpenseLabel}>DAY EXPENSES</Text>
                <Text style={styles.dailyExpenseValue}>₹{selectedDay.daily_expense_estimate?.toFixed(0)}</Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {selectedDay.items.map((item, index) => (
                <ItineraryItemRow
                  key={item.id || index}
                  item={item}
                  isLast={index === selectedDay.items.length - 1}
                />
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No activities scheduled for this day.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerBanner: {
    backgroundColor: '#0F766E', // Deep Teal
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tripSubtitle: {
    fontSize: 13,
    color: '#CCFBF1',
    marginTop: 2,
  },
  shareBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: borderRadius.full,
  },
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    flex: 1,
    justifyContent: 'center',
    elevation: 2,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
  daysTabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  daysScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 10,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: colors.primary,
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  dayTabDate: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  dayTabDateActive: {
    color: '#CCFBF1',
  },
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dayOverviewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayOverviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  dayOverviewNotes: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  dailyExpenseBadge: {
    backgroundColor: '#F0FDFA',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dailyExpenseLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dailyExpenseValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  itemsList: {
    marginTop: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 30,
  },
});
