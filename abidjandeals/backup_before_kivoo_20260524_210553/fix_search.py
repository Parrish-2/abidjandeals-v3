import re

# Fix 1: Corriger le mapping dans search/page.tsx
content = open('src/app/search/page.tsx', 'rb').read().decode('utf-8')

old_mapping = """SLUG_TO_DB_CATEGORY: Record<string, string> = {
  'auto': 'cat_auto',
  'automobile': 'cat_auto',
  'vehicules-equipements': 'cat_auto',
  'vehicules': 'cat_auto',
  'hightech': 'cat_tech',
  'high-tech': 'cat_tech',
  'hightech-informatique': 'cat_tech',
  'tech': 'cat_tech',
  'immobilier': 'cat_immo',
  'immo': 'cat_immo',
  'location': 'cat_immo',
  'mode': 'cat_mode',
  'maison': 'cat_maison',
  'electromenager': 'cat_maison',
  'bebe': 'cat_maison',
  'services': 'cat_serv',
  'emploi': 'cat_serv',
  'sport': 'cat_loisir',
  'sport-loisirs': 'cat_loisir',
  'loisirs': 'cat_loisir',
  'pharma': 'cat_autres',
  'epicerie': 'cat_autres',
  'autres': 'cat_autres',
  'agri': 'cat_agri',
  'agriculture': 'cat_agri',
  'agriculture-industrie': 'cat_agri',"""

new_mapping = """SLUG_TO_DB_CATEGORY: Record<string, string> = {
  'auto': 'cat_auto',
  'automobile': 'cat_auto',
  'vehicules-equipements': 'cat_auto',
  'vehicules': 'cat_auto',
  'cat_auto': 'cat_auto',
  'hightech': 'cat_tech',
  'high-tech': 'cat_tech',
  'hightech-informatique': 'cat_tech',
  'tech': 'cat_tech',
  'cat_tech': 'cat_tech',
  'immobilier': 'cat_immo',
  'immo': 'cat_immo',
  'cat_immo': 'cat_immo',
  'location': 'cat_location',
  'mobilite': 'cat_location',
  'cat_location': 'cat_location',
  'services': 'cat_serv',
  'emploi': 'cat_serv',
  'cat_serv': 'cat_serv',
  'electromenager': 'cat_elec',
  'cat_elec': 'cat_elec',
  'bebe': 'cat_bebe',
  'mamans': 'cat_bebe',
  'cat_bebe': 'cat_bebe',
  'pharma': 'cat_pharma',
  'parapharmacie': 'cat_pharma',
  'cat_pharma': 'cat_pharma',
  'epicerie': 'cat_epicerie',
  'boissons': 'cat_epicerie',
  'cat_epicerie': 'cat_epicerie',
  'lingerie': 'cat_lingerie',
  'cat_lingerie': 'cat_lingerie',
  'mode': 'cat_mode',
  'maison': 'cat_maison',
  'sport': 'cat_loisir',
  'loisirs': 'cat_loisir',
  'agri': 'cat_agri',
  'agriculture': 'cat_agri',
  'agriculture-industrie': 'cat_agri',"""

if old_mapping in content:
    content = content.replace(old_mapping, new_mapping)
    open('src/app/search/page.tsx', 'w', encoding='utf-8').write(content)
    print('Fix 1 OK: SLUG_TO_DB_CATEGORY corrige')
else:
    print('Fix 1 SKIP: mapping pas trouve tel quel, cherche une autre approche...')
    # Try to find and replace just the wrong mappings
    fixes = [
        ("'location': 'cat_immo'", "'location': 'cat_location'"),
        ("'electromenager': 'cat_maison'", "'electromenager': 'cat_elec'"),
        ("'bebe': 'cat_maison'", "'bebe': 'cat_bebe'"),
        ("'mode': 'cat_mode'", "'mode': 'cat_mode'"),
        ("'maison': 'cat_maison'", "'maison': 'cat_maison'"),
        ("'pharma': 'cat_autres'", "'pharma': 'cat_pharma'"),
        ("'epicerie': 'cat_autres'", "'epicerie': 'cat_epicerie'"),
        ("'autres': 'cat_autres'", "'autres': 'cat_autres'"),
    ]
    for old, new in fixes:
        if old in content:
            content = content.replace(old, new)
            print(f'  Fixed: {old} -> {new}')
    open('src/app/search/page.tsx', 'w', encoding='utf-8').write(content)
    print('Fix 1 PARTIAL: corrections partielles appliquees')

# Fix 2: Corriger l'encodage dans page.tsx
content2 = open('src/app/page.tsx', 'rb').read().decode('utf-8')
content2 = content2.replace('Annonces rÃ©centes', 'Annonces recentes')
open('src/app/page.tsx', 'w', encoding='utf-8').write(content2)
print('Fix 2 OK: encodage page.tsx corrige')
