import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { tripService } from '../../src/services/tripService';
import { Destination, Trip } from '../../src/types';
import { DestinationCard } from '../../src/components/DestinationCard';
import { useTripStore } from '../../src/store/useTripStore';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const savedTrips = useTripStore((s) => s.savedTrips);
  const favIds = useTripStore((s) => s.favoriteDestinationIds);
  const toggleFav = useTripStore((s) => s.toggleFavoriteDestination);

  const fetchHomeData = async () => {
    try {
      const typeParam = activeCategory === 'all' ? undefined : activeCategory;
      const data = await tripService.getDestinations(typeParam, undefined, 8);
      setDestinations(data);
    } catch (e) {
      console.warn('Failed to load home destinations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [activeCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Hero AI Travel Planner Banner */}
      <Card style={styles.heroCard} mode="elevated">
        <View style={styles.heroGradient}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color="#F59E0B" />
            <Text style={styles.heroBadgeText}>AI-Powered Travel Intelligence</Text>
          </View>
          <Text style={styles.heroTitle}>Explore Incredible India Smartly</Text>
          <Text style={styles.heroSubtitle}>
            Custom multi-day itineraries, verified safety risk ratings, and realistic budget estimation.
          </Text>

          <Button
            mode="contained"
            onPress={() => router.push('/(tabs)/plan')}
            style={styles.heroButton}
            labelStyle={styles.heroButtonLabel}
            icon="airplane"
          >
            Start Planning Trip
          </Button>
        </View>
      </Card>

      {/* Safety Alert & Verified Intelligence Card */}
      <Card style={styles.infoNoticeCard} mode="outlined">
        <View style={styles.noticeRow}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.noticeTitle}>Evidence-Based Safety</Text>
            <Text style={styles.noticeText}>
              Every destination is audited with historical incident benchmarks, IMD weather hazards, and official government advisories.
            </Text>
          </View>
        </View>
      </Card>

      {/* Recent Trips Section (if any) */}
      {savedTrips.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Planned Trips</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/saved')}>
              <Text style={styles.seeAllText}>View All ({savedTrips.length})</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripHorizontalScroll}>
            {savedTrips.slice(0, 3).map((trip) => (
              <Card
                key={trip.id}
                style={styles.tripMiniCard}
                onPress={() => router.push(`/trip/${trip.id}`)}
              >
                <Card.Content style={{ padding: 12 }}>
                  <Text style={styles.tripMiniDest}>{trip.destination_name}</Text>
                  <Text style={styles.tripMiniDays}>{trip.total_days} Days • {trip.num_travelers} Traveler(s)</Text>
                  <View style={styles.tripMiniBudgetRow}>
                    <Text style={styles.tripMiniBudget}>₹{trip.total_budget?.toLocaleString()}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Pills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover by Travel Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {[
            { id: 'all', label: 'All Places', icon: 'globe-outline' },
            { id: 'heritage', label: 'Heritage & Forts', icon: 'business-outline' },
            { id: 'beach', label: 'Beaches', icon: 'water-outline' },
            { id: 'hill_station', label: 'Hill Stations', icon: 'snow-outline' },
            { id: 'spiritual', label: 'Spiritual', icon: 'flame-outline' },
            { id: 'wildlife', label: 'Wildlife', icon: 'paw-outline' },
          ].map((cat) => (
            <Chip
              key={cat.id}
              selected={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
              textStyle={[styles.categoryChipText, activeCategory === cat.id && styles.categoryChipTextActive]}
            >
              {cat.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Popular Destinations Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Destinations</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
            <Text style={styles.seeAllText}>Explore All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
        ) : destinations.length === 0 ? (
          <Text style={styles.emptyText}>No destinations found for this filter.</Text>
        ) : (
          destinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              isFavorite={favIds.includes(dest.id)}
              onToggleFavorite={() => toggleFav(dest.id)}
              onPress={() => router.push(`/destination/${dest.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: '#0F172A', // Dark slate
    elevation: 4,
  },
  heroGradient: {
    padding: spacing.lg,
    backgroundColor: '#0F766E', // Emerald
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  heroButton: {
    backgroundColor: '#F59E0B', // Amber
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  heroButtonLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F172A',
  },
  infoNoticeCard: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  noticeText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  tripHorizontalScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  tripMiniCard: {
    width: 170,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    borderWidth: 1,
  },
  tripMiniDest: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  tripMiniDays: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  tripMiniBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tripMiniBudget: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginVertical: 20,
    fontSize: 13,
  },
});
