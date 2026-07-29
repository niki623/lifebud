/*Import Supabase’s function for creating a connection client*/
import { createClient } from '@supabase/supabase-js'; 

/*Read the Supabase project’s address from .env.local.*/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;  
/*Read the browser-safe publishable key from .env.local*/
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables.');
}

/*Create the reusable Supabase client and export it */
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);