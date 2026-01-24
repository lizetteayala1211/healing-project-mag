export const navItems = [
  {
    roman: "I",
    label: "Letter from The Healing Project",
    byline: "A look at the artistic and collaborative <br> process by Samora Pinderhughes.",
    path: "/scroll#letter",
  },
  {
    roman: "II",
    label: "Call & Response",
    byline: "Written and visual offerings by community members from Parole Prep, Brotherhood Sister Sol, The Fortune Society, and South Bronx Unite/The Land Stewards.",
    path: "/scroll#call-response",
  },
  {
    roman: "III",
    label: "Community Board",
    byline: "Invitations from each of the <br> aforementioned New York-based <br> organizations to join their work.",
    path: "/scroll#community-board",
  },
  {
    roman: "IV",
    label: "Processing",
    byline: "A reflection by Mahogany L. Browne on <br> this issue’s theme, counter-narratives, and what it means to tell the whole truth.",
    path: "/scroll#processing",
  },
  {
    roman: "V",
    label: "Closing Prayer",
    byline: "A moment of gratitude and <br> grounding by Sue Ariza.",
    path: "/scroll#closing-prayer",
  },
  {
    roman: "VI",
    label: "Collaborators",
    byline: "A list of this issue’s contributors <br> across editorial, design, and artwork.",
    path: "/scroll#collaborators",
  },
];


export const cards = [
  // ===== CALL & RESPONSE =====
  { title: "Finding Purpose in Communities", byline: "by Pamela Smart", color: "#3f5448", path: "/article/finding-purpose-in-communities", section: "call-response" },
  { title: "My Community", byline: "by Remy Trail", color: "#9a775e", path: "/article/my-community", section: "call-response" },
  { title: "Untitled", byline: "by Leonard Wilson", color: "#d2a100", path: "/article/untitled-leonard", section: "call-response" },

  {
    title: "“This is a Place of Vanguards”: A Portrait of the South Bronx",
    byline: "by Liza Austria, Grant Aumell, Nieves Ayress, Vicky Ayress, Melissa Barber, Walter Bosque, Libertad Guerra, Mychal Johnson, and Monxo López",
    color: "#c54a36",
    path: "/article/this-is-a-place-of-vanguards",
    section: "call-response",
  },

  { title: "Magnolia House", byline: "by Meagan Betances", color: "#3c8f92", path: "/article/magnolia-house", section: "call-response" },
  { title: "The Bully and the Bullied", byline: "by Urhiiness Hill", color: "#7faa86", path: "/article/the-bully-and-the-bullied", section: "call-response" },
  { title: "The Community I See", byline: "by Aminata Konate", color: "#a9c9d6", path: "/article/the-community-i-see", section: "call-response" },
  { title: "The Hands That Help", byline: "by Sarah Sanchez", color: "#0f1832", path: "/article/the-hands-that-help", section: "call-response" },
  { title: "We Deserve Wellness", byline: "by Members of The Liberation Program at Brotherhood Sister Sol", color: "#d8a6a3", path: "/article/we-deserve-wellness", section: "call-response" },

  // ===== COMMUNITY BOARD =====
  { title: "A Call to Join Forces with Incarcerated Artists", byline: "by Parole Prep", color: " #d2a100", path: "/article/a-call-to-join", scrollId: "community-board", section: "community-board" },
  { title: "A Call to Breathe Land Back to Life", byline: "by South Bronx Unite/The Land Stewards", color: "#c54a36", path: "/article/a-call-to-breathe", section: "community-board" },
  { title: "A Call To Language & Practitioners", byline: "by The Fortune Society", color: "#3f5448", path: "/article/a-call-to-language", section: "community-board" },
  { title: "A Call to Save Our Schools", byline: "by Brotherhood Sister Sol", color: "#7faa86", path: "/article/a-call-to-save", section: "community-board" },

  // ===== PROCESSING =====
  { title: "Ago Amee", byline: "by Mahogany L. Browne", color: "#9a775e", path: "/article/ago-amee", scrollId: "processing", section: "processing" }
];

const isMobile = window.matchMedia("(max-width: 1023px)").matches;

const formatByline = (byline = "") => {
  if (!isMobile) return byline;           // keep formatting on desktop
  return cleanByline(byline);             // flatten on mobile
};
