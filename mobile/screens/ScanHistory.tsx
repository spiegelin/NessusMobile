import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';


const ScanHistory: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [openReportIndex, setOpenReportIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://192.168.100.238:3000/log');
        setReports(response.data.logs);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, []);

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
            <Text className="text-base">{report.action}</Text>
            <TouchableOpacity
              className="bg-black p-2 rounded"
              onPress={() => toggleReport(index)}
            >
              <Text className="text-white">{openReportIndex === index ? 'Close' : 'Open'}</Text>
            </TouchableOpacity>
          </View>
          {openReportIndex === index && (
            <View className="p-3 bg-gray-100">
              <Text className="text-gray-700">{report.timestamp}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};


export default ScanHistory;