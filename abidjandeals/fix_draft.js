const fs = require('fs');

const filePath = 'src/app/publier/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Trouver le bloc juste avant "} finally {"
const oldBlock = `clearTimeout(globalTimeout)
    } finally {`;

const newBlock = `clearTimeout(globalTimeout)
      // ✅ Effacer le brouillon après publication réussie
      localStorage.removeItem(STORAGE_KEY)
      setHasDraft(false)
      setLastSaved(null)
      setForm(EMPTY_FORM)
      setMedia([])
    } finally {`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Brouillon effacé après publication — corrigé avec succès !');
} else {
  console.log('⚠️  Bloc non trouvé — cherchons autrement...');
  // Chercher le dernier clearTimeout avant finally
  const idx = content.lastIndexOf('clearTimeout(globalTimeout)\n    } finally {');
  console.log('Index trouvé:', idx);
}
