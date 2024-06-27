import type { NextApiHandler } from "next";
import fetch from "node-fetch";

const handlePreviewRequest: NextApiHandler = async (req, res) => {
  const slug = typeof req.query.slug === "string" ? req.query.slug : "";
  const draftKey =
    typeof req.query.draftKey === "string" ? req.query.draftKey : "";
  const type = typeof req.query.type === "string" ? req.query.type : "posts";

  if (!slug) {
    return res.status(404).end();
  }

  const apiUrl = `https://${process.env.SERVICE_DOMAIN}.microcms.io/api/v1/${type}/${slug}?fields=id&draftKey=${draftKey}`;

  const content = await fetch(apiUrl, {
    headers: { "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY || "" },
  })
    .then((res) => res.json())
    .catch((error) => {
      console.log(error);
      return null;
    });

  if (!content) {
    return res.status(404).json({ message: "Invalid slug" });
  }

  res.setPreviewData({ slug: content.id, draftKey });
  res.writeHead(307, { Location: `/${type}/${slug}` });
  res.end("Preview mode enabled");
};

export default handlePreviewRequest;
