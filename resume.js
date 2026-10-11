/* Flat CV copy for the printed/PDF export. Deliberately separate from data.js:
   the log is written for a human browsing, this is written to be parsed. */

const RESUME = {
  name: 'Klim Shchukin',
  title: 'Senior Platform Engineer — Games & Agentic AI',
  site: 'https://minorusan.github.io/mycv/',
  siteNote: 'Full interactive CV, with video and screenshots of the work:',
  location: 'Poltava, Ukraine',
  phone: '+380983048675',
  email: 'minorusan8@gmail.com',
  links: [
    { label: 'LinkedIn', url: 'https://ua.linkedin.com/in/niceguyklim' },
    { label: 'Telegram', url: 'https://t.me/niceguyklim_dev' },
  ],

  summary: [
    'Senior engineer, twelve years shipping mobile games and applications, most of it in Unity and C#. I build the layer under the product — game-mode platforms, reward pipelines, build and deploy infrastructure, native bridges, diagnostic tooling — and I own upgrades and migrations other people would rather not touch.',
    'Also a Flutter developer who designed, built, shipped and sold a subscription app on both stores alone, and, since 2026, a daily practitioner of agentic AI: local models, retrieval, fine-tuning and coding agents, published and in use rather than demonstrated. I teach the subject as well.',
  ],

  experience: [
    {
      company: 'Play Perfect',
      title: 'Senior Platform Engineer',
      location: 'Remote',
      period: 'March 2025 - Present',
      bullets: [
        'Built the platform that ships a new game mode as data rather than a client release: a typed remote configuration contract that fails closed on anything it does not recognise, CDN asset delivery behind a kill switch, and per-move telemetry that survives a session restore. A malformed mode now fails alone.',
        'Designed two game modes on an engine-free C# rules core with a thin engine bridge, so the whole rule set tests outside Unity. The first became the engine the rest were cut from.',
        'Wrote a Python simulator that loads the rules assemblies as .NET DLLs and diffs replayed device sessions against what the client emitted — the only way to debug a non-deterministic simulation on hardware.',
        'Owned a Unity major-version upgrade on branches kept in sync with live releases: package manifests, SDK breakage, Android build configuration, removed engine APIs and store version codes across three game variants.',
        'Rewrote the reward pipeline as a versioned migration collecting rewards from several features into one transfer, each registering its prefabs through a provider registry. Ran both paths against a diff, then deleted the old one.',
        'Built the web build and deploy pipeline from nothing: runners, licences and secrets, artifact hashing, backup retention, staging and production routing.',
      ],
      stack: ['C#', 'Unity', 'Zenject', 'Addressables', 'UniTask', 'NUnit', 'Python', 'GitHub Actions', 'WebGL'],
    },
    {
      company: 'Mantica',
      title: 'Founder & Sole Developer',
      location: 'Poltava, Ukraine',
      period: 'November 2024 - December 2025',
      bullets: [
        'Designed, built, shipped and sold a Flutter subscription app on the App Store and Google Play alone — client, content, billing, landing page and marketing.',
        'Wrote a deterministic astronomical engine with no model in it: twelve unequal day hours against twelve night ones, byte-identical for the same place and date. Later ported into a separate system and held in agreement with it.',
        'Shipped subscriptions on StoreKit and Play Billing, with entitlement checks that survive a reinstall.',
        'Localised the interface, the card meanings and the reference content into nine languages.',
        'Built a two-hundred-entry structured reference cross-referenced against the clock, and a free-form canvas for building and revisiting custom layouts.',
        'Automated marketing production: a pipeline rendering promo reels scored with locally generated music.',
        'Registered the business and took a D-U-N-S number, wrote the listings, privacy policy and data-safety declarations, and passed both store reviews.',
      ],
      stack: ['Flutter', 'Dart', 'Firebase', 'Cloud Firestore', 'StoreKit', 'Play Billing', 'ffmpeg'],
    },
    {
      company: 'Self-Employed (contract)',
      title: 'Senior Unity Developer',
      location: 'Remote',
      period: 'December 2024 - November 2025',
      bullets: [
        'Two behavioural-research applications for a British and an American university, converged from a codebase that had drifted in two: one runtime configuration, with differences expressed per build rather than per codebase.',
        'Rebuilt Android push and local notifications to survive the OS killing the process, with a self-restarting notification manager. A prompt that never arrives is a lost measurement.',
        'Built enrolment and session deeplinks placing a participant in the exact state the study requires, including links opened late.',
        'Carried both onto Unity 6 and added an in-app debug console for non-engineers, gated out of release builds.',
      ],
      stack: ['Unity 6', 'C#', 'Android', 'Deep linking', 'Push notifications'],
    },
    {
      company: 'Warmfare',
      title: 'Senior Unity Developer',
      location: 'Poltava, Ukraine',
      period: 'February 2024 - October 2024',
      bullets: [
        'Embedded a Unity game inside a Flutter application, writing the native bridges in Objective-C, JavaScript and Dart and resolving per-platform memory and compatibility problems.',
        'Led the creative team building a collectible card game from scratch, in the tradition of Marvel Snap and Hearthstone.',
        'Prototyped Node.js and Telegram tooling that shortened the team’s iteration loop.',
      ],
      stack: ['Unity', 'Flutter', 'Dart', 'Objective-C', 'Addressables', 'Zenject', 'Spine', 'Node.js'],
    },
    {
      company: 'Self-Employed (contract)',
      title: 'Senior Unity Developer',
      location: 'Poltava, Ukraine',
      period: 'June 2023 - February 2024',
      bullets: [
        'Carried a client’s mobile game from nothing to soft launch.',
        'Built a Unity project around Stable Diffusion and Google Colab to establish what generative models could actually do inside the engine — the start of the AI work that followed.',
      ],
      stack: ['Unity', 'C#', 'Stable Diffusion', 'Zenject', 'TDD', 'Addressables'],
    },
    {
      company: 'Playgendary',
      title: 'Senior Unity Developer',
      location: 'Poltava, Ukraine',
      period: 'February 2023 - June 2023',
      bullets: [
        'Three live titles with real players on them: new mobs, windows and features on one; tournaments and a season pass built from the infrastructure up on another; a bug sweep and redesign on the third.',
      ],
      stack: ['Unity', 'C#', 'LiveOps'],
    },
    {
      company: 'Self-Employed (contract)',
      title: 'Senior Unity Developer',
      location: 'Poltava, Ukraine',
      period: 'February 2022 - February 2023',
      bullets: [
        'Game AI and game-design tooling for an idle title, infrastructure and architecture for a Monopoly variant, and graffiti tooling plus core architecture for an open-world game.',
        'Shipped Jawharpia, my own application for jaw harp players, and a set of Node.js Telegram bots, one of which is still in use.',
      ],
      stack: ['Unity', 'C#', 'Node.js', 'Telegram API'],
    },
    {
      company: 'Crysberry Studio',
      title: 'Senior Unity Developer',
      location: 'Kharkiv, Ukraine',
      period: 'November 2018 - February 2022',
      bullets: [
        'Architected the backend and embedded radio station for the Kharkiv Literature Museum application, nominated for a Webby.',
        'Rebuilt an American client’s gambling title: near-total refactor of the legacy systems, redesign, UI work and game-designer tooling.',
        'Released a 3D house-builder application that measurably moved the client’s business.',
        'Bridged native iOS SDKs into Unity, and shipped a run of smaller AR applications for small businesses.',
        'Interviewed developers, scoped and estimated presale projects, and ran the R&D behind them.',
      ],
      stack: ['Unity', 'C#', 'Objective-C', 'iOS', 'AR Foundation', 'Backend architecture'],
    },
  ],

  earlier: [
    {
      company: 'iLogos Europe',
      title: 'Unity Developer',
      period: 'May 2018 - November 2018',
      line: 'Outstaffed onto Nekki’s engine team for Shadow Fight 3; hit a 30 fps target on the oldest hardware still supported.',
    },
    {
      company: 'Bini Bambini',
      title: 'Unity Developer',
      period: 'May 2017 - February 2018',
      line: 'Minigames for toddler applications, over a native plugin layer in Objective-C, Java and JavaScript that the whole studio built on.',
    },
    {
      company: 'Tundra Mobile',
      title: 'iOS / Unity Developer',
      period: 'May 2015 - April 2017',
      line: 'Moved a client from game reskins to a visual-novel product with the Node.js backend it had never had; shipped small Unity titles and an Objective-C business application for a laundry franchise.',
    },
    {
      company: 'Digital Cloud Technologies',
      title: '.NET Developer',
      period: 'February 2014 - December 2014',
      line: 'First job, and the only one that was not Unity: a WPF YouTube client for Windows 8 and Windows Phone that could download whole playlists.',
    },
  ],

  rnd: {
    title: 'Independent R&D — Agentic Systems & Self-Hosted AI',
    period: 'January 2026 - Present',
    intro:
      'Everything here runs on hardware I own, against models I host. Some of it has run daily for months; some is still a specification, and each line says which.',
    bullets: [
      'Ayin — a model-agnostic terminal coding agent, published and MIT licensed, and the tool I build everything else with. It studies a codebase unsupervised overnight, choosing its own questions and storing only answers whose citations verify against the bytes on disk.',
      'Zetsu — a self-hosted assistant: one backend daemon owning all state, with Flutter, CLI and web clients. Layered memory — recent window, rolling compression, and a vector store blended by relevance, recency and importance.',
      'Kahili — a Sentry dashboard where four agents group errors, work out causes against the repository and implement change requests, reporting daily from a Raspberry Pi 5.',
      'Keli — an inference gateway and two-GPU scheduler: model registry, per-model queues, VRAM accounting, loading and unloading of LLM, speech-to-text and text-to-speech. In daily use.',
      'A Linux kernel module in C recovering an external GPU over Thunderbolt without a reboot: PCIe bus reset, link-speed capping, AER cleanup.',
      'Pardes — a personal library of roughly 685,000 books on a Raspberry Pi 5: fast search, REST API, Flutter client, ingestion from Telegram.',
      'Computer vision on a NUC that halts a robot vacuum over MIoT before it spreads what it has found, running as a systemd service.',
    ],
  },

  skills: [
    { group: 'Languages', items: ['C#', 'Dart', 'TypeScript', 'JavaScript', 'Python', 'Objective-C', 'C', 'Java'] },
    { group: 'Engines & frameworks', items: ['Unity', 'Unity 6', 'Flutter', 'Node.js', '.NET', 'WPF', 'React'] },
    {
      group: 'Unity ecosystem',
      items: ['Zenject', 'UniRx', 'UniTask', 'Addressables', 'DOTween', 'Spine', 'TextMeshPro', 'Odin Inspector', 'PlayMaker', 'Shader Graph', 'Cg'],
    },
    {
      group: 'Platform & delivery',
      items: ['CI/CD', 'GitHub Actions', 'WebGL', 'Android', 'Gradle', 'iOS', 'CocoaPods', 'Firebase', 'Azure Blob Storage', 'MongoDB', 'PostgreSQL', 'Docker', 'Remote config', 'Telemetry', 'Deep linking', 'Push notifications'],
    },
    {
      group: 'AI & machine learning',
      items: ['Local LLMs', 'Ollama', 'RAG', 'Vector stores', 'LoRA fine-tuning', 'Agentic systems', 'OpenAI API', 'Whisper', 'YOLO', 'OpenCV', 'Stable Diffusion'],
    },
    { group: 'Practice', items: ['TDD', 'NUnit', 'Software architecture', 'Dependency injection', 'Profiling', 'Code review', 'Mentoring', 'Estimation', 'Hiring', 'Technical interviewing'] },
  ],

  education: {
    teaching: 'Lecturing on AI and agentic development — how the agent loop works, where it breaks, and what separates an agent you can point at real code from one that demos well. 2026 to present.',
    courses: [
      'Agentic RAG Architecture — robot_dreams, 2026',
      'Flutter & Dart: The Complete Guide — Udemy, 2024',
      'The Complete Guide to Becoming a Software Architect — Udemy, 2022',
      'The Complete Node.js Developer Course — Udemy, 2020',
      'Deep Learning A-Z: Python & AWS — Udemy, 2019',
      'Graph Theory Algorithms — Udemy, 2019',
      'Shader Development from Scratch with Cg — Udemy, 2018',
    ],
    note: 'Fourteen completed technical courses in total, 2018 to 2026.',
  },

  languages: ['Ukrainian — native', 'Russian — native', 'English — professional working proficiency'],
};
