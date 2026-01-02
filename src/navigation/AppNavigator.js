import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import PreviewScreen from '../screens/PreviewScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import EventFormScreen from '../screens/EventFormScreen';
import ConflictScreen from '../screens/ConflictScreen';
import SuccessScreen from '../screens/SuccessScreen';
import CalendarScreen from '../screens/CalendarScreen';
import PDFUploadScreen from '../screens/PDFUploadScreen';
import ExtractedEventsScreen from '../screens/ExtractedEventsScreen';

import { COLORS, FONT_WEIGHTS } from '../constants/theme';

const Stack = createNativeStackNavigator();

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: COLORS.white,
  headerTitleStyle: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  headerBackTitleVisible: false,
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={defaultScreenOptions}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'SmartSchedule' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Take Photo' }}
        />
        <Stack.Screen
          name="Preview"
          component={PreviewScreen}
          options={{ title: 'Preview Image' }}
        />
        <Stack.Screen
          name="Processing"
          component={ProcessingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EventForm"
          component={EventFormScreen}
          options={{ title: 'Event Details' }}
        />
        <Stack.Screen
          name="Conflict"
          component={ConflictScreen}
          options={{ title: 'Schedule Conflict' }}
        />
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ title: 'My Calendar' }}
        />
        <Stack.Screen
          name="PDFUpload"
          component={PDFUploadScreen}
          options={{ title: 'Import PDF' }}
        />
        <Stack.Screen
          name="ExtractedEvents"
          component={ExtractedEventsScreen}
          options={{ title: 'Review Events' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

