const fhirId =document.getElementById('fhirIds').value;
var arrHead = new Array();
    arrHead = ['', '','Patient Name', 'DOB', 'Weight', "Height", "Glucose Level" ,"Annotate"];
    var patientname= [];
    var dob= [];
    var newFHIRId=[];
getpatient()

function getpatient()
{
    document.getElementById("lblMsg").innerText="";
    document.getElementById("lblMsg").innerHTML="";    
    var p = defaultPatient();
    createTable();
    var lstfhir = fhirId.toString().split('"');
    for (i=3;i<lstfhir.length;i += 4) {
        if (lstfhir[i] !=undefined) {
            console.log(lstfhir[i]);
            //newFHIRId.push(lstfhir[i]);
            //newFHIRId=lstfhir[i];
            var client = new FHIR.client({
                serverUrl: "https://r4.smarthealthit.org",
                tokenResponse: {
                  patient: lstfhir[i]
                }
              });
              var client1 = new FHIR.client({
                serverUrl: "https://r4.smarthealthit.org",
                tokenResponse: {
                  patient: lstfhir[i]
                }
              });
              client.request(`Patient/${client.patient.id}`).then(
                function(patient) {
                     patientname.push(getPatientName(patient))
                     dob.push(patient.birthDate)     
                     newFHIRId.push(patient.id);
                    // patientname = getPatientName(patient);
                     //dob=patient.birthDate;               
                });

                var query = new URLSearchParams();
                    query.set("patient", client1.patient.id);
                    query.set("_count", 2);
                    query.set("_sort", "-date");
                    query.set("code", [ 
                    'http://loinc.org|29463-7', // added newly
                    'http://loinc.org|8302-2' ,//height
                    'http://loinc.org|29463-7' ,//weight
                    'http://loinc.org|2339-0', //glucose level
                    'http://loinc.org|87422-2',//post-meal
                    'http://loinc.org|76629-5'//fasting  
                    ].join(","));

                    client1.request("Observation?" + query, {
                    pageLimit: 0,
                    flat: true
                    }).then(
                    function(ob) {
                    // group all of the observation resoruces by type into their own
                    var byCodes = client.byCodes(ob, 'code');                            
                    var wt1 = byCodes('29463-7');
                    var ht1 = byCodes('8302-2');
                    var currentglucoselevel1 =byCodes('2339-0')
                    glucoseid="";
                    console.log(ob)
                    // create patient object
                    p.weight = getQuantityValueAndUnit(wt1[0]);	
                    var wtfhirid	="";
                    if(wt1[0]!=undefined)
                    {
                       wtfhirid= wt1[0].subject.reference.split('/')[1]
                    }
                    
                    p.height = getQuantityValueAndUnit(ht1[0]);    
                                                 
                    p.currentglucoselevel = getQuantityValueAndUnit(currentglucoselevel1[0]);
                    if(currentglucoselevel1[0] != undefined)
                    {		
                        glucoseid= currentglucoselevel1[0].id;
                    }
                        addRow(patientname,dob,p.weight,p.height,p.currentglucoselevel,newFHIRId,glucoseid,wtfhirid) 
                    
                });
        }        
    }
    
}

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

  // first create a TABLE structure by adding few headers.
  function createTable() {
      var empTable = document.createElement('table');
      empTable.setAttribute('id', 'empTable');  // table id.

      var tr = empTable.insertRow(-1);

      for (var h = 0; h < arrHead.length; h++) {
          var th = document.createElement('th'); // the header object.
          th.innerHTML = arrHead[h];
          tr.appendChild(th);
      }

      var div = document.getElementById('cont');
      div.appendChild(empTable);    // add table to a container.
  }
  var y=0;

  function addRow(patientname,dob,weight,height,glucose,fhirId,glucoseid,wtfhirid) {
      for (i=0;i<fhirId.length; i++)
      {
         if(fhirId[i] ==wtfhirid)
         {
             y=i;
         }
      }
     
    var empTab = document.getElementById('empTable');

    var rowCnt = empTab.rows.length;  
    //var y= ((rowCnt+1)/2)-1
    
      // get the number of rows.
    var tr = empTab.insertRow(rowCnt); // table row.
    tr = empTab.insertRow(rowCnt);

    for (var c = 0; c < arrHead.length+2; c++) {
        var td = document.createElement('td');          // TABLE DEFINITION.
        td = tr.insertCell(c);

        if (c == 0) {   // if its the first column of the table.
            // add a button control.
            var button = document.createElement('input');

            // set the attributes.
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'detail');

            // add button's "onclick" event.
            button.setAttribute('onclick', 'detailRow(this,\''+fhirId[y]+'\',\''+patientname[y]+'\')');

            td.appendChild(button);
        }
        else if(c==1)
        {
            // add a button control.
            var button = document.createElement('input');

            // set the attributes.
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'add annotation');

            // add button's "onclick" event.
            button.setAttribute('onclick', 'addAnnotation(this,\''+fhirId[y]+'\',\''+glucoseid+'\')');

            td.appendChild(button);

        }
        else {            
            
            
            switch(c) {
                case 2:
                    
                    var ele = document.createElement('label');
                    ele.setAttribute('for', 'pname');
                    ele.innerHTML= patientname[y];
                    td.appendChild(ele);
                  break;
                  case 3:
                    var ele = document.createElement('label');
                    ele.setAttribute('for', 'dob');
                    ele.innerHTML= dob[y];
                    td.appendChild(ele);
                  break;
                  case 4:
                    var ele = document.createElement('label');
                    ele.setAttribute('for', 'weight');
                    ele.innerHTML= weight;
                    td.appendChild(ele);
                  break;
                  case 5:
                    var ele = document.createElement('label');
                    ele.setAttribute('for', 'height');
                    ele.innerHTML= height;
                    td.appendChild(ele);
                  break;
                  case 6:
                    var ele = document.createElement('label');
                    ele.setAttribute('for', 'glucose');
                    ele.innerHTML= glucose;
                    if(glucose!=undefined)
                    {
                    var newglucose= glucose.split(' ');
                    if(newglucose[0] > 141)
                        ele.style.backgroundColor = "red";
                    }
                    td.appendChild(ele);
                  break;
                  case 7:
                    var ele = document.createElement('input');
                    ele.setAttribute('type', 'text');
                    ele.setAttribute('value', "");
                    td.appendChild(ele);
                    break;
                  case 8:
                    var ele = document.createElement('input');
                    ele.setAttribute('type', 'hidden');
                    ele.id="rowid"
                    ele.setAttribute('value',fhirId[y])
                    td.appendChild(ele);
                    break;  
                    case 9:
                    var ele = document.createElement('input');
                    ele.setAttribute('type', 'hidden');
                    ele.id="glucoseid"
                    ele.setAttribute('value', glucoseid);
                    td.appendChild(ele);
                    break;            

            
        }
    }
}
  }

function detailRow(oButton,id,name)
  {
      createGraph(id,name);

  }

  function createGraph(id,name)
{
    document.getElementById("lblMsg").innerText="";
    document.getElementById("lblMsg").innerHTML="";
    document.getElementById("chart").style.display="block";
    var client = new FHIR.client({
        serverUrl: "https://r4.smarthealthit.org",
        tokenResponse: {
          patient: id
        }
      });
var query = new URLSearchParams();
query.set("patient", id);
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
  title: name+' - Glucose reading graph',
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
     
    };
  }

  function addAnnotation(oButton,id,glucoseid) {
    var empTab = document.getElementById('empTable');
      
    var annotation=empTab.rows[(oButton.parentNode.parentNode.rowIndex)].cells[7].querySelector('input').value;
    if(annotation!=null && annotation !="")
    {
    var client = new FHIR.client({
        serverUrl: "https://r4.smarthealthit.org",
        tokenResponse: {
          patient: id
        }
      });
      var empTab = document.getElementById('empTable');
          	
  //var annotation = document.getElementById('annotation').value; //"test annotation"
  //https://stackoverflow.com/questions/12945003/format-date-as-yyyy-mm-ddthhmmss-sssz
  var currentdate = new  Date(new Date().toString().split('GMT')[0]+' UTC').toISOString();
 

var weightIdAnnotation = glucoseid; 
  client.request("Observation/"+weightIdAnnotation, {
  pageLimit: 0,
  flat: true
}).then(
  function(ob) {
	  //var obs = ob[0];
	  var note = {
				text: annotation,
				authorString : document.getElementById("practioner_name").value,
				time:currentdate
			};
	  console.log(ob);
	 console.log(ob.note);
	 if(ob.note == undefined)
		 ob.note = [note];
	 else
		 ob.note.push(note);
	 client.update(ob)
			
            
        .catch(function(e){
            console.log('An error happened while updating patient: \n' + JSON.stringify(e));
            throw e;
        }).then(function(bundle){
            console.log('Updating patient successed');
            document.getElementById("lblMsg").innerText="Annotation updated!!";
            document.getElementById("lblMsg").innerHTML="Annotation updated!!";
            return bundle;
        });
	  
  })
}
}

