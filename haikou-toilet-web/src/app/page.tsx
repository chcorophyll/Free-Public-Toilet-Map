// src/app/page.tsx
import MapClientWrapper from "@/components/MapClientWrapper";

/**
 * 这是应用的主页面，它是一个服务端组件 (Server Component)。
 * 它的职责非常单一：提供一个最外层的布局容器，并渲染包含所有
 * 动态交互和状态的客户端组件 <MapClientWrapper />。
 * 这种结构是 Next.js App Router 的最佳实践。
 */
export default function Home() {
  return (
    <main className="w-screen h-screen bg-[#111111] overflow-hidden">
      <MapClientWrapper />
    </main>
  );
}