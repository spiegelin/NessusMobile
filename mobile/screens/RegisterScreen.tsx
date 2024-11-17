import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import axios from 'axios';

type RegisterScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else if (!username) {
      setError('Please fill in a username');
    } else {
      setError('');      
    }
    try {
      const response = await axios.post(`${proccess.env.IP}/register`, {
        email,
        username,
        password
    });
      if (response.status === 201) {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex items-center justify-center p-5">
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 60 }} className="mt-20 mb-5 text-center">
        Security Scanner
      </Text>
      <Image source={require("../assets/bancoLogo.png")} className="mb-11" />
      <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword}/>
      {error ? <Text className="text-red-500 mb-3">{error}</Text> : null}
      <View className="flex-row justify-around w-full">
        <TouchableOpacity className="bg-red-500 p-3 rounded-md mt-3" onPress={handleRegister}>
          <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;
