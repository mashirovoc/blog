import { client } from "@/lib/client";
import { Article } from "@/types/Article";
import { MicroCMSListResponse } from "microcms-js-sdk";
import Articles from "../cards/Articles";

const AllArticles = async () => {
  const data: MicroCMSListResponse<Article> = await client.getList({
    endpoint: "articles",
    queries: {
      orders: "-publishedAt",
    },
  });

  return (
    <>
      {data.contents.map((v, i) => (
        <Articles key={`allArticles_${v.id}`} item={v} />
      ))}
    </>
  );
};

export default AllArticles;
