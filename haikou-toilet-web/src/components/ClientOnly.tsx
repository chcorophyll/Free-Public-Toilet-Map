// src/components/ClientOnly.tsx
"use client";

import { useState, useEffect } from "react";

/**
 * 这是一个包装组件，它的作用是确保其子组件只在客户端渲染。
 * 这是解决 Next.js 中疑难 Hydration 错误的终极方法。
 * * 工作原理：
 * 1. 在服务端和客户端首次渲染时，`hasMounted` state 均为 false，组件返回 null。
 * 2. 在客户端，`useEffect` 会在组件挂载后运行，将 `hasMounted` 设置为 true。
 * 3. 这会触发一次客户端的重新渲染，此时 `hasMounted` 为 true，子组件被渲染出来。
 */
interface ClientOnlyProps {
  children: React.ReactNode;
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
