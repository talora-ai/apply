import { Ionicons } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ToastKind = "success" | "error" | "info";
type ToastPayload = { kind: ToastKind; title: string; message?: string };
type ToastApi = {
    show: (payload: ToastPayload) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastPayload | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = useCallback((payload: ToastPayload) => {
        if (timer.current) clearTimeout(timer.current);
        setToast(payload);
        timer.current = setTimeout(() => setToast(null), 3200);
    }, []);

    const value = useMemo<ToastApi>(() => ({
        show,
        success: (message, title = "Sucesso") => show({ kind: "success", title, message }),
        error: (message, title = "Erro") => show({ kind: "error", title, message }),
    }), [show]);

    return <ToastContext.Provider value={value}>
        {children}
        {toast ? <View pointerEvents="box-none" style={styles.layer}><Pressable onPress={() => setToast(null)} style={[styles.toast, toast.kind === "success" ? styles.success : toast.kind === "error" ? styles.error : styles.info]}>
            <View style={styles.icon}><Ionicons name={toast.kind === "success" ? "checkmark-circle" : toast.kind === "error" ? "alert-circle" : "information-circle"} size={22} color={toast.kind === "success" ? "#4BE3BF" : toast.kind === "error" ? "#FDA4AF" : "#B8A7FF"}/></View>
            <View style={styles.text}><Text style={styles.title}>{toast.title}</Text>{toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}</View>
            <Ionicons name="close" size={18} color="#64748B" />
        </Pressable></View> : null}
    </ToastContext.Provider>;
}

export function useToast(): ToastApi {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToastProvider");
    return context;
}

const styles = StyleSheet.create({
    layer: { position: "absolute", left: 16, right: 16, top: 54, zIndex: 9999 },
    toast: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#161C2D", shadowColor: "#000", shadowOpacity: .28, shadowRadius: 18, elevation: 12 },
    success: { borderColor: "rgba(21,208,165,.45)" },
    error: { borderColor: "rgba(244,63,94,.45)" },
    info: { borderColor: "rgba(109,74,255,.45)" },
    icon: { width: 30, alignItems: "center" }, text: { flex: 1 }, title: { color: "#F8FAFC", fontSize: 13, fontWeight: "900" }, message: { color: "#94A3B8", fontSize: 11, lineHeight: 16, marginTop: 2 },
});
