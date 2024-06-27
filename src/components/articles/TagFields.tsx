import { client } from "@/lib/client";
import { Category } from "@/types/Category";
import { MicroCMSListResponse } from "microcms-js-sdk";
import Link from "next/link";
import { AiOutlineTag } from "react-icons/ai";

const TagFields = async () => {
  const data: MicroCMSListResponse<Category> = await client.getList({
    endpoint: "categories",
    queries: {
      orders: "-updatedAt",
    },
  });
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-row gap-3 flex-wrap">
        {data.contents.map((v, i) => {
          return (
            <Link
              href={`/categories/${v.id}`}
              key={`category_${v}`}
              className="text-sm flex items-center gap-3 hover:underline"
            >
              <AiOutlineTag />
              <div>{v.name}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TagFields;
