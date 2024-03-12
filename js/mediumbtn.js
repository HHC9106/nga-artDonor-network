const marginMedium = ({ top: 0, right: 0, bottom: 0, left: 0 })
const widthMedium = document.querySelector("#mediumbtn").clientWidth;
const heightMedium = document.querySelector("#mediumbtn").clientHeight;
const ycenterMedium = heightMedium / 2+10;
const mediumTooltip = d3.select("body").append("div").attr("class", "medium-tooltip");

var selectedDonor = 'All';

const tooltipDonor = d3.select("#radialviz")
  .append("div")
  .attr("class", "tooltip-donor")
  .style("opacity", 0)
  .style("position", "absolute")
  // .style("background", "#ffffff")
  // .style("border", "1px solid #d3d3d3")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .attr('fill', '#433ff7')
  .style("top", "120px") // Adjust as needed
  .style("left", "125px"); // Adjust as needed;

var mediumSvg = d3
  .select('#mediumbtn')
  .append('svg')
  .attr('width', widthMedium - marginMedium.left - marginMedium.right)
  .attr('height', heightMedium - marginMedium.top - marginMedium.bottom)
  .append('g')
  .attr(
    'transform',
    'translate(' + marginMedium.left + ',' + marginMedium.top + ')'
  )  

d3.csv('./data/data_quant/NGA_top15donor_sum.csv').then(function (data) {
  const circleWidthMedium = widthMedium / data.length;
  console.log(data);

  mediumSvg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d, i) => i * circleWidthMedium / 1 + circleWidthMedium / 2.5) // Equally distribute circles
    .attr('cy', ycenterMedium) // Center the circles vertically
    .attr('r', (d) => Math.sqrt(+d.counts) / 6 > 43 ? 43 : Math.max(Math.sqrt(+d.counts) / 6, 7))
    .attr('fill', 'white')
    .attr('stroke', (d) => d.name===selectedDonor?'#433FF7':'#2222')
    .attr('stroke-width', (d) => d.name===selectedDonor?'8':'5')
    .attr('stroke-dasharray', (d) => (d.counts > 50000 || d.name === selectedDonor) ? '4,3' : 'none')
    .attr('text', (d) => d.name)
    .on('click', (e, d) => {
      console.log(d)
      updateRadialData(d.name);

      mediumSvg.selectAll('circle')
        .attr('fill', 'white')
        .attr('stroke-width', '5')
        .attr('stroke', '#2222')
        .attr('stroke-dasharray', (d, i) => d.counts > 50000 ? '4,3' :'none');
      d3.select(e.target)
        .attr('fill', 'white')
        .attr('stroke', '#433FF7')
        .attr('stroke-width', '8')
        .attr('stroke-dasharray', '4,3'); // Replace 'selectedColor' with your desired color

      // Show tooltip with donor name
      tooltipDonor.transition()
        .duration(200)
        .style("opacity", .9)

      tooltipDonor
        .html(function () {
          return d.name + "<br/>" + "donated " + "<br/>" + d.counts + " artworks";
        })
        .style('font-size', '18pt');

      let Sum = `${d.counts}`;
      // tooltip
      //   .html(Sum)
      //   .style('visibility', 'visible')
      //   .style('top', e.pageY - (tooltip.node().clientHeight + 5) + 'px')
      //   .style('left', e.pageX - tooltip.node().clientWidth / 2.0 + 'px');
    });

  // Add text elements for the year titles
  mediumSvg
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .attr('x', (d, i) => i * circleWidthMedium / 1 + circleWidthMedium / 2.5)
    .attr('y', ycenterMedium + 75) // Adjust this value based on your layout
    .attr("font-size", 20)
    .attr('text-anchor', 'middle')
    .style("fill",'#111111')
    .text((d) => d.name.slice(0, 3))
    .classed('medium-title', true);
});


function updateRadialData(selectedDonor) {
  d3.csv(`./data/data_quant/donor_medium_${selectedDonor}.csv`).then(function (data) {
    updateRadial(data);
  });
}

updateRadialData(selectedDonor);

