// /mde-hub/public/js/auth.js

// CADASTRO
async function criarConta() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const aceita_marketing = document.getElementById("aceita_marketing").checked;
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !whatsapp || !senha) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: senha,
  });

  if (error) {
    alert("Erro ao criar conta: " + error.message);
    return;
  }

  const user = data.user;
  if (!user) {
    alert("Não foi possível obter o usuário após o cadastro.");
    return;
  }

  const { error: profileError } = await supabaseClient.from("profiles").insert({
    id: user.id,
    nome,
    whatsapp,
    aceita_marketing,
  });

  if (profileError) {
    alert("Conta criada, mas houve erro ao salvar o perfil: " + profileError.message);
    return;
  }

  alert("Cadastro realizado com sucesso! Você será redirecionado ao painel.");
  window.location.href = "/mde-hub/public/dashboard.html";
}

// LOGIN
async function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    alert("Erro ao entrar: " + error.message);
    return;
  }

  window.location.href = "/mde-hub/public/dashboard.html";
}

// LOGOUT
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "/mde-hub/public/login.html";
}

// PROTEGER DASHBOARD
async function protegerDashboard() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "/mde-hub/public/login.html";
  }
}

// CARREGAR PERFIL BÁSICO NO DASHBOARD
async function carregarPerfilBasico() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (!sessionData.session) return;

  const user = sessionData.session.user;

  const { data: profiles, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .limit(1);

  if (error || !profiles || profiles.length === 0) return;

  const profile = profiles[0];

  const chip = document.getElementById("user-chip");
  if (chip) {
    chip.querySelector(".user-name").textContent = profile.nome || user.email;
  }

  const info = document.getElementById("profile-info");
  if (info) {
    const dts = info.querySelectorAll("dd");
    if (dts[0]) dts[0].textContent = profile.nome || "—";
    if (dts[1]) dts[1].textContent = user.email || "—";
    if (dts[2]) dts[2].textContent = profile.whatsapp || "—";
    if (dts[3])
      dts[3].textContent = profile.aceita_marketing
        ? "Aceita comunicações da MDE"
        : "Não autorizado";
  }
}

