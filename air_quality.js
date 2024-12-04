const width = 500, height = 500;
const plot_width = 460, plot_height = 460;
const margin = { top: 30, bottom: 40, left: 70, right: 30 };
const space = 30

// Create SVG container for all plots
const svg = d3.select("#airqualityplots")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#EEEFF3");

// Set up a fixed y-scale for better comparison
const yScale = d3.scaleLinear()
    .domain([0, 80])
    .range([plot_height - margin.bottom, margin.top]);

// Asia plot
const asia_data = d3.csv("asia_cleaned_data.csv");
const europe_data = d3.csv("europe_cleaned_data.csv");

Promise.all([asia_data, europe_data]).then(function([asia, europe]) {
    // Convert strings to numbers
    asia.forEach(function(d) {
        d["air_quality_PM2.5"] = +d["air_quality_PM2.5"];
        d["temperature"] = +d["temperature_fahrenheit"];
    });
    europe.forEach(function(d) {
        d["air_quality_PM2.5"] = +d["air_quality_PM2.5"];
        d["temperature"] = +d["temperature_fahrenheit"];
    });

    // Group data by condition_text
    const grouped_asia = Array.from(
        d3.rollup(asia,
        v => d3.mean(v, d => d["air_quality_PM2.5"]),
        d => d.condition_text),
    ([key, value]) => ({key, value}) // Transform data into key value pair
    ).sort((a, b) => d3.descending(a.value, b.value));

    const grouped_europe = Array.from(
        d3.rollup(europe,
        v => d3.mean(v, d => d["air_quality_PM2.5"]),
        d => d.condition_text),
    ([key, value]) => ({key, value}) // Transform data into key value pair
    );

    // Set up scale with combined conditions
    const combined = Array.from(new Set(grouped_asia.map(d => d.key).concat(grouped_europe.map(d => d.key))));
    const xScale = d3.scaleBand()
        .domain(combined)
        .range([margin.left, plot_width - margin.right])
        .padding(0.25)

    // Set up color scale
    const colorScale = d3.scaleOrdinal()
        .domain(["Asia", "Europe"])
        .range(["red", "steelblue"])

    // Add Asia plot to the container
    const asia_plot = svg.append("g")
        .attr("transform", `translate(0, 0)`);

    // Add axes 
    asia_plot.append("g")
        .attr("transform", `translate(0, ${plot_height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "end");

    asia_plot.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    asia_plot.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", plot_width / 1.5)
        .attr("y", plot_height - 5)
        .text("Weather conditions")
        .style("font-size", "18px");
    
    // Add y-axis label
    asia_plot.append("text")
        .attr("class", "y label")
        .attr('x', 0 - plot_height/2.2)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("PM2.5 level (µg/m3)")
        .style("font-size", "16px");

    // Add bars
    asia_plot.selectAll("rect")
        .data(grouped_asia)
        .enter().append("rect")
        .attr("x", d => xScale(d.key))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth()/2)
        .attr("height", d => plot_height - margin.bottom - yScale(d.value))
        .attr("fill", colorScale("Asia"));

    // Add Europe plot to the container
    const europe_plot = svg.append("g")
        .attr("transform", `translate(0, 0)`);
        
    // Add axes 
    europe_plot.append("g")
        .attr("transform", `translate(0, ${plot_height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "end");

    europe_plot.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Add bars
    europe_plot.selectAll("rect")
        .data(grouped_europe)
        .enter().append("rect")
        .attr("x", d => xScale(d.key) + 16)
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth()/2)
        .attr("height", d => plot_height - margin.bottom - yScale(d.value))
        .attr("fill", colorScale("Europe"));

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")")

        legend.append("rect")
            .attr("width", 100)
            .attr("height", 30)
            .attr("x", 320)
            .attr("y", 40)
            .attr("fill", "white");
        
        legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 330)
            .attr("y", 50)
            .attr("fill", d => colorScale(d));

        legend.append("text")
            .attr("x", 350)
            .attr("y", 60)
            .text(d => d)
            .attr("fill", d => colorScale(d));

});

