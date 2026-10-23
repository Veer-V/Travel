import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Attraction } from '../types';
import { colors, borderRadius, spacing } from '../theme/theme';

interface AttractionCardProps {
  attraction: Attraction;
  onPress?: () => void;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ attraction, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress} mode="outlined">
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{attraction.name}</Text>
            <Text style={styles.category}>{attraction.category.toUpperCase()}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{attraction.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {attraction.description}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={styles.infoText}>{attraction.estimated_visit_duration} mins</Text>
          </View>

          <View style={styles.infoPill}>
            <Ionicons name="cash-outline" size={13} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {attraction.admission_price === 0 ? 'Free Entry' : `₹${attraction.admission_price.toFixed(0)}`}
            </Text>
          </View>

          <View style={styles.infoPill}>
            <Ionicons name="business-outline" size={13} color={colors.textMuted} />
            <Text style={styles.infoText} numberOfLines={1}>{attraction.opening_hours}</Text>
          </View>
        </View>

        {attraction.accessibility_features && (
          <View style={styles.accessRow}>
            <Ionicons name="body" size={12} color={colors.primary} />
            <Text style={styles.accessText}>{attraction.accessibility_features}</Text>
          </View>
        )}

        {attraction.explanation && attraction.explanation.length > 0 && (
          <View style={styles.aiReasonBox}>
            <Ionicons name="sparkles" size={13} color={colors.secondary} style={{ marginRight: 4 }} />
            <Text style={styles.aiReasonText}>{attraction.explanation[0]}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
    borderColor: colors.border,
  },
  content: {
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  category: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
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
  description: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 6,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  infoText: {
    fontSize: 11,
    color: colors.text,
    marginLeft: 4,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  accessText: {
    fontSize: 11,
    color: colors.primary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  aiReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: 8,
  },
  aiReasonText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },
});
