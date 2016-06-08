function drawMap (data) {
	"use strict";

	var margin = 70,
		width = 1050,
		height = 655,
		barWidth = 13,
		barHeight = 50,
		barMargin = 2;

	var positions = {
		"South America": {
			"x": 210,
			"y": 510
		},
		"North America": {
			"x": 105,
			"y": 380
		},
		"Europe": {
			"x": 405,
			"y": 260
		},
		"Africa": {
			"x": 460,
			"y": 485
		},
		"Asia": {
			"x": 950,
			"y": 300
		},
		"Oceania": {
			"x": 740,
			"y": 520
		}
	};

	var dataset = [
		{
			"id": 1,
			"path": "data/dataset_1.json"
		},
		{
			"id": 2,
			"path": "data/dataset_2.json"
		},
		{
			"id": 3,
			"path": "data/dataset_3.json"
		}
	];	

	var svg = d3.select(".map-holder")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("class", "map");

	var map = svg.selectAll("path")
		.data(data)
		.enter()
		.append("path")
		.attr("d", function (d) {
			return d.path;
		})
		.attr("stroke", "#222")
		.attr("stroke-width", 0.7)
		.attr("class", function (d) {
			return d.id;
		});

	var buttonsHolder = d3.select(".map-holder")
		.append("div")
		.attr("class", "buttons-holder");

	var buttons = buttonsHolder.selectAll("button")
			.data(dataset)
			.enter()
			.append("button")
			.attr("class", "button")
			.text(function (d) {
				return "request " + d.id;
			});

	var legend = svg.append("g");

	legend.append("rect")
		.attr("class", "legend")
		.attr("width", barWidth)
		.attr("height", 15)
		.attr("fill", "red")
		.attr("x", width - 150)
		.attr("y", 10);

	legend.append("rect")
		.attr("class", "legend")
		.attr("width", barWidth)
		.attr("height", 12)
		.attr("fill", "green")
		.attr("x", width - 150)
		.attr("y", 30);

	legend.append("text")
		.attr("x", width - 130)
		.attr("y", 20)
		.text("- share stress on");

	legend.append("text")
		.attr("x", width - 130)
		.attr("y", 40)
		.text("- share stress off");


	d3.json("../data/dataset_1.json", drawBarCharts);

	function drawBarCharts (data) {
		var shareStressValues = [];

		data.forEach(function (obj) {
			shareStressValues.push(obj["share_stress_off"]);
			shareStressValues.push(obj["share_stress_on"]);
		});

		var y = d3.scale.linear()
			.range([barHeight, 0])
			.domain([0, d3.max(shareStressValues)]);		

		buttons.on("click", function (d) {
			d3.select(".buttons-holder")
				.selectAll("button")
				.transition()
				.duration(300)
				.attr("class", "button");

			d3.select(this)
				.transition()
				.duration(300)
				.attr("class", "button active");

			d3.json(d.path, update);
		});				

		var nested = d3.nest()
			.key(function (d) {
				return d.continent;
			})
			.sortKeys(d3.ascending)
			.entries(data);

		var group = svg.selectAll("g.bar-chart")
			.data(nested)
			.enter()
			.append("g")
			.attr("class", "bar-chart");

		group.append("rect")
			.attr("class", "stress-on")
			.attr("width", barWidth)
			.attr("height", function (d) {
				return barHeight - y(d.values[0]["share_stress_on"]);
			})
			.attr("fill", "red")
			.attr("x", function (d) {
				return positions[d.key].x;
			})
			.attr("y", function (d) {
				return positions[d.key].y + y(d.values[0]["share_stress_on"]);
			});

		group.append("rect")
			.attr("class", "stress-off")
			.attr("width", barWidth)
			.attr("height", function (d) {
				return barHeight - y(d.values[0]["share_stress_off"]);
			})
			.attr("fill", "green")
			.attr("x", function (d) {
				return positions[d.key].x + barWidth + barMargin;
			})
			.attr("y", function (d) {
				return positions[d.key].y + y(d.values[0]["share_stress_off"]);
			});

		group.selectAll("rect.stress-on")
			.on("mouseover", function (d)  {
				var x = positions[d.key].x;
				var value = d.values[0]["share_stress_on"];
				group.append("text")
					.attr("class", "label stress-on")
					.attr("x", x)
					.attr("y", positions[d.key].y + y(value) - 3)
					.text(function (d) {
						return value;
					})
					.attr("text-anchor", "start")
					.attr("opacity", 0)
					.transition()
					.duration(400)
					.attr("opacity", 1);
			});

		group.selectAll("rect.stress-off")
			.on("mouseover", function (d)  {
				var x = positions[d.key].x + barWidth + barMargin;
				var value = d.values[0]["share_stress_off"];
				group.append("text")
					.attr("class", "label stress-off")
					.attr("x", x)
					.attr("y", positions[d.key].y + y(value) -3)
					.text(function (d) {
						return value;
					})
					.attr("text-anchor", "start")
					.attr("opacity", 0)
					.transition()
					.duration(400)
					.attr("opacity", 1);
			});

		group.selectAll("rect")
			.on("mouseout", function (d) {
				group.selectAll(".label")
					.remove();
			})

		var labels = group.append("text")
			.attr("x", function (d, i) {
				return positions[d.key].x - 5;
			})
			.attr("y", function (d, i) {
				return positions[d.key].y + barHeight;
			})
			.text(function (d, i) {
				return d.key;
			})
			.attr("text-anchor", "end");

		group.each(function (d) {
			var groupSize =	this.getBBox();

			d3.select(this).append("line")
				.attr("x1", groupSize.x)
				.attr("x2", groupSize.x + groupSize.width)
				.attr("y1", groupSize.y + groupSize.height + 2)
				.attr("y2", groupSize.y + groupSize.height + 2)
				.attr("class", "underline");
		});	

		function update(dataset) {
			var nested = d3.nest()
			.key(function (d) {
				return d.continent;
			})
			.sortKeys(d3.ascending)
			.entries(dataset);

			var onBars = svg.selectAll("rect.stress-on");

			var offBars = svg.selectAll("rect.stress-off");					

			onBars.data(nested)
				.attr("x", function (d) {
					return positions[d.key].x;
				})
				.attr("y", function (d) {
					return positions[d.key].y + y(d.values[0]["share_stress_on"]);
				})
				.attr("height", 0)
				.transition()
				.duration(300)
				.attr("height", function (d) {
					return barHeight - y(d.values[0]["share_stress_on"]);
				});

			offBars.data(nested)
				.attr("x", function (d) {
					return positions[d.key].x + barWidth + barMargin;
				})
				.attr("y", function (d) {
					return positions[d.key].y + y(d.values[0]["share_stress_off"]);
				})
				.attr("height", 0)
				.transition()
				.duration(300)
				.attr("height", function (d) {
					return barHeight - y(d.values[0]["share_stress_off"]);
				});			
		}
	}
}

d3.json("data/world_contitents.json", drawMap);