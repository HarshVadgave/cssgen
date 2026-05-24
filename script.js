 /* ============================================================
       STATE
    ============================================================ */
    let currentTab = 'glass'; // 'glass' | 'neu'

    /* Default values – glass */
    const glassDefaults = {
      bgColor: '#1a1a2e',
      cardColor: '#ffffff',
      opacity: 18,
      blur: 16,
      radius: 20,
      border: 30,
      shadow: 20,
      width: 280,
      height: 0 // 0 = auto
    };

    /* Default values – neumorphism */
    const neuDefaults = {
      bgColor: '#e0e5ec',
      elColor: '#e0e5ec',
      radius: 20,
      dist: 8,
      blur: 16,
      intensity: 25,
      inset: false,
      width: 280,
      height: 0
    };

    /* ============================================================
       HELPERS
    ============================================================ */

    /** Convert hex to RGB array */
    function hexToRGB(hex) {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return [r, g, b];
    }

    /** Lighten or darken a hex color by amount (-1 to 1) */
    function adjustColor(hex, amount) {
      const [r,g,b] = hexToRGB(hex);
      const clamp = (v) => Math.max(0, Math.min(255, v));
      const nr = clamp(r + amount);
      const ng = clamp(g + amount);
      const nb = clamp(b + amount);
      return '#' + [nr,ng,nb].map(v => v.toString(16).padStart(2,'0')).join('');
    }

    /** Get numeric value of a range input */
    const getVal = id => parseInt(document.getElementById(id).value, 10);

    /** Get text/color value of an input */
    const getTxt = id => document.getElementById(id).value;

    /* ============================================================
       TAB SWITCHING
    ============================================================ */
    function switchTab(tab) {
      currentTab = tab;
      document.getElementById('panel-glass').style.display = tab === 'glass' ? '' : 'none';
      document.getElementById('panel-neu').style.display  = tab === 'neu'   ? '' : 'none';
      document.getElementById('tab-glass').classList.toggle('active', tab === 'glass');
      document.getElementById('tab-neu').classList.toggle('active', tab === 'neu');
      document.getElementById('tab-glass').setAttribute('aria-selected', tab === 'glass');
      document.getElementById('tab-neu').setAttribute('aria-selected', tab === 'neu');
      updateAll();
    }

    /* ============================================================
       GLASS LOGIC
    ============================================================ */
    function getGlassValues() {
      return {
        bgColor:   getTxt('g-bg-color'),
        cardColor: getTxt('g-card-color'),
        opacity:   getVal('g-opacity'),
        blur:      getVal('g-blur'),
        radius:    getVal('g-radius'),
        border:    getVal('g-border'),
        shadow:    getVal('g-shadow'),
        width:     getVal('g-width'),
        height:    getVal('g-height')
      };
    }

    function applyGlass(v) {
      const card = document.getElementById('live-card');
      const [cr, cg, cb] = hexToRGB(v.cardColor);
      const alpha = (v.opacity / 100).toFixed(2);
      const borderAlpha = (v.border / 100).toFixed(2);
      const shadowAlpha = (v.shadow / 100).toFixed(2);
      const heightStyle = v.height > 0 ? `${v.height}px` : 'auto';

      card.style.cssText = `
        width: ${v.width}px;
        height: ${heightStyle};
        padding: 1.75rem;
        background: rgba(${cr},${cg},${cb},${alpha});
        backdrop-filter: blur(${v.blur}px);
        -webkit-backdrop-filter: blur(${v.blur}px);
        border-radius: ${v.radius}px;
        border: 1px solid rgba(${cr},${cg},${cb},${borderAlpha});
        box-shadow: 0 8px 32px rgba(0,0,0,${shadowAlpha});
        color: #fff;
        transition: all 0.2s ease;
        overflow: hidden;
      `;

      // Update preview bg
      document.getElementById('preview-bg').style.background = v.bgColor;
    }

    function buildGlassCSS(v) {
      const [cr, cg, cb] = hexToRGB(v.cardColor);
      const alpha = (v.opacity / 100).toFixed(2);
      const borderAlpha = (v.border / 100).toFixed(2);
      const shadowAlpha = (v.shadow / 100).toFixed(2);
      const heightStyle = v.height > 0 ? `${v.height}px` : 'auto';
      return `.glass-card {
  /* Glassmorphism */
  width: ${v.width}px;
  height: ${heightStyle};
  padding: 1.75rem;
  background: rgba(${cr}, ${cg}, ${cb}, ${alpha});
  backdrop-filter: blur(${v.blur}px);
  -webkit-backdrop-filter: blur(${v.blur}px);
  border-radius: ${v.radius}px;
  border: 1px solid rgba(${cr}, ${cg}, ${cb}, ${borderAlpha});
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${shadowAlpha});
  color: #ffffff;
  overflow: hidden;
}

/* Background */
.glass-bg {
  background: ${v.bgColor};
}`;
    }

    /* ============================================================
       NEU LOGIC
    ============================================================ */
    function getNeuValues() {
      return {
        bgColor:   getTxt('n-bg-color'),
        elColor:   getTxt('n-el-color'),
        radius:    getVal('n-radius'),
        dist:      getVal('n-dist'),
        blur:      getVal('n-blur'),
        intensity: getVal('n-intensity'),
        inset:     document.getElementById('n-inset').checked,
        width:     getVal('n-width'),
        height:    getVal('n-height')
      };
    }

    function applyNeu(v) {
      const card = document.getElementById('live-card');
      const [r, g, b] = hexToRGB(v.elColor);
      const factor = v.intensity / 100;
      const lightR = Math.min(255, r + Math.round(factor * 80));
      const lightG = Math.min(255, g + Math.round(factor * 80));
      const lightB = Math.min(255, b + Math.round(factor * 80));
      const darkR  = Math.max(0,   r - Math.round(factor * 80));
      const darkG  = Math.max(0,   g - Math.round(factor * 80));
      const darkB  = Math.max(0,   b - Math.round(factor * 80));
      const insetKw = v.inset ? 'inset ' : '';
      const heightStyle = v.height > 0 ? `${v.height}px` : 'auto';
      const shadowStr = `${insetKw}${v.dist}px ${v.dist}px ${v.blur}px rgb(${darkR},${darkG},${darkB}), ${insetKw}-${v.dist}px -${v.dist}px ${v.blur}px rgb(${lightR},${lightG},${lightB})`;

      // Choose readable text color based on bg brightness
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const textColor = brightness < 128 ? '#ffffff' : '#333344';

      card.style.cssText = `
        width: ${v.width}px;
        height: ${heightStyle};
        padding: 1.75rem;
        background: ${v.elColor};
        border-radius: ${v.radius}px;
        box-shadow: ${shadowStr};
        color: ${textColor};
        transition: all 0.2s ease;
        overflow: hidden;
      `;

      document.getElementById('preview-bg').style.background = v.bgColor;
    }

    function buildNeuCSS(v) {
      const [r, g, b] = hexToRGB(v.elColor);
      const factor = v.intensity / 100;
      const lightR = Math.min(255, r + Math.round(factor * 80));
      const lightG = Math.min(255, g + Math.round(factor * 80));
      const lightB = Math.min(255, b + Math.round(factor * 80));
      const darkR  = Math.max(0,   r - Math.round(factor * 80));
      const darkG  = Math.max(0,   g - Math.round(factor * 80));
      const darkB  = Math.max(0,   b - Math.round(factor * 80));
      const insetKw = v.inset ? 'inset ' : '';
      const heightStyle = v.height > 0 ? `${v.height}px` : 'auto';
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const textColor = brightness < 128 ? '#ffffff' : '#333344';

      return `.neu-card {
  /* Neumorphism / Soft UI */
  width: ${v.width}px;
  height: ${heightStyle};
  padding: 1.75rem;
  background: ${v.elColor};
  border-radius: ${v.radius}px;
  box-shadow:
    ${insetKw}${v.dist}px ${v.dist}px ${v.blur}px rgb(${darkR}, ${darkG}, ${darkB}),
    ${insetKw}-${v.dist}px -${v.dist}px ${v.blur}px rgb(${lightR}, ${lightG}, ${lightB});
  color: ${textColor};
  overflow: hidden;
}

/* Background */
.neu-bg {
  background: ${v.bgColor};
}`;
    }

    /* ============================================================
       UPDATE ALL (preview + code)
    ============================================================ */
    function updateAll() {
      if (currentTab === 'glass') {
        const v = getGlassValues();
        applyGlass(v);
        renderCode(buildGlassCSS(v));
        // Update display labels
        document.getElementById('g-opacity-val').textContent = v.opacity + '%';
        document.getElementById('g-blur-val').textContent    = v.blur + 'px';
        document.getElementById('g-radius-val').textContent  = v.radius + 'px';
        document.getElementById('g-border-val').textContent  = v.border + '%';
        document.getElementById('g-shadow-val').textContent  = v.shadow + '%';
        document.getElementById('g-width-val').textContent   = v.width + 'px';
        document.getElementById('g-height-val').textContent  = v.height > 0 ? v.height + 'px' : 'Auto';
      } else {
        const v = getNeuValues();
        applyNeu(v);
        renderCode(buildNeuCSS(v));
        document.getElementById('n-radius-val').textContent    = v.radius + 'px';
        document.getElementById('n-dist-val').textContent      = v.dist + 'px';
        document.getElementById('n-blur-val').textContent      = v.blur + 'px';
        document.getElementById('n-intensity-val').textContent = v.intensity + '%';
        document.getElementById('n-width-val').textContent     = v.width + 'px';
        document.getElementById('n-height-val').textContent    = v.height > 0 ? v.height + 'px' : 'Auto';
      }
    }

    /* ============================================================
       RENDER CODE WITH PSEUDO SYNTAX HIGHLIGHTING
    ============================================================ */
    function renderCode(css) {
      // Light syntax coloring via escaping and wrapping
      const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      let out = esc(css);
      // color properties
      out = out.replace(/^([ \t]*)([a-z-]+)(:)/gm, '$1<span class="prop">$2</span>$3');
      // color selectors
      out = out.replace(/^(\.[a-z-]+) \{/gm, '<span class="sel">$1</span> {');
      // color comment
      out = out.replace(/(\/\*.*?\*\/)/gs, '<span class="comment">$1</span>');
      document.getElementById('css-output').innerHTML = out;
    }

    /* ============================================================
       COPY CSS
    ============================================================ */
    function copyCSSCode() {
      const css = currentTab === 'glass' ? buildGlassCSS(getGlassValues()) : buildNeuCSS(getNeuValues());
      navigator.clipboard.writeText(css).then(() => {
        const btn = document.getElementById('copy-css-btn');
        const icon = document.getElementById('copy-icon');
        const text = document.getElementById('copy-text');
        btn.classList.add('copied');
        icon.textContent = '✓';
        text.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          icon.textContent = '⎘';
          text.textContent = 'Copy CSS';
        }, 2200);
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = css;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    }

    /* ============================================================
       RANDOMIZE
    ============================================================ */
    function randomize() {
      const rHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
      const rInt = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

      if (currentTab === 'glass') {
        setColorInput('g-bg-color', rHex());
        setColorInput('g-card-color', rHex());
        document.getElementById('g-opacity').value  = rInt(10,40);
        document.getElementById('g-blur').value     = rInt(8,30);
        document.getElementById('g-radius').value   = rInt(8,40);
        document.getElementById('g-border').value   = rInt(15,60);
        document.getElementById('g-shadow').value   = rInt(10,40);
        document.getElementById('g-width').value    = rInt(220,350);
        document.getElementById('g-height').value   = 0;
      } else {
        // Neumorphism works best with mid-tone colors
        const base = `#${rInt(160,220).toString(16).padStart(2,'0')}${rInt(160,220).toString(16).padStart(2,'0')}${rInt(160,220).toString(16).padStart(2,'0')}`;
        setColorInput('n-bg-color', base);
        setColorInput('n-el-color', base);
        document.getElementById('n-radius').value    = rInt(8,50);
        document.getElementById('n-dist').value      = rInt(4,20);
        document.getElementById('n-blur').value      = rInt(8,30);
        document.getElementById('n-intensity').value = rInt(15,45);
        document.getElementById('n-inset').checked   = Math.random() > 0.6;
        document.getElementById('n-width').value     = rInt(220,350);
        document.getElementById('n-height').value    = 0;
      }
      updateAll();
    }

    /* ============================================================
       RESET
    ============================================================ */
    function resetControls() {
      if (currentTab === 'glass') {
        const d = glassDefaults;
        setColorInput('g-bg-color',   d.bgColor);
        setColorInput('g-card-color', d.cardColor);
        document.getElementById('g-opacity').value = d.opacity;
        document.getElementById('g-blur').value    = d.blur;
        document.getElementById('g-radius').value  = d.radius;
        document.getElementById('g-border').value  = d.border;
        document.getElementById('g-shadow').value  = d.shadow;
        document.getElementById('g-width').value   = d.width;
        document.getElementById('g-height').value  = d.height;
      } else {
        const d = neuDefaults;
        setColorInput('n-bg-color', d.bgColor);
        setColorInput('n-el-color', d.elColor);
        document.getElementById('n-radius').value    = d.radius;
        document.getElementById('n-dist').value      = d.dist;
        document.getElementById('n-blur').value      = d.blur;
        document.getElementById('n-intensity').value = d.intensity;
        document.getElementById('n-inset').checked   = d.inset;
        document.getElementById('n-width').value     = d.width;
        document.getElementById('n-height').value    = d.height;
      }
      updateAll();
    }

    /* ============================================================
       EXPORT AS HTML
    ============================================================ */
    function exportHTML() {
      let css, className, elTag;
      if (currentTab === 'glass') {
        const v = getGlassValues();
        css = buildGlassCSS(v);
        className = 'glass-card';
        elTag = `<div class="glass-bg" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:${v.bgColor}">`;
      } else {
        const v = getNeuValues();
        css = buildNeuCSS(v);
        className = 'neu-card';
        elTag = `<div class="neu-bg" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:${v.bgColor}">`;
      }

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated ${currentTab === 'glass' ? 'Glassmorphism' : 'Neumorphism'} Card</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; }

${css}

    .card-icon {
      width: 46px; height: 46px; border-radius: 50%;
      background: linear-gradient(135deg, #6c63ff, #38bdf8);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; margin-bottom: 1rem;
    }
    .card-title { font-size: 1.15rem; font-weight: 700; margin-bottom: .5rem; }
    .card-body { font-size: .85rem; opacity: .75; line-height: 1.55; margin-bottom: 1.2rem; }
    .card-btn {
      display: inline-block; background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25); padding: .5rem 1.1rem;
      border-radius: 50px; font-size: .82rem; font-weight: 600; cursor: pointer;
    }
  </style>
</head>
<body>
  ${elTag}
    <div class="${className}">
      <div class="card-icon">✦</div>
      <div class="card-title">Designed with CSS</div>
      <p class="card-body">A beautiful component generated with Modern CSS UI Generator.</p>
      <button class="card-btn">Explore More →</button>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${currentTab}-card.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }

    /* ============================================================
       COLOR PICKERS ↔ HEX INPUTS SYNC
    ============================================================ */
    function setColorInput(pickerId, hex) {
      const picker = document.getElementById(pickerId);
      const hexInput = document.getElementById(pickerId + '-hex');
      picker.value = hex;
      if (hexInput) hexInput.value = hex;
    }

    function syncColorPickers() {
      const pairs = [
        ['g-bg-color', 'g-bg-color-hex'],
        ['g-card-color', 'g-card-color-hex'],
        ['n-bg-color', 'n-bg-color-hex'],
        ['n-el-color', 'n-el-color-hex'],
      ];
      pairs.forEach(([pickId, hexId]) => {
        const picker = document.getElementById(pickId);
        const hex    = document.getElementById(hexId);
        if (!picker || !hex) return;

        // picker → hex text
        picker.addEventListener('input', () => {
          hex.value = picker.value;
          updateAll();
        });
        // hex text → picker
        hex.addEventListener('input', () => {
          const v = hex.value.trim();
          if (/^#[0-9a-fA-F]{6}$/.test(v)) {
            picker.value = v;
            updateAll();
          }
        });
        hex.addEventListener('blur', () => {
          if (!/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
            hex.value = picker.value;
          }
        });
      });
    }

    /* ============================================================
       BIND ALL SLIDER / TOGGLE EVENTS
    ============================================================ */
    function bindControls() {
      const ids = [
        'g-opacity','g-blur','g-radius','g-border','g-shadow','g-width','g-height',
        'n-radius','n-dist','n-blur','n-intensity','n-width','n-height'
      ];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateAll);
      });
      const toggle = document.getElementById('n-inset');
      if (toggle) toggle.addEventListener('change', updateAll);
    }

    /* ============================================================
       THEME TOGGLE
    ============================================================ */
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      themeToggle.textContent = isDark ? '🌙' : '☀️';
    });

    /* ============================================================
       HERO "COPY EXAMPLE CSS"
    ============================================================ */
    document.getElementById('hero-copy-example').addEventListener('click', () => {
      const exampleCSS = `.glass-card-example {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.30);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.20);
  padding: 1.75rem;
  width: 280px;
  color: #ffffff;
}`;
      navigator.clipboard.writeText(exampleCSS).then(() => {
        const btn = document.getElementById('hero-copy-example');
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = '⎘ Copy Example CSS'; }, 2200);
      });
    });

    /* ============================================================
       FAQ ACCORDION
    ============================================================ */
    function toggleFAQ(btn) {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    }

    /* ============================================================
       REVEAL ON SCROLL
    ============================================================ */
    function setupReveal() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    /* ============================================================
       NAVBAR SCROLL SHADOW
    ============================================================ */
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    });

    /* ============================================================
       INIT
    ============================================================ */
    document.addEventListener('DOMContentLoaded', () => {
      syncColorPickers();
      bindControls();
      updateAll();
      setupReveal();
    });