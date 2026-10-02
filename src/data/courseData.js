import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { modules } from './data/courseData';

const getModuleScore = (module) => {
  const answers = JSON.parse(localStorage.getItem('geo-answers') || '{}');
  const moduleAnswers = answers[module.id] || [];
  const correct = module.questions.filter((_, index) => moduleAnswers[index] === module.questions[index].correct).length;
  return correct;
};

function App() {
  const [activeModuleIndex, setActiveModuleIndex] = React.useState(0);
  const [studentName, setStudentName] = React.useState('Estudante');
  const [answers, setAnswers] = React.useState(() => {
    const saved = JSON.parse(localStorage.getItem('geo-answers') || '{}');
    return Object.keys(saved).length
      ? saved
      : modules.reduce((acc, module) => {
          acc[module.id] = Array(module.questions.length).fill(null);
          return acc;
        }, {});
  });
  const [certificateVisible, setCertificateVisible] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('geo-answers', JSON.stringify(answers));
  }, [answers]);

  const activeModule = modules[activeModuleIndex];

  const moduleStats = modules.map((module) => {
    const moduleAnswers = answers[module.id] || Array(module.questions.length).fill(null);
    const correct = module.questions.filter((_, index) => moduleAnswers[index] === module.questions[index].correct).length;
    const completed = correct >= 2;
    return { module, correct, completed };
  });

  const totalCorrect = moduleStats.reduce((total, item) => total + item.correct, 0);
  const totalQuestions = modules.reduce((sum, module) => sum + module.questions.length, 0);
  const allModulesCompleted = moduleStats.every((item) => item.completed);
  const courseProgress = Math.round((moduleStats.filter((item) => item.completed).length / modules.length) * 100);

  const handleAnswer = (moduleId, questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [moduleId]: prev[moduleId]
        ? prev[moduleId].map((value, index) => (index === questionIndex ? optionIndex : value))
        : Array(modules.find((module) => module.id === moduleId).questions.length).fill(null).map((_, idx) => (idx === questionIndex ? optionIndex : null)),
    }));
  };

  const handleCertificate = () => {
    if (allModulesCompleted) {
      setCertificateVisible(true);
    }
  };

  const activeModuleAnswers = answers[activeModule.id] || Array(activeModule.questions.length).fill(null);
  const activeCorrectCount = activeModule.questions.filter((_, index) => activeModuleAnswers[index] === activeModule.questions[index].correct).length;
  const activePassed = activeCorrectCount >= 2;

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">G</div>
          <div>
            <p className="eyebrow">Plataforma Acadêmica</p>
            <h1>Geometria Plana Master</h1>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => document.getElementById('modulos').scrollIntoView({ behavior: 'smooth' })}>Módulos</button>
          <button className="primary" onClick={() => document.getElementById('certificado').scrollIntoView({ behavior: 'smooth' })}>Certificado</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">Aprenda geometria de forma visual e prática</span>
            <h2>Do básico ao nível de prova: polígonos, perímetro, área e muito mais.</h2>
            <p>
              Este curso foi pensado para transformar conceitos matemáticos em raciocínio rápido, com explicações passo a passo,
              aulas em vídeo, macetes de prova, questões de OBMEP, Enem e vestibulares e um certificado ao final.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => setActiveModuleIndex(0)}>Começar agora</button>
              <button onClick={() => document.getElementById('modulos').scrollIntoView({ behavior: 'smooth' })}>Ver curriculum</button>
            </div>
            <div className="stats-grid">
              <MetricCard label="Módulos" value={`${modules.length}`} />
              <MetricCard label="Questões" value={`${totalQuestions}`} />
              <MetricCard label="Progresso" value={`${courseProgress}%`} />
              <MetricCard label="Acertos" value={`${totalCorrect}`} />
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-card">
              <div className="mini-header">
                <span className="dot green" />
                <span>Resumo do curso</span>
              </div>
              <ul>
                <li>Conceitos fundamentais da geometria plana</li>
                <li>Polígonos: nomenclatura, diagonais e ângulos</li>
                <li>Perímetro e área em figuras planas</li>
                <li>Triângulos, quadriláteros e círculo</li>
                <li>Questões em nível de OBMEP e Enem</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="modulos" className="course-layout">
          <aside className="sidebar">
            <div className="sidebar-header">Módulos</div>
            {modules.map((module, index) => {
              const moduleResult = moduleStats[index];
              const isSelected = activeModuleIndex === index;
              return (
                <button
                  key={module.id}
                  className={`module-nav ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveModuleIndex(index)}
                >
                  <div>
                    <span className="module-number">0{index + 1}</span>
                    <strong>{module.title}</strong>
                  </div>
                  <span className={`badge ${moduleResult.completed ? 'done' : ''}`}>
                    {moduleResult.completed ? 'Concluído' : 'Em estudo'}
                  </span>
                </button>
              );
            })}
          </aside>

          <article className="content-panel">
            <div className="module-topline">
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
                <div className="formula-list">
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
                <span className={`status-pill ${activePassed ? 'success' : ''}`}>
                  {activePassed ? 'Módulo aprovado' : `${activeCorrectCount}/${activeModule.questions.length} acertos`}
                </span>
              </div>

              {activeModule.questions.map((question, questionIndex) => {
                const selectedOption = activeModuleAnswers[questionIndex];
                const isAnswered = selectedOption !== null && selectedOption !== undefined;
                const isCorrect = selectedOption === question.correct;

                return (
                  <div key={question.ask} className="question-card">
                    <p className="question-text">{question.ask}</p>
                    <div className="options-grid">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = selectedOption === optionIndex;
                        const showCorrect = isAnswered && question.correct === optionIndex;
                        const showWrong = isAnswered && isSelected && !isCorrect;

                        return (
                          <button
                            key={option}
                            className={`option-btn ${
                              showCorrect ? 'correct' : ''
                            } ${showWrong ? 'wrong' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleAnswer(activeModule.id, questionIndex, optionIndex)}
                            disabled={isAnswered}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className={`feedback ${isCorrect ? 'success' : 'error'}`}>
                        <strong>{isCorrect ? 'Acertou!' : 'Errou!'}</strong>
                        <p>{question.explanation}</p>
                        <span>Resposta correta: {question.options[question.correct]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="module-footer-actions">
              <button className="secondary" onClick={() => setActiveModuleIndex((prev) => Math.max(prev - 1, 0))}>Módulo anterior</button>
              <button className="primary" onClick={() => setActiveModuleIndex((prev) => Math.min(prev + 1, modules.length - 1))}>Próximo módulo</button>
            </div>
          </article>
        </section>

        <section id="certificado" className="certificate-section">
          <div className="certificate-box">
            <div className="certificate-header">
              <div>
                <p className="eyebrow">Conclusão da trilha</p>
                <h3>Certificado de geometria plana</h3>
              </div>
              <button className="primary" onClick={handleCertificate} disabled={!allModulesCompleted}>
                Gerar certificado
              </button>
            </div>

            <div className="student-input-box">
              <label htmlFor="studentName">Nome do estudante</label>
              <input
                id="studentName"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            {certificateVisible && allModulesCompleted && (
              <div className="certificate-card">
                <div className="certificate-bar" />
                <p className="certificate-label">Certificamos que</p>
                <h4>{studentName}</h4>
                <p>concluiu com sucesso todos os módulos de Geometria Plana, demonstrando domínio de conceitos, fórmulas e resolução de problemas de nível escolar e de vestibulares.</p>
                <div className="signature-line">
                  <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
                  <span>Plataforma Geometria Plana Master</span>
                </div>
              </div>
            )}

            {!allModulesCompleted && (
              <p className="certificate-hint">
                Complete todos os módulos com pelo menos 2 acertos em cada um para liberar o certificado.
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
