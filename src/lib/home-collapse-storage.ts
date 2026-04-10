const PREFIX = "poke-pal:home:";

type CollapseTarget =
  | `section:${string}`
  | `league:${string}`;

export function isCollapsed(target: CollapseTarget): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${PREFIX}${target}`) === "collapsed";
}

export function setCollapsed(target: CollapseTarget, collapsed: boolean): void {
  if (typeof window === "undefined") return;
  const key = `${PREFIX}${target}`;
  if (collapsed) {
    localStorage.setItem(key, "collapsed");
  } else {
    localStorage.removeItem(key);
  }
}
