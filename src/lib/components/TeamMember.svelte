<script>
  export let name = "";
  export let role = "";
  export let image = "";
  export let bio = "";
</script>

<div class="team-card card">
  <div class="image-wrapper">
    <img src={image} alt={name} />
  </div>
  <div class="info">
    <h3>{name}</h3>
    <p class="role">{role}</p>
    <p class="bio">{bio}</p>
  </div>
</div>

<style>
  .team-card {
    text-align: center;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    transition: transform 0.3s ease;
  }

  .team-card:hover {
    transform: translateY(-5px);
  }

  .image-wrapper {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid var(--secondary);
    padding: 4px;
    background: white;
    overflow: hidden;
  }

  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  h3 {
    margin-bottom: 0.25rem;
    font-size: 1.25rem;
    color: var(--primary);
  }

  .role {
    color: var(--secondary);
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .bio {
    font-size: 0.9rem;
    color: #64748B;
    line-height: 1.6;
  }
</style>
