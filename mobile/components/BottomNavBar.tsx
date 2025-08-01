import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "../app/contexts/ThemeContext";

type NavItem = {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    route: string;
    color: string;
};

const { width: screenWidth } = Dimensions.get('window');
const NAV_WIDTH = screenWidth - 40; // Container padding
const ITEM_WIDTH = NAV_WIDTH / 5; // 5 items

export default function BottomNavBar() {
    const router = useRouter();
    const pathname = usePathname();
    const { colors } = useTheme();
    
    // Animation values
    const slideAnimation = useRef(new Animated.Value(0)).current;
    const scaleAnimation = useRef(new Animated.Value(1)).current;
    const backgroundColorAnimation = useRef(new Animated.Value(0)).current;
    const floatingAnimation = useRef(new Animated.Value(0)).current;
    const rippleAnimation = useRef(new Animated.Value(0)).current;

    const navItems: NavItem[] = [
        {
            icon: "home",
            label: "Home",
            route: "/screens/(tabs)/student",
            color: "#1fa8f5"
        },
        {
            icon: "book",
            label: "Courses",
            route: "/screens/(tabs)/course",
            color: "#d34514"
        },
        {
            icon: "forum",
            label: "Forum",
            route: "/screens/(tabs)/forum",
            color: "#ed9426"
        },
        {
            icon: "trophy",
            label: "Leaderboard",
            route: "/screens/(tabs)/leaderboard",
            color: "#4dd146"
        },
        {
            icon: "account",
            label: "Profile",
            route: "/screens/(tabs)/profile",
            color: "#a3a3a3"
        },
    ];

    const isActive = (route: string) => {
        return pathname.startsWith(route) ||
            pathname.replace(/\/$/, '') === route.replace(/\/$/, '');
    };

    const getActiveIndex = () => {
        return navItems.findIndex(item => isActive(item.route));
    };

    const getActiveColor = () => {
        const activeIndex = getActiveIndex();
        return activeIndex >= 0 ? navItems[activeIndex].color : colors.activeNavIcon;
    };

    // Animate to active position
    useEffect(() => {
        const activeIndex = getActiveIndex();
        if (activeIndex >= 0) {
            // Slide animation for floating indicator
            Animated.parallel([
                Animated.spring(slideAnimation, {
                    toValue: activeIndex * ITEM_WIDTH,
                    useNativeDriver: false,
                    tension: 100,
                    friction: 8,
                }),
                // Floating animation
                Animated.spring(floatingAnimation, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 120,
                    friction: 7,
                }),
                // Background color transition
                Animated.timing(backgroundColorAnimation, {
                    toValue: activeIndex,
                    duration: 300,
                    useNativeDriver: false,
                })
            ]).start();
        }
    }, [pathname]);

    const handlePress = (item: NavItem, index: number) => {
        // Ripple effect
        rippleAnimation.setValue(0);
        Animated.sequence([
            Animated.timing(rippleAnimation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(rippleAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();

        // Scale effect
        Animated.sequence([
            Animated.timing(scaleAnimation, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        router.push(item.route as any);
    };

    // Interpolate background color
    const interpolatedBackgroundColor = backgroundColorAnimation.interpolate({
        inputRange: [0, 1, 2, 3, 4],
        outputRange: [
            navItems[0].color + '20',
            navItems[1].color + '20',
            navItems[2].color + '20',
            navItems[3].color + '20',
            navItems[4].color + '20'
        ],
        extrapolate: 'clamp'
    });

    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    backgroundColor: interpolatedBackgroundColor,
                    transform: [{ scale: scaleAnimation }]
                }
            ]}
        >
            {/* Floating Active Indicator */}
            <Animated.View
                style={[
                    styles.floatingIndicator,
                    {
                        backgroundColor: getActiveColor(),
                        transform: [
                            { 
                                translateX: slideAnimation 
                            },
                            {
                                translateY: floatingAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8]
                                })
                            },
                            {
                                scale: floatingAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1]
                                })
                            }
                        ],
                        opacity: floatingAnimation
                    }
                ]}
            />

            {/* Top Border Indicator (Style 3 inspired) */}
            <Animated.View
                style={[
                    styles.topBorder,
                    {
                        backgroundColor: getActiveColor(),
                        transform: [
                            { translateX: slideAnimation }
                        ],
                        width: ITEM_WIDTH * 0.6,
                        left: ITEM_WIDTH * 0.2,
                    }
                ]}
            />

            <View style={styles.navBar}>
                {navItems.map((item, index) => {
                    const active = isActive(item.route);
                    return (
                        <TouchableWithoutFeedback
                            key={item.label}
                            onPress={() => handlePress(item, index)}
                        >
                            <View style={styles.navItem}>
                                {/* Ripple Effect */}
                                <Animated.View
                                    style={[
                                        styles.rippleEffect,
                                        {
                                            backgroundColor: item.color + '30',
                                            transform: [{
                                                scale: rippleAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 2]
                                                })
                                            }],
                                            opacity: rippleAnimation.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [0, 0.5, 0]
                                            })
                                        }
                                    ]}
                                />

                                <Animated.View 
                                    style={[
                                        styles.navItemContent,
                                        active && {
                                            transform: [{
                                                translateY: floatingAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -4]
                                                })
                                            }]
                                        }
                                    ]}
                                >
                                    <Animated.View
                                        style={{
                                            transform: [{
                                                scale: active ? floatingAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [1, 1.2]
                                                }) : 1
                                            }]
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.icon}
                                            size={active ? 28 : 24}
                                            color={active ? '#FFFFFF' : colors.inactiveNavIcon}
                                        />
                                    </Animated.View>
                                    
                                    {/* Label with fade animation */}
                                    <Animated.View
                                        style={{
                                            opacity: floatingAnimation,
                                            transform: [{
                                                translateY: floatingAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [10, 0]
                                                })
                                            }]
                                        }}
                                    >
                                        {active && (
                                            <Text
                                                variant="labelSmall"
                                                style={[
                                                    styles.activeLabel,
                                                    { color: '#FFFFFF' }
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {item.label}
                                            </Text>
                                        )}
                                    </Animated.View>
                                </Animated.View>
                            </View>
                        </TouchableWithoutFeedback>
                    );
                })}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 10,
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 35,
        zIndex: 50,
        overflow: 'hidden',
        ...Platform.select({
            android: {
                elevation: 15,
            },
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
        }),
    },
    floatingIndicator: {
        position: 'absolute',
        top: 10,
        width: 50,
        height: 50,
        borderRadius: 25,
        left: (ITEM_WIDTH - 50) / 2,
        zIndex: 10,
        ...Platform.select({
            android: {
                elevation: 5,
            },
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
        }),
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        height: 3,
        borderRadius: 2,
        zIndex: 5,
    },
    navBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        height: "100%",
        paddingHorizontal: 4,
        paddingTop: 5,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        flex: 1,
        position: 'relative',
    },
    rippleEffect: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        zIndex: 1,
    },
    navItemContent: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    activeLabel: {
        fontSize: 10,
        fontWeight: "700",
        marginTop: 2,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});