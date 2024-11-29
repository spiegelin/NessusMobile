import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const Crawl = () => {
  const [input, setInput] = useState<string>(''); 
  const [result, setResult] = useState<{
    endpoints: string[],
    robots_txt: Array<{
      Allow: string[],
      Disallow: string[],
    }>;
    extra_info: string[];
  } | null>(null); 
  const [loading, setLoading] = useState<boolean>(false); 

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://10.0.2.2:8000/crawl', { target: input });
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
      endpoints: data.endpoints,
      robots_txt: data.robots_txt.map((robot: any) => ({
        Allow: robot.Allow,
        Disallow: robot.Disallow,
      })),
      extra_info: data.extra_info,
    };
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 60 }} className="mt-20 mb-5 text-center">Crawl</Text>
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
                {result.endpoints && <Text>{`Endpoints: ${result.endpoints}`}</Text>}
                {result.robots_txt && (
                  <View>
                    <Text className="text-xl font-bold">Robots.txt</Text>
                    {result.robots_txt.map((robot, index) => (
                      <View key={index}>
                        <Text>{`Allow: ${robot.Allow}`}</Text>
                        <Text>{`Disallow: ${robot.Disallow}`}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {result.extra_info && (
                  <View>
                    <Text className="text-xl font-bold">Extra Information</Text>
                    {result.extra_info.map((info, index) => (
                      <Text key={index}>{info}</Text>
                    ))}
                  </View>
                )}
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

export default Crawl;