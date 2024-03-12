function updateRadial(RadialData) {
  d3.select("#radialviz svg")
    .transition()
    .duration(0)
    .remove();

  // const margin = ({ top: 100, right: 50, bottom: 100, left: 0 })
  const radialWidth = document.querySelector("#radialviz").clientWidth;
  const radialHeight = document.querySelector("#radialviz").clientHeight;
  const innerRadius = 300;
  const outerRadius = 900;

  // An angular x-scale
  const x = d3.scaleBand()
    .range([-0.5 * Math.PI, 0.5 * Math.PI])
    .align(0);

  // A radial y-scale maintains area proportionality of radial bars
  const y = d3.scaleRadial()
    .range([innerRadius, outerRadius]);

  const mediumList = ["DecorativeArt", "Drawing", "IndexOfAmericanDesign", "Painting", "Photograph", "Portfolio", "Print", "Sculpture", "TechnicalMaterial", "TimeBasedMediaArt", "Volume"]

  const z = d3.scaleOrdinal()
    .domain(mediumList)
    .range([
      "#e377c2", // Pink 
      "#1f77b4", // Blue
      "#ff7f0e", // Orange
      "#2ca02c", // Green      
      "#fc8d62", // Coral
      "#9467bd", // Purple
      "#d62728",  // Red
      "#17becf", // Teal
      "#7f7f7f", // Gray
      "#d3d3d3", // light Gray
      "#8da0cb" // Light Blue
    ]);

  function formatDonorName(name) {
    return name.replace(/([A-Z])/g, ' $1').trim(); // Add a space before capital letters
  }

  const subgroups = mediumList;
  console.log(subgroups)
  // var itemLength = subgroups.length
  // console.log(itemLength)

  var maxSum = d3.max(RadialData, function (d) {
    // Sum the values for each row excluding the first column
    return d3.sum(subgroups, function (subgroup) { return +d[subgroup]; });
  });

  maxSumFinal = Math.ceil(maxSum / 500) * 500;
  console.log(maxSum)
  console.log(maxSumFinal)

  const tooltipMedium = d3.select("#radialviz")
    .append("div")
    .attr("class", "tooltip-medium")
    .style("opacity", 0)
    .style("position", "absolute")
    // .style("background", "#ffffff")
    // .style("border", "1px solid #d3d3d3")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("top", "215px") // Adjust as needed
    .style("left", "315px"); // Adjust as needed;


  var svg = d3.select("#radialviz")
    .append("svg")
    .attr("width", radialWidth)
    .attr("height", radialHeight)
    .style('background-color', maxSumFinal > 10000 ? '#ffebd7' : 'rgb(252, 244, 233)'); // Change 'lightblue' to the desired color

  g = svg.append("g").attr("transform", "translate(" + (radialWidth / 3) + "," + (radialHeight - 20) + ")");

  x.domain(RadialData.map(function (d) { return d.TwonHalfDecade; }));

  if (maxSumFinal > 12000) {
    y.domain([0, 25000]);
  } else {
    y.domain([0, 7500]);
  }

  z.domain(subgroups);


  g.append('g')
    .selectAll('g')
    .data(d3.stack().keys(subgroups)(RadialData))
    .enter()
    .append('g')
    .attr('fill', function (d) {
      console.log(d.key)
      return z(d.key);
    })
    .attr("class", function (d) { return 'button-radial' })
    .attr("id", d => `${d.key}group`)
    .selectAll('path')
    .data(function (d) {
      return d;
    })
    .enter()
    .append('path')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(function (d) {
          return y(d[0]);
        })
        .outerRadius(function (d) {
          return y(d[1]);
        })
        .startAngle(function (d) {
          return x(d.data.TwonHalfDecade);
        })
        .endAngle(function (d) {
          return x(d.data.TwonHalfDecade) + x.bandwidth();
        })
        .padAngle(0.01)
        .padRadius(innerRadius)
    );

  console.log(subgroups)
  subgroups.forEach((s, i) => d3.selectAll(`#${s}group path`).attr("id", s))

  var label = g.append("g")
    .selectAll("g")
    .data(RadialData)
    .enter().append("g")
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("fill", "#595959")
    .attr("transform", function (d) {
      return "rotate(" + ((x(d.TwonHalfDecade) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)";
    });


  label.append("text")
    .attr("transform", function (d) { return (x(d.TwonHalfDecade) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
    .text(function (d) { return d.TwonHalfDecade; });

  var yAxis = g.append("g")
    .attr("text-anchor", "middle");

  var yTick = yAxis
    .selectAll("g")
    .data(y.ticks(5).slice(1))
    .enter().append("g");

  yTick.append("circle")
    .attr("fill", "none")
    .attr("stroke", "#d3d3d3")
    .attr("stroke-dasharray", "6,3")
    .attr("r", y);

  yTick.append("text")
    .attr("id", "ytickText")
    .attr("y", function (d) { return -y(d); })
    .attr("dy", "-.5em")
    .text(y.tickFormat(5, "s"))
    .attr("font-size", '14pt')
    .attr("fill", "#a7a7a7");

  yAxis.append("text")
    .attr("y", function (d) { return -y(y.ticks(5).pop()); })
    .attr("dy", "-3em")
    .text("Amount of Artworks in Each 25 years");

  // Add a group for the center text
  var centerTextGroup = g.append("g")
    .attr("transform", "translate(0, 0)"); // Adjust as needed

  // Add text to the center group
  centerTextGroup.append("text")
    .attr("text-anchor", "middle")
    .style("font-size", '9pt')
    .attr("fill", "#595959")
    .text("Artwork Created Years");

  const defaultOpacity = 0.5; // Adjust this value based on your preference
  const buttons = document.querySelectorAll(".button-radial");

  function updateOpacity(target, isActive) {
    if (isActive) {
      svg.selectAll(`.${target} path`).style('opacity', 1);
      svg.selectAll(`path:not(.${target})`).style('opacity', defaultOpacity);
    } else {
      svg.selectAll(`.${target} path`).style('opacity', 1);
      svg.selectAll(`path:not(.${target})`).style('opacity', 1);
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('mouseover', (event, d) => {
      const id = event.target.id
      const medium = id.replace("group", ""); // Use the formatting function
      const sum = d3.sum(RadialData, (d) => +d[medium]);

      console.log(id)
      console.log(medium)

      // Show tooltip with donor name
      tooltipMedium.transition()
        .duration(100)
        .style("opacity", .9)
      tooltipMedium
        .html(function () {
          return formatDonorName(medium).toUpperCase() + "<br/>" + sum + " artworks total";
        })
        .style('font-size', '18pt')
        .style('color', z(medium));

      // Create a new div element for the line
      const lineElement = document.createElement('div');
      lineElement.style.position = 'absolute';
      lineElement.style.top = '0';
      lineElement.style.left = '-10px'; /* Adjust the distance from the text as needed */
      lineElement.style.height = '100%';
      lineElement.style.width = '1px'; /* Adjust the thickness of the line as needed */
      lineElement.style.backgroundColor = z(medium); // Set the color dynamically

      // Append the line as a child to the tooltip element
      tooltipMedium.node().appendChild(lineElement);

      svg.selectAll(`#${id}`).style('opacity', 1);
      svg.selectAll(`path:not(#${id})`).style('opacity', 0.2);
    });

    button.addEventListener('mouseout', (event) => {
      // Hide tooltip
      tooltipMedium.transition()
        .duration(200)
        .style("opacity", 0);

      svg.selectAll(`path`).style('opacity', 1);
    });
  });

}