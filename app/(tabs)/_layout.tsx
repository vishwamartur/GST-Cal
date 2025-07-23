import { Tabs } from 'expo-router';
import { Calculator, Clock, Settings, CalculatorIcon, Percent, Bell, TrendingUp } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A237E',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: '#1A237E',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'GST',
          tabBarIcon: ({ color, size }) => <Percent size={size} color={color} />,
          headerTitle: 'GST Calculator',
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color, size }) => <Calculator size={size} color={color} />,
          headerTitle: 'Basic Calculator',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          headerTitle: 'Calculation History',
        }}
      />
      <Tabs.Screen
        name="profit-margin"
        options={{
          title: 'Profit Margin',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
          headerTitle: 'Profit Margin Calculator',
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          headerTitle: 'GST Filing Reminders',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}