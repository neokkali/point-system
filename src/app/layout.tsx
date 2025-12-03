import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import ReactQueryProvider from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal-arabix",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ka3.vercel.app"), // ضع رابط موقعك

  title: {
    default: "حساب نقاط المقالات والمسابقات - أسرع وأدق نظام عربي",
    template: "%s | حساب نقاط المقالات",
  },

  description:
    "أفضل موقع لحساب نقاط المقالات والمسابقات، قياس سرعة الكتابة WPM، وعرض المتصدرين. يدعم اللغة العربية ويعمل بدقة عالية مثل مواقع الكتابة العالمية.",

  keywords: [
    "حساب نقاط المقالات",
    "مسابقات كتابة",
    "حساب سرعة الكتابة",
    "wpm",
    "موقع كتابة عربي",
    "مسابقات نصية",
    "test typing",
    "قياس سرعة الكتابة",
  ],

  openGraph: {
    title: "حساب نقاط المقالات والمسابقات",
    description:
      "موقع متخصص لحساب النقاط وسرعة الكتابة وعرض المتصدرين بطريقة عربية احترافية.",
    url: "https://ka3.vercel.app",
    siteName: "حساب نقاط المقالات والمسابقات",
    type: "website",
    locale: "ar_AR",
  },

  twitter: {
    card: "summary_large_image",
    title: "حساب نقاط المقالات والمسابقات",
    description: "أفضل موقع عربي لحساب سرعة الكتابة والنقاط وعرض المتصدرين.",
  },

  alternates: {
    canonical: "https://ka3.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="qFH1UgQsCxcsRptyv38ySF7EkmT6encpPGOnvMFiOGg"
        />
      </head>
      <body className={`${tajawal.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 p-1 lg:p-10">{children}</main>
                <div className=""></div>
              </div>
            </AuthProvider>
          </ReactQueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
