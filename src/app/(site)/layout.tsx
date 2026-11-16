import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollState } from "@/components/layout/ScrollState";
import "@/styles/site.css";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site-root">
      <Header />
      <div id="topSpacer" />
      <main id="main">{children}</main>
      <Footer />
      <ScrollState />
    </div>
  );
}
