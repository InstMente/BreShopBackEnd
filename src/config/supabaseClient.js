
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL ou SUPABASE_KEY não definida no .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
