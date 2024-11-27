import React, { useState, useEffect } from 'react';
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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // Tiempo restante en ms

  const MAX_ATTEMPTS = 3;
  const BLOCK_TIME = 5 * 60 * 1000; // 5 minutos en ms

  // Recuperar estado al iniciar
  useEffect(() => {
    const fetchBlockData = async () => {
      const storedBlockedUntil = await SecureStore.getItemAsync('blockedUntil');
      if (storedBlockedUntil) {
        const blockedUntil = parseInt(storedBlockedUntil, 10);
        const currentTime = Date.now();
        if (currentTime < blockedUntil) {
          setIsBlocked(true);
          setRemainingTime(blockedUntil - currentTime);
        } else {
          await SecureStore.deleteItemAsync('blockedUntil'); // Limpia datos si ya expiró
        }
      }
    };

    fetchBlockData();
  }, []);

  // Temporizador
  useEffect(() => {
    if (isBlocked) {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1000) {
            clearInterval(interval);
            setIsBlocked(false);
            setFailedAttempts(0);
            SecureStore.deleteItemAsync('blockedUntil'); // Limpia datos al desbloquear
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isBlocked]);

  const handleLogin = async () => {
    if (isBlocked) {
      Alert.alert("Bloqueado", "Has alcanzado el límite de intentos. Intenta más tarde.");
      return;
    }

    try {
      const response = await axios.post(`http://10.0.2.2:3000/login`, { email, password });
      const token = response.data.token;

      if (token) {
        await SecureStore.setItemAsync('authToken', token);
        navigation.navigate('Home');
      }
    } catch (error) {
      setFailedAttempts((prev) => prev + 1);

      if (failedAttempts + 1 >= MAX_ATTEMPTS) {
        const blockEndTime = Date.now() + BLOCK_TIME;
        setIsBlocked(true);
        setRemainingTime(BLOCK_TIME);

        await SecureStore.setItemAsync('blockedUntil', blockEndTime.toString());

        Alert.alert("Bloqueado", `Demasiados intentos fallidos. Intenta de nuevo en 5 minutos.`);
      } else {
        Alert.alert("Error", "Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
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
      {isBlocked && (
        <Text className="text-red-500 mb-3">
          Bloqueado. Tiempo restante: {formatTime(remainingTime)}
        </Text>
      )}
      <View className="flex-row justify-around w-full">
        <TouchableOpacity className="bg-gray-500 p-3 rounded-md mt-3" onPress={() => navigation.navigate('Register')}>
          <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`p-3 rounded-md mt-3 ${isBlocked ? 'bg-gray-400' : 'bg-red-500'}`}
          onPress={handleLogin}
          disabled={isBlocked}
        >
          <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;