const temp_width = 500, temp_height = 500;
const tempplot_width = 460, tempplot_height = 460;
const temp_margin = { top: 70, bottom: 100, left: 70, right: 30 };
const temp_space = 30

// Create SVG container for all plots
const temp_svg = d3.select("#temperatureplots")
    .attr("width", temp_width)
    .attr("height", temp_height)
    .style("background", "#EEEFF3");

// Set up a fixed y-scale for better comparison
const temp_yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([tempplot_height - temp_margin.bottom, temp_margin.top]);

// Asia plot
const asia_temp = d3.csv("asia_cleaned_data.csv");
const europe_temp = d3.csv("europe_cleaned_data.csv");

Promise.all([asia_temp, europe_temp]).then(function([asia, europe]) {
    // Convert strings to numbers
    asia.forEach(function(d) {
        d["temperature"] = +d["temperature_fahrenheit"];
    });
    europe.forEach(function(d) {
        d["temperature"] = +d["temperature_fahrenheit"];
    });

    // Group data by condition_text
    const grouped_asia_temp = Array.from(
        d3.rollup(asia,
        v => d3.mean(v, d => d["temperature_fahrenheit"]),
        d => d.condition_text),
    ([key, value]) => ({key, value}) // Transform data into key value pair
    ).sort((a, b) => d3.descending(a.value, b.value));

    const grouped_europe_temp = Array.from(
        d3.rollup(europe,
        v => d3.mean(v, d => d["temperature_fahrenheit"]),
        d => d.condition_text),
    ([key, value]) => ({key, value}) // Transform data into key value pair
    );

    // Set up scale with combined conditions
    const combined_temp = Array.from(new Set(grouped_asia_temp.map(d => d.key).concat(grouped_europe_temp.map(d => d.key))));
    const temp_xScale = d3.scaleBand()
        .domain(combined_temp)
        .range([margin.left, tempplot_width - temp_margin.right])
        .padding(0.25)

    // Set up color scale
    const temp_colorScale = d3.scaleOrdinal()
        .domain(["Asia", "Europe"])
        .range(["red", "steelblue"])

    // Add Asia plot to the container
    const asia_temp_plot = temp_svg.append("g")
        .attr("transform", `translate(0, 0)`);

    // Add axes 
    asia_temp_plot.append("g")
        .attr("transform", `translate(0, ${tempplot_height - temp_margin.bottom})`)
        .call(d3.axisBottom(temp_xScale))
        .selectAll("text")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "end");

        asia_temp_plot.append("g")
        .attr("transform", `translate(${temp_margin.left}, 0)`)
        .call(d3.axisLeft(temp_yScale));

    // Add x-axis label
    asia_temp_plot.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", tempplot_width / 1.5)
        .attr("y", tempplot_height - 5)
        .text("Weather conditions")
        .style("font-size", "14px");
    
    // Add y-axis label
    asia_temp_plot.append("text")
        .attr("class", "y label")
        .attr('x', 0 - tempplot_height/2.2)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Temperature (F)")
        .style("font-size", "14px");

    // Add bars
    asia_temp_plot.selectAll("rect")
        .data(grouped_asia_temp)
        .enter().append("rect")
        .attr("x", d => temp_xScale(d.key))
        .attr("y", d => temp_yScale(d.value))
        .attr("width", temp_xScale.bandwidth()/2)
        .attr("height", d => tempplot_height - temp_margin.bottom - temp_yScale(d.value))
        .attr("fill", temp_colorScale("Asia"));

    // Add Europe plot to the container
    const europe_temp_plot = temp_svg.append("g")
        .attr("transform", `translate(0, 0)`);
        
    // Add axes 
    europe_temp_plot.append("g")
        .attr("transform", `translate(0, ${tempplot_height - temp_margin.bottom})`)
        .call(d3.axisBottom(temp_xScale))
        .selectAll("text")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "end");

    europe_temp_plot.append("g")
        .attr("transform", `translate(${temp_margin.left}, 0)`)
        .call(d3.axisLeft(temp_yScale));

    // Add bars
    europe_temp_plot.selectAll("rect")
        .data(grouped_europe_temp)
        .enter().append("rect")
        .attr("x", d => temp_xScale(d.key) + 16)
        .attr("y", d => temp_yScale(d.value))
        .attr("width", temp_xScale.bandwidth()/2)
        .attr("height", d => tempplot_height - temp_margin.bottom - temp_yScale(d.value))
        .attr("fill", temp_colorScale("Europe"));

    // Add legend
    const temp_legend = temp_svg.selectAll(".legend")
        .data(temp_colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")")

        temp_legend.append("rect")
            .attr("width", 100)
            .attr("height", 30)
            .attr("x", 370)
            .attr("y", 30)
            .attr("fill", "white");
        
            temp_legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 380)
            .attr("y", 40)
            .attr("fill", d => temp_colorScale(d));

            temp_legend.append("text")
            .attr("x", 400)
            .attr("y", 50)
            .text(d => d)
            .attr("fill", d => temp_colorScale(d));

});

