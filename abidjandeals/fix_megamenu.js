const fs = require('fs');

const filePath = 'src/components/MegaMenu.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// FIX 1 — subBadges undefined fallback
const old1 = 'subs: cat.subcats.map(s => toSubCat(s, visual.subBadges)),';
const new1 = 'subs: cat.subcats.map(s => toSubCat(s as string, visual.subBadges ?? {})),';

if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('\u2705 FIX 1 : subBadges fallback appliqu\u00e9 !');
} else {
  console.log('\u26a0\uFE0F  FIX 1 non trouv\u00e9 — d\u00e9j\u00e0 corrig\u00e9 ou ligne diff\u00e9rente');
}

// FIX 2 — toSubCat signature : accepter string uniquement (subcats est string[])
const oldToSubCat = `function toSubCat(
  sub: string | { name: string; slug?: string },
  badges: Record<string, 'TOP' | 'NEW' | 'PROMO' | 'URGENT'> = {}
): SubCat {
  // ✅ FIX CRITIQUE : on utilise sub.slug (slug DB exact) au lieu de slugify(sub.name)
  // slugify("Voitures d'occasion") → "voitures-d-occasion" (FAUX)
  // sub.slug                       → "voitures-d-occasion" (VRAI, calé sur la DB)
  const name = typeof sub === 'string' ? sub : sub.name
  const id = typeof sub === 'string'
    ? slugify(sub)
    : (sub.slug ?? slugify(sub.name))
  return { id, nameKey: name, badge: badges[name] }
}`;

const newToSubCat = `function toSubCat(
  sub: string,
  badges: Record<string, 'TOP' | 'NEW' | 'PROMO' | 'URGENT'> = {}
): SubCat {
  const id = slugify(sub)
  return { id, nameKey: sub, badge: badges[sub] }
}`;

if (content.includes(oldToSubCat)) {
  content = content.replace(oldToSubCat, newToSubCat);
  console.log('\u2705 FIX 2 : toSubCat simplifi\u00e9 (string only) !');
} else {
  console.log('\u26a0\uFE0F  FIX 2 non trouv\u00e9 — v\u00e9rifiez manuellement');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\u2705 MegaMenu.tsx corrig\u00e9 d\u00e9finitivement !');
