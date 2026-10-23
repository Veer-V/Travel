import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button, Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);

  const [email, setEmail] = useState('demo@smartvoyage.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      Alert.alert('Welcome Back', 'Signed in successfully!');
      router.back();
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoBox}>
        <View style={styles.logoCircle}>
          <Ionicons name="compass" size={40} color={colors.primary} />
        </View>
        <Text style={styles.appTitle}>SmartVoyage AI</Text>
        <Text style={styles.appSubtitle}>Sign in to sync your trips across all devices</Text>
      </View>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginBtn}
            labelStyle={styles.loginBtnLabel}
          >
            Sign In
          </Button>

          <View style={styles.dividerRow}>
            <Divider style={{ flex: 1 }} />
            <Text style={styles.dividerText}>OR</Text>
            <Divider style={{ flex: 1 }} />
          </View>

          <Button
            mode="outlined"
            onPress={handleGuest}
            style={styles.guestBtn}
            icon="eye-outline"
          >
            Continue in Guest Mode
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoBox: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  loginBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  guestBtn: {
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
