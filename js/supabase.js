// /js/supabase.js

// ⚠️ Substitua pelos dados do seu projeto Supabase:
// Vá em: Settings → API → Project URL & anon/public key

const SUPABASE_URL = "https://suswuhtsbnfvelwunctxq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c3d1aHRzYm5mdmVsd3VuY3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE3MzI0NywiZXhwIjoyMDc5NzQ5MjQ3fQ.6Oyw1v5Oyzn72flOwsmR8HQTZPkd1FqDLApniM8ArwU"; // sua anon key completa aqui

// Criar cliente global do Supabase
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
// IMPORTAÇÃO CORRETA DO SUPABASE (versão 2)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ⚠️ COLE AQUI SEUS DADOS REAIS DO SUPABASE
const SUPABASE_URL = "https://SEU-PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "SUA-ANON-KEY";

// Cliente Supabase global
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


