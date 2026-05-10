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
let dataset = [];

d3.csv('/static/gaming_mental_health.csv')
.then(data => {
    console.log(data[0]);
    console.log(dataset[0]);
    dataset = data.map(d => ({

        // =========================
        // VARIABLES PRINCIPALES
        // =========================
        risk:
            d.gaming_addiction_risk_level?.trim(),

        genre:
            d.game_genre?.trim(),

        platform:
            d.gaming_platform?.trim(),

        hours:
            +d.daily_gaming_hours,

        withdrawal:
            d.withdrawal_symptoms?.trim(),

        isolation:
            +d.social_isolation_score,

        sleep:
            +d.sleep_hours,

        spending:
            +d.monthly_game_spending_usd,

        age:
            +d.age
    }));

    console.log(dataset);
    console.log(buildRiskData());
    console.log(buildPlatformData());

    renderKPIs();
    renderOverview();
});

function buildRiskData() {

    const counts = d3.rollup(
        dataset,
        v => v.length,
        d => d.risk
    );

    // Orden fijo deseado
    const order = [
        'Low',
        'Moderate',
        'High',
        'Severe'
    ];

    const colors = {
        Low: '#10b981',
        Moderate: '#e4d830',
        High: '#f56a33',
        Severe: '#fa2828'
    };

    return order.map(label => ({

        label,

        value:
            counts.get(label) || 0,

        color:
            colors[label]
    }));
}

function buildPlatformData() {

    const counts = d3.rollup(
        dataset,
        v => v.length,
        d => d.platform
    );

    return Array.from(
        counts,
        ([label, value]) => ({
            label,
            value
        })
    );
}


// ↑ Datos reales del dataset (Gaming and Mental Health.csv)

// Datos reales del dataset — game_genre value_counts()
function buildGenreData() {

    const counts = d3.rollup(
        dataset,
        v => v.length,
        d => d.genre
    );

    return Array.from(counts, ([label, value]) => ({
        label,
        value
    }))
    .sort((a,b) => b.value - a.value);
}

function buildPlatformData() {

    const counts = d3.rollup(
        dataset,
        v => v.length,
        d => d.platform
    );

    return Array.from(counts, ([label, value]) => ({
        label,
        value
    }));
}

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

    renderBarChart(
        '#chart-risk-dist',
        buildRiskData()
    );

    renderHistogram(
        '#chart-hours-dist'
    );

    renderIsolationHistogram(
        '#chart-genre'
    );

    renderDonut(
        '#chart-platform',
        buildPlatformData()
    );
}


function renderKPIs() {

    // ====================================================
    // PROMEDIOS
    // ====================================================

    const avgHours =
        d3.mean(dataset, d => d.hours);

    const avgSleep =
        d3.mean(dataset, d => d.sleep);

    const avgIsolation =
        d3.mean(dataset, d => d.isolation);

    const avgSpending =
        d3.mean(dataset, d => d.spending);

    // ====================================================
    // MAX / MIN
    // ====================================================

    const maxHours =
        d3.max(dataset, d => d.hours);

    const minSleep =
        d3.min(dataset, d => d.sleep);

    const maxSpending =
        d3.max(dataset, d => d.spending);

    // ====================================================
    // ACTUALIZAR HTML
    // ====================================================

    document.getElementById('kpi-hours').innerHTML = `
        ${avgHours.toFixed(2)}
    `;

    document.getElementById('kpi-hours-sub').innerHTML = `
        Average · Max ${maxHours.toFixed(1)}h
    `;

    document.getElementById('kpi-sleep').innerHTML = `
        ${avgSleep.toFixed(2)}
    `;

    document.getElementById('kpi-sleep-sub').innerHTML = `
        Average · Min ${minSleep.toFixed(1)}h
    `;

    document.getElementById('kpi-isolation').innerHTML = `
        ${avgIsolation.toFixed(2)}
    `;

    document.getElementById('kpi-isolation-sub').innerHTML = `
        Average · Scale 1-10
    `;

    document.getElementById('kpi-spending').innerHTML = `
        $${avgSpending.toFixed(0)}
    `;

    document.getElementById('kpi-spending-sub').innerHTML = `
        Average · Max $499
    `;
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

const bins = d3.bin()
    .domain([0, 15])
    .thresholds(30)
    (
        dataset
        .map(d => d.hours)
        .filter(d => !isNaN(d))
    );

const data = bins.map(bin => ({

    hour:
        (bin.x0 + bin.x1) / 2,

    value:
        bin.length
}));


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
        .domain([0, d3.max(data, d => d.value) * 1.1])
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

    // Datos reales del dataset — social_isolation_score value_counts()
const counts = d3.rollup(
    dataset,
    v => v.length,
    d => d.isolation
);

const data = Array.from(
    counts,
    ([score, value]) => ({
        score: +score,
        value
    })
).sort((a,b) => a.score - b.score);

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
        .domain([0, d3.max(data, d => d.value) * 1.1])
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
            d => y(d.value) - 2
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
    renderViolinPlot('#preview-violin');
    renderWithdrawalChart('#preview-withdrawal');
    renderBoxplot('#preview-boxplot');
    renderGamingIsolationBoxplot('#preview-gaming-isolation');
}

function renderGamingIsolationBoxplot(selector){

    const isPreview =
    selector.includes('preview');

    const el = document.querySelector(selector);

    if(!el) return;

    el.innerHTML = '';

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.clientWidth || 920;
    const H =
    isPreview ? 220 : 430;

    const margin = {
        top: 30,
        right: 30,
        bottom: 70,
        left: 70
    };

    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    // ====================================================
    // SVG
    // ====================================================

    const svg = d3.select(selector)
        .append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`);

    const g = svg.append('g')
        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    // ====================================================
    // CATEGORÍAS
    // ====================================================

    function isolationLevel(v){

        if(v <= 3) return 'Low';

        if(v <= 5) return 'Moderate';

        if(v <= 7) return 'High';

        return 'Extreme';
    }

    const order = [

        'Low',

        'Moderate',

        'High',

        'Extreme'
    ];

    // ====================================================
    // DATA
    // ====================================================

    const grouped = order.map(level => {

        const values = dataset

            .filter(
                d =>
                    isolationLevel(d.isolation) === level
            )

            .map(d => d.hours)

            .sort(d3.ascending);

        return {

            level,

            values,

            q1:
                d3.quantile(values, 0.25),

            median:
                d3.quantile(values, 0.5),

            q3:
                d3.quantile(values, 0.75),

            min:
                d3.min(values),

            max:
                d3.max(values)
        };
    });

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleBand()
        .domain(order)
        .range([0, w])
        .padding(0.35);

    const y = d3.scaleLinear()
        .domain([0, 15])
        .range([h, 0]);

    // ====================================================
    // GRID
    // ====================================================

    g.append('g')
        .attr('class','grid')
        .call(
            d3.axisLeft(y)
            .tickSize(-w)
            .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke','#e2e8f0');

    // ====================================================
    // AXIS
    // ====================================================

    g.append('g')
        .attr(
            'transform',
            `translate(0,${h})`
        )
        .call(d3.axisBottom(x));

    g.append('g')
        .call(d3.axisLeft(y));

    // ====================================================
    // COLORES
    // ====================================================

    const colors = {

        'Low': '#10b981',

        'Moderate': '#eab308',

        'High': '#f97316',

        'Extreme': '#ef4444'
    };

    // ====================================================
    // BOXPLOTS
    // ====================================================

    grouped.forEach(group => {

        const center =
            x(group.level) + x.bandwidth()/2;

        // whisker

        g.append('line')
            .attr('x1', center)
            .attr('x2', center)
            .attr('y1', y(group.min))
            .attr('y2', y(group.max))
            .attr('stroke','#475569')
            .attr('stroke-width',2);

        // box

        g.append('rect')

            .attr(
                'x',
                x(group.level)
            )

            .attr(
                'y',
                y(group.q3)
            )

            .attr(
                'width',
                x.bandwidth()
            )

            .attr(
                'height',
                y(group.q1) - y(group.q3)
            )

            .attr('rx',8)

            .attr(
                'fill',
                colors[group.level]
            )

            .attr('opacity',1)

            .style(
                'filter',
                'drop-shadow(0 2px 5px rgba(0,0,0,0.08))'
            );

        // median

        g.append('line')

            .attr(
                'x1',
                x(group.level)
            )

            .attr(
                'x2',
                x(group.level) + x.bandwidth()
            )

            .attr(
                'y1',
                y(group.median)
            )

            .attr(
                'y2',
                y(group.median)
            )

            .attr('stroke','#0f172a')

            .attr('stroke-width',3);

        // top cap

        g.append('line')

            .attr('x1', center - 24)
            .attr('x2', center + 24)

            .attr(
                'y1',
                y(group.max)
            )

            .attr(
                'y2',
                y(group.max)
            )

            .attr('stroke','#475569')

            .attr('stroke-width',2);

        // bottom cap

        g.append('line')

            .attr('x1', center - 24)
            .attr('x2', center + 24)

            .attr(
                'y1',
                y(group.min)
            )

            .attr(
                'y2',
                y(group.min)
            )

            .attr('stroke','#475569')

            .attr('stroke-width',2);
    });

    // ====================================================
    // LABEL Y
    // ====================================================

    svg.append('text')

        .attr(
            'transform',
            `translate(22,${H/2}) rotate(-90)`
        )

        .attr('text-anchor','middle')

        .attr('fill','#475569')

        .attr('font-size',14)

        .attr('font-weight',600)

        .text('Daily Gaming Hours');

    // ====================================================
    // LABEL X
    // ====================================================

    svg.append('text')

        .attr('x', W/2)

        .attr('y', H-12)

        .attr('text-anchor','middle')

        .attr('fill','#475569')

        .attr('font-size',14)

        .attr('font-weight',600)

        .text('Social Isolation Level');
}

function renderBoxplot(selector){

    const isPreview =
    selector.includes('preview');

    const el = document.querySelector(selector);

    if(!el) return;

    el.innerHTML = '';

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.clientWidth || 900;
    const H =
    isPreview ? 220 : 430;

    const margin = {
        top: 30,
        right: 30,
        bottom: 70,
        left: 70
    };

    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    // ====================================================
    // SVG
    // ====================================================

    const svg = d3.select(selector)
        .append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`);

    const g = svg.append('g')
        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    // ====================================================
    // ORDEN
    // ====================================================

    const order = [
        'Low',
        'Moderate',
        'High',
        'Severe'
    ];

    // ====================================================
    // DATA
    // ====================================================

    const grouped = order.map(level => {

        const values = dataset

            .filter(d => d.risk === level)

            .map(d => d.isolation)

            .sort(d3.ascending);

        return {

            level,

            values,

            q1:
                d3.quantile(values, 0.25),

            median:
                d3.quantile(values, 0.5),

            q3:
                d3.quantile(values, 0.75),

            min:
                d3.min(values),

            max:
                d3.max(values)
        };
    });

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleBand()
        .domain(order)
        .range([0, w])
        .padding(0.35);

    const y = d3.scaleLinear()
        .domain([0, 10])
        .range([h, 0]);

    // ====================================================
    // GRID
    // ====================================================

    g.append('g')
        .attr('class','grid')
        .call(
            d3.axisLeft(y)
            .tickSize(-w)
            .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke','#e2e8f0');

    // ====================================================
    // AXIS
    // ====================================================

    g.append('g')
        .attr(
            'transform',
            `translate(0,${h})`
        )
        .call(d3.axisBottom(x));

    g.append('g')
        .call(d3.axisLeft(y));

    // ====================================================
    // COLORES
    // ====================================================

    const colors = {

        Low: '#10b981',

        Moderate: '#eab308',

        High: '#f97316',

        Severe: '#ef4444'
    };

    // ====================================================
    // BOXPLOTS
    // ====================================================

    grouped.forEach(group => {

        const center =
            x(group.level) + x.bandwidth()/2;

        // ================================================
        // WHISKERS
        // ================================================

        g.append('line')
            .attr('x1', center)
            .attr('x2', center)
            .attr('y1', y(group.min))
            .attr('y2', y(group.max))
            .attr('stroke','#475569')
            .attr('stroke-width',2);

        // ================================================
        // BOX
        // ================================================

        g.append('rect')

            .attr(
                'x',
                x(group.level)
            )

            .attr(
                'y',
                y(group.q3)
            )

            .attr(
                'width',
                x.bandwidth()
            )

            .attr(
                'height',
                y(group.q1) - y(group.q3)
            )

            .attr('rx',8)

            .attr(
                'fill',
                colors[group.level]
            )

            .attr('opacity',1)

            .style(
                'filter',
                'drop-shadow(0 2px 5px rgba(0,0,0,0.08))'
            );

        // ================================================
        // MEDIANA
        // ================================================

        g.append('line')

            .attr(
                'x1',
                x(group.level)
            )

            .attr(
                'x2',
                x(group.level) + x.bandwidth()
            )

            .attr(
                'y1',
                y(group.median)
            )

            .attr(
                'y2',
                y(group.median)
            )

            .attr('stroke','#0f172a')

            .attr('stroke-width',3);

        // ================================================
        // TOP CAP
        // ================================================

        g.append('line')

            .attr('x1', center - 24)
            .attr('x2', center + 24)

            .attr(
                'y1',
                y(group.max)
            )

            .attr(
                'y2',
                y(group.max)
            )

            .attr('stroke','#475569')
            .attr('stroke-width',2);

        // ================================================
        // BOTTOM CAP
        // ================================================

        g.append('line')

            .attr('x1', center - 24)
            .attr('x2', center + 24)

            .attr(
                'y1',
                y(group.min)
            )

            .attr(
                'y2',
                y(group.min)
            )

            .attr('stroke','#475569')
            .attr('stroke-width',2);
    });

    // ====================================================
    // LABEL Y
    // ====================================================

    svg.append('text')

        .attr(
            'transform',
            `translate(22,${H/2}) rotate(-90)`
        )

        .attr('text-anchor','middle')

        .attr('fill','#475569')

        .attr('font-size',14)

        .attr('font-weight',600)

        .text('Social Isolation Score');

    // ====================================================
    // LABEL X
    // ====================================================

    svg.append('text')

        .attr('x', W/2)

        .attr('y', H-12)

        .attr('text-anchor','middle')

        .attr('fill','#475569')

        .attr('font-size',14)

        .attr('font-weight',600)

        .text('Addiction Risk Level');
}

function renderWithdrawalChart(selector){

    const isPreview =
    selector.includes('preview');

    const el = document.querySelector(selector);

    if(!el) return;

    el.innerHTML = '';

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.clientWidth || 900;
    const H =
    isPreview ? 220 : 430;

    const margin = {
        top: 30,
        right: 30,
        bottom: 60,
        left: 70
    };

    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    // ====================================================
    // SVG
    // ====================================================

    const svg = d3.select(selector)
        .append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`);

    const g = svg.append('g')
        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    // ====================================================
    // ORDEN
    // ====================================================

    const order = [
        'Low',
        'Moderate',
        'High',
        'Severe'
    ];

    // ====================================================
    // DATA
    // ====================================================

    const processed = order.map(level => {

        const rows =
            dataset.filter(d => d.risk === level);

        return {

            level,

            no:
                rows.filter(d => d.withdrawal === 'FALSE').length,

            yes:
                rows.filter(d => d.withdrawal === 'TRUE').length
        };
    });

    // ====================================================
    // ESCALAS
    // ====================================================

    const x0 = d3.scaleBand()
        .domain(order)
        .range([0, w])
        .padding(0.22);

   const x1 = d3.scaleBand()
    .domain([
        'Without Symptoms',
        'With Symptoms'
    ])
    .range([0, x0.bandwidth()])
    .padding(0.08);

    const y = d3.scaleLinear()
        .domain([
            0,
            d3.max(processed, d => Math.max(d.no, d.yes)) * 1.12
        ])
        .range([h, 0]);

    // ====================================================
    // GRID
    // ====================================================

    g.append('g')
        .attr('class','grid')
        .call(
            d3.axisLeft(y)
            .tickSize(-w)
            .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke','#e2e8f0');

    // ====================================================
    // AXIS
    // ====================================================

    g.append('g')
        .attr(
            'transform',
            `translate(0,${h})`
        )
        .call(d3.axisBottom(x0));

    g.append('g')
        .call(d3.axisLeft(y));

    // ====================================================
    // COLORES
    // ====================================================

  const colors = {

    'Without Symptoms': '#60a5fa',

    'With Symptoms': '#F3914F'
};

    // ====================================================
    // BARRAS
    // ====================================================

    processed.forEach(group => {

        const values = [

            {
                key:'Without Symptoms',
                value:group.no
            },

            {
                key:'With Symptoms',
                value:group.yes
            }
        ];

        g.selectAll(`.bar-${group.level}`)
            .data(values)
            .join('rect')

            .attr(
                'x',
                d =>
                    x0(group.level) +
                    x1(d.key)
            )

            .attr(
                'width',
                x1.bandwidth()
            )

            .attr('y', h)

            .attr('height', 0)

            .attr('rx', 6)

            .attr(
                'fill',
                d => colors[d.key]
            )

            .on('mousemove', (e,d) => {

                showTip(
                    e,
                    `
                    <b>${group.level}</b><br>
                    ${d.key}: ${d.value} jugadores
                    `
                );
            })

            .on('mouseout', hideTip)

            .transition()
            .duration(900)

            .attr(
                'y',
                d => y(d.value)
            )

            .attr(
                'height',
                d => h - y(d.value)
            );
    });

    // ====================================================
    // LABEL Y
    // ====================================================

    svg.append('text')
        .attr(
            'transform',
            `translate(22,${H/2}) rotate(-90)`
        )
        .attr('text-anchor','middle')
        .attr('fill','#475569')
        .attr('font-size',14)
        .attr('font-weight',600)
        .text('Number of Players');

    // ====================================================
    // LABEL X
    // ====================================================

    svg.append('text')
        .attr('x', W/2)
        .attr('y', H-10)
        .attr('text-anchor','middle')
        .attr('fill','#475569')
        .attr('font-size',14)
        .attr('font-weight',600)
        .text('Addiction Risk Level');

    // ====================================================
    // LEYENDA
    // ====================================================

    const legend = svg.append('g')
        .attr(
            'transform',
            `translate(${W-180},20)`
        );

     [
    ['Without Symptoms', colors['Without Symptoms']],
    ['With Symptoms', colors['With Symptoms']]
        ].forEach((item,i) => {

        const row = legend.append('g')
            .attr(
                'transform',
                `translate(0,${i*24})`
            );

        row.append('rect')
            .attr('width',16)
            .attr('height',16)
            .attr('rx',4)
            .attr('fill', item[1]);

        row.append('text')
            .attr('x',24)
            .attr('y',13)
            .attr('fill','#475569')
            .attr('font-size',13)
            .attr('font-weight',600)
            .text(item[0]);
    });
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
    const el = document.getElementById('chart-corr');
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
    const colorScale = d3.scaleLinear()
        .domain([-1, 0, 1])
        .range([
        '#f97316', 
        '#e2e8f0',   
        '#3b82f6'    
        ]);
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
g.selectAll('.xlabel')
    .data(heatmapShort)
    .join('text')

    .attr('class','xlabel')

    .attr(
        'x',
        (d,i) => i*cellW + cellW/2
    ).attr('y', h + 24).attr('text-anchor','middle').attr('fill','#64748b').
    attr('font-size',12).attr('font-weight',700).text(d => d);

    g.selectAll('.ylabel').data(heatmapShort).join('text').attr('class','ylabel')
        .attr('x',-8).attr('y', (d,i) => i*cellH+cellH/2+4)
        .attr('text-anchor','end').attr('fill','var(--text3)').attr('font-size',10)
        .attr('font-family','DM Mono, monospace').text(d => d);
}

function renderViolinPlot(selector){
    const isPreview =
    selector.includes('preview');

    const el = document.querySelector(selector);

    if(!el) return;

    el.innerHTML = '';

    const W = el.clientWidth || 900;
    const H =
    isPreview ? 220 : 430;

    const margin = {
        top: 40,
        right: 30,
        bottom: 60,
        left: 70
    };

    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`);

    const g = svg.append('g')
        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    // ====================================================
    // ORDEN
    // ====================================================

    const order = [
        'Low',
        'Moderate',
        'High',
        'Severe'
    ];

    // ====================================================
    // DATOS
    // ====================================================

    const grouped = order.map(level => ({

        level,

        values:
            dataset
                .filter(d => d.risk === level)
                .map(d => d.hours)
                .filter(v => !isNaN(v))
    }));

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleBand()
        .domain(order)
        .range([0, w])
        .padding(0.18);

    const y = d3.scaleLinear()
        .domain([0, 15])
        .range([h, 0]);

    g.append('g')
        .attr('transform', `translate(0,${h})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size','13px')
        .style('font-weight','600');

    g.append('g')
        .call(d3.axisLeft(y));

    // ====================================================
    // GRID
    // ====================================================

    g.append('g')
        .attr('class','grid')
        .call(
            d3.axisLeft(y)
            .tickSize(-w)
            .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke','#e2e8f0');

    // ====================================================
    // KDE
    // ====================================================

    function kernelDensityEstimator(kernel, X) {

        return function(V) {

            return X.map(x => [

                x,

                d3.mean(V, v => kernel(x - v))
            ]);
        };
    }

    function kernelEpanechnikov(k) {

        return function(v) {

            return Math.abs(v /= k) <= 1
                ? 0.75 * (1 - v * v) / k
                : 0;
        };
    }

    const kde = kernelDensityEstimator(
        kernelEpanechnikov(0.7),
        y.ticks(50)
    );

    const maxDensity = 0.25;

    const widthScale = d3.scaleLinear()
        .range([0, x.bandwidth()/2])
        .domain([0, maxDensity]);

    // ====================================================
    // COLORES
    // ====================================================

    const colors = {

    Low: '#10b981',

    Moderate: '#eab308',

    High: '#f97316',

    Severe: '#ef4444'
};

    // ====================================================
    // VIOLINS
    // ====================================================

    grouped.forEach(group => {

        const density = kde(group.values);

        const center =
            x(group.level) + x.bandwidth()/2;

        const area = d3.area()
            .x0(d => center - widthScale(d[1]))
            .x1(d => center + widthScale(d[1]))
            .y(d => y(d[0]))
            .curve(d3.curveCatmullRom);

        g.append('path')
            .datum(density)
            .attr('fill', colors[group.level])
            .attr('stroke', '#404040')
            .attr('stroke-width', 2)
            .attr('d', area)
            .attr('opacity', 0.82);

        // ================================================
        // PUNTOS
        // ================================================

        g.selectAll(`.dot-${group.level}`)
            .data(group.values)
            .join('circle')

            .attr(
                'cx',
                () =>
                    center +
                    (Math.random()-0.5)*60
            )

            .attr(
                'cy',
                d => y(d)
            )

            .attr('r',2.2)

            .attr(
                'fill',
                'rgba(0,0,0,0.35)'
            );

        // ================================================
        // MEDIANA
        // ================================================

        const median =
            d3.median(group.values);

        g.append('line')
            .attr('x1', center - 28)
            .attr('x2', center + 28)
            .attr('y1', y(median))
            .attr('y2', y(median))
            .attr('stroke', '#111827')
            .attr('stroke-width', 4)
            .attr('stroke-linecap','round');

        // ================================================
        // LABEL N
        // ================================================

        g.append('text')
            .attr('x', center)
            .attr('y', -12)
            .attr('text-anchor','middle')
            .attr('font-size',14)
            .attr('font-weight',700)
            .attr('fill','#374151')
            .text(`n = ${group.values.length}`);
    });

    // ====================================================
    // LABELS
    // ====================================================

    svg.append('text')
        .attr(
            'transform',
            `translate(20,${H/2}) rotate(-90)`
        )
        .attr('text-anchor','middle')
        .attr('fill','#475569')
        .attr('font-size',14)
        .attr('font-weight',600)
        .text('Daily Gaming Hours');

    svg.append('text')
        .attr('x', W/2)
        .attr('y', H-10)
        .attr('text-anchor','middle')
        .attr('fill','#475569')
        .attr('font-size',14)
        .attr('font-weight',600)
        .text('Addiction Risk Level');
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
                .attr('fill', c.color).attr('rx', 8).attr('opacity', 0.85)
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

    //=================================================
    // Creacion de graficos despliegables
    //=================================================


}

        window.openChart = function(type){

        const modal =
        document.getElementById('chart-modal');

        const container =
        document.getElementById(
            'modal-chart-container'
        );

        container.innerHTML =
        '<div id="dynamic-chart"></div>';

        modal.classList.remove('hidden');

        switch(type){

        case 'violin':

            renderViolinPlot(
                '#dynamic-chart'
            );

            break;

        case 'withdrawal':

            renderWithdrawalChart(
                '#dynamic-chart'
            );

            break;

        case 'boxplot':

            renderBoxplot(
                '#dynamic-chart'
            );

            break;

        case 'gamingIsolation':

            renderGamingIsolationBoxplot(
                '#dynamic-chart'
            );

            break;
    }
    };

    document
    .getElementById('close-modal')

    .addEventListener('click', () => {

    document
        .getElementById('chart-modal')

        .classList.add('hidden');
    });
