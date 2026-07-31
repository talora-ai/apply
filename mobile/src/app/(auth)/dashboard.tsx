import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Image,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

type StatisticCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    accent?: "purple" | "green";
    wide: boolean;
};

type Job = {
    id: number;
    company: string;
    title: string;
    location: string;
    compatibility: number;
};

type Skill = {
    id: number;
    name: string;
    compatibility: number;
};

const jobs: Job[] = [
    {
        id: 1,
        company: "Nubank",
        title: "Backend Developer Pleno",
        location: "Remoto",
        compatibility: 96,
    },
    {
        id: 2,
        company: "Mercado Livre",
        title: "PHP Developer",
        location: "São Paulo · Híbrido",
        compatibility: 91,
    },
    {
        id: 3,
        company: "iFood",
        title: "Software Engineer",
        location: "Remoto",
        compatibility: 88,
    },
];

const skills: Skill[] = [
    {
        id: 1,
        name: "PHP",
        compatibility: 98,
    },
    {
        id: 2,
        name: "Laravel",
        compatibility: 92,
    },
    {
        id: 3,
        name: "REST APIs",
        compatibility: 85,
    },
    {
        id: 4,
        name: "MySQL",
        compatibility: 80,
    },
    {
        id: 5,
        name: "Docker",
        compatibility: 75,
    },
];

export default function DashboardScreen() {
    const { t } = useTranslation();
    const { width } = useWindowDimensions();

    const isWide = width >= 700;

    const robotScale = useRef(
        new Animated.Value(1),
    ).current;

    const robotGlow = useRef(
        new Animated.Value(0.35),
    ).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(robotScale, {
                        toValue: 1.06,
                        duration: 900,
                        useNativeDriver:
                            Platform.OS !== "web",
                    }),
                    Animated.timing(robotScale, {
                        toValue: 1,
                        duration: 900,
                        useNativeDriver:
                            Platform.OS !== "web",
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(robotGlow, {
                        toValue: 0.85,
                        duration: 900,
                        useNativeDriver:
                            Platform.OS !== "web",
                    }),
                    Animated.timing(robotGlow, {
                        toValue: 0.35,
                        duration: 900,
                        useNativeDriver:
                            Platform.OS !== "web",
                    }),
                ]),
            ]),
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [robotGlow, robotScale]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            <View style={styles.page}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.topBar}>
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

                            <Pressable style={styles.notificationButton}>
                                <Ionicons
                                    name="notifications-outline"
                                    size={22}
                                    color="#CBD5E1"
                                />

                                <View style={styles.notificationDot} />
                            </Pressable>
                        </View>

                        <View style={styles.header}>
                            <Text style={styles.greeting}>
                                {t("dashboard.greeting")}
                            </Text>

                            <Text style={styles.title}>
                                {t("dashboard.title")}
                            </Text>

                            <Text style={styles.subtitle}>
                                {t("dashboard.subtitle")}
                            </Text>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons
                                name="search-outline"
                                size={20}
                                color="#64748B"
                            />

                            <TextInput
                                placeholder={t(
                                    "dashboard.searchPlaceholder",
                                )}
                                placeholderTextColor="#64748B"
                                style={styles.searchInput}
                            />

                            <Pressable style={styles.filterButton}>
                                <Ionicons
                                    name="options-outline"
                                    size={19}
                                    color="#F8FAFC"
                                />
                            </Pressable>
                        </View>

                        <View style={styles.statisticsGrid}>
                            <StatisticCard
                                icon="briefcase-outline"
                                label={t(
                                    "dashboard.statistics.jobsFound",
                                )}
                                value="245"
                                accent="green"
                                wide={isWide}
                            />

                            <StatisticCard
                                icon="analytics-outline"
                                label={t(
                                    "dashboard.statistics.compatibility",
                                )}
                                value="84%"
                                accent="purple"
                                wide={isWide}
                            />

                            <StatisticCard
                                icon="send-outline"
                                label={t(
                                    "dashboard.statistics.applications",
                                )}
                                value="12"
                                accent="purple"
                                wide={isWide}
                            />

                            <StatisticCard
                                icon="time-outline"
                                label={t(
                                    "dashboard.statistics.lastSearch",
                                )}
                                value={t("dashboard.statistics.today")}
                                accent="green"
                                wide={isWide}
                            />
                        </View>

                        <View
                            style={[
                                styles.contentGrid,
                                isWide && styles.contentGridWide,
                            ]}
                        >
                            <View
                                style={[
                                    styles.column,
                                    isWide && styles.columnWide,
                                ]}
                            >
                                <View style={styles.sectionHeader}>
                                    <View>
                                        <Text style={styles.sectionTitle}>
                                            {t(
                                                "dashboard.jobs.title",
                                            )}
                                        </Text>

                                        <Text
                                            style={
                                                styles.sectionSubtitle
                                            }
                                        >
                                            {t(
                                                "dashboard.jobs.subtitle",
                                            )}
                                        </Text>
                                    </View>

                                    <Pressable>
                                        <Text style={styles.seeAll}>
                                            {t("common.seeAll")}
                                        </Text>
                                    </Pressable>
                                </View>

                                <View style={styles.panel}>
                                    {jobs.map((job, index) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            last={
                                                index ===
                                                jobs.length - 1
                                            }
                                            remoteLabel={t(
                                                "dashboard.jobs.remote",
                                            )}
                                            compatibilityLabel={t(
                                                "dashboard.jobs.compatibility",
                                            )}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View
                                style={[
                                    styles.column,
                                    isWide && styles.columnWide,
                                ]}
                            >
                                <View style={styles.sectionHeader}>
                                    <View>
                                        <Text style={styles.sectionTitle}>
                                            {t(
                                                "dashboard.skills.title",
                                            )}
                                        </Text>

                                        <Text
                                            style={
                                                styles.sectionSubtitle
                                            }
                                        >
                                            {t(
                                                "dashboard.skills.subtitle",
                                            )}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.panel}>
                                    {skills.map((skill) => (
                                        <SkillProgress
                                            key={skill.id}
                                            skill={skill}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.aiCard}>
                            <View style={styles.aiDecorOne} />
                            <View style={styles.aiDecorTwo} />

                            <View style={styles.aiHeader}>
                                <View>
                                    <View style={styles.aiTitleRow}>
                                        <Ionicons
                                            name="sparkles"
                                            size={19}
                                            color="#15D0A5"
                                        />

                                        <Text style={styles.aiTitle}>
                                            Talora AI
                                        </Text>
                                    </View>

                                    <Text style={styles.aiOnline}>
                                        {t("dashboard.ai.online")}
                                    </Text>
                                </View>

                                <View style={styles.aiStatus}>
                                    <View style={styles.aiStatusDot} />

                                    <Text style={styles.aiStatusText}>
                                        AI
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.aiContent}>
                                <Animated.View
                                    style={[
                                        styles.robotGlow,
                                        {
                                            opacity: robotGlow,
                                            transform: [
                                                {
                                                    scale: robotScale,
                                                },
                                            ],
                                        },
                                    ]}
                                />

                                <Animated.View
                                    style={[
                                        styles.robot,
                                        {
                                            transform: [
                                                {
                                                    scale: robotScale,
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <View style={styles.robotAntenna}>
                                        <View
                                            style={
                                                styles.robotAntennaDot
                                            }
                                        />
                                    </View>

                                    <View style={styles.robotFace}>
                                        <View style={styles.robotEye} />
                                        <View style={styles.robotEye} />
                                    </View>

                                    <View style={styles.robotMouth} />
                                </Animated.View>

                                <View style={styles.aiMessage}>
                                    <Text style={styles.aiMessageTitle}>
                                        {t(
                                            "dashboard.ai.analysisTitle",
                                        )}
                                    </Text>

                                    <Text style={styles.aiMessageText}>
                                        {t(
                                            "dashboard.ai.analysisDescription",
                                        )}
                                    </Text>

                                    <Text style={styles.aiPosition}>
                                        Backend Developer Pleno
                                    </Text>

                                    <View style={styles.tags}>
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>
                                                PHP
                                            </Text>
                                        </View>

                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>
                                                Laravel
                                            </Text>
                                        </View>

                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>
                                                APIs
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.aiButton,
                                    pressed && styles.aiButtonPressed,
                                ]}
                            >
                                <Ionicons
                                    name="sparkles-outline"
                                    size={18}
                                    color="#0B1020"
                                />

                                <Text style={styles.aiButtonText}>
                                    {t("dashboard.ai.action")}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomNavigation}>
                    <NavigationItem
                        icon="home"
                        label={t("navigation.home")}
                        active
                    />

                    <NavigationItem
                        icon="search-outline"
                        label={t("navigation.search")}
                    />

                    <NavigationItem
                        icon="document-text-outline"
                        label={t("navigation.resumes")}
                    />

                    <NavigationItem
                        icon="person-outline"
                        label={t("navigation.profile")}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

function StatisticCard({
    icon,
    label,
    value,
    accent = "purple",
    wide,
}: StatisticCardProps) {
    const color =
        accent === "green"
            ? "#15D0A5"
            : "#8B6CFF";

    return (
        <View
            style={[
                styles.statisticCard,
                {
                    width: wide
                        ? "23.5%"
                        : "48%",
                },
            ]}
        >
            <View style={styles.statisticHeader}>
                <View
                    style={[
                        styles.statisticIcon,
                        {
                            backgroundColor:
                                accent === "green"
                                    ? "rgba(21,208,165,0.12)"
                                    : "rgba(109,74,255,0.14)",
                        },
                    ]}
                >
                    <Ionicons
                        name={icon}
                        size={20}
                        color={color}
                    />
                </View>
            </View>

            <Text style={styles.statisticValue}>
                {value}
            </Text>

            <Text style={styles.statisticLabel}>
                {label}
            </Text>
        </View>
    );
}

function JobCard({
    job,
    last,
    remoteLabel,
    compatibilityLabel,
}: {
    job: Job;
    last: boolean;
    remoteLabel: string;
    compatibilityLabel: string;
}) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.jobCard,
                !last && styles.jobCardBorder,
                pressed && styles.jobCardPressed,
            ]}
        >
            <View style={styles.companyLogo}>
                <Text style={styles.companyInitial}>
                    {job.company.charAt(0)}
                </Text>
            </View>

            <View style={styles.jobInformation}>
                <Text
                    style={styles.jobTitle}
                    numberOfLines={1}
                >
                    {job.title}
                </Text>

                <Text style={styles.companyName}>
                    {job.company}
                </Text>

                <View style={styles.jobLocation}>
                    <Ionicons
                        name="location-outline"
                        size={13}
                        color="#64748B"
                    />

                    <Text style={styles.jobLocationText}>
                        {job.location === "Remoto"
                            ? remoteLabel
                            : job.location}
                    </Text>
                </View>
            </View>

            <View style={styles.compatibility}>
                <Text style={styles.compatibilityValue}>
                    {job.compatibility}%
                </Text>

                <Text style={styles.compatibilityLabel}>
                    {compatibilityLabel}
                </Text>
            </View>
        </Pressable>
    );
}

function SkillProgress({
    skill,
}: {
    skill: Skill;
}) {
    return (
        <View style={styles.skill}>
            <View style={styles.skillHeader}>
                <Text style={styles.skillName}>
                    {skill.name}
                </Text>

                <Text style={styles.skillValue}>
                    {skill.compatibility}%
                </Text>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressValue,
                        {
                            width: `${skill.compatibility}%`,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

function NavigationItem({
    icon,
    label,
    active = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    active?: boolean;
}) {
    return (
        <Pressable style={styles.navigationItem}>
            <Ionicons
                name={icon}
                size={22}
                color={active ? "#8B6CFF" : "#64748B"}
            />

            <Text
                style={[
                    styles.navigationLabel,
                    active &&
                        styles.navigationLabelActive,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0B1020",
    },
    page: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 108,
    },
    container: {
        width: "100%",
        maxWidth: 980,
        alignSelf: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logo: {
        width: 42,
        height: 42,
    },
    brandName: {
        color: "#F8FAFC",
        fontSize: 20,
        fontWeight: "800",
        lineHeight: 21,
    },
    brandProduct: {
        color: "#15D0A5",
        fontSize: 12,
        fontWeight: "700",
    },
    notificationButton: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#293349",
        borderRadius: 14,
        backgroundColor: "#161C2D",
    },
    notificationDot: {
        position: "absolute",
        top: 9,
        right: 10,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#15D0A5",
    },
    header: {
        marginTop: 32,
        marginBottom: 24,
    },
    greeting: {
        color: "#8B6CFF",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 7,
    },
    title: {
        color: "#F8FAFC",
        fontSize: 29,
        lineHeight: 37,
        fontWeight: "800",
    },
    subtitle: {
        color: "#94A3B8",
        fontSize: 14,
        lineHeight: 22,
        marginTop: 8,
        maxWidth: 560,
    },
    searchContainer: {
        height: 54,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderColor: "#293349",
        borderRadius: 16,
        backgroundColor: "#161C2D",
        paddingLeft: 16,
        paddingRight: 6,
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        height: "100%",
        color: "#F8FAFC",
        fontSize: 14,
    },
    filterButton: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: "#6D4AFF",
    },
    statisticsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 30,
    },
    statisticCard: {
        minHeight: 142,
        borderWidth: 1,
        borderColor: "#293349",
        borderRadius: 18,
        backgroundColor: "#161C2D",
        padding: 16,
    },
    statisticHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    statisticIcon: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
    },
    statisticValue: {
        color: "#F8FAFC",
        fontSize: 25,
        fontWeight: "800",
        marginTop: 5,
    },
    statisticLabel: {
        color: "#94A3B8",
        fontSize: 12,
        lineHeight: 17,
        marginTop: 5,
    },
    contentGrid: {
        gap: 28,
    },
    contentGridWide: {
        flexDirection: "row",
    },
    column: {
        width: "100%",
    },
    columnWide: {
        flex: 1,
    },
    sectionHeader: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitle: {
        color: "#F8FAFC",
        fontSize: 18,
        fontWeight: "800",
    },
    sectionSubtitle: {
        color: "#64748B",
        fontSize: 12,
        marginTop: 4,
    },
    seeAll: {
        color: "#15D0A5",
        fontSize: 12,
        fontWeight: "700",
    },
    panel: {
        borderWidth: 1,
        borderColor: "#293349",
        borderRadius: 20,
        backgroundColor: "#161C2D",
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    jobCard: {
        minHeight: 100,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
    },
    jobCardBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#293349",
    },
    jobCardPressed: {
        opacity: 0.7,
    },
    companyLogo: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        backgroundColor: "rgba(109,74,255,0.15)",
    },
    companyInitial: {
        color: "#A78BFA",
        fontSize: 18,
        fontWeight: "800",
    },
    jobInformation: {
        flex: 1,
        paddingHorizontal: 12,
    },
    jobTitle: {
        color: "#F8FAFC",
        fontSize: 14,
        fontWeight: "700",
    },
    companyName: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 4,
    },
    jobLocation: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        marginTop: 5,
    },
    jobLocationText: {
        color: "#64748B",
        fontSize: 11,
    },
    compatibility: {
        alignItems: "flex-end",
    },
    compatibilityValue: {
        color: "#15D0A5",
        fontSize: 18,
        fontWeight: "800",
    },
    compatibilityLabel: {
        color: "#64748B",
        fontSize: 9,
        marginTop: 2,
    },
    skill: {
        paddingVertical: 14,
    },
    skillHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 9,
    },
    skillName: {
        color: "#CBD5E1",
        fontSize: 13,
        fontWeight: "600",
    },
    skillValue: {
        color: "#15D0A5",
        fontSize: 13,
        fontWeight: "800",
    },
    progressTrack: {
        height: 7,
        borderRadius: 4,
        backgroundColor: "#252B3D",
        overflow: "hidden",
    },
    progressValue: {
        height: "100%",
        borderRadius: 4,
        backgroundColor: "#15D0A5",
    },
    aiCard: {
        position: "relative",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#6D4AFF",
        borderRadius: 24,
        backgroundColor: "#161C2D",
        padding: 20,
        marginTop: 30,
    },
    aiDecorOne: {
        position: "absolute",
        top: -80,
        right: -60,
        width: 190,
        height: 190,
        borderRadius: 100,
        backgroundColor: "rgba(109,74,255,0.13)",
    },
    aiDecorTwo: {
        position: "absolute",
        bottom: -90,
        left: -60,
        width: 180,
        height: 180,
        borderRadius: 100,
        backgroundColor: "rgba(21,208,165,0.06)",
    },
    aiHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    aiTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    aiTitle: {
        color: "#F8FAFC",
        fontSize: 20,
        fontWeight: "800",
    },
    aiOnline: {
        color: "#15D0A5",
        fontSize: 11,
        marginTop: 5,
    },
    aiStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "rgba(21,208,165,0.25)",
        borderRadius: 20,
        backgroundColor: "rgba(21,208,165,0.08)",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    aiStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#15D0A5",
    },
    aiStatusText: {
        color: "#15D0A5",
        fontSize: 10,
        fontWeight: "800",
    },
    aiContent: {
        alignItems: "center",
        paddingVertical: 28,
    },
    robotGlow: {
        position: "absolute",
        top: 12,
        width: 145,
        height: 145,
        borderRadius: 73,
        backgroundColor: "#6D4AFF",
    },
    robot: {
        width: 112,
        height: 96,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 8,
        borderColor: "#F8FAFC",
        borderRadius: 38,
        backgroundColor: "#0B1020",
        marginTop: 10,
    },
    robotAntenna: {
        position: "absolute",
        top: -26,
        width: 3,
        height: 20,
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    robotAntennaDot: {
        position: "absolute",
        top: -7,
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: "#15D0A5",
    },
    robotFace: {
        flexDirection: "row",
        gap: 25,
    },
    robotEye: {
        width: 13,
        height: 13,
        borderRadius: 7,
        backgroundColor: "#15D0A5",
    },
    robotMouth: {
        width: 30,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#8B6CFF",
        marginTop: 17,
    },
    aiMessage: {
        alignItems: "center",
        marginTop: 28,
    },
    aiMessageTitle: {
        color: "#F8FAFC",
        fontSize: 18,
        fontWeight: "800",
        textAlign: "center",
    },
    aiMessageText: {
        color: "#94A3B8",
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
        marginTop: 8,
        maxWidth: 450,
    },
    aiPosition: {
        color: "#15D0A5",
        fontSize: 14,
        fontWeight: "800",
        marginTop: 14,
    },
    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        marginTop: 14,
    },
    tag: {
        borderWidth: 1,
        borderColor: "rgba(109,74,255,0.55)",
        borderRadius: 9,
        backgroundColor: "rgba(109,74,255,0.10)",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    tagText: {
        color: "#C4B5FD",
        fontSize: 11,
        fontWeight: "700",
    },
    aiButton: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 14,
        backgroundColor: "#15D0A5",
    },
    aiButtonPressed: {
        opacity: 0.8,
        transform: [
            {
                scale: 0.99,
            },
        ],
    },
    aiButtonText: {
        color: "#0B1020",
        fontSize: 14,
        fontWeight: "800",
    },
    bottomNavigation: {
        position: "absolute",
        right: 0,
        bottom: 0,
        left: 0,
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderTopWidth: 1,
        borderTopColor: "#293349",
        backgroundColor: "rgba(11,16,32,0.98)",
        paddingBottom: 8,
        paddingTop: 8,
    },
    navigationItem: {
        minWidth: 65,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    navigationLabel: {
        color: "#64748B",
        fontSize: 10,
        fontWeight: "600",
    },
    navigationLabelActive: {
        color: "#8B6CFF",
    },
});