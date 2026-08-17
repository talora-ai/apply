import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export function SectionScreen({
    title,
    subtitle,
    icon,
    children,
}: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    children?: React.ReactNode;
}) {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.page}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.icon}><Ionicons name={icon} size={24} color="#9B84FF" /></View>
                        <View style={styles.headerText}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
                    </View>
                    {children}
                </ScrollView>
                <View style={styles.nav}>
                    <Nav icon="home-outline" label="Início" onPress={() => router.replace("/dashboard")} />
                    <Nav icon="search-outline" label="Buscar" onPress={() => router.push("/explore")} />
                    <Nav icon="document-text-outline" label="Currículos" onPress={() => router.push("/resumes")} />
                    <Nav icon="person-outline" label="Perfil" onPress={() => router.push("/profile")} />
                    <Nav icon="grid-outline" label="Mais" onPress={() => router.push("/more")} />
                </View>
            </View>
        </SafeAreaView>
    );
}

export function EmptyCard({ title, text }: { title: string; text: string }) {
    return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardText}>{text}</Text></View>;
}

function Nav({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
    return <Pressable onPress={onPress} style={styles.navItem}><Ionicons name={icon} size={21} color="#8B6CFF"/><Text style={styles.navLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
    safeArea:{flex:1,backgroundColor:'#0B1020'},page:{flex:1},content:{padding:20,paddingBottom:110},
    header:{flexDirection:'row',gap:14,alignItems:'flex-start',borderWidth:1,borderColor:'#1E293B',backgroundColor:'#161C2D',borderRadius:22,padding:18,marginTop:10,marginBottom:18},icon:{width:48,height:48,borderRadius:15,backgroundColor:'rgba(109,74,255,.14)',alignItems:'center',justifyContent:'center'},headerText:{flex:1},title:{color:'#F8FAFC',fontSize:24,fontWeight:'800'},subtitle:{color:'#94A3B8',fontSize:13,lineHeight:20,marginTop:5},
    card:{borderWidth:1,borderColor:'#1E293B',backgroundColor:'#161C2D',borderRadius:20,padding:20,marginBottom:12},cardTitle:{color:'#F8FAFC',fontSize:16,fontWeight:'800'},cardText:{color:'#94A3B8',fontSize:13,lineHeight:20,marginTop:6},
    nav:{position:'absolute',left:0,right:0,bottom:0,flexDirection:'row',justifyContent:'space-around',borderTopWidth:1,borderTopColor:'#293349',backgroundColor:'rgba(11,16,32,.98)',paddingTop:9,paddingBottom:10},navItem:{minWidth:58,alignItems:'center',gap:3},navLabel:{color:'#94A3B8',fontSize:9,fontWeight:'700'},
});
