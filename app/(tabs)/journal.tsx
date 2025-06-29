import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useStressTracking } from '@/hooks/useStressTracking';
import { 
  Mic, 
  MicOff, 
  Save, 
  Calendar, 
  TrendingUp, 
  Smile, 
  Meh, 
  Frown,
  Heart,
  BookOpen
} from 'lucide-react-native';

export default function JournalScreen() {
  const { entries, createEntry, loading: entriesLoading } = useJournalEntries();
  const { recordStressLevel } = useStressTracking();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [journalText, setJournalText] = useState('');
  const [stressRating, setStressRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const moodOptions = [
    { type: 'happy' as const, icon: <Smile size={24} color="#A8E6CF" />, label: 'Happy' },
    { type: 'neutral' as const, icon: <Meh size={24} color="#DDA0DD" />, label: 'Neutral' },
    { type: 'sad' as const, icon: <Frown size={24} color="#FFB6C1" />, label: 'Stressed' },
  ];

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile size={16} color="#A8E6CF" />;
      case 'neutral': return <Meh size={16} color="#DDA0DD" />;
      case 'sad': return <Frown size={16} color="#FFB6C1" />;
      default: return <Meh size={16} color="#DDA0DD" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return '#A8E6CF';
      case 'neutral': return '#DDA0DD';
      case 'sad': return '#FFB6C1';
      default: return '#DDA0DD';
    }
  };

  const renderStressRating = () => {
    const hearts = [];
    for (let i = 1; i <= 10; i++) {
      hearts.push(
        <TouchableOpacity
          key={i}
          onPress={() => setStressRating(i)}
          style={styles.heartButton}
        >
          <Heart
            size={20}
            color={i <= stressRating ? '#FFB6C1' : '#E0E0E0'}
            fill={i <= stressRating ? '#FFB6C1' : 'transparent'}
          />
        </TouchableOpacity>
      );
    }
    return hearts;
  };

  const handleSaveEntry = async () => {
    if (!selectedMood || !journalText.trim()) {
      return;
    }

    setSaving(true);
    
    try {
      // Save journal entry
      const { error: journalError } = await createEntry(
        journalText,
        selectedMood,
        stressRating,
        [] // Tags can be added later
      );

      if (journalError) {
        console.error('Error saving journal entry:', journalError);
        return;
      }

      // Record stress level
      await recordStressLevel(stressRating * 10); // Convert 1-10 to 0-100 scale

      // Reset form
      setJournalText('');
      setSelectedMood(null);
      setStressRating(5);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mindful Journal</Text>
          <Text style={styles.subtitle}>Reflect on your journey</Text>
        </View>

        <View style={styles.newEntrySection}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          
          <View style={styles.moodSelector}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.type}
                style={[
                  styles.moodOption,
                  selectedMood === mood.type && styles.moodOptionSelected
                ]}
                onPress={() => setSelectedMood(mood.type)}
              >
                {mood.icon}
                <Text style={[
                  styles.moodLabel,
                  selectedMood === mood.type && styles.moodLabelSelected
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.stressSection}>
            <Text style={styles.stressTitle}>Stress Level (1-10)</Text>
            <View style={styles.stressRating}>
              {renderStressRating()}
            </View>
            <Text style={styles.stressValue}>{stressRating}/10</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Share your thoughts</Text>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive
                ]}
                onPress={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <MicOff size={16} color="#FAFAFA" />
                ) : (
                  <Mic size={16} color="#A8E6CF" />
                )}
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.textInput}
              placeholder="How was your journey today? What helped you feel calm?"
              multiline
              numberOfLines={4}
              value={journalText}
              onChangeText={setJournalText}
              textAlignVertical="top"
            />

            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording voice note...</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSaveEntry}
            disabled={saving || !selectedMood || !journalText.trim()}
          >
            <LinearGradient
              colors={['#A8E6CF', '#98E4D6']}
              style={styles.saveGradient}
            >
              <Save size={16} color="#FAFAFA" />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Entry'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.entriesSection}>
          <View style={styles.entriesHeader}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryMeta}>
                  <Calendar size={14} color="#666" />
                  <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
                </View>
                <View style={styles.entryMood}>
                  {getMoodIcon(entry.mood)}
                  <View 
                    style={[
                      styles.stressIndicator, 
                      { backgroundColor: getMoodColor(entry.mood) }
                    ]}
                  >
                    <Text style={styles.stressIndicatorText}>{entry.stress_level}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.entryContent}>{entry.content}</Text>
              
              {entry.tags && entry.tags.length > 0 && (
                <View style={styles.entryTags}>
                  {entry.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Weekly Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color="#A8E6CF" />
              <Text style={styles.insightTitle}>Stress Trend</Text>
            </View>
            <Text style={styles.insightText}>
              Your average stress level decreased by 15% this week. Keep up the great work!
            </Text>
            <View style={styles.insightStats}>
              <Text style={styles.insightStat}>Avg: 4.2/10</Text>
              <Text style={styles.insightStat}>Best: 2/10</Text>
            </View>
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
  newEntrySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 20,
    color: '#333',
    marginBottom: 16,
  },
  moodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  moodOptionSelected: {
    borderColor: '#B6D0E2',
    backgroundColor: '#F0F7FF',
  },
  moodLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  moodLabelSelected: {
    color: '#B6D0E2',
  },
  stressSection: {
    marginBottom: 24,
  },
  stressTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  stressRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heartButton: {
    padding: 4,
  },
  stressValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#B6D0E2',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#333',
  },
  recordButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#B6D0E2',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#333',
    height: 100,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB6C1',
    marginRight: 8,
  },
  recordingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#B6D0E2',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  entriesSection: {
    marginBottom: 32,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#B6D0E2',
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDate: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stressIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stressIndicatorText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  entryContent: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#B6D0E2',
  },
  insightsSection: {
    paddingBottom: 32,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    color: '#333',
    marginLeft: 8,
  },
  insightText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  insightStats: {
    flexDirection: 'row',
    gap: 16,
  },
  insightStat: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#B6D0E2',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});