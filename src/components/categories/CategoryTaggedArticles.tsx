import { client } from "@/libs/client";
import { Article } from "@/types/Article";
import { MicroCMSListResponse } from "microcms-js-sdk";
import Articles from "../cards/Articles";

const CategoryTaggedArticles = async ({
  content_id,
}: {
  content_id: string;
}) => {
  const data: MicroCMSListResponse<Article> = await client.getList({
    endpoint: "articles",
    queries: {
      limit: 3,
      orders: "-publishedAt",
      filters: `categories[contains]${content_id}`,
    },
  });

  return (
    <>
      {data.contents.map((v, i) => (
        <Articles key={`categoryArticle_${v.id}`} item={v} />
      ))}
    </>
  );
};

export default CategoryTaggedArticles;
