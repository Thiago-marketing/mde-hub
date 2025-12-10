// /js/auth-cadastro.js
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");
  const msg = document.getElementById("cadastroMensagem");
  const btn = document.getElementById("btnSubmitCadastro");

  if (!form) return; // segurança

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    msg.textContent = "";
    msg.className = "auth-message";

    const email = form.email.value.trim();
    const whatsapp = form.whatsapp.value.trim();
    const password = form.password.value;
    const passwordConfirm = form.passwordConfirm.value;
    const emailOptin = form.emailOptin.checked;

    // validação simples
    if (!email || !whatsapp || !password || !passwordConfirm) {
      msg.textContent = "Preencha todos os campos obrigatórios.";
      msg.classList.add("error");
      return;
    }

    if (password !== passwordConfirm) {
      msg.textContent = "As senhas não conferem.";
      msg.classList.add("error");
      return;
    }

    // botão desabilitado para evitar duplo envio
    btn.disabled = true;
    btn.textContent = "Criando conta...";

    // criação do usuário no SUPABASE
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://hub.mdesistemas.com/auth/confirmado.html",
        data: {
          whatsapp,
          emailOptin
        }
      }
    });

    if (error) {
      msg.textContent = error.message;
      msg.classList.add("error");
      btn.disabled = false;
      btn.textContent = "Criar conta";
      return;
    }

    // sucesso!
    msg.textContent = "Conta criada! Verifique seu e-mail para confirmar o cadastro.";
    msg.classList.add("success");

    // limpar form
    form.reset();
    btn.disabled = false;
    btn.textContent = "Criar conta";
  });
});
