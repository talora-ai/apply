import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
    useEffect,
    useState,
} from "react";

import "@/i18n";

import { loadStoredLanguage } from "@/i18n";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [applicationReady, setApplicationReady] =
        useState(false);

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
                setApplicationReady(true);

                await SplashScreen.hideAsync();
            }
        }

        void prepareApplication();
    }, []);

    if (!applicationReady) {
        return null;
    }

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
            />
        </>
    );
}