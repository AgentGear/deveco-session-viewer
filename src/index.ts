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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
:root{
--bg-primary:#09090b;
--bg-secondary:#18181b;
--bg-tertiary:#27272a;
--bg-hover:#3f3f46;
--bg-input:#0c0c0e;
--bg-hover-card:#1c1c1f;
--bg-success:#052e16;
--bg-error:#451a03;
--bg-danger:#450a0a;
--text-primary:#e4e4e7;
--text-heading:#fafafa;
--text-secondary:#a1a1aa;
--text-muted:#52525b;
--border-primary:rgba(255,255,255,.08);
--border-secondary:rgba(255,255,255,.04);
--border-subtle:rgba(255,255,255,.03);
--accent-blue:#818cf8;
--accent-blue-dark:#6366f1;
--accent-blue-glow:rgba(129,140,248,.1);
--accent-green:#4ade80;
--accent-green-glow:rgba(74,222,128,.08);
--accent-yellow:#facc15;
--accent-red:#fb7185;
--accent-red-dark:#e11d48;
--accent-purple:#c084fc;
--accent-favorite:#fbbf24;
--gradient-accent:linear-gradient(135deg,#818cf8,#c084fc);
--shadow-xs:0 1px 2px rgba(0,0,0,.4);
--shadow-sm:0 1px 3px rgba(0,0,0,.5),0 1px 2px rgba(0,0,0,.3);
--shadow-md:0 4px 12px rgba(0,0,0,.4);
--shadow-lg:0 16px 48px rgba(0,0,0,.5);
--shadow-dropdown:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05);
--radius-sm:6px;
--radius-md:8px;
--radius-lg:10px;
--radius-xl:14px;
--ease:cubic-bezier(.16,1,.3,1);
--ease-spring:cubic-bezier(.34,1.56,.64,1);
--font-sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
--font-mono:"JetBrains Mono","SF Mono","Cascadia Code",ui-monospace,monospace;
}
.light-theme{
--bg-primary:#fafafa;
--bg-secondary:#ffffff;
--bg-tertiary:#f4f4f5;
--bg-hover:#e4e4e7;
--bg-input:#ffffff;
--bg-hover-card:#fafafa;
--bg-success:#dcfce7;
--bg-error:#fef3c7;
--bg-danger:#fee2e2;
--text-primary:#27272a;
--text-heading:#09090b;
--text-secondary:#71717a;
--text-muted:#a1a1aa;
--border-primary:rgba(0,0,0,.08);
--border-secondary:rgba(0,0,0,.04);
--border-subtle:rgba(0,0,0,.02);
--accent-blue:#6366f1;
--accent-blue-dark:#4f46e5;
--accent-blue-glow:rgba(99,102,241,.08);
--accent-green:#16a34a;
--accent-green-glow:rgba(22,163,74,.06);
--accent-yellow:#ca8a04;
--accent-red:#e11d48;
--accent-red-dark:#be123c;
--accent-purple:#9333ea;
--accent-favorite:#ca8a04;
--gradient-accent:linear-gradient(135deg,#6366f1,#9333ea);
--shadow-xs:0 1px 2px rgba(0,0,0,.04);
--shadow-sm:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
--shadow-md:0 4px 12px rgba(0,0,0,.06);
--shadow-lg:0 16px 48px rgba(0,0,0,.08);
--shadow-dropdown:0 8px 32px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04);
}
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:15px;-webkit-text-size-adjust:100%}
body{font-family:var(--font-sans);background:var(--bg-primary);color:var(--text-primary);line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;letter-spacing:-.011em;transition:background .3s var(--ease),color .2s var(--ease)}
.container{max-width:1200px;margin:0 auto;padding:40px 28px}
h1,h2,h3,h4{color:var(--text-heading);letter-spacing:-.025em;font-weight:600}
h1{font-size:1.1rem;font-weight:600;display:flex;align-items:center;gap:12px;margin-bottom:28px;letter-spacing:-.02em}
h1 .logo-mark{width:28px;height:28px;border-radius:8px;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(99,102,241,.25)}
h1 .logo-mark svg{width:16px;height:16px;color:#fff}
h1 .logo-text{color:var(--text-heading);font-weight:600}
.theme-toggle{background:transparent;border:1px solid var(--border-primary);color:var(--text-muted);width:34px;height:34px;border-radius:var(--radius-md);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s var(--ease);margin-left:auto;flex-shrink:0}
.theme-toggle svg{width:16px;height:16px}
.theme-toggle:hover{color:var(--text-primary);border-color:var(--border-primary);background:var(--bg-tertiary)}
.session-list{display:flex;flex-direction:column;gap:6px}
.session-card{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);padding:14px 18px;cursor:pointer;transition:all .15s var(--ease);position:relative;overflow:hidden;animation:cardIn .35s var(--ease) backwards}
.session-card:hover{background:var(--bg-hover-card);border-color:rgba(255,255,255,.12)}
.light-theme .session-card:hover{border-color:rgba(0,0,0,.12)}
.session-card:active{transform:scale(.998)}
.session-card.selected{border-color:var(--accent-blue);box-shadow:0 0 0 1px var(--accent-blue-glow)}
.session-title{font-size:.9rem;font-weight:500;color:var(--text-heading);margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:-.015em;padding-right:100px}
.session-meta{display:flex;gap:6px;font-size:.73rem;color:var(--text-muted);flex-wrap:wrap;align-items:center}
.session-meta .sep{opacity:.3}
.badge{padding:2px 8px;border-radius:4px;font-size:.68rem;font-weight:500;display:inline-flex;align-items:center;gap:3px;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.badge-tokens{background:rgba(192,132,252,.08);color:var(--accent-purple)}
.badge-cost{background:rgba(129,140,248,.08);color:var(--accent-blue)}
.badge-model{background:var(--bg-tertiary);color:var(--text-muted)}
.badge-messages{background:rgba(74,222,128,.08);color:var(--accent-green)}
.badge-duration{background:rgba(250,204,21,.08);color:var(--accent-yellow)}
.session-time{color:var(--text-secondary);font-weight:400;font-variant-numeric:tabular-nums}
.detail-view{display:none;opacity:0;transform:translateY(4px);transition:opacity .25s var(--ease),transform .25s var(--ease)}
.detail-view.active{display:block;opacity:1;transform:translateY(0)}
.list-view{transition:opacity .15s var(--ease),transform .15s var(--ease)}
.list-view.hidden{display:none}
.list-view.fade-out{opacity:0;transform:translateY(-4px)}
.sticky-header{position:sticky;top:0;z-index:10;background:var(--bg-primary);padding-top:2px}
.sticky-toolbar{padding:10px 0;display:flex;align-items:center;gap:8px}
.detail-title{font-size:1rem;color:var(--text-heading);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;letter-spacing:-.02em}
.detail-meta{display:flex;gap:12px;font-size:.73rem;color:var(--text-muted);flex-wrap:wrap;padding:8px 0 12px;border-bottom:1px solid var(--border-secondary);margin-bottom:20px;font-variant-numeric:tabular-nums}
.detail-meta span{display:inline-flex;align-items:center;gap:4px}
.back-btn{display:inline-flex;align-items:center;gap:4px;background:transparent;border:1px solid var(--border-primary);color:var(--text-secondary);padding:0 10px;height:32px;border-radius:var(--radius-md);cursor:pointer;font-size:.78rem;font-weight:500;transition:all .12s var(--ease);font-family:inherit;white-space:nowrap}
.back-btn svg{width:14px;height:14px;flex-shrink:0}
.back-btn:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.back-btn:active{transform:scale(.97)}
.message-list{display:flex;flex-direction:column;gap:12px}
.message{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);padding:16px 18px;position:relative;transition:border-color .15s var(--ease)}
.message:hover{border-color:rgba(255,255,255,.1)}
.light-theme .message:hover{border-color:rgba(0,0,0,.1)}
.message.user{border-left:2px solid var(--accent-blue)}
.message.assistant{border-left:2px solid var(--accent-green)}
.message-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle);font-size:.73rem;color:var(--text-muted)}
.copy-btn{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary);padding:2px 8px;border-radius:4px;cursor:pointer;font-size:.68rem;font-weight:500;transition:all .12s var(--ease);opacity:0;font-family:inherit;letter-spacing:.02em}
.message:hover .copy-btn{opacity:1}
.copy-btn:hover{background:var(--bg-hover);color:var(--text-primary)}
.copy-btn.copied{background:var(--bg-success);border-color:var(--accent-green);color:var(--accent-green);opacity:1}
.message-role{font-weight:600;text-transform:uppercase;letter-spacing:.08em;font-size:.65rem}
.message.user .message-role{color:var(--accent-blue)}
.message.assistant .message-role{color:var(--accent-green)}
.message-content{font-size:.875rem;line-height:1.75;word-wrap:break-word;color:var(--text-primary)}
.message-content p{margin-bottom:8px}
.message-content p:last-child{margin-bottom:0}
.message-content code{background:var(--bg-tertiary);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:.78rem;color:var(--accent-purple)}
.message-content pre{background:var(--bg-input);border:1px solid var(--border-secondary);padding:14px 16px;border-radius:var(--radius-md);overflow-x:auto;margin:10px 0}
.message-content pre code{background:none;padding:0;font-size:.78rem;line-height:1.65;color:var(--text-primary)}
.message-content strong{color:var(--text-heading);font-weight:600}
.message-content em{color:var(--accent-purple);font-style:italic}
.message-content h2,.message-content h3,.message-content h4{color:var(--text-heading);margin:14px 0 6px}
.message-content ul,.message-content ol{padding-left:20px;margin:6px 0}
.tool-call{background:var(--bg-input);border:1px solid var(--border-secondary);border-radius:var(--radius-md);padding:8px 12px;margin:6px 0;font-size:.8rem}
.tool-name{color:var(--accent-yellow);font-weight:500;margin-bottom:3px;font-size:.78rem}
.tool-status{font-size:.68rem;color:var(--text-muted)}
.tool-output{margin-top:6px;padding-top:6px;border-top:1px solid var(--border-secondary);font-family:var(--font-mono);font-size:.68rem;color:var(--text-muted);max-height:100px;overflow:hidden}
.reasoning{color:var(--text-muted);font-style:italic;padding:6px 12px;border-left:2px solid var(--border-primary);margin:6px 0;font-size:.8rem}
.step-divider{text-align:center;color:var(--text-muted);font-size:.68rem;margin:6px 0;position:relative;opacity:.6}
.step-divider::before,.step-divider::after{content:"";position:absolute;top:50%;width:30%;height:1px;background:var(--border-secondary)}
.step-divider::before{left:0}
.step-divider::after{right:0}
.toolbar{display:flex;gap:8px;align-items:center}
.toggle-btn{display:inline-flex;align-items:center;gap:5px;background:transparent;border:1px solid var(--border-primary);color:var(--text-muted);padding:0 10px;height:32px;border-radius:var(--radius-md);cursor:pointer;font-size:.78rem;font-weight:500;transition:all .12s var(--ease);user-select:none;font-family:inherit;white-space:nowrap}
.toggle-btn:hover{background:var(--bg-tertiary);color:var(--text-secondary)}
.toggle-btn:active{transform:scale(.97)}
.toggle-btn.active{color:var(--accent-green);border-color:var(--accent-green);background:var(--accent-green-glow)}
.toggle-btn .dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.4}
.toggle-btn.active .dot{opacity:1}
.message-list.clean-mode .part-reasoning,
.message-list.clean-mode .part-tool,
.message-list.clean-mode .part-step,
.message-list.clean-mode .part-agent,
.message-list.clean-mode .part-retry,
.message-list.clean-mode .part-file{display:none}
.message-list.clean-mode .message.assistant.intermediate{display:none}
.loading{text-align:center;padding:48px;color:var(--text-muted);font-size:.8rem;letter-spacing:.02em}
.loading::before{content:"";display:block;width:16px;height:16px;border:1.5px solid var(--border-primary);border-top-color:var(--accent-blue);border-radius:50%;animation:spin .6s linear infinite;margin:0 auto 12px}
.empty{text-align:center;padding:64px 24px;color:var(--text-muted);font-size:.85rem}
.empty::before{content:"";display:block;width:40px;height:40px;margin:0 auto 16px;background:none;border:2px solid var(--border-primary);border-radius:50%;position:relative}
.empty::after{content:"";display:block;width:12px;height:2px;background:var(--border-primary);border-radius:1px;transform:rotate(45deg);margin:-6px auto 0 28px;position:relative}
.empty-hint{font-size:.75rem;color:var(--text-muted);margin-top:6px;opacity:.6}
.error{background:var(--bg-error);border:1px solid rgba(251,191,36,.2);border-radius:var(--radius-md);padding:12px 16px;color:var(--accent-yellow);font-size:.8rem}
.status-bar{font-size:.7rem;color:var(--text-muted);margin-bottom:20px;padding:8px 14px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-md);display:flex;align-items:center;gap:8px;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.status-bar::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent-green);box-shadow:0 0 6px var(--accent-green);animation:pulse 2s ease-in-out infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.export-wrap{position:relative}
.export-btn{display:inline-flex;align-items:center;gap:4px;background:transparent;border:1px solid var(--border-primary);color:var(--text-secondary);padding:0 10px;height:32px;border-radius:var(--radius-md);cursor:pointer;font-size:.78rem;font-weight:500;transition:all .12s var(--ease);font-family:inherit;white-space:nowrap}
.export-btn svg{width:12px;height:12px;flex-shrink:0}
.export-btn:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.export-btn:active{transform:scale(.97)}
.export-menu{display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);overflow:hidden;z-index:20;min-width:120px;box-shadow:var(--shadow-dropdown);animation:dropdownIn .15s var(--ease)}
.export-menu.show{display:block}
.export-menu button{display:block;width:100%;padding:8px 14px;background:none;border:none;color:var(--text-primary);font-size:.8rem;text-align:left;cursor:pointer;transition:background .1s var(--ease);font-family:inherit}
.export-menu button:hover{background:var(--bg-tertiary)}
.find-bar{display:flex;align-items:center;gap:6px;padding:0 12px;max-height:0;opacity:0;overflow:hidden;transition:max-height .25s var(--ease),opacity .15s var(--ease),padding .25s var(--ease),margin .25s var(--ease);margin:0;background:var(--bg-secondary);border:1px solid transparent;border-radius:var(--radius-md)}
.find-bar.visible{max-height:60px;opacity:1;padding:8px 12px;margin:8px 0;border-color:var(--border-primary)}
.find-input{flex:1;padding:6px 10px;background:var(--bg-input);border:1px solid var(--border-primary);border-radius:var(--radius-sm);color:var(--text-primary);font-size:.8rem;outline:none;min-width:0;transition:border-color .15s var(--ease);font-family:inherit}
.find-input:focus{border-color:var(--accent-blue)}
.find-input::placeholder{color:var(--text-muted)}
.find-count{font-size:.68rem;color:var(--text-muted);white-space:nowrap;min-width:50px;text-align:center;font-variant-numeric:tabular-nums}
.find-btn{background:var(--bg-tertiary);border:1px solid var(--border-primary);color:var(--text-secondary);padding:3px 8px;border-radius:var(--radius-sm);cursor:pointer;font-size:.78rem;line-height:1;transition:all .1s var(--ease)}
.find-btn:hover{background:var(--bg-hover);color:var(--text-primary)}
mark.find-hl{background:rgba(250,204,21,.2);color:var(--text-primary);border-radius:2px;padding:0 1px}
mark.find-hl.current{background:var(--accent-blue);color:#fff}
.tab-bar{display:flex;gap:0;margin-bottom:24px;border-bottom:1px solid var(--border-primary);position:relative}
.tab{padding:8px 16px;background:none;border:none;color:var(--text-muted);font-size:.8rem;font-weight:500;cursor:pointer;position:relative;transition:color .15s var(--ease);font-family:inherit;letter-spacing:-.01em}
.tab:hover{color:var(--text-secondary)}
.tab.active{color:var(--text-heading)}
.tab.active::after{content:"";position:absolute;bottom:-1px;left:8px;right:8px;height:1.5px;background:var(--gradient-accent);border-radius:1px 1px 0 0}
.stats-view{display:none}
.stats-view.active{display:block;animation:fadeIn .25s var(--ease)}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.time-selector{display:flex;gap:4px;margin-bottom:20px}
.time-btn{padding:5px 14px;background:transparent;border:1px solid var(--border-primary);color:var(--text-muted);border-radius:var(--radius-md);cursor:pointer;font-size:.78rem;font-weight:500;transition:all .12s var(--ease);font-family:inherit}
.time-btn:hover{background:var(--bg-tertiary);color:var(--text-secondary)}
.time-btn.active{background:var(--accent-blue-glow);border-color:var(--accent-blue);color:var(--accent-blue)}
.summary-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.card{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);padding:16px 18px;position:relative;transition:border-color .15s var(--ease)}
.card:hover{border-color:rgba(255,255,255,.1)}
.light-theme .card:hover{border-color:rgba(0,0,0,.1)}
.card-label{font-size:.65rem;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.1em;font-weight:500}
.card-value{font-size:1.4rem;font-weight:700;color:var(--text-heading);letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.card-value.cost{color:var(--accent-blue)}
.card-value.tokens{color:var(--accent-purple)}
.card-value.sessions{color:var(--accent-green)}
.card-value.avg{color:var(--accent-yellow)}
.charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.chart-card{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);padding:20px;transition:border-color .15s var(--ease)}
.chart-card:hover{border-color:rgba(255,255,255,.1)}
.light-theme .chart-card:hover{border-color:rgba(0,0,0,.1)}
.chart-card h3{font-size:.8rem;color:var(--text-secondary);margin-bottom:14px;font-weight:500;letter-spacing:-.01em}
.chart-card.full{grid-column:1/-1}
.load-more-row{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 0;margin-top:8px}
.load-more-text{font-size:.73rem;color:var(--text-muted);font-variant-numeric:tabular-nums}
.load-more-btn{padding:0 14px;height:28px;background:transparent;border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-secondary);font-size:.75rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);font-family:inherit}
.load-more-btn:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.select-btn{display:inline-flex;align-items:center;gap:4px;padding:0 10px;height:32px;background:transparent;border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-muted);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);font-family:inherit;white-space:nowrap}
.select-btn:hover{background:var(--bg-tertiary);color:var(--text-secondary)}
.select-btn.active{color:var(--accent-blue);border-color:var(--accent-blue);background:var(--accent-blue-glow)}
.select-btn svg{width:14px;height:14px}
.select-cb{width:16px;height:16px;accent-color:var(--accent-blue);cursor:pointer;flex-shrink:0;margin:0}
.session-card.card-selected{border-color:var(--accent-blue);background:var(--accent-blue-glow)}
.session-card .card-cb{display:none;position:absolute;left:12px;top:50%;transform:translateY(-50%)}
.session-card.show-cb .card-cb{display:flex;align-items:center}
.session-card.show-cb{padding-left:38px}
.bulk-action-bar{display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);padding:8px 16px;align-items:center;gap:12px;box-shadow:var(--shadow-dropdown);z-index:50;animation:slideUp .2s var(--ease)}
.bulk-count{font-size:.78rem;font-weight:500;color:var(--text-primary);white-space:nowrap;font-variant-numeric:tabular-nums}
.bulk-btn{padding:0 12px;height:28px;border-radius:var(--radius-md);font-size:.75rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);font-family:inherit;border:1px solid transparent}
.bulk-btn:disabled{opacity:.4;cursor:default}
.bulk-btn-delete{background:var(--accent-red);color:#fff;border:none}
.bulk-btn-delete:hover:not(:disabled){background:var(--accent-red-dark)}
.bulk-btn-export{background:transparent;border:1px solid var(--border-primary);color:var(--text-secondary)}
.bulk-btn-export:hover:not(:disabled){background:var(--bg-tertiary);color:var(--text-primary)}
.bulk-btn-cancel{background:transparent;border:1px solid var(--border-primary);color:var(--text-muted)}
.bulk-btn-cancel:hover{background:var(--bg-tertiary);color:var(--text-secondary)}
.session-card-actions{position:absolute;right:12px;top:50%;transform:translateY(-50%) translateX(4px);display:flex;gap:2px;opacity:0;transition:opacity .15s var(--ease),transform .15s var(--ease)}
.session-card:hover .session-card-actions{opacity:1;transform:translateY(-50%) translateX(0)}
.card-action-btn{background:transparent;border:none;color:var(--text-muted);width:26px;height:26px;border-radius:var(--radius-sm);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .1s var(--ease)}
.card-action-btn:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.card-action-btn.danger:hover{background:var(--bg-danger);color:var(--accent-red)}
.favorite-btn{background:transparent;border:none;width:26px;height:26px;border-radius:var(--radius-sm);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .15s var(--ease);color:var(--text-muted)}
.favorite-btn:hover{color:var(--accent-favorite)}
.favorite-btn.active{color:var(--accent-favorite)}
.favorite-btn.active:hover{color:var(--accent-favorite);opacity:.8}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(12px) saturate(1.2);-webkit-backdrop-filter:blur(12px) saturate(1.2);z-index:100;align-items:center;justify-content:center}
.modal-overlay.active{display:flex;animation:fadeIn .15s var(--ease)}
.modal{background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-xl);padding:24px;width:400px;max-width:90vw;box-shadow:var(--shadow-lg);animation:slideUp .25s var(--ease)}
@keyframes slideUp{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.modal h3{font-size:.95rem;color:var(--text-heading);margin-bottom:14px;letter-spacing:-.02em;font-weight:600}
.modal-input{width:100%;padding:9px 12px;background:var(--bg-input);border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-primary);font-size:.85rem;outline:none;margin-bottom:14px;transition:border-color .15s var(--ease);font-family:inherit}
.modal-input:focus{border-color:var(--accent-blue);box-shadow:0 0 0 3px var(--accent-blue-glow)}
.modal-actions{display:flex;justify-content:flex-end;gap:6px}
.modal-btn{padding:7px 16px;border-radius:var(--radius-md);cursor:pointer;font-size:.8rem;font-weight:500;transition:all .1s var(--ease);font-family:inherit;letter-spacing:-.01em}
.modal-btn.cancel{background:transparent;border:1px solid var(--border-primary);color:var(--text-secondary)}
.modal-btn.cancel:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.modal-btn.confirm{background:var(--accent-blue);border:none;color:#fff}
.modal-btn.confirm:hover{background:var(--accent-blue-dark)}
.modal-btn.danger{background:var(--accent-red);border:none;color:#fff}
.modal-btn.danger:hover{background:var(--accent-red-dark)}
.shortcuts-modal{width:480px;padding:20px 24px}
.shortcuts-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.shortcuts-header h3{margin-bottom:0}
.shortcuts-close{background:transparent;border:none;color:var(--text-muted);cursor:pointer;padding:4px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;transition:all .12s var(--ease)}
.shortcuts-close:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.shortcuts-group{margin-bottom:14px}
.shortcuts-group:last-child{margin-bottom:0}
.shortcuts-group-title{font-size:.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
.shortcut-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0}
.shortcut-keys{display:flex;gap:4px}
.shortcut-keys kbd{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:22px;padding:0 6px;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:4px;font-family:var(--font-sans);font-size:.68rem;font-weight:500;color:var(--text-secondary);line-height:1}
.shortcut-desc{font-size:.78rem;color:var(--text-secondary)}
.refresh-btn{display:inline-flex;align-items:center;justify-content:center;background:transparent;border:1px solid var(--border-primary);color:var(--text-secondary);padding:0;width:32px;height:32px;border-radius:var(--radius-md);cursor:pointer;transition:all .12s var(--ease);flex-shrink:0}
.refresh-btn:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.light-theme .refresh-btn:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.refresh-btn:active{transform:scale(.9)}
.refresh-btn svg{width:14px;height:14px}
.refresh-btn .refresh-icon{display:inline-flex;align-items:center;justify-content:center;transition:transform .4s var(--ease)}
.refresh-btn.spinning .refresh-icon{animation:spin .6s cubic-bezier(.4,0,.2,1) infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes cardIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes dropdownIn{from{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:translateY(0)}}
@keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}
.search-sort-row{display:flex;gap:8px;margin-bottom:12px;align-items:center}
.search-wrap{flex:1;position:relative}
.search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;display:flex;align-items:center;transition:color .12s var(--ease)}
.search-icon svg{width:14px;height:14px;stroke-width:1.8}
.search-wrap:focus-within .search-icon{color:var(--accent-blue)}
.search-box{width:100%;height:32px;padding:0 120px 0 32px;background:transparent;border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-primary);font-size:.78rem;font-weight:500;outline:none;transition:all .12s var(--ease);font-family:inherit}
.search-box:hover{background:var(--bg-tertiary)}
.search-box:focus{background:var(--bg-input);border-color:var(--accent-blue);box-shadow:0 0 0 3px var(--accent-blue-glow)}
.search-box::placeholder{color:var(--text-muted);font-size:.78rem;font-weight:500}
.search-mode-toggle{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:flex;background:var(--bg-tertiary);border-radius:calc(var(--radius-md) - 2px);padding:2px;gap:0;z-index:2}
.search-mode-btn{padding:0 8px;height:24px;background:transparent;border:none;border-radius:calc(var(--radius-md) - 3px);color:var(--text-muted);font-size:.68rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);font-family:inherit;line-height:24px;white-space:nowrap}
.search-mode-btn:hover{color:var(--text-secondary)}
.search-mode-btn.active{background:var(--bg-primary);color:var(--accent-blue);box-shadow:var(--shadow-xs)}
.content-search-progress{display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:0 2px}
.progress-bar{flex:1;height:3px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden}
.progress-fill{height:100%;background:var(--accent-blue);border-radius:2px;transition:width .15s var(--ease);width:0%}
.progress-text{font-size:.7rem;color:var(--text-muted);white-space:nowrap;font-variant-numeric:tabular-nums;min-width:80px;text-align:right}
.search-snippet{margin-top:8px;padding:6px 10px;background:var(--bg-tertiary);border-radius:var(--radius-sm);font-size:.73rem;color:var(--text-secondary);line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;border-left:2px solid var(--accent-blue)}
.search-snippet mark{background:rgba(250,204,21,.25);color:var(--text-primary);border-radius:2px;padding:0 1px}
.sort-wrap{position:relative;flex-shrink:0}
.sort-trigger{display:flex;align-items:center;gap:4px;padding:0 10px;height:32px;background:transparent;border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-secondary);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);white-space:nowrap;font-family:inherit}
.sort-trigger:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.sort-trigger .sort-icon{color:var(--text-muted);display:flex;align-items:center}
.sort-trigger .sort-icon svg{width:14px;height:14px}
.sort-trigger .sort-arrow{font-size:9px;color:var(--text-muted);margin-left:1px}
.sort-dropdown{display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);overflow:hidden;z-index:20;min-width:140px;box-shadow:var(--shadow-dropdown);animation:dropdownIn .12s var(--ease)}
.sort-dropdown.show{display:block}
.sort-dropdown button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:7px 12px;background:none;border:none;color:var(--text-secondary);font-size:.8rem;text-align:left;cursor:pointer;transition:background .1s var(--ease);font-family:inherit}
.sort-dropdown button:hover{background:var(--bg-tertiary)}
.sort-dropdown button.active{color:var(--accent-blue)}
.sort-dropdown button .arrow{font-size:9px;color:var(--text-muted)}
.sort-dropdown button.active .arrow{color:var(--accent-blue)}
.model-wrap{position:relative;flex-shrink:0}
.model-trigger{display:flex;align-items:center;gap:4px;padding:0 10px;height:32px;background:transparent;border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-secondary);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);white-space:nowrap;max-width:180px;font-family:inherit}
.model-trigger:hover{background:var(--bg-tertiary);color:var(--text-primary)}
.model-trigger .model-icon{color:var(--text-muted);display:flex;align-items:center}
.model-trigger .model-icon svg{width:14px;height:14px}
.model-trigger .model-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.model-dropdown{display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:var(--radius-lg);overflow:hidden;z-index:20;min-width:220px;max-height:320px;overflow-y:auto;box-shadow:var(--shadow-dropdown);animation:dropdownIn .12s var(--ease)}
.model-dropdown.show{display:block}
.model-dropdown-header{display:flex;gap:6px;padding:6px 12px;border-bottom:1px solid var(--border-secondary)}
.model-dropdown-header button{padding:3px 8px;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:4px;color:var(--text-muted);font-size:.68rem;cursor:pointer;transition:all .1s var(--ease);font-family:inherit}
.model-dropdown-header button:hover{color:var(--text-secondary)}
.model-dropdown label{display:flex;align-items:center;gap:8px;width:100%;padding:7px 12px;background:none;border:none;color:var(--text-secondary);font-size:.8rem;text-align:left;cursor:pointer;transition:background .1s var(--ease);font-family:inherit}
.model-dropdown label:hover{background:var(--bg-tertiary)}
.model-dropdown label input[type="checkbox"]{accent-color:var(--accent-blue);width:14px;height:14px;cursor:pointer;flex-shrink:0}
.model-dropdown label .model-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.model-dropdown label .count{font-size:.68rem;color:var(--text-muted);flex-shrink:0}
.filter-bar{display:flex;gap:4px;margin-bottom:14px;align-items:center}
.filter-btn{padding:0 10px;height:28px;background:transparent;border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-muted);font-size:.75rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);font-family:inherit;display:inline-flex;align-items:center;gap:4px}
.filter-btn:hover{background:var(--bg-tertiary);color:var(--text-secondary)}
.filter-btn.active{color:var(--accent-green);border-color:var(--accent-green);background:var(--accent-green-glow)}
.time-filter-btn{padding:0 10px;height:28px;background:transparent;border:1px solid var(--border-primary);border-radius:var(--radius-md);color:var(--text-muted);font-size:.75rem;font-weight:500;cursor:pointer;transition:all .12s var(--ease);font-family:inherit}
.time-filter-btn:hover{background:var(--bg-tertiary);color:var(--text-secondary)}
.time-filter-btn.active{color:var(--accent-green);border-color:var(--accent-green);background:var(--accent-green-glow)}
.time-group-header{font-size:.65rem;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;padding:10px 0 6px;margin-top:18px;display:flex;align-items:center;gap:6px}
.time-group-header:first-child{margin-top:0}
.time-group-header::before{content:"";width:4px;height:4px;border-radius:50%;background:var(--text-muted);opacity:.4}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border-primary);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--bg-hover)}
::selection{background:rgba(129,140,248,.2)}
</style>
</head>
<body>
<div class="container">
  <h1><span class="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span><span class="logo-text">Session Viewer</span><button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme" id="themeToggle"><svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></button></h1>
  <div class="status-bar" id="statusBar">Connecting...</div>
  <div class="list-view" id="listView">
    <div class="tab-bar">
      <button class="tab active" data-tab="sessions" onclick="switchTab('sessions')">Sessions</button>
      <button class="tab" data-tab="stats" onclick="switchTab('stats')">Statistics</button>
    </div>
    <div id="sessionsTab">
      <div class="search-sort-row">
        <div class="search-wrap">
          <span class="search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
          <input type="text" class="search-box" id="searchBox" placeholder="Search sessions by keyword..." />
          <div class="search-mode-toggle" id="searchModeToggle">
            <button class="search-mode-btn active" data-mode="title" onclick="setSearchMode('title')">Title</button>
            <button class="search-mode-btn" data-mode="content" onclick="setSearchMode('content')">Content</button>
          </div>
        </div>
        <div class="sort-wrap">
          <button class="sort-trigger" onclick="toggleSortDropdown(event)">
            <span class="sort-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></span>
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
            <span class="model-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/></svg></span>
            <span class="model-label" id="modelLabel">All Models</span>
          </button>
          <div class="model-dropdown" id="modelDropdown"></div>
        </div>
        <button class="select-btn" id="selectBtn" onclick="toggleSelectionMode()" title="Select sessions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></button>
        <button class="refresh-btn" onclick="refreshSessionList(event)" title="Refresh sessions"><span class="refresh-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></span></button>
      </div>
      <div class="content-search-progress" id="contentSearchProgress" style="display:none">
        <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
        <span class="progress-text" id="progressText">Searching...</span>
      </div>
      <div class="filter-bar">
        <button class="filter-btn active" data-filter="all" onclick="setFilter('all')">All</button>
        <button class="filter-btn" data-filter="favorites" onclick="setFilter('favorites')"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Favorites</button>
        <button class="filter-btn" id="selectAllBtn" style="display:none" onclick="selectAll()">Select All</button>
        <button class="filter-btn" id="deselectAllBtn" style="display:none" onclick="deselectAll()">Deselect All</button>
        <div style="flex:1"></div>
        <button class="time-filter-btn" data-range="1" onclick="setSessionTimeRange(1)">Today</button>
        <button class="time-filter-btn" data-range="7" onclick="setSessionTimeRange(7)">7 Days</button>
        <button class="time-filter-btn" data-range="30" onclick="setSessionTimeRange(30)">30 Days</button>
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
        <div class="chart-card full"><h3>Daily Token Trend</h3><canvas id="tokenTrendChart"></canvas></div>
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
        <button class="refresh-btn" onclick="refreshSessionDetail(event)" title="Refresh messages"><span class="refresh-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></span></button>
        <div class="export-wrap">
          <button class="export-btn" onclick="toggleExportMenu(event)">Export <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><path d="m6 9 6 6 6-6"/></svg></button>
          <div class="export-menu" id="exportMenu">
            <button onclick="exportSession('md')">Markdown</button>
            <button onclick="exportSession('json')">JSON</button>
          </div>
        </div>
        <button class="toggle-btn" id="cleanToggle" onclick="toggleClean()"><span class="dot"></span>Clean Mode</button>
        <button class="back-btn" onclick="showList()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>Back</button>
      </div>
      <div class="find-bar" id="findBar">
        <input type="text" class="find-input" id="findInput" placeholder="Search in conversation... (Enter: next, Shift+Enter: prev)" />
        <span class="find-count" id="findCount"></span>
        <button class="find-btn" onclick="findPrev()" title="Previous (Shift+Enter)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg></button>
        <button class="find-btn" onclick="findNext()" title="Next (Enter)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
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
    <p style="color:var(--text-secondary);font-size:.875rem;margin-bottom:16px">Are you sure you want to delete "<span id="deleteTitle" style="color:var(--text-heading)"></span>"? This action cannot be undone.</p>
    <div class="modal-actions">
      <button class="modal-btn cancel" onclick="closeDelete()">Cancel</button>
      <button class="modal-btn danger" onclick="submitDelete()">Delete</button>
    </div>
  </div>
</div>
<div class="bulk-action-bar" id="bulkActionBar">
  <span class="bulk-count" id="bulkCount">0 selected</span>
  <button class="bulk-btn bulk-btn-export" id="bulkExportBtn" onclick="bulkExport()">Export</button>
  <button class="bulk-btn bulk-btn-delete" id="bulkDeleteBtn" onclick="bulkDelete()">Delete</button>
  <button class="bulk-btn bulk-btn-cancel" onclick="toggleSelectionMode()">Cancel</button>
</div>
<div class="modal-overlay" id="shortcutsModal">
  <div class="modal shortcuts-modal">
    <div class="shortcuts-header"><h3>Keyboard Shortcuts</h3><button class="shortcuts-close" onclick="closeShortcuts()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>
    <div class="shortcuts-group">
      <div class="shortcuts-group-title">Session List</div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>↑</kbd><kbd>↓</kbd></span><span class="shortcut-desc">Navigate sessions</span></div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>Enter</kbd></span><span class="shortcut-desc">Open selected session</span></div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>Esc</kbd></span><span class="shortcut-desc">Clear search</span></div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>?</kbd></span><span class="shortcut-desc">Show shortcuts</span></div>
    </div>
    <div class="shortcuts-group">
      <div class="shortcuts-group-title">Session Detail</div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>Ctrl</kbd><kbd>F</kbd></span><span class="shortcut-desc">Search in conversation</span></div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>Enter</kbd></span><span class="shortcut-desc">Next match</span></div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>Shift</kbd><kbd>Enter</kbd></span><span class="shortcut-desc">Previous match</span></div>
      <div class="shortcut-row"><span class="shortcut-keys"><kbd>Esc</kbd></span><span class="shortcut-desc">Close search / Go back</span></div>
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
let sessionTimeRange=0;
let searchMode="title";
let contentSearchCache={};
let contentSearchResults={};
let contentSearchAbort=false;
const PAGE_SIZE=50;
let visibleCount=PAGE_SIZE;
let selectionMode=false;
let selectedIds=new Set();

const SUN_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
const MOON_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const EDIT_SVG='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/></svg>';
const TRASH_SVG='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
const STAR_FILLED='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const STAR_EMPTY='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

function initTheme(){
  const saved=localStorage.getItem("deveco-session-viewer-theme");
  if(saved==="light"){
    document.body.classList.add("light-theme");
    document.getElementById("themeIcon").outerHTML=MOON_SVG;
    document.querySelector(".theme-toggle svg").id="themeIcon";
  }
}

function toggleTheme(){
  const isLight=document.body.classList.toggle("light-theme");
  localStorage.setItem("deveco-session-viewer-theme",isLight?"light":"dark");
  const svg=isLight?MOON_SVG:SUN_SVG;
  document.getElementById("themeIcon").outerHTML=svg;
  document.querySelector(".theme-toggle svg").id="themeIcon";
  if(typeof renderStats==="function"&&document.getElementById("statsView").classList.contains("active")){
    renderStats();
  }
}

initTheme();

function setSearchMode(mode){
  searchMode=mode;
  document.querySelectorAll(".search-mode-btn").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.mode===mode);
  });
  document.getElementById("searchBox").placeholder=mode==="title"
    ?"Search sessions by keyword..."
    :"Search message content...";
  contentSearchCache={};
  contentSearchResults={};
  contentSearchAbort=true;
  document.getElementById("contentSearchProgress").style.display="none";
  clearTimeout(debounceTimer);
  debounceTimer=setTimeout(async()=>{
    try{await loadSessions()}catch(e){console.error(e)}
  },100);
}

function searchMessagesForSnippet(msgs,lowerQuery,originalQuery){
  if(!msgs||!msgs.length)return null;
  const sorted=[...msgs].sort((a,b)=>a.info.time.created-b.info.time.created);
  for(const m of sorted){
    if(!m.parts)continue;
    for(const p of m.parts){
      if(p.type!=="text"||!p.text)continue;
      const text=p.text;
      const idx=text.toLowerCase().indexOf(lowerQuery);
      if(idx===-1)continue;
      const CONTEXT=60;
      let start=Math.max(0,idx-CONTEXT);
      let end=Math.min(text.length,idx+originalQuery.length+CONTEXT);
      let snippetText="";
      if(start>0)snippetText+="...";
      snippetText+=text.slice(start,end);
      if(end<text.length)snippetText+="...";
      const escaped=esc(snippetText);
      const escapedLower=escaped.toLowerCase();
      const escIdx=escapedLower.indexOf(lowerQuery);
      if(escIdx>=0){
        const before=escaped.slice(0,escIdx);
        const match=escaped.slice(escIdx,escIdx+originalQuery.length);
        const after=escaped.slice(escIdx+originalQuery.length);
        return before+"<mark>"+match+"</mark>"+after;
      }
      return escaped;
    }
  }
  return null;
}

function getSessionCardSnippet(sessionId){
  if(searchMode!=="content"||!contentSearchResults[sessionId])return "";
  return '<div class="search-snippet">'+contentSearchResults[sessionId]+'</div>';
}

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

function setSessionTimeRange(days){
  if(sessionTimeRange===days){
    sessionTimeRange=0;
    document.querySelectorAll(".time-filter-btn").forEach(btn=>{
      btn.classList.remove("active");
    });
  }else{
    sessionTimeRange=days;
    document.querySelectorAll(".time-filter-btn").forEach(btn=>{
      btn.classList.toggle("active",parseInt(btn.dataset.range)===days);
    });
  }
  visibleCount=PAGE_SIZE;
  renderSessions(allSessions);
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
function fmtDuration(s){if(!s.time)return"";const ms=(s.time.updated||s.time.created)-(s.time.created||s.time.updated);const abs=Math.abs(ms);if(abs<6e4)return"";const m=Math.floor(abs/6e4);if(m<60)return m+"m";const h=Math.floor(m/60);if(h<24)return h+"h "+String(m%60).padStart(2,"0")+"m";const d=Math.floor(h/24);return d+"d "+String(h%24)+"h"}
function fmtMsgCount(s){const n=s.messageCount!=null?s.messageCount:s.messages;if(n==null||n===0)return"";return n+" msgs"}
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
  visibleCount=PAGE_SIZE;
  const q=document.getElementById("searchBox").value.trim();
  if(searchMode==="title"){
    document.getElementById("contentSearchProgress").style.display="none";
    const params=new URLSearchParams();
    if(q)params.set("search",q);
    params.set("limit","1000");
    const sessions=await api("/sessions?"+params.toString());
    allSessions=sessions;
    contentSearchResults={};
    renderSessions(allSessions);
  }else{
    contentSearchAbort=true;
    const params=new URLSearchParams();
    params.set("limit","200");
    const sessions=await api("/sessions?"+params.toString());
    allSessions=sessions;
    if(!q){
      contentSearchResults={};
      renderSessions(allSessions);
      document.getElementById("contentSearchProgress").style.display="none";
      return;
    }
    contentSearchAbort=false;
    await contentSearch(sessions,q);
  }
}

async function contentSearch(sessions,query){
  const progressEl=document.getElementById("contentSearchProgress");
  const progressFill=document.getElementById("progressFill");
  const progressText=document.getElementById("progressText");
  progressEl.style.display="flex";
  progressFill.style.width="0%";
  progressText.textContent="0/"+sessions.length;
  const lowerQuery=query.toLowerCase();
  contentSearchResults={};
  const matchedIds=[];
  const BATCH=10;
  let completed=0;
  for(let i=0;i<sessions.length;i+=BATCH){
    if(contentSearchAbort)return;
    const batch=sessions.slice(i,i+BATCH);
    const results=await Promise.all(batch.map(async(s)=>{
      try{
        let msgs;
        if(contentSearchCache[s.id]){msgs=contentSearchCache[s.id];}
        else{msgs=await api("/sessions/"+s.id+"/messages?limit=500");contentSearchCache[s.id]=msgs;}
        return {id:s.id,msgs};
      }catch(e){return {id:s.id,msgs:[]};}
    }));
    if(contentSearchAbort)return;
    results.forEach(({id,msgs})=>{
      const snippet=searchMessagesForSnippet(msgs,lowerQuery,query);
      if(snippet){matchedIds.push(id);contentSearchResults[id]=snippet;}
    });
    completed+=batch.length;
    const pct=Math.round((completed/sessions.length)*100);
    progressFill.style.width=pct+"%";
    progressText.textContent=completed+"/"+sessions.length+" ("+matchedIds.length+" matches)";
  }
  progressFill.style.width="100%";
  progressText.textContent=matchedIds.length+" matches found";
  setTimeout(()=>{progressEl.style.display="none"},1500);
  renderSessions(allSessions);
}

async function refreshSessionList(evt){
  const btn=evt?.currentTarget;
  if(btn)btn.classList.add("spinning");
  contentSearchCache={};
  contentSearchResults={};
  contentSearchAbort=true;
  try{
    await loadSessions();
  }catch(e){
    console.error("Failed to refresh sessions:",e);
  }finally{
    setTimeout(()=>{if(btn)btn.classList.remove("spinning")},400);
  }
}

async function refreshSessionDetail(evt){
  if(!currentSession)return;
  const btn=evt?.currentTarget;
  if(btn)btn.classList.add("spinning");
  try{
    const msgs=await api("/sessions/"+currentSession.id+"/messages?limit=1000");
    currentMessages=msgs;
    allMessages=msgs;
    renderDetail(currentSession,msgs);
  }catch(e){
    console.error("Failed to refresh messages:",e);
  }finally{
    setTimeout(()=>{if(btn)btn.classList.remove("spinning")},400);
  }
}

function renderSessions(list){
  const c=document.getElementById("sessionList");
  selectedSessionIndex=-1;
  if(!list||!list.length){c.innerHTML='<div class="empty">No sessions found<div class="empty-hint">Try adjusting your filters or search query</div></div>';updateModelDropdown([]);return}
  
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
  if(sessionTimeRange>0){
    let cutoff;
    if(sessionTimeRange===1){
      const today=new Date();
      today.setHours(0,0,0,0);
      cutoff=today.getTime();
    }else{
      cutoff=Date.now()-sessionTimeRange*864e5;
    }
    filtered=filtered.filter(s=>{
      const ts=Math.max(s.time.created||0,s.time.updated||0);
      return ts>=cutoff;
    });
  }
  if(searchMode==="content"&&document.getElementById("searchBox").value.trim()){
    filtered=filtered.filter(s=>contentSearchResults[s.id]);
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

  const totalFiltered=sorted.length;
  const paged=sorted.slice(0,visibleCount);
  const hasMore=visibleCount<totalFiltered;

  if(sortField==="time"){
    const groups={};
    const groupOrder=["Today","Yesterday","This Week","This Month","Older"];
    paged.forEach(s=>{
      const ts=s.time.updated||s.time.created;
      const group=getTimeGroup(ts);
      if(!groups[group])groups[group]=[];
      groups[group].push(s);
    });
    let html="";
    let cardIdx=0;
    groupOrder.forEach(groupName=>{
      const items=groups[groupName];
      if(!items||!items.length)return;
      html+='<div class="time-group-header">'+groupName+'</div>';
      html+=items.map(s=>{
        const favClass=isFavorite(s.id)?"active":"";
        const favIcon=isFavorite(s.id)?STAR_FILLED:STAR_EMPTY;
        const delay=cardIdx*25;
        cardIdx++;
        return '<div class="session-card'+(selectionMode?' show-cb':'')+(selectedIds.has(s.id)?' card-selected':'')+ '" data-sid="'+s.id+'" style="animation-delay:'+delay+'ms" onclick="'+(selectionMode?'event.stopPropagation();toggleSelect(\\''+s.id+'\\')':'showDetail(\\''+s.id+'\\')')+'"><input type="checkbox" class="select-cb card-cb" data-id="'+s.id+'" '+(selectedIds.has(s.id)?'checked':'')+' onclick="event.stopPropagation();toggleSelect(\\''+s.id+'\\')"><div class="session-card-actions"><button class="favorite-btn '+favClass+'" onclick="event.stopPropagation();toggleFavorite(\\''+s.id+'\\')">'+favIcon+'</button><button class="card-action-btn" onclick="event.stopPropagation();openRename(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Rename">'+EDIT_SVG+'</button><button class="card-action-btn danger" onclick="event.stopPropagation();openDelete(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Delete">'+TRASH_SVG+'</button></div><div class="session-title">'+esc(s.title||"Untitled")+'</div><div class="session-meta"><span class="session-time">'+fmtTime(s.time.updated)+'</span>'+(fmtMsgCount(s)?'<span class="badge badge-messages">'+fmtMsgCount(s)+'</span>':'')+(fmtDuration(s)?'<span class="badge badge-duration">'+fmtDuration(s)+'</span>':'')+(s.tokens?'<span class="badge badge-tokens">'+fmtTok(s.tokens)+'</span>':'')+(s.cost?'<span class="badge badge-cost">'+fmtCost(s.cost)+'</span>':'')+(s.model&&s.model.id?'<span class="badge badge-model">'+esc(s.model.id)+'</span>':'')+'</div>'+getSessionCardSnippet(s.id)+'</div>';
      }).join("");
    });
    c.innerHTML=html;
  }else{
    c.innerHTML=paged.map((s,idx)=>{
      const favClass=isFavorite(s.id)?"active":"";
      const favIcon=isFavorite(s.id)?STAR_FILLED:STAR_EMPTY;
      return '<div class="session-card'+(selectionMode?' show-cb':'')+(selectedIds.has(s.id)?' card-selected':'')+ '" data-sid="'+s.id+'" style="animation-delay:'+idx*25+'ms" onclick="'+(selectionMode?'event.stopPropagation();toggleSelect(\\''+s.id+'\\')':'showDetail(\\''+s.id+'\\')')+'"><input type="checkbox" class="select-cb card-cb" data-id="'+s.id+'" '+(selectedIds.has(s.id)?'checked':'')+' onclick="event.stopPropagation();toggleSelect(\\''+s.id+'\\')"><div class="session-card-actions"><button class="favorite-btn '+favClass+'" onclick="event.stopPropagation();toggleFavorite(\\''+s.id+'\\')">'+favIcon+'</button><button class="card-action-btn" onclick="event.stopPropagation();openRename(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Rename">'+EDIT_SVG+'</button><button class="card-action-btn danger" onclick="event.stopPropagation();openDelete(\\''+s.id+'\\',\\''+esc(s.title||"Untitled").replace(/'/g,"\\\\'")+'\\')" title="Delete">'+TRASH_SVG+'</button></div><div class="session-title">'+esc(s.title||"Untitled")+'</div><div class="session-meta"><span class="session-time">'+fmtTime(s.time.updated)+'</span>'+(fmtMsgCount(s)?'<span class="badge badge-messages">'+fmtMsgCount(s)+'</span>':'')+(fmtDuration(s)?'<span class="badge badge-duration">'+fmtDuration(s)+'</span>':'')+(s.tokens?'<span class="badge badge-tokens">'+fmtTok(s.tokens)+'</span>':'')+(s.cost?'<span class="badge badge-cost">'+fmtCost(s.cost)+'</span>':'')+(s.model&&s.model.id?'<span class="badge badge-model">'+esc(s.model.id)+'</span>':'')+'</div>'+getSessionCardSnippet(s.id)+'</div>';
    }).join("");
  }
  if(hasMore){
    c.innerHTML+='<div class="load-more-row"><span class="load-more-text">Showing '+paged.length+' of '+totalFiltered+' sessions</span><button class="load-more-btn" onclick="loadMore()">Load more</button></div>';
  }else if(totalFiltered>PAGE_SIZE){
    c.innerHTML+='<div class="load-more-row"><span class="load-more-text">All '+totalFiltered+' sessions loaded</span></div>';
  }
}

function loadMore(){
  visibleCount+=PAGE_SIZE;
  renderSessions(allSessions);
}

function toggleSelectionMode(){
  selectionMode=!selectionMode;
  if(!selectionMode)selectedIds.clear();
  document.getElementById("selectBtn").classList.toggle("active",selectionMode);
  document.getElementById("selectAllBtn").style.display=selectionMode?"inline-flex":"none";
  document.getElementById("deselectAllBtn").style.display=selectionMode?"inline-flex":"none";
  updateSelectionUI();
  renderSessions(allSessions);
}

function toggleSelect(id){
  if(selectedIds.has(id))selectedIds.delete(id);
  else selectedIds.add(id);
  updateSelectionUI();
  const cb=document.querySelector('.select-cb[data-id="'+id+'"]');
  if(cb)cb.checked=selectedIds.has(id);
  const card=document.querySelector('.session-card[data-sid="'+id+'"]');
  if(card)card.classList.toggle("card-selected",selectedIds.has(id));
}

function selectAll(){
  document.querySelectorAll(".select-cb").forEach(cb=>{
    selectedIds.add(cb.dataset.id);
    cb.checked=true;
  });
  document.querySelectorAll(".session-card[data-sid]").forEach(c=>c.classList.add("card-selected"));
  updateSelectionUI();
}

function deselectAll(){
  selectedIds.clear();
  document.querySelectorAll(".select-cb").forEach(cb=>{cb.checked=false});
  document.querySelectorAll(".session-card[data-sid]").forEach(c=>c.classList.remove("card-selected"));
  updateSelectionUI();
}

function updateSelectionUI(){
  const bar=document.getElementById("bulkActionBar");
  const count=selectedIds.size;
  if(!selectionMode){bar.style.display="none";return}
  bar.style.display="flex";
  document.getElementById("bulkCount").textContent=count+" selected";
  document.getElementById("bulkDeleteBtn").disabled=count===0;
  document.getElementById("bulkExportBtn").disabled=count===0;
}

async function bulkDelete(){
  const count=selectedIds.size;
  if(!count)return;
  if(!confirm("Delete "+count+" sessions? This cannot be undone."))return;
  const ids=[...selectedIds];
  for(const id of ids){
    try{await fetch(API+"/sessions/"+id,{method:"DELETE"})}catch(e){console.error(e)}
  }
  selectedIds.clear();
  selectionMode=false;
  updateSelectionUI();
  await loadSessions();
}

function bulkExport(){
  const ids=[...selectedIds];
  if(!ids.length)return;
  const sessions=allSessions.filter(s=>ids.includes(s.id));
  const data=sessions.map(s=>({
    id:s.id,title:s.title||"Untitled",
    created:new Date(s.time.created).toISOString(),
    model:s.model&&s.model.id?s.model.id:null,
    tokens:s.tokens||null,cost:s.cost||null
  }));
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="sessions_export_"+ids.length+".json";
  a.click();
  URL.revokeObjectURL(a.href);
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
  
  let duration='';
  if(msgs&&msgs.length>0){
    const sorted=[...msgs].sort((a,b)=>a.info.time.created-b.info.time.created);
    const firstUser=sorted.find(m=>m.info.role==='user');
    const lastAssistant=[...sorted].reverse().find(m=>m.info.role==='assistant');
    if(firstUser&&lastAssistant){
      const durationMs=lastAssistant.info.time.created-firstUser.info.time.created;
      const seconds=Math.floor(durationMs/1000);
      const minutes=Math.floor(seconds/60);
      const hours=Math.floor(minutes/60);
      if(hours>0){
        duration=hours+'h '+String(minutes%60).padStart(2,'0')+'m';
      }else if(minutes>0){
        duration=minutes+'m '+String(seconds%60).padStart(2,'0')+'s';
      }else{
        duration=seconds+'s';
      }
    }
  }
  
  document.getElementById("detailMeta").innerHTML='<span>Created: '+new Date(session.time.created).toLocaleString()+'</span>'+(session.time.updated?'<span>Updated: '+new Date(session.time.updated).toLocaleString()+'</span>':'')+(duration?'<span>Duration: '+duration+'</span>':'')+(session.model&&session.model.id?'<span>Model: '+esc(session.model.id)+'</span>':'')+(session.tokens?'<span>'+fmtTok(session.tokens)+'</span>':'')+(session.cost?'<span>'+fmtCost(session.cost)+'</span>':'');
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
function showShortcuts(){
  document.getElementById("shortcutsModal").classList.add("active");
}
function closeShortcuts(){
  document.getElementById("shortcutsModal").classList.remove("active");
}
document.getElementById("shortcutsModal").addEventListener("click",e=>{
  if(e.target===document.getElementById("shortcutsModal"))closeShortcuts();
});
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
  if(e.key==="Escape"&&document.getElementById("shortcutsModal").classList.contains("active")){
    closeShortcuts();
  }
  const activeEl=document.activeElement;
  const isInput=activeEl&&(activeEl.tagName==="INPUT"||activeEl.tagName==="TEXTAREA");
  if(e.key==="?"&&!isInput&&!document.getElementById("renameModal").classList.contains("active")&&!document.getElementById("deleteModal").classList.contains("active")){
    e.preventDefault();
    if(document.getElementById("shortcutsModal").classList.contains("active")){closeShortcuts();}
    else{showShortcuts();}
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
  document.getElementById("findBar").classList.remove("visible");
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
  const findBar=document.getElementById("findBar");
  if((e.ctrlKey||e.metaKey)&&e.key==="f"){
    e.preventDefault();
    findBar.classList.add("visible");
    document.getElementById("findInput").focus();
    document.getElementById("findInput").select();
  }
  if(e.key==="Escape"){
    if(findBar.classList.contains("visible")){
      e.preventDefault();
      findBar.classList.remove("visible");
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

let _scrollLoadPending=false;
window.addEventListener("scroll",()=>{
  if(_scrollLoadPending)return;
  const detailActive=document.getElementById("detailView").classList.contains("active");
  if(detailActive)return;
  const loadMoreBtn=document.querySelector(".load-more-btn");
  if(!loadMoreBtn)return;
  const rect=loadMoreBtn.getBoundingClientRect();
  if(rect.top<window.innerHeight+200){
    _scrollLoadPending=true;
    loadMore();
    setTimeout(()=>{_scrollLoadPending=false},300);
  }
});

function showList(){
  const detailView=document.getElementById("detailView");
  const listView=document.getElementById("listView");
  detailView.style.opacity="0";
  detailView.style.transform="translateY(4px)";
  setTimeout(()=>{
    detailView.classList.remove("active");
    detailView.style.opacity="";
    detailView.style.transform="";
    listView.classList.remove("hidden");
    listView.style.opacity="0";
    listView.style.transform="translateY(-4px)";
    requestAnimationFrame(()=>{
      listView.style.opacity="1";
      listView.style.transform="translateY(0)";
    });
    document.getElementById("findBar").classList.remove("visible");
    clearFind();
    selectedSessionIndex=-1;
    updateSelectedSession();
  },200);
}

async function showDetail(id){
  try{
    const listView=document.getElementById("listView");
    listView.classList.add("fade-out");
    const session=await api("/sessions/"+id);
    const msgs=await api("/sessions/"+id+"/messages?limit=1000");
    currentSession=session;
    allMessages=msgs;
    setTimeout(()=>{
      listView.classList.add("hidden");
      listView.classList.remove("fade-out");
      const detailView=document.getElementById("detailView");
      detailView.style.opacity="0";
      detailView.style.transform="translateY(4px)";
      detailView.classList.add("active");
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          detailView.style.opacity="1";
          detailView.style.transform="translateY(0)";
        });
      });
      const ml=document.getElementById("messageList");
      ml.classList.toggle("clean-mode",cleanMode);
      renderDetail(session,allMessages);
      window.scrollTo({top:0,behavior:"smooth"});
    },200);
  }catch(e){alert("Load failed: "+e.message);document.getElementById("listView").classList.remove("fade-out")}
}

document.getElementById("searchBox").addEventListener("input",e=>{
  clearTimeout(debounceTimer);
  contentSearchAbort=true;
  const delay=searchMode==="content"?500:300;
  debounceTimer=setTimeout(async()=>{
    try{await loadSessions()}catch(e){console.error(e)}
  },delay);
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
let tokenTrendChart=null;

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

const chartColors=["#818cf8","#4ade80","#facc15","#fb7185","#c084fc","#a5b4fc","#86efac","#fde68a"];

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
  const tokens=dates.map(d=>stats.dailyMap[d].tokens);
  if(tokenTrendChart)tokenTrendChart.destroy();
  tokenTrendChart=new Chart(document.getElementById("tokenTrendChart"),{type:"line",data:{labels:dates,datasets:[{label:"Tokens",data:tokens,borderColor:colors.purple,backgroundColor:colors.purple+"1a",fill:true,tension:.3,pointRadius:3,pointBackgroundColor:colors.purple}]},options:{...chartOpts,plugins:{...chartOpts.plugins,legend:{display:false}},scales:{...chartOpts.scales,y:{...chartOpts.scales.y,ticks:{...chartOpts.scales.y.ticks,callback:v=>v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(1)+"k":v}}}}});
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
  // Safely extract port from options, handling all edge cases
  let finalPort = DEFAULT_PORT
  if (options && typeof options === "object" && "port" in options) {
    const portOption = options.port
    if (typeof portOption === "string") {
      const parsed = parseInt(portOption, 10)
      if (Number.isFinite(parsed) && parsed > 0) {
        finalPort = parsed
      }
    } else if (typeof portOption === "number" && Number.isFinite(portOption) && portOption > 0) {
      finalPort = portOption
    }
  }
  
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
          serverPort: finalPort
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

  httpServer.listen(finalPort, () => {
    console.log(`[session-history] Web UI: http://localhost:${finalPort}`)
  })

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.log(`[session-history] Port ${finalPort} already in use, skipping plugin startup`)
      return
    }
    console.error(`[session-history] Server error:`, err.message)
  })

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
