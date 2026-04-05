'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, X } from 'lucide-react'
import { Resource } from '@/lib/supabase'
import { fetchResources, createResource, updateResource, deleteResource } from '@/lib/queries'

const PRESET_CATEGORIES = [
  'woodwork',
  'landscape',
  'construction',
  'stain',
  'plumber',
  'hvac',
  'masonry',
]

const EMPTY: Omit<Resource, 'id' | 'created_at'> = {
  name: '',
  company: null,
  mobile: null,
  email: null,
  notes: null,
  categories: [],
}

function CategoryPicker({
  value,
  onChange,
  knownCategories = [],
}: {
  value: string[]
  onChange: (cats: string[]) => void
  knownCategories?: string[]
}) {
  const [customInput, setCustomInput] = useState('')

  // All available pills = presets + any custom saved across all resources
  const allCategories = Array.from(new Set([...PRESET_CATEGORIES, ...knownCategories]))

  const toggle = (cat: string) => {
    if (value.includes(cat)) {
      onChange(value.filter(c => c !== cat))
    } else {
      onChange([...value, cat])
    }
  }

  const addCustom = () => {
    const trimmed = customInput.trim().toLowerCase()
    if (!trimmed) return
    // Auto-select it (it will appear as a pill once saved to a resource)
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setCustomInput('')
  }

  return (
    <div>
      <label className="text-xs mb-2 block" style={{ color: '#8b8ca8' }}>
        Categories
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {allCategories.map(cat => {
          const selected = value.includes(cat)
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              className="text-xs px-2.5 py-1 rounded-full font-medium capitalize transition-colors"
              style={{
                background: selected ? '#4f46e5' : '#2a2b48',
                color: selected ? '#fff' : '#8b8ca8',
                border: `1px solid ${selected ? '#4f46e5' : '#3d3e5a'}`,
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          className="text-xs rounded-lg px-3 py-1.5 outline-none flex-1"
          style={{ background: '#252640', color: '#e2e3f0', border: '1px solid #3d3e5a' }}
          placeholder="Add custom category…"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-40"
          style={{ background: '#2a2b48', color: '#8b8ca8', border: '1px solid #3d3e5a' }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

function CategoryBadges({ categories }: { categories: string[] }) {
  if (!categories || categories.length === 0) return <span style={{ color: '#4a4b68' }}>—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map(cat => (
        <span
          key={cat}
          className="text-xs px-2 py-0.5 rounded-full capitalize"
          style={{ background: '#2a2b48', color: '#7c7dab', border: '1px solid #3d3e5a' }}
        >
          {cat}
        </span>
      ))}
    </div>
  )
}

function ResourceForm({
  initial,
  onSave,
  onCancel,
  saving,
  knownCategories = [],
}: {
  initial: Omit<Resource, 'id' | 'created_at'>
  onSave: (v: Omit<Resource, 'id' | 'created_at'>) => void
  onCancel: () => void
  saving: boolean
  knownCategories?: string[]
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v || null }))

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: '#1a1b2e', border: '1px solid #3d3e5a' }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs mb-1 block" style={{ color: '#8b8ca8' }}>Name *</label>
          <input
            autoFocus
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: '#252640', color: '#e2e3f0', border: '1px solid #3d3e5a' }}
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: '#8b8ca8' }}>Company</label>
          <input
            value={form.company ?? ''}
            onChange={e => set('company', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: '#252640', color: '#e2e3f0', border: '1px solid #3d3e5a' }}
            placeholder="Company or trade"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: '#8b8ca8' }}>Mobile</label>
          <input
            value={form.mobile ?? ''}
            onChange={e => set('mobile', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: '#252640', color: '#e2e3f0', border: '1px solid #3d3e5a' }}
            placeholder="Phone number"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: '#8b8ca8' }}>Email</label>
          <input
            value={form.email ?? ''}
            onChange={e => set('email', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: '#252640', color: '#e2e3f0', border: '1px solid #3d3e5a' }}
            placeholder="Email address"
          />
        </div>
      </div>
      <div>
        <label className="text-xs mb-1 block" style={{ color: '#8b8ca8' }}>Notes</label>
        <textarea
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          rows={2}
          className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none"
          style={{ background: '#252640', color: '#e2e3f0', border: '1px solid #3d3e5a' }}
          placeholder="Notes, rates, specialties…"
        />
      </div>
      <CategoryPicker
        value={form.categories}
        onChange={cats => setForm(prev => ({ ...prev, categories: cats }))}
        knownCategories={knownCategories}
      />
      <div className="flex gap-2">
        <button
          onClick={() => form.name.trim() && onSave(form)}
          disabled={!form.name.trim() || saving}
          className="text-sm text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-50"
          style={{ background: '#4f46e5' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="text-sm" style={{ color: '#8b8ca8' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export function ResourcesView() {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
  })

  // All custom categories ever saved across any resource
  const knownCategories = Array.from(
    new Set(resources.flatMap(r => (r.categories ?? []).filter(c => !PRESET_CATEGORIES.includes(c))))
  )

  const createMutation = useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] })
      setAdding(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Resource, 'id' | 'created_at'>> }) =>
      updateResource(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#e2e3f0' }}>Resources</h2>
          <p className="text-xs mt-0.5" style={{ color: '#6b6c88' }}>
            Contractors, vendors, and other contacts
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm text-white px-3 py-1.5 rounded-lg font-medium"
            style={{ background: '#4f46e5' }}
          >
            <Plus size={14} />
            Add Resource
          </button>
        )}
      </div>

      {adding && (
        <ResourceForm
          initial={EMPTY}
          onSave={v => createMutation.mutate(v)}
          onCancel={() => setAdding(false)}
          saving={createMutation.isPending}
          knownCategories={knownCategories}
        />
      )}

      {resources.length === 0 && !adding ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: '#252640', border: '1px solid #2d2e4a' }}
        >
          <p className="text-sm" style={{ color: '#6b6c88' }}>No resources yet.</p>
          <button
            onClick={() => setAdding(true)}
            className="text-sm mt-2 underline"
            style={{ color: '#4f46e5' }}
          >
            Add your first contact
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#252640', border: '1px solid #2d2e4a' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #2d2e4a' }}>
                {['Name', 'Company', 'Categories', 'Mobile', 'Email', ''].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#6b6c88' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((r, i) => (
                <>
                  <tr
                    key={r.id}
                    className="group transition-colors"
                    style={{
                      borderBottom: i < resources.length - 1 ? '1px solid #2d2e4a' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2a2b48')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#e2e3f0' }}>
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8b8ca8' }}>
                      {r.company ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadges categories={r.categories} />
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8b8ca8' }}>
                      {r.mobile ? (
                        <a href={`tel:${r.mobile}`} style={{ color: '#8b8ca8' }}>
                          {r.mobile}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8b8ca8' }}>
                      {r.email ? (
                        <a href={`mailto:${r.email}`} style={{ color: '#4f46e5' }}>
                          {r.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => setEditingId(r.id)}
                          style={{ color: '#6b6c88' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#4f46e5')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#6b6c88')}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(r.id)}
                          style={{ color: '#6b6c88' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#6b6c88')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === r.id && (
                    <tr key={`edit-${r.id}`} style={{ borderBottom: i < resources.length - 1 ? '1px solid #2d2e4a' : 'none' }}>
                      <td colSpan={6} className="px-4 py-3">
                        <ResourceForm
                          initial={{ name: r.name, company: r.company, mobile: r.mobile, email: r.email, notes: r.notes, categories: r.categories ?? [] }}
                          onSave={v => updateMutation.mutate({ id: r.id, updates: v })}
                          onCancel={() => setEditingId(null)}
                          saving={updateMutation.isPending}
                          knownCategories={knownCategories}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
