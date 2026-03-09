mport { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ptrccydgtbugtegxnfeu.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cmNjeWRndGJ1Z3RlZ3huZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjQ1ODEsImV4cCI6MjA4ODYwMDU4MX0.aeCbcTBdRaR3opBza_4fxt8nb4hMiEN3-eZUT60Vq04"

export const supabase = createClient(supabaseUrl, supabaseKey)
