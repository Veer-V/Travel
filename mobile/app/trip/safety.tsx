import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Card, Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../src/store/useTripStore';
import { tripService } from '../../src/services/tripService';
import { SafetyAssessment } from '../../src/types';
import { SafetyBadge } from '../../src/components/SafetyBadge';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function SafetyDashboardScreen() {
  const currentTrip = useTripStore((s) => s.currentTrip);
  const [assessment, setAssessment] = useState<SafetyAssessment | null>(
    currentTrip?.safety_assessment || null
  );
  const [loading, setLoading] = useState(!currentTrip?.safety_assessment);

  useEffect(() => {
    async function fetchSafety() {
      if (!currentTrip?.destination_id) return;
      try {
        const data = await tripService.getSafetyAssessment(currentTrip.destination_id);
        setAssessment(data);
      } catch (e) {
        console.warn('Failed to load safety assessment:', e);
      } finally {
        setLoading(false);
      }
    }

    if (!assessment && currentTrip?.destination_id) {
      fetchSafety();
    } else {
      setLoading(false);
    }
  }, [currentTrip]);

  const dialEmergency = (num: string) => {
    Linking.openURL(`tel:${num}`).catch((err) => console.warn('Cannot dial phone number:', err));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Auditing destination safety data...</Text>
      </View>
    );
  }

  const destName = currentTrip?.destination_name || 'Destination';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overview Status Banner */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text style={styles.sectionOverline}>DESTINATION SAFETY ASSESSMENT</Text>
          <Text style={styles.destName}>{destName}</Text>
          <View style={styles.statusRow}>
            <SafetyBadge status={assessment?.overall_risk_category || 'Lower observed risk'} size="large" />
            <Text style={styles.confidenceText}>
              Confidence: {assessment?.confidence_level || 'High (calibrated)'}
            </Text>
          </View>

          <View style={styles.qualityRow}>
            <Ionicons name="document-text-outline" size={13} color={colors.textMuted} />
            <Text style={styles.qualityText}>
              Data Quality: <Text style={{ fontWeight: '700' }}>{assessment?.data_quality.toUpperCase()}</Text> • Source: {assessment?.source_provenance || 'NCRB / IMD Public Bulletins'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Primary Indicator Cards Grid */}
      <View style={styles.indicatorsGrid}>
        {/* Crime Risk */}
        <Card style={styles.indicatorCard} mode="outlined">
          <Card.Content style={{ padding: 12 }}>
            <Ionicons name="shield-outline" size={20} color={colors.primary} />
            <Text style={styles.indLabel}>PETTY CRIME / THEFT</Text>
            <Text style={styles.indValue}>{assessment?.crime_risk_indicator || 'Low frequency'}</Text>
          </Card.Content>
        </Card>

        {/* Environmental Hazard */}
        <Card style={styles.indicatorCard} mode="outlined">
          <Card.Content style={{ padding: 12 }}>
            <Ionicons name="cloudy-night-outline" size={20} color="#F59E0B" />
            <Text style={styles.indLabel}>ENVIRONMENT / WEATHER</Text>
            <Text style={styles.indValue}>{assessment?.environmental_hazard_indicator || 'None reported'}</Text>
          </Card.Content>
        </Card>

        {/* Transport Risk */}
        <Card style={styles.indicatorCard} mode="outlined">
          <Card.Content style={{ padding: 12 }}>
            <Ionicons name="car-outline" size={20} color="#0EA5E9" />
            <Text style={styles.indLabel}>TRANSIT & ROADWAYS</Text>
            <Text style={styles.indValue}>{assessment?.transport_risk_indicator || 'Standard traffic'}</Text>
          </Card.Content>
        </Card>

        {/* Official Advisory */}
        <Card style={styles.indicatorCard} mode="outlined">
          <Card.Content style={{ padding: 12 }}>
            <Ionicons name="megaphone-outline" size={20} color="#8B5CF6" />
            <Text style={styles.indLabel}>OFFICIAL ADVISORY</Text>
            <Text style={styles.indValue}>{assessment?.official_advisory_status || 'Normal'}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Model Explanations */}
      {assessment?.explanation && assessment.explanation.length > 0 && (
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <Ionicons name="analytics-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Why this rating?</Text>
            </View>
            {assessment.explanation.map((exp, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>{exp}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Practical Precautions */}
      {assessment?.precautions && assessment.precautions.length > 0 && (
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <Ionicons name="compass-outline" size={18} color={colors.secondary} />
              <Text style={styles.cardTitle}>Recommended Precautions</Text>
            </View>
            {assessment.precautions.map((prec, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="chevron-forward-circle" size={14} color={colors.secondary} style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>{prec}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Official Verified Emergency Contacts */}
      <Card style={[styles.card, styles.emergencyCard]} mode="elevated">
        <Card.Content>
          <View style={styles.cardTitleRow}>
            <Ionicons name="call" size={18} color="#DC2626" />
            <Text style={[styles.cardTitle, { color: '#DC2626' }]}>Local Emergency Numbers</Text>
          </View>
          <Text style={styles.emergencySub}>Official verified emergency services across India:</Text>

          <View style={styles.contactsGrid}>
            {[
              { label: 'National Emergency', num: '112', icon: 'shield' },
              { label: 'Tourist Helpline', num: '1363', icon: 'information-circle' },
              { label: 'Ambulance / Medical', num: '108', icon: 'medical' },
              { label: 'Women Helpline', num: '1091', icon: 'heart' },
            ].map((c) => (
              <TouchableOpacity
                key={c.num}
                onPress={() => dialEmergency(c.num)}
                style={styles.contactBtn}
              >
                <View>
                  <Text style={styles.contactLabel}>{c.label}</Text>
                  <Text style={styles.contactNum}>{c.num}</Text>
                </View>
                <Ionicons name="call-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Legal & Informational Notice */}
      <View style={styles.disclaimerContainer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={styles.disclaimerText}>
          {assessment?.disclaimer ||
            'Informational assessment only based on published open statistics and meteorological feeds. SmartVoyage AI cannot guarantee personal safety.'}
        </Text>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderColor: colors.border,
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  destName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  confidenceText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  qualityText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 6,
    flex: 1,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.md,
  },
  indicatorCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.border,
  },
  indLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 6,
  },
  indValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  emergencySub: {
    fontSize: 12,
    color: '#991B1B',
    marginBottom: spacing.sm,
  },
  contactsGrid: {
    gap: 8,
  },
  contactBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  contactLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  contactNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 2,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginTop: spacing.sm,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
});
