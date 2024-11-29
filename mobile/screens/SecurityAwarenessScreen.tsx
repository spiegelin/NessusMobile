import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const SecurityAwarenessScreen = () => {
  const [openTipIndex, setOpenTipIndex] = useState<number | null>(null);

  const toggleTip = (index: number) => {
    setOpenTipIndex(openTipIndex === index ? null : index);
  };

  const tips = [
    {
      title: 'Password Management', content: 'Use strong, unique passwords and enable two-factor authentication (2FA) wherever possible.',
    },
    {
      title: 'Email Security', content: 'Be cautious with email links and attachments. Avoid sharing sensitive information via email.',
    },
    {
      title: 'Software Updates', content: 'Regularly update all software and systems to patch vulnerabilities. Automate updates when possible.',
    },
    {
      title: 'Network Security', content: 'Use firewalls and intrusion detection systems. Segment your network to limit exposure in case of a breach.',
    },
    {
      title: 'Phishing Awareness', content: 'Train employees to recognize phishing attempts. Encourage reporting suspicious emails to the IT department.',
    },
  ];

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 42 }} className=" flex mb-5 text-center justify-center">
          Security Awareness Tips
        </Text>
      </View>
      {tips.map((tip, index) => (
        <View key={index} className="w-full mb-3">
          <TouchableOpacity
            className="p-3 bg-gray-200"
            onPress={() => toggleTip(index)}
          >
            <Text style={{ fontFamily: 'Vercel-semi', fontSize: 23 }} >{tip.title}</Text>
          </TouchableOpacity>
          {openTipIndex === index && (
            <View className="p-3 bg-gray-100">
              <Text style={{ fontFamily: 'Vercel-semi', fontSize: 18 }} className="text-gray-700">{tip.content}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default SecurityAwarenessScreen;
