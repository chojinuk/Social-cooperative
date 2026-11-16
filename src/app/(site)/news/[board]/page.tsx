import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardPage } from "@/components/board/BoardPage";
import { BOARD_TYPES, type BoardType } from "@/db/schema";
import { boardDescription, boardLabel } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

// 검색엔진에 완성된 HTML·정확한 404 상태를 주기 위해 URL 값을 기다려 서버에서 완전히 렌더링
export const instant = false;

export function generateStaticParams() {
  return BOARD_TYPES.map((board) => ({ board }));
}

async function getBoard(params: Promise<{ board: string }>) {
  const { board } = await params;
  if (!BOARD_TYPES.includes(board as BoardType)) notFound();
  return board as BoardType;
}

export async function generateMetadata({ params }: PageProps<"/news/[board]">): Promise<Metadata> {
  const board = await getBoard(params);
  return pageMetadata({ title: boardLabel[board], description: boardDescription[board], path: `/news/${board}` });
}

export default async function Page({ params }: PageProps<"/news/[board]">) {
  const board = await getBoard(params);
  return <BoardPage board={board} page={1} />;
}
