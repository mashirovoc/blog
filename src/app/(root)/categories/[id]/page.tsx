import CategoryTaggedArticles from "@/components/categories/CategoryTaggedArticles";
import Loading from "@/components/common/Loading";
import { client } from "@/lib/client";
import { Category } from "@/types/Category";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AiOutlineTag } from "react-icons/ai";

export const metadata: Metadata = {
  title: "カテゴリ",
};

const page = async ({ params }: { params: { id: string } }) => {
  let data: Category;
  try {
    data = await client.getListDetail({
      endpoint: "categories",
      contentId: params.id,
    });
  } catch (e) {
    return notFound();
  }
  metadata.title = data.name;

  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="p-3 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AiOutlineTag />
            <div>{data.name}</div>
          </h1>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={<Loading />}>
            <CategoryTaggedArticles content_id={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default page;
