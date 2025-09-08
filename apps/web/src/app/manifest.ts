import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const name = "DT Tài Khoản Số";
  const short_name = "DT TKS";
  const theme_color = "#0ea5e9";
  const background_color = "#ffffff";
  const start_url = "/";

  return {
    name,
    short_name,
    start_url,
    display: "standalone",
    background_color,
    theme_color,
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}

