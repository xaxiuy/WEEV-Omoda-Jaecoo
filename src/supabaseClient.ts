import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yjyptkurssqlxiguqlfb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeXB0a3Vyc3NxbHhpZ3VxbGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTQ2MjUsImV4cCI6MjA4NDA3MDYyNX0.yeX6y9uhg35BsAQ2jY7GHAiKUJILQFRIqRlo0pf3sYc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
