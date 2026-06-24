import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, AccommodationEntry } from '../store/useAppStore';
import StatusBadge from '../components/StatusBadge';
import { Sparkle, Cloud, Dot } from '../components/TravelDecorations';
import { MenuSheet } from '../components/BottomSheet';
import BottomSheet, { SheetButton } from '../components/BottomSheet';

// Flight connecting to check-in
const CONNECTING_FLIGHT = 'Garuda Indonesia GA408';

const PLATFORMS = ['Airbnb', 'Booking.com', 'Agoda', 'Other'];
const PLATFORM_URLS: Record<string, string> = {
  'Airbnb': 'https://www.airbnb.com',
  'Booking.com': 'https://www.booking.com',
  'Agoda': 'https://www.agoda.com',
};

const PLATFORM_ICONS: Record<string, string> = {
  Airbnb: '🏠',
  'Booking.com': '🏨',
  Agoda: '🌐',
  Other: '📋',
};

const AMENITIES = [
  { name: 'WiFi', emoji: '📶' },
  { name: 'Pool', emoji: '🏊' },
  { name: 'Breakfast', emoji: '🍳' },
  { name: 'AC', emoji: '❄️' },
];

function F({ label, placeholder, value, onChangeText, optional }: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; optional?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={fStyles.label}>
        {label}{optional ? <Text style={fStyles.optional}> (optional)</Text> : null}
      </Text>
      <TextInput
        style={fStyles.input}
        placeholder={placeholder}
        placeholderTextColor="#C0C0C0"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const fStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 5, letterSpacing: 0.3 },
  optional: { fontWeight: '400', color: '#BBB' },
  input: {
    backgroundColor: '#FAFAFA', borderRadius: 12, borderWidth: 0.5, borderColor: '#E0E0E0',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A1A1A',
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});

export default function AccommodationScreen() {
  const navigation = useNavigation();
  const { accommodations, addAccommodation } = useAppStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Airbnb');
  const [address, setAddress] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const canSave = name.trim() && address.trim() && checkInDate.trim() && checkOutDate.trim();

  const handleSave = () => {
    addAccommodation({
      name, platform, address,
      checkInDate, checkInTime,
      checkOutDate, checkOutTime,
      bookingRef, price, notes,
      status: 'UPCOMING',
    });
    // Reset
    setName(''); setPlatform('Airbnb'); setAddress('');
    setCheckInDate(''); setCheckInTime('');
    setCheckOutDate(''); setCheckOutTime('');
    setBookingRef(''); setPrice(''); setNotes('');
    setAddModalVisible(false);
  };

  const MENU_ITEMS = [
    { label: 'Add accommodation', icon: '🏡', onPress: () => setAddModalVisible(true) },
    { label: 'Sort by check-in date', icon: '📅', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Accommodation</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={{ fontSize: 22 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {accommodations.map((acc) => (
          <AccommodationCard key={acc.id} acc={acc} />
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addBtnIcon}>＋</Text>
          <Text style={styles.addBtnText}>Add accommodation</Text>
        </TouchableOpacity>

        <View style={styles.footerDecor}>
          <Dot color="#DDD" size={5} style={{ position: 'relative' }} />
          <Dot color="#DDD" size={4} style={{ position: 'relative', marginLeft: 8 }} />
          <Sparkle color="#FF9800" size={10} style={{ position: 'relative', marginLeft: 6 }} />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} items={MENU_ITEMS} />

      <BottomSheet visible={addModalVisible} onClose={() => setAddModalVisible(false)} title="Add Accommodation">
        <F label="Property name" placeholder="e.g. Villa Padi Ubud" value={name} onChangeText={setName} />

        <Text style={fStyles.label}>Platform</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: platform === p ? '#4CAF50' : '#EBEBEB', backgroundColor: platform === p ? '#E8F5E9' : '#F5F5F5' }}
              onPress={() => setPlatform(p)}
            >
              <Text style={{ fontSize: 14 }}>{PLATFORM_ICONS[p]}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: platform === p ? '#4CAF50' : '#666' }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <F label="Address" placeholder="Full address" value={address} onChangeText={setAddress} />

        <View style={fStyles.row}>
          <View style={fStyles.half}><F label="Check-in date" placeholder="May 16" value={checkInDate} onChangeText={setCheckInDate} /></View>
          <View style={fStyles.half}><F label="Check-in time" placeholder="19:00" value={checkInTime} onChangeText={setCheckInTime} /></View>
        </View>
        <View style={fStyles.row}>
          <View style={fStyles.half}><F label="Check-out date" placeholder="May 20" value={checkOutDate} onChangeText={setCheckOutDate} /></View>
          <View style={fStyles.half}><F label="Check-out time" placeholder="11:00" value={checkOutTime} onChangeText={setCheckOutTime} /></View>
        </View>

        <F label="Booking reference" placeholder="e.g. #VPU123456" value={bookingRef} onChangeText={setBookingRef} optional />
        <F label="Price" placeholder="e.g. €120/night" value={price} onChangeText={setPrice} optional />
        <F label="Notes" placeholder="e.g. Garden view room" value={notes} onChangeText={setNotes} optional />

        <SheetButton label="Save Accommodation" onPress={handleSave} disabled={!canSave} />
      </BottomSheet>
    </SafeAreaView>
  );
}

function AccommodationCard({ acc }: { acc: AccommodationEntry }) {
  const platformIcon = PLATFORM_ICONS[acc.platform] ?? '📋';
  const platformUrl = PLATFORM_URLS[acc.platform];

  const openPlatform = () => {
    if (platformUrl) Linking.openURL(platformUrl);
  };

  const openMaps = () => {
    const query = encodeURIComponent(acc.address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  return (
    <View style={styles.accCard}>
      {/* Hero */}
      <View style={styles.heroContainer}>
        <View style={styles.heroScene}>
          <View style={styles.sky} />
          <View style={styles.ground} />
          <View style={[styles.hill, { left: -10, backgroundColor: '#81C784' }]} />
          <View style={[styles.hill, { right: -10, backgroundColor: '#66BB6A', width: 120 }]} />
          <Text style={styles.heroEmoji}>🏡</Text>
          <Text style={[styles.sd, { left: 14, bottom: 16 }]}>🌴</Text>
          <Text style={[styles.sd, { right: 14, bottom: 16 }]}>🌴</Text>
          <Text style={[styles.sd, { left: 50, top: 14 }]}>☁️</Text>
          <Sparkle color="#FFD700" size={12} style={{ position: 'absolute', right: 30, top: 18 }} />
        </View>
      </View>

      {/* Name + status */}
      <View style={styles.nameRow}>
        <Text style={styles.propertyName}>{acc.name}</Text>
        <StatusBadge status={acc.status} />
      </View>

      {/* Check-in/out */}
      <View style={styles.checkCard}>
        <View style={styles.checkRow}>
          <View style={styles.checkItem}>
            <Text style={styles.checkLabel}>Check-in</Text>
            <Text style={styles.checkTime}>{acc.checkInTime}</Text>
            <Text style={styles.checkDay}>{acc.checkInDate}</Text>
          </View>
          <View style={styles.checkDivider} />
          <View style={styles.checkItem}>
            <Text style={styles.checkLabel}>Check-out</Text>
            <Text style={styles.checkTime}>{acc.checkOutTime}</Text>
            <Text style={styles.checkDay}>{acc.checkOutDate}</Text>
          </View>
        </View>
      </View>

      {/* Connecting flight hint */}
      <View style={styles.connectionHint}>
        <Dot color="#4CAF50" size={7} style={{ position: 'relative' }} />
        <Text style={styles.connectionText}>Arriving via: {CONNECTING_FLIGHT}</Text>
      </View>

      {/* Address */}
      <View style={styles.addressRow}>
        <View style={styles.addressIconBg}>
          <Text style={{ fontSize: 18 }}>📍</Text>
        </View>
        <Text style={styles.addressText} numberOfLines={2}>{acc.address}</Text>
      </View>
      <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
        <Text style={styles.mapsButtonText}>Open in Maps</Text>
      </TouchableOpacity>

      {/* Amenities */}
      <View style={styles.amenitiesRow}>
        {AMENITIES.map((a) => (
          <View key={a.name} style={styles.amenityChip}>
            <Text style={{ fontSize: 16 }}>{a.emoji}</Text>
            <Text style={styles.amenityName}>{a.name}</Text>
          </View>
        ))}
      </View>

      {/* Booking ref + platform button */}
      <View style={styles.bookingRow}>
        <View>
          <Text style={styles.bookingLabel}>Booking confirmation</Text>
          <Text style={styles.bookingRef}>{acc.bookingRef || '—'}</Text>
        </View>
        <View style={styles.bookingActions}>
          {platformUrl ? (
            <TouchableOpacity style={styles.platformBtn} onPress={openPlatform}>
              <Text style={{ fontSize: 14 }}>{platformIcon}</Text>
              <Text style={styles.platformBtnText}>Open in {acc.platform}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={{ fontSize: 18 }}>⬇</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: '#1A1A1A', fontWeight: '300' },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  accCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 8,
  },
  heroContainer: { height: 180, overflow: 'hidden' },
  heroScene: { flex: 1, position: 'relative', overflow: 'hidden' },
  sky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#81D4FA' },
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: '#A5D6A7' },
  hill: { position: 'absolute', bottom: 0, width: 140, height: 70, borderRadius: 50 },
  heroEmoji: { position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontSize: 64 },
  sd: { position: 'absolute', fontSize: 24 },

  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  propertyName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 10 },

  checkCard: { marginHorizontal: 16, marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14 },
  checkItem: { flex: 1, alignItems: 'center' },
  checkLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  checkTime: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  checkDay: { fontSize: 12, color: '#666', marginTop: 2 },
  checkDivider: { width: 1, height: 50, backgroundColor: '#E0E0E0', marginHorizontal: 16 },

  connectionHint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12,
  },
  connectionText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },

  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 10 },
  addressIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  addressText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 19 },
  mapsButton: { backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginHorizontal: 16, marginBottom: 12 },
  mapsButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  amenitiesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginHorizontal: 16, marginBottom: 14 },
  amenityChip: { flex: 1, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingVertical: 8, gap: 3 },
  amenityName: { fontSize: 10, fontWeight: '600', color: '#666' },

  bookingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 16 },
  bookingLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  bookingRef: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  bookingActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  platformBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  platformBtnText: { fontSize: 12, fontWeight: '700', color: '#4CAF50' },
  downloadBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5,
    borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  addBtnIcon: { fontSize: 18, color: '#4CAF50' },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },

  footerDecor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
