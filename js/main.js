(function () {
  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const GROUP_ORDER = ["Languages", "Interface", "Backend", "Platform"];

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function slug(title) {
    const base = String(title || "project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return base || "project";
  }

  function hasLink(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function externalLink(href, label, className) {
    return (
      '<a class="' + className + '" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' +
      esc(label) +
      '<span class="sr-only"> (opens in a new tab)</span></a>'
    );
  }

  function num(index) {
    return String(index + 1).padStart(2, "0");
  }

  function renderIndex() {
    const list = document.getElementById("project-index");
    if (!list) return;
    list.innerHTML = projects
      .map(function (project, index) {
        const id = project.id || slug(project.title);
        return (
          "<li><a href=\"#" + esc(id) + "\">" +
          '<span class="toc-no">' + num(index) + "</span>" +
          '<span class="toc-title">' + esc(project.title) + "</span>" +
          '<span class="toc-date">Created ' + esc(project.created || "") + "</span>" +
          "</a></li>"
        );
      })
      .join("");
  }

  function renderProjects() {
    const root = document.getElementById("project-list");
    if (!root) return;
    if (!projects.length) {
      root.innerHTML = '<p class="noscript-note">No projects in js/projects.js yet.</p>';
      return;
    }

    root.innerHTML = projects
      .map(function (project, index) {
        const id = project.id || slug(project.title);
        const tags = (project.tags || [])
          .map(function (tag) {
            return '<li class="tag">' + esc(tag) + "</li>";
          })
          .join("");
        const points = (project.points || [])
          .map(function (point) {
            return "<li>" + esc(point) + "</li>";
          })
          .join("");
        const chipNames = (project.stack || [])
          .map(function (item) {
            return typeof item === "string" ? item : item.name;
          })
          .filter(Boolean);
        const chips = chipNames.length
          ? '<p class="stack-line"><span class="sr-only">Stack: </span>' + esc(chipNames.join(" · ")) + "</p>"
          : "";

        let media;
        if (project.image) {
          const kind = project.imageKind === "illustration" ? "Illustration" : "Live site";
          const eager = index === 0 ? ' fetchpriority="high"' : ' loading="lazy"';
          media =
            '<div class="project-media" style="--img-pos:' + esc(project.imagePosition || "center") + '">' +
            '<img src="' + esc(project.image) + '" alt="' + esc(project.imageAlt || project.title) + '" width="1440" height="900"' + eager + ' decoding="async">' +
            '<span class="media-badge">' + kind + "</span></div>";
        } else {
          media =
            '<div class="project-media"><div class="media-fallback"><span>Screenshot not added</span><strong>' +
            esc(project.title) +
            "</strong></div></div>";
        }

        const actions = [];
        if (hasLink(project.live)) actions.push(externalLink(project.live, "Live site", "btn btn-primary"));
        if (hasLink(project.repo)) actions.push(externalLink(project.repo, "Source", actions.length ? "btn btn-ghost" : "btn btn-primary"));
        const actionHtml = actions.length ? '<div class="actions">' + actions.join("") + "</div>" : "";
        const note = project.note ? '<p class="private-note">' + esc(project.note) + "</p>" : "";
        const sourceLabel = project.source === "private" ? "Private" : "Public";

        return (
          '<article class="project reveal" id="' + esc(id) + '" data-accent="' + esc(project.accent || "lime") + '" style="transition-delay:' + Math.min(index * 70, 280) + 'ms">' +
          media +
          '<div class="project-body">' +
          '<p class="meta-row"><span>' + num(index) + "</span><span>Created " + esc(project.created || "—") + "</span><span>" + sourceLabel + "</span></p>" +
          "<h3>" + esc(project.title) + "</h3>" +
          '<p class="blurb">' + esc(project.blurb || "") + "</p>" +
          (points ? '<ul class="points">' + points + "</ul>" : "") +
          (tags ? '<ul class="tag-row">' + tags + "</ul>" : "") +
          chips +
          actionHtml +
          note +
          "</div></article>"
        );
      })
      .join("");
  }

  function renderStack() {
    const root = document.getElementById("stack-list");
    if (!root) return;
    const groups = new Map();

    projects.forEach(function (project) {
      (project.stack || []).forEach(function (item) {
        const name = typeof item === "string" ? item : item && item.name;
        const group = (item && item.group) || "Other";
        if (!name) return;
        if (!groups.has(group)) groups.set(group, new Map());
        const bucket = groups.get(group);
        if (!bucket.has(name)) bucket.set(name, []);
        const used = bucket.get(name);
        if (used.indexOf(project.title) === -1) used.push(project.title);
      });
    });

    const names = Array.from(groups.keys()).sort(function (a, b) {
      const ai = GROUP_ORDER.indexOf(a);
      const bi = GROUP_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    root.innerHTML = names
      .map(function (group) {
        const items = Array.from(groups.get(group).entries())
          .map(function (entry) {
            return (
              "<li><span class=\"tech-name\">" + esc(entry[0]) + "</span>" +
              '<span class="tech-used">' + esc(entry[1].join(" · ")) + "</span></li>"
            );
          })
          .join("");
        return '<section class="stack-group reveal"><h3>' + esc(group) + "</h3><ul>" + items + "</ul></section>";
      })
      .join("");
  }

  function renderFacts() {
    const root = document.getElementById("about-facts");
    if (!root) return;
    root.innerHTML = projects
      .map(function (project) {
        const id = project.id || slug(project.title);
        const visibility = project.source === "private" ? "Private repository" : "Public repository";
        return (
          "<div><dt><a href=\"#" + esc(id) + "\">" + esc(project.title) + "</a></dt>" +
          "<dd>" + esc(visibility) + " · Created " + esc(project.created || "") + "</dd></div>"
        );
      })
      .join("");
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (motionQuery.matches || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("is-in"); });
      return;
    }
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function initTyping() {
    const target = document.getElementById("bio-text");
    const phrase = "Aspiring Self Taught Full-Stack Developer";
    if (!target) return;
    if (motionQuery.matches) {
      target.textContent = phrase;
      return;
    }
    let index = 0;
    function step() {
      index += 1;
      target.textContent = phrase.slice(0, index);
      if (index < phrase.length) {
        window.setTimeout(step, 38);
      } else {
        const caret = document.querySelector(".caret");
        if (caret) caret.remove();
      }
    }
    window.setTimeout(step, 280);
  }

  function initNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!header || !toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      nav.classList.toggle("is-open", !open);
      if (!open) {
        const first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) closeMenu();
    });

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sectionLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    const sections = sectionLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window) {
      const spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach(function (link) {
              const on = link.getAttribute("href") === "#" + entry.target.id;
              if (on) link.setAttribute("aria-current", "true");
              else link.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
      );
      sections.forEach(function (section) { spy.observe(section); });
    }
  }

  function initBackdrop() {
    const canvas = document.getElementById("grid");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    const sparks = [];

    function seed() {
      sparks.length = 0;
      const count = width < 700 ? 8 : 16;
      for (let i = 0; i < count; i += 1) {
        sparks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 42),
          vy: (Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 28),
        });
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(0);
    }

    function draw(dt) {
      ctx.clearRect(0, 0, width, height);
      const gap = width < 700 ? 52 : 68;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(214, 255, 63, 0.055)";
      ctx.lineWidth = 1;
      for (let x = gap / 2; x < width; x += gap) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
      for (let y = gap / 2; y < height; y += gap) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(214, 255, 63, 0.28)";
      for (let x = gap / 2; x < width; x += gap) {
        for (let y = gap / 2; y < height; y += gap) {
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }

      if (dt && !motionQuery.matches) {
        ctx.fillStyle = "rgba(214, 255, 63, 0.9)";
        sparks.forEach(function (spark) {
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;
          if (spark.x < 0 || spark.x > width) spark.vx *= -1;
          if (spark.y < 0 || spark.y > height) spark.vy *= -1;
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, 1.7, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function start() {
      if (running || motionQuery.matches) return;
      running = true;
      last = performance.now();
      const step = function (now) {
        if (!running) return;
        const dt = Math.min(0.034, (now - last) / 1000);
        last = now;
        draw(dt);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", function () {
        if (motionQuery.matches) {
          stop();
          draw(0);
        } else {
          start();
        }
      });
    }
    start();
  }

  renderIndex();
  renderProjects();
  renderStack();
  renderFacts();
  initReveal();
  initTyping();
  initNav();
  initBackdrop();
})();
