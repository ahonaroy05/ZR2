import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Waves, 
  TreePine, 
  Cloud, 
  Coffee,
  Headphones,
  Settings,
  Zap,
  Moon,
  Target
} from 'lucide-react-native';

interface SoundOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isPlaying: boolean;
  volume: number;
}

interface SoundPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sounds: Array<{
    soundId: string;
    volume: number;
  }>;
  masterVolume: number;
}

export default function SoundScreen() {
  const { theme } = useTheme();
  const [masterVolume, setMasterVolume] = useState(70);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [sounds, setSounds] = useState<SoundOption[]>([
    {
      id: 'rain',
      name: 'Rain Forest',
      icon: <Cloud size={24} color="#FAFAFA" />,
      color: theme.colors.success,
      description: 'Gentle rainfall with forest ambiance',
      isPlaying: false,
      volume: 60,
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      icon: <Waves size={24} color="#FAFAFA" />,
      color: theme.colors.primaryLight,
      description: 'Calming ocean waves and seagulls',
      isPlaying: false,
      volume: 75,
    },
    {
      id: 'forest',
      name: 'Deep Forest',
      icon: <TreePine size={24} color="#FAFAFA" />,
      color: theme.colors.primaryDark,
      description: 'Birds chirping in ancient woods',
      isPlaying: false,
      volume: 50,
    },
    {
      id: 'cafe',
      name: 'Cozy Café',
      icon: <Coffee size={24} color="#FAFAFA" />,
      color: theme.colors.accent,
      description: 'Gentle chatter and coffee sounds',
      isPlaying: false,
      volume: 40,
    },
  ]);

  // Define sound presets
  const soundPresets: SoundPreset[] = [
    {
      id: 'focus',
      name: 'Focus',
      description: 'Enhance concentration and productivity',
      icon: <Target size={20} color="#FAFAFA" />,
      color: theme.colors.primary,
      sounds: [
        { soundId: 'cafe', volume: 65 },
        { soundId: 'rain', volume: 35 },
      ],
      masterVolume: 75,
    },
    {
      id: 'relax',
      name: 'Relax',
      description: 'Unwind and reduce stress',
      icon: <Waves size={20} color="#FAFAFA" />,
      color: theme.colors.success,
      sounds: [
        { soundId: 'ocean', volume: 80 },
        { soundId: 'forest', volume: 45 },
      ],
      masterVolume: 65,
    },
    {
      id: 'sleep',
      name: 'Sleep',
      description: 'Drift into peaceful slumber',
      icon: <Moon size={20} color="#FAFAFA" />,
      color: theme.colors.accent,
      sounds: [
        { soundId: 'rain', volume: 70 },
        { soundId: 'forest', volume: 30 },
      ],
      masterVolume: 50,
    },
  ];

  const toggleSound = (id: string) => {
    setSounds(sounds.map(sound => 
      sound.id === id 
        ? { ...sound, isPlaying: !sound.isPlaying }
        : sound
    ));
    
    // Clear active preset when manually toggling sounds
    if (activePreset) {
      setActivePreset(null);
    }
  };

  const updateSoundVolume = (id: string, volume: number) => {
    setSounds(sounds.map(sound => 
      sound.id === id 
        ? { ...sound, volume }
        : sound
    ));
    
    // Clear active preset when manually adjusting volumes
    if (activePreset) {
      setActivePreset(null);
    }
  };

  const applyPreset = (preset: SoundPreset) => {
    // Stop all sounds first
    const updatedSounds = sounds.map(sound => ({
      ...sound,
      isPlaying: false,
      volume: sound.volume, // Keep current volume initially
    }));

    // Apply preset settings
    preset.sounds.forEach(presetSound => {
      const soundIndex = updatedSounds.findIndex(s => s.id === presetSound.soundId);
      if (soundIndex !== -1) {
        updatedSounds[soundIndex] = {
          ...updatedSounds[soundIndex],
          isPlaying: true,
          volume: presetSound.volume,
        };
      }
    });

    setSounds(updatedSounds);
    setMasterVolume(preset.masterVolume);
    setActivePreset(preset.id);

    // Show feedback to user
    Alert.alert(
      `🎵 ${preset.name} Preset Applied`,
      `${preset.description}\n\nSounds activated: ${preset.sounds.map(s => {
        const sound = sounds.find(sound => sound.id === s.soundId);
        return sound?.name;
      }).join(', ')}`,
      [{ text: 'Perfect!', style: 'default' }]
    );
  };

  const clearAllSounds = () => {
    setSounds(sounds.map(sound => ({
      ...sound,
      isPlaying: false,
    })));
    setActivePreset(null);
    
    Alert.alert(
      '🔇 All Sounds Stopped',
      'Your soundscape has been cleared. Select a preset or individual sounds to continue.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const activeSounds = sounds.filter(sound => sound.isPlaying);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Soundscape Mixer</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>Create your perfect audio environment</Text>
        </View>

        <View style={styles.controlsSection}>
          <View style={[styles.masterControls, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.volumeControl}>
              <Volume2 size={20} color={theme.colors.primary} />
              <Text style={[styles.controlLabel, { color: theme.colors.text }]}>Master Volume</Text>
              <Text style={[styles.volumeValue, { color: theme.colors.primary }]}>{masterVolume}%</Text>
            </View>
            <Slider
              style={styles.slider}
              value={masterVolume}
              onValueChange={(value) => {
                setMasterVolume(value);
                // Clear active preset when manually adjusting master volume
                if (activePreset) {
                  setActivePreset(null);
                }
              }}
              minimumValue={0}
              maximumValue={100}
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.noiseCancelButton,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, shadowColor: theme.colors.shadow },
              noiseCancellation && styles.noiseCancelButtonActive
            ]}
            onPress={() => setNoiseCancellation(!noiseCancellation)}
          >
            <View style={styles.noiseCancelContent}>
              {noiseCancellation ? (
                <VolumeX size={20} color={theme.colors.surface} />
              ) : (
                <Volume2 size={20} color={theme.colors.primary} />
              )}
              <Text style={[
                styles.noiseCancelText,
                { color: theme.colors.primary },
                noiseCancellation && styles.noiseCancelTextActive
              ]}>
                Noise Cancellation
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.currentMix}>
          <View style={styles.currentMixHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Current Mix</Text>
            {activeSounds.length > 0 && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: theme.colors.error }]}
                onPress={clearAllSounds}
              >
                <Text style={[styles.clearButtonText, { color: theme.colors.textInverse }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {activePreset && (
            <View style={[styles.activePresetIndicator, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.activePresetText, { color: theme.colors.primary }]}>
                🎵 {soundPresets.find(p => p.id === activePreset)?.name} preset active
              </Text>
            </View>
          )}
          
          {activeSounds.length > 0 ? (
            <View style={[styles.activeSounds, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              {activeSounds.map((sound) => (
                <View key={sound.id} style={styles.activeSoundCard}>
                  <View style={styles.activeSoundInfo}>
                    <View style={[styles.activeSoundIcon, { backgroundColor: sound.color }]}>
                      {sound.icon}
                    </View>
                    <Text style={[styles.activeSoundName, { color: theme.colors.text }]}>{sound.name}</Text>
                  </View>
                  <Text style={[styles.activeSoundVolume, { color: theme.colors.primary }]}>{sound.volume}%</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyMix, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <Headphones size={32} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyMixText, { color: theme.colors.text }]}>No sounds playing</Text>
              <Text style={[styles.emptyMixSubtext, { color: theme.colors.textSecondary }]}>Choose a preset or tap individual sounds below</Text>
            </View>
          )}
        </View>

        <View style={styles.presetsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Presets</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Curated soundscapes for different activities
          </Text>
          <View style={styles.presetButtons}>
            {soundPresets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetButton,
                  { shadowColor: theme.colors.shadow },
                  activePreset === preset.id && styles.activePresetButton
                ]}
                onPress={() => applyPreset(preset)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={activePreset === preset.id ? [preset.color, theme.colors.primary] : [theme.colors.card, theme.colors.surface]}
                  style={styles.presetGradient}
                >
                  <View style={styles.presetContent}>
                    <View style={[
                      styles.presetIconContainer,
                      { backgroundColor: activePreset === preset.id ? 'rgba(255,255,255,0.2)' : preset.color }
                    ]}>
                      {preset.icon}
                    </View>
                    <View style={styles.presetTextContainer}>
                      <Text style={[
                        styles.presetButtonText,
                        { color: activePreset === preset.id ? theme.colors.textInverse : theme.colors.text }
                      ]}>
                        {preset.name}
                      </Text>
                      <Text style={[
                        styles.presetDescription,
                        { color: activePreset === preset.id ? theme.colors.textInverse : theme.colors.textSecondary }
                      ]}>
                        {preset.description}
                      </Text>
                    </View>
                    
                    {/* Show sound count */}
                    <View style={[
                      styles.soundCount,
                      { backgroundColor: activePreset === preset.id ? 'rgba(255,255,255,0.2)' : theme.colors.primaryLight }
                    ]}>
                      <Text style={[
                        styles.soundCountText,
                        { color: activePreset === preset.id ? theme.colors.textInverse : theme.colors.primary }
                      ]}>
                        {preset.sounds.length}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.soundsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Individual Sounds</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Mix and match sounds to create your perfect environment
          </Text>
          <View style={styles.soundsGrid}>
            {sounds.map((sound) => (
              <View key={sound.id} style={[styles.soundCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
                <TouchableOpacity
                  style={styles.soundButton}
                  onPress={() => toggleSound(sound.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={sound.isPlaying ? [sound.color, '#98E4D6'] : ['#F5F5F5', '#EEEEEE']}
                    style={styles.soundGradient}
                  >
                    {sound.isPlaying ? (
                      <Pause size={24} color="#FAFAFA" />
                    ) : (
                      <Play size={24} color={sound.isPlaying ? "#FAFAFA" : "#999"} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                <View style={styles.soundInfo}>
                  <Text style={[styles.soundName, { color: theme.colors.text }]}>{sound.name}</Text>
                  <Text style={[styles.soundDescription, { color: theme.colors.text }]}>{sound.description}</Text>
                </View>

                {sound.isPlaying && (
                  <View style={styles.soundVolumeControl}>
                    <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>Volume</Text>
                    <Slider
                      style={styles.soundSlider}
                      value={sound.volume}
                      onValueChange={(value) => updateSoundVolume(sound.id, value)}
                      minimumValue={0}
                      maximumValue={100}
                      thumbStyle={styles.soundSliderThumb}
                      trackStyle={styles.soundSliderTrack}
                      minimumTrackTintColor={sound.color}
                      maximumTrackTintColor={theme.colors.border}
                    />
                    <Text style={[styles.soundVolumeValue, { color: theme.colors.primary }]}>{Math.round(sound.volume)}%</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  controlsSection: {
    marginBottom: 32,
  },
  masterControls: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  controlLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  volumeValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  slider: {
    height: 40,
  },
  sliderThumb: {
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  noiseCancelButton: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  noiseCancelButtonActive: {
    backgroundColor: '#B6D0E2',
    borderColor: '#B6D0E2',
  },
  noiseCancelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noiseCancelText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  noiseCancelTextActive: {
    color: '#FFFFFF',
  },
  currentMix: {
    marginBottom: 32,
  },
  currentMixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
  },
  activePresetIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  activePresetText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  activeSounds: {
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activeSoundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeSoundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSoundIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeSoundName: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
  activeSoundVolume: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
  },
  emptyMix: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyMixText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    marginTop: 8,
  },
  emptyMixSubtext: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  presetsSection: {
    marginBottom: 32,
  },
  presetButtons: {
    gap: 16,
  },
  presetButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  activePresetButton: {
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  presetGradient: {
    padding: 20,
  },
  presetContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  presetTextContainer: {
    flex: 1,
  },
  presetButtonText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  presetDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  soundCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  soundCountText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    fontWeight: '600',
  },
  soundsSection: {
    marginBottom: 32,
  },
  soundsGrid: {
    gap: 16,
  },
  soundCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  soundButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  soundGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundInfo: {
    marginBottom: 12,
  },
  soundName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  soundDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  soundVolumeControl: {
    marginTop: 8,
  },
  volumeLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  soundSlider: {
    height: 30,
    marginBottom: 4,
  },
  soundSliderThumb: {
    width: 16,
    height: 16,
  },
  soundSliderTrack: {
    height: 3,
    borderRadius: 1.5,
  },
  soundVolumeValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    textAlign: 'right',
  },
  bottomPadding: {
    height: 100,
  },
});