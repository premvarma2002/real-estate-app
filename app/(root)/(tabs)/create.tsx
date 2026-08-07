import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSupabase } from '@/hooks/useSupabase';
import { useUserStore } from '@/store/userStore';
import { useToast } from '@/lib/toast-context';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Studio'];

interface FormState {
  title: string;
  description: string;
  price: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  area_sqft: string;
  address: string;
  city: string;
  images: string; // comma-separated URLs
  is_featured: boolean;
  is_active: boolean;
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  price: '',
  type: 'Apartment',
  bedrooms: '',
  bathrooms: '',
  area_sqft: '',
  address: '',
  city: '',
  images: '',
  is_featured: false,
  is_active: true,
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#bbb"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

export default function CreateScreen() {
  const supabase = useSupabase();
  const router = useRouter();
  const isAdmin = useUserStore((s) => s.isAdmin);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof FormState) => (val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.price || isNaN(Number(form.price))) return 'Enter a valid price';
    if (!form.bedrooms || isNaN(Number(form.bedrooms))) return 'Enter valid bedrooms count';
    if (!form.bathrooms || isNaN(Number(form.bathrooms))) return 'Enter valid bathrooms count';
    if (!form.area_sqft || isNaN(Number(form.area_sqft))) return 'Enter valid area';
    if (!form.city.trim()) return 'City is required';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      showToast('error', 'Validation Error', err);
      return;
    }
    setSubmitting(true);
    try {
      const imageArr = form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.from('properties').insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        type: form.type,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area_sqft: Number(form.area_sqft),
        address: form.address.trim() || null,
        city: form.city.trim(),
        images: imageArr.length > 0 ? imageArr : null,
        is_featured: form.is_featured,
        is_active: form.is_active,
        is_sold: false,
        latitude: 0,
        longitude: 0,
      });

      if (error) throw error;

      showToast('success', 'Property Listed! 🎉', `"${form.title}" has been added successfully.`);
      setForm(INITIAL_FORM);
      router.replace('/(root)/(tabs)');
    } catch (e: any) {
      console.error('Create property error:', e);
      showToast('error', 'Failed to Add', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed-outline" size={64} color="#ddd" />
          <Text style={styles.deniedTitle}>Admin Access Only</Text>
          <Text style={styles.deniedSub}>You don't have permission to add properties.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Property</Text>
            <Text style={styles.headerSub}>Fill in the details below</Text>
          </View>

          {/* Section: Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🏠 Basic Info</Text>
            <Field label="Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Modern 3BHK Flat" />
            <Field
              label="Description"
              value={form.description}
              onChangeText={set('description')}
              placeholder="Describe the property..."
              multiline
            />
          </View>

          {/* Section: Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🏷️ Property Type</Text>
            <View style={styles.typeRow}>
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => set('type')(t)}
                  style={[styles.typeChip, form.type === t && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, form.type === t && styles.typeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section: Pricing & Specs */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>💰 Pricing & Specs</Text>
            <Field label="Price (₹)" value={form.price} onChangeText={set('price')} placeholder="e.g. 5000000" keyboardType="numeric" />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="Bedrooms" value={form.bedrooms} onChangeText={set('bedrooms')} placeholder="3" keyboardType="numeric" />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="Bathrooms" value={form.bathrooms} onChangeText={set('bathrooms')} placeholder="2" keyboardType="numeric" />
              </View>
            </View>
            <Field label="Area (sqft)" value={form.area_sqft} onChangeText={set('area_sqft')} placeholder="e.g. 1200" keyboardType="numeric" />
          </View>

          {/* Section: Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📍 Location</Text>
            <Field label="City" value={form.city} onChangeText={set('city')} placeholder="e.g. Mumbai" />
            <Field label="Address" value={form.address} onChangeText={set('address')} placeholder="e.g. 12B, Park Street" />
          </View>

          {/* Section: Media */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🖼️ Images</Text>
            <Field
              label="Image URLs"
              value={form.images}
              onChangeText={set('images')}
              placeholder="https://..., https://... (comma-separated)"
              multiline
            />
          </View>

          {/* Section: Toggles */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>⚙️ Settings</Text>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Featured Property</Text>
                <Text style={styles.toggleSub}>Show in the featured carousel</Text>
              </View>
              <Switch
                value={form.is_featured}
                onValueChange={set('is_featured')}
                trackColor={{ false: '#E5E4F0', true: '#C4B5FD' }}
                thumbColor={form.is_featured ? '#7C3AED' : '#f0f0f0'}
              />
            </View>
            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.toggleLabel}>Active Listing</Text>
                <Text style={styles.toggleSub}>Visible to users on the app</Text>
              </View>
              <Switch
                value={form.is_active}
                onValueChange={set('is_active')}
                trackColor={{ false: '#E5E4F0', true: '#C4B5FD' }}
                thumbColor={form.is_active ? '#7C3AED' : '#f0f0f0'}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitText}>List Property</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4FF',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  headerSub: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F5F4FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#E5E4F0',
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F4FF',
    borderWidth: 1.5,
    borderColor: '#E5E4F0',
  },
  typeChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F8',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  toggleSub: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  deniedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  deniedSub: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
