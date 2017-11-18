var nextNodeID=0,selectedNode,root,bNodePropShown=!0,bMessageWindowShown=!0,bToolTips=!0,duration=750,initalLoadComplete=!1,bShowObjectParentDownstream=!0,nodeContextmenu=[{title:'Toggle Fault Tooltips',action:function(){bToolTips=!bToolTips,d3.select('input#tooltips').property('checked',bToolTips)}},{title:'Edit Query Filter',action:function(e,l){editQueryFilter(l)}},{title:'Filter On This Class',action:function(e,l){filterSiblings(l)}},{title:'Change Root MO',action:function(){chgRootWin.showRootNodeSelection()}}],margin={top:20,right:50,bottom:30,left:50},width=window.innerWidth-margin.left-margin.right,height=window.innerHeight-margin.top-margin.bottom,div=d3.select('body').append('g').attr('id','ttg').append('div').attr('class','tooltip').style('opacity',0),zoom=d3.zoom().scaleExtent([-Infinity,Infinity]).on('zoom',zoomed),svgContainer=d3.select('body').append('div').attr('id','dcontainer').classed('svg-container'),svg=d3.select('body').select('div#dcontainer').append('svg').attr('id','msvg').call(zoom).on('dblclick.zoom',null).attr('preserveAspectRatio','xMinYMin meet').attr('viewBox','0 0 '+height+' '+width).classed('svg-content',!0).append('g').attr('id','svg-g'),treemap=d3.tree().nodeSize([5,5]).separation(function(){return 10});const chgRootWin=new ChangeRoot,appMsg=new AppMessages,objProp=new ObjectProperties;function zoomed(){d3.select('#msvg').select('g').attr('transform',d3.event.transform)}function startup(){return initalLoadComplete=!0,void getRoot()}var useCredentials=!1;function getRoot(){console.log('getRoot Called');var p='query-target=children&target-subtree-class=fvTenant,vmmProvP,physDomP,fabricInst,fcDomP,l2extDomP,l3extDomP';sendToAPIC('GET','/api/mo/uni.json',function(u){if(4===u.readyState&&200===u.status){for(firstKey in d3.select('svg#msvg').select('g').selectAll('*').remove(),appendSVGDefs(svg),respJson=JSON.parse(u.responseText),respJson.imdata[0]);var m=respJson.imdata[0][firstKey].attributes;root=d3.hierarchy(m),root.appdata=[],root.x0=root.y0=0,root.id='n'+nextNodeID++,root.parent=null,root.children=null,root._children=null,root.label='('+root.data.dn+')',root.depth=0,root.absclassname=firstKey,root.dn=m.dn,root.defaultQueryFilter=p,root.appdata.defaultQueryFilter=p,root.appdata.lastQueryFilter=p,root.critical=0,root.major=0,root.minor=0,root.warning=0,root.info=0,update(root),resetNodeTextPos(),updateScale(),showNodeProperties(root)}})}function sendToAPIC(e,l,p){var c=document.location.origin+l,u=new XMLHttpRequest;u.addEventListener('readystatechange',function(){4===this.readyState&&(200!==this.status&&400!==this.status&&(console.log('[sendToAPIC]: Failure status=',this.status),appMsg.postMessage('[sendToAPIC] >> Failure >> Status: '+this.status+' Reason: '+this.statusText,'error')),p(this))}),u.open(e,c,!0),u.setRequestHeader('Accept','application/json'),u.setRequestHeader('DevCookie',Ext.util.Cookies.get('app_HaystackNetworks_ACIModelBrowser_token')),u.setRequestHeader('APIC-Challenge',Ext.util.Cookies.get('app_HaystackNetworks_ACIModelBrowser_urlToken')),u.send()}function getNodeFaults(e){var l=e.data.hasOwnProperty('tDn')?e.data.tDn:e.data.dn;sendToAPIC('GET','/api/mo/'+l+'/fltCnts.json',function(u){if(400!==u.status&&4===u.readyState&&200===u.status){for(firstKey in respJson=JSON.parse(u.responseText),respJson.imdata[0]);e.critical=parseInt(respJson.imdata[0][firstKey].attributes.crit),e.major=parseInt(respJson.imdata[0][firstKey].attributes.maj),e.minor=parseInt(respJson.imdata[0][firstKey].attributes.minor),e.warning=parseInt(respJson.imdata[0][firstKey].attributes.warn);var m=d3.select('circle#'+e.id);m.attr('critical',e.critical),m.attr('major',e.major),m.attr('minor',e.minor),m.attr('warning',e.warning),m.attr('info',e.info),m.attr('class',function(){return 0<e.critical?'node critical':0<e.major?'node major':0<e.minor?'node minor':0<e.warning?'node warning':'node normal'}),g=m.select(function(){return this.parentNode}),txtFault=g.select('text#faultcount'),txtFault.text(function(){var h=e.critical+e.major+e.minor+e.warning+e.info;return void 0===h||0===h?'':h.toString()})}})}function getNodeByDn(e,l){var c=new XMLHttpRequest;sendToAPIC('GET','/api/mo/'+l+'.json',function(m){4===m.readyState&&200===m.status&&(respJson=JSON.parse(m.responseText),0<respJson.totalCount&&createNode(e,respJson.imdata[0])&&update(e))})}function getChildren(e){var l,p,c;if(p=e.hasOwnProperty('defaultQueryFilter')&&e.defaultQueryFilter?e.defaultQueryFilter:'query-target=children',e.data.hasOwnProperty('tDn')){var u=getParentDn(e.data.dn);console.log('parentNode.data.hasOwnProperty(\'tDn\') = true'),console.log('looking for parentDN= ',u),isObjectOnTreePath(e,u)||0===u.length?(console.log('ParentDn found on tree back to root'),console.log('dn = parentNode.data.tDn= ',e.data.tDn),l=e.data.tDn,p='query-target=self'):(console.log('ParentDn NOT found on tree back to root'),l=e.data.dn)}else console.log('parentNode.data.hasOwnProperty(\'tDn\') = false'),l=e.data.dn;c='/api/mo/'+l+'.json?'+p,console.log('getChildren URL: ',c);return startNodeLoading(e),void sendToAPIC('GET',c,function(h){if(4===h.readyState){if(respJson=JSON.parse(h.responseText),400===h.status)if(respJson.imdata[0].hasOwnProperty('error')){var f=respJson.imdata[0].error.attributes.code,v=respJson.imdata[0].error.attributes.text;appMsg.postMessage('getChildren failed with error code '+f+'<b>['+v+']</b> for \n'+c,'error')}else appMsg.postMessage('getChildren failed with 400['+h.statusText+ +'] for '+c+'. Check URL/Filter is Valid','error');if(200===h.status)if(0<respJson.totalCount){var w=respJson.imdata.slice(0);w.sort(function(M,O){for(classTypeA in M);for(classTypeB in O);return M[classTypeA].attributes.dn>O[classTypeB].attributes.dn?1:M[classTypeA].attributes.dn<O[classTypeB].attributes.dn?-1:0});for(var N=e.hasOwnProperty('children')&&null!==e.children?e.children.slice(0):[],k=0;k<respJson.imdata.length;k++){for(var C=w[k],A=!1,P=0;P<N.length;P++){for(firstKey in C);var D=C[firstKey].attributes;if(N[P].data.dn===D.dn){updateNode(e,N[P]),N.splice(P,1),A=!0;break}}A||createNode(e,C)}for(var P=0;P<N.length;P++)deleteNode(e,N[P]);update(e),resetNodeTextPos()}else appMsg.postMessage(l+' has no children','info'),showTimedNotify(e,'MO has no children');stopNodeLoading(e)}})}function createNode(e,l){for(firstKey in l);var p=l[firstKey].attributes,c=p.hasOwnProperty('tDn')?p.tDn:p.dn;if(''===c)return!1;var u=d3.hierarchy(p);if(u.appdata=[],e.hasOwnProperty('_children')&&null!==e._children)for(var m=0;m<e._children.length;m++)if(e._children[m].dn===c){for(var h in e._children[m].appdata)u.appdata[h]=e._children[m].appdata[h];break}u.dn=c,u.parent=e,u.children=null,u._children=null,u.depth=e.depth+1,u.height=e.height-1,u.id='n'+nextNodeID++,u.absclassname=firstKey,u.appdata.defaultQueryFilter='query-target=children',u.defaultQueryFilter=u.appdata.hasOwnProperty('activeQueryFilter')?u.appdata.activeQueryFilter:u.appdata.defaultQueryFilter;var f=u.dn.split(/(\/)(?=(?:[^\]]|\[[^\]]*\])*$)/),v=f.length;return u.label='('+f[v-1]+')',u.size=p.size,u.x0=0,u.y0=0,p.hasOwnProperty('faults')?(u.critical=l.faults[0].critical,u.major=l.faults[0].major,u.minor=l.faults[0].minor,u.warning=l.faults[0].warning,u.info=l.faults[0].info):(u.critical=0,u.major=0,u.minor=0,u.warning=0,u.info=0),e.hasOwnProperty('children')&&null!==e.children||(e.children=[]),e.hasOwnProperty('_children')&&null!==e._children||(e._children=[]),e.children.push(u),getNodeFaults(u),resetNodeTextPos(),!0}function updateNode(e,l){console.log('>>>>>> TODO CODE : >>>>>> updateNode= ',l);for(var p=0;p<e.children.length;p++)if(e.children[p].data.dn===l.data.dn)return void d3.select('circle#'+l.id).attr('critical',function(c){return c.critical}).attr('major',function(c){return c.major}).attr('minor',function(c){return c.minor}).attr('warning',function(c){return c.warning}).attr('info',function(c){return c.info}).attr('class',function(c){return 0<c.critical?'node critical':0<c.major?'node major':0<c.minor?'node minor':0<c.warning?'node warning':0<c.info?'node info':'node normal'})}function deleteNode(e,l){for(var p=0;p<e.children.length;p++)if(e.children[p].data.dn===l.data.dn)return void e.children.splice(p,1)}function filterSiblings(e){if(void 0!==e&&void 0!==e.absclassname&&e!==root){var l='query-target=children&target-subtree-class='+e.absclassname,p=e.parent;p.defaultQueryFilter=l,getChildren(p)}}function isObjectOnTreePath(e,l){for(var p=e.parent;null!==p;){var c;if(c=p.data.dn,c===l)return!0;p=p.parent}return!1}function toggleParentDownStream(){bShowObjectParentDownstream=!bShowObjectParentDownstream,d3.select('a#menuParentToggle').attr('class',bShowObjectParentDownstream?'toggle-on':'')}function showNodeProperties(e){objProp.updateNodeProperties(e)}function getUserCredentials(){}function updateScale(){zoomFit2()}function zoomFit2(){var e=d3.select('g#svg-g'),l=e.node().getBoundingClientRect(),p=e.node().parentElement,c=p.clientWidth,u=p.clientHeight,m=d3.select('svg#msvg'),h=d3.zoomTransform(m.node()),f=l.width,v=l.height,w=2.7,k=d3.select('svg#msvg');return k.call(zoom.transform,d3.zoomIdentity.translate(margin.left,u).scale(w)),w}function showTimedNotify(e,l){var p=10,c=d3.select('circle#'+e.id),u=c.select(function(){return this.parentNode}),m=u.append('g').attr('id','g-notify-popup-'+e.id).attr('transform','translate(0,0)'),h=m.append('rect').style('fill','#555').style('opacity',.9).style('rx','6').style('ry','6').style('width','100').style('height','16').style('x','0').style('y','0'),f=m.append('text').attr('id','notify-popup2').attr('dy','11').style('fill','white').text(function(){return l}),v=f.node().getComputedTextLength();return h.style('width',v+p),f.attr('dx',function(){return p/2}),void setTimeout(function(){d3.select('body').select('g#g-notify-popup-'+e.id).transition().duration(500).style('opacity',0).remove()},1500)}function createDNTip(e,l,p,c,u,m){var h;return h=m.data.hasOwnProperty('tDn')?m.data.tDn:m.data.dn,void e.append('g').attr('transform','translate(5,'+p+')').append('text').attr('text-anchor','start').attr('x',10).attr('y',5).append('tspan').text(function(){return h}).attr('dy',3).attr('dx',-15).attr('font-weight','bold').select(function(){return this.parentNode}).select(function(){return this.parentNode}).select(function(){return this.parentNode})}function createFaultCountTip(e,l,p,c,u,m,h){e.append('g').attr('transform','translate(5,'+p+')').append('circle').attr('r',4).attr('cx',1).attr('cy',4).attr('class',c).select(function(){return this.parentNode}).append('text').attr('text-anchor','start').attr('x',10).attr('y',5).append('tspan').text(function(){return m+': '}).attr('dy',3).select(function(){return this.parentNode}).append('tspan').attr('id',u).text(function(){return h}).select(function(){return this.parentNode}).select(function(){return this.parentNode}).select(function(){return this.parentNode})}function showProperties(){bNodePropShown=!bNodePropShown,objProp.showWindow(bNodePropShown),d3.select('a#menuPropToggle').attr('class',bNodePropShown?'toggle-on':'')}function showToolTips(){bToolTips=!bToolTips,d3.select('a#menuToolTipsToggle').attr('class',bToolTips?'toggle-on':'')}function showMessageWindow(){bMessageWindowShown=!bMessageWindowShown;var e=d3.select('div#app-msg-content');e.transition().duration(500).style('opacity',bMessageWindowShown?1:0).style('visibility',bMessageWindowShown?'visible':'hidden'),d3.select('a#menuMessageToggle').attr('class',bMessageWindowShown?'toggle-on':'')}function appendSVGDefs(e){e.append('svg:defs').selectAll('marker').data(['childtarget']).enter().append('svg:marker').attr('id',String).attr('orient','0').attr('viewBox','0 -5 10 10').attr('refX',20).attr('refY',0).attr('markerWidth',6).attr('markerHeight',6).append('svg:path').attr('d','M0,-5L10,0L0,5').attr('fill','rgb(128,128,128)'),e.append('svg:defs').selectAll('marker').data(['parenttarget']).enter().append('svg:marker').attr('id',String).attr('orient','180').attr('viewBox','0 -5 10 10').attr('refX',-8).attr('refY',0).attr('markerWidth',6).attr('markerHeight',6).append('svg:path').attr('d','M0,-5L10,0L0,5').attr('fill','rgb(128,128,128)')}function collapse(e){e.children&&(e._children=e.children,e._children.forEach(collapse),e.children=null)}function startNodeLoading(e){var l=d3.select('circle#'+e.id);return e.appdata.hasOwnProperty('r')||(e.appdata.r=e.r),void l.append('animate').attr('id','nodeloadingani').attr('attributeType','xml').attr('attributeName','r').attr('values','12; 3; 12').attr('begin','0').attr('dur','1.6s').attr('repeatCount','indefinite')}function stopNodeLoading(e){var l=d3.select('circle#'+e.id);l.select('animate#nodeloadingani').remove(),l.attr('r',e.appdata.r)}function getParentDn(e){var l=e.split('['),p=l[0].split(/(\/)(?=(?:[^\]]|\[[^\]]*\])*$)/);p.splice(-2,2);var c=p.join('');return c}function restoreWindowPos(){return d3.select('div#obj-prop-content').style('left',null).style('bottom',null).style('right','1px').style('top','1px'),void d3.select('div#app-msg-content').style('right','1px').style('bottom','1px').style('left',null).style('top',null)}function appAbout(){return bMessageWindowShown||(showMessageWindow(),d3.select('div#app-msg-content').style('right','1px').style('bottom','1px').style('left',null).style('top',null)),void appMsg.postMessage('APIC Managed Object Browser<br>     Version 1.0<br>     Written by <a href=\'mailto:simon.birtles@haystacknetworks.com\' target=\'_top\'>Simon Birtles @ Haystack Networks Ltd, UK </a><br>     Copyright (c) 2016-2017, Haystack Networks Ltd, UK <a href=\'https://www.haystacknetworks.com\' target=\'_blank\'>www.haystacknetworks.com</a><br>     All rights reserved.<br>     Dual licensed under the MIT and GPL licenses.<br>     <a href=\'https://haystacknetworks.com/cisco-apic-managed-object-browser\' target=\'_blank\'>Application Documentation</a>','info')}var treeDepthOffsets={};function getOffset(e){for(var l=0,p=0;p<e+1;p++)void 0!==treeDepthOffsets[p]&&(l+=treeDepthOffsets[p]);return l}function update(e){var l=treemap(root),p=l.descendants();p.forEach(function(f){f.y=280*f.depth+getOffset(f.depth)});var c=svg.selectAll('g.node').data(p,function(f){return f.id||(f.id='n'+nextNodeID++)}),u=c.enter().append('g');u.attr('class','node').attr('transform',function(){return'translate('+e.y0+','+e.x0+')'}),u.append('circle').attr('class','node').attr('r',1e-6).attr('id',function(f){return f.id}).attr('target',function(f){return f.target}).attr('depth',function(f){return f.depth}).attr('critical',function(f){return f.critical}).attr('major',function(f){return f.major}).attr('minor',function(f){return f.minor}).attr('warning',function(f){return f.warning}).attr('info',function(f){return f.info}).attr('class',function(f){return 0<f.critical?'node critical':0<f.major?'node major':0<f.minor?'node minor':0<f.warning?'node warning':0<f.info?'node info':'node normal'}).style('stroke',function(f){return f.data.hasOwnProperty('tDn')?'lightsteelblue':'steelblue'}).on('dblclick',dblclickNode).on('click',clickNode).on('mouseover',mouseoverNode).on('mouseout',mouseoutNode).on('contextmenu',d3.contextMenu(nodeContextmenu)).call(d3.drag().on('start',dragstarted).on('drag',dragging).on('end',dragended)),updateTextLabels(u);var m=u.merge(c);m.attr('transform',function(f){return'translate('+f.y+','+f.x+')'}),m.select('circle.node').attr('r',10).attr('cursor','pointer');var h=c.exit().attr('transform',function(){return'translate('+e.y+','+e.x+')'}).remove();return h.select('circle').attr('r',1e-6),h.select('text#textinfo').style('fill-opacity',1e-6),updateLinks(e,l),void p.forEach(function(f){f.x0=f.x,f.y0=f.y})}function updateTextLabels(e){var l=e.append('text').attr('id','textinfo').attr('text-anchor','start');l.append('tspan').attr('id','nodelabel').classed('text-nodelabel',!0).text(function(c){return c.label}).select(function(){return this.parentNode});e.append('text').attr('cursor','pointer').attr('class',function(){return d3.select(this.parentNode).select('circle').attr('class').split(' ')[1]+'text'}).attr('id','faultcount').attr('text-anchor','middle').style('font-size','8px').attr('pointer-events','none').attr('dx',1).attr('dy',1).text(function(c){var u=c.critical+c.major+c.minor+c.warning+c.info;return void 0===u||0===u?'':(c.critical+c.major+c.minor+c.warning+c.info).toString()})}function updateLinks(e,l){var p=l.descendants().slice(1),c=svg.selectAll('path.link').data(p,function(f){return f.id}),u=c.enter().insert('path','g').attr('class','link').attr('d',function(){var v={x:e.x0,y:e.y0};return diagonal(v,v)});u.style('stroke-dasharray',function(f){var v=getParentDn(f.data.dn?f.data.dn:''),w=getParentDn(f.parent.data.dn?f.parent.data.dn:'');if(v===f.parent.data.dn)return'0';if(w===f.data.dn)return'0';var N=f.data.hasOwnProperty('tDn')||f.parent.data.hasOwnProperty('tDn');return N?(f.data.hasOwnProperty('tDn')&&f.parent.data.hasOwnProperty('tDn')&&(console.log('both have tDn so we have a logic issue in getParentDn; hastDn = ',f.data.dn,f.parent.data.dn),appMsg.postMessage('>>>> ERROR updateLinks() objects passed logic both with tDn\'s <br/><b>'+f.data.dn+'<br/> '+f.parent.data.dn,'warning')),'5.5'):(console.log('neither had tDn so we have a parse issue in getParentDn; hastDn = ',N,f.data.dn,f.parent.data.dn),appMsg.postMessage('updateLinks() objects passed logic with no tDn\'s','warning'),'0')});var m=u.merge(c);m.attr('d',function(f){return diagonal(f,f.parent)});c.exit().attr('d',function(){var v={x:e.x,y:e.y};return diagonal(v,v)}).remove()}function resetNodeTextPos(){d3.selectAll('g.node').each(function(){d3.select(this).select('text#textinfo').attr('text-anchor','start'),d3.select(this).select('text#textinfo').attr('y',function(){return 5}),d3.select(this).select('text#textinfo').attr('x',function(l){return 13}),d3.select(this).select('text#textinfo').select('tspan#nodelabel').attr('dy','0').attr('dx',function(l){return l.children&&0!=l.children.length%2?0:0}),d3.select(this).select('text#textinfo').select('tspan#nodeclassname').attr('dy','-14').attr('x',function(){return d3.select(this.parentNode).attr('x')}),d3.select(this).select('text#faultcount').attr('dx',0).attr('dy',3)})}function diagonal(e,l){return path=`M ${e.y} ${e.x}
            C ${(e.y+l.y)/2} ${e.x},
              ${(e.y+l.y)/2} ${l.x},
              ${l.y} ${l.x}`,path}class AppMessages{constructor(){this.createDialogBase(),this.createDragActions(),this.setupMessageWindow()}createDialogBase(){d3.select('body').append('div').attr('id','app-msg-content').classed('app-msg-content',!0).append('div').attr('id','app-msg-header').classed('app-msg-header',!0).append('span').classed('close',!0).html('&times;').on('click',function(){d3.select('input#toggleProp').property('checked',!1),showMessageWindow()}).select(function(){return this.parentNode}).append('text').attr('id','app-msg-title').text('dialog title').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','app-msg-body').classed('app-msg-body',!0).append('text').text('Some text in the Modal Body').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','app-msg-footer').classed('app-msg-footer',!0).append('text').text('')}createDragActions(){var e=d3.select('div#app-msg-content'),l=d3.select('div#app-msg-header');l.call(d3.drag().on('end',function(){var p=d3.select('div#app-msg-header');p.attr('mx',0),p.attr('my',0)}).on('start',function(){var p=d3.select('div#app-msg-header');p.attr('mx',d3.mouse(this.parentNode.parentNode.parentNode)[0]),p.attr('my',d3.mouse(this.parentNode.parentNode.parentNode)[1]),p.attr('dx',e.node().getBoundingClientRect().left)}).on('drag',function(){var p=d3.mouse(this.parentNode.parentNode.parentNode)[0],c=d3.mouse(this.parentNode.parentNode.parentNode)[1];if(!(0>p)){var u=d3.select('div#app-msg-header'),m=u.attr('mx'),h=u.attr('my'),f=p-(m-u.attr('dx'));e.style('left',Math.max(0,f)+'px'),e.style('top',Math.max(0,c-5)+'px')}}))}setupMessageWindow(){d3.select('#app-msg-title').text('Application Messages'),d3.select('#app-msg-body').selectAll('*').remove();var e=d3.select('#app-msg-body'),l=e.append('div').classed('app-msg-container',!0),p=l.append('div').attr('id','app-msg-msg-container').classed('app-msg-msg-container',!0);d3.select('div#app-msg-msg-container').append('div').classed('app-msg-msg',!0).append('p').style('margin','0 auto').text('App Start up...'),d3.select('#app-msg-footer').selectAll('*').remove();var c=d3.select('#app-msg-footer');return c.append('div').classed('query-button',!0).on('click',function(){d3.select('div#app-msg-msg-container').selectAll('*').remove(),this.postMessage('Messages Cleared')}.bind(this)).append('text').text('Clear'),void c.append('div').classed('query-button-spacer',!0)}postMessage(e,l){console.log('true= ',parseInt(!0));var p='black';!0===l&&(p='red'),'error'===l&&(p='red'),'info'===l&&(p='blue'),'warning'===l&&(p='magenta'),'normal'===l&&(p='black'),d3.select('div#app-msg-msg-container').append('div').classed('app-msg-msg',!0).append('html').classed(l,!0).style('margin','0 auto').style('color',p).html(e);var c=document.getElementById('app-msg-msg-container');c.scrollTop=c.scrollHeight}}d3.contextMenu=function(e,l){return d3.selectAll('.d3-context-menu').data([1]).enter().append('div').attr('class','d3-context-menu'),d3.select('body').on('click.d3-context-menu',function(){d3.select('.d3-context-menu').style('display','none')}),function(p,c){var u=this;d3.selectAll('.d3-context-menu').html('');var m=d3.selectAll('.d3-context-menu').append('ul');m.selectAll('li').data(e).enter().append('li').html(function(h){return h.title}).on('click',function(h){h.action(u,p,c),d3.select('.d3-context-menu').style('display','none')}),l&&l(p,c),d3.select('.d3-context-menu').style('left',d3.event.pageX-2+'px').style('top',d3.event.pageY-2+'px').style('display','block'),d3.event.preventDefault()}};function clickNode(e){if(void 0!==e)return(showNodeProperties(e),void 0==selectedNode||e.id!==selectedNode.id)?(e.appdata.stroke_width=d3.select('circle#'+e.id).style('stroke-width'),e.appdata.stroke_dasharray=d3.select('circle#'+e.id).style('stroke-dasharray'),e.appdata.stroke=d3.select('circle#'+e.id).style('stroke'),e.appdata.r=d3.select('circle#'+e.id).attr('r'),e.appdata.fill=d3.select('circle#'+e.id).style('fill'),d3.select('circle#'+e.id).style('stroke-dasharray','3 2'),d3.select('circle#'+e.id).style('stroke','red'),void 0!=selectedNode&&(d3.select('circle#'+selectedNode.id).style('stroke-width',selectedNode.appdata.stroke_width),d3.select('circle#'+selectedNode.id).style('stroke-dasharray',selectedNode.appdata.stroke_dasharray),d3.select('circle#'+selectedNode.id).style('stroke',selectedNode.appdata.stroke)),void(selectedNode=e)):void 0}function dblclickNode(e){var l=e.data.dn,p=getParentDn(l);if(isObjectOnTreePath(e,l))return void appMsg.postMessage(e.data.dn+' already exists on path back to root, cannot show descendants.');var c=isObjectOnTreePath(e,p);return e.children?(e._children=e.children,e.children=null,update(e),resetNodeTextPos()):(getChildren(e),!1===c&&!0==bShowObjectParentDownstream&&getNodeByDn(e,p)),void showNodeProperties(e)}function mouseoverNode(e){if(bToolTips){var l=parseInt(e.critical)+parseInt(e.major)+parseInt(e.minor)+parseInt(e.warning)+parseInt(e.info);if(0!==l){var p=d3.select('svg#msvg'),c=d3.zoomTransform(p.node()),u=c.applyX(e.x),m=c.applyY(e.y),h=d3.select('circle#'+e.id),f=h.node().getBoundingClientRect(),m=f.left,u=f.top;div.html(null);var v=div.append('svg').attr('id','svgfaulttooltip').attr('width',100).attr('height',0),w=-10;return createFaultCountTip(v,5,w+=15,'node critical','tooltip-critical','Critical',e.critical),createFaultCountTip(v,5,w+=15,'node major','tooltip-major','Major',e.major),createFaultCountTip(v,5,w+=15,'node minor','tooltip-minor','Minor',e.minor),createFaultCountTip(v,5,w+=15,'node warning','tooltip-warning','Warning',e.warning),createFaultCountTip(v,5,w+=15,'node info','tooltip-info','Info',e.info),d3.select('svg#svgfaulttooltip').attr('height',w+=15),void div.transition().duration(10).style('opacity',.9).style('left',function(){return 0>m-20?'1px':m-20+'px'}).style('top',u+20+'px')}}}function mouseoutNode(){div.transition().duration(500).style('opacity',0)}function dragstarted(e){if(e!==root){var l=d3.select('circle#'+e.id).select(function(){return this.parentNode}),p=l.attr('transform'),c=p.substring(p.indexOf('(')+1,p.indexOf(')')).split(','),u=c[0],m=d3.select('svg#msvg').select('g#svg-g');m.append('line').attr('id','depthmove').attr('stroke-width',1).attr('stroke','rgb(128,128,128)').attr('stroke-dasharray','5,5').attr('x1',u).attr('y1',-1e4).attr('x2',u).attr('y2',1e4).style('display','none').attr('mx',d3.mouse(this)[0]).attr('my',d3.mouse(this)[1])}}function dragging(e){if(e!==root){var l=d3.select('svg#msvg').select('g#svg-g').selectAll('line#depthmove');if(!(1>Math.abs(l.attr('mx')-d3.mouse(this)[0]))){var p=d3.select(this).select(function(){return this.parentNode}),c=p.attr('transform'),u=c.substring(c.indexOf('(')+1,c.indexOf(')')).split(','),m=parseInt(u[0]),h=parseInt(d3.mouse(this)[0]),f=m+h;d3.select('svg#msvg').select('g#svg-g').select('line#depthmove').style('display','inline').attr('x1',f).attr('x2',f)}}}function dragended(e){if(e!==root){var l=d3.select('svg#msvg').select('g#svg-g').selectAll('line#depthmove');if(1>Math.abs(l.attr('mx')-d3.mouse(this)[0]))return void d3.select('svg#msvg').select('g#svg-g').selectAll('line#depthmove').remove();var p=parseInt(d3.mouse(this)[0]),c=e.depth;return void 0===treeDepthOffsets[e.depth]?treeDepthOffsets[parseInt(e.depth)]=p:treeDepthOffsets[parseInt(e.depth)]+=p,update(root),void d3.select('svg#msvg').select('g#svg-g').selectAll('line#depthmove').remove()}}class ObjectProperties{constructor(){this.grabMargin=10,this.bDragging=!1,this.bMousedown=!1,this.createDialogBase(),this.setupObjPropWinDrag(),d3.select('#obj-prop-title').text('Properties'),d3.select('#obj-prop-body').selectAll('*').remove();var e=d3.select('#obj-prop-body'),l=e.append('div').style('overflow','none').style('display','block');d3.select('#obj-prop-content').style('height',0.6*window.innerHeight+'px')}createDialogBase(){d3.select('body').append('div').attr('id','obj-prop-content').classed('obj-prop-content',!0).append('div').attr('id','obj-prop-header').classed('obj-prop-header',!0).append('span').classed('close',!0).html('&times;').on('click',function(){d3.select('input#toggleProp').property('checked',!1),showProperties()}).select(function(){return this.parentNode}).append('text').attr('id','obj-prop-title').text('dialog title').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','obj-prop-body').classed('obj-prop-body',!0).append('text').text('Some text in the Modal Body').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','obj-prop-footer').call(d3.drag().on('start',this.dragstarted.bind(this)).on('drag',this.dragging.bind(this)).on('end',this.dragended.bind(this))).on('mousemove',this.mousemove.bind(this)).classed('obj-prop-footer',!0).append('text').text('')}setupObjPropWinDrag(){var e=d3.select('div#obj-prop-content'),l=d3.select('div#obj-prop-header');l.call(d3.drag().on('end',function(){var p=d3.select('div#obj-prop-header');p.attr('mx',0),p.attr('my',0)}).on('start',function(){var p=d3.select('div#obj-prop-header');p.attr('mx',d3.mouse(this.parentNode.parentNode.parentNode)[0]),p.attr('my',d3.mouse(this.parentNode.parentNode.parentNode)[1]),p.attr('dx',e.node().getBoundingClientRect().left)}).on('drag',function(){var p=d3.mouse(this.parentNode.parentNode.parentNode)[0],c=d3.mouse(this.parentNode.parentNode.parentNode)[1];if(!(0>p)){var u=d3.select('div#obj-prop-header'),m=u.attr('mx'),h=u.attr('my'),f=p-(m-u.attr('dx'));e.style('left',Math.max(0,f)+'px'),e.style('top',Math.max(0,c-5)+'px')}}))}updateNodeProperties(e){d3.select('#obj-prop-title').text(e.label.split('(')[1].split(')')[0]+' ['+e.absclassname+']'),d3.select('#obj-prop-body').selectAll('*').remove();var l=d3.select('#obj-prop-body'),p=l.append('div').style('overflow','none').style('display','block'),c=p.append('table').style('table-layout','fixed').append('tbody'),u=c.append('tr');for(var m in u.append('td').classed('obj-prop-attribute',!0).append('text').text('MIM link:'),u.append('td').classed('obj-prop-value',!0).append('a').attr('href','https://pubhub-prod.s3-us-west-2.amazonaws.com/media/apic-mim-ref/docs/MO-'+e.absclassname+'.html').attr('title','ctrl-click').attr('target','_blank').html(e.absclassname),e.data)if(e.data.hasOwnProperty(m)){var u=c.append('tr');u.append('td').classed('obj-prop-attribute',!0).append('text').text(m+':'),u.append('td').classed('obj-prop-value',!0).append('text').text(e.data[m])}}showWindow(){var l=d3.select('div#obj-prop-content');l.transition().duration(500).style('opacity',bNodePropShown?1:0).style('visibility',bNodePropShown?'visible':'hidden')}mousemove(){var e=d3.select('div#obj-prop-footer').node(),l=parseInt(d3.select('div#obj-prop-footer').style('width')),p=parseInt(d3.select('div#obj-prop-footer').style('height'));d3.mouse(e)[1]>p-this.grabMargin&&d3.mouse(e)[1]<p+this.grabMargin?d3.select('div#obj-prop-footer').style('cursor','ns-resize'):d3.select('div#obj-prop-footer').style('cursor','default')}dragstarted(){}dragended(){}dragging(){var e=d3.select('div#obj-prop-content').node(),l=d3.select('body').node();console.log('ondrag x,y= ',d3.mouse(l)[0]);var p=d3.select('div#obj-prop-content').node(),c=p.getBoundingClientRect(),u=c.y,m=c.x;height=Math.max(d3.mouse(l)[1]-u,100),width=Math.max(d3.mouse(l)[0]-m,300),d3.select('div#obj-prop-content').style('height',2+height+'px')}}var queryFilterEdit=d3.select('body').append('div').attr('id','queryModal').classed('modal',!0).append('div').attr('id','modal-content').classed('modal-content',!0).append('div').attr('id','dialog-header').classed('modal-header',!0).append('span').classed('close',!0).html('&times;').on('click',function(){d3.select('div#queryModal').style('display','none')}).select(function(){return this.parentNode}).append('text').attr('id','dialog-title').text('dialog title').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','dialog-body').classed('modal-body',!0).append('text').text('Some text in the Modal Body').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','dialog-footer').classed('modal-footer',!0).append('text').text('');setupDialogDrag();function setupDialogDrag(){var e=d3.select('div#modal-content'),l=d3.select('div#dialog-header');l.call(d3.drag().on('end',function(){var p=d3.select('div#dialog-header');p.attr('mx',0),p.attr('my',0)}).on('start',function(){var p=d3.select('div#dialog-header');p.attr('mx',d3.mouse(this.parentNode.parentNode.parentNode)[0]),p.attr('my',d3.mouse(this.parentNode.parentNode.parentNode)[1]),p.attr('dx',e.node().getBoundingClientRect().left)}).on('drag',function(){if(g_x=d3.mouse(this.parentNode.parentNode.parentNode)[0],g_y=d3.mouse(this.parentNode.parentNode.parentNode)[1],!(0>g_x)){var p=d3.select('div#dialog-header');mx=p.attr('mx'),my=p.attr('my');var c=g_x-(mx-p.attr('dx'));e.style('left',Math.max(0,c)+'px'),e.style('top',Math.max(0,g_y-5)+'px')}}))}function editQueryFilter(e){d3.select('#dialog-title').text('Edit Object Query String'),d3.select('#dialog-body').selectAll('*').remove();var l=d3.select('#dialog-body'),p=l.append('div'),c=p.append('table').append('tbody').append('tr');c.append('td').classed('attribute',!0).append('text').text('Node DN:'),c.append('td').classed('value',!0).append('text').text(e.dn);var c=p.append('table').append('tbody').append('tr');c.append('td').classed('attribute',!0).append('text').text('Query String:'),c.append('td').classed('value',!0).append('textarea').attr('id','query-text').text(function(){return e.hasOwnProperty('defaultQueryFilter')?e.defaultQueryFilter:''}),d3.select('#dialog-footer').selectAll('*').remove();var u=d3.select('#dialog-footer');u.append('div').classed('query-button',!0).on('click',function(){e.hasOwnProperty('defaultQueryFilter')&&(e.appdata.lastQueryFilter=e.defaultQueryFilter),e.defaultQueryFilter=d3.select('textarea#query-text').property('value'),e.appdata.activeQueryFilter=d3.select('textarea#query-text').property('value'),d3.select('div#queryModal').style('display','none'),getChildren(e)}).append('text').text('Submit'),u.append('div').classed('query-button-spacer',!0),u.append('div').classed('query-button',!0).on('click',function(){d3.select('div#queryModal').style('display','none')}).append('text').text('Cancel'),u.append('div').classed('query-button-spacer',!0),u.append('div').classed('query-button',!0).on('click',function(){e.appdata.hasOwnProperty('defaultQueryFilter')&&(document.getElementById('query-text').value=e.appdata.defaultQueryFilter)}).append('text').text('Reset'),d3.select('div#queryModal').style('display','block');var m=d3.select('div#modal-content');return m.style('left',function(){return window.innerWidth/2-m.node().getBoundingClientRect().width/2+'px'}),void m.style('top',function(){return window.innerHeight/2-m.node().getBoundingClientRect().height/2+'px'})}class ChangeRoot{constructor(){this.createDialogBase(),this.createDragActions()}createDialogBase(){this.jsonAbsClasses=[],this.objectPropWin=d3.select('body').append('div').attr('id','root-node-modal-window').classed('modal',!0).append('div').attr('id','root-node-content').classed('root-node-content',!0).append('div').attr('id','root-node-header').classed('root-node-header',!0).append('span').classed('close',!0).html('&times;').on('click',function(){d3.select('div#root-node-modal-window').style('display','none')}).select(function(){return this.parentNode}).append('text').attr('id','root-node-title').text('dialog title').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','root-node-body').classed('root-node-body',!0).append('text').text('Some text in the Modal Body').select(function(){return this.parentNode}).select(function(){return this.parentNode}).append('div').attr('id','root-node-footer').classed('root-node-footer',!0).append('text').text('')}createDragActions(){var e=d3.select('div#root-node-content'),l=d3.select('div#root-node-header');l.call(d3.drag().on('end',function(){var p=d3.select('div#root-node-header');p.attr('mx',0),p.attr('my',0)}).on('start',function(){var p=d3.select('div#root-node-header');p.attr('mx',d3.mouse(this.parentNode.parentNode)[0]),p.attr('my',d3.mouse(this.parentNode.parentNode)[1]),p.attr('dx',e.node().getBoundingClientRect().left)}).on('drag',function(){var p=d3.mouse(this.parentNode.parentNode)[0],c=d3.mouse(this.parentNode.parentNode)[1];if(!(0>p)){var u=d3.select('div#root-node-header'),m=u.attr('mx'),h=u.attr('my'),f=p-(m-u.attr('dx'));e.style('left',Math.max(0,f)+'px'),e.style('top',Math.max(0,c-5)+'px')}}))}showRootNodeSelection(){this.createLoadingLayout();sendToAPIC('GET','/api/mo/.json?query-target=children',function(c){4===c.readyState&&200===c.status&&(respJson=JSON.parse(c.responseText),chgRootWin.createManagedObjectsLayout(respJson))}),d3.select('div#root-node-modal-window').style('display','block');var p=d3.select('div#root-node-content');p.style('left',function(){return window.innerWidth/2-p.node().getBoundingClientRect().width/2+'px'}),p.style('top',function(){return window.innerHeight/2-p.node().getBoundingClientRect().height/2+'px'})}createLoadingLayout(){d3.select('#root-node-title').text('Change Root MO'),d3.select('#root-node-body').selectAll('*').remove();var e=d3.select('#root-node-body'),l=e.append('div').attr('id','main-loader-container').style('height','250px').style('justify-content','center').style('align-items','center').style('display','flex'),p=l.append('div').classed('loader-container',!0);p.append('div').classed('loader-loader-container',!0).append('div').classed('loader',!0),p.append('div').classed('loader-text-container',!0).append('text').style('padding','10px').text('Loading Managed Objects...'),d3.select('#root-node-footer').selectAll('*').remove();var c=d3.select('#root-node-footer');return c.append('div').classed('query-button',!0).on('click',function(){var u=d3.select('select#root-con-sel').node().value;if(0===u.length)return void alert('todo-must select from both selections');sendToAPIC('GET','/api/mo/'+u+'.json',function(f){if(4===f.readyState&&200===f.status){for(firstKey in collapse(root),update(root),respJson=JSON.parse(f.responseText),respJson.imdata[0]);console.log('abstract class name= ',firstKey);var v=respJson.imdata[0][firstKey].attributes;root=d3.hierarchy(v),root.appdata=[],root.x0=root.y0=0,root.id='n'+nextNodeID++,root.parent=null,root.children=null,root._children=null,root.label='('+root.data.dn+')',root.depth=0,root.absclassname=firstKey,root.dn=v.dn,root.defaultQueryFilter='query-target=children',root.appdata.defaultQueryFilter=root.defaultQueryFilter,root.appdata.lastQueryFilter=root.defaultQueryFilter,root.critical=0,root.major=0,root.minor=0,root.warning=0,root.info=0,update(root),resetNodeTextPos(),updateScale(),showNodeProperties(root),d3.select('div#root-node-modal-window').style('display','none')}})}).append('text').text('Submit'),c.append('div').classed('query-button-spacer',!0),void c.append('div').classed('query-button',!0).on('click',function(){d3.select('div#root-node-modal-window').style('display','none')}).append('text').text('Cancel')}createManagedObjectsLayout(e){this.jsonAbsClasses=[],0===e.totalCount&&alert('>>>>>************>>>>>>>no top level root children ????');for(var l=0;l<e.imdata.length;l++){for(firstKey in e.imdata[l]);for(var p in this.bClassExists=!1,this.jsonAbsClasses)if(this.jsonAbsClasses[p].classname===firstKey){this.jsonAbsClasses[p].dn.push(e.imdata[l][firstKey].attributes.dn),this.bClassExists=!0;break}this.bClassExists||this.jsonAbsClasses.push({classname:firstKey,dn:[e.imdata[l][firstKey].attributes.dn]})}this.jsonAbsClasses.sort(function(m,h){return m.classname==h.classname?0:m.classname>h.classname?1:-1});var c=d3.select('#root-node-body'),u=c.append('div').attr('id','#root-node-sel-container').style('display','none').style('height','250px');return u.append('div').attr('id','root-curr-sel').style('width','75%').style('height','40px').style('margin','25px 50px 0px 50px').text(function(){return'Active Root: '+root.dn}),u.append('div').attr('id','root-abs-sel-cont').append('select').attr('id','root-abs-sel').classed('rootselect',!0).on('change',this.absClassSelChange.bind(this)).selectAll('option').data(this.jsonAbsClasses).enter().append('option').text(function(m){return m.classname}),u.append('div').attr('id','root-con-sel').append('select').attr('id','root-con-sel').classed('rootselect',!0),u.style('display','block'),void d3.select('div#main-loader-container').style('display','none')}absClassSelChange(){for(var e=[],l=d3.select('select#root-abs-sel').node().value,p=0;p<this.jsonAbsClasses.length;p++)if(this.jsonAbsClasses[p].classname===l){for(var c in this.jsonAbsClasses[p].dn)e.push(this.jsonAbsClasses[p].dn[c]);break}e.sort(function(u,m){return u==m?0:u>m?1:-1}),d3.select('select#root-con-sel').selectAll('*').remove(),d3.select('div#root-con-sel').select('select#root-con-sel').selectAll('option').data(e).enter().append('option').text(function(u){return u})}}