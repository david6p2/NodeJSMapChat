var map;
var i=0;
var puntos = new Array;
var lat;
var lon;
var geocoder;
var infowindow = new google.maps.InfoWindow();
var markers = {};

function inicio() {
	//requestGeoLocation();
}

//Geolocation Code
function requestGeoLocation() {
	navigator.geolocation.watchPosition(locatedOK, locatedError,
	 {
		highAccuracy: true 
	 });
}

function locatedOK(data) {
	/*document.getElementById("output").innerHTML = 
		data.coords.latitude + ", " + data.coords.longitude + "<br>" +
		data.coords.accuracy;*/
		lat = data.coords.latitude;
		lon = data.coords.longitude;
		console.log ("locatedOK");
		console.log (lat+ " " + lon);
		var gpsOn = true;
		drawAndCenterMap(lat,lon,gpsOn);
		var info = {"latitud" : lat, "longitud" : lon, "name" : nickname};
		socket.emit("mapLocation", info);
}

function locatedError(datos) {
	alert("Error");	
	var gpsOn = false;
	drawAndCenterMap(48.85710754499346,2.3512039184570312,gpsOn);
}

//Geolocation code End
function getAddressFromGoogleMapsWithLatitudeAndLongitude(latitude,longitude,gpsOn){


}
//Draw and Center Map
function drawAndCenterMap(latitude,longitude,gpsOn){
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(latitude,longitude);
	var mapZoom;
	if (gpsOn) {
		mapZoom = 18;
	}else{
		mapZoom = 10;
	}
    var opciones = {
        zoom: mapZoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("elMapa"), opciones);
    ponerMarca(latlng,nickname);
    //codeLatLngNickname(latitude,longitude, nickname);
    //traerDireccionDeGoogleMaps(latitude,longitude);
    //codeLatLng(latitude,longitude);
    //i = traerFotosDeFlikr(latitude,longitude,-1);
    
    //Traer fotos cercanas a la latLng donde se da click
    /*
    google.maps.event.addListener(map, 'click', 
		function(event) {	
			puntos[i] = event.latLng;*/
			/*var valores = document.getElementById("valores");valores.innerHTML = "";var p = document.createElement("p");p.innerHTML = "(" + puntos[i].lat() + ", " + puntos[i].lng() + ") " + i;valores.appendChild(p);*/
			/*ponerMarca(event.latLng);
			i = traerFotosDeFlikr(puntos[i].lat(),puntos[i].lng(),i);
		}
	);
	*/
}
//Poner marca con la direccion en el Mapa
function codeLatLng(lat,lon) {
    var latlng = new google.maps.LatLng(lat, lon);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          map.setZoom(11);
          marker = new google.maps.Marker({
              position: latlng,
              map: map
          });
          infowindow.setContent(results[1].formatted_address);
          infowindow.open(map, marker);
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
}
//Poner marca con el nickname en el Mapa
function codeLatLngNickname(lat,lon, nickname) {
    var latlng = new google.maps.LatLng(lat, lon);
	if (nickname) {
		infowindow.setContent('<p>'+nickname+'</p>');
	} else {
	    alert("No hay nickname aún.");
	}
}
//Poner marcador en el Mapa en la loc
function ponerMarca(loc, nickname) {
	var marca = new google.maps.Marker({
		title: nickname,
		position: loc,
		map: map
	});
	if(nickname){
		var ventana = new google.maps.InfoWindow(
				{ content: '<p>'+nickname+'</p>'//,
					//size: new google.maps.Size(50,50)
				});
		google.maps.event.addListener(marca, 'click', function() {
			ventana.open(map,marca);
		});
	}
	return marca;

	/*var ventana = new google.maps.InfoWindow(
				{ content: loc.toString(),
					size: new google.maps.Size(50,50)
				});
	ventana.open(map,marca);*/
}

socket.on("location update", function(info){
	console.log("The new");
	console.log("location update " + info.name + " " + info.latitud + " " + info.longitud);
	var marker = markers[info.name]
	if(marker){
		marker.setPosition(new google.maps.LatLng(info.latitud,info.longitud));
	}else{
		var latlng = new google.maps.LatLng(info.latitud,info.longitud);
		markers[info.name] = ponerMarca(latlng, info.name);
	}
});

function traerDireccionDeGoogleMaps(lat,lon) {
	var consulta = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+ lat +","+ lon +"&sensor=true";
	alert("Vamos a llamar a Google Maps");
	$.getJSON(consulta,
		function(data) {
			console.log(data);
			console.log(data.status);
			alert(data);
			/*
		  	$.each(data.photos.photo, 
			  	function(i,photo){
				  	var imagen = "http://farm"+photo.farm+".staticflickr.com/"+photo.server+"/"+photo.id+"_"+photo.secret+"_q.jpg";
			      	$("<img/>").attr("src", imagen).prependTo("#images");
				}
			);
			*/
		})
	.success(function() { 
		alert("second success"); 
	})
	.error(function(data) { 
		alert(error); 
	})
	.complete(function() { 
		alert("complete"); 
	});


}



function traerFotosDeFlikr(lat,lon,i) {
	var consulta = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=f14ddb838d90a8af5a03b62d17031f76&min_taken_date=1998-01-01&lat=" + lat + "&lon="+ lon +"&radius=10&radius_units=km&per_page=5&format=json&nojsoncallback=1";
	i++;
	$.getJSON(consulta,
		function(data) {
		  	$.each(data.photos.photo, 
			  	function(i,photo){
				  	var imagen = "http://farm"+photo.farm+".staticflickr.com/"+photo.server+"/"+photo.id+"_"+photo.secret+"_q.jpg";
			      	$("<img/>").attr("src", imagen).prependTo("#images");
				}
			);
		}
	);
	return i;	
}



function mostrarPuntos(vector) {
	var divVector = document.getElementById("divVector");
	divVector.innerHTML = "";
	for (j=0;j<vector.length;j++){
		var parrafo = document.createElement("p");
		parrafo.innerHTML = vector[j].toString();
		divVector.appendChild(parrafo);
	}
}