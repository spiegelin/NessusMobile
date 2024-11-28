import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { RootStackParamList } from '../App';

type AdvancedScanProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OSINT'>;
};

const OSINT = ({ navigation }: AdvancedScanProps) => {
  const advancedScanTools = [
    { name: 'Passwords' , image : require('../assets/bancoCogs.jpg') , desc : "discord" },
    { name: 'Socials', image: require('../assets/bancoCogs.jpg') ,desc : "discord"},
    { name: 'Crawl', image: require('../assets/bancoCogs.jpg') , desc : "discord"},
    { name: 'Shodan', image: require('../assets/bancoCogs.jpg') , desc : "discord"},
   
  ];
 
  return (
    <View className="flex p-5 items-center">
      <View className="flex-col justify-between items-center w-full ">
        <Text style={{ fontFamily: "Vercel-semi", fontSize: 40 }} className="text-center">OSINT</Text>
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

export default OSINT;