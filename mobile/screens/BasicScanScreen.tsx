import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

const BasicScanScreen = () => {
  const [input, setInput] = useState(''); // Estado para el valor del input
  const [loading, setLoading] = useState(false); // Estado para el ActivityIndicator

  const load = () => {
    setLoading(true);
  }

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 43 }} className="mt-20 mb-5 text-center">
          Basic Scan
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
        onPress={load}
        disabled={loading}
      >
        <Text className="text-white text-center" style={{ fontFamily: 'Vercel-semi'}}>
          {loading ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>
      {loading && (
        <View className="mt-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-2">Loading...</Text>
        </View>
      )}
    </View>
  );
};

export default BasicScanScreen;