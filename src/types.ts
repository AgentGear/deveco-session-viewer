export interface PluginInput {
  client: any
  project: { id: string }
  directory: string
}

export interface Hooks {
  event?: (input: { event: { type: string; [key: string]: unknown } }) => Promise<void>
}

export interface PluginModule {
  id?: string
  server: (input: PluginInput, options?: Record<string, unknown>) => Promise<Hooks>
}
