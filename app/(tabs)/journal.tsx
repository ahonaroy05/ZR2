import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useStressTracking } from '@/hooks/useStressTracking';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme } = useTheme();
  const { entries, createEntry, loading: entriesLoading } = useJournalEntries();
  const { recordStressLevel } = useStressTracking();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [journalText, setJournalText] = useState('');
  const [stressRating, setStressRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const moodOptions = [
    { type: 'happy' as const, icon: <Smile size={24} color={theme.colors.success} />, label: 'Happy' },
    { type: 'neutral' as const, icon: <Meh size={24} color={theme.colors.primary} />, label: 'Neutral' },
    { type: 'sad' as const, icon: <Frown size={24} color={theme.colors.accent} />, label: 'Stressed' },
  ];

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile size={16} color={theme.colors.success} />;
      case 'neutral': return <Meh size={16} color={theme.colors.primary} />;
      case 'sad': return <Frown size={16} color={theme.colors.accent} />;
      default: return <Meh size={16} color={theme.colors.primary} />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return theme.colors.success;
      case 'neutral': return theme.colors.primary;
      case 'sad': return theme.colors.accent;
      default: return theme.colors.primary;
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
            color={i <= stressRating ? theme.colors.accent : theme.colors.border}
            fill={i <= stressRating ? theme.colors.accent : 'transparent'}
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Mindful Journal</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>Reflect on your journey</Text>
        </View>

        <View style={[styles.newEntrySection, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How are you feeling?</Text>
          
          <View style={styles.moodSelector}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.type}
                style={[
                  styles.moodOption,
                  { borderColor: theme.colors.border },
                  selectedMood === mood.type && styles.moodOptionSelected
                ]}
                onPress={() => setSelectedMood(mood.type)}
              >
                {mood.icon}
                <Text style={[
                  styles.moodLabel,
                  { color: theme.colors.text },
                  selectedMood === mood.type && styles.moodLabelSelected
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.stressSection}>
            <Text style={[styles.stressTitle, { color: theme.colors.text }]}>Stress Level (1-10)</Text>
            <View style={styles.stressRating}>
              {renderStressRating()}
            </View>
            <Text style={[styles.stressValue, { color: theme.colors.primary }]}>{stressRating}/10</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Share your thoughts</Text>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  { backgroundColor: theme.colors.primaryLight },
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
              style={[styles.textInput, { 
                borderColor: theme.colors.border, 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text 
              }]}
              placeholder="How was your journey today? What helped you feel calm?"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={4}
              value={journalText}
              onChangeText={setJournalText}
              textAlignVertical="top"
            />

            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.recordingText, { color: theme.colors.primary }]}>Recording voice note...</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, { shadowColor: theme.colors.shadow }, saving && styles.saveButtonDisabled]} 
            onPress={handleSaveEntry}
            disabled={saving || !selectedMood || !journalText.trim()}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              style={styles.saveGradient}
            >
              <Save size={16} color="#FAFAFA" />
              <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
                {saving ? 'Saving...' : 'Save Entry'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.entriesSection}>
          <View style={styles.entriesHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Entries</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {entries.map((entry) => (
            <View key={entry.id} style={[styles.entryCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <View style={styles.entryHeader}>
                <View style={styles.entryMeta}>
                  <Calendar size={14} color={theme.colors.textTertiary} />
                  <Text style={[styles.entryDate, { color: theme.colors.textSecondary }]}>{formatDate(entry.created_at)}</Text>
                </View>
                <View style={styles.entryMood}>
                  {getMoodIcon(entry.mood)}
                  <View 
                    style={[
                      styles.stressIndicator, 
                      { backgroundColor: getMoodColor(entry.mood) }
                    ]}
                  >
                    <Text style={[styles.stressIndicatorText, { color: theme.colors.surface }]}>{entry.stress_level}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={[styles.entryContent, { color: theme.colors.text }]}>{entry.content}</Text>
              
              {entry.tags && entry.tags.length > 0 && (
                <View style={styles.entryTags}>
                  {entry.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primaryLight }]}>
                      <Text style={[styles.tagText, { color: theme.colors.primary }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.insightsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Weekly Insights</Text>
          <View style={[styles.insightCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Stress Trend</Text>
            </View>
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              Your average stress level decreased by 15% this week. Keep up the great work!
            </Text>
            <View style={styles.insightStats}>
              <Text style={[styles.insightStat, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }]}>Avg: 4.2/10</Text>
              <Text style={[styles.insightStat, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }]}>Best: 2/10</Text>
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
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
  },
  moodOptionSelected: {
    borderColor: '#B6D0E2', // Keep original for now, will be themed
    backgroundColor: '#F0F7FF', // Keep original for now, will be themed
  },
  moodLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#B6D0E2', // Keep original for now
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
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
    marginRight: 8,
  },
  recordingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
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
  },
  entryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
  },
  entryContent: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
  },
  insightsSection: {
    paddingBottom: 32,
  },
  insightCard: {
    borderRadius: 20,
    padding: 20,
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
    marginLeft: 8,
  },
  insightText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});