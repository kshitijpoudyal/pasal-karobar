import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pasal Karobar",
    short_name: "Pasal Karobar",
    description: "TBD — see docs/product.md",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9fc",
    theme_color: "#022448",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
