let entries=[];

document.getElementById("flashForm").addEventListener("submit",function(e){

e.preventDefault();

let date=document.querySelector('input[type="date"]').value;

let selects=document.querySelectorAll("select");

let vehicleType=selects[0].value;
let oem=selects[1].value;
let oldFirmware=selects[2].value;
let newFirmware=selects[3].value;
let city=selects[4].value;

let flashedBy=document.querySelectorAll("input")[3].value;

// Get VIN Number field
let vin=document.querySelectorAll('input')[1].value;

// Check duplicate VIN
let duplicateVIN=entries.some(item => item.vin===vin);

if(duplicateVIN){

alert("VIN Number already exists! Duplicate entry not allowed.");

return;

}

entries.push({

vin,
date,
city,
flashedBy

});


fetch("https://script.google.com/macros/s/AKfycbyDMn5JcCmwl7ya7CYq0HTP6VQ5lLtBzKKicYKpj4sFGxb12strFr51zroeTvgNsneDUg/exec",{

method:"POST",

body:JSON.stringify({

date:date,
vehicleNumber:vin,
diuId:document.querySelectorAll("input")[2].value,
vehicleType:document.querySelectorAll("select")[0].value,
oem:document.querySelectorAll("select")[1].value,
oldFirmware:document.querySelectorAll("select")[2].value,
newFirmware:document.querySelectorAll("select")[3].value,
city:city,
flashedBy:flashedBy

})

})

.then(response=>response.text())
.then(data=>console.log("Saved:",data))
.catch(error=>console.log(error));

updateSummary();

});


function updateSummary(){

let techCount={};
let cityCount={};
let dateCount={};

entries.forEach(item=>{

techCount[item.flashedBy]=(techCount[item.flashedBy]||0)+1;

cityCount[item.city]=(cityCount[item.city]||0)+1;

dateCount[item.date]=(dateCount[item.date]||0)+1;

});

document.getElementById("techSummary").innerHTML=
Object.entries(techCount)
.map(([k,v])=>`${k}: ${v}`)
.join("<br>");

document.getElementById("citySummary").innerHTML=
Object.entries(cityCount)
.map(([k,v])=>`${k}: ${v}`)
.join("<br>");

document.getElementById("dateSummary").innerHTML=
Object.entries(dateCount)
.map(([k,v])=>`${k}: ${v}`)
.join("<br>");

}
// Read all records from Google Sheet

fetch("https://script.google.com/macros/s/AKfycbyDMn5JcCmwl7ya7CYq0HTP6VQ5lLtBzKKicYKpj4sFGxb12strFr51zroeTvgNsneDUg/exec")

.then(response=>response.json())

.then(data=>{

let techCount={};
let cityCount={};
let dateCount={};

let fw8602=0;
let fw9103=0;

data.forEach(row=>{

let date=new Date(row[0]).toLocaleDateString("en-IN");
let city=row[7];
let flashedBy=row[8];

let newFirmware=row[6];

if(
newFirmware.toString().trim()=="86.02.00" ||
newFirmware.toString().trim()=="91.03.00"
){

techCount[flashedBy]=(techCount[flashedBy]||0)+1;

cityCount[city]=(cityCount[city]||0)+1;

dateCount[date]=(dateCount[date]||0)+1;

}

if(newFirmware.toString().trim()=="86.02.00"){
fw8602++;
}

if(newFirmware.toString().trim()=="91.03.00"){
fw9103++;

}

});


document.getElementById("techSummary").innerHTML=

Object.entries(techCount)
.map(([k,v])=>`${k}: ${v}`)
.join("<br>");



document.getElementById("citySummary").innerHTML=

Object.entries(cityCount)
.map(([k,v])=>`${k}: ${v}`)
.join("<br>");



document.getElementById("dateSummary").innerHTML=
Object.entries(dateCount)

.sort((a,b)=>{

let da=a[0].split("/");
let db=b[0].split("/");

let dateA=new Date(da[2],da[1]-1,da[0]);
let dateB=new Date(db[2],db[1]-1,db[0]);

return dateB-dateA;

})

.slice(0,20)

.map(([k,v])=>`${k}: ${v}`)

.join("<br>");

document.getElementById("fw8602").innerHTML=fw8602;

document.getElementById("fw9103").innerHTML=fw9103;

document.getElementById("totalTarget").innerHTML=fw8602+fw9103;

document.getElementById("totalFlash").innerHTML=data.length;

});