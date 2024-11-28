import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';

const Settings = () => {
  const [shodanApi, setShodanApi] = useState('');
  const [openAiApi, setOpenAiApi] = useState('');
  const [deHashedApi, setDeHashedApi] = useState('');

  return (
    <View className="flex p-5 items-center">
      <ScrollView>
        <Text className="my-2 text-center font-bold" style={{ fontFamily: "Vercel-semi", fontSize: 50 }}>
          Settings
        </Text>

        <Text className="my-2 text-center font-bold" style={{ fontFamily: "Vercel-semi", fontSize: 30 }}>
          Enter Shodan API Key
        </Text>
        <TextInput
          className="h-10 border border-gray-400 rounded mb-3 px-3"
          placeholder="Your Shodan API Key"
          onChangeText={(text) => setShodanApi(text)}
          value={shodanApi}
        />

        <Text className="my-2 text-center font-bold" style={{ fontFamily: "Vercel-semi", fontSize: 30 }}>
          Enter OpenAI API Key
        </Text>
        <TextInput
          className="h-10 border border-gray-400 rounded mb-3 px-3"
          placeholder="Your OpenAI API Key"
          onChangeText={(text) => setOpenAiApi(text)}
          value={openAiApi}
        />

        <Text className="my-2 text-center font-bold" style={{ fontFamily: "Vercel-semi", fontSize: 30 }}>
          Enter DeHashed API Key
        </Text>
        <TextInput
          className="h-10 border border-gray-400 rounded mb-3 px-3"
          placeholder="Your DeHashed API Key"
          onChangeText={(text) => setDeHashedApi(text)}
          value={deHashedApi}
        />
      </ScrollView>
    </View>
  );
};

export default Settings;
