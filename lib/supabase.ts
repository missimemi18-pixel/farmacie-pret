import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tqegjocleztjbujdlpmy.supabase.co'
const supabaseKey = 'sb_publishable_kBe13_xfQbe8zsQ0EfVqKw_diJivwdh'

export const supabase = createClient(supabaseUrl, supabaseKey)
