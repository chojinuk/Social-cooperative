"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { savePost, type AttachmentRef } from "@/actions/admin";
import type { BoardType } from "@/db/schema";
import { formatBytes } from "@/lib/format";
import { uploadAttachment, uploadImage } from "@/lib/upload-client";

type FileItem = AttachmentRef & { url?: string };
type Initial = { id?: number; boardType: BoardType; title: string; content: string; isNotice: boolean; isPublished: boolean; files: FileItem[] };

/** 게시글 편집기 (상상마루 PostEditor 기반 + 공지 고정 · 첨부파일) */
export function PostEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [boardType, setBoardType] = useState<BoardType>(initial.boardType);
  const [title, setTitle] = useState(initial.title);
  const [isNotice, setIsNotice] = useState(initial.isNotice);
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [files, setFiles] = useState<FileItem[]>(initial.files);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
    ],
    content: initial.content || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap admin-prose min-h-[320px] px-5 py-4 outline-none", "aria-label": "본문" },
      handleDrop: (_view, event) => {
        const dropped = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!dropped.length) return false;
        event.preventDefault();
        void insertImages(dropped);
        return true;
      },
      handlePaste: (_view, event) => {
        const pasted = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!pasted.length) return false;
        void insertImages(pasted);
        return true;
      },
    },
  });

  async function insertImages(list: File[]) {
    if (!editor) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of list) {
        const up = await uploadImage(f);
        editor.chain().focus().setImage({ src: up.url, alt: title || f.name.replace(/\.[^.]+$/, "") }).run();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function addFiles(list: File[]) {
    if (files.length + list.length > 10) return setError("첨부파일은 10개까지 올릴 수 있습니다.");
    setUploading(true);
    setError(null);
    try {
      for (const f of list) {
        const up = await uploadAttachment(f);
        setFiles((prev) => [...prev, { key: up.key, url: up.url, fileName: f.name, size: up.size }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "파일 업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    if (!editor) return;
    setError(null);
    start(async () => {
      const res = await savePost({
        id: initial.id,
        boardType,
        title,
        content: editor.getHTML(),
        isNotice,
        isPublished,
        files: files.map(({ id, key, url, fileName, size }) => ({ id, key, url, fileName, size })),
      });
      if (!res.ok) return setError(res.error);
      router.push(`/admin/posts?board=${boardType}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-md border border-line bg-white p-5 sm:grid-cols-[180px_1fr]">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-ink">게시판</span>
          <select
            value={boardType}
            onChange={(e) => setBoardType(e.target.value as BoardType)}
            className="h-11 w-full rounded-md border border-line bg-white px-3 outline-none focus:border-theme"
          >
            <option value="notice">공지사항</option>
            <option value="story">조합이야기</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-ink">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="제목을 입력하세요 (검색 결과에 그대로 노출됩니다)"
            className="h-11 w-full rounded-md border border-line px-4 outline-none focus:border-theme"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-md border border-line bg-white">
        <Toolbar editor={editor} onImage={() => imageRef.current?.click()} uploading={uploading} />
        <input
          ref={imageRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (list.length) void insertImages(list);
          }}
        />
        <EditorContent editor={editor} />
      </div>
      <p className="text-[13px] text-muted">
        팁: 이미지를 본문에 끌어다 놓거나 붙여넣을 수 있습니다. 본문 첫 이미지가 {boardType === "story" ? "조합이야기 목록 썸네일과 " : ""}검색·SNS 미리보기 이미지로 쓰입니다.
      </p>

      <section className="rounded-md border border-line bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink">첨부파일</h2>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-line px-3 py-1.5 text-[13px] hover:border-theme hover:text-theme disabled:opacity-50"
          >
            + 파일 추가
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept=".pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.jpg,.jpeg,.png"
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (list.length) void addFiles(list);
            }}
          />
        </div>
        {files.length === 0 ? (
          <p className="text-[13px] text-muted">PDF·한글·워드·엑셀·파워포인트·ZIP·이미지 (파일당 20MB, 최대 10개)</p>
        ) : (
          <ul className="divide-y divide-line text-[14px]">
            {files.map((f, i) => (
              <li key={f.id ?? f.key} className="flex items-center gap-3 py-2">
                <span className="min-w-0 flex-1 truncate">{f.fileName}</span>
                <span className="shrink-0 text-muted">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, k) => k !== i))}
                  className="shrink-0 rounded-md border border-line px-2 py-1 text-[12px] text-hot hover:border-hot"
                >
                  빼기
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-lg bg-hot/10 px-4 py-3 text-[14px] text-hot">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-line bg-white p-5">
        <div className="flex flex-wrap gap-5">
          {boardType === "notice" && (
            <label className="flex items-center gap-2 text-[15px] text-ink">
              <input type="checkbox" checked={isNotice} onChange={(e) => setIsNotice(e.target.checked)} className="h-5 w-5 accent-[var(--color-theme)]" />
              목록 맨 위에 고정
            </label>
          )}
          <label className="flex items-center gap-2 text-[15px] text-ink">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-5 w-5 accent-[var(--color-theme)]" />
            홈페이지에 공개
          </label>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="h-11 rounded-md border border-line px-6 font-bold text-body hover:border-ink">
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || uploading || !editor}
            className="h-11 rounded-md bg-theme px-8 font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "저장 중…" : initial.id ? "수정 완료" : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ editor, onImage, uploading }: { editor: Editor | null; onImage: () => void; uploading: boolean }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            ul: e.isActive("bulletList"),
            ol: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
          }
        : null,
  });
  if (!editor || !s) return <div className="h-12 border-b border-line bg-surface" />;

  const btn = (active: boolean) => `h-9 min-w-9 rounded-lg px-2 text-[14px] font-medium transition ${active ? "bg-theme text-white" : "text-body hover:bg-white"}`;
  const c = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface px-3 py-2" role="toolbar" aria-label="서식">
      <button type="button" className={btn(s.h2)} onClick={() => c().toggleHeading({ level: 2 }).run()} title="큰 제목">H2</button>
      <button type="button" className={btn(s.h3)} onClick={() => c().toggleHeading({ level: 3 }).run()} title="작은 제목">H3</button>
      <span className="mx-1 h-5 w-px bg-line" />
      <button type="button" className={`${btn(s.bold)} font-bold`} onClick={() => c().toggleBold().run()} title="굵게">B</button>
      <button type="button" className={`${btn(s.italic)} italic`} onClick={() => c().toggleItalic().run()} title="기울임">I</button>
      <button type="button" className={`${btn(s.underline)} underline`} onClick={() => c().toggleUnderline().run()} title="밑줄">U</button>
      <button type="button" className={`${btn(s.strike)} line-through`} onClick={() => c().toggleStrike().run()} title="취소선">S</button>
      <span className="mx-1 h-5 w-px bg-line" />
      <button type="button" className={btn(s.ul)} onClick={() => c().toggleBulletList().run()} title="글머리 목록">• 목록</button>
      <button type="button" className={btn(s.ol)} onClick={() => c().toggleOrderedList().run()} title="번호 목록">1. 목록</button>
      <button type="button" className={btn(s.quote)} onClick={() => c().toggleBlockquote().run()} title="인용">“ 인용</button>
      <button
        type="button"
        className={btn(s.link)}
        title="링크"
        onClick={() => {
          if (s.link) return c().unsetLink().run();
          const url = prompt("연결할 주소(URL)를 입력하세요", "https://");
          if (url && /^(https?:\/\/|mailto:|tel:)/.test(url)) c().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        🔗 링크
      </button>
      <button type="button" className={btn(false)} onClick={onImage} disabled={uploading} title="이미지 넣기">
        {uploading ? "업로드 중…" : "🖼 이미지"}
      </button>
      <span className="mx-1 h-5 w-px bg-line" />
      <button type="button" className={btn(false)} onClick={() => c().undo().run()} title="되돌리기">↶</button>
      <button type="button" className={btn(false)} onClick={() => c().redo().run()} title="다시 실행">↷</button>
    </div>
  );
}
