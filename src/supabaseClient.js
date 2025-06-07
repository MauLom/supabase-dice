import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hwcvpujxzulxtyxcjdsf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y3ZwdWp4enVseHR5eGNqZHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjU0MzYsImV4cCI6MjA2NDg0MTQzNn0.0TeJ2lu_OLrfus2_5_VRlnpqTCKnA60Se08DMjRm9B4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
