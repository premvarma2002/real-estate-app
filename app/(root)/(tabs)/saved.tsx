import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSupabase } from '@/hooks/useSupabase';
import { useSavedStore } from '@/store/savedStore';
import { Property } from '@/types';
import PropertyCard from '@/components/PropertyCard';

export default function SavedScreen() {
  const supabase = useSupabase();
  const router = useRouter();
  const savedIds = useSavedStore((s) => s.savedIds);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSaved = async () => {
    if (savedIds.length === 0) {
      setProperties([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', savedIds);
      if (!error) setProperties(data ?? []);
    } catch (e) {
      console.error('Saved fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchSaved(); }, [savedIds]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Saved Properties</Text>
          <Text style={styles.headerSub}>
            {savedIds.length === 0
              ? 'Nothing saved yet'
              : `${savedIds.length} saved`}
          </Text>
        </View>
        <View style={styles.heartIconContainer}>
          <Ionicons name="heart" size={22} color="#FF4D6D" />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
      ) : savedIds.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="heart-outline" size={52} color="#7C3AED" />
          </View>
          <Text style={styles.emptyTitle}>No saved properties</Text>
          <Text style={styles.emptySub}>
            Tap the heart icon on any property to save it here for later.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(root)/(tabs)/search' as any)}
          >
            <Ionicons name="search-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.browseBtnText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PropertyCard item={item} variant="regular" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>Could not load properties</Text>
              <Text style={styles.emptySub}>Check your connection and try again.</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  headerSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  heartIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 12,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  emptySub: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  browseBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
