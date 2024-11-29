import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const WebAppScan = () => {
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
        'http://10.0.2.2:3000/process-link-web',
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
      <TouchableOpacity
        className="bg-black p-3 rounded-lg"
        onPress={handleScan}
        disabled={loading}
      >
        <Text className="text-white text-center" style={{ fontFamily: 'Vercel-semi'}}>
          {loading ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>
      {loading && (
        <View className="mt-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-2" style={{ fontFamily: 'Vercel-semi'}}>Scanning...</Text>
        </View>
      )}
      {result && ( 
        <ScrollView className="mt-6 bg-gray-100 p-4 rounded-lg flex-1">
              <Text className="" style={{ fontFamily: 'Vercel', fontSize: 10 }}>{`Generated: ${result.generated}`}</Text>
              {result.sites.map((site, index) => (
                <View key={index} className="mb-5">
                  <Text className="" style={{ fontFamily: 'Vercel-semi', fontSize: 25 }}>{`Site: ${site.name}`}</Text>
                  {site.alerts.map((alert, alertIndex) => (
                    <View key={alertIndex} className="mt-3">
                      <Text className="font-semibold" style={{ fontFamily: 'Vercel-semi', fontSize: 18 }}>{`Alert: ${alert.alert}`}</Text>
                      
                      <Text style={{ fontFamily: 'Vercel', fontSize: 12 }} className="my-2">{`Confidence: ${alert.confidence}`}</Text>
                      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 18  }}>{`Risk: ${alert.riskdesc}`}</Text>
                      <Text className="my-2" style={{ fontFamily: 'Vercel', fontSize: 14 }} >{`Description: ${alert.desc}`}</Text>
                      <Text className="my-2" style={{ fontFamily: 'Vercel-semi', fontSize: 14 }}>Instances:</Text>
                      {alert.instances.map((instance: { uri: any; attack: any ; evidence: any; otherinfo: any; }, instanceIndex: React.Key | null | undefined) => (
                        <View key={instanceIndex} className="ml-2">
                          <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`- URI: ${instance.uri}`}</Text>
                          <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`  Attack: ${instance.attack}`}</Text>
                          <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`  Evidence: ${instance.evidence}`}</Text>
                          <Text className="mb-2" style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`  Other Info: ${instance.otherinfo}`}</Text>
                        </View>
                      ))}
                      <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`CWE ID: ${alert.cweid}`}</Text>
                      <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`WASC ID: ${alert.wascid}`}</Text>
                    </View>
                  ))}
                </View>
              ))}
        </ScrollView>
      )}
    </View>
  );
};

export default WebAppScan;
