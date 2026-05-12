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

let activeClusters = [0,1,2,3];

// ============================================================
// DATA
// ============================================================
let dataset = [];
let filteredDataset = [...dataset];

d3.csv('/static/gaming_mental_health.csv')
.then(data => {

    // ====================================================
    // DEBUG
    // ====================================================

    console.log(data[0]);

    // ====================================================
    // MAP DATASET
    // ====================================================

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
            String(d.withdrawal_symptoms)
                .trim()
                .toUpperCase(),

        isolation:
            +d.social_isolation_score,

        sleep:
            +d.sleep_hours,

        spending:
            +d.monthly_game_spending_usd,

        age:
            +d.age,

        // =========================================
        // VARIABLES PARA FILTROS
        // =========================================

        continued:
            String(d.continued_despite_problems)
                .trim()
                .toUpperCase(),

        loss:
            String(d.loss_of_other_interests)
                .trim()
                .toUpperCase()

    }));

    // ====================================================
    // DATASET FILTRADO INICIAL
    // ====================================================

    filteredDataset = [...dataset];

    // ====================================================
    // DEBUG
    // ====================================================

    console.log(dataset);

    console.log(
        buildRiskData(filteredDataset)
    );

    console.log(
        buildPlatformData(filteredDataset)
    );

    // ====================================================
    // RENDER
    // ====================================================

    renderKPIs();

    renderOverview();

});

function buildRiskData(dataSource) {

    const counts = d3.rollup(
        dataSource,
        v => v.length,
        d => d.risk
    );

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

function buildPlatformData(dataSource){

    const counts = d3.rollup(

        dataSource,

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

const clusterVars = [

    'Gaming Hours',

    'Isolation',

    'Social Hours',

    'Withdrawal',

    'Spending'
];
const clusterData = [

    {
        name:
            'Balanced Social Player',

        short:
            'Cluster 0',

        color:'#10b981',

        values:[
            4.14,
            2.50,
            10.01,
            0.00,
            51.36
        ]
    },

    {
        name:
            'Moderate Risk Player',

        short:
            'Cluster 1',

        color:'#eab308',

        values:[
            7.53,
            4.78,
            5.97,
            0.60,
            91.18
        ]
    },

    {
        name:
            'Veteran Stable Player',

        short:
            'Cluster 2',

        color:'#f97316',

        values:[
            4.16,
            2.60,
            10.34,
            0.01,
            52.31
        ]
    },

    {
        name:
            'Severe Addiction Player',

        short:
            'Cluster 3',

        color:'#ef4444',

        values:[
            10.71,
            6.96,
            2.13,
            0.73,
            319.02
        ]
    }
];

document

    .querySelectorAll('.cluster-btn')

    .forEach(btn=>{

        btn.addEventListener('click',()=>{

            const id =
                +btn.dataset.cluster;

            if(activeClusters.includes(id)){

                activeClusters =
                    activeClusters.filter(
                        d => d !== id
                    );

                btn.classList.remove('active');

            }else{

                activeClusters.push(id);

                btn.classList.add('active');
            }

            // evitar vacío

            if(activeClusters.length===0){

                activeClusters=[id];

                btn.classList.add('active');
            }

            renderClusterRadar();
        });
    });

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
        buildRiskData(filteredDataset)
    );

    renderHistogram(
        '#chart-hours-dist',
        filteredDataset
    );

    renderIsolationHistogram(
        '#chart-genre',
        filteredDataset
    );

    renderDonut(
        '#chart-platform',
        buildPlatformData(filteredDataset)
    );

    renderAgeDistribution(
        filteredDataset
    );

    renderSpendingDistribution(
        filteredDataset
    );
}

// ========================================================
// OPEN FILTER MENU
// ========================================================

document
    .getElementById('filter-toggle-btn')

    .addEventListener('click', () => {

        document
            .getElementById('overview-filter-panel')
            .classList
            .toggle('hidden');

    });


// ========================================================
// SELECT ALL
// ========================================================

// ========================================================
// SELECT ALL
// ========================================================

function setupSelectAll(

    selectAllClass,

    itemClass

){

    const selectAll =

        document.querySelector(
            `.${selectAllClass}`
        );

    const items =

        document.querySelectorAll(
            `.${itemClass}`
        );

    if(!selectAll) return;

    // ====================================================
    // SELECT / DESELECT ALL
    // ====================================================

    selectAll.addEventListener('change', () => {

        items.forEach(item => {

            item.checked =
                selectAll.checked;
        });

        applyFilters();
    });

    // ====================================================
    // UPDATE SELECT ALL STATUS
    // ====================================================

    items.forEach(item => {

        item.addEventListener('change', () => {

            const allChecked =

                [...items].every(
                    i => i.checked
                );

            selectAll.checked =
                allChecked;

            applyFilters();
        });
    });
}

// ========================================================
// FILTER DATA
// ========================================================

function getFilteredData(){

    // ====================================================
    // SELECTED VALUES
    // ====================================================

    const selectedRisk =

        [...document.querySelectorAll('.risk-filter:checked')]

            .map(d => d.value);

    const selectedWithdrawal =

        [...document.querySelectorAll('.withdrawal-filter:checked')]

            .map(d => d.value);

    const selectedContinued =

        [...document.querySelectorAll('.continued-filter:checked')]

            .map(d => d.value);

    const selectedLoss =

        [...document.querySelectorAll('.loss-filter:checked')]

            .map(d => d.value);

    const selectedAges =

        [...document.querySelectorAll('.age-filter:checked')]

            .map(d => d.value);

    const selectedHours =

        [...document.querySelectorAll('.hours-filter:checked')]

            .map(d => d.value);

    // ====================================================
    // FILTER LOGIC
    // ====================================================

    return dataset.filter(d => {

        // ================================================
        // AGE MATCH
        // ================================================

        let ageMatch = false;

        selectedAges.forEach(range => {

            const [min,max] =

                range
                    .split('-')
                    .map(Number);

            if(

                d.age >= min

                &&

                d.age <= max

            ){

                ageMatch = true;
            }
        });

        // ================================================
        // HOURS MATCH
        // ================================================

        let hoursMatch = false;

        selectedHours.forEach(range => {

            const [min,max] =

                range
                    .split('-')
                    .map(Number);

            if(

                d.hours >= min

                &&

                d.hours <= max

            ){

                hoursMatch = true;
            }
        });

        // ================================================
        // EMPTY FILTERS = SHOW ALL
        // ================================================

        const riskOk =

            selectedRisk.length === 0

            ||

            selectedRisk.includes(d.risk);

        const withdrawalOk =

            selectedWithdrawal.length === 0

            ||

            selectedWithdrawal.includes(d.withdrawal);

        const continuedOk =

            selectedContinued.length === 0

            ||

            selectedContinued.includes(d.continued);

        const lossOk =

            selectedLoss.length === 0

            ||

            selectedLoss.includes(d.loss);

        const ageOk =

            selectedAges.length === 0

            ||

            ageMatch;

        const hoursOk =

            selectedHours.length === 0

            ||

            hoursMatch;

        // ================================================
        // FINAL RETURN
        // ================================================

        return (

            riskOk

            &&

            withdrawalOk

            &&

            continuedOk

            &&

            lossOk

            &&

            ageOk

            &&

            hoursOk
        );

    });
}
// ========================================================
// APPLY FILTERS
// ========================================================

function applyFilters(){

    filteredDataset = getFilteredData();
    console.log('FILTERED:', filteredDataset.length);

    console.log(filteredDataset);

    renderOverview();
}

// ========================================================
// EVENTS
// ========================================================

document

    .querySelectorAll(
        '.risk-filter, .withdrawal-filter, .continued-filter, .loss-filter, .age-filter, .hours-filter'
    )

    .forEach(input => {

        input.addEventListener(
            'change',
            applyFilters
        );

    });


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


function renderAgeDistribution(dataSource) {

    const container = '#chart-age-dist';

    d3.select(container).html('');

    const el = document.querySelector(container);

    if (!el) return;

    // =====================================================
    // DIMENSIONES
    // =====================================================

    const width = el.clientWidth;
    const height = el.clientHeight;

    const margin = {
        top: 20,
        right: 20,
        bottom: 45,
        left: 50
    };

    const svg = d3.select(container)

        .append('svg')

        .attr('viewBox', `0 0 ${width} ${height}`)

        .style('width', '100%')

        .style('height', '100%');

    const chartWidth =
        width - margin.left - margin.right;

    const chartHeight =
        height - margin.top - margin.bottom;

    const g = svg.append('g')

        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    // =====================================================
    // DATA
    // =====================================================

    const counts = d3.rollup(

        dataSource,

        v => v.length,

        d => d.age
    );

    const data = Array.from(

        counts,

        ([age, value]) => ({

            age: +age,

            value

        })

    ).sort((a,b) => a.age - b.age);

    // =====================================================
    // VALIDACIÓN
    // =====================================================

    if (!data.length) {

        g.append('text')

            .attr('x', chartWidth / 2)

            .attr('y', chartHeight / 2)

            .attr('text-anchor', 'middle')

            .attr('fill', '#94a3b8')

            .style('font-size', '14px')

            .style('font-weight', '600')

            .text('No data available');

        return;
    }

    // =====================================================
    // ESCALAS
    // =====================================================

    const x = d3.scaleBand()

        .domain(data.map(d => d.age))

        .range([0, chartWidth])

        .padding(0.08);

    const y = d3.scaleLinear()

        .domain([

            0,

            d3.max(data, d => d.value) * 1.1

        ])

        .nice()

        .range([chartHeight, 0]);

    // =====================================================
    // GRID
    // =====================================================

    g.append('g')

        .attr('class', 'grid')

        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chartWidth)
                .tickFormat('')
        )

        .selectAll('line')

        .attr('stroke', '#edf2f7');

    g.select('.domain').remove();

    // =====================================================
    // AXIS X
    // =====================================================

    g.append('g')

        .attr(
            'transform',
            `translate(0,${chartHeight})`
        )

        .call(

            d3.axisBottom(x)

                .tickValues(

                    data

                        .map(d => d.age)

                        .filter((d, i) => i % 2 === 0)
                )
        )

        .selectAll('text')

        .style('font-size', '11px')

        .style('font-weight', '600');

    // =====================================================
    // AXIS Y
    // =====================================================

    g.append('g')

        .call(
            d3.axisLeft(y)
                .ticks(5)
        );

    // =====================================================
    // BARRAS
    // =====================================================

    g.selectAll('rect')

        .data(data)

        .enter()

        .append('rect')

        .attr(
            'x',
            d => x(d.age)
        )

        .attr(
            'width',
            x.bandwidth()
        )

        .attr('y', chartHeight)

        .attr('height', 0)

        .attr('rx', 3)

        .attr('fill', '#3b82f6')

        .style('cursor', 'pointer')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `
                Age ${d.age}
                <br>
                <b>${d.value} players</b>
                `
            );

        })

        .on('mouseout', hideTip)

        .transition()

        .duration(900)

        .delay((d, i) => i * 40)

        .attr(
            'y',
            d => y(d.value)
        )

        .attr(
            'height',
            d => chartHeight - y(d.value)
        );

    // =====================================================
    // TITULO X
    // =====================================================

    g.append('text')

        .attr('x', chartWidth / 2)

        .attr('y', chartHeight + 38)

        .attr('text-anchor', 'middle')

        .attr('fill', '#64748b')

        .attr('font-size', '12px')

        .attr('font-weight', '600')

        .text('Player Age');

    // =====================================================
    // TITULO Y
    // =====================================================

    g.append('text')

        .attr(
            'transform',
            'rotate(-90)'
        )

        .attr('x', -chartHeight / 2)

        .attr('y', -35)

        .attr('text-anchor', 'middle')

        .attr('fill', '#64748b')

        .attr('font-size', '12px')

        .attr('font-weight', '600')

        .text('Players');
}

function renderSpendingDistribution(dataSource) {

    const container = '#chart-spending-dist';

    d3.select(container).html('');

    const el = document.querySelector(container);

    if (!el) return;

    // =====================================================
    // DIMENSIONES
    // =====================================================

    const width = el.clientWidth;
    const height = el.clientHeight;

    const margin = {
        top: 20,
        right: 20,
        bottom: 45,
        left: 50
    };

    const svg = d3.select(container)

        .append('svg')

        .attr('viewBox', `0 0 ${width} ${height}`)

        .style('width', '100%')

        .style('height', '100%');

    const chartWidth =
        width - margin.left - margin.right;

    const chartHeight =
        height - margin.top - margin.bottom;

    const g = svg.append('g')

        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    // =====================================================
    // DATA
    // =====================================================

    const spendingValues = dataSource

        .map(d => d.spending)

        .filter(d => !isNaN(d));

    // =====================================================
    // VALIDACIÓN
    // =====================================================

    if (!spendingValues.length) {

        g.append('text')

            .attr('x', chartWidth / 2)

            .attr('y', chartHeight / 2)

            .attr('text-anchor', 'middle')

            .attr('fill', '#94a3b8')

            .style('font-size', '14px')

            .style('font-weight', '600')

            .text('No data available');

        return;
    }

    // =====================================================
    // HISTOGRAM
    // =====================================================

    const histogram = d3.bin()

        .domain(d3.extent(spendingValues))

        .thresholds(10);

    const bins = histogram(spendingValues);

    const processedData = bins.map(d => ({

        x:
            Math.round((d.x0 + d.x1) / 2),

        y:
            d.length

    }));

    // =====================================================
    // ESCALAS
    // =====================================================

    const x = d3.scaleLinear()

        .domain([

            d3.min(processedData, d => d.x) - 15,

            d3.max(processedData, d => d.x) + 15

        ])

        .range([0, chartWidth]);

    const y = d3.scaleLinear()

        .domain([

            0,

            d3.max(processedData, d => d.y) * 1.15

        ])

        .nice()

        .range([chartHeight, 0]);

    // =====================================================
    // GRID
    // =====================================================

    g.append('g')

        .attr('class', 'grid')

        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickSize(-chartWidth)
                .tickFormat('')
        )

        .selectAll('line')

        .attr('stroke', '#e2e8f0');

    g.select('.domain').remove();

    // =====================================================
    // AXIS
    // =====================================================

    g.append('g')

        .attr(
            'transform',
            `translate(0,${chartHeight})`
        )

        .call(
            d3.axisBottom(x)
                .ticks(8)
                .tickFormat(d => `$${d}`)
        );

    g.append('g')

        .call(
            d3.axisLeft(y)
                .ticks(5)
        );

    // =====================================================
    // AREA
    // =====================================================

    const area = d3.area()

        .x(d => x(d.x))

        .y0(chartHeight)

        .y1(d => y(d.y))

        .curve(d3.curveMonotoneX);

    g.append('path')

        .datum(processedData)

        .attr('fill', 'rgba(139,92,246,.22)')

        .attr('d', area);

    // =====================================================
    // LINE
    // =====================================================

    const line = d3.line()

        .x(d => x(d.x))

        .y(d => y(d.y))

        .curve(d3.curveMonotoneX);

    g.append('path')

        .datum(processedData)

        .attr('fill', 'none')

        .attr('stroke', '#8b5cf6')

        .attr('stroke-width', 4)

        .attr('d', line);

    // =====================================================
    // DOTS
    // =====================================================

    g.selectAll('.dot')

        .data(processedData)

        .enter()

        .append('circle')

        .attr('cx', d => x(d.x))

        .attr('cy', d => y(d.y))

        .attr('r', 5.5)

        .attr('fill', '#8b5cf6')

        .style('cursor', 'pointer')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `
                Spending ≈ $${d.x}
                <br>
                <b>${d.y} players</b>
                `
            );

        })

        .on('mouseout', hideTip);

    // =====================================================
    // LABELS
    // =====================================================

    g.selectAll('.value-label')

        .data(processedData)

        .enter()

        .append('text')

        .attr('x', (d, i) => {

            if(i === 0){
                return x(d.x) + 12;
            }

            return x(d.x);
        })

        .attr('y', d => y(d.y) - 10)

        .attr('text-anchor', 'middle')

        .attr('fill', '#475569')

        .style('font-size', '10px')

        .style('font-weight', '700')

        .text(d => d.y);

    // =====================================================
    // TITULOS
    // =====================================================

    svg.append('text')

        .attr('x', width / 2)

        .attr('y', height - 3)

        .attr('text-anchor', 'middle')

        .attr('fill', 'var(--text2)')

        .style('font-size', '11px')

        .style('font-weight', '700')

        .text('Monthly Spending (USD)');

    svg.append('text')

        .attr('transform', 'rotate(-90)')

        .attr('x', -height / 2)

        .attr('y', 15)

        .attr('text-anchor', 'middle')

        .attr('fill', 'var(--text2)')

        .style('font-size', '11px')

        .style('font-weight', '700')

        .text('Players');
}

function renderBarChart(container, data) {

    d3.select(container).html('');

    const containerElement =
        document.querySelector(container);

    if (!containerElement) return;

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

        .attr(
            'viewBox',
            `0 0 ${width} ${height}`
        )

        .attr(
            'preserveAspectRatio',
            'xMidYMid meet'
        )

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
    // VALIDACIÓN
    // ====================================================

    if (!data || !data.length) {

        chart.append('text')

            .attr('x', chartWidth / 2)

            .attr('y', chartHeight / 2)

            .attr('text-anchor', 'middle')

            .attr('fill', '#94a3b8')

            .style('font-size', '14px')

            .style('font-weight', '600')

            .text('No data available');

        return;
    }

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleBand()

        .domain(data.map(d => d.label))

        .range([0, chartWidth])

        .padding(0.18);

    const y = d3.scaleLinear()

        .domain([
            0,
            d3.max(data, d => d.value) * 1.12
        ])

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
    // AXIS X
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

    // ====================================================
    // AXIS Y
    // ====================================================

    chart.append('g')

        .attr('class', 'axis')

        .call(
            d3.axisLeft(y)
                .ticks(5)
        );

    // ====================================================
    // COLORS
    // ====================================================

    const colors = {

        Low: '#10b981',

        Moderate: '#e4d830',

        High: '#f56a33',

        Severe: '#fa2828'
    };

    // ====================================================
    // SHADOW
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
    // BARS
    // ====================================================

    const bars = chart.selectAll('.bar')

        .data(data)

        .enter()

        .append('rect')

        .attr(
            'x',
            d => x(d.label)
        )

        .attr(
            'y',
            chartHeight
        )

        .attr(
            'width',
            x.bandwidth()
        )

        .attr('height', 0)

        .attr('rx', 12)

        .attr(
            'fill',
            d => colors[d.label] || '#3b82f6'
        )

        .style(
            'filter',
            'url(#shadow)'
        )

        .style('cursor', 'pointer')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `
                ${d.label}
                <br>
                <b>${d.value} jugadores</b>
                `
            );

        })

        .on('mouseout', hideTip);

    // ====================================================
    // ANIMATION
    // ====================================================

    bars.transition()

        .duration(1200)

        .ease(d3.easeCubicOut)

        .attr(
            'y',
            d => y(d.value)
        )

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
            d => x(d.label) + x.bandwidth()/2
        )

        .attr(
            'y',
            d => y(d.value) - 12
        )

        .attr('text-anchor', 'middle')

        .attr('fill', '#0f172a')

        .attr('font-size', 12)

        .attr('font-weight', 700)

        .style('opacity', 0)

        .text(d => d.value)

        .transition()

        .delay(700)

        .duration(600)

        .style('opacity', 1);
}

function renderHistogram(selector, data) {

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
    // HISTOGRAMA
    // ====================================================

    const bins = d3.bin()

        .domain([0, 15])

        .thresholds(30)

        (
            data
                .map(d => d.hours)
                .filter(d => !isNaN(d))
        );

    const processedData = bins.map(bin => ({

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

        .domain([
            0,
            d3.max(
                processedData,
                d => d.value
            ) * 1.1
        ])

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
    // AREA
    // ====================================================

    const area = d3.area()

        .x(d => x(d.hour))

        .y0(h)

        .y1(d => y(d.value))

        .curve(
            d3.curveCatmullRom.alpha(0.5)
        );

    g.append('path')

        .datum(processedData)

        .attr(
            'fill',
            'rgba(99,179,237,0.22)'
        )

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

        .curve(
            d3.curveCatmullRom.alpha(0.5)
        );

    const path = g.append('path')

        .datum(processedData)

        .attr('fill', 'none')

        .attr('stroke', '#63b3ed')

        .attr('stroke-width', 4)

        .attr('stroke-linecap', 'round')

        .attr('d', line);

    // ====================================================
    // ANIMACIÓN LINEA
    // ====================================================

    const totalLength =
        path.node().getTotalLength();

    path

        .attr(
            'stroke-dasharray',
            totalLength
        )

        .attr(
            'stroke-dashoffset',
            totalLength
        )

        .transition()

        .duration(1400)

        .ease(d3.easeCubicOut)

        .attr(
            'stroke-dashoffset',
            0
        );

    // ====================================================
    // PUNTOS
    // ====================================================

    g.selectAll('.dot')

        .data(processedData)

        .enter()

        .append('circle')

        .attr(
            'cx',
            d => x(d.hour)
        )

        .attr(
            'cy',
            d => y(d.value)
        )

        .attr('r', 0)

        .attr('fill', '#63b3ed')

        .style('cursor', 'pointer')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `
                ${d.hour.toFixed(1)}h
                <br>
                <b>${d.value} jugadores</b>
                `
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

        .attr(
            'transform',
            'rotate(-90)'
        )

        .attr('x', -h / 2)

        .attr('y', -32)

        .attr('text-anchor', 'middle')

        .attr('fill', '#64748b')

        .attr('font-size', '13px')

        .attr('font-weight', '600')

        .text('Jugadores');
}

function renderIsolationHistogram(selector, dataSource) {

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
    // DATA
    // ====================================================

    const counts = d3.rollup(

        dataSource,

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
    // VALIDACIÓN
    // ====================================================

    if (!data.length) {

        const svg = d3.select(selector)

            .append('svg')

            .attr('viewBox', `0 0 ${W} ${H}`);

        svg.append('text')

            .attr('x', W / 2)

            .attr('y', H / 2)

            .attr('text-anchor', 'middle')

            .attr('fill', '#94a3b8')

            .style('font-size', '14px')

            .style('font-weight', '600')

            .text('No data available');

        return;
    }

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

        .domain([
            0,
            d3.max(data, d => d.value) * 1.1
        ])

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
    // AXIS X
    // ====================================================

    g.append('g')

        .attr('class', 'axis')

        .attr(
            'transform',
            `translate(0,${h})`
        )

        .call(d3.axisBottom(x));

    // ====================================================
    // AXIS Y
    // ====================================================

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

        .attr(
            'x',
            d => x(d.score)
        )

        .attr(
            'width',
            x.bandwidth()
        )

        .attr('y', h)

        .attr('height', 0)

        .attr('rx', 4)

        .attr('fill', '#63b3ed')

        .style('cursor', 'pointer')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `
                Score ${d.score}
                <br>
                <b>${d.value} jugadores</b>
                `
            );

        })

        .on('mouseout', hideTip)

        .transition()

        .duration(900)

        .delay((d, i) => i * 60)

        .attr(
            'y',
            d => y(d.value)
        )

        .attr(
            'height',
            d => h - y(d.value)
        );

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

        .attr(
            'transform',
            'rotate(-90)'
        )

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

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.offsetWidth || 400;
    const H = el.offsetHeight || 220;

    const m = {
        top: 15,
        right: 65,
        bottom: 20,
        left: 110
    };

    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

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
    // VALIDACIÓN
    // ====================================================

    if (!data || !data.length) {

        g.append('text')

            .attr('x', w / 2)

            .attr('y', h / 2)

            .attr('text-anchor', 'middle')

            .attr('fill', '#94a3b8')

            .style('font-size', '14px')

            .style('font-weight', '600')

            .text('No data available');

        return;
    }

    // ====================================================
    // ESCALAS
    // ====================================================

    const y = d3.scaleBand()

        .domain(data.map(d => d.label))

        .range([0, h])

        .padding(0.28);

    const x = d3.scaleLinear()

        .domain([
            0,
            d3.max(data, d => d.value) * 1.2
        ])

        .range([0, w]);

    // ====================================================
    // GRID
    // ====================================================

    g.append('g')

        .attr('class', 'grid')

        .call(
            d3.axisBottom(x)
                .ticks(5)
                .tickSize(h)
                .tickFormat('')
        )

        .selectAll('line')

        .attr('stroke', '#edf2f7');

    // ====================================================
    // AXIS Y
    // ====================================================

    g.append('g')

        .attr('class', 'axis')

        .call(d3.axisLeft(y))

        .selectAll('text')

        .style('font-size', '12px')

        .style('font-weight', '600');

    // ====================================================
    // SOMBRA
    // ====================================================

    const defs = svg.append('defs');

    const filter = defs.append('filter')

        .attr('id', 'shadow-hbar');

    filter.append('feDropShadow')

        .attr('dx', 0)

        .attr('dy', 3)

        .attr('stdDeviation', 5)

        .attr('flood-opacity', 0.14);

    // ====================================================
    // BARRAS
    // ====================================================

    g.selectAll('rect')

        .data(data)

        .enter()

        .append('rect')

        .attr(
            'y',
            d => y(d.label)
        )

        .attr(
            'height',
            y.bandwidth()
        )

        .attr('x', 0)

        .attr('width', 0)

        .attr('fill', color)

        .attr('rx', 6)

        .style(
            'filter',
            'url(#shadow-hbar)'
        )

        .style('cursor', 'pointer')

        .on('mousemove', (e, d) => {

            showTip(
                e,
                `
                ${d.label}
                <br>
                <b>${d.value}</b>
                `
            );

        })

        .on('mouseout', hideTip)

        .transition()

        .duration(900)

        .delay((d, i) => i * 70)

        .ease(d3.easeCubicOut)

        .attr(
            'width',
            d => x(d.value)
        );

    // ====================================================
    // LABELS
    // ====================================================

    g.selectAll('.lbl')

        .data(data)

        .enter()

        .append('text')

        .attr('class', 'lbl')

        .attr(
            'y',
            d => y(d.label) + y.bandwidth()/2 + 4
        )

        .attr(
            'x',
            d => x(d.value) + 8
        )

        .attr('fill', '#475569')

        .attr('font-size', 11)

        .attr('font-weight', 700)

        .style('opacity', 0)

        .text(d => d.value)

        .transition()

        .delay((d, i) => 500 + i * 70)

        .duration(400)

        .style('opacity', 1);
}

function renderDonut(selector, data) {

    const el = document.querySelector(selector);

    if (!el) return;

    el.innerHTML = '';

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.offsetWidth || 400;
    const H = el.offsetHeight || 220;

    const r =
        Math.min(W, H) / 2 - 12;

    // ====================================================
    // VALIDACIÓN
    // ====================================================

    if (!data || !data.length) {

        const svg = d3.select(selector)

            .append('svg')

            .attr('viewBox', `0 0 ${W} ${H}`);

        svg.append('text')

            .attr('x', W / 2)

            .attr('y', H / 2)

            .attr('text-anchor', 'middle')

            .attr('fill', '#94a3b8')

            .style('font-size', '14px')

            .style('font-weight', '600')

            .text('No data available');

        return;
    }

    // ====================================================
    // COLORS
    // ====================================================

    const colors = [

        '#63b3ed',

        '#68d391',

        '#f6ad55',

        '#b794f4',

        '#fc8181',

        '#4fd1c5'
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
            `translate(${W * 0.35},${H / 2})`
        );

    // ====================================================
    // PIE
    // ====================================================

    const pie = d3.pie()

        .value(d => d.value)

        .sort(null);

    const pieData = pie(data);

    // ====================================================
    // ARC
    // ====================================================

    const arc = d3.arc()

        .innerRadius(r * 0.55)

        .outerRadius(r);

    // ====================================================
    // SHADOW
    // ====================================================

    const defs = svg.append('defs');

    const filter = defs.append('filter')

        .attr('id', 'shadow-donut');

    filter.append('feDropShadow')

        .attr('dx', 0)

        .attr('dy', 3)

        .attr('stdDeviation', 5)

        .attr('flood-opacity', 0.15);

    // ====================================================
    // DONUT
    // ====================================================

    g.selectAll('path')

        .data(pieData)

        .join('path')

        .attr(
            'fill',
            (d, i) => colors[i % colors.length]
        )

        .attr('stroke', 'white')

        .attr('stroke-width', 2)

        .style(
            'filter',
            'url(#shadow-donut)'
        )

        .style('cursor', 'pointer')

        .on('mousemove', (e, d) => {

            const total =
                d3.sum(data, item => item.value);

            const pct =
                ((d.data.value / total) * 100)
                    .toFixed(1);

            showTip(
                e,
                `
                ${d.data.label}
                <br>
                <b>${d.data.value}</b>
                (${pct}%)
                `
            );

        })

        .on('mouseout', hideTip)

        .transition()

        .duration(900)

        .delay((d, i) => i * 120)

        .attrTween('d', function(d){

            const i = d3.interpolate(
                {
                    startAngle: 0,
                    endAngle: 0
                },
                d
            );

            return t => arc(i(t));
        });

    // ====================================================
    // PERCENT LABELS
    // ====================================================

    const labelArc = d3.arc()

        .innerRadius(r * 0.78)

        .outerRadius(r * 0.78);

    g.selectAll('.percent-label')

        .data(pieData)

        .join('text')

        .attr('class', 'percent-label')

        .attr(
            'transform',
            d => `
                translate(${labelArc.centroid(d)})
            `
        )

        .attr('text-anchor', 'middle')

        .attr('dominant-baseline', 'middle')

        .attr('fill', '#1e293b')

        .attr('font-size', 10)

        .attr('font-weight', 700)

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

    // ====================================================
    // CENTER LABEL
    // ====================================================

    g.append('text')

        .attr('text-anchor', 'middle')

        .attr('y', -4)

        .attr('fill', '#0f172a')

        .style('font-size', '24px')

        .style('font-weight', '800')

        .text(
            d3.sum(data, d => d.value)
        );

    g.append('text')

        .attr('text-anchor', 'middle')

        .attr('y', 16)

        .attr('fill', '#64748b')

        .style('font-size', '11px')

        .style('font-weight', '600')

        .text('Players');

    // ====================================================
    // LEGEND
    // ====================================================

    const legend = svg.append('g')

        .attr(
            'transform',
            `translate(${W * 0.62}, ${H / 2 - 45})`
        );

    data.forEach((d, i) => {

        const row = legend.append('g')

            .attr(
                'transform',
                `translate(0,${i * 24})`
            );

        row.append('rect')

            .attr('width', 12)

            .attr('height', 12)

            .attr('fill', colors[i % colors.length])

            .attr('rx', 3);

        row.append('text')

            .attr('x', 18)

            .attr('y', 10)

            .attr('fill', 'var(--text2)')

            .attr('font-size', 11)

            .attr('font-weight', 600)

            .text(`${d.label} (${d.value})`);
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
        isPreview ? 200 : 520;

const margin = {
    top: 12,
    right: 25,
    bottom: 45,
    left: 95
};

    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    // ====================================================
    // SVG
    // ====================================================

    const svg = d3.select(selector)

        .append('svg')

        .attr('viewBox', `0 0 ${W} ${H}`)

        .style('width','100%')

        .style('height','auto');

    const g = svg.append('g')

        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    // ====================================================
    // DATA
    // ====================================================

    const levels = d3.range(1,11);

    const processed = levels.map(level => {

        const rows = dataset.filter(
            d => +d.isolation === level
        );

        return {

            level,

            avgHours:
                d3.mean(rows, d => d.hours),

            count:
                rows.length
        };
    });

    // ====================================================
    // ESCALAS
    // ====================================================

    const x = d3.scaleBand()

        .domain(levels)

        .range([0,w])

        .padding(0.18);

    const y = d3.scaleLinear()

        .domain([
            0,
            d3.max(
                processed,
                d => d.avgHours
            ) * 1.15
        ])

        .nice()

        .range([h,0]);

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

        .attr('stroke','#dbe4ee');

    g.select('.grid .domain')
        .remove();

    // ====================================================
    // AXIS
    // ====================================================

    const xAxis = g.append('g')

        .attr(
            'transform',
            `translate(0,${h})`
        )

        .call(d3.axisBottom(x));

    const yAxis = g.append('g')

        .call(
            d3.axisLeft(y)
            .ticks(6)
        );

    // ====================================================
    // AXIS STYLE
    // ====================================================

    xAxis.selectAll('text')

        .attr('fill','#475569')

        .attr(
            'font-size',
            isPreview ? 10 : 13
        )

        .attr('font-weight',500);

    yAxis.selectAll('text')

        .attr('fill','#475569')

        .attr(
            'font-size',
            isPreview ? 10 : 13
        );

    xAxis.selectAll('path,line')
        .attr('stroke','#64748b');

    yAxis.selectAll('path,line')
        .attr('stroke','#64748b');

    // ====================================================
    // COLOR SCALE
    // ====================================================

    const colors = [

        '#10b981',
        '#22c55e',
        '#4ade80',
        '#65a30d',
        '#a3a34d',

        '#b08968',
        '#c97b63',
        '#d97757',
        '#ef4444',
        '#f94144'
    ];

    // ====================================================
    // BARRAS
    // ====================================================

    g.selectAll('.bar')

        .data(processed)

        .join('rect')

        .attr(
            'x',
            d => x(d.level)
        )

        .attr(
            'width',
            x.bandwidth()
        )

        .attr('y', h)

        .attr('height', 0)

        .attr('rx',7)

        .attr(
            'fill',
            (d,i) => colors[i]
        )

        .transition()

        .duration(900)

        .ease(d3.easeCubicOut)

        .attr(
            'y',
            d => y(d.avgHours)
        )

        .attr(
            'height',
            d => h - y(d.avgHours)
        );

    // ====================================================
    // VALUE LABELS
    // ====================================================

    g.selectAll('.value-label')

        .data(processed)

        .join('text')

        .attr(
            'x',
            d =>
                x(d.level)
                + x.bandwidth()/2
        )

        .attr(
            'y',
            d =>
                y(d.avgHours) - 8
        )

        .attr('text-anchor','middle')

        .attr('fill','#475569')

        .attr(
            'font-size',

            isPreview ? 9 : 12
        )

        .attr('font-weight',700)

        .text(
            d =>
                d.avgHours
                ? d.avgHours.toFixed(1)
                : ''
        );

    // ====================================================
    // Y LABEL
    // ====================================================

    g.append('text')

    .attr(
        'transform',
        `rotate(-90)`
    )

    .attr(
        'x',
        -h / 2
    )

    .attr(
        'y',
        -85
    )

    .attr('text-anchor','middle')

    .attr('fill','#475569')

    .attr(
        'font-size',
        isPreview ? 11 : 14
    )

    .attr('font-weight',600)

    .text('Average Gaming Hours');

    // ====================================================
    // X LABEL
    // ====================================================

g.append('text')

    .attr(
        'x',
        w / 2
    )

    .attr(
        'y',
        h + 55
    )

    .attr('text-anchor','middle')

    .attr('fill','#475569')

    .attr(
        'font-size',
        isPreview ? 11 : 14
    )

    .attr('font-weight',600)

    .text('Social Isolation Score');
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
        isPreview ? 240 : 520;

    const margin = {
        top: 30,
        right: 35,
        bottom: 75,
        left: 95
    };

    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    // ====================================================
    // SVG
    // ====================================================

    const svg = d3.select(selector)

        .append('svg')

        .attr('viewBox', `0 0 ${W} ${H}`)

        .style('width','100%')

        .style('height','auto');

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
    // DATASET
    // ====================================================

    const processed = order.map(level => {

        const rows = dataset.filter(
            d => d.risk === level
        );

        return {

            level,

            no:
                rows.filter(
                    d => d.withdrawal === 'FALSE'
                ).length,

            yes:
                rows.filter(
                    d => d.withdrawal === 'TRUE'
                ).length
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
            d3.max(
                processed,
                d => Math.max(d.no, d.yes)
            ) * 1.12
        ])

        .nice()

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

        .attr('stroke','#dbe4ee');

    g.select('.grid .domain')
        .remove();

    // ====================================================
    // AXIS
    // ====================================================

    const xAxis = g.append('g')

        .attr(
            'transform',
            `translate(0,${h})`
        )

        .call(d3.axisBottom(x0));

    const yAxis = g.append('g')

        .call(
            d3.axisLeft(y)
            .ticks(6)
        );

    // ====================================================
    // AXIS STYLE
    // ====================================================

    xAxis.selectAll('text')

        .attr('fill','#475569')

        .attr(
            'font-size',
            isPreview ? 10 : 13
        )

        .attr('font-weight',500);

    yAxis.selectAll('text')

        .attr('fill','#475569')

        .attr(
            'font-size',
            isPreview ? 10 : 13
        );

    xAxis.selectAll('path,line')
        .attr('stroke','#64748b');

    yAxis.selectAll('path,line')
        .attr('stroke','#64748b');

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

            .attr('rx', 7)

            .attr(
                'fill',
                d => colors[d.key]
            )

            .on('mousemove', (e,d) => {

                showTip(
                    e,
                    `
                    <b>${group.level}</b><br>
                    ${d.key}: ${d.value} players
                    `
                );
            })

            .on('mouseout', hideTip)

            .transition()

            .duration(900)

            .ease(d3.easeCubicOut)

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
    // LABELS ENCIMA DE BARRAS
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

        g.selectAll(`.label-${group.level}`)

            .data(values)

            .join('text')

            .attr(
                'x',
                d =>
                    x0(group.level) +
                    x1(d.key) +
                    x1.bandwidth()/2
            )

            .attr(
                'y',
                d =>
                    y(d.value) - 8
            )

            .attr('text-anchor','middle')

            .attr('fill','#1e293b')

            .attr(
                'font-size',

                isPreview ? 9 : 12
            )

            .attr('font-weight',700)

            .text(d => d.value);
    });

    // ====================================================
    // Y LABEL
    // ====================================================

    g.append('text')

        .attr(
            'transform',
            'rotate(-90)'
        )

        .attr(
            'x',
            -(h / 2) + 12
        )

        .attr(
            'y',
            -65
        )

        .attr('text-anchor','middle')

        .attr('fill','#475569')

        .attr(
            'font-size',
            isPreview ? 11 : 14
        )

        .attr('font-weight',600)

        .text('Number of Players');

    // ====================================================
    // X LABEL
    // ====================================================

    g.append('text')

        .attr(
            'x',
            w / 2
        )

        .attr(
            'y',
            h + 55
        )

        .attr('text-anchor','middle')

        .attr('fill','#475569')

        .attr(
            'font-size',
            isPreview ? 11 : 14
        )

        .attr('font-weight',600)

        .text('Addiction Risk Level');

    // ====================================================
    // LEYENDA
    // ====================================================

    const legendX = isPreview

        ? W - 200

        : W - 230;

    const legendY = isPreview

        ? 24

        : 24;

    const legend = svg.append('g')

        .attr(
            'transform',
            `translate(${legendX},${legendY})`
        );

    const legendData = [

        {
            label: 'Without Symptoms',
            color: '#60a5fa'
        },

        {
            label: 'With Symptoms',
            color: '#F3914F'
        }
    ];

    legendData.forEach((item, i) => {

        const row = legend.append('g')

            .attr(
                'transform',
                `translate(0,${i * 28})`
            );

        // CUADRADO

        row.append('rect')

            .attr(
                'width',

                isPreview ? 12 : 16
            )

            .attr(
                'height',

                isPreview ? 12 : 16
            )

            .attr('rx',4)

            .attr('y',-10)

            .attr('fill', item.color);

        // TEXTO

        row.append('text')

            .attr('x',22)

            .attr('y',2)

            .attr('fill','#475569')

            .attr(
                'font-size',

                isPreview ? 10 : 13
            )

            .attr('font-weight',600)

            .text(item.label);
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
    isPreview ? 210 : 572;

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

        // ================================================
// PUNTOS
// ================================================

if(!isPreview){

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
}

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
function renderObj2() { 
    renderClusterRadar(); 

}

function renderClusterRadar(){

    const el =
        document.getElementById(
            'chart-clusters'
        );

    if(!el) return;

    el.innerHTML = '';

    // ====================================================
    // DIMENSIONES
    // ====================================================

    const W = el.clientWidth || 700;

    const H = 520;

    const svg = d3.select('#chart-clusters')

        .append('svg')

        .attr(
            'viewBox',
            `0 0 ${W} ${H}`
        );

    const centerX = W / 2;
    const centerY = H / 2 - 20;

    const radius = 170;

    // ====================================================
    // VARIABLES
    // ====================================================

    const axes = [

        'Gaming Hours',

        'Isolation',

        'Social Hours',

        'Withdrawal',

        'Spending'
    ];

    // ====================================================
    // NORMALIZACIÓN
    // ====================================================

    const maxValues = [

        12,
        10,
        12,
        1,
        350
    ];

    // ====================================================
    // GRID LEVELS
    // ====================================================

    const levels = 5;

    for(let level=1; level<=levels; level++){

        const r =
            radius * (level/levels);

        const points = axes.map((_,i)=>{

            const angle =
                (Math.PI*2/axes.length)*i
                - Math.PI/2;

            return [

                centerX +
                r * Math.cos(angle),

                centerY +
                r * Math.sin(angle)
            ];
        });

        svg.append('polygon')

            .attr(
                'points',
                points.map(
                    p => p.join(',')
                ).join(' ')
            )

            .attr('fill','none')

            .attr('stroke','#dbe4ee')

            .attr('stroke-width',1);
    }

    // ====================================================
    // AXES
    // ====================================================

    axes.forEach((axis,i)=>{

        const angle =
            (Math.PI*2/axes.length)*i
            - Math.PI/2;

        const x =
            centerX +
            radius * Math.cos(angle);

        const y =
            centerY +
            radius * Math.sin(angle);

        svg.append('line')

            .attr('x1',centerX)

            .attr('y1',centerY)

            .attr('x2',x)

            .attr('y2',y)

            .attr('stroke','#94a3b8')

            .attr('stroke-width',1.4);

        svg.append('text')

            .attr(
                'x',
                centerX +
                (radius+28)
                * Math.cos(angle)
            )

            .attr(
                'y',
                centerY +
                (radius+28)
                * Math.sin(angle)
            )

            .attr('text-anchor','middle')

            .attr('fill','#475569')

            .attr('font-size',13)

            .attr('font-weight',600)

            .text(axis);
    });

    // ====================================================
    // CLUSTERS
    // ====================================================

clusterData

    .filter((_,i)=>
        activeClusters.includes(i)
    )

    .forEach(cluster=>{

        const points =
            cluster.values.map((v,i)=>{

                const normalized =
                    v / maxValues[i];

                const angle =
                    (Math.PI*2/axes.length)*i
                    - Math.PI/2;

                return [

                    centerX +
                    radius *
                    normalized *
                    Math.cos(angle),

                    centerY +
                    radius *
                    normalized *
                    Math.sin(angle)
                ];
            });

        // AREA

        svg.append('polygon')

            .attr(
                'points',
                points.map(
                    p => p.join(',')
                ).join(' ')
            )

            .attr('fill',cluster.color)

            .attr('fill-opacity',0.18)

            .attr('stroke',cluster.color)

            .attr('stroke-width',3)

            .on('mousemove',(e)=>{

                showTip(
                    e,
                    `
                    <b>${cluster.name}</b>
                    `
                );
            })

            .on('mouseout',hideTip);

        // PUNTOS

        points.forEach(p=>{

            svg.append('circle')

                .attr('cx',p[0])

                .attr('cy',p[1])

                .attr('r',4)

                .attr('fill',cluster.color);
        });
    });

    // ====================================================
    // LEYENDA
    // ====================================================

    const legend = svg.append('g')

        .attr(
            'transform',
            `translate(40,${H-120})`
        );

    clusterData.forEach((c,i)=>{

        const row = legend.append('g')

            .attr(
                'transform',
                `translate(0,${i*26})`
            );

        row.append('rect')

            .attr('width',14)

            .attr('height',14)

            .attr('rx',3)

            .attr('fill',c.color);

        row.append('text')

            .attr('x',22)

            .attr('y',11)

            .attr('fill','#475569')

            .attr('font-size',12)

            .attr('font-weight',600)

            .text(c.name);
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


        modal.classList.remove('hidden');

        const analysis =
        document.getElementById(
        'chart-analysis'
        );

switch(type){

case 'violin':

    renderViolinPlot(
        '#dynamic-chart'
    );

    analysis.innerHTML = `

        <h3 class="analysis-title">
            Distribution of Daily Gaming Hours by Addiction Risk Level
        </h3>

        <p>
            The violin plot reveals a clear progressive pattern across the four addiction risk levels.
            The Low risk group (n=514) shows the widest distribution concentrated between 2 and 6 hours,
            with a median around 4 hours, indicating that most casual players maintain moderate gaming
            sessions.
        </p>

        <p>
            The Moderate risk group (n=190) shifts upward with a median near 6.5 hours and
            a broader spread toward higher values. The High risk group (n=154) continues the trend with
            a median around 8 hours and a distribution that stretches further into the upper range.
        </p>

        <p>
            The Severe risk group (n=142) presents the highest median at approximately 10 hours with a
            compact distribution concentrated in the upper range, suggesting that severe addiction is
            strongly associated with very high daily gaming hours.
        </p>

        <p>
            The overall pattern confirms that daily gaming hours increase progressively and consistently
            with addiction risk level.
        </p>

    `;

    break;

   case 'withdrawal':

    renderWithdrawalChart(
        '#dynamic-chart'
    );

    analysis.innerHTML = `

        <h3 class="analysis-title">
            Withdrawal Symptoms by Addiction Risk Level
        </h3>

        <p>
            The grouped bar chart highlights a striking contrast in withdrawal symptom prevalence
            across risk levels.
        </p>

        <p>
            In the Low risk group, 514 players report no symptoms while zero
            present withdrawal symptoms, establishing a clear baseline.
        </p>

        <p>
            As risk level increases, the proportion of players with symptoms grows substantially:
            in the Moderate group, 46 players show symptoms compared to 144 without.
        </p>

        <p>
            In the High group, 120 players present symptoms versus only 34 without,
            marking the first crossover point where symptomatic players outnumber non-symptomatic ones.
        </p>

        <p>
            In the Severe group, 122 players report symptoms against 20 without,
            reinforcing that withdrawal symptoms are a dominant characteristic of high and severe addiction profiles.
        </p>

    `;

    break;

    case 'boxplot':

    renderBoxplot(
        '#dynamic-chart'
    );

    analysis.innerHTML = `

        <h3 class="analysis-title">
            Social Isolation by Addiction Risk Level
        </h3>

        <p>
            The box plot demonstrates a consistent upward trend in social isolation scores as
            addiction risk increases.
        </p>

        <p>
            The Low risk group presents the lowest median at approximately 2,
            with a narrow interquartile range suggesting homogeneity within this group.
        </p>

        <p>
            The Moderate and High groups show progressively higher medians and
            increased dispersion toward upper isolation values.
        </p>

        <p>
            The Severe group presents the highest concentration of elevated social isolation scores,
            confirming that isolation is strongly associated with addiction severity.
        </p>

    `;

    break;

    case 'gamingIsolation':

    renderGamingIsolationBoxplot(
        '#dynamic-chart'
    );

    analysis.innerHTML = `

        <h3 class="analysis-title">
            Daily Gaming Hours by Social Isolation Level
        </h3>

        <p>
            The bar chart illustrates a clear and monotonic relationship between social isolation
            score and average daily gaming hours.
        </p>

        <p>
            Players reporting the lowest isolation score of 1 average only 2.5 hours of daily gaming,
            while those at the maximum isolation score of 10 average 13.3 hours per day.
        </p>

        <p>
            The progression remains remarkably consistent across all isolation levels,
            supporting a strong positive relationship between social isolation and gaming exposure.
        </p>

        <p>
            This represents one of the most linear and predictable behavioral relationships
            observed in the dataset.
        </p>

    `;

    break;
}
}

    document
    .getElementById('close-modal')

    .addEventListener('click', () => {

    document
        .getElementById('chart-modal')

        .classList.add('hidden');
    });
