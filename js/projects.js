/* Featured work for the portfolio.
   Add a project by appending an object to window.PROJECTS.
   The order here is the order on the page.
   The tech-stack section is built from each project's stack, so there is no second list.
   Field guide: README.md → "Add a project". */
window.PROJECTS = [
  {
    id: "wdiii-tech-vault",
    title: "WDIII Tech Vault",
    created: "July 2026",
    accent: "lime",
    source: "public",
    blurb:
      "A real-world archive of hands-on consumer tech research: device repairs, customer service tests, battery degradation, ecosystem switching, security audits, and AI software comparisons.",
    points: [
      "Main experiments: EXP 1–7, the Samsung battery case study, and EXP 9 (Apple Ecosystem Security Audit) are done. EXP 8 and EXP 12 are in progress. EXP 10 is paused.",
      "Fodder Archive entries include an AI website-build comparison (a second round was blind, with five models), a month outside the Apple ecosystem, a two-laptop test, and a resolved Soundcore P40i refund. FA-04 is queued.",
      "Documentation viewer with theme switcher, search, section navigation, and Google Drive dossier export. Community Hub uses Firebase auth and per-experiment comments. There is also a device comparison view.",
    ],
    tags: ["v6.3.3", "Public repo", "MIT license"],
    stack: [
      { name: "HTML", group: "Languages" },
      { name: "CSS", group: "Languages" },
      { name: "JavaScript", group: "Languages" },
      { name: "Express", group: "Backend" },
      { name: "Firebase Auth", group: "Backend" },
      { name: "Firestore", group: "Backend" },
      { name: "Realtime Database", group: "Backend" },
      { name: "Node.js", group: "Platform" },
      { name: "Docker", group: "Platform" },
      { name: "Google Cloud Run", group: "Platform" },
      { name: "Firebase Hosting", group: "Platform" },
    ],
    image: "assets/projects/wdiii-tech-vault.jpg",
    imageAlt:
      "Screenshot of the WDIII Tech Vault homepage, headed Consumer Tech Documentation, with the before-you-read warning and section navigation.",
    imageKind: "capture",
    imagePosition: "top",
    live: "https://project-95f7ca57-6daa-40f6-90b.web.app/",
    repo: "https://github.com/PerfecHateyOu/WDIII-Tech-Vault",
  },
  {
    id: "last-local",
    title: "Last Local",
    created: "October 2026",
    accent: "amber",
    source: "public",
    blurb:
      "A first-person liminal horror ride on the NYC G train, from Hoyt–Schermerhorn to Court Square, 13 stops, with your parents. Notice what changes in the car, hide that you noticed, and learn which doors are safe.",
    points: [
      "Built with React, TypeScript, Three.js, and Vite. Build v5.3. All geometry is built in code; there are no model files.",
      "The ride is three chapters, announced by a rollsign. A run takes about 10 minutes and ends in a travel report: sanity retained, mask integrity, and anomaly accuracy, plus a Psychological Log of 13 anomaly types.",
      "Nightmare mode and chapter select unlock after the first finished ride. Chapter II and Chapter III are practice runs: they play like the real ride, and nothing is saved.",
    ],
    tags: ["Build v5.3", "Public repo", "Formerly Court Sq-Bound"],
    stack: [
      { name: "TypeScript", group: "Languages" },
      { name: "React", group: "Interface" },
      { name: "Three.js", group: "Interface" },
      { name: "Vite", group: "Interface" },
      { name: "Web Audio", group: "Interface" },
      { name: "Node.js", group: "Platform" },
      { name: "Docker", group: "Platform" },
      { name: "Google Cloud Run", group: "Platform" },
      { name: "nginx", group: "Platform" },
    ],
    image: "assets/projects/last-local.jpg",
    imageAlt:
      "Screenshot of the Last Local title screen: a subway car interior, the G train rollsign to Court Square, and the prompt to board the train.",
    imageKind: "capture",
    imagePosition: "center",
    live: "https://court-sq-bound-948636552859.us-central1.run.app/",
    repo: "https://github.com/PerfecHateyOu/Last-Local-Liminal-Space-Subway-",
  },
  {
    id: "sound-core-adventure",
    title: "Sound Core Adventure",
    created: "October 2026",
    accent: "pink",
    source: "private",
    blurb:
      "An interactive musical adventure about nonverbal expression. Sound has vanished from the world. Players learn melodies that carry human emotions, sing each region back to life, then use those melodies to talk with friends without sharing a language.",
    points: [
      "Six regions, one emotion each: Whispering Grove (Joy), Stillwater Lake (Calm), Rain Hollow (Sorrow), Ember Peaks (Courage), Crystal Spires (Wonder), and the Sound Core (Harmony).",
      "Players echo melodies on seven Resonance Stones. The Melody Codex teaches phrases such as “Hello! I'm happy.” and “Let's go!”. Jam Circle seats up to six players — each with a colour, shape, and instrument, and nobody has a name. Co-op melodies cannot be finished alone.",
      "Every stone has its own colour, shape, position, and key, and every sound also shows up as a shaped ripple. Keyboard or switch playable. Judging checks stones and order, not timing. Guiding light turns on after misses. There is no fail state. A reduce-motion setting is included, and the OS reduced-motion preference is respected.",
    ],
    tags: ["TypeScript", "Private repository", "MIT project"],
    stack: [
      { name: "TypeScript", group: "Languages" },
      { name: "Web Audio", group: "Interface" },
      { name: "Express", group: "Backend" },
      { name: "WebSockets", group: "Backend" },
      { name: "Docker", group: "Platform" },
    ],
    image: "assets/projects/sca.svg",
    imageAlt:
      "Illustrated stand-in of seven resonance stones, each a different colour and shape. Sound Core Adventure has no public live URL in its README, so this is not a screenshot.",
    imageKind: "illustration",
    imagePosition: "center",
    live: null,
    repo: null,
    note: "Private repository, so the source is not linked. The README does not list a public live URL.",
  },
];
