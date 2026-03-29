<script>
  import { alerts, removeAlert } from '../store';
  import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-svelte';
</script>

<div class="alert-container">
  {#each $alerts as alert (alert.id)}
    <div class="alert alert-{alert.type}">
      {#if alert.type === 'success'}
        <CheckCircle size={20} />
      {:else if alert.type === 'error'}
        <XCircle size={20} />
      {:else if alert.type === 'warning'}
        <AlertTriangle size={20} />
      {:else}
        <Info size={20} />
      {/if}
      <span>{alert.message}</span>
      <button on:click={() => removeAlert(alert.id)} class="close-btn">&times;</button>
    </div>
  {/each}
</div>

<style>
  .alert-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
    position: relative;
    pointer-events: auto;
  }
  .alert-success { border-left: 5px solid #10B981; }
  .alert-error { border-left: 5px solid #EF4444; }
  .alert-warning { border-left: 5px solid #F59E0B; }
  .alert-info { border-left: 5px solid #3B82F6; }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    margin-left: auto;
    padding-left: 10px;
    opacity: 0.5;
  }
</style>
