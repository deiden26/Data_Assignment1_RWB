/* jshint strict: false */
/* global $: false, google: false */
//
// Red, White, and Blue JavaScript 
// for EECS 339 Project A at Northwestern University
//
// Originally by Peter Dinda
// Sanitized and improved by Ben Rothman
//
//
// Global state
//
// html    - the document itself ($. or $(document).)
// map     - the map object
// usermark- marks the user's position on the map
// markers - list of markers on the current map (not including the user position)
//
//

//
// When the document has finished loading, the browser
// will invoke the function supplied here.  This
// is an anonymous function that simply requests that the 
// brower determine the current position, and when it's
// done, call the "Start" function  (which is at the end
// of this file)
// 
//
$(document).ready(function() {
	navigator.geolocation.getCurrentPosition(Start);
	$('form input[type="checkbox"]').each(function (){
		if($(this).hasClass('whatBox')){
			$(this).attr('checked', true);
		}
	});
	$('form input[type="checkbox"]').each(function (){
		if($(this).hasClass('cycleBox') && $(this).val() === "1112"){
			$(this).attr('checked', true);
		}
		else if ($(this).hasClass('cycleBox')){
			$(this).attr('checked', false);
		}
	});
});

function mixColors(color1, color2, ratio)
{
	var color1RGB = 
	{
		red: parseInt(color1.substring(0,2) ,16),
		green: parseInt(color1.substring(2,4) ,16),
		blue: parseInt(color1.substring(4,6) ,16)
	};
	var color2RGB = 
	{
		red: parseInt(color2.substring(0,2) ,16),
		green: parseInt(color2.substring(2,4) ,16),
		blue: parseInt(color2.substring(4,6) ,16)
	};
	var colorMix = 
	{
		red: Math.floor(ratio*color1RGB.red + (1-ratio)*color2RGB.red),
		green: Math.floor(ratio*color1RGB.green + (1-ratio)*color2RGB.green),
		blue: Math.floor(ratio*color1RGB.blue + (1-ratio)*color2RGB.blue)
	};

	var colorMixString = colorMix.red.toString(16) + colorMix.green.toString(16) + colorMix.blue.toString(16);
	return colorMixString;
}

// Global variables
var map, usermark, markers = [],
// UpdateMapById draws markers of a given category (id)
// onto the map using the data for that id stashed within 
// the document.
UpdateMapById = function(id, tag) {
// the document division that contains our data is #committees 
// if id=committees, and so on..
// We previously placed the data into that division as a string where
// each line is a separate data item (e.g., a committee) and
// tabs within a line separate fields (e.g., committee name, committee id, etc)
// 
// first, we slice the string into an array of strings, one per 
// line / data item
	if ($("#"+id).html() != null)
	{
		var rows  = $("#"+id).html().split("\n");

	// then, for each line / data item
		for (var i=0; i<rows.length; i++) {
	// we slice it into tab-delimited chunks (the fields)
			var cols = rows[i].split("\t"),
	// grab specific fields like lat and long
				lat = cols[0],
				long = cols[1];

	// then add them to the map.   Here the "new google.maps.Marker"
	// creates the marker and adds it to the map at the lat/long position
	// and "markers.push" adds it to our list of markers so we can
	// delete it later 
			markers.push(new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(lat,long),
				title: tag+"\n"+cols.join("\n")
			}));

		}
	}
},

//
// ClearMarkers just removes the existing data markers from
// the map and from the list of markers.
//
ClearMarkers = function() {
	// clear the markers
	while (markers.length>0) {
		markers.pop().setMap(null);
	}
},

//
// UpdateMap takes data sitting in the hidden data division of 
// the document and it draws it appropriately on the map
//
UpdateMap = function() {
// We're consuming the data, so we'll reset the "color"
// division to white and to indicate that we are updating
	var committeeSummary = $("#committeeSummary");
	var committeeSummaryContent = $("#committeeSummary .content");
	committeeSummary.css("background-color", "white");
	committeeSummaryContent.html("<blink>Updating Display...</blink>");

	var individualSummary = $("#individualSummary");
	var individualSummaryContent = $("#individualSummary .content");
	individualSummary.css("background-color", "white");
	individualSummaryContent.html("<blink>Updating Display...</blink>");

	var opinionSummary = $("#opinionSummary");
	var opinionSummaryContent = $("#opinionSummary .content");
	opinionSummary.css("background-color", "white");
	opinionSummaryContent.html("<blink>Updating Display...</blink>");

// Remove any existing data markers from the map
	ClearMarkers();

// Then we'll draw any new markers onto the map, by category
// Note that there additional categories here that are 
// commented out...  Those might help with the project...
//
	UpdateMapById("committee_data","COMMITTEE");
	UpdateMapById("candidate_data","CANDIDATE");
	UpdateMapById("individual_data", "INDIVIDUAL");
	UpdateMapById("opinion_data","OPINION");

//Initialize the color variables
	var colorMix;
	var ratio;

//If there is committee summary data...
	if (!!document.getElementById("committee_summary_data"))
	{
		//Get the data
		var committeeSummaryData = {};
		var rows  = $("#committee_summary_data").html().split("\n");
		for (var i=0; i<rows.length; i++)
		{
			var cols = rows[i].split("\t");
			committeeSummaryData[cols[0]] = cols[1];
		}

		//Put the data in a div
		if (!!document.getElementById("committeeScaleError"))
			committeeSummaryContent.html("Republican: $"+committeeSummaryData['Republican']+"\tDemocrat: $"+committeeSummaryData['Democrat']+"\tOther: $"+committeeSummaryData['Other']+"\tNotice: fewer than 30 data points");
		else
			committeeSummaryContent.html("Republican: $"+committeeSummaryData['Republican']+"\tDemocrat: $"+committeeSummaryData['Democrat']+"\tOther: $"+committeeSummaryData['Other']);
		
		//color the div
		if (committeeSummaryData['Republican'] == 0 && committeeSummaryData['Democrat'] == 0)
			colorMix = "ffffff";
		else
		{
			ratio = Number(committeeSummaryData['Republican'])/(Number(committeeSummaryData['Republican']) + Number(committeeSummaryData['Democrat']));
			colorMix = mixColors("FF6666", "6699FF", ratio); //red, blue, ratio
		}
		committeeSummary.css("background-color", "#"+colorMix);

	}
	else
	{
		committeeSummaryContent.html("Error: query failed");
	}

//If there is individual summary data...
	if (!!document.getElementById("individual_summary_data"))
	{
		//get the data
		var individualSummaryData = {};
		rows  = $("#individual_summary_data").html().split("\n");
		for (var i=0; i<rows.length; i++)
		{
			var cols = rows[i].split("\t");
			individualSummaryData[cols[0]] = cols[1];
		}

		//put the data in a div
		if (!!document.getElementById("individualScaleError"))
			individualSummaryContent.html("Republican: $"+individualSummaryData['Republican']+"\tDemocrat: $"+individualSummaryData['Democrat']+"\tOther: $"+individualSummaryData['Other']+"\tNotice: fewer than 30 data points");
		else
			individualSummaryContent.html("Republican: $"+individualSummaryData['Republican']+"\tDemocrat: $"+individualSummaryData['Democrat']+"\tOther: $"+individualSummaryData['Other']);
	
		//color the div
		if (individualSummaryData['Republican'] == 0 && individualSummaryData['Democrat'] == 0)
			colorMix = "ffffff";
		else
		{
			ratio = Number(individualSummaryData['Republican'])/(Number(individualSummaryData['Republican']) + Number(individualSummaryData['Democrat']));
			colorMix = mixColors("FF6666", "6699FF", ratio); //red, blue, ratio
		}
		individualSummary.css("background-color", "#"+colorMix);
	}
	else
	{
		committeeSummaryContent.html("Error: query failed");
	}

//If there is opinion summary data...
	if (!!document.getElementById("opinion_summary_data"))
	{
		//get the data
		var opinionSummaryData = {};
		rows  = $("#opinion_summary_data").html().replace(/\n|\r/g, "").split("\t");
		opinionSummaryData["total"] = rows[2]; //should just be an int (no rounding)
		if (opinionSummaryData["total"] == 0)
		{
			opinionSummaryData["avg"] = 0;
			opinionSummaryData["avgDemString"] = "0%";
			opinionSummaryData["avgRepString"] = "0%";
			opinionSummaryData["stdDev"] = 0;
			opinionSummaryData["stdDevString"] = "0%";
		}
		else
		{
			opinionSummaryData["avg"] = Math.round(parseFloat(rows[0]) * 10000)/10000; //rounding
			opinionSummaryData["avgDemString"] = opinionSummaryData["avg"]*100 + "%";
			opinionSummaryData["avgRepString"] = 100 - opinionSummaryData["avg"]*100 + "%";
			opinionSummaryData["stdDev"] = Math.round(parseFloat(rows[1]) * 10000)/10000; //rounding
			opinionSummaryData["stdDevString"] = opinionSummaryData["stdDev"]*100 + "%";
		}

		//put the data in a div
		if (!!document.getElementById("opinionScaleError"))
			opinionSummaryContent.html("Democrat: "+opinionSummaryData["avgDemString"]+"\tRepublican: "+opinionSummaryData["avgRepString"]+"\tStandard Deviation: "+opinionSummaryData["stdDevString"]+"\tNumber of Opinions: "+opinionSummaryData["total"]+"\tNotice: fewer than 30 data points");
		else
			opinionSummaryContent.html("Democrat: "+opinionSummaryData["avgDemString"]+"\tRepublican: "+opinionSummaryData["avgRepString"]+"\tStandard Deviation: "+opinionSummaryData["stdDevString"]+"\tNumber of Opinions: "+opinionSummaryData["total"]);
		
		//Color the div
		if (opinionSummaryData['total'] == 0)
			colorMix = "ffffff";
		else
		{
			colorMix = mixColors("FF6666", "6699FF", 1 - opinionSummaryData['avg']); //red, blue, ratio
		}
		opinionSummary.css("background-color", "#"+colorMix);
	}
	else
	{
		committeeSummaryContent.html("Error: query failed");
	}

},

//
// NewData is called by the browser after any request
// for data we have initiated completes
//
NewData = function(data) {
// All it does is copy the data that came back from the server
// into the data division of the document.   This is a hidden 
// division we use to cache it locally
	$("#data").html(data);
// Now that the new data is in the document, we use it to
// update the map
	UpdateMap();
},

//
// The Google Map calls us back at ViewShift when some aspect
// of the map changes (for example its bounds, zoom, etc)
//
ViewShift = function() {
// We determine the new bounds of the map
	var bounds = map.getBounds(),
		ne = bounds.getNorthEast(),
		sw = bounds.getSouthWest();

// Now we need to update our data based on those bounds
// first step is to mark the color division as white and to say "Querying"
	$("#committeeSummary").css("background-color","white");
	$("#committeeSummary .content").html("<blink>Querying...("+ne.lat()+","+ne.lng()+") to ("+sw.lat()+","+sw.lng()+")</blink>");

	$("#individualSummary").css("background-color","white");
	$("#individualSummary .content").html("<blink>Querying...("+ne.lat()+","+ne.lng()+") to ("+sw.lat()+","+sw.lng()+")</blink>");

	$("#opinionSummary").css("background-color","white");
	$("#opinionSummary .content").html("<blink>Querying...("+ne.lat()+","+ne.lng()+") to ("+sw.lat()+","+sw.lng()+")</blink>");

// Now we make a web request.   Here we are invoking rwb.pl on the 
// server, passing it the act, latne, etc, parameters for the current
// map info, requested data, etc.
// the browser will also automatically send back the cookie so we keep
// any authentication state
// 
// This *initiates* the request back to the server.  When it is done,
// the browser will call us back at the function NewData (given above)

	$.get("rwb.pl",
		{
			act:	"near",
			latne:	ne.lat(),
			longne:	ne.lng(),
			latsw:	sw.lat(),
			longsw:	sw.lng(),
			format:	"raw",
			what:	whatValsText,
			cycle: cycleValsText
		}, NewData);
},


//
// If the browser determines the current location has changed, it 
// will call us back via this function, giving us the new location
//
Reposition = function(pos) {
// We parse the new location into latitude and longitude
	var lat = pos.coords.latitude,
		long = pos.coords.longitude;

// ... and scroll the map to be centered at that position
// this should trigger the map to call us back at ViewShift()
//	map.setCenter(new google.maps.LatLng(lat,long));
// ... and set our user's marker on the map to the new position
	usermark.setPosition(new google.maps.LatLng(lat,long));
},


//
// The start function is called back once the document has 
// been loaded and the browser has determined the current location
//
Start = function(location) {
// Parse the current location into latitude and longitude        
	var lat = location.coords.latitude,
	    long = location.coords.longitude,
	    acc = location.coords.accuracy,
// Get a pointer to the "map" division of the document
// We will put a google map into that division
	    mapc = $("#map");

// Create a new google map centered at the current location
// and place it into the map division of the document
	map = new google.maps.Map(mapc[0],
		{
			zoom: 16,
			center: new google.maps.LatLng(lat,long),
			mapTypeId: google.maps.MapTypeId.HYBRID
		});

// create a marker for the user's location and place it on the map
	usermark = new google.maps.Marker({ map:map,
		position: new google.maps.LatLng(lat,long),
		title: "You are here"});

// clear list of markers we added to map (none yet)
// these markers are committees, candidates, etc
	markers = [];

// set the color for "color" division of the document to white
// And change it to read "waiting for first position"
	$("#committeeSummary").css("background-color", "white");
	$("#committeeSummary .content").html("<blink>Waiting for first position</blink>");

	$("#individualSummary").css("background-color", "white");
	$("#individualSummary .content").html("<blink>Waiting for first position</blink>");

	$("#opinionSummary").css("background-color", "white");
	$("#opinionSummary .content").html("<blink>Waiting for first position</blink>");

//
// These lines register callbacks.   If the user scrolls the map, 
// zooms the map, etc, then our function "ViewShift" (defined above
// will be called after the map is redrawn
//
	//google.maps.event.addListener(map,"bounds_changed",ViewShift);
	//google.maps.event.addListener(map,"center_changed",ViewShift);
	//google.maps.event.addListener(map,"zoom_changed",ViewShift);
	google.maps.event.addListener(map,"idle",ViewShift);

//
// Finally, tell the browser that if the current location changes, it
// should call back to our "Reposition" function (defined above)
//
	navigator.geolocation.watchPosition(Reposition);
};


//Function implemented by Craig and Danny
var whatValsText = "committees,candidates,individuals,opinions";
$(function() {
	$('#whatForm .whatBox').click(function() {
		var whatVals = [];
		$('#whatForm :checked').each(function() {
			whatVals.push($(this).val());
		});

		if(whatVals.indexOf( 'committees' ) > -1)
			$('#committeeSummary').show();
		else
			$('#committeeSummary').hide();
		if(whatVals.indexOf( 'individuals' ) > -1)
			$('#individualSummary').show();
		else
			$('#individualSummary').hide();
		if(whatVals.indexOf( 'opinions' ) > -1)
			$('#opinionSummary').show();
		else
			$('#opinionSummary').hide();


		whatValsText = whatVals.join(",");
		ViewShift();
	});
});

var cycleValsText = "('1112')";
$(function() {
	$('#cycleForm .cycleBox').click(function() {
		var cycleVals = [];
		$('#cycleForm :checked').each(function() {
			cycleVals.push("'" + $(this).val() + "'");
		});
		cycleValsText = "("+cycleVals.join(",")+")";
		ViewShift();
	});
});

$(function() {
	$('#giveOpinionForm').submit(function() {
		alert('Yayyy');
	})
})
