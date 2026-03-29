<script>
  import { onMount } from 'svelte';
  import { 
    Info, 
    Target, 
    ShieldCheck, 
    Zap, 
    TrendingUp, 
    Users, 
    Mail, 
    Globe,
    ExternalLink,
    ChevronRight,
    Award
  } from 'lucide-svelte';

  let visibleSections = new Set();

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

  const benefits = [
    { icon: ShieldCheck, title: 'Confianza Total', desc: 'Protocolos de seguridad de grado bancario auditados.' },
    { icon: Zap, title: 'Arquitectura Flash', desc: 'Optimización de gas para transacciones ultrarrápidas.' },
    { icon: Award, title: 'Calidad Premium', desc: 'Interfaz diseñada para la élite de usuarios Web3.' }
  ];
</script>

<div class="about-page-soft">
  <!-- Hero Section -->
  <header class="about-hero animate-fade-up">
    <div class="badge">NUESTRA VISIÓN</div>
    <h1>Innovando el Puente entre la <br/><span class="gradient-text">Banca y la Web3</span>.</h1>
    <p>CrediFlash no es solo una plataforma, es la evolución natural de la gestión financiera digital para usuarios exigentes.</p>
  </header>

  <!-- Mission & Intro -->
  <section class="section grid-2 reveal" id="intro" class:visible={visibleSections.has('intro')}>
    <div class="intro-card card">
      <div class="card-icon blue"><Info size={24} /></div>
      <h3>Introducción al Proyecto</h3>
      <p>
        <strong>CrediFlash</strong> ha sido diseñado desde cero para superar los estándares de la banca tradicional, 
        integrando las ventajas de la descentralización con una capa de experiencia de usuario de 
        clase mundial. Permitimos gestionar ETH y activos digitales con la misma facilidad que una cuenta de ahorros clásica.
      </p>
    </div>
    <div class="intro-visual">
      <div class="abstract-graphic">
        <div class="circle gold"></div>
        <div class="circle blue"></div>
        <div class="glass-plate glass">
          <Globe size={48} color="var(--primary)" strokeWidth={1} />
        </div>
      </div>
    </div>
  </section>

  <!-- Objectives Section -->
  <section class="section bg-white reveal" id="objectives" class:visible={visibleSections.has('objectives')}>
    <div class="section-title">
      <div class="card-icon gold"><Target size={24} /></div>
      <h2>Nuestros Objetivos Estratégicos</h2>
    </div>

    <div class="objectives-list">
      <div class="obj-item animate-fade-up">
        <div class="obj-num">01</div>
        <div class="obj-info">
          <h4>Simplificación Absoluta</h4>
          <p>Eliminar las barreras complejas de la Web3 mediante una interfaz intuitiva y automatizada con Pali Wallet.</p>
        </div>
      </div>
      <div class="obj-item animate-fade-up delay-1">
        <div class="obj-num">02</div>
        <div class="obj-info">
          <h4>Transparencia en Tiempo Real</h4>
          <p>Garantizar que cada movimiento sea auditable y visible instantáneamente a través de integraciones nativas.</p>
        </div>
      </div>
      <div class="obj-item animate-fade-up delay-2">
        <div class="obj-num">03</div>
        <div class="obj-info">
          <h4>Soporte Multired Robusto</h4>
          <p>Permitir la interoperabilidad fluida entre redes como Mainnet, Sepolia y Holesky con auto-configuración.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Benefits Grid -->
  <section class="section reveal" id="benefits" class:visible={visibleSections.has('benefits')}>
    <div class="benefits-grid">
      {#each benefits as benefit, i}
        <div class="benefit-card card-glass animate-fade-up" style="animation-delay: {i * 0.1}s">
          <div class="benefit-icon">
            <svelte:component this={benefit.icon} size={28} />
          </div>
          <h4>{benefit.title}</h4>
          <p>{benefit.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Team Section -->
  <section class="section team-section reveal" id="team" class:visible={visibleSections.has('team')}>
    <div class="section-title centered">
      <div class="card-icon blue"><Users size={24} /></div>
      <h2>Talento Detrás de CrediFlash</h2>
    </div>

    <div class="team-grid">
      <div class="member-card card animate-fade-up">
        <div class="member-photo-box">
          <img src="/maria.png" alt="Maria Avila Conde" class="member-img" />
          <div class="member-badge">Líder de Proyecto</div>
        </div>
        <div class="member-info">
          <h3>Maria Avila Conde</h3>
          <p class="role">Directora de Innovación Web3</p>
          <p class="bio">
            Estratega financiera con más de 10 años de experiencia transformando activos tradicionales en soluciones blockchain de alto rendimiento.
          </p>
          <div class="member-links">
            <a href="mailto:contact@crediflash.com" class="social-btn"><Mail size={18} /></a>
            <a href="https://linkedin.com" target="_blank" class="social-btn"><ExternalLink size={18} /></a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact CTA -->
  <section class="about-cta reveal" id="contact" class:visible={visibleSections.has('contact')}>
    <div class="cta-banner card-premium">
      <div class="cta-text">
        <h2>¿Deseas saber más?</h2>
        <p>Estamos construyendo el futuro de la banca. Únete a nuestra comunidad de usuarios elite.</p>
      </div>
      <a href="/" class="btn-primary">
        <span>Volver al Dashboard</span>
        <ChevronRight size={20} />
      </a>
    </div>
  </section>
</div>

<style>
  .about-page-soft {
    padding-top: 2rem;
  }

  .about-hero {
    text-align: center;
    padding: 6rem 1rem;
    max-width: 900px;
    margin: 0 auto;
  }

  .about-hero h1 {
    font-size: 3.5rem;
    margin: 1.5rem 0;
    line-height: 1.1;
  }

  .about-hero p {
    font-size: 1.25rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .section {
    padding: 6rem 0;
    max-width: 1200px;
    margin: 0 auto;
  }

  .bg-white {
    background: white;
    max-width: 100%;
    padding: 6rem 4rem;
    border-radius: 40px;
    box-shadow: 0 10px 40px -20px rgba(0,0,0,0.05);
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 4rem;
    align-items: center;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .card-icon.blue { background: #DBEAFE; color: var(--accent-blue); }
  .card-icon.gold { background: #FEF3C7; color: var(--secondary-dark); }

  .intro-card {
    padding: 3rem;
  }

  .intro-card h3 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }

  .intro-card p {
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.7;
  }

  .intro-visual {
    display: flex;
    justify-content: center;
  }

  .abstract-graphic {
    position: relative;
    width: 200px;
    height: 200px;
  }

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.2;
  }

  .circle.gold { top: 0; right: 0; width: 150px; height: 150px; background: var(--secondary); }
  .circle.blue { bottom: 0; left: 0; width: 120px; height: 120px; background: var(--accent-blue); }

  .glass-plate {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: 120px;
    height: 120px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 40px rgba(0,33,71,0.1);
  }

  .section-title {
    margin-bottom: 3.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .section-title.centered { text-align: center; }

  .objectives-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }

  .obj-item {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .obj-num {
    font-size: 3rem;
    font-weight: 800;
    color: #F1F5F9;
    line-height: 1;
  }

  .obj-info h4 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .obj-info p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .benefit-card {
    padding: 2.5rem;
    background: #F8FAFC;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    text-align: center;
    transition: all 0.3s ease;
  }

  .benefit-card:hover { border-color: var(--accent-blue); background: white; transform: translateY(-5px); }

  .benefit-icon {
    width: 54px;
    height: 54px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: var(--primary);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .team-grid {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
  }

  .member-card {
    display: flex;
    gap: 3rem;
    padding: 3rem;
    max-width: 800px;
    align-items: center;
  }

  .member-photo-box {
    width: 240px;
    height: 320px;
    flex-shrink: 0;
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .member-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .member-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--blue-gradient);
    color: white;
    padding: 0.75rem;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .member-info h3 { font-size: 1.75rem; color: var(--primary); margin-bottom: 0.25rem; }
  .member-info .role { font-weight: 700; color: var(--secondary-dark); font-size: 0.9rem; text-transform: uppercase; margin-bottom: 1.5rem; }
  .member-info .bio { color: var(--text-muted); line-height: 1.7; margin-bottom: 2rem; font-size: 1.05rem; }

  .member-links { display: flex; gap: 1rem; }
  .social-btn {
    width: 40px;
    height: 40px;
    background: #F1F5F9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }
  .social-btn:hover { background: var(--primary); color: white; }

  .about-cta {
    padding: 6rem 0 10rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .card-premium {
    background: var(--blue-gradient);
    color: white;
    padding: 4rem 5rem;
    border-radius: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 20px 40px rgba(0,33,71,0.2);
  }

  .cta-text h2 { color: white; margin-bottom: 0.5rem; }
  .cta-text p { opacity: 0.8; font-size: 1.1rem; }

  .about-cta .btn-primary {
    background: white;
    color: var(--primary);
    padding: 1rem 2.5rem;
    border-radius: 12px;
    font-weight: 700;
  }

  @media (max-width: 1024px) {
    .grid-2 { grid-template-columns: 1fr; text-align: center; }
    .objectives-list { grid-template-columns: 1fr; }
    .benefits-grid { grid-template-columns: 1fr; }
    .member-card { flex-direction: column; padding: 2rem; }
    .card-premium { flex-direction: column; text-align: center; gap: 2rem; padding: 3rem 2rem; }
    .about-hero h1 { font-size: 2.5rem; }
    .bg-white { padding: 4rem 2rem; }
  }
</style>
