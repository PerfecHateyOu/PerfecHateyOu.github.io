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
          '<article class="project" id="' + esc(id) + '" data-accent="' + esc(project.accent || "lime") + '">' +
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
        return '<section class="stack-group"><h3>' + esc(group) + "</h3><ul>" + items + "</ul></section>";
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

  function fileIcon(withShortcut) {
    if (!withShortcut) {
      return '<svg class="ico ico-sm" aria-hidden="true"><use href="#ico-file"></use></svg>';
    }
    return (
      '<span class="ico-wrap"><svg class="ico" aria-hidden="true"><use href="#ico-file"></use></svg>' +
      '<svg class="shortcut" aria-hidden="true"><use href="#ico-shortcut"></use></svg></span>'
    );
  }

  function renderDesktopIcons() {
    const root = document.getElementById("desktop-project-icons");
    if (!root) return;
    root.innerHTML = projects
      .map(function (project) {
        const id = project.id || slug(project.title);
        return (
          '<a class="desk-icon" href="#' + esc(id) + '" data-accent="' + esc(project.accent || "lime") + '">' +
          fileIcon(true) +
          '<span class="label">' + esc(project.title) + "</span></a>"
        );
      })
      .join("");
  }

  function renderStartMenu() {
    const projectsRoot = document.getElementById("start-project-links");
    const liveRoot = document.getElementById("start-live-links");
    const label = document.getElementById("start-project-label");
    if (label) label.hidden = projects.length === 0;
    if (projectsRoot) {
      projectsRoot.innerHTML = projects
        .map(function (project) {
          const id = project.id || slug(project.title);
          return (
            '<a href="#' + esc(id) + '" data-accent="' + esc(project.accent || "lime") + '">' +
            fileIcon(false) +
            "<span>" + esc(project.title) + "</span></a>"
          );
        })
        .join("");
    }
    if (liveRoot) {
      liveRoot.innerHTML = projects
        .filter(function (project) { return hasLink(project.live); })
        .map(function (project) {
          return (
            '<a class="start-ext" href="' + esc(project.live) + '" target="_blank" rel="noopener noreferrer">' +
            '<svg class="ico ico-sm" aria-hidden="true"><use href="#ico-globe"></use></svg>' +
            "<span>" + esc(project.title) + "</span>" +
            '<span class="sr-only"> (opens in a new tab)</span></a>'
          );
        })
        .join("");
    }
    const count = document.getElementById("projects-count");
    if (count) {
      const n = projects.length;
      count.textContent = n + (n === 1 ? " object" : " objects");
    }
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

  renderIndex();
  renderProjects();
  renderStack();
  renderFacts();
  renderDesktopIcons();
  renderStartMenu();
  initTyping();
})();
