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
        
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 50 }} className=" text-center">Shodan Scan</Text>
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
        <Text style={{fontFamily: 'Vercel-semi'}} className="text-white text-center">
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
              <View className="mb-5 ">
                {result.ip && <Text style={{fontFamily: 'Vercel-semi', fontSize: 20}} className="rounded-lg p-2 bg-black text-center text-white">{`${result.ip}`}</Text>}
                {result.hostnames && (
                <View className="rounded-lg border-2 border-gray-400 bg-gray-200 p-2 mt-2 ">
                  <Text style={{ fontFamily: 'Vercel-semi' }} className="my-2 bg-black p-2 text-white rounded-lg text-center">
                    Hostnames
                  </Text>
                  <View className="flex flex-wrap flex-row">
                    {result.hostnames.map((hostname, index) => (
                      <Text
                        key={index}
                        style={{ fontFamily: 'Vercel' }}  
                        className="bg-gray-700 p-2 text-center text-white m-1 rounded"
                      >
                        {hostname}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

                {result.ports && (
                  <View className="rounded-lg border-2 border-gray-400 bg-gray-200 p-2 mt-2">
                    <Text style={{ fontFamily: 'Vercel-semi' }} className="my-2 bg-black p-2 text-white rounded-lg text-center">
                      Ports
                    </Text>
                    <View className="flex flex-wrap flex-row">
                      {result.ports.map((port, index) => (
                        <Text
                          key={index}
                          style={{ fontFamily: 'Vercel' }}
                          className="bg-gray-700 p-2 text-center text-white m-1 rounded"
                        >
                          {port}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {result.city && <Text style={{fontFamily: 'Vercel-semi'}} className="mt-2">{`City: ${result.city}`}</Text>}
                {result.country && <Text style={{fontFamily: 'Vercel-semi'}} className="">{`Country: ${result.country}`}</Text>}
                {result.latlon && <Text style={{fontFamily: 'Vercel-semi'}} className="">{`LatLon: ${result.latlon}`}</Text>}
                <Text style={{fontFamily: 'Vercel-semi', fontSize: 20}} className="mt-4 bg-black p-2 text-white rounded-lg text-center">Vulnerabilities</Text>
                {result.vulnerabilities.map((vuln, index) => (
                  <View key={index} className="mt-3">
                    {vuln.cve_id && <Text style={{fontFamily: 'Vercel-semi'}} className="my-2">{`CVE ID: ${vuln.cve_id}`}</Text>}
                    {vuln.cvss && <Text style={{fontFamily: 'Vercel-semi'}} className="mb-2">{`CVSS: ${vuln.cvss}`}</Text>}
                    {vuln.published_time && <Text style={{fontFamily: 'Vercel'}} className="font-semibold">{`Published Time: ${vuln.published_time}`}</Text>}
                    {vuln.summary && <Text style={{fontFamily: 'Vercel'}} className="font-semibold">{`Summary: ${vuln.summary}`}</Text>}
                  </View>
                ))}
              </View>
        </ScrollView>
      )}
    </View>
  );
}

export default Shodan;