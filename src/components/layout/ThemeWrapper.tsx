'use client';

import { useUserStore } from "@/store/user-store";
import { useEffect } from "react";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { activeTheme } = useUserStore();

  useEffect(() => {
    // 移除舊的主題 class
    document.documentElement.classList.remove('theme-sepia', 'theme-dark', 'theme-default');
    
    // 加入新的主題 class
    if (activeTheme === 'theme-sepia') {
        document.documentElement.classList.add('theme-sepia');
    } else if (activeTheme === 'theme-dark') {
        document.documentElement.classList.add('theme-dark'); // Tailwind 預設已有 dark mode，這裡可做強化
    }
    // default 不用加 class
  }, [activeTheme]);

  return <>{children}</>;
}