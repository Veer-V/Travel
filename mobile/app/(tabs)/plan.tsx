import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button, Chip, SegmentedButtons, Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { tripService } from '../../src/services/tripService';
import { Destination, Trip } from '../../src/types';
import { useTripStore } from '../../src/store/useTripStore';
import { colors, borderRadius, spacing } from '../../src/theme/theme';

export default function PlanTripScreen() {
  const router = useRouter();
  const saveTripLocally = useTripStore((s) => s.saveTripLocally);

  // Form State
  const [origin, setOrigin] = useState('Delhi');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<number>(3); // Jaipur by default
  const [destSearch, setDestSearch] = useState('');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-18');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState('25000');
  const [travelStyle, setTravelStyle] = useState('heritage');
  const [transportMode, setTransportMode] = useState('train');
  const [accommodationTier, setAccommodationTier] = useState('hotel');
  const [dietary, setDietary] = useState('standard');
  const [accessibility, setAccessibility] = useState('none');
  const [planning, setPlanning] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const list = await tripService.getDestinations(undefined, undefined, 56);
        setDestinations(list);
      } catch (e) {
        console.warn('Failed to load destination list:', e);
      } finally {
        setLoadingDestinations(false);
      }
    }
    loadDestinations();
  }, []);

  const handlePlanSubmit = async () => {
    if (!origin.trim()) {
      Alert.alert('Required Field', 'Please enter your departure origin city.');
      return;
    }
    if (!selectedDestId) {
      Alert.alert('Required Field', 'Please select a destination.');
      return;
    }

    const budgetNum = parseFloat(budget) || 20000;
    if (budgetNum <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid trip budget amount.');
      return;
    }

    setPlanning(true);
    try {
      const trip = await tripService.planTrip({
        origin: origin.trim(),
        destination_id: selectedDestId,
        start_date: startDate,
        end_date: endDate,
        num_travelers: travelers,
        total_budget: budgetNum,
        travel_style: travelStyle,
        transport_preference: transportMode,
        accommodation_preference: accommodationTier,
        food_preference: dietary,
        accessibility_requirements: accessibility,
      });

      await saveTripLocally(trip);
      setPlanning(false);
      router.push(`/trip/${trip.id}`);
    } catch (e: any) {
      setPlanning(false);
      Alert.alert('Planning Error', e.message || 'Could not generate itinerary. Please try again.');
    }
  };

  const filteredDestinations = destinations.filter((d) =>
    d.name.toLowerCase().includes(destSearch.toLowerCase()) ||
    d.state_or_region.toLowerCase().includes(destSearch.toLowerCase())
  );

  const selectedDestination = destinations.find((d) => d.id === selectedDestId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Customize Your Travel Parameters</Text>
      <Text style={styles.headerSubtitle}>
        Our machine learning recommender & scheduling engine will generate a personalized day-by-day plan.
      </Text>

      {/* 1. Origin City */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.fieldLabel}>1. Departure City / Current Location</Text>
          <TextInput
            mode="outlined"
            value={origin}
            onChangeText={setOrigin}
            placeholder="e.g. Delhi, Mumbai, Bengaluru"
            style={styles.textInput}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="airplane-takeoff" />}
          />
          <View style={styles.quickChipsRow}>
            {['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad'].map((city) => (
              <Chip
                key={city}
                compact
                selected={origin === city}
                onPress={() => setOrigin(city)}
                style={styles.quickChip}
              >
                {city}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* 2. Destination Selection */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.fieldLabel}>2. Target Destination</Text>
          {selectedDestination && (
            <View style={styles.selectedDestBox}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.selectedDestName}>{selectedDestination.name}</Text>
                <Text style={styles.selectedDestMeta}>{selectedDestination.state_or_region} • {selectedDestination.destination_type.toUpperCase()}</Text>
              </View>
            </View>
          )}

          <TextInput
            mode="outlined"
            value={destSearch}
            onChangeText={setDestSearch}
            placeholder="Filter destinations (e.g., Jaipur, Goa, Munnar)..."
            style={[styles.textInput, { marginTop: 8 }]}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="magnify" />}
          />

          {loadingDestinations ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destScroll}>
              {filteredDestinations.slice(0, 10).map((d) => (
                <Chip
                  key={d.id}
                  selected={selectedDestId === d.id}
                  onPress={() => {
                    setSelectedDestId(d.id);
                    setDestSearch('');
                  }}
                  style={[styles.destChip, selectedDestId === d.id && styles.destChipActive]}
                  textStyle={selectedDestId === d.id && { color: '#FFFFFF', fontWeight: '700' }}
                >
                  {d.name}
                </Chip>
              ))}
            </ScrollView>
          )}
        </Card.Content>
      </Card>

      {/* 3. Dates & Travelers */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.fieldLabel}>3. Trip Dates & Group Size</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <TextInput
                label="Start Date (YYYY-MM-DD)"
                value={startDate}
                onChangeText={setStartDate}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                label="End Date (YYYY-MM-DD)"
                value={endDate}
                onChangeText={setEndDate}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
            </View>
          </View>

          <View style={styles.travelerCounterRow}>
            <Text style={styles.counterLabel}>Number of Travelers:</Text>
            <View style={styles.counterControl}>
              <TouchableOpacity
                onPress={() => setTravelers(Math.max(1, travelers - 1))}
                style={styles.counterBtn}
              >
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{travelers}</Text>
              <TouchableOpacity
                onPress={() => setTravelers(Math.min(10, travelers + 1))}
                style={styles.counterBtn}
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 4. Total Budget */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.fieldLabel}>4. Total Target Budget (INR ₹)</Text>
          <TextInput
            mode="outlined"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="cash" />}
          />
          <View style={styles.quickChipsRow}>
            {['15000', '25000', '40000', '70000'].map((amt) => (
              <Chip
                key={amt}
                compact
                selected={budget === amt}
                onPress={() => setBudget(amt)}
                style={styles.quickChip}
              >
                ₹{parseInt(amt).toLocaleString()}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* 5. Travel Style */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.fieldLabel}>5. Travel Style / Theme</Text>
          <View style={styles.chipGrid}>
            {[
              { id: 'heritage', label: 'Heritage & Forts' },
              { id: 'cultural', label: 'Cultural & Art' },
              { id: 'adventure', label: 'Adventure & Trekking' },
              { id: 'nature', label: 'Nature & Scenery' },
              { id: 'beach', label: 'Beach Relaxation' },
              { id: 'spiritual', label: 'Spiritual Pilgrimage' },
              { id: 'relaxation', label: 'Leisure & Wellness' },
              { id: 'budget', label: 'Backpacker Budget' },
            ].map((style) => (
              <Chip
                key={style.id}
                selected={travelStyle === style.id}
                onPress={() => setTravelStyle(style.id)}
                style={[styles.styleChip, travelStyle === style.id && styles.styleChipActive]}
                textStyle={travelStyle === style.id && { color: '#FFFFFF', fontWeight: '700' }}
              >
                {style.label}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* 6. Preferences & Accessibility */}
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text style={styles.fieldLabel}>6. Transit, Lodging & Accessibility</Text>

          <Text style={styles.subFieldLabel}>Transport Preference:</Text>
          <SegmentedButtons
            value={transportMode}
            onValueChange={setTransportMode}
            buttons={[
              { value: 'train', label: 'Train' },
              { value: 'flight', label: 'Flight' },
              { value: 'bus', label: 'Bus' },
              { value: 'car', label: 'Drive' },
            ]}
            style={{ marginBottom: 12 }}
          />

          <Text style={styles.subFieldLabel}>Accommodation Tier:</Text>
          <SegmentedButtons
            value={accommodationTier}
            onValueChange={setAccommodationTier}
            buttons={[
              { value: 'hostel', label: 'Hostel' },
              { value: 'hotel', label: 'Hotel' },
              { value: 'resort', label: 'Resort' },
            ]}
            style={{ marginBottom: 12 }}
          />

          <Text style={styles.subFieldLabel}>Accessibility Requirements:</Text>
          <SegmentedButtons
            value={accessibility}
            onValueChange={setAccessibility}
            buttons={[
              { value: 'none', label: 'Standard' },
              { value: 'wheelchair', label: 'Wheelchair' },
              { value: 'step_free', label: 'Step-Free' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handlePlanSubmit}
        loading={planning}
        disabled={planning}
        style={styles.submitBtn}
        labelStyle={styles.submitBtnLabel}
        icon="sparkles"
      >
        {planning ? 'Generating AI Itinerary...' : 'Generate Personalized Travel Plan'}
      </Button>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  subFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.surface,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  quickChip: {
    height: 28,
  },
  selectedDestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  selectedDestName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  selectedDestMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  destScroll: {
    gap: 8,
    paddingVertical: spacing.xs,
  },
  destChip: {
    height: 32,
  },
  destChipActive: {
    backgroundColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
  },
  travelerCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
  },
  counterBtn: {
    padding: 8,
  },
  counterValue: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 12,
    color: colors.text,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChip: {
    marginVertical: 2,
  },
  styleChipActive: {
    backgroundColor: colors.primary,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 6,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    elevation: 3,
  },
  submitBtnLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
