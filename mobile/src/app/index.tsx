import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/context/auth-context";

export default function IndexScreen() {
    const { status, hasResume } = useAuth();

    return (
        <Redirect
            href={
                status === "authenticated"
                    ? hasResume
                        ? "/dashboard"
                        : "/resume-upload"
                    : "/login"
            }
        />
    );
}
