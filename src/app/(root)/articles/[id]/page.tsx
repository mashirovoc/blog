import CopyLinkButton from "@/components/articles/CopyLinkButton";
import LatestArticles from "@/components/articles/LatestArticles";
import TagFields from "@/components/articles/TagFields";
import Loading from "@/components/common/Loading";
import { client } from "@/libs/client";
import { Article } from "@/types/Article";
import { format, parseISO } from "date-fns";
import parse, { Element } from "html-react-parser";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  AiOutlineClockCircle,
  AiOutlineEye,
  AiOutlineTag,
} from "react-icons/ai";
import { FaFacebookF, FaLine, FaXTwitter } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "記事",
};

const page = async ({ params }: { params: { id: string } }) => {
  let data: Article;
  try {
    data = await client.getListDetail({
      endpoint: "articles",
      contentId: params.id,
    });
  } catch (e) {
    return notFound();
  }
  metadata.title = data.title;

  const parsedContent = parse(data.content, {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return;

      if (domNode.name === "img") {
        const { attribs } = domNode;

        const aspectRatio =
          parseFloat(attribs.height) / parseFloat(attribs.width);

        const height = Math.min(640 * aspectRatio, 640);

        return (
          <Image
            src={attribs.src}
            width={640}
            height={height}
            alt={attribs.alt ? attribs.alt : "Image"}
            className="object-cover"
          />
        );
      }
    },
  });

  const formattedDate = format(parseISO(data.publishedAt), "yyyy年MM月dd日");

  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="flex flex-row">
        <div className="grow p-3 space-y-6">
          {data.thumbnail && (
            <div className="w-full h-[400px] rounded-md overflow-clip">
              <Image
                src={data.thumbnail.url}
                alt="Thumbnail"
                width="1280"
                height="400"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-row lg:flex-col gap-6">
              <Link
                href={`https://x.com/intent/post?url=https://mashirovoc.vercel.app/articles/${data.id}&text=${data.title}%20/%20ましろさんブログ`}
                target="_blank"
                className="block"
              >
                <FaXTwitter size={32} />
              </Link>
              <Link
                href={`https://social-plugins.line.me/lineit/share?url=https://mashirovoc.vercel.app/articles/${data.id}&text=${data.title}%20/%20ましろさんブログ`}
                target="_blank"
                className="block"
              >
                <FaLine size={32} />
              </Link>
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=https://mashirovoc.vercel.app/articles/${data.id}`}
                target="_blank"
                className="block"
              >
                <FaFacebookF size={32} />
              </Link>
              <CopyLinkButton />
            </div>
            <div className="grow space-y-6">
              <div className="space-y-3">
                <h1 className="font-bold text-3xl">{data.title}</h1>
                <div className="flex flex-row gap-3 flex-wrap">
                  {data.categories.map((v, i) => {
                    return (
                      <Link
                        href={`/categories/${v.id}`}
                        key={`category_${v}`}
                        className="text-sm text-muted-foreground flex items-center gap-3 hover:underline"
                      >
                        <AiOutlineTag />
                        <div>{v.name}</div>
                      </Link>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <AiOutlineClockCircle />
                    <div>{formattedDate}</div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <AiOutlineEye />
                    {data.share == "members" ? (
                      <div className="text-red-500">メンバー専用</div>
                    ) : (
                      <div className="text-blue-500">全員</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="prose dark:prose-invert !max-w-none prose-h1:bg-secondary prose-h1:text-secondary-foreground prose-h1:text-3xl prose-h1:p-3 prose-h1:rounded-md">
                <div className="w-full">{parsedContent}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-3 hidden lg:block w-[320px] p-3">
          <div className="space-y-6 w-full h-full">
            <div className="space-y-3">
              <div className="bg-secondary text-secondary-foreground rounded-md p-3 font-semibold">
                タグ
              </div>
              <Suspense fallback={<Loading />}>
                <TagFields />
              </Suspense>
            </div>
            <div className="sticky top-16 space-y-3">
              <div className="bg-secondary text-secondary-foreground rounded-md p-3 font-semibold">
                最新記事
              </div>
              <div className="divide-y">
                <Suspense fallback={<Loading />}>
                  <LatestArticles />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
