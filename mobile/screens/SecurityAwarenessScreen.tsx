
import React, {useState} from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';


const SecurityAwarenessScreen: React.FC = () => {
  const [openTipIndex, setOpenTipIndex] = useState<number | null>(null);

  const toggleTip = (index: number) => {
    setOpenTipIndex(openTipIndex === index ? null : index);
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mb-5 text-center">
          Security Awareness Tips
        </Text>
      </View>
      <Text className="text-xl font-bold mb-3">Security Awareness</Text>
      {[1, 2, 3, 4, 5].map((tip, index) => (
        <View key={tip} className="w-full mb-3">
          <TouchableOpacity
            className="p-3 bg-gray-200"
            onPress={() => toggleTip(index)}
          >
            <Text className="text-base">Tip {tip}</Text>
          </TouchableOpacity>
          {openTipIndex === index && (
            <View className="p-3 bg-gray-100">
              <Text className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tip {tip} details: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default SecurityAwarenessScreen;