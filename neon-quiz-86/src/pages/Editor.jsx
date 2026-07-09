import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ensureSampleQuiz, listQuizzes, saveQuiz, deleteQuiz } from '../lib/rtdb.js'

const emptyQuestion = () => ({ text: '', answers: ['', '', '', ''], correct: 0, difficulty: 1 })
const emptyDuelQuestion = () => ({ text: '', answers: ['', '', '', ''], correct: 0 })
const emptyQuiz = () => ({
  name: 'Nowy zestaw',
  categories: [1, 2, 3, 4].map((i) => ({ name: `Kategoria ${i}`, questions: [emptyQuestion()] })),
  duel: [emptyDuelQuestion()],
})
const slug = () => 'q' + Date.now().toString(36)

export default function Editor() {
  const [quizzes, setQuizzes] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [status, setStatus] = useState('')
  const fileRef = useRef(null)

  const refresh = () => ensureSampleQuiz().then(listQuizzes).then(setQuizzes).catch((e) => setStatus('⚠ ' + e.message))
  useEffect(() => { refresh() }, [])

  const open = (id) => { setCurrentId(id); setQuiz(structuredClone(quizzes[id])) }
  const flash = (msg) => { setStatus(msg); setTimeout(() => setStatus(''), 2500) }

  const save = async () => {
    const problems = validate(quiz)
    if (problems) { flash('⚠ ' + problems); return }
    const id = currentId || slug()
    await saveQuiz(id, quiz)
    setCurrentId(id)
    await refresh()
    flash('💾 Zapisano!')
  }

  const duplicate = async () => {
    const id = slug()
    await saveQuiz(id, { ...quiz, name: quiz.name + ' (kopia)' })
    await refresh()
    setCurrentId(id)
    setQuiz((q) => ({ ...q, name: q.name + ' (kopia)' }))
    flash('📋 Zduplikowano!')
  }

  const remove = async () => {
    if (!currentId || !confirm(`Usunąć zestaw „${quiz.name}"?`)) return
    await deleteQuiz(currentId)
    setCurrentId(null); setQuiz(null)
    await refresh()
    flash('🗑 Usunięto.')
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${quiz.name.replace(/\W+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data.categories || !data.duel) throw new Error('zły format')
        setQuiz(data); setCurrentId(null)
        flash('📥 Zaimportowano — zapisz, aby dodać do bazy.')
      } catch { flash('⚠ Nieprawidłowy plik JSON.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const set = (patch) => setQuiz((q) => ({ ...q, ...patch }))

  return (
    <div className="min-h-screen relative p-6 max-w-5xl mx-auto">
      <div className="synthwave-grid" />
      <div className="relative z-10">
        <header className="flex flex-wrap items-center gap-4 mb-6">
          <Link to="/" className="text-purple-400 text-xl hover:text-neon-cyan">← Menu</Link>
          <h1 className="font-display text-lg neon-text-pink flex-1">EDYTOR ZESTAWÓW</h1>
          {status && <span className="text-xl neon-text-amber">{status}</span>}
        </header>

        <div className="flex flex-wrap gap-3 mb-6">
          {quizzes && Object.entries(quizzes).map(([id, q]) => (
            <button key={id} onClick={() => open(id)}
              className={`neon-panel px-4 py-2 text-xl ${id === currentId ? 'border-neon-cyan neon-text-cyan' : ''}`}>
              {q.name}
            </button>
          ))}
          <button onClick={() => { setCurrentId(null); setQuiz(emptyQuiz()) }} className="neon-btn-pink !text-[10px]">＋ Nowy</button>
          <button onClick={() => fileRef.current?.click()} className="neon-btn-cyan !text-[10px]">📥 Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" onChange={importJson} className="hidden" />
        </div>

        {!quiz && <p className="text-2xl text-purple-300">Wybierz zestaw albo utwórz nowy.</p>}

        {quiz && (
          <div className="flex flex-col gap-6">
            <div className="neon-panel p-4 flex flex-wrap gap-3 items-center">
              <input value={quiz.name} onChange={(e) => set({ name: e.target.value })}
                className="bg-black/60 border border-neon-violet rounded p-2 text-2xl flex-1 min-w-[200px]" />
              <button onClick={save} className="neon-btn-pink !text-[10px]">💾 Zapisz</button>
              {currentId && <button onClick={duplicate} className="neon-btn-cyan !text-[10px]">📋 Duplikuj</button>}
              <button onClick={exportJson} className="neon-btn-cyan !text-[10px]">📤 Eksport</button>
              {currentId && <button onClick={remove} className="neon-btn !text-[10px] border-neon-red text-neon-red">🗑 Usuń</button>}
            </div>

            {quiz.categories.map((cat, ci) => (
              <CategoryEditor key={ci} cat={cat}
                onChange={(c) => set({ categories: quiz.categories.map((x, i) => (i === ci ? c : x)) })}
                onRemove={quiz.categories.length > 4 ? () => set({ categories: quiz.categories.filter((_, i) => i !== ci) }) : null}
              />
            ))}
            <button onClick={() => set({ categories: [...quiz.categories, { name: 'Nowa kategoria', questions: [emptyQuestion()] }] })}
              className="neon-btn-cyan self-start !text-[10px]">＋ Kategoria</button>

            <div className="neon-panel p-4">
              <h2 className="text-2xl neon-text-amber mb-3">⚔️ Pula pytań pojedynkowych ({quiz.duel.length})</h2>
              {quiz.duel.map((q, qi) => (
                <QuestionEditor key={qi} q={q} duel
                  onChange={(nq) => set({ duel: quiz.duel.map((x, i) => (i === qi ? nq : x)) })}
                  onRemove={() => set({ duel: quiz.duel.filter((_, i) => i !== qi) })}
                />
              ))}
              <button onClick={() => set({ duel: [...quiz.duel, emptyDuelQuestion()] })} className="neon-btn-pink !text-[10px]">＋ Pytanie pojedynkowe</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function validate(quiz) {
  if (!quiz.name.trim()) return 'Zestaw musi mieć nazwę.'
  if (quiz.categories.length < 4) return 'Potrzeba min. 4 kategorii.'
  for (const c of quiz.categories) {
    if (!c.name.trim()) return 'Każda kategoria musi mieć nazwę.'
    if (!c.questions?.length || c.questions.length < 3) return `Kategoria „${c.name}" potrzebuje min. 3 pytań.`
    for (const q of c.questions) {
      if (!q.text.trim() || q.answers.some((a) => !a.trim())) return `Uzupełnij pytania w kategorii „${c.name}".`
    }
  }
  if (!quiz.duel?.length || quiz.duel.length < 7) return 'Pula pojedynkowa: min. 7 pytań.'
  for (const q of quiz.duel) {
    if (!q.text.trim() || q.answers.some((a) => !a.trim())) return 'Uzupełnij pytania pojedynkowe.'
  }
  return null
}

function CategoryEditor({ cat, onChange, onRemove }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="neon-panel p-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(!open)} className="text-2xl">{open ? '▼' : '▶'}</button>
        <input value={cat.name} onChange={(e) => onChange({ ...cat, name: e.target.value })}
          className="bg-black/60 border border-purple-700 rounded p-2 text-2xl flex-1" />
        <span className="text-xl text-purple-400">{cat.questions.length} pyt.</span>
        {onRemove && <button onClick={onRemove} className="text-neon-red text-2xl">🗑</button>}
      </div>
      {open && (
        <div className="mt-3">
          {cat.questions.map((q, qi) => (
            <QuestionEditor key={qi} q={q}
              onChange={(nq) => onChange({ ...cat, questions: cat.questions.map((x, i) => (i === qi ? nq : x)) })}
              onRemove={() => onChange({ ...cat, questions: cat.questions.filter((_, i) => i !== qi) })}
            />
          ))}
          <button onClick={() => onChange({ ...cat, questions: [...cat.questions, emptyQuestion()] })}
            className="neon-btn-cyan !text-[10px]">＋ Pytanie</button>
        </div>
      )}
    </div>
  )
}

function QuestionEditor({ q, onChange, onRemove, duel = false }) {
  return (
    <div className="border border-purple-900 rounded-lg p-3 mb-3 bg-black/30">
      <div className="flex gap-2 items-start">
        <textarea value={q.text} rows={1} placeholder="Treść pytania…"
          onChange={(e) => onChange({ ...q, text: e.target.value })}
          className="bg-black/60 border border-purple-700 rounded p-2 text-xl flex-1 resize-y" />
        {!duel && (
          <select value={q.difficulty} onChange={(e) => onChange({ ...q, difficulty: Number(e.target.value) })}
            className="bg-black/60 border border-purple-700 rounded p-2 text-xl" title="Trudność">
            <option value={1}>★</option><option value={2}>★★</option><option value={3}>★★★</option>
          </select>
        )}
        <button onClick={onRemove} className="text-neon-red text-xl mt-1">✕</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-2">
        {q.answers.map((a, ai) => (
          <label key={ai} className={`flex items-center gap-2 rounded p-1 ${q.correct === ai ? 'bg-neon-green/10' : ''}`}>
            <input type="radio" checked={q.correct === ai} onChange={() => onChange({ ...q, correct: ai })}
              title="poprawna" className="accent-green-400" />
            <input value={a} placeholder={`Odpowiedź ${ai + 1}`}
              onChange={(e) => onChange({ ...q, answers: q.answers.map((x, i) => (i === ai ? e.target.value : x)) })}
              className="bg-black/60 border border-purple-800 rounded p-1.5 text-lg flex-1" />
          </label>
        ))}
      </div>
    </div>
  )
}
