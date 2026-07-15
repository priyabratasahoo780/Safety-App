// ============================================================================
// AI Voice SOS Module — Permissions
// SafeSphere AI | Infinity Coders
// ============================================================================

// NOTE: This module provides permission helper abstractions.
// In a real React Native app, these would use expo-av, expo-location,
// expo-sensors, etc. Here we define the interface and platform-agnostic logic.

/**
 * Permission status for a single permission.
 */
export enum PermissionStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  UNDETERMINED = 'UNDETERMINED',
  BLOCKED = 'BLOCKED', // User denied and selected "don't ask again"
}

/**
 * Map of all SOS-required permissions and their status.
 */
export interface SOSPermissionMap {
  microphone: PermissionStatus;
  location: PermissionStatus;
  motion: PermissionStatus;
  backgroundLocation: PermissionStatus;
}

/**
 * Result of a permission request.
 */
export interface PermissionResult {
  permission: keyof SOSPermissionMap;
  status: PermissionStatus;
  canAskAgain: boolean;
}

export async function requestMicrophonePermission(): Promise<PermissionResult> {
  try {
    if (!AudioModule) throw new Error('expo-audio not installed');
    const { status, canAskAgain } = await AudioModule.requestRecordingPermissionsAsync();

    return {
      permission: 'microphone',
      status: mapExpoStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  } catch {
    return {
      permission: 'microphone',
      status: PermissionStatus.DENIED,
      canAskAgain: false,
    };
  }
}

/**
 * Request foreground location permission.
 * Uses expo-location requestForegroundPermissionsAsync() under the hood.
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
  try {
    if (!LocationModule) throw new Error('expo-location not installed');
    const { status, canAskAgain } = await LocationModule.requestForegroundPermissionsAsync();

    return {
      permission: 'location',
      status: mapExpoStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  } catch {
    return {
      permission: 'location',
      status: PermissionStatus.DENIED,
      canAskAgain: false,
    };
  }
}

/**
 * Request background location permission.
 * Uses expo-location requestBackgroundPermissionsAsync() under the hood.
 */
export async function requestBackgroundLocationPermission(): Promise<PermissionResult> {
  try {
    if (!LocationModule) throw new Error('expo-location not installed');
    const { status, canAskAgain } = await LocationModule.requestBackgroundPermissionsAsync();

    return {
      permission: 'backgroundLocation',
      status: mapExpoStatus(status),
      canAskAgain: canAskAgain ?? true,
    };
  } catch {
    return {
      permission: 'backgroundLocation',
      status: PermissionStatus.DENIED,
      canAskAgain: false,
    };
  }
}

/**
 * Request motion sensor permission (accelerometer, gyroscope).
 * On most platforms, motion sensors don't require explicit permission.
 * On iOS 13+, motion permission is required.
 */
export async function requestMotionPermission(): Promise<PermissionResult> {
  try {
    if (!SensorsModule) throw new Error('expo-sensors not installed');
    const { DeviceMotion } = SensorsModule;

    if (DeviceMotion && DeviceMotion.requestPermissionsAsync) {
      const { status, canAskAgain } = await DeviceMotion.requestPermissionsAsync();
      return {
        permission: 'motion',
        status: mapExpoStatus(status),
        canAskAgain: canAskAgain ?? true,
      };
    }

    return {
      permission: 'motion',
      status: PermissionStatus.GRANTED,
      canAskAgain: true,
    };
  } catch {
    return {
      permission: 'motion',
      status: PermissionStatus.GRANTED,
      canAskAgain: true,
    };
  }
}

/**
 * Check all SOS-required permissions at once.
 * Returns a complete status map.
 */
export async function checkAllSOSPermissions(): Promise<SOSPermissionMap> {
  const [mic, loc, motion, bgLoc] = await Promise.all([
    requestMicrophonePermission(),
    requestLocationPermission(),
    requestMotionPermission(),
    requestBackgroundLocationPermission(),
  ]);

  return {
    microphone: mic.status,
    location: loc.status,
    motion: motion.status,
    backgroundLocation: bgLoc.status,
  };
}

/**
 * Check if all critical SOS permissions are granted.
 * Critical: microphone and location.
 */
export function areSOSPermissionsGranted(permissions: SOSPermissionMap): boolean {
  return (
    permissions.microphone === PermissionStatus.GRANTED &&
    permissions.location === PermissionStatus.GRANTED
  );
}

/**
 * Get a list of missing (non-granted) permissions.
 */
export function getMissingPermissions(
  permissions: SOSPermissionMap
): (keyof SOSPermissionMap)[] {
  const missing: (keyof SOSPermissionMap)[] = [];

  for (const [key, status] of Object.entries(permissions)) {
    if (status !== PermissionStatus.GRANTED) {
      missing.push(key as keyof SOSPermissionMap);
    }
  }

  return missing;
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Map Expo permission status string to our PermissionStatus enum.
 */
function mapExpoStatus(status: string): PermissionStatus {
  switch (status) {
    case 'granted':
      return PermissionStatus.GRANTED;
    case 'denied':
      return PermissionStatus.DENIED;
    case 'undetermined':
      return PermissionStatus.UNDETERMINED;
    default:
      return PermissionStatus.DENIED;
  }
}

// Fallback modules
let AudioModule: any = null;
let LocationModule: any = null;
let SensorsModule: any = null;

try {
  AudioModule = require('expo-audio');
} catch (e) {}

try {
  LocationModule = require('expo-location');
} catch (e) {}

try {
  SensorsModule = require('expo-sensors');
} catch (e) {}
