import { client } from "@/lib/client";
import { Article } from "@/types/Article";
import { format, parseISO } from "date-fns";
import { MicroCMSListResponse } from "microcms-js-sdk";
import Image from "next/image";
import Link from "next/link";
import {
  AiOutlineCamera,
  AiOutlineClockCircle,
  AiOutlineEye,
} from "react-icons/ai";

const LatestArticles = async () => {
  const data: MicroCMSListResponse<Article> = await client.getList({
    endpoint: "articles",
    queries: { limit: 10, orders: "-publishedAt" },
  });

  return (
    <>
      {data.contents.map((v) => {
        const formattedDate = format(parseISO(v.publishedAt), "yyyy年MM月dd日");
        return (
          <Link
            key={`latestArticle_${v.id}`}
            href={`/articles/${v.id}`}
            className="flex flex-col items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground transition-colors duration-300 ease-in-out rounded-md group/image"
          >
            <div className="w-32 aspect-video">
              {v.thumbnail ? (
                <div className="w-full h-full object-cover rounded-md overflow-clip">
                  <Image
                    src={v.thumbnail.url}
                    alt="Thumbnail"
                    width="128"
                    height="72"
                    className="group-hover/image:scale-105 duration-300 ease-in-out transition-transform"
                  />
                </div>
              ) : (
                <div className="w-full h-full object-cover rounded-md bg-muted flex items-center justify-center">
                  <AiOutlineCamera size={20} />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="font-semibold">{v.title}</div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <AiOutlineClockCircle />
                  <div>{formattedDate}</div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <AiOutlineEye />
                  {v.share == "members" ? (
                    <div className="text-red-500">メンバー専用</div>
                  ) : (
                    <div className="text-blue-500">全員</div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
};

export default LatestArticles;
