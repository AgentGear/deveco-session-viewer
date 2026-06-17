import http from "node:http"
import os from "node:os"
import type { PluginModule } from "./types.js"

const DEFAULT_PORT = 9876

function getLocalIP(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address
      }
    }
  }
  return "127.0.0.1"
}

function getWebUI(port: number): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevEco Code Session Viewer</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
:root{
--bg-primary:#0f1117;
--bg-secondary:#161b22;
--bg-tertiary:#21262d;
--bg-hover:#30363d;
--bg-input:#0d1117;
--bg-hover-card:#1c2333;
--bg-success:#1f3a2a;
--bg-error:#1c1007;
--bg-danger:#3d1214;
--text-primary:#c9d1d9;
--text-heading:#e6edf3;
--text-secondary:#7d8590;
--text-muted:#484f58;
--border-primary:#30363d;
--border-secondary:#21262d;
--accent-blue:#58a6ff;
--accent-blue-dark:#388bfd;
--accent-green:#3fb950;
--accent-yellow:#d29922;
--accent-red:#f85149;
--accent-red-dark:#da3633;
--accent-purple:#d2a8ff;
--accent-favorite:#f0b429;
--shadow-sm:0 2px 8px rgba(0,0,0,.2);
--shadow-md:0 4px 12px rgba(0,0,0,.3);
--shadow-lg:0 8px 32px rgba(0,0,0,.5);
--shadow-dropdown:0 4px 12px rgba(0,0,0,.4);
}
.light-theme{
--bg-primary:#ffffff;
--bg-secondary:#f6f8fa;
--bg-tertiary:#eaeef2;
--bg-hover:#d0d7de;
--bg-input:#ffffff;
--bg-hover-card:#f0f3f6;
--bg-success:#dafbe1;
--bg-error:#fff8c5;
--bg-danger:#ffebe9;
--text-primary:#1f2328;
--text-heading:#1f2328;
--text-secondary:#656d76;
--text-muted:#8b949e;
--border-primary:#d0d7de;
--border-secondary:#eaeef2;
--accent-blue:#0969da;
--accent-blue-dark:#0550ae;
--accent-green:#1a7f37;
--accent-yellow:#9a6700;
--accent-red:#cf222e;
--accent-red-dark:#a40e26;
--accent-purple:#8250df;
--accent-favorite:#bf8700;
--shadow-sm:0 2px 8px rgba(0,0,0,.08);
--shadow-md:0 4px 12px rgba(0,0,0,.1);
--shadow-lg:0 8px 32px rgba(0,0,0,.12);
--shadow-dropdown:0 4px 12px rgba(0,0,0,.1);
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg-primary);color:var(--text-primary);transition:background .2s,color .2s}
.container{max-width:1200px;margin:0 auto;padding:24px}
h1{color:var(--accent-blue);margin-bottom:24px;font-size:24px;display:flex;align-items:center;gap:10px}
.theme-toggle{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary);width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;margin-left:auto}
.theme-toggle:hover{background:var(--bg-hover);color:var(--text-primary)}
.session-list{display:flex;flex-direction:column;gap:10px}
.session-card{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:10px;padding:16px 20px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.session-card:hover{border-color:var(--accent-blue);background:var(--bg-hover-card);transform:translateY(-1px);box-shadow:var(--shadow-md)}
.session-card:active{transform:translateY(0)}
.session-card.selected{border-color:var(--accent-blue);background:var(--bg-hover-card);box-shadow:0 0 0 2px rgba(88,166,255,.3)}
.session-title{font-size:15px;font-weight:600;color:var(--text-heading);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.session-meta{display:flex;gap:8px;font-size:12px;color:var(--text-secondary);flex-wrap:wrap;align-items:center}
.badge{background:var(--bg-tertiary);padding:3px 10px;border-radius:10px;font-size:11px;color:var(--text-secondary);display:inline-flex;align-items:center;gap:4px}
.session-time{color:var(--accent-blue);font-weight:500}
.detail-view{display:none}
.detail-view.active{display:block}
.list-view.hidden{display:none}
.sticky-header{position:sticky;top:0;z-index:10;background:var(--bg-primary)}
.sticky-toolbar{padding:12px 0;display:flex;align-items:center;gap:10px}
.detail-title{font-size:18px;color:var(--text-heading);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.detail-meta{display:flex;gap:16px;font-size:12px;color:var(--text-secondary);flex-wrap:wrap;padding:8px 0 12px;border-bottom:1px solid var(--border-secondary);margin-bottom:20px}
.back-btn{background:linear-gradient(135deg,var(--accent-blue) 0%,var(--accent-blue-dark) 100%);border:none;color:#fff;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;transition:all .2s;box-shadow:var(--shadow-sm)}
.back-btn:hover{transform:translateY(-1px);box-shadow:var(--shadow-md)}
.back-btn:active{transform:translateY(0)}
.message-list{display:flex;flex-direction:column;gap:12px}
.message{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:6px;padding:14px 16px}
.message.user{border-left:3px solid var(--accent-blue)}
.message.assistant{border-left:3px solid var(--accent-green)}
.message-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:12px;color:var(--text-secondary)}
.copy-btn{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary);padding:3px 10px;border-radius:4px;cursor:pointer;font-size:11px;transition:all .15s;opacity:0}
.message:hover .copy-btn{opacity:1}
.copy-btn:hover{background:var(--bg-hover);color:var(--text-primary)}
.copy-btn.copied{background:var(--bg-success);border-color:var(--accent-green);color:var(--accent-green);opacity:1}
.message-role{font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.message.user .message-role{color:var(--accent-blue)}
.message.assistant .message-role{color:var(--accent-green)}
.message-content{font-size:14px;line-height:1.7;word-wrap:break-word}
.message-content p{margin-bottom:8px}
.message-content p:last-child{margin-bottom:0}
.message-content code{background:var(--bg-tertiary);padding:2px 6px;border-radius:3px;font-family:"Cascadia Code","Fira Code",monospace;font-size:12px}
.message-content pre{background:var(--bg-input);border:1px solid var(--border-secondary);padding:12px;border-radius:6px;overflow-x:auto;margin:8px 0}
.message-content pre code{background:none;padding:0;font-size:12px;line-height:1.5}
.message-content strong{color:var(--text-heading)}
.message-content em{color:var(--accent-purple)}
.message-content h2,.message-content h3,.message-content h4{color:var(--text-heading);margin:12px 0 6px}
.message-content ul,.message-content ol{padding-left:20px;margin:6px 0}
.tool-call{background:var(--bg-input);border:1px solid var(--border-primary);border-radius:6px;padding:10px 12px;margin:8px 0;font-size:13px}
.tool-name{color:var(--accent-yellow);font-weight:600;margin-bottom:4px}
.tool-status{font-size:11px;color:var(--text-secondary)}
.tool-output{margin-top:6px;padding-top:6px;border-top:1px solid var(--border-secondary);font-family:monospace;font-size:11px;color:var(--text-secondary);max-height:120px;overflow:hidden}
.reasoning{color:var(--text-secondary);font-style:italic;padding:6px 12px;border-left:2px solid var(--border-primary);margin:6px 0;font-size:13px}
.step-divider{text-align:center;color:var(--text-muted);font-size:11px;margin:8px 0;position:relative}
.step-divider::before,.step-divider::after{content:"";position:absolute;top:50%;width:30%;height:1px;background:var(--border-secondary)}
.step-divider::before{left:0}
.step-divider::after{right:0}
.toolbar{display:flex;gap:10px;align-items:center}
.toggle-btn{display:flex;align-items:center;gap:6px;background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary);padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;transition:all .15s;user-select:none}
.toggle-btn:hover{background:var(--bg-hover);color:var(--text-primary)}
.toggle-btn.active{background:var(--bg-success);border-color:var(--accent-green);color:var(--accent-green)}
.toggle-btn .dot{width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.5}
.toggle-btn.active .dot{opacity:1}
.message-list.clean-mode .part-reasoning,
.message-list.clean-mode .part-tool,
.message-list.clean-mode .part-step,
.message-list.clean-mode .part-agent,
.message-list.clean-mode .part-retry,
.message-list.clean-mode .part-file{display:none}
.message-list.clean-mode .message.assistant.intermediate{display:none}
.loading{text-align:center;padding:40px;color:var(--text-muted)}
.empty{text-align:center;padding:60px;color:var(--text-muted);font-size:14px}
.error{background:var(--bg-error);border:1px solid var(--accent-yellow);border-radius:6px;padding:14px;color:var(--accent-yellow);font-size:13px}
.status-bar{font-size:11px;color:var(--text-muted);margin-bottom:16px;padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border-secondary);border-radius:6px}
.export-wrap{position:relative}
.export-btn{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--accent-purple);padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;transition:all .15s}
.export-btn:hover{background:var(--bg-hover);color:var(--text-heading)}
.export-menu{display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:6px;overflow:hidden;z-index:20;min-width:120px;box-shadow:var(--shadow-dropdown)}
.export-menu.show{display:block}
.export-menu button{display:block;width:100%;padding:8px 16px;background:none;border:none;color:var(--text-primary);font-size:13px;text-align:left;cursor:pointer;transition:background .15s}
.export-menu button:hover{background:var(--bg-tertiary);color:var(--text-heading)}
.find-bar{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-secondary);margin-bottom:12px}
.find-input{flex:1;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border-primary);border-radius:6px;color:var(--text-primary);font-size:13px;outline:none;min-width:0;transition:border-color .2s}
.find-input:focus{border-color:var(--accent-blue)}
.find-input::placeholder{color:var(--text-muted)}
.find-count{font-size:12px;color:var(--text-secondary);white-space:nowrap;min-width:60px;text-align:center}
.find-btn{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-primary);padding:4px 10px;border-radius:4px;cursor:pointer;font-size:13px;line-height:1;transition:background .15s}
.find-btn:hover{background:var(--bg-hover);color:var(--text-heading)}
mark.find-hl{background:#e3b341;color:var(--bg-input);border-radius:2px;padding:0 1px}
mark.find-hl.current{background:var(--accent-blue);color:#fff}
.tab-bar{display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--border-secondary)}
.tab{padding:10px 24px;background:none;border:none;color:var(--text-secondary);font-size:14px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s}
.tab:hover{color:var(--text-primary)}
.tab.active{color:var(--accent-blue);border-bottom-color:var(--accent-blue)}
.stats-view{display:none}
.stats-view.active{display:block}
.time-selector{display:flex;gap:8px;margin-bottom:20px}
.time-btn{padding:6px 16px;background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary);border-radius:6px;cursor:pointer;font-size:13px;transition:all .15s}
.time-btn:hover{background:var(--bg-hover);color:var(--text-primary)}
.time-btn.active{background:var(--bg-success);border-color:var(--accent-green);color:var(--accent-green)}
.summary-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.card{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:10px;padding:16px 20px}
.card-label{font-size:12px;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.card-value{font-size:22px;font-weight:700;color:var(--text-heading)}
.card-value.cost{color:var(--accent-blue)}
.card-value.tokens{color:var(--accent-purple)}
.card-value.sessions{color:var(--accent-green)}
.card-value.avg{color:var(--accent-yellow)}
.charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chart-card{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:10px;padding:20px}
.chart-card h3{font-size:14px;color:var(--text-heading);margin-bottom:16px;font-weight:500}
.chart-card.full{grid-column:1/-1}
.session-card-actions{position:absolute;right:12px;top:12px;display:flex;gap:4px;opacity:0;transition:opacity .15s}
.session-card:hover .session-card-actions{opacity:1}
.card-action-btn{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary);width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s}
.card-action-btn:hover{background:var(--bg-hover);color:var(--text-heading)}
.favorite-btn{background:var(--bg-tertiary);border:1px solid var(--border-primary);width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s;color:var(--text-secondary)}
.favorite-btn:hover{background:var(--bg-hover);color:var(--accent-favorite)}
.favorite-btn.active{color:var(--accent-favorite)}
.modal-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:100;align-items:center;justify-content:center}
.modal-overlay.active{display:flex}
.modal{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:12px;padding:24px;width:420px;max-width:90vw;box-shadow:var(--shadow-lg)}
.modal h3{font-size:16px;color:var(--text-heading);margin-bottom:16px}
.modal-input{width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-primary);border-radius:6px;color:var(--text-primary);font-size:14px;outline:none;margin-bottom:16px}
.modal-input:focus{border-color:var(--accent-blue)}
.modal-actions{display:flex;justify-content:flex-end;gap:8px}
.modal-btn{padding:8px 18px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;transition:all .15s}
.modal-btn.cancel{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary)}
.modal-btn.cancel:hover{background:var(--bg-hover);color:var(--text-primary)}
.modal-btn.confirm{background:var(--accent-blue);border:none;color:#fff}
.modal-btn.confirm:hover{background:var(--accent-blue-dark)}
.modal-btn.danger{background:var(--accent-red);border:none;color:#fff}
.modal-btn.danger:hover{background:var(--accent-red-dark)}
.card-action-btn.danger:hover{background:var(--bg-danger);border-color:var(--accent-red);color:var(--accent-red)}
.refresh-btn{background:var(--bg-tertiary);border:2px solid var(--border-primary);color:var(--text-secondary);width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.refresh-btn:hover{background:var(--bg-hover);border-color:var(--accent-blue);color:var(--accent-blue)}
.refresh-btn:active{transform:scale(0.95)}
.refresh-btn.spinning{animation:spin 0.8s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.search-sort-row{display:flex;gap:12px;margin-bottom:16px;align-items:center}
.search-wrap{flex:1;position:relative}
.search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:18px}
.search-box{width:100%;padding:10px 16px 10px 44px;background:var(--bg-secondary);border:2px solid var(--border-primary);border-radius:10px;color:var(--text-primary);font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s}
.search-box:focus{border-color:var(--accent-blue);box-shadow:0 0 0 3px rgba(88,166,255,.15)}
.search-box::placeholder{color:var(--text-muted);font-size:15px}
.sort-wrap{position:relative;flex-shrink:0}
.sort-trigger{display:flex;align-items:center;gap:6px;padding:10px 14px;background:var(--bg-tertiary);border:2px solid var(--border-primary);border-radius:10px;color:var(--text-primary);font-size:13px;cursor:pointer;transition:all .15s;white-space:nowrap}
.sort-trigger:hover{background:var(--bg-hover);border-color:var(--accent-blue)}
.sort-trigger .sort-icon{color:var(--text-secondary);font-size:12px}
.sort-trigger .sort-arrow{font-size:10px;color:var(--text-secondary);margin-left:2px}
.sort-dropdown{display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:6px;overflow:hidden;z-index:20;min-width:160px;box-shadow:var(--shadow-dropdown)}
.sort-dropdown.show{display:block}
.sort-dropdown button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 14px;background:none;border:none;color:var(--text-primary);font-size:13px;text-align:left;cursor:pointer;transition:background .15s}
.sort-dropdown button:hover{background:var(--bg-tertiary)}
.sort-dropdown button.active{color:var(--accent-blue);background:var(--bg-success)}
.sort-dropdown button .arrow{font-size:10px;color:var(--text-secondary)}
.sort-dropdown button.active .arrow{color:var(--accent-blue)}
.model-wrap{position:relative;flex-shrink:0}
.model-trigger{display:flex;align-items:center;gap:6px;padding:10px 14px;background:var(--bg-tertiary);border:2px solid var(--border-primary);border-radius:10px;color:var(--text-primary);font-size:13px;cursor:pointer;transition:all .15s;white-space:nowrap;max-width:200px}
.model-trigger:hover{background:var(--bg-hover);border-color:var(--accent-blue)}
.model-trigger .model-icon{color:var(--text-secondary);font-size:12px}
.model-trigger .model-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.model-dropdown{display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:6px;overflow:hidden;z-index:20;min-width:240px;max-height:360px;overflow-y:auto;box-shadow:var(--shadow-dropdown)}
.model-dropdown.show{display:block}
.model-dropdown-header{display:flex;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border-secondary)}
.model-dropdown-header button{padding:4px 10px;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:4px;color:var(--text-secondary);font-size:11px;cursor:pointer;transition:all .15s}
.model-dropdown-header button:hover{background:var(--bg-hover);color:var(--text-primary)}
.model-dropdown label{display:flex;align-items:center;gap:10px;width:100%;padding:8px 14px;background:none;border:none;color:var(--text-primary);font-size:13px;text-align:left;cursor:pointer;transition:background .15s}
.model-dropdown label:hover{background:var(--bg-tertiary)}
.model-dropdown label input[type="checkbox"]{accent-color:var(--accent-blue);width:16px;height:16px;cursor:pointer;flex-shrink:0}
.model-dropdown label .model-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.model-dropdown label .count{font-size:11px;color:var(--text-secondary);flex-shrink:0}
.filter-bar{display:flex;gap:8px;margin-bottom:16px}
.filter-btn{padding:6px 12px;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:6px;color:var(--text-secondary);font-size:13px;cursor:pointer;transition:all .15s}
.filter-btn:hover{background:var(--bg-hover);color:var(--text-primary)}
.filter-btn.active{background:var(--bg-success);border-color:var(--accent-green);color:var(--accent-green)}
.time-group-header{font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;padding:12px 0 8px;margin-top:16px;border-bottom:1px solid var(--border-secondary)}
.time-group-header:first-child{margin-top:0}
</style>
</head>
<body>
<div class="container">
  <h1>DevEco Code Session Viewer<button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme"><span id="themeIcon">☀️</span></button></h1>
  <div class="status-bar" id="statusBar">Connecting...</div>
  <div class="list-view" id="listView">
    <div class="tab-bar">
      <button class="tab active" data-tab="sessions" onclick="switchTab('sessions')">Sessions</button>
      <button class="tab" data-tab="stats" onclick="switchTab('stats')">Statistics</button>
    </div>
    <div id="sessionsTab">
      <div class="search-sort-row">
        <div class="search-wrap">
          <span class="search-icon">&#128269;</span>
          <input type="text" class="search-box" id="searchBox" placeholder="Search sessions by keyword..." />
        </div>
        <div class="sort-wrap">
          <button class="sort-trigger" onclick="toggleSortDropdown(event)">
            <span class="sort-icon">&#8597;</span>
            <span id="sortLabel">Time</span>
            <span class="sort-arrow" id="sortArrow">↓</span>
          </button>
          <div class="sort-dropdown" id="sortDropdown">
            <button class="active" data-sort="time" onclick="setSort('time')">Time <span class="arrow">↓</span></button>
            <button data-sort="cost" onclick="setSort('cost')">Cost <span class="arrow">↓</span></button>
            <button data-sort="tokens" onclick="setSort('tokens')">Tokens <span class="arrow">↓</span></button>
          </div>
        </div>
        <div class="model-wrap">
          <button class="model-trigger" onclick="toggleModelDropdown(event)">
            <span class="model-icon">&#9881;</span>
            <span class="model-label" id="modelLabel">All Models</span>
          </button>
          <div class="model-dropdown" id="modelDropdown"></div>
        </div>
        <button class="refresh-btn" onclick="refreshSessionList()" title="Refresh sessions">&#8635;</button>
      </div>
      <div class="filter-bar">
        <button class="filter-btn active" data-filter="all" onclick="setFilter('all')">All</button>
        <button class="filter-btn" data-filter="favorites" onclick="setFilter('favorites')">★ Favorites</button>
      </div>
      <div class="session-list" id="sessionList"><div class="loading">Loading...</div></div>
    </div>
    <div class="stats-view" id="statsView">
      <div class="time-selector">
        <button class="time-btn" data-range="1" onclick="setTimeRange(1)">Today</button>
        <button class="time-btn active" data-range="7" onclick="setTimeRange(7)">7 Days</button>
        <button class="time-btn" data-range="30" onclick="setTimeRange(30)">30 Days</button>
        <button class="time-btn" data-range="0" onclick="setTimeRange(0)">All</button>
      </div>
      <div class="summary-cards">
        <div class="card"><div class="card-label">Total Cost</div><div class="card-value cost" id="totalCost">$0.00</div></div>
        <div class="card"><div class="card-label">Total Tokens</div><div class="card-value tokens" id="totalTokens">0</div></div>
        <div class="card"><div class="card-label">Sessions</div><div class="card-value sessions" id="sessionCount">0</div></div>
        <div class="card"><div class="card-label">Avg Cost/Session</div><div class="card-value avg" id="avgCost">$0.00</div></div>
      </div>
      <div class="charts-grid">
        <div class="chart-card full"><h3>Daily Cost Trend</h3><canvas id="costTrendChart"></canvas></div>
        <div class="chart-card"><h3>Cost by Model</h3><canvas id="modelCostChart"></canvas></div>
        <div class="chart-card"><h3>Daily Sessions</h3><canvas id="sessionCountChart"></canvas></div>
      </div>
    </div>
  </div>
  <div class="detail-view" id="detailView">
    <div class="sticky-header">
      <div class="sticky-toolbar">
        <div class="detail-title" id="detailTitle"></div>
        <div style="flex:1"></div>
        <button class="refresh-btn" onclick="refreshSessionDetail()" title="Refresh messages" style="width:36px;height:36px;font-size:16px">&#8635;</button>
        <div class="export-wrap">
          <button class="export-btn" onclick="toggleExportMenu(event)">Export ▾</button>
          <div class="export-menu" id="exportMenu">
            <button onclick="exportSession('md')">Markdown</button>
            <button onclick="exportSession('json')">JSON</button>
          </div>
        </div>
        <button class="toggle-btn" id="cleanToggle" onclick="toggleClean()"><span class="dot"></span>Clean Mode</button>
        <button class="back-btn" onclick="showList()">&#8592; Back</button>
      </div>
      <div class="find-bar" id="findBar">
        <input type="text" class="find-input" id="findInput" placeholder="Search in conversation... (Enter: next, Shift+Enter: prev)" />
        <span class="find-count" id="findCount"></span>
        <button class="find-btn" onclick="findPrev()" title="Previous (Shift+Enter)">&#9650;</button>
        <button class="find-btn" onclick="findNext()" title="Next (Enter)">&#9660;</button>
      </div>
      <div class="detail-meta" id="detailMeta"></div>
    </div>
    <div class="message-list" id="messageList"></div>
  </div>
</div>
<div class="modal-overlay" id="renameModal">
  <div class="modal">
    <h3>Rename Session</h3>
    <input type="text" class="modal-input" id="renameInput" placeholder="Enter new title..." />
    <div class="modal-actions">
      <button class="modal-btn cancel" onclick="closeRename()">Cancel</button>
      <button class="modal-btn confirm" onclick="submitRename()">Rename</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="deleteModal">
  <div class="modal">
    <h3>Delete Session</h3>
    <p style="color:#7d8590;font-size:14px;margin-bottom:16px">Are you sure you want to delete "<span id="deleteTitle" style="color:#e6edf3"></span>"? This action cannot be undone.</p>
    <div class="modal-actions">
      <button class="modal-btn cancel" onclick="closeDelete()">Cancel</button>
      <button class="modal-btn danger" onclick="submitDelete()">Delete</button>
    </div>
  </div>
</div>
<script>
const API="/api";
let debounceTimer;
let cleanMode=false;
let currentMessages=null;
let currentSession=null;
let sortField="time";
let sortDirection="desc";
let currentFilter="all";
let currentModelFilter=[];
let availableModels=[];
let allSessions=[];
let allMessages=[];
let selectedSessionIndex=-1;

function initTheme(){
  const saved=localStorage.getItem("deveco-session-viewer-theme");
  if(saved==="light"){
    document.body.classList.add("light-theme");
    document.getElementById("themeIcon").textContent="🌙";
  }
}

function toggleTheme(){
  const isLight=document.body.classList.toggle("light-theme");
  localStorage.setItem("deveco-session-viewer-theme",isLight?"light":"dark");
  document.getElementById("themeIcon").textContent=isLight?"🌙":"☀️";
  if(typeof renderStats==="function"&&document.getElementById("statsView").classList.contains("active")){
    renderStats();
  }
}

initTheme();

function getFavorites(){
  try{
    const data=localStorage.getItem("deveco-session-viewer-favorites");
    return data?JSON.parse(data):[];
  }catch(e){return[]}
}

function saveFavorites(favorites){
  try{
    localStorage.setItem("deveco-session-viewer-favorites",JSON.stringify(favorites));
  }catch(e){console.error("Failed to save favorites:",e)}
}

function isFavorite(sessionId){
  return getFavorites().includes(sessionId);
}

function toggleFavorite(sessionId){
  const favorites=getFavorites();
  const index=favorites.indexOf(sessionId);
  if(index===-1){
    favorites.push(sessionId);
  }else{
    favorites.splice(index,1);
  }
  saveFavorites(favorites);
  loadSessions().catch(e=>console.error(e));
}

function setFilter(filter){
  currentFilter=filter;
  document.querySelectorAll(".filter-btn").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.filter===filter);
  });
  loadSessions().catch(e=>console.error(e));
}

function toggleModelDropdown(e){
  e.stopPropagation();
  document.getElementById("modelDropdown").classList.toggle("show");
  document.getElementById("sortDropdown").classList.remove("show");
}

function toggleModelCheckbox(model){
  const idx=currentModelFilter.indexOf(model);
  if(idx===-1){
    currentModelFilter.push(model);
  }else{
    currentModelFilter.splice(idx,1);
  }
  updateModelDropdownUI();
  loadSessions().catch(e=>console.error(e));
}

function selectAllModels(){
  currentModelFilter=availableModels.slice();
  updateModelDropdownUI();
  loadSessions().catch(e=>console.error(e));
}

function clearAllModels(){
  currentModelFilter=[];
  updateModelDropdownUI();
  loadSessions().catch(e=>console.error(e));
}

function updateModelDropdownUI(){
  const label=document.getElementById("modelLabel");
  if(currentModelFilter.length===0){
    label.textContent="All Models";
  }else if(currentModelFilter.length===1){
    label.textContent=currentModelFilter[0];
  }else{
    label.textContent=currentModelFilter.length+" Models";
  }
  document.querySelectorAll(".model-dropdown input[type='checkbox']").forEach(cb=>{
    cb.checked=currentModelFilter.includes(cb.value);
  });
}

function updateModelDropdown(sessions){
  const modelMap={};
  sessions.forEach(s=>{
    const model=(s.model&&s.model.id)?s.model.id:"unknown";
    modelMap[model]=(modelMap[model]||0)+1;
  });
  availableModels=Object.keys(modelMap).sort();
  const dropdown=document.getElementById("modelDropdown");
  const wasOpen=dropdown.classList.contains("show");
  
  let html='<div class="model-dropdown-header"><button onclick="selectAllModels()">Select All</button><button onclick="clearAllModels()">Clear All</button></div>';
  availableModels.forEach(model=>{
    const checked=currentModelFilter.includes(model)?"checked":"";
    const safeModel=model.replace(/"/g,"&quot;").replace(/'/g,"\\\\'");
    html+='<label><input type="checkbox" value="'+esc(model)+'" '+checked+' onchange="toggleModelCheckbox(\\''+safeModel+'\\')"><span class="model-name">'+esc(model)+'</span><span class="count">'+modelMap[model]+'</span></label>';
  });
  dropdown.innerHTML=html;
  
  if(wasOpen){
    dropdown.classList.add("show");
  }
}

async function api(path){const r=await fetch(API+path);if(!r.ok)throw new Error(r.statusText);return r.json()}

function fmtTime(ts){const d=new Date(ts),n=Date.now(),s=n-d,m=Math.floor(s/6e4),h=Math.floor(s/36e5),dy=Math.floor(s/864e5);if(m<1)return"just now";if(m<60)return m+"m ago";if(h<24)return h+"h ago";if(dy<7)return dy+"d ago";return d.toLocaleDateString()}
function getTimeGroup(ts){const d=new Date(ts),now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());const yesterday=new Date(today);yesterday.setDate(yesterday.getDate()-1);const weekAgo=new Date(today);weekAgo.setDate(weekAgo.getDate()-7);const monthAgo=new Date(today);monthAgo.setDate(monthAgo.getDate()-30);if(d>=today)return"Today";if(d>=yesterday)return"Yesterday";if(d>=weekAgo)return"This Week";if(d>=monthAgo)return"This Month";return"Older"}
function fmtTok(t){if(!t)return"";const n=(t.input||0)+(t.output||0);return n<1e3?n+" tok":n<1e6?(n/1e3).toFixed(1)+"k tok":(n/1e6).toFixed(1)+"M tok"}
function fmtCost(c){return c?"$"+c.toFixed(4):""}
function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}

function md(text){
  let h=esc(text);
  h=h.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g,(_,l,c)=>'<pre><code>'+c.trim()+'</code></pre>');
  h=h.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g,(_,c)=>'<pre><code>'+c.trim()+'</code></pre>');
  h=h.replace(/\`([^\`\\n]+)\`/g,'<code>$1</code>');
  h=h.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>');
  h=h.replace(/\\*(.+?)\\*/g,'<em>$1</em>');
  h=h.replace(/^### (.+)$/gm,'<h4>$1</h4>');
  h=h.replace(/^## (.+)$/gm,'<h3>$1</h3>');
  h=h.replace(/^# (.+)$/gm,'<h2>$1</h2>');
  h=h.replace(/^\\s*[-*+] (.+)$/gm,'<li>$1</li>');
  h=h.replace(/\\n\\n/g,'</p><p>');
  h=h.replace(/\\n/g,'<br>');
  return '<p>'+h+'</p>';
}

function renderPart(p){
  if(p.type==="text")return '<div class="part-text message-content">'+md(p.text||"")+'</div>';
  if(p.type==="reasoning")return '<div class="part-reasoning reasoning">[Thinking] '+esc((p.text||"").slice(0,300))+'</div>';
  if(p.type==="tool"){
    const st=p.state||{};
    const out=st.status==="completed"?st.output:st.status==="error"?st.error:"";
    return '<div class="part-tool tool-call"><div class="tool-name">'+esc(p.tool||"tool")+'</div><div class="tool-status">'+esc(st.status||"")+'</div>'+(out?'<div class="tool-output">'+esc(String(out).slice(0,500))+'</div>':'')+'</div>';
  }
  if(p.type==="file")return '<div class="part-file tool-call"><div class="tool-name">File: '+esc(p.filename||p.url||"file")+'</div></div>';
  if(p.type==="step-start")return '<div class="part-step step-divider">step</div>';
  if(p.type==="agent")return '<div class="part-agent step-divider">agent: '+esc(p.name||"")+'</div>';
  if(p.type==="retry")return '<div class="part-retry reasoning">Retry #'+esc(String(p.attempt||""))+'</div>';
  return "";
}

async function loadSessions(){
  const q=document.getElementById("searchBox").value.trim();
  const params=new URLSearchParams();
  if(q)params.set("search",q);
  params.set("limit","1000");
  const sessions=await api("/sessions?"+params.toString());
  allSessions=sessions;
  renderSessions(allSessions);
}

async function refreshSessionList(){
  const btn=event?.currentTarget;
  if(btn)btn.classList.add("spinning");
  try{
    await loadSessions();
  }catch(e){
    console.error("Failed to refresh sessions:",e);
  }finally{
    if(btn)btn.classList.remove("spinning");
  }
}

async function refreshSessionDetail(){
  if(!currentSession)return;
  const btn=event?.currentTarget;
  if(btn)btn.classList.add("spinning");
  try{
    const msgs=await api("/sessions/"+currentSession.id+"/messages?limit=1000");
    currentMessages=msgs;
    allMessages=msgs;
    renderDetail(currentSession,msgs);
  }catch(e){
    console.error("Failed to refresh messages:",e);
  }finally{
    if(btn)btn.classList.remove("spinning");
  }
}

function renderSessions(list){
  const c=document.getElementById("sessionList");
  selectedSessionIndex=-1;
  if(!list||!list.length){c.innerHTML='<div class="empty">No sessions found</div>';updateModelDropdown([]);return}
  
  updateModelDropdown(list);
  
  let filtered=list;
  if(currentFilter==="favorites"){
    const favorites=getFavorites();
    filtered=list.filter(s=>favorites.includes(s.id));
  }
  if(currentModelFilter.length>0){
    filtered=filtered.filter(s=>{
      const model=(s.model&&s.model.id)?s.model.id:"unknown";
      return currentModelFilter.includes(model);
    });
  }
  
  const sorted=[...filtered].sort((a,b)=>{
    const aFav=isFavorite(a.id)?1:0;
    const bFav=isFavorite(b.id)?1:0;
    if(aFav!==bFav)return bFav-aFav;
    
    let va,vb;
    if(sortField==="time"){
      va=a.time.updated||a.time.created;
      vb=b.time.updated||b.time.created;
    }else if(sortField==="cost"){
      va=a.cost||0;
      vb=b.cost||0;
    }else if(sortField==="tokens"){
      const ta=a.tokens||{};
      const tb=b.tokens||{};
      va=(ta.input||0)+(ta.output||0)+(ta.reasoning||0);
      vb=(tb.input||0)+(tb.output||0)+(tb.reasoning||0);
    }
    return sortDirection==="desc"?vb-va:va-vb;
  });
  
  if(sortField==="time"){
    const groups={};
    const groupOrder=["Today","Yesterday","This Week","This Month","Older"];
    sorted.forEach(s=>{
      const ts=s.time.updated||s.time.created;
      const group=getTimeGroup(ts);
      if(!groups[group])groups[group]=[];
      groups[group].push(s);
    });
    let html="";
    groupOrder.forEach(groupName=>{
      const items=groups[groupName];
      if(!items||!items.length)return;
      html+='<div class="time-group-header">'+groupName+'</div>';
      html+=items.map(s=>{
        const favClass=isFavorite(s.id)?"active":"";
        const favIcon=isFavorite(s.id)?"★":"☆";
        return '<div class="session-card" onclick="showDetail(\\''+s.id+'\\')"><div class="session-card-actions"><button class="favorite-btn '+favClass+'" onclick="event.stopPropagation();toggleFavorite(\\''+s.id+'\\')">'+favIcon+'</button><button class="card-action-btn" onclick="event.stopPropagation();openRename(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Rename">&#9998;</button><button class="card-action-btn danger" onclick="event.stopPropagation();openDelete(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Delete">&#128465;</button></div><div class="session-title">'+esc(s.title||"Untitled")+'</div><div class="session-meta"><span class="session-time">'+fmtTime(s.time.updated)+'</span>'+(s.tokens?'<span class="badge">'+fmtTok(s.tokens)+'</span>':'')+(s.cost?'<span class="badge">'+fmtCost(s.cost)+'</span>':'')+(s.model&&s.model.id?'<span class="badge">'+esc(s.model.id)+'</span>':'')+'</div></div>';
      }).join("");
    });
    c.innerHTML=html;
  }else{
    c.innerHTML=sorted.map(s=>{
      const favClass=isFavorite(s.id)?"active":"";
      const favIcon=isFavorite(s.id)?"★":"☆";
      return '<div class="session-card" onclick="showDetail(\\''+s.id+'\\')"><div class="session-card-actions"><button class="favorite-btn '+favClass+'" onclick="event.stopPropagation();toggleFavorite(\\''+s.id+'\\')">'+favIcon+'</button><button class="card-action-btn" onclick="event.stopPropagation();openRename(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Rename">&#9998;</button><button class="card-action-btn danger" onclick="event.stopPropagation();openDelete(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Delete">&#128465;</button></div><div class="session-title">'+esc(s.title||"Untitled")+'</div><div class="session-meta"><span class="session-time">'+fmtTime(s.time.updated)+'</span>'+(s.tokens?'<span class="badge">'+fmtTok(s.tokens)+'</span>':'')+(s.cost?'<span class="badge">'+fmtCost(s.cost)+'</span>':'')+(s.model&&s.model.id?'<span class="badge">'+esc(s.model.id)+'</span>':'')+'</div></div>';
    }).join("");
  }
}

function toggleSortDropdown(e){
  e.stopPropagation();
  document.getElementById("sortDropdown").classList.toggle("show");
  document.getElementById("modelDropdown").classList.remove("show");
}

function setSort(field){
  if(sortField===field){
    sortDirection=sortDirection==="desc"?"asc":"desc";
  }else{
    sortField=field;
    sortDirection="desc";
  }
  const labels={time:"Time",cost:"Cost",tokens:"Tokens"};
  document.getElementById("sortLabel").textContent=labels[sortField];
  document.getElementById("sortArrow").textContent=sortDirection==="desc"?"↓":"↑";
  document.querySelectorAll(".sort-dropdown button").forEach(btn=>{
    const isActive=btn.dataset.sort===sortField;
    btn.classList.toggle("active",isActive);
    const arrow=btn.querySelector(".arrow");
    if(arrow){
      arrow.textContent=isActive?(sortDirection==="desc"?"↓":"↑"):"↓";
    }
  });
  document.getElementById("sortDropdown").classList.remove("show");
  loadSessions().catch(e=>console.error(e));
}

function renderDetail(session,msgs){
  document.getElementById("detailTitle").textContent=session.title||"Untitled";
  document.getElementById("detailMeta").innerHTML='<span>Created: '+new Date(session.time.created).toLocaleString()+'</span>'+(session.time.updated?'<span>Updated: '+new Date(session.time.updated).toLocaleString()+'</span>':'')+(session.model&&session.model.id?'<span>Model: '+esc(session.model.id)+'</span>':'')+(session.tokens?'<span>'+fmtTok(session.tokens)+'</span>':'')+(session.cost?'<span>'+fmtCost(session.cost)+'</span>':'');
  const ml=document.getElementById("messageList");
  if(!msgs||!msgs.length){ml.innerHTML='<div class="empty">No messages</div>';return}
  const sorted=[...msgs].sort((a,b)=>a.info.time.created-b.info.time.created);
  const lastAssistantPerTurn=new Set();
  let runStart=-1;
  for(let i=0;i<=sorted.length;i++){
    if(i===sorted.length||sorted[i].info.role==="user"){
      if(runStart>=0)lastAssistantPerTurn.add(i-1);
      runStart=-1;
    }else{
      if(runStart<0)runStart=i;
    }
  }
  const html=sorted.map((m,i)=>{
    const u=m.info.role==="user";
    const t=new Date(m.info.time.created).toLocaleTimeString();
    const parts=(m.parts||[]).map(renderPart).join("");
    const cls="message "+(u?"user":"assistant")+(u?"":(lastAssistantPerTurn.has(i)?"":" intermediate"));
    return '<div class="'+cls+'" data-msg-idx="'+i+'"><div class="message-header"><span class="message-role">'+(u?"User":"Assistant")+'</span><div style="display:flex;align-items:center;gap:8px"><span>'+t+'</span><button class="copy-btn" onclick="copyMessage(this)">Copy</button></div></div>'+parts+'</div>';
  }).join("");
  ml.innerHTML=html;
  ml.classList.toggle("clean-mode",cleanMode);
  if(document.getElementById("findInput").value){
    doFind();
  }
}

function toggleClean(){
  cleanMode=!cleanMode;
  const btn=document.getElementById("cleanToggle");
  const ml=document.getElementById("messageList");
  btn.classList.toggle("active",cleanMode);
  ml.classList.toggle("clean-mode",cleanMode);
}

function toggleExportMenu(e){
  e.stopPropagation();
  document.getElementById("exportMenu").classList.toggle("show");
}
document.addEventListener("click",(e)=>{
  const m=document.getElementById("exportMenu");
  if(m)m.classList.remove("show");
  const s=document.getElementById("sortDropdown");
  if(s)s.classList.remove("show");
  
  const modelDropdown=document.getElementById("modelDropdown");
  const modelWrap=document.querySelector(".model-wrap");
  if(modelDropdown&&modelWrap&&!modelWrap.contains(e.target)){
    modelDropdown.classList.remove("show");
  }
});

function getExportMessages(){
  if(!currentMessages||!currentMessages.length)return[];
  const sorted=[...currentMessages].sort((a,b)=>a.info.time.created-b.info.time.created);
  if(!cleanMode)return sorted;
  const lastPerTurn=new Set();
  let runStart=-1;
  for(let i=0;i<=sorted.length;i++){
    if(i===sorted.length||sorted[i].info.role==="user"){
      if(runStart>=0)lastPerTurn.add(i-1);
      runStart=-1;
    }else{
      if(runStart<0)runStart=i;
    }
  }
  return sorted.filter((m,i)=>m.info.role==="user"||lastPerTurn.has(i));
}

function filterParts(parts){
  if(!cleanMode)return parts||[];
  return(parts||[]).filter(p=>p.type==="text"||p.type==="file");
}

function exportMarkdown(){
  if(!currentSession)return;
  const title=currentSession.title||"Untitled";
  const msgs=getExportMessages();
  let out="# "+title+"\\n\\n";
  out+="> Created: "+new Date(currentSession.time.created).toLocaleString()+"\\n";
  if(currentSession.model&&currentSession.model.id)out+="> Model: "+currentSession.model.id+"\\n";
  if(currentSession.tokens)out+="> Tokens: "+fmtTok(currentSession.tokens)+"\\n";
  if(currentSession.cost)out+="> Cost: "+fmtCost(currentSession.cost)+"\\n";
  out+="> Mode: "+(cleanMode?"Clean":"Full")+"\\n\\n---\\n\\n";
  msgs.forEach(m=>{
    const role=m.info.role==="user"?"User":"Assistant";
    const t=new Date(m.info.time.created).toLocaleTimeString();
    out+="## "+role+" ("+t+")\\n\\n";
    filterParts(m.parts).forEach(p=>{
      if(p.type==="text")out+=(p.text||"")+"\\n\\n";
      else if(p.type==="file")out+="[File: "+(p.filename||p.url||"file")+"]\\n\\n";
    });
    out+="---\\n\\n";
  });
  return out;
}

function exportJSON(){
  if(!currentSession)return null;
  const msgs=getExportMessages();
  return{
    session:{
      id:currentSession.id,
      title:currentSession.title||"Untitled",
      created:new Date(currentSession.time.created).toISOString(),
      model:currentSession.model&&currentSession.model.id?currentSession.model.id:null,
      tokens:currentSession.tokens||null,
      cost:currentSession.cost||null,
      mode:cleanMode?"clean":"full"
    },
    messages:msgs.map(m=>({
      role:m.info.role,
      time:new Date(m.info.time.created).toISOString(),
      parts:filterParts(m.parts).map(p=>{
        if(p.type==="text")return{type:"text",text:p.text||""};
        if(p.type==="reasoning")return{type:"reasoning",text:p.text||""};
        if(p.type==="tool"){const st=p.state||{};return{type:"tool",tool:p.tool||"",status:st.status||"",output:st.status==="completed"?st.output:st.status==="error"?st.error:""};}
        if(p.type==="file")return{type:"file",filename:p.filename||"",url:p.url||""};
        return{type:p.type};
      })
    }))
  };
}

function downloadFile(name,content,mime){
  const blob=new Blob([content],{type:mime});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportSession(fmt){
  if(!currentSession||!currentMessages)return;
  const safe=(currentSession.title||"session").replace(/[^a-zA-Z0-9_\\-\\u4e00-\\u9fff]/g,"_").slice(0,50);
  if(fmt==="md"){
    downloadFile(safe+".md",exportMarkdown(),"text/markdown;charset=utf-8");
  }else{
    const data=exportJSON();
    if(data)downloadFile(safe+".json",JSON.stringify(data,null,2),"application/json;charset=utf-8");
  }
}

function copyMessage(btn){
  const msg=btn.closest(".message");
  if(!msg)return;
  const parts=msg.querySelectorAll(".part-text");
  let text="";
  if(parts.length>0){
    parts.forEach(p=>{
      const clone=p.cloneNode(true);
      clone.querySelectorAll("mark.find-hl").forEach(m=>{
        m.replaceWith(document.createTextNode(m.textContent));
      });
      text+=clone.textContent+"\\n\\n";
    });
  }else{
    const clone=msg.cloneNode(true);
    clone.querySelector(".message-header").remove();
    clone.querySelectorAll("mark.find-hl").forEach(m=>{
      m.replaceWith(document.createTextNode(m.textContent));
    });
    text=clone.textContent;
  }
  text=text.trim();
  navigator.clipboard.writeText(text).then(()=>{
    btn.textContent="Copied!";
    btn.classList.add("copied");
    setTimeout(()=>{
      btn.textContent="Copy";
      btn.classList.remove("copied");
    },2000);
  }).catch(()=>{
    btn.textContent="Failed";
    setTimeout(()=>{btn.textContent="Copy"},2000);
  });
}

let renameSessionId=null;
function openRename(id,title){
  renameSessionId=id;
  document.getElementById("renameInput").value=title;
  document.getElementById("renameModal").classList.add("active");
  document.getElementById("renameInput").focus();
  document.getElementById("renameInput").select();
}
function closeRename(){
  document.getElementById("renameModal").classList.remove("active");
  renameSessionId=null;
}
async function submitRename(){
  if(!renameSessionId)return;
  const title=document.getElementById("renameInput").value.trim();
  if(!title)return;
  try{
    const r=await fetch(API+"/sessions/"+renameSessionId,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title})});
    if(!r.ok)throw new Error(r.statusText);
    closeRename();
    await loadSessions();
    if(currentSession&&currentSession.id===renameSessionId){
      currentSession.title=title;
      document.getElementById("detailTitle").textContent=title;
    }
  }catch(e){alert("Rename failed: "+e.message)}
}
document.getElementById("renameInput").addEventListener("keydown",e=>{
  if(e.key==="Enter"){e.preventDefault();submitRename()}
  if(e.key==="Escape"){e.preventDefault();closeRename()}
});
document.getElementById("renameModal").addEventListener("click",e=>{
  if(e.target===document.getElementById("renameModal"))closeRename();
});

let deleteSessionId=null;
function openDelete(id,title){
  deleteSessionId=id;
  document.getElementById("deleteTitle").textContent=title;
  document.getElementById("deleteModal").classList.add("active");
}
function closeDelete(){
  document.getElementById("deleteModal").classList.remove("active");
  deleteSessionId=null;
}
async function submitDelete(){
  if(!deleteSessionId)return;
  try{
    const r=await fetch(API+"/sessions/"+deleteSessionId,{method:"DELETE"});
    if(!r.ok)throw new Error(r.statusText);
    closeDelete();
    if(currentSession&&currentSession.id===deleteSessionId){
      showList();
    }
    await loadSessions();
  }catch(e){alert("Delete failed: "+e.message)}
}
document.getElementById("deleteModal").addEventListener("click",e=>{
  if(e.target===document.getElementById("deleteModal"))closeDelete();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&document.getElementById("deleteModal").classList.contains("active")){
    closeDelete();
  }
});

function updateSelectedSession(){
  document.querySelectorAll(".session-card").forEach((card,i)=>{
    card.classList.toggle("selected",i===selectedSessionIndex);
  });
  if(selectedSessionIndex>=0){
    const cards=document.querySelectorAll(".session-card");
    if(cards[selectedSessionIndex]){
      cards[selectedSessionIndex].scrollIntoView({behavior:"smooth",block:"nearest"});
    }
  }
}

document.addEventListener("keydown",e=>{
  const listView=document.getElementById("listView");
  const detailView=document.getElementById("detailView");
  if(!listView||listView.classList.contains("hidden"))return;
  if(detailView&&detailView.classList.contains("active"))return;
  const activeEl=document.activeElement;
  if(activeEl&&(activeEl.tagName==="INPUT"||activeEl.tagName==="TEXTAREA"))return;
  const cards=document.querySelectorAll(".session-card");
  const count=cards.length;
  if(count===0)return;
  if(e.key==="ArrowDown"){
    e.preventDefault();
    selectedSessionIndex=selectedSessionIndex<count-1?selectedSessionIndex+1:0;
    updateSelectedSession();
  }else if(e.key==="ArrowUp"){
    e.preventDefault();
    selectedSessionIndex=selectedSessionIndex>0?selectedSessionIndex-1:count-1;
    updateSelectedSession();
  }else if(e.key==="Enter"&&selectedSessionIndex>=0&&selectedSessionIndex<count){
    e.preventDefault();
    cards[selectedSessionIndex].click();
  }
});

let findMatches=[];
let findCurrent=-1;
let findTimer=null;

function clearFind(){
  document.getElementById("findInput").value="";
  document.getElementById("findCount").textContent="";
  clearHighlights();
  findMatches=[];
  findCurrent=-1;
}

function clearHighlights(){
  document.querySelectorAll("mark.find-hl").forEach(m=>{
    const p=m.parentNode;
    p.replaceChild(document.createTextNode(m.textContent),m);
    p.normalize();
  });
}

function doFind(){
  clearHighlights();
  findMatches=[];
  findCurrent=-1;
  const q=document.getElementById("findInput").value;
  if(!q)return;
  const ml=document.getElementById("messageList");
  const walker=document.createTreeWalker(ml,NodeFilter.SHOW_TEXT,null);
  const nodes=[];
  let n;
  while(n=walker.nextNode())nodes.push(n);
  const lower=q.toLowerCase();
  nodes.forEach(node=>{
    const text=node.textContent;
    const lowerText=text.toLowerCase();
    let idx=lowerText.indexOf(lower);
    if(idx===-1)return;
    const frag=document.createDocumentFragment();
    let last=0;
    while(idx!==-1){
      if(idx>last)frag.appendChild(document.createTextNode(text.slice(last,idx)));
      const mark=document.createElement("mark");
      mark.className="find-hl";
      mark.textContent=text.slice(idx,idx+q.length);
      frag.appendChild(mark);
      last=idx+q.length;
      idx=lowerText.indexOf(lower,last);
    }
    if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag,node);
  });
  findMatches=Array.from(document.querySelectorAll("mark.find-hl"));
  if(findMatches.length>0){
    findCurrent=0;
    scrollToMatch();
  }
  updateFindCount();
}

function scrollToMatch(){
  findMatches.forEach((m,i)=>m.classList.toggle("current",i===findCurrent));
  if(findCurrent>=0&&findMatches[findCurrent]){
    findMatches[findCurrent].scrollIntoView({behavior:"smooth",block:"center"});
  }
  updateFindCount();
}

function updateFindCount(){
  const el=document.getElementById("findCount");
  if(findMatches.length===0){
    el.textContent=document.getElementById("findInput").value?"No results":"";
  }else{
    el.textContent=(findCurrent+1)+"/"+findMatches.length;
  }
}

function findNext(){
  if(findMatches.length===0)return;
  findCurrent=(findCurrent+1)%findMatches.length;
  scrollToMatch();
}

function findPrev(){
  if(findMatches.length===0)return;
  findCurrent=(findCurrent-1+findMatches.length)%findMatches.length;
  scrollToMatch();
}

document.addEventListener("keydown",e=>{
  const detail=document.getElementById("detailView");
  if(!detail||!detail.classList.contains("active"))return;
  if((e.ctrlKey||e.metaKey)&&e.key==="f"){
    e.preventDefault();
    document.getElementById("findInput").focus();
    document.getElementById("findInput").select();
  }
  if(e.key==="Escape"){
    if(document.activeElement===document.getElementById("findInput")){
      e.preventDefault();
      clearFind();
      document.getElementById("findInput").blur();
    }else if(!document.getElementById("renameModal").classList.contains("active")
      &&!document.getElementById("deleteModal").classList.contains("active")){
      e.preventDefault();
      showList();
    }
  }
  if(e.key==="Enter"&&document.activeElement===document.getElementById("findInput")){
    e.preventDefault();
    if(e.shiftKey)findPrev();else findNext();
  }
});

document.getElementById("findInput").addEventListener("input",()=>{
  clearTimeout(findTimer);
  findTimer=setTimeout(doFind,200);
});

function showList(){
  document.getElementById("listView").classList.remove("hidden");
  document.getElementById("detailView").classList.remove("active");
  clearFind();
  selectedSessionIndex=-1;
  updateSelectedSession();
}

async function showDetail(id){
  try{
    const session=await api("/sessions/"+id);
    const msgs=await api("/sessions/"+id+"/messages?limit=1000");
    currentSession=session;
    allMessages=msgs;
    document.getElementById("listView").classList.add("hidden");
    document.getElementById("detailView").classList.add("active");
    const ml=document.getElementById("messageList");
    ml.classList.toggle("clean-mode",cleanMode);
    renderDetail(session,allMessages);
  }catch(e){alert("Load failed: "+e.message)}
}

document.getElementById("searchBox").addEventListener("input",e=>{
  clearTimeout(debounceTimer);
  debounceTimer=setTimeout(async()=>{
    try{await loadSessions()}catch(e){console.error(e)}
  },300);
});

(async()=>{
  try{
    const info=await api("/info");
    document.getElementById("statusBar").textContent="Connected to "+esc(info.directory)+" ("+esc(info.projectId)+") | Server: "+esc(info.serverIP)+":"+info.serverPort;
    await loadSessions();
  }catch(e){
    document.getElementById("sessionList").innerHTML='<div class="error">Failed: '+esc(e.message)+'</div>';
    document.getElementById("statusBar").textContent="Disconnected";
  }
})();

let evtSource=null;
let reconnectTimer=null;
function connectSSE(){
  if(evtSource)evtSource.close();
  evtSource=new EventSource("/api/events");
  evtSource.onopen=()=>{
    document.getElementById("statusBar").textContent=document.getElementById("statusBar").textContent.replace(/Disconnected/,"Connected");
  };
  evtSource.onmessage=(e)=>{
    try{
      const msg=JSON.parse(e.data);
      if(msg.type==="connected")return;
      const t=msg.type||"";
      if(t.startsWith("session.")||t==="todo.updated"){
        clearTimeout(debounceTimer);
        debounceTimer=setTimeout(async()=>{
          try{
            await loadSessions();
          }catch(e){console.error(e)}
        },500);
      }
      if(currentSession&&(t.startsWith("message.")||t.startsWith("session.next."))){
        clearTimeout(window._msgTimer);
        window._msgTimer=setTimeout(async()=>{
          try{
            const msgs=await api("/sessions/"+currentSession.id+"/messages?limit=1000");
            currentMessages=msgs;
            allMessages=msgs;
            renderDetail(currentSession,msgs);
          }catch(e){console.error(e)}
        },800);
      }
    }catch(e){console.error(e)}
  };
  evtSource.onerror=()=>{
    evtSource.close();
    document.getElementById("statusBar").textContent="Disconnected - reconnecting...";
    reconnectTimer=setTimeout(connectSSE,3000);
  };
}
connectSSE();

let statsTimeRange=7;
let costTrendChart=null;
let modelCostChart=null;
let sessionCountChart=null;

function switchTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===tab));
  document.getElementById("sessionsTab").style.display=tab==="sessions"?"block":"none";
  const sv=document.getElementById("statsView");
  sv.classList.toggle("active",tab==="stats");
  if(tab==="stats")loadStats();
}

function setTimeRange(days){
  statsTimeRange=days;
  document.querySelectorAll(".time-btn").forEach(b=>b.classList.toggle("active",parseInt(b.dataset.range)===days));
  renderStats();
}

async function loadStats(){
  try{
    allSessions=await api("/sessions?limit=1000");
    renderStats();
  }catch(e){console.error(e)}
}

function aggregateStats(sessions,days){
  const now=Date.now();
  const cutoff=days>0?now-days*864e5:0;
  const filtered=sessions.filter(s=>s.time.created>=cutoff);
  const totalCost=filtered.reduce((sum,s)=>sum+(s.cost||0),0);
  const totalTokens=filtered.reduce((sum,s)=>{const t=s.tokens||{};return sum+(t.input||0)+(t.output||0)+(t.reasoning||0)},0);
  const avgCost=filtered.length>0?totalCost/filtered.length:0;
  const dailyMap={};
  filtered.forEach(s=>{
    const date=new Date(s.time.created).toISOString().split("T")[0];
    if(!dailyMap[date])dailyMap[date]={cost:0,count:0,tokens:0};
    dailyMap[date].cost+=s.cost||0;
    dailyMap[date].count++;
    const t=s.tokens||{};
    dailyMap[date].tokens+=(t.input||0)+(t.output||0)+(t.reasoning||0);
  });
  const modelMap={};
  filtered.forEach(s=>{
    const model=s.model&&s.model.id?s.model.id:"unknown";
    if(!modelMap[model])modelMap[model]=0;
    modelMap[model]+=s.cost||0;
  });
  return{totalCost,totalTokens,sessionCount:filtered.length,avgCost,dailyMap,modelMap};
}

function fmtNum(n){if(n<1e3)return String(n);if(n<1e6)return(n/1e3).toFixed(1)+"k";return(n/1e6).toFixed(1)+"M"}

function getCSSVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getChartColors(){
  return{
    blue:getCSSVar("--accent-blue"),
    green:getCSSVar("--accent-green"),
    yellow:getCSSVar("--accent-yellow"),
    red:getCSSVar("--accent-red"),
    purple:getCSSVar("--accent-purple"),
    textSecondary:getCSSVar("--text-secondary"),
    borderSecondary:getCSSVar("--border-secondary"),
    bgSecondary:getCSSVar("--bg-secondary")
  };
}

const chartColors=["#58a6ff","#3fb950","#d29922","#f85149","#d2a8ff","#79c0ff","#56d364","#e3b341"];

function renderStats(){
  const stats=aggregateStats(allSessions,statsTimeRange);
  document.getElementById("totalCost").textContent="$"+stats.totalCost.toFixed(4);
  document.getElementById("totalTokens").textContent=fmtNum(stats.totalTokens);
  document.getElementById("sessionCount").textContent=String(stats.sessionCount);
  document.getElementById("avgCost").textContent="$"+stats.avgCost.toFixed(4);
  const dates=Object.keys(stats.dailyMap).sort();
  const costs=dates.map(d=>stats.dailyMap[d].cost);
  const counts=dates.map(d=>stats.dailyMap[d].count);
  const colors=getChartColors();
  const chartOpts={responsive:true,maintainAspectRatio:true,plugins:{legend:{labels:{color:colors.textSecondary,font:{size:11}}}},scales:{x:{ticks:{color:colors.textSecondary,font:{size:10}},grid:{color:colors.borderSecondary}},y:{ticks:{color:colors.textSecondary,font:{size:10}},grid:{color:colors.borderSecondary}}}};
  if(costTrendChart)costTrendChart.destroy();
  costTrendChart=new Chart(document.getElementById("costTrendChart"),{type:"line",data:{labels:dates,datasets:[{label:"Cost ($)",data:costs,borderColor:colors.blue,backgroundColor:colors.blue+"1a",fill:true,tension:.3,pointRadius:3,pointBackgroundColor:colors.blue}]},options:{...chartOpts,plugins:{...chartOpts.plugins,legend:{display:false}}}});
  const models=Object.keys(stats.modelMap);
  const modelCosts=models.map(m=>stats.modelMap[m]);
  if(modelCostChart)modelCostChart.destroy();
  modelCostChart=new Chart(document.getElementById("modelCostChart"),{type:"doughnut",data:{labels:models,datasets:[{data:modelCosts,backgroundColor:chartColors.slice(0,models.length),borderColor:colors.bgSecondary,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{position:"bottom",labels:{color:colors.textSecondary,font:{size:11},padding:12}}}}});
  if(sessionCountChart)sessionCountChart.destroy();
  sessionCountChart=new Chart(document.getElementById("sessionCountChart"),{type:"bar",data:{labels:dates,datasets:[{label:"Sessions",data:counts,backgroundColor:colors.green,borderRadius:4}]},options:{...chartOpts,plugins:{...chartOpts.plugins,legend:{display:false}}}});
}
</script>
</body>
</html>`
}

const server: PluginModule["server"] = async (input, options) => {
  const portOption = options?.port
  const port = typeof portOption === "string" ? parseInt(portOption, 10) : (portOption as number)
  const finalPort = Number.isFinite(port) && port > 0 ? port : DEFAULT_PORT
  const directory = input.directory
  const client = input.client
  const sseClients = new Set<http.ServerResponse>()

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${finalPort}`)
    const pathname = url.pathname

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    try {
      if (pathname === "/" || pathname === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
        res.end(getWebUI(finalPort))
        return
      }

      if (pathname === "/api/events") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        })
        res.write("data: {\"type\":\"connected\"}\n\n")
        sseClients.add(res)
        req.on("close", () => sseClients.delete(res))
        return
      }

      if (pathname === "/api/info") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ 
          directory, 
          projectId: input.project.id,
          serverIP: getLocalIP(),
          serverPort: port
        }))
        return
      }

      if (pathname === "/api/sessions") {
        const search = url.searchParams.get("search") || undefined
        const limit = parseInt(url.searchParams.get("limit") || "100", 10)
        const result = await (client.session as any).list({
          query: { search, limit, roots: true },
        })
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(result.data || []))
        return
      }

      const sessionMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/)
      if (sessionMatch) {
        if (req.method === "PATCH") {
          let body = ""
          req.on("data", (chunk: Buffer) => { body += chunk.toString() })
          await new Promise<void>((resolve) => req.on("end", resolve))
          const data = JSON.parse(body) as { title?: string }
          const result = await (client.session as any).update({
            path: { id: sessionMatch[1] },
            body: { title: data.title },
          })
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify(result.data))
          return
        }
        if (req.method === "DELETE") {
          const result = await (client.session as any).delete({
            path: { id: sessionMatch[1] },
          })
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify(result.data || { success: true }))
          return
        }
        const result = await (client.session as any).get({
          path: { id: sessionMatch[1] },
        })
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(result.data))
        return
      }

      const messagesMatch = pathname.match(/^\/api\/sessions\/([^/]+)\/messages$/)
      if (messagesMatch) {
        const limit = parseInt(url.searchParams.get("limit") || "200", 10)
        const result = await (client.session as any).messages({
          path: { id: messagesMatch[1] },
          query: { limit },
        })
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(result.data || []))
        return
      }

      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Not found" }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: msg }))
    }
  })

  const startServer = (tryPort: number, maxAttempts: number = 10): void => {
    httpServer.listen(tryPort, () => {
      console.log(`[session-history] Web UI: http://localhost:${tryPort}`)
    })

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && maxAttempts > 0) {
        console.log(`[session-history] Port ${tryPort} in use, trying ${tryPort + 1}...`)
        httpServer.removeAllListeners()
        startServer(tryPort + 1, maxAttempts - 1)
      } else if (err.code === "EADDRINUSE") {
        console.error(`[session-history] Could not find available port after 10 attempts`)
      } else {
        console.error(`[session-history] Server error:`, err.message)
      }
    })
  }

  startServer(finalPort)

  function broadcast(data: unknown) {
    const payload = `data: ${JSON.stringify(data)}\n\n`
    for (const client of sseClients) {
      try { client.write(payload) } catch { sseClients.delete(client) }
    }
  }

  return {
    async event({ event }) {
      const type = event.type as string
      if (
        type.startsWith("session.") ||
        type.startsWith("message.") ||
        type === "todo.updated"
      ) {
        broadcast({ type, event })
      }
    },
  }
}

const plugin: PluginModule = {
  id: "opencode.session-history",
  server,
}

export default plugin
