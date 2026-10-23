import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, List, Divider, Switch, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { colors, borderRadius, spacing } from '../../src/theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const logout = useAuthStore((s) => s.logout);

  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const accessibility = useSettingsStore((s) => s.accessibilityNeeds);
  const setPreferences = useSettingsStore((s) => s.setPreferences);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Local Data',
      'This will clear your local cached trips and preferences on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Data Cleared', 'All local storage has been wiped successfully.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.userName}>{user ? user.full_name || 'Traveler' : 'Guest Traveler'}</Text>
            <Text style={styles.userEmail}>{user ? user.email : 'Browsing without account'}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: user ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={[styles.statusText, { color: user ? '#065F46' : '#92400E' }]}>
                  {user ? 'Verified Account' : 'Guest Mode'}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>

        <Card.Actions style={styles.authActions}>
          {user ? (
            <Button mode="outlined" onPress={handleLogout} textColor="#EF4444" style={styles.actionBtn}>
              Sign Out
            </Button>
          ) : (
            <View style={styles.authButtonsRow}>
              <Button
                mode="contained"
                onPress={() => router.push('/auth/login')}
                style={[styles.actionBtn, { backgroundColor: colors.primary, marginRight: 8 }]}
              >
                Sign In
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push('/auth/register')}
                style={styles.actionBtn}
              >
                Register
              </Button>
            </View>
          )}
        </Card.Actions>
      </Card>

      {/* Preferences Section */}
      <Text style={styles.sectionHeader}>Preferences & Units</Text>
      <Card style={styles.card} mode="outlined">
        <List.Item
          title="Display Currency"
          description="Default currency for budget estimation"
          left={(props) => <List.Icon {...props} icon="currency-inr" color={colors.primary} />}
          right={() => (
            <SegmentedButtons
              value={currency}
              onValueChange={(val) => setCurrency(val as any)}
              buttons={[
                { value: 'INR', label: 'INR ₹' },
                { value: 'USD', label: 'USD $' },
                { value: 'EUR', label: 'EUR €' },
              ]}
              style={{ width: 170 }}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Accessibility Requirements"
          description={accessibility === 'none' ? 'Standard accessibility' : accessibility.toUpperCase()}
          left={(props) => <List.Icon {...props} icon="human" color={colors.primary} />}
          onPress={() => {
            const next = accessibility === 'none' ? 'wheelchair' : accessibility === 'wheelchair' ? 'step_free' : 'none';
            setPreferences({ accessibilityNeeds: next });
          }}
        />
      </Card>

      {/* Responsible AI & Safety Notice */}
      <Text style={styles.sectionHeader}>Safety & Responsible AI Policy</Text>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.policyRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.policyTitle}>Ethical AI & Non-Stigmatization</Text>
          </View>
          <Text style={styles.policyText}>
            SmartVoyage AI uses transparent machine learning to model safety and travel costs.
            Protected demographic attributes (religion, caste, gender, identity) are strictly excluded from all training and recommendation pipelines.
            Safety assessments are informational benchmarks and cannot guarantee personal safety.
          </Text>
        </Card.Content>
      </Card>

      {/* Data Privacy & Reset */}
      <Text style={styles.sectionHeader}>Privacy & Device Storage</Text>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.privacyDesc}>
            Your planned trip drafts and preferences are kept locally on your device by default.
          </Text>
          <Button
            mode="outlined"
            onPress={handleClearData}
            textColor="#EF4444"
            icon="trash-can-outline"
            style={{ marginTop: 12, borderColor: '#FCA5A5' }}
          >
            Clear Local Cache & Stored Trips
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.versionFooter}>SmartVoyage AI • Version 1.0.0 • Mobile Client</Text>
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
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderColor: colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  authActions: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  authButtonsRow: {
    flexDirection: 'row',
    flex: 1,
  },
  actionBtn: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  policyText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  privacyDesc: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginVertical: spacing.md,
  },
});
