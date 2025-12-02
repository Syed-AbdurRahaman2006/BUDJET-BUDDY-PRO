import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, Camera as CameraIcon } from 'lucide-react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { extractReceiptData } from '@/utils/ocr';
import Colors from '@/constants/colors';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraRef) return;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64Response = await fetch(resizedPhoto.uri);
      const blob = await base64Response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const extractedData = await extractReceiptData(base64data);

          router.replace({
            pathname: '/add-expense',
            params: {
              amount: extractedData.amount.toString(),
              storeName: extractedData.storeName,
              date: extractedData.date,
              category: extractedData.suggestedCategory,
              receiptImage: resizedPhoto.uri,
            },
          });
        } catch (error) {
          console.error('OCR error:', error);
          Alert.alert(
            'Processing Error',
            'Could not extract data from receipt. You can still add the expense manually.',
            [
              {
                text: 'Add Manually',
                onPress: () => router.replace('/add-expense'),
              },
              {
                text: 'Try Again',
                style: 'cancel',
              },
            ]
          );
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan receipts
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={(ref: CameraView | null) => setCameraRef(ref)}
      >
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
              accessibilityLabel="Close camera"
              accessibilityRole="button"
            >
              <X color="#fff" size={28} />
            </TouchableOpacity>
          </View>

          <View style={styles.frameContainer}>
            <View style={styles.frame} />
            <Text style={styles.instructionText}>
              Position receipt within frame
            </Text>
          </View>

          <View style={styles.bottomBar}>
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.processingText}>
                  Processing receipt...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                accessibilityLabel="Capture receipt"
                accessibilityRole="button"
              >
                <View style={styles.captureButtonInner}>
                  <CameraIcon color={Colors.primary} size={32} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  frame: {
    width: '100%',
    aspectRatio: 0.7,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 12,
    borderStyle: 'dashed' as const,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  bottomBar: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500' as const,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
