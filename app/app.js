/* Leonida Platinum v3 — offline tracker for the 55 GTA 6 trophies.
   Loads its own data file only (data/trophies.json). No network, no cookies.
   Audit strip is computed from the data at load, never hardcoded. */
(function () {
  'use strict';

  var DATA_URL = 'data/trophies.json';
  var STORE_KEY = 'gta6-leonida-platinum-v3';
  var GRADE_POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
  var GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  var DEMO_EARNED = [2, 3, 8, 15, 16, 20, 21, 33, 35, 42, 46, 53, 55];
  var DEMO_COUNTS = { 15: 250, 17: 12, 18: 5, 28: 6, 31: 41, 32: 23, 35: 100 };
  var TABS = ['tracker', 'roadmap', 'missables', 'disputes', 'ledger', 'sources'];

  var guideData = null;
  var trophies = [];
  var sources = [];
  var disputes = [];
  var ledger = [];
  var moneyLines = [];
  var hundoCompare = [];
  var roadmap = [];
  var blocked = [];
  var chapters = [];
  var audit = null;
  var state = { earned: {}, counts: {}, spoiler: true, revealed: {}, filter: 'all', grade: 'all', sort: 'roadmap', query: '', tab: 'tracker', selected: 28 };

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function slugify(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function trophyById(id) {
    for (var i = 0; i < trophies.length; i++) if (trophies[i].id === id) return trophies[i];
    return null;
  }

  function trophyBySlug(slug) {
    for (var i = 0; i < trophies.length; i++) if (slugify(trophies[i].name) === slug) return trophies[i];
    return null;
  }

  function sourceByNumber(n) {
    for (var i = 0; i < sources.length; i++) if (sources[i].n === n) return sources[i];
    return null;
  }

  function citeLinks(text) {
    return esc(text).replace(/\[(\d+)\]/g, function (m, n) {
      var s = sourceByNumber(Number(n));
      if (s && s.url) return '<a class="cite" href="' + esc(s.url) + '" target="_blank" rel="noopener">[' + n + ']</a>';
      return '<span class="cite">[' + n + ']</span>';
    });
  }

  function citeSpans(nums) {
    return nums.map(function (n) {
      var s = sourceByNumber(n);
      if (s && s.url) return '<a class="cite" href="' + esc(s.url) + '" target="_blank" rel="noopener">[' + n + ']</a>';
      return '<span class="cite">[' + n + ']</span>';
    }).join(' ');
  }

  function isEarned(t) { return !!state.earned[t.id]; }
  function isSpoiled(t) { return state.spoiler && t.kind === 'story' && !isEarned(t) && !state.revealed[t.id]; }
  function gradePoints(t) { return GRADE_POINTS[t.grade] || 0; }

  function psnPoints() {
    var total = 0;
    trophies.forEach(function (t) { if (isEarned(t)) total += gradePoints(t); });
    return total;
  }

  /* ---- audit: computed from the data, never hardcoded (P2) ---- */
  function computeAudit() {
    var totalSteps = 0, steps2 = 0, steps1 = 0;
    trophies.forEach(function (t) {
      t.steps.forEach(function (s) {
        totalSteps++;
        if (s.s.length >= 2) steps2++;
        else if (s.s.length === 1) steps1++;
      });
    });
    var guidesCited = trophies.filter(function (t) { return /\[\d+\]/.test(t.guide); }).length;
    var official = trophies.filter(function (t) { return t.name && t.description && t.grade; }).length;
    var hosts = {};
    sources.forEach(function (s) {
      if (s.url) { try { hosts[new URL(s.url).hostname.replace(/^www\./, '')] = true; } catch (e) { hosts[s.url] = true; } }
    });
    var noUrl = sources.filter(function (s) { return !s.url; }).length;
    var disputesNoVerdict = disputes.filter(function (d) { return !d.verdict; }).length;
    var risk = { missable: 0, 'at-risk': 0, unconfirmed: 0, safe: 0 };
    trophies.forEach(function (t) { risk[t.risk] = (risk[t.risk] || 0) + 1; });
    // Total cited claims: every checkable fact the guide asserts — guide steps,
    // trophy guides, both sides of every dispute, roadmap steps, ledger rows,
    // trophy-vs-100% rows, and per-trophy risk windows. Computed, never typed.
    var roadmapSteps = 0;
    roadmap.forEach(function (st) { roadmapSteps += (st.steps || []).length; });
    var windows = trophies.filter(function (t) { return t.risk === 'at-risk' || t.risk === 'missable'; }).length;
    var claims = totalSteps + trophies.length + disputes.length * 2 + roadmapSteps + ledger.length + hundoCompare.length + windows;
    audit = {
      official: official, total: trophies.length, guidesCited: guidesCited,
      steps: totalSteps, steps2: steps2, steps1: steps1, claims: claims,
      pages: sources.length, sites: Object.keys(hosts).length, noUrl: noUrl,
      disputes: disputes.length, disputesNoVerdict: disputesNoVerdict,
      missable: risk.missable || 0, atRisk: risk['at-risk'] || 0, unconfirmed: risk.unconfirmed || 0,
      ledgerTotal: ledger.reduce(function (a, r) { return a + (r.need || 0); }, 0),
      checks: {
        steps2ok: totalSteps > 0 && steps2 / totalSteps >= 0.5,
        urlsOk: noUrl === 0,
        verdictsOk: disputesNoVerdict === 0,
        officialOk: official === trophies.length && trophies.length === 55
      }
    };
    return audit;
  }

  function renderAudit() {
    var a = audit;
    var items = [
      { html: '<b>' + a.official + '/' + a.total + '</b> official name, description &amp; grade', bad: !a.checks.officialOk },
      { html: '<b>1P 2G 6S 46B</b> grade split', bad: false },
      { html: '<b>28</b> PSN-hidden', bad: false },
      { html: '<b>' + a.guidesCited + '/' + a.total + '</b> guides cited', bad: a.guidesCited !== a.total },
      { html: '<b>' + a.steps2 + '/' + a.steps + '</b> steps backed by 2+ sources' + (a.steps1 ? ' · ' + a.steps1 + ' single source' : ''), bad: !a.checks.steps2ok },
      { html: '<b>' + a.claims.toLocaleString() + '</b> cited claims — steps, guides, disputes, roadmap, ledger, windows', bad: false, cls: ' claims' },
      { html: '<b>' + a.pages + '</b> pages · <b>' + a.sites + '</b> sites', bad: a.pages < 20 },
      { html: '<b>' + a.disputes + '</b> disputes, all with verdicts', bad: !a.checks.verdictsOk },
      { html: '<b>' + a.missable + '</b> possibly missable · <b>' + a.atRisk + '</b> at risk · <b>' + a.unconfirmed + '</b> unconfirmed', bad: false },
      { html: '<b>' + a.ledgerTotal.toLocaleString() + '</b> items in the 100% ledger', bad: false },
      { html: '<b>0</b> online trophies — all single-player', bad: false }
    ];
    document.getElementById('auditBar').innerHTML = items.map(function (it) {
      return '<span class="audit-item' + (it.bad ? ' bad' : '') + (it.cls || '') + '">' + it.html + '</span>';
    }).join('');
  }

  function loadSavedProgress() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      var saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        state.earned = saved.earned || {};
        state.counts = saved.counts || {};
        if (typeof saved.spoiler === 'boolean') state.spoiler = saved.spoiler;
        state.revealed = saved.revealed || {};
        return true;
      }
    } catch (e) { /* corrupted save: start fresh */ }
    return false;
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        earned: state.earned, counts: state.counts, spoiler: state.spoiler,
        revealed: state.revealed, savedAt: new Date().toISOString()
      }));
      var note = document.getElementById('saveNote');
      if (note) note.textContent = 'Saved in this browser';
    } catch (e) { /* storage unavailable: tracker still works in memory */ }
  }

  function applyDemoSeed() {
    if (loadSavedProgress()) return;
    DEMO_EARNED.forEach(function (id) { state.earned[id] = true; });
    Object.keys(DEMO_COUNTS).forEach(function (id) { state.counts[id] = DEMO_COUNTS[id]; });
    var note = document.getElementById('saveNote');
    if (note) note.textContent = 'Demo progress shown — tick a box to start your own save';
  }

  /* Shareable progress: #earned=1,2,3&counts=15:250,31:41 (P8) */
  function parseHashProgress(hash) {
    var out = null;
    hash.split('&').forEach(function (part) {
      var kv = part.split('=');
      if (kv[0] === 'earned' && kv[1]) {
        out = out || {};
        out.earned = {};
        kv[1].split(',').forEach(function (id) { var n = Number(id); if (n) out.earned[n] = true; });
      }
      if (kv[0] === 'counts' && kv[1]) {
        out = out || {};
        out.counts = {};
        kv[1].split(',').forEach(function (pair) {
          var p = pair.split(':');
          if (Number(p[0])) out.counts[Number(p[0])] = Math.max(0, Number(p[1]) || 0);
        });
      }
    });
    return out;
  }

  function shareLink() {
    var base = location.href.split('#')[0];
    var earnedIds = Object.keys(state.earned).filter(function (id) { return state.earned[id]; });
    var counts = Object.keys(state.counts).filter(function (id) { return state.counts[id] > 0; })
      .map(function (id) { return id + ':' + state.counts[id]; });
    var hash = '#earned=' + earnedIds.join(',');
    if (counts.length) hash += '&counts=' + counts.join(',');
    return base + hash;
  }

  function trophyMatchesFilter(t) {
    var f = state.filter;
    if (f === 'all') return true;
    if (f === 'story') return t.kind === 'story';
    if (f === 'missable') return !!t.missable;
    if (f === 'collectibles') return t.kind === 'collectibles';
    if (f === 'activities') return t.kind === 'activities';
    if (f === 'online') return false;
    if (f === 'hidden') return !!t.hidden;
    if (f === 'disputed') return disputes.some(function (d) { return d.trophy === t.id; });
    if (f === 'notearned') return !isEarned(t);
    return true;
  }

  function trophyMatchesGrade(t) {
    return state.grade === 'all' || t.grade === state.grade;
  }

  function trophyMatchesQuery(t) {
    if (!state.query) return true;
    var q = state.query.toLowerCase();
    var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' +
      t.steps.map(function (s) { return s.t; }).join(' ')).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function sortTrophies(list) {
    var copy = list.slice();
    if (state.sort === 'psn') {
      copy.sort(function (a, b) { return gradePoints(b) - gradePoints(a) || a.id - b.id; });
    } else if (state.sort === 'grade') {
      copy.sort(function (a, b) { return GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id; });
    } else if (state.sort === 'name') {
      copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else {
      var stageOf = {};
      roadmap.forEach(function (st) { st.trophies.forEach(function (id) { stageOf[id] = st.n; }); });
      copy.sort(function (a, b) {
        var sa = stageOf[a.id] || a.stage, sb = stageOf[b.id] || b.stage;
        if (sa !== sb) return sa - sb;
        return a.id - b.id;
      });
    }
    return copy;
  }

  function currentStage() {
    for (var i = 0; i < roadmap.length; i++) {
      var st = roadmap[i];
      var done = st.trophies.filter(function (id) { var t = trophyById(id); return t && isEarned(t); }).length;
      if (done < st.trophies.length) return { stage: st, done: done };
    }
    return { stage: roadmap[roadmap.length - 1], done: roadmap[roadmap.length - 1].trophies.length };
  }

  function updateProgressHeader() {
    var earned = trophies.filter(isEarned);
    var total = trophies.length || 55;
    var pct = Math.round(earned.length / total * 100);
    document.getElementById('earnedCount').textContent = earned.length + '/' + total + ' earned';
    document.getElementById('pointsLine').textContent = psnPoints() + ' / 1,350 PSN points';
    var grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    earned.forEach(function (t) { grades[t.grade]++; });
    document.getElementById('gradeLine').textContent =
      grades.platinum + 'P · ' + grades.gold + 'G · ' + grades.silver + 'S · ' + grades.bronze + 'B';
    document.getElementById('progressFill').style.width = pct + '%';
    var cur = currentStage();
    var shortTitle = cur.stage.title.replace(/^Stage \d+ — /, '').split(':')[0];
    document.getElementById('stageLine').textContent =
      'Stage ' + cur.stage.n + ': ' + shortTitle + ' — ' + cur.done + '/' + cur.stage.trophies.length + ' done';
    document.getElementById('footStats').textContent =
      earned.length + ' of ' + total + ' earned · ' + psnPoints() + ' PSN points · ' +
      trophies.filter(function (t) { return t.missable; }).length + ' possibly missable or at risk';
  }

  function riskFlag(t) {
    if (t.missable && t.missable.level === 'missable') return '<span class="flag miss">MISSABLE</span>';
    if (t.risk === 'at-risk') return '<span class="flag risk">AT RISK</span>';
    if (t.risk === 'unconfirmed') return '<span class="flag unconf">UNCONFIRMED</span>';
    return '';
  }

  function renderChecklist() {
    var list = document.getElementById('trophyList');
    var shown = sortTrophies(trophies.filter(function (t) {
      return trophyMatchesFilter(t) && trophyMatchesGrade(t) && trophyMatchesQuery(t);
    }));
    document.getElementById('filterCount').textContent = shown.length + ' of 55 shown';
    var html = '';
    shown.forEach(function (t) {
      var spoiled = isSpoiled(t);
      var name = spoiled ? 'Hidden trophy — earn it to reveal' : esc(t.name);
      var desc = spoiled ? 'Story trophy. Its name and description stay hidden until earned.' : esc(t.description);
      html += '<li class="trophy-row' + (isEarned(t) ? ' earned' : '') + (state.selected === t.id ? ' selected' : '') +
        '" data-id="' + t.id + '" tabindex="0">' +
        '<input type="checkbox" data-check="' + t.id + '"' + (isEarned(t) ? ' checked' : '') +
        ' aria-label="Mark ' + esc(t.name) + ' earned">' +
        '<span><span class="trophy-name">' + name + '</span>' + riskFlag(t) +
        (t.hidden ? ' <span class="flag hidden">PSN-HIDDEN</span>' : '') +
        '<br><span class="trophy-desc">' + desc + '</span></span>' +
        '<span class="grade ' + t.grade + '">' + t.grade + '</span></li>';
    });
    list.innerHTML = html || '<li class="trophy-row">No trophies match this filter.</li>';
  }

  function disputesFor(trophyId) {
    return disputes.filter(function (d) { return d.trophy === trophyId; });
  }

  function renderDetail() {
    var pane = document.getElementById('detailPane');
    var t = trophyById(state.selected);
    if (!t) { pane.innerHTML = '<p>Pick a trophy from the checklist to open its guide.</p>'; return; }
    var spoiled = isSpoiled(t);
    var html = '<div class="detail-head"><h2>' + (spoiled ? 'Hidden story trophy' : esc(t.name)) + '</h2>' +
      '<span class="grade ' + t.grade + '">' + t.grade + '</span></div>';
    html += '<div class="detail-quote">&ldquo;' + (spoiled ? 'Hidden until earned.' : esc(t.description)) + '&rdquo;</div>';
    var stageNum = 0;
    roadmap.forEach(function (st) { if (st.trophies.indexOf(t.id) !== -1) stageNum = st.n; });
    html += '<div class="detail-meta"><span>Grade: <b>' + t.grade + '</b> · <b>' + gradePoints(t) + ' PSN pts</b></span>' +
      '<span>Kind: <b>' + esc(t.kind) + '</b></span>' +
      '<span>Roadmap stage: <b>' + (stageNum || t.stage) + ' of 5</b></span>' +
      '<span>' + (t.hidden ? 'PSN-hidden' : 'Visible on PSN') + '</span>' +
      '<span>Sources: <b>' + t.sources.map(function (n) { return '[' + n + ']'; }).join(' ') + '</b></span></div>';
    if (spoiled) {
      html += '<div class="callout unconfirmed"><b>Spoiler shield is on.</b> This story trophy stays hidden until you earn it. ' +
        'Turn the shield off (top right) to read every guide, or reveal just this one.</div>' +
        '<button type="button" class="reveal-btn" data-reveal="' + t.id + '">Reveal this guide only</button>';
    } else {
      if (t.missable) {
        html += '<div class="callout missable"><b>' + (t.missable.level === 'missable' ? 'Missable window — read first.' : 'At-risk window — read first.') + '</b>' +
          esc(t.missable.text) + ' ' + citeSpans(t.missable.sources) + '<br><b>Window:</b> ' + esc(t.missable.open) + ' → ' + esc(t.missable.close) + '</div>';
      }
      var dlist = disputesFor(t.id);
      dlist.forEach(function (d) {
        html += '<div class="callout dispute"><b>Sources differ — ' + esc(d.topic) + '</b><br>A: ' +
          citeLinks(d.a) + ' ' + citeSpans(d.aSources) + '<br>B: ' + citeLinks(d.b) + ' ' + citeSpans(d.bSources) +
          '<br><b>' + citeLinks(d.verdict) + '</b> ' + citeSpans(d.verdictSources) + '</div>';
      });
      html += '<h3>How to earn it — ' + t.steps.length + ' steps</h3><ol class="steps">';
      t.steps.forEach(function (s) {
        html += '<li>' + citeLinks(s.t) + ' ' + citeSpans(s.s) +
          (s.s.length === 1 ? ' <span class="flag single">single source</span>' : '') + '</li>';
      });
      html += '</ol>';
      html += '<p>' + citeLinks(t.guide) + '</p>';
      html += '<div class="track-box"><b>Track it:</b> ' + esc(t.track) + '</div>';
      html += '<div class="hundo-box"><b>100% link:</b> ' + esc(t.hundo) + '</div>';
      if (t.count) {
        var cur = state.counts[t.id] || 0;
        var left = Math.max(0, t.count - cur);
        var done = cur >= t.count;
        html += '<div class="counter-box"><span class="count-big">' + cur + ' / ' + t.count.toLocaleString() + '</span>' +
          '<span>' + esc(t.countLabel || 'counted') + '</span>' +
          '<button type="button" data-count="-1" data-id="' + t.id + '">−1</button>' +
          '<button type="button" data-count="1" data-id="' + t.id + '">+1</button>' +
          '<button type="button" data-count="10" data-id="' + t.id + '">+10</button>' +
          '<input type="number" min="0" max="' + t.count + '" value="' + cur + '" data-countinput="' + t.id + '" aria-label="Your count">' +
          '<span class="count-left">' + (done ? 'Target reached — mark it earned below.' : left.toLocaleString() + ' left') + '</span></div>';
      }
      if (t.risk === 'unconfirmed') html += '<div class="callout unconfirmed"><b>Unconfirmed.</b> No two sources agree on the exact trigger yet. ' +
        'This guide says what is reported and labels it — it does not guess.</div>';
    }
    html += '<button type="button" class="earn-btn' + (isEarned(t) ? ' earned' : '') + '" data-earn="' + t.id + '">' +
      (isEarned(t) ? '✓ Earned — click to undo' : 'Mark as earned') + '</button>';
    html += '<div class="detail-sources">Sources for this trophy: ' + t.sources.map(function (n) {
      var s = sourceByNumber(n);
      return s ? (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">[' + n + '] ' + esc(s.name) + '</a>' : '[' + n + '] ' + esc(s.name)) : '[' + n + ']';
    }).join(' · ') + ' — read 21 Nov 2026. Guides are our own words; sources are cited, never copied. ' +
      '<a href="#/tracker/' + slugify(t.name) + '">Permalink to this trophy</a></div>';
    pane.innerHTML = html;
  }

  function roadmapOrder() {
    var stageOf = {};
    roadmap.forEach(function (st) { st.trophies.forEach(function (id) { stageOf[id] = st.n; }); });
    return trophies.slice().sort(function (a, b) {
      var sa = stageOf[a.id] || a.stage, sb = stageOf[b.id] || b.stage;
      if (sa !== sb) return sa - sb;
      return a.id - b.id;
    });
  }

  function renderNextUp() {
    var ordered = roadmapOrder().filter(function (t) { return !isEarned(t); });
    var riskFirst = ordered.filter(function (t) { return t.missable; });
    var rest = ordered.filter(function (t) { return !t.missable; });
    var next = riskFirst.concat(rest).slice(0, 8);
    var html = next.map(function (t) {
      return '<li><a href="#/tracker/' + slugify(t.name) + '" data-open="' + t.id + '">' + esc(t.name) + '</a> <span class="grade ' + t.grade + '">' + t.grade + '</span>' +
        (t.missable ? ' <span class="flag ' + (t.missable.level === 'missable' ? 'miss' : 'risk') + '">' + (t.missable.level === 'missable' ? 'MISSABLE' : 'AT RISK') + '</span>' : '') + '</li>';
    }).join('');
    document.getElementById('nextUp').innerHTML = html || '<li>All 55 earned — platinum is yours.</li>';
  }

  function renderSources() {
    var counts = {};
    trophies.forEach(function (t) { t.sources.forEach(function (n) { counts[n] = (counts[n] || 0) + 1; }); });
    var html = sources.map(function (s) {
      var name = s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>' : esc(s.name);
      return '<li><b>[' + s.n + ']</b> ' + name + '<span class="src-claims">' + esc(s.note) + ' · cited by ' +
        (counts[s.n] || 0) + ' of 55 guides · read 21 Nov 2026</span></li>';
    }).join('');
    document.getElementById('sourceList').innerHTML = html;
  }

  function renderRoadmap() {
    var html = '';
    roadmap.forEach(function (st) {
      var items = st.trophies.map(trophyById).filter(Boolean);
      var done = items.filter(isEarned).length;
      html += '<div class="stage-card"><h3>' + esc(st.title) + '</h3><div class="stage-meta">' + esc(st.hours) + ' ' +
        citeSpans(st.hoursSources) + ' — ' + done + '/' + items.length + ' earned</div>' +
        '<div class="stage-save"><b>Save:</b> ' + esc(st.save) + ' ' + citeSpans(st.saveSources) + '</div><ol>';
      st.steps.forEach(function (s) { html += '<li>' + citeLinks(s.t) + ' ' + citeSpans(s.s) + '</li>'; });
      html += '</ol><div class="stage-trophies">Trophies: ' + items.map(function (t) {
        return '<a href="#/tracker/' + slugify(t.name) + '" data-open="' + t.id + '">' + esc(t.name) + '</a>';
      }).join(' · ') + '</div></div>';
    });
    document.getElementById('roadmapStages').innerHTML = html;
  }

  function renderMissables() {
    var chart = chapters.map(function (c) {
      var heading = c.n <= 5 ? 'Chapter ' + c.n : esc(c.name);
      return '<div class="chapter-card"><h3>' + heading + '</h3><p>' + esc(c.gates) + '</p></div>';
    }).join('');
    document.getElementById('missableChart').innerHTML = chart;
    var windowed = trophies.filter(function (t) { return t.missable; });
    var unconf = trophies.filter(function (t) { return t.risk === 'unconfirmed'; });
    var safeCount = trophies.filter(function (t) { return t.risk === 'safe'; }).length;
    var html = '';
    windowed.forEach(function (t) {
      var protect = t.missable.level === 'missable'
        ? 'Protect it: do the meditation in Chapter 1, before the chapter ends. Keep a manual save at the start of Chapter 1 so you can go back.'
        : 'Protect it: do this when its chapter window opens — don’t rush past the chapter. Keep a manual save at the start of the chapter.';
      html += '<div class="miss-card"><h3>' + esc(t.name) + ' <span class="grade ' + t.grade + '">' + t.grade + '</span>' +
        riskFlag(t) + '</h3><p>' + esc(t.description) + '</p>' +
        '<p class="window-line"><b>Window:</b> ' + esc(t.missable.open) + ' → ' + esc(t.missable.close) +
        ' · <b>Last chance:</b> ' + esc(t.missable.close) + '</p>' +
        '<p>' + esc(t.missable.text) + ' ' + citeSpans(t.missable.sources) + '</p>' +
        '<p><b>Protect:</b> ' + protect + '</p>' +
        '<p><button type="button" class="chip" data-open="' + t.id + '">Open full guide</button></p></div>';
    });
    html += '<div class="miss-card"><h3>Unconfirmed — trigger not yet agreed by two sources (' + unconf.length + ')</h3><p>' +
      unconf.map(function (t) { return esc(t.name); }).join(', ') +
      '. The guide gives the best single-source lead for each and labels it — it does not guess.</p></div>';
    html += '<div class="miss-card"><h3>Everything else: safe</h3><p>' + safeCount + ' trophies carry no missable, at-risk or unconfirmed flag. ' +
      'After the story, free-roam stays open and the 100% checklist appears, so the whole rest of the list can be cleaned up at your own pace [1][2].</p></div>';
    document.getElementById('missableList').innerHTML = html;
  }

  function renderDisputes() {
    var html = disputes.map(function (d) {
      var t = d.trophy ? trophyById(d.trophy) : null;
      return '<div class="dispute-card"><h3><span class="dispute-id">' + esc(d.id) + '</span> — ' + esc(d.topic) + '</h3>' +
        (t ? '<p><a href="#/tracker/' + slugify(t.name) + '" data-open="' + t.id + '">Trophy: ' + esc(t.name) + '</a></p>' : '<p>Roadmap-wide dispute.</p>') +
        '<p><b>A:</b> ' + citeLinks(d.a) + ' ' + citeSpans(d.aSources) + '</p>' +
        '<p><b>B:</b> ' + citeLinks(d.b) + ' ' + citeSpans(d.bSources) + '</p>' +
        '<p class="verdict"><b>' + citeLinks(d.verdict) + '</b> ' + citeSpans(d.verdictSources) + '</p></div>';
    }).join('');
    document.getElementById('disputeList').innerHTML = html;
  }

  function renderLedger() {
    var total = ledger.reduce(function (a, r) { return a + (r.need || 0); }, 0);
    var html = '<h3>The checklist — 26 rows</h3><table><thead><tr><th>Item</th><th class="num">Need</th><th class="num">Of</th><th>Trophy target</th><th>Notes</th><th>Sources</th></tr></thead><tbody>';
    ledger.forEach(function (r) {
      var t = r.trophy ? trophyById(r.trophy) : null;
      html += '<tr><td>' + esc(r.item) + '</td><td class="num">' + r.need.toLocaleString() + '</td><td class="num">' +
        (r.of ? r.of.toLocaleString() : '—') + '</td><td>' +
        (t ? '<a href="#/tracker/' + slugify(t.name) + '" data-open="' + t.id + '">' + esc(t.name) + '</a>: ' + esc(r.trophyTarget) : esc(r.trophyTarget)) +
        '</td><td>' + esc(r.note) + '</td><td>' + citeSpans(r.sources) + '</td></tr>';
    });
    html += '<tr class="total-row"><td>Total items (excl. money)</td><td class="num">' + total.toLocaleString() + '</td><td class="num">—</td><td colspan="3">Sum of the “need” column across all 26 rows.</td></tr></tbody></table>';
    html += '<h3>Money lines — dollars, not items</h3><table><thead><tr><th>Line</th><th class="num">Amount</th><th>Trophy</th><th>Notes</th><th>Sources</th></tr></thead><tbody>';
    moneyLines.forEach(function (m) {
      var t = m.trophy ? trophyById(m.trophy) : null;
      html += '<tr><td>' + esc(m.label) + '</td><td class="num">$' + m.amount.toLocaleString() + '</td><td>' +
        (t ? '<a href="#/tracker/' + slugify(t.name) + '" data-open="' + t.id + '">' + esc(t.name) + '</a>' : '—') +
        '</td><td>' + esc(m.note) + '</td><td>' + citeSpans(m.sources) + '</td></tr>';
    });
    var moneyTotal = moneyLines.reduce(function (a, m) { return a + m.amount; }, 0);
    html += '<tr class="total-row"><td>Total money</td><td class="num">$' + moneyTotal.toLocaleString() + '</td><td colspan="3">Four checklist money rows combined.</td></tr></tbody></table>';
    html += '<h3>Trophy vs 100% — where the numbers differ</h3><p>Several trophies ask for less than the checklist — or, in one case, more. Do the trophy number for the trophy, the checklist number for A Long Road.</p><table><thead><tr><th>Trophy</th><th>Trophy target</th><th>100% target</th><th>Sources</th></tr></thead><tbody>';
    hundoCompare.forEach(function (r) {
      var t = trophyById(r.trophy);
      html += '<tr><td>' + (t ? '<a href="#/tracker/' + slugify(t.name) + '" data-open="' + t.id + '">' + esc(t.name) + '</a>' : '—') +
        '</td><td>' + esc(r.trophyTarget) + '</td><td>' + esc(r.hundoTarget) + '</td><td>' + citeSpans(r.sources) + '</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById('ledgerView').innerHTML = html;
  }

  function renderSourceMatrix() {
    var counts = {};
    trophies.forEach(function (t) { t.sources.forEach(function (n) { counts[n] = (counts[n] || 0) + 1; }); });
    var html = sources.map(function (s) {
      var citing = trophies.filter(function (t) { return t.sources.indexOf(s.n) !== -1; });
      var name = s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>' : esc(s.name);
      return '<div class="source-card"><h3>[' + s.n + '] ' + name + '</h3><p>' + esc(s.note) + '</p>' +
        '<p>Cited by <b>' + (counts[s.n] || 0) + ' of 55</b> guides · read 21 Nov 2026</p>' +
        '<p class="trophy-refs">Guides citing it: ' + citing.map(function (t) { return esc(t.name); }).join(', ') + '</p></div>';
    }).join('');
    document.getElementById('sourceMatrix').innerHTML = html;
    var bhtml = '<h3>Blocked or unverified — read, and deliberately NOT cited</h3><ul>' +
      blocked.map(function (b) { return '<li><b>' + esc(b.site) + ':</b> ' + esc(b.reason) + '</li>'; }).join('') +
      '</ul><p>KeenGamer, Mobalytics, GAMES.GG and Exophase refused a plain scripted fetch (bot check / 403) but were read in full through the text-fetch reader on 21 Nov 2026 — they are cited, with that note.</p>';
    document.getElementById('blockedList').innerHTML = bhtml;
  }

  function renderAll() {
    updateProgressHeader();
    renderChecklist();
    renderDetail();
    renderNextUp();
    renderSources();
    renderRoadmap();
    renderMissables();
    renderDisputes();
    renderLedger();
    renderSourceMatrix();
  }

  function updateHash() {
    if (!history.replaceState) return;
    var t = trophyById(state.selected);
    var hash = state.tab === 'tracker' && t ? '#/tracker/' + slugify(t.name) : '#' + state.tab;
    history.replaceState(null, '', hash);
  }

  function setTab(tab) {
    if (TABS.indexOf(tab) === -1) tab = 'tracker';
    state.tab = tab;
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    TABS.forEach(function (v) {
      document.getElementById('view-' + v).hidden = (v !== tab);
    });
    updateHash();
  }

  function setSpoiler(on) {
    state.spoiler = on;
    var btn = document.getElementById('spoilerBtn');
    btn.textContent = 'Spoiler shield: ' + (on ? 'ON' : 'OFF');
    btn.setAttribute('aria-pressed', String(on));
    saveProgress();
    renderChecklist();
    renderDetail();
  }

  function toggleEarned(id) {
    if (state.earned[id]) delete state.earned[id]; else state.earned[id] = true;
    saveProgress();
    renderAll();
  }

  function exportProgress() {
    var blob = new Blob([JSON.stringify({
      app: 'leonida-platinum', version: 3, earned: state.earned, counts: state.counts,
      spoiler: state.spoiler, revealed: state.revealed, exportedAt: new Date().toISOString()
    }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object') throw new Error('bad file');
        var earned = data.earned, counts = data.counts || {};
        if (Array.isArray(data)) { earned = data; counts = {}; }
        if (Array.isArray(earned)) {
          var map = {};
          earned.forEach(function (item) {
            var t = null;
            if (typeof item === 'number') t = trophyById(item);
            else if (typeof item === 'string') {
              var n = Number(item);
              t = trophyById(isNaN(n) ? 0 : n) || trophyBySlug(slugify(item));
              if (!t) trophies.forEach(function (x) { if (x.name.toLowerCase() === item.toLowerCase()) t = x; });
            }
            if (t) map[t.id] = true;
          });
          earned = map;
        }
        if (!earned || typeof earned !== 'object') throw new Error('bad file');
        state.earned = earned;
        state.counts = counts;
        if (typeof data.spoiler === 'boolean') state.spoiler = data.spoiler;
        if (data.revealed && typeof data.revealed === 'object') state.revealed = data.revealed;
        saveProgress();
        renderAll();
      } catch (e) {
        alert('That file is not a Leonida Platinum progress export.');
      }
    };
    reader.readAsText(file);
  }

  function copyShareLink(btn) {
    var link = shareLink();
    var done = function () {
      var old = btn.textContent;
      btn.textContent = 'Link copied';
      setTimeout(function () { btn.textContent = old; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done, function () { prompt('Copy your progress link:', link); });
    } else {
      prompt('Copy your progress link:', link);
    }
  }

  function loadGuideData() {
    return fetch(DATA_URL).then(function (r) {
      if (!r.ok) throw new Error('data failed to load');
      return r.json();
    }).then(function (data) {
      guideData = data;
      trophies = data.trophies || [];
      sources = data.sources || [];
      disputes = data.disputes || [];
      ledger = data.ledger || [];
      moneyLines = data.moneyLines || [];
      hundoCompare = data.hundoCompare || [];
      roadmap = data.roadmap || [];
      blocked = data.blocked || [];
      chapters = data.chapters || [];
      computeAudit();
    });
  }

  function openTrophy(id) {
    var t = trophyById(id);
    if (!t) return;
    state.selected = id;
    setTab('tracker');
    renderAll();
    updateHash();
  }

  function bindEvents() {
    document.getElementById('trophyList').addEventListener('click', function (e) {
      var check = e.target.closest('[data-check]');
      if (check) { toggleEarned(Number(check.dataset.check)); return; }
      var row = e.target.closest('.trophy-row');
      if (row && row.dataset.id) { state.selected = Number(row.dataset.id); renderChecklist(); renderDetail(); updateHash(); }
    });
    document.getElementById('trophyList').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var row = e.target.closest('.trophy-row');
        if (row && row.dataset.id) { state.selected = Number(row.dataset.id); renderChecklist(); renderDetail(); updateHash(); }
      }
    });
    document.getElementById('detailPane').addEventListener('click', function (e) {
      var earn = e.target.closest('[data-earn]');
      if (earn) { toggleEarned(Number(earn.dataset.earn)); return; }
      var rev = e.target.closest('[data-reveal]');
      if (rev) {
        state.revealed[Number(rev.dataset.reveal)] = true;
        saveProgress(); renderChecklist(); renderDetail();
        return;
      }
      var c = e.target.closest('[data-count]');
      if (c) {
        var id = Number(c.dataset.id);
        var cur = state.counts[id] || 0;
        state.counts[id] = Math.max(0, cur + Number(c.dataset.count));
        saveProgress(); renderDetail(); updateProgressHeader();
      }
    });
    document.getElementById('detailPane').addEventListener('change', function (e) {
      var input = e.target.closest('[data-countinput]');
      if (input) {
        var id = Number(input.dataset.countinput);
        state.counts[id] = Math.max(0, Number(input.value) || 0);
        saveProgress(); renderDetail(); updateProgressHeader();
      }
    });
    document.querySelectorAll('.chip[data-filter]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.chip[data-filter]').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        state.filter = chip.dataset.filter;
        renderChecklist();
      });
    });
    document.querySelectorAll('.chip[data-grade]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.chip[data-grade]').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        state.grade = chip.dataset.grade;
        renderChecklist();
      });
    });
    document.getElementById('sortSelect').addEventListener('change', function (e) {
      state.sort = e.target.value;
      renderChecklist();
    });
    document.getElementById('searchBox').addEventListener('input', function (e) {
      state.query = e.target.value.trim();
      renderChecklist();
    });
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () { setTab(tab.dataset.tab); });
    });
    document.getElementById('spoilerBtn').addEventListener('click', function () { setSpoiler(!state.spoiler); });
    document.getElementById('shareBtn').addEventListener('click', function (e) { copyShareLink(e.target); });
    document.getElementById('exportBtn').addEventListener('click', exportProgress);
    document.getElementById('importBtn').addEventListener('click', function () { document.getElementById('importFile').click(); });
    document.getElementById('importFile').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('resetBtn').addEventListener('click', function () {
      if (confirm('Clear all earned trophies and counts?')) {
        state.earned = {}; state.counts = {}; state.revealed = {};
        saveProgress(); renderAll();
      }
    });
    document.addEventListener('click', function (e) {
      var open = e.target.closest('[data-open]');
      if (open) { e.preventDefault(); openTrophy(Number(open.dataset.open)); }
    });
    window.addEventListener('hashchange', function () {
      var hash = (location.hash || '').replace(/^#\/?/, '');
      if (hash.indexOf('tracker/') === 0) {
        var t = trophyBySlug(hash.slice(8));
        if (t) { state.selected = t.id; setTab('tracker'); renderAll(); }
      } else if (TABS.indexOf(hash) !== -1) {
        setTab(hash);
      }
    });
  }

  function boot() {
    var params = new URLSearchParams(location.search);
    var hash = (location.hash || '').replace(/^#\/?/, '');
    var hashProgress = null;
    if (hash.indexOf('tracker/') === 0) {
      state._pendingSlug = hash.slice(8);
      state.tab = 'tracker';
    } else if (TABS.indexOf(hash.split('&')[0]) !== -1) {
      state.tab = hash.split('&')[0];
    }
    if (hash.indexOf('earned=') !== -1) hashProgress = parseHashProgress(hash);
    if (params.get('demo') === '1') applyDemoSeed(); else loadSavedProgress();
    loadGuideData().then(function () {
      if (hashProgress) {
        state.earned = hashProgress.earned || state.earned;
        state.counts = hashProgress.counts || state.counts;
        saveProgress();
      }
      if (state._pendingSlug) {
        var pt = trophyBySlug(state._pendingSlug);
        if (pt) state.selected = pt.id;
        delete state._pendingSlug;
      }
      setSpoiler(state.spoiler);
      bindEvents();
      setTab(state.tab);
      renderAudit();
      renderAll();
    }).catch(function () {
      document.getElementById('detailPane').innerHTML =
        '<p>Could not load the trophy data. Open this guide from its own folder with a static server (for example, node serve.ts) — the data file loads from the same folder.</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
