import { Category } from "./Category";

export type Article = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  thumbnail?: { url: string; width: number; height: number };
  title: string;
  content: string;
  categories: Category[];
  share: "all" | "members";
};
