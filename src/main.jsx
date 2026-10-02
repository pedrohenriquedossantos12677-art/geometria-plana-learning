import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { modules } from './data/courseData';

const STORAGE_KEY = 'geo-plana-progress';

const buildEmptyProgress = () =>
  modules.reduce((acc, module) => {
    acc[module.id] = Array(module.questions.length).fill(null);
    return acc;
  }, {});

const computeModuleStatus = (module, answers) => {
  const correct = module.questions.filter((question, index) => answers[index] === question.correct).length;
  return {
    correct,
    passed: correct >= Math.max(2, Math.ceil(module.questions.length * 0.6)),
  };
};

function App() {
  const [studentName, setStudentName] = useState('Estudante');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return buildEmptyProgress();

    try {
      const parsed = JSON.parse(saved);
      return Object.keys(parsed).length ? parsed : buildEmptyProgress();
    } catch {
      return buildEmptyProgress();
    }
  });
  const [certificateVisible, setCertificateVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const moduleStatuses = useMemo(
    () =>
      modules.map((module) => {
        const moduleAnswers = answers[module.id] || Array(module.questions.length).fill(null);
        return { module, ...computeModuleStatus(module, moduleAnswers) };
      }),
    [answers]
  );

  const activeModule = modules[activeModuleIndex];
  const currentAnswers = answers[activeModule.id] || Array(activeModule.questions.length).fill(null);
  const currentStatus = computeModuleStatus(activeModule, currentAnswers);

  const totalQuestions = modules.reduce((sum, module) => sum + module.questions.length, 0);
  const totalCorrect = moduleStatuses.reduce((sum, item) => sum + item.correct, 0);
  const completedModules = moduleStatuses.filter((item) => item.passed).length;
  const overallProgress = Math.round((completedModules / modules.length) * 100);
  const allModulesPassed = moduleStatuses.every((item) => item.passed);

  const handleAnswer = (moduleId, questionIndex, optionIndex) => {
    setAnswers((previous) => {
      const currentModuleAnswers = previous[moduleId] || Array(modules.find((module) => module.id === moduleId).questions.length).fill(null);
      const updated = [...currentModuleAnswers];
      updated[questionIndex] = optionIndex;
      return { ...previous, [moduleId]: updated };
    });
  };

  const handleCertificate = () => {
    if (allModulesPassed) {
      setCertificateVisible(true);
      document.getElementById('certificado')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-icon">G</div>
          <div>
            <p className="eyebrow">Plataforma de aprendizagem</p>
            <h1>Geometria Plana Master</h1>
          </div>
        </div>

        <nav className="header-actions">
          <button onClick={() => document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' })}>Módulos</button>
          <button className="primary" onClick={() => document.getElementById('certificado')?.scrollIntoView({ behavior: 'smooth' })}>Certificado</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">Aprenda matemática com clareza e prática</span>
            <h2>Geometria plana do básico ao nível de prova com explicações, fórmulas e exercícios.</h2>
            <p>
              Este curso foi pensado para transformar conceitos da matemática em raciocínio rápido. Aqui você encontra
              teoria detalhada, macetes para resolver questões, vídeo de revisão em cada módulo, exercícios de OBMEP,
              Enem e vestibulares e feedback de acerto e erro para acompanhar seu desempenho.
            </p>

            <div className="hero-actions">
              <button className="primary" onClick={() => setActiveModuleIndex(0)}>Começar agora</button>
              <button onClick={() => document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' })}>Ver curriculum</button>
            </div>

            <div className="stats-grid">
              <MetricCard label="Módulos" value={String(modules.length)} />
              <MetricCard label="Questões" value={String(totalQuestions)} />
              <MetricCard label="Progresso" value={`${overallProgress}%`} />
              <MetricCard label="Acertos" value={String(totalCorrect)} />
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-card">
              <div className="panel-head">
                <span className="dot green" />
                <span>O que você vai aprender</span>
              </div>
              <ul>
                <li>Introdução à geometria plana</li>
                <li>Polígonos e classificação</li>
                <li>Perímetro e área</li>
                <li>Triângulos e Pitágoras</li>
                <li>Quadriláteros e círculos</li>
                <li>Questões de OBMEP e Enem</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="modulos" className="course-layout">
          <aside className="sidebar">
            <div className="sidebar-title">Módulos</div>
            {modules.map((module, index) => {
              const status = moduleStatuses[index];
              const selected = index === activeModuleIndex;

              return (
                <button
                  key={module.id}
                  type="button"
                  className={`module-button ${selected ? 'active' : ''}`}
                  onClick={() => setActiveModuleIndex(index)}
                >
                  <div className="module-label">
                    <span className="module-number">0{index + 1}</span>
                    <strong>{module.title}</strong>
                  </div>
                  <span className={`status-badge ${status.passed ? 'done' : ''}`}>
                    {status.passed ? 'Concluído' : 'Em estudo'}
                  </span>
                </button>
              );
            })}
          </aside>

          <article className="content-panel">
            <div className="module-heading">
              <span className="module-kicker">Módulo {activeModuleIndex + 1}</span>
              <span className="module-tag">{activeModule.category}</span>
            </div>

            <h3>{activeModule.title}</h3>
            <p className="module-description">{activeModule.description}</p>

            <div className="objective-box">
              <h4>Objetivo do módulo</h4>
              <p>{activeModule.objective}</p>
            </div>

            <div className="section-block">
              <h4>Resumo teórico</h4>
              {activeModule.sections.map((section) => (
                <div key={section.title} className="theory-card">
                  <h5>{section.title}</h5>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>

            {activeModule.formulas && (
              <div className="section-block">
                <h4>Fórmulas essenciais</h4>
                <div className="formula-grid">
                  {activeModule.formulas.map((formula) => (
                    <div key={formula.label} className="formula-item">
                      <span>{formula.label}</span>
                      <strong>{formula.expression}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModule.examples && (
              <div className="section-block">
                <h4>Exemplos resolvidos</h4>
                {activeModule.examples.map((example) => (
                  <div key={example.title} className="example-card">
                    <h5>{example.title}</h5>
                    <p>{example.solution}</p>
                  </div>
                ))}
              </div>
            )}

            {activeModule.tips && (
              <div className="section-block">
                <h4>Macetes para resolver rápido</h4>
                <ul className="tip-list">
                  {activeModule.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="section-block">
              <h4>Vídeo de revisão</h4>
              <div className="video-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${activeModule.videoId}`}
                  title={activeModule.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="section-block">
              <div className="quiz-header">
                <h4>Questões do módulo</h4>
                <span className={`status-pill ${currentStatus.passed ? 'success' : ''}`}>
                  {currentStatus.passed ? 'Módulo aprovado' : `${currentStatus.correct}/${activeModule.questions.length} acertos`}
                </span>
              </div>

              {activeModule.questions.map((question, questionIndex) => {
                const selected = currentAnswers[questionIndex];
                const answered = selected !== null && selected !== undefined;
                const isCorrect = answered && selected === question.correct;

                return (
                  <div key={question.ask} className="question-card">
                    <p className="question-text">{question.ask}</p>

                    <div className="option-grid">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = selected === optionIndex;
                        const revealCorrect = answered && optionIndex === question.correct;
                        const revealWrong = answered && isSelected && !isCorrect;

                        return (
                          <button
                            key={option}
                            type="button"
                            className={`option-button ${isSelected ? 'selected' : ''} ${revealCorrect ? 'correct' : ''} ${revealWrong ? 'wrong' : ''}`}
                            onClick={() => handleAnswer(activeModule.id, questionIndex, optionIndex)}
                            disabled={answered}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <div className={`feedback-box ${isCorrect ? 'success' : 'error'}`}>
                        <strong>{isCorrect ? 'Acertou!' : 'Errou!'}</strong>
                        <p>{question.explanation}</p>
                        <span>Resposta correta: {question.options[question.correct]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="module-actions">
              <button type="button" className="secondary" onClick={() => setActiveModuleIndex((previous) => Math.max(previous - 1, 0))}>Módulo anterior</button>
              <button type="button" className="primary" onClick={() => setActiveModuleIndex((previous) => Math.min(previous + 1, modules.length - 1))}>Próximo módulo</button>
            </div>
          </article>
        </section>

        <section id="certificado" className="certificate-section">
          <div className="certificate-box">
            <div className="certificate-header">
              <div>
                <p className="eyebrow">Conclusão da trilha</p>
                <h3>Certificado de Geometria Plana</h3>
              </div>
              <button type="button" className="primary" onClick={handleCertificate} disabled={!allModulesPassed}>
                Gerar certificado
              </button>
            </div>

            <div className="student-box">
              <label htmlFor="studentName">Nome do estudante</label>
              <input
                id="studentName"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            {certificateVisible && allModulesPassed && (
              <div className="certificate-card">
                <div className="certificate-band" />
                <p className="certificate-label">Certificamos que</p>
                <h4>{studentName || 'Estudante'}</h4>
                <p>
                  concluiu com sucesso todos os módulos de Geometria Plana, demonstrando domínio de conceitos,
                  fórmulas, raciocínio matemático e resolução de problemas em nível escolar, de OBMEP e de vestibulares.
                </p>
                <div className="signature-row">
                  <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
                  <span>Plataforma Geometria Plana Master</span>
                </div>
              </div>
            )}

            {!allModulesPassed && (
              <p className="certificate-hint">
                Complete todos os módulos com a aprovação mínima para liberar o certificado final.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
