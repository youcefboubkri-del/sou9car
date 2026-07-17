import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/", "/wallet/", "/messages/"] },
    sitemap: "https://sou9car.ma/sitemap.xml",
  };
}
