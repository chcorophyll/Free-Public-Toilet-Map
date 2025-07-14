// src/app/page.tsx

// 【核心】请确保这里的导入语句没有花括号
import MapClientWrapper from "@/components/MapClientWrapper";

export default function Home() {
  return (
    <main className="w-screen h-screen bg-[#111111] overflow-hidden">
      <MapClientWrapper />
    </main>
  );
}