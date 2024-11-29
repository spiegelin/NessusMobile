import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { RootStackParamList } from '../App';

type AdvancedScanProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AdvancedScans'>;
};

const AdvancedScans = ({ navigation }: AdvancedScanProps) => {
  const advancedScanTools = [
    { name: 'Basic Scan' , image : require('../assets/bancoLifeline2.png') , desc : "Perform a quick vulnerability scan for immediate insights." },
    { name: 'Host Discovery', image: require('../assets/bancoCogs.jpg') ,desc : "Host Discovery is a tool that scans a network for active hosts and devices."},
    { name: 'Malware Scan', image: require('../assets/bancoCogs.jpg') , desc : "Malware Scan is a tool that scans files and directories for malware and viruses."},
   
  ];
 
  return (
    <View className="flex p-5 items-center">
      <View className="flex-col justify-between items-center w-full ">
        <Text style={{ fontFamily: "Vercel-semi", fontSize: 40 }} className="text-center">Advanced Scanning</Text>
      </View>
      <Text style={{ fontFamily: "Vercel-semi", fontSize: 25 }} className="text-xl font-bold mb-1 text-gray-700" >Tools</Text>
      <View className="flex-row flex-wrap justify-around">
        {advancedScanTools.map((tool, index) => (
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

export default AdvancedScans;