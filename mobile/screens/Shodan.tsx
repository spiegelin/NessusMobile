import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Shodan = () => {
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
        'http://10.0.2.2:3000/process-link-shodan',
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
        
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 50 }} className="mt-20 mb-5 text-center">Shodan Scan</Text>
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
                {result.ip && <Text>{`IP: ${result.ip}`}</Text>}
                {result.hostnames && <Text>{`Hostnames: ${result.hostnames}`}</Text>}
                {result.ports && <Text>{`Ports: ${result.ports.join(", ")}`}</Text>}
                {result.city && <Text>{`City: ${result.city}`}</Text>}
                {result.country && <Text>{`Country: ${result.country}`}</Text>}
                {result.latlon && <Text>{`LatLon: ${result.latlon}`}</Text>}
                <Text className="font-semibold mt-2">Vulnerabilities:</Text>
                {result.vulnerabilities.map((vuln, index) => (
                  <View key={index} className="mt-3">
                    {vuln.cve_id && <Text className="font-semibold">{`CVE ID: ${vuln.cve_id}`}</Text>}
                    {vuln.cvss && <Text className="font-semibold">{`CVSS: ${vuln.cvss}`}</Text>}
                    {vuln.published_time && <Text className="font-semibold">{`Published Time: ${vuln.published_time}`}</Text>}
                    {vuln.summary && <Text className="font-semibold">{`Summary: ${vuln.summary}`}</Text>}
                  </View>
                ))}
              </View>
        </ScrollView>
      )}
    </View>
  );
}

export default Shodan;