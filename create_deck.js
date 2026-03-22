const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icon imports
const { FaDatabase, FaChartLine, FaComments, FaStar, FaRocket, FaClock, FaShieldAlt, FaUsers, FaDollarSign, FaLightbulb, FaExclamationTriangle, FaStore, FaSearch, FaTruck, FaBullseye, FaCheckCircle, FaArrowRight, FaCog, FaGlobe, FaMobileAlt, FaBolt } = require("react-icons/fa");

// ── Brand Colors ──
const DARK_BG = "0F1629";
const DARK_BG_2 = "141B2D";
const CARD_BG = "1A2238";
const CARD_BG_2 = "1E2A45";
const EMERALD = "10B981";
const EMERALD_DARK = "059669";
const EMERALD_LIGHT = "34D399";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "94A3B8";
const MID_GRAY = "64748B";
const VERY_LIGHT = "E2E8F0";

// ── Icon Helper ──
function renderIconSvg(IconComponent, color, size) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color: "#" + color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color = EMERALD, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ── Shadow helper (fresh object each time) ──
function cardShadow() {
  return { type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.3 };
}

// ── Helper: Add consistent slide number ──
function addSlideNumber(slide, num) {
  slide.addText(String(num), {
    x: 9.3, y: 5.1, w: 0.5, h: 0.4,
    fontSize: 10, color: MID_GRAY, align: "right", fontFace: "Arial"
  });
}

// ── Helper: Section title bar at top ──
function addTopBar(slide) {
  slide.addShape("rectangle", {
    x: 0, y: 0, w: 10, h: 0.06, fill: { color: EMERALD }
  });
}

async function createDeck() {
  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Operon";
  pres.title = "Operon — AI Restaurant Consultant | Pitch Deck";

  // Pre-render all icons
  const icons = {};
  const iconMap = {
    database: FaDatabase, chart: FaChartLine, comments: FaComments,
    star: FaStar, rocket: FaRocket, clock: FaClock, shield: FaShieldAlt,
    users: FaUsers, dollar: FaDollarSign, lightbulb: FaLightbulb,
    warning: FaExclamationTriangle, store: FaStore, search: FaSearch,
    truck: FaTruck, bullseye: FaBullseye, check: FaCheckCircle,
    arrow: FaArrowRight, cog: FaCog, globe: FaGlobe,
    mobile: FaMobileAlt, bolt: FaBolt
  };

  for (const [name, component] of Object.entries(iconMap)) {
    icons[name] = await iconToBase64Png(component, EMERALD, 256);
    icons[name + "_white"] = await iconToBase64Png(component, WHITE, 256);
    icons[name + "_dark"] = await iconToBase64Png(component, EMERALD_DARK, 256);
  }

  // ═══════════════════════════════════════════════════
  // SLIDE 1 — TITLE / HOOK
  // ═══════════════════════════════════════════════════
  let s1 = pres.addSlide();
  s1.background = { color: DARK_BG };

  // Decorative emerald glow shape top-right
  s1.addShape("oval", {
    x: 7, y: -1.5, w: 5, h: 5,
    fill: { color: EMERALD, transparency: 92 }
  });

  // Hook quote
  s1.addText(
    '"What if you could hire a business consultant who knows every line of your data, works 24/7, and costs less than a single menu item?"',
    {
      x: 0.8, y: 0.8, w: 8.4, h: 2.2,
      fontSize: 20, fontFace: "Georgia", color: VERY_LIGHT,
      italic: true, align: "left", valign: "top", margin: 0
    }
  );

  // OPERON name
  s1.addText("OPERON", {
    x: 0.8, y: 3.0, w: 8.4, h: 1.0,
    fontSize: 54, fontFace: "Arial Black", color: EMERALD,
    bold: true, align: "left", charSpacing: 8, margin: 0
  });

  // Tagline
  s1.addText("Your AI Restaurant Consultant. On Demand.", {
    x: 0.8, y: 4.0, w: 8.4, h: 0.6,
    fontSize: 18, fontFace: "Calibri", color: LIGHT_GRAY,
    align: "left", margin: 0
  });

  // Bottom bar
  s1.addShape("rectangle", {
    x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: EMERALD }
  });

  // ═══════════════════════════════════════════════════
  // SLIDE 2 — THE PROBLEM
  // ═══════════════════════════════════════════════════
  let s2 = pres.addSlide();
  s2.background = { color: DARK_BG };
  addTopBar(s2);

  s2.addText("The Problem", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  const problems = [
    { icon: "warning", title: "Data-Rich, Insight-Poor", desc: "Restaurant owners sit on valuable data but lack the tools to extract actionable insights from it." },
    { icon: "database", title: "Scattered Data", desc: "Information lives across POS systems, spreadsheets, and review platforms with no unified view." },
    { icon: "dollar", title: "Consultants Cost $5K+/month", desc: "Professional business consulting is priced for chains, not independent operators." },
    { icon: "store", title: "60% Fail in Year One", desc: "Bad decisions accelerate failure. Most owners don't know what's wrong until it's too late." }
  ];

  for (let i = 0; i < problems.length; i++) {
    const yPos = 1.3 + i * 1.05;
    // Card background
    s2.addShape("rectangle", {
      x: 0.8, y: yPos, w: 8.4, h: 0.9,
      fill: { color: CARD_BG }, shadow: cardShadow()
    });
    // Left accent
    s2.addShape("rectangle", {
      x: 0.8, y: yPos, w: 0.06, h: 0.9,
      fill: { color: EMERALD }
    });
    // Icon
    s2.addImage({
      data: icons[problems[i].icon],
      x: 1.1, y: yPos + 0.2, w: 0.45, h: 0.45
    });
    // Title
    s2.addText(problems[i].title, {
      x: 1.75, y: yPos + 0.05, w: 7.2, h: 0.4,
      fontSize: 16, fontFace: "Calibri", color: WHITE,
      bold: true, margin: 0
    });
    // Description
    s2.addText(problems[i].desc, {
      x: 1.75, y: yPos + 0.45, w: 7.2, h: 0.4,
      fontSize: 12, fontFace: "Calibri", color: LIGHT_GRAY,
      margin: 0
    });
  }
  addSlideNumber(s2, 2);

  // ═══════════════════════════════════════════════════
  // SLIDE 3 — THE SOLUTION
  // ═══════════════════════════════════════════════════
  let s3 = pres.addSlide();
  s3.background = { color: DARK_BG };
  addTopBar(s3);

  s3.addText("The Solution", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  s3.addText("Meet Operon \u2014 AI-powered consulting built for restaurant owners", {
    x: 0.8, y: 1.1, w: 8.4, h: 0.7,
    fontSize: 20, fontFace: "Calibri", color: EMERALD_LIGHT,
    bold: true, margin: 0
  });

  // Three flow steps
  const steps = [
    { icon: "database", label: "Upload\nYour Data" },
    { icon: "chart", label: "Get a Business\nHealth Check" },
    { icon: "check", label: "Receive Prioritized\nRecommendations" }
  ];

  for (let i = 0; i < 3; i++) {
    const xPos = 0.8 + i * 3.1;
    // Card
    s3.addShape("rectangle", {
      x: xPos, y: 2.2, w: 2.7, h: 2.2,
      fill: { color: CARD_BG }, shadow: cardShadow()
    });
    // Icon circle
    s3.addShape("oval", {
      x: xPos + 0.95, y: 2.45, w: 0.8, h: 0.8,
      fill: { color: EMERALD, transparency: 80 }
    });
    s3.addImage({
      data: icons[steps[i].icon + "_white"],
      x: xPos + 1.1, y: 2.6, w: 0.5, h: 0.5
    });
    // Label
    s3.addText(steps[i].label, {
      x: xPos + 0.15, y: 3.4, w: 2.4, h: 0.8,
      fontSize: 14, fontFace: "Calibri", color: WHITE,
      bold: true, align: "center", valign: "top", margin: 0
    });
    // Arrow between steps
    if (i < 2) {
      s3.addImage({
        data: icons.arrow,
        x: xPos + 2.8, y: 3.05, w: 0.35, h: 0.35
      });
    }
  }

  s3.addText("Works instantly. Costs a fraction of a consultant.", {
    x: 0.8, y: 4.7, w: 8.4, h: 0.5,
    fontSize: 14, fontFace: "Calibri", color: LIGHT_GRAY,
    italic: true, align: "center", margin: 0
  });
  addSlideNumber(s3, 3);

  // ═══════════════════════════════════════════════════
  // SLIDE 4 — HOW IT WORKS
  // ═══════════════════════════════════════════════════
  let s4 = pres.addSlide();
  s4.background = { color: DARK_BG };
  addTopBar(s4);

  s4.addText("How It Works", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  const howSteps = [
    {
      num: "01", icon: "database",
      title: "Upload Your Data",
      desc: "Menu, reviews, cost/revenue data. Or use demo data to explore the platform instantly."
    },
    {
      num: "02", icon: "cog",
      title: "AI Analyzes Everything",
      desc: "Cross-references pricing, costs, customer feedback, and revenue trends to surface what matters."
    },
    {
      num: "03", icon: "rocket",
      title: "Get Your Playbook",
      desc: "Health report, ranked recommendations, risk alerts, and an AI chat consultant ready to answer any question."
    }
  ];

  for (let i = 0; i < 3; i++) {
    const yPos = 1.3 + i * 1.35;
    // Card
    s4.addShape("rectangle", {
      x: 0.8, y: yPos, w: 8.4, h: 1.15,
      fill: { color: CARD_BG }, shadow: cardShadow()
    });
    // Step number
    s4.addText(howSteps[i].num, {
      x: 1.0, y: yPos + 0.15, w: 0.7, h: 0.7,
      fontSize: 28, fontFace: "Arial Black", color: EMERALD,
      bold: true, align: "center", valign: "middle", margin: 0
    });
    // Icon
    s4.addImage({
      data: icons[howSteps[i].icon],
      x: 1.85, y: yPos + 0.3, w: 0.5, h: 0.5
    });
    // Title + desc
    s4.addText(howSteps[i].title, {
      x: 2.6, y: yPos + 0.1, w: 6.3, h: 0.45,
      fontSize: 17, fontFace: "Calibri", color: WHITE,
      bold: true, margin: 0
    });
    s4.addText(howSteps[i].desc, {
      x: 2.6, y: yPos + 0.55, w: 6.3, h: 0.5,
      fontSize: 12, fontFace: "Calibri", color: LIGHT_GRAY,
      margin: 0
    });
  }
  addSlideNumber(s4, 4);

  // ═══════════════════════════════════════════════════
  // SLIDE 5 — DASHBOARD & KPIs
  // ═══════════════════════════════════════════════════
  let s5 = pres.addSlide();
  s5.background = { color: DARK_BG };
  addTopBar(s5);

  s5.addText("Your Numbers at a Glance", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  // 4 KPI cards
  const kpis = [
    { value: "$2,847", label: "Avg Daily Revenue", change: "+12%", icon: "dollar" },
    { value: "156", label: "Order Volume", change: "+8%", icon: "chart" },
    { value: "31.2%", label: "Food Cost Ratio", change: "-2.1%", icon: "store" },
    { value: "24%", label: "Delivery Share", change: "+5%", icon: "truck" }
  ];

  for (let i = 0; i < 4; i++) {
    const xPos = 0.8 + i * 2.2;
    s5.addShape("rectangle", {
      x: xPos, y: 1.25, w: 1.95, h: 1.6,
      fill: { color: CARD_BG }, shadow: cardShadow()
    });
    s5.addImage({
      data: icons[kpis[i].icon],
      x: xPos + 0.15, y: 1.4, w: 0.35, h: 0.35
    });
    s5.addText(kpis[i].value, {
      x: xPos + 0.15, y: 1.85, w: 1.65, h: 0.5,
      fontSize: 22, fontFace: "Arial Black", color: WHITE,
      bold: true, margin: 0
    });
    s5.addText(kpis[i].label, {
      x: xPos + 0.15, y: 2.3, w: 1.65, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: LIGHT_GRAY,
      margin: 0
    });
    s5.addText(kpis[i].change, {
      x: xPos + 0.15, y: 2.55, w: 1.65, h: 0.25,
      fontSize: 11, fontFace: "Calibri", color: EMERALD_LIGHT,
      bold: true, margin: 0
    });
  }

  // Executive Snapshot section
  s5.addText("EXECUTIVE SNAPSHOT", {
    x: 0.8, y: 3.15, w: 8.4, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: EMERALD,
    bold: true, charSpacing: 3, margin: 0
  });

  // Three snapshot cards
  const snapshots = [
    { title: "Health Score", value: "74/100", desc: "Good \u2014 room to improve margins", icon: "shield" },
    { title: "Biggest Issue", value: "Food Cost", desc: "Beef brisket cost up 18% this month", icon: "warning" },
    { title: "Biggest Opportunity", value: "Menu Pricing", desc: "3 items underpriced by $2\u2013$4", icon: "lightbulb" }
  ];

  for (let i = 0; i < 3; i++) {
    const xPos = 0.8 + i * 2.95;
    s5.addShape("rectangle", {
      x: xPos, y: 3.6, w: 2.7, h: 1.6,
      fill: { color: CARD_BG_2 }, shadow: cardShadow()
    });
    s5.addImage({
      data: icons[snapshots[i].icon],
      x: xPos + 0.15, y: 3.75, w: 0.35, h: 0.35
    });
    s5.addText(snapshots[i].title, {
      x: xPos + 0.6, y: 3.75, w: 1.95, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: LIGHT_GRAY,
      bold: true, margin: 0, valign: "middle"
    });
    s5.addText(snapshots[i].value, {
      x: xPos + 0.15, y: 4.2, w: 2.4, h: 0.4,
      fontSize: 20, fontFace: "Arial Black", color: WHITE,
      bold: true, margin: 0
    });
    s5.addText(snapshots[i].desc, {
      x: xPos + 0.15, y: 4.6, w: 2.4, h: 0.4,
      fontSize: 10, fontFace: "Calibri", color: LIGHT_GRAY,
      margin: 0
    });
  }
  addSlideNumber(s5, 5);

  // ═══════════════════════════════════════════════════
  // SLIDE 6 — DEEP ANALYSIS
  // ═══════════════════════════════════════════════════
  let s6 = pres.addSlide();
  s6.background = { color: DARK_BG };
  addTopBar(s6);

  s6.addText("Intelligence Beyond Your Four Walls", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 34, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  const analyses = [
    {
      icon: "search", title: "Competition Analysis",
      points: [
        "Nearby restaurants & pricing gaps",
        "What makes you different",
        "Market positioning insights"
      ]
    },
    {
      icon: "bullseye", title: "Target Customers",
      points: [
        "Ideal customer segments",
        "Visit patterns & preferences",
        "Unmet needs you can fill"
      ]
    },
    {
      icon: "truck", title: "Supply Chain Intelligence",
      points: [
        "Better suppliers matched by AI",
        "Price comparisons across vendors",
        "Save $300+/week on ingredients"
      ]
    }
  ];

  for (let i = 0; i < 3; i++) {
    const xPos = 0.8 + i * 2.95;
    // Card
    s6.addShape("rectangle", {
      x: xPos, y: 1.3, w: 2.7, h: 3.6,
      fill: { color: CARD_BG }, shadow: cardShadow()
    });
    // Icon circle
    s6.addShape("oval", {
      x: xPos + 0.85, y: 1.55, w: 1.0, h: 1.0,
      fill: { color: EMERALD, transparency: 80 }
    });
    s6.addImage({
      data: icons[analyses[i].icon + "_white"],
      x: xPos + 1.0, y: 1.7, w: 0.7, h: 0.7
    });
    // Title
    s6.addText(analyses[i].title, {
      x: xPos + 0.15, y: 2.7, w: 2.4, h: 0.5,
      fontSize: 15, fontFace: "Calibri", color: WHITE,
      bold: true, align: "center", margin: 0
    });
    // Points
    const pointsText = analyses[i].points.map((p, idx) => ({
      text: p,
      options: {
        bullet: true, breakLine: idx < analyses[i].points.length - 1,
        fontSize: 11, color: LIGHT_GRAY, fontFace: "Calibri",
        paraSpaceAfter: 6
      }
    }));
    s6.addText(pointsText, {
      x: xPos + 0.25, y: 3.25, w: 2.2, h: 1.4,
      margin: 0, valign: "top"
    });
  }
  addSlideNumber(s6, 6);

  // ═══════════════════════════════════════════════════
  // SLIDE 7 — HEALTH REPORT & RECOMMENDATIONS
  // ═══════════════════════════════════════════════════
  let s7 = pres.addSlide();
  s7.background = { color: DARK_BG };
  addTopBar(s7);

  s7.addText("Actionable Recommendations,\nNot Generic Advice", {
    x: 0.8, y: 0.3, w: 8.4, h: 1.0,
    fontSize: 32, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  // Left column - what we analyze
  s7.addText("FULL BREAKDOWN", {
    x: 0.8, y: 1.5, w: 4.0, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: EMERALD,
    bold: true, charSpacing: 2, margin: 0
  });

  const breakdownItems = [
    "Risks & Opportunities",
    "Revenue & Margin Analysis",
    "Customer Sentiment",
    "Menu Performance"
  ];
  for (let i = 0; i < breakdownItems.length; i++) {
    const yPos = 1.95 + i * 0.55;
    s7.addImage({ data: icons.check, x: 0.9, y: yPos + 0.05, w: 0.3, h: 0.3 });
    s7.addText(breakdownItems[i], {
      x: 1.35, y: yPos, w: 3.4, h: 0.4,
      fontSize: 14, fontFace: "Calibri", color: WHITE, margin: 0, valign: "middle"
    });
  }

  // Right column - specificity example
  s7.addShape("rectangle", {
    x: 5.2, y: 1.5, w: 4.0, h: 3.5,
    fill: { color: CARD_BG }, shadow: cardShadow()
  });
  s7.addText("SPECIFIC, NOT VAGUE", {
    x: 5.4, y: 1.65, w: 3.6, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: EMERALD,
    bold: true, charSpacing: 2, margin: 0
  });

  // Bad example
  s7.addShape("rectangle", {
    x: 5.4, y: 2.15, w: 3.6, h: 0.6,
    fill: { color: "2D1B1B" }
  });
  s7.addText([
    { text: "Generic: ", options: { bold: true, color: "F87171", fontSize: 11 } },
    { text: '"Optimize your pricing"', options: { color: LIGHT_GRAY, fontSize: 11, italic: true } }
  ], { x: 5.55, y: 2.2, w: 3.3, h: 0.5, margin: 0, fontFace: "Calibri" });

  // Good example
  s7.addShape("rectangle", {
    x: 5.4, y: 2.95, w: 3.6, h: 0.7,
    fill: { color: "0D2818" }
  });
  s7.addText([
    { text: "Operon: ", options: { bold: true, color: EMERALD_LIGHT, fontSize: 11 } },
    { text: '"Raise the price on Truffle Fries by $2 \u2014 your margin improves 12% with minimal demand impact"', options: { color: VERY_LIGHT, fontSize: 11, italic: true } }
  ], { x: 5.55, y: 2.98, w: 3.3, h: 0.65, margin: 0, fontFace: "Calibri" });

  // Progress tracking
  s7.addText("Track Progress:", {
    x: 5.4, y: 3.85, w: 3.6, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: WHITE, bold: true, margin: 0
  });
  s7.addText("Not Started  \u2192  In Progress  \u2192  Done", {
    x: 5.4, y: 4.2, w: 3.6, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: EMERALD, bold: true, margin: 0, align: "center"
  });

  addSlideNumber(s7, 7);

  // ═══════════════════════════════════════════════════
  // SLIDE 8 — AI CONSULTANT CHAT (STAR FEATURE)
  // ═══════════════════════════════════════════════════
  let s8 = pres.addSlide();
  s8.background = { color: DARK_BG };
  addTopBar(s8);

  // Title with star
  s8.addImage({ data: icons.star, x: 0.8, y: 0.35, w: 0.45, h: 0.45 });
  s8.addText("Ask Anything. Get Real Answers.", {
    x: 1.35, y: 0.3, w: 7.8, h: 0.8,
    fontSize: 34, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  // Chat example 1
  // User message
  s8.addShape("rectangle", {
    x: 3.5, y: 1.35, w: 5.7, h: 0.55,
    fill: { color: EMERALD_DARK }
  });
  s8.addText('"What\'s causing my food cost to rise?"', {
    x: 3.65, y: 1.38, w: 5.4, h: 0.5,
    fontSize: 13, fontFace: "Calibri", color: WHITE, margin: 0, align: "right"
  });

  // AI response
  s8.addShape("rectangle", {
    x: 0.8, y: 2.05, w: 5.7, h: 0.85,
    fill: { color: CARD_BG }
  });
  s8.addImage({ data: icons.bolt, x: 0.95, y: 2.15, w: 0.3, h: 0.3 });
  s8.addText('"Your beef brisket cost increased 18% last month. Consider switching to Supplier B for $2.40/lb savings. This alone would recover $312/week."', {
    x: 1.35, y: 2.1, w: 4.95, h: 0.75,
    fontSize: 11, fontFace: "Calibri", color: VERY_LIGHT, margin: 0
  });

  // Chat example 2
  s8.addShape("rectangle", {
    x: 3.5, y: 3.15, w: 5.7, h: 0.55,
    fill: { color: EMERALD_DARK }
  });
  s8.addText('"How should I reprice my menu?"', {
    x: 3.65, y: 3.18, w: 5.4, h: 0.5,
    fontSize: 13, fontFace: "Calibri", color: WHITE, margin: 0, align: "right"
  });

  s8.addShape("rectangle", {
    x: 0.8, y: 3.85, w: 5.7, h: 0.85,
    fill: { color: CARD_BG }
  });
  s8.addImage({ data: icons.bolt, x: 0.95, y: 3.95, w: 0.3, h: 0.3 });
  s8.addText('"Increase Truffle Fries from $14 to $16 \u2014 your margin improves by 12% with minimal demand impact. Also consider raising Lobster Roll by $3."', {
    x: 1.35, y: 3.9, w: 4.95, h: 0.75,
    fontSize: 11, fontFace: "Calibri", color: VERY_LIGHT, margin: 0
  });

  // Bottom tagline
  s8.addText("Grounded in YOUR data.  \u2022  Available 24/7  \u2022  Never calls in sick.", {
    x: 0.8, y: 4.95, w: 8.4, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: EMERALD,
    bold: true, align: "center", margin: 0
  });
  addSlideNumber(s8, 8);

  // ═══════════════════════════════════════════════════
  // SLIDE 9 — MARKET OPPORTUNITY
  // ═══════════════════════════════════════════════════
  let s9 = pres.addSlide();
  s9.background = { color: DARK_BG };
  addTopBar(s9);

  s9.addText("Market Opportunity", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  // Big stat cards
  const stats = [
    { value: "1M+", label: "Independent Restaurants\nin the US", icon: "store" },
    { value: "$800B+", label: "US Restaurant\nIndustry Size", icon: "dollar" },
    { value: "<5%", label: "Have Access to Data-\nDriven Consulting", icon: "chart" }
  ];

  for (let i = 0; i < 3; i++) {
    const xPos = 0.8 + i * 2.95;
    s9.addShape("rectangle", {
      x: xPos, y: 1.3, w: 2.7, h: 2.8,
      fill: { color: CARD_BG }, shadow: cardShadow()
    });
    // Icon
    s9.addShape("oval", {
      x: xPos + 0.85, y: 1.55, w: 1.0, h: 1.0,
      fill: { color: EMERALD, transparency: 80 }
    });
    s9.addImage({
      data: icons[stats[i].icon + "_white"],
      x: xPos + 1.0, y: 1.7, w: 0.7, h: 0.7
    });
    // Big number
    s9.addText(stats[i].value, {
      x: xPos + 0.15, y: 2.65, w: 2.4, h: 0.7,
      fontSize: 36, fontFace: "Arial Black", color: EMERALD,
      bold: true, align: "center", margin: 0
    });
    // Label
    s9.addText(stats[i].label, {
      x: xPos + 0.15, y: 3.35, w: 2.4, h: 0.6,
      fontSize: 12, fontFace: "Calibri", color: LIGHT_GRAY,
      align: "center", margin: 0
    });
  }

  // Expansion note
  s9.addShape("rectangle", {
    x: 0.8, y: 4.4, w: 8.4, h: 0.7,
    fill: { color: CARD_BG_2 }
  });
  s9.addImage({ data: icons.globe, x: 1.0, y: 4.53, w: 0.4, h: 0.4 });
  s9.addText("Starting with restaurants. Expanding to all SMB verticals.", {
    x: 1.55, y: 4.45, w: 7.4, h: 0.6,
    fontSize: 15, fontFace: "Calibri", color: WHITE,
    bold: true, margin: 0, valign: "middle"
  });
  addSlideNumber(s9, 9);

  // ═══════════════════════════════════════════════════
  // SLIDE 10 — BUSINESS MODEL
  // ═══════════════════════════════════════════════════
  let s10 = pres.addSlide();
  s10.background = { color: DARK_BG };
  addTopBar(s10);

  s10.addText("Business Model", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  // Three pricing tiers
  const tiers = [
    {
      name: "Free", price: "$0", period: "forever",
      features: ["First business health check", "Executive snapshot", "Demo data exploration"],
      highlight: false
    },
    {
      name: "Pro", price: "$49", period: "/month",
      features: ["Ongoing insights & weekly reports", "AI consultant chat (unlimited)", "Supply chain recommendations", "Competitor intelligence"],
      highlight: true
    },
    {
      name: "Teams", price: "$99", period: "/month",
      features: ["Multi-location support", "Team access & permissions", "Advanced analytics", "Priority support"],
      highlight: false
    }
  ];

  for (let i = 0; i < 3; i++) {
    const xPos = 0.8 + i * 2.95;
    const cardColor = tiers[i].highlight ? EMERALD_DARK : CARD_BG;
    // Card
    s10.addShape("rectangle", {
      x: xPos, y: 1.25, w: 2.7, h: 3.6,
      fill: { color: cardColor }, shadow: cardShadow()
    });
    // Highlight border top
    if (tiers[i].highlight) {
      s10.addShape("rectangle", {
        x: xPos, y: 1.25, w: 2.7, h: 0.06,
        fill: { color: EMERALD_LIGHT }
      });
      s10.addText("MOST POPULAR", {
        x: xPos, y: 1.35, w: 2.7, h: 0.3,
        fontSize: 8, fontFace: "Calibri", color: EMERALD_LIGHT,
        bold: true, align: "center", charSpacing: 3, margin: 0
      });
    }
    // Tier name
    s10.addText(tiers[i].name, {
      x: xPos + 0.15, y: tiers[i].highlight ? 1.65 : 1.45, w: 2.4, h: 0.4,
      fontSize: 18, fontFace: "Calibri", color: WHITE,
      bold: true, align: "center", margin: 0
    });
    // Price
    s10.addText([
      { text: tiers[i].price, options: { fontSize: 32, bold: true, color: tiers[i].highlight ? WHITE : EMERALD } },
      { text: tiers[i].period, options: { fontSize: 13, color: LIGHT_GRAY } }
    ], {
      x: xPos + 0.15, y: tiers[i].highlight ? 2.05 : 1.85, w: 2.4, h: 0.6,
      align: "center", margin: 0, fontFace: "Calibri"
    });

    // Features
    const featureText = tiers[i].features.map((f, idx) => ({
      text: f,
      options: {
        bullet: true, breakLine: idx < tiers[i].features.length - 1,
        fontSize: 10, color: tiers[i].highlight ? VERY_LIGHT : LIGHT_GRAY,
        fontFace: "Calibri", paraSpaceAfter: 4
      }
    }));
    s10.addText(featureText, {
      x: xPos + 0.25, y: tiers[i].highlight ? 2.75 : 2.55, w: 2.2, h: 2.0,
      margin: 0, valign: "top"
    });
  }

  s10.addText("Land & expand: single location \u2192 multi-unit restaurant groups", {
    x: 0.8, y: 5.0, w: 8.4, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: LIGHT_GRAY,
    italic: true, align: "center", margin: 0
  });
  addSlideNumber(s10, 10);

  // ═══════════════════════════════════════════════════
  // SLIDE 11 — WHY NOW
  // ═══════════════════════════════════════════════════
  let s11 = pres.addSlide();
  s11.background = { color: DARK_BG };
  addTopBar(s11);

  s11.addText("Why Now", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Arial Black", color: WHITE,
    bold: true, margin: 0
  });

  const whyNow = [
    { icon: "rocket", title: "Working Product, Live Today", desc: "Not a concept or prototype \u2014 Operon is a fully functional AI consulting platform you can use right now." },
    { icon: "chart", title: "AI Costs Dropping Rapidly", desc: "Unit economics improve every quarter as LLM inference costs decline. The moat is in the data pipeline, not the model." },
    { icon: "mobile", title: "Post-COVID Digital Shift", desc: "Restaurant owners are more comfortable with digital tools than ever. Online ordering normalized tech adoption." },
    { icon: "clock", title: "Zero Integrations Needed", desc: "First insight in 15 minutes. No POS setup, no API connections. Upload a CSV and go." }
  ];

  for (let i = 0; i < 4; i++) {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const xPos = 0.8 + col * 4.4;
    const yPos = 1.3 + row * 1.9;

    s11.addShape("rectangle", {
      x: xPos, y: yPos, w: 4.1, h: 1.65,
      fill: { color: CARD_BG }, shadow: cardShadow()
    });
    // Left accent
    s11.addShape("rectangle", {
      x: xPos, y: yPos, w: 0.06, h: 1.65,
      fill: { color: EMERALD }
    });
    s11.addImage({
      data: icons[whyNow[i].icon],
      x: xPos + 0.25, y: yPos + 0.2, w: 0.45, h: 0.45
    });
    s11.addText(whyNow[i].title, {
      x: xPos + 0.85, y: yPos + 0.15, w: 3.0, h: 0.4,
      fontSize: 15, fontFace: "Calibri", color: WHITE,
      bold: true, margin: 0
    });
    s11.addText(whyNow[i].desc, {
      x: xPos + 0.25, y: yPos + 0.7, w: 3.6, h: 0.8,
      fontSize: 11, fontFace: "Calibri", color: LIGHT_GRAY, margin: 0
    });
  }
  addSlideNumber(s11, 11);

  // ═══════════════════════════════════════════════════
  // SLIDE 12 — CLOSING / ASK
  // ═══════════════════════════════════════════════════
  let s12 = pres.addSlide();
  s12.background = { color: DARK_BG };

  // Decorative elements
  s12.addShape("oval", {
    x: -2, y: -2, w: 6, h: 6,
    fill: { color: EMERALD, transparency: 93 }
  });
  s12.addShape("oval", {
    x: 7.5, y: 3, w: 4, h: 4,
    fill: { color: EMERALD, transparency: 93 }
  });

  s12.addText("Stop Guessing.\nStart Growing.", {
    x: 0.8, y: 0.8, w: 8.4, h: 2.2,
    fontSize: 48, fontFace: "Arial Black", color: WHITE,
    bold: true, align: "center", valign: "middle", margin: 0
  });

  s12.addText("OPERON", {
    x: 0.8, y: 2.9, w: 8.4, h: 0.7,
    fontSize: 28, fontFace: "Arial Black", color: EMERALD,
    bold: true, align: "center", charSpacing: 6, margin: 0
  });

  s12.addText("AI Restaurant Consulting, On Demand", {
    x: 0.8, y: 3.5, w: 8.4, h: 0.5,
    fontSize: 16, fontFace: "Calibri", color: LIGHT_GRAY,
    align: "center", margin: 0
  });

  // CTA button shape
  s12.addShape("rectangle", {
    x: 3.3, y: 4.15, w: 3.4, h: 0.65,
    fill: { color: EMERALD }
  });
  s12.addText("Get Started Free", {
    x: 3.3, y: 4.15, w: 3.4, h: 0.65,
    fontSize: 18, fontFace: "Calibri", color: WHITE,
    bold: true, align: "center", valign: "middle", margin: 0
  });

  s12.addText("No credit card required", {
    x: 0.8, y: 4.9, w: 8.4, h: 0.4,
    fontSize: 11, fontFace: "Calibri", color: MID_GRAY,
    align: "center", margin: 0
  });

  // Bottom bar
  s12.addShape("rectangle", {
    x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: EMERALD }
  });

  // ── Write file ──
  await pres.writeFile({ fileName: "/Users/shenghangao/Desktop/operon/Operon_Pitch_Deck.pptx" });
  console.log("Pitch deck created successfully!");
}

createDeck().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
