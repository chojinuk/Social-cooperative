import Link from "next/link";
import { SubPage } from "@/components/layout/SubPage";

export default function NotFound() {
  return (
    <SubPage path="/404" title="페이지를 찾을 수 없습니다">
      <div className="WCMSSwr">
        <div className="noDataArea" style={{ borderBottom: 0 }}>
          <b>404</b>
          요청하신 페이지가 없거나 주소가 바뀌었습니다.
        </div>
        <div className="WCMSScontButtonOutside">
          <div className="WCMSScontWrap contButtonimgAlign_center">
            <Link href="/">메인으로 가기</Link>
          </div>
        </div>
      </div>
    </SubPage>
  );
}
