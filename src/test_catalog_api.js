import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true });

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('order_index', { ascending: false });

  console.log(`Total categories in DB: ${categories?.length}`);
  console.log(`Total products in DB: ${products?.length}`);

  const visibleProducts = (products || []).filter(p => p.is_visible !== false);
  console.log(`Total products with is_visible !== false: ${visibleProducts.length}`);

  const nullVisible = (products || []).filter(p => p.is_visible === null);
  console.log(`Total products with is_visible === null: ${nullVisible.length}`);

  const falseVisible = (products || []).filter(p => p.is_visible === false);
  console.log(`Total products with is_visible === false: ${falseVisible.length}`);

  const trueVisible = (products || []).filter(p => p.is_visible === true);
  console.log(`Total products with is_visible === true: ${trueVisible.length}`);
}

test();
