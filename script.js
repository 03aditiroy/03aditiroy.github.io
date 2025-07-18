// Scene navigation logic using D3.js
const totalScenes = 4;
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
        titleArea.text('Work Arrangements by Region');
        drawStackedBarChart(vizArea);
        annotationArea.text('Distribution of work arrangements (Onsite, Remote, Hybrid, etc.) by region in 2025.');
    } else if (sceneNum === 2) {
        titleArea.text('Data Overview');
        vizArea.append('svg').attr('width', 200).attr('height', 100)
            .append('circle')
            .attr('cx', 100).attr('cy', 50).attr('r', 40)
            .attr('fill', 'steelblue');
        annotationArea.text('Here we explore the dataset structure and key insights.');
    } else if (sceneNum === 3) {
        titleArea.text('Detailed Analysis');
        vizArea.append('svg').attr('width', 200).attr('height', 100)
            .append('rect')
            .attr('x', 50).attr('y', 20).attr('width', 100).attr('height', 60)
            .attr('fill', 'orange');
        annotationArea.text('Dive deeper into the patterns and relationships in the data.');
    } else if (sceneNum === 4) {
        titleArea.text('Conclusion');
        vizArea.append('svg').attr('width', 200).attr('height', 100)
            .append('text')
            .attr('x', 20).attr('y', 50)
            .text('The End!')
            .attr('font-size', 24);
        annotationArea.text('Summary and key takeaways from our analysis.');
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

// Initialize
showScene(currentScene); 