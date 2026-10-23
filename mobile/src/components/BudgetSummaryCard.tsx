import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { BudgetEstimate } from '../types';
import { colors, borderRadius, spacing } from '../theme/theme';

interface BudgetSummaryCardProps {
  budget: BudgetEstimate;
  userBudget?: number;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({ budget, userBudget }) => {
  const isOverBudget = userBudget ? budget.total_estimated_budget > userBudget : false;

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>ESTIMATED TOTAL EXPENSES</Text>
            <Text style={styles.totalAmount}>₹{budget.total_estimated_budget.toLocaleString()}</Text>
            <Text style={styles.rangeText}>
              Range: ₹{budget.low_range.toLocaleString()} - ₹{budget.high_range.toLocaleString()}
            </Text>
          </View>
          <View style={styles.perPersonBox}>
            <Text style={styles.perPersonLabel}>PER TRAVELER</Text>
            <Text style={styles.perPersonAmount}>₹{budget.cost_per_person.toLocaleString()}</Text>
          </View>
        </View>

        {isOverBudget && (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={16} color="#DC2626" />
            <Text style={styles.warningText}>
              Estimated expenses exceed your set budget of ₹{userBudget?.toLocaleString()}!
            </Text>
          </View>
        )}

        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Budget Allocation Breakdown</Text>
          {budget.breakdown.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemMeta}>
                <Text style={styles.itemName}>{item.category}</Text>
                <Text style={styles.itemAmount}>₹{item.amount.toLocaleString()} ({item.percentage}%)</Text>
              </View>
              <ProgressBar
                progress={item.percentage / 100}
                color={idx % 2 === 0 ? colors.primary : colors.secondary}
                style={styles.progressBar}
              />
              {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>{budget.disclaimer}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    borderColor: colors.border,
    elevation: 3,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  rangeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  perPersonBox: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  perPersonLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  perPersonAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  warningText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  breakdownContainer: {
    marginTop: spacing.md,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemRow: {
    marginBottom: spacing.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  itemAmount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceVariant,
  },
  itemNotes: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  disclaimerBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
