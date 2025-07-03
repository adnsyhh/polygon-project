// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://unpkg.com/leaflet@1.9.3/dist/leaflet.css",
        },
        {
          rel: "stylesheet",
          href: "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css",
        },
      ],
      script: [
        {
          src: "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js",
          defer: true,
        },
        {
          src: "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js",
          defer: true,
        },
      ],
    },
  },
});
