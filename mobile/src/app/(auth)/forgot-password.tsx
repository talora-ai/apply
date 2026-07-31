import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
    Text,
    TextInput,
    View,
} from "react-native";

import {
    ApiError,
    apiRequest,
} from "@/lib/api";

type ForgotPasswordResponse = {
    success?: boolean;
    message?: string;
    data?: {
        message?: string;
    };
};

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] =
        useState<string | null>(null);

    const [messageKey, setMessageKey] =
        useState<string | null>(null);

    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {
        if (!success) {
            return;
        }

        const redirectTimeout = setTimeout(() => {
            router.replace("/login");
        }, 3000);

        return () => {
            clearTimeout(redirectTimeout);
        };
    }, [router, success]);

    function validate(): boolean {
        const normalizedEmail = email
            .trim()
            .toLowerCase();

        if (
            !normalizedEmail ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                normalizedEmail,
            )
        ) {
            setEmailError(
                t("validation.emailInvalid"),
            );

            return false;
        }

        setEmailError(null);

        return true;
    }

    async function handleSubmit(): Promise<void> {
        if (!validate()) {
            return;
        }

        setSubmitting(true);
        setSuccess(false);
        setMessageKey(null);

        try {
            await apiRequest<ForgotPasswordResponse>(
                "/auth/forgot-password",
                {
                    method: "POST",
                    body: {
                        email: email.trim().toLowerCase(),
                        client: "mobile",
                    },
                },
            );

            setSuccess(true);
            setMessageKey(
                "forgotPassword.success",
            );
        } catch (error) {
            setSuccess(false);

            if (error instanceof ApiError) {
                setMessageKey(
                    error.status >= 500
                        ? "errors.unexpected"
                        : "errors.apiUnavailable",
                );

                return;
            }

            setMessageKey("errors.connection");
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
                    contentContainerStyle={
                        styles.scrollContent
                    }
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
                                {t(
                                    "forgotPassword.welcome",
                                )}
                            </Text>

                            <Text style={styles.title}>
                                {t(
                                    "forgotPassword.title",
                                )}
                            </Text>

                            <Text style={styles.description}>
                                {t(
                                    "forgotPassword.description",
                                )}
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.field}>
                                <Text style={styles.label}>
                                    {t(
                                        "forgotPassword.email",
                                    )}
                                </Text>

                                <TextInput
                                    value={email}
                                    onChangeText={(value) => {
                                        setEmail(value);
                                        setEmailError(null);
                                    }}
                                    placeholder={t(
                                        "forgotPassword.emailPlaceholder",
                                    )}
                                    placeholderTextColor="#64748B"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    returnKeyType="send"
                                    onSubmitEditing={() => {
                                        void handleSubmit();
                                    }}
                                    editable={
                                        !submitting &&
                                        !success
                                    }
                                    style={[
                                        styles.input,
                                        emailError &&
                                            styles.inputError,
                                    ]}
                                />

                                {emailError ? (
                                    <Text
                                        style={
                                            styles.errorText
                                        }
                                    >
                                        {emailError}
                                    </Text>
                                ) : null}
                            </View>

                            {messageKey ? (
                                <View
                                    style={[
                                        styles.message,
                                        success
                                            ? styles.successMessage
                                            : styles.errorMessage,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.messageText,
                                            success
                                                ? styles.successText
                                                : styles.errorText,
                                        ]}
                                    >
                                        {t(messageKey)}
                                    </Text>

                                    {success ? (
                                        <Text
                                            style={
                                                styles.redirectText
                                            }
                                        >
                                            {t(
                                                "forgotPassword.redirecting",
                                            )}
                                        </Text>
                                    ) : null}
                                </View>
                            ) : null}

                            <Pressable
                                onPress={() => {
                                    void handleSubmit();
                                }}
                                disabled={
                                    submitting || success
                                }
                                style={({ pressed }) => [
                                    styles.submitButton,
                                    pressed &&
                                        styles.submitButtonPressed,
                                    (submitting ||
                                        success) &&
                                        styles.submitButtonDisabled,
                                ]}
                            >
                                {submitting ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.submitButtonText
                                        }
                                    >
                                        {t(
                                            "forgotPassword.submit",
                                        )}
                                    </Text>
                                )}
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={() => {
                                router.replace("/login");
                            }}
                            style={styles.backButton}
                        >
                            <Text style={styles.backText}>
                                ←{" "}
                                {t(
                                    "forgotPassword.backToLogin",
                                )}
                            </Text>
                        </Pressable>
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

    inputError: {
        borderColor: "#F87171",
    },

    errorText: {
        color: "#FCA5A5",
        fontSize: 13,
    },

    message: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 5,
    },

    successMessage: {
        borderColor: "rgba(21, 208, 165, 0.3)",
        backgroundColor: "rgba(21, 208, 165, 0.1)",
    },

    errorMessage: {
        borderColor: "rgba(248, 113, 113, 0.3)",
        backgroundColor: "rgba(248, 113, 113, 0.1)",
    },

    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },

    successText: {
        color: "#6EE7C8",
    },

    redirectText: {
        color: "#94A3B8",
        fontSize: 12,
    },

    submitButton: {
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        backgroundColor: "#6D4AFF",
    },

    submitButtonPressed: {
        backgroundColor: "#5B35E8",
        transform: [{ scale: 0.99 }],
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    backButton: {
        alignSelf: "center",
        marginTop: 30,
        padding: 8,
    },

    backText: {
        color: "#8B6CFF",
        fontSize: 14,
        fontWeight: "600",
    },
});