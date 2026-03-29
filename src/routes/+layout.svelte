<script>
  import '../app.css';
  import { onMount, tick } from 'svelte';
  import { walletAddress, isConnected, networkName, walletBalance } from '$lib/store';
  import { connectWallet, disconnectWallet } from '$lib/web3';
  import Alert from '$lib/components/Alert.svelte';
  import { 
    LayoutDashboard, 
    Send, 
    History, 
    Info, 
    Wallet, 
    LogOut, 
    RefreshCw,
    Menu,
    X,
    ChevronRight
  } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let isMobileMenuOpen = false;

  const navItems = [
    { name: 'Panel Principal', path: '/', icon: LayoutDashboard },
    { name: 'Transferencias', path: '/transfer', icon: Send },
    { name: 'Historial', path: '/history', icon: History },
    { name: 'Acerca de', path: '/about', icon: Info },
  ];

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  // Route Guard: If not connected and not on / or /about, redirect to /
  $: if (!$isConnected && $page.url.pathname !== '/' && $page.url.pathname !== '/about') {
    goto('/');
  }
</script>

<div class="app-container">
  <!-- Sidebar - Only show if connected -->
  {#if $isConnected}
    <aside class="sidebar {isMobileMenuOpen ? 'open' : ''}">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <div class="logo-text">Credi<span>Flash</span></div>
      </div>

      <nav class="nav-menu">
        {#each navItems as item}
          <a 
            href={item.path} 
            class="nav-item {$page.url.pathname === item.path ? 'active' : ''}"
            on:click={() => isMobileMenuOpen = false}
          >
            <svelte:component this={item.icon} size={20} />
            <span>{item.name}</span>
            {#if $page.url.pathname === item.path}
              <ChevronRight size={16} class="active-indicator" />
            {/if}
          </a>
        {/each}
      </nav>

      <div class="sidebar-footer">
        <div class="wallet-status card-dark">
          <div class="status-top">
            <div class="dot active"></div>
            <span>{$networkName}</span>
          </div>
          <button on:click={disconnectWallet} class="logout-btn">
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  {/if}

  <!-- Main Content -->
  <main class="main-content {!$isConnected ? 'full-width' : ''}">
    {#if $isConnected}
      <header class="top-header glass">
        <div class="header-left">
          <button class="mobile-toggle" on:click={toggleMobileMenu}>
            {#if isMobileMenuOpen}
              <X size={24} />
            {:else}
              <Menu size={24} />
            {/if}
          </button>
          <div class="page-title">{navItems.find(i => i.path === $page.url.pathname)?.name || 'CrediFlash'}</div>
        </div>

        <div class="header-right">
          <div class="wallet-badge-modern">
            <div class="wallet-icon-box">
              <Wallet size={16} />
            </div>
            <div class="wallet-details">
              <span class="addr">{$walletAddress.slice(0, 6)}...{$walletAddress.slice(-4)}</span>
              <span class="bal">{$walletBalance.slice(0, 6)} ETH</span>
            </div>
          </div>
        </div>
      </header>
    {/if}

    <div class="content-wrapper {!$isConnected ? 'no-padding' : ''}">
      <slot />
    </div>
  </main>

  <Alert />
</div>

<style>
  .app-container {
    display: flex;
    min-height: 100vh;
    background-color: var(--bg-color);
  }

  /* Sidebar Styles */
  .sidebar {
    width: 280px;
    background: var(--blue-gradient);
    color: white;
    display: flex;
    flex-direction: column;
    padding: 2.5rem 1.5rem;
    position: fixed;
    height: 100vh;
    z-index: 100;
    transition: transform 0.3s ease;
    box-shadow: 10px 0 30px rgba(0, 33, 71, 0.1);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 3.5rem;
    padding: 0 0.5rem;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    background: var(--gold-gradient);
    color: var(--primary);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.25rem;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .logo-text span {
    color: var(--secondary);
  }

  .nav-menu {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .nav-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .nav-item.active {
    background: var(--white);
    color: var(--primary);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .active-indicator {
    margin-left: auto;
    color: var(--secondary);
  }

  .sidebar-footer {
    margin-top: auto;
  }

  .wallet-status {
    background: rgba(0, 0, 0, 0.2);
    padding: 1.25rem;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .status-top {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot.active {
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
  }

  .logout-btn {
    background: rgba(239, 68, 68, 0.15);
    color: #F87171;
    padding: 0.6rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    width: 100%;
  }

  .logout-btn:hover {
    background: #EF4444;
    color: white;
  }

  /* Main Content Styles */
  .main-content {
    flex: 1;
    margin-left: 280px;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
  }

  .main-content.full-width {
    margin-left: 0;
  }

  .top-header {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    position: sticky;
    top: 0;
    z-index: 90;
    background: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid var(--border-color);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .page-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
  }

  .mobile-toggle {
    display: none;
    background: #F1F5F9;
    color: var(--primary);
    padding: 0.5rem;
    border-radius: 8px;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .wallet-badge-modern {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: var(--card-shadow);
  }

  .wallet-details {
    display: flex;
    flex-direction: column;
    text-align: right;
  }

  .wallet-details .addr {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--primary);
  }

  .wallet-details .bal {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .wallet-icon-box {
    width: 32px;
    height: 32px;
    background: #F1F5F9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }

  .content-wrapper {
    padding: 2.5rem;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    flex: 1;
  }

  .content-wrapper.no-padding {
    padding: 0;
    max-width: none;
  }

  @media (max-width: 1024px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .main-content {
      margin-left: 0;
    }

    .mobile-toggle {
      display: flex;
    }
    
    .top-header {
      padding: 0 1.5rem;
    }
  }
</style>
