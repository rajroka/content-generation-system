import { Navbar } from "@/componentss/shared/Navbar";
import { Footer } from "@/componentss/shared/Footer";
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <>
      <Navbar />
        <main className="">{children}</main>
      <Footer />
    </>
  );
}