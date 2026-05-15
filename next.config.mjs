/** @type {import('next').NextConfig} */
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "PuzzleMaker";
const isActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  basePath: isActions ? `/${repo}` : "",
  assetPrefix: isActions ? `/${repo}/` : "",
  trailingSlash: true,
};
export default nextConfig;
