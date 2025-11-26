// register.js
// Lida com cadastro: Auth + tabela profiles (nome, whatsapp, marketing)

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const password = document.getElementById("password").value.trim();
    const accepts_marketing = document.getElementById("accepts_marketing").checked;

    if (!full_name || !email || !password || !whatsapp) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // --- 1. Criar usuário no Supabase Auth ---
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            whatsapp,
            accepts_marketing,
          }
        }
      });

      if (authError) {
        console.error(authError);
        alert("Erro ao criar sua conta: " + authError.message);
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        alert("Erro inesperado ao criar conta.");
        return;
      }

      // --- 2. Criar registro na tabela profiles ---
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert({
          id: userId,
          full_name,
          whatsapp,
          accepts_marketing,
          email,
          created_at: new Date(),
        });

      if (profileError) {
        console.error(profileError);
        alert("Sua conta foi criada, mas houve um erro ao salvar seus dados de perfil.");
        return;
      }

      alert("Conta criada com sucesso! Você será redirecionado.");
      window.location.href = "dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Erro inesperado. Tente novamente.");
    }
  });
});

