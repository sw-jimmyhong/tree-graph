var width = 1000,
    height = 800,
    color = d3.scaleOrdinal(d3.schemeCategory20),
    radius = 5,
    max_radius = 30;

var svg = d3.select("#graph").append("svg");

svg.attr("width", width)
    .attr("height", height);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(100).strength(1))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

var zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", zoomed);

var g = svg.call(zoom)
    .append("g")
    .attr("transform", "translate(40,0)");

var data, root, link, node;

d3.json("data.json", function (error, json) {
    if (error) throw error;
    data = json;
    root = d3.hierarchy(data);
    update();
});

function update() {
    // create nodes
    var nodes = formatNodes(root);
    // create links
    var links = root.links();
    // initiate force simulation
    console.log(nodes, links);
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.on("tick", ticked);

    // update links
    link = g.selectAll(".link")
        .data(links, function (d) {
            return d.target.id;
        });
    link.exit().remove();

    var linkEnter = link.enter()
        .append("line")
        .attr("class", "link");
    link = linkEnter.merge(link);

    // update node
    node = g.selectAll(".node")
        .data(nodes, function (d) { return d.id; });
    node.exit().remove();

    var nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .on("click", click)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodeEnter.append("circle")
        .style("fill", (d) => d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c")
        .style("cursor", "pointer")
        .attr("r", radius);

    nodeEnter.append("text")
        .attr("dy", 3)
        .attr("x", function (d) { return d.children ? -8 : 8; })
        .style("text-anchor", function (d) { return d.children ? "end" : "start"; })
        .text(function (d) { return d.data.name; });


    node = nodeEnter.merge(node);
}

function formatNodes(data) {
    var nodes = [],
        i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }
    recurse(data);
    return nodes;

}

// function formatLinks(data) {
//     var links = []
//     for (i in data) {
//         let link = {
//             "source": data[i].data,
//             "target": data[i].parent.data
//         }
//         links.push(link);
//     }
//     return links;
// }

function ticked() {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    node.attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });
}

function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;

    }
    update();
    simulation.restart();
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function zoomed() {
    g.attr("transform", d3.event.transform);
    // var transform = d3.zoomTransform(this);
    // console.log(transform)
    // console.log(node);
    // var circle = d3.selectAll("circle");
    // node.attr("transform", d3.event.transform);
    // link.attr("transform", d3.event.transform);
    // link.attr("stroke-width", function (d) {
    //     return Math.sqrt(d.value) / transform.k
    // });
    // var base_radius = radius;
    // if (radius * transform.k > max_radius) {
    //     base_radius = max_radius / Math.sqrt(transform.k);
    // } else {
    //     base_radius = radius * Math.sqrt(transform.k);
    // }
    // circle.attr("r", base_radius)
}