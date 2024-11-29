import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Socials = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
        'http://10.0.2.2:3000/process-link',
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
      {/* Header */}
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">
        Socials Scan
      </Text>

      {/* Input Field */}
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="URL or IP to scan"
        value={input}
        onChangeText={setInput}
      />

      {/* Scan Button */}
      <TouchableOpacity
        className="bg-black p-3 rounded-lg"
        onPress={handleScan}
        disabled={loading}
      >
        <Text style={{fontFamily: 'Vercel-semi'}} className="text-white text-center">
          {loading ? 'Scanning...' : 'Start Scan'}
        </Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && (
        <View className="mt-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-2">Scanning...</Text>
        </View>
      )}

      {/* Results */}
      {result && (
        <ScrollView className="mt-6 bg-gray-100 rounded-lg flex-1 p-3">
          {/* Organization Info */}
          <Text style={{fontFamily: 'Vercel-semi', fontSize: 30}} className="">{`Organization: ${result.organization_info.name}`}</Text>
          <View className="mb-5">
            <Text style={{fontFamily: 'Vercel-semi', fontSize: 25}} className="">General Information</Text>
            <Text>{`Domain: ${result.organization_info.domain}`}</Text>
            <Text>{`Description: ${result.organization_info.description}`}</Text>
            <Text>{`Industry: ${result.organization_info.industry}`}</Text>
            <Text>{`Size: ${result.organization_info.size}`}</Text>
            <Text>{`Country: ${result.organization_info.country || 'N/A'}`}</Text>
            <Text>{`City: ${result.organization_info.city || 'N/A'}`}</Text>
            <Text>{`State: ${result.organization_info.state || 'N/A'}`}</Text>
            <Text>{`Street: ${result.organization_info.street || 'N/A'}`}</Text>

            <Text style={{fontFamily: 'Vercel-semi'}} className=" mt-2">Socials:</Text>
            <Text style={{fontFamily: 'Vercel'}}>{`Twitter: ${result.organization_info.twitter || 'N/A'}`}</Text>
            <Text style={{fontFamily: 'Vercel'}}>{`Facebook: ${result.organization_info.facebook || 'N/A'}`}</Text>
            <Text style={{fontFamily: 'Vercel'}}>{`LinkedIn: ${result.organization_info.linkedin || 'N/A'}`}</Text>
            <Text style={{fontFamily: 'Vercel'}}>{`Instagram: ${result.organization_info.instagram || 'N/A'}`}</Text>
          </View>

          {/* Employees Info */}
          <Text style={{fontFamily: 'Vercel-semi', fontSize: 25}} className="my-5">Employees</Text>
          {result.employees.map((employee, index) => (
            <View key={index} className="mt-3 p-3 border border-gray-300 rounded">
              <Text style={{fontFamily: 'Vercel-semi', fontSize: 20}} className="">{`Name: ${employee.name}`}</Text>
              <Text style={{fontFamily: 'Vercel'}}>{`Position: ${employee.position || 'N/A'}`}</Text>
              <Text style={{fontFamily: 'Vercel'}}>{`Department: ${employee.department || 'N/A'}`}</Text>
              <Text style={{fontFamily: 'Vercel'}}>{`Emails: ${employee.emails.join(', ')}`}</Text>
              <Text style={{fontFamily: 'Vercel'}}>{`LinkedIn: ${employee.socials.linkedin || 'N/A'}`}</Text>
              <Text style={{fontFamily: 'Vercel'}}>{`Twitter: ${employee.socials.twitter || 'N/A'}`}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Socials; 