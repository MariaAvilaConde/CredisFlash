<script>
  import { onMount } from 'svelte';
  import { walletAddress, walletBalance, networkName, isConnected, provider } from '$lib/store';
  import { connectWallet, updateBalance } from '$lib/web3';
  import { 
    Wallet, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownLeft, 
    RefreshCw,
    ShieldCheck,
    Coins,
    Zap,
    Lock,
    Globe,
    ChevronDown,
    Activity,
    CreditCard,
    ArrowRight,
    CheckCircle,
    UserCircle
  } from 'lucide-svelte';

  let scrollY = 0;
  let visibleSections = new Set();

  async function handleRefresh() {
    if ($isConnected && $provider && $walletAddress) {
      updateBalance($provider, $walletAddress);
    }
  }

  const landingFeatures = [
    { icon: ShieldCheck, title: 'Seguridad de Élite', desc: 'Protección de nivel institucional integrada en la blockchain.' },
    { icon: Zap, title: 'Velocidad Sin Precedentes', desc: 'Transferencias instantáneas con confirmación en milisegundos.' },
    { icon: Globe, title: 'Global y Abierto', desc: 'Opera desde cualquier lugar del mundo sin intermediarios.' }
  ];

  const stats = [
    { label: 'Volumen Total', value: '$2.5B+' },
    { label: 'Usuarios Trust', value: '150K+' },
    { label: 'Uptime Red', value: '99.9%' }
  ];

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target.id);
          visibleSections = visibleSections;
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  });
</script>

<svelte:window bind:scrollY />

{#if !$isConnected}
  <div class="landing-page-soft">
    <!-- Hero Section -->
    <header class="hero-soft animate-fade-up">
      <div class="hero-info">
        <span class="badge badge-gold">EL FUTURO ES AHORA</span>
        <h1 class="hero-h1">Tu Banca Digital <br/><span class="gradient-text">Premium y Segura</span>.</h1>
        <p class="hero-p">
          Gestione sus activos Web3 con la elegancia y seguridad de una entidad bancaria de élite. 
          CrediFlash: simplicidad, potencia y control absoluto.
        </p>
        <div class="cta-row">
          <button class="btn-primary large pulse" on:click={connectWallet}>
            <Wallet size={20} />
            <span>Iniciar Sesion con Pali</span>
            <ArrowRight size={18} />
          </button>
          <div class="security-check">
            <Lock size={14} />
            <span>Encriptación Bancaria E2E</span>
          </div>
        </div>
      </div>
      
      <div class="hero-graphic animate-fade-up delay-1">
        <div class="mockup-container">
          <div class="premium-card-soft">
            <div class="card-inner">
              <div class="logo-small">⚡ CrediFlash</div>
              <div class="card-chip-gold"></div>
              <div class="card-num">**** **** **** 5599</div>
              <div class="card-foot">
                <span>PREMIUM USER</span>
                <span>EXP: 10/30</span>
              </div>
            </div>
            <div class="card-shine"></div>
          </div>
          <!-- Floating UI Elements -->
          <div class="floating-ui item-1 card">
            <div class="ui-icon green"><Activity size={16} /></div>
            <div class="ui-text">Red: Holesky</div>
          </div>
          <div class="floating-ui item-2 card">
            <div class="ui-icon blue"><Coins size={16} /></div>
            <div class="ui-text">15.5 ETH</div>
          </div>
        </div>
      </div>

      <div class="scroll-down" style="opacity: {scrollY > 50 ? 0 : 1}">
        <ChevronDown size={24} />
      </div>
    </header>

    <!-- Stats Bar -->
    <section class="stats-soft reveal" id="stats" class:visible={visibleSections.has('stats')}>
      {#each stats as stat}
        <div class="stat-box">
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
        </div>
      {/each}
    </section>

    <!-- Features Section -->
    <section class="section reveal" id="features" class:visible={visibleSections.has('features')}>
      <div class="section-title-center">
        <span class="badge">NUESTROS PILARES</span>
        <h2>Diseñado para la Excelencia</h2>
        <p>Experiencia de usuario refinada con tecnología de última generación.</p>
      </div>

      <div class="features-grid-soft">
        {#each landingFeatures as feat, i}
          <div class="feat-card card animate-fade-up" style="animation-delay: {i * 0.15}s">
            <div class="feat-icon-gradient">
              <svelte:component this={feat.icon} size={28} />
            </div>
            <h4>{feat.title}</h4>
            <p>{feat.desc}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Advanced Security & Text Reveal -->
    <section class="section section-text-heavy reveal" id="security-heavy" class:visible={visibleSections.has('security-heavy')}>
      <div class="side-by-side">
        <div class="text-content">
          <span class="badge">SISTEMAS DE GRADO BANCARIO</span>
          <h2>Seguridad Sin Compromisos</h2>
          <p>
            En <strong>CrediFlash</strong>, entendemos que la seguridad no es opcional, es el cimiento de cada transacción. 
            Nuestra plataforma utiliza la potencia de <strong>Ethers.js v6</strong>, la librería más confiable y auditada del 
            ecosistema Web3, para garantizar que cada firma criptográfica se realice de forma aislada y segura en su wallet. 
          </p>
          <p>
            A diferencia de los bancos tradicionales, nosotros no custodiamos sus activos. Su clave privada nunca sale de su control. 
            Implementamos capas de verificación en tiempo real para detectar direcciones erróneas y estimar el gas de la red con 
            precisión absoluta, evitando pérdidas accidentales y optimizando cada centavo de su capital.
          </p>
          <div class="feature-bullets">
            <div class="bullet-item"><CheckCircle size={16} color="var(--success)" /> <span>Compatibilidad total con EIP-1193</span></div>
            <div class="bullet-item"><CheckCircle size={16} color="var(--success)" /> <span>Encriptación de grado militar en comunicación</span></div>
            <div class="bullet-item"><CheckCircle size={16} color="var(--success)" /> <span>Arquitectura de código abierto y auditable</span></div>
          </div>
        </div>
        <div class="visual-decorative">
          <div class="shield-halo">
            <ShieldCheck size={120} color="var(--accent-blue)" strokeWidth={1} />
          </div>
        </div>
      </div>
    </section>

    <!-- Project Vision & Extension -->
    <section class="section section-text-heavy bg-white reveal" id="vision-heavy" class:visible={visibleSections.has('vision-heavy')}>
      <div class="text-center-wide">
        <span class="badge badge-gold">EL FUTURO DE LA BANCA</span>
        <h2>Redefiniendo el Paisaje Financiero Digital</h2>
        <div class="text-columns">
          <p>
            Nacimos con una misión clara: cerrar la brecha entre la solidez de la banca tradicional y la libertad tecnológica 
            que ofrece la descentralización. Creemos que el futuro de las finanzas no se encuentra en oficinas burocráticas, 
            sino en el código inmutable de la blockchain. CrediFlash es el resultado de años de investigación en 
            experiencia de usuario aplicada a sistemas financieros complejos.
          </p>
          <p>
            Nuestro objetivo es que cualquier persona, sin importar su nivel de conocimientos técnicos, pueda gestionar 
            millones en activos con la misma tranquilidad con la que paga un café. Estamos construyendo un ecosistema donde 
            la transparencia es la norma y la eficiencia la regla. Con CrediFlash, usted no es solo un cliente, 
            es el dueño absoluto de su soberanía financiera.
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ Section (More Text) -->
    <section class="section reveal" id="faq" class:visible={visibleSections.has('faq')}>
      <div class="section-title-center">
        <span class="badge">PREGUNTAS ELITE</span>
        <h2>Centro de Conocimiento</h2>
      </div>

      <div class="faq-grid">
        <div class="faq-card card">
          <h5>¿Es CrediFlash un banco custodio?</h5>
          <p>No. CrediFlash es una interfaz de software descentralizada. Nosotros no tenemos acceso a sus fondos ni podemos bloquear sus cuentas. Usted es el único poseedor de sus llaves privadas y el único con poder de decisión sobre sus activos.</p>
        </div>
        <div class="faq-card card">
          <h5>¿Qué redes son compatibles?</h5>
          <p>Actualmente soportamos Ethereum Mainnet, Holesky y Sepolia para pruebas. Nuestra arquitectura está preparada para escalar a soluciones de Capa 2 (L2) asegurando siempre la mayor compatibilidad con Pali Wallet y carteras equivalentes.</p>
        </div>
      </div>
    </section>

    <!-- Final Section - FIXED COLOR -->
    <section class="cta-bottom reveal" id="cta-bottom" class:visible={visibleSections.has('cta-bottom')}>
      <div class="cta-inner-card glass-gold">
        <h2 class="text-black">Únete a la Revolución Financiera</h2>
        <p class="text-black opacity-80">Tome el control total de su futuro digital hoy mismo con la plataforma más avanzada del mercado.</p>
        <button class="btn-primary large" on:click={connectWallet}>
          <span>Comenzar Ahora</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </section>

    <!-- Simple Modern Footer -->
    <footer class="soft-footer">
      <div class="footer-top">
        <div class="footer-logo">Credi<span>Flash</span></div>
        <div class="footer-socials">
          <div class="social-icon"></div>
          <div class="social-icon"></div>
          <div class="social-icon"></div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 CrediFlash Financial Systems. Desarrollado con excelencia Web3.</p>
      </div>
    </footer>
  </div>
{:else}
  <!-- Dashboard UI - Soft Version -->
  <div class="dashboard-soft animate-fade-up">
    <div class="dash-welcome">
      <div class="welcome-text">
        <h1>Buenos días, <span class="gradient-text">{$walletAddress.slice(0, 10)}</span></h1>
        <p>Aquí tienes un resumen de tus activos hoy.</p>
      </div>
      <button class="btn-refresh glass" on:click={handleRefresh}>
        <RefreshCw size={18} />
        <span>Sincronizar</span>
      </button>
    </div>

    <div class="dash-grid">
      <div class="premium-card balance-card-dash animate-fade-up">
        <div class="balance-top">
          <span class="label">Balance Total</span>
          <div class="net-pill">{$networkName}</div>
        </div>
        <div class="balance-main">
          <span class="amount">{$walletBalance}</span>
          <span class="curr">{$networkName.includes('Sepolia') ? 'SepoliaETH' : 'ETH'}</span>
        </div>
        <div class="balance-foot">
          <span class="card-num">CrediFlash Elite Protocol</span>
        </div>
      </div>

      <div class="dash-stats">
        <div class="card mini-stat glass-hover">
          <div class="mini-icon up"><ArrowDownLeft size={20} /></div>
          <div class="mini-info">
            <span class="l">Entradas</span>
            <span class="v">0.00 ETH</span>
          </div>
        </div>
        <div class="card mini-stat glass-hover">
          <div class="mini-icon down"><ArrowUpRight size={20} /></div>
          <div class="mini-info">
            <span class="l">Salidas</span>
            <span class="v">0.00 ETH</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dash-section">
      <div class="sec-header">
        <h3>Actividad Reciente</h3>
        <a href="/history" class="btn-text">Ver todos</a>
      </div>
      <div class="activity-empty card glass">
        <TrendingUp size={32} color="var(--text-muted)" />
        <p>No hay movimientos registrados recientemente.</p>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Landing Soft Styles */
  .landing-page-soft {
    background-color: var(--bg-color);
  }

  .hero-soft {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5rem;
    gap: 4rem;
    position: relative;
    background: radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.05) 0%, transparent 60%);
  }

  .hero-info {
    max-width: 600px;
  }

  .hero-h1 {
    font-size: 3.75rem;
    line-height: 1.1;
    margin: 1.5rem 0;
    color: var(--primary);
  }

  .hero-p {
    font-size: 1.2rem;
    color: var(--text-muted);
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .btn-primary.large {
    padding: 1.1rem 2rem;
    font-size: 1.1rem;
    border-radius: 14px;
  }

  .security-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .hero-graphic {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .mockup-container {
    position: relative;
    padding: 3rem;
  }

  .premium-card-soft {
    width: 400px;
    height: 250px;
    background: var(--blue-gradient);
    border-radius: 28px;
    padding: 2.5rem;
    box-shadow: 0 30px 60px -12px rgba(0, 33, 71, 0.25);
    position: relative;
    overflow: hidden;
    animation: float 6s ease-in-out infinite;
    color: white;
  }

  .card-inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .logo-small { font-weight: 800; font-size: 1.1rem; overflow: hidden; }
  .card-chip-gold { width: 54px; height: 40px; background: var(--gold-gradient); border-radius: 8px; margin: 1rem 0; }
  .card-num { font-size: 1.5rem; letter-spacing: 2px; font-family: monospace; opacity: 0.9; }
  .card-foot { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; opacity: 0.7; }

  .card-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%);
    animation: shine 10s infinite;
  }
  @keyframes shine { 0% { transform: translate(-30%, -30%); } 100% { transform: translate(30%, 30%); } }

  .floating-ui {
    position: absolute;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
    font-size: 0.9rem;
    z-index: 3;
    animation: float 5s ease-in-out infinite reverse;
  }

  .floating-ui.item-1 { top: -10px; right: -20px; }
  .floating-ui.item-2 { bottom: -10px; left: -20px; animation-delay: 1s; }

  .ui-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .ui-icon.green { background: #DCFCE7; color: var(--success); }
  .ui-icon.blue { background: #DBEAFE; color: var(--accent-blue); }

  .scroll-down { position: absolute; bottom: 30px; left: 50%; translate: -50%; color: var(--text-muted); animation: bounce 2s infinite; }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(10px); } }

  /* Stats Bar */
  .stats-soft {
    display: flex;
    justify-content: space-around;
    padding: 4rem 5rem;
    background: white;
    border-top: 1px solid var(--border-color);
  }

  .stat-box h3 { font-size: 2.5rem; color: var(--primary); margin-bottom: 0.5rem; }
  .stat-box p { color: var(--text-muted); font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

  /* Section Features */
  .section { padding: 8rem 5rem; max-width: 1300px; margin: 0 auto; }
  .section-title-center { text-align: center; margin-bottom: 5rem; }
  .section-title-center h2 { font-size: 2.75rem; margin: 1rem 0; }
  .section-title-center p { color: var(--text-muted); font-size: 1.1rem; }

  .features-grid-soft {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }

  .feat-card {
    padding: 3rem 2.5rem;
    border-radius: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .feat-icon-gradient {
    width: 64px;
    height: 64px;
    background: var(--soft-gradient);
    color: var(--primary);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 15px rgba(0,0,0,0.05);
  }

  .feat-card h4 { font-size: 1.25rem; }
  .feat-card p { color: var(--text-muted); line-height: 1.6; font-size: 0.95rem; }

  /* CTA Bottom */
  .cta-bottom { padding: 5rem 5rem 10rem; }
  .cta-inner-card {
    border-radius: 32px;
    padding: 6rem;
    text-align: center;
    color: white;
    box-shadow: 0 30px 60px -15px rgba(0, 33, 71, 0.3);
  }
  .cta-inner-card h2 { color: white; font-size: 3rem; margin-bottom: 1.5rem; }
  .cta-inner-card p { font-size: 1.25rem; margin-bottom: 3rem; opacity: 0.9; }
  .cta-inner-card .btn-secondary { padding: 1.25rem 3rem; border-radius: 16px; font-size: 1.2rem; }

  /* Footer */
  .soft-footer { padding: 4rem 5rem; background: white; border-top: 1px solid var(--border-color); }
  .footer-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
  .footer-logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
  .footer-logo span { color: var(--secondary); }
  .footer-bottom { text-align: center; color: var(--text-muted); font-size: 0.9rem; border-top: 1px solid #F1F5F9; padding-top: 2rem; }

  /* Expansion Styles */
  .section-text-heavy {
    padding: 10rem 5rem;
  }

  .side-by-side {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 4rem;
    align-items: center;
  }

  .text-content h2 {
    font-size: 3rem;
    margin: 1rem 0 2rem;
  }

  .text-content p {
    font-size: 1.1rem;
    color: var(--text-muted);
    line-height: 1.8;
    margin-bottom: 2rem;
  }

  .feature-bullets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .bullet-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 600;
    color: var(--primary);
  }

  .visual-decorative {
    display: flex;
    justify-content: center;
    position: relative;
  }

  .shield-halo {
    position: relative;
    padding: 2rem;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
    border-radius: 50%;
  }

  .text-center-wide {
    text-align: center;
    max-width: 1000px;
    margin: 0 auto;
  }

  .text-center-wide h2 {
    font-size: 3rem;
    margin: 1.5rem 0 3rem;
  }

  .text-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    text-align: left;
  }

  .text-columns p {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--text-muted);
  }

  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 3rem;
  }

  .faq-card {
    padding: 2.5rem;
  }

  .faq-card h5 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--primary);
  }

  .faq-card p {
    font-size: 0.95rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  /* CTA FIXED COLOR */
  .glass-gold {
    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
    border: 1px solid #F59E0B;
  }

  .text-black { color: #000000 !important; }
  .opacity-80 { opacity: 0.8; }

  /* Dashboard Soft Styles (Kept) */
  .dashboard-soft { padding: 2rem 0; display: flex; flex-direction: column; gap: 2.5rem; }
  .dash-welcome { display: flex; justify-content: space-between; align-items: flex-start; }
  .welcome-text h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
  .welcome-text p { color: var(--text-muted); font-size: 1.1rem; }
  .btn-refresh { border-radius: 12px; padding: 0.75rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; color: var(--primary); font-weight: 700; }

  .dash-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 2rem; }
  .balance-card-dash { min-height: 240px; display: flex; flex-direction: column; justify-content: space-between; padding: 2.5rem; }
  .balance-top { display: flex; justify-content: space-between; align-items: center; font-weight: 700; opacity: 0.8; }
  .net-pill { background: rgba(255,255,255,0.2); padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; }
  .balance-main { margin: 1.5rem 0; display: flex; align-items: baseline; gap: 0.75rem; }
  .balance-main .amount { font-size: 3.5rem; font-weight: 800; }
  .balance-main .curr { font-size: 1.5rem; font-weight: 600; opacity: 0.7; }
  .balance-foot { opacity: 0.6; font-size: 0.85rem; font-weight: 500; letter-spacing: 1px; }

  .dash-stats { display: flex; flex-direction: column; gap: 1.5rem; }
  .mini-stat { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; }
  .mini-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .mini-icon.up { background: #DCFCE7; color: #166534; }
  .mini-icon.down { background: #FEE2E2; color: #991B1B; }
  .mini-info { display: flex; flex-direction: column; }
  .mini-info .l { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
  .mini-info .v { font-size: 1.25rem; font-weight: 700; color: var(--primary); }

  .dash-section { margin-top: 1rem; }
  .sec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .btn-text { color: var(--accent-blue); font-weight: 700; font-size: 0.9rem; }
  .activity-empty { padding: 4rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.95rem; }

  /* Responsive Adjustments */
  @media (max-width: 1024px) {
    .section { padding: 4rem 2rem; }
    .hero-soft { flex-direction: column; text-align: center; padding: 10rem 2rem 4rem; }
    .hero-h1 { font-size: 2.5rem; }
    .cta-row { justify-content: center; flex-direction: column; }
    .hero-graphic { margin-top: 3rem; }
    .premium-card-soft { width: 320px; height: 200px; padding: 1.5rem; }
    .dash-grid { grid-template-columns: 1fr; }
    .features-grid-soft { grid-template-columns: 1fr; }
  }
</style>
