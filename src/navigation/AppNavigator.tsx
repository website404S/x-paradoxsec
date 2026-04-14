// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { C } from '../theme';

import { HomeScreen } from '../screens/HomeScreen';
import { IPTrackerScreen } from '../screens/IPTrackerScreen';
import { TerminalScreen } from '../screens/TerminalScreen';
import { CodeEditorScreen } from '../screens/CodeEditorScreen';
import {
  HashToolsScreen, EncoderToolsScreen, AESToolsScreen,
  JWTDecoderScreen, PasswordCheckScreen,
} from '../screens/CryptoScreens';
import {
  NetworkInfoScreen, PortScannerScreen,
  HTTPInspectorScreen, SSLCheckerScreen,
} from '../screens/NetworkScreens';
import {
  DNSCheckerScreen, URLScannerScreen, DeviceScanScreen,
  CommandLibScreen, LearningHubScreen,
} from '../screens/MiscScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackOpts = {
  headerStyle: { backgroundColor: C.bg1 },
  headerTintColor: C.violetBright,
  headerTitleStyle: { fontFamily: 'monospace', fontWeight: '700' as const },
  contentStyle: { backgroundColor: C.bg0 },
};

// All screens accessible from Home
const HomeStack = () => (
  <Stack.Navigator screenOptions={stackOpts}>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="IPTracker"     component={IPTrackerScreen}     options={{ title: '📡 IP Tracker' }} />
    <Stack.Screen name="DNSChecker"    component={DNSCheckerScreen}    options={{ title: '🌐 DNS Lookup' }} />
    <Stack.Screen name="URLScanner"    component={URLScannerScreen}    options={{ title: '🔗 URL Scanner' }} />
    <Stack.Screen name="PortScanner"   component={PortScannerScreen}   options={{ title: '🔍 Port Scanner' }} />
    <Stack.Screen name="SSLChecker"    component={SSLCheckerScreen}    options={{ title: '🔒 SSL Checker' }} />
    <Stack.Screen name="HTTPInspector" component={HTTPInspectorScreen} options={{ title: '📋 HTTP Headers' }} />
    <Stack.Screen name="HashTools"     component={HashToolsScreen}     options={{ title: '🔐 Hash Tools' }} />
    <Stack.Screen name="EncoderTools"  component={EncoderToolsScreen}  options={{ title: '⚙️ Encoder' }} />
    <Stack.Screen name="AESTools"      component={AESToolsScreen}      options={{ title: '🛡️ AES Crypto' }} />
    <Stack.Screen name="JWTDecoder"    component={JWTDecoderScreen}    options={{ title: '🪙 JWT Decoder' }} />
    <Stack.Screen name="PasswordCheck" component={PasswordCheckScreen} options={{ title: '🔑 Password Check' }} />
    <Stack.Screen name="NetworkInfo"   component={NetworkInfoScreen}   options={{ title: '📶 Network Info' }} />
    <Stack.Screen name="DeviceScan"    component={DeviceScanScreen}    options={{ title: '📱 Device Info' }} />
    <Stack.Screen name="Terminal"      component={TerminalScreen}      options={{ title: '⌨️ Terminal' }} />
    <Stack.Screen name="CodeEditor"    component={CodeEditorScreen}    options={{ title: '✏️ Code Editor' }} />
    <Stack.Screen name="CommandLib"    component={CommandLibScreen}    options={{ title: '📖 Commands' }} />
    <Stack.Screen name="LearningHub"   component={LearningHubScreen}   options={{ title: '📚 Learning Hub' }} />
  </Stack.Navigator>
);

const ToolsStack = () => (
  <Stack.Navigator screenOptions={stackOpts}>
    <Stack.Screen name="Terminal"  component={TerminalScreen}  options={{ title: '⌨️ Terminal' }} />
    <Stack.Screen name="CodeEditor" component={CodeEditorScreen} options={{ title: '✏️ Code Editor' }} />
  </Stack.Navigator>
);

const CryptoStack = () => (
  <Stack.Navigator screenOptions={stackOpts}>
    <Stack.Screen name="HashTools"     component={HashToolsScreen}     options={{ title: '🔐 Hash Tools' }} />
    <Stack.Screen name="EncoderTools"  component={EncoderToolsScreen}  options={{ title: '⚙️ Encoder' }} />
    <Stack.Screen name="AESTools"      component={AESToolsScreen}      options={{ title: '🛡️ AES' }} />
    <Stack.Screen name="JWTDecoder"    component={JWTDecoderScreen}    options={{ title: '🪙 JWT' }} />
    <Stack.Screen name="PasswordCheck" component={PasswordCheckScreen} options={{ title: '🔑 Password' }} />
  </Stack.Navigator>
);

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: C.bg1, borderTopColor: C.border, height: 58, paddingBottom: 8 },
        tabBarActiveTintColor: C.violetBright,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tab.Screen name="HomeTab"   component={HomeStack}   options={{ title: 'Home',   tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⌂</Text> }} />
      <Tab.Screen name="ToolsTab"  component={ToolsStack}  options={{ title: 'Dev',    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⌨️</Text> }} />
      <Tab.Screen name="CryptoTab" component={CryptoStack} options={{ title: 'Crypto', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔐</Text> }} />
    </Tab.Navigator>
  </NavigationContainer>
);
