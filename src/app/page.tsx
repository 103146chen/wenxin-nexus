import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          文心匯 Wenxin Nexus
        </h1>
        <p className="text-slate-400 text-lg">
          結合生成式 AI 與遊戲化的下一代高中國文互動式學習平台。
        </p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full font-bold">
              進入儀表板
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}