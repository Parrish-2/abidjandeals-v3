content = """export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  )
}
"""

with open('src/app/ad/[id]/loading.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
