/* ============================================================
   Bastos & Costa Advocacia – interações
   ============================================================ */
(function () {
  "use strict";

  /* ---------- CONFIGURAÇÃO DO FORMULÁRIO ----------
     Opção A (recomendada): EmailJS – crie conta em emailjs.com, crie um serviço e um template
     e preencha as 3 chaves abaixo. O template pode usar: {{nome}}, {{email}}, {{telefone}}, {{assunto}}, {{mensagem}}.
     Opção B: deixe vazio. O formulário abre o WhatsApp do escritório com a mensagem pronta. */
  const EMAILJS = {
    publicKey: "0UpraUhT7mPKUtAG8",
    serviceId: "service_zubg9yo",
    templateId: "template_8zrf249",
  };

  const WHATSAPP = "5527999341196"; // AJUSTAR: DDI + DDD + número

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Header ---------- */
  const header = $("#header");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
    const btt = $("#backToTop");
    const show = window.scrollY > 600;
    btt.classList.toggle("visible", show);
    btt.setAttribute("aria-hidden", String(!show));
    btt.tabIndex = show ? 0 : -1;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $("#hamburgerBtn");
  const mobile = $("#mobileMenu");
  const setMenu = (open) => {
    mobile.classList.toggle("open", open);
    mobile.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  burger.addEventListener("click", () =>
    setMenu(!mobile.classList.contains("open")),
  );
  $$(".nav-mobile__link").forEach((a) =>
    a.addEventListener("click", () => setMenu(false)),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Voltar ao topo ---------- */
  $("#backToTop").addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );

  /* ---------- Entrada suave dos blocos ---------- */
  const targets = $$(".area-card, .diff-item, .attr-card, .socio");
  targets.forEach((el) => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((el, i) => {
      el.style.transitionDelay = (i % 2) * 90 + "ms";
      io.observe(el);
    });
  } else {
    targets.forEach((el) => el.classList.add("is-visible"));
  }

  $("#currentYear").textContent = new Date().getFullYear();

  /* ---------- Formulário ---------- */
  const form = $("#contactForm");
  const feedback = $("#formFeedback");
  const submitBtn = $("#submitBtn");

  const rules = {
    nome: (el) =>
      el.value.trim().split(/\s+/).length >= 2
        ? ""
        : "Informe seu nome completo.",
    email: (el) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim())
        ? ""
        : "Informe um e-mail válido.",
    assunto: (el) => (el.value ? "" : "Selecione uma área de interesse."),
    mensagem: (el) =>
      el.value.trim().length >= 15
        ? ""
        : "Descreva sua demanda (mínimo de 15 caracteres).",
    lgpd: (el) =>
      el.checked ? "" : "É necessário concordar para enviar a mensagem.",
  };

  function validate(el) {
    const rule = rules[el.name];
    if (!rule) return true;
    const msg = rule(el);
    el.closest(".form__group").classList.toggle("invalid", Boolean(msg));
    $("#" + el.id + "-error").textContent = msg;
    return !msg;
  }

  $$("input, select, textarea", form).forEach((el) => {
    el.addEventListener("blur", () => validate(el));
    el.addEventListener("input", () => {
      if (el.closest(".form__group").classList.contains("invalid"))
        validate(el);
    });
  });

  // Máscara de telefone: (27) 90000-0000
  const tel = $("#telefone");
  tel.addEventListener("input", () => {
    const d = tel.value.replace(/\D/g, "").slice(0, 11);
    tel.value =
      d.length > 6
        ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`
        : d.length > 2
          ? `(${d.slice(0, 2)}) ${d.slice(2)}`
          : d;
  });

  const say = (msg, type) => {
    feedback.textContent = msg;
    feedback.className = "form__feedback " + type;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    say("", "");
    const fields = $$("input, select, textarea", form);
    const results = fields.map(validate);
    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const useEmailJS =
      EMAILJS.publicKey &&
      EMAILJS.serviceId &&
      EMAILJS.templateId &&
      window.emailjs;

    if (useEmailJS) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
      try {
        await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, data, {
          publicKey: EMAILJS.publicKey,
        });
        say("Mensagem enviada. Retornaremos em breve.", "ok");
        form.reset();
      } catch (err) {
        say(
          "Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.",
          "err",
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar Mensagem";
      }
      return;
    }

    // // Alternativa sem servidor: abre o WhatsApp com a mensagem pronta
    // const text = `Olá! Meu nome é ${data.nome}.\nÁrea: ${data.assunto}\nTelefone: ${data.telefone || "-"}\nE-mail: ${data.email}\n\n${data.mensagem}`;
    // window.open(
    //   `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,
    //   "_blank",
    //   "noopener",
    // );
    // say("Abrimos o WhatsApp com a sua mensagem. É só enviar por lá.", "ok");
    // form.reset();
  });
})();
