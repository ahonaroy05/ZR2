import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
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
  Settings
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

export default function SoundScreen() {
  const { theme } = useTheme();
  const [masterVolume, setMasterVolume] = useState(70);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
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
      isPlaying: true,
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

  const toggleSound = (id: string) => {
    setSounds(sounds.map(sound => 
      sound.id === id 
        ? { ...sound, isPlaying: !sound.isPlaying }
        : sound
    ));
  };

  const updateSoundVolume = (id: string, volume: number) => {
    setSounds(sounds.map(sound => 
      sound.id === id 
        ? { ...sound, volume }
        : sound
    ));
  };

  const activeSounds = sounds.filter(sound => sound.isPlaying);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Soundscape Mixer</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Create your perfect audio environment</Text>
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
              onValueChange={setMasterVolume}
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Current Mix</Text>
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
              <Text style={[styles.emptyMixText, { color: theme.colors.textSecondary }]}>No sounds playing</Text>
              <Text style={[styles.emptyMixSubtext, { color: theme.colors.textTertiary }]}>Tap a sound below to start</Text>
            </View>
          )}
        </View>

        <View style={styles.soundsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Sounds</Text>
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
                  <Text style={[styles.soundDescription, { color: theme.colors.textSecondary }]}>{sound.description}</Text>
                </View>

                {sound.isPlaying && (
                  <View style={styles.soundVolumeControl}>
                    <Text style={[styles.volumeLabel, { color: theme.colors.textSecondary }]}>Volume</Text>
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

        <View style={styles.presetsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Presets</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity style={[styles.presetButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
              <Text style={[styles.presetButtonText, { color: theme.colors.textSecondary }]}>Focus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.presetButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
              <Text style={[styles.presetButtonText, { color: theme.colors.textSecondary }]}>Relax</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.presetButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, shadowColor: theme.colors.shadow }]}>
              <Text style={[styles.presetButtonText, { color: theme.colors.textSecondary }]}>Sleep</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    color: '#FFFFFF', // Keep white for active state
  },
  currentMix: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 20,
    color: '#333',
    marginBottom: 16,
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
  presetsSection: {
    paddingBottom: 32,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  presetButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
  },
});