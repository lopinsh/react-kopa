export const CSS = `
/* ── Page tokens. The page carries its own colours and fonts (scoped under .rd), so it doesn't follow the site theme. */
.rd{--bg:#f4f4ef;--surface:#fdfdfb;--tint:#e8eae1;--line:#dcdfd4;--fg:#1f221c;--muted:#5f6558;--brand:#4B5E3B;--on-brand:#ffffff;
  --display:"Literata",Georgia,"Times New Roman",serif;--body:"Commissioner",system-ui,-apple-system,"Segoe UI",sans-serif;
  --k-trav:#4F7330;--k-dance:#A9452C;--k-hobby:#A55A12;--k-comm:#2F6A45;--k-pol:#57493D;--k-pets:#7A5E40;--k-art:#7A4790;--k-music:#57479A;--k-rel:#586474;--k-social:#A53A50;--k-games:#8C3F72;--k-sport:#3B55A0;--k-family:#2B6489;--k-well:#2E6B6F;--k-sci:#86650E}
html.dark .rd{--bg:#161814;--surface:#1e211c;--tint:#282c25;--line:#353a31;--fg:#eceee7;--muted:#a8ae9f;--brand:#b5c79e;--on-brand:#1a2213;color-scheme:dark;
  --k-trav:#7BBF40;--k-dance:#E09B8A;--k-hobby:#DB9F66;--k-comm:#44C172;--k-pol:#B8AA9D;--k-pets:#C1A78B;--k-art:#CA9CDE;--k-music:#AFA3E0;--k-rel:#A0ACBA;--k-social:#DD98A6;--k-games:#DB94C3;--k-sport:#98A9DD;--k-family:#7BB2D6;--k-well:#47BAC2;--k-sci:#D0A535}
.rd *{box-sizing:border-box}
.rd{background:var(--bg);color:var(--fg);font:16px/1.6 var(--body);margin:0;border-radius:16px}
.rd h1,.rd h2,.rd h3,.rd h4{font-family:var(--display);font-weight:600;margin:0;text-wrap:balance;line-height:1.15}
.rd a{color:inherit}
.rd svg.i{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.rd .wrap{max-width:1180px;margin:0 auto;padding:28px 16px 88px;display:grid;grid-template-columns:minmax(0,1fr);gap:64px}
.rd .intro{display:grid;gap:10px}
.rd .intro .badge{justify-self:start;font-size:13px;font-weight:600;color:var(--brand);background:var(--tint);border-radius:999px;padding:3px 12px}
.rd .intro h1{font-size:clamp(32px,5vw,48px)}
.rd .intro p{color:var(--muted);max-width:68ch;margin:0;font-size:17px}
.rd .intro p b{color:var(--fg)}
.rd .toc{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:14px;margin:4px 0 0;padding:0;list-style:none}
.rd .toc a{color:var(--brand);font-weight:600;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.rd section{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;min-width:0;position:relative}
.rd section>*{min-width:0}
.rd section>h2{font-size:30px}
.rd section>h3{font-size:21px;margin-top:18px}
.rd .lead{color:var(--muted);max-width:72ch;margin:0}
.rd .why{margin:0;font-size:14px;color:var(--muted);max-width:72ch}
.rd .lead b,.rd .why b{color:var(--fg)}
.rd .lead a,.rd .why a,.rd .rd-ledger a{color:var(--brand);font-weight:600;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
/* version block and New/Updated badges (filled in by the site) */
.rd .rd-version{display:grid;gap:6px;justify-items:start;font-size:14px;color:var(--muted)}
.rd .rd-version b{color:var(--fg);font-weight:600}
.rd .rd-version summary{cursor:pointer;color:var(--brand);font-weight:600}
.rd .rd-version ul{margin:6px 0 0;padding-left:18px}
.rd .rd-version button{font:600 13px var(--body);height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--fg);cursor:pointer}
.rd .rd-badge{position:absolute;top:-14px;right:0;z-index:2;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font:700 12px var(--body);cursor:pointer;border:1.5px solid var(--brand);background:var(--brand);color:var(--on-brand)}
.rd .rd-badge[hidden]{display:none}
.rd .rd-badge[data-rd-kind="updated"]{background:var(--surface);color:var(--brand)}
.rd .rd-badge::after{content:"\\00d7";font-size:15px;line-height:1;opacity:.8}
.rd .rd-badge:focus-visible{outline:2px solid var(--brand);outline-offset:2px}

/* ── Status tags: Agreed, Liked, Open, Proposal */
.rd .rd-st{display:inline-flex;align-items:center;flex:none;font:600 12px/1 var(--body);white-space:nowrap;padding:4px 9px;border-radius:999px;border:1px solid transparent;vertical-align:2px}
.rd .rd-st.ag{background:var(--brand);color:var(--on-brand)}
.rd .rd-st.lk{color:var(--brand);background:var(--tint);border-color:var(--brand)}
.rd .rd-st.op{color:var(--fg);background:var(--surface);border-color:var(--muted);border-style:dashed}
.rd .rd-st.pr{color:var(--muted);background:transparent;border-color:var(--muted);font-style:italic}
.rd .legend{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:14px;color:var(--muted);margin:0}
.rd .legend span{display:inline-flex;align-items:center;gap:8px}

/* ── The agreed-rules ledger */
.rd .rd-ledger{display:grid;background:var(--surface);border-radius:16px;padding:4px 18px 10px}
.rd .rd-ledger .gh{font:600 13px var(--body);color:var(--muted);padding:16px 0 4px}
.rd .rd-ledger .r{display:grid;grid-template-columns:170px minmax(0,1fr) 112px 96px;gap:4px 14px;padding:9px 0;border-top:1px solid var(--line);font-size:14px;align-items:start}
.rd .rd-ledger .gh+.r{border-top:0}
.rd .rd-ledger .rd-st{white-space:normal;line-height:1.25}
.rd .rd-ledger .r>b{font:600 15px/1.35 var(--display)}
.rd .rd-ledger .r>span:nth-child(2){color:var(--muted)}
.rd .rd-ledger .r>span:nth-child(4){font-size:13px}
@media (max-width:760px){.rd .rd-ledger .r{grid-template-columns:minmax(0,1fr) auto}.rd .rd-ledger .r>span:nth-child(2){grid-column:1/-1;grid-row:2}.rd .rd-ledger .r>span:nth-child(4){grid-column:1/-1}}
.rd .rd-qs{display:grid;gap:10px;counter-reset:q;margin:0;padding:0;list-style:none}
.rd .rd-qs li{background:var(--surface);border-radius:16px;padding:14px 18px;display:grid;grid-template-columns:30px minmax(0,1fr);gap:2px 12px}
.rd .rd-qs li::before{counter-increment:q;content:counter(q);grid-row:span 2;width:28px;height:28px;border-radius:50%;background:var(--tint);color:var(--fg);display:grid;place-items:center;font:600 14px var(--display)}
.rd .rd-qs b{font:600 16px var(--display)}
.rd .rd-qs p{margin:0;color:var(--muted);font-size:14px}
.rd .rd-qs p i{font-style:normal;color:var(--fg);font-weight:600}
.rd .rd-ni{display:grid;background:var(--surface);border-radius:16px;padding:4px 18px;margin:0;list-style:none}
.rd .rd-ni li{display:grid;grid-template-columns:110px minmax(0,1fr) 150px;gap:4px 14px;padding:8px 0;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
.rd .rd-ni li:first-child{border-top:0}
.rd .rd-ni code{font:600 12px ui-monospace,monospace;color:var(--fg)}
.rd .rd-ni a{color:var(--brand);font-weight:600}
@media (max-width:640px){.rd .rd-ni li{grid-template-columns:minmax(0,1fr)}}
.rd .rd-rule{background:var(--surface);border-radius:16px;padding:16px 20px;display:grid;gap:8px;border-left:3px solid var(--brand)}
.rd .rd-rule ol,.rd .rd-rule ul{margin:0;padding-left:20px;display:grid;gap:6px;font-size:15px}
.rd .rd-boxes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
@media (max-width:900px){.rd .rd-boxes{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:600px){.rd .rd-boxes{grid-template-columns:minmax(0,1fr)}}
.rd .rd-box{background:var(--surface);border-radius:16px;padding:16px 18px;display:grid;gap:10px;align-content:start;min-width:0}
.rd .rd-box.wide{grid-column:span 2}
@media (max-width:600px){.rd .rd-box.wide{grid-column:auto}}
.rd .rd-box>.lbl{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:600;color:var(--muted)}
.rd .rd-box p{margin:0}

/* ── Shots and frames */
.rd .rd-shots{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start}
.rd .rd-shot{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;min-width:0;flex:0 1 auto;max-width:100%}
.rd .rd-shot>.cap{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px;font-weight:600;color:var(--muted)}
.rd .rd-desk{border:1px solid var(--line);border-radius:14px;background:var(--bg);overflow-x:auto;overflow-y:hidden;max-width:100%;scrollbar-width:thin}
.rd .rd-desk>.in{min-width:var(--dw,1000px)}
.rd .rd-mob{width:340px;max-width:100%;border:7px solid var(--fg);border-radius:30px;overflow:hidden;background:var(--bg);flex:none;position:relative}
.rd .rd-crop{border:1px solid var(--line);border-radius:14px;background:var(--bg);padding:12px;overflow-x:auto;max-width:100%;display:grid;gap:8px;align-content:start}
.rd .rd-pg{padding:16px 20px 20px;display:grid;gap:12px;align-content:start;min-width:0}
.rd .rd-mob .rd-pg{padding:12px;gap:10px}
.rd .rd-url{padding:5px 16px;background:var(--tint);font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ── Header (desktop and phone) */
.rd .rd-hdr{display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--surface);border-bottom:1px solid var(--line);min-width:0}
.rd .rd-logo{font:600 21px/1 var(--display);color:var(--brand);display:inline-flex;align-items:center;white-space:nowrap;flex:none;margin-right:8px}
.rd .rd-logo em{font-weight:500}
.rd .rd-logo::after{content:"";width:12px;height:12px;border-radius:50%;flex:none;background:var(--brand);box-shadow:8px 0 0 0 color-mix(in srgb,var(--brand) 45%,transparent);margin:0 8px 0 6px}
.rd .rd-search{flex:1;min-width:0;height:38px;border-radius:999px;background:var(--tint);display:flex;align-items:center;gap:8px;padding:0 12px 0 12px;color:var(--muted);font-size:14px;white-space:nowrap;overflow:hidden}
.rd .rd-search .ph{overflow:hidden;text-overflow:ellipsis}
.rd .rd-search.open{background:var(--surface);outline:2px solid var(--brand);outline-offset:-2px;color:var(--fg)}
.rd .rd-search .q{display:inline-flex;align-items:center;gap:1px;line-height:1;min-width:0}
.rd .rd-search .x{margin-left:auto;color:var(--muted)}
.rd .caret{width:1.5px;height:17px;background:var(--fg);flex:none;display:inline-block}
.rd .rd-ico{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:var(--fg);position:relative;flex:none}
.rd .rd-ico.plus{box-shadow:inset 0 0 0 1.5px var(--line)}
.rd .rd-ico.on{background:var(--tint)}
.rd .rd-ico .dot{position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 2px var(--surface)}
.rd .rd-av,.rd .rd-bigav{width:32px;height:32px;border-radius:50%;flex:none;background-color:#c9b8a6;background-image:radial-gradient(ellipse 23% 23% at 50% 38%,#f0d2b4 94%,transparent 100%),radial-gradient(ellipse 40% 30% at 50% 100%,#5f7a4c 95%,transparent 100%)}
.rd .rd-av.on{box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--brand)}
.rd .rd-bigav{width:48px;height:48px}
.rd .rd-bigav.sm{width:32px;height:32px}
.rd .rd-hdr.ph{gap:2px;padding:9px 10px 9px 12px}
.rd .rd-hdr.ph .rd-logo{font-size:18px;margin-right:0}
.rd .rd-hdr.ph .rd-logo::after{width:10px;height:10px;box-shadow:7px 0 0 0 color-mix(in srgb,var(--brand) 45%,transparent);margin:0 7px 0 5px}
.rd .rd-hdr.ph .sp{flex:1}
.rd .rd-hdr.ph .rd-ico{width:32px;height:32px}
.rd .rd-hdr.ph .rd-ico .dot{top:4px;right:4px}
.rd .rd-hdr.ph .rd-av{width:30px;height:30px;margin-left:4px}
.rd .rd-navb{display:flex;justify-content:space-around;background:var(--surface);border-top:1px solid var(--line);padding:7px 0 9px;font-size:11px;color:var(--muted)}
.rd .rd-navb span{display:grid;justify-items:center;gap:2px;position:relative}
.rd .rd-navb .on{color:var(--fg);font-weight:600}
.rd .rd-navb .on svg.i{background:color-mix(in srgb,var(--brand) 16%,var(--surface));border-radius:999px;padding:3px 14px;box-sizing:content-box}
.rd .rd-navb .add{align-self:center;color:var(--fg)}
.rd .rd-navb .add svg.i{width:20px;height:20px;padding:7px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--line);box-sizing:content-box}
.rd .rd-navb em{position:absolute;top:-3px;left:calc(50% + 6px);font:normal 700 10px/16px var(--body);min-width:16px;padding:0 4px;border-radius:999px;background:var(--brand);color:var(--on-brand);text-align:center}
.rd .rd-menu{width:240px;max-width:100%;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px;display:grid;gap:1px;box-shadow:0 10px 28px rgba(0,0,0,.12)}
.rd .rd-mi{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:10px;font-size:14px;white-space:nowrap}
.rd .rd-mi svg.i{width:17px;height:17px;color:var(--muted)}
.rd .rd-mi em,.rd .rd-mi small{margin-left:auto;font-style:normal;font-size:12px;color:var(--muted)}
.rd .rd-mi em{font-weight:700;background:var(--tint);color:var(--fg);border-radius:999px;padding:0 7px}
.rd .rd-mi>svg.i:last-child:not(:first-child){margin-left:auto}
.rd .rd-menu .sep{height:1px;background:var(--line);margin:4px 8px}

/* ── Buttons */
.rd .rd-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:38px;padding:0 18px;border-radius:999px;font:500 15px var(--body);white-space:nowrap;border:0;flex:none}
.rd .rd-btn.p{background:var(--brand);color:var(--on-brand)}
.rd .rd-btn.s{background:var(--tint);color:var(--fg)}
.rd .rd-btn.q{background:transparent;color:var(--fg);box-shadow:inset 0 0 0 1px var(--line)}
.rd .rd-btn.sm{height:32px;padding:0 14px;font-size:14px}
.rd .rd-btn svg.i{width:16px;height:16px}
.rd .rd-btn.more{width:38px;padding:0}
.rd .rd-lnk{display:inline-flex;align-items:center;gap:6px;color:var(--brand);font-weight:600;font-size:14px;white-space:nowrap}
.rd .rd-lnk svg.i{width:16px;height:16px}

/* ── Small labels: category, sub-categories, tags */
.rd .rd-cat{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--fg);white-space:nowrap}
.rd .rd-cat::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c);flex:none}
.rd .rd-sub{font-size:13px;color:var(--muted)}
.rd .rd-catl{display:flex;align-items:baseline;gap:2px 10px;flex-wrap:wrap;min-width:0}
.rd .rd-pill{display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 8px;border-radius:999px;font:600 11px/1 var(--body);background:color-mix(in srgb,var(--brand) 15%,var(--surface));color:var(--fg);white-space:nowrap;flex:none;font-style:normal}
.rd .rd-pill svg.i{width:11px;height:11px;stroke-width:2.8}
.rd .rd-pill.out{background:transparent;box-shadow:inset 0 0 0 1px var(--muted);color:var(--muted)}

/* ── Filter row, switch, chosen line */
/* The filter: line 1 (Kur, Tēma, the date choices, the switch) never wraps; a long name is cut with "…" instead. Line 2 is the Veids chips. */
.rd .rd-flt{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;min-width:0}
.rd .rd-frow{display:flex;align-items:center;gap:8px;min-width:0}
.rd .rd-frow>.fs{display:flex;align-items:center;gap:6px;min-width:0;flex:1;flex-wrap:nowrap}
/* Phones: the switch has its own full-width line; the filter buttons sit on one line under it and give way with "…". */
.rd .rd-frow.ph{flex-direction:column;align-items:stretch;gap:8px}
.rd .rd-frow.ph>.rd-sw{display:flex;margin-left:0}
.rd .rd-frow.ph>.rd-sw>span{flex:1;justify-content:center}
.rd .rd-fc{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border-radius:999px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--line);font:500 13px var(--body);color:var(--fg);white-space:nowrap;flex:none;min-width:0}
/* Each button has a maximum width; when the line is short, Tēma (the longest name) gives way first, then the search word. */
.rd .rd-frow>.fs>.rd-fc{flex:0 0 auto;max-width:180px}
.rd .rd-frow>.fs>.rd-fc.kur{max-width:150px}
.rd .rd-frow>.fs>.rd-fc.tema{flex-shrink:1}
.rd .rd-frow>.fs>.rd-fc.q{flex-shrink:1;max-width:120px}
.rd .rd-frow.ph>.fs>.rd-fc{padding:0 9px}
.rd .rd-fc .lb{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.rd .rd-fc svg.i{width:14px;height:14px;color:var(--muted)}
.rd .rd-fc b{font-weight:600}
.rd .rd-fc em{font-style:normal;font-size:11px;font-weight:700;background:var(--fg);color:var(--surface);border-radius:999px;padding:0 6px;line-height:16px}
.rd .rd-fc em.more{background:none;color:var(--fg);padding:0;font-size:12px;flex:none}
.rd .rd-fc .kd,.rd .rd-oc .kd{width:8px;height:8px;border-radius:50%;background:var(--c);flex:none}
.rd .rd-fc .xx,.rd .rd-dq .xx{display:inline-grid;place-items:center;width:18px;height:18px;margin-right:-5px;border-radius:50%;flex:none}
.rd .rd-fc .xx svg.i,.rd .rd-dq .xx svg.i{width:12px;height:12px;stroke-width:2.4}
.rd .rd-fc.set{box-shadow:inset 0 0 0 1.5px var(--fg)}
.rd .rd-fc.open,.rd .rd-dq>.open,.rd .rd-oc.open{box-shadow:inset 0 0 0 1.5px var(--brand);background:var(--tint)}
.rd .rd-fc .rd-cat{font-size:13px}
/* Line 2: choice chips (Veids; the matching themes and types in the search) on one line, then "+N" */
.rd .rd-vl{display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-width:0}
.rd .rd-vl>.rd-clr{margin-left:auto}
.rd .rd-vl>.lbl{font-size:12px;color:var(--muted);white-space:nowrap;flex:none}
.rd .rd-oc{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:999px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--line);font:500 12px var(--body);color:var(--fg);white-space:nowrap;flex:none}
.rd .rd-oc small{font-size:11px;color:var(--muted)}
.rd .rd-oc.on{background:color-mix(in srgb,var(--c,var(--brand)) 15%,var(--surface));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c,var(--brand)) 45%,transparent);font-weight:600;padding-right:5px}
.rd .rd-oc svg.i{width:13px;height:13px;color:var(--muted)}
.rd .rd-oc.more{font-weight:600;color:var(--muted)}
.rd .rd-dq{display:inline-flex;align-items:center;height:30px;padding:2px;gap:1px;border-radius:999px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--line);flex:none}
.rd .rd-dq>span{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 9px;border-radius:999px;font-size:13px;white-space:nowrap}
.rd .rd-dq>span svg.i{width:14px;height:14px;color:var(--muted)}
.rd .rd-dq>.on{background:var(--tint);font-weight:600;box-shadow:inset 0 0 0 1.5px var(--fg)}
.rd .rd-sw{display:inline-flex;align-items:center;height:30px;padding:2px;gap:2px;border-radius:999px;background:var(--tint);flex:none;margin-left:auto}
.rd .rd-sw>span{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;font:500 13px var(--body);color:var(--muted);white-space:nowrap}
.rd .rd-sw>.on{background:var(--surface);color:var(--fg);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.14)}
.rd .rd-schips{display:flex;min-width:0}
.rd .rd-schips>.fs{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;min-width:0}
.rd .rd-x{display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 4px 0 9px;border-radius:999px;background:color-mix(in srgb,var(--c,var(--brand)) 13%,var(--surface));font:500 12px var(--body);white-space:nowrap;flex:none}
.rd .rd-x.cat::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--c);margin-right:2px}
.rd .rd-x svg.i{width:13px;height:13px;color:var(--muted)}
.rd .rd-clr{font:600 12px var(--body);color:var(--brand);text-decoration:underline;text-underline-offset:3px;white-space:nowrap;flex:none;margin-left:2px}

/* ── Drop-down lists */
.rd .rd-list{width:250px;max-width:100%;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:4px 6px 6px;display:grid;gap:1px;align-content:start;box-shadow:0 10px 28px rgba(0,0,0,.12)}
.rd .rd-find{display:flex;align-items:center;gap:7px;height:36px;margin:0 -6px 4px;padding:0 12px;box-shadow:inset 0 -1px var(--line);color:var(--muted);font-size:13px;white-space:nowrap}
.rd .rd-find svg.i{width:15px;height:15px}
.rd .rd-find.typed{color:var(--fg)}
.rd .rd-opt{display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:8px;font-size:13px;min-height:28px}
.rd .rd-opt .n{margin-left:auto;font-size:12px;color:var(--muted);padding-left:6px}
.rd .rd-opt.on{font-weight:600}
.rd .rd-opt.all{font-weight:500}
.rd .rd-opt.all.on{background:var(--tint);font-weight:600}
.rd .rd-opt.zero{opacity:.45}
.rd .rd-opt.add{color:var(--brand);font-weight:600}
.rd .rd-opt.add svg.i{width:15px;height:15px}
.rd .rd-opt .ki{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 18%,var(--surface));color:var(--c);flex:none}
.rd .rd-opt .ki svg,.rd .rd-cats .ic svg,.rd .rd-gr .mk svg,.rd .rd-gc .pic svg,.rd .rd-gpic svg,.rd .rd-cvi .av svg,.rd .ki svg{stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.rd .rd-opt .ki svg{width:13px;height:13px}
.rd .rd-list .sep{height:1px;background:var(--line);margin:3px 6px}
.rd .rd-cb{width:15px;height:15px;border-radius:4px;box-shadow:inset 0 0 0 1.5px var(--muted);flex:none;display:grid;place-items:center}
.rd .rd-cb.on{background:var(--brand);box-shadow:none;color:var(--on-brand)}
.rd .rd-cb svg.i{width:11px;height:11px;stroke-width:3}
.rd .rd-nf{margin:0;padding:6px 8px 2px;font:italic 400 13px var(--body);color:var(--muted)}
.rd .rd-nf.sm{font-size:12px;padding-top:0}
.rd .hl{font-style:normal;color:var(--brand);font-weight:600}
.rd .rd-drop{display:grid;gap:6px;justify-items:start}
.rd .rd-drop>.rd-list{margin-left:var(--at,0)}
.rd .rd-drop>.rd-flt{justify-self:stretch}
.rd .rd-pnl.sheet .rd-list{width:100%;box-shadow:none;border:0}
.rd .rd-cal{width:300px;padding:10px}
.rd .rd-cal .mh{display:flex;justify-content:center;align-items:center;gap:10px;padding:4px 2px;font:600 14px var(--display)}
.rd .rd-cal .mh svg.i{color:var(--muted);width:16px;height:16px}
.rd .rd-cal .g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));text-align:center;font-size:12px}
.rd .rd-cal .g>span{height:28px;display:grid;place-items:center;font-variant-numeric:tabular-nums}
.rd .rd-cal .wd{height:22px;font-size:10px;font-weight:600;color:var(--muted)}
/* Weekends (13 Oct): Saturday and Sunday on a soft tint, their letters in the text colour. */
.rd .rd-cal .we{background:var(--tint)}
.rd .rd-cal .wd.we{color:var(--fg)}
.rd .rd-cal .past{color:var(--muted);opacity:.55}
.rd .rd-cal .td{font-weight:700;text-decoration:underline;text-underline-offset:3px}
.rd .rd-cal .rg{background:color-mix(in srgb,var(--brand) 15%,var(--surface))}
.rd .rd-cal .s,.rd .rd-cal .e{background:var(--brand);color:var(--on-brand);font-weight:600}
.rd .rd-cal .s{border-radius:999px 0 0 999px}
.rd .rd-cal .e{border-radius:0 999px 999px 0}
.rd .rd-cal .f{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}

/* ── Category drawer */
.rd .rd-disc{display:grid;grid-template-columns:220px minmax(0,1fr);min-width:0}
.rd .rd-disc.fold{grid-template-columns:56px minmax(0,1fr)}
.rd .rd-cats{padding:12px 8px;border-right:1px solid var(--line);display:grid;gap:1px;align-content:start;font-size:13px;min-width:0;overflow:hidden}
.rd .rd-cats .cl-h{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:0 2px 6px 8px}
.rd .rd-cats .cl-h b{font:600 13px var(--body);color:var(--muted)}
.rd .rd-cats .tg{width:28px;height:28px;border-radius:50%;background:var(--tint);display:grid;place-items:center;flex:none}
.rd .rd-cats .tg svg.i{width:15px;height:15px}
.rd .rd-cats .find{display:flex;align-items:center;gap:6px;height:32px;padding:0 10px;margin:0 0 6px;border-radius:999px;background:var(--tint);color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden}
.rd .rd-cats .find svg.i{width:14px;height:14px}
.rd .rd-cats .ci{display:flex;align-items:center;gap:9px;padding:2px 6px;border-radius:12px;white-space:nowrap;min-width:0}
.rd .rd-cats .ic{width:26px;height:26px;border-radius:50%;flex:none;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 18%,var(--surface));color:var(--c)}
.rd .rd-cats .ic svg{width:15px;height:15px}
.rd .rd-cats .nm{overflow:hidden;text-overflow:ellipsis;min-width:0}
.rd .rd-cats .n{margin-left:auto;font-size:12px;color:var(--muted);padding-right:2px}
.rd .rd-cats .ci.on{background:var(--tint);font-weight:600}
.rd .rd-cats .ci.zero{opacity:.45}
.rd .rd-cats.fold .cl-h{justify-content:center;padding:0 0 6px}
.rd .rd-cats.fold .cl-h b,.rd .rd-cats.fold .nm,.rd .rd-cats.fold .n,.rd .rd-cats.fold .find span{display:none}
.rd .rd-cats.fold .find{justify-content:center;padding:0}
.rd .rd-cats.fold .ci{justify-content:center;padding:2px 0}
.rd .rd-cats.sheet{border-right:0;padding:4px 6px}

/* ── Group card (desktop) and group row (phones, compact lists) */
.rd .rd-gcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:12px}
.rd .rd-gc{background:var(--surface);border-radius:16px;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) clamp(52px,20%,84px);grid-template-rows:auto 1fr;min-width:0;--c:var(--muted)}
.rd .rd-gc .pic{grid-column:2;grid-row:1/3;background-color:color-mix(in srgb,var(--c) 20%,var(--surface));display:grid;place-items:center;color:var(--c);min-height:100%}
.rd .rd-gc .pic svg{width:26px;height:26px;stroke-width:1.7}
.rd .rd-gc .in{grid-column:1;grid-row:1;padding:12px 14px 0;display:grid;gap:3px;min-width:0}
.rd .rd-gc .in b{font:600 15px/1.3 var(--display)}
.rd .rd-gc .rd-catl{flex-wrap:nowrap;overflow:hidden}
.rd .rd-gc .rd-catl .rd-sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.rd .rd-gc .meta{font-size:13px;color:var(--muted)}
.rd .rd-gc .note{grid-column:1;grid-row:2;align-self:end;display:flex;align-items:center;gap:6px;margin:8px 14px 0;padding:8px 0 11px;border-top:1px solid var(--line);font:italic 400 13px var(--body);color:var(--brand)}
.rd .rd-gc .note svg.i{width:14px;height:14px}
.rd .rd-gc:not(:has(.note)) .in{padding-bottom:12px}
.rd .rd-gc.sel{outline:2px solid var(--brand);outline-offset:-2px}
.rd .rd-gc.add{background:transparent;border:1.5px dashed var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:12px 14px;gap:0}
.rd .rd-gc.add .addi{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1.5px var(--line);margin-bottom:6px}
.rd .rd-gc.add b{font:600 15px/1.25 var(--display)}
.rd .rd-gc.add p{margin:1px 0 0;font-size:13px;color:var(--muted);line-height:1.3}
.rd .clamp2{display:-webkit-box!important;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rd .rd-grl{background:var(--surface);border-radius:16px;padding:0 14px;display:grid;min-width:0}
.rd .rd-gr{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line);min-width:0;--c:var(--muted)}
.rd .rd-gr:first-child{border-top:0}
.rd .rd-gr .t{display:grid;flex:1;min-width:0;line-height:1.3;gap:1px}
.rd .rd-gr .t b{font:600 15px/1.3 var(--display)}
.rd .rd-gr .t small{font-size:12px;color:var(--muted)}
.rd .rd-gr .mk{width:40px;height:40px;border-radius:10px;flex:none;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 20%,var(--surface));color:var(--c)}
.rd .rd-gr .mk svg{width:20px;height:20px}
.rd .rd-gr.add .mk{background:transparent;box-shadow:inset 0 0 0 1.5px var(--line);color:var(--fg);border-radius:50%}
.rd .rd-gr.add .t b{font-size:14px}
.rd .rd-ctx{display:flex;align-items:baseline;gap:10px;margin-top:4px}
.rd .rd-ctx h4{font-size:17px}
.rd .rd-ctx small{font-size:13px;color:var(--muted)}

/* ── Event rows, day strip */
.rd .rd-evl{background:var(--surface);border-radius:16px;padding:2px 14px 10px;display:grid;min-width:0}
.rd .rd-evl.flat{background:none;padding:0;border-radius:0}
.rd .rd-dayh{font:600 13px var(--body);color:var(--muted);padding:12px 0 2px;border-top:1px solid var(--line)}
.rd .rd-evl>.rd-dayh:first-child{border-top:0;padding-top:8px}
.rd .rd-evg.cols{columns:2;column-gap:24px}
.rd .rd-mob .rd-evg.cols{columns:1}
.rd .rd-er{display:grid;grid-template-columns:44px 8px minmax(0,1fr) auto;gap:0 8px;align-items:center;padding:6px 6px;border-bottom:1px solid var(--line);font-size:14px;min-width:0;break-inside:avoid;border-radius:8px}
.rd .rd-evg>.rd-er:last-child{border-bottom:0}
.rd .rd-er .tm{font-variant-numeric:tabular-nums;color:var(--muted);font-size:13px;white-space:nowrap}
.rd .rd-er .dt{width:8px;height:8px;border-radius:50%;background:var(--c)}
.rd .rd-er b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd .rd-er .ct{font-size:13px;color:var(--muted);white-space:nowrap}
.rd .rd-er .tmb{grid-column:1;grid-row:2;align-self:start;padding-top:2px;line-height:1}
.rd .rd-er .sl{grid-column:3/5;grid-row:2;display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;min-width:0;line-height:1.5}
.rd .rd-er .sl a{color:var(--fg);font-weight:500;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:2px;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:0 1 auto}
.rd .rd-er .sl>span{flex:0 3 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
.rd .rd-er .sl>span:last-child{flex-shrink:12}
.rd .rd-er .sl .rd-sub{font-size:12px}
.rd .rd-er .ds{grid-column:3/5;font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;line-height:1.45}
.rd .rd-er.sel{background:var(--tint);box-shadow:inset 3px 0 0 var(--c)}
.rd .rd-tl{color:var(--brand);font:600 14px var(--body);text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px;white-space:nowrap}
.rd .rd-evl .nextw{justify-self:center;margin:10px 0 4px}
.rd .rd-ds{background:var(--surface);border-radius:16px;padding:8px 8px 6px;display:grid;gap:4px;box-shadow:inset 0 0 0 1px var(--line);min-width:0}
.rd .rd-ds .h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px}
.rd .rd-ds .h b{font:600 14px var(--display)}
.rd .rd-ds .h .nv{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--fg);flex:none}
.rd .rd-ds .h svg.i{width:16px;height:16px}
.rd .rd-ds .g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.rd .rd-ds .g>span{display:grid;justify-items:center;gap:2px;padding:4px 0;border-radius:12px}
.rd .rd-ds small{font:600 10px var(--body);color:var(--muted)}
.rd .rd-ds .g b{font:600 17px/1.1 var(--display);font-variant-numeric:tabular-nums}
.rd .rd-ds .g i{width:5px;height:5px;border-radius:50%;background:var(--brand)}
.rd .rd-ds .no b{color:var(--muted);opacity:.6}
.rd .rd-ds .no i{visibility:hidden}
.rd .rd-ds .we{background:var(--tint)}
.rd .rd-ds .we small{color:var(--fg)}
.rd .rd-ds .td{background:var(--bg);box-shadow:inset 0 0 0 1.5px var(--line)}
.rd .rd-ds .sel{background:var(--brand)}
.rd .rd-ds .sel b,.rd .rd-ds .sel small{color:var(--on-brand)}
.rd .rd-ds .sel i{background:var(--on-brand)}

/* ── Panels and sheets (group and event) */
.rd .rd-pnl{background:var(--surface);display:grid;align-content:start;min-width:0;width:360px;max-width:100%;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.rd .rd-pnl .pic{height:120px;background-size:cover;background-position:center;position:relative;background-color:color-mix(in srgb,var(--c) 20%,var(--surface))}
.rd .rd-pnl .x{position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:50%;background:var(--surface);color:var(--fg);display:grid;place-items:center}
.rd .rd-pnl .bd{padding:14px 18px 18px;display:grid;gap:9px}
.rd .rd-pnl h3{font-size:20px}
.rd .rd-pnl p{margin:0;font-size:14px}
.rd .rd-pnl .facts{display:inline-flex;align-items:flex-start;gap:6px;font-size:14px;color:var(--muted)}
.rd .rd-pnl .facts svg.i{width:16px;height:16px;margin-top:3px}
.rd .rd-pnl .note{display:flex;gap:6px;font:italic 400 14px var(--body);color:var(--brand)}
.rd .rd-pnl .note svg.i{width:15px;height:15px;margin-top:3px}
.rd .rd-pnl .bd>.rd-btn{width:100%}
.rd .rd-pnl .bd>.rd-lnk{justify-self:center}
.rd .rd-pnl .act{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.rd .rd-pnl .org{font-size:13px;color:var(--muted)}
.rd .rd-pnl .org a{color:var(--fg);font-weight:600}
.rd .rd-pnl .going{font-size:14px;color:var(--muted);display:flex;align-items:center;gap:6px}
.rd .faces{display:inline-flex}
.rd .faces i{width:20px;height:20px;border-radius:50%;border:2px solid var(--surface);margin-left:-6px;display:block;background:#c9b8a6}
.rd .faces i:first-child{margin-left:0}
.rd .faces i:nth-child(2){background:#a8bfa0}
.rd .faces i:nth-child(3){background:#d6a99a}
.rd .rd-pnl.sheet{border:0;border-radius:24px 24px 0 0;width:100%}
.rd .rd-pnl.sheet .grab{width:40px;height:4px;border-radius:2px;background:var(--line);margin:8px auto}
.rd .rd-pnl.sheet .pic{height:96px}

/* ── Pop-up stages: dim, dim + blur, dialog, side panel, sheet, drawer */
.rd .rd-stage{position:relative;overflow:hidden}
.rd .rd-scrim{position:absolute;inset:0;background:color-mix(in srgb,#000 30%,transparent);z-index:1}
.rd .rd-scrim.blur{backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px)}
.rd .rd-stage>.rd-dlg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;box-shadow:0 14px 34px rgba(0,0,0,.25)}
.rd .rd-stage>.rd-pnl{position:absolute;top:0;right:0;bottom:0;border-radius:0;border:0;z-index:2;box-shadow:-14px 0 34px rgba(0,0,0,.18)}
.rd .rd-stage>.rd-pnl.sheet{top:auto;left:0;right:0;bottom:0;border-radius:24px 24px 0 0;box-shadow:0 -10px 30px rgba(0,0,0,.18)}
.rd .rd-stage>.rd-drw{position:absolute;top:0;left:0;bottom:0;width:80%;z-index:2}
.rd .rd-stage>.rd-side{position:absolute;top:0;right:0;bottom:0;width:360px;max-width:92%;z-index:2;box-shadow:-14px 0 34px rgba(0,0,0,.18)}
.rd .rd-stage>.rd-drop-at{position:absolute;z-index:2}
.rd .rd-dlg{width:420px;max-width:calc(100% - 24px);background:var(--surface);border-radius:16px;padding:18px;display:grid;gap:10px}
.rd .rd-dlg .h{font:600 18px var(--display)}
.rd .rd-dlg p{margin:0;font-size:14px;color:var(--muted)}
.rd .rd-dlg .row{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.rd .rd-toast{display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:10px 16px;border-radius:12px;background:var(--fg);color:var(--bg);font:500 14px var(--body);box-shadow:0 10px 28px rgba(0,0,0,.2)}
.rd .rd-toast svg.i{width:16px;height:16px}
.rd .rd-stage>.rd-toast{position:absolute;left:50%;bottom:72px;transform:translateX(-50%);z-index:2;white-space:nowrap}
.rd .rd-ta{display:block;min-height:84px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--line);padding:10px 12px;font-size:14px;background:var(--bg)}
.rd .rd-tgl{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:12px;background:var(--tint);font-size:14px;font-weight:600}
.rd .rd-tgl .k{width:40px;height:24px;border-radius:999px;background:var(--line);position:relative;flex:none}
.rd .rd-tgl .k::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25)}
.rd .rd-tgl .k.on{background:var(--brand)}
.rd .rd-tgl .k.on::after{left:18px}
.rd .rd-drw{background:var(--surface);box-shadow:14px 0 34px rgba(0,0,0,.2);padding:14px 10px;display:grid;align-content:start;gap:4px;overflow:hidden}
.rd .rd-drw .h{display:flex;align-items:center;gap:10px;padding:0 6px 12px;margin-bottom:4px;border-bottom:1px solid var(--line);min-width:0}
.rd .rd-drw .h>span:last-child{display:grid;min-width:0;line-height:1.3}
.rd .rd-drw .h b{font:600 16px var(--display)}
.rd .rd-drw .h small{font-size:12px;color:var(--muted)}

/* ── Group page */
.rd .rd-gban{background:linear-gradient(120deg,color-mix(in srgb,var(--c) 22%,var(--surface)),color-mix(in srgb,var(--c) 7%,var(--surface)));padding:0 22px;height:96px;box-sizing:border-box;display:flex;align-items:center;border-bottom:1px solid var(--line)}
.rd .rd-gban .gid{flex:1;min-width:0}
.rd .rd-gban .gid{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.rd .rd-gban .t{flex:1;min-width:200px;display:grid;gap:5px}
.rd .rd-gban h3{font-size:20px}
.rd .rd-gban .sig{display:flex;align-items:baseline;gap:4px 14px;flex-wrap:wrap}
.rd .rd-gban .q{font-size:13px;color:var(--muted)}
.rd .rd-gban .acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.rd .rd-gpic{width:64px;height:64px;border-radius:18px;background-color:color-mix(in srgb,var(--c) 22%,var(--surface));color:var(--c);display:grid;place-items:center;flex:none;background-size:cover;background-position:center}
.rd .rd-gpic svg{width:28px;height:28px}
.rd .rd-gpic.md{width:44px;height:44px;border-radius:13px}
.rd .rd-gpic.sm{width:34px;height:34px;border-radius:10px}
.rd .rd-gpic.sm svg{width:18px;height:18px}
.rd .rd-gbar{display:flex;align-items:center;flex-wrap:nowrap;gap:8px 10px;padding:0 12px;height:64px;box-sizing:border-box;background:var(--surface);border-bottom:1px solid var(--line);min-width:0}
.rd .rd-gbar .t{display:grid;flex:1;min-width:0;line-height:1.3}
.rd .rd-gbar .t b{font:600 15px var(--display);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd .rd-gbar .t small{font-size:12px;color:var(--muted)}
.rd .rd-gbar .act{flex:none;display:flex;gap:8px}
.rd .mbtn{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--tint);color:var(--fg);flex:none}
.rd .mbtn.q{background:transparent}
.rd .rd-frame{display:grid;grid-template-columns:190px minmax(0,1fr);gap:22px;padding:18px 22px 22px}
.rd .rd-frame.side{grid-template-columns:190px minmax(0,1fr) 250px}
.rd .rd-gnav{display:grid;gap:1px;font-size:14px;align-content:start;min-width:0}
.rd .rd-gnav>span{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:12px;white-space:nowrap}
.rd .rd-gnav>span.on{background:var(--tint);font-weight:600}
.rd .rd-gnav svg.i{width:16px;height:16px;color:var(--muted)}
.rd .rd-gnav em{margin-left:auto;font:normal 600 11px var(--body);background:var(--tint);border-radius:999px;padding:1px 8px;color:var(--muted)}
.rd .rd-gnav>span.on em{background:var(--surface)}
.rd .rd-main{display:grid;gap:12px;align-content:start;min-width:0}
.rd .rd-pt{font:600 20px var(--display);margin:0}
.rd .rd-tabs{display:flex;gap:18px;font-size:14px;color:var(--muted);border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none}
.rd .rd-tabs::-webkit-scrollbar{display:none}
.rd .rd-tabs span{padding-bottom:8px;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px}
.rd .rd-tabs .on{color:var(--fg);font-weight:600;border-color:var(--brand)}
.rd .rd-art{background:var(--surface);border-radius:16px;padding:14px 18px;font-size:15px}
.rd .rd-art p{margin:0}
.rd .rd-box2{background:var(--surface);border-radius:16px;padding:10px 14px 4px;display:grid}
.rd .rd-box2 .bh{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font:600 13px var(--body);color:var(--muted)}
.rd .rd-box2 .bh span{display:inline-flex;align-items:center;gap:4px;color:var(--brand);font-weight:600}
.rd .rd-box2 .bh svg.i{width:14px;height:14px}
.rd .rd-rows{background:var(--surface);border-radius:16px;padding:2px 16px;display:grid}
.rd .rd-rows>div{padding:10px 0;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
.rd .rd-rows>div:first-child{border-top:0}
.rd .rd-rows b{color:var(--fg)}
.rd .rd-roles{display:grid;background:var(--surface);border-radius:16px;padding:4px 16px;font-size:14px}
.rd .rd-roles>div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px solid var(--line)}
.rd .rd-roles>div:first-child{border-top:0}
.rd .rd-roles b{font-weight:600}
.rd .rd-roles span{color:var(--muted)}

/* ── Own area */
.rd .rd-phd{display:flex;align-items:center;gap:12px;padding:14px 22px;background:var(--surface);border-bottom:1px solid var(--line);min-width:0}
.rd .rd-phd .t{display:grid;min-width:0;line-height:1.3}
.rd .rd-phd b{font:600 19px var(--display)}
.rd .rd-phd small{font-size:13px;color:var(--muted)}
.rd .rd-feed{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:16px;align-items:start}
.rd .rd-fsec{font:600 13px var(--body);color:var(--muted);margin:6px 2px -4px}
.rd .rd-fi{background:var(--surface);border-radius:16px;padding:11px 14px;display:grid;gap:3px;min-width:0}
.rd .rd-fi .w{font-size:13px;color:var(--muted);display:flex;gap:4px 8px;align-items:center;flex-wrap:wrap}
.rd .rd-fi .w>svg.i{width:14px;height:14px}
.rd .rd-fi .w a{color:var(--fg);font-weight:600;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:2px}
.rd .rd-fi b{font:600 15px var(--display)}
.rd .rd-fi p{margin:0;font-size:14px}
.rd .rd-fend{font:italic 400 13px var(--body);color:var(--muted);text-align:center;margin:2px 0 0}
.rd .rd-rq{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13px;color:var(--muted);min-width:0;border-top:1px solid var(--line)}
.rd .rd-rq:first-child{border-top:0}
.rd .rd-rq>span:first-child{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd .rd-rql{display:grid;padding:2px 14px;border-radius:16px;box-shadow:inset 0 0 0 1px var(--line)}
.rd .rd-radio{display:grid;gap:6px;background:var(--surface);border-radius:16px;padding:14px 16px;font-size:14px}
.rd .rd-radio b{font:600 15px var(--display)}
.rd .rd-radio span{display:flex;align-items:center;gap:10px}
.rd .rd-radio i{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--muted);flex:none}
.rd .rd-radio i.on{box-shadow:inset 0 0 0 5px var(--brand)}

/* ── Notifications and conversations */
.rd .rd-ntp{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;width:380px;max-width:100%;box-shadow:0 10px 28px rgba(0,0,0,.12)}
.rd .rd-ntp .hh{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line)}
.rd .rd-ntp .hh b{font:600 15px var(--display)}
.rd .rd-ntp .hh a,.rd .rd-ntp .all{font-size:12px;color:var(--brand);font-weight:600}
.rd .rd-ntp .all{display:block;text-align:center;padding:9px;border-top:1px solid var(--line)}
.rd .rd-ntp .tabs{display:flex;gap:2px;padding:3px;margin:8px 14px 0;border-radius:999px;background:var(--tint)}
.rd .rd-ntp .tabs span{flex:1;text-align:center;font-size:13px;padding:4px;border-radius:999px;color:var(--muted)}
.rd .rd-ntp .tabs .on{background:var(--surface);color:var(--fg);font-weight:600}
.rd .rd-ntp .tabs small{font-size:11px;margin-left:4px}
.rd .rd-nsec{font:600 11px var(--body);color:var(--muted);padding:8px 14px 2px}
.rd .rd-nti{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:8px;padding:8px 14px;border-top:1px solid var(--line);align-items:start;min-width:0}
.rd .rd-nsec+.rd-nti{border-top:0}
.rd .rd-nti .ic{color:var(--muted);margin-top:1px}
.rd .rd-nti .ic svg.i{width:15px;height:15px}
.rd .rd-nti.u .ic{color:var(--brand)}
.rd .rd-nti .b{display:grid;gap:1px;min-width:0}
.rd .rd-nti .w{font-size:13px;line-height:1.35;margin:0}
.rd .rd-nti.u .w{font-weight:600}
.rd .rd-nti .w b{font-weight:inherit}
.rd .rd-nti .w a{text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:2px;font-weight:inherit}
.rd .rd-nti .q{font-size:11px;color:var(--muted);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd .rd-nti .q .rd-cat,.rd .rd-nti .q .rd-sub{font-size:11px}
.rd .rd-nti .q .rd-cat::before{width:7px;height:7px}
.rd .rd-nti .tm{font-size:11px;color:var(--muted);white-space:nowrap;display:grid;justify-items:end;gap:4px}
.rd .rd-nti .dot,.rd .rd-cvi .dot{width:7px;height:7px;border-radius:50%;background:var(--brand);display:block}
.rd .rd-empty{padding:24px 16px 28px;display:grid;justify-items:center;gap:6px;text-align:center}
.rd .rd-empty svg.i{width:28px;height:28px;color:var(--muted);stroke-width:1.6}
.rd .rd-empty b{font:600 16px var(--display)}
.rd .rd-empty p{margin:0;font:italic 400 13px var(--body);color:var(--brand);max-width:30ch}
.rd .rd-cvl{background:var(--surface);display:grid;align-content:start;min-width:0}
.rd .rd-cvl .top{padding:12px 14px 10px;display:grid;gap:8px;border-bottom:1px solid var(--line)}
.rd .rd-cvl .top b{font:600 17px var(--display)}
.rd .rd-cvl .chips{display:flex;gap:4px}
.rd .rd-cvl .chips span{font-size:12px;padding:3px 10px;border-radius:999px;background:var(--tint);color:var(--muted)}
.rd .rd-cvl .chips .on{background:var(--fg);color:var(--surface);font-weight:600}
.rd .rd-cvl .all{display:block;text-align:center;padding:9px;font-size:12px;color:var(--brand);font-weight:600;border-top:1px solid var(--line)}
.rd .rd-cvi{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;padding:10px 14px;border-top:1px solid var(--line);align-items:start;min-width:0}
.rd .rd-cvl .top+.rd-cvi{border-top:0}
.rd .rd-cvi.on{background:var(--tint)}
.rd .rd-cvi .av{width:38px;height:38px;border-radius:50%;background:var(--tint);display:grid;place-items:center;font:600 15px var(--display)}
.rd .rd-cvi .av.g{border-radius:11px;background:color-mix(in srgb,var(--c) 20%,var(--surface));color:var(--c)}
.rd .rd-cvi .av.g svg{width:19px;height:19px}
.rd .rd-cvi .t{display:grid;gap:1px;min-width:0}
.rd .rd-cvi .t b{font:600 14px/1.3 var(--display);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd .rd-cvi .l{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd .rd-cvi.u .l{font-weight:600}
.rd .rd-cvi .q{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden}
.rd .rd-cvi .q svg.i{width:12px;height:12px}
.rd .rd-cvi .q .rd-cat,.rd .rd-cvi .q .rd-sub{font-size:11px}
.rd .rd-cvi .q .rd-cat::before{width:7px;height:7px}
.rd .rd-cvi .tm{font-size:11px;color:var(--muted);display:grid;justify-items:end;gap:5px}
.rd .rd-chat{background:var(--bg);display:grid;grid-template-rows:auto 1fr;min-width:0;border-left:1px solid var(--line)}
.rd .rd-chat .ch{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface);border-bottom:1px solid var(--line)}
.rd .rd-chat .ch b{font:600 15px var(--display)}
.rd .rd-chat .ch small{font-size:11px;color:var(--muted);display:block}
.rd .rd-chat .ms{padding:12px 14px;display:grid;gap:8px;align-content:start}
.rd .rd-chat .sys{display:flex;align-items:center;gap:10px;font:italic 400 12px var(--body);color:var(--muted)}
.rd .rd-chat .sys::before,.rd .rd-chat .sys::after{content:"";flex:1;height:1px;background:var(--line)}
.rd .rd-chat .bb{max-width:78%;display:grid;gap:2px;justify-items:start}
.rd .rd-chat .bb.me{justify-self:end;justify-items:end}
.rd .rd-chat .bb p{margin:0;padding:7px 12px;border-radius:16px 16px 16px 4px;background:var(--surface);font-size:14px;border:1px solid var(--line)}
.rd .rd-chat .bb.me p{border-radius:16px 16px 4px 16px;background:var(--brand);color:var(--on-brand);border-color:var(--brand)}
.rd .rd-chat .bb small{font-size:11px;color:var(--muted)}
.rd .rd-two{display:grid;grid-template-columns:320px minmax(0,1fr);min-height:300px;border-radius:16px;overflow:hidden;border:1px solid var(--line)}

/* ── Admin */
.rd .rd-atabs{display:flex;gap:2px;padding:12px 18px 0;border-bottom:1px solid var(--line);font-size:14px;color:var(--muted);background:var(--surface);box-shadow:0 6px 12px -8px rgba(0,0,0,.3);position:relative}
.rd .rd-atabs span{padding:7px 12px 9px;border-bottom:2px solid transparent;white-space:nowrap;display:flex;gap:6px;align-items:center}
.rd .rd-atabs .on{color:var(--fg);font-weight:600;border-color:var(--brand)}
.rd .rd-atabs em,.rd .rd-amenu em{font:normal 600 11px var(--body);background:var(--tint);border-radius:999px;padding:1px 7px;color:var(--muted)}
.rd .rd-amenu{display:grid;align-content:start;gap:1px;font-size:14px;min-width:0}
.rd .rd-amenu>span{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;border-radius:12px}
.rd .rd-amenu .on{background:var(--tint);font-weight:600}
.rd .rd-amenu .par{font-weight:600}
.rd .rd-amenu .par svg.i{width:16px;height:16px;color:var(--muted)}
.rd .rd-amenu .subs{display:grid;gap:1px;margin:2px 0 6px 16px;padding-left:6px;border-left:1px solid var(--line)}
.rd .rd-amenu .subs span{padding:5px 10px;font-size:13px;border-radius:10px}
.rd .rd-amenu .subs .on{background:var(--tint);font-weight:600}
.rd .rd-apg{display:grid;gap:10px;align-content:start;min-width:0}
.rd .rd-apg h4{font-size:20px}
.rd .rd-apg>p{margin:0;font-size:14px;color:var(--muted)}
.rd .rd-krow{display:grid;grid-template-columns:28px minmax(0,1fr) auto auto auto;gap:10px;align-items:center;padding:7px 0;border-top:1px solid var(--line);font-size:14px}
.rd .rd-krow:first-child{border-top:0}
.rd .ki{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 18%,var(--surface));color:var(--c)}
.rd .ki svg{width:16px;height:16px}
.rd .kbox{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
.rd .kbox i{width:22px;height:22px;border-radius:6px;background:var(--x);box-shadow:inset 0 0 0 1px var(--line)}
.rd .aa{font:600 11px var(--body);color:var(--brand);background:var(--tint);border-radius:999px;padding:2px 8px;white-space:nowrap}

/* ── Identity */
.rd .wm{font:600 36px/1 var(--display);color:var(--brand);display:inline-flex;align-items:center;white-space:nowrap}
.rd .wm em{font-weight:500}
.rd .wm::after{content:"";width:16px;height:16px;border-radius:50%;flex:none;background:var(--brand);box-shadow:12px 0 0 0 color-mix(in srgb,var(--brand) 45%,transparent);margin:0 12px 0 8px}
.rd .wm-ic{width:40px;height:40px;border-radius:12px;background:var(--tint);position:relative;flex:none}
.rd .wm-ic::after{content:"";position:absolute;left:8px;top:12px;width:16px;height:16px;border-radius:50%;background:var(--brand);box-shadow:8px 0 0 0 color-mix(in srgb,var(--brand) 45%,transparent)}
.rd .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rd .sw{width:34px;height:34px;border-radius:50%;background:var(--s);flex:none;box-shadow:inset 0 0 0 1px var(--line)}
.rd .spec-h{font:600 28px/1.15 var(--display);margin:0}
.rd .spec-b{font:400 17px/1.6 var(--body);margin:0;max-width:62ch}
.rd .spec-i{font:italic 400 14px var(--body);color:var(--brand);margin:0}
.rd .ktab{display:grid;background:var(--surface);border-radius:16px;padding:2px 16px}
.rd .ktab>div{display:grid;grid-template-columns:28px minmax(0,1.5fr) minmax(0,1fr) 112px 112px;gap:12px;align-items:center;padding:7px 0;border-top:1px solid var(--line);font-size:14px}
.rd .ktab>div:first-child{border-top:0}
.rd .ktab .kh{font:600 12px var(--body);color:var(--muted)}
.rd .ktab small{color:var(--muted);font-size:12px}
@media (max-width:640px){.rd .ktab>div{grid-template-columns:28px minmax(0,1fr) 92px 92px}.rd .ktab .hx{display:none}}
.rd .kch{display:inline-flex;align-items:center;justify-content:center;height:26px;padding:0 10px;border-radius:999px;font:600 12px var(--body);white-space:nowrap}
.rd .kch.l{color:#fff}
.rd .kch.d{color:#161814}
.rd .credits{font-size:12px;color:var(--muted);margin:0}

/* ── Research alternatives */
.rd .rd-alts{display:grid;gap:14px}
.rd .rd-alt{background:var(--surface);border-radius:16px;padding:14px 16px;display:grid;gap:10px;min-width:0}
.rd .rd-alt .ah{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.rd .rd-alt .ah b{font:600 17px var(--display)}
.rd .rd-alt p{margin:0;font-size:14px;color:var(--muted)}
.rd .rd-alt .src{font-size:12px}
.rd .rd-alt .rd-crop{background:var(--bg)}

/* real photos (Wikimedia Commons, free licences, credited under the group card) */
.rd .ph-dance{--img:url("https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Latvia%2C_Riga%2C_Dzintarins_Folk_Dance_Ensemble_150502-1.jpg/500px-Latvia%2C_Riga%2C_Dzintarins_Folk_Dance_Ensemble_150502-1.jpg")}
.rd .ph-bog{--img:url("https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/%C4%B6emeru_purva_laipa.jpg/500px-%C4%B6emeru_purva_laipa.jpg")}
.rd .ph-nordic{--img:url("https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Nordic_Walking_Group.jpg/500px-Nordic_Walking_Group.jpg")}
.rd .ph-games{--img:url("https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/People_playing_board_game_during_session_%27Play_Wikeys%2C_the_board_game_to_discover_Wikipedia%27_at_Wikimania_2026%2C_day_3.jpg/500px-People_playing_board_game_during_session_%27Play_Wikeys%2C_the_board_game_to_discover_Wikipedia%27_at_Wikimania_2026%2C_day_3.jpg")}
.rd .ph-river{--img:url("https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Lielupe_promenade_-_Igors_Jefimovs_-_Panoramio.jpg/500px-Lielupe_promenade_-_Igors_Jefimovs_-_Panoramio.jpg")}
.rd .ph-dance,.rd .ph-bog,.rd .ph-nordic,.rd .ph-games,.rd .ph-river{background-image:var(--img);background-size:cover;background-position:center}
html.dark .rd .rd-gc .pic:not(.ph),html.dark .rd .rd-gpic:not(.ph){color:var(--c)}
`;
export const CSS_FIX = `
.rd .rd-alts,.rd .rd-alt,.rd .rd-box,.rd .rd-crop,.rd .rd-main,.rd .rd-pnl .bd,.rd .rd-dlg,.rd .rd-pg{grid-template-columns:minmax(0,1fr)}
`;
