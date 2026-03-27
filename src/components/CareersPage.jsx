import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const JOB_TYPE_LABELS = {
  'full-time': 'Tempo Inteiro',
  'part-time': 'Tempo Parcial',
  'contract': 'Contrato',
  'internship': 'Estágio'
};

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    fetchJobs();

    // SEO meta tags
    document.title = 'Carreiras - TRATA Imobiliária | Junte-se à Nossa Equipa';
    const setMeta = (name, content, prop) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Explore oportunidades de carreira na TRATA Imobiliária. Procuramos profissionais talentosos para a nossa equipa em Braga.');
    setMeta('og:title', 'Carreiras - TRATA Imobiliária', true);
    setMeta('og:description', 'Junte-se à equipa TRATA. Veja as nossas vagas disponíveis em Braga.', true);
    setMeta('og:url', 'https://www.trataimobiliaria.pt/carreiras', true);

    return () => {
      document.title = 'TRATA Imobiliária - Compra, Venda e Valorização de Imóveis';
      setMeta('description', 'TRATA Imobiliária - A sua imobiliária de confiança. Compra, venda e valorização de imóveis em Braga e arredores.');
      setMeta('og:title', 'TRATA Imobiliária - Compra, Venda e Valorização de Imóveis', true);
      setMeta('og:description', 'Encontre o imóvel ideal. Compra, venda e valorização de imóveis em Braga e arredores.', true);
      setMeta('og:url', 'https://www.trataimobiliaria.pt/', true);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const openJobDetail = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(false);
  };

  const closeJobDetail = () => {
    setSelectedJob(null);
    setShowApplicationForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full filter blur-[120px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6">
            <i className="fa-solid fa-briefcase"></i>
            Oportunidades
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Junte-se à Nossa<br />
            <span className="text-emerald-200">Equipa</span>
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Procuramos pessoas talentosas e motivadas para crescer connosco 
            no mercado imobiliário. Descubra as nossas vagas disponíveis.
          </p>
          <div className="flex justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{jobs.length}</div>
              <div className="text-emerald-200 text-sm mt-1">Vagas Abertas</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Braga</div>
              <div className="text-emerald-200 text-sm mt-1">Localização</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Porquê a <span className="text-emerald-600">TRATA</span>?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Oferecemos um ambiente dinâmico com oportunidades reais de crescimento.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-chart-line', title: 'Crescimento', desc: 'Formação contínua e plano de carreira claro' },
              { icon: 'fa-users', title: 'Equipa', desc: 'Ambiente colaborativo e espírito de entreajuda' },
              { icon: 'fa-coins', title: 'Remuneração', desc: 'Pacote competitivo com comissões atrativas' },
              { icon: 'fa-clock', title: 'Flexibilidade', desc: 'Equilíbrio entre vida pessoal e profissional' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <i className={`fa-solid ${item.icon} text-emerald-600 text-lg`}></i>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16 lg:py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Vagas <span className="text-emerald-600">Disponíveis</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Explore as posições abertas e encontre a oportunidade ideal para si.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-briefcase text-emerald-500 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sem vagas disponíveis</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                De momento não temos vagas abertas, mas pode enviar-nos a sua candidatura espontânea.
              </p>
              <a
                href="/contactos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <i className="fa-solid fa-envelope"></i>
                Contacte-nos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-briefcase text-emerald-600 text-lg"></i>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                        {JOB_TYPE_LABELS[job.type] || job.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                      <i className="fa-solid fa-location-dot text-emerald-500"></i>
                      {job.location}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                      {job.description?.substring(0, 180)}
                      {job.description?.length > 180 ? '...' : ''}
                    </p>
                    <button
                      onClick={() => openJobDetail(job)}
                      className="w-full py-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                    >
                      Ver Detalhes
                      <i className="fa-solid fa-arrow-right text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">
              Não encontrou a vaga ideal?
            </h2>
            <p className="text-emerald-100 mb-8 max-w-lg mx-auto relative z-10">
              Envie-nos a sua candidatura espontânea. Estamos sempre à procura de talentos excepcionais.
            </p>
            <a
              href="/contactos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors relative z-10"
            >
              <i className="fa-solid fa-paper-plane"></i>
              Candidatura Espontânea
            </a>
          </div>
        </div>
      </section>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          showForm={showApplicationForm}
          onToggleForm={() => setShowApplicationForm(!showApplicationForm)}
          onClose={closeJobDetail}
        />
      )}
    </div>
  );
};

/* ─── Job Detail Modal ──────────────────────────────────────────────── */
const JobDetailModal = ({ job, showForm, onToggleForm, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 md:pt-20 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <i className="fa-solid fa-briefcase text-emerald-600"></i>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{job.title}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-location-dot text-emerald-500 text-xs"></i>
                  {job.location}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                  {JOB_TYPE_LABELS[job.type] || job.type}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-slate-600"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-file-lines text-emerald-500"></i>
              Descrição
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-emerald-500"></i>
                Requisitos
              </h3>
              <div className="text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-gift text-emerald-500"></i>
                Benefícios
              </h3>
              <div className="text-slate-600 leading-relaxed whitespace-pre-line">{job.benefits}</div>
            </div>
          )}

          {/* Apply Button / Form */}
          {!showForm ? (
            <button
              onClick={onToggleForm}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-paper-plane"></i>
              Candidatar-me
            </button>
          ) : (
            <ApplicationForm jobId={job.id} jobTitle={job.title} onCancel={onToggleForm} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Application Form ──────────────────────────────────────────────── */
const ApplicationForm = ({ jobId, jobTitle, onCancel }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Nome é obrigatório';
    if (!form.email.trim()) errs.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (form.phone && !/^[+\d\s()-]{7,20}$/.test(form.phone)) errs.phone = 'Telefone inválido';
    if (!cvFile) errs.cv = 'CV é obrigatório (PDF)';
    else if (cvFile.type !== 'application/pdf') errs.cv = 'Apenas ficheiros PDF';
    else if (cvFile.size > 5 * 1024 * 1024) errs.cv = 'Ficheiro máximo: 5MB';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // spam bot
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Upload CV to Supabase Storage
      const fileName = `${Date.now()}_${cvFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(fileName, cvFile, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      const cvUrl = `cv-uploads/${fileName}`;

      // Insert application
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          message: form.message.trim() || null,
          cv_url: cvUrl
        });

      if (insertError) throw insertError;

      // Send notification email
      try {
        await fetch('/api/career-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            jobTitle,
            jobId
          })
        });
      } catch {
        // Email notification is non-critical
      }

      setSuccess(true);
    } catch (err) {
      console.error('Application error:', err);
      setErrors({ submit: 'Erro ao enviar candidatura. Tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-check text-emerald-600 text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Candidatura Enviada!</h3>
        <p className="text-slate-600">
          Obrigado pelo seu interesse. Entraremos em contacto em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-user-pen text-emerald-500"></i>
          Formulário de Candidatura
        </h3>
        <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
          Cancelar
        </button>
      </div>

      {/* Honeypot - hidden from real users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px]"
        tabIndex="-1"
        autoComplete="off"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
          placeholder="O seu nome"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            placeholder="email@exemplo.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            placeholder="+351 912 345 678"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem / Carta de Motivação</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
          placeholder="Fale-nos sobre si e a sua motivação..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">CV (PDF) *</label>
        <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${errors.cv ? 'border-red-300 bg-red-50' : cvFile ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              setCvFile(e.target.files[0] || null);
              setErrors({ ...errors, cv: undefined });
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {cvFile ? (
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <i className="fa-solid fa-file-pdf text-lg"></i>
              <span className="font-medium text-sm">{cvFile.name}</span>
              <span className="text-xs text-emerald-500">({(cvFile.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          ) : (
            <div className="text-slate-500">
              <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2 block text-emerald-400"></i>
              <span className="text-sm">Clique ou arraste o ficheiro PDF (máx. 5MB)</span>
            </div>
          )}
        </div>
        {errors.cv && <p className="text-red-500 text-xs mt-1">{errors.cv}</p>}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            A enviar...
          </>
        ) : (
          <>
            <i className="fa-solid fa-paper-plane"></i>
            Enviar Candidatura
          </>
        )}
      </button>
    </form>
  );
};

export default CareersPage;
