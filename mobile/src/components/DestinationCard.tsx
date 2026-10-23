import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Destination } from '../types';
import { colors, borderRadius, spacing } from '../theme/theme';

interface DestinationCardProps {
  destination: Destination;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onPress,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'beach': return '#0284C7';
      case 'hill_station': return '#059669';
      case 'heritage': return '#D97706';
      case 'spiritual': return '#7C3AED';
      case 'wildlife': return '#15803D';
      default: return colors.primary;
    }
  };

  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <View style={[styles.headerBanner, { backgroundColor: getTypeColor(destination.destination_type) }]}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{destination.destination_type.replace('_', ' ').toUpperCase()}</Text>
        </View>
        {onToggleFavorite && (
          <TouchableOpacity onPress={onToggleFavorite} style={styles.favButton}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>

      <Card.Content style={styles.content}>
        <Text style={styles.title}>{destination.name}</Text>
        <Text style={styles.subtitle}>
          <Ionicons name="location-sharp" size={14} color={colors.textMuted} /> {destination.state_or_region}, {destination.country}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {destination.description}
        </Text>

        {destination.best_time_to_visit && (
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.metaText}>Best: {destination.best_time_to_visit}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
  },
  headerBanner: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.sm,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  favButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 6,
    borderRadius: borderRadius.full,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
    marginLeft: 6,
  },
});
