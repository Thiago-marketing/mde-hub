// /js/supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const supabaseUrl = "https://suswuhtsbnfvelwunctg.supabase.co";
export const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c3d1aHRzYm5mdmVsd3VuY3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzMyNDcsImV4cCI6MjA3OTc0OTI0N30.0utLvAN88MVzNNRGkz748PUecDa8aIoIYKWkOyi_RkA";

export const supabase = createClient(supabaseUrl, supabaseKey);
