import React, {useState} from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';


const ScanHistory = () => {
  const reports = [
    { name: 'Report 1', details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { name: 'Report 2', details: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    { name: 'Report 3', details: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
  ];

  const [openReportIndex, setOpenReportIndex] = useState<number | null>(null);

  const toggleReport = (index: number) => {
    setOpenReportIndex(openReportIndex === index ? null : index);
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-5">
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 45 }} className="mb-5 text-center">
          Scan History
        </Text>
      </View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="text-gray-700 mb-3">
        Latest Reports
      </Text>
      {reports.map((report, index) => (
        <View key={index} className="w-full mb-4">
          <View className="flex-row justify-between items-center p-3 bg-gray-200">
            <Text className="text-base">{report.name}</Text>
            <TouchableOpacity
              className="bg-black p-2 rounded"
              onPress={() => toggleReport(index)}
            >
              <Text className="text-white">{openReportIndex === index ? 'Close' : 'Open'}</Text>
            </TouchableOpacity>
          </View>
          {openReportIndex === index && (
            <View className="p-3 bg-gray-100">
              <Text className="text-gray-700">{report.details}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};


export default ScanHistory;