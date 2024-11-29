import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const Settings = () => {
  const [shodanApi, setShodanApi] = useState('');
  const [openAiApi, setOpenAiApi] = useState('');
  const [deHashedApi, setDeHashedApi] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [confirmNewUsername, setConfirmNewUsername] = useState('');
  const [viewMode, setViewMode] = useState<'none' | 'apiKeys' | 'changeCredentials'>('none');

  // Function to handle the API keys submit action
  const handleApiSubmit = () => {
    console.log('Shodan API:', shodanApi);
    console.log('OpenAI API:', openAiApi);
    console.log('DeHashed API:', deHashedApi);
    setShodanApi('');
    setOpenAiApi('');
    setDeHashedApi('');
  };

  // Function to handle the change username submit action
  const handleUsernameSubmit = () => {
    if (newUsername === confirmNewUsername) {
      console.log('New Username:', newUsername);
      // Add additional logic here, like API call to update username
      setNewUsername('');
      setConfirmNewUsername('');
    } else {
      alert('Usernames do not match!');
    }
  };

  // Toggle view mode for API keys and credentials
  const toggleView = (mode: 'apiKeys' | 'changeCredentials') => {
    setViewMode(viewMode === mode ? 'none' : mode);
  };

  return (
    <View className="flex-1 p-5 items-center justify-center">
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
        <Text className="my-2 text-center font-bold mb-11" style={{ fontFamily: 'Vercel-semi', fontSize: 50 }}>
          Settings
        </Text>

        <View className="flex-col space-y-4 mb-6 w-full items-center">
          <TouchableOpacity
            className="bg-black p-3 rounded w-80"
            onPress={() => toggleView('apiKeys')}
          >
            <Text className="text-white text-center" style={{ fontSize: 16, fontFamily: 'Vercel-semi' }}>API Keys</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-black p-3 rounded w-80"
            onPress={() => toggleView('changeCredentials')}
          >
            <Text className="text-white text-center" style={{ fontSize: 16, fontFamily: 'Vercel-semi' }}>Change Credentials</Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'apiKeys' && (
          <>
            <Text className="my-2 text-center font-bold" style={{ fontFamily: 'Vercel-semi', fontSize: 27 }}>
              Enter Shodan API Key
            </Text>
            <TextInput
              className="w-80 max-w-sm h-10 border border-gray-400 rounded mb-3 px-3"
              placeholder="Your Shodan API Key"
              secureTextEntry
              onChangeText={(text) => setShodanApi(text)}
              value={shodanApi}
            />

            <Text className="my-2 text-center font-bold" style={{ fontFamily: 'Vercel-semi', fontSize: 27 }}>
              Enter OpenAI API Key
            </Text>
            <TextInput
              className="w-80 max-w-sm h-10 border border-gray-400 rounded mb-3 px-3"
              placeholder="Your OpenAI API Key"
              secureTextEntry
              onChangeText={(text) => setOpenAiApi(text)}
              value={openAiApi}
            />

            <Text className="my-2 text-center font-bold" style={{ fontFamily: 'Vercel-semi', fontSize: 27 }}>
              Enter DeHashed API Key
            </Text>
            <TextInput
              className="w-80 max-w-sm h-10 border border-gray-400 rounded mb-3 px-3"
              placeholder="Your DeHashed API Key"
              secureTextEntry
              onChangeText={(text) => setDeHashedApi(text)}
              value={deHashedApi}
            />

            <View className="w-full items-center mt-5">
              <TouchableOpacity
                className="bg-black p-3 rounded w-60"
                onPress={handleApiSubmit} // Handle the submit action for API keys
              >
                <Text className="text-white text-center" style={{ fontSize: 13, fontFamily: 'Vercel-semi' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {viewMode === 'changeCredentials' && (
          <View className="flex items-center justify-center p-5">
            <Text style={{ fontFamily: 'Vercel-semi', fontSize: 33 }} className="mb-5 text-center">
              Change Credentials
            </Text>
            
            <TextInput
              className="w-80 max-w-sm h-10 border border-gray-400 rounded mb-3 px-3"
              placeholder="New Username"
              onChangeText={(text) => setNewUsername(text)}
              value={newUsername}
            />
            <TextInput
              className="w-80 max-w-sm h-10 border border-gray-400 rounded mb-3 px-3"
              placeholder="Confirm New Username"
              onChangeText={(text) => setConfirmNewUsername(text)}
              value={confirmNewUsername}
            />

            <View className="w-full items-center mt-5">
              <TouchableOpacity
                className="bg-black p-3 rounded w-60"
                onPress={handleUsernameSubmit} // Handle the submit action for new username
              >
                <Text className="text-white text-center" style={{ fontSize: 13, fontFamily: 'Vercel-semi' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Settings;
