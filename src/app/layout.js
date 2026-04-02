import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import AdminTrigger from "@/components/AdminTrigger";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Cloth Ship — Tradition with a Modern Twist",
  description: "Discover premium traditional clothing with a contemporary edge. Shop handcrafted sarees, panjabis, kurtas, and more at Cloth Ship.",
  keywords: "traditional clothing, sarees, panjabis, kurtas, Bangladeshi fashion, Cloth Ship",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AdminTrigger />
        {children}
      </body>
    </html>
  );
}
