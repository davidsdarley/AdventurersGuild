// AI-assisted: see AI-ATTRIBUTION.md
export function ComingSoon({ page }: { page: string }) {
  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold">{page}</h1>
      <p className="mt-2 text-gray-600">Coming soon</p>
    </section>
  )
}
