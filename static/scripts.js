// ============================================================
// NAVIGATION
// ============================================================
function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    if (id === 'overview') renderOverview();
    if (id === 'obj1') renderObj1();
    if (id === 'obj2') renderObj2();
    if (id === 'obj3') renderObj3();
}

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
    renderIsolationHistogram('#chart-genre');
    renderDonut('#chart-platform', platformData);
}

function renderBarChart(container, data) {

    d3.select(container).html('');

        const containerElement =
    document.querySelector(container);

    const width =
    containerElement.clientWidth;

    const height =
    containerElement.clientHeight;

   const margin = {
    top: 25,
    right: 10,
    bottom: 45,
    left: 50
};

    const svg = d3.select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', '100%');
    const chartWidth =
        width - margin.left - margin.right;

    const chartHeight =
        height - margin.top - margin.bottom;

    const chart = svg.append('g')
    .attr(
        'transform',
        `translate(${margin.left},${margin.top})`
    );

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.18);

    const y = d3.scaleLinear()
       .domain([0, d3.max(data, d => d.value) * 1.12])
        .nice()
        .range([chartHeight, 0]);

    // ====================================================
    // GRID
    // ====================================================

    chart.append('g')
        .attr('class', 'grid')
        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chartWidth)
                .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke', '#edf2f7');

    chart.select('.domain').remove();

    // ====================================================
    // AXIS
    // ====================================================

    chart.append('g')
    .attr('class', 'axis')
    .attr(
        'transform',
        `translate(0,${chartHeight})`
    )
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('dy', '1.2em')
    .style('font-size', '13px')
    .style('font-weight', '600');

    chart.append('g')
        .attr('class', 'axis')
        .call(
            d3.axisLeft(y)
                .ticks(5)
        );

    // ====================================================
    // COLORES
    // ====================================================

    const colors = {
        Low: '#10b981',
        Moderate: '#e4d830',
        High: '#f56a33',
        Severe: '#fa2828'
    };

    // ====================================================
    // TOOLTIP
    // ====================================================

    const tooltip = d3.select('#tooltip');

    // ====================================================
    // SOMBRAS
    // ====================================================

    const defs = svg.append('defs');

    const filter = defs.append('filter')
        .attr('id', 'shadow');

    filter.append('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 4)
        .attr('stdDeviation', 6)
        .attr('flood-opacity', 0.12);

    // ====================================================
    // BARRAS
    // ====================================================

    const bars = chart.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.label))
        .attr('y', chartHeight)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('rx', 12)
        .attr('fill', d => colors[d.label])
        .style('filter', 'url(#shadow)')

        // TOOLTIP
        .on('mousemove', (event, d) => {

            tooltip
                .style('opacity', 1)
                .html(`
                    <strong>${d.label}</strong><br>
                    ${d.value} jugadores
                `)
                .style(
                    'left',
                    `${event.pageX + 16}px`
                )
                .style(
                    'top',
                    `${event.pageY - 45}px`
                );
        })

        .on('mouseleave', () => {

            tooltip
                .style('opacity', 0);
        });

    // ====================================================
    // ANIMACIÓN
    // ====================================================

    bars.transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('y', d => y(d.value))
        .attr(
            'height',
            d => chartHeight - y(d.value)
        );

    // ====================================================
    // LABELS
    // ====================================================

    chart.selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr(
            'x',
            d => x(d.label) + x.bandwidth() / 2
        )
        .attr(
            'y',
            d => y(d.value) - 14
        )
        .attr('text-anchor', 'middle')
        .attr('fill', '#0f172a')
        .attr('font-size', 13)
        .attr('font-weight', 700)
        .style('opacity', 0)
        .text(d => d.value)

        .transition()
        .delay(700)
        .duration(600)
        .style('opacity', 1);

}

function renderHistogram(selector) {

    const el = document.querySelector(selector);

    if (!el) return;

    el.innerHTML = '';

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.offsetWidth || 400;
    const H = el.offsetHeight || 260;

    const m = {
        top: 20,
        right: 20,
        bottom: 40,
        left: 45
    };

    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    // ====================================================
    // DATA
    // ====================================================

const data = [
    { hour: 0.5, value: 14 },
    { hour: 1.0, value: 14 },
    { hour: 1.5, value: 13 },
    { hour: 2.0, value: 24 },
    { hour: 2.5, value: 17 },
    { hour: 3.0, value: 24 },
    { hour: 3.5, value: 21 },

    { hour: 4.0, value: 38 },
    { hour: 4.3, value: 41 },
    { hour: 4.6, value: 24 },

    { hour: 5.0, value: 38 },
    { hour: 5.3, value: 54 },
    { hour: 5.6, value: 41 },

    { hour: 6.0, value: 48 },
    { hour: 6.3, value: 36 },
    { hour: 6.6, value: 61 },

    { hour: 7.0, value: 53 },
    { hour: 7.3, value: 45 },
    { hour: 7.6, value: 26 },

    { hour: 8.0, value: 47 },
    { hour: 8.3, value: 32 },
    { hour: 8.6, value: 22 },

    { hour: 9.0, value: 37 },
    { hour: 9.3, value: 28 },
    { hour: 9.6, value: 30 },

    { hour: 10.0, value: 10 },
    { hour: 10.3, value: 34 },
    { hour: 10.6, value: 11 },

    { hour: 11.0, value: 13 },
    { hour: 11.3, value: 22 },
    { hour: 11.6, value: 9 },

    { hour: 12.0, value: 14 },
    { hour: 12.3, value: 12 },
    { hour: 12.6, value: 8 },

    { hour: 13.0, value: 10 },
    { hour: 13.3, value: 8 },
    { hour: 13.6, value: 8 },

    { hour: 14.0, value: 4 },
    { hour: 14.3, value: 3 },
    { hour: 14.6, value: 2 },

    { hour: 15.0, value: 3 }
];

    // ====================================================
    // SVG
    // ====================================================

    const svg = d3.select(selector)
        .append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`)
        .style('width', '100%')
        .style('height', '100%');

    const g = svg.append('g')
        .attr(
            'transform',
            `translate(${m.left},${m.top})`
        );

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleLinear()
        .domain([0, 16])
        .range([0, w]);

    const y = d3.scaleLinear()
        .domain([0, 50])
        .range([h, 0]);

    // ====================================================
    // GRID
    // ====================================================

    g.append('g')
        .attr('class', 'grid')
        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickSize(-w)
                .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke', '#edf2f7');

    // ====================================================
    // AREA (SOMBRA)
    // ====================================================

    const area = d3.area()
        .x(d => x(d.hour))
        .y0(h)
        .y1(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
        .datum(data)
        .attr('fill', 'rgba(99,179,237,0.22)')
        .attr('d', area)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', 1);

    // ====================================================
    // LINEA
    // ====================================================

    const line = d3.line()
        .x(d => x(d.hour))
        .y(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5));

    const path = g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#63b3ed')
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'round')
        .attr('d', line);

    // ====================================================
    // ANIMACIÓN LINEA
    // ====================================================

    const totalLength = path.node().getTotalLength();

    path
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1400)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

    // ====================================================
    // PUNTOS
    // ====================================================

    g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.hour))
        .attr('cy', d => y(d.value))
        .attr('r', 0)
        .attr('fill', '#63b3ed')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `${d.hour}h<br><b>${d.value} jugadores</b>`
            );

        })

        .on('mouseout', hideTip)

        .transition()
        .delay((d, i) => i * 120)
        .duration(400)
        .attr('r', 5);

    // ====================================================
    // AXIS X
    // ====================================================

    g.append('g')
    .attr('class', 'axis')
    .attr(
        'transform',
        `translate(0,${h})`
    )
    .call(
        d3.axisBottom(x)
            .ticks(8)
    );

    g.append('text')
    .attr('x', w / 2)
    .attr('y', h + 38)
    .attr('text-anchor', 'middle')
    .attr('fill', '#64748b')
    .attr('font-size', '13px')
    .attr('font-weight', '600')
    .text('Horas de Juego');

    // ====================================================
    // AXIS Y
    // ====================================================

    g.append('g')
        .attr('class', 'axis')
        .call(
            d3.axisLeft(y)
                .ticks(5)
        );

        g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -h / 2)
    .attr('y', -32)
    .attr('text-anchor', 'middle')
    .attr('fill', '#64748b')
    .attr('font-size', '13px')
    .attr('font-weight', '600')
    .text('Jugadores');
}

function renderIsolationHistogram(selector) {

    const el = document.querySelector(selector);

    if (!el) return;

    el.innerHTML = '';

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.offsetWidth || 500;
    const H = el.offsetHeight || 300;

    const m = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 50
    };

    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    // ====================================================
    // DATA (SUMA = 1000)
    // ====================================================

    const data = [
        { score: 1, value: 155 },
        { score: 2, value: 130 },
        { score: 3, value: 190 },
        { score: 4, value: 160 },
        { score: 5, value: 155 },
        { score: 6, value: 105 },
        { score: 7, value: 50 },
        { score: 8, value: 30 },
        { score: 9, value: 15 },
        { score: 10, value: 10 }
    ];

    // ====================================================
    // SVG
    // ====================================================

    const svg = d3.select(selector)
        .append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`)
        .style('width', '100%')
        .style('height', '100%');

    const g = svg.append('g')
        .attr(
            'transform',
            `translate(${m.left},${m.top})`
        );

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleBand()
        .domain(data.map(d => d.score))
        .range([0, w])
        .padding(0.08);

    const y = d3.scaleLinear()
        .domain([0, 200])
        .range([h, 0]);

    // ====================================================
    // GRID
    // ====================================================

    g.append('g')
        .attr('class', 'grid')
        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickSize(-w)
                .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke', '#edf2f7');

    // ====================================================
    // AXIS
    // ====================================================

    g.append('g')
        .attr('class', 'axis')
        .attr(
            'transform',
            `translate(0,${h})`
        )
        .call(d3.axisBottom(x));

    g.append('g')
        .attr('class', 'axis')
        .call(
            d3.axisLeft(y)
                .ticks(5)
        );

    // ====================================================
    // BARRAS
    // ====================================================

    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.score))
        .attr('width', x.bandwidth())
        .attr('y', h)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', '#63b3ed')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `Score ${d.score}<br><b>${d.value} jugadores</b>`
            );

        })

        .on('mouseout', hideTip)

        .transition()
        .duration(900)
        .delay((d, i) => i * 60)
        .attr('y', d => y(d.value))
        .attr('height', d => h - y(d.value));

    // ====================================================
    // LABELS
    // ====================================================

    g.selectAll('.lbl')
        .data(data)
        .enter()
        .append('text')
        .attr(
            'x',
            d => x(d.score) + x.bandwidth()/2
        )
        .attr(
            'y',
            d => y(d.value) - 8
        )
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', 11)
        .attr('font-weight', 600)
        .text(d => d.value);

    // ====================================================
    // TITULO EJE X
    // ====================================================

    g.append('text')
        .attr('x', w / 2)
        .attr('y', h + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text('Social Isolation Score');

    // ====================================================
    // TITULO EJE Y
    // ====================================================

    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -h / 2)
        .attr('y', -35)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text('Jugadores');
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
        
        // ====================================================
// PORCENTAJES EN LA DONA
// ====================================================

g.selectAll('.percent-label')
    .data(pie(data))
    .join('text')
    .attr('class', 'percent-label')
    .attr('transform', d => {

    const labelArc = d3.arc()
        .innerRadius(r * 0.78)
        .outerRadius(r * 0.78);

    return `translate(${labelArc.centroid(d)})`;
})
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#1e293b')
    .attr('font-size', 11)
    .attr('font-weight', 700)
    .attr('font-family', 'Inter, sans-serif')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .text(d => {

        const total =
            d3.sum(data, item => item.value);

        const pct =
            (d.data.value / total) * 100;

        return `${pct.toFixed(1)}%`;
    })

    .transition()
    .delay(700)
    .duration(600)
    .style('opacity', 1);

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