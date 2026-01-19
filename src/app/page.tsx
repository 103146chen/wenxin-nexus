'use client';

import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isLoggedIn, role } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // 如果沒登入，去登入頁
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      // 根據角色導向首頁
      if (role === 'teacher') {
          router.push('/dashboard');
      } else {
          router.push('/study'); // 學生首頁預設去書齋
      }
    }
  }, [isLoggedIn, role, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
}