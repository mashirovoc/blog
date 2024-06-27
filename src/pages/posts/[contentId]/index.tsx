import { GetStaticPaths, GetStaticProps } from "next";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
}) => {
  const contentId = params?.contentId;
  if (!contentId) {
    return { notFound: true };
  }

  const draftKey = previewData?.draftKey;

  const post = await fetch(
    `https://${
      process.env.SERVICE_DOMAIN
    }.microcms.io/api/v1/posts/${contentId}${
      draftKey ? `?draftKey=${draftKey}` : ""
    }`,
    {
      headers: { "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY || "" },
    }
  ).then((res) => res.json());

  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};
