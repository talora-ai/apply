import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAuth } from "@/features/auth/context/auth-context";
import { login } from "@/features/auth/services/login-service";
import { ApiError } from "@/lib/api";

type LoginErrors = {
    email?: string;
    password?: string;
};

export default function LoginScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<LoginErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function validate(): boolean {
        const validationErrors: LoginErrors = {};

        if (!email.trim()) {
            validationErrors.email = t("validation.emailRequired");
        } else if (!email.includes("@")) {
            validationErrors.email = t("validation.emailInvalid");
        }

        if (!password) {
            validationErrors.password = t(
                "validation.passwordRequired",
            );
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    }

    async function handleLogin(): Promise<void> {
        setFormError(null);

        if (!validate()) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await login({
                email: email.trim().toLowerCase(),
                password,
                remember,
            });

            const token = response.data?.token;

            if (!token) {
                throw new Error("Token was not returned by the API.");
            }

            await signIn(token);

            router.replace("/dashboard");
        } catch (error: unknown) {
            console.error("Login error:", error);

            if (error instanceof ApiError) {
                if (
                    error.status === 401 ||
                    error.status === 422
                ) {
                    setFormError(
                        t("errors.invalidCredentials"),
                    );

                    return;
                }

                setFormError(t("errors.unexpected"));

                return;
            }

            if (error instanceof TypeError) {
                setFormError(t("errors.connection"));

                return;
            }

            setFormError(t("errors.unexpected"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            <KeyboardAvoidingView
                style={styles.keyboardArea}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : undefined
                }
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.brand}>
                            <Image
                                source={require(
                                    "../../../assets/images/talora-apply-icon.svg"
                                )}
                                style={styles.logo}
                                resizeMode="contain"
                            />

                            <View>
                                <Text style={styles.brandName}>
                                    talora
                                </Text>

                                <Text style={styles.brandProduct}>
                                    apply
                                </Text>
                            </View>
                        </View>

                        <View style={styles.header}>
                            <Text style={styles.welcome}>
                                {t("login.welcome")}
                            </Text>

                            <Text style={styles.title}>
                                {t("login.title")}
                            </Text>

                            <Text style={styles.description}>
                                {t("login.description")}
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.field}>
                                <Text style={styles.label}>
                                    {t("login.email")}
                                </Text>

                                <TextInput
                                    value={email}
                                    onChangeText={(value) => {
                                        setEmail(value);
                                        setErrors((current) => ({
                                            ...current,
                                            email: undefined,
                                        }));
                                        setFormError(null);
                                    }}
                                    placeholder={t(
                                        "login.emailPlaceholder",
                                    )}
                                    placeholderTextColor="#64748B"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    returnKeyType="next"
                                    style={[
                                        styles.input,
                                        errors.email
                                            ? styles.inputError
                                            : undefined,
                                    ]}
                                />

                                {errors.email ? (
                                    <Text style={styles.fieldError}>
                                        {errors.email}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>
                                    {t("login.password")}
                                </Text>

                                <View
                                    style={[
                                        styles.passwordContainer,
                                        errors.password
                                            ? styles.inputError
                                            : undefined,
                                    ]}
                                >
                                    <TextInput
                                        value={password}
                                        onChangeText={(value) => {
                                            setPassword(value);
                                            setErrors((current) => ({
                                                ...current,
                                                password: undefined,
                                            }));
                                            setFormError(null);
                                        }}
                                        placeholder={t(
                                            "login.passwordPlaceholder",
                                        )}
                                        placeholderTextColor="#64748B"
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="password"
                                        textContentType="password"
                                        returnKeyType="done"
                                        onSubmitEditing={() => {
                                            void handleLogin();
                                        }}
                                        style={styles.passwordInput}
                                    />

                                    <Pressable
                                        onPress={() => {
                                            setShowPassword(
                                                (current) => !current,
                                            );
                                        }}
                                        hitSlop={10}
                                        style={styles.passwordButton}
                                    >
                                        <Text
                                            style={
                                                styles.passwordButtonText
                                            }
                                        >
                                            {showPassword
                                                ? t(
                                                      "login.hidePassword",
                                                  )
                                                : t(
                                                      "login.showPassword",
                                                  )}
                                        </Text>
                                    </Pressable>
                                </View>

                                {errors.password ? (
                                    <Text style={styles.fieldError}>
                                        {errors.password}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.options}>
                                <View style={styles.remember}>
                                    <Switch
                                        value={remember}
                                        onValueChange={setRemember}
                                        trackColor={{
                                            false: "#334155",
                                            true: "#6D4AFF",
                                        }}
                                        thumbColor="#F8FAFC"
                                    />

                                    <Text style={styles.optionText}>
                                        {t("login.remember")}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => {
                                        router.push(
                                            "/forgot-password",
                                        );
                                    }}
                                >
                                    <Text style={styles.linkText}>
                                        {t(
                                            "login.forgotPassword",
                                        )}
                                    </Text>
                                </Pressable>
                            </View>

                            {formError ? (
                                <View
                                    style={styles.errorContainer}
                                    role="alert"
                                >
                                    <Text style={styles.errorMessage}>
                                        {formError}
                                    </Text>
                                </View>
                            ) : null}

                            <Pressable
                                onPress={() => {
                                    void handleLogin();
                                }}
                                disabled={submitting}
                                style={({ pressed }) => [
                                    styles.submitButton,
                                    pressed &&
                                        styles.submitButtonPressed,
                                    submitting &&
                                        styles.submitButtonDisabled,
                                ]}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={
                                            styles.submitButtonText
                                        }
                                    >
                                        {t("login.submit")}
                                    </Text>
                                )}
                            </Pressable>
                        </View>

                        <View style={styles.register}>
                            <Text style={styles.registerText}>
                                {t("login.noAccount")}{" "}
                            </Text>

                            <Pressable
                                onPress={() => {
                                    router.push("/register");
                                }}
                            >
                                <Text style={styles.registerLink}>
                                    {t("login.createAccount")}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0B1020",
    },
    keyboardArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    container: {
        width: "100%",
        maxWidth: 440,
        alignSelf: "center",
    },
    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 40,
    },
    logo: {
        width: 52,
        height: 52,
    },
    brandName: {
        color: "#F8FAFC",
        fontSize: 24,
        fontWeight: "700",
        lineHeight: 26,
    },
    brandProduct: {
        color: "#15D0A5",
        fontSize: 14,
        fontWeight: "600",
    },
    header: {
        marginBottom: 32,
    },
    welcome: {
        color: "#8B6CFF",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    title: {
        color: "#F8FAFC",
        fontSize: 30,
        fontWeight: "700",
        lineHeight: 38,
    },
    description: {
        color: "#94A3B8",
        fontSize: 15,
        lineHeight: 23,
        marginTop: 12,
    },
    form: {
        gap: 20,
    },
    field: {
        gap: 8,
    },
    label: {
        color: "#E2E8F0",
        fontSize: 14,
        fontWeight: "600",
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: "#293349",
        borderRadius: 14,
        backgroundColor: "#161C2D",
        color: "#F8FAFC",
        fontSize: 15,
        paddingHorizontal: 16,
    },
    passwordContainer: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#293349",
        borderRadius: 14,
        backgroundColor: "#161C2D",
        overflow: "hidden",
    },
    passwordInput: {
        flex: 1,
        height: "100%",
        color: "#F8FAFC",
        fontSize: 15,
        paddingHorizontal: 16,
    },
    passwordButton: {
        height: "100%",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    passwordButtonText: {
        color: "#8B6CFF",
        fontSize: 12,
        fontWeight: "600",
    },
    inputError: {
        borderColor: "#F87171",
    },
    fieldError: {
        color: "#FCA5A5",
        fontSize: 12,
        lineHeight: 17,
    },
    options: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    remember: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    optionText: {
        color: "#94A3B8",
        fontSize: 13,
    },
    linkText: {
        color: "#8B6CFF",
        fontSize: 13,
        fontWeight: "600",
    },
    errorContainer: {
        borderWidth: 1,
        borderColor: "rgba(248, 113, 113, 0.35)",
        borderRadius: 12,
        backgroundColor: "rgba(248, 113, 113, 0.10)",
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    errorMessage: {
        color: "#FCA5A5",
        fontSize: 13,
        lineHeight: 19,
    },
    submitButton: {
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        backgroundColor: "#6D4AFF",
        marginTop: 4,
    },
    submitButtonPressed: {
        backgroundColor: "#5B35E8",
        transform: [
            {
                scale: 0.99,
            },
        ],
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    register: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        marginTop: 32,
    },
    registerText: {
        color: "#94A3B8",
        fontSize: 14,
    },
    registerLink: {
        color: "#8B6CFF",
        fontSize: 14,
        fontWeight: "700",
    },
});
