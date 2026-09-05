import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';

interface Session {
  id: string;
  category: string;
  minutes: number;
  date: string;
}

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<Mode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const CATEGORIES = ['Programação', 'Design', 'Estudos Gerais', 'Documentação'];

export function App() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Programação');
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('focus_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('focus_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Contagem regressiva do Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      interval = setTimeout(() => {
        setIsRunning(false);

        if (mode === 'pomodoro') {
          const newSession: Session = {
            id: Date.now().toString(),
            category,
            minutes: 25,
            date: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };
          setSessions((prev) => [newSession, ...prev]);
        }
      }, 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, category]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const clearHistory = () => {
    setSessions([]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalFocusMinutes = sessions.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} /> PRODUTIVIDADE & TRACKING LOCAL
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Focus & Habit Tracker</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem' }}>
            Ciclos de produtividade adaptativos com registro automático no armazenamento do navegador.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border)',
          padding: '0.6rem 1.2rem',
          borderRadius: '10px'
        }}>
          <Flame color="var(--accent)" size={20} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>TEMPO FOCADO</span>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>{totalFocusMinutes} min</strong>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Painel do Temporizador */}
        <div style={{
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Seletor de Modo */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '8px' }}>
            {[
              { id: 'pomodoro', label: 'Foco (25m)' },
              { id: 'shortBreak', label: 'Pausa (5m)' },
              { id: 'longBreak', label: 'Pausa Longa (15m)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id as Mode)}
                style={{
                  background: mode === m.id ? 'var(--accent)' : 'transparent',
                  color: mode === m.id ? '#fff' : 'var(--text-sub)',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Relógio Grande */}
          <div style={{
            fontSize: '5.5rem',
            fontWeight: 800,
            letterSpacing: '2px',
            color: '#fff',
            fontFamily: 'monospace'
          }}>
            {timeFormatted}
          </div>

          {/* Categoria do Foco */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Focando agora em:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    backgroundColor: category === cat ? 'rgba(253, 93, 20, 0.15)' : 'transparent',
                    border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                    color: category === cat ? 'var(--accent)' : 'var(--text-sub)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Controles do Timer */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="transition-smooth"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                border: 'none',
                padding: '0.8rem 2.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px var(--accent-glow)'
              }}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pausar' : 'Começar'}
            </button>

            <button
              onClick={resetTimer}
              className="transition-smooth"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-sub)',
                border: '1px solid var(--border)',
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Histórico e Métricas */}
        <div style={{
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
              <CheckCircle2 size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Sessões Concluídas</span>
            </div>
            {sessions.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-sub)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem'
                }}
              >
                <Trash2 size={14} /> Limpar
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px' }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '2rem 0', fontSize: '0.9rem' }}>
                Nenhuma sessão completada ainda. Complete um ciclo de 25 min para registrar métricas!
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border)',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{s.category}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>{s.date}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(253, 93, 20, 0.12)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px'
                  }}>
                    +{s.minutes} min
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;