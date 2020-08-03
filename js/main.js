async function onInit() {
	
	scene1and2()
}

async function onLinkClick() {

	scene3()
}

function scene1and2() {
	document.querySelector("h1").innerHTML = "Tesla's Electrifying Road to Profitability";
	document.getElementById("intro_text")
	 .getElementsByTagName("P")[0].innerHTML = "Tesla (Ticker: TSLA) has been surging in the past year. It has greatly outperformed the S&#38;P500, a weighted index of the 500 largest publicly traded US companies by market capitalization.";

	var tslaLogo = "https://raw.githubusercontent.com/cslao/2020_cs498/master/img/tsla_logo.png"
	document.getElementById("chart1").innerHTML = '<img src="' + tslaLogo + '" alt="Tesla logo" width="400" height="200">' 

	stockPrices()

}

function scene3() {
	d3.select("#bottom_section")
	 .attr("overflow-x", "scroll")

	document.querySelector("h1").innerHTML = "Where would Tesla fit in the S&#38;P500?";
	document.getElementById("intro_text")
	 .getElementsByTagName("P")[0].innerHTML = "The bar chart below shows the market capitalization of the S&#38;P500 companies, and Tesla, arranged in descending order. <br><br>Can you try to guess which of these is Tesla? Some example companies are given as a reference.";
	document.getElementById("chart1").innerHTML = ''

	snpActual()
}