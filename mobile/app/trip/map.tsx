import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../src/store/useTripStore';
import { InteractiveMapPlaceholder } from '../../src/components/InteractiveMapPlaceholder';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function RouteMapScreen() {
  const currentTrip = useTripStore((s) => s.currentTrip);

  if (!currentTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active trip selected for route mapping.</Text>
      </View>
    );
  }

  // Aggregate all itinerary items into map points
  const points: any[] = [];
  currentTrip.itineraries.forEach((itin) => {
    itin.items.forEach((item) => {
      points.push({
        id: item.id,
        name: item.activity_name,
        type: item.activity_type,
        latitude: item.latitude,
        longitude: item.longitude,
        timeSlot: item.time_slot,
      });
    });
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Trip Transit & Route Map</Text>
      <Text style={styles.subtitle}>
        Geospatial path connecting {currentTrip.origin} to {currentTrip.destination_name} and local points of interest.
      </Text>

      <InteractiveMapPlaceholder
        origin={currentTrip.origin}
        destination={currentTrip.destination_name}
        points={points}
        distanceKm={280}
        travelTimeMinutes={260}
      />

      <Card style={styles.routeLegsCard} mode="outlined">
        <Card.Content>
          <Text style={styles.legsTitle}>Transit Route Logistics</Text>

          <View style={styles.legItem}>
            <View style={styles.legIcon}>
              <Ionicons name="airplane" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.legName}>Intercity Corridor: {currentTrip.origin} ↔ {currentTrip.destination_name}</Text>
              <Text style={styles.legMeta}>Mode: {currentTrip.transport_preference.toUpperCase()} • Direct Route</Text>
            </View>
          </View>

          <View style={styles.legItem}>
            <View style={styles.legIcon}>
              <Ionicons name="car" size={18} color={colors.secondary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.legName}>Local Ground Transit</Text>
              <Text style={styles.legMeta}>Prepaid Cabs, Auto-Rickshaws & Metro within {currentTrip.destination_name}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  routeLegsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  legsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  legItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  legMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
