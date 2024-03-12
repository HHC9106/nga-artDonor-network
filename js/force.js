const margin = ({ top: 10, right: 0, bottom: 0, left: 0 })
const width = document.querySelector("#forcegraph").clientWidth;
const height = document.querySelector("#forcegraph").clientHeight;
const center = { x: width / 2, y: height / 2 };

const drawer = document.querySelector("#drawer-holder")
const content = document.querySelector(".content")


var forceSvg = d3.select("#forcegraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

let textSize = d3.scaleOrdinal().range([20, 10, 20, 20, 20, 20]);
let textWeight = d3.scaleOrdinal().range([500, 300, 500, 500, 500]);
let nodeColor = d3.scaleOrdinal().range(["#433FF7", "#FDA431"]);
let linkColor = d3.scaleOrdinal().range(["#20578a", "#d9534f", "#527772", "#bf79b4", "#ffd800"]);


Promise.all([
    d3.csv("./data/data_quali/node_all.csv"),
    d3.csv("./data/data_quali/link_all.csv")
]).then(function (data) {
    const nodes = data[0].filter(d => d.year === '1940-1950')
    const links = data[1].filter(d => d.year === '1940-1950')
    links.forEach((l, i) => links[i].value = +(links[i].value))
    console.log(nodes);
    console.log(links);

    nodes.forEach((n, i) => {
            nodes[i]["source"] = []; 
    })

    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < links.length; j++) {
            if (links[j].target === nodes[i].id) {
                nodes[i].source.push(links[j].source)
            }
        }
    }

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");
    let isClicked = false;

    function forceLayoutGenerator(nodesData, linksData) {
        const simulation = d3.forceSimulation()
            // .force("radial", d3.forceRadial(500, width / 2, height / 2))
            .force("link", d3.forceLink().id(function (d) { return d.id; }))
            .force("center", d3.forceCenter(width / 2, height / 2.2))
            .force("charge", d3.forceManyBody().strength(-30))
            .force("x", d3.forceX(width / 2).strength(0.1)) // Keep nodes within the horizontal boundaries
            .force("y", d3.forceY(height / 2).strength(0.1)) // Keep nodes within the vertical boundaries
            .force("collide", d3.forceCollide().radius(function (d) {
                return Math.sqrt(+d.sum) / 1.5 + 2; // Adjust the radius based on the circle size
            }))
            .force("bounds", function (alpha) {
                nodes.forEach(function (d) {
                    d.x = Math.max(Math.sqrt(+d.sum) / 1.5, Math.min(width - Math.sqrt(+d.sum) / 1.5, d.x));
                    d.y = Math.max(Math.sqrt(+d.sum) / 1.5, Math.min(height - Math.sqrt(+d.sum) / 1.5, d.y));
                });
            })

        const link = forceSvg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", function (d) { return Math.sqrt(+d.value) / 4; })
            .style('stroke', d => { return "#d3d3d3" })

        const node = forceSvg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")

        var circles = node.append("circle")
            .attr("r", d => { return Math.sqrt(+d.sum) })
            .attr("id", d => d.id)
            .attr("class", "node")
            .attr("fill", function (d) { return nodeColor(d.group); })
            .attr("stroke", '#ffd800') // Add a white stroke
            .attr("stroke-width", 0.5) // Specify the stroke width
            .on("click", (e, d) => {
                // drawer.classList.add("open")
                console.log(e.target.id)
                drawer.innerHTML =`<h1>${e.target.id}</h1>`
                isClicked = !isClicked; // Toggle the click state
                const target = e.target.id;
                const filteredData = data[0].filter(d => d.id === target)
                const targetSource = d.source;
                if (isClicked) {
                    if (d.group === "1") {
                        drawer.classList.add("open")
                        node.selectAll(".node").attr("opacity", (d, i) => {
                            if (targetSource.includes(d.id) || d.id === target) {
                                return 1;
                            } else {
                                return 0.1;
                            }
                        });
                    }
                } else {
                    drawer.classList.remove();
                    node.selectAll(".node").attr("opacity", 1); // Reset opacity when clicked again
                }
            })
            .on("mouseover", (e, d) => {
                let color = nodeColor(d.group);
                let content = `${d.id}`;
                tooltip.html(content).style("visibility", "visible");
                tooltip.style("color", color);

                const target = e.target.id;
                const targetSource = d.source;

                if (!isClicked && d.group === "1") {
                    node.selectAll(".node").attr("opacity", (d, i) => {
                        if (targetSource.includes(d.id) || d.id === target) {
                            return 1;
                        } else {
                            return 0.1;
                        }
                    });
                }
            })
            .on("mousemove", (e, d) => {
                tooltip
                    .style("top", e.pageY - (tooltip.node().clientHeight + 5) + "px")
                    .style("left", e.pageX - tooltip.node().clientWidth / 2.0 + "px");
            })
            .on("mouseout", (e, d) => {
                if (!isClicked && d.group === "1") {
                    node.selectAll(".node").attr("opacity", 1);
                }
                tooltip.style("visibility", "hidden");
            });

        simulation.tick(20);
        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links)

        function ticked() {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
            // .attr("cx", function (d) { return d.x; })
            // .attr("cy", function (d) { return d.y; });

            // text.attr("transform", transform);
        }
        // function dragstarted(d) {
        //     if (!d3.event.active) simulation.alphaTarget(0.7).restart();
        //     d.fx = d.x;
        //     d.fy = d.y;
        // }

        // function dragged(d) {
        //     d.fx = d3.event.x;
        //     d.fy = d3.event.y;
        // }

        // function dragended(d) {
        //     if (!d3.event.active) simulation.alphaTarget(0);
        //     d.fx = null;
        //     d.fy = null;
        // }
    }

    forceLayoutGenerator(nodes, links)
});
