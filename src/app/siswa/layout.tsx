"use client";

import type { ReactNode } from "react";
import { StudentTopNav } from "../../components/layout/StudentTopNav";

export default function SiswaLayout({ children }: { children: ReactNode }) {
  return <StudentTopNav>{children}</StudentTopNav>;
}
