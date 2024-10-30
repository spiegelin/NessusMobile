import React, {useState} from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

const OSINTsearch: React.FC = () => (
  <View className="flex-1 p-5">
    <View className="flex-col justify-between items-center w-full mb-5">
      
    <Text style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-6 text-center">OSINT Search</Text>
    </View>
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="URL or IP to scan" />
    <TouchableOpacity className="bg-black p-3 rounded-lg">
      <Text className="text-white text-center">Start Search</Text>
    </TouchableOpacity>
    <View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="mt-6 mb-5 text-center text-gray-700">Search Results</Text>
      <Text>results here</Text>
    </View>
  </View>
);

export default OSINTsearch;