import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ekhozeomalqxxkhwxiii.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraG96ZW9tYWxxeHhraHd4aWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNzE3MTgsImV4cCI6MjA1MDg0NzcxOH0.3pRBwIFllhDhPHsJ7pdqMQ2OwFo6MM6xg9yyqsIsYE0'

export const supabase = createClient(supabaseUrl, supabaseKey)
