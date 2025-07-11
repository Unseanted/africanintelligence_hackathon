// import React, { useEffect, useRef, useCallback } from 'react';
// import { StyleSheet } from 'react-native';
// import { Image } from 'expo-image';
// import { router } from 'expo-router';
// import { ThemedView } from '@/components/ThemedView';
// import { ThemedText } from '@/components/ThemedText';

// export default function LandingPage() {
//   const hasNavigated = useRef(false);

//   const navigateToLogin = useCallback(() => {
//     if (!hasNavigated.current) {
//       hasNavigated.current = true;
//       router.replace('/(auth)/login');
//     }
//   }, []);

//   useEffect(() => {
//     const timeout = setTimeout(navigateToLogin, 2000);
//     return () => clearTimeout(timeout);
//   }, [navigateToLogin]);

//   return (
//     <ThemedView style={styles.container}>
//       <Image
//         source={require('@/assets/images/logo1.png')}
//         style={styles.logo}
//         contentFit="contain"
//       />
//       <ThemedText type="title" style={styles.welcomeText}>
//         Welcome to African Intelligence
//       </ThemedText>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//   },
//   logo: {
//     width: 200,
//     height: 200,
//     marginBottom: 20,
//   },
//   welcomeText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#000',
//   },
// });



import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function LandingPage() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/logo1.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <ThemedText type="title" style={styles.welcomeText}>
        Welcome to African Intelligence
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
});
