"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitInquiry } from "@/actions/public";
import { Icon } from "@/components/ui/Icon";

/**
 * 상담 및 제안 (원본 form 스킨 #formWr) — 비회원 작성, 관리자만 열람.
 * 원본의 자동등록방지 그림문자(kcaptcha) 대신 보이지 않는 칸 + 최소 작성 시간 + IP당 횟수 제한.
 */
export function ContactForm({ privacy }: { privacy: string }) {
  const [state, action, pending] = useActionState(submitInquiry, null);
  // 작성 시작 시각 (너무 빨리 제출되면 자동 등록으로 봄) — 화면에 붙은 뒤에 기록
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current && !startedAt.current.value) startedAt.current.value = String(Date.now());
  });
  const v = state?.values ?? {};

  if (state?.ok) {
    return (
      <div id="formWr">
        <p className="form_msg ok" role="status">
          상담 및 제안이 접수되었습니다. 남겨 주신 연락처로 답변드리겠습니다.
        </p>
        <div className="btn_confirm">
          <a href="/contact" className="btn_submit" style={{ borderRadius: 60 }}>
            새로 작성하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <form id="formWr" action={action} noValidate={false}>
      <input ref={startedAt} type="hidden" name="t" defaultValue="" />
      <div className="hp_field" aria-hidden="true">
        <label>
          홈페이지
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="write_div">
        <label htmlFor="ct_name" className="sound_only required_label">
          이름
        </label>
        <input id="ct_name" name="name" type="text" required maxLength={50} defaultValue={v.name} className="frm_input" placeholder="이름 (필수)" autoComplete="name" />
      </div>
      <div className="formCol2wr">
        <div className="write_div">
          <label htmlFor="ct_email" className="sound_only">
            이메일
          </label>
          <input id="ct_email" name="email" type="email" maxLength={120} defaultValue={v.email} className="frm_input" placeholder="이메일" autoComplete="email" />
        </div>
        <div className="write_div">
          <label htmlFor="ct_phone" className="sound_only">
            연락처
          </label>
          <input id="ct_phone" name="phone" type="tel" maxLength={40} defaultValue={v.phone} className="frm_input" placeholder="연락처" autoComplete="tel" />
        </div>
      </div>
      <div className="write_div">
        <label htmlFor="ct_subject" className="sound_only">
          제목
        </label>
        <input id="ct_subject" name="subject" type="text" required maxLength={200} defaultValue={v.subject} className="frm_input" placeholder="제목 (필수)" />
      </div>
      <div className="write_div">
        <label htmlFor="ct_message" className="sound_only">
          내용
        </label>
        <textarea id="ct_message" name="message" required maxLength={5000} defaultValue={v.message} placeholder="내용 (필수)" />
      </div>

      <div className="agree_box" tabIndex={0} aria-label="개인정보 수집 및 이용 안내">
        {privacy}
      </div>
      <label className="agree_chk">
        <input type="checkbox" name="agree" required /> 개인정보 수집 및 이용에 동의합니다.
      </label>

      {state?.error && (
        <p className="form_msg err" role="alert">
          {state.error}
        </p>
      )}

      <div className="btn_confirm">
        <button type="reset" className="btn_cancel">
          초기화
        </button>
        <button type="submit" className="btn_submit" disabled={pending}>
          <Icon name="send" />
          {pending ? "보내는 중…" : "보내기"}
        </button>
      </div>
    </form>
  );
}
