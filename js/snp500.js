async function snpSample() {

	const data = Object.assign(
		await d3.csv("https://raw.githubusercontent.com/cslao/2020_cs498/master/data/snp_sample_mcap_20200724.csv", d3.autoType))

	symbols = data.map(function (d) { return d.symbol; })
	mcaps = data.map(function (d) { return d.mcap_mm; })

	var margin = {top: 10, right: 10, bottom: 60, left: 60},
    	width = 400 - margin.left - margin.right,
    	height = 200 - margin.top - margin.bottom;

	var svg = d3.select("#chart1")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	var y = d3.scaleBand()
		.domain(symbols)
		.range([height, 0])
		.padding(0.2);

	svg.append("g")
	 .call(d3.axisLeft(y))
	 .call(g => g.select(".domain").remove())
	 .selectAll("text")
	 .attr("class", "tooltip")

	var x = d3.scaleLog()
		.domain([d3.min(mcaps) * 0.95, d3.max(mcaps) * 1.05])
		.range([0, width])
		.base(10)

	svg.append("g")
	 .attr("transform", "translate(0," + height + ")")
	 .call(d3.axisBottom(x)
	 	.tickValues([10000, 100000, 1000000])
	 	)

	// x-axis label
	svg.append("text")             
	  .attr("transform",
	        "translate(" + (width/2) + " ," + 
	                       (height + margin.top + margin.bottom / 2) + ")")
	  .style("text-anchor", "middle")
	  .attr("class", "tooltip")
      .style("font-size", "0.9em")
	  .text("Market Cap (in millions, log scale)")

	var bars = svg.selectAll("snpSample")
	 .data(data)
	 .enter()
	 .append("rect")
	 .attr("class", "snpSample")

	bars
	 .attr("id", function(d) { return "b" + d.symbol; })
	 .attr("width", function(d) { return x(d.mcap_mm); })
	 .attr("height", 15)
	 .attr("x", 0)
	 .attr("y", function(d) { return y(d.symbol); })

	return symbols
}

async function snpActual() {

	var teslaShown = false;
	var sampleSymbols = await snpSample();

	const data = Object.assign(
		await d3.csv("https://raw.githubusercontent.com/cslao/2020_cs498/master/data/snp500_mcap_20200724.csv", d3.autoType))

	var symbols = data.map(function (d) { return d.symbol; })
	var mcaps = data.map(function (d) { return d.mcap_mm; })

	var barWidth = 8
	var margin = {top: 15, right: 30, bottom: 30, left: 60},
    	width = barWidth * symbols.length * 1.1 - margin.left - margin.right,
    	height = 400 - margin.top - margin.bottom;

	var svg = d3.select("#actual_snp")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleBand()
		.domain(symbols)
		.range([0, width])
		.padding(0.2);

	svg.append("g")
	 .attr("transform", "translate(0," + height + ")")
	 .call(d3.axisBottom(x)
	 	.tickValues(sampleSymbols))
	 .call(g => g.select(".domain").remove())
	 .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .attr("class", "tooltip")
      .style("font-size", "0.9em")
      .style("text-anchor", "end");
	 //.attr("opacity", 0)

	var y = d3.scaleLog()
		.domain([d3.min(mcaps) * 0.95, d3.max(mcaps) * 1.05])
		.range([height, 0])
		.base(10)

	svg.append("g")
	 .call(d3.axisLeft(y))
	 .attr("opacity", 0)

	// Tooltips and annotation definitions
	var resultArea = svg.append("g")
						.attr("transform", "translate(" + width / 6 + "," + height / 10 + ")")
						.append("text")
						.style("opacity", 0)

	var mainResult = resultArea.append("tspan").attr("x", 0);
	var subResult1 = resultArea.append("tspan")
							  .attr("x", 0)
							  .attr("dy", "1.6em")
							  .attr("class", "tooltip");
	var subResult2 = resultArea.append("tspan")
							  .attr("x", 0)
							  .attr("dy", "1.2em")
							  .attr("class", "tooltip");
	var subResult3 = resultArea.append("tspan")
							  .attr("x", 0)
							  .attr("dy", "1.2em")
							  .attr("class", "tooltip");	
	var showTeslaBtn = getButton()			  

	var hasSelection = false
	var bars = svg.selectAll("snp500")
				 .data(data)
				 .enter()
				 .append("rect")
				 .attr("class", function(d){ if(
				 	sampleSymbols.indexOf(d.symbol) >= 0
				 	){ return "snpSample"; } else { return "snp500"; }
					})
				 .attr("id", function(d) { return "b" + d.symbol; });
	bars
	 .attr("width", barWidth)
	 .attr("height", function(d) { return height - y(d.mcap_mm); })
	 .attr("x", function(d) { return x(d.symbol); })
	 .attr("y", function(d) { return y(d.mcap_mm); })
	 .on("mouseover", handleMouseOver)
	 .on("mouseout", handleMouseOut)
	 .on("click", displayResult)
	 // .on("mouseover", function() {
  //           d3.select(this)
  //           	.attr("fill", "#c10000");
  //       })
	 // .on("mouseout", function() {
  //           d3.select(this)
  //           	.attr("fill", "#dedede");
  //       })

	var tooltip = svg.append("text")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);


	function handleMouseOver(d, i) {
		// Adapted from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
		if (teslaShown) {
			return;
		}

		if (hasSelection) {
			// clear selection
			bars.attr("class", function(d){ if(
				 	sampleSymbols.indexOf(d.symbol) >= 0
				 	){ return "snpSample"; } else { return "snp500"; }
					})
			clearResult()

		}
		// Use D3 to select element, change color and size
		var isSample = sampleSymbols.indexOf(d.symbol) >= 0;
        d3.select(this)
         .attr("class", "snp500hover");

        tooltip.transition()
       	 .duration(200)
       	 .style("opacity", 1)

       	tooltip
       	 .attr("x", x(d.symbol) - 8)
       	 .attr("y", y(d.mcap_mm) - 5)

        if (isSample) {
        	tooltip.text(d.symbol + "\n (" + formatMcap(d.mcap_mm) + ")")
        	 .attr('font-weight', 'bold');
        	d3.select("#b" + d.symbol)
        	 .attr('class', "snp500hover");
        } else {
        	tooltip.text(formatMcap(d.mcap_mm))
        	 .attr('font-weight', 'normal');

        };
	    // Specify where to put label of text
	    //svg.append("text")
	    // .attr("id", "t" + i)  // Create an id for text so we can select it later for removing on mouseout
	     // .attr("x", x(d.symbol) - 1.5 * barWidth )  // Attempt to center text
	     // .attr("y", y(d.mcap_mm) - 5)  
	     // .attr("class", "tooltip") 
	     // .text(formatMcap(d.mcap_mm));  // Value of the text);
	}

	function handleMouseOut(d, i) {

		if (teslaShown) {
			return;
		}

		var isSample = sampleSymbols.indexOf(d.symbol) >= 0;

		d3.select(this).attr("class", function(d){ if(
			 	isSample
			 	){ return "snpSample"; } else { return "snp500"; }
			})

		tooltip.transition()		
         .duration(200)		
         .style("opacity", 0);	
		
		if (isSample) {
	    	d3.select("#b" + d.symbol)
	    	 .attr('class', "snpSample");
	   	}

	}

	function displayResult(d, i) {
		if (teslaShown) {
			return ;
		}

		sampleSymbols.push(d.symbol)
		showTeslaBtn.transition()
		 .duration(200)
		 .style("opacity", 1)

		hasSelection = true

		if (d.symbol == "TSLA") {
			showTesla()
			mainResult.text("Yes, that is TSLA!")
			 .attr("class", "tsla")
			return;

		} else {
			mainResult.text("No, that is " + d.symbol + ".")
			 .attr("class", "other")
		}

		subResult1
		 .text(d.desc)
		 .attr("font-style", "italic")

		subResult2
		 .text("Market Capitalization: " + formatMcap(d.mcap_mm))

		subResult3
		 .text("Rank: " + i)

		resultArea.transition()
		 .duration(200)
		 .style("opacity", 1)

	}

	function clearResult() {
		// h2 = d3.select("#result_snp")
		//  .select("h2")
		//  .text("")

		// p = d3.select("#result_snp")
		//  .selectAll("p")
		//  .text("")

		hasSelection = false
	}

	function getButton() {
		var showTeslaBtn = d3.select("#intro_text")
							.append("button")
							.style("opacity", 0)
		showTeslaBtn.append("text")
		 .attr("class", "normal")
		 .text("Show me Tesla >>")

		showTeslaBtn
		 .on("mouseover", function() {
		 	if (!teslaShown) {d3.select(this).attr("class", "mouseon")}
		 })
		 .on("mouseout", function() {
		 	if (!teslaShown) {d3.select(this).attr("class", "normal")}
		 })
		 .on("click", showTesla)
		return showTeslaBtn
	}

	function showTesla() {
		var tslaBar = d3.select("#bTSLA")
		 .transition()
		 .duration(500)
		 .attr("class", "tsla")

		var tsla = "TSLA"
		teslaShown = true

		showTeslaBtn.text("Tesla is shown")
		 .attr("class", "disabled")

		tslaIdx = symbols.indexOf(tsla)
		d = data[tslaIdx]

		mainResult.text("This is TSLA")
			 .attr("class", "tsla")
		subResult1
		 .text(d.desc)
		 .attr("font-style", "italic")

		subResult2
		 .text("Market Capitalization: " + formatMcap(d.mcap_mm))

		subResult3
		 .text("Rank: " + tslaIdx)

		resultArea
		 .transition()
		 .duration(1000)
		 .style("opacity", 1)
		 .attr("transform", "translate(" + (width / -6 + x(tsla) - 10) + "," + 0 + ")")

	}
}

function formatMcap(mcap) {
	// Make market cap human readable. mcap is in millions
	if (mcap > 1e6) {  // Trillion
		var divisor = 1e6
		var suffix = 'T'
	} else if (mcap > 1e3) {  // Billion
		var divisor = 1e3
		var suffix = 'B'
	}

	var prefix = (mcap / divisor).toPrecision(3).toString()

	return prefix + suffix
}