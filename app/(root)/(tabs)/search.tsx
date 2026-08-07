import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSupabase } from '@/hooks/useSupabase';
import { Property } from '@/types';
import PropertyCard from '@/components/PropertyCard';

const PROPERTY_TYPES = ['All', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Studio'];

const PRICE_RANGES = [
  { label: 'Any', min: 0, max: Infinity },
  { label: '< 50L', min: 0, max: 5000000 },
  { label: '50L–1Cr', min: 5000000, max: 10000000 },
  { label: '1Cr+', min: 10000000, max: Infinity },
];

export default function SearchScreen() {
  const supabase = useSupabase();
  const [query, setQuery] = useState('');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState(0); // index into PRICE_RANGES

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setAllProperties(data ?? []);
    } catch (e) {
      console.error('Search fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  const filtered = useMemo(() => {
    const priceRange = PRICE_RANGES[selectedPrice];
    return allProperties.filter((p) => {
      const matchesQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.city ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (p.address ?? '').toLowerCase().includes(query.toLowerCase());
      const matchesType = selectedType === 'All' || p.type.toLowerCase() === selectedType.toLowerCase();
      const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
      return matchesQuery && matchesType && matchesPrice;
    });
  }, [allProperties, query, selectedType, selectedPrice]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Properties</Text>
        <Text style={styles.headerSub}>{filtered.length} results</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by name, city or address..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          data={PROPERTY_TYPES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(t) => t}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => {
            const active = item === selectedType;
            return (
              <TouchableOpacity
                onPress={() => setSelectedType(item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Price Range */}
      <View style={styles.priceRow}>
        {PRICE_RANGES.map((r, i) => (
          <TouchableOpacity
            key={r.label}
            onPress={() => setSelectedPrice(i)}
            style={[styles.priceChip, selectedPrice === i && styles.priceChipActive]}
          >
            <Text style={[styles.priceText, selectedPrice === i && styles.priceTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PropertyCard item={item} variant="regular" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={56} color="#ddd" />
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or search term</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4FF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  headerSub: {
    fontSize: 13,
    color: '#888',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a2e',
  },
  filterSection: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  chipsRow: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E4F0',
  },
  chipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  chipTextActive: {
    color: '#fff',
  },
  priceRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  priceChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E4F0',
  },
  priceChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  priceTextActive: {
    color: '#7C3AED',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#aaa',
  },
  emptySub: {
    fontSize: 13,
    color: '#ccc',
    textAlign: 'center',
  },
});
