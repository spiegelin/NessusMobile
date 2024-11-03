import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts } from 'expo-font';


const AdvancedScan = () => (
  <View className="flex-1 p-5">
    <View className="flex-col justify-between items-center w-full mb-6">
      
    <Text style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">Advanced Scan</Text>
    </View>
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="URL or IP to scan" />
    <TouchableOpacity className="bg-black p-3 rounded-lg">
      <Text className="text-white text-center">Start Scan</Text>
    </TouchableOpacity>
    <View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="mt-6 mb-5 text-center text-gray-700">Scan Results and Vulnerabilities</Text>
      <Text>results here</Text>
    </View>
  </View>
);

export default AdvancedScan;