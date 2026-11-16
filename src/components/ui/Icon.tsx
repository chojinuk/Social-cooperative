/**
 * 레퍼런스가 쓰던 Font Awesome 4.7 아이콘 중 실제로 쓰는 것만 인라인 SVG 로 옮긴 것.
 * 아이콘 글꼴을 내려받지 않아 첫 화면이 가볍고, 크기·색은 글자처럼 font-size·color 를 따른다.
 */
const paths = {
  search: <path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />,
  close: <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z" />,
  home: <path d="M12 3.2 2.5 11.1l1.3 1.5L5 11.6V20h5.5v-5.5h3V20H19v-8.4l1.2 1 1.3-1.5L12 3.2Z" />,
  angleDown: <path d="m6.4 8.6 5.6 5.6 5.6-5.6L19 10l-7 7-7-7 1.4-1.4Z" />,
  angleUp: <path d="m12 7 7 7-1.4 1.4-5.6-5.6-5.6 5.6L5 14l7-7Z" />,
  angleRight: <path d="m9.4 5 7 7-7 7L8 17.6l5.6-5.6L8 6.4 9.4 5Z" />,
  angleLeft: <path d="m14.6 5 1.4 1.4-5.6 5.6 5.6 5.6-1.4 1.4-7-7 7-7Z" />,
  caretRight: <path d="M9 6v12l7-6-7-6Z" />,
  plusCircle: <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm1 5h-2v4H7v2h4v4h2v-4h4v-2h-4V7Z" />,
  externalLink: (
    <path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H6v11h11v-5h2v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
  ),
  phone: (
    <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm4.6 3.5L7 7.2c-.4 2.6.8 5.2 2.8 7.1 1.9 2 4.5 3.2 7.1 2.8l.7-1.6-2.3-1.6-1.2 1c-1.5-.6-2.6-1.7-3.2-3.2l1-1.2-1.6-2.3-.7.3Z" />
  ),
  bullhorn: <path d="M20 4v14l-6-3H7l1.2 5H5.6L4.4 15H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h10l6-3Zm2 5.5v3a1.5 1.5 0 0 0 0-3Z" />,
  download: <path d="M11 3h2v9.6l3.3-3.3 1.4 1.4L12 16.4l-5.7-5.7 1.4-1.4 3.3 3.3V3ZM4 18h16v2H4v-2Z" />,
  link: (
    <path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-2 2-1.4-1.4 2-2a1 1 0 1 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l2-2 1.4 1.4-2 2a1 1 0 1 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0Z" />
  ),
  eye: <path d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />,
  clock: <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 3v4.6l3.2 3.2-1.4 1.4-3.8-3.8V7h2Z" />,
  file: <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h11V8h-4V4H6Z" />,
  list: <path d="M3 5h2v2H3V5Zm4 0h14v2H7V5ZM3 11h2v2H3v-2Zm4 0h14v2H7v-2Zm-4 6h2v2H3v-2Zm4 0h14v2H7v-2Z" />,
  arrowLeft: <path d="m10 5 1.4 1.4L6.8 11H21v2H6.8l4.6 4.6L10 19l-7-7 7-7Z" />,
  arrowRight: <path d="m14 5 7 7-7 7-1.4-1.4 4.6-4.6H3v-2h14.2l-4.6-4.6L14 5Z" />,
  user: <path d="M12 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 11c4.4 0 8 2.2 8 5v2H4v-2c0-2.8 3.6-5 8-5Z" />,
  warning: <path d="M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z" />,
  send: <path d="m2 21 21-9L2 3v7l15 2-15 2v7Z" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "", label }: { name: IconName; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`ico ${className}`.trim()}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
