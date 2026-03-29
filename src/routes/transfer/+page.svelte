<script context="module">
  // Transfer Page Logic (Shared or to be implemented)
</script>

<script>
  import { signer, walletAddress, networkName, isConnected } from '$lib/store';
  import { sendTransaction } from '$lib/web3';
  import { 
    Send, 
    ArrowRight, 
    CheckCircle, 
    AlertCircle, 
    Info, 
    Coins,
    ShieldCheck,
    History
  } from 'lucide-svelte';

  let recipient = '';
  let amount = '';
  let isLoading = false;
  let status = null; // 'success', 'error'
  let txHash = '';

  async function handleSend() {
    if (!recipient || !amount) return;
    isLoading = true;
    status = null;
    
    try {
      const result = await sendTransaction($signer, recipient, amount);
      if (result.success) {
        status = 'success';
        txHash = result.hash;
        amount = '';
        recipient = '';
      } else {
        status = 'error';
      }
    } catch (e) {
      status = 'error';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="transfer-page-soft animate-fade-up">
  <div class="page-header">
    <h1>Realizar Transferencia</h1>
    <p>Envíe activos de forma segura a cualquier dirección Ethereum.</p>
  </div>

  <div class="transfer-grid">
    <!-- Form Card -->
    <div class="card form-card">
      <div class="card-header">
        <div class="icon-box blue"><Send size={20} /></div>
        <h3>Detalles del Envío</h3>
      </div>

      <div class="form-body">
        <div class="input-group">
          <label for="recipient">Dirección del Destinatario</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              id="recipient" 
              bind:value={recipient} 
              placeholder="0x..." 
              class="input-field"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="amount">Monto ({$networkName.includes('Sepolia') ? 'SepoliaETH' : 'ETH'})</label>
          <div class="input-wrapper">
            <input 
              type="number" 
              id="amount" 
              bind:value={amount} 
              placeholder="0.0" 
              step="0.0001"
              class="input-field"
            />
          </div>
        </div>

        <div class="tx-info-box glass">
          <div class="info-row">
            <span>Red Actual:</span>
            <span class="val">{$networkName}</span>
          </div>
          <div class="info-row">
            <span>Tarifa Estimada:</span>
            <span class="val accent">Automática</span>
          </div>
        </div>

        <button 
          class="btn-primary w-full {isLoading ? 'loading' : ''}" 
          on:click={handleSend}
          disabled={isLoading || !recipient || !amount}
        >
          {#if isLoading}
            <RefreshCw size={20} class="spin" />
            <span>Procesando...</span>
          {:else}
            <Send size={20} />
            <span>Enviar Fondos</span>
          {/if}
        </button>

        {#if status === 'success'}
          <div class="status-msg success">
            <CheckCircle size={20} />
            <div class="msg-content">
              <p>¡Transacción Enviada!</p>
              <a href="https://{$networkName.toLowerCase()}.etherscan.io/tx/{txHash}" target="_blank" class="tx-link">
                Ver en Etherscan <ExternalLink size={12} />
              </a>
            </div>
          </div>
        {:else if status === 'error'}
          <div class="status-msg error">
            <AlertCircle size={20} />
            <p>Error al procesar la transacción. Verifique su saldo y conexión.</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Info/Security Card -->
    <div class="side-panel">
      <div class="card security-card">
        <div class="card-header">
          <div class="icon-box gold"><ShieldCheck size={20} /></div>
          <h3>Seguridad Garantizada</h3>
        </div>
        <p>CrediFlash utiliza firmas criptográficas directas a través de su wallet. Nunca almacenamos sus llaves privadas.</p>
        <ul class="security-list">
          <li><CheckCircle size={14} color="var(--success)" /> Verificación de dirección</li>
          <li><CheckCircle size={14} color="var(--success)" /> Estimación de gas en tiempo real</li>
          <li><CheckCircle size={14} color="var(--success)" /> Confirmación multi-red</li>
        </ul>
      </div>

      <div class="card help-card">
        <div class="card-header">
          <div class="icon-box blue"><Info size={20} /></div>
          <h3>¿Necesitas ayuda?</h3>
        </div>
        <p>Asegúrese de tener suficientes fondos para cubrir las tarifas de gas de la red seleccionada.</p>
        <a href="/about" class="btn-text">Leer más sobre comisiones <ArrowRight size={14} /></a>
      </div>
    </div>
  </div>
</div>

<style>
  .transfer-page-soft {
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 3rem;
  }

  .page-header h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
  .page-header p { color: var(--text-muted); font-size: 1.1rem; }

  .transfer-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 2rem;
    align-items: flex-start;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.5rem;
  }

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-box.blue { background: #DBEAFE; color: var(--accent-blue); }
  .icon-box.gold { background: #FEF3C7; color: var(--secondary-dark); }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group label {
    display: block;
    font-weight: 700;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    color: var(--primary);
  }

  .tx-info-box {
    padding: 1.25rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.9rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    font-weight: 500;
    color: var(--text-muted);
  }

  .info-row .val { color: var(--primary); font-weight: 700; }
  .info-row .val.accent { color: var(--accent-blue); }

  .w-full { width: 100%; justify-content: center; padding: 1rem; }

  .status-msg {
    padding: 1rem;
    border-radius: 10px;
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .status-msg.success { background: #DCFCE7; color: #166534; }
  .status-msg.error { background: #FEE2E2; color: #991B1B; }

  .tx-link { color: #166534; text-decoration: underline; font-size: 0.8rem; display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem; }

  .side-panel { display: flex; flex-direction: column; gap: 2rem; }

  .security-card p, .help-card p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; }

  .security-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
  .security-list li { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 600; color: var(--primary); }

  .btn-text { color: var(--accent-blue); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .transfer-grid { grid-template-columns: 1fr; }
  }
</style>
