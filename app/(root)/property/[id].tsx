import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '@/hooks/useSupabase';
import { useSavedStore } from '@/store/savedStore';
import { Property } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon as any} size={20} color="#7C3AED" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const supabase = useSupabase();
  const toggleSave = useSavedStore((s) => s.toggleSave);
  const isSaved = useSavedStore((s) => s.isSaved(Number(id)));

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) setProperty(data as Property);
    } catch (e) {
      console.error('Property detail fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchProperty(); }, [id]));

  const openMaps = () => {
    if (!property) return;
    const addr = encodeURIComponent(
      `${property.address ?? ''} ${property.city ?? ''}`.trim()
    );
    const url = Platform.select({
      ios: `maps:0,0?q=${addr}`,
      android: `geo:0,0?q=${addr}`,
    });
    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={56} color="#ddd" />
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnAlt}>
          <Text style={styles.backBtnAltText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ['https://via.placeholder.com/800x500'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImage(page);
            }}
            scrollEventThrottle={16}
          >
            {images.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Gradient-style overlay top bar */}
          <SafeAreaView style={styles.galleryOverlay} edges={['top']}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleSave(property.id)}
              style={styles.saveButtonOverlay}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={20}
                color={isSaved ? '#FF4D6D' : '#1a1a2e'}
              />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Image pagination dots */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImage && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Badges row */}
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{property.type}</Text>
            </View>
            {property.is_featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={11} color="#fff" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
            {property.is_sold && (
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>Sold</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <Text style={styles.price}>{formatPrice(property.price)}</Text>

          {/* Title */}
          <Text style={styles.title}>{property.title}</Text>

          {/* Location */}
          <TouchableOpacity style={styles.locationRow} onPress={openMaps} activeOpacity={0.7}>
            <Ionicons name="location" size={16} color="#7C3AED" />
            <Text style={styles.locationText}>
              {property.address ? `${property.address}, ` : ''}
              {property.city}
            </Text>
            <Ionicons name="open-outline" size={13} color="#aaa" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatPill icon="bed-outline" label="Beds" value={property.bedrooms} />
            <StatPill icon="water-outline" label="Baths" value={property.bathrooms} />
            <StatPill icon="expand-outline" label="sqft" value={property.area_sqft.toLocaleString()} />
          </View>

          {/* Description */}
          {property.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this property</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          ) : null}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features & Amenities</Text>
              <View style={styles.featuresGrid}>
                {property.features.map((f, i) => (
                  <View key={i} style={styles.featureChip}>
                    <Ionicons name="checkmark-circle" size={14} color="#7C3AED" />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Posted date */}
          {property.created_at && (
            <Text style={styles.postedDate}>
              Listed on{' '}
              {new Date(property.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <Text style={styles.bottomPrice}>{formatPrice(property.price)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.enquireBtn, property.is_sold && styles.enquireBtnDisabled]}
          disabled={property.is_sold}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.enquireBtnText}>
            {property.is_sold ? 'Sold Out' : 'Enquire Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4FF',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F5F4FF',
  },
  errorText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#aaa',
  },
  backBtnAlt: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
  },
  backBtnAltText: {
    color: '#fff',
    fontWeight: '700',
  },
  // Gallery
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: 320,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 320,
  },
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonOverlay: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#7C3AED',
  },
  // Content
  content: {
    backgroundColor: '#F5F4FF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  soldBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  soldBadgeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    fontSize: 30,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    marginTop: 4,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  featureText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  postedDate: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 8,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomPriceWrap: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  enquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  enquireBtnDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  enquireBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
