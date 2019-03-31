const canvas = d3.select(".canvas");
const svg = canvas
  .append("svg")
  .attr("width", 600)
  .attr("height", 600);

const group = svg.append("g").attr("transform", "translate(0, 100)");
group
  .append("rect")
  .attr("width", 200)
  .attr("height", 100)
  .attr("fill", "blue")
  .attr("x", 20)
  .attr("y", 20);

group
  .append("circle")
  .attr("r", 50)
  .attr("cx", 300)
  .attr("cy", 70)
  .attr("fill", "pink");

group
  .append("line")
  .attr("x1", 370)
  .attr("x2", 400)
  .attr("y1", 20)
  .attr("y2", 120)
  .attr("stroke", "red");

svg
  .append("text")
  .attr("x", 20)
  .attr("y", 200)
  .attr("fill", "grey")
  .text("hello")
  .style("font-family", "arial");
