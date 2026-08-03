import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
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

type ResetPasswordResponse = {
    success?: boolean;
    message?: string;
    data?: {
        message?: string;
    };
};

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const params = useLocalSearchParams<{
        email?: string | string[];
        token?: string | string[];
    }>();

    const email = getParamValue(params.email);
    const token = getParamValue(params.token);

    const invalidLink = !email || !token;

    const [password, setPassword] = useState("");
    const [
        passwordConfirmation,
        setPasswordConfirmation,
    ] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showPasswordConfirmation,
        setShowPasswordConfirmation,
    ] = useState(false);

    const [errors, setErrors] =
        useState<PasswordErrors>({});

    const [messageKey, setMessageKey] =
        useState<string | null>(
            invalidLink
                ? "resetPassword.invalidLink"
                : null,
        );

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
        const validationErrors: PasswordErrors = {};

        if (!password) {
            validationErrors.password = t(
                "validation.passwordRequired",
            );
        } else if (password.length < 8) {
            validationErrors.password = t(
                "validation.passwordMin",
            );
        } else if (password.length > 32) {
            validationErrors.password = t(
                "validation.passwordMax",
            );
        }

        if (!passwordConfirmation) {
            validationErrors.passwordConfirmation =
                t(
                    "validation.passwordConfirmationRequired",
                );
        } else if (
            password !== passwordConfirmation
        ) {
            validationErrors.passwordConfirmation =
                t("validation.passwordMismatch");
        }

        setErrors(validationErrors);

        return (
            Object.keys(validationErrors).length ===
            0
        );
    }

    async function handleSubmit(): Promise<void> {
        if (invalidLink || !validate()) {
            return;
        }

        setSubmitting(true);
        setSuccess(false);
        setMessageKey(null);

        try {
            await apiRequest<ResetPasswordResponse>(
                "/auth/reset-password",
                {
                    method: "POST",
                    body: {
                        email,
                        token,
                        password,
                        password_confirmation:
                            passwordConfirmation,
                    },
                },
            );

            setSuccess(true);
            setMessageKey("resetPassword.success");
        } catch (error) {
            setSuccess(false);

            if (
                error instanceof ApiError &&
                error.status === 422
            ) {
                setMessageKey(
                    "resetPassword.expiredLink",
                );

                return;
            }

            if (
                error instanceof ApiError &&
                error.status >= 500
            ) {
                setMessageKey("errors.unexpected");

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
                                    "resetPassword.welcome",
                                )}
                            </Text>

                            <Text style={styles.title}>
                                {t(
                                    "resetPassword.title",
                                )}
                            </Text>

                            <Text style={styles.description}>
                                {t(
                                    "resetPassword.description",
                                )}
                            </Text>
                        </View>

                        {invalidLink ? (
                            <InvalidLink
                                message={t(
                                    "resetPassword.invalidLink",
                                )}
                                buttonLabel={t(
                                    "resetPassword.backToLogin",
                                )}
                                onBack={() => {
                                    router.replace("/login");
                                }}
                            />
                        ) : (
                            <View style={styles.form}>
                                <PasswordField
                                    label={t(
                                        "resetPassword.password",
                                    )}
                                    placeholder={t(
                                        "resetPassword.passwordPlaceholder",
                                    )}
                                    value={password}
                                    onChangeText={(value) => {
                                        setPassword(value);
                                        setErrors(
                                            (current) => ({
                                                ...current,
                                                password:
                                                    undefined,
                                            }),
                                        );
                                    }}
                                    visible={showPassword}
                                    onToggleVisibility={() => {
                                        setShowPassword(
                                            (current) =>
                                                !current,
                                        );
                                    }}
                                    showLabel={t(
                                        "resetPassword.showPassword",
                                    )}
                                    hideLabel={t(
                                        "resetPassword.hidePassword",
                                    )}
                                    error={errors.password}
                                    editable={
                                        !submitting &&
                                        !success
                                    }
                                />

                                <PasswordField
                                    label={t(
                                        "resetPassword.passwordConfirmation",
                                    )}
                                    placeholder={t(
                                        "resetPassword.passwordConfirmationPlaceholder",
                                    )}
                                    value={
                                        passwordConfirmation
                                    }
                                    onChangeText={(value) => {
                                        setPasswordConfirmation(
                                            value,
                                        );

                                        setErrors(
                                            (current) => ({
                                                ...current,
                                                passwordConfirmation:
                                                    undefined,
                                            }),
                                        );
                                    }}
                                    visible={
                                        showPasswordConfirmation
                                    }
                                    onToggleVisibility={() => {
                                        setShowPasswordConfirmation(
                                            (current) =>
                                                !current,
                                        );
                                    }}
                                    showLabel={t(
                                        "resetPassword.showPassword",
                                    )}
                                    hideLabel={t(
                                        "resetPassword.hidePassword",
                                    )}
                                    error={
                                        errors.passwordConfirmation
                                    }
                                    editable={
                                        !submitting &&
                                        !success
                                    }
                                    onSubmit={() => {
                                        void handleSubmit();
                                    }}
                                />

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
                                                    : styles.messageErrorText,
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
                                                    "resetPassword.redirecting",
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
                                        submitting ||
                                        success
                                    }
                                    style={({
                                        pressed,
                                    }) => [
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
                                                "resetPassword.submit",
                                            )}
                                        </Text>
                                    )}
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        router.replace(
                                            "/login",
                                        );
                                    }}
                                    style={
                                        styles.backButton
                                    }
                                >
                                    <Text
                                        style={
                                            styles.backText
                                        }
                                    >
                                        ←{" "}
                                        {t(
                                            "resetPassword.backToLogin",
                                        )}
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

type PasswordErrors = {
    password?: string;
    passwordConfirmation?: string;
};

type PasswordFieldProps = {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    visible: boolean;
    onToggleVisibility: () => void;
    showLabel: string;
    hideLabel: string;
    error?: string;
    editable: boolean;
    onSubmit?: () => void;
};

function PasswordField({
    label,
    placeholder,
    value,
    onChangeText,
    visible,
    onToggleVisibility,
    showLabel,
    hideLabel,
    error,
    editable,
    onSubmit,
}: PasswordFieldProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <View
                style={[
                    styles.passwordContainer,
                    error &&
                        styles.passwordContainerError,
                ]}
            >
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#64748B"
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType={
                        onSubmit ? "done" : "next"
                    }
                    onSubmitEditing={onSubmit}
                    editable={editable}
                    style={styles.passwordInput}
                />

                <Pressable
                    onPress={onToggleVisibility}
                    hitSlop={10}
                    style={styles.passwordButton}
                >
                    <Text
                        style={
                            styles.passwordButtonText
                        }
                    >
                        {visible
                            ? hideLabel
                            : showLabel}
                    </Text>
                </Pressable>
            </View>

            {error ? (
                <Text style={styles.fieldErrorText}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}

type InvalidLinkProps = {
    message: string;
    buttonLabel: string;
    onBack: () => void;
};

function InvalidLink({
    message,
    buttonLabel,
    onBack,
}: InvalidLinkProps) {
    return (
        <View style={styles.form}>
            <View
                style={[
                    styles.message,
                    styles.errorMessage,
                ]}
            >
                <Text style={styles.messageErrorText}>
                    {message}
                </Text>
            </View>

            <Pressable
                onPress={onBack}
                style={styles.backButton}
            >
                <Text style={styles.backText}>
                    ← {buttonLabel}
                </Text>
            </Pressable>
        </View>
    );
}

function getParamValue(
    value: string | string[] | undefined,
): string {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
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

    passwordContainerError: {
        borderColor: "#F87171",
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

    fieldErrorText: {
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

    messageErrorText: {
        color: "#FCA5A5",
        fontSize: 14,
        lineHeight: 20,
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
        padding: 8,
    },

    backText: {
        color: "#8B6CFF",
        fontSize: 14,
        fontWeight: "600",
    },
});