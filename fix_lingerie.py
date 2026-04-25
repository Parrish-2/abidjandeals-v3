c = open('src/app/page.tsx', 'rb').read().decode('utf-8')
c = c.replace("neq('category_id', 'lingerie')", "neq('category_id', 'cat_lingerie')")
open('src/app/page.tsx', 'w', encoding='utf-8').write(c)
print('Done')
