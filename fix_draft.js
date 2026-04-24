const fs = require('fs');

const filePath = 'src/app/publier/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ajouter EMPTY_FORM après STORAGE_KEY si pas déjà présent
if (!content.includes('const EMPTY_FORM')) {
  content = content.replace(
    "const STORAGE_KEY = 'abidjandeals_draft'",
    `const STORAGE_KEY = 'abidjandeals_draft'
const EMPTY_FORM = {
  title: '', description: '', price: '',
  category: '', subcategory: '', etat: '',
  city: '', quartier: '', tel: '', whatsapp: '',
}`
  );
  console.log('✅ EMPTY_FORM ajouté');
} else {
  console.log('⏭️  EMPTY_FORM déjà présent');
}

// 2. Remplacer le bloc de nettoyage après publication réussie
const oldBlock = `clearTimeout(globalTimeout)
      localStorage.removeItem(STORAGE_KEY)
      setSuccess(true)`;

const newBlock = `clearTimeout(globalTimeout)
      // ✅ Effacer le brouillon proprement après publication
      localStorage.removeItem(STORAGE_KEY)
      setHasDraft(false)
      setLastSaved(null)
      setForm(EMPTY_FORM)
      setMedia([])
      setSuccess(true)`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  console.log('✅ Brouillon effacé après publication — corrigé');
} else {
  console.log('⚠️  Bloc non trouvé — vérifiez manuellement');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fichier sauvegardé avec succès !');
