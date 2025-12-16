import { createClient } from '@supabase/supabase-js';
import { config } from '../../config.js';

const supabaseUrl = config?.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = config?.REACT_APP_SUPABASE_ANON_KEY;

console.log('supabaseUrl in supabase.js ', supabaseUrl)
console.log('supabaseAnonKey in supabase.js ', supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
