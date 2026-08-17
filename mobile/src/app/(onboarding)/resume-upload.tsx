import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "@/features/auth/context/auth-context";
import { uploadResume } from "@/features/resumes/services/resume-service";
import { useToast } from "@/components/feedback/toast-provider";

export default function ResumeUploadScreen() {
    const router = useRouter();
    const { token, user, refreshResumeState } = useAuth();
    const toast = useToast();
    const [asset, setAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [name, setName] = useState("Meu currículo");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function chooseFile() {
        setError(null);
        const result = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            multiple: false,
            copyToCacheDirectory: true,
        });
        if (!result.canceled) setAsset(result.assets[0] ?? null);
    }

    async function submit() {
        if (!token || !asset) {
            setError("Selecione um currículo em PDF ou DOCX.");
            return;
        }
        if (asset.size && asset.size > 10 * 1024 * 1024) {
            setError("O currículo deve ter no máximo 10 MB.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await uploadResume({ token, file: { uri: asset.uri, name: asset.name, mimeType: asset.mimeType }, name: name.trim() || "Meu currículo" });
            await refreshResumeState();
            toast.success("Currículo enviado e adicionado à fila de processamento.");
            router.replace("/");
        } catch (uploadError) {
            console.error(uploadError);
            setError("Não foi possível enviar o currículo. Verifique o arquivo e tente novamente.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.badge}><Text style={styles.badgeText}>PRIMEIRO PASSO</Text></View>
                <Text style={styles.title}>Olá, {user?.name ?? ""}. Vamos conhecer o seu perfil.</Text>
                <Text style={styles.subtitle}>Envie seu primeiro currículo para liberar análise, compatibilidade e as próximas experiências do Talora Apply.</Text>

                <View style={styles.steps}>
                    {[['document-text-outline','Leitura'],['sparkles-outline','Análise'],['locate-outline','Match']].map(([icon,label]) => (
                        <View key={label} style={styles.step}><Ionicons name={icon as never} size={21} color="#9B84FF"/><Text style={styles.stepText}>{label}</Text></View>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Seu currículo</Text>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Meu currículo" placeholderTextColor="#64748B" />
                    <Pressable onPress={() => void chooseFile()} style={styles.picker}>
                        <Ionicons name="cloud-upload-outline" size={34} color="#9B84FF" />
                        <Text style={styles.pickerTitle}>{asset?.name ?? "Selecionar arquivo"}</Text>
                        <Text style={styles.pickerText}>PDF ou DOCX · até 10 MB</Text>
                    </Pressable>
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <Pressable disabled={submitting} onPress={() => void submit()} style={[styles.button, submitting && styles.buttonDisabled]}>
                        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <><Ionicons name="arrow-forward" size={18} color="#FFFFFF"/><Text style={styles.buttonText}>Enviar e continuar</Text></>}
                    </Pressable>
                    <View style={styles.security}><Ionicons name="shield-checkmark-outline" size={17} color="#15D0A5"/><Text style={styles.securityText}>Seu currículo é armazenado de forma privada e processado pelo pipeline seguro do Talora. Após a análise, escolha qual CV será o principal.</Text></View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea:{flex:1,backgroundColor:'#0B1020'}, content:{padding:24,paddingTop:52,paddingBottom:42},
    badge:{alignSelf:'flex-start',borderWidth:1,borderColor:'rgba(21,208,165,.35)',backgroundColor:'rgba(21,208,165,.10)',paddingHorizontal:10,paddingVertical:6,borderRadius:999}, badgeText:{color:'#4BE3BF',fontSize:11,fontWeight:'800',letterSpacing:1.2},
    title:{color:'#F8FAFC',fontSize:32,lineHeight:39,fontWeight:'800',marginTop:20}, subtitle:{color:'#94A3B8',fontSize:15,lineHeight:23,marginTop:12},
    steps:{flexDirection:'row',gap:10,marginTop:24}, step:{flex:1,borderWidth:1,borderColor:'#1E293B',backgroundColor:'#161C2D',borderRadius:16,padding:14,gap:8},stepText:{color:'#E2E8F0',fontSize:12,fontWeight:'700'},
    card:{marginTop:24,borderWidth:1,borderColor:'#334155',backgroundColor:'#161C2D',borderRadius:24,padding:20},cardTitle:{color:'#FFF',fontSize:20,fontWeight:'800',marginBottom:20},label:{color:'#CBD5E1',fontSize:13,fontWeight:'600',marginBottom:8},
    input:{borderWidth:1,borderColor:'#334155',backgroundColor:'#0B1020',borderRadius:13,paddingHorizontal:14,paddingVertical:13,color:'#FFF'},
    picker:{borderWidth:1,borderStyle:'dashed',borderColor:'#475569',backgroundColor:'#0B1020',borderRadius:18,padding:25,alignItems:'center',marginTop:16},pickerTitle:{color:'#F8FAFC',fontWeight:'700',marginTop:10,textAlign:'center'},pickerText:{color:'#64748B',fontSize:12,marginTop:5},error:{color:'#FDA4AF',fontSize:13,marginTop:12},
    button:{marginTop:18,minHeight:52,borderRadius:14,backgroundColor:'#6D4AFF',alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},buttonDisabled:{opacity:.65},buttonText:{color:'#FFF',fontWeight:'800'},
    security:{flexDirection:'row',gap:8,marginTop:14,alignItems:'flex-start'},securityText:{color:'#64748B',fontSize:11,lineHeight:17,flex:1},
});
