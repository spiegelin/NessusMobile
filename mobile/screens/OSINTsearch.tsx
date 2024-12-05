import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const OSINTsearch = () => {
  const [input, setInput] = useState(''); // Estado para el input
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(''); // Estado de error
  const [results, setResults] = useState(null); // Estado de resultados

  const handleSearch = async () => {
    if (!input.trim()) {
      Alert.alert('Input Error', 'Please provide a valid URL or IP.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const userId = '123'; // Aquí deberías obtener el `userId` autenticado dinámicamente
      const response = await axios.post('http://10.0.2.2:8000/socials', {
        target: input.trim()},
        { headers: { Authorization: `Bearer ${userId}` } }
      );

      setResults(response.data);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error:', err.message);
        setError((err as any).response?.data?.error || 'An error occurred.');
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-5">
      {/* Título */}
      <View className="flex items-center mb-5">
        <Text className="text-4xl font-semibold mt-10 text-center">OSINT Search</Text>
      </View>

      {/* Input */}
      <TextInput
        className="w-full h-12 border border-gray-300 rounded px-3 mb-4"
        placeholder="URL or IP to scan"
        value={input}
        onChangeText={setInput}
      />

      {/* Botón */}
      <TouchableOpacity
        className="bg-black py-3 rounded-lg"
        onPress={handleSearch}
      >
        <Text className="text-white text-center text-lg font-medium">Start Search</Text>
      </TouchableOpacity>

      {/* Indicador de carga */}
      {loading && (
        <View className="mt-4 flex items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      {/* Error */}
      {error && (
        <Text className="mt-4 text-center text-red-500 text-sm">{error}</Text>
      )}

      {/* Resultados */}
      <ScrollView className="mt-6 bg-gray-100 p-4 rounded-lg flex-1">
        <Text className="text-2xl font-semibold text-gray-700 mb-4 text-center">Search Results</Text>
        {results ? (
          <Text className="text-sm text-gray-800">{JSON.stringify(results, null, 2)}</Text>
        ) : (
          <Text className="text-gray-500 text-center">Results will appear here.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default OSINTsearch;