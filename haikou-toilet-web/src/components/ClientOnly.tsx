// src/components/ClientOnly.tsx
/**
 * @file ClientOnly.tsx
 * @description 确保其子组件只在客户端渲染，用于解决 Next.js 的 Hydration 错误。
 */
"use client";

import { useState, useEffect, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
}

export default function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <>{children}</>;
}
