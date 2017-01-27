'use strict';

const pine1 = {
  url: 'http://192.168.0.40:8080',
  sensorId: 1;
}

const dataTime = Date.now();
const t0 = dataTime + 500;
const t1 = t0 + 500;

// (foreach) pine list callback item
const fetchDataPine = (apiURL, sensorId) => {
    /* Worker - fetch data on CitizenWatt-API*/
    let worker, iReq, intervalTime, intervalNbReq, reslist;

    iReq = 0;
    intervalTime = 1000; // 1 seconde
    intervalNbReq = 4;
    reslist = [];

    worker = new Worker('/static/js/worker.js');
    worker.onmessage = sumEnergy => {
    	reslist.push(sumEnergy);
        iReq++;
        if (iReq % intervalNbReq === 0) {
            // here call D3 with reslist
            reslist = []; // reset reslist  
        }
    };

    setInterval(() => {
      worker.postMessage({
        apiURL: apiURL, 
        dataTime: dataTime, 
        t0: t0, 
        t1: t1, 
        sensorId: sensorId
      }); 
    }, intervalTime);
}

// call callback item for pine1 (test)
fetchDataPine(pine1.url, pine1.sensorId);

/* D3 main */
var width  = 750;
var height = 700;

var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

var matrix = [
 //  I  P  F  0
    [0, 1, 1, 1], // Imobil
    [2, 0, 0, 0], // PowerP
    [1, 0, 0, 0], // ForestDAO
    [1, 0, 0, 0]  // Oeuvre4
];
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
