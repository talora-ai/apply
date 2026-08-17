import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SectionScreen } from "@/components/platform/section-screen";
const items=[['briefcase-outline','Candidaturas','/applications'],['heart-outline','Favoritas','/favorites'],['analytics-outline','Análises','/analytics'],['settings-outline','Configurações','/settings'],['card-outline','Plano e faturamento','/billing']];
export default function MoreScreen(){const router=useRouter();return <SectionScreen title="Mais" subtitle="Acesse as demais áreas do Talora Apply." icon="grid-outline"><View style={styles.list}>{items.map(([icon,label,href])=><Pressable key={href} onPress={()=>router.push(href as never)} style={styles.item}><View style={styles.icon}><Ionicons name={icon as never} size={21} color="#9B84FF"/></View><Text style={styles.label}>{label}</Text><Ionicons name="chevron-forward" size={18} color="#64748B"/></Pressable>)}</View></SectionScreen>}
const styles=StyleSheet.create({list:{gap:10},item:{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:'#1E293B',backgroundColor:'#161C2D',borderRadius:16,padding:14},icon:{width:40,height:40,borderRadius:12,backgroundColor:'rgba(109,74,255,.12)',alignItems:'center',justifyContent:'center'},label:{flex:1,color:'#F8FAFC',fontWeight:'700'}})
