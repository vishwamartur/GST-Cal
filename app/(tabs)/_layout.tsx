import { Tabs } from 'expo-router';
import { Calculator, Clock, Settings, CalculatorIcon, Percent, Bell, TrendingUp } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
        },
        headerStyle: {
          backgroundColor: '#6366F1',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'GST',
          tabBarIcon: ({ color, size }) => <Percent size={size} color={color} />,
          headerShown: false,
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
