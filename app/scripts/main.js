/*
	Happy Tab!
	WIP April 2014
	Jeanelle Mak X Brittney Kernan
*/

// Collection of Cutie Models
// Models are just urls for now
var CutieCollection = [];

// Controller for Collection of URLs
var CutieCollectionController = {
	storageKey : 'URLs',
	// get from localstorage
	// params
	// ----
	// callback {function} *optional what to do collection gotten
	get: function(callback) {
		var self = this;
		chrome.storage.local.get(self.storageKey,function(storage) {
		  // if not, get from server
		  if( self.empty(storage[self.storageKey]) ) 
		  	return self.fetch(callback); // only get's here on first load of extension, otherwise reloads after image is shown
		  else {
		  	if(typeof(callback) == 'function')	
			  	return callback(storage[self.storageKey]);
		  }
		});
	},

	// return one collection model
	// popped from the collection (marked as used)
	// also make sure more are loaded for next time
	// params
	// ----
	// callback {function} *required what to do model gotten
	// returns
	// ----
	// one model
	getOne: function(callback) {
		// get collection from storage
		this.get(function() {
			var model = CutieCollection.pop()
			
			// check for more if array 0 or update array with 1 less item
			if( this.empty(CutieCollection) ) 
		  	this.fetch(); // only get's here on first load of extension, otherwise reloads after image is shown
		  else 
		  	this.set(CutieCollection);	

		  if(typeof(callback) != 'function')
		  	return console.error('CutieCollectionController.getOne requires a callback argument');

		  return callback(model);
		});
	},

	// set to localstorage
	// params
	// ----
	// collection {array} updated collection
	// callback {function} *optional what to do when collection is set
	set: function(collection, callback) {
		chrome.storage.local.set({'URLs': collection}, function() {
			// set local reference
			CutieCollection = collection;

		  // Notify that we saved.
		  message('HappyTab URL array updated, new length: ' + collection.length);
		  
		  // when storage is set
		  if( typeof(callback) == 'function' )
		  	callback();
		});
	},

	// get from server
	// params
	// ----
	// callback {function} what to do collection gotten
	fetch: function(callback) {
		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
		    // string to json/array
		    // coule use collection model to create a new one
		    var array = JSON.parse(xhr.responseText);
		    // save as array to storage	    
		    self.set(array, callback);
		  }
		} 
		xhr.open("GET", chrome.extension.getURL('/scripts/todays-cuties.json'), true);
		xhr.send();
	},

	// check if collection empty
	// params
	// ----
	// obj {Object} empty localstorage set, or array
	empty: function(obj) {
		return obj == undefined || obj == '' || obj.length == 0;
	}
}

// App Controller
var HappyTab = {
	view: document.body,
	init: function() {
		var self = this;
		CutieCollectionController.getOne(self.showCutie);
	},
	showCutie: function(cutie) {
		this.view.style.backgroundImage = 'url(' + cutie + ')';
	}
}

function start() {
	// get cuties then show the next one
	//getCuties();
	HappyTab.init()
}

function getCuties() {
	// see if the user has cuties stored left to see
	chrome.storage.local.get('URLs',function(items) {
	  // if not, get from server
	  if( outOfCuties(items.URLs) ) 
	  	return getCutiesFromServer(); // only get's here on first load of extension, otherwise reloads after image is shown
	  else 
	  	return showNextCutie(items.URLs);
	});
}

// check what's in (or not in) storage to see if array is set
// value {object} value in local storage
// return bool true if need to download list from server
function outOfCuties(value) {
	return value == undefined || value == '' || value.length == 0;
}

// retrieve from packaged extension
// will change this to requst from server
function getCutiesFromServer(callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
	    // string to json/array
	    var array = JSON.parse(xhr.responseText);
	    // save as array to storage	    
	    setCuties(array, callback);
	  }
	} 
	xhr.open("GET", chrome.extension.getURL('/scripts/todays-cuties.json'), true);
	xhr.send();
}

// Saves current Array of URLs to local storage
// cuttiesArray {array} Array of URLs to images
// callback {function} *optional what to do when storage is set 
function setCuties(cuttiesArray, callback) {
	chrome.storage.local.set({'URLs': cuttiesArray}, function() {
	  // Notify that we saved.
	  message('HappyTab URL array updated, new length: ' + cuttiesArray.length);
	  
	  // when storage is set
	  if( typeof(callback) == 'function' )
	  	callback();
	});
}

// Pops a URL off the array, shows it, and 
// updates storage with the shortened by one array
// or gets more
// cuttiesArray {array} Array of URLs to images
function showNextCutie(cuttiesArray) {
	var cutie = cuttiesArray.pop()
	// show a url
	document.body.style.backgroundImage = 'url(' + cutie + ')';
	
	// check for more if array 0 or update array with 1 less item
	if( outOfCuties(cuttiesArray) ) 
  	return getCutiesFromServer(); // only get's here on first load of extension, otherwise reloads after image is shown
  else 
  	return setCuties(cuttiesArray);	
}

start()


