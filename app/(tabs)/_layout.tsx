import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Chrome as Home, Users, CreditCard, Settings, File } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { useRolePermissions } from '@/hooks/useRolePermissions';
// Import your screen components
import DashboardScreen from './index';
import MembersScreen from './members';
import PaymentsScreen from './payments';
import ReportsScreen from './reports';
import SettingsScreen from './settings';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const hasPermission = useRolePermissions();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: COLORS.surface, height: 60, borderTopColor: COLORS.surfaceLight },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.lightGray,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      {hasPermission('edit_members') && (
        <Tab.Screen
          name="Members"
          component={MembersScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
      )}
      {hasPermission('manage_payments') && (
        <Tab.Screen
          name="Payments"
          component={PaymentsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
          }}
        />
      )}
      {hasPermission('view_reports') && (
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <File size={size} color={color} />,
          }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}