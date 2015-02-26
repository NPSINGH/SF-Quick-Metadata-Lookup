/* 
	## ----   SF Quick Metadata Lookup   ---- ##
	version : 1.3
	Developed By : N.P.SINGH
	
	Copyright (c) 2015 N.P.SINGH
	Under MIT License [2015]
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/
/* Main Content Script file to render the extension on the page */
$('head').append('<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css"/>');

var pkgInfoReady = false;
var pkgrendered =  false;
var pkginfo = [];
var displayRecords;
var displayedComponents=[];
var packageInfo=[];
var codeComponentSelectedArray;
var G_SearchFor;
var G_SearchBy;
var G_PkgFilter;
var G_orgId = getCookie('sid').substring(0, 15);
var G_sessionId;
var G_ErrorOccured = false;
var G_PAGE = '';
var G_SearchCriteria = '';
getPageVisibility();
getSearchCriteria();
if((window.location.href).indexOf('.visual.force.com') > 0){
	getSessionId();
	//G_sessionId = localStorage.getItem(G_orgId+'_sessionId');
}
else{
	localStorage.setItem(G_orgId+'_sessionId',getCookie('sid'));
	setSessionId(getCookie('sid'));
	G_sessionId = getCookie('sid');
}
var G_SearchForLabel = {
	ApexClass : 'Apex Classes',
	ApexPage : 'VF Pages',
	ApexTrigger : 'Triggers',
	ApexComponent : 'VF Components',
	CustomObj : 'Standard/Custom Objects',
	StaticResource : 'Static Resources',
	User : 'Users',
	CustomSetting : 'Custom Settings'
};
	function setSessionId(sid) {    
		chrome.storage.sync.set({"SFQUICKSESSIONID": sid}, function(){
		// callback Url
		});
	}
	function getSessionId() {    
	 chrome.storage.sync.get("SFQUICKSESSIONID", function(obj){
			localStorage.setItem(G_orgId+'_sessionId',obj["SFQUICKSESSIONID"]);
		});
	}
	function clearSessionId() {    
	chrome.storage.sync.clear(function(){
			//console.log('Settings cleared');
		});	
	}
	function getPageVisibility(){
		chrome.storage.sync.get("PAGEVISIBILITY", function(obj){
			G_PAGE = obj["PAGEVISIBILITY"];
			var displayVisibility;
			if(G_PAGE == undefined){
				 displayVisibility = 'Default';
			}
			else{
				displayVisibility = G_PAGE;
			}
			console.log('SF Quick MetaData Lookup Extension Visibility: '+displayVisibility);
		});
	}
	function getSearchCriteria(){
		chrome.storage.sync.get("DATASEARCHCRITERIA", function(obj){
			G_SearchCriteria = obj["DATASEARCHCRITERIA"];
			var displayVisibility;
			if(G_SearchCriteria == undefined){
				 displayVisibility = 'Contains';
			}
			else{
				displayVisibility = G_SearchCriteria;
			}
			console.log('SF Quick MetaData Lookup Extension Search Criteria: '+displayVisibility);
		});
	}
	
	
$(document).ready(function(){
	//G_orgId =  getCookie('oid');
    //chrome.extension.getURL("images/back_enabled_hover.png")
	if((window.location.href).indexOf('.visual.force.com') > -1){
		getSessionId();	
		G_sessionId = localStorage.getItem(G_orgId+'_sessionId');
	}
	else{
		setSessionId(getCookie('sid'));
		localStorage.setItem(G_orgId+'_sessionId',getCookie('sid'));
		G_sessionId = getCookie('sid');
	}
	
	var DialogBoxContainer = '<div class="NPS-mainDialogBox" style="display:none;">'+
								'<div class="NPS-dialogeBodyContainer">'+
									'<div class="NPS-bodyHeader">'+
										'<img style="width:5%;" src="'+chrome.extension.getURL("images/SF_Icon.png")+'"/>'+
										'<span class="NPS-headerMainText">SF Quick Metadata Lookup</span>'+
										'<span class="NPS-headerSmallText">Version: 1.3</span>'+
									'</div>'+
									'<div class="NPS-bodyMiddleContent">'+
										'<div class="NPS-formBodySection">'+											
											'<fieldset class="NPS-customFieldSet" criteria="SearchFor">'+
												'<legend>Search For</legend>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="ApexClass" id="ApexClass"/>'+
												'<label for="ApexClass">Apex Class</label>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="ApexPage" id="ApexPage"/>'+
												'<label for="ApexPage">VisualForce Page</label>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="ApexTrigger" id="ApexTrigger"/>'+
												'<label for="ApexTrigger"> Apex Trigger</label>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="ApexComponent" id="ApexComponent"/>'+
												'<label for="ApexComponent">VF Component</label>'+
												'<br/>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="CustomObj" id="CustomObj"/>'+
												'<label for="CustomObj">Custom Object</label>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="CustomSetting" id="CustomSetting"/>'+
												'<label for="CustomSetting">Custom Setting</label>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="StaticResource" id="StaticResource"/>'+
												'<label for="StaticResource">Static Resource</label>'+	
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchFor" value="User" id="User"/>'+
												'<label for="User">User</label>'+												
											'</fieldset>'+
											'<fieldset class="NPS-customFieldSet" criteria="SearchBy">'+
												'<legend>Search By</legend>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchBy" value="APINAME" id="APINAME" checked />'+
												'<label for="APINAME">API Name</label>'+
												'<input type="radio" class="NPS-radioCustomStyle" data-selector="SearchBy" value="LABEL" id="LABEL"/>'+
												'<label for="LABEL">Label</label>'+
												'<label for="packageFilter" style="margin-left:35px;">Filter By App</label>'+
												'<select id="packageFilter" placeholder="Select to filter">'+							
												'</select>'+
											'</fieldset>'+
											'<fieldset class="NPS-customFieldSet" criteria="SearchResult">'+
												'<legend>Search Result</legend>'+
												'<div id="NPS-resultSelectContainer">'+
													'<select data-placeholder="Select Metadata first to start here..." id="resultSelectList"/>'+
														'<option></option>'+
													'</select>'+
												'</div>'+
											'</fieldset>'+
										'</div>'+
										'<div class="NPS-showProgressBar">'+
											'<div class="NPS-innerImageProgressBarContainer">'+
												'<img src="'+chrome.extension.getURL("images/gearLoader.gif")+'" title="Please Wait..."/>'+
												'<br/><span style="margin-left:-10px;">Please Wait...</span>'+
											'</div>'+
										'</div>'+
									'</div>'+
									'<div class="NPS-bodyFooterContent">'+
										'<span class="NPS-footerText">For Suggestion and Issue <a title="Email me at: sfquicklookup@gmail.com" href="mailto:sfquicklookup@gmail.com?subject=Query/Suggestion regarding Chrome Extension[SF Quick Metadata Lookup]" target="_self">Contact Me</a></span>'+
									'</div>'+
								'</div>'+
								'<div class="NPS-BoxHandler show">'+
									'<img id="handleImage" src="'+chrome.extension.getURL("images/arrow-right.png")+'" width="16px"/>'+
								'</div>'+								
							 '</div>';
	
	
	
	
	
	
	$('body').append(DialogBoxContainer);	
	var counter = 0;
	$('.NPS-showProgressBar').show();	
	var pkgTimerCounter = setInterval(function(){
		if(G_ErrorOccured == true){
			clearInterval(pkgTimerCounter);
			return;
		}
		else{
			var pkginfo = [];
			pkginfo = fetchPackageInformation();
			if(pkginfo.length > 0){
				var displayData = '<option value="none">--Select--</option>';
				for(var i in pkginfo){
					displayData += '<option value="'+pkginfo[i].id+'">'+pkginfo[i].value+'</option>';
				}
				$('#packageFilter').empty();
				$('#packageFilter').append(displayData);			
				$('.NPS-showProgressBar').hide();
				clearInterval(pkgTimerCounter);
			}
			else{
				var displayData = '<option value="none">--Select--</option>';
				$('#packageFilter').empty();
				$('#packageFilter').append(displayData);			
				$('.NPS-showProgressBar').hide();
			}
		}
	},300);
	
	
	var initialPageCounter = setInterval(function(){
		if(G_PAGE != '' && G_PAGE != 'DEFAULT' && G_PAGE != undefined){			
			if(((window.location.href).toLowerCase()).indexOf(G_PAGE) > -1){
				//console.log('inside this');
				//console.log('G_PAGE'+G_PAGE);
				$('div.NPS-mainDialogBox').show();
				clearInterval(initialPageCounter);
			}		    	
		}
		else{
			$('div.NPS-mainDialogBox').show();
			clearInterval(initialPageCounter);
		}
	},300);
	
	//$('#resultSelectList').chosen({search_contains: true});
	initializeChosenPlugin();
   //fetchPackageInformation();
  // getsObjMetadataInfo();
   //featchCustomObjects();
   //getsToolingObjMetadataInfo();
  // featchApexClassFromTooling();
 // fetchPageFromTooling();
 // $('#packageFilter').chosen({search_contains: true});
 setTimeout(function(){G_PkgFilter = $('div.NPS-formBodySection > fieldset[criteria=SearchBy] > select#packageFilter').val();},1000)	

});

function initializeChosenPlugin(){
	if(G_SearchCriteria == 'STARTWITH'){
		$('div#NPS-resultSelectContainer > #resultSelectList').chosen();
	}
	else{
		$('div#NPS-resultSelectContainer > #resultSelectList').chosen({search_contains: true});
	}
}



$(document).on('change','div.NPS-formBodySection input[type=radio]',function(){
	var selected = $(this).attr('id');
	$('input[data-selector='+$(this).attr('data-selector')+']').each(function(){
		$(this).attr('id') == selected ? $(this).attr('checked', true):$(this).attr('checked', false);
	});	
	
	// check for which search is need to place
	G_SearchFor = $('div.NPS-formBodySection > fieldset[criteria=SearchFor] > input[type=radio]:checked').attr('id');
	
	if(G_SearchFor == 'ApexClass' || G_SearchFor == 'ApexTrigger' || G_SearchFor == 'StaticResource'){
		$('input[data-selector=SearchBy]').each(function(){
			if($(this).attr('id') == 'LABEL'){
				$(this).prop('checked',false);
				$(this).attr('disabled',true);
			}
			else{
				$(this).prop('checked',true);
				$(this).attr('disabled',true);
			}
		});
		$('div.NPS-formBodySection > fieldset[criteria=SearchBy] > select#packageFilter').removeAttr('disabled');
	}
	else if (G_SearchFor == 'User'){
		$('input[data-selector=SearchBy]').each(function(){
			$(this).attr('disabled',true);
		});
		$('div.NPS-formBodySection > fieldset[criteria=SearchBy] > select#packageFilter').attr('disabled','true');
	}
	else{
		$('input[data-selector=SearchBy]').each(function(){
			$(this).attr('disabled',false);
		});
		$('div.NPS-formBodySection > fieldset[criteria=SearchBy] > select#packageFilter').removeAttr('disabled');
	}
	G_SearchBy = $('div.NPS-formBodySection > fieldset[criteria=SearchBy] > input[type=radio]:checked').attr('id');
	G_PkgFilter = $('div.NPS-formBodySection > fieldset[criteria=SearchBy] > select#packageFilter').val();
	if(G_SearchFor != null && G_SearchFor != ''){
		$('.NPS-showProgressBar').show();
		setTimeout(function(){
			if(G_SearchFor == 'CustomObj' || G_SearchFor == 'CustomSetting'){
				// Call function that can build the Custom Object or Custom Setting Search List
				getsObjectMetadata();
			}
			else{
				// call function that can build the rest of the Meta-data Search List
				createDataSetforRestMetadata();
			}
		},100);
	}
});

$(document).on('change','div.NPS-formBodySection select#packageFilter',function(){	
	// check for which search is need to place
	G_SearchFor = $('div.NPS-formBodySection > fieldset[criteria=SearchFor] > input[type=radio]:checked').attr('id');
	G_SearchBy = $('div.NPS-formBodySection > fieldset[criteria=SearchBy] > input[type=radio]:checked').attr('id');
	G_PkgFilter = $('div.NPS-formBodySection > fieldset[criteria=SearchBy] > select#packageFilter').val();
	if(G_SearchFor != null && G_SearchFor != ''){
		$('.NPS-showProgressBar').show();
		setTimeout(function(){
			if(G_SearchFor == 'CustomObj' || G_SearchFor == 'CustomSetting'){
				// Call function that can build the Custom Object Search List
				getsObjectMetadata();
			}
			else{
				// call function that can build the rest of the Meta-data Search List
				createDataSetforRestMetadata();
			}
		},100);
	}	
});



//window.open('/'+selectedValue, '_blank');
$(document).on('change','div#NPS-resultSelectContainer > #resultSelectList',function(){
	//console.log('Yes Its executed');
	if(($(this).val() != null) && ($(this).val() != '')){
		//console.log('Yes Its inside');
		var getURL = $(this).val();
		window.open(getURL, '_blank');
		$(this).val('none');
		$(this).trigger("chosen:updated");
	}
});






$(document).on('click','.NPS-BoxHandler',function(){
	//$('.NPS-dialogeBodyContainer').toggle($(this).slideLeft());
	//alert('its working');
			if($(this).hasClass('show')){
			$( ".NPS-BoxHandler, .NPS-dialogeBodyContainer" ).animate({
			  left: "+=500"
			  }, 700, function() {
				// Animation complete.
				$(this).find('img#handleImage').attr('src',chrome.extension.getURL("images/arrow-left.png"));
			  });
			  $(this).removeClass('show').addClass('hide');			  
			}
			else {   	
			$( ".NPS-BoxHandler, .NPS-dialogeBodyContainer" ).animate({
			  left: "-=500"
			  }, 700, function() {
				// Animation complete.
				$(this).find('img#handleImage').attr('src',chrome.extension.getURL("images/arrow-right.png"));	
			  });
			  $(this).removeClass('hide').addClass('show'); 			  		  
			}
	
});

 
  function getsObjMetadataInfo(){
	var orgId =  G_orgId;
	//console.log('###OrgId '+orgId);
	var currentDomain = window.location.host;	
	var today = new Date();
	var currentDate = (today.getDate()).toString()+(today.getMonth()).toString()+(today.getFullYear()).toString()+(today.getHours()).toString();
	var dataResponse = [];
	if(localStorage.getItem(orgId+'_sObjectDate') != currentDate){ 
		askSalesforce('/services/data/v30.0/sobjects/', function(responseText) {
			var ALLSObjectList = [];
			//console.log('########GETALLRESPONSEDATA-->'+JSON.stringify(responseText));
			var generalMetadataResponse = JSON.parse(responseText);
			//console.log('####generalMetadataResponse'+generalMetadataResponse);
			//console.log('####generalMetadataResponse.sobjects'+JSON.stringify(generalMetadataResponse.sobjects));
			for (var i = 0; i < generalMetadataResponse.sobjects.length; i++){
				if (generalMetadataResponse.sobjects[i].layoutable != false || generalMetadataResponse.sobjects[i].triggerable != false){
					
						var objtype = ((generalMetadataResponse.sobjects[i].name).match(/__/g) || []).length;
						if(objtype > 1){
							if(generalMetadataResponse.sobjects[i].customSetting == true){
								var obj= {
									name : generalMetadataResponse.sobjects[i].name,
									label: generalMetadataResponse.sobjects[i].label,
									namespacePrefix: (generalMetadataResponse.sobjects[i].name).substr(0,(generalMetadataResponse.sobjects[i].name).indexOf('__')),
									o_id : generalMetadataResponse.sobjects[i].Id,
									isCustom: true,
									isCustomSetting: true
									
								}
								ALLSObjectList.push(obj);
							}
							else{
								var obj= {
									name : generalMetadataResponse.sobjects[i].name,
									label: generalMetadataResponse.sobjects[i].label,
									namespacePrefix: (generalMetadataResponse.sobjects[i].name).substr(0,(generalMetadataResponse.sobjects[i].name).indexOf('__')),
									o_id : generalMetadataResponse.sobjects[i].Id,
									isCustom: true,
									isCustomSetting: false									
								}
								ALLSObjectList.push(obj);
							}
						}
						else if(objtype <= 1 && objtype > 0){
							if(generalMetadataResponse.sobjects[i].customSetting == true){
								var obj= {
									name : generalMetadataResponse.sobjects[i].name,
									label: generalMetadataResponse.sobjects[i].label,
									namespacePrefix: null,
									o_id : generalMetadataResponse.sobjects[i].id,
									isCustom: true,
									isCustomSetting: true
								}
								ALLSObjectList.push(obj);
							}
							else{
								var obj= {
									name : generalMetadataResponse.sobjects[i].name,
									label: generalMetadataResponse.sobjects[i].label,
									namespacePrefix: null,
									o_id : generalMetadataResponse.sobjects[i].id,
									isCustom: true,
									isCustomSetting: false
								}
								ALLSObjectList.push(obj);
							}
						}
						else{
							var obj= {
								name : generalMetadataResponse.sobjects[i].name,
								label: generalMetadataResponse.sobjects[i].label,
								namespacePrefix: null,
								o_id : generalMetadataResponse.sobjects[i].id,
								isCustom: false,
								isCustomSetting: false
							}
							ALLSObjectList.push(obj);
						}
										
				}			
			}		
			//console.log('###ALLSObjectList '+ JSON.stringify(ALLSObjectList));
			dataResponse = featchCustomObjects(ALLSObjectList);	
		});
	}
	else{
		dataResponse = JSON.parse(localStorage.getItem(orgId+'_sObjectInfo'));
	}
    //console.log('#######dataResponse--> '+dataResponse);
	return dataResponse;
 }
 
 
 // function for preparing Object List Data[final]
 function featchCustomObjects(parentObject){
	var FinalObjectMetaDataList = [];
	var myCustomSettingObj = [];
  if (parentObject != null && parentObject.length > 0){
		var sessionCookie;
		var orgId =  G_orgId;
		if((window.location.href).indexOf('.visual.force.com') > -1){
			sessionCookie = localStorage.getItem(G_orgId+'_sessionId');
		}
		else{
			localStorage.setItem(G_orgId+'_sessionId',getCookie('sid'));
			sessionCookie = getCookie('sid');
		}
		if(!sessionCookie){
			alert('SF Quick Metadata Lookup Extension Says... \n\nSorry! Session not found on this page.\nPlease visit \'<your_instance>.salesforce.com\' once and then try again.');
			G_ErrorOccured = true;
			return;
		}
		var currentDomain = window.location.host;	
		var today = new Date();
		var currentDate = (today.getDate()).toString()+(today.getMonth()).toString()+(today.getFullYear()).toString()+(today.getHours()).toString();
		var finalList = [];		
		var queryURL;	
		var param;
		G_ErrorOccured =  false;
		var continueLooping = true;
			if(param==undefined || param==''){
				queryURL = "/services/data/v31.0/tooling/query/?q=SELECT+Id,ExternalName,DeveloperName,NamespacePrefix+from+CustomObject";
			}else{
				queryURL = param;
			}
			//console.log('####queryURL '+ queryURL);
			$.ajax({
				url : "https://"+currentDomain+queryURL,
				headers : {"Authorization": "Bearer "+ sessionCookie},
				contentType : "application/json"
			}).done(function(response){
				//console.log('++++++records '+JSON.stringify(response));
				for(var i in response.records){
						if(response.records[i].NamespacePrefix != null){
							var obj = {
								DevName: response.records[i].DeveloperName,
								Id : response.records[i].Id,
								NamespacePrefix : response.records[i].NamespacePrefix,
								ExtName : response.records[i].ExternalName,
								Name: response.records[i].NamespacePrefix+'__'+response.records[i].DeveloperName+'__c'
							};
							finalList.push(obj);
						}
						else{
							var obj = {
								DevName: response.records[i].DeveloperName,
								Id : response.records[i].Id,
								NamespacePrefix : response.records[i].NamespacePrefix,
								ExtName : response.records[i].ExternalName,
								Name: response.records[i].DeveloperName+'__c'
							};
							finalList.push(obj);
						}					
				}				
				//console.log('##FINALLLLLLLObjects--> '+JSON.stringify(finalList));
				//console.log('##parentObject--> '+JSON.stringify(parentObject));
				for(var p in parentObject){
					if(parentObject[p].isCustom == true){
						for(var c in finalList){
							if((parentObject[p].name).trim() == (finalList[c].Name).trim()){
							
								var obj = {
									name : parentObject[p].name,
									label : parentObject[p].label,
									namespacePrefix : parentObject[p].namespacePrefix,
									id : finalList[c].Id,
									isCustom: true,
									isCustomSetting : parentObject[p].isCustomSetting,
									url : 'https://'+window.location.host+'/'+finalList[c].Id									
								}
								//console.log('Obj:--> '+obj);
								FinalObjectMetaDataList.push(obj);
							}
						}
					}
					else{
						var obj = {
							name : parentObject[p].name,
							label : parentObject[p].label,
							namespacePrefix : parentObject[p].namespacePrefix,
							id : parentObject[p].name,
							isCustom: false,
							isCustomSetting : parentObject[p].isCustomSetting,
							url : 'https://'+window.location.host+'/ui/setup/Setup?setupid='+parentObject[p].name
						}
						FinalObjectMetaDataList.push(obj);
					}
				}
			
				
				//console.log('###CustomSettingObj--> '+JSON.stringify(myCustomSettingObj));
				//console.log('###finalObjects--> '+JSON.stringify(FinalObjectMetaDataList));
				localStorage.setItem(orgId+'_sObjectDate', currentDate);
				localStorage.setItem(orgId+'_sObjectInfo', JSON.stringify(FinalObjectMetaDataList));
				
								
				if(response.nextRecordsUrl){
					param = response.nextRecordsUrl;
				}
				
			}).fail(function(error){				
				alert('Error!! Unable to fetch data from your salesforce instance' + JSON.stringify(error));
				continueLooping = false;
			});
	}	
}
 
 
 function getsObjectMetadata(){
	var displayData = '';
	var mysObjectRetrivalCounter = setInterval(function(){
		if(G_ErrorOccured == true){
			clearInterval(mysObjectRetrivalCounter);
			return;
		}
		var getsObjectMetadata = [];
		getsObjectMetadata = getsObjMetadataInfo();
		if(getsObjectMetadata.length > 0){
			var prefixArry = [];
			var getPkgData = JSON.parse(localStorage.getItem(G_orgId+'_packageInfo'));
			if(getPkgData.length > 0){
				for (var j in getPkgData){
					prefixArry.push(getPkgData[j].id);
				}
			}
			if(G_PkgFilter == 'none'){
				if(G_SearchFor == 'CustomSetting'){
					displayData = '<select data-placeholder="Search for '+G_SearchForLabel[G_SearchFor]+'" id="resultSelectList">';
					displayData += '<option></option>';
					displayData += '<optgroup label="Custom">';
					for(var rec in getsObjectMetadata){
						if(getsObjectMetadata[rec].namespacePrefix == null && getsObjectMetadata[rec].isCustom == true && getsObjectMetadata[rec].isCustomSetting == true){
							if(G_SearchBy == 'LABEL'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].name+'</option>';
							}
						}
					}
					displayData += '</optgroup>';	
					for(var pk in prefixArry){
						var optData = '<optgroup label="'+prefixArry[pk]+'">';
						var chk = 0;
						for(var rec in getsObjectMetadata){
							if(getsObjectMetadata[rec].namespacePrefix == prefixArry[pk] && getsObjectMetadata[rec].isCustomSetting == true){
								if(G_SearchBy == 'LABEL'){
									optData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].label+'</option>';
								}
								else if (G_SearchBy == 'APINAME'){
									optData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].name+'</option>';
								}
								chk += 1;
							}						
						}
						optData += '</optgroup>';
						if(chk > 0){
							displayData += optData;
						}
					}
					displayData += '</select>';
				}
				else{
					displayData = '<select data-placeholder="Search for '+G_SearchForLabel[G_SearchFor]+'" id="resultSelectList">';
					displayData += '<option></option>';
					displayData += '<optgroup label="Standard">';
					for(var rec in getsObjectMetadata){
						if(getsObjectMetadata[rec].namespacePrefix == null && getsObjectMetadata[rec].isCustom == false && getsObjectMetadata[rec].isCustomSetting == false){
							if(G_SearchBy == 'LABEL'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].name+'</option>';
							}
						}
					}
					displayData += '</optgroup>';
					displayData += '<optgroup label="Custom">';
					for(var rec in getsObjectMetadata){
						if(getsObjectMetadata[rec].namespacePrefix == null && getsObjectMetadata[rec].isCustom == true && getsObjectMetadata[rec].isCustomSetting == false){
							if(G_SearchBy == 'LABEL'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].name+'</option>';
							}
						}
					}
					displayData += '</optgroup>';	
					for(var pk in prefixArry){
						var optData = '<optgroup label="'+prefixArry[pk]+'">';
						var chk = 0;
						for(var rec in getsObjectMetadata){
							if(getsObjectMetadata[rec].namespacePrefix == prefixArry[pk] && getsObjectMetadata[rec].isCustomSetting == false){
								if(G_SearchBy == 'LABEL'){
									optData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].label+'</option>';
								}
								else if (G_SearchBy == 'APINAME'){
									optData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].name+'</option>';
								}
								chk += 1;
							}						
						}
						optData += '</optgroup>';
						if(chk > 0){
							displayData += optData;
						}
					}
					displayData += '</select>';	
				}// End of Else
			}
			else{
				if(G_SearchFor == 'CustomSetting'){
					displayData = '<select data-placeholder="Search for '+G_SearchForLabel[G_SearchFor]+'" id="resultSelectList">';
					displayData += '<option></option>';				
					displayData += '<optgroup label="'+G_PkgFilter+'">';
					for(var rec in getsObjectMetadata){
						if(getsObjectMetadata[rec].namespacePrefix == G_PkgFilter && getsObjectMetadata[rec].isCustomSetting == true){
							if(G_SearchBy == 'LABEL'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].name+'</option>';
							}						
						}						
					}
					displayData += '</optgroup>';
					displayData += '</select>';	
				}
				else{
					displayData = '<select data-placeholder="Search for '+G_SearchForLabel[G_SearchFor]+'" id="resultSelectList">';
					displayData += '<option></option>';				
					displayData += '<optgroup label="'+G_PkgFilter+'">';					
					for(var rec in getsObjectMetadata){
						if(getsObjectMetadata[rec].namespacePrefix == G_PkgFilter && getsObjectMetadata[rec].isCustomSetting == false){
							if(G_SearchBy == 'LABEL'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								displayData += '<option id="'+getsObjectMetadata[rec].url+'" prefix="'+getsObjectMetadata[rec].namespacePrefix+'" value="'+getsObjectMetadata[rec].url+'">'+getsObjectMetadata[rec].name+'</option>';
							}						
						}						
					}
					displayData += '</optgroup>';
					displayData += '</select>';	
				}				
			}
			//console.log('displayData--> '+displayData);
			$('div#NPS-resultSelectContainer').empty();
			$('div#NPS-resultSelectContainer').append(displayData);
			//$('div#NPS-resultSelectContainer > #resultSelectList').chosen({search_contains: true});
			initializeChosenPlugin();
			$('.NPS-showProgressBar').hide();
			clearInterval(mysObjectRetrivalCounter);
		}
	},300);
 }
 
 
 
 
 
 
 function createDataSetforRestMetadata(){
	 var count = 0;
	 var displayData = '';
	  
	 //var myMetadataCounter = setInterval(function(){
		var getMetaDataInfo = [];
		//console.log(G_SearchFor + ' ###### ' +G_PkgFilter);
		getMetaDataInfo = fetchMetaDataObjFromTooling(G_SearchFor,G_PkgFilter);
		if(getMetaDataInfo.length > 0){
			/*var prefixArry = [];
			var getPkgData = JSON.parse(localStorage.getItem(G_orgId+'_packageInfo'));
			if(getPkgData.length > 0){
				for (var j in getPkgData){
					prefixArry.push(getPkgData[j].id);
				}
			}*/
			
			if(G_PkgFilter == 'none'){
				
				displayData = '<select data-placeholder="Search for '+G_SearchForLabel[G_SearchFor]+'" id="resultSelectList">';
				displayData += '<option></option>';
				
				if(G_SearchFor == 'User'){
					displayData += '<optgroup label="Users">';
					for(var rec in getMetaDataInfo){
					
						//if(getMetaDataInfo[rec].NamespacePrefix == null){
							
								var url = 'https://'+window.location.host+'/'+getMetaDataInfo[rec].Id;
								displayData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+url+'">'+getMetaDataInfo[rec].Name+'</option>';
							
							
						//}
					}
					displayData += '</optgroup>';
				}
				else{
					displayData += '<optgroup label="custom">';
					for(var rec in getMetaDataInfo){
					
						//if(getMetaDataInfo[rec].NamespacePrefix == null){
							if(G_SearchBy == 'LABEL'){
								var url = 'https://'+window.location.host+'/'+getMetaDataInfo[rec].Id;
								displayData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+url+'">'+getMetaDataInfo[rec].Label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								var url = 'https://'+window.location.host+'/'+getMetaDataInfo[rec].Id;
								displayData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+url+'">'+getMetaDataInfo[rec].Name+'</option>';
							}
						//}
					}
					displayData += '</optgroup>';
				}
				
				/*for(var pk in prefixArry){
					var optData = '<optgroup label="'+prefixArry[pk]+'">';
					var chk = 0;
					for(var rec in getMetaDataInfo){
						if(getMetaDataInfo[rec].NamespacePrefix == prefixArry[pk]){
							if(G_SearchBy == 'LABEL'){
								optData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+getMetaDataInfo[rec].Label+'">'+getMetaDataInfo[rec].Label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								optData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+getMetaDataInfo[rec].Name+'">'+getMetaDataInfo[rec].Name+'</option>';
							}	
							chk += 1;
						}						
					}
					optData += '</optgroup>';
					if(chk > 0){
						displayData += optData;
					}
				}*/
				displayData += '</select>';
			}
			else{
				displayData = '<select data-placeholder="Search for '+G_SearchForLabel[G_SearchFor]+'" id="resultSelectList">';
				displayData += '<option></option>';
				if(G_SearchFor == 'User'){
					displayData += '<optgroup label="Users">';
					for(var rec in getMetaDataInfo){
						//if(getMetaDataInfo[rec].NamespacePrefix == null){
							var url = 'https://'+window.location.host+'/'+getMetaDataInfo[rec].Id;
							displayData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+url+'">'+getMetaDataInfo[rec].Name+'</option>';
							
						//}
					}
					displayData += '</optgroup>';
				}
				else{
					displayData += '<optgroup label="'+G_PkgFilter+'">';
					for(var rec in getMetaDataInfo){
						//if(getMetaDataInfo[rec].NamespacePrefix == null){
							if(G_SearchBy == 'LABEL'){
								var url = 'https://'+window.location.host+'/'+getMetaDataInfo[rec].Id;
								displayData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+url+'">'+getMetaDataInfo[rec].Label+'</option>';
							}
							else if (G_SearchBy == 'APINAME'){
								var url = 'https://'+window.location.host+'/'+getMetaDataInfo[rec].Id;
								displayData += '<option id="'+getMetaDataInfo[rec].Id+'" prefix="'+getMetaDataInfo[rec].NamespacePrefix+'" value="'+url+'">'+getMetaDataInfo[rec].Name+'</option>';
							}
						//}
					}
					displayData += '</optgroup>';
				}
				displayData += '</select>';
			}
				
			//console.log('displayData--> '+displayData);
			$('div#NPS-resultSelectContainer').empty();
			$('div#NPS-resultSelectContainer').append(displayData);
			//clearInterval(myMetadataCounter);	
			$('.NPS-showProgressBar').hide();
			//$('div#NPS-resultSelectContainer > #resultSelectList').chosen({search_contains: true});
			initializeChosenPlugin();
		}
		else{
			displayData = '<select data-placeholder="No Data Found for '+G_SearchForLabel[G_SearchFor]+'" id="resultSelectList">';
			displayData += '<option></option>';
			displayData += '</select>';
			$('div#NPS-resultSelectContainer').empty();
			$('div#NPS-resultSelectContainer').append(displayData);
			$('.NPS-showProgressBar').hide();
			//$('div#NPS-resultSelectContainer > #resultSelectList').chosen({search_contains: true});
			initializeChosenPlugin();
		}
		
		//console.log('count--> '+count);
		count ++;	
	 //},300);		 
 }
 
 
 
 
 
 
 function fetchMetaDataObjFromTooling(metadataType,prefixString){
	var sessionCookie;
	var orgId = G_orgId;
	//console.log('###OrgId '+orgId);
	var today = new Date();
	if((window.location.href).indexOf('.visual.force.com') > -1){
		sessionCookie = localStorage.getItem(G_orgId+'_sessionId');
	}
	else{
		localStorage.setItem(G_orgId+'_sessionId',getCookie('sid'));
		sessionCookie = getCookie('sid');
	}
	if(!sessionCookie){
		alert('SF Quick Metadata Lookup Extension Says... \n\nSorry! Session not found on this page.\nPlease visit \'<your_instance>.salesforce.com\' once and then try again.');
		G_ErrorOccured = true;
		return;
	}
	var currentDate = (today.getDate()).toString()+(today.getMonth()).toString()+(today.getFullYear()).toString()+(today.getHours()).toString();
	var currentDomain = window.location.host;	
	var finalList = [];
	var displayData = [];
	var queryURL;
	G_ErrorOccured = false;
	//if (localStorage.getItem(orgId+'_'+metadataType+'Date') != currentDate){
		if(metadataType != 'ApexPage' && metadataType != 'ApexComponent' && metadataType != 'User'){
			var param;
			var continueLooping = true;
			if(param==undefined || param==''){
				if(prefixString != 'none'){
					queryURL = "/services/data/v30.0/query/?q=SELECT+Id,Name,NamespacePrefix+from+"+metadataType+"+Where+NamespacePrefix='"+prefixString+"'";	
				}
				else{
					queryURL = "/services/data/v30.0/query/?q=SELECT+Id,Name,NamespacePrefix+from+"+metadataType+"+Where+NamespacePrefix=''";
				}
			}else{
				queryURL = param;
			}
			//console.log('####queryURL '+ queryURL);
			$.ajax({
				url : "https://"+currentDomain+queryURL,
				async: false,
				headers : {"Authorization": "Bearer "+ sessionCookie},
				contentType : "application/json"
			}).done(function(response){
				//console.log('PRIMARY DATA--> '+JSON.stringify(response));
				for(var i in response.records){
					//if(response.records[i].NamespacePrefix != 'sf_com_apps' && response.records[i].NamespacePrefix != 'sf_chttr_apps'){
						var obj = {
							Name: response.records[i].Name,
							Id : response.records[i].Id,
							NamespacePrefix : response.records[i].NamespacePrefix,
							Label : null
						};
						finalList.push(obj);
					//}
				}				
				//console.log('##'+metadataType+' '+JSON.stringify(finalList));
				
				localStorage.removeItem(orgId+'_'+metadataType+'Info');
				//localStorage.setItem(orgId+'_'+metadataType+'Date', currentDate);
				localStorage.setItem(orgId+'_'+metadataType+'Info', JSON.stringify(finalList));		
				
				displayData = finalList;
				
				if(response.nextRecordsUrl){
					param = response.nextRecordsUrl;
				}
				
			}).fail(function(error){				
				alert('Error!! Unable to fetch data from your salesforce instance' + JSON.stringify(error));
				continueLooping = false;
			});	
		}
		else if (metadataType == 'User'){
			var param;
			var continueLooping = true;
			if(param==undefined || param==''){
				if(prefixString != 'none'){
					queryURL = "/services/data/v30.0/query/?q=SELECT+Id,Name,Username+from+"+metadataType;	
				}
				else{
					queryURL = "/services/data/v30.0/query/?q=SELECT+Id,Name,Username+from+"+metadataType;
				}
			}else{
				queryURL = param;
			}
			//console.log('####queryURL '+ queryURL);
			$.ajax({
				url : "https://"+currentDomain+queryURL,
				async: false,
				headers : {"Authorization": "Bearer "+ sessionCookie},
				contentType : "application/json"
			}).done(function(response){
				//console.log('PRIMARY DATA--> '+JSON.stringify(response));
				for(var i in response.records){
					//if(response.records[i].NamespacePrefix != 'sf_com_apps' && response.records[i].NamespacePrefix != 'sf_chttr_apps'){
						var obj = {
							Name: response.records[i].Name,
							Id : response.records[i].Id,
							NamespacePrefix : null,
							Label : null
						};
						finalList.push(obj);
					//}
				}				
				//console.log('##'+metadataType+' '+JSON.stringify(finalList));
				
				localStorage.removeItem(orgId+'_'+metadataType+'Info');
				//localStorage.setItem(orgId+'_'+metadataType+'Date', currentDate);
				localStorage.setItem(orgId+'_'+metadataType+'Info', JSON.stringify(finalList));		
				
				displayData = finalList;
				
				if(response.nextRecordsUrl){
					param = response.nextRecordsUrl;
				}
				
			}).fail(function(error){				
				alert('Error!! Unable to fetch data from your salesforce instance' + JSON.stringify(error));
				continueLooping = false;
			});
		}
		else{
			var param;
			var continueLooping = true;
			if(param==undefined || param==''){
				if(prefixString != 'none'){
					queryURL = "/services/data/v30.0/query/?q=SELECT+Id,Name,MasterLabel,NamespacePrefix+from+"+metadataType+"+Where+NamespacePrefix='"+prefixString+"'";
				}				
				else{
					queryURL = "/services/data/v30.0/query/?q=SELECT+Id,Name,MasterLabel,NamespacePrefix+from+"+metadataType+"+Where+NamespacePrefix=''";
				}				
			}else{
				queryURL = param;
			}
			//console.log('####queryURL '+ queryURL);
			$.ajax({
				url : "https://"+currentDomain+queryURL,
				async: false,
				headers : {"Authorization": "Bearer "+ sessionCookie},
				contentType : "application/json"
			}).done(function(response){
				for(var i in response.records){
					//if(response.records[i].NamespacePrefix != 'sf_com_apps' && response.records[i].NamespacePrefix != 'sf_chttr_apps'){
						var obj = {
							Name: response.records[i].Name,
							Id : response.records[i].Id,
							NamespacePrefix : response.records[i].NamespacePrefix,
							Label : response.records[i].MasterLabel
						};
						finalList.push(obj);
					//}
				}				
				//console.log('##'+metadataType+' '+JSON.stringify(finalList));
				
				
				localStorage.removeItem(orgId+'_'+metadataType+'Info');
				//localStorage.setItem(orgId+'_'+metadataType+'Date', currentDate);
				localStorage.setItem(orgId+'_'+metadataType+'Info', JSON.stringify(finalList));
				
				
				displayData = finalList;
				if(response.nextRecordsUrl){
					param = response.nextRecordsUrl;
				}
				
			}).fail(function(error){				
				alert('Error!! Unable to fetch data from your salesforce instance' + JSON.stringify(error));
				continueLooping = false;
			});
		}
	//}
	//else{
	//	displayData = JSON.parse(localStorage.getItem(orgId+'_'+metadataType+'Info'));
	//}
	return displayData;
 }
 
 
 
 function fetchPackageInformation(){
 //console.log('In package Info');
	var sessionCookie;
	var orgId =  G_orgId;
	if((window.location.href).indexOf('.visual.force.com') > -1){
		sessionCookie = localStorage.getItem(G_orgId+'_sessionId');
		//alert('inside the href '+sessionCookie);
	}
	else{
		localStorage.setItem(G_orgId+'_sessionId',getCookie('sid'));
		sessionCookie = getCookie('sid');
	}
	if(!sessionCookie){
		alert('SF Quick Metadata Lookup Extension Says... \n\nSorry! Session not found on this page.\nPlease visit \'<your_instance>.salesforce.com\' once and then try again.');
		G_ErrorOccured = true;
		return;
	}	
	
	//console.log('###OrgId '+orgId);
	G_ErrorOccured =  false;
	var currentDomain = window.location.host;
	var today = new Date();
	var currentDate = (today.getDate()).toString()+(today.getMonth()).toString()+(today.getFullYear()).toString()+(today.getHours()).toString();
	//console.log('###currentDate '+currentDate);
	var finalList = [];
	var packageWrap = [];
	var queryURL;
	if(localStorage.getItem(orgId+'_packageDate') != currentDate){
		var param;
		var continueLooping = true;
			if(param==undefined || param==''){
				queryURL = "/services/data/v31.0/query/?q=SELECT+id,NamespacePrefix+from+PackageLicense";
			}else{
				queryURL = param;
			}
			//console.log('####queryURL '+ queryURL);
			$.ajax({
				url : "https://"+currentDomain+queryURL,
				async: false,
				headers : {"Authorization": "Bearer "+ sessionCookie},
				contentType : "application/json"
			}).done(function(response){
				for(var i in response.records){
					if(response.records[i].NamespacePrefix != 'sf_com_apps' && response.records[i].NamespacePrefix != 'sf_chttr_apps'){
						var obj = {
							value: response.records[i].NamespacePrefix,
							Id : response.records[i].NamespacePrefix
						};
						finalList.push(obj);
					}
				}
				var apttusPackage = {'Apttus':'Apttus Contract Management','Apttus_Proposal':'Apttus Proposal Management','Apttus_Config2':'Apttus Configuration & Pricing','Apttus_QPConfig':'Apttus Quote/Proposal-Configuration Integration','Apttus_Approval':'Apttus Approvals Management','Apttus_QPApprov':'Apttus Quote/Proposal Approvals Management','Apttus_Echosign':'Apttus Echosign Integration','Apttus_CMConfig':'Apttus Contract-Configuration Integration','Apttus_QPComply':'Apttus Quote/Proposal-Contract Integration','Apttus_Collab':'Apttus X-Author For Chatter','Apttus_QPAsset':'Apttus Quote/Proposal-Asset Integration','Apttus_QPAsset':'Apttus Quote/Proposal-Asset Integration','Apttus_CPQApi':'Apttus CPQ Api','Apttus_DealMgr':'Apttus Deal Manager','Apttus_DealOpti':'Apttus Deal Maximizer','Apttus_DLApprov':'Apttus Deal Approvals Management','Apttus_CQApprov':'Apttus CPQ Approvals Management','Apttus_CPQOpti':'Apttus CPQ Maximizer','Apttus_DocuApi':'Apttus DocuSign Api','Apttus_CMDSign':'Apttus Contract DocuSign Integration','Apttus_XApps':'Apttus X-Author For Excel','Apttus_CUApprov':'Apttus Custom Approvals Management','Apttus_XAppsDS':'Apttus X-Author Designer For Excel'};
				
				if(finalList.length > 0){
					for(var key in finalList){
						if(finalList[key].Id in apttusPackage){
							var pkg = {
								value: apttusPackage[finalList[key].Id],
								id: finalList[key].Id
							};
							packageWrap.push(pkg);	
						}
						else{
							var pkg = {
								value: finalList[key].Id,
								id: finalList[key].Id
							};
							packageWrap.push(pkg)
						}
					}
				}
				
				localStorage.setItem(orgId+'_packageDate', currentDate);
				localStorage.setItem(orgId+'_packageInfo', JSON.stringify(packageWrap));
								
				
				if(response.nextRecordsUrl){
					param = response.nextRecordsUrl;
				}
				
			}).fail(function(error){
				G_ErrorOccured = true;
				console.log('SF Quick Meatadata Lookup Error!! Unable to fetch data from your salesforce instance' + JSON.stringify(error));				
				continueLooping = false;
			});
	}
	else{
		packageWrap = JSON.parse(localStorage.getItem(orgId+'_packageInfo'));
		
	}	
	return packageWrap;
 }
 
 
 
 function getsToolingObjMetadataInfo(){
	askSalesforce('/services/data/v30.0/tooling/sobjects', function(responseText) {
		var ALLSObjectList = [];
		var generalMetadataResponse = JSON.parse(responseText);
		//console.log('####generalMetadataResponse'+generalMetadataResponse);
		//console.log('####generalMetadataResponse.sobjects'+JSON.stringify(generalMetadataResponse.sobjects));
		for (var i = 0; i < generalMetadataResponse.sobjects.length; i++){
			if (generalMetadataResponse.sobjects[i].layoutable != false || generalMetadataResponse.sobjects[i].triggerable != false){
				var objtype = ((generalMetadataResponse.sobjects[i].name).match(/__/g) || []).length;
				if(objtype > 1){
					var obj= {
						name : generalMetadataResponse.sobjects[i].name,
						id: (generalMetadataResponse.sobjects[i].name).substr(0,(generalMetadataResponse.sobjects[i].name).indexOf('__'))
					}
					ALLSObjectList.push(obj);
				}
				else{
					var obj= {
						name : generalMetadataResponse.sobjects[i].name,
						id: generalMetadataResponse.sobjects[i].name
					}
					ALLSObjectList.push(obj);
				}
			}			
		}
		//console.log('###ALLSObjectList '+ JSON.stringify(ALLSObjectList));
	});
 }
 
 function askSalesforce(url, callback){
		var session;
	    var orgId = document.cookie.match(/(^|;\s*)sid=(.+?)!/)[2];
    if((window.location.href).indexOf('.visual.force.com') > -1){
		session = localStorage.getItem(G_orgId+'_sessionId');
	}
	else{
		localStorage.setItem(G_orgId+'_sessionId',getCookie('sid'));
		session = getCookie('sid');
	}
	if(!session){
		alert('SF Quick Metadata Lookup Extension Says... \n\nSorry! Session not found on this page.\nPlease visit \'<your_instance>.salesforce.com\' once and then try again.');
		callback();
		G_ErrorOccured =  true;
		return;
	}
    /*if (!session) {
        alert("Session not found");
        callback();
        return;
    }*/
	G_ErrorOccured =  false;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://" + document.location.hostname + url, true);
    xhr.setRequestHeader('Authorization', "OAuth " + session);
    xhr.setRequestHeader('Accept', "application/json");
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4) {
            callback(xhr.responseText);
            //console.log(JSON.parse(xhr.responseText));
        }
    }
    xhr.send();
}  
 
function getCookie(c_name){
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++){
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name){
			return unescape(y);
		}
	}
}
