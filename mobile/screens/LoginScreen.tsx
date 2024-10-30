import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { RootStackParamList } from '../App';

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => (
  <View className="flex items-center justify-center p-5">
    <Text style={{ fontFamily: 'Vercel-semi', fontSize: 60 }} className="mt-20 mb-5 text-center">Security Scanner</Text>
    <Image source={require("../assets/bancoLogo.png")} className="mb-11" />
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Email" />
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Password" secureTextEntry />
    <View className="flex-row justify-around w-full">
      <TouchableOpacity className="bg-gray-500 p-3 rounded-md mt-3" onPress={() => {/*navigation.navigate('Register')*/}}>
        <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-red-500 p-3 rounded-md mt-3" onPress={() => navigation.navigate('Home')}>
        <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Log In</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default LoginScreen;