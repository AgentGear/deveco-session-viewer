import http from "node:http"
import type { PluginModule } from "./types.js"

const DEFAULT_PORT = 9876

function getWebUI(port: number): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevEco Session History</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f1117;color:#c9d1d9}
.container{max-width:1200px;margin:0 auto;padding:24px}
h1{color:#58a6ff;margin-bottom:24px;font-size:24px;display:flex;align-items:center;gap:10px}
.search-box{width:100%;padding:10px 16px;background:#161b22;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:14px;margin-bottom:20px;outline:none}
.search-box:focus{border-color:#58a6ff}
.search-box::placeholder{color:#484f58}
.session-list{display:flex;flex-direction:column;gap:8px}
.session-card{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:14px 16px;cursor:pointer;transition:border-color .15s}
.session-card:hover{border-color:#58a6ff}
.session-title{font-size:15px;font-weight:600;color:#e6edf3;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.session-meta{display:flex;gap:12px;font-size:12px;color:#7d8590;flex-wrap:wrap}
.badge{background:#21262d;padding:2px 8px;border-radius:10px;font-size:11px;color:#7d8590}
.detail-view{display:none}
.detail-view.active{display:block}
.list-view.hidden{display:none}
.sticky-header{position:sticky;top:0;z-index:10;background:#0f1117}
.sticky-toolbar{padding:12px 0;display:flex;align-items:center;gap:10px}
.detail-title{font-size:18px;color:#e6edf3;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.detail-meta{display:flex;gap:16px;font-size:12px;color:#7d8590;flex-wrap:wrap;padding:8px 0 12px;border-bottom:1px solid #21262d;margin-bottom:20px}
.back-btn{background:#21262d;border:1px solid #30363d;color:#58a6ff;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px}
.back-btn:hover{background:#30363d}
.message-list{display:flex;flex-direction:column;gap:12px}
.message{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:14px 16px}
.message.user{border-left:3px solid #58a6ff}
.message.assistant{border-left:3px solid #3fb950}
.message-header{display:flex;justify-content:space-between;margin-bottom:10px;font-size:12px;color:#7d8590}
.message-role{font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.message.user .message-role{color:#58a6ff}
.message.assistant .message-role{color:#3fb950}
.message-content{font-size:14px;line-height:1.7;word-wrap:break-word}
.message-content p{margin-bottom:8px}
.message-content p:last-child{margin-bottom:0}
.message-content code{background:#21262d;padding:2px 6px;border-radius:3px;font-family:"Cascadia Code","Fira Code",monospace;font-size:12px}
.message-content pre{background:#0d1117;border:1px solid #21262d;padding:12px;border-radius:6px;overflow-x:auto;margin:8px 0}
.message-content pre code{background:none;padding:0;font-size:12px;line-height:1.5}
.message-content strong{color:#e6edf3}
.message-content em{color:#d2a8ff}
.message-content h2,.message-content h3,.message-content h4{color:#e6edf3;margin:12px 0 6px}
.message-content ul,.message-content ol{padding-left:20px;margin:6px 0}
.tool-call{background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:10px 12px;margin:8px 0;font-size:13px}
.tool-name{color:#d29922;font-weight:600;margin-bottom:4px}
.tool-status{font-size:11px;color:#7d8590}
.tool-output{margin-top:6px;padding-top:6px;border-top:1px solid #21262d;font-family:monospace;font-size:11px;color:#7d8590;max-height:120px;overflow:hidden}
.reasoning{color:#7d8590;font-style:italic;padding:6px 12px;border-left:2px solid #30363d;margin:6px 0;font-size:13px}
.step-divider{text-align:center;color:#484f58;font-size:11px;margin:8px 0;position:relative}
.step-divider::before,.step-divider::after{content:"";position:absolute;top:50%;width:30%;height:1px;background:#21262d}
.step-divider::before{left:0}
.step-divider::after{right:0}
.toolbar{display:flex;gap:10px;align-items:center}
.toggle-btn{display:flex;align-items:center;gap:6px;background:#21262d;border:1px solid #30363d;color:#7d8590;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;transition:all .15s;user-select:none}
.toggle-btn:hover{background:#30363d;color:#c9d1d9}
.toggle-btn.active{background:#1f3a2a;border-color:#3fb950;color:#3fb950}
.toggle-btn .dot{width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.5}
.toggle-btn.active .dot{opacity:1}
.message-list.clean-mode .part-reasoning,
.message-list.clean-mode .part-tool,
.message-list.clean-mode .part-step,
.message-list.clean-mode .part-agent,
.message-list.clean-mode .part-retry,
.message-list.clean-mode .part-file{display:none}
.message-list.clean-mode .message.assistant.intermediate{display:none}
.loading{text-align:center;padding:40px;color:#484f58}
.empty{text-align:center;padding:60px;color:#484f58;font-size:14px}
.error{background:#1c1007;border:1px solid #9e6a03;border-radius:6px;padding:14px;color:#d29922;font-size:13px}
.status-bar{font-size:11px;color:#484f58;margin-bottom:16px;padding:8px 12px;background:#161b22;border:1px solid #21262d;border-radius:6px}
</style>
</head>
<body>
<div class="container">
  <h1>DevEco Session History</h1>
  <div class="status-bar" id="statusBar">Connecting...</div>
  <div class="list-view" id="listView">
    <input type="text" class="search-box" id="searchBox" placeholder="Search sessions..." />
    <div class="session-list" id="sessionList"><div class="loading">Loading...</div></div>
  </div>
  <div class="detail-view" id="detailView">
    <div class="sticky-header">
      <div class="sticky-toolbar">
        <div class="detail-title" id="detailTitle"></div>
        <div style="flex:1"></div>
        <button class="toggle-btn" id="cleanToggle" onclick="toggleClean()"><span class="dot"></span>Clean Mode</button>
        <button class="back-btn" onclick="showList()">&#8592; Back</button>
      </div>
      <div class="detail-meta" id="detailMeta"></div>
    </div>
    <div class="message-list" id="messageList"></div>
  </div>
</div>
<script>
const API="/api";
let debounceTimer;
let cleanMode=false;
let currentMessages=null;
let currentSession=null;

async function api(path){const r=await fetch(API+path);if(!r.ok)throw new Error(r.statusText);return r.json()}

function fmtTime(ts){const d=new Date(ts),n=Date.now(),s=n-d,m=Math.floor(s/6e4),h=Math.floor(s/36e5),dy=Math.floor(s/864e5);if(m<1)return"just now";if(m<60)return m+"m ago";if(h<24)return h+"h ago";if(dy<7)return dy+"d ago";return d.toLocaleDateString()}
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

function renderSessions(list){
  const c=document.getElementById("sessionList");
  if(!list||!list.length){c.innerHTML='<div class="empty">No sessions found</div>';return}
  c.innerHTML=list.map(s=>'<div class="session-card" onclick="showDetail(\\''+s.id+'\\')"><div class="session-title">'+esc(s.title||"Untitled")+'</div><div class="session-meta"><span>'+fmtTime(s.time.updated)+'</span>'+(s.tokens?'<span class="badge">'+fmtTok(s.tokens)+'</span>':'')+(s.cost?'<span class="badge">'+fmtCost(s.cost)+'</span>':'')+(s.model&&s.model.id?'<span class="badge">'+esc(s.model.id)+'</span>':'')+'</div></div>').join("");
}

function renderDetail(session,msgs){
  document.getElementById("detailTitle").textContent=session.title||"Untitled";
  document.getElementById("detailMeta").innerHTML='<span>Created: '+new Date(session.time.created).toLocaleString()+'</span>'+(session.model&&session.model.id?'<span>Model: '+esc(session.model.id)+'</span>':'')+(session.tokens?'<span>'+fmtTok(session.tokens)+'</span>':'')+(session.cost?'<span>'+fmtCost(session.cost)+'</span>':'');
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
  ml.innerHTML=sorted.map((m,i)=>{
    const u=m.info.role==="user";
    const t=new Date(m.info.time.created).toLocaleTimeString();
    const parts=(m.parts||[]).map(renderPart).join("");
    const cls="message "+(u?"user":"assistant")+(u?"":(lastAssistantPerTurn.has(i)?"":" intermediate"));
    return '<div class="'+cls+'"><div class="message-header"><span class="message-role">'+(u?"User":"Assistant")+'</span><span>'+t+'</span></div>'+parts+'</div>';
  }).join("");
  ml.classList.toggle("clean-mode",cleanMode);
}

function toggleClean(){
  cleanMode=!cleanMode;
  const btn=document.getElementById("cleanToggle");
  const ml=document.getElementById("messageList");
  btn.classList.toggle("active",cleanMode);
  ml.classList.toggle("clean-mode",cleanMode);
}

function showList(){
  document.getElementById("listView").classList.remove("hidden");
  document.getElementById("detailView").classList.remove("active");
}

async function showDetail(id){
  try{
    const [session,msgs]=await Promise.all([api("/sessions/"+id),api("/sessions/"+id+"/messages")]);
    currentSession=session;
    currentMessages=msgs;
    document.getElementById("listView").classList.add("hidden");
    document.getElementById("detailView").classList.add("active");
    const ml=document.getElementById("messageList");
    ml.classList.toggle("clean-mode",cleanMode);
    renderDetail(session,msgs);
  }catch(e){alert("Load failed: "+e.message)}
}

document.getElementById("searchBox").addEventListener("input",e=>{
  clearTimeout(debounceTimer);
  debounceTimer=setTimeout(async()=>{
    try{renderSessions(await api("/sessions?search="+encodeURIComponent(e.target.value.trim())))}catch(e){console.error(e)}
  },300);
});

(async()=>{
  try{
    const info=await api("/info");
    document.getElementById("statusBar").textContent="Connected to "+esc(info.directory)+" ("+esc(info.projectId)+")";
    renderSessions(await api("/sessions"));
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
            const q=document.getElementById("searchBox").value.trim();
            renderSessions(await api("/sessions"+(q?"?search="+encodeURIComponent(q):"")));
          }catch(e){console.error(e)}
        },500);
      }
      if(currentSession&&(t.startsWith("message.")||t.startsWith("session.next."))){
        clearTimeout(window._msgTimer);
        window._msgTimer=setTimeout(async()=>{
          try{
            const msgs=await api("/sessions/"+currentSession.id+"/messages");
            currentMessages=msgs;
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
</script>
</body>
</html>`
}

const server: PluginModule["server"] = async (input, options) => {
  const port = (options?.port as number) || DEFAULT_PORT
  const directory = input.directory
  const client = input.client
  const sseClients = new Set<http.ServerResponse>()

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${port}`)
    const pathname = url.pathname

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    try {
      if (pathname === "/" || pathname === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
        res.end(getWebUI(port))
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
        res.end(JSON.stringify({ directory, projectId: input.project.id }))
        return
      }

      if (pathname === "/api/sessions") {
        const search = url.searchParams.get("search") || undefined
        const result = await (client.session as any).list({
          query: { search, limit: 100, roots: true },
        })
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(result.data || []))
        return
      }

      const sessionMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/)
      if (sessionMatch) {
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

  httpServer.listen(port, () => {
    console.log(`[session-history] Web UI: http://localhost:${port}`)
  })

  httpServer.on("error", (err) => {
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
