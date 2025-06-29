import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Shield } from 'lucide-react-native';

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
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleReset}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Shield size={32} color="#A8E6CF" />
              <Text style={styles.title}>5-4-3-2-1 Grounding</Text>
              <Text style={styles.subtitle}>Take a deep breath and focus</Text>
            </View>
            
            <View style={styles.stepContainer}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
              </View>
              <Text style={styles.stepText}>{groundingSteps[currentStep]}</Text>
            </View>
            
            <View style={styles.progressContainer}>
              {groundingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentStep && styles.progressDotActive
                  ]}
                />
              ))}
            </View>
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
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
    backgroundColor: '#FAFAFA',
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
    color: '#333',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#A8E6CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: '#FAFAFA',
  },
  stepText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    color: '#333',
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
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#A8E6CF',
  },
  nextButton: {
    backgroundColor: '#A8E6CF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#FAFAFA',
  },
});