import ImageCropPicker, { Image, Video, Options } from 'react-native-image-crop-picker';
import { Platform, Alert, PermissionsAndroid } from 'react-native';

export interface PickedMedia {
  uri: string;
  type: 'image' | 'video';
  mime: string;
  width?: number;
  height?: number;
  size?: number; // bytes
  filename?: string;
  exif?: any;
  duration?: number; // video duration in ms
}

// Default compression options
const DEFAULT_IMAGE_OPTIONS: Partial<Options> = {
  mediaType: 'photo',
  compressImageQuality: 0.8,
  compressImageMaxWidth: 1920,
  compressImageMaxHeight: 1920,
  includeExif: true,
  forceJpg: true,
  cropping: false,
};

const DEFAULT_VIDEO_OPTIONS: any = {
  mediaType: 'video',
  includeExif: true,
};

const DEFAULT_CROP_OPTIONS: any = {
  mediaType: 'photo',
  compressImageQuality: 0.85,
  compressImageMaxWidth: 1080,
  compressImageMaxHeight: 1080,
  includeExif: true,
  cropping: true,
  cropperCircleOverlay: false,
  freeStyleCropEnabled: true,
  cropperToolbarTitle: 'Crop Image',
  cropperToolbarColor: '#0B0F19',
  cropperToolbarWidgetColor: '#FFFFFF',
};

/**
 * Request necessary permissions for Android
 */
async function requestAndroidPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    // Android 13+ uses different permissions
    if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );
    }
  } catch {
    return false;
  }
}

function formatResult(result: Image | Video): PickedMedia {
  const isVideo = result.mime?.startsWith('video');
  return {
    uri: result.path,
    type: isVideo ? 'video' : 'image',
    mime: result.mime,
    width: result.width,
    height: result.height,
    size: (result as any).size ? Number((result as any).size) : undefined,
    filename: result.path?.split('/').pop(),
    exif: (result as any).exif || null,
    duration: isVideo && (result as Video).duration ? ((result as Video).duration ?? undefined) : undefined,
  };
}

/**
 * Pick a single image from gallery with compression + EXIF
 */
export async function pickImageFromGallery(
  options?: Partial<Options>
): Promise<PickedMedia | null> {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please grant media access to pick images.');
    return null;
  }

  try {
    const result = await ImageCropPicker.openPicker({
      ...DEFAULT_IMAGE_OPTIONS,
      ...options,
    });
    return formatResult(result as Image);
  } catch (error: any) {
    if (error?.code !== 'E_PICKER_CANCELLED') {
      console.warn('Image picker error:', error);
    }
    return null;
  }
}

/**
 * Pick a single video from gallery with EXIF
 */
export async function pickVideoFromGallery(
  options?: Partial<Options>
): Promise<PickedMedia | null> {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please grant media access to pick videos.');
    return null;
  }

  try {
    const result = await ImageCropPicker.openPicker({
      ...DEFAULT_VIDEO_OPTIONS,
      ...options,
    });
    return formatResult(result as Video);
  } catch (error: any) {
    if (error?.code !== 'E_PICKER_CANCELLED') {
      console.warn('Video picker error:', error);
    }
    return null;
  }
}

/**
 * Pick an image and crop it (for avatars, profile pics, etc.)
 */
export async function pickAndCropImage(
  options?: Partial<Options>
): Promise<PickedMedia | null> {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please grant media access to pick images.');
    return null;
  }

  try {
    const result = await ImageCropPicker.openPicker({
      ...DEFAULT_CROP_OPTIONS,
      ...options,
    });
    return formatResult(result as Image);
  } catch (error: any) {
    if (error?.code !== 'E_PICKER_CANCELLED') {
      console.warn('Image crop picker error:', error);
    }
    return null;
  }
}

/**
 * Pick circular avatar (square crop with circle overlay)
 */
export async function pickAvatarImage(): Promise<PickedMedia | null> {
  return pickAndCropImage({
    cropperCircleOverlay: true,
    compressImageMaxWidth: 512,
    compressImageMaxHeight: 512,
    compressImageQuality: 0.9,
    width: 512,
    height: 512,
  });
}

/**
 * Capture a photo from camera with compression + EXIF
 */
export async function capturePhoto(
  options?: Partial<Options>
): Promise<PickedMedia | null> {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please grant camera access.');
    return null;
  }

  try {
    const result = await ImageCropPicker.openCamera({
      ...DEFAULT_IMAGE_OPTIONS,
      ...options,
    });
    return formatResult(result as Image);
  } catch (error: any) {
    if (error?.code !== 'E_PICKER_CANCELLED') {
      console.warn('Camera error:', error);
    }
    return null;
  }
}

/**
 * Record a video from camera
 */
export async function captureVideo(
  options?: Partial<Options>
): Promise<PickedMedia | null> {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please grant camera access.');
    return null;
  }

  try {
    const result = await ImageCropPicker.openCamera({
      ...DEFAULT_VIDEO_OPTIONS,
      ...options,
    });
    return formatResult(result as Video);
  } catch (error: any) {
    if (error?.code !== 'E_PICKER_CANCELLED') {
      console.warn('Camera video error:', error);
    }
    return null;
  }
}

/**
 * Pick multiple images from gallery
 */
export async function pickMultipleImages(
  maxFiles: number = 10,
  options?: Partial<Options>
): Promise<PickedMedia[]> {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please grant media access to pick images.');
    return [];
  }

  try {
    const results = await ImageCropPicker.openPicker({
      ...DEFAULT_IMAGE_OPTIONS,
      multiple: true,
      maxFiles,
      ...options,
    });
    if (Array.isArray(results)) {
      return results.map((r) => formatResult(r as Image));
    }
    return [formatResult(results as Image)];
  } catch (error: any) {
    if (error?.code !== 'E_PICKER_CANCELLED') {
      console.warn('Multi picker error:', error);
    }
    return [];
  }
}

/**
 * Clean up temporary files created by the picker
 */
export function cleanupPickerTempFiles(): void {
  ImageCropPicker.clean().catch(() => {});
}
