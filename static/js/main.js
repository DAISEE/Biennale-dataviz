'use strict';

// pines parameters
const pines = {
  pine2 : {
    url: 'http://192.168.0.49:8080',
    //url: 'http://localhost:8080',
    sensorId: 1,
    login: 'pi',
    password: 'pi',
  },
};

const workerParameters = {
  pines: pines,
  intervalTime: 5000, // 20 secondes,
  intervalNbValues: 4,
}

// matrix defaults values
var matrix = [
  //  I  P  F  0
  [0, 1, 1, 1], // Imobil
  [2, 0, 0, 0], // PowerP
  [1, 0, 0, 0], // ForestDAO
  [1, 0, 0, 0]  // Oeuvre4
];

var worker = new Worker('/static/js/worker.js');
worker.onmessage = e => {
	matrix = e.data;
  // D3 call
};

worker.postMessage(workerParameters);

/* D3 main */

var width  = 750;
var height = 700;

var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");


var range5 = ["#E6E2AF", "#B0CC99", "#E1E6FA", "#9E8479"];

var chord = d3.layout.chord()
        .padding(.1)
        .sortSubgroups(function(a,b) { return 1; })
        .matrix(matrix);

var fill = d3.scale.ordinal()
        .domain(d3.range(range5.length))
        .range(range5);


var innerRadius = Math.min(width, height) * .39;
var outerRadius = innerRadius * 1.1;

svg.append("g")
        .selectAll("path")
        .data(chord.groups)
        .enter().append("path")
        .style("fill", function(d) {
            return fill(d.index);
        })
        .style("stroke", function(d) {
            return fill(d.index);
        })
        .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
        .on("mouseover", fade(.1))
        .on("mouseout", fade(1));

svg.append("g")
        .attr("class", "chord")
        .selectAll("path")
        .data(chord.chords)
        .enter().append("path")
        .style("fill", function(d) {
            return fill(d.target.index);
        })
        .attr("d", d3.svg.chord().radius(innerRadius))
        .style("opacity", 1);

var range5_artists = ["Imobil", "PowerPlant", "ForestDAO", "Oeuvre4"];

svg.selectAll("text")
        .data(chord.groups)
        .enter()
        .append("text")
        .text(function(d) {
            return range5_artists[d.index];
        })
      .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (innerRadius + 35) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
      })
.style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("font-size", "11px")
        .attr("fill", function(d) {
            return  range5[d.index];
        })
        .on("mouseover", fade(.1))
        .on("mouseout", fade(1));


function fade(opacity) {
    return function(g, i) {
        svg.selectAll("g.chord path")
                .filter(function(d) {
                    return d.source.index != i && d.target.index != i;
                })
                .transition()
                .style("opacity", opacity);
    };
}
