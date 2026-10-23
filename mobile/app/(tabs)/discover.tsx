import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { tripService } from '../../src/services/tripService';
import { Destination } from '../../src/types';
import { DestinationCard } from '../../src/components/DestinationCard';
import { useTripStore } from '../../src/store/useTripStore';
import { colors, spacing } from '../../src/theme/theme';

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const favIds = useTripStore((s) => s.favoriteDestinationIds);
  const toggleFav = useTripStore((s) => s.toggleFavoriteDestination);

  const loadDestinations = async () => {
    try {
      if (searchQuery.trim().length > 0) {
        const results = await tripService.searchDestinations(searchQuery.trim());
        setDestinations(results);
      } else {
        const typeParam = selectedType === 'all' ? undefined : selectedType;
        const results = await tripService.getDestinations(typeParam, undefined, 56);
        setDestinations(results);
      }
    } catch (e) {
      console.warn('Failed to load destinations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, [selectedType]);

  const handleSearchSubmit = () => {
    setLoading(true);
    loadDestinations();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setLoading(true);
    setTimeout(() => loadDestinations(), 100);
  };

  const types = [
    { id: 'all', label: 'All' },
    { id: 'heritage', label: 'Heritage' },
    { id: 'beach', label: 'Beach' },
    { id: 'hill_station', label: 'Hills' },
    { id: 'spiritual', label: 'Spiritual' },
    { id: 'wildlife', label: 'Wildlife' },
    { id: 'urban', label: 'Urban' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search 56+ Indian destinations, states..."
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          onIconPress={handleSearchSubmit}
          onClearIconPress={handleClearSearch}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ fontSize: 14 }}
        />

        {/* Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={types}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => (
            <Chip
              selected={selectedType === item.id}
              onPress={() => {
                setSearchQuery('');
                setSelectedType(item.id);
              }}
              style={[styles.chip, selectedType === item.id && styles.chipActive]}
              textStyle={selectedType === item.id && { color: '#FFFFFF', fontWeight: '700' }}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      {/* Destination List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching destinations...</Text>
        </View>
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadDestinations();
              }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Destinations Found</Text>
              <Text style={styles.emptySubtitle}>Try searching for another city, state, or category.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <DestinationCard
              destination={item}
              isFavorite={favIds.includes(item.id)}
              onToggleFavorite={() => toggleFav(item.id)}
              onPress={() => router.push(`/destination/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchbar: {
    backgroundColor: colors.surfaceVariant,
    elevation: 0,
    borderRadius: 12,
  },
  chipList: {
    gap: 8,
    marginTop: spacing.sm,
  },
  chip: {
    height: 32,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
