import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/theme';

interface MapPoint {
  id: string;
  name: string;
  type: 'origin' | 'destination' | 'attraction' | 'restaurant' | 'hotel';
  latitude?: number;
  longitude?: number;
  timeSlot?: string;
}

interface InteractiveMapPlaceholderProps {
  origin: string;
  destination: string;
  points?: MapPoint[];
  distanceKm?: number;
  travelTimeMinutes?: number;
  isApproximate?: boolean;
}

export const InteractiveMapPlaceholder: React.FC<InteractiveMapPlaceholderProps> = ({
  origin,
  destination,
  points = [],
  distanceKm = 265,
  travelTimeMinutes = 240,
  isApproximate = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'attraction' | 'restaurant' | 'hotel'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const filteredPoints = selectedFilter === 'all' ? points : points.filter((p) => p.type === selectedFilter);

  return (
    <Card style={styles.card} mode="elevated">
      {/* Route Header */}
      <View style={styles.routeHeader}>
        <View style={styles.routeCol}>
          <Text style={styles.hubLabel}>ORIGIN</Text>
          <Text style={styles.hubName}>{origin}</Text>
        </View>

        <View style={styles.transitIndicator}>
          <Ionicons name="airplane" size={16} color={colors.primary} />
          <View style={styles.transitLine} />
          <Text style={styles.distanceText}>~{distanceKm} km</Text>
        </View>

        <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.hubLabel}>DESTINATION</Text>
          <Text style={styles.hubName}>{destination}</Text>
        </View>
      </View>

      {/* Filter and Mode Bar */}
      <View style={styles.controlsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Chip
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={styles.chip}
            compact
          >
            All Stops
          </Chip>
          <Chip
            selected={selectedFilter === 'attraction'}
            onPress={() => setSelectedFilter('attraction')}
            style={styles.chip}
            compact
          >
            Attractions
          </Chip>
          <Chip
            selected={selectedFilter === 'restaurant'}
            onPress={() => setSelectedFilter('restaurant')}
            style={styles.chip}
            compact
          >
            Dining
          </Chip>
        </ScrollView>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Ionicons name={viewMode === 'map' ? 'list' : 'map'} size={16} color={colors.primary} />
          <Text style={styles.toggleText}>{viewMode === 'map' ? 'List View' : 'Map View'}</Text>
        </TouchableOpacity>
      </View>

      {/* Visual Canvas Representation */}
      {viewMode === 'map' ? (
        <View style={styles.mapCanvas}>
          <View style={styles.mapGrid}>
            <View style={styles.routePathCurve} />
            {filteredPoints.slice(0, 5).map((pt, index) => (
              <View
                key={pt.id || index}
                style={[
                  styles.mapPin,
                  {
                    left: `${20 + index * 16}%`,
                    top: `${30 + (index % 2 === 0 ? -15 : 20)}%`,
                  },
                ]}
              >
                <View style={[styles.pinBubble, pt.type === 'restaurant' && styles.pinDining]}>
                  <Ionicons
                    name={pt.type === 'restaurant' ? 'restaurant' : 'camera'}
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.pinLabel} numberOfLines={1}>
                  {pt.name}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.mapWatermark}>
            <Ionicons name="map-outline" size={14} color={colors.textMuted} />
            <Text style={styles.watermarkText}>
              Interactive Geospatial Route • {isApproximate ? 'Geodesic Distance' : 'OSRM Road Routing'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.listView}>
          {filteredPoints.length === 0 ? (
            <Text style={styles.emptyList}>No stops scheduled for this filter.</Text>
          ) : (
            filteredPoints.map((pt, i) => (
              <View key={pt.id || i} style={styles.listItem}>
                <View style={styles.listBullet}>
                  <Text style={styles.bulletText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listPointName}>{pt.name}</Text>
                  <Text style={styles.listPointType}>{pt.type.toUpperCase()}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    borderColor: colors.border,
    overflow: 'hidden',
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#F0FDFA', // Mint tint
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
  },
  routeCol: {
    maxWidth: '35%',
  },
  hubLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  hubName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  transitIndicator: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  transitLine: {
    height: 2,
    backgroundColor: colors.primary,
    width: '100%',
    marginVertical: 4,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    height: 30,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.sm,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  mapCanvas: {
    height: 180,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    justifyContent: 'space-between',
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
  },
  routePathCurve: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: 2,
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    width: 90,
    marginLeft: -45,
  },
  pinBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  pinDining: {
    backgroundColor: colors.secondary,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    textAlign: 'center',
  },
  mapWatermark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 4,
  },
  watermarkText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginLeft: 4,
  },
  listView: {
    padding: spacing.md,
  },
  emptyList: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bulletText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listPointName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  listPointType: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
});
