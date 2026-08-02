import React, { useCallback, useState } from 'react'
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Property } from '@/types'
import { useSupabase } from '@/hooks/useSupabase'
import { useUserStore } from '@/store/userStore'
import { useUser } from '@clerk/clerk-expo'
import { useEffect } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PropertyCard from '@/components/PropertyCard'

export default function Homescreen() {
  const { user } = useUser();
  const isAdmin = useUserStore(state => state.isAdmin);
  const supabase = useSupabase();
  const router = useRouter();
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = user?.firstName ?? 'there';

  const fetchProperties = async () => {
    try {
      setLoading(true);

      const { data: featuredData, error: featuredError } = await supabase
        .from('properties')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (featuredError) throw featuredError;

      const { data: recommendedData, error: recommendedError } = await supabase
        .from('properties')
        .select('*')
        .eq('is_featured', false)
        .order('created_at', { ascending: false });

      if (recommendedError) throw recommendedError;

      setFeatured(featuredData ?? []);
      setRecommended(recommendedData ?? []);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const filteredRecommended = recommended.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.city ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ListHeader = (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
          <Text style={styles.subtitle}>Find your dream home</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#1a1a2e" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by name or city..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Featured section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>✨ Featured</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginVertical: 30 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        >
          {featured.map(item => (
            <PropertyCard key={item.id.toString()} item={item} variant="featured" />
          ))}
        </ScrollView>
      )}

      {/* Recommended header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏘️ Recommended</Text>
        <Text style={styles.count}>{filteredRecommended.length} properties</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredRecommended}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => <PropertyCard item={item} variant="regular" />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No properties found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4FF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  seeAll: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    color: '#888',
    fontSize: 13,
  },
  featuredList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
  },
});
