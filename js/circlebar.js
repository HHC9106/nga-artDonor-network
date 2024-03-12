const marginPage = ({ top: 0, right: 0, bottom: 0, left: 0 })
const widthPage = document.querySelector("#circlebar").clientWidth;
const heightPage = document.querySelector("#circlebar").clientHeight;
const ycenter = heightPage / 2;
const tooltip = d3.select("body").append("div").attr("class", "tooltip");

var selectedYear = '1940-1950';

// const marginPage = { top: 0, right: 0, bottom: 0, left: 0 };
// const circlebarElement = document.querySelector('#circlebar');
// const widthPage = circlebarElement.clientWidth;
// const heightPage = circlebarElement.clientHeight;
// const tooltip = d3.select('body').append('div').attr('class', 'tooltip');

var barSvg = d3
  .select('#circlebar')
  .append('svg')
  .attr('width', widthPage - marginPage.left - marginPage.right)
  .attr('height', heightPage - marginPage.top - marginPage.bottom)
  .append('g')
  .attr(
    'transform',
    'translate(' + marginPage.left + ',' + marginPage.top + ')'
  );

d3.csv('./data/data_quali/circleData_donateYear.csv').then(function (data) {
  const circleWidth = widthPage / data.length;
  console.log(data);

  // Draw a dashed line with an arrow to the right
  barSvg
    .append('line')
    .attr('x1', 0)
    .attr('y1', ycenter)
    .attr('x2', widthPage - 30)
    .attr('y2', ycenter)
    .attr('stroke', 'darkgrey')
    .attr('stroke-dasharray', '12,6') // Dashed line
    .attr('stroke-width', '2.5')
    .attr('marker-end', 'url(#arrowhead)') // Arrowhead marker
    .attr('stroke', 'darkgrey')  // Add this line to set the line color

  // Define the arrowhead marker
  barSvg
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('markerWidth', 40)
    .attr('markerHeight', 40)
    .attr('refX', 14)
    .attr('refY', 25)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M2,40 L17,25 L2,10 M17,25')
    .attr('fill', 'none')
    .attr('stroke', 'darkgrey'); // Set fill color here


  barSvg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d, i) => i * circleWidth + circleWidth / 3) // Equally distribute circles
    .attr('cy', ycenter) // Center the circles vertically
    .attr('r', (d) => Math.max(Math.sqrt(+d.counts) / 2, 8)) // Set the radius based on the data
    .attr('fill', 'white')
    .attr('stroke', (d) => d.Year===selectedYear?'#433FF7':'#2222')
    .attr('stroke-width', (d) => d.Year===selectedYear?'8':'5')
    .attr('stroke-dasharray',  (d) => d.Year===selectedYear?'4,3':'none')
    .attr('text', (d) => d.Year)
    .on('click', (e, d) => {
      console.log(d)
      updateData(d.Year);

      barSvg.selectAll('circle')
        .attr('fill', 'white')
        .attr('stroke-width', '5')
        .attr('stroke', '#2222')
        .attr('stroke-dasharray', 'none');
      d3.select(e.target)
        .attr('fill', 'white')
        .attr('stroke', '#433FF7')
        .attr('stroke-width', '8')
        .attr('stroke-dasharray', '4,3'); // Replace 'selectedColor' with your desired color


      let Sum = `${d.counts}`;
      // tooltip
      //   .html(Sum)
      //   .style('visibility', 'visible')
      //   .style('top', e.pageY - (tooltip.node().clientHeight + 5) + 'px')
      //   .style('left', e.pageX - tooltip.node().clientWidth / 2.0 + 'px');
    });

  // Add text elements for the year titles
  barSvg
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .attr('x', (d, i) => i * circleWidth + circleWidth / 3)
    .attr('y', ycenter + 90) // Adjust this value based on your layout
    .attr('text-anchor', 'middle')
    .style("fill",'#292929')
    .text((d) => d.Year)
    .classed('circle-title', true);
});


// Function to update force graph based on selected year
function updateData(selectedYear) {
  Promise.all([
    d3.csv("./data/data_quali/node_all.csv"),
    d3.csv("./data/data_quali/link_all.csv")
  ]).then(function (data) {
    var filterednodeData = data[0].filter(d => d.year === selectedYear);
    var filteredLinkData = data[1].filter(d => d.year === selectedYear);

    updateForceGraph(filteredLinkData, filterednodeData);
  });
}

updateData(selectedYear);
