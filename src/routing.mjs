// Hash routes keep static HTML entries usable on GitHub Pages and local files.
export function getAppPath({ pathname, hash }) {
  const route = hash.startsWith("#/") ? hash.slice(1) : "";
  if (/^\/(customer|maintenance|admin)(\/|$)/.test(route)) return route;
  const file = decodeURIComponent(pathname.split("/").pop() || "");
  if (file === "customer.html") return "/customer";
  if (file === "maintenance.html") return "/maintenance";
  // Preserve existing development URLs such as /customer/sites.
  if (/^\/(customer|maintenance|admin)(\/|$)/.test(pathname)) return pathname;
  return "/admin";
}
