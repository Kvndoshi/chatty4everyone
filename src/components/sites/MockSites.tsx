// Static mock websites shown behind the widget in the editor preview.
// Ported from the Claude Design mockup; purely decorative.

export function FlowbaseSite({ mobile = false }: { mobile?: boolean }) {
  const desk = !mobile, mob = mobile;
  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', color: '#1a1a2e', background: '#f8f9fc', width: '100%' }}>
      {desk && (<>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '60px', background: '#fff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontWeight: '700', fontSize: '18px', color: '#4f46e5', letterSpacing: '-.5px' }}>Flowbase</div>
          <div style={{ display: 'flex', gap: '28px', fontSize: '14px', color: '#6b7280' }}><span>Product</span><span>Pricing</span><span>Docs</span><span>Blog</span></div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', padding: '8px 14px' }}>Sign in</span><span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', background: '#4f46e5', padding: '9px 20px', borderRadius: '8px' }}>Get started free</span></div>
        </div>
        <div style={{ padding: '96px 48px 80px', textAlign: 'center', background: 'linear-gradient(160deg,#eef2ff 0%,#f8f9fc 60%)' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', letterSpacing: '-1.5px', color: '#0f0d2a', lineHeight: '1.1', maxWidth: '720px', margin: '0 auto' }}>Ship faster with <span style={{ color: '#4f46e5' }}>AI-powered</span> workflows</h1>
          <p style={{ margin: '20px auto 0', fontSize: '18px', color: '#6b7280', maxWidth: '520px', lineHeight: '1.6' }}>Automate repetitive tasks, collaborate in real time, and deliver results your customers will love.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '36px' }}><span style={{ fontSize: '16px', fontWeight: '600', padding: '14px 32px', borderRadius: '10px', color: '#fff', background: '#4f46e5' }}>Start for free</span><span style={{ fontSize: '16px', fontWeight: '600', padding: '14px 32px', borderRadius: '10px', color: '#374151', background: '#fff', border: '1px solid #e5e7eb' }}>Watch demo</span></div>
          <div style={{ maxWidth: '1000px', margin: '60px auto 0', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 40px 90px -30px rgba(79,70,229,.45),0 0 0 8px rgba(79,70,229,.05)', overflow: 'hidden', textAlign: 'left' }}>
            <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid #eef0f4', fontSize: '13px', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#4f46e5', color: '#fff', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>F</span>Workflows <span style={{ color: '#d1d5db' }}>/</span> <span style={{ color: '#111827', fontWeight: '600' }}>Inbound lead routing</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '600' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>Live · 1,284 runs today</span><span style={{ padding: '6px 12px', borderRadius: '7px', background: '#4f46e5', color: '#fff', fontWeight: '600' }}>Publish</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 250px', height: '340px' }}>
              <div style={{ borderRight: '1px solid #eef0f4', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px', color: '#4b5563', background: '#fafbfc' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>Workflows</div>
                <div style={{ padding: '7px 8px', borderRadius: '7px', background: '#eef2ff', color: '#4338ca', fontWeight: '600' }}>Inbound lead routing</div>
                <div style={{ padding: '7px 8px' }}>Churn-risk alerts</div><div style={{ padding: '7px 8px' }}>Invoice reminders</div><div style={{ padding: '7px 8px' }}>Onboarding emails</div><div style={{ padding: '7px 8px' }}>Weekly KPI digest</div>
              </div>
              <div style={{ position: 'relative', backgroundColor: '#fbfbfd', backgroundImage: 'radial-gradient(#e5e7eb 1px,transparent 1px)', backgroundSize: '16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
                <div style={{ width: '250px', padding: '11px 13px', borderRadius: '10px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(17,24,39,.06)', display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</span><div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', letterSpacing: '.04em' }}>TRIGGER</div><div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111827' }}>New demo request</div></div></div>
                <div style={{ width: '2px', height: '22px', background: '#c7d2fe' }}></div>
                <div style={{ width: '250px', padding: '11px 13px', borderRadius: '10px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(17,24,39,.06)', display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◎</span><div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', letterSpacing: '.04em' }}>ENRICH</div><div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111827' }}>Look up company size</div></div></div>
                <div style={{ width: '2px', height: '22px', background: '#c7d2fe' }}></div>
                <div style={{ width: '250px', padding: '11px 13px', borderRadius: '10px', background: '#fff', border: '2px solid #4f46e5', boxShadow: '0 6px 18px -6px rgba(79,70,229,.5)', display: 'flex', gap: '10px', alignItems: 'center', boxSizing: 'border-box' }}><span style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⑂</span><div><div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', letterSpacing: '.04em' }}>CONDITION</div><div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111827' }}>Employees &gt; 50</div></div></div>
                <div style={{ width: '2px', height: '22px', background: '#c7d2fe' }}></div>
                <div style={{ display: 'flex', gap: '16px' }}><div style={{ width: '150px', padding: '10px 12px', borderRadius: '10px', background: '#fff', border: '1px solid #e5e7eb', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Notify #sales</div><div style={{ width: '150px', padding: '10px 12px', borderRadius: '10px', background: '#fff', border: '1px solid #e5e7eb', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Add to nurture</div></div>
              </div>
              <div style={{ borderLeft: '1px solid #eef0f4', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', letterSpacing: '.06em', textTransform: 'uppercase' }}>Condition</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><span style={{ color: '#6b7280', fontSize: '12px' }}>Field</span><span style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', color: '#111827' }}>company.employees</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><span style={{ color: '#6b7280', fontSize: '12px' }}>Operator</span><span style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', color: '#111827' }}>is greater than</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><span style={{ color: '#6b7280', fontSize: '12px' }}>Value</span><span style={{ padding: '8px 10px', border: '1px solid #4f46e5', borderRadius: '7px', color: '#111827', boxShadow: '0 0 0 3px #eef2ff' }}>50</span></div>
                <div style={{ marginTop: 'auto', padding: '10px', borderRadius: '8px', background: '#f9fafb', color: '#6b7280', fontSize: '12px', lineHeight: '1.5' }}>Last run 2 min ago · <span style={{ color: '#059669', fontWeight: '600' }}>passed</span> for Acme Corp (212 employees)</div>
              </div>
            </div>
          </div>
        </div>
      </>)}
      {mob && (<>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '56px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: '700', fontSize: '18px', color: '#4f46e5', letterSpacing: '-.5px' }}>Flowbase</div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', background: '#4f46e5', padding: '8px 14px', borderRadius: '8px' }}>Get started</span>
        </div>
        <div style={{ padding: '52px 20px 44px', textAlign: 'center', background: 'linear-gradient(160deg,#eef2ff 0%,#f8f9fc 60%)' }}>
          <h1 style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1px', color: '#0f0d2a', lineHeight: '1.1', margin: '0' }}>Ship faster with <span style={{ color: '#4f46e5' }}>AI-powered</span> workflows</h1>
          <p style={{ margin: '16px 0 0', fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>Automate repetitive tasks, collaborate in real time, and deliver results your customers will love.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px' }}><span style={{ fontSize: '15px', fontWeight: '600', padding: '13px', borderRadius: '10px', color: '#fff', background: '#4f46e5' }}>Start for free</span><span style={{ fontSize: '15px', fontWeight: '600', padding: '13px', borderRadius: '10px', color: '#374151', background: '#fff', border: '1px solid #e5e7eb' }}>Watch demo</span></div>
        </div>
      </>)}
      <div style={{ padding: '40px 24px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', textAlign: 'center' }}>
          <div><div style={{ fontSize: '28px', fontWeight: '800', color: '#4f46e5' }}>12k+</div><div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Teams onboarded</div></div>
          <div><div style={{ fontSize: '28px', fontWeight: '800', color: '#4f46e5' }}>99.9%</div><div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Uptime SLA</div></div>
          <div><div style={{ fontSize: '28px', fontWeight: '800', color: '#4f46e5' }}>4.9★</div><div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Average rating</div></div>
        </div>
      </div>
      <div style={{ padding: '12px 24px', background: '#f8f9fc', borderTop: '1px solid #e5e7eb' }}><p style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#9ca3af', textAlign: 'center', letterSpacing: '.5px' }}>TRUSTED BY TEAMS AT</p></div>
      <div style={{ padding: '64px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px 28px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}><div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '22px' }}>⚡</div><h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Lightning Fast</h3><p style={{ margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>Workflows execute in milliseconds. No more waiting for slow batch jobs to complete overnight.</p></div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px 28px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}><div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '22px' }}>🔗</div><h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>200+ Integrations</h3><p style={{ margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>Connect Slack, Notion, GitHub, Salesforce and more with one-click OAuth — no API keys needed.</p></div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px 28px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}><div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '22px' }}>🛡️</div><h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Enterprise Security</h3><p style={{ margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>SOC 2 Type II certified. All data encrypted in transit and at rest. GDPR compliant by default.</p></div>
      </div>
    </div>
  );
}

export type MockSite = "saas" | "docs" | "shop" | "blank";

export function BackdropSite({ site, mobile = false }: { site: MockSite; mobile?: boolean }) {
  const isSaas = site === "saas", isDocs = site === "docs", isShop = site === "shop", isBlank = site === "blank";
  const desk = !mobile;
  const pad = mobile ? "20px" : "48px";
  const shopCols = mobile ? "1fr" : "1fr 1fr";
  const shopGap = mobile ? "24px" : "64px";
  return (
    <div style={{ width: '100%', fontFamily: 'system-ui,-apple-system,sans-serif', color: '#1a1a2e' }}>
      {isSaas && (<>
        <FlowbaseSite mobile={mobile} />
      </>)}
      {isDocs && (<>
        <div style={{ background: '#fff', minHeight: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '52px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>Docs <span style={{ color: '#4f46e5' }}>|</span> Flowbase</div>
              {desk && (<><div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: '#9ca3af', width: '220px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>Search docs…<span style={{ marginLeft: 'auto', background: '#e5e7eb', borderRadius: '4px', padding: '1px 5px', fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>⌘K</span></div></>)}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: '#6b7280' }}>{desk && (<><span>GitHub</span><span>Changelog</span></>)}<span style={{ background: '#4f46e5', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontSize: '13px' }}>Dashboard →</span></div>
          </div>
          <div style={{ display: 'flex' }}>
            {desk && (<>
              <div style={{ width: '240px', flexShrink: '0', borderRight: '1px solid #e5e7eb', padding: '20px 0', background: '#fafafa', minHeight: '860px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.8px', padding: '0 16px', marginBottom: '8px' }}>Getting started</div>
                <div style={{ padding: '6px 16px', fontSize: '13.5px', background: '#eef2ff', color: '#4f46e5', fontWeight: '600', borderRight: '2px solid #4f46e5' }}>Introduction</div>
                <div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Quick start</div><div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Installation</div><div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Authentication</div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.8px', padding: '0 16px', margin: '24px 0 8px' }}>Core concepts</div>
                <div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Workflows</div><div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Triggers</div><div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Actions</div><div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Conditions</div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.8px', padding: '0 16px', margin: '24px 0 8px' }}>API Reference</div>
                <div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>REST API</div><div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>Webhooks</div><div style={{ padding: '6px 16px', fontSize: '13.5px', color: '#374151' }}>SDKs</div>
              </div>
            </>)}
            <div style={{ flex: '1', padding: '40px 48px', maxWidth: '720px', boxSizing: 'border-box' }}>
              <h1 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: '800', color: '#111827' }}>Introduction</h1>
              <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#6b7280', lineHeight: '1.7', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>Flowbase is a workflow automation platform that lets you connect apps, automate tasks, and build powerful pipelines — without writing code. This guide covers everything you need to get started.</p>
              <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>What is Flowbase?</h2>
              <p style={{ margin: '0 0 16px', fontSize: '14.5px', color: '#374151', lineHeight: '1.75' }}>Flowbase provides a visual editor to design multi-step automation workflows. Each workflow consists of a <strong>trigger</strong> (the event that starts it) and one or more <strong>actions</strong> (the steps that run in response).</p>
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '14px 18px', margin: '20px 0', fontSize: '14px', color: '#3730a3', lineHeight: '1.6' }}><strong style={{ display: 'block', marginBottom: '4px' }}>Tip</strong>This page is a great place to use the AI assistant — ask it anything about Flowbase and get instant answers.</div>
              <h2 style={{ margin: '36px 0 12px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Installation</h2>
              <div style={{ background: '#1e1e2e', borderRadius: '10px', padding: '20px 24px', margin: '20px 0' }}><pre style={{ margin: '0', fontFamily: 'monospace', fontSize: '13px', color: '#cdd6f4', lineHeight: '1.7', whiteSpace: 'pre' }}><span style={{ color: '#6c7086' }}># Using npm</span>{'\n'}<span style={{ color: '#fab387' }}>npm</span> install @flowbase/sdk</pre></div>
              <p style={{ margin: '0 0 16px', fontSize: '14.5px', color: '#374151', lineHeight: '1.75' }}>Then import and initialize the client in your application.</p>
            </div>
            {desk && (<>
              <div style={{ width: '200px', flexShrink: '0', padding: '40px 20px', borderLeft: '1px solid #e5e7eb', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '12px' }}>On this page</div>
                <div style={{ fontSize: '12.5px', color: '#4f46e5', fontWeight: '600', borderLeft: '2px solid #4f46e5', padding: '4px 0 4px 10px', marginBottom: '4px' }}>What is Flowbase?</div>
                <div style={{ fontSize: '12.5px', color: '#9ca3af', borderLeft: '2px solid #e5e7eb', padding: '4px 0 4px 10px', marginBottom: '4px' }}>Installation</div>
                <div style={{ fontSize: '12.5px', color: '#9ca3af', borderLeft: '2px solid #e5e7eb', padding: '4px 0 4px 10px', marginBottom: '4px' }}>Your first workflow</div>
                <div style={{ fontSize: '12.5px', color: '#9ca3af', borderLeft: '2px solid #e5e7eb', padding: '4px 0 4px 10px' }}>Core concepts</div>
              </div>
            </>)}
          </div>
        </div>
      </>)}
      {isShop && (<>
        <div style={{ background: '#fff', color: '#111827', minHeight: '900px' }}>
          <div style={{ background: '#111827', color: '#fff', textAlign: 'center', fontSize: '12px', padding: '8px', letterSpacing: '.3px' }}>Free shipping on orders over $75 — Use code <strong>SAVE15</strong> for 15% off</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${pad}`, height: '64px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-1px' }}>ARCO</div>
            {desk && (<><div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}><span>New arrivals</span><span>Men</span><span>Women</span><span>Accessories</span><span>Sale</span></div></>)}
            <div style={{ display: 'flex', gap: '16px', color: '#6b7280' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg></div>
          </div>
          <div style={{ padding: `16px ${pad}`, fontSize: '13px', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>Home / Men / Jackets / Classic Quilted Jacket</div>
          <div style={{ display: 'grid', gridTemplateColumns: `${shopCols}`, gap: `${shopGap}`, padding: `32px ${pad}`, maxWidth: '1200px', margin: '0 auto' }}>
            <div><div style={{ width: '100%', aspectRatio: '1', background: 'linear-gradient(135deg,#ddd6fe,#c7d2fe)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>Product image</div></div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '.8px' }}>ARCO Outerwear</p>
              <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '800' }}>Classic Quilted Jacket</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><span style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '1px' }}>★★★★★</span><span style={{ fontSize: '13px', color: '#9ca3af' }}>4.8 (312 reviews)</span></div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>$189 <span style={{ fontSize: '16px', color: '#9ca3af', textDecoration: 'line-through', fontWeight: '400' }}>$249</span></div>
              <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', marginTop: '6px' }}>24% off — limited time</div>
              <div style={{ borderTop: '1px solid #f3f4f6', margin: '20px 0' }}></div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Size</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}><span style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>S</span><span style={{ padding: '8px 16px', border: '1px solid #4f46e5', borderRadius: '8px', fontSize: '14px', color: '#4f46e5', background: '#eef2ff' }}>M</span><span style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>L</span><span style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>XL</span></div>
              <div style={{ width: '100%', padding: '16px', background: '#4f46e5', color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: '700', textAlign: 'center', boxSizing: 'border-box' }}>Add to cart</div>
            </div>
          </div>
        </div>
      </>)}
      {isBlank && (<>
        <div style={{ padding: '48px 40px', color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', background: '#fff', minHeight: '900px', boxSizing: 'border-box' }}><p style={{ margin: '0' }}>Blank canvas — your chatbot appears over this empty page.</p><p style={{ margin: '12px 0 0' }}>Try the SaaS, Docs, or E-commerce themes to see it in context.</p></div>
      </>)}
    </div>
  );
}
