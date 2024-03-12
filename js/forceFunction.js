function updateForceGraph(filteredLinkData, filteredNodeData) {
    d3.select("#forcegraph svg")
        .transition()
        .duration(500)
        .remove();

    const margin = ({ top: 10, right: 0, bottom: 10, left: 0 })
    const width = document.querySelector("#forcegraph").clientWidth;
    const height = document.querySelector("#forcegraph").clientHeight - margin.bottom;
    const center = { x: width / 2, y: height / 2 };
    let textSize = d3.scaleOrdinal().range([20, 10, 20, 20, 20, 20]);
    let textWeight = d3.scaleOrdinal().range([500, 300, 500, 500, 500]);
    let nodeColor = d3.scaleOrdinal().range(["#433FF7", "#FDA431"]);
    let linkColor = d3.scaleOrdinal().range(["#20578a", "#d9534f", "#527772", "#bf79b4", "#ffd800"]);
    const drawer = document.querySelector("#drawer-holder")
    const content = document.querySelector(".content")

    // Append a container for the new SVG with initial opacity set to 0
    const forceContainer = d3.select("#forcegraph")
        .append("div") // Use a div container to hold the SVG
        .attr("id", "force-container") // Give it an id for easy selection
        .style("opacity", 0);


    var forceSvg = forceContainer
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Apply a transition to gradually fade in the container and move it to the center
    forceContainer
        .transition()
        .duration(500) // Set the duration of the transition in milliseconds
        .style("opacity", 1); // Set the final opacity to 1

    const nodes = filteredNodeData
    const links = filteredLinkData
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

    // const tooltip = d3.select("body").append("div").attr("class", "tooltip")

    const tooltipCircle = d3.select("#forcegraph")
        .append("div")
        .attr("class", "tooltip-circle")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .attr('fill', '#433ff7')
        .style("top", "120px") // Adjust as needed
        .style("right", "200px"); // Adjust as needed

    const tooltipAritist = d3.select("#forcegraph")
        .append("div")
        .attr("class", "tooltip-artist")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .attr('fill', '#FDA431')
        .style("top", "225px") // Adjust as needed
        .style("right", "30px"); // Adjust as needed

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
                console.log(e.target.id)
                isClicked = !isClicked; // Toggle the click state
                const target = e.target.id;
                console.log(d.id)
                const targetSource = d.source;
                if (isClicked) {
                    if (d.group === "1") {
                        // drawer.classList.add("open")
                        node.selectAll(".node").attr("opacity", (d, i) => {
                            if (targetSource.includes(d.id) || d.id === target) {
                                return 1;
                            } else {
                                return 0.1;
                            }
                        });
                    }
                } else {
                    // drawer.classList.remove();
                    node.selectAll(".node").attr("opacity", 1); // Reset opacity when clicked again
                }

                let color = nodeColor(d.group);


                if (isClicked && d.group === "1") {

                    console.log(d)
                    // Show tooltip with donor name
                    tooltipCircle.transition()
                        .duration(200)
                        .style("opacity", .9)

                    tooltipCircle.html(function () {
                        return d.id + "<br/>" + "donated " + "<br/>" + d.sum + " artworks";
                    })
                        .style('font-size', '18pt')
                        .style("color", color)
                        .style("text-shadow", "-0.5px -0.5px 0.5px #fff, 0.5px -0.5px 0.5px #fff, -0.5px 0.5px 0.5px #fff, 0.5px 0.5px 0.5px #fff")
                        .style("text-align", "right");

                } else {
                    // Hide tooltip if not clicked or if the condition is not met
                    tooltipCircle.transition()
                        .duration(200)
                        .style("opacity", 0);
                }
            })
            .on("mouseover", (e, d) => {
                let color = nodeColor(d.group);
                let content = `${d.id}`;
                // tooltip.html(content).style("visibility", "visible");
                // tooltip.style("color", color);

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

                if (isClicked && d.group === "2") {
                    // Show tooltip with donor name
                    tooltipAritist.transition()
                        .duration(200)
                        .style("opacity", .9)

                    tooltipAritist.html(function () {
                        return d.id + "<br/>" + "created " + "<br/>" + d.sum + " artworks <br/> for NGA collection";
                    })
                        .style('font-size', '18pt')
                        .style("color", color)
                        .style("text-shadow", "-0.5px -0.5px 0.5px #fff, 0.5px -0.5px 0.5px #fff, -0.5px 0.5px 0.5px #fff, 0.5px 0.5px 0.5px #fff")
                        .style("text-align", "right");

                } else {
                    // Hide tooltip if not clicked or if the condition is not met
                    tooltipAritist.transition()
                        .duration(200)
                        .style("opacity", 0);
                }

            })
            .on("mousemove", (e, d) => {
                // tooltip
                //     .style("top", e.pageY - (tooltip.node().clientHeight + 5) + "px")
                //     .style("left", e.pageX - tooltip.node().clientWidth / 2.0 + "px");

                if (d.group === "2") {
                    tooltipAritist.transition()
                        .duration(200)
                        .style("opacity", .9)
                }
            })

            .on("mouseout", (e, d) => {
                if (!isClicked && d.group === "1") {
                    node.selectAll(".node").attr("opacity", 1);
                }
                // tooltip.style("visibility", "hidden");

                tooltipAritist.transition()
                    .duration(200)
                    .style("opacity", 0);
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
        }
    };

    forceLayoutGenerator(nodes, links)
}