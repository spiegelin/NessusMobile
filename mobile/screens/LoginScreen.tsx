import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { RootStackParamList } from '../App';
import * as SecureStore from 'expo-secure-store';

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${proccess.env.IP}/login`, { email, password });
      const token = response.data.token;
  
      if (token) {
        await SecureStore.setItemAsync('authToken', token);
        //console.error("Token:", token);
        //SecureStore.getItemAsync('authToken').then(console.error);
  
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert("Login Failed", "Please check your email and password.");
      console.error("Login error:", error.response || error.message);
    }
  };

  return (
    <View className="flex items-center justify-center p-5">
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 60 }} className="mt-20 mb-5 text-center">Security Scanner</Text>
      <Image source={require("../assets/bancoLogo.png")} className="mb-11" />
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View className="flex-row justify-around w-full">
        <TouchableOpacity className="bg-gray-500 p-3 rounded-md mt-3" onPress={() => navigation.navigate('Register')}>
          <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-red-500 p-3 rounded-md mt-3" onPress={handleLogin}>
          <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;