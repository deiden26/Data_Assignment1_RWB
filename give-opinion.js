// Need a seperate js form for giving opinion

$(document).ready(function() {
	var lat, long;
		// From Google maps API
		if(navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position) {
		      lat = position.coords.latitude;
		      long = position.coords.longitude;
		      $("#latitude").val(lat);
		      $("#longitude").val(long);
		    });
	  	}
	  	// Browser doesn't support Geolocation
	  	else {
	    	alert("Geolocation is not turned on");
	  	}
});