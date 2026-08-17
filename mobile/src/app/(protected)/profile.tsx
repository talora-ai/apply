import { StyleSheet, Text, View } from "react-native";
import { SectionScreen } from "@/components/platform/section-screen";
import { useAuth } from "@/features/auth/context/auth-context";
export default function ProfileScreen(){const {user}=useAuth();return <SectionScreen title="Meu perfil" subtitle="Informações básicas da sua conta e do seu perfil profissional." icon="person-circle-outline"><View style={styles.card}><Text style={styles.label}>NOME</Text><Text style={styles.value}>{`${user?.name ?? ''} ${user?.last_name ?? ''}`.trim()}</Text><Text style={[styles.label,{marginTop:18}]}>E-MAIL</Text><Text style={styles.value}>{user?.email ?? '—'}</Text></View></SectionScreen>}
const styles=StyleSheet.create({card:{borderWidth:1,borderColor:'#1E293B',backgroundColor:'#161C2D',borderRadius:20,padding:20},label:{color:'#64748B',fontSize:11,fontWeight:'800',letterSpacing:1},value:{color:'#F8FAFC',fontSize:16,fontWeight:'700',marginTop:5}})
