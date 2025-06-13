import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import StudentDashboard from '../screens/StudentDashboard';
import CoursesList from '../screens/CoursesList';
import Analytics from '../screens/Analytics';
import Forum from '../screens/Forum';
import Profile from '../screens/Profile';
import FacilitatorDashboard from '../screens/FacilitatorDashboard';
import FacilitatorCourses from '../screens/FacilitatorCourses';
import FacilitatorAnalytics from '../screens/FacilitatorAnalytics';
import StudentManagement from '../screens/StudentManagement';
import AdminDashboard from '../screens/AdminDashboard';
import UserManagement from '../screens/UserManagement';
import AdminAnalytics from '../screens/AdminAnalytics';
import SystemSettings from '../screens/SystemSettings';
import Landing from '../screens/Landing';
import Login from '../screens/Login';
import Register from '../screens/Register';
import CourseDetail from '../screens/CourseDetail';
import CreateCourse from '../screens/CreateCourse';
import EditCourse from '../screens/EditCourse';
import ForumThread from '../screens/ForumThread';
import UserProfile from '../screens/UserProfile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StudentTabs = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Dashboard" 
      component={StudentDashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Courses" 
      component={CoursesList}
      options={{
        tabBarIcon: ({ color }) => <Icon name="book" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Analytics" 
      component={Analytics}
      options={{
        tabBarIcon: ({ color }) => <Icon name="chart-bar" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Forum" 
      component={Forum}
      options={{
        tabBarIcon: ({ color }) => <Icon name="forum" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={Profile}
      options={{
        tabBarIcon: ({ color }) => <Icon name="account" size={24} color={color} />
      }}
    />
  </Tab.Navigator>
);

const FacilitatorTabs = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Dashboard" 
      component={FacilitatorDashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Courses" 
      component={FacilitatorCourses}
      options={{
        tabBarIcon: ({ color }) => <Icon name="book-edit" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Analytics" 
      component={FacilitatorAnalytics}
      options={{
        tabBarIcon: ({ color }) => <Icon name="chart-box" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Students" 
      component={StudentManagement}
      options={{
        tabBarIcon: ({ color }) => <Icon name="account-group" size={24} color={color} />
      }}
    />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="Dashboard" 
      component={AdminDashboard}
      options={{
        tabBarIcon: ({ color }) => <Icon name="view-dashboard" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Users" 
      component={UserManagement}
      options={{
        tabBarIcon: ({ color }) => <Icon name="account-cog" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Analytics" 
      component={AdminAnalytics}
      options={{
        tabBarIcon: ({ color }) => <Icon name="chart-areaspline" size={24} color={color} />
      }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SystemSettings}
      options={{
        tabBarIcon: ({ color }) => <Icon name="cog" size={24} color={color} />
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={Landing} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
    <Stack.Screen name="StudentTabs" component={StudentTabs} />
    <Stack.Screen name="FacilitatorTabs" component={FacilitatorTabs} />
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="CourseDetail" component={CourseDetail} />
    <Stack.Screen name="CreateCourse" component={CreateCourse} />
    <Stack.Screen name="EditCourse" component={EditCourse} />
    <Stack.Screen name="ForumThread" component={ForumThread} />
    <Stack.Screen name="UserProfile" component={UserProfile} />
  </Stack.Navigator>
);

export default AppNavigator;