import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { RootStackParamList } from '../App';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const scanTools = [
    { name: 'Basic Scan', image: require('../assets/bancoLifeline2.png') , desc : "ARBOLITERS GO"},
    { name: 'Advanced Scan', image: require('../assets/bancoCogs.jpg') ,desc : "sample description bork chen"},
    { name: 'OSINT search', image: require('../assets/bancoWeb.png') , desc : "sample description bork chen"},
    { name: 'View Reports', image: require('../assets/bancoReports4.png') , desc : "sample description bork chen"},
    { name: 'Scan History', image: require('../assets/bancoHistory.png') , desc : "sample description bork chen"},
    { name: 'Security Awareness', image: require('../assets/bancoSecurityAware.png') , desc : "sample description bork chen"},
  ];
 
  return (
    <View className="flex p-5 items-center">
      <View className="flex-col justify-between items-center w-full ">
        <Text style={{ fontFamily: "Vercel-semi", fontSize: 40 }} className="text-center">Security Scanner</Text>
      </View>
      <Text style={{ fontFamily: "Vercel-semi", fontSize: 25 }} className="text-xl font-bold mb-1 text-gray-700" >Tools</Text>
      <View className="flex-row flex-wrap justify-around">
        {scanTools.map((tool, index) => (
          <TouchableOpacity
            key={index}
            className="w-[45%] bg-black rounded-lg p-5 m-1 items-center shadow-xl shadow-black"
            onPress={() => navigation.navigate(tool.name.replace(' ', '') as keyof RootStackParamList)}>
            <Image source={tool.image} className="w-[90%] h-28 mb-2" />
            <Text className="text-center text-white" style={{ fontFamily: "Vercel-semi", fontSize: 15 }}>{tool.name}</Text>
            <Text className="text-center text-gray-400 mt-2" style={{ fontFamily: "Vercel-semi", fontSize: 10 }}>{tool.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;