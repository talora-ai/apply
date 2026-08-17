import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
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

import { register } from "@/features/auth/services/register-service";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/feedback/toast-provider";

type RegisterErrors = {
    name?: string;
    lastName?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    terms?: string;
};

type Feedback = {
    type: "success" | "error";
    message: string;
};

export default function RegisterScreen() {
    const router = useRouter();
    const toast = useToast();
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const [errors, setErrors] = useState<RegisterErrors>({});
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function validate(): boolean {
        const validationErrors: RegisterErrors = {};

        if (name.trim().length < 2) {
            validationErrors.name = t("validation.nameMin");
        }

        if (lastName.trim().length < 2) {
            validationErrors.lastName = t("validation.lastNameMin");
        }

        if (!email.trim()) {
            validationErrors.email = t("validation.emailRequired");
        } else if (!email.includes("@")) {
            validationErrors.email = t("validation.emailInvalid");
        }

        if (password.length < 8) {
            validationErrors.password = t("validation.passwordMin");
        }

        if (passwordConfirmation !== password) {
            validationErrors.passwordConfirmation = t(
                "validation.passwordConfirmation",
            );
        }

        if (!acceptedTerms) {
            validationErrors.terms = t("validation.termsRequired");
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    }

    async function handleRegister(): Promise<void> {
        setFeedback(null);

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                name: name.trim(),
                last_name: lastName.trim(),
                email: email.trim().toLowerCase(),
                password,
                password_confirmation: passwordConfirmation,
            });

            const successMessage = t("register.success");

            setFeedback({
                type: "success",
                message: successMessage,
            });

            if (Platform.OS === "web") {
                window.alert(
                    `${t("common.success")}\n\n${successMessage}`,
                );

                router.replace("/login");

                return;
            }

            Alert.alert(
                t("common.success"),
                successMessage,
                [
                    {
                        text: t("common.login"),
                        onPress: () => {
                            router.replace("/login");
                        },
                    },
                ],
                {
                    cancelable: false,
                },
            );
        } catch (error: unknown) {
            console.error("Register error:", error);

            const message =
                error instanceof ApiError
                    ? error.message
                    : t("errors.unexpected");

            setFeedback({
                type: "error",
                message,
            });

            if (Platform.OS === "web") {
                window.alert(
                    `${t("common.error")}\n\n${message}`,
                );
            } else {
                Alert.alert(
                    t("common.error"),
                    message,
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                            <Text style={styles.title}>
                                {t("register.title")}
                            </Text>

                            <Text style={styles.subtitle}>
                                {t("register.subtitle")}
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.row}>
                                <View style={styles.rowField}>
                                    <Input
                                        label={t("register.name")}
                                        value={name}
                                        onChangeText={setName}
                                        error={errors.name}
                                        autoCapitalize="words"
                                        autoComplete="given-name"
                                    />
                                </View>

                                <View style={styles.rowField}>
                                    <Input
                                        label={t("register.lastName")}
                                        value={lastName}
                                        onChangeText={setLastName}
                                        error={errors.lastName}
                                        autoCapitalize="words"
                                        autoComplete="family-name"
                                    />
                                </View>
                            </View>

                            <Input
                                label={t("register.email")}
                                value={email}
                                onChangeText={setEmail}
                                error={errors.email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                            />

                            <PasswordInput
                                label={t("register.password")}
                                value={password}
                                onChangeText={setPassword}
                                error={errors.password}
                                visible={showPassword}
                                onToggleVisibility={() =>
                                    setShowPassword(
                                        (current) => !current,
                                    )
                                }
                                showLabel={t("login.showPassword")}
                                hideLabel={t("login.hidePassword")}
                                autoComplete="new-password"
                            />

                            <PasswordInput
                                label={t(
                                    "register.passwordConfirmation",
                                )}
                                value={passwordConfirmation}
                                onChangeText={setPasswordConfirmation}
                                error={errors.passwordConfirmation}
                                visible={showPasswordConfirmation}
                                onToggleVisibility={() =>
                                    setShowPasswordConfirmation(
                                        (current) => !current,
                                    )
                                }
                                showLabel={t("login.showPassword")}
                                hideLabel={t("login.hidePassword")}
                                autoComplete="new-password"
                            />

                            <View>
                                <Pressable
                                    style={styles.termsContainer}
                                    onPress={() =>
                                        setAcceptedTerms(
                                            (current) => !current,
                                        )
                                    }
                                >
                                    <Switch
                                        value={acceptedTerms}
                                        onValueChange={setAcceptedTerms}
                                        trackColor={{
                                            false: "#34394D",
                                            true: "#6D4AFF",
                                        }}
                                        thumbColor="#F8FAFC"
                                    />

                                    <Text style={styles.termsText}>
                                        {t("register.acceptTerms")}
                                    </Text>
                                </Pressable>

                                {errors.terms ? (
                                    <Text style={styles.errorText}>
                                        {errors.terms}
                                    </Text>
                                ) : null}
                            </View>

                            {feedback ? (
                                <View
                                    style={[
                                        styles.feedback,
                                        feedback.type === "success"
                                            ? styles.feedbackSuccess
                                            : styles.feedbackError,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.feedbackText,
                                            feedback.type === "success"
                                                ? styles.feedbackSuccessText
                                                : styles.feedbackErrorText,
                                        ]}
                                    >
                                        {feedback.message}
                                    </Text>
                                </View>
                            ) : null}

                            <Pressable
                                style={({ pressed }) => [
                                    styles.submitButton,
                                    pressed &&
                                        styles.submitButtonPressed,
                                    isSubmitting &&
                                        styles.submitButtonDisabled,
                                ]}
                                onPress={handleRegister}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={styles.submitButtonText}
                                    >
                                        {t("register.submit")}
                                    </Text>
                                )}
                            </Pressable>
                        </View>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>
                                {t("register.alreadyHaveAccount")}
                            </Text>

                            <Pressable
                                onPress={() =>
                                    router.replace("/login")
                                }
                            >
                                <Text style={styles.loginLink}>
                                    {t("register.login")}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

type InputProps = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    error?: string;
    keyboardType?: "default" | "email-address";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    autoComplete?: "email" | "given-name" | "family-name";
};

function Input({
    label,
    value,
    onChangeText,
    error,
    keyboardType = "default",
    autoCapitalize = "sentences",
    autoCorrect = true,
    autoComplete,
}: InputProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : undefined,
                ]}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                autoComplete={autoComplete}
                placeholderTextColor="#697089"
            />

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
}

type PasswordInputProps = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    error?: string;
    visible: boolean;
    onToggleVisibility: () => void;
    showLabel: string;
    hideLabel: string;
    autoComplete?: "new-password" | "current-password";
};

function PasswordInput({
    label,
    value,
    onChangeText,
    error,
    visible,
    onToggleVisibility,
    showLabel,
    hideLabel,
    autoComplete,
}: PasswordInputProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <View
                style={[
                    styles.passwordContainer,
                    error ? styles.inputError : undefined,
                ]}
            >
                <TextInput
                    style={styles.passwordInput}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={autoComplete}
                    placeholderTextColor="#697089"
                />

                <Pressable
                    style={styles.visibilityButton}
                    onPress={onToggleVisibility}
                >
                    <Text style={styles.visibilityText}>
                        {visible ? hideLabel : showLabel}
                    </Text>
                </Pressable>
            </View>

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0B1020",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    container: {
        width: "100%",
        maxWidth: 560,
        alignSelf: "center",
    },
    brand: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 36,
    },
    logo: {
        width: 52,
        height: 52,
        marginRight: 12,
    },
    brandName: {
        color: "#F8FAFC",
        fontSize: 27,
        fontWeight: "800",
        lineHeight: 29,
    },
    brandProduct: {
        color: "#15D0A5",
        fontSize: 14,
        fontWeight: "700",
    },
    header: {
        marginBottom: 28,
    },
    title: {
        color: "#F8FAFC",
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 8,
    },
    subtitle: {
        color: "#9EA6BE",
        fontSize: 15,
        lineHeight: 22,
    },
    form: {
        gap: 18,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    rowField: {
        flex: 1,
    },
    field: {
        gap: 8,
    },
    label: {
        color: "#DDE2F1",
        fontSize: 14,
        fontWeight: "600",
    },
    input: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: "#34394D",
        borderRadius: 14,
        backgroundColor: "#161C2D",
        color: "#F8FAFC",
        paddingHorizontal: 16,
        fontSize: 15,
    },
    passwordContainer: {
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#34394D",
        borderRadius: 14,
        backgroundColor: "#161C2D",
    },
    passwordInput: {
        flex: 1,
        minHeight: 50,
        color: "#F8FAFC",
        paddingLeft: 16,
        fontSize: 15,
    },
    visibilityButton: {
        minHeight: 50,
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    visibilityText: {
        color: "#A78BFA",
        fontSize: 13,
        fontWeight: "700",
    },
    inputError: {
        borderColor: "#F87171",
    },
    errorText: {
        color: "#FCA5A5",
        fontSize: 12,
        lineHeight: 17,
    },
    termsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    termsText: {
        flex: 1,
        color: "#AAB1C6",
        fontSize: 13,
        lineHeight: 19,
    },
    feedback: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    feedbackSuccess: {
        borderColor: "rgba(21, 208, 165, 0.35)",
        backgroundColor: "rgba(21, 208, 165, 0.10)",
    },
    feedbackError: {
        borderColor: "rgba(248, 113, 113, 0.35)",
        backgroundColor: "rgba(248, 113, 113, 0.10)",
    },
    feedbackText: {
        fontSize: 13,
        lineHeight: 19,
    },
    feedbackSuccessText: {
        color: "#6EE7C7",
    },
    feedbackErrorText: {
        color: "#FCA5A5",
    },
    submitButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        backgroundColor: "#6D4AFF",
        marginTop: 6,
    },
    submitButtonPressed: {
        opacity: 0.85,
    },
    submitButtonDisabled: {
        opacity: 0.65,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 5,
        marginTop: 28,
    },
    loginText: {
        color: "#8F97AE",
        fontSize: 14,
    },
    loginLink: {
        color: "#A855F7",
        fontSize: 14,
        fontWeight: "700",
    },
});