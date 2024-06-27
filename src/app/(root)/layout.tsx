import ModeToggle from "@/components/common/ModeToggle";
import Link from "next/link";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <header className="fixed h-14 bg-background/80 z-40 backdrop-blur-md top-0 left-0 right-0 border-b">
        <div className="flex justify-between items-center p-3 w-full h-full">
          <div>
            <Link href="/" className="block text-2xl font-bold">
              ましろさんブログ
            </Link>
          </div>
          <div className="flex flex-row items-end gap-3">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="grow pt-14 min-w-0">{children}</main>
      <footer className="border-t">
        <div className="p-3 max-w-[1280px] mx-auto">&copy; 2024 ましろ</div>
      </footer>
    </div>
  );
};

export default layout;
