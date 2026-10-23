import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/theme';

interface SafetyBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({ status, size = 'medium' }) => {
  const normalized = (status || 'Lower observed risk').toLowerCase();

  let bg = colors.riskLow + '20';
  let textColor = colors.riskLow;
  let iconName: any = 'shield-checkmark';

  if (normalized.includes('moderate')) {
    bg = colors.riskModerate + '20';
    textColor = colors.riskModerate;
    iconName = 'alert-circle';
  } else if (normalized.includes('elevated')) {
    bg = colors.riskElevated + '20';
    textColor = colors.riskElevated;
    iconName = 'warning';
  } else if (normalized.includes('warning') || normalized.includes('active')) {
    bg = colors.riskWarning + '20';
    textColor = colors.riskWarning;
    iconName = 'alert';
  } else if (normalized.includes('insufficient')) {
    bg = colors.riskInsufficient + '20';
    textColor = colors.riskInsufficient;
    iconName = 'help-circle';
  }

  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
  const fontSize = size === 'small' ? 11 : size === 'large' ? 14 : 12;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name={iconName} size={iconSize} color={textColor} style={{ marginRight: 4 }} />
      <Text style={[styles.text, { color: textColor, fontSize }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
