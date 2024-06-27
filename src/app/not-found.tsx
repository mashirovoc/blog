import notFoundImage from "@/assets/images/feeling_blue.png";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineHome } from "react-icons/ai";

export const metadata: Metadata = {
  title: "見つかりませんでした",
};

const notFound = () => {
  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center gap-3">
      <div className="max-w-[400px]">
        <Image src={notFoundImage} alt="I'm feeling blue" />
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-xl">404 - 見つかりませんでした</div>
        <div>このページは存在しないか削除されています</div>
      </div>
      <Link href="/">
        <Button>
          <AiOutlineHome className="mr-2" />
          ホームに戻る
        </Button>
      </Link>
    </div>
  );
};

export default notFound;
