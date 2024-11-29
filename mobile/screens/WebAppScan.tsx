import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const WebAppScan = () => {
  const [input, setInput] = useState<string>(''); 
  const [result, setResult] = useState<{
    generated: string;
    sites: Array<{ name: string; alerts: any[] }>;
  } | null>(null); 
  const [loading, setLoading] = useState<boolean>(false); 

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://10.0.2.2:8000/web-scan', { target: input });
      const parsedResults = parseScanResults(response.data);
      setResult(parsedResults);
    } catch (error) {
      console.error('Error:', error);
      setResult(null); 
    } finally {
      setLoading(false);
    }
  };

  const parseScanResults = (data: any) => {
    if (!data || !data.site) return null;
  
    const sanitizeDescription = (desc: string) => {
      if (!desc) return "";
      return desc.replace(/<\/?p>/g, ""); // Removes all <p> and </p> tags
    };
  
    return {
      generated: data["@generated"],
      sites: data.site.map((site: any) => ({
        name: site["@name"],
        alerts: site.alerts.map((alert: any) => ({
          alert: alert.alert,
          name: alert.name,
          confidence: alert.confidence,
          riskdesc: alert.riskdesc,
          desc: sanitizeDescription(alert.desc), // Sanitize the description here
          instances: 
            alert.instances.map((instance: any) => ({
              uri: instance.uri,
              evidence: sanitizeEvidence(instance.evidence),
              otherinfo: instance.otherinfo,
            })
          ),
          cweid: alert.cweid,
          wascid: alert.wascid,
        })),
      })),
    };
  };
  

  const sanitizeEvidence = (evidence: string) => {
    if (!evidence) return "";
    const maxLength = 500; 
    return evidence.length > maxLength
      ? `${evidence.substring(0, maxLength)}...`
      : evidence;
  };

  const getRiskClassName = (riskdesc: string) => {
    // Extract the first risk level, ignoring anything in parentheses
    const risk = riskdesc.split(' ')[0].trim();
  
    if (risk === "High") return "text-red-500 font-bold";
    if (risk === "Medium") return "text-orange-500 font-bold";
    if (risk === "Low") return "text-yellow-500 font-bold";
    if (risk === "Informational") return "text-blue-500 font-bold";
    return "text-gray-500"; // Default color for undefined risks
  };

  

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">
          Web App Scan
        </Text>
      </View>
      <TextInput
        className="w-full h-10 border border-gray-400 rounded mb-3 px-3"
        placeholder="URL or IP to scan"
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity
        className="bg-black p-3 rounded-lg"
        onPress={handleScan}
        disabled={loading}
      >
        <Text className="text-white text-center" style={{ fontFamily: 'Vercel-semi'}}>
          {loading ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>
      {loading ? (
        <View className="mt-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-2" style={{ fontFamily: 'Vercel-semi'}}>Scanning...</Text>
        </View>
      ) : (
        <ScrollView className="mt-6 bg-gray-100 p-4 rounded-lg flex-1">
          {result ? (
            <>
              <Text className="" style={{ fontFamily: 'Vercel', fontSize: 10 }}>{`Generated: ${result.generated}`}</Text>
              {result.sites.map((site, index) => (
                <View key={index} className="mb-5">
                  <Text className="" style={{ fontFamily: 'Vercel-semi', fontSize: 25 }}>{`Site: ${site.name}`}</Text>
                  {site.alerts.map((alert, alertIndex) => (
                    <View key={alertIndex} className="mt-3">
                      <Text className="font-semibold" style={{ fontFamily: 'Vercel-semi', fontSize: 18 }}>{`Alert: ${alert.alert}`}</Text>
                      
                      <Text style={{ fontFamily: 'Vercel', fontSize: 12 }} className="my-2">{`Confidence: ${alert.confidence}`}</Text>
                      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 18  }} className={getRiskClassName(alert.riskdesc)}>{`Risk: ${alert.riskdesc}`}</Text>
                      <Text className="my-2" style={{ fontFamily: 'Vercel', fontSize: 14 }} >{`Description: ${alert.desc}`}</Text>
                      <Text className="my-2" style={{ fontFamily: 'Vercel-semi', fontSize: 14 }}>Instances:</Text>
                      {alert.instances.map((instance: { uri: any; evidence: any; otherinfo: any; }, instanceIndex: React.Key | null | undefined) => (
                        <View key={instanceIndex} className="ml-2">
                          <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`- URI: ${instance.uri}`}</Text>
                          <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`  Evidence: ${instance.evidence}`}</Text>
                          <Text className="mb-2" style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`  Other Info: ${instance.otherinfo}`}</Text>
                        </View>
                      ))}
                      <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`CWE ID: ${alert.cweid}`}</Text>
                      <Text style={{ fontFamily: 'Vercel', fontSize: 14 }}>{`WASC ID: ${alert.wascid}`}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          ) : (
            <Text className="text-gray-500 text-center">
              No results to display.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default WebAppScan;
