//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

//create a fhir client based on the sandbox enviroment and test paitnet.
const client = new FHIR.client({
  serverUrl: "https://r4.smarthealthit.org",
  tokenResponse: {
    patient: "87a339d0-8cae-418e-89c7-8651e6aab3c6"
  }
});

// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
function displayPatient(pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
  document.getElementById('gender').innerHTML = pt.gender;
  document.getElementById('dob').innerHTML = pt.birthDate;
}

//function to display list of medications
function displayMedication(meds) {
  med_list.innerHTML += "<li> " + meds + "</li>";
}

//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
		//console.log("new log Id "+ob.id);
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2)) + ' ' + ob.valueQuantity.unit;
  } else {
    return undefined;
  }
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    height: {
      value: ''
    },
    weight: {
      value: ''
    },
	currentglucoselevel:{
		value: ''
	},
	message:{
		value: ''
	},
  //  glucosefasting: {
   //   value: ''
   // },
    //glucosepostmeal: {
     // value: ''
    //},
   
  };
}

//helper function to display the annotation on the index page
function displayAnnotation(annotation) {
  document.getElementById('message').innerHTML = annotation;
}

//function to display the observation values you will need to update this
function displayObservation(obs) {
  
  
  weight.innerHTML = obs.weight;
  height.innerHTML = obs.height;
  currentglucoselevel.innerHTML = obs.currentglucoselevel;
  //glucosefasting.innerHTML = obs.glucosefasting;
  //glucosepostmeal.innerHTML = obs.glucosepostmeal;  
  
}

// get patient object and then display its demographics info in the banner
client.request(`Patient/${client.patient.id}`).then(
  function(patient) {
    displayPatient(patient);
    //console.log(patient);
	
  }
);

// get observation resoruce values
// you will need to update the below to retrive the weight and height values
var query = new URLSearchParams();
query.set("patient", client.patient.id);
query.set("_count", 100);
query.set("_sort", "-date");
query.set("code", [
 
  'http://loinc.org|29463-7', // added newly
  'http://loinc.org|3141-9' , // weight
  'http://loinc.org|3137-7' , // height
  'http://loinc.org|8302-2' ,//height
  'http://loinc.org|29463-7' ,//weight
  'http://loinc.org|2339-0', //glucose level
  'http://loinc.org|87422-2',//post-meal
  'http://loinc.org|76629-5'//fasting
  
].join(","));

client.request("Observation?" + query, {
  pageLimit: 0,
  flat: true
}).then(
  function(ob) {

    // group all of the observation resoruces by type into their own
    var byCodes = client.byCodes(ob, 'code');
        
    var wt = byCodes('3141-9');
    var ht = byCodes('3137-7');
	var wt1 = byCodes('29463-7');
    var ht1 = byCodes('8302-2');
	//var glucosefasting1 =byCodes('76629-5');
	//var glucosepostmea1l =byCodes('87422-2'); 2339-0
	var currentglucoselevel1 =byCodes('2339-0')
	console.log(ob)

    // create patient object
    var p = defaultPatient();  
   
	
	p.weight = getQuantityValueAndUnit(wt1[0]);		
	p.height = getQuantityValueAndUnit(ht1[0]);
	//p.glucosefasting = getQuantityValueAndUnit(glucosefasting1[0]);
	//p.glucosepostmeal = getQuantityValueAndUnit(glucosepostmea1l[0]);
	
	p.currentglucoselevel = getQuantityValueAndUnit(currentglucoselevel1[0]);
	   

    displayObservation(p);
	createGraph();

  });
  
function createGraph()
{
var query = new URLSearchParams();
query.set("patient", client.patient.id);
query.set("_count", 30);
query.set("_sort", "-date");
query.set("code", [ 
  'http://loinc.org|2339-0', //glucose level
  
].join(","));
var xaxis=[] ;
var yaxis =[];
var i=0;
client.request("Observation?" + query, {
  pageLimit: 0,
  flat: true
}).then(
  function(ob) {	
 
  for(i = 0;i < ob.length;i++)
  {	  
	  xaxis.push(new Date(ob[i].effectiveDateTime).toLocaleDateString());	  
	  yaxis.push(ob[i].valueQuantity.value);
	  
  }
  xaxis = xaxis.reverse();
  yaxis = yaxis.reverse();
  var graphDiv = document.getElementById('chart')

var data = [{
  x: xaxis,
  y: yaxis,
  type: 'line',
  line: {
    color: '#E6D72A',
    width: 3
  }
}];

var layout = {
  title: 'Glucose reading graph',
  xaxis: {
    title: 'Date',
    showgrid: false,
    zeroline: false
  },
  yaxis: {
    title: 'Glucose level',
    showline: false
  }
 
};
Plotly.newPlot(graphDiv, data, layout);
})

	
}


function addGlucose() {
	
  var glucosereading = document.getElementById('glucoseLevel').value; 
 
//https://stackoverflow.com/questions/12945003/format-date-as-yyyy-mm-ddthhmmss-sssz
  var currentdate = new  Date(new Date().toString().split('GMT')[0]+' UTC').toISOString();
 var obs1={
	 resourceType: "Observation",
	  code: {
    coding: [
      {
        system: "http://loinc.org",
        code: "2339-0",
        display: "Glucose mg/dl in Blood"
      }
    ]
  },
   subject: {
    reference: escape("Patient/")+client.patient.id
    
  },
  effectiveDateTime : currentdate,
  valueQuantity : {
    value : glucosereading,
    unit : "mg/dL",
    "system" : "http://unitsofmeasure.org"
  },
 }
 
  client.create(obs1)
  
  
  //client.update
  displayAnnotation("Added");
  createGraph();

}


//event listner when the add button is clicked to call the function 
document.getElementById('add').addEventListener('click', addGlucose);
