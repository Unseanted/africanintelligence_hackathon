import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Analytics from "../screens/(tabs)/Analytics";
import StudentDashboard from "../screens/(tabs)/student";
import CoursesList from "../screens/CoursesList";
import Forum from "../screens/Forum";
import Profile from "../screens/Profile";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StudentTabs = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Courses"
      component={CoursesList}
      options={{
        tabBarIcon: ({ color }) => <Icon name="book" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Analytics"
      component={Analytics}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="chart-bar" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Forum"
      component={Forum}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="forum" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={Profile}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="account" size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => <></>;
export default AppNavigator;
