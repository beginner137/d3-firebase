const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

// create svg container
const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${cent.x}, ${cent.y})`);
// translates the graph group to the middle of the svg container

const pie = d3
  .pie()
  .sort(null)
  .value(d => d.cost);
// the value we are evaluating to create the pie angles

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

const colour = d3.scaleOrdinal(d3["schemeSet3"]);

// legend group
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 40}, 10)`);

const legend = d3
  .legendColor()
  .shape("circle")
  .shapePadding(10)
  .scale(colour);

const tip = d3
  .tip()
  .attr("class", "tip card")
  .html(d => {
    let content = `<div class="name">${d.data.name}</div>`;
    content += `<div class="cost">${d.data.cost}</div>`;
    content += `<div class="delete">Click slice to delete</div>`;
    return content;
  });

graph.call(tip);

// update function
const update = data => {
  colour.domain(data.map(d => d.name));

  //update and call legend
  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "white");

  const paths = graph.selectAll("path").data(pie(data));

  paths
    .exit()
    .transition()
    .duration(750)
    .attrTween("d", arcTweenExit)
    .remove();

  // handle the current DOM path updates
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    // equivalent to d => arcPath(d)
    .attr("d", arcPath)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", d => colour(d.data.name))
    // change the current data to the updated data
    .each(function(d) {
      this._current = d;
    })
    .transition()
    .duration(750)
    .attrTween("d", arcTweenEnter);

  graph
    .selectAll("path")
    .on("mouseover", (d, i, n) => {
      tip.show(d, n[i]);
      handleMouseOver(d, i, n);
    })
    .on("mouseout", (d, i, n) => {
      tip.hide();
      handleMouseOut(d, i, n);
    })
    .on("click", handleClick);
};

// data array and firestore
var data = [];

db.collection("expenses")
  .orderBy("cost")
  .onSnapshot(res => {
    res.docChanges().forEach(change => {
      const doc = { ...change.doc.data(), id: change.doc.id };

      switch (change.type) {
        case "added":
          data.push(doc);
          break;
        case "modified":
          const index = data.findIndex(item => item.id == doc.id);
          data[index] = doc;
          break;
        case "removed":
          data = data.filter(item => item.id !== doc.id);
          break;
        default:
          break;
      }
    });

    // call the update function
    update(data);
  });

const arcTweenEnter = d => {
  var i = d3.interpolate(d.endAngle, d.startAngle);
  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = d => {
  var i = d3.interpolate(d.startAngle, d.endAngle);
  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

//use function keyword to allow use of 'this'
function arcTweenUpdate(d) {
  // interpolate between the two objects
  var i = d3.interpolate(this._current, d);
  // update the current prop with new updated data
  this._current = i(1);

  return function(t) {
    return arcPath(i(t));
  };
}

//event handlers
const handleMouseOver = (d, i, n) => {
  d3.select(n[i])
    //name the transition so that it doesn't affect other transitions
    .transition("changeSliceFill")
    .duration(300)
    .attr("fill", "#fff");
};

const handleMouseOut = (d, i, n) => {
  d3.select(n[i])
    .transition("changeSliceFill")
    .duration(300)
    .attr("fill", colour(d.data.name));
};

const handleClick = d => {
  const id = d.data.id;
  db.collection("expenses")
    .doc(id)
    .delete();
};
