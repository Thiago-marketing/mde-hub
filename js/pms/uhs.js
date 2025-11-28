<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unidades Habitacionais • PMS Lite</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>

<body class="dark-page">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <h2>PMS Lite</h2>
    <nav>
      <a href="/pages/uhs.html" class="active">Unidades (UHs)</a>
      <a href="/pages/reservas.html">Reservas</a>
      <a href="/pages/checkin.html">Check-in</a>
      <a href="/pages/checkout.html">Check-out</a>
      <a href="/pages/lancamentos.html">Lançamentos</a>
      <a href="/pages/financeiro.html">Financeiro</a>
      <a href="/pages/relatorios.html">Relatórios</a>
    </nav>
  </aside>

  <!-- CONTEÚDO -->
  <main class="page-content">

    <h1 class="page-title">Unidades Habitacionais (UHs)</h1>
    <p class="page-subtitle">Gerencie os quartos disponíveis no PMS Lite.</p>

    <section class="card">
      <h2 class="card-title">Cadastrar nova UH</h2>

      <form id="uhForm" class="form-grid">

        <div class="form-group">
          <label>Nome da UH</label>
          <input type="text" id="uhNome" placeholder="Ex: Suíte 01" required>
        </div>

        <div class="form-group">
          <label>Status</label>
          <select id="uhStatus">
            <option value="livre">Livre (verde)</option>
            <option value="ocupado">Ocupado (vermelho)</option>
            <option value="limpeza">Limpeza (azul)</option>
            <option value="manutencao">Manutenção (cinza)</option>
            <option value="bloqueado">Bloqueado (preto)</option>
          </select>
        </div>

        <button type="submit" class="btn-primary">Salvar UH</button>
      </form>
    </section>

    <section class="card">
      <h2 class="card-title">Lista de UHs</h2>

      <div id="uhList" class="uh-list"></div>
    </section>

  </main>

  <script src="/js/supabase.js"></script>
  <script src="/js/pms/uhs.js"></script>

</body>
</html>
