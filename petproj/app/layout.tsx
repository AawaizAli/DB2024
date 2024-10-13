// app/layout.tsx
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import ClientProvider from "./ClientProvider"; // Import your ClientProvider
import "./globals.css";

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
});

export const metadata: Metadata = {
    title: "paltuu.pk",
    description: "Pakistan's First Pet Adoption Platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={montserrat.className}>
                {/* Wrap the children with ClientProvider */}
                <ClientProvider>{children}</ClientProvider>
            </body>
        </html>
    );
}
