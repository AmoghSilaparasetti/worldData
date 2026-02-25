function showSection(sectionID){
	d3.selectAll('.section').style('display','none');
	d3.select('#' + sectionID).style('display','block');
}

d3.select('#btn-histogram').on("click",() => showSection("histogram"));
d3.select('#btn-scatterplot').on("click",() => showSection("scatterplot"));
d3.select('#btn-choropleth').on("click",() => showSection("choropleth"));

function toggleData(showId, hideId){
	d3.select(showId).style('display','block');
	d3.select(hideId).style('display','none');
}

d3.select("#hist-poverty").on("click", () => toggleData("#poverty-histogram","#education-histogram"));
d3.select("#hist-edu").on("click", () => toggleData("#education-histogram","#poverty-histogram"));
d3.select("#map-poverty").on("click", () => toggleData("#poverty-map","#education-map"));
d3.select("#map-edu").on("click", () => toggleData("#education-map","#poverty-map"));

d3.csv('data/merged-data-inner.csv')
.then(data =>{
    data.forEach(d => {
		d.povertyPercent = +d["Share of population in poverty ($3 a day)"];
		d.educationSpending = +d["Total across all levels"];
		
        delete d["Share of population in poverty ($3 a day)"];
        delete d["Total across all levels"]
    });
    console.log(data);

    showBarChart(data, '#poverty-histogram',  "povertyPercent", "Entity");
    showBarChart(data, '#education-histogram',  "educationSpending", "Entity");
	showHistogram(data, '#education-poverty-scatterplot', "educationSpending", "povertyPercent", "Entity")
	Choropleth("#poverty-map", [5, 10, 20, 30, 40, 50, 70, 90], "Share of population in poverty ($3 a day)", d3.schemeReds[9])
	Choropleth("#education-map", [0, 10000000000,25000000000,50000000000, 100000000000, 200000000000, 300000000000, 400000000000], "Total across all levels", d3.schemeBlues[9])
})

/*
 *  Draw chart
 */
function showBarChart(data, div, x, y) {
	// Margin object with properties for the four directions
	const margin = {top: 5, right: 5, bottom: 20, left: 200};


	// Width and height as the inner dimensions of the chart area
	const width = 1600 - margin.left - margin.right,
	height = 2000 - margin.top - margin.bottom;

	
	// Define 'svg' child-element (g) from drawing area with spaces
	const svg = d3.select(div).append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);


	// All subsequent functions/properties can ignore the margins
	// Initialize linear + ordinal scales
	const xScale = d3.scaleLinear()
		.domain([0, d3.max(data, d => d[x])])
		.range([0, width]);


	const yScale = d3.scaleBand()
		.domain(data.map(d => d[y]))
		.range([0, height])
		.paddingInner(0.5);


	// Initialize axes
	const xAxis = d3.axisBottom(xScale)
		.ticks(6)
		.tickSizeOuter(0);


	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0);


	// Draw the axis (move xAxis to the bottom with 'translate')
	const xAxisGroup = svg.append('g')
		.attr('class', 'axis x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);


	const yAxisGroup = svg.append('g')
		.attr('class', 'axis y-axis')
		.call(yAxis);


	// Add rectangles
	svg.selectAll('rect')
		.data(data.filter(d => d[y] !== 0))
		.enter()
	  .append('rect')
		.attr('class', 'bar')
		.attr('width', d => xScale(d[x]))
		.attr('height', yScale.bandwidth())
		.attr('y', d => yScale(d[y]))
		.attr('x', 0)
		.attr('fill', div === "#poverty-histogram" ? '#D73027' : "#4575B4");

}

/*
 *  Draw chart
 */
function showHistogram(data, div, x, y, label) {
	// Margin object with properties for the four directions
	const margin = {top: 5, right: 100, bottom: 20, left: 20};


	// Width and height as the inner dimensions of the chart area
	const width = 1600 - margin.left - margin.right,
	height = 2000 - margin.top - margin.bottom;

	
	// Define 'svg' child-element (g) from drawing area with spaces
	const svg = d3.select(div).append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);


	// All subsequent functions/properties can ignore the margins
	// Initialize linear + ordinal scales
	const xScale = d3.scaleLinear()
		.domain([0, 400000000000])
		.range([0, width]);


	const yScale = d3.scaleLinear()
		.domain([0, d3.max(data, d => d[y])])
		.range([height, 0])


	// Initialize axes
	const xAxis = d3.axisBottom(xScale)
		.tickSizeOuter(0);


	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0);


	// Draw the axis (move xAxis to the bottom with 'translate')
	const xAxisGroup = svg.append('g')
		.attr('class', 'axis x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);


	const yAxisGroup = svg.append('g')
		.attr('class', 'axis y-axis')
		.call(yAxis);


	// Add Circles
	svg.selectAll('circle')
		.data(data)
		.enter()
	  .append('circle')
		.attr('class', 'point')
		.attr('cx', d => xScale(d[x]  < 400000000000 ? d[x] :400000000000))
		//.attr('height', yScale.bandwidth())
		.attr('cy', d => yScale(d[y]))
		.attr('r', 5)
		.on('mouseover', function() {
            d3.select('#tooltip').style('display', 'block');
            d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
        })
        .on('mousemove', (event, d) => {
            // Check the 'div' to customize labels just like the map
            let xLabel = "Education Spending";
			let yLabel = "Poverty Rate"
            
            d3.select('#tooltip')
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 15) + 'px')
                .html(`
                    <div class="tooltip-title">${d.Entity || 'Data Point'}</div>
                    <div style="font-size: 11px">
                        <strong>${yLabel}:</strong> ${d[y].toLocaleString()}<br/>
                        <strong>${xLabel}:</strong> ${d[x].toLocaleString()}
                    </div>
                `);
        })
        .on('mouseleave', function() {
            d3.select('#tooltip').style('display', 'none');
            d3.select(this).attr('stroke', 'none');
        });

}

function Choropleth(div, limit, column, colorRange){
   
      // Margin object with properties for the four directions
	   const margin = {top: 5, right: 5, bottom: 20, left: 20};


      // Width and height as the inner dimensions of the chart area
      const width = 1600 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

	
      // Define 'svg' child-element (g) from drawing area with spaces
      const svg = d3.select(div).append('svg')
         .attr('width', width + margin.left + margin.right)
         .attr('height', height + margin.top + margin.bottom)
         .append('g')
         .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // Map and projection
      var path = d3.geoPath();
      var projection = d3.geoMercator()
      .scale(150)
      .center([0,20])
      .translate([width / 2, height / 2]);

      // Data and color scale
      var data = new Map();
      var colorScale = d3.scaleThreshold()
      .domain(limit)
      .range(colorRange);

      // Load external data and boot
      Promise.all([
         d3.json("data/world.geojson"),
         d3.csv("data/merged-data-outer.csv", function(d) {
            data.set(d.Code_x, {
    val: +d[column],
    year: +d[column + " (Original Year)"]
});
      })

      
      ]).then(function(loadData){
         let topo = loadData[0]
       // Draw the map
      svg.append("g")
         .selectAll("path")
         .data(topo.features)
         .join("path")
            // draw each country
            .attr("d", d3.geoPath()
            .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
            entry = data.get(d.id);
			if (entry && entry.val !== null && !isNaN(entry.val)) {
				d.total = entry.val;
				return colorScale(d.total);
			} else {
				// Handle "No Data" with a neutral grey
				d.total = undefined; 
				return "#eeeeee"; 
			}
            })
            .attr("stroke", "#ccc")
            .attr("stroke-width", 0.5)
			.on('mousemove', (event, d) => {
				const entry = data.get(d.id);
				const val = entry ? entry.val : undefined;
				const year = entry ? entry.year : undefined;
				const countryName = d.properties.name;
				displayValue = 0;
				
				if(div === "#poverty-map"){
					displayValue = val !== undefined 
					? `<strong>${val.toFixed(2)}</strong> % in poverty` 
					: 'No data available'; 
				} else {
					displayValue = val !== undefined 
					? `<strong>$ ${val.toFixed(2)}</strong> spent in education` 
					: 'No data available'; 
				}
				
				const lastUpdated = val !== undefined 
					? `<strong>Last Updated: ${year}</strong>` 
					: 'Last Updated Year is not available'; 

				d3.select('#tooltip')
					.style('display', 'block')
					.style('left', (event.pageX + 15) + 'px')   
					.style('top', (event.pageY - 15) + 'px')
					.html(`
						<div class="tooltip-title">${countryName}</div>
						<div>${displayValue}</div>
						<div>${lastUpdated}</div>
					`);
				
				// Optional: Highlight the country on hover
				d3.select(event.currentTarget)
					.style("stroke", "black")
					.style("stroke-width", 2);
			})
			.on('mouseleave', function() {
				d3.select('#tooltip').style('display', 'none');
				
				// Reset country highlight
				d3.select(this)
					.style("stroke", "#ccc")
					.style("stroke-width", 0.5);
			});
      })
}

d3.selectAll('.section').style('display', 'none');
d3.select('#histogram').style('display', 'block');