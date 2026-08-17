import { Stack } from "expo-router";
export default function OnboardingLayout() {
    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B1020" }, animation: "fade" }} />;
}
