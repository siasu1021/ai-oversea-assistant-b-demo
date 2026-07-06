const app = document.querySelector("#app");

const sources = [
  "WWD - 2026 Fashion Trends to Watch",
  "Business of Fashion - The State of Fashion 2026",
  "McKinsey & Company - Fashion Report",
  "Vogue Business",
  "Euromonitor International",
  "Statista - Fashion Market Outlook",
  "Deloitte Consumer Signals",
  "NielsenIQ Global Beauty",
  "eMarketer Cross-border Retail",
  "OECD Trade Policy Monitor",
  "Singapore Enterprise Guide",
  "Google SEA e-Conomy Report",
];

const state = {
  screen: "loading",
  currentView: { type: "loading", failed: false },
  hasUserInteracted: false,
  sourceOpen: false,
  input: "",
  inputMode: "single",
  generated: false,
  streamId: 0,
};

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function renderCurrentView() {
  const view = state.currentView || { type: "home" };
  if (view.type === "chat") {
    renderChat(view.mode);
    return;
  }
  if (view.type === "loading") {
    renderLoading(view.failed);
    return;
  }
  renderHome();
}

function statusBar() {
  return `
    <div class="status-bar">
      <div>9:41</div>
      <div class="status-icons" aria-hidden="true">
        <span class="signal"><i></i><i></i><i></i><i></i></span>
        <span class="wifi"><i></i></span>
        <span class="battery"></span>
      </div>
    </div>
  `;
}

function homeHeader() {
  return `<header class="home-header">AI 出海助手</header>`;
}

function chatHeader(title = "欧美时尚市场趋势") {
  return `
    <header class="chat-header">
      <div>
        <strong>${title}</strong>
        <span>AI 出海助手 · 企业版</span>
      </div>
    </header>
  `;
}

function bottomArea({ value = "", placeholder = "继续追问…", active = false, stop = false, multiline = false, counter = false } = {}) {
  const text = value || "";
  const disabled = !active && !stop;
  const modeClass = multiline ? " multiline" : "";
  return `
    <div class="bottom-area">
      <div class="input-bar">
        <div class="input-pill${modeClass}">
          <textarea class="input-text" rows="${multiline ? 6 : 1}" maxlength="500" placeholder="${placeholder}">${escapeHtml(text)}</textarea>
          ${counter ? `<span class="counter">500/500</span>` : ""}
          <button type="button" class="send-button ${disabled ? "disabled" : ""} ${stop ? "stop" : ""}" data-action="${stop ? "stop" : "send"}" aria-label="${stop ? "停止生成" : "发送"}">
            ${stop ? "" : sendIcon()}
          </button>
        </div>
      </div>
      <div class="disclaimer">内容由 AI 生成，仅供参考</div>
      <div class="home-indicator"></div>
    </div>
  `;
}

function sendIcon() {
  return `
    <svg class="send-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5"></path>
      <path d="M5 12l7-7 7 7"></path>
    </svg>
  `;
}

function homeIndicatorOnly() {
  return `<div class="home-indicator"></div>`;
}

function lightOrb() {
  return `
    <div class="light-orb" aria-hidden="true">
      <span class="orb-glow"></span>
      <span class="orb-sphere"></span>
      <span class="orb-highlight"></span>
      <span class="orb-eye-left"></span>
      <span class="orb-eye-wink"></span>
      <span class="orb-spark"></span>
      <span class="orb-spark-sm"></span>
    </div>
  `;
}

function stateOrb(failed = false) {
  return `
    <div class="state-orb ${failed ? "state-orb-failed" : "state-orb-loading"}" aria-hidden="true">
      <img src="${failed ? "assets/loading-failed.png" : "assets/loading.png"}" alt="" />
    </div>
  `;
}

function loadingDots() {
  return `<div class="loading-dots" aria-label="加载中"><i></i><i></i><i></i></div>`;
}

function typingIndicator() {
  return `<div class="typing-indicator" aria-label="正在生成"><i></i><i></i><i></i></div>`;
}

function renderHome() {
  state.currentView = { type: "home" };
  app.innerHTML = `
    <section class="screen">
      ${statusBar()}
      ${homeHeader()}
      <main class="home-main">
        <section class="hero fade-in">
          ${lightOrb()}
          <h2>嗨，今天想聊点什么？</h2>
          <p>市场洞察 · 政策解读 · 品牌全球化</p>
        </section>
        ${homeSuggestions()}
      </main>
      ${bottomArea({ placeholder: "尽管问，出海的事都懂…", active: false })}
    </section>
  `;
}

function homeSuggestions() {
  return `
    <section class="suggestions fade-in">
      <button type="button" class="suggestion-chip" data-question="2026 年欧美时尚消费市场的核心趋势有哪些？">2026 年欧美时尚消费市场核心趋势？</button>
      <button type="button" class="suggestion-chip" data-question="美妆品牌出海东南亚的机会与风险">美妆品牌出海东南亚的机会与风险</button>
      <button type="button" class="suggestion-chip" data-question="解读最新跨境电商出海扶持政策">解读最新跨境电商出海扶持政策</button>
    </section>
  `;
}

function renderLoading(failed = false) {
  state.currentView = { type: "loading", failed };
  app.innerHTML = `
    <section class="screen">
      ${statusBar()}
      <main class="init-state">
        ${stateOrb(failed)}
        ${failed ? `<p>页面加载失败，请检查网络后重试</p><button type="button" class="primary-button" data-action="reload">重新加载</button>` : `${loadingDots()}<p>正在加载 AI 出海助手...</p>`}
      </main>
      ${homeIndicatorOnly()}
    </section>
  `;
}

function userMessage(text, options = {}) {
  const failed = options.failed ? `<span class="failed-icon">!</span>` : "";
  const spinner = options.sending ? `<span class="sending-spinner" aria-label="发送中"></span>` : "";
  return `
    <div>
      <div class="user-message fade-in">
        ${failed || spinner}
        <div class="user-bubble">${escapeHtml(text)}</div>
      </div>
      ${options.failed ? `<div class="retry-hint">⚠ 未发送成功，轻点重试</div>` : ""}
    </div>
  `;
}

function searchStatus() {
  return `
    <div class="search-status fade-in">
      <span class="spark-icon" aria-hidden="true"></span>
      <span>已检索 28 个海外权威来源</span>
    </div>
  `;
}

function answerShort() {
  return `
    <article class="answer fade-in">
      <p>2026 年欧美时尚消费市场呈现以下三个核心趋势：</p>
      <section class="section">
        <h3 class="section-title">1. 可持续时尚持续升温</h3>
        <p>消费者对环保与可持续的关注度不断提高，品牌更加注重使用环保材料、减少碳排放，供应链透明度成为核心竞争力。</p>
      </section>
      <section class="section">
        <h3 class="section-title">2. AI 深度融入设计与营销</h3>
        <p>AI 技术深度融入时尚产业，从趋势预测、智能设计到个性化推荐，全面提升品牌运营与购物体验。</p>
      </section>
      <section class="section">
        <h3 class="section-title">3. 个性化与小众品牌崛起</h3>
        <p>消费者更追求独特的表达方式，小众品牌、限量款与定制化产品受到更多关注。</p>
      </section>
      <div class="answer-divider"></div>
      ${sourceTags()}
    </article>
  `;
}

function answerShortBlocks() {
  return [
    `<p>2026 年欧美时尚消费市场呈现以下三个核心趋势：</p>`,
    `<section class="section">
        <h3 class="section-title">1. 可持续时尚持续升温</h3>
        <p>消费者对环保与可持续的关注度不断提高，品牌更加注重使用环保材料、减少碳排放，供应链透明度成为核心竞争力。</p>
      </section>`,
    `<section class="section">
        <h3 class="section-title">2. AI 深度融入设计与营销</h3>
        <p>AI 技术深度融入时尚产业，从趋势预测、智能设计到个性化推荐，全面提升品牌运营与购物体验。</p>
      </section>`,
    `<section class="section">
        <h3 class="section-title">3. 个性化与小众品牌崛起</h3>
        <p>消费者更追求独特的表达方式，小众品牌、限量款与定制化产品受到更多关注。</p>
      </section>`,
    `<div class="answer-divider"></div>${sourceTags()}`,
  ];
}

function longReportBlocks() {
  return [
    sourcesPanel(false),
    `<h1>东南亚市场进入分析报告</h1>
      <p>综合政策、平台生态与物流基建来看，2026 年东南亚仍是中国品牌出海的重要增量市场，但进入策略需要从“铺渠道”转向“本地化经营”。</p>
    `,
    `<h2>一、结论摘要</h2>
      <p>建议采用“新加坡做合规样板、印尼做规模增长、越南做成本效率”的三阶段进入策略。短期优先选择内容转化快、履约复杂度可控的美妆个护、时尚配饰与轻智能硬件。</p>`,
    `<h2>二、优先机会</h2>
      <ul>
        <li><strong>美妆个护：</strong>内容种草效率高，达人合作与短视频平台能快速验证需求，但需关注成分备案、清真认证与广告合规。</li>
        <li><strong>时尚配饰：</strong>价格带弹性较大，适合通过 TikTok Shop 与 Shopee 做快速测试，重点控制退换货与尺码体验。</li>
        <li><strong>智能小家电：</strong>客单价较高，适合建立品牌心智，但需提前准备安全认证、售后网点与本地仓配。</li>
      </ul>`,
    `<h2>三、市场对比</h2>${marketTable()}`,
    `<h2>四、进入路径</h2>
      <ol>
        <li>第 1 阶段：用新加坡沉淀英文内容、政策合规清单与客服 SOP。</li>
        <li>第 2 阶段：在印尼验证达人投放、直播转化、本地支付与仓配模型。</li>
        <li>第 3 阶段：复制到越南，重点优化物流时效、售后成本和平台促销节奏。</li>
      </ol>`,
    `<div class="blockquote">注意：以上政策要点以当地官方最新公告为准，实施细则可能按季度调整，申报前请再次核对生效日期。</div>`,
    `<h2>五、预算与团队建议</h2>
      <p>冷启动预算建议集中在样品测款、达人内容、平台广告与客服履约。团队配置可先采用“国内品牌负责人 + 本地运营顾问 + 第三方仓配客服”的轻量结构，待单量稳定后再补本地全职岗位。</p>
      <div class="answer-divider"></div>${sourceTags()}`,
  ];
}

function sourceTags() {
  return `
    <div class="source-tags">
      <span>来源</span>
      <span class="source-tag">WWD</span>
      <span class="source-tag">BoF</span>
      <span class="source-tag">McKinsey</span>
    </div>
  `;
}

function sourcesPanel(open = false) {
  if (!open) {
    return `
      <div class="sources-panel fade-in">
        <button type="button" class="sources-collapsed" data-action="toggle-sources">
          <span>已参考 12 篇资料</span><span class="chevron is-collapsed" aria-hidden="true"></span>
        </button>
      </div>
    `;
  }
  return `
    <div class="sources-panel fade-in">
      <button type="button" class="sources-expanded-head" data-action="toggle-sources">
        <span>收起 12 篇资料</span><span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="sources-expanded">
        <ol class="sources-list">
          ${sources.slice(0, 6).map((item, index) => `<li>${index + 1}. ${escapeHtml(item)}</li>`).join("")}
        </ol>
      </div>
    </div>
  `;
}

function followUps() {
  return `
    <div class="follow-ups fade-in">
      <button type="button" class="follow-chip" data-action="report">生成完整趋势报告</button>
      <button type="button" class="follow-chip" data-action="compare">对比中国市场差异</button>
    </div>
  `;
}

function renderChat(mode = "answer") {
  state.currentView = { type: "chat", mode };
  const generating = mode === "generating";
  const report = mode === "report";
  const failed = mode === "failed";
  const queue = mode === "queue";
  const stopped = mode === "stopped";
  const sending = mode === "sending";
  const sendFailed = mode === "sendFailed";
  const multiline = mode === "multiline";
  const markdown = mode === "markdown";
  const stateOnly = failed || queue || stopped || sending || sendFailed;

  app.innerHTML = `
    <section class="screen">
      ${statusBar()}
      ${chatHeader(report || markdown || multiline ? "东南亚出海分析" : "欧美时尚市场趋势")}
      <main class="conversation" id="conversation">
        <div class="timestamp">14:30</div>
        ${userMessage(report || markdown || multiline ? "帮我生成一份东南亚市场进入分析报告" : "2026 年欧美时尚消费市场的核心趋势有哪些？", { sending, failed: sendFailed })}
        ${!sending && !sendFailed ? searchStatus() : ""}
        ${mode === "sources" ? sourcesPanel(true) : ""}
        ${mode === "answer" ? answerShort() : ""}
        ${mode === "answer" ? followUps() : ""}
        ${mode === "sources" ? answerShort() + followUps() : ""}
        ${generating ? `${typingIndicator()}` : ""}
        ${report ? sourcesPanel(state.sourceOpen) + longReport() + followUps() : ""}
        ${markdown ? markdownShowcase() : ""}
        ${failed ? errorBlock() : ""}
        ${queue ? queueBlock() : ""}
        ${stopped ? stoppedAnswer() : ""}
      </main>
      ${bottomArea(inputConfig(mode, stateOnly))}
    </section>
  `;
  scrollConversation(report || markdown || multiline ? "top" : "bottom");
}

function renderStreamingShell({ title = "欧美时尚市场趋势", question = "2026 年欧美时尚消费市场的核心趋势有哪些？", input = "这些趋势对中国品牌出海有什么启示？" } = {}) {
  app.innerHTML = `
    <section class="screen">
      ${statusBar()}
      ${chatHeader(title)}
      <main class="conversation" id="conversation">
        <div class="timestamp">14:30</div>
        ${userMessage(question)}
        ${searchStatus()}
        <div id="stream-host"></div>
        ${typingIndicator()}
      </main>
      ${bottomArea({ placeholder: input, active: true, stop: true })}
    </section>
  `;
  scrollConversation();
}

async function streamBlocks(blocks, { finalMode = "answer", delay = 240, charDelay = 18 } = {}) {
  const streamId = ++state.streamId;
  const host = document.querySelector("#stream-host");
  const typing = document.querySelector(".typing-indicator");
  if (!host) return;

  for (const block of blocks) {
    if (streamId !== state.streamId) return;
    await wait(delay);
    const wrapper = document.createElement("div");
    wrapper.className = "stream-chunk answer fade-in";
    host.appendChild(wrapper);

    if (block.includes("sources-panel")) {
      wrapper.innerHTML = block;
      scrollConversation();
      continue;
    }

    await typeHtmlBlock(wrapper, block, { streamId, charDelay });
    if (streamId !== state.streamId) return;
    wrapper.innerHTML = block;
    scrollConversation();
  }

  if (streamId !== state.streamId) return;
  if (typing) typing.remove();
  await wait(120);
  renderChat(finalMode);
}

async function typeHtmlBlock(target, html, { streamId, charDelay }) {
  const { parts } = hydrateStreamingHtml(target, html);
  target.classList.add("typing-text");

  for (const part of parts) {
    for (let index = 0; index < part.text.length; index += 1) {
      if (streamId !== state.streamId) return;
      part.node.textContent += part.text[index];
      if (index % 10 === 0) scrollConversation();
      await wait(charDelay);
    }
  }
}

function hydrateStreamingHtml(target, html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const parts = [];

  function appendStreamingNode(sourceNode, parent, inPre = false) {
    if (sourceNode.nodeType === Node.TEXT_NODE) {
      const original = sourceNode.nodeValue || "";
      const text = inPre ? original : original.replace(/\s+/g, " ");
      if (!text.trim()) return;
      const placeholder = document.createTextNode("");
      parent.appendChild(placeholder);
      parts.push({ node: placeholder, text });
      return;
    }

    if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;
    const clone = sourceNode.cloneNode(false);
    parent.appendChild(clone);
    const childInPre = inPre || sourceNode.matches("pre, code, .code-block");
    sourceNode.childNodes.forEach((child) => appendStreamingNode(child, clone, childInPre));
  }

  target.innerHTML = "";
  template.content.childNodes.forEach((child) => appendStreamingNode(child, target));
  return { parts };
}

function inputConfig(mode) {
  if (mode === "generating") {
    return { placeholder: "继续追问…", active: true, stop: true };
  }
  if (mode === "report") {
    return { placeholder: "继续追问…", active: true };
  }
  if (mode === "multiline") {
    return {
      value: "我想了解 2026 年东南亚市场中，适合中国品牌出海的重点行业、政策风险、主要渠道和进入成本，以及本地团队的组建建议和预算规划，另外请对比新加坡、印尼、越南三地的电商平台生态与物流基建差异，最后帮我整理成结构化分析报告。",
      active: true,
      multiline: true,
      counter: true,
    };
  }
  return { value: "这些趋势对中国品牌出海有什么启示？", active: true };
}

function longReport() {
  return `
    <article class="answer fade-in">
      <h1>东南亚市场进入分析报告</h1>
      <p>综合政策、平台生态与物流基建来看，2026 年东南亚仍是中国品牌出海的重要增量市场，但进入策略需要从“铺渠道”转向“本地化经营”。</p>
      <h2>一、结论摘要</h2>
      <p>建议采用“新加坡做合规样板、印尼做规模增长、越南做成本效率”的三阶段进入策略。短期优先选择内容转化快、履约复杂度可控的美妆个护、时尚配饰与轻智能硬件。</p>
      <h2>二、优先机会</h2>
      <ul>
        <li><strong>美妆个护：</strong>内容种草效率高，达人合作与短视频平台能快速验证需求，但需关注成分备案、清真认证与广告合规。</li>
        <li><strong>时尚配饰：</strong>价格带弹性较大，适合通过 TikTok Shop 与 Shopee 做快速测试，重点控制退换货与尺码体验。</li>
        <li><strong>智能小家电：</strong>客单价较高，适合建立品牌心智，但需提前准备安全认证、售后网点与本地仓配。</li>
      </ul>
      <h2>三、市场对比</h2>
      ${marketTable()}
      <div class="blockquote">注意：以上政策要点以当地官方最新公告为准，实施细则可能按季度调整，申报前请再次核对生效日期。</div>
      <h2>四、进入路径</h2>
      <ol>
        <li>第 1 阶段：用新加坡沉淀英文内容、政策合规清单与客服 SOP。</li>
        <li>第 2 阶段：在印尼验证达人投放、直播转化、本地支付与仓配模型。</li>
        <li>第 3 阶段：复制到越南，重点优化物流时效、售后成本和平台促销节奏。</li>
      </ol>
      <h2>五、预算与团队建议</h2>
      <p>冷启动预算建议集中在样品测款、达人内容、平台广告与客服履约。团队配置可先采用“国内品牌负责人 + 本地运营顾问 + 第三方仓配客服”的轻量结构，待单量稳定后再补本地全职岗位。</p>
      <div class="answer-divider"></div>
      ${sourceTags()}
    </article>
  `;
}

function markdownShowcase() {
  return `
    <article class="answer fade-in">
      <h1>Markdown 渲染规范</h1>
      <h2>政策解读样例</h2>
      <p>新加坡跨境电商准入通常涉及企业注册、税务登记、品类许可与平台合规。重点关注 <a href="#">Enterprise Singapore</a> 与海关公告<span class="citation">1</span>。</p>
      <ul>
        <li><strong>市场准入：</strong>确认产品是否涉及进口牌照。</li>
        <li><strong>数据合规：</strong>检查用户数据跨境处理流程。</li>
      </ul>
      <ol>
        <li>提交企业实体与税务登记信息。</li>
        <li>完成 IMDA 进口许可备案。</li>
        <li>取得 PSB 安全认证后方可上架销售。</li>
      </ol>
      <hr />
      <p>申报时填写 HS 编码 <span class="inline-code">8517.62.9900</span> 即可。</p>
      <div class="code-frame">
        <button type="button" class="copy-button">复制</button>
        <pre class="code-block">{
  "hs_code": "8517.62.9900",
  "market": "SG",
  "cert_required": ["IMDA-Import-Permit", "PSB-Safety-Mark-2026"]
}</pre>
      </div>
      ${marketTable()}
      <div class="blockquote">注意：超长 URL、英文与连续编码必须自动折行，不得撑破气泡。</div>
      <p>https://example.com/reports/very-long-market-policy-reference-path-that-should-wrap-safely-inside-the-mobile-container</p>
    </article>
  `;
}

function marketTable() {
  return `
    <div class="table-frame">
      <div class="table-scroll">
        <table>
          <thead>
            <tr><th>市场</th><th>平台重点</th><th>物流基建</th><th>平均时效</th><th>进入成本</th></tr>
          </thead>
          <tbody>
            <tr><td>新加坡</td><td>Shopee / Lazada</td><td>成熟</td><td>1-2 天</td><td>高 · 合规样板</td></tr>
            <tr><td>印尼</td><td>TikTok Shop</td><td>区域差异大</td><td>3-7 天</td><td>中 · 增长优先</td></tr>
            <tr><td>越南</td><td>Shopee / 本地渠道</td><td>改善中</td><td>2-5 天</td><td>中 · 稳步进入</td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-fade" aria-hidden="true"></div>
    </div>
  `;
}

function errorBlock() {
  return `
    <div class="state-block fade-in">
      <div class="state-line"><span class="state-icon">!</span><span>回复生成失败，请检查网络后重试</span></div>
      <button type="button" class="retry-chip" data-action="retry">↻ 重试</button>
    </div>
  `;
}

function queueBlock() {
  return `
    <div class="state-block fade-in">
      <div class="state-line"><span class="state-icon neutral">⏱</span><span>当前咨询人数较多，请稍候再试</span></div>
      <button type="button" class="retry-chip" data-action="retry">↻ 重试</button>
    </div>
  `;
}

function stoppedAnswer() {
  return `
    <article class="answer fade-in">
      <p>对中国品牌而言，欧美时尚消费趋势的启示主要集中在可持续供应链、AI 辅助设计、内容社区运营与小众品牌定位。建议优先从材料透明度、</p>
      <div class="stopped-row">
        <span>已停止生成</span>
        <button type="button" class="follow-chip" data-action="regen">重新生成</button>
      </div>
    </article>
  `;
}

function scrollConversation(position = "bottom") {
  requestAnimationFrame(() => {
    const el = document.querySelector("#conversation");
    if (!el) return;
    if (position === "top") {
      el.scrollTop = 0;
      return;
    }
    if (position === "report") {
      const source = el.querySelector(".sources-panel");
      if (source) {
        const sourceTop = source.getBoundingClientRect().top;
        const containerTop = el.getBoundingClientRect().top;
        el.scrollTop = Math.max(0, el.scrollTop + sourceTop - containerTop - 12);
      } else {
        el.scrollTop = 0;
      }
      return;
    }
    el.scrollTop = el.scrollHeight;
  });
}

async function runQuestion(text) {
  state.screen = "generating";
  state.currentView = { type: "chat", mode: "answer" };
  renderStreamingShell({ question: text });
  await streamBlocks(answerShortBlocks(), { finalMode: "answer", delay: 165, charDelay: 20 });
  state.screen = "answer";
}

async function runReportStream() {
  state.screen = "report-generating";
  state.sourceOpen = false;
  state.currentView = { type: "chat", mode: "report" };
  renderStreamingShell({
    title: "东南亚出海分析",
    question: "帮我生成一份东南亚市场进入分析报告",
    input: "继续追问…",
  });
  await streamBlocks(longReportBlocks(), { finalMode: "report", delay: 135, charDelay: 11 });
  state.screen = "report";
}

function renderGenerating(text = "2026 年欧美时尚消费市场的核心趋势有哪些？") {
  app.innerHTML = `
    <section class="screen">
      ${statusBar()}
      ${chatHeader()}
      <main class="conversation" id="conversation">
        <div class="timestamp">14:30</div>
        ${userMessage(text)}
        ${searchStatus()}
        ${typingIndicator()}
      </main>
      ${bottomArea({ placeholder: "继续追问…", active: true, stop: true })}
    </section>
  `;
  scrollConversation();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bindEvents() {
  document.addEventListener("click", async (event) => {
    state.hasUserInteracted = true;

    const question = event.target.closest("[data-question]");
    if (question) {
      await runQuestion(question.dataset.question);
      return;
    }

    const jump = event.target.closest("[data-jump]");
    if (jump) {
      const target = jump.dataset.jump;
      if (target === "home") renderHome();
      if (target === "answer") renderChat("answer");
      if (target === "report") renderChat("report");
      if (target === "states") renderChat("failed");
      if (target === "markdown") renderChat("markdown");
      if (target === "loading") {
        renderLoading(false);
      }
      if (target === "load-failed") {
        renderLoading(true);
      }
      return;
    }

    const action = event.target.closest("[data-action]");
    if (!action) return;
    const name = action.dataset.action;

    if (name === "toggle-sources") {
      const isReport = Boolean(document.querySelector(".answer h1"));
      state.sourceOpen = !state.sourceOpen;
      if (isReport) {
        renderChat("report");
      } else {
        renderChat(state.sourceOpen ? "sources" : "answer");
      }
    }
    if (name === "report" || name === "compare") {
      await runReportStream();
    }
    if (name === "send") {
      await runReportStream();
    }
    if (name === "stop") {
      state.streamId += 1;
      renderChat("stopped");
    }
    if (name === "retry" || name === "regen") {
      await runQuestion("2026 年欧美时尚消费市场的核心趋势有哪些？");
    }
    if (name === "reload") {
      renderLoading(false);
      await wait(900);
      renderHome();
    }
  });

  document.addEventListener("input", (event) => {
    if (!event.target.matches(".input-text")) return;
    const textarea = event.target;
    const pill = textarea.closest(".input-pill");
    const button = pill.querySelector(".send-button");
    const hasValue = textarea.value.trim().length > 0;
    button.classList.toggle("disabled", !hasValue);
  });
}

async function boot() {
  bindEvents();
  renderLoading(false);
  await wait(1200);
  if (!state.hasUserInteracted && state.currentView.type === "loading" && !state.currentView.failed) {
    renderHome();
  }
}

boot();
