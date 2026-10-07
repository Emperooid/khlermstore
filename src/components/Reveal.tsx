"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useReveal } from "./hooks";

/** Fades and lifts its content in when it scrolls into view. `stagger` staggers direct children. */
export function Reveal({ as: Tag = "div", className = "", delay = 0, stagger = false, children, style }: { as?: ElementType; className?: string; delay?: number; stagger?: boolean; children: ReactNode; style?: CSSProperties }) {
  const [ref, shown] = useReveal<HTMLElement>();
  const classes = ["reveal", stagger ? "reveal-stagger" : "", shown ? "in-view" : "", className].filter(Boolean).join(" ");
  return <Tag ref={ref} className={classes} style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}>{children}</Tag>;
}
