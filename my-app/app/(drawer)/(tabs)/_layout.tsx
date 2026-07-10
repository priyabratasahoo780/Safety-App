import { Tabs } from 'expo-router';
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Navigation, AlertCircle } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    // bottom padding = system gesture bar height + 12px breathing room
    const bottomPad = insets.bottom + 12;

    return (
        <View style={[styles.tabBarWrapper, { bottom: bottomPad }]}>
            <View style={styles.capsule}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const isSOS = route.name === 'sos-placeholder';

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // ── SOS centre button ──────────────────────────────────────────────
                    if (isSOS) {
                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.sosWrapper}
                                activeOpacity={0.85}
                            >
                                <View style={styles.sosButton}>
                                    <AlertCircle size={26} color="#FFFFFF" strokeWidth={2.5} />
                                </View>
                                <Text style={styles.sosLabel}>SOS</Text>
                            </TouchableOpacity>
                        );
                    }

                    // ── Regular tab ───────────────────────────────────────────────────
                    const label =
                        route.name === 'home'
                            ? 'Home'
                            : route.name === 'navigate'
                                ? 'Navigate'
                                : route.name;

                    const Icon =
                        route.name === 'home'
                            ? Home
                            : Navigation;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tab}
                            activeOpacity={0.75}
                        >
                            <Icon
                                size={22}
                                color={isFocused ? '#A78BFA' : '#6B7280'}
                                strokeWidth={isFocused ? 2.5 : 1.8}
                            />
                            <Text style={[styles.label, isFocused && styles.labelActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="sos-placeholder" />
            <Tabs.Screen name="navigate" />
            {/* Hidden from tab bar */}
            <Tabs.Screen name="live-tracking" options={{ href: null }} />
            <Tabs.Screen name="safety-analysis" options={{ href: null }} />
        </Tabs>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    tabBarWrapper: {
        position: 'absolute',
        left: 20,
        right: 20,
        alignItems: 'center',
        // lift above system nav bar — bottom is set dynamically via insets
    },
    capsule: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A0D1A',
        borderRadius: 40,
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 16,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 2,
    },
    labelActive: {
        color: '#A78BFA',
        fontWeight: '700',
    },
    // SOS floating centre button
    sosWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -28,       // lifts above the capsule
    },
    sosButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#E53E3E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#0A0D1A',
        shadowColor: '#E53E3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 14,
    },
    sosLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#E53E3E',
        marginTop: 3,
        letterSpacing: 0.5,
    },
});
