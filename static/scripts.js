// ============================================================
// NAVIGATION
// ============================================================


function showSection(id, btn) {

    document.querySelectorAll('.section')
        .forEach(s => s.classList.remove('active'));

    document.querySelectorAll('.nav-btn')
        .forEach(b => b.classList.remove('active'));

    document.getElementById(id)
        .classList.add('active');

    if (btn) {
        btn.classList.add('active');
    }

    setTimeout(() => {

        if (id === 'overview') renderOverview();

        if (id === 'obj1') renderObj1();

        if (id === 'obj2') renderObj2();

        if (id === 'obj3') renderObj3();

    }, 50);
}

// ============================================================
// INIT
// ============================================================

window.onload = () => {

    renderOverview();

};

// ============================================================
// DATA
// ============================================================
const riskDist = [
    { label: 'Low',      value: 514, color: '#68d391' },
    { label: 'Moderate', value: 190, color: '#f6ad55' },
    { label: 'High',     value: 154, color: '#fc8181' },
    { label: 'Severe',   value: 142, color: '#b794f4' }
];

const genreData = [
    { label: 'MOBA',         value: 156 },
    { label: 'RPG',          value: 146 },
    { label: 'MMO',          value: 143 },
    { label: 'Battle Royale',value: 141 },
    { label: 'Strategy',     value: 141 },
    { label: 'Mobile',       value: 139 },
    { label: 'FPS',          value: 134 }
];

const platformData = [
    { label: 'Mobile',         value: 262 },
    { label: 'Multi-platform', value: 260 },
    { label: 'PC',             value: 241 },
    { label: 'Console',        value: 237 }
];

const importanceData = [
    { label: 'daily_gaming_hours',    value: 0.53, color: '#f6ad55' },
    { label: 'sleep_hours',           value: 0.20, color: '#63b3ed' },
    { label: 'social_isolation_score',value: 0.13, color: '#b794f4' },
    { label: 'withdrawal_symptoms',   value: 0.13, color: '#fc8181' }
];

const corrData = [
    { label: 'daily_gaming_hours',    value:  0.81 },
    { label: 'withdrawal_symptoms',   value:  0.77 },
    { label: 'social_isolation_score',value:  0.74 },
    { label: 'sleep_hours',           value: -0.61 }
];

const heatmapVars  = ['daily_gaming_hours','withdrawal_symptoms','sleep_hours','social_isolation_score','gaming_addiction_risk'];
const heatmapShort = ['gaming_h','withdrawal','sleep_h','isolation','risk'];
const heatmapData  = [
    [ 1.00,  0.60, -0.74,  0.88,  0.81],
    [ 0.60,  1.00, -0.53,  0.55,  0.77],
    [-0.74, -0.53,  1.00, -0.66, -0.61],
    [ 0.88,  0.55, -0.66,  1.00,  0.74],
    [ 0.81,  0.77, -0.61,  0.74,  1.00]
];

const clusterVars = ['daily_gaming_h','exercise_h','sleep_quality','isolation','weight_kg'];
const clusterData = [
    { name: 'C0 Casual',     color: '#68d391', values: [4.14, 8.00, 2.00, 2.50, 0.97] },
    { name: 'C1 Intermedio', color: '#f6ad55', values: [7.53, 6.23, 0.89, 4.78, 1.75] },
    { name: 'C2 Veterano',   color: '#63b3ed', values: [4.16, 7.81, 2.11, 2.60, 1.01] },
    { name: 'C3 Alto Riesgo',color: '#fc8181', values: [10.71, 4.71, 0.77, 6.96, 2.97] }
];

const coefData = [
    { label: 'withdrawal_symptoms',       value: 0.988, color: '#fc8181' },
    { label: 'continued_despite_problems',value: 0.933, color: '#b794f4' },
    { label: 'loss_of_other_interests',   value: 0.799, color: '#f6ad55' },
    { label: 'daily_gaming_hours',        value: 0.097, color: '#63b3ed' },
    { label: 'social_isolation_score',    value: 0.027, color: '#68d391' },
    { label: 'sleep_quality',             value: 0.026, color: '#4fd1c5' }
];

// ============================================================
// TOOLTIP
// ============================================================
const tooltip = document.getElementById('tooltip');

function showTip(e, html) {
    tooltip.innerHTML = html;
    tooltip.style.opacity = 1;
    tooltip.style.left = (e.pageX + 12) + 'px';
    tooltip.style.top  = (e.pageY - 28) + 'px';
}

function hideTip() { tooltip.style.opacity = 0; }

// ============================================================
// OVERVIEW
// ============================================================
function renderOverview() {
    renderBarChart('#chart-risk-dist', riskDist, d => d.value, d => d.label, d => d.color, 'Jugadores');
    renderHistogram('#chart-hours-dist');
    renderHorizBar('#chart-genre', genreData, '#63b3ed');
    renderDonut('#chart-platform', platformData);
}

function renderBarChart(selector, data, valFn, labelFn, colorFn, unit) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = '';
    const W = el.offsetWidth || 400, H = 200;
    const m = { top:10, right:20, bottom:30, left:40 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = d3.select(selector).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
    const x = d3.scaleBand().domain(data.map(labelFn)).range([0, w]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(data, valFn) * 1.15]).range([h, 0]);
    g.append('g').attr('class','axis').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x));
    g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(4));
    g.selectAll('.bar').data(data).join('rect')
        .attr('x', d => x(labelFn(d))).attr('width', x.bandwidth())
        .attr('y', h).attr('height', 0).attr('fill', colorFn).attr('rx', 3)
        .on('mouseover', (e,d) => showTip(e, `<b>${labelFn(d)}</b>: ${valFn(d)} ${unit}`))
        .on('mouseout', hideTip)
        .transition().duration(600).delay((d,i) => i*80)
        .attr('y', d => y(valFn(d))).attr('height', d => h - y(valFn(d)));
}

function renderHistogram(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = '';
    const W = el.offsetWidth || 400, H = 200;
    const m = { top:10, right:20, bottom:30, left:40 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const bins = [
        {x0:0,  x1:3,  count:95},
        {x0:3,  x1:5,  count:220},
        {x0:5,  x1:7,  count:310},
        {x0:7,  x1:9,  count:245},
        {x0:9,  x1:11, count:85},
        {x0:11, x1:13, count:30},
        {x0:13, x1:16, count:15}
    ];
    const svg = d3.select(selector).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
    const x = d3.scaleLinear().domain([0, 16]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 350]).range([h, 0]);
    g.append('g').attr('class','axis').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).ticks(6));
    g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(4));
    g.selectAll('rect').data(bins).join('rect')
        .attr('x', d => x(d.x0) + 1).attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 2))
        .attr('y', h).attr('height', 0).attr('fill', '#63b3ed').attr('opacity', 0.8).attr('rx', 2)
        .on('mouseover', (e,d) => showTip(e, `${d.x0}–${d.x1}h: ${d.count} jugadores`))
        .on('mouseout', hideTip)
        .transition().duration(600).delay((d,i) => i*60)
        .attr('y', d => y(d.count)).attr('height', d => h - y(d.count));
}

function renderHorizBar(selector, data, color) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = '';
    const W = el.offsetWidth || 400, H = 200;
    const m = { top:10, right:60, bottom:20, left:90 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = d3.select(selector).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
    const y = d3.scaleBand().domain(data.map(d=>d.label)).range([0,h]).padding(0.3);
    const x = d3.scaleLinear().domain([0, d3.max(data,d=>d.value)*1.2]).range([0,w]);
    g.append('g').attr('class','axis').call(d3.axisLeft(y));
    g.selectAll('rect').data(data).join('rect')
        .attr('y', d => y(d.label)).attr('height', y.bandwidth())
        .attr('x', 0).attr('width', 0).attr('fill', color).attr('rx', 2)
        .on('mouseover', (e,d) => showTip(e, `${d.label}: ${d.value}`))
        .on('mouseout', hideTip)
        .transition().duration(600).delay((d,i)=>i*60)
        .attr('width', d => x(d.value));
    g.selectAll('.lbl').data(data).join('text').attr('class','lbl')
        .attr('y', d => y(d.label) + y.bandwidth()/2 + 4).attr('x', d => x(d.value) + 6)
        .attr('fill','var(--text3)').attr('font-size',10).text(d => d.value);
}

function renderDonut(selector, data) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.innerHTML = '';
    const W = el.offsetWidth || 400, H = 200;
    const r = Math.min(W,H)/2 - 10;
    const colors = ['#63b3ed','#68d391','#f6ad55','#b794f4'];
    const svg = d3.select(selector).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g').attr('transform', `translate(${W*0.38},${H/2})`);
    const pie = d3.pie().value(d=>d.value).sort(null);
    const arc = d3.arc().innerRadius(r*0.55).outerRadius(r);
    g.selectAll('path').data(pie(data)).join('path')
        .attr('fill', (d,i) => colors[i])
        .attr('stroke','var(--bg)').attr('stroke-width', 2)
        .on('mouseover', (e,d) => showTip(e, `${d.data.label}: ${d.data.value}`))
        .on('mouseout', hideTip)
        .transition().duration(700).delay((d,i)=>i*100)
        .attrTween('d', function(d) {
            const i = d3.interpolate({startAngle:0,endAngle:0}, d);
            return t => arc(i(t));
        });
    const legend = svg.append('g').attr('transform', `translate(${W*0.62}, ${H/2-40})`);
    data.forEach((d,i) => {
        const row = legend.append('g').attr('transform', `translate(0,${i*22})`);
        row.append('rect').attr('width',10).attr('height',10).attr('fill',colors[i]).attr('rx',2);
        row.append('text').attr('x',14).attr('y',9).attr('fill','var(--text2)').attr('font-size',11)
            .attr('font-family','DM Mono, monospace').text(`${d.label} (${d.value})`);
    });
}

// ============================================================
// OBJ 1
// ============================================================
function renderObj1() {
    renderImpChart();
    renderCorrBars();
    renderHeatmap();
}

function renderImpChart() {
    const el = document.getElementById('chart-importance');
    if (!el) return;
    el.innerHTML = '';
    importanceData.forEach(d => {
        const row = document.createElement('div');
        row.className = 'imp-row';
        row.innerHTML = `
            <span class="imp-label">${d.label}</span>
            <div class="imp-bar-wrap">
                <div class="imp-bar" style="width:0%;background:${d.color}" data-w="${d.value*100}">
                    <span class="imp-val">${(d.value*100).toFixed(0)}%</span>
                </div>
            </div>`;
        el.appendChild(row);
    });
    setTimeout(() => {
        el.querySelectorAll('.imp-bar').forEach(b => { b.style.width = b.dataset.w + '%'; });
    }, 50);
}

function renderCorrBars() {
    const el = document.getElementById('chart-corr-bars');
    if (!el) return;
    el.innerHTML = '';
    corrData.forEach(d => {
        const row = document.createElement('div');
        row.className = 'imp-row';
        const pct = Math.abs(d.value) * 100;
        const color = d.value >= 0 ? '#f6ad55' : '#63b3ed';
        row.innerHTML = `
            <span class="imp-label">${d.label}</span>
            <div class="imp-bar-wrap">
                <div class="imp-bar" style="width:0%;background:${color}" data-w="${pct}">
                    <span class="imp-val">${d.value >= 0 ? '+' : ''}${d.value}</span>
                </div>
            </div>`;
        el.appendChild(row);
    });
    setTimeout(() => {
        el.querySelectorAll('.imp-bar').forEach(b => { b.style.width = b.dataset.w + '%'; });
    }, 50);
}

function renderHeatmap() {
    const el = document.getElementById('chart-heatmap');
    if (!el) return;
    el.innerHTML = '';
    const W = el.offsetWidth || 600, H = 280;
    const m = { top:20, right:20, bottom:80, left:160 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const n = heatmapVars.length;
    const cellW = w/n, cellH = h/n;
    const colorScale = d3.scaleSequential().domain([-1,1]).interpolator(d3.interpolateRdBu);
    const svg = d3.select('#chart-heatmap').append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const v = heatmapData[i][j];
            g.append('rect')
                .attr('x', j*cellW).attr('y', i*cellH)
                .attr('width', cellW-2).attr('height', cellH-2)
                .attr('fill', colorScale(v)).attr('rx', 3)
                .on('mouseover', (e) => showTip(e, `${heatmapShort[i]} × ${heatmapShort[j]}: <b>${v.toFixed(2)}</b>`))
                .on('mouseout', hideTip);
            g.append('text')
                .attr('x', j*cellW+cellW/2).attr('y', i*cellH+cellH/2+4)
                .attr('text-anchor','middle').attr('font-size',11)
                .attr('font-family','DM Mono, monospace')
                .attr('fill', Math.abs(v) > 0.5 ? 'white' : 'var(--text2)')
                .text(v.toFixed(2));
        }
    }
    g.selectAll('.xlabel').data(heatmapShort).join('text').attr('class','xlabel')
        .attr('x', (d,i) => i*cellW+cellW/2).attr('y', h+16)
        .attr('text-anchor','middle').attr('fill','var(--text3)').attr('font-size',10)
        .attr('font-family','DM Mono, monospace')
        .attr('transform', (d,i) => `rotate(-30,${i*cellW+cellW/2},${h+16})`)
        .text(d => d);
    g.selectAll('.ylabel').data(heatmapShort).join('text').attr('class','ylabel')
        .attr('x',-8).attr('y', (d,i) => i*cellH+cellH/2+4)
        .attr('text-anchor','end').attr('fill','var(--text3)').attr('font-size',10)
        .attr('font-family','DM Mono, monospace').text(d => d);
}

// ============================================================
// OBJ 2
// ============================================================
function renderObj2() { renderClusterBars(); }

function renderClusterBars() {
    const el = document.getElementById('chart-clusters');
    if (!el) return;
    el.innerHTML = '';
    const W = el.offsetWidth || 600, H = 300;
    const m = { top:20, right:20, bottom:50, left:60 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = d3.select('#chart-clusters').append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
    const x0 = d3.scaleBand().domain(clusterVars).range([0,w]).padding(0.2);
    const x1 = d3.scaleBand().domain(clusterData.map(d=>d.name)).range([0,x0.bandwidth()]).padding(0.05);
    const allVals = clusterData.flatMap(c => c.values);
    const y = d3.scaleLinear().domain([0, d3.max(allVals)]).range([h,0]);
    g.append('g').attr('class','axis').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x0));
    g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(5));
    clusterVars.forEach((v, vi) => {
        const grp = g.append('g').attr('transform', `translate(${x0(v)},0)`);
        clusterData.forEach((c, ci) => {
            grp.append('rect')
                .attr('x', x1(c.name)).attr('width', x1.bandwidth())
                .attr('y', h).attr('height', 0)
                .attr('fill', c.color).attr('rx', 2).attr('opacity', 0.85)
                .on('mouseover', (e) => showTip(e, `${c.name}<br>${v}: <b>${c.values[vi]}</b>`))
                .on('mouseout', hideTip)
                .transition().duration(600).delay(vi*80 + ci*40)
                .attr('y', y(c.values[vi])).attr('height', h - y(c.values[vi]));
        });
    });
    const legend = svg.append('g').attr('transform', `translate(${m.left}, ${H-14})`);
    clusterData.forEach((c,i) => {
        const row = legend.append('g').attr('transform', `translate(${i*(W/4.5)},0)`);
        row.append('rect').attr('width',10).attr('height',10).attr('fill',c.color).attr('rx',2);
        row.append('text').attr('x',14).attr('y',9).attr('fill','var(--text3)').attr('font-size',10)
            .attr('font-family','DM Mono, monospace').text(c.name);
    });
}

// ============================================================
// OBJ 3
// ============================================================
function renderObj3() {
    renderCoefChart();
    renderCoefCompare();
}

function renderCoefChart() {
    const el = document.getElementById('chart-coef');
    if (!el) return;
    el.innerHTML = '';
    [...coefData].sort((a,b)=>b.value-a.value).forEach(d => {
        const row = document.createElement('div');
        row.className = 'imp-row';
        const pct = (d.value / 1.0) * 100;
        row.innerHTML = `
            <span class="imp-label">${d.label}</span>
            <div class="imp-bar-wrap">
                <div class="imp-bar" style="width:0%;background:${d.color}" data-w="${pct}">
                    <span class="imp-val">${d.value.toFixed(3)}</span>
                </div>
            </div>`;
        el.appendChild(row);
    });
    setTimeout(() => {
        el.querySelectorAll('.imp-bar').forEach(b => { b.style.width = b.dataset.w + '%'; });
    }, 50);
}

function renderCoefCompare() {
    const el = document.getElementById('chart-coef-compare');
    if (!el) return;
    el.innerHTML = '';
    const W = el.offsetWidth || 400, H = 260;
    const m = { top:10, right:20, bottom:80, left:40 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const svg = d3.select('#chart-coef-compare').append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
    const x = d3.scaleBand().domain(coefData.map(d=>d.label)).range([0,w]).padding(0.3);
    const y = d3.scaleLinear().domain([0,1.1]).range([h,0]);
    g.append('g').attr('class','axis').attr('transform',`translate(0,${h})`)
        .call(d3.axisBottom(x)).selectAll('text')
        .attr('transform','rotate(-35)').attr('text-anchor','end');
    g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(5));
    g.selectAll('rect').data(coefData).join('rect')
        .attr('x', d=>x(d.label)).attr('width', x.bandwidth())
        .attr('y', h).attr('height', 0).attr('fill', d=>d.color).attr('rx',3)
        .on('mouseover', (e,d) => showTip(e, `${d.label}: <b>${d.value.toFixed(3)}</b>`))
        .on('mouseout', hideTip)
        .transition().duration(700).delay((d,i)=>i*80)
        .attr('y', d=>y(d.value)).attr('height', d=>h-y(d.value));
}

// ============================================================
// PREDICTOR
// ============================================================
function validateNum(input, min, max) {
    if (input.value.startsWith('-') || input.value.startsWith('+')) {
        input.value = '';
        return;
    }
    const v = parseFloat(input.value);
    if (!isNaN(v) && v > max) input.value = max;
    if (!isNaN(v) && v < min) input.value = min;
}

// ============================================================
// PREDICTOR (ACTUALIZADO CON LÓGICA DE VALIDACIÓN Y MÉTRICAS)
// ============================================================

// Función auxiliar para validar entradas (equivalente a pedir_numero en Python)
function validateNum(input, min, max, esEntero = false) {
    // Eliminar signos + o - si el usuario intenta escribirlos
    if (input.value.startsWith('-') || input.value.startsWith('+')) {
        input.value = '';
        return;
    }

    let v = parseFloat(input.value);
    
    if (isNaN(v)) return;

    // Forzar entero si es necesario
    if (esEntero) {
        v = Math.floor(v);
        input.value = v;
    }

    // Restringir al rango min/max
    if (v > max) input.value = max;
    if (v < min) input.value = min;
}

async function predict() {

    // =====================================================
    // OBTENER DATOS DEL FORMULARIO
    // =====================================================

    const hours = parseFloat(document.getElementById('p-hours').value);

    const sleep = parseInt(
        document.getElementById('p-sleep').value
    );

    const withdrawal = parseInt(
        document.getElementById('p-withdrawal').value
    );

    const loss = parseInt(
        document.getElementById('p-loss').value
    );

    const continued = parseInt(
        document.getElementById('p-continued').value
    );

    const isolation = parseFloat(
        document.getElementById('p-isolation').value
    );

    // =====================================================
    // VALIDACIÓN
    // =====================================================

    if (
        [hours, sleep, withdrawal, loss, continued, isolation]
        .some(isNaN)
    ) {
        alert("❌ Completa todos los campos.");
        return;
    }

    // =====================================================
    // JSON PARA FASTAPI
    // =====================================================

    const datos = {
        daily_gaming_hours: hours,
        withdrawal_symptoms: withdrawal,
        loss_of_other_interests: loss,
        continued_despite_problems: continued,
        sleep_quality: sleep,
        social_isolation_score: isolation
    };

    try {

        // =================================================
        // PETICIÓN A FASTAPI
        // =================================================

        const response = await fetch("/predecir", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)
        });

        // =================================================
        // RESPUESTA
        // =================================================

        const resultado = await response.json();

        console.log(resultado);

        const score = resultado.score;
        const nivel = resultado.risk_level;

        // =================================================
        // CONFIGURACIÓN VISUAL
        // =================================================

        let color = "#68d391";
        let icon = "✅";
        let mensaje = "";

        if (nivel === "LOW") {

            color = "#68d391";
            icon = "✅";

            mensaje =
                "No se detectan señales significativas de adicción.";

        }

        else if (nivel === "MODERATE") {

            color = "#f6ad55";
            icon = "⚠️";

            mensaje =
                "Existen algunas señales de dependencia.";

        }

        else if (nivel === "HIGH") {

            color = "#fc8181";
            icon = "🔶";

            mensaje =
                "Se detectan señales claras de adicción.";

        }

        else {

            color = "#b794f4";
            icon = "🔴";

            mensaje =
                "Nivel crítico de adicción.";

        }

        // =================================================
        // PANEL RESULTADO
        // =================================================

        const panel = document.getElementById("result-panel");

        panel.classList.add("visible");

        // =================================================
        // NIVEL
        // =================================================

        document.getElementById("result-level").innerHTML = `
            <span style="color:${color}">
                ${icon} ${nivel}
            </span>
        `;

        // =================================================
        // SCORE
        // =================================================

        document.getElementById("result-score").innerHTML = `
            Puntuación calculada:
            <b>${score.toFixed(4)}</b>
        `;

        // =================================================
        // MENSAJE
        // =================================================

        const resultMsg = document.getElementById("result-msg");

        if (resultMsg) {

            resultMsg.innerHTML = mensaje;

        }

        // =================================================
        // BARRA DE RIESGO
        // =================================================

        const riskFill = document.getElementById("risk-fill");

        if (riskFill) {

            const porcentaje = (score / 3) * 100;

            riskFill.style.width = `${porcentaje}%`;

            riskFill.style.background = color;
        }

    }

    catch (error) {

        console.error(error);

        alert("❌ Error conectando con la API FastAPI.");

    }

}