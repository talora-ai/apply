import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "Talora Apply",
        template: "%s | Talora Apply",
    },
    description: "Seu agente inteligente de carreira.",
};

type RootLayoutProps = Readonly<{
    children: React.ReactNode;
}>;

export default async function RootLayout({
    children,
}: RootLayoutProps) {
    const locale = await getLocale();

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider>
                    {children}

                    <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        theme="dark"
                    />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}