import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Verifica se tem usuário logado
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    // não está logado → manda pro login
    window.location.href = "login.html";
    return;
  }

  // 2) Se quiser, mostra o nome do usuário em algum lugar
  // pega nome que você salvou no metadata (full_name)
  const fullName = user.user_metadata?.full_name || "";
  const nameSpan = document.getElementById("user-name");
  const initialSpan = document.getElementById("user-initial");

  if (nameSpan) {
    nameSpan.textContent = fullName || user.email;
  }

  if (initialSpan) {
    const initial =
      fullName?.trim()?.charAt(0)?.toUpperCase() ||
      user.email?.charAt(0)?.toUpperCase() ||
      "M";
    initialSpan.textContent = initial;
  }

  // 3) Botão de sair
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }
});
