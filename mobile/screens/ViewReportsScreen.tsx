import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const ViewReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [openReportIndex, setOpenReportIndex] = useState<number | null>(null);
  const [openRecommendation, setOpenRecommendation] = useState(false);

  // Fetch reports from the backend using Axios
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
          Alert.alert('Error', 'No authentication token found');
          return;
        }

        const response = await axios.get('http://10.0.2.2:3000/scans', {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        setReports(response.data.scans);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const toggleReport = (index: number) => {
    setOpenReportIndex(openReportIndex === index ? null : index);
  };

  const togleRecommendation = () => {
    setOpenRecommendation(true);
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 45 }}>Scanner Reports</Text>
      </View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30, color: '#4a4a4a', marginBottom: 10 }}>
        Reports
      </Text>
      <ScrollView>
        {reports.map((report, index) => (
          <View key={report.scan_id} style={{ marginBottom: 10 }}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                {new Date(report.scan_date).toLocaleString()} {/* Convert datetime */}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => toggleReport(index)}
              >
                <Text style={{ color: '#fff' }}>
                  {openReportIndex === index ? 'Close' : 'Open'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Card Content (JSON details) */}
            {openReportIndex === index && (
              <View style={styles.cardContent}>
                <ScrollView horizontal>
                  <Text style={{ color: '#333' }}>{JSON.stringify(report, null, 2)}</Text>
                </ScrollView>
                <TouchableOpacity
                style={styles.button}
                onPress={() => toggleReport(index)}
              >
                <Text style={{ color: '#fff' }}>Get Recommendations</Text>
              </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
});

export default ViewReportsScreen;