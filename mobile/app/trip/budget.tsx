import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../src/store/useTripStore';
import { BudgetSummaryCard } from '../../src/components/BudgetSummaryCard';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function BudgetDashboardScreen() {
  const currentTrip = useTripStore((s) => s.currentTrip);
  const saveTripLocally = useTripStore((s) => s.saveTripLocally);

  // Local expense logging state
  const [actualExpenses, setActualExpenses] = useState<any[]>(currentTrip?.expenses || []);
  const [expCategory, setExpCategory] = useState('food');
  const [expAmount, setExpAmount] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const budget = currentTrip?.budget_breakdown;

  const handleAddExpense = () => {
    const amt = parseFloat(expAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense number.');
      return;
    }

    const newExp = {
      id: Math.random().toString(),
      category: expCategory,
      amount: amt,
      description: expDescription.trim() || `${expCategory} expense`,
      date: new Date().toISOString().slice(0, 10),
      is_actual: true,
    };

    const updated = [newExp, ...actualExpenses];
    setActualExpenses(updated);
    if (currentTrip) {
      saveTripLocally({ ...currentTrip, expenses: updated });
    }

    setExpAmount('');
    setExpDescription('');
    setShowAddForm(false);
    Alert.alert('Recorded', `Logged ₹${amt.toLocaleString()} under ${expCategory}.`);
  };

  const totalActualSpent = actualExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Budget Summary Card */}
      {budget ? (
        <BudgetSummaryCard budget={budget} userBudget={currentTrip?.total_budget} />
      ) : (
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.cardTitle}>Set Target Budget</Text>
            <Text style={styles.totalAmount}>₹{currentTrip?.total_budget?.toLocaleString()}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Actual Expenses Tracker */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.actualHeader}>
            <View>
              <Text style={styles.actualOverline}>ACTUAL SPENT SO FAR</Text>
              <Text style={styles.actualTotal}>₹{totalActualSpent.toLocaleString()}</Text>
            </View>
            <Button
              mode="contained-tonal"
              onPress={() => setShowAddForm(!showAddForm)}
              icon={showAddForm ? 'close' : 'plus'}
              compact
            >
              {showAddForm ? 'Cancel' : 'Log Expense'}
            </Button>
          </View>

          {/* Add Expense Form */}
          {showAddForm && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Record New Expense</Text>

              <SegmentedButtons
                value={expCategory}
                onValueChange={setExpCategory}
                buttons={[
                  { value: 'food', label: 'Food' },
                  { value: 'transit', label: 'Transit' },
                  { value: 'activity', label: 'Activity' },
                  { value: 'other', label: 'Other' },
                ]}
                style={{ marginBottom: 10 }}
              />

              <TextInput
                label="Amount (INR ₹)"
                value={expAmount}
                onChangeText={setExpAmount}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 8 }}
              />

              <TextInput
                label="Note / Description (Optional)"
                value={expDescription}
                onChangeText={setExpDescription}
                mode="outlined"
                style={{ marginBottom: 12 }}
              />

              <Button
                mode="contained"
                onPress={handleAddExpense}
                style={{ backgroundColor: colors.primary }}
              >
                Save Expense
              </Button>
            </View>
          )}

          {/* List of Actual Logged Expenses */}
          <View style={styles.loggedList}>
            <Text style={styles.loggedTitle}>Logged Transactions</Text>
            {actualExpenses.length === 0 ? (
              <Text style={styles.emptyLogged}>No actual expenses recorded yet on this trip.</Text>
            ) : (
              actualExpenses.map((exp, i) => (
                <View key={exp.id || i} style={styles.expRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expDesc}>{exp.description || exp.category}</Text>
                    <Text style={styles.expMeta}>{exp.date} • {exp.category.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.expAmount}>₹{exp.amount.toLocaleString()}</Text>
                </View>
              ))
            )}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  actualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actualOverline: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  actualTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  formContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  loggedList: {
    marginTop: spacing.md,
  },
  loggedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyLogged: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  expMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  expAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
