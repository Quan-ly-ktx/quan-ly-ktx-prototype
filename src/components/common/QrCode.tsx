import type { ReactNode } from "react";

export function QrCode({ seed }: { seed: string }) {
  const n = 25;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1664525 + 1013904223) >>> 0) >>> 8) / 16777216;
  const finder = (x: number, y: number) =>
    [
      [3, 3],
      [n - 4, 3],
      [3, n - 4],
    ].some(([cx, cy]) => Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 3);

  const rects: ReactNode[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue;
      if (rnd() > 0.52)
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  const eye = (cx: number, cy: number) => (
    <g key={`${cx}${cy}`}>
      <rect x={cx - 3} y={cy - 3} width="7" height="7" />
      <rect x={cx - 2} y={cy - 2} width="5" height="5" fill="white" />
      <rect x={cx - 1} y={cy - 1} width="3" height="3" />
    </g>
  );
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      className="size-48"
      role="img"
      aria-label={`Mã VietQR cho ${seed}`}
      fill="#0f172a"
    >
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="white" />
      {rects}
      {eye(3, 3)}
      {eye(n - 4, 3)}
      {eye(3, n - 4)}
    </svg>
  );
}
