import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { styled } from 'nativewind';
import { NativeWindStyleSheet } from 'nativewind';

// Define the types for our navigation parameters
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  BasicScan: undefined;
  ViewReports: undefined;
  SecurityAwareness: undefined;
  ScanHistory: undefined;
  AdvancedScan: undefined;
  OSINTsearch: undefined;
};

const StyledView = styled(View);
const StyledText = styled(Text);

// Create a type for the navigation prop
type NavigationProp = StackNavigationProp<RootStackParamList>;

// Define props type for screens that use navigation
type ScreenProps = {
  navigation: NavigationProp;
};

const Stack = createStackNavigator<RootStackParamList>();

const LoginScreen: React.FC<ScreenProps> = ({ navigation }) => (
  <StyledView className="flex items-center justify-center p-5">
    <StyledText style={{ fontFamily: 'Vercel-semi', fontSize: 60 }} className="mt-20 mb-5 text-center">Security Scanner</StyledText>
    <Image source={require("./assets/bancoLogo.png")} className="mb-11" />
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Email" />
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="Password" secureTextEntry />
    <View className="flex-row justify-around w-full">
      <TouchableOpacity className="bg-gray-500 p-3 rounded-md mt-3" onPress={() => {/*navigation.navigate('Register')*/}}>
        <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-red-600 p-3 rounded-md mt-3" onPress={() => navigation.navigate('Home')}>
        <Text className="text-white text-center" style={{ fontFamily: "Vercel-semi" }}>Log In</Text>
      </TouchableOpacity>
    </View>
  </StyledView>
);

const HomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const scanTools = [
    { name: 'Basic Scan', image: require('./assets/bancoLifeline2.png') , desc : "ARBOLITERS GO"},
    { name: 'Advanced Scan', image: require('./assets/bancoCogs.jpg') ,desc : "sample description bork chen"},
    { name: 'OSINT search', image: require('./assets/bancoWeb.png') , desc : "sample description bork chen"},
    { name: 'View Reports', image: require('./assets/bancoReports4.png') , desc : "sample description bork chen"},
    { name: 'Scan History', image: require('./assets/bancoHistory.png') , desc : "sample description bork chen"},
    { name: 'Security Awareness', image: require('./assets/bancoSecurityAware.png') , desc : "sample description bork chen"},
  ];

  return (
    <View className="flex p-5 items-center">
      <View className="flex-col justify-between items-center w-full ">
        <Text style={{ fontFamily: "Vercel-semi", fontSize: 40 }} className="">Security Scanner</Text>
      </View>
      <Text style={{ fontFamily: "Vercel-semi", fontSize: 25 }} className="text-xl font-bold mb-1 text-gray-700" >Tools</Text>
      <View className="flex-row flex-wrap justify-around">
        {scanTools.map((tool, index) => (
          <TouchableOpacity
            key={index}
            className="w-[45%] bg-black rounded-lg p-5 m-1 items-center shadow-xl shadow-black"
            onPress={() => navigation.navigate(tool.name.replace(' ', '') as keyof RootStackParamList)}>
            <Image source={tool.image} className="w-[90%] h-28 mb-2" />
            <Text className="text-center text-white" style={{ fontFamily: "Vercel-semi", fontSize: 15 }}>{tool.name}</Text>
            <Text className="text-center text-gray-400 mt-2" style={{ fontFamily: "Vercel-semi", fontSize: 10 }}>{tool.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};


const BasicScanScreen: React.FC = () => (
  <View className="flex-1 p-5">
    <View className="flex-col justify-between items-center w-full mb-5">
      
    <StyledText style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">Basic Scan</StyledText>
    </View>
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="URL or IP to scan" />
    <TouchableOpacity className="bg-black p-3 rounded-lg">
      <Text className="text-white text-center">Start Scan</Text>
    </TouchableOpacity>
    <View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="mt-6 mb-5 text-center text-gray-700">Scan Results and Vulnerabilities</Text>
      <Text>results here</Text>
    </View>
  </View>
);

const OSINTsearch: React.FC = () => (
  <View className="flex-1 p-5">
    <View className="flex-col justify-between items-center w-full mb-5">
      
    <StyledText style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">OSINT Search</StyledText>
    </View>
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="URL or IP to scan" />
    <TouchableOpacity className="bg-black p-3 rounded-lg">
      <Text className="text-white text-center">Start Search</Text>
    </TouchableOpacity>
    <View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="mt-6 mb-5 text-center text-gray-700">Search Results</Text>
      <Text>results here</Text>
    </View>
  </View>
);

const ScanHistory: React.FC = () => {
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
        <View key={index} className="w-full mb-3">
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

const AdvancedScan: React.FC = () => (
  <View className="flex-1 p-5">
    <View className="flex-col justify-between items-center w-full mb-5">
      
    <StyledText style={{ fontFamily: 'Vercel-semi', fontSize: 40 }} className="mt-20 mb-5 text-center">Advanced Scan</StyledText>
    </View>
    <TextInput className="w-full h-10 border border-gray-400 rounded mb-3 px-3" placeholder="URL or IP to scan" />
    <TouchableOpacity className="bg-black p-3 rounded-lg">
      <Text className="text-white text-center">Start Scan</Text>
    </TouchableOpacity>
    <View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="mt-6 mb-5 text-center text-gray-700">Scan Results and Vulnerabilities</Text>
      <Text>results here</Text>
    </View>
  </View>
);

const ViewReportsScreen: React.FC = () => {
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
          Scanner Reports
        </Text>
      </View>
      <Text style={{ fontFamily: 'Vercel-semi', fontSize: 30 }} className="text-gray-700 mb-3">
        Reports
      </Text>
      {reports.map((report, index) => (
        <View key={index} className="w-full mb-3">
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

const SecurityAwarenessScreen: React.FC = () => {
  const [openTipIndex, setOpenTipIndex] = useState<number | null>(null);

  const toggleTip = (index: number) => {
    setOpenTipIndex(openTipIndex === index ? null : index);
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-col justify-between items-center w-full mb-5">
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


const App: React.FC = () => {
  let [fontsLoaded] = useFonts({
    "Roboto": require("./assets/fonts/Roboto-Regular.ttf"),
    "Afacad": require("./assets/fonts/AfacadFlux-VariableFont_slnt,wght.ttf"),
    "Vercel": require("./assets/fonts/Geist-Regular-BF6569491e3eff1.otf"),
    "Vercel-semi": require("./assets/fonts/Geist-SemiBold-BF6569491e8c368.otf"),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BasicScan" component={BasicScanScreen} />
        <Stack.Screen name="ViewReports" component={ViewReportsScreen} />
        <Stack.Screen name="SecurityAwareness" component={SecurityAwarenessScreen} />
        <Stack.Screen name="OSINTsearch" component={OSINTsearch} />
        <Stack.Screen name="ScanHistory" component={ScanHistory} />
        <Stack.Screen name="AdvancedScan" component={AdvancedScan} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Register the styles
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default App;
