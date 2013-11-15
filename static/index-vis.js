
d3.json('/vis/index-data.json', function(err, data) {
  if(err) {
    return;
  }

  for(var i = 0; i < data.length; i++) {
    data[i].date = new Date(data[i].date);
  }

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  var margin = {top: 5, right: 40, bottom: 30, left: 20},
      width = 440 - margin.left - margin.right,
      height = 100 - margin.top - margin.bottom;

  var bisectDate = d3.bisector(function(d) { return d.date; }).left,
      formatValue = d3.format(',.0f');

  var x = d3.time.scale().range([0, width]);

  var y = d3.scale.linear().range([height, 0]);

  var area = d3.svg.area()
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.downloads); });

  var svg = d3.select('#download-chart').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var extent = d3.extent(data, function(d) { return d.downloads; });

    // make the extent of the y axis a bit larger than the data to leave space
    // at the bottom
    extent[0] -= Math.round(extent[0] / 6);

    x.domain([data[0].date, data[data.length - 1].date]);
    y.domain(extent);

  var xdom = d3.extent(data, function(d) { return d.date });

  var xAxis = d3.svg.axis()
      .tickValues(d3.time.weeks(xdom[0], xdom[1], 1))
      .scale(x)
      .orient('bottom');

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  svg.append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', area);

  var focus = svg.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

  focus.append('circle')
      .attr('r', 4.5);

  focus.append('text')
      .attr('x', 9)
      .attr('dy', '.35em');

  svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', function() { focus.style('display', null); })
      .on('mouseout', function() { focus.style('display', 'none'); })
      .on('mousemove', mousemove);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr('transform', 'translate(' + x(d.date) + ',' + y(d.downloads) + ')');
    focus.select('text').text(formatValue(d.downloads));
  }
});
