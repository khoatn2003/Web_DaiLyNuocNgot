// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { SITE } from "@/lib/site";
// import FloatingContact from "@/components/FloatingContact";
// import Head from "next/head";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: SITE.name,
//   description: "Website giới thiệu sản phẩm – liên hệ qua điện thoại hoặc Zalo.",
// };


// export default function RootLayout({
// children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="vi">
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         {children}
//          <FloatingContact />
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import FloatingContact from "@/components/FloatingContact";
import { SITE } from "@/lib/site";
// import FloatingContact from "@/components/FloatingContact";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: SITE.name,
  description: "Website giới thiệu sản phẩm – liên hệ qua điện thoại hoặc Zalo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${jakarta.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
