// To run this script:
// 1. Make sure you have ts-node installed: npm install -g ts-node
// 2. Make sure your .env.local file has the correct Supabase credentials.
// 3. Run from the root of the project: ts-node --require dotenv/config scripts/seed-articles.ts

const { createClient } = require('@supabase/supabase-js');
const articles = require('./articles.json');
require('dotenv/config');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Role Key is not defined in your environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedArticles() {
  console.log("Starting to seed articles...");

  // Optional: Delete existing articles to prevent duplicates
  const { error: deleteError } = await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error("Error deleting existing articles:", deleteError);
    return;
  }
  console.log("Deleted existing articles.");

  const { data, error } = await supabase
    .from('articles')
    .insert(articles);

  if (error) {
    console.error("Error seeding articles:", error);
  } else {
    console.log("Successfully seeded articles:", data);
  }
}

seedArticles();
