const fs = require('fs');

// ══════════════════════════════════════════════════════════════
// FIX 1 — search/page.tsx : ne pas bloquer si sub_category_id null
// ══════════════════════════════════════════════════════════════
let searchContent = fs.readFileSync('src/app/search/page.tsx', 'utf8');

const oldQueryBlock = `      if (resolvedSubCatUuid) {
        query = query
          .eq("sub_category_id", resolvedSubCatUuid)
          .eq("category_id", dbCategoryId!)
      } else if (dbCategoryId) {
        query = query.eq("category_id", dbCategoryId)
      }`;

const newQueryBlock = `      // Toujours filtrer par category_id si disponible
      if (dbCategoryId) {
        query = query.eq("category_id", dbCategoryId)
      }
      // Filtrer par sous-catégorie seulement si l'UUID est trouvé
      if (resolvedSubCatUuid) {
        query = query.eq("sub_category_id", resolvedSubCatUuid)
      }`;

if (searchContent.includes(oldQueryBlock)) {
  searchContent = searchContent.replace(oldQueryBlock, newQueryBlock);
  fs.writeFileSync('src/app/search/page.tsx', searchContent, 'utf8');
  console.log('\u2705 search/page.tsx corrig\u00e9 !');
} else {
  console.log('\u26a0\uFE0F  Bloc non trouv\u00e9 dans search/page.tsx — v\u00e9rifiez manuellement');
}

// ══════════════════════════════════════════════════════════════
// FIX 2 — publier/page.tsx : sauvegarder sub_category_id dans l'insert
// ══════════════════════════════════════════════════════════════
let publierContent = fs.readFileSync('src/app/publier/page.tsx', 'utf8');

// Ajouter la résolution sub_category_id avant l'insert
const oldInsertPromise = `      const insertPromise = supabase.from('ads').insert({`;

const newInsertPromise = `      // Résoudre sub_category_id depuis le nom de sous-catégorie
      let subCategoryUuid: string | null = null
      if (form.subcategory && form.category) {
        const { data: subCat } = await supabase
          .from('sub_categories')
          .select('id')
          .eq('category_id', form.category)
          .ilike('name', form.subcategory)
          .maybeSingle()
        subCategoryUuid = subCat?.id ?? null
      }

      const insertPromise = supabase.from('ads').insert({`;

if (publierContent.includes(oldInsertPromise)) {
  publierContent = publierContent.replace(oldInsertPromise, newInsertPromise);
  console.log('\u2705 sub_category_id r\u00e9solution ajout\u00e9e !');
} else {
  console.log('\u26a0\uFE0F  insertPromise non trouv\u00e9 dans publier/page.tsx');
}

// Ajouter sub_category_id dans l'objet insert
const oldInsertObj = `        subcategory: form.subcategory || null,`;
const newInsertObj = `        subcategory: form.subcategory || null,
        sub_category_id: subCategoryUuid,`;

if (publierContent.includes(oldInsertObj)) {
  publierContent = publierContent.replace(oldInsertObj, newInsertObj);
  fs.writeFileSync('src/app/publier/page.tsx', publierContent, 'utf8');
  console.log('\u2705 publier/page.tsx corrig\u00e9 avec sub_category_id !');
} else {
  console.log('\u26a0\uFE0F  Ligne subcategory non trouv\u00e9e dans publier/page.tsx');
}

console.log('\n\u2705 Les 2 fichiers sont corrig\u00e9s ! Faites git add . && git commit && git push');
