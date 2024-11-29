import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
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
  const [remainingTime, setRemainingTime] = useState(0);
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false); // Nuevo estado

  const MAX_ATTEMPTS = 3;
  const BLOCK_TIME = 5 * 60 * 1000; // 5 minutos en ms
   
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

  const handleSendOtp = async () => {
    try {
      const response = await axios.post('http://localhost:3000/send-otp', { email });
      if (response.data.success) {
        setIsOtpSent(true);
        Alert.alert('OTP Enviado', 'Revisa tu correo electrónico.');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al enviar el OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:3000/verify-otp', { email, otp });
      if (response.data.success) {
        const token = response.data.token;
        setShowOtpModal(false);
        setIsOtpVerified(true);
  
        // Guarda el token en AsyncStorage u otro método
        Alert.alert('Éxito', 'OTP verificado. Puedes continuar.');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al verificar el OTP.');
    }
  };
  
 
  const handleLogin = async () => {
    if (isBlocked) {
      Alert.alert("Bloqueado", "Has alcanzado el límite de intentos. Intenta más tarde.");
      return;
    }

    if (!isOtpVerified) {
      // Mostrar modal de OTP solo si no ha sido verificado
      setShowOtpModal(true);
      return;
    }
    
    console.log("llega aquu");
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
    <View className="flex-1 justify-center p-5">
      <Text className="text-6xl font-semibold text-center mt-20 mb-5">Security Scanner</Text>
      <TextInput
        className="w-full h-12 border border-gray-400 rounded mb-3 px-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full h-12 border border-gray-400 rounded mb-3 px-4"
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
      <TouchableOpacity
          className={`p-3 rounded-md mt-3 ${isBlocked ? 'bg-gray-400' : 'bg-red-500'}`}
          onPress={handleLogin}
          disabled={isBlocked}
        >
          <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Log In</Text>
        </TouchableOpacity>

      {/* OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-8 rounded-lg w-4/5">
            <Text className="text-2xl font-semibold text-center mb-4">Verificar OTP</Text>
            <TextInput
              className="w-full h-12 border border-gray-400 rounded mb-4 px-4"
              placeholder="Ingresa tu OTP"
              value={otp}
              onChangeText={setOtp}
            />
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="bg-green-500 p-3 rounded-md"
                onPress={handleSendOtp}
              >
                <Text className="text-white text-center">Enviar OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 p-3 rounded-md"
                onPress={handleVerifyOtp}
              >
                <Text className="text-white text-center">Verificar OTP</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-gray-400 p-3 rounded-md w-full"
              onPress={() => setShowOtpModal(false)}
            >
              <Text className="text-white text-center">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;
