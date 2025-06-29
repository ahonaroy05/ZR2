import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface EmergencyCalmProps {
  visible: boolean;
  onClose: () => void;
}

const groundingSteps = [
  '5 things you can SEE',
  '4 things you can TOUCH',
  '3 things you can HEAR',
  '2 things you can SMELL',
  '1 thing you can TASTE'
];

export function EmergencyCalm({ visible, onClose }: EmergencyCalmProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { colors } = useTheme();

  const handleNext = () => {
    if (currentStep < groundingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
      onClose();
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={20} style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleReset}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Shield size={32} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>5-4-3-2-1 Grounding</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Take a deep breath and focus</Text>
            </View>
            
            <View style={styles.stepContainer}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.surface }]}>{currentStep + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>{groundingSteps[currentStep]}</Text>
            </View>
            
            <View style={styles.progressContainer}>
              {groundingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    { backgroundColor: colors.border },
                    index <= currentStep && styles.progressDotActive
                  ]}
                />
              ))}
            </View>
            
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNext}>
              <Text style={[styles.nextButtonText, { color: colors.surface }]}>
                {currentStep < groundingSteps.length - 1 ? 'Next' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    borderRadius: 24,
    padding: 32,
    margin: 24,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginTop: 4,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
  },
  stepText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
});