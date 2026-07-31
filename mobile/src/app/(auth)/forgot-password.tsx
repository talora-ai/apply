import { Text, View } from "react-native";

export default function ForgotPasswordScreen() {
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0B1020",
            }}
        >
            <Text
                style={{
                    color: "#F8FAFC",
                    fontSize: 24,
                    fontWeight: "700",
                }}
            >
                Recuperar senha
            </Text>
        </View>
    );
}