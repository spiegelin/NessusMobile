import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const Socials = () => {
  const [input, setInput] = useState<string>(''); 
  const [result, setResult] = useState<{
    organization_info: {
      domain: string;
      name: string;
      description: string;
      industry: string;
      size: string;
      twitter: string | null;
      facebook: string | null;
      linkedin: string | null;
      instagram: string | null;
      country: string | null;
      state: string | null;
      city: string | null;
      postal_code: string | null;
      street: string | null;
    };
    employees: Array<{
      name: string;
      emails: string[];
      position: string | null;
      seniority: string | null;
      department: string | null;
      phone_number: string | null;
      socials: {
        linkedin: string | null;
        twitter: string | null;
      };
    }>;
    tech_stack: string[];
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://10.0.2.2:8000/socials', { target: input });
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
    if (!data || !data.organization_info || !data.employees) return null;
    return {
      organization_info: {
        domain: data.organization_info.domain,
        name: data.organization_info.name,
        description: data.organization_info.description,
        industry: data.organization_info.industry,
        size: data.organization_info.size,
        twitter: data.organization_info.twitter,
        facebook: data.organization_info.facebook,
        linkedin: data.organization_info.linkedin,
        instagram: data.organization_info.instagram,
        country: data.organization_info.country,
        state: data.organization_info.state,
        city: data.organization_info.city,
        postal_code: data.organization_info.postal_code,
        street: data.organization_info.street,
      },
      employees: data.employees.map((employee: any) => ({
        name: employee.name,
        emails: employee.emails || [],
        position: employee.position,
        seniority: employee.seniority,
        department: employee.department,
        phone_number: employee.phone_number,
        socials: {
          linkedin: employee.socials?.linkedin,
          twitter: employee.socials?.twitter,
        },
      })),
      tech_stack: data.tech_stack || [],
      total: data.total || 0,
    };
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-6">
        <Text style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">
          Socials Scan
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
        <Text className="text-white text-center">
          {loading ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>
      {loading ? (
        <View className="mt-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-700 mt-2">Scanning...</Text>
        </View>
      ) : (
        <ScrollView className="mt-6 bg-gray-100 rounded-lg flex-1">
          {result ? (
            <>
              {/* Organización */}
              <Text className="text-lg font-bold text-center mb-4">{`Organization: ${result.organization_info.name}`}</Text>
              <View className="mb-5">
                <Text className="text-xl font-bold">General Information</Text>
                {result.organization_info.street && <Text>{`Domain: ${result.organization_info.domain}`}</Text>}
                {result.organization_info.description && <Text>{`Description: ${result.organization_info.description}`}</Text>}
                {result.organization_info.industry && <Text>{`Industry: ${result.organization_info.industry}`}</Text>}
                {result.organization_info.size && <Text>{`Size: ${result.organization_info.size}`}</Text>}
                {result.organization_info.country && <Text>{`Country: ${result.organization_info.country}`}</Text>}
                {result.organization_info.city && <Text>{`City: ${result.organization_info.city}`}</Text>}
                {result.organization_info.state && <Text>{`State: ${result.organization_info.state}`}</Text>}
                {result.organization_info.postal_code && <Text>{`Postal Code: ${result.organization_info.postal_code}`}</Text>}
                {result.organization_info.street && <Text>{`Street: ${result.organization_info.street}`}</Text>}
                <Text className="font-semibold mt-2">Socials:</Text>
                {result.organization_info.twitter && <Text>{`Twitter: ${result.organization_info.twitter || "N/A"}`}</Text>}
                {result.organization_info.facebook && <Text>{`Facebook: ${result.organization_info.facebook || "N/A"}`}</Text>}
                {result.organization_info.linkedin && <Text>{`LinkedIn: ${result.organization_info.linkedin || "N/A"}`}</Text>}
                {result.organization_info.instagram && <Text>{`Instagram: ${result.organization_info.instagram || "N/A"}`}</Text>}
              </View>

              {/* Empleados */}
              <Text className="text-xl font-bold text-center mb-4">Employees</Text>
              {result.employees.map((employee, index) => (
                <View key={index} className="mb-5">
                  {employee.name && <Text className="text-lg font-bold">{`Name: ${employee.name}`}</Text>}
                  {employee.emails && <Text>{`Emails: ${employee.emails.join(", ")}`}</Text>}
                  {employee.position && <Text>{`Position: ${employee.position}`}</Text>}
                  {employee.seniority && <Text>{`Seniority: ${employee.seniority}`}</Text>}
                  {employee.department && <Text>{`Department: ${employee.department}`}</Text>}
                  {employee.phone_number && <Text>{`Phone Number: ${employee.phone_number}`}</Text>}
                  <Text className="font-semibold">Socials:</Text>
                  {employee.socials.linkedin && <Text>{`LinkedIn: ${employee.socials.linkedin || "N/A"}`}</Text>}
                  {employee.socials.twitter && <Text>{`Twitter: ${employee.socials.twitter || "N/A"}`}</Text>}
                </View>
              ))}

              {/* Tech Stack */}
              <Text className="text-xl font-bold text-center mb-4">Tech Stack</Text>
              {result.tech_stack.length > 0 ? (
                <View>
                  {result.tech_stack.map((tech, index) => (
                    <Text key={index}>{`- ${tech}`}</Text>
                  ))}
                </View>
              ) : (
                <Text>No tech stack available</Text>
              )}

              {/* Total */}
              <Text className="text-lg font-bold text-center mt-6">{`Total Employees: ${result.total}`}</Text>
            </>
          ) : (
            <Text className="text-gray-500 text-center">No results to display.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Socials; 