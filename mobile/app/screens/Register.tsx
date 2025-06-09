import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function Register() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleRegister = () => {
    // TODO: Implement registration logic
    navigation.navigate('Login');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold text-center mb-8">Register</Text>
        
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          className="mb-4"
        />
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          className="mb-4"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          className="mb-6"
          secureTextEntry
        />

        <Text className="text-lg mb-2">I am a:</Text>
        <SegmentedButtons
          value={role}
          onValueChange={setRole}
          buttons={[
            { value: 'student', label: 'Student' },
            { value: 'facilitator', label: 'Facilitator' },
          ]}
          className="mb-6"
        />
        
        <Button
          mode="contained"
          onPress={handleRegister}
          className="mb-4"
        >
          Register
        </Button>
        
        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
        >
          Already have an account? Login
        </Button>
      </View>
    </ScrollView>
  );
} 