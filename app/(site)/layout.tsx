import SiteHeader from "@/components/SiteHeader";
import FloatingContact from "@/components/FloatingContact";
import SiteFooter from "@/components/SiteFooter";

const phone = "0392048571";
const zaloLink = `https://zalo.me/${phone}`;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader phone={phone} zaloLink={zaloLink} />
      {children}
      <FloatingContact />
      <SiteFooter
        address="Trịnh Nguyễn - Châu Khê - Từ Sơn- Bắc Ninh."
        hotline="0392048571"
        fanpageUrl="https://facebook.com/..."
        bank={{
          owner: "Nguyễn Tiến Mạo",
          accountNumber: "0392048571",
          bankName: "MBBank - Ngân hàng Thương mại Cổ phần Quân đội",
        }}
      />
    </>
  );
}
