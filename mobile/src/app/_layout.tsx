import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import "@/i18n";

import {
    AuthProvider,
    useAuth,
} from "@/features/auth/context/auth-context";
import { loadStoredLanguage } from "@/i18n";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [localeReady, setLocaleReady] = useState(false);

    useEffect(() => {
        async function prepareApplication() {
            try {
                await loadStoredLanguage();
            } catch (error) {
                console.error(
                    "Failed to initialize application:",
                    error,
                );
            } finally {
                setLocaleReady(true);
            }
        }

        void prepareApplication();
    }, []);

    return (
        <AuthProvider>
            <ApplicationNavigator localeReady={localeReady} />
        </AuthProvider>
    );
}

type ApplicationNavigatorProps = {
    localeReady: boolean;
};

function ApplicationNavigator({
    localeReady,
}: ApplicationNavigatorProps) {
    const { status } = useAuth();
    const applicationReady =
        localeReady && status !== "loading";

    useEffect(() => {
        if (applicationReady) {
            void SplashScreen.hideAsync();
        }
    }, [applicationReady]);

    if (!applicationReady) {
        return null;
    }

    const authenticated = status === "authenticated";

    return (
        <>
            <StatusBar style="light" />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: "#0B1020",
                    },
                    animation: "fade",
                }}
            >
                <Stack.Screen name="index" />

                <Stack.Protected guard={!authenticated}>
                    <Stack.Screen name="(public)" />
                </Stack.Protected>

                <Stack.Protected guard={authenticated}>
                    <Stack.Screen name="(protected)" />
                </Stack.Protected>
            </Stack>
        </>
    );
}
