import SiteLayout from "./(site)/layout";
import SiteNotFound from "./(site)/not-found";

/** 어떤 라우트에도 맞지 않는 주소 — 공개 사이트 틀 안에서 404 안내 */
export default function NotFound() {
  return (
    <SiteLayout params={Promise.resolve({})}>
      <SiteNotFound />
    </SiteLayout>
  );
}
