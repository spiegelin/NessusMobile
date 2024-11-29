import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BasicScanScreen from './screens/BasicScanScreen';
import ViewReportsScreen from './screens/ViewReportsScreen';
import SecurityAwarenessScreen from './screens/SecurityAwarenessScreen';

import AdvancedScans from './screens/AdvancedScan';
import OSINT from './screens/OSINTsearch';
import RegisterScreen from './screens/RegisterScreen';
import HostDiscovery from './screens/HostDiscovery';
import WebAppScan from './screens/WebAppScan';
import MalwareScan from './screens/MalwareScan';
import Settings from './screens/Settings';  
import Passwords from './screens/Passwords';
import Shodan from './screens/Shodan';
import Socials from './screens/Socials';
import Crawl from './screens/Crawl';

// Define the types for our navigation parameters
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  BasicScan: undefined;
  ViewReports: undefined;
  SecurityAwareness: undefined;
  AdvancedScans: undefined;
  OSINT: undefined;
  WebAppScan: undefined;
  MalwareScan: undefined;
  HostDiscovery: undefined;
  Settings: undefined;
  Passwords: undefined;
  Shodan : undefined;
  Socials : undefined;
  Crawl : undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  let [fontsLoaded] = useFonts({
    "Roboto": require("./assets/fonts/Roboto-Regular.ttf"),
    "Afacad": require("./assets/fonts/AfacadFlux-VariableFont_slnt,wght.ttf"),
    "Vercel": require("./assets/fonts/Geist-Regular-BF6569491e3eff1.otf"),
    "Vercel-semi": require("./assets/fonts/Geist-SemiBold-BF6569491e8c368.otf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>
  }
  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        
        <Stack.Screen name="BasicScan" component={BasicScanScreen} />
        <Stack.Screen name="ViewReports" component={ViewReportsScreen} />
        <Stack.Screen name="SecurityAwareness" component={SecurityAwarenessScreen} />

        <Stack.Screen name="OSINT" component={OSINT} />
        <Stack.Screen name='Passwords' component={Passwords} />
        <Stack.Screen name='Socials' component={Socials} />
        <Stack.Screen name='Crawl' component={Crawl} />
        <Stack.Screen name='Shodan' component={Shodan} />


        <Stack.Screen name="Settings" component={Settings} />

        <Stack.Screen name="AdvancedScans" component={AdvancedScans} />
        <Stack.Screen name="WebAppScan" component={WebAppScan} />
        <Stack.Screen name="MalwareScan" component={MalwareScan} />
        <Stack.Screen name="HostDiscovery" component={HostDiscovery} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
