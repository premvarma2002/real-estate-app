import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Property } from '@/types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSavedStore } from '@/store/savedStore';

interface PropertyCardProps {
  item: Property;
  variant?: 'featured' | 'regular';
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertyCard({ item, variant = 'regular' }: PropertyCardProps) {
  const router = useRouter();
  const toggleSave = useSavedStore((s) => s.toggleSave);
  const isSaved = useSavedStore((s) => s.isSaved(item.id));

  const handleSavePress = (e: any) => {
    e.stopPropagation();
    toggleSave(item.id);
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/property/${item.id}` as any)}
      >
        <Image
          source={{ uri: item.images?.[0] ?? 'https://via.placeholder.com/400x250' }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredTopRow}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
            <TouchableOpacity onPress={handleSavePress} style={styles.saveBtn} hitSlop={8}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={18}
                color={isSaved ? '#FF4D6D' : '#fff'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.featuredMeta}>
              <Ionicons name="location-outline" size={12} color="#ccc" />
              <Text style={styles.featuredLocation} numberOfLines={1}>
                {item.city}
              </Text>
            </View>
            <View style={styles.featuredStats}>
              <View style={styles.statItem}>
                <Ionicons name="bed-outline" size={13} color="#fff" />
                <Text style={styles.statText}>{item.bedrooms}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="water-outline" size={13} color="#fff" />
                <Text style={styles.statText}>{item.bathrooms}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="expand-outline" size={13} color="#fff" />
                <Text style={styles.statText}>{item.area_sqft} sqft</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.regularCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/property/${item.id}` as any)}
    >
      <Image
        source={{ uri: item.images?.[0] ?? 'https://via.placeholder.com/400x250' }}
        style={styles.regularImage}
        resizeMode="cover"
      />
      <View style={styles.regularContent}>
        <View style={styles.regularTop}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type}</Text>
          </View>
          <View style={styles.regularPriceRow}>
            <Text style={styles.regularPrice}>{formatPrice(item.price)}</Text>
            <TouchableOpacity onPress={handleSavePress} hitSlop={8} style={{ marginLeft: 8 }}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={18}
                color={isSaved ? '#FF4D6D' : '#bbb'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.regularTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.regularLocation}>
          <Ionicons name="location-outline" size={13} color="#888" />
          <Text style={styles.regularLocationText} numberOfLines={1}>
            {item.address ? `${item.address}, ` : ''}{item.city}
          </Text>
        </View>
        <View style={styles.regularStats}>
          <View style={styles.statItem}>
            <Ionicons name="bed-outline" size={14} color="#666" />
            <Text style={styles.regularStatText}>{item.bedrooms} Bed</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={14} color="#666" />
            <Text style={styles.regularStatText}>{item.bathrooms} Bath</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="expand-outline" size={14} color="#666" />
            <Text style={styles.regularStatText}>{item.area_sqft} sqft</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured card
  featuredCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'space-between',
    padding: 12,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredInfo: {
    gap: 3,
  },
  featuredPrice: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredLocation: {
    color: '#ccc',
    fontSize: 12,
    marginLeft: 3,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  // Regular card
  regularCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  regularImage: {
    width: 110,
    height: 120,
  },
  regularContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  regularTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regularPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  regularPrice: {
    color: '#7C3AED',
    fontSize: 15,
    fontWeight: '800',
  },
  regularTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 2,
  },
  regularLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  regularLocationText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 3,
    flex: 1,
  },
  regularStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  regularStatText: {
    color: '#555',
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
});
