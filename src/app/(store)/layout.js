import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function StoreLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingContact />
      <MobileBottomNav />
    </>
  );
}
