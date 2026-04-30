import { defineConfig } from "vite-plus";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [
    solidStart(),
    tailwindcss(),
    nitro({
      preset: "vercel",
      externals: {
        inline: ["@solidjs/start", "h3", "srvx", "rou3"],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
