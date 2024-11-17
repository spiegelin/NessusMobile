import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface Report {
  action: string;
  timestamp: string;
}

const ScanHistory: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [openReportIndex, setOpenReportIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      const url = process.env.IP + '/log';
      setLoading(true);
      try {
        const response = await axios.get(url , {
          headers: {
            Authorization: `Bearer ${token}`,
        }
        });
        setReports(response.data.logs);
      } catch (error) {
        console.error(error, "hola", error.response);
        Alert.alert("Error", "Failed to load scan history.");
      } finally {
        setLoading(false); 
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
        <Text className="text-5xl font-semibold mb-5 text-center">Scan History</Text>
      </View>

      <Text className="text-3xl text-gray-700 mb-3">Latest Reports</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        reports.map((report, index) => (
          <View key={index} className="w-full mb-4">
            <View className="flex-row justify-between items-center p-3 bg-gray-200 rounded-lg">
              <Text className="text-base">{report.action}</Text>
              <TouchableOpacity
                className="bg-black p-2 rounded"
                onPress={() => toggleReport(index)}
              >
                <Text className="text-white">{openReportIndex === index ? 'Close' : 'Open'}</Text>
              </TouchableOpacity>
            </View>
            {openReportIndex === index && (
              <View className="p-3 bg-gray-100 rounded-lg">
                <Text className="text-gray-700">{report.timestamp}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
};

export default ScanHistory;