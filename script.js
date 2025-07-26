// Scene navigation logic using D3.js
const totalSteps = 15;
let currentStep = 1;

function showStep(stepNum) {
    const titleArea = d3.select('#scene-title');
    const vizArea = d3.select('#scene-viz');
    const annotationArea = d3.select('#scene-annotation');
    // Clear dynamic areas
    titleArea.html('');
    vizArea.html('');
    annotationArea.html('');

    switch (stepNum) {
        case 1:
            titleArea.text('Work Life Balance vs Social Isolation, Colored by Income');
            drawScatterPlotWithAnnotations(vizArea, annotationArea, 1);
            annotationArea.html('Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows the average of a third variable (ex. income, blue = lower, red = higher). You can hover over each circle for more details.');
            break;
        case 2:
            titleArea.text('Work Life Balance vs Social Isolation, Colored by Income');
            drawScatterPlotWithAnnotations(vizArea, annotationArea, 2);
            annotationArea.html('Average income shows little variation across work-life balance and social isolation levels. This suggests that compensation may not be directly linked to well-being in hybrid work environments.');
            break;
        case 3:
            titleArea.text('Work Life Balance vs Social Isolation, Colored by Income');
            drawScatterPlotWithAnnotations(vizArea, annotationArea, 3);
            annotationArea.html('Average income shows little variation across work-life balance and social isolation levels. This suggests that compensation may not be directly linked to well-being in hybrid work environments.');
            break;
        case 4:
            titleArea.text('Work Life Balance vs Social Isolation, Colored by Income');
            drawScatterPlotWithAnnotations(vizArea, annotationArea, 4);
            annotationArea.html('Average income shows little variation across work-life balance and social isolation levels. This suggests that compensation may not be directly linked to well-being in hybrid work environments.');
            break;
        case 5:
            titleArea.text('Work Life Balance vs Social Isolation, Colored by Income');
            drawScatterPlotWithAnnotations(vizArea, annotationArea, 5);
            annotationArea.html('Step 5 annotation here.');
            break;
        case 6:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Gender)');
            drawScatterPlotByGender(vizArea, annotationArea, 1);
            annotationArea.html('Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows the proportion of males (red) to females (blue) in the group.');
            break;
        case 7:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Gender)');
            drawScatterPlotByGender(vizArea, annotationArea, 2);
            annotationArea.html('Step 7 annotation here.');
            break;
        case 8:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Gender)');
            drawScatterPlotByGender(vizArea, annotationArea, 3);
            annotationArea.html('Step 8 annotation here.');
            break;
        case 9:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Gender)');
            drawScatterPlotByGender(vizArea, annotationArea, 4);
            annotationArea.html('Step 9 annotation here.');
            break;
        case 10:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Age)');
            drawScatterPlotByAge(vizArea, annotationArea, 1);
            annotationArea.html('Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows their average age (blue = younger, red = older).');
            break;
        case 11:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Age)');
            drawScatterPlotByAge(vizArea, annotationArea, 2);
            annotationArea.html('Step 11 annotation here.');
            break;
        case 12:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Age)');
            drawScatterPlotByAge(vizArea, annotationArea, 3);
            annotationArea.html('Step 12 annotation here.');
            break;
        case 13:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Age)');
            drawScatterPlotByAge(vizArea, annotationArea, 4);
            annotationArea.html('Step 13 annotation here.');
            break;
        case 14:
            titleArea.text('Work Life Balance vs Social Isolation (Colored by Hours per Week)');
            drawScatterPlotByHours(vizArea, annotationArea, 1);
            annotationArea.html('Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows their average hours per week (blue = fewer, red = more).');
            break;
        case 15:
            titleArea.text('Explore: Work Life Balance vs Social Isolation (Jittered, Filterable)');
            drawJitteredScatterplot(vizArea, annotationArea);
            break;
        default:
            break;
    }
    d3.select('#prev-btn').attr('disabled', stepNum === 1 ? true : null);
    d3.select('#next-btn').attr('disabled', stepNum === totalSteps ? true : null);
}

d3.select('#prev-btn').on('click', function() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
});
d3.select('#next-btn').on('click', function() {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
});

// function for Scene 1 scatterplot by income
function drawScatterPlotWithAnnotations(container, annotationArea, step) {
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right; 
    const height = svgHeight - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    function salaryToNum(s) {
        if (s.includes('40K-60K')) return 50;
        if (s.includes('60K-80K')) return 70;
        if (s.includes('80K-100K')) return 90;
        if (s.includes('100K-120K')) return 110;
        if (s.includes('120K+')) return 130;
        return 0;
    }

    d3.csv('post_pandemic_remote_work_health_impact_2025.csv').then(data => {
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
        // Top annotation/callout logic by sceneKey and step
        let topText = '';
        if (step === 1) {
            topText = 'Each circle represents a group of people with the same work-life balance and social isolation scores. Circle size shows how many people are in that group, and color shows the average of a third variable (ex. income, blue = lower, red = higher). You can hover over each circle for more details.';
        } else if (step === 2) {
            topText = 'Average income shows little variation across work-life balance and social isolation levels. This suggests that compensation may not be directly linked to well-being in hybrid work environments.';
        } else if (step === 3) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            // Draw highlight circle
            svg.append('circle')
                .attr('cx', xScale(3))
                .attr('cy', yScale(3))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation
            const boxX = xScale(3) + 85; // was +45, now +85 for more rightward shift
            const boxY = yScale(3) - 28;
            const boxWidth = 275;
            const boxHeight = 70;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Most responses, regardless of income, ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('cluster here with moderate balance');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('and moderate isolation.');
            annotationArea.html('Average income shows little variation across work-life balance and social isolation levels. This suggests that compensation may not be directly linked to well-being in hybrid work environments.');
            return;
        } else if (step === 4) {
            // Draw highlight circle and annotation for (5,1)
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            svg.append('circle')
                .attr('cx', xScale(5))
                .attr('cy', yScale(1))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation (to the left)
            const boxWidth = 350;
            const boxHeight = 75;
            const boxX = xScale(5) - boxWidth - 40; // left of the bubble
            const boxY = yScale(1) - 28;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            // Annotation text
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Fewer respondents land here in the ideal');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('zone with high balance and low isolation. This could');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('possibly be linked to hybrid work setups.');
            annotationArea.html('Average income shows little variation across work-life balance and social isolation levels. This suggests that compensation may not be directly linked to well-being in hybrid work environments.');
            return;
        } else if (step === 5) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            // Draw highlight circle
            svg.append('circle')
                .attr('cx', xScale(1))
                .attr('cy', yScale(5))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation
            const boxX = xScale(1) + 85;
            const boxY = yScale(5) - 28;
            const boxWidth = 300;
            const boxHeight = 70;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Few respondents lie in the red flag zone ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('with poor work life balance and high isolation. ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Their average income is similar to others.');
            annotationArea.html('Average income shows little variation across work-life balance and social isolation levels. This suggests that compensation may not be directly linked to well-being in hybrid work environments.');
            return;
        }
        annotationArea.html(topText);
    });
}

// function for Scene 2 scatterplot by gender
function drawScatterPlotByGender(container, annotationArea, step) {
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right;
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
        // Top annotation/callout logic by step
        let topText = '';
        if (step === 1) {
            topText = 'Color shading shows little gender disparity in overall well-being. Both men and women appear similarly distributed across work-life balance and social isolation scores.';
        } else if (step === 2) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            // Draw highlight circle
            svg.append('circle')
                .attr('cx', xScale(3))
                .attr('cy', yScale(3))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation
            const boxX = xScale(3) + 70;
            const boxY = yScale(3) - 28;
            const boxWidth = 275;
            const boxHeight = 110;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Most responses, regardless of gender, ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('report a work-life balance score of 3 and');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('moderate social isolation. This suggests a ,');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 72)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('shared middle-ground experience post-');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 92)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('pandemic.');
            annotationArea.html('Color shading shows little gender disparity in overall well-being. Both men and women appear similarly distributed across work-life balance and social isolation scores.');
            return;
        } else if (step === 3) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            // Draw highlight circle
            svg.append('circle')
                .attr('cx', xScale(1))
                .attr('cy', yScale(5))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation
            const boxX = xScale(1) + 70;
            const boxY = yScale(5) - 28;
            const boxWidth = 275;
            const boxHeight = 90;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Smaller clusters in the upper left show');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('fewer respondents facing both low work-');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('life balance and high social isolation —');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 72)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('no strong gender trend here.');
            annotationArea.html('Color shading shows little gender disparity in overall well-being. Both men and women appear similarly distributed across work-life balance and social isolation scores.');
            return;
        } else if (step === 4) {
            // Draw highlight circle and annotation for (5,1)
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            svg.append('circle')
                .attr('cx', xScale(5))
                .attr('cy', yScale(1))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation (to the left)
            const boxWidth = 350;
            const boxHeight = 90;
            const boxX = xScale(5) - boxWidth - 40; // left of the bubble
            const boxY = yScale(1) - 28;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            // Annotation text
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('The lower-right bubbles suggest a segment of workers');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('with excellent balance and minimal isolation. Gender');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('distribution here is also mixed, indicating both men ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 72)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('and women experience this positively.');
                annotationArea.html('Color shading shows little gender disparity in overall well-being. Both men and women appear similarly distributed across work-life balance and social isolation scores.');
            return;
        } 
        annotationArea.html(topText);
    });
}

// function for Scene 3 scatterplot by age
function drawScatterPlotByAge(container, annotationArea, step) {
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
        // Top annotation/callout logic by step
        let topText = '';
        if (step === 1) {
            topText = 'Most responses are centered around moderate scores (3,3). There is a slight age-related trend — older respondents cluster more at low work-life balance or high isolation extremes.';
        } else if (step === 2) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            // Draw highlight circle
            svg.append('circle')
                .attr('cx', xScale(2))
                .attr('cy', yScale(1))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation
            const boxX = xScale(2) + 70;
            const boxY = yScale(1) - 28;
            const boxWidth = 290;
            const boxHeight = 75;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Some older workers report low isolation even');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('with poor balance — possibly due to more');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('established support systems or routines.');
            annotationArea.html('Most responses are centered around moderate scores (3,3). There is a slight age-related trend — older respondents cluster more at low work-life balance or high isolation extremes.');
            return;
        } else if (step === 3) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            // Draw highlight circle
            svg.append('circle')
                .attr('cx', xScale(5))
                .attr('cy', yScale(5))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation
            const boxX = xScale(5) - 290 - 40; // left of the bubble
            const boxY = yScale(5) - 28;
            const boxWidth = 290;
            const boxHeight = 75;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Younger respondents may enjoy schedule ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('flexibility but still feel isolated — highlighting ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('generational differences in social dynamics.');
            annotationArea.html('Most responses are centered around moderate scores (3,3). There is a slight age-related trend — older respondents cluster more at low work-life balance or high isolation extremes.');
            return;
        } else if (step === 4) {
            const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);
            // Draw highlight circle
            svg.append('circle')
                .attr('cx', xScale(3))
                .attr('cy', yScale(3))
                .attr('r', 40)
                .attr('stroke', 'orange')
                .attr('fill', 'none')
                .attr('stroke-width', 3);
            // White box background for annotation
            const boxX = xScale(3) + 70;
            const boxY = yScale(3) - 28;
            const boxWidth = 270;
            const boxHeight = 75;
            svg.append('rect')
                .attr('x', boxX - 10)
                .attr('y', boxY - 8)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('fill', 'white')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('rx', 8);
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 12)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('Most workers fall in the middle range, ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 32)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('suggesting moderate satisfaction and ');
            svg.append('text')
                .attr('x', boxX)
                .attr('y', boxY + 52)
                .attr('font-size', 14)
                .attr('fill', 'orange')
                .text('connection across age groups');
            annotationArea.html('Most responses are centered around moderate scores (3,3). There is a slight age-related trend — older respondents cluster more at low work-life balance or high isolation extremes.');
            return;
        }
        annotationArea.html(topText);
    });
}

function drawScatterPlotByHours(container, annotationArea, step) {
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
        // Top annotation/callout logic by step
        let topText = '';
        if (step === 1) {
            topText = 'Most clusters again fall near the center (3,2–3), with fairly uniform red-purple coloring, indicating little variation in hours worked across different experiences of isolation and balance. There is no strong correlation between extreme isolation/balance and average working hours. The average number of hours per week seems relatively consistent (around 50) across all clusters.';
        }
        annotationArea.html(topText);
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
    const controlsDiv = container.append('div').attr('class', 'explore-controls').style('margin-bottom', '20px');
    
    // Gender filter
    const genderDiv = controlsDiv.append('div').style('margin-bottom', '8px');
    genderDiv.append('label').text('Gender: ').style('display', 'inline-block').style('width', '100px');
    const genderSelect = genderDiv.append('select').attr('id', 'explore-gender');
    
    // Region filter
    const regionDiv = controlsDiv.append('div').style('margin-bottom', '8px');
    regionDiv.append('label').text('Region: ').style('display', 'inline-block').style('width', '100px');
    const regionSelect = regionDiv.append('select').attr('id', 'explore-region');
    
    // Income filter
    const incomeDiv = controlsDiv.append('div').style('margin-bottom', '8px');
    incomeDiv.append('label').text('Income: ').style('display', 'inline-block').style('width', '100px');
    const incomeSelect = incomeDiv.append('select').attr('id', 'explore-income');
    
    // Age filter
    const ageDiv = controlsDiv.append('div').style('margin-bottom', '8px');
    ageDiv.append('label').text('Age: ').style('display', 'inline-block').style('width', '100px');
    const ageMin = ageDiv.append('input').attr('type', 'number').attr('id', 'explore-age-min').attr('placeholder', 'min').style('width', '60px');
    ageDiv.append('span').text(' - ');
    const ageMax = ageDiv.append('input').attr('type', 'number').attr('id', 'explore-age-max').attr('placeholder', 'max').style('width', '60px');
    
    // Hours filter
    const hoursDiv = controlsDiv.append('div').style('margin-bottom', '8px');
    hoursDiv.append('label').text('Hours/Week: ').style('display', 'inline-block').style('width', '100px');
    const hoursMin = hoursDiv.append('input').attr('type', 'number').attr('id', 'explore-hours-min').attr('placeholder', 'min').style('width', '60px');
    hoursDiv.append('span').text(' - ');
    const hoursMax = hoursDiv.append('input').attr('type', 'number').attr('id', 'explore-hours-max').attr('placeholder', 'max').style('width', '60px');
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
        annotationArea.html('Each point is a participant, jittered to reduce overlap. Use the filters to explore by gender, region, age, income, and hours per week. Hover for details.');
    });
}

// Initialize
showStep(currentStep); 