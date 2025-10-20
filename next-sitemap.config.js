/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.agasobanuyefilmz.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "daily",
  priority: 0.7,

  // Exclude all admin routes (and subpaths)
  exclude: [
    "/admin",
    "/admin/*",
  ],
};
