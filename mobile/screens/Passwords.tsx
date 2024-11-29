import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Passwords = () => {
  const [input, setInput] = useState<string>(''); 
  const [result, setResult] = useState(null); 
  const [loading, setLoading] = useState<boolean>(false); 

  const handleScan = async () => {
    setLoading(true);
    setResult(null);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'http://10.0.2.2:3000/process-link-passwords',
        { target: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setResult(response.data.fastapi_response);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
        
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 55}} className="mt-20 mb-5 text-center">Passwords Scan</Text>
      </View>
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="URL or IP to scan"
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity
        className="bg-black p-3 rounded-lg"
        onPress={handleScan}
        disabled={loading}
      >
        <Text className="text-white text-center">
          {loading ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>
      {loading && (
        <View className="mt-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-2">Scanning...</Text>
        </View>
      )}
      {result && (
        <ScrollView className="mt-6 bg-gray-100 rounded-lg flex-1">
              {/* Organización */}
              <Text className="text-lg font-bold text-center mb-4">{`Results}`}</Text>
              <View className="mb-5">
                <Text className="text-xl font-bold">General Information</Text>
                {result.balance && <Text>{`Balance: ${result.balance}`}</Text>}
                {Array.isArray(result.entries) && result.entries.map((entry, index) => (
                  <View key={index} className="mt-3">
                    {entry.id && <Text>{`ID: ${entry.id}`}</Text>}
                    {entry.email && <Text>{`Email: ${entry.email}`}</Text>}
                    {entry.ip_address && <Text>{`IP Address: ${entry.ip_address}`}</Text>}
                    {entry.username && <Text>{`Username: ${entry.username}`}</Text>}
                    {entry.password && <Text>{`Password: ${entry.password}`}</Text>}
                    {entry.hashed_password && <Text>{`Hashed Password: ${entry.hashed_password}`}</Text>}
                    {entry.name && <Text>{`Name: ${entry.name}`}</Text>}
                    {entry.vin && <Text>{`VIN: ${entry.vin}`}</Text>}
                    {entry.address && <Text>{`Address: ${entry.address}`}</Text>}
                    {entry.phone && <Text>{`Phone: ${entry.phone}`}</Text>}
                    {entry.database_name && <Text>{`Database Name: ${entry.database_name}`}</Text>}
                  </View>
                ))}
              </View>
        </ScrollView>
      )}
    </View>
  );
}

export default Passwords;