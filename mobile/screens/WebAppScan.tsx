import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';

const WebAppScan = () => {
  const [input, setInput] = useState(''); // State for user input
  const [result, setResult] = useState(''); // State for scan results

  const handleScan = async () => {
    try {
      const response = await axios.post('http://localhost:3000/webappscan', { input });
      setResult(response.data.message); // Update result state with server response
    } catch (error) {
      console.error('Error:', error);
      setResult('Failed to get results. Please try again.');
    }
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">
          Web App Scan
        </Text>
      </View>
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="URL or IP to scan"
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity className="bg-black p-3 rounded-lg" onPress={handleScan}>
        <Text className="text-white text-center">Start Scan</Text>
      </TouchableOpacity>
      <View>
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="mt-6 mb-5 text-center text-gray-700">
          Scan Results and Vulnerabilities
        </Text>
        <Text>{result}</Text>
      </View>
    </View>
  );
};

export default WebAppScan;
