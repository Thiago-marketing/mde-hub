import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  
  // 1) Proteção de rota — se não estiver logado, manda pro login
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = "login.html";
    return;
  }

  // 2) Exibição do nome e email
  const fullName = user.user_metadata?.full_name || "";
  const email = user.email;

  // Preencher avatar inicial
  const initialSpan = document.getElementById("user-initial");
  if (initialSpan) {
    initialSpan.textContent = (fullName.charAt(0) || email.charAt(0)).toUpperCase();
  }

  // Preencher nome
  const nameSpan = document.getElementById("user-name");
  if (nameSpan) {
    nameSpan.textContent = fullName || email;
  }

  // Preencher email
  const emailSpan = document.getElementById("user-email");
  if (emailSpan) {
    emailSpan.textContent = email;
  }

  // Saudação
  const greeting = document.getElementById("user-greeting");
  if (greeting) {
    greeting.textContent = `Olá ${fullName || email}, carregando seus dados...`;
  }

  // 3) Logout funcional
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }

});
