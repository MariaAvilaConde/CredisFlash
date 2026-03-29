<script context="module">
  // History Logic (Shared)
</script>

<script>
  import { onMount } from 'svelte';
  import { walletAddress, isConnected, networkName } from '$lib/store';
  import { getTransactionHistory } from '$lib/web3';
  import { 
    History, 
    Search, 
    ArrowUpRight, 
    ArrowDownLeft, 
    ExternalLink, 
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    Copy,
    ChevronLeft,
    ChevronRight,
    Loader2
  } from 'lucide-svelte';

  let transactions = [];
  let isLoading = false;
  let error = null;

  async function loadHistory() {
    if (!$walletAddress) return;
    isLoading = true;
    error = null;
    try {
      const data = await getTransactionHistory($walletAddress);
      transactions = data;
    } catch (e) {
      error = "No se pudo cargar el historial. Verifique su API Key.";
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if ($isConnected) loadHistory();
  });
</script>

<div class="history-page-soft animate-fade-up">
  <div class="page-header">
    <div class="title-row">
      <div class="icon-box blue"><History size={24} /></div>
      <h1>Historial de Operaciones</h1>
    </div>
    <p>Seguimiento detallado de sus movimientos en la red {$networkName}.</p>
  </div>

  <div class="history-controls card glass">
    <div class="search-box">
      <Search size={18} class="search-icon" />
      <input type="text" placeholder="Buscar por hash o dirección..." class="input-light" />
    </div>
    <div class="filter-group">
      <button class="btn-filter glass-hover">
        <Filter size={16} />
        <span>Filtrar</span>
      </button>
      <button class="btn-refresh-icon glass-hover" on:click={loadHistory}>
        <RefreshCw size={16} class={isLoading ? 'spin' : ''} />
      </button>
    </div>
  </div>

  <div class="history-table-container card">
    {#if isLoading}
      <div class="table-loading">
        <Loader2 size={40} class="spin" />
        <p>Sincronizando con Etherscan...</p>
      </div>
    {:else if error}
      <div class="table-error">
        <XCircle size={40} />
        <p>{error}</p>
        <button class="btn-text" on:click={loadHistory}>Reintentar</button>
      </div>
    {:else if transactions.length === 0}
      <div class="table-empty">
        <Clock size={48} color="var(--text-muted)" />
        <h3>Sin transacciones</h3>
        <p>No se encontraron movimientos registrados para esta dirección.</p>
      </div>
    {:else}
      <table class="history-table">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Tipo</th>
            <th>Hash / Fecha</th>
            <th>Monto</th>
            <th>Destino / Origen</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {#each transactions as tx}
            <tr>
              <td class="status-cell">
                <div class="status-badge success">
                  <CheckCircle size={14} />
                  <span>Concluido</span>
                </div>
              </td>
              <td class="type-cell">
                {#if tx.from.toLowerCase() === $walletAddress.toLowerCase()}
                  <div class="type-icon out"><ArrowUpRight size={14} /></div>
                  <span class="type-text">Enviado</span>
                {:else}
                  <div class="type-icon in"><ArrowDownLeft size={14} /></div>
                  <span class="type-text">Recibido</span>
                {/if}
              </td>
              <td class="hash-cell">
                <div class="hash-v">{tx.hash.slice(0, 10)}...</div>
                <div class="date-v">{new Date(tx.timeStamp * 1000).toLocaleDateString()}</div>
              </td>
              <td class="amount-cell">
                <div class="val">{(parseInt(tx.value) / 1e18).toFixed(4)}</div>
                <div class="curr">ETH</div>
              </td>
              <td class="address-cell">
                <span class="addr">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
                <button class="btn-copy"><Copy size={12} /></button>
              </td>
              <td class="action-cell">
                <a href="https://{$networkName.toLowerCase()}.etherscan.io/tx/{tx.hash}" target="_blank" class="btn-view">
                  <ExternalLink size={14} />
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <div class="pagination-footer">
    <p>Mostrando {transactions.length} de {transactions.length} resultados</p>
    <div class="p-btns">
      <button class="btn-p disabled"><ChevronLeft size={18} /></button>
      <button class="btn-p disabled"><ChevronRight size={18} /></button>
    </div>
  </div>
</div>

<style>
  .history-page-soft {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .page-header {
    margin-bottom: 1rem;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .title-row h1 { font-size: 2.25rem; }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-box.blue { background: #DBEAFE; color: var(--accent-blue); }

  .page-header p { color: var(--text-muted); font-size: 1.1rem; }

  .history-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #F1F5F9;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    width: 350px;
    border: 1px solid var(--border-color);
  }

  .input-light {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.9rem;
  }

  .search-icon { color: var(--text-muted); }

  .filter-group {
    display: flex;
    gap: 0.75rem;
  }

  .btn-filter, .btn-refresh-icon {
    padding: 0.6rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--primary);
  }

  .history-table-container {
    padding: 0;
    overflow: hidden;
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .history-table th {
    background: #F8FAFC;
    padding: 1rem 1.5rem;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-color);
  }

  .history-table td {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #F1F5F9;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .status-badge.success { background: #DCFCE7; color: #166534; }

  .type-cell { display: flex; align-items: center; gap: 0.75rem; }
  .type-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .type-icon.out { background: #FEE2E2; color: #991B1B; }
  .type-icon.in { background: #DCFCE7; color: #166534; }
  .type-text { font-weight: 700; font-size: 0.85rem; }

  .hash-cell .hash-v { font-weight: 700; font-size: 0.9rem; color: var(--primary); }
  .hash-cell .date-v { font-size: 0.75rem; color: var(--text-muted); }

  .amount-cell .val { font-size: 1rem; font-weight: 800; color: var(--primary); }
  .amount-cell .curr { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }

  .address-cell { display: flex; align-items: center; gap: 0.5rem; font-family: monospace; font-size: 0.9rem; color: var(--text-muted); }
  .btn-copy { color: #CBD5E1; }
  .btn-view { color: var(--accent-blue); }

  .table-loading, .table-error, .table-empty {
    padding: 6rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--text-muted);
  }

  .table-error { color: #EF4444; }
  .btn-text { color: var(--accent-blue); font-weight: 700; font-size: 0.9rem; }

  .pagination-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.5rem;
    color: var(--text-muted);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .p-btns { display: flex; gap: 0.5rem; }
  .btn-p { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); border-radius: 8px; background: white; color: var(--primary); }
  .btn-p.disabled { opacity: 0.3; cursor: not-allowed; }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  tr:hover td { background-color: #F8FAFC; }
</style>
