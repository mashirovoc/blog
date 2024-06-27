import AllArticles from "@/components/articles/AllArticles";
import Loading from "@/components/common/Loading";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "すべての記事",
};

const page = async () => {
  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="p-3 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            すべての記事
          </h1>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={<Loading />}>
            <AllArticles />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default page;
