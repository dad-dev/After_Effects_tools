﻿/*SuperQueueAutomatically set up render settings for promo lower-thirds and endplates fortelevision network versioning.  Generates file names according to the versioningdata, and with very specific file path names to match.  This is a highlybespoke tool, and would likely be of use to others only in a general sense.Written by Jeffery W. HallLast Modified:  November 30, 2016Version: 0.9*/{app.beginUndoGroup("Populate Queue");main();  function main() {  // Create project if necessary  var proj = app.project;  if (!proj) {    alert("No project found.\nThis script requires either the Promo Lower Third or Endplate project.");    proj = app.newProj();    return;  }  // Initialize variables and find relevant comps  if (!proj.file) {    alert("No project found.\nThis script requires either the Promo Lower Third or Endplate project.");    return;  } else var projName = proj.file.name.toString();  var projType = null;  var projItems = proj.items;  var projQueue = proj.renderQueue;  var showTitleComp = null;  // not needed for EPL  var showTitleLayer = null;  // not needed for EPL  var activeShow = null;  var tuneIn = null;  var renderComp = null;  var day = null;  var fullDay = null;  var timeData = null;  var qFileName = null;  var tuneClass = null;  function appInit() {    if (/lower3rd/i.test(projName)) {      projType = "L3D";    } else if (/epl/i.test(projName)) {      projType = "EPL";    } else return;    switch (projType) {      case "L3D":        for (var i = 1; i <= projItems.length; i++) {          if (projItems[i].name == "Show_Logo") {            showTitleComp = projItems[i];          }          if (projItems[i].name == "Tune-In ") {            tuneIn = projItems[i];          }          if (projItems[i].name == "Promo_Lower3d_3box 7sec") {            renderComp = projItems[i];          }        }        break;      case "EPL":        for (var i = 1; i <= projItems.length; i++) {          if (projItems[i].name == "SHOW_01Tunein ") {            tuneIn = projItems[i];          }          if (projItems[i].name == "EPL_RENDER") {            renderComp = projItems[i];          }        }        break;      default:        alert("Error:\nThis script requires either the Promo Lower Third or Endplate project.")        return;    }  }  function buildFile() {    if (!tuneClass) {      return projType + "_" + activeShow + "_" + day + "_" + timeData;    } else {      return projType + "_" + activeShow + "_" + tuneClass + "_" + day + "_" + timeData;    }  }  function buildPath(pathOption) {    var rPath;    var dayFolder;    var isWeekday = true;    if (/day/i.test(fullDay) && fullDay != "TODAY") {      dayFolder = "/DAYS_of_WEEK/";    } else if (/tom/i.test(fullDay) || /tod/i.test(fullDay) || /ton/i.test(fullDay)) {      dayFolder = "/" + day + "/";      isWeekday = false;    }    if (pathOption == 1) {      if (tuneClass == "MAR" || tuneClass == "TGV_MAR") {        rPath = ("/Volumes/GFX Delivery_1/ION_Television/ShowsPKG/" + activeShow +                      "/" + projType + "/" + "MAR" + "/");      } else if (tuneClass == "PRE") {        rPath = ("/Volumes/GFX Delivery_1/ION_Television/ShowsPKG/" + activeShow +                      "/" + projType + "/" + "PRE" + "/");      } else if (isWeekday) {        rPath =  ("/Volumes/GFX Delivery_1/ION_Television/ShowsPKG/" + activeShow +                      "/" + projType + dayFolder + day + "/");      } else if (!isWeekday) {        rPath =  ("/Volumes/GFX Delivery_1/ION_Television/ShowsPKG/" + activeShow +                      "/" + projType + dayFolder);      } else if (day == "TGV") {        rPath =  ("/Volumes/GFX Delivery_1/ION_Television/ShowsPKG/" + activeShow +                      "/" + projType + "/SPECIAL/");      }    } else rPath =  "/Volumes/GFX Delivery_1/ION_Television/Daily_Versioning/";    return rPath;  }  // Find the active show title  function getShowTitle(whichType) {    var whichShow;    switch (whichType) {      case "L3D":        for (var i = 1; i <= showTitleComp.numLayers; i++) {          if (showTitleComp.layer(i).enabled) {            showTitleLayer = showTitleComp.layer(i);          }        }        whichShow = showTitleLayer.name;        break;      case "EPL":        whichShow = proj.file.name.substring(4, 7);        break;      default:        alert("Error:  Can't determine project type.");    }    return whichShow;  }  function shortenTuneClass(theClass) {    var shortClass;    if (/prem/i.test(theClass)) {      shortClass = "PRE";    } else if(/all d/i.test(theClass)) {      shortClass = "AD";    } else if(/back/i.test(theClass)) {      shortClass = "B2B";    } else if(/thank/i.test(theClass)) {      shortClass = "TGV_MAR";    } else if(/mara/i.test(theClass)) {      shortClass = "MAR";    }    return shortClass;  }  function getTuneClass() {    var findClass = tuneIn.layers.byName("Classifier");    var numFX = findClass.effect.numProperties;    var classifier;    var effectCount = 0;    for (var i = 1; i <= numFX; i++) {      if (findClass.effect(i).name != "Season Number" && findClass.effect(i).checkbox.value == 1) {        classifier = findClass.effect(i).name;      }    }    if (effectCount > 1) {      alert("Error:  Too many classifier options selected.");      return;    }    return shortenTuneClass(classifier);  }  // Get the day value  function getOneDay() {    var oneDay = tuneIn.layers.byName("One Day");    fullDay = oneDay.sourceText.value.toString();    if (/next/i.test(fullDay)) {      return fullDay.substring(5, 8);    } else if (/thank/i.test(fullDay)) {      return "TGV";    } else return fullDay.substring(0, 3);  }  function reformTime(theTime) {    var eTime;    var cTime;    if (/:/.test(theTime)) {      eTime = theTime.replace(/:/, "");      eTime = parseInt(eTime);    } else eTime = parseInt(theTime);    if (eTime <= 12 && eTime > 1) {      cTime = eTime - 1;    } else if(eTime == 1) {      cTime = 12;    } else if(eTime > 12 && eTime > 130) {      cTime = eTime - 100;    } else if(eTime == 130) {      cTime = 1230;    } else alert("Error:  Cannot format time.")    return (eTime.toString() + "_" + cTime.toString());  }  function getTuneTime() {    var findTime = tuneIn.layers.byName("TIMES DATABASE");    var numFx = findTime.effect.numProperties;    var onEffect = null;    var effectCount = 0;    var dayPart;    for (var i = 4; i <= (numFx - 3); i++) {      if (findTime.effect(i).checkbox.value == 1) {        onEffect = i;        effectCount++;      }    }    if (!onEffect) {      alert("Error:  No time selected.");      return;    }    if (effectCount > 1) {      alert("Error:  Too many time options selected.");      return;    }    if (findTime.effect(28).name == "PM" && findTime.effect(28).checkbox.value == 1 &&        findTime.effect(29).name == "AM" && findTime.effect(29).checkbox.value == 1) {      alert("Error:  Too many parameters.\nSelect either AM or PM.");      return;    }    if (findTime.effect(28).name == "PM" && findTime.effect(28).checkbox.value == 1) {      dayPart = "PM";    } else if(findTime.effect(29).name == "AM" && findTime.effect(29).checkbox.value == 1) {      dayPart = "AM";    } else {      alert("Error:  Select either AM or PM.");      return;    }    findTime = reformTime(findTime.effect(onEffect).name);    return (findTime.toString() + "_" + dayPart);  }  function populateQueue() {    projQueue.items.add(renderComp);    var changeFile = File (buildPath(1) + buildFile());    var queueList;    if (projQueue.numItems == 0) {      queueList = 1;    } else queueList = projQueue.numItems;    projQueue.item(queueList).outputModule(1).file = changeFile;    projQueue.item(queueList).outputModule(1).applyTemplate("Avid with Alpha");    projQueue.item(queueList).outputModules.add();    changeFile.changePath(buildPath(2) + buildFile());    projQueue.item(queueList).outputModule(2).file = changeFile;    projQueue.item(queueList).outputModule(2).applyTemplate("Avid with Alpha");  }  appInit();  activeShow = getShowTitle(projType);  if (tuneIn.layers.byName("Classifier").enabled) {    tuneClass = getTuneClass();  }  day = getOneDay();  timeData = getTuneTime();  populateQueue();  // var shouldIStayOrShouldIGo = confirm("Render now?");  //  // if (shouldIStayOrShouldIGo) {  //     app.project.renderQueue.render();  // }}app.endUndoGroup();}