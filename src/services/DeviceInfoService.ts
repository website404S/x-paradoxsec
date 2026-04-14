// src/services/DeviceInfoService.ts
// Real device data via react-native-device-info + expo-battery

import * as ExpoDevice from 'expo-device';
import * as Battery from 'expo-battery';
import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export interface RealDeviceInfo {
  // Identity
  deviceName: string;
  brand: string;
  model: string;
  manufacturer: string;
  deviceId: string;

  // OS
  systemName: string;
  systemVersion: string;
  buildId: string;
  apiLevel: number;
  isEmulator: boolean;

  // Hardware
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
  freeStorage: number;
  cpuArch: string;
  supportedAbis: string[];

  // Battery
  batteryLevel: number;
  batteryState: string;
  isCharging: boolean;
  isPowerSaveMode: boolean;

  // Network
  ipAddress: string;
  macAddress: string;
  carrier: string;

  // Security
  isRooted: boolean;
  hasFingerprint: boolean;
  pinOrFingerprintSet: boolean;

  // App
  appVersion: string;
  bundleId: string;
  buildNumber: string;
  uniqueId: string;
  installerPackageName: string;
}

export async function getRealDeviceInfo(): Promise<RealDeviceInfo> {
  const [
    batteryLevel,
    batteryState,
    totalStorage,
    freeStorage,
    ipAddress,
    isRooted,
    macAddress,
    carrier,
    uniqueId,
    installerPackageName,
    supportedAbis,
    usedMemory,
    isPowerSave,
    pinSet,
    hasFingerprint,
  ] = await Promise.all([
    Battery.getBatteryLevelAsync().catch(() => -1),
    Battery.getBatteryStateAsync().catch(() => Battery.BatteryState.UNKNOWN),
    FileSystem.getFreeDiskStorageAsync().catch(() => 0),
    FileSystem.getFreeDiskStorageAsync().catch(() => 0),
    Network.getIpAddressAsync().catch(() => 'Unknown'),
    DeviceInfo.isEmulator().then((e) => !e).catch(() => false),
    DeviceInfo.getMacAddress().catch(() => 'Unavailable'),
    DeviceInfo.getCarrier().catch(() => 'Unknown'),
    DeviceInfo.getUniqueId().catch(() => 'Unknown'),
    DeviceInfo.getInstallerPackageName().catch(() => 'Unknown'),
    DeviceInfo.supportedAbis().catch(() => []),
    DeviceInfo.getUsedMemory().catch(() => 0),
    DeviceInfo.isPinOrFingerprintSet().catch(() => false),
    DeviceInfo.isPinOrFingerprintSet().catch(() => false),
    DeviceInfo.isPinOrFingerprintSet().catch(() => false),
  ]);

  const batteryStateStr = {
    [Battery.BatteryState.CHARGING]: 'Charging',
    [Battery.BatteryState.FULL]: 'Full',
    [Battery.BatteryState.UNPLUGGED]: 'Unplugged',
    [Battery.BatteryState.UNKNOWN]: 'Unknown',
  }[batteryState] ?? 'Unknown';

  return {
    deviceName: ExpoDevice.deviceName ?? DeviceInfo.getDeviceNameSync(),
    brand: ExpoDevice.brand ?? DeviceInfo.getBrand(),
    model: ExpoDevice.modelName ?? DeviceInfo.getModel(),
    manufacturer: ExpoDevice.manufacturer ?? DeviceInfo.getManufacturerSync(),
    deviceId: DeviceInfo.getDeviceId(),

    systemName: Platform.OS === 'android' ? 'Android' : 'iOS',
    systemVersion: ExpoDevice.osVersion ?? DeviceInfo.getSystemVersion(),
    buildId: DeviceInfo.getBuildIdSync(),
    apiLevel: Platform.OS === 'android' ? (ExpoDevice.platformApiLevel ?? parseInt(DeviceInfo.getSystemVersion())) : 0,
    isEmulator: !ExpoDevice.isDevice,

    totalMemory: ExpoDevice.totalMemory ?? 0,
    usedMemory,
    totalStorage: await DeviceInfo.getTotalDiskCapacity().catch(() => 0),
    freeStorage,
    cpuArch: DeviceInfo.getDeviceId(),
    supportedAbis,

    batteryLevel: Math.round(batteryLevel * 100),
    batteryState: batteryStateStr,
    isCharging: batteryState === Battery.BatteryState.CHARGING,
    isPowerSaveMode: isPowerSave,

    ipAddress,
    macAddress,
    carrier,

    isRooted: false, // DeviceInfo.isRootedExperimentalSync() - disabled for privacy
    hasFingerprint,
    pinOrFingerprintSet: pinSet,

    appVersion: DeviceInfo.getVersion(),
    bundleId: DeviceInfo.getBundleId(),
    buildNumber: DeviceInfo.getBuildNumber(),
    uniqueId,
    installerPackageName,
  };
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
