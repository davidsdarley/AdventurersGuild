import { supabase } from './supabase'

export async function checkConnection(): Promise<string> {
  const { error } = await supabase.from('profiles').select('id').limit(1)
  return error ? `Error: ${error.message}` : 'Connected to Supabase'
}