import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const Shodan = () => {
  const [input, setInput] = useState<string>(''); 
  const [result, setResult] = useState<{
    ip: string,
    hostnames: string[],
    ports: number[],
    city: string,
    country: string,
    latlon: string,
    vulnerabilities: Array<{
      cve_id: string,
      cvss: number,
      published_time: string,
      summary: string,
    }>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://10.0.2.2:8000/osint', { target: input });
      console.log({target: input});
      const parsedResults = parseScanResults(response.data);
      setResult(parsedResults);
    } catch (error) {
      console.error('Error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error:', error.response.data);
      } else {
        console.error('Error:', error);
      }
      setResult(null); 
    } finally {
      setLoading(false);
    }
  };

  const parseScanResults = (data: any) => {
    if (!data) return null;
    return {
      ip: data.ip,
      hostnames: data.hostnames,
      ports: data.ports,
      city: data.city,
      country: data.country,
      latlon: data.latlon,
      vulnerabilities: data.vulnerabilities.map((vuln: any) => ({
        cve_id: vuln.cve_id,
        cvss: vuln.cvss,
        published_time: vuln.published_time,
        summary: vuln.summary,
      })),
    };
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
      {loading ? (
        <View className="mt-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-2">Scanning...</Text>
        </View>
      ) : (
        <ScrollView className="mt-6 bg-gray-100 rounded-lg flex-1">
          {result ? (
            <>
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
            </>
          ) : (
            <Text className="text-gray-500 text-center">No results to display.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Shodan;