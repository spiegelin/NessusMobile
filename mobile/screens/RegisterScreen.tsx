import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type RegisterScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (password === confirmPassword) {
      navigation.navigate('Home');
    } else {
      setError('Passwords do not match');
    }
  };

  return (
    <View className="flex items-center justify-center p-6">
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 60 }} className="mt-20 mb-5 text-center">
        Security Scanner
      </Text>
      <Image source={require("../assets/bancoLogo.png")} className="mb-11" />
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="Email"
      />
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
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
