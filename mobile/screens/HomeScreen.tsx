import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { RootStackParamList } from '../App';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};


const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const scanTools = [
    { name: 'WebApp Scan', image : require('../assets/bancoTarget.png') , desc : "Identify Web Application vulnerabilities and security issues." },
    { name: 'Advanced Scans', image: require('../assets/bancoAdvanced.png') ,desc : "Dive deeper into vulnerabilities with different scanners."},
    { name: 'OSINT', image: require('../assets/bancoWeb.png') , desc : "Gather publicly available data to enhance threat analysis." },
    { name: 'View Reports', image: require('../assets/bancoArchive.png') , desc : "Access detailed scan reports for review and decision-making." },
    { name: 'Security Awareness', image: require('../assets/bancoSecurityAwareness.png') , desc : "Learn best practices to strengthen your security posture." },
    { name: 'Settings' , image: require('../assets/bancoCogs.jpg') , desc : "Customize your security scanner settings." },
  ];



  return (
    <View className="flex p-5 items-center">
      <ScrollView>
        
          
        
      <View className="flex-col justify-between items-center w-full ">
        <Text style={{ fontFamily: "Vercel-semi", fontSize: 40 }} className="text-center">Security Scanner</Text>
      </View>
      <Text style={{ fontFamily: "Vercel-semi", fontSize: 25 }} className="text-xl font-bold mb-1 text-gray-700 text-center" >Tools</Text>
      <View className="flex-row flex-wrap justify-around">
        {scanTools.map((tool, index) => (
          <TouchableOpacity
            key={index}
            className="w-[45%] bg-black rounded-lg p-5 m-1 items-center shadow-sm shadow-black"
            onPress={() => navigation.navigate(tool.name.replace(' ', '') as keyof RootStackParamList)}>
            <Image source={tool.image} className="w-[90%] h-28 mb-2" />
            <Text className="text-center text-white" style={{ fontFamily: "Vercel-semi", fontSize: 15 }}>{tool.name}</Text>
            <Text className="text-center text-gray-400 mt-2" style={{ fontFamily: "Vercel-semi", fontSize: 10 }}>{tool.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;