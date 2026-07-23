/**
 * Services page controller.
 * Loads the service catalog, handles filtering, renders cards,
 * manages the detail modal, and drives scroll-reveal animations.
 */
(function () {
  'use strict';

  // ─── Service definitions ─────────────────────────────────────────────────

  var SERVICES = [
      {
          id:         'software-engineering',
          num:        '01',
          icon:       '⚙️',
          title:      'Software Engineering',
          category:   'engineering',
          featured:   false,
          desc:       'Production-grade web, mobile, and API development. We build systems that survive high load, evolve cleanly, and stay secure.',
          tags:       ['React', 'Node.js', 'Python', 'Go', 'PostgreSQL'],
          anchor:     'section-engineering',
          detail: {
              catLabel:  '⚙️ Engineering',
              catStyle:  'background:rgba(30,60,114,0.15);color:#93c5fd;border:1px solid rgba(147,197,253,0.2);',
              overview:  'We build full-stack applications, APIs, and microservices that work under real-world conditions. Every system we deliver is secure by design, tested under load, and documented for the engineers who maintain it after us.',
              delivers: [
                  'Full-stack web and mobile application development',
                  'RESTful and GraphQL API design and implementation',
                  'Microservices architecture and domain-driven design',
                  'Legacy modernization and phased platform migration',
                  'Infrastructure as Code with Terraform and Pulumi',
                  'CI/CD pipeline setup and developer experience optimization',
                  'Performance profiling and scalability hardening'
              ],
              stack:     ['React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
              contact:   'Software Engineering'
          }
      },
      {
          id:         'data-engineering',
          num:        '02',
          icon:       '🔧',
          title:      'Data Engineering',
          category:   'engineering',
          featured:   true,
          desc:       'We design and build the pipelines, warehouses, and streaming infrastructure that make analytics reliable at scale.',
          tags:       ['Spark', 'Airflow', 'dbt', 'Snowflake', 'Kafka'],
          anchor:     'section-engineering',
          detail: {
              catLabel:  '⚙️ Engineering',
              catStyle:  'background:rgba(30,60,114,0.15);color:#93c5fd;border:1px solid rgba(147,197,253,0.2);',
              overview:  'Reliable analytics starts with reliable data. We build the ingestion, transformation, and storage layers that turn raw operational data into clean, queryable assets your analysts can trust.',
              delivers: [
                  'Cloud data warehouse design and implementation',
                  'Batch and streaming ETL/ELT pipeline development',
                  'Data quality frameworks and automated validation',
                  'Medallion architecture with bronze, silver, and gold layers',
                  'Real-time event streaming with Kafka and Kinesis',
                  'Metadata management and data lineage tracking',
                  'Cost optimization and warehouse performance tuning'
              ],
              stack:     ['Apache Spark', 'Apache Airflow', 'Prefect', 'dbt', 'Snowflake', 'BigQuery', 'Redshift', 'Kafka', 'AWS Glue', 'Azure Data Factory', 'Delta Lake'],
              contact:   'Data Engineering'
          }
      },
      {
          id:         'ai-ml',
          num:        '03',
          icon:       '🤖',
          title:      'AI & Machine Learning',
          category:   'engineering',
          featured:   true,
          desc:       'Predictive models, NLP pipelines, and LLM-assisted systems built for production — not just proof-of-concept.',
          tags:       ['PyTorch', 'scikit-learn', 'LangChain', 'OpenAI', 'MLflow'],
          anchor:     'section-engineering',
          detail: {
              catLabel:  '⚙️ Engineering',
              catStyle:  'background:rgba(30,60,114,0.15);color:#93c5fd;border:1px solid rgba(147,197,253,0.2);',
              overview:  'We move AI from demo to deployment. That means building the training infrastructure, evaluation frameworks, and serving pipelines that keep models accurate and observable in production.',
              delivers: [
                  'Predictive modeling for churn, demand, risk, and anomaly detection',
                  'Natural language processing and document classification',
                  'LLM-assisted workflows with retrieval-augmented generation',
                  'Computer vision for inspection, classification, and detection',
                  'MLOps infrastructure for model versioning and monitoring',
                  'Feature store design and training data management',
                  'Model explainability and bias auditing'
              ],
              stack:     ['Python', 'PyTorch', 'scikit-learn', 'HuggingFace', 'LangChain', 'OpenAI API', 'MLflow', 'SageMaker', 'Vertex AI', 'Azure ML', 'Ray'],
              contact:   'AI & ML'
          }
      },
      {
          id:         'cloud-devops',
          num:        '04',
          icon:       '☁️',
          title:      'Cloud & DevOps',
          category:   'automation',
          featured:   false,
          desc:       'Multi-cloud architecture, Infrastructure as Code, and automated delivery pipelines that cut deployment risk to near zero.',
          tags:       ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform'],
          anchor:     'section-automation',
          detail: {
              catLabel:  '⚡ Automation',
              catStyle:  'background:rgba(16,185,129,0.12);color:#6ee7b7;border:1px solid rgba(110,231,183,0.2);',
              overview:  'We design multi-cloud environments that are reproducible, observable, and secure. Automated deployments, environment parity, and cost controls are built in from the start — not retrofitted.',
              delivers: [
                  'Cloud architecture design on AWS, Azure, and GCP',
                  'Infrastructure as Code with Terraform and CDK',
                  'Container orchestration with Kubernetes and EKS/AKS/GKE',
                  'GitOps workflows with ArgoCD and Flux',
                  'Observability stacks with distributed tracing and alerting',
                  'Disaster recovery planning and multi-region failover',
                  'Cloud cost optimization and FinOps reporting'
              ],
              stack:     ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Helm', 'Terraform', 'Pulumi', 'ArgoCD', 'Datadog', 'Prometheus', 'Grafana', 'GitHub Actions', 'GitLab CI'],
              contact:   'Cloud & DevOps'
          }
      },
      {
          id:         'analytics-bi',
          num:        '05',
          icon:       '📊',
          title:      'Analytics & Business Intelligence',
          category:   'analytics',
          featured:   false,
          desc:       'Executive dashboards, self-service BI portals, and embedded analytics that give your teams answers without writing SQL.',
          tags:       ['Power BI', 'Tableau', 'Looker', 'dbt', 'Metabase'],
          anchor:     'section-analytics',
          detail: {
              catLabel:  '📊 Analytics',
              catStyle:  'background:rgba(255,193,7,0.12);color:#fbbf24;border:1px solid rgba(251,191,36,0.2);',
              overview:  'We build analytics environments where every stakeholder can get answers at the speed they need them. From live operational dashboards to quarterly board reports, we deliver visibility that sticks.',
              delivers: [
                  'Executive KPI dashboards and operational command centers',
                  'Self-service BI portals with row-level security',
                  'Embedded analytics within your product or portal',
                  'Semantic layer and metrics catalog development',
                  'Automated report distribution and scheduling',
                  'Ad hoc analysis enablement and data literacy training',
                  'Dashboard migration from legacy tools to modern platforms'
              ],
              stack:     ['Power BI', 'Tableau', 'Looker', 'Metabase', 'Apache Superset', 'dbt Semantic Layer', 'Sigma', 'Hex', 'Google Sheets API'],
              contact:   'Analytics & BI'
          }
      },
      {
          id:         'process-automation',
          num:        '06',
          icon:       '🔄',
          title:      'Process Automation',
          category:   'automation',
          featured:   false,
          desc:       'RPA, intelligent document processing, and enterprise workflow integration that eliminates manual overhead from your critical paths.',
          tags:       ['UiPath', 'Power Automate', 'n8n', 'AWS Lambda', 'OCR'],
          anchor:     'section-automation',
          detail: {
              catLabel:  '⚡ Automation',
              catStyle:  'background:rgba(16,185,129,0.12);color:#6ee7b7;border:1px solid rgba(110,231,183,0.2);',
              overview:  'We identify the high-volume, repetitive work your team does manually and replace it with reliable automated systems. The result is fewer errors, faster cycle times, and staff freed up for higher-value work.',
              delivers: [
                  'Robotic process automation for document-heavy workflows',
                  'Intelligent document processing with OCR and NLP extraction',
                  'API integration between disconnected enterprise systems',
                  'Event-driven workflow orchestration and error handling',
                  'Automated compliance reporting and audit trail generation',
                  'Custom notification and escalation routing systems',
                  'Process mining and automation opportunity assessments'
              ],
              stack:     ['UiPath', 'Power Automate', 'n8n', 'Zapier', 'Prefect', 'Celery', 'AWS Lambda', 'Azure Logic Apps', 'Textract', 'Tesseract'],
              contact:   'Process Automation'
          }
      },
      {
          id:         'cybersecurity',
          num:        '07',
          icon:       '🔒',
          title:      'Cybersecurity',
          category:   'engineering',
          featured:   false,
          desc:       'Security posture assessments, threat modeling, and compliance readiness for FISMA, FedRAMP, HIPAA, and SOC 2 environments.',
          tags:       ['NIST CSF', 'FedRAMP', 'SAST', 'DAST', 'SIEM'],
          anchor:     'section-engineering',
          detail: {
              catLabel:  '⚙️ Engineering',
              catStyle:  'background:rgba(30,60,114,0.15);color:#93c5fd;border:1px solid rgba(147,197,253,0.2);',
              overview:  'Security is not a checkbox. We embed controls into your development lifecycle, assess your current posture honestly, and build the remediation roadmap your team can actually execute.',
              delivers: [
                  'Security posture assessment and gap analysis',
                  'Threat modeling and attack surface mapping',
                  'FISMA, FedRAMP, HIPAA, and SOC 2 compliance readiness',
                  'SAST and DAST integration into existing CI/CD pipelines',
                  'SIEM deployment and security alert tuning',
                  'Penetration testing coordination and remediation planning',
                  'Secrets management and zero-trust architecture design'
              ],
              stack:     ['NIST CSF', 'FedRAMP', 'AWS Security Hub', 'Azure Defender', 'Snyk', 'SonarQube', 'OWASP ZAP', 'HashiCorp Vault', 'CrowdStrike', 'Splunk'],
              contact:   'Cybersecurity'
          }
      },
      {
          id:         'strategic-consulting',
          num:        '08',
          icon:       '🧭',
          title:      'Strategic Consulting',
          category:   'consulting',
          featured:   false,
          desc:       'Data strategy, platform roadmaps, vendor selection, and interim technical leadership from practitioners who have shipped the work.',
          tags:       ['Data Strategy', 'Governance', 'Roadmapping', 'DAMA', 'TOGAF'],
          anchor:     'section-consulting',
          detail: {
              catLabel:  '🧭 Consulting',
              catStyle:  'background:rgba(139,92,246,0.12);color:#c4b5fd;border:1px solid rgba(196,181,253,0.2);',
              overview:  'We advise organizations on the decisions that determine whether their data and engineering investments compound or collapse. Every recommendation comes from engineers who have built, scaled, and secured the systems they\'re advising on.',
              delivers: [
                  'Data strategy and three-year platform roadmap development',
                  'Technology vendor evaluation and RFP scoring frameworks',
                  'Data governance framework design and implementation',
                  'Cloud migration planning and total cost of ownership analysis',
                  'Security posture and compliance gap advisory',
                  'Interim CTO and CDO advisory for growth-stage organizations',
                  'Team capability assessment and hiring plan development'
              ],
              stack:     ['DAMA-DMBOK', 'TOGAF', 'NIST CSF', 'FedRAMP', 'CMMI', 'ISO 27001', 'SAFe Agile', 'OKR Frameworks'],
              contact:   'Strategic Consulting'
          }
      }
  ];

  // ─── Category config ──────────────────────────────────────────────────────

  var CATEGORIES = {
      all:         { label: 'All Services',       desc: '' },
      engineering: { label: 'Engineering',         desc: 'Platform and application delivery — from APIs to cloud infrastructure.' },
      analytics:   { label: 'Analytics',           desc: 'Data pipelines, dashboards, and predictive models that inform decisions.' },
      automation:  { label: 'Automation',          desc: 'Workflow automation and cloud delivery pipelines that remove manual overhead.' },
      consulting:  { label: 'Consulting',          desc: 'Strategy and advisory from engineers who have delivered at scale.' }
  };

  // ─── State ────────────────────────────────────────────────────────────────

  var activeCategory = 'all';

  // ─── DOM refs ─────────────────────────────────────────────────────────────

  var grid      = document.getElementById('services-grid');
  var filterBar = document.getElementById('filter-bar');
  var catHead   = document.getElementById('category-heading');
  var overlay   = document.getElementById('drawer-overlay');
  var drawer    = document.getElementById('svc-drawer');
  var drawerContent = document.getElementById('drawer-content');
  var drawerClose   = document.getElementById('drawer-close');

  // ─── Render grid ─────────────────────────────────────────────────────────

  function renderGrid(category) {
      if (!grid) return;
      grid.innerHTML = '';

      var visible = category === 'all'
          ? SERVICES
          : SERVICES.filter(function (s) { return s.category === category; });

      if (visible.length === 0) {
          grid.innerHTML = '<div class="state-box"><div class="state-icon">🔍</div><p>No services found in this category.</p></div>';
          return;
      }

      visible.forEach(function (svc, idx) {
          var card = document.createElement('div');
          card.className = 'svc-card' + (svc.featured ? ' featured' : '');
          card.setAttribute('role', 'listitem');
          card.setAttribute('tabindex', '0');
          card.setAttribute('data-id', svc.id);
          card.setAttribute('aria-label', 'View details for ' + svc.title);

          var tagsHtml = svc.tags.map(function (t) { return '<span class="tech-tag">' + t + '</span>'; }).join(' ');
          var badge    = svc.featured ? '<div class="svc-badge">Popular</div>' : '';

          card.innerHTML = badge
              + '<div class="svc-num">' + svc.num + '</div>'
              + '<div class="svc-icon-wrap"><span style="font-size:1.25rem;">' + svc.icon + '</span></div>'
              + '<h3 class="svc-title">' + svc.title + '</h3>'
              + '<p class="svc-desc">' + svc.desc + '</p>'
              + '<div style="margin-bottom:4px;">' + tagsHtml + '</div>'
              + '<div class="svc-link">View details <i class="fas fa-arrow-right"></i></div>';

          card.addEventListener('click', function () { openDrawer(svc.id); });
          card.addEventListener('keydown', function (e) {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(svc.id); }
          });

          grid.appendChild(card);

          // staggered reveal
          setTimeout(function () { card.classList.add('visible'); }, idx * 60);
      });

      updateCategoryHeading(category, visible.length);
  }

  // ─── Category heading ────────────────────────────────────────────────────

  function updateCategoryHeading(category, count) {
      if (!catHead) return;
      if (category === 'all') {
          catHead.innerHTML = '';
          return;
      }
      var cfg = CATEGORIES[category] || {};
      catHead.innerHTML = '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">'
          + '<div>'
          + '<h2 style="font-size:1.3rem;font-weight:800;color:#fff;letter-spacing:-0.02em;margin:0 0 6px;">' + (cfg.label || category) + '</h2>'
          + (cfg.desc ? '<p style="font-size:0.875rem;color:var(--text-muted-dark);margin:0;">' + cfg.desc + '</p>' : '')
          + '</div>'
          + '<a href="#section-' + category + '" style="font-size:0.8rem;font-weight:600;color:var(--gold);text-decoration:none;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;margin-top:4px;">Full overview <i class="fas fa-arrow-down" style="font-size:0.65rem;"></i></a>'
          + '</div>';
  }

  // ─── Filter buttons ──────────────────────────────────────────────────────

  function initFilters() {
      if (!filterBar) return;

      filterBar.querySelectorAll('.filter-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
              var cat = btn.getAttribute('data-category');
              if (cat === activeCategory) return;

              activeCategory = cat;

              filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
                  b.classList.remove('active');
                  b.setAttribute('aria-selected', 'false');
              });
              btn.classList.add('active');
              btn.setAttribute('aria-selected', 'true');

              renderGrid(cat);

              if (cat !== 'all') {
                  var target = document.getElementById('section-' + cat);
                  if (target) {
                      setTimeout(function () {
                          var offset = 72;
                          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                          window.scrollTo({ top: top, behavior: 'smooth' });
                      }, 280);
                  }
              }
          });
      });
  }

  // ─── Drawer ───────────────────────────────────────────────────────────────

  function openDrawer(id) {
      var svc = null;
      for (var i = 0; i < SERVICES.length; i++) {
          if (SERVICES[i].id === id) { svc = SERVICES[i]; break; }
      }
      if (!svc || !drawerContent) return;

      var d = svc.detail;
      var stackHtml = (d.stack || []).map(function (t) {
          return '<span class="drawer-stack-tag">' + t + '</span>';
      }).join('');
      var listHtml  = (d.delivers || []).map(function (item) {
          return '<li>' + item + '</li>';
      }).join('');
      var contactUrl = 'contact.html?subject=' + encodeURIComponent(d.contact + ' inquiry');
      var anchorUrl  = '#section-' + svc.anchor.replace('section-', '');

      drawerContent.innerHTML =
          '<div class="drawer-cat" style="' + d.catStyle + '">' + d.catLabel + '</div>'
          + '<div class="drawer-icon">' + svc.icon + '</div>'
          + '<div class="drawer-title">' + svc.title + '</div>'
          + '<p class="drawer-desc">' + d.overview + '</p>'

          + '<div class="drawer-section-label">What we deliver</div>'
          + '<ul class="drawer-list">' + listHtml + '</ul>'

          + '<div class="drawer-section-label">Tech stack</div>'
          + '<div class="drawer-stack">' + stackHtml + '</div>'

          + '<div class="drawer-cta">'
          + '<a href="' + contactUrl + '" class="drawer-btn-primary">Start a Conversation</a>'
          + '<a href="' + anchorUrl + '" class="drawer-btn-secondary" id="drawer-anchor-link">Full Overview</a>'
          + '</div>';

      var anchorLink = drawerContent.querySelector('#drawer-anchor-link');
      if (anchorLink) {
          anchorLink.addEventListener('click', function (e) {
              e.preventDefault();
              closeDrawer();
              var target = document.getElementById('section-' + svc.anchor.replace('section-', ''));
              if (target) {
                  setTimeout(function () {
                      var top = target.getBoundingClientRect().top + window.pageYOffset - 72;
                      window.scrollTo({ top: top, behavior: 'smooth' });
                  }, 320);
              }
          });
      }

      overlay.classList.add('open');
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
      drawer.focus();
  }

  function closeDrawer() {
      overlay.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
  }

  function initDrawer() {
      if (!overlay || !drawerClose) return;
      overlay.addEventListener('click', closeDrawer);
      drawerClose.addEventListener('click', closeDrawer);
      document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
      });
  }

  // ─── Counters ────────────────────────────────────────────────────────────

  function animateCounter(el) {
      var target   = parseInt(el.getAttribute('data-count'), 10);
      var suffix   = target >= 100 ? '+' : '';
      var duration = 1200;
      var start    = null;

      function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased    = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
  }

  function initCounters() {
      if (!('IntersectionObserver' in window)) {
          document.querySelectorAll('[data-count]').forEach(function (el) {
              el.textContent = el.getAttribute('data-count') + '+';
          });
          return;
      }
      var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
              if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
          });
      }, { threshold: 0.5 });
      document.querySelectorAll('[data-count]').forEach(function (el) { obs.observe(el); });
  }

  // ─── Scroll reveal ────────────────────────────────────────────────────────

  function initReveal() {
      if (!('IntersectionObserver' in window)) {
          document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
          return;
      }
      var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
              if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
          });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  }

  // ─── Nav toggle ──────────────────────────────────────────────────────────

  function initNav() {
      var toggle = document.getElementById('nav-toggle');
      var links  = document.getElementById('nav-links');
      if (!toggle || !links) return;
      toggle.addEventListener('click', function () { links.classList.toggle('open'); });
  }

  // ─── Hash routing ────────────────────────────────────────────────────────

  function handleHash() {
      var hash = window.location.hash;
      if (!hash) return;

      var catMap = {
          '#engineering': 'engineering',
          '#analytics':   'analytics',
          '#automation':  'automation',
          '#consulting':  'consulting'
      };

      if (catMap[hash]) {
          var cat = catMap[hash];
          activeCategory = cat;
          renderGrid(cat);

          var btn = filterBar && filterBar.querySelector('[data-category="' + cat + '"]');
          if
