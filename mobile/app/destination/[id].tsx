import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { tripService } from '../../src/services/tripService';
import { Destination, Attraction, Restaurant, Accommodation, SafetyAssessment } from '../../src/types';
import { AttractionCard } from '../../src/components/AttractionCard';
import { SafetyBadge } from '../../src/components/SafetyBadge';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function DestinationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [safety, setSafety] = useState<SafetyAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const destId = parseInt(id, 10);
      try {
        const [dest, attrs, rests, accs, safe] = await Promise.all([
          tripService.getDestinationById(destId),
          tripService.getAttractions(destId),
          tripService.getRestaurants(destId),
          tripService.getAccommodations(destId),
          tripService.getSafetyAssessment(destId).catch(() => null),
        ]);
        setDestination(dest);
        setAttractions(attrs);
        setRestaurants(rests);
        setAccommodations(accs);
        setSafety(safe);
      } catch (e) {
        console.warn('Failed to load destination details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching destination guide...</Text>
      </View>
    );
  }

  if (!destination) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Destination Not Found</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Destination Header Banner */}
        <Card style={styles.headerCard} mode="elevated">
          <View style={styles.headerBanner}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{destination.destination_type.toUpperCase()}</Text>
            </View>
            <Text style={styles.destTitle}>{destination.name}</Text>
            <Text style={styles.destLocation}>
              <Ionicons name="location-sharp" size={15} color="#CCFBF1" /> {destination.state_or_region}, {destination.country}
            </Text>

            <View style={styles.headerMetaRow}>
              {destination.best_time_to_visit && (
                <View style={styles.metaBadge}>
                  <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
                  <Text style={styles.metaBadgeText}>Best: {destination.best_time_to_visit}</Text>
                </View>
              )}
              {destination.climate && (
                <View style={styles.metaBadge}>
                  <Ionicons name="partly-sunny-outline" size={13} color="#FFFFFF" />
                  <Text style={styles.metaBadgeText}>{destination.climate}</Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Safety Indicator Overview */}
        {safety && (
          <Card style={styles.safetyCard} mode="outlined">
            <Card.Content>
              <View style={styles.safetyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.safetyLabel}>SAFETY RISK LEVEL</Text>
                  <SafetyBadge status={safety.overall_risk_category} size="medium" />
                </View>
                <View style={styles.advisoryBadge}>
                  <Text style={styles.advisoryLabel}>ADVISORY STATUS</Text>
                  <Text style={styles.advisoryValue}>{safety.official_advisory_status}</Text>
                </View>
              </View>
              {safety.explanation.length > 0 && (
                <Text style={styles.safetyNote} numberOfLines={2}>
                  {safety.explanation[0]}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Description */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text style={styles.sectionTitle}>About {destination.name}</Text>
            <Text style={styles.description}>{destination.description}</Text>
            <Text style={styles.sourceText}>Source: {destination.source}</Text>
          </Card.Content>
        </Card>

        {/* Top Attractions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Top Points of Interest ({attractions.length})</Text>
          {attractions.length === 0 ? (
            <Text style={styles.emptyListText}>No attractions listed.</Text>
          ) : (
            attractions.map((attr) => (
              <AttractionCard key={attr.id || attr.attraction_id} attraction={attr} />
            ))
          )}
        </View>

        {/* Curated Dining */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Local Regional Dining ({restaurants.length})</Text>
          {restaurants.map((rest) => (
            <Card key={rest.id} style={styles.miniCard} mode="outlined">
              <Card.Content style={styles.miniCardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniCardName}>{rest.name}</Text>
                  <Text style={styles.miniCardSub}>{rest.cuisine}</Text>
                  <Text style={styles.miniCardMeta}>
                    {rest.price_level.toUpperCase()} • {rest.dietary_options}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{rest.rating.toFixed(1)}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Recommended Accommodations */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Where to Stay ({accommodations.length})</Text>
          {accommodations.map((acc) => (
            <Card key={acc.id} style={styles.miniCard} mode="outlined">
              <Card.Content style={styles.miniCardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniCardName}>{acc.name}</Text>
                  <Text style={styles.miniCardSub}>{acc.accommodation_type.toUpperCase()} • {acc.amenities}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.priceTariff}>₹{acc.price_per_night.toLocaleString()}</Text>
                  <Text style={styles.perNightLabel}>per night</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.footerBar}>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/plan')}
          style={styles.planTripBtn}
          labelStyle={styles.planTripBtnLabel}
          icon="sparkles"
        >
          Plan Trip to {destination.name}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 80,
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
  headerCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  headerBanner: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  destLocation: {
    fontSize: 14,
    color: '#CCFBF1',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  headerMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  metaBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  safetyCard: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  safetyLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  advisoryBadge: {
    alignItems: 'flex-end',
  },
  advisoryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  advisoryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  safetyNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  sourceText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyListText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  miniCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderColor: colors.border,
  },
  miniCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
  },
  miniCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  miniCardSub: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  miniCardMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 3,
  },
  priceTariff: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  perNightLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
  },
  planTripBtn: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
  },
  planTripBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
