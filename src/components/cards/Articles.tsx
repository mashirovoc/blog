import { Article } from "@/types/Article";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  AiOutlineCamera,
  AiOutlineClockCircle,
  AiOutlineEye,
} from "react-icons/ai";
const Articles = ({ item }: { item: Article }) => {
  const formattedDate = format(parseISO(item.publishedAt), "yyyy年MM月dd日");

  return (
    <Link
      href={`/articles/${item.id}`}
      key={`categoryArticle_${item.id}`}
      className="flex flex-col gap-3 rounded-md shadow p-3 group/image hover:bg-accent duration-300 ease-in-out"
    >
      <div className="aspect-video">
        {item.thumbnail ? (
          <div className="w-full h-full object-cover rounded-md overflow-clip">
            <Image
              src={item.thumbnail.url}
              alt="Thumbnail"
              width="390"
              height="2"
              className="group-hover/image:scale-105 duration-300 ease-in-out transition-transform w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full h-full object-cover rounded-md bg-muted flex items-center justify-center">
            <AiOutlineCamera size={32} />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="font-semibold">{item.title}</div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <AiOutlineClockCircle />
            <div>{formattedDate}</div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <AiOutlineEye />
            {item.share == "members" ? (
              <div className="text-red-500">メンバー専用</div>
            ) : (
              <div className="text-blue-500">全員</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Articles;
