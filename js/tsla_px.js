function plotAllData() {

}

function setupAxis(minDate, maxDate, myData) {
	filteredData = myData
	 .filter(function (d) { return (d.date >= minDate) && (d.date <= maxDate)})


}

async function stockPrices() {

	const data = Object.assign((await d3.csv("https://raw.githubusercontent.com/cslao/2020_cs498/master/data/stock_prices.csv", d3.autoType))
		.map(({date, spy, tsla, normalized_spy}) => ({
			date: d3.timeParse("%Y%m%d")(date), 
			spy: spy,
			tsla: tsla,
			normalized_spy: normalized_spy
		})), {y: "close_px"});

	var margin = {top: 10, right: 30, bottom: 60, left: 60},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

	var svg = d3.select("#bottom_section")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .attr("id", "stock_chart")
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	var legendArea = svg.append("g")
	 .attr("transform", "translate(20, 40)")

	var legendText = legendArea.append("text")

	legendText.append("tspan")
	 .attr("class", "tsla")
	 .attr("x", 0)
	 .text("Tesla (TSLA)")

	legendText.append("tspan")
	 .attr("class", "other")
	 .text(" vs ")

	legendText.append("tspan")
	 .attr("class", "spy")
	 .attr("x", 0)
	 .attr("dy", "1.5em")
	 .text("S&P500 (SPY)")

	// annotations
	var imptDates = [
		(d3.timeParse("%Y%m%d")("20100629")).getTime(),  // IPO
		(d3.timeParse("%Y%m%d")("20140218")).getTime(),  // hits 200 for the first time
		(d3.timeParse("%Y%m%d")("20190724")).getTime(),  // Last bad earnings
		(d3.timeParse("%Y%m%d")("20200722")).getTime()   // 4 straight profitable quarters
	]

	var imptData = data.filter(function(d) { return imptDates.indexOf(d.date.getTime()) >= 0; });

	var mindate = new Date(2010, 5, 01),  // IPO date
	    maxdate = new Date(2020, 7, 30);  // End of week after earnings

	var x = d3.scaleTime()
	 .domain([mindate, maxdate])
	 .range([0, width])
	svg.append("g")
	 .attr("transform", "translate(0," + height + ")")
	 .call(d3.axisBottom(x).ticks(10))
	 .selectAll("text")
	  .attr("class", "tooltip")

	// x-axis label
	svg.append("text")             
	  .attr("transform",
	        "translate(" + (width/2) + " ," + 
	                       (height + margin.top + margin.bottom / 2) + ")")
	  .style("text-anchor", "middle")
	  .attr("class", "tooltip")
      .style("font-size", "0.9em")
	  .text("Date")

	var y = d3.scaleLinear()
	 .domain([0, d3.max(data, function (d) { return d.tsla })])
	 .range([height, 0])
	svg.append("g")
	 .call(d3.axisLeft(y))
	 .selectAll("text")
	  .attr("class", "tooltip")

	// y-axis label
	svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "tooltip")
        .style("text-anchor", "middle")
        .text("Price ($)");

    var start = x(d3.timeParse("%Y%m%d")("20190724"))
    var end = x(d3.timeParse("%Y%m%d")("20200724"))
    var zoomInRect = svg.append('rect')
	    .attr('x', start)
	    .attr('y', 0)
	    .attr('height', height)
	    .attr('width', end - start)
	    //.attr('transform', 'rotate(180)')
	    .attr("class", "earnings")
	    .style("opacity", 0.5)

	var zoomInTextArea = svg.append('g')
		.attr("transform", "translate(" + (start + (end - start) / 2) + ", 20)")

	var zoomInText = zoomInTextArea.append("text")
		.attr("class", "tooltip")

	zoomInText.append("tspan")
		 .attr("x", 0)
		 .style("text-anchor", "middle")
		 .text("Click to")

	zoomInText.append("tspan")
		 .attr("x", 0)
		 .attr("dy", "1.2em")
		 .style("text-anchor", "middle")
		 .text("Zoom In")

	spyPath = svg.append("path")
	 .datum(data)
	  .attr("stroke", "#3282b8")
	  .attr("fill", "none")
	  .attr("stroke-width", 2)
	  .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
	  .attr("d", d3.line()
		    .x( function(d)  { return x(d.date); })
		    .y( function(d) { return y(d.spy); })
	  )
	  .style("opacity", 0.3)

	tslaPath = svg.append("path")
	 .datum(data)
	  .attr("stroke", "#8f1d14")
	  .attr("fill", "none")
	  .attr("stroke-width", 2)
	  .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
	  .attr("d", d3.line()
		    .x( function(d)  { return x(d.date); })
		    .y( function(d) { return y(d.tsla); })
	  )

	var imptData = data.filter(function(d) { return imptDates.indexOf(d.date.getTime()) >= 0; });

	tslaCircles = svg.selectAll("circles")
	 .data(imptData)
	 .enter()
	 .append("circle")
	 .attr("cx", function (d) { return x(d.date); })
	 .attr("cy", function (d) { return y(d.tsla); })
	 .attr("r", 4)
	 .attr("stroke", "#8f1d14")
	 .attr("fill", "white")
	 .attr("stroke-width", 2)




	// sticky annotations
	var annIpoArea = svg.append("g")
		.attr("transform", "translate(" + x(imptDates[0]) + "," + ( 3 * height / 4) + ")")
		.attr("id", "ann1")
	var annIpoTextArea = annIpoArea.append("text")
		.attr("class", "tooltip")
	annIpoTextArea.append("tspan")
	 .attr("x", 0)
	 .text("TSLA IPOs for $17/shr")
	annIpoTextArea.append("tspan")
	 .attr("x", 0)
	 .attr("dy", "1.2em")
	 .text("on June 29, 2010")

	var lineData = [ { "x": 10, "y": ( 3.3 * height / 4 )}, {"x": x(imptDates[0]), "y": y(30)} ]
	var annIpoPath = svg.append("path")
	 .datum(lineData)
	 .attr("stroke", "#666666")
	 .attr("fill", "none")
	 .attr("d", d3.line()
		    .x( function(d)  { return d.x; })
		    .y( function(d) { return d.y; })
	  )

	var xPos = x(imptDates[1]) + (x(imptDates[2]) - x(imptDates[1])) / 2
	var annMidArea = svg.append("g")
		.attr("transform", "translate(" + xPos + "," + ( 2 * height / 3) + ")")
		.attr("id", "ann2")
	var annMidTextArea = annMidArea.append("text")
		.attr("class", "tooltip")
	annMidTextArea.append("tspan")
	 .attr("x", 0)
	 .style("text-anchor", "middle")
	 .text("TSLA (30%) greatly underperforms SPY (63.6%) in returns")
	annMidTextArea.append("tspan")
	 .attr("x", 0)
	 .attr("dy", "1.2em")
	 .style("text-anchor", "middle")
	 .text("for more than 5 years after first hitting $200 on Feb. 18, 2014")

	var lineData = [ { "x": xPos, "y": ( 2.2 * height / 3 )}, {"x": xPos, "y": y(250)} ]
	var annMidPath = svg.append("path")
	 .datum(lineData)
	 .attr("stroke", "#666666")
	 .attr("fill", "none")
	 .attr("d", d3.line()
		    .x( function(d)  { return d.x; })
		    .y( function(d) { return d.y; })
	  )


	var xPos = x(imptDates[2]) - 200
	var annLastArea = svg.append("g")
		.attr("transform", "translate(" + xPos + "," + y(1400) + ")")
		.attr("id", "ann3")
	var annLastTextArea = annLastArea.append("text")
		.attr("class", "tooltip")
	annLastTextArea.append("tspan")
	 .attr("x", 0)
	 .text("TSLA up 435% since reporting their")
	annLastTextArea.append("tspan")
	 .attr("x", 0)
	 .attr("dy", "1.2em")
	 .text("last quarterly loss on Jul. 24, 2019")

	var lineData = [ 
		{ "x": xPos + 100, "y": 75}, 
		{ "x": xPos + 100, "y": y(1200)}, 
		{ "x": x(imptDates[2]), "y": y(1200)},]
	var annLastPath = svg.append("path")
	 .datum(lineData)
	 .attr("stroke", "#666666")
	 .attr("fill", "none")
	 .attr("d", d3.line()
		    .x( function(d)  { return d.x; })
		    .y( function(d) { return d.y; })
	  )

	// Events
	spyPath
	 .clone()
     .attr('stroke', 'transparent').attr('stroke-width', 10)  // Make hover area bigger
	 .on("mouseover", 
		function () {
			spyPath.style("opacity", 1)
			tslaPath.style("opacity", 0.3)
			tslaCircles.style("opacity", 0.3)
			annIpoArea.style("opacity", 0.3)
			annMidArea.style("opacity", 0.3)
			annLastArea.style("opacity", 0.3)
		}
	 )
	 .on("mouseout",
	 	function () {
	 		spyPath.style("opacity", 0.3)
	 		tslaPath.style("opacity", 1.0)
	 		tslaCircles.style("opacity", 1.0)
	 		annIpoArea.style("opacity", 1.0)
			annMidArea.style("opacity", 1.0)
			annLastArea.style("opacity", 1.0)
	 	}

	 )

	tslaPath
	 .clone()
     .attr('stroke', 'transparent').attr('stroke-width', 10)
	 .on("mouseover", 
		function () {
			tslaPath.style("opacity", 1)
			spyPath.style("opacity", 0.3)
		}
	 )

	tslaCircles
	 .on("mouseover", showTooltip)
	 .on("mouseout", removeTooltip)

	zoomInRect
	 .on("mouseover", function() { 
	 	return d3.select(this).style("opacity", 1) 
	 })
	  .on("mouseout", function() { 
	 	return d3.select(this).style("opacity", 0.5) 
	 })
	  .on("click", stockPricesZoom)

	function showTooltip(d, i) {
		var xLoc = x(d.date)
		if (xLoc > width - 100) {
			xLoc = xLoc - 100
		}

		var yLoc = y(d.tsla) - 20
		if (yLoc < 20) {
			yLoc = yLoc + 50
		}

		var tooltipArea = svg.append("g")
		 	.attr("transform", "translate(" + xLoc + "," + yLoc + ")")
		 	.attr("id", "tooltip" + i)

		var textArea = tooltipArea.append("text")
			.attr("class", "tooltip")

		textArea.append("tspan")
		 .attr("x", 0)
		 .text("TSLA: $" + d.tsla.toFixed(2))

		textArea.append("tspan")
		 .attr("x", 0)
		 .attr("dy", "1.2em")
		 .text("SPY: $" + d.spy.toFixed(2))

		//https://stackoverflow.com/questions/15500894/background-color-of-text-in-svg/16873128#16873128
		textElm = document.getElementById("tooltip" + i),
		SVGRect = textElm.getBBox();

		var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		    rect.setAttribute("x", SVGRect.x + xLoc);
		    rect.setAttribute("y", SVGRect.y + yLoc);
		    rect.setAttribute("width", SVGRect.width);
		    rect.setAttribute("height", SVGRect.height);
		    rect.setAttribute("fill", "white");
		    rect.setAttribute("id", "tooltipRect" + i);
		    svg.node().insertBefore(rect, textElm);

		d3.select(this).attr("r", 8)
		 .attr("stroke", "black")
	 	 .attr("fill", "#8f1d14")
		 
	}

	function removeTooltip(d, i) {
		d3.select("#tooltip" + i).remove();
		d3.select("#tooltipRect" + i).remove();
		d3.select(this).attr("r", 4)
		 .attr("stroke", "#8f1d14")
	 	 .attr("fill", "white")
	}

	// Transition
	var curtain = svg.append('rect')
	    .attr('x', -1 * (width + 10))
	    .attr('y', -1 * height)
	    .attr('height', height)
	    .attr('width', width + 10)
	    .attr('class', 'curtain')
	    .attr('transform', 'rotate(180)')
	    .style('fill', '#ffffff')

	  /* Optionally add a guideline */
	  var guideline = svg.append('line')
	    .attr('stroke', '#333')
	    .attr('stroke-width', 1)
	    .attr('class', 'guide')
	    .attr('x1', 1)
	    .attr('y1', 1)
	    .attr('x2', 1)
	    .attr('y2', height)

	  /* Create a shared transition for anything we're animating */
	  var t = svg.transition()
	    .delay(250)
	    .duration(3000)
	    .ease(d3.easeLinear)
	    .on('end', function() {
	      d3.select('line.guide')
	        .transition()
	        .style('opacity', 0)
	        .remove()
	    });

	  t.select('rect.curtain')
	    .attr('width', 0);
	  t.select('line.guide')
	    .attr('transform', 'translate(' + width + ', 0)')

	function stockPricesZoom() {

		document.getElementById("intro_text")
	 	 .getElementsByTagName("P")[0].innerHTML = '<a href="https://www.reuters.com/article/us-tesla-stocks-s-p-500-analysis/tesla-appears-poised-to-electrify-sp-500-idUSKBN24A34D">The reason</a> for the surge is said to be four straight consecutive quarters of profit, a first for Tesla, and a requirement to be included in the S&#38;P500.<br><br>While Tesla has long since fulfilled the market cap requirements, it has only recently become consistently profitable.<br><br><a href="./mcaps.html">See how Tesla stacks up against the S&#38;P500 >></a>';
		
		d3.select("#stock_chart").remove()

		// annotations
		var imptDates = [
			(d3.timeParse("%Y%m%d")("20191023")).getTime(),  // IPO
			(d3.timeParse("%Y%m%d")("20200129")).getTime(),  // hits 200 for the first time
			(d3.timeParse("%Y%m%d")("20200429")).getTime(),  // Last bad earnings
			(d3.timeParse("%Y%m%d")("20200722")).getTime()   // 4 straight profitable quarters
		]
		var imptData = data.filter(function(d) { return imptDates.indexOf(d.date.getTime()) >= 0; });

		var margin = {top: 10, right: 30, bottom: 60, left: 60},
	    width = 700 - margin.left - margin.right,
	    height = 400 - margin.top - margin.bottom;

		var svg = d3.select("#bottom_section")
		  .append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform",
		          "translate(" + margin.left + "," + margin.top + ")");

		var zoomInRect = svg.append('rect')
		    .attr('x', 0)
		    .attr('y', 0)
		    .attr('height', height)
		    .attr('width', width)
		    //.attr('transform', 'rotate(180)')
		    .attr("class", "earnings")
		    .style("opacity", 0.5)

		var legendArea = svg.append("g")
		 .attr("transform", "translate(20, 40)")

		var legendText = legendArea.append("text")

		legendText.append("tspan")
		 .attr("class", "tsla")
		 .attr("x", 0)
		 .text("Tesla (TSLA)")

		legendText.append("tspan")
		 .attr("class", "other")
		 .text(" vs ")

		legendText.append("tspan")
		 .attr("class", "spy")
		 .attr("x", 0)
		 .attr("dy", "1.5em")
		 .text("S&P500 (SPY)")

		var mindate = new Date(2019, 7, 24),  // Last bad earnings
		    maxdate = new Date(2020, 7, 30);  // End of week after earnings
		var filteredData = data.filter(function(d) {
			return (d.date >= mindate) && (d.date <= maxdate)
		})

		var x = d3.scaleTime()
		 .domain([mindate, maxdate])
		 .range([0, width])
		svg.append("g")
		 .attr("transform", "translate(0," + height + ")")
		 .call(d3.axisBottom(x).ticks(5))
		 .selectAll("text")
		  .attr("class", "tooltip")

		// x-axis label
		svg.append("text")             
		  .attr("transform",
		        "translate(" + (width/2) + " ," + 
		                       (height + margin.top + margin.bottom / 2) + ")")
		  .style("text-anchor", "middle")
		  .attr("class", "tooltip")
	      .style("font-size", "0.9em")
		  .text("Date")

		var y = d3.scaleLinear()
		 .domain([0, d3.max(filteredData, function (d) { return d.tsla })])
		 .range([height, 0])
		svg.append("g")
		 .call(d3.axisLeft(y))
		 .selectAll("text")
		  .attr("class", "tooltip")

		// y-axis label
		svg.append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y",0 - margin.left)
	        .attr("x",0 - (height / 2))
	        .attr("dy", "1em")
	        .attr("class", "tooltip")
	        .style("text-anchor", "middle")
	        .text("Price ($)");

		spyPath = svg.append("path")
		 .datum(filteredData)
		  .attr("stroke", "#3282b8")
		  .attr("fill", "none")
		  .attr("stroke-width", 2)
		  .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
		  .attr("d", d3.line()
			    .x( function(d)  { return x(d.date); })
			    .y( function(d) { return y(d.spy); })
		  )
		  .style("opacity", 0.3)

		tslaPath = svg.append("path")
		 .datum(filteredData)
		  .attr("stroke", "#8f1d14")
		  .attr("fill", "none")
		  .attr("stroke-width", 2)
		  .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
		  .attr("d", d3.line()
			    .x( function(d)  { return x(d.date); })
			    .y( function(d) { return y(d.tsla); })
		  )

		tslaCircles = svg.selectAll("circles")
		 .data(imptData)
		 .enter()
		 .append("circle")
		 .attr("cx", function (d) { return x(d.date); })
		 .attr("cy", function (d) { return y(d.tsla); })
		 .attr("r", 4)
		 .attr("stroke", "#8f1d14")
		 .attr("stroke-width", 2)
		 .attr("class", "earnings")


		// sticky annotations
		var annArea = svg.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 4 + ")")
			.attr("id", "ann0")
		var annTextArea = annArea.append("text")
			.attr("class", "tooltip")
		annTextArea.append("tspan")
		 .attr("x", 0)
		 .style('text-anchor', 'middle')
		 .text("TSLA reports 4 straight profitable quarters")
		annTextArea.append("tspan")
		 .attr("x", 0)
		 .attr("dy", "1.2em")
		 .style('text-anchor', 'middle')
		 .text("Q3 2019 to Q2 2020")

		// Events
		spyPath
		 .clone()
	     .attr('stroke', 'transparent').attr('stroke-width', 10)  // Make hover area bigger
		 .on("mouseover", 
			function () {
				spyPath.style("opacity", 1)
				tslaPath.style("opacity", 0.3)
				tslaCircles.style("opacity", 0.3)
				annArea.style("opacity", 0.3)
			}
		 )
		 .on("mouseout",
		 	function () {
		 		spyPath.style("opacity", 0.3)
		 		tslaPath.style("opacity", 1.0)
		 		tslaCircles.style("opacity", 1.0)
		 		annArea.style("opacity", 1.0)
		 	}

		 )

		tslaPath
		 .clone()
	     .attr('stroke', 'transparent').attr('stroke-width', 10)
		 .on("mouseover", 
			function () {
				tslaPath.style("opacity", 1)
				spyPath.style("opacity", 0.3)
			}
		 )

		tslaCircles
		 .on("mouseover", showTooltip)
		 .on("mouseout", removeTooltip)


		function showTooltip(d, i) {
			var xLoc = x(d.date)
			if (xLoc > width - 100) {
				xLoc = xLoc - 100
			}

			var yLoc = y(d.tsla) - 20
			if (yLoc < 20) {
				yLoc = yLoc + 50
			}

			var tooltipArea = svg.append("g")
			 	.attr("transform", "translate(" + xLoc + "," + yLoc + ")")
			 	.attr("id", "tooltip" + i)

			var textArea = tooltipArea.append("text")
				.attr("class", "tooltip")

			textArea.append("tspan")
			 .attr("x", 0)
			 .text("TSLA: $" + d.tsla.toFixed(2))

			textArea.append("tspan")
			 .attr("x", 0)
			 .attr("dy", "1.2em")
			 .text("SPY: $" + d.spy.toFixed(2))

			//https://stackoverflow.com/questions/15500894/background-color-of-text-in-svg/16873128#16873128
			textElm = document.getElementById("tooltip" + i),
			SVGRect = textElm.getBBox();

			var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			    rect.setAttribute("x", SVGRect.x + xLoc);
			    rect.setAttribute("y", SVGRect.y + yLoc);
			    rect.setAttribute("width", SVGRect.width);
			    rect.setAttribute("height", SVGRect.height);
			    rect.setAttribute("fill", "white");
			    rect.setAttribute("id", "tooltipRect" + i);
			    svg.node().insertBefore(rect, textElm);

			d3.selectAll("circle").attr("r", 8)
			 .attr("stroke", "black")
		 	 .attr("fill", "#8f1d14")
			 
			d3.select("#ann0")
			 .attr("font-weight", "bold")
		}

		function removeTooltip(d, i) {
			d3.select("#tooltip" + i).remove();
			d3.select("#tooltipRect" + i).remove();
			d3.selectAll("circle").attr("r", 4)
			 .attr("stroke", "#8f1d14")
		 	 .attr("fill", "white")

		 	d3.select("#ann0")
			 .attr("font-weight", "normal")
		}
	}
}


