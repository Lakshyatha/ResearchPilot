import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ArrowUpRight, Brain, Check, ChevronRight, CircleDot, FileText, GitBranch, Lightbulb, Network, Search, Sparkles, Telescope } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return (
      <main className="auth-shell">
        <div className="auth-shell-glow" />
        <nav className="auth-nav">
          <a className="brand-lockup" href="#top" onClick={(event) => { event.preventDefault(); setShowAuth(false); }} aria-label="Return to ResearchPilot home">
            <span className="brand-mark"><Brain size={18} /></span><span>ResearchPilot</span>
          </a>
          <button className="back-link" onClick={() => setShowAuth(false)}>Back to home <ArrowUpRight size={15} /></button>
        </nav>
        <section className="auth-view">
          <div className="auth-promise"><div className="eyebrow"><span className="eyebrow-line" /> Your research, with range</div><h1>Pick up where<br /><em>your thinking</em><br />left off.</h1><p>Return to your workspace and keep following the questions that matter.</p><div className="auth-note"><Check size={15} /> Your workspace is waiting.</div></div>
          <div className="auth-card"><div className="auth-card-heading"><span className="card-number">RESEARCHPILOT / ACCESS</span><h2>{isLogin ? 'Welcome back.' : 'Start your workspace.'}</h2><p>{isLogin ? 'Sign in to continue your research.' : 'Create an account to begin.'}</p></div><div className="auth-switcher"><button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Sign in</button><button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Create account</button></div>{isLogin ? <LoginForm onToggle={() => setIsLogin(false)} /> : <RegisterForm onToggle={() => setIsLogin(true)} />}</div>
        </section>
      </main>
    );
  }

  return (
    <main className="landing-shell" id="top">
      <div className="landing-noise" />
      <nav className="landing-nav">
        <a className="brand-lockup" href="#top" aria-label="ResearchPilot home"><span className="brand-mark"><Brain size={18} /></span><span>ResearchPilot</span></a>
        <div className="nav-status"><span className="status-dot" /> Intelligence workspace / 01</div>
        <div className="nav-actions"><a className="nav-link" href="#how-it-works">How it works <ArrowUpRight size={15} /></a><button className="nav-signin" onClick={() => { setIsLogin(true); setShowAuth(true); }}>Sign in <ArrowUpRight size={15} /></button></div>
      </nav>

      <section className="landing-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> Autonomous research intelligence</div>
          <h1>Find the signal<br /><em>before it becomes</em><br />obvious.</h1>
          <p className="hero-lede">ResearchPilot turns scattered papers, competing claims, and emerging ideas into a clear map of what matters next.</p>
          <div className="hero-actions"><button className="primary-cta" onClick={() => { setIsLogin(true); setShowAuth(true); }}>Start exploring <ChevronRight size={18} /></button><a className="text-cta" href="#how-it-works">See the intelligence layer <ArrowUpRight size={16} /></a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>ML</span><span>RK</span><span>+</span></div><div><strong>Built for curious minds</strong><small>From first question to confident direction.</small></div></div>
        </div>

        <div className="product-stage" aria-label="ResearchPilot product preview">
          <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" />
          <div className="stage-label"><CircleDot size={13} /> Live research map</div>
          <div className="map-card map-main">
            <div className="map-header"><span>AI safety / interpretability</span><span className="live-pill">LIVE</span></div>
            <div className="map-canvas"><span className="map-line line-a" /><span className="map-line line-b" /><span className="map-line line-c" /><span className="map-node node-core"><Sparkles size={15} /></span><span className="map-node node-one" /><span className="map-node node-two" /><span className="map-node node-three" /><span className="map-tag tag-one">Mechanistic<br />interpretability</span><span className="map-tag tag-two">Open question</span><span className="map-tag tag-three">New link</span></div>
            <div className="map-footer"><span><GitBranch size={14} /> 42 connected papers</span><span>Updated just now</span></div>
          </div>
          <div className="floating-insight insight-top"><span className="insight-icon amber"><Telescope size={16} /></span><span><small>Emerging insight</small><strong>3 overlooked connections</strong></span><ArrowUpRight size={16} /></div>
          <div className="floating-insight insight-bottom"><span className="insight-icon mint"><Check size={16} /></span><span><small>Research brief</small><strong>Ready for your review</strong></span><FileText size={16} /></div>
          <div className="stage-caption"><span>01</span><span>From noise to next move</span></div>
        </div>

        <div className="landing-rhythm" id="how-it-works"><span>01</span><span>Collect</span><span>Connect</span><span>Clarify</span></div>
      </section>
      <section className="capabilities-section">
        <div className="section-intro"><div className="eyebrow"><span className="eyebrow-line" /> The intelligence layer</div><h2>More than a search bar.<br /><em>A thinking partner.</em></h2><p>ResearchPilot helps you see the shape of a field before you commit your time to it.</p></div>
        <div className="capability-grid">
          <article className="capability-card card-wide"><div className="card-number">01 / DISCOVER</div><div className="capability-icon coral"><Search size={20} /></div><h3>Surface what others miss.</h3><p>Search across your workspace to reveal papers, themes, and research gaps hiding between the lines.</p><button onClick={() => { setIsLogin(true); setShowAuth(true); }}>Explore research gaps <ArrowUpRight size={15} /></button><div className="mini-bars"><span /><span /><span /><span /><span /></div></article>
          <article className="capability-card"><div className="card-number">02 / CONNECT</div><div className="capability-icon green"><Network size={20} /></div><h3>See the field as a system.</h3><p>Map ideas and evidence into a living graph of influence, contradiction, and opportunity.</p><button onClick={() => { setIsLogin(true); setShowAuth(true); }}>Build a knowledge graph <ArrowUpRight size={15} /></button></article>
          <article className="capability-card"><div className="card-number">03 / IMAGINE</div><div className="capability-icon gold"><Lightbulb size={20} /></div><h3>Move from insight to impact.</h3><p>Stress-test an idea, predict its reach, and shape a brief you can share with confidence.</p><button onClick={() => { setIsLogin(true); setShowAuth(true); }}>Simulate an idea <ArrowUpRight size={15} /></button></article>
        </div>
        <div className="quote-strip"><span className="quote-mark">“</span><p>Good research does not just answer questions.<br /><strong>It changes the questions worth asking.</strong></p><span className="quote-source">ResearchPilot principle / 001</span></div>
      </section>
      <section className="closing-section"><div><div className="eyebrow"><span className="eyebrow-line" /> Begin with a question</div><h2>Your next useful<br /><em>connection is waiting.</em></h2></div><button className="primary-cta" onClick={() => { setIsLogin(true); setShowAuth(true); }}>Enter the workspace <ChevronRight size={18} /></button></section>
      <footer className="landing-footer"><span>ResearchPilot AI</span><span>Think wider. Move with evidence.</span><span>© 2026</span></footer>
    </main>
  );
}
