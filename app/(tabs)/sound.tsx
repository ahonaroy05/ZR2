import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [masterVolume, setMasterVolume] = useState(70);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [sounds, setSounds] = useState<SoundOption[]>([
    {
      id: 'rain',
      name: 'Rain Forest',
      icon: <Cloud size={24} color="#FAFAFA" />,
      color: '#A8E6CF',
      description: 'Gentle rainfall with forest ambiance',
      isPlaying: false,
      volume: 60,
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      icon: <Waves size={24} color="#FAFAFA" />,
      color: '#98E4D6',
      description: 'Calming ocean waves and seagulls',
      isPlaying: true,
      volume: 75,
    },
    {
      id: 'forest',
      name: 'Deep Forest',
      icon: <TreePine size={24} color="#FAFAFA" />,
      color: '#87CEEB',
      description: 'Birds chirping in ancient woods',
      isPlaying: false,
      volume: 50,
    },
    {
      id: 'cafe',
      name: 'Cozy Café',
      icon: <Coffee size={24} color="#FAFAFA" />,
      color: '#DDA0DD',
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Soundscape Mixer</Text>
          <Text style={styles.subtitle}>Create your perfect audio environment</Text>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.masterControls}>
            <View style={styles.volumeControl}>
              <Volume2 size={20} color="#A8E6CF" />
              <Text style={styles.controlLabel}>Master Volume</Text>
              <Text style={styles.volumeValue}>{masterVolume}%</Text>
            </View>
            <Slider
              style={styles.slider}
              value={masterVolume}
              onValueChange={setMasterVolume}
              minimumValue={0}
              maximumValue={100}
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
              minimumTrackTintColor="#A8E6CF"
              maximumTrackTintColor="#E0E0E0"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.noiseCancelButton,
              noiseCancellation && styles.noiseCancelButtonActive
            ]}
            onPress={() => setNoiseCancellation(!noiseCancellation)}
          >
            <View style={styles.noiseCancelContent}>
              {noiseCancellation ? (
                <VolumeX size={20} color="#FAFAFA" />
              ) : (
                <Volume2 size={20} color="#A8E6CF" />
              )}
              <Text style={[
                styles.noiseCancelText,
                noiseCancellation && styles.noiseCancelTextActive
              ]}>
                Noise Cancellation
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.currentMix}>
          <Text style={styles.sectionTitle}>Current Mix</Text>
          {activeSounds.length > 0 ? (
            <View style={styles.activeSounds}>
              {activeSounds.map((sound) => (
                <View key={sound.id} style={styles.activeSoundCard}>
                  <View style={styles.activeSoundInfo}>
                    <View style={[styles.activeSoundIcon, { backgroundColor: sound.color }]}>
                      {sound.icon}
                    </View>
                    <Text style={styles.activeSoundName}>{sound.name}</Text>
                  </View>
                  <Text style={styles.activeSoundVolume}>{sound.volume}%</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyMix}>
              <Headphones size={32} color="#DDD" />
              <Text style={styles.emptyMixText}>No sounds playing</Text>
              <Text style={styles.emptyMixSubtext}>Tap a sound below to start</Text>
            </View>
          )}
        </View>

        <View style={styles.soundsSection}>
          <Text style={styles.sectionTitle}>Available Sounds</Text>
          <View style={styles.soundsGrid}>
            {sounds.map((sound) => (
              <View key={sound.id} style={styles.soundCard}>
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
                  <Text style={styles.soundName}>{sound.name}</Text>
                  <Text style={styles.soundDescription}>{sound.description}</Text>
                </View>

                {sound.isPlaying && (
                  <View style={styles.soundVolumeControl}>
                    <Text style={styles.volumeLabel}>Volume</Text>
                    <Slider
                      style={styles.soundSlider}
                      value={sound.volume}
                      onValueChange={(value) => updateSoundVolume(sound.id, value)}
                      minimumValue={0}
                      maximumValue={100}
                      thumbStyle={styles.soundSliderThumb}
                      trackStyle={styles.soundSliderTrack}
                      minimumTrackTintColor={sound.color}
                      maximumTrackTintColor="#E0E0E0"
                    />
                    <Text style={styles.soundVolumeValue}>{Math.round(sound.volume)}%</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity style={styles.presetButton}>
              <Text style={styles.presetButtonText}>Focus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetButton}>
              <Text style={styles.presetButtonText}>Relax</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetButton}>
              <Text style={styles.presetButtonText}>Sleep</Text>
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
    backgroundColor: '#F8FBFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#87CEEB',
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
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  volumeValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#B6D0E2',
  },
  slider: {
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#B6D0E2',
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  noiseCancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#87CEEB',
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
    color: '#B6D0E2',
    marginLeft: 8,
  },
  noiseCancelTextActive: {
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#87CEEB',
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
    color: '#333',
  },
  activeSoundVolume: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: '#B6D0E2',
  },
  emptyMix: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyMixText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  emptyMixSubtext: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
  },
  soundsSection: {
    marginBottom: 32,
  },
  soundsGrid: {
    gap: 16,
  },
  soundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#87CEEB',
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
    color: '#333',
    marginBottom: 4,
  },
  soundDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  soundVolumeControl: {
    marginTop: 8,
  },
  volumeLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#666',
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
    color: '#B6D0E2',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  presetButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#666',
  },
});