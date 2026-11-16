import { StaticPage, staticPageMetadata } from "@/components/content/StaticPage";

export const metadata = staticPageMetadata("/support");

export default function Page() {
  return <StaticPage path="/support" />;
}
