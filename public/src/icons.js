const ICONS = {
  "alert-triangle": [
    ["path", { d: "M21.7 18 13.7 4a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" }],
    ["path", { d: "M12 9v4" }],
    ["path", { d: "M12 17h.01" }]
  ],
  "arrow-down-circle": [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "m8 12 4 4 4-4" }],
    ["path", { d: "M12 8v8" }]
  ],
  "arrow-left-right": [
    ["path", { d: "M8 3 4 7l4 4" }],
    ["path", { d: "M4 7h16" }],
    ["path", { d: "m16 21 4-4-4-4" }],
    ["path", { d: "M20 17H4" }]
  ],
  "arrow-right": [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "m13 6 6 6-6 6" }]
  ],
  "arrow-up-circle": [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "m16 12-4-4-4 4" }],
    ["path", { d: "M12 16V8" }]
  ],
  banknote: [
    ["rect", { x: "2", y: "6", width: "20", height: "12", rx: "2" }],
    ["circle", { cx: "12", cy: "12", r: "2" }],
    ["path", { d: "M6 12h.01" }],
    ["path", { d: "M18 12h.01" }]
  ],
  bell: [
    ["path", { d: "M10.3 21a2 2 0 0 0 3.4 0" }],
    ["path", { d: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" }]
  ],
  calendar: [
    ["path", { d: "M8 2v4" }],
    ["path", { d: "M16 2v4" }],
    ["rect", { x: "3", y: "5", width: "18", height: "16", rx: "2" }],
    ["path", { d: "M3 10h18" }]
  ],
  check: [
    ["path", { d: "m20 6-11 11-5-5" }]
  ],
  chrome: [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["circle", { cx: "12", cy: "12", r: "4" }],
    ["path", { d: "M21.2 8H12" }],
    ["path", { d: "M3.2 8 8 16.3" }],
    ["path", { d: "m15.7 16.3 4.8-8.3" }]
  ],
  droplets: [
    ["path", { d: "M7 16.3c2.2 0 4-1.8 4-4 0-1.5-1.3-3.5-4-6.3-2.7 2.8-4 4.8-4 6.3 0 2.2 1.8 4 4 4Z" }],
    ["path", { d: "M12.5 20c1.9 0 3.5-1.6 3.5-3.5 0-1.2-1-2.9-3.5-5.5-2.5 2.6-3.5 4.3-3.5 5.5 0 1.9 1.6 3.5 3.5 3.5Z" }],
    ["path", { d: "M18.5 14c1.4 0 2.5-1.1 2.5-2.5 0-.9-.7-2.1-2.5-4-1.8 1.9-2.5 3.1-2.5 4 0 1.4 1.1 2.5 2.5 2.5Z" }]
  ],
  eye: [
    ["path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" }],
    ["circle", { cx: "12", cy: "12", r: "3" }]
  ],
  "eye-off": [
    ["path", { d: "m2 2 20 20" }],
    ["path", { d: "M6.7 6.7C3.9 8.6 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.5-1.2" }],
    ["path", { d: "M10.7 5.1c.4-.1.9-.1 1.3-.1 6.5 0 10 7 10 7s-.8 1.6-2.3 3.3" }],
    ["path", { d: "M14.1 14.1A3 3 0 0 1 9.9 9.9" }]
  ],
  "file-text": [
    ["path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }],
    ["path", { d: "M14 2v6h6" }],
    ["path", { d: "M16 13H8" }],
    ["path", { d: "M16 17H8" }],
    ["path", { d: "M10 9H8" }]
  ],
  filter: [
    ["path", { d: "M22 3H2l8 9.5V19l4 2v-8.5L22 3Z" }]
  ],
  fuel: [
    ["path", { d: "M3 22V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v18" }],
    ["path", { d: "M2 22h15" }],
    ["path", { d: "M18 8h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1" }],
    ["path", { d: "m19 3 2 2" }],
    ["path", { d: "M6 6h7v5H6z" }]
  ],
  home: [
    ["path", { d: "m3 11 9-8 9 8" }],
    ["path", { d: "M5 10v10h14V10" }],
    ["path", { d: "M9 20v-6h6v6" }]
  ],
  info: [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M12 16v-4" }],
    ["path", { d: "M12 8h.01" }]
  ],
  "layout-dashboard": [
    ["rect", { x: "3", y: "3", width: "7", height: "9", rx: "1" }],
    ["rect", { x: "14", y: "3", width: "7", height: "5", rx: "1" }],
    ["rect", { x: "14", y: "12", width: "7", height: "9", rx: "1" }],
    ["rect", { x: "3", y: "16", width: "7", height: "5", rx: "1" }]
  ],
  link: [
    ["path", { d: "M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" }],
    ["path", { d: "M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" }]
  ],
  lock: [
    ["rect", { x: "3", y: "11", width: "18", height: "11", rx: "2" }],
    ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }]
  ],
  "log-in": [
    ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }],
    ["path", { d: "m10 17 5-5-5-5" }],
    ["path", { d: "M15 12H3" }]
  ],
  "log-out": [
    ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
    ["path", { d: "m16 17 5-5-5-5" }],
    ["path", { d: "M21 12H9" }]
  ],
  "mail-check": [
    ["path", { d: "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" }],
    ["path", { d: "m22 7-8.9 5.7a2 2 0 0 1-2.2 0L2 7" }],
    ["path", { d: "m16 19 2 2 4-4" }]
  ],
  monitor: [
    ["rect", { x: "2", y: "3", width: "20", height: "14", rx: "2" }],
    ["path", { d: "M8 21h8" }],
    ["path", { d: "M12 17v4" }]
  ],
  moon: [
    ["path", { d: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" }]
  ],
  pencil: [
    ["path", { d: "M12 20h9" }],
    ["path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" }]
  ],
  plus: [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "M12 5v14" }]
  ],
  "refresh-cw": [
    ["path", { d: "M3 12a9 9 0 0 1 15-6.7L21 8" }],
    ["path", { d: "M21 3v5h-5" }],
    ["path", { d: "M21 12a9 9 0 0 1-15 6.7L3 16" }],
    ["path", { d: "M3 21v-5h5" }]
  ],
  "shield-alert": [
    ["path", { d: "M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.6a1.3 1.3 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" }],
    ["path", { d: "M12 8v4" }],
    ["path", { d: "M12 16h.01" }]
  ],
  "shopping-cart": [
    ["circle", { cx: "9", cy: "20", r: "1" }],
    ["circle", { cx: "19", cy: "20", r: "1" }],
    ["path", { d: "M3 3h2l2.4 11.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" }]
  ],
  search: [
    ["circle", { cx: "11", cy: "11", r: "8" }],
    ["path", { d: "m21 21-4.3-4.3" }]
  ],
  sun: [
    ["circle", { cx: "12", cy: "12", r: "4" }],
    ["path", { d: "M12 2v2" }],
    ["path", { d: "M12 20v2" }],
    ["path", { d: "m4.9 4.9 1.4 1.4" }],
    ["path", { d: "m17.7 17.7 1.4 1.4" }],
    ["path", { d: "M2 12h2" }],
    ["path", { d: "M20 12h2" }],
    ["path", { d: "m6.3 17.7-1.4 1.4" }],
    ["path", { d: "m19.1 4.9-1.4 1.4" }]
  ],
  tag: [
    ["path", { d: "M12.6 2H5a2 2 0 0 0-2 2v7.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l6.6-6.6a2 2 0 0 0 0-2.8L13.9 2.6A2 2 0 0 0 12.6 2z" }],
    ["path", { d: "M7.5 7.5h.01" }]
  ],
  tags: [
    ["path", { d: "M13.2 2H5a2 2 0 0 0-2 2v8.2a2 2 0 0 0 .6 1.4l7 7a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8l-6-6A2 2 0 0 0 13.2 2z" }],
    ["path", { d: "M7.5 7.5h.01" }],
    ["path", { d: "m17 5 4 4" }]
  ],
  "trending-up": [
    ["path", { d: "m3 17 6-6 4 4 8-8" }],
    ["path", { d: "M14 7h7v7" }]
  ],
  "trash-2": [
    ["path", { d: "M3 6h18" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ["path", { d: "M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" }],
    ["path", { d: "M10 11v6" }],
    ["path", { d: "M14 11v6" }]
  ],
  user: [
    ["circle", { cx: "12", cy: "8", r: "4" }],
    ["path", { d: "M4 21a8 8 0 0 1 16 0" }]
  ],
  "user-plus": [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { cx: "9", cy: "7", r: "4" }],
    ["path", { d: "M19 8v6" }],
    ["path", { d: "M22 11h-6" }]
  ],
  wallet: [
    ["path", { d: "M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V7" }],
    ["path", { d: "M16 14h.01" }]
  ],
  wifi: [
    ["path", { d: "M5 13a10 10 0 0 1 14 0" }],
    ["path", { d: "M8.5 16.5a5 5 0 0 1 7 0" }],
    ["path", { d: "M12 20h.01" }]
  ],
  x: [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }]
  ],
  zap: [
    ["path", { d: "M13 2 3 14h9l-1 8 10-12h-9Z" }]
  ]
};

export function iconNode(name) {
  const node = document.createElement("i");
  node.dataset.lucide = name;
  return node;
}

export function createIcons(root = document) {
  root.querySelectorAll("i[data-lucide]").forEach((placeholder) => {
    const name = placeholder.dataset.lucide;
    const icon = ICONS[name];
    if (!icon) return;
    placeholder.replaceWith(svgNode(name, icon));
  });
}

function svgNode(name, icon) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", `lucide lucide-${name}`);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  icon.forEach(([tag, attrs]) => {
    const child = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, value));
    svg.append(child);
  });

  return svg;
}
