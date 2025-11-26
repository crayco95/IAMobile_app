import React from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import { ThemeToggle } from '../components/ThemeToggle'
import { HomeScreen } from '../screens/HomeScreen'
import { CaptureScreen } from '../screens/CaptureScreen'
import { ResultScreen } from '../screens/ResultScreen'
import { RootStackParamList } from './types'

const Stack = createStackNavigator<RootStackParamList>()

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#ffffff' }
}

/** Navegación principal con stack para Home, Capture y Result. */
export function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerTitleStyle: { fontWeight: '700' },
          headerStyle: { backgroundColor: '#ffffff' },
          headerRight: () => <ThemeToggle />
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="Capture" component={CaptureScreen} options={{ title: 'Capture' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Result' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
