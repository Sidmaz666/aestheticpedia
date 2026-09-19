import { VaultLoader } from '@/components/site/vault-loader'

export default function Loading() {
  return (
    <main className="flex min-h-[70svh] flex-1 items-center justify-center px-4" aria-busy="true">
      <VaultLoader />
    </main>
  )
}
