// Scene navigation logic using D3.js
const totalScenes = 5;
let currentScene = 1;

function showScene(sceneNum) {
    // Select template areas
    const titleArea = d3.select('#scene-title');
    const vizArea = d3.select('#scene-viz');
    const annotationArea = d3.select('#scene-annotation');
    // Clear dynamic areas
    titleArea.html('');
    vizArea.html('');
    annotationArea.html('');

    if (sceneNum === 1) {
        titleArea.text('Work Life Balance vs Social Isolation');
        drawScatterPlotWithAnnotations(vizArea, annotationArea);
    } else if (sceneNum === 2) {
        titleArea.text('Work Life Balance vs Social Isolation (Colored by Gender)');
        drawScatterPlotByGender(vizArea, annotationArea);
    } else if (sceneNum === 3) {
        titleArea.text('Work Life Balance vs Social Isolation (Colored by Age)');
        drawScatterPlotByAge(vizArea, annotationArea);
    } else if (sceneNum === 4) {
        titleArea.text('Work Life Balance vs Social Isolation (Colored by Hours per Week)');
        drawScatterPlotByHours(vizArea, annotationArea);
    } else if (sceneNum === 5) {
        titleArea.text('Explore: Work Life Balance vs Social Isolation (Jittered, Filterable)');
        drawJitteredScatterplot(vizArea, annotationArea);
    } else if (sceneNum === 6) {
        titleArea.text('Data Overview');
        vizArea.append('svg').attr('width', 200).attr('height', 100)
            .append('circle')
            .attr('cx', 100).attr('cy', 50).attr('r', 40)
            .attr('fill', 'steelblue');
        annotationArea.text('Here we explore the dataset structure and key insights.');
    } else if (sceneNum === 7) {
        titleArea.text('Detailed Analysis');
        vizArea.append('svg').attr('width', 200).attr('height', 100)
            .append('rect')
            .attr('x', 50).attr('y', 20).attr('width', 100).attr('height', 60)
            .attr('fill', 'orange');
        annotationArea.text('Dive deeper into the patterns and relationships in the data.');
    }
    // Enable/disable prev/next buttons
    d3.select('#prev-btn').attr('disabled', sceneNum === 1 ? true : null);
    d3.select('#next-btn').attr('disabled', sceneNum === totalScenes ? true : null);
}

d3.select('#prev-btn').on('click', function() {
    if (currentScene > 1) {
        currentScene--;
        showScene(currentScene);
    }
});
d3.select('#next-btn').on('click', function() {
    if (currentScene < totalScenes) {
        currentScene++;
        showScene(currentScene);
    }
});

function drawStackedBarChart(container) {
    const svgWidth = 700;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv('post_pandemic_remote_work_health_impact_2025.csv').then(data => {
        const regions = Array.from(new Set(data.map(d => d.Region)));
        const arrangements = Array.from(new Set(data.map(d => d.Work_Arrangement)));
        const counts = {};
        regions.forEach(region => {
            counts[region] = {};
            arrangements.forEach(arr => { counts[region][arr] = 0; });
        });
        data.forEach(d => {
            if (counts[d.Region] && counts[d.Region][d.Work_Arrangement] !== undefined) {
                counts[d.Region][d.Work_Arrangement]++;
            }
        });
        const stackedData = regions.map(region => {
            const entry = {Region: region};
            arrangements.forEach(arr => { entry[arr] = counts[region][arr]; });
            return entry;
        });
        const stack = d3.stack().keys(arrangements);
        const series = stack(stackedData);
        const x = d3.scaleBand()
            .domain(regions)
            .range([0, width])
            .padding(0.2);
        const y = d3.scaleLinear()
            .domain([0, d3.max(stackedData, d => d3.sum(arrangements, arr => d[arr]))])
            .nice()
            .range([height, 0]);
        const color = d3.scaleOrdinal()
            .domain(arrangements)
            .range(d3.schemeSet2);
        svg.selectAll('g.layer')
            .data(series)
            .join('g')
            .attr('class', 'layer')
            .attr('fill', d => color(d.key))
            .selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('x', d => x(d.data.Region))
            .attr('y', d => y(d[1]))
            .attr('height', d => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth());
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end');
        svg.append('g')
            .call(d3.axisLeft(y));
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 100},0)`);
        arrangements.forEach((arr, i) => {
            legend.append('rect')
                .attr('x', 0)
                .attr('y', i * 22)
                .attr('width', 18)
                .attr('height', 18)
                .attr('fill', color(arr));
            legend.append('text')
                .attr('x', 26)
                .attr('y', i * 22 + 14)
                .text(arr)
                .attr('font-size', 14);
        });
    });
}

// Add new function for Scene 1 scatterplot
function drawScatterPlotWithAnnotations(container, annotationArea) {
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right; // keep plot area same, extra space for legend
    const height = svgHeight - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Helper to map salary range to numeric value
    function salaryToNum(s) {
        if (s.includes('40K-60K')) return 50;
        if (s.includes('60K-80K')) return 70;
        if (s.includes('80K-100K')) return 90;
        if (s.includes('100K-120K')) return 110;
        if (s.includes('120K+')) return 130;
        return 0;
    }

    d3.csv('post_pandemic_remote_work_health_impact_2025.csv').then(data => {
        // Parse numeric values
        data.forEach(d => {
            d.Work_Life_Balance_Score = +d.Work_Life_Balance_Score;
            d.Social_Isolation_Score = +d.Social_Isolation_Score;
            d.Salary_Num = salaryToNum(d.Salary_Range);
        });
        // Bin data by (Work_Life_Balance_Score, Social_Isolation_Score)
        const binMap = new Map();
        data.forEach(d => {
            const key = `${d.Work_Life_Balance_Score},${d.Social_Isolation_Score}`;
            if (!binMap.has(key)) {
                binMap.set(key, {count: 0, sumIncome: 0, x: d.Work_Life_Balance_Score, y: d.Social_Isolation_Score});
            }
            const bin = binMap.get(key);
            bin.count++;
            bin.sumIncome += d.Salary_Num;
        });
        const bins = Array.from(binMap.values()).map(bin => ({
            x: bin.x,
            y: bin.y,
            count: bin.count,
            avgIncome: bin.count > 0 ? bin.sumIncome / bin.count : 0
        }));
        // Axes
        const x = d3.scaleLinear()
            .domain([0, 5])
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, 5])
            .range([height, 0]);
        // Color scale for income
        const minIncome = 50;
        const maxIncome = 150;
        const color = d3.scaleLinear()
            .domain([minIncome, maxIncome])
            .range(["#4575b4", "#d73027"]); // blue to red
        // Size scale for count
        const countExtent = d3.extent(bins, d => d.count);
        const size = d3.scaleSqrt()
            .domain([countExtent[0], countExtent[1]])
            .range([6, 28]);
        // Axes rendering
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')));
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));
        // Axis labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Work Life Balance Score');
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Social Isolation Score');
        // Dots (one per bin)
        svg.selectAll('circle')
            .data(bins)
            .join('circle')
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', d => size(d.count))
            .attr('fill', d => color(d.avgIncome))
            .attr('opacity', 0.7)
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                tooltip.style('display', 'block')
                    .html(
                        `<b>Work Life Balance Score:</b> ${d.x}<br/>` +
                        `<b>Social Isolation Score:</b> ${d.y}<br/>` +
                        `<b>Avg. Income:</b> $${d.avgIncome.toFixed(1)}K`
                    );
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 15) + 'px')
                       .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');
            });
        // Tooltip div
        const tooltip = d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('border', '1px solid #aaa')
            .style('border-radius', '6px')
            .style('padding', '8px 12px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
            .style('color', '#222')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
            .style('display', 'none');
        // Add vertical color legend (income)
        const legendBarWidth = 18;
        const legendBarHeight = 120;
        const legendX = width + 60;
        const legendY = 40;
        // Gradient for vertical legend
        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'income-gradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%');
        linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color(minIncome));
        linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color(maxIncome));
        svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendBarWidth)
            .attr('height', legendBarHeight)
            .style('fill', 'url(#income-gradient)');
        // Legend labels
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'hanging')
            .text(`$${maxIncome}K`);
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + legendBarHeight - 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'baseline')
            .text(`$${minIncome}K`);
        svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY - 12)
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .text('Avg. Income');
        // Scene annotation text
        annotationArea.html('<b>Annotation:</b> Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows their average income (blue = lower, red = higher).');
    });
}

// Add new function for Scene 2 scatterplot by gender
function drawScatterPlotByGender(container, annotationArea) {
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right; // keep plot area same, extra space for legend
    const height = svgHeight - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv('post_pandemic_remote_work_health_impact_2025.csv').then(data => {
        // Only include Male and Female
        data = data.filter(d => d.Gender === 'Male' || d.Gender === 'Female');
        // Parse numeric values and encode gender
        data.forEach(d => {
            d.Work_Life_Balance_Score = +d.Work_Life_Balance_Score;
            d.Social_Isolation_Score = +d.Social_Isolation_Score;
            d.GenderNum = d.Gender === 'Male' ? 1 : 0;
            d.Salary_Num = (d.Salary_Range.includes('40K-60K')) ? 50 :
                            (d.Salary_Range.includes('60K-80K')) ? 70 :
                            (d.Salary_Range.includes('80K-100K')) ? 90 :
                            (d.Salary_Range.includes('100K-120K')) ? 110 :
                            (d.Salary_Range.includes('120K+')) ? 130 : 0;
        });
        // Bin data by (Work_Life_Balance_Score, Social_Isolation_Score)
        const binMap = new Map();
        data.forEach(d => {
            const key = `${d.Work_Life_Balance_Score},${d.Social_Isolation_Score}`;
            if (!binMap.has(key)) {
                binMap.set(key, {count: 0, sumGender: 0, sumIncome: 0, x: d.Work_Life_Balance_Score, y: d.Social_Isolation_Score, numFemales: 0, numMales: 0});
            }
            const bin = binMap.get(key);
            bin.count++;
            bin.sumGender += d.GenderNum;
            bin.sumIncome += d.Salary_Num;
            if (d.Gender === 'Female') bin.numFemales++;
            if (d.Gender === 'Male') bin.numMales++;
        });
        const bins = Array.from(binMap.values()).map(bin => ({
            x: bin.x,
            y: bin.y,
            count: bin.count,
            avgGender: bin.count > 0 ? bin.sumGender / bin.count : 0,
            avgIncome: bin.count > 0 ? bin.sumIncome / bin.count : 0,
            numFemales: bin.numFemales,
            numMales: bin.numMales
        }));
        // Axes
        const x = d3.scaleLinear()
            .domain([0, 5])
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, 5])
            .range([height, 0]);
        // Color scale for gender average
        const color = d3.scaleLinear()
            .domain([0, 1])
            .range(["#4575b4", "#d73027"]); // blue (female) to red (male)
        // Size scale for count
        const countExtent = d3.extent(bins, d => d.count);
        const size = d3.scaleSqrt()
            .domain([countExtent[0], countExtent[1]])
            .range([6, 28]);
        // Axes rendering
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')));
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));
        // Axis labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Work Life Balance Score');
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Social Isolation Score');
        // Dots (one per bin)
        svg.selectAll('circle')
            .data(bins)
            .join('circle')
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', d => size(d.count))
            .attr('fill', d => color(d.avgGender))
            .attr('opacity', 0.7)
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                tooltip.style('display', 'block')
                    .html(
                        `<b>Work Life Balance Score:</b> ${d.x}<br/>` +
                        `<b>Social Isolation Score:</b> ${d.y}<br/>` +
                        `<b>Females:</b> ${d.numFemales}<br/>` +
                        `<b>Males:</b> ${d.numMales}`
                    );
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 15) + 'px')
                       .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');
            });
        // Tooltip div
        const tooltip = d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('border', '1px solid #aaa')
            .style('border-radius', '6px')
            .style('padding', '8px 12px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
            .style('color', '#222')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
            .style('display', 'none');
        // Add vertical color legend (gender average)
        const legendBarWidth = 18;
        const legendBarHeight = 120;
        const legendX = width + 60;
        const legendY = 40;
        // Gradient for vertical legend
        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'gender-gradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%');
        linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color(0));
        linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color(1));
        svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendBarWidth)
            .attr('height', legendBarHeight)
            .style('fill', 'url(#gender-gradient)');
        // Legend labels
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'hanging')
            .text('Male (1)');
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + legendBarHeight - 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'baseline')
            .text('Female (0)');
        svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY - 12)
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .text('Avg. Gender');
        // Scene annotation text
        annotationArea.html('<b>Annotation:</b> Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows the proportion of males (red) to females (blue) in the group.');
    });
}

function drawScatterPlotByAge(container, annotationArea) {
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right; // keep plot area same, extra space for legend
    const height = svgHeight - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv('post_pandemic_remote_work_health_impact_2025.csv').then(data => {
        // Parse numeric values
        data.forEach(d => {
            d.Work_Life_Balance_Score = +d.Work_Life_Balance_Score;
            d.Social_Isolation_Score = +d.Social_Isolation_Score;
            d.Age = +d.Age;
        });
        // Bin data by (Work_Life_Balance_Score, Social_Isolation_Score)
        const binMap = new Map();
        data.forEach(d => {
            const key = `${d.Work_Life_Balance_Score},${d.Social_Isolation_Score}`;
            if (!binMap.has(key)) {
                binMap.set(key, {count: 0, sumAge: 0, x: d.Work_Life_Balance_Score, y: d.Social_Isolation_Score});
            }
            const bin = binMap.get(key);
            bin.count++;
            bin.sumAge += d.Age;
        });
        const bins = Array.from(binMap.values()).map(bin => ({
            x: bin.x,
            y: bin.y,
            count: bin.count,
            avgAge: bin.count > 0 ? bin.sumAge / bin.count : 0
        }));
        // Axes
        const x = d3.scaleLinear()
            .domain([0, 5])
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, 5])
            .range([height, 0]);
        // Color scale for age
        const ageExtent = d3.extent(bins, d => d.avgAge);
        const color = d3.scaleLinear()
            .domain([ageExtent[0], ageExtent[1]])
            .range(["#4575b4", "#d73027"]); // blue (younger) to red (older)
        // Size scale for count
        const countExtent = d3.extent(bins, d => d.count);
        const size = d3.scaleSqrt()
            .domain([countExtent[0], countExtent[1]])
            .range([6, 28]);
        // Axes rendering
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')));
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));
        // Axis labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Work Life Balance Score');
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Social Isolation Score');
        // Dots (one per bin)
        svg.selectAll('circle')
            .data(bins)
            .join('circle')
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', d => size(d.count))
            .attr('fill', d => color(d.avgAge))
            .attr('opacity', 0.7)
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                tooltip.style('display', 'block')
                    .html(
                        `<b>Work Life Balance Score:</b> ${d.x}<br/>` +
                        `<b>Social Isolation Score:</b> ${d.y}<br/>` +
                        `<b>Avg. Age:</b> ${d.avgAge.toFixed(1)}`
                    );
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 15) + 'px')
                       .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');
            });
        // Tooltip div
        const tooltip = d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('border', '1px solid #aaa')
            .style('border-radius', '6px')
            .style('padding', '8px 12px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
            .style('color', '#222')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
            .style('display', 'none');
        // Add vertical color legend (age)
        const legendBarWidth = 18;
        const legendBarHeight = 120;
        const legendX = width + 60;
        const legendY = 40;
        // Gradient for vertical legend
        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'age-gradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%');
        linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color(ageExtent[0]));
        linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color(ageExtent[1]));
        svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendBarWidth)
            .attr('height', legendBarHeight)
            .style('fill', 'url(#age-gradient)');
        // Legend labels
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'hanging')
            .text(`${ageExtent[1].toFixed(0)} (older)`);
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + legendBarHeight - 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'baseline')
            .text(`${ageExtent[0].toFixed(0)} (younger)`);
        svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY - 12)
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .text('Avg. Age');
        // Scene annotation text
        annotationArea.html('<b>Annotation:</b> Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows their average age (blue = younger, red = older).');
    });
}

function drawScatterPlotByHours(container, annotationArea) {
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right; // keep plot area same, extra space for legend
    const height = svgHeight - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv('post_pandemic_remote_work_health_impact_2025.csv').then(data => {
        // Parse numeric values
        data.forEach(d => {
            d.Work_Life_Balance_Score = +d.Work_Life_Balance_Score;
            d.Social_Isolation_Score = +d.Social_Isolation_Score;
            d.Hours_Per_Week = +d.Hours_Per_Week;
        });
        // Bin data by (Work_Life_Balance_Score, Social_Isolation_Score)
        const binMap = new Map();
        data.forEach(d => {
            const key = `${d.Work_Life_Balance_Score},${d.Social_Isolation_Score}`;
            if (!binMap.has(key)) {
                binMap.set(key, {count: 0, sumHours: 0, x: d.Work_Life_Balance_Score, y: d.Social_Isolation_Score});
            }
            const bin = binMap.get(key);
            bin.count++;
            bin.sumHours += d.Hours_Per_Week;
        });
        const bins = Array.from(binMap.values()).map(bin => ({
            x: bin.x,
            y: bin.y,
            count: bin.count,
            avgHours: bin.count > 0 ? bin.sumHours / bin.count : 0
        }));
        // Axes
        const x = d3.scaleLinear()
            .domain([0, 5])
            .range([0, width]);
        const y = d3.scaleLinear()
            .domain([0, 5])
            .range([height, 0]);
        // Color scale for hours per week
        const minHours = 35;
        const maxHours = 65;
        const color = d3.scaleLinear()
            .domain([minHours, maxHours])
            .range(["#4575b4", "#d73027"]); // blue (fewer hours) to red (more hours)
        // Size scale for count
        const countExtent = d3.extent(bins, d => d.count);
        const size = d3.scaleSqrt()
            .domain([countExtent[0], countExtent[1]])
            .range([6, 28]);
        // Axes rendering
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')));
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));
        // Axis labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Work Life Balance Score');
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Social Isolation Score');
        // Dots (one per bin)
        svg.selectAll('circle')
            .data(bins)
            .join('circle')
            .attr('cx', d => x(d.x))
            .attr('cy', d => y(d.y))
            .attr('r', d => size(d.count))
            .attr('fill', d => color(d.avgHours))
            .attr('opacity', 0.7)
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                tooltip.style('display', 'block')
                    .html(
                        `<b>Work Life Balance Score:</b> ${d.x}<br/>` +
                        `<b>Social Isolation Score:</b> ${d.y}<br/>` +
                        `<b>Avg. Hours/Week:</b> ${d.avgHours.toFixed(1)}`
                    );
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 15) + 'px')
                       .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');
            });
        // Tooltip div
        const tooltip = d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('border', '1px solid #aaa')
            .style('border-radius', '6px')
            .style('padding', '8px 12px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
            .style('color', '#222')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
            .style('display', 'none');
        // Add vertical color legend (hours)
        const legendBarWidth = 18;
        const legendBarHeight = 120;
        const legendX = width + 60;
        const legendY = 40;
        // Gradient for vertical legend
        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'hours-gradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%');
        linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color(minHours));
        linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color(maxHours));
        svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendBarWidth)
            .attr('height', legendBarHeight)
            .style('fill', 'url(#hours-gradient)');
        // Legend labels
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'hanging')
            .text(`${maxHours} (more)`);
        svg.append('text')
            .attr('x', legendX + legendBarWidth + 8)
            .attr('y', legendY + legendBarHeight - 6)
            .attr('font-size', 12)
            .attr('alignment-baseline', 'baseline')
            .text(`${minHours} (fewer)`);
        svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY - 12)
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .text('Avg. Hours/Week');
        // Scene annotation text
        annotationArea.html('<b>Annotation:</b> Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows their average hours per week (blue = fewer, red = more).');
    });
}

function drawJitteredScatterplot(container, annotationArea) {
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Add filter controls
    container.html('');
    const controlsDiv = container.append('div').attr('class', 'explore-controls').style('margin-bottom', '12px');
    controlsDiv.append('label').text('Gender: ');
    const genderSelect = controlsDiv.append('select').attr('id', 'explore-gender');
    controlsDiv.append('label').text(' Region: ');
    const regionSelect = controlsDiv.append('select').attr('id', 'explore-region');
    controlsDiv.append('label').text(' Income: ');
    const incomeSelect = controlsDiv.append('select').attr('id', 'explore-income');
    controlsDiv.append('label').text(' Age: ');
    const ageMin = controlsDiv.append('input').attr('type', 'number').attr('id', 'explore-age-min').attr('placeholder', 'min').style('width', '60px');
    controlsDiv.append('span').text(' - ');
    const ageMax = controlsDiv.append('input').attr('type', 'number').attr('id', 'explore-age-max').attr('placeholder', 'max').style('width', '60px');
    controlsDiv.append('label').text(' Hours/Week: ');
    const hoursMin = controlsDiv.append('input').attr('type', 'number').attr('id', 'explore-hours-min').attr('placeholder', 'min').style('width', '60px');
    controlsDiv.append('span').text(' - ');
    const hoursMax = controlsDiv.append('input').attr('type', 'number').attr('id', 'explore-hours-max').attr('placeholder', 'max').style('width', '60px');
    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv('post_pandemic_remote_work_health_impact_2025.csv').then(data => {
        // Parse numeric values
        data.forEach(d => {
            d.Work_Life_Balance_Score = +d.Work_Life_Balance_Score;
            d.Social_Isolation_Score = +d.Social_Isolation_Score;
            d.Age = +d.Age;
            d.Hours_Per_Week = +d.Hours_Per_Week;
        });
        // Get unique values
        const genders = Array.from(new Set(data.map(d => d.Gender)));
        const regions = Array.from(new Set(data.map(d => d.Region)));
        const incomes = Array.from(new Set(data.map(d => d.Salary_Range)));
        genderSelect.append('option').attr('value', 'All').text('All');
        genders.forEach(g => genderSelect.append('option').attr('value', g).text(g));
        regionSelect.append('option').attr('value', 'All').text('All');
        regions.forEach(r => regionSelect.append('option').attr('value', r).text(r));
        incomeSelect.append('option').attr('value', 'All').text('All');
        incomes.forEach(i => incomeSelect.append('option').attr('value', i).text(i));
        // Set age/hours min/max
        ageMin.attr('min', d3.min(data, d => d.Age)).attr('max', d3.max(data, d => d.Age));
        ageMax.attr('min', d3.min(data, d => d.Age)).attr('max', d3.max(data, d => d.Age));
        hoursMin.attr('min', d3.min(data, d => d.Hours_Per_Week)).attr('max', d3.max(data, d => d.Hours_Per_Week));
        hoursMax.attr('min', d3.min(data, d => d.Hours_Per_Week)).attr('max', d3.max(data, d => d.Hours_Per_Week));

        // Axes
        const x = d3.scaleLinear().domain([0, 5]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 5]).range([height, 0]);
        // Color by gender
        const color = d3.scaleOrdinal().domain(genders).range(d3.schemeSet1);

        // Draw axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')));
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Work Life Balance Score');
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .text('Social Isolation Score');

        // Tooltip div
        const tooltip = d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('border', '1px solid #aaa')
            .style('border-radius', '6px')
            .style('padding', '8px 12px')
            .style('pointer-events', 'none')
            .style('font-size', '14px')
            .style('color', '#222')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
            .style('display', 'none');

        function updatePlot() {
            let filtered = data;
            const selectedGender = genderSelect.property('value');
            const selectedRegion = regionSelect.property('value');
            const selectedIncome = incomeSelect.property('value');
            const minAge = +ageMin.property('value') || d3.min(data, d => d.Age);
            const maxAge = +ageMax.property('value') || d3.max(data, d => d.Age);
            const minHours = +hoursMin.property('value') || d3.min(data, d => d.Hours_Per_Week);
            const maxHours = +hoursMax.property('value') || d3.max(data, d => d.Hours_Per_Week);
            if (selectedGender !== 'All') filtered = filtered.filter(d => d.Gender === selectedGender);
            if (selectedRegion !== 'All') filtered = filtered.filter(d => d.Region === selectedRegion);
            if (selectedIncome !== 'All') filtered = filtered.filter(d => d.Salary_Range === selectedIncome);
            filtered = filtered.filter(d => d.Age >= minAge && d.Age <= maxAge);
            filtered = filtered.filter(d => d.Hours_Per_Week >= minHours && d.Hours_Per_Week <= maxHours);
            // Jitter
            const jitterAmount = 0.18;
            svg.selectAll('circle').remove();
            svg.selectAll('circle')
                .data(filtered)
                .join('circle')
                .attr('cx', d => x(d.Work_Life_Balance_Score + (Math.random() - 0.5) * jitterAmount))
                .attr('cy', d => y(d.Social_Isolation_Score + (Math.random() - 0.5) * jitterAmount))
                .attr('r', 6)
                .attr('fill', d => color(d.Gender))
                .attr('opacity', 0.7)
                .attr('stroke', '#333')
                .attr('stroke-width', 1)
                .on('mouseover', function(event, d) {
                    tooltip.style('display', 'block')
                        .html(
                            `<b>Work Life Balance Score:</b> ${d.Work_Life_Balance_Score}<br/>` +
                            `<b>Social Isolation Score:</b> ${d.Social_Isolation_Score}<br/>` +
                            `<b>Gender:</b> ${d.Gender}<br/>` +
                            `<b>Region:</b> ${d.Region}<br/>` +
                            `<b>Age:</b> ${d.Age}<br/>` +
                            `<b>Income:</b> ${d.Salary_Range}<br/>` +
                            `<b>Hours/Week:</b> ${d.Hours_Per_Week}`
                        );
                })
                .on('mousemove', function(event) {
                    tooltip.style('left', (event.pageX + 15) + 'px')
                           .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.style('display', 'none');
                });
        }
        genderSelect.on('change', updatePlot);
        regionSelect.on('change', updatePlot);
        incomeSelect.on('change', updatePlot);
        ageMin.on('input', updatePlot);
        ageMax.on('input', updatePlot);
        hoursMin.on('input', updatePlot);
        hoursMax.on('input', updatePlot);
        updatePlot();

        // Add legend for gender color
        const legendX = width + 60;
        const legendY = 40;
        genders.forEach((g, i) => {
            svg.append('circle')
                .attr('cx', legendX + 12)
                .attr('cy', legendY + i * 28)
                .attr('r', 9)
                .attr('fill', color(g))
                .attr('stroke', '#333');
            svg.append('text')
                .attr('x', legendX + 32)
                .attr('y', legendY + i * 28 + 4)
                .attr('font-size', 14)
                .text(g);
        });
        svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY - 16)
            .attr('font-size', 12)
            .attr('font-weight', 'bold')
            .text('Gender');
        // Scene annotation text
        annotationArea.html('<b>Explore:</b> Each point is a participant, jittered to reduce overlap. Use the filters to explore by gender, region, age, income, and hours per week. Hover for details.');
    });
}

// Initialize
showScene(currentScene); 