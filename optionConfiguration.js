/* 
	## ----   SF Quick Metadata Lookup   ---- ##
	version : 1.1
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

/* Option Configuration page Scripting logic */


var G_PAGE = '';
var G_run = false;
function getPagefromStroage(){
chrome.storage.sync.get("PAGEVISIBILITY", function(obj){
	G_PAGE = obj["PAGEVISIBILITY"];
});
}
var initialTimer = setInterval(function(){
	if(G_run == false){
		getPagefromStroage();
		G_run = true;
	}
	if(G_PAGE != ''){
	  var setRadio = '';
	  var text = '';
		if(G_PAGE.indexOf('.salesforce.com') > -1){
			setRadio = 'SFONLY';
		}
		else if(G_PAGE.indexOf('.visual.force.com') > -1){
			setRadio = 'VFONLY';
		}
		else if(G_PAGE.indexOf('DEFAULT') > -1){
			setRadio = 'DEFAULT';
		}
		else{
			setRadio = 'CUSTOM';
		}
		$('input[name=visibilityRadio]').each(function(){
			if($(this).attr('id') == setRadio){
				$(this).prop('checked',true);
				if($(this).attr('id') == 'CUSTOM'){
					$('input#CustomPageVisibleUrl').val(G_PAGE);
					$('input#CustomPageVisibleUrl').show();
				}
			}
			else{
				$(this).prop('checked',false);
			}
		});	
		$('div.loadingImg').hide();
		clearInterval(initialTimer);
	}
},500);

setTimeout(function(){
clearInterval(initialTimer);
$('div.loadingImg').hide();
},2500);

function parseCustomPageUrl(page){
	chrome.storage.sync.set({"PAGEVISIBILITY": page}, function(){
		$('div.loadingImg').hide();
		alert('Your configuration has been saved.');
		
	});
}
$(document).on('click','a.myOwnLink',function(){
	var clickedEle = $(this).attr('id');	
	$('.collapse').each(function(){
		if($(this).attr('id') == clickedEle){
			if($(this).hasClass('in')){				
				$(this).collapse('hide');
			}
			else{
				$(this).collapse('show');
			}
		}
		else{
			console.log($(this).attr('id'));
			$(this).removeClass('in');
		}
	});
});

$(document).on('change','input[name=visibilityRadio]',function(){
	if($(this).attr('id') == 'CUSTOM'){
		$('#CustomPageVisibleUrl').show();
	}
	else{
		$('#CustomPageVisibleUrl').hide();
	}
});
$(document).on('change','input#CustomPageVisibleUrl',function(){
	var customUrl = $(this).val();
	if(customUrl != null && customUrl != ''){
		var parsedUrl = customUrl.toLowerCase();
		if(parsedUrl.indexOf('https://') > -1 || parsedUrl.indexOf('http://') > -1){
			parsedUrl = parsedUrl.replace('https://','');
			parsedUrl = parsedUrl.replace('http://','');
		}
		if(parsedUrl.indexOf('//') > -1){
			parsedUrl = parsedUrl.replace('//','');
		}
		if(parsedUrl.indexOf('/') > -1){
			parsedUrl = parsedUrl.substring(parsedUrl.indexOf('/'));
		}
		if(parsedUrl.indexOf('?') > -1){
			parsedUrl = parsedUrl.substring(0,parsedUrl.indexOf('?'));
		}		
		$('#CustomPageVisibleUrl').val(parsedUrl);
	}
});


$(document).on('click','#SAVECONFIG',function(){	
	var visibilityType = $('input[name=visibilityRadio]:checked').attr('id');
	$('div.loadingImg').show();
	var page = '';
	if(visibilityType == 'CUSTOM'){
		var getURL = '';
		getURL = $('input#CustomPageVisibleUrl').val();
		if(getURL != ''){
			page = getURL;
		}
		else{
			alert('Provide the Cutsom page URL');
			$('div.loadingImg').hide();
			return;
		}
	}
	else if(visibilityType == 'SFONLY'){
		page = '.salesforce.com';
	}
	else if(visibilityType == 'VFONLY'){
		page = '.visual.force.com';
	}
	else if(visibilityType == 'DEFAULT'){
		page = 'DEFAULT';
	}
	parseCustomPageUrl(page);
});
