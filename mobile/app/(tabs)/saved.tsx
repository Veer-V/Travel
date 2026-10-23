import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../src/store/useTripStore';
import { SafetyBadge } from '../../src/components/SafetyBadge';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function SavedTripsScreen() {
  const router = useRouter();
  const savedTrips = useTripStore((s) => s.savedTrips);
  const isLoading = useTripStore((s) => s.isLoading);
  const isOffline = useTripStore((s) => s.isOffline);
  const loadSavedTrips = useTripStore((s) => s.loadSavedTrips);
  const deleteTrip = useTripStore((s) => s.deleteTrip);

  useEffect(() => {
    loadSavedTrips();
  }, []);

  const handleDelete = (tripId: string, title: string) => {
    Alert.alert(
      'Delete Trip Plan',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(tripId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Offline Stale Notice Banner */}
      {isOffline && (
        <View style={styles.offlineNotice}>
          <Ionicons name="cloud-offline" size={16} color="#B45309" />
          <Text style={styles.offlineText}>Offline Mode: Showing cached trips from your local storage.</Text>
        </View>
      )}

      <FlatList
        data={savedTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadSavedTrips}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="airplane-outline" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Planned Trips Yet</Text>
            <Text style={styles.emptySubtitle}>
              Use our AI Travel Planner to build your first personalized itinerary with safety indicators and budget predictions.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(tabs)/plan')}
              style={styles.planBtn}
              labelStyle={{ fontWeight: '700' }}
            >
              Plan a New Trip
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            style={styles.tripCard}
            onPress={() => router.push(`/trip/${item.id}`)}
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripTitle}>{item.title}</Text>
                  <Text style={styles.destinationName}>
                    <Ionicons name="location-sharp" size={14} color={colors.primary} /> {item.destination_name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.title)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.datesRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                <Text style={styles.datesText}>
                  {item.start_date} to {item.end_date} • {item.total_days} Days
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>TRAVELERS</Text>
                  <Text style={styles.metaVal}>{item.num_travelers}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>BUDGET</Text>
                  <Text style={styles.metaVal}>₹{item.total_budget?.toLocaleString()}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>STYLE</Text>
                  <Text style={styles.metaVal}>{item.travel_style.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <SafetyBadge status={item.safety_notes || 'Lower observed risk'} size="small" />
                <View style={styles.viewPlanLink}>
                  <Text style={styles.viewPlanText}>View Itinerary</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  offlineText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  tripCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderColor: colors.border,
    elevation: 3,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  datesText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  viewPlanLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPlanText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: spacing.lg,
  },
  planBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
});
