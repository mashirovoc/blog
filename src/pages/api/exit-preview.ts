import type { NextApiHandler } from "next";

const exitPreview: NextApiHandler = (req, res) => {
  res.clearPreviewData();
  res.writeHead(307, { Location: "/" });
  res.end();
};

export default exitPreview;
