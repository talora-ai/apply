import { Settings } from "lucide-react";
import { AccountSettingsForm } from "@/features/account/components/account-settings-form";
import { getAuthenticatedUser } from "@/features/auth/services/get-authenticated-user";
import { FeaturePage } from "@/features/platform/components/feature-page";

export default async function SettingsPage() {
    const user = await getAuthenticatedUser();
    if (!user) return null;
    return <FeaturePage eyebrow="Conta e segurança" title="Configurações" description="Atualize seus dados pessoais e sua senha. O e-mail é a identidade da conta e permanece bloqueado para edição." icon={Settings}><AccountSettingsForm user={user}/></FeaturePage>;
}
