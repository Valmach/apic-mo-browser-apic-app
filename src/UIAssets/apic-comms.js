/*
*   LICENSE
*   Copyright (c) 2015-2017, Simon Birtles http://linkedin.com/in/simonbirtles
*   All rights reserved.
*   Dual licensed under the MIT and GPL licenses.
*/

//var username;
//var password;
//var apicIP;
//username = 'username';
//password = 'password';
//apicIP = '10.0.0.1';


//var webProtocol = "https://"
//var apicLoginDomain = "";

//var apicSessionToken;
var useCredentials = false;
//var socket;


// function apicLogin(funcLoggedIn)
// {
//     var loginDomain;
//     if( (apicLoginDomain === "") || ( apicLoginDomain == "DefaultAuth")){
//         loginDomain = "";
//     }
//     else{
//         loginDomain = "apic:" + apicLoginDomain + "\\\\";
//     }

//     //var loginXML = "<aaaUser name='apic:ACSS\\\\" + username + "' pwd=' " + password + "'/>";
//     var loginJSON = '{ "aaaUser": { "attributes": {"name":"' + loginDomain + username + '", "pwd":"' + password + '"}  } }';

//     var xhr = new XMLHttpRequest();
//     xhr.withCredentials = useCredentials;

//     var defaultPostLoginFunc = 
//         function () 
//         {
//             if (this.readyState === 4) 
//             {
//                 if(this.status !== 200)                                                 
//                 {
//                     apicSessionToken = null;
//                     console.log("**** APIC login failed **** status=", this.status);
//                     appMsg.postMessage("APIC login failed : Status: " + this.status + " Reason: " + this.statusText, "error" );
//                     apicLoginCred.getUserCredentials();
//                     return;
//                 }

//                 if(this.status === 200)
//                 {
//                     respJson = JSON.parse(this.responseText) ;

//                     console.log(respJson.imdata[0]);
//                     if(respJson.imdata[0].hasOwnProperty('error'))
//                     {
//                         var errorCode = respJson.imdata[0].error.attributes.code;
//                         var errorText = respJson.imdata[0].error.attributes.text;
//                         appMsg.postMessage("APIC login failed - Status: " + errorCode + " Reason: " + errorText, "error");
//                         apicLoginCred.getUserCredentials();
//                         return;
//                     }

//                     appMsg.postMessage("APIC login successful. APIC Version: " + respJson.imdata[0].aaaLogin.attributes.version)
//                     apicSessionToken = respJson.imdata[0].aaaLogin.attributes.token ; 
//                     initalLoadComplete = true;

//                     var timeoutSec = 30;
//                     if(respJson.imdata[0].aaaLogin.attributes.hasOwnProperty('restTimeoutSeconds'))
//                     {
//                         timeoutSec = (respJson.imdata[0].aaaLogin.attributes.restTimeoutSeconds / 2);
//                     }
//                     setTimeout(apicLoginRefresh, timeoutSec * 1000);
//                     // createWebSocket(apicSessionToken); 

//                     // call user defined function
//                     //getRoot();
//                     if(funcLoggedIn !== undefined){
//                         funcLoggedIn(this);}
                    
//                     return;
//                 }
//             }
//         };

    
//     xhr.onerror = function(e){
//         appMsg.postMessage("APIC login : Unknown Error Occured. Server response not received. [" + e + "]", "error");
//         console.log("xhr.onerror: ", e);
//     };
    

//     xhr.addEventListener("readystatechange",  defaultPostLoginFunc);
//     xhr.open("POST", webProtocol + apicIP + "/api/aaaLogin.json", true);
//     xhr.setRequestHeader("content-type", "text/json");
//     xhr.send(loginJSON);
//     appMsg.postMessage("Attempting login [" + username + "] to APIC: " + webProtocol + apicIP)
//     return;
// }

// function apicLoginRefresh()
// {
//     var xhr = new XMLHttpRequest();
//     xhr.withCredentials = useCredentials;
//     xhr.addEventListener("readystatechange", 
//         function () 
//         {
//             if (this.readyState === 4) 
//             {
//                 if(this.status === 200)
//                 { 
//                     respJson = JSON.parse(this.responseText) ;
//                     apicSessionToken = respJson.imdata[0].aaaLogin.attributes.token ;
//                     timeoutSec = (respJson.imdata[0].aaaLogin.attributes.restTimeoutSeconds / 2);
//                     setTimeout(apicLoginRefresh, timeoutSec * 1000);
//                     console.log("session refreshed: ", respJson);                    
//                 }
//                 else
//                 {
//                     respJson = JSON.parse(this.responseText) ;
//                     appMsg.postMessage("APIC periodic login refresh failed. [" + respJson + "]", "error");
//                     console.log("apicLoginRefresh Failed, text = ", respJson);

//                     // try full login again
//                     apicLogin();
//                 }
//             }
//         });
//     xhr.open("GET", webProtocol + apicIP + "/api/aaaRefresh.json", true);
//     //xhr.open("GET", webProtocol + apicIP + "/api/node/mo/info.json", true);
//     xhr.setRequestHeader("content-type", "text/json");
//     xhr.setRequestHeader("APIC-challenge", apicSessionToken);
//     xhr.send();
//     return;
// }

// function createWebSocket(token)
// {
//     // Create a new WebSocket.
//     socket = new WebSocket('ws://198.18.133.200/socket'+apicSessionToken); 

//     // Show a connected message when the WebSocket is opened.
//     socket.onopen = function(event) {
//         //console.log('socket open');
//         //socketStatus.innerHTML = 'Connected to: ' + event.currentTarget.URL;
//         //socketStatus.className = 'open';
//     };
//     // Handle any errors that occur.
//     socket.onerror = function(error) {
//         console.log('WebSocket Error: ' + error);
//     };
//     // console.log("Login json= ", respJson);
//     // console.log("aaaLogin= ", respJson.imdata[0].aaaLogin) ;
//     return;
// }

function getRoot(state)
{
    console.log("getRoot Called");
    // default to polUni\uni
   var url = '/api/mo/uni.json';
   var defaultQueryFilter = 
   "query-target=children&target-subtree-class=fvTenant,vmmProvP,physDomP,fabricInst,fcDomP,l2extDomP,l3extDomP";

    var lfunc = function (_this_) 
        {
            if ((_this_.readyState === 4) && (_this_.status === 200))
            {                          
                // reset DOM
                d3.select("svg#msvg").select('g').selectAll('*').remove();
                appendSVGDefs(svg);

                // parse JSON and create new datum for root node
                respJson = JSON.parse(_this_.responseText) ; 
                for(firstKey in respJson.imdata[0]);
                //console.log("abstract class name= ", firstKey);    
                var childNode = respJson.imdata[0][firstKey].attributes;
        
                root = d3.hierarchy(childNode);//, function(d) { return d.children; });
                root.appdata = [];   // save session data
                root.x0 = root.y0 = 0;
                root.id = "n" + nextNodeID++;
                root.parent = null;
                root.children = null;
                root._children = null;
                root.label = "(" + root.data.dn + ")";
                root.depth = 0;
                root.absclassname = firstKey;
                root.dn = childNode.dn;
                root.defaultQueryFilter = defaultQueryFilter;
                root.appdata.defaultQueryFilter = defaultQueryFilter;
                root.appdata.lastQueryFilter = defaultQueryFilter;

                //console.log("childNode.faults.critical ", childNode.faults[0].warning);
                root.critical = 0;
                root.major = 0;
                root.minor = 0;
                root.warning = 0;
                root.info  = 0;
                
                //console.log("Root is: ", root);                
                update(root);   
                resetNodeTextPos();             
                updateScale();
                showNodeProperties(root);
            }
        }

    sendToAPIC("GET", url, lfunc);   
}

// url is postfix to https://10.10.10.10 so looks like /api/mo/...
function sendToAPIC(getOrPost, url, funcListen)
{
    var localurl = document.location.origin + url;    
    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = useCredentials;

    var funcWrapper = function()
    {
        if(this.readyState === 4)
        {
            if((this.status !== 200) && (this.status !== 400))      // 400 Bad Request - Can be ok from fltcnts not existing on MO.
            {                                                 
                console.log("[sendToAPIC]: Failure status=", this.status);
                appMsg.postMessage("[sendToAPIC] >> Failure >> Status: " + this.status + " Reason: " + this.statusText, "error" );
            }
            funcListen(this);
        }
    };
        
    xhr.addEventListener("readystatechange", funcWrapper); 
    xhr.open(getOrPost, localurl, true);
    //xhr.setRequestHeader("content-type", "text/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("DevCookie", Ext.util.Cookies.get("app_HaystackNetworks_ACIModelBrowser_token"));
    xhr.setRequestHeader("APIC-Challenge", Ext.util.Cookies.get("app_HaystackNetworks_ACIModelBrowser_urlToken"));
    xhr.send();   
}

function getNodeFaults(node)
{
    //                                  "Relationship Object" : "Containing Object"
    var dn = (node.data.hasOwnProperty('tDn') ? node.data.tDn : node.data.dn )

    var url = '/api/mo/' + dn + '/fltCnts.json';
    var lfunc = function (_this_) 
        {
            if(_this_.status === 400){ return; }

            if( (_this_.readyState === 4) && (_this_.status === 200))
            {
                // parse response JSON
                respJson = JSON.parse(_this_.responseText) ;

                // update data objects
                for(firstKey in respJson.imdata[0]);
                node.critical = parseInt(respJson.imdata[0][firstKey].attributes.crit);
                node.major = parseInt(respJson.imdata[0][firstKey].attributes.maj);
                node.minor = parseInt(respJson.imdata[0][firstKey].attributes.minor);                
                node.warning = parseInt(respJson.imdata[0][firstKey].attributes.warn);

                // update DOM objects
                var n = d3.select('circle#'+node.id);
                n.attr('critical', node.critical)
                n.attr('major',   node.major)
                n.attr('minor',   node.minor)
                n.attr('warning', node.warning)
                n.attr('info',  node.info)
                n.attr("class", 
                    function() { 
                        if(node.critical > 0) return "node critical";
                        if(node.major > 0) return "node major";
                        if(node.minor > 0) return "node minor";
                        if(node.warning > 0) return "node warning";
                        return "node normal";
                    });

                g = n.select( function() { return this.parentNode; } );                     
                txtFault = g.select("text#faultcount");                                  
                txtFault.text( 
                        function()
                        { 
                            // console.log("parentnode", this.parentNode);
                            var count = node.critical + node.major + node.minor + node.warning + node.info;
                            if( count===undefined || count===0){ return ""; }
                            return (count).toString();
                        } ) ;                  
            }
        }
            
    sendToAPIC("GET", url, lfunc);
    return;
}

// this needs to be made generic to return just the object if found or
// allow the caller to send a function with the call to this func to run
// once data recieved. - 
//
// Gets "nodeDn" managed object attributes.
// Uses parentNode to update with nodeDn (parentNode's child) details
function getNodeByDn(parentNode, nodeDn)
{
    //console.log("getNodeByDn() - for testing getting the root object")
    var url = '/api/mo/' + nodeDn  + '.json'; 
    var xhr = new XMLHttpRequest();
    //console.log("getNodeByDn::URL: ", url);    

    var lfunc = function (_this_) 
        {
            if ((_this_.readyState === 4) && (_this_.status === 200))
            {
                //console.log("getNodeByDn for: ", '/api/mo/' + nodeDn)
                respJson = JSON.parse(_this_.responseText) ;
                //console.log("getNodeByDn = ", respJson.imdata[0]);

                if(respJson.totalCount > 0)
                {
                    if(createNode(parentNode, respJson.imdata[0]))
                    {
                        update(parentNode);
                   // return respJson.imdata[0];
                    }
                }
            }
            return; 
        }
        
    sendToAPIC("GET", url, lfunc); 
}

