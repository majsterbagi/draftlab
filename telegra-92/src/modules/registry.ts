import type { GameModule } from '../lib/types'

/**
 * Katalog rund-klocków. Moduł "Ryzyko i zakłady" (docs/modul-01-ryzyko-i-zaklady.md)
 * zarejestruje się tu w Etapie 2.
 */
const modules = new Map<string, GameModule>()

export function registerModule(module: GameModule): void {
  modules.set(module.id, module)
}

export function getModule(id: string): GameModule | undefined {
  return modules.get(id)
}

export function listModules(): GameModule[] {
  return [...modules.values()]
}
