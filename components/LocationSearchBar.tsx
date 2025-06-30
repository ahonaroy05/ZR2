import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, MapPin, Clock, Star, X } from 'lucide-react-native';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  type?: 'place' | 'recent' | 'saved';
}

interface LocationSearchBarProps {
  onLocationSelect: (location: SearchResult) => void;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function LocationSearchBar({
  onLocationSelect,
  placeholder = "Search for a location...",
  value = "",
  onChangeText,
}: LocationSearchBarProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  
  // Animation values
  const containerScale = useSharedValue(1);
  const resultsOpacity = useSharedValue(0);

  // Mock data for demonstration
  const mockPlaces: SearchResult[] = [
    {
      id: '1',
      name: 'Union Square',
      address: 'Union Square, San Francisco, CA 94108',
      location: { lat: 37.7879, lng: -122.4075 },
      type: 'place',
    },
    {
      id: '2',
      name: 'Golden Gate Park',
      address: 'Golden Gate Park, San Francisco, CA 94117',
      location: { lat: 37.7694, lng: -122.4862 },
      type: 'place',
    },
    {
      id: '3',
      name: 'Fisherman\'s Wharf',
      address: 'Fisherman\'s Wharf, San Francisco, CA 94133',
      location: { lat: 37.8080, lng: -122.4177 },
      type: 'place',
    },
    {
      id: '4',
      name: 'Lombard Street',
      address: 'Lombard St, San Francisco, CA 94133',
      location: { lat: 37.8021, lng: -122.4187 },
      type: 'place',
    },
    {
      id: '5',
      name: 'Alcatraz Island',
      address: 'Alcatraz Island, San Francisco, CA 94133',
      location: { lat: 37.8267, lng: -122.4233 },
      type: 'place',
    },
  ];

  const mockRecentSearches: SearchResult[] = [
    {
      id: 'recent1',
      name: 'Starbucks Coffee',
      address: '123 Market St, San Francisco, CA',
      location: { lat: 37.7749, lng: -122.4194 },
      type: 'recent',
    },
    {
      id: 'recent2',
      name: 'Whole Foods Market',
      address: '456 Mission St, San Francisco, CA',
      location: { lat: 37.7849, lng: -122.4094 },
      type: 'recent',
    },
  ];

  // Search function
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      resultsOpacity.value = withSpring(0);
      return;
    }

    // Filter mock places based on query
    const filteredPlaces = mockPlaces.filter(
      place =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.address.toLowerCase().includes(query.toLowerCase())
    );

    // Combine with recent searches if query is short
    let results = filteredPlaces;
    if (query.length <= 2) {
      results = [...mockRecentSearches, ...filteredPlaces];
    }

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowResults(true);
    resultsOpacity.value = withSpring(1);
  };

  // Handle text change
  const handleTextChange = (text: string) => {
    setSearchQuery(text);
    onChangeText?.(text);
    searchLocations(text);
  };

  // Handle location selection
  const handleLocationSelect = (location: SearchResult) => {
    setSearchQuery(location.name);
    setShowResults(false);
    resultsOpacity.value = withSpring(0);
    
    // Add to recent searches
    const newRecentSearches = [
      location,
      ...recentSearches.filter(item => item.id !== location.id)
    ].slice(0, 5);
    setRecentSearches(newRecentSearches);
    
    onLocationSelect(location);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    onChangeText?.('');
    setShowResults(false);
    resultsOpacity.value = withSpring(0);
  };

  // Animation handlers
  const handleFocus = () => {
    containerScale.value = withSpring(1.02);
    if (searchQuery.length === 0) {
      setSearchResults(mockRecentSearches);
      setShowResults(true);
      resultsOpacity.value = withSpring(1);
    }
  };

  const handleBlur = () => {
    containerScale.value = withSpring(1);
    // Delay hiding results to allow for selection
    setTimeout(() => {
      setShowResults(false);
      resultsOpacity.value = withSpring(0);
    }, 150);
  };

  // Get icon for result type
  const getResultIcon = (type?: string) => {
    switch (type) {
      case 'recent':
        return <Clock size={16} color={colors.textSecondary} />;
      case 'saved':
        return <Star size={16} color={colors.warning} />;
      default:
        return <MapPin size={16} color={colors.primary} />;
    }
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const resultsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: resultsOpacity.value,
    transform: [
      {
        translateY: resultsOpacity.value === 0 ? -10 : 0,
      },
    ],
  }));

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, containerAnimatedStyle]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {showResults && searchResults.length > 0 && (
          <Animated.View style={[
            styles.resultsContainer,
            { backgroundColor: colors.surface, shadowColor: colors.shadow },
            resultsAnimatedStyle
          ]}>
            <ScrollView
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {searchQuery.length === 0 && recentSearches.length > 0 && (
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
                  Recent Searches
                </Text>
              )}
              
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={result.id}
                  style={[
                    styles.resultItem,
                    index === searchResults.length - 1 && styles.lastResultItem
                  ]}
                  onPress={() => handleLocationSelect(result)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultIcon}>
                    {getResultIcon(result.type)}
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={[styles.resultName, { color: colors.text }]}>
                      {result.name}
                    </Text>
                    <Text style={[styles.resultAddress, { color: colors.textSecondary }]}>
                      {result.address}
                    </Text>
                  </View>
                  {result.type === 'recent' && (
                    <TouchableOpacity style={styles.removeButton}>
                      <X size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Quicksand-Medium',
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 300,
    zIndex: 1001,
  },
  resultsList: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  lastResultItem: {
    borderBottomWidth: 0,
  },
  resultIcon: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    lineHeight: 18,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
});