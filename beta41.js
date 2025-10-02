(function () {
    // Prevent multiple instances of the modal
    if (document.getElementById('__bm_modal')) {
        return;
    }

    // --- Styles ---

    var styleElement = document.createElement('style');
    styleElement.textContent = `
        #__bm_modal {
            position: fixed;
            z-index: 2147483647;
            background: #1e1e2e;
            border: 1px solid #cdd6f4;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            padding: 10px;
            color: #cdd6f4;
            font-family: 'Segoe UI', Roboto, sans-serif
        }
        /* FIX: Use rotateX to keep the text readable */
        #__bm_modal.rotated-comp {
            transform: rotateX(180deg) !important;
            left: unset !important;
            right: 30px;
            top: 30px
        }
        #__bm_copy_toast {
            position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#89b4fa;color:#1e1e2e;padding:8px 16px;border-radius:4px;font-family:'Segoe UI',Roboto,sans-serif;font-weight:600;z-index:2147483647;opacity:0;transition:opacity .3s
        }
        #__bm_modal select, #__bm_modal button {
            margin: 4px 0;
            padding: 6px;
            border-radius: 4px;
            border: none;
            font-size: 12px;
            cursor: pointer
        }
        #__bm_modal select {
            background: #313244;
            color: #cdd6f4;
            width: 100%
        }
        #__bm_modal button {
            background: #89b4fa;
            color: #1e1e2e;
            font-weight: bold;
            transition: background-color 0.2s
        }
        #__bm_modal button:hover {
            background: #a6e3a1
        }
        #__bm_modal h4 {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 600;
            padding-right: 20px
        }
        #__bm_modal_header {
            user-select: none;
            cursor: move
        }
        #__bm_modal_close {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            font-weight: bold;
            font-size: 18px;
            color: #f38ba8;
            line-height: 1
        }
        #__bm_scroll_buttons {
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 2147483646
        }
        #__bm_scroll_buttons button {
            display: block;
            width: 40px;
            height: 40px;
            margin-top: 10px;
            background: #313244;
            color: #cdd6f4;
            border: 1px solid #cdd6f4;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            transition: background .2s
        }
        #__bm_scroll_buttons button:hover {
            background: #89b4fa
        }
        #__bm_page_info_card {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2147483647;
            background: #1e1e2e;
            color: #cdd6f4;
            border: 1px solid #cdd6f4;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.6);
            font-family: 'Segoe UI', Roboto, sans-serif;
            width: 400px
        }
        #__bm_page_info_card h4 {
            margin: 0 0 12px;
            font-size: 18px;
            color: #89b4fa
        }
        #__bm_page_info_card .bm-info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 4px;
            border-radius: 4px;
            margin-bottom: 4px
        }
        #__bm_page_info_card .bm-info-row span:first-child {
            font-weight: bold;
            color: #a6adc8;
            margin-right: 10px
        }
        #__bm_page_info_card .bm-info-row span:last-child {
            flex-grow: 1;
            text-align: right;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: pointer;
            transition: color .2s
        }
        #__bm_page_info_card .bm-info-row span:last-child:hover {
            color: #89b4fa
        }
        #__bm_page_info_card #__bm_info_close {
            position: absolute;
            top: 16px;
            right: 16px;
            cursor: pointer;
            font-size: 20px;
            color: #f38ba8
        }
        .rotated-comp #__bm_modal_close {
            /* Flip the close button back so it's readable */
            transform: rotateX(180deg);
        }
        .rotated-comp h4 {
            /* Flip the title back so it's readable */
            transform: rotateX(180deg);
        }
        .rotated-comp select, .rotated-comp button {
            /* Flip the select and button back so they are readable */
            transform: rotateX(180deg);
        }
        .rotated-comp #__bm_modal_header {
            /* The header still needs to rotate so drag works right */
        }
        .rotated-comp #__bm_modal_header > * {
            /* Fix rotation on children */
        }
        /* FIX: Define an active class for persistent hover */
        .bm-hover-persist-active { 
            outline: 2px solid #89b4fa !important;
        }
        /* Add a rule to force a hover-like state */
        .bm-hover-persist-active:hover {
            /* This ensures it retains the hover style even if cursor moves away */
            outline: 2px solid #89b4fa !important;
        }
        /* Optional: Apply an 'is-hovering' style to simulate actual hover for custom effects */
        .bm-hover-persist-active:is-hovering {
             /* Use this in your site's CSS to target the element */
        }
        
        .rotated-comp {
            /* Add some rotation to the content to flip it */
        }
        
        .rotated-comp #__bm_modal_header > * {
            
        }

        .rotated-comp #__bm_modal_header {
            
        }

        /* Original styles for Outline */
        .__bm-outlined, .__bm-outlined * {
            outline: 1px solid #f38ba8 !important
        }
    `;
    document.head.appendChild(styleElement);

    // --- Modal Creation ---
    var modal = document.createElement('div');
    modal.id = "__bm_modal";
    modal.innerHTML = '<div id="__bm_modal_header"><h4>Bookmarklets</h4><span id="__bm_modal_close">✖</span></div><select id="__bm_select"></select><br/><button id="__bm_run">Run Bookmarklet</button>';
    document.body.appendChild(modal);

    // --- Positioning ---
    var savedPos = localStorage.getItem('__bm_modal_pos');
    if (savedPos) {
        try {
            var pos = JSON.parse(savedPos);
            modal.style.left = pos.left;
            modal.style.top = pos.top;
        } catch (e) {
            console.error("BM: Could not parse saved position.");
        }
    } else {
        modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + "px";
        modal.style.top = "30px";
    }

    // --- Bookmarklet Data ---
    var bookmarkletData = [
        { g: "Diagnostics & Debugging", n: "Reload CSS", c: "document.querySelectorAll('link[rel~=stylesheet]').forEach(l=>{l.href=l.href.split('?')[0]+'?reload='+Date.now();});" }, {
            g: 'Diagnostics & Debugging',
            n: 'Hot Reload',
            c: "(function(){var id='__bm_hot_reload';if(window[id]&&window[id].interval){clearInterval(window[id].interval);window[id]=null;var t=document.getElementById('__bm_copy_toast');if(t){t.textContent='Hot Reload Disabled';t.style.opacity=1;setTimeout(()=>t.style.opacity=0,1800);}return;}window[id]={};window[id].interval=setInterval(()=>{document.querySelectorAll('link[rel~=stylesheet]').forEach(l=>{l.href=l.href.split('?')[0]+'?reload='+Date.now()});},3000);var t=document.getElementById('__bm_copy_toast');if(!t){t=document.createElement('div');t.id='__bm_copy_toast';document.body.appendChild(t);}t.textContent='Hot Reload Enabled (3s)';t.style.opacity=1;setTimeout(()=>t.style.opacity=0,1800);})();"
        },
        { g: "Diagnostics & Debugging", n: "Console Overlay (REPL)", c: "(function(){var overlay_id='__bm_console_overlay';if(document.getElementById(overlay_id)){document.getElementById(overlay_id).remove();document.getElementById('__bm_console_style')?.remove();return;}const style=document.createElement('style');style.id='__bm_console_style';style.textContent=`#${overlay_id}{position:fixed;bottom:20px;right:20px;width:550px;max-height:450px;background:rgba(30,30,30,0.95);color:#fff;font-family:monospace;font-size:13px;border:1px solid #888;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.5);z-index:2147483647;display:flex;flex-direction:column;resize:both;overflow:hidden;}#${overlay_id}_header{cursor:move;background:#111;padding:6px;user-select:none;display:flex;justify-content:space-between;align-items:center;}#${overlay_id}_header button{margin-left:4px;background:#222;border:1px solid #555;color:#fff;font-size:11px;padding:2px 6px;cursor:pointer;border-radius:3px;}#${overlay_id}_log{flex:1;padding:6px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;background:#1a1a1a;}.__bm_console_output_string{color:#a6e22e;}.__bm_console_output_number{color:#66d9ef;}.__bm_console_output_boolean{color:#f92672;}.__bm_console_output_null{color:#fd971f;}.__bm_console_output_undefined{color:#f8f8f2;font-style:italic;}.__bm_console_output_function{color:#fd971f;}.__bm_console_output_error{color:#f92672;font-weight:bold;}.__bm_console_expandable{cursor:pointer;}.__bm_console_collapsed::before{content:\"[+] \";color:#888;}.__bm_console_expanded::before{content:\"[-] \";color:#888;}.__bm_console_child{margin-left:16px;}.__bm_console_copy_btn{display:inline-block;margin-left:8px;background:#333;color:#fff;font-size:10px;padding:1px 4px;cursor:pointer;border-radius:3px;}#${overlay_id}_input{border:none;outline:none;padding:6px;width:calc(100% - 12px);background:#222;color:#fff;font-family:monospace;resize:none;min-height:40px;box-sizing:border-box;}#${overlay_id}_input.error{border:1px solid #f92672;}`;document.head.appendChild(style);const overlay=document.createElement('div');overlay.id=overlay_id;overlay.innerHTML=`<div id=\"${overlay_id}_header\">Console Overlay<div><button id=\"${overlay_id}_clear\">Clear</button><button id=\"${overlay_id}_autoscroll\">AutoScroll: ON</button><button id=\"${overlay_id}_close\">Close</button></div></div><div id=\"${overlay_id}_log\"></div><textarea id=\"${overlay_id}_input\" placeholder=\"Type JS here (Shift+Enter for new line)\"></textarea>`;document.body.appendChild(overlay);const log=overlay.querySelector(`#${overlay_id}_log`);const input=overlay.querySelector(`#${overlay_id}_input`);const header=overlay.querySelector(`#${overlay_id}_header`);const btnClear=overlay.querySelector(`#${overlay_id}_clear`);const btnAutoScroll=overlay.querySelector(`#${overlay_id}_autoscroll`);const btnClose=overlay.querySelector(`#${overlay_id}_close`);let isDragging=false,startX,startY,startLeft,startTop;header.addEventListener('mousedown',e=>{if(e.target.tagName==='BUTTON')return;isDragging=true;startX=e.clientX;startY=e.clientY;startLeft=overlay.offsetLeft;startTop=overlay.offsetTop;e.preventDefault();});window.addEventListener('mousemove',e=>{if(isDragging){overlay.style.left=startLeft+(e.clientX-startX)+'px';overlay.style.top=startTop+(e.clientY-startY)+'px';}});window.addEventListener('mouseup',()=>isDragging=false);const history=[];let historyIndex=-1;let autoScroll=true;btnClear.addEventListener('click',()=>log.innerHTML='');btnAutoScroll.addEventListener('click',()=>{autoScroll=!autoScroll;btnAutoScroll.textContent=`AutoScroll: ${autoScroll?'ON':'OFF'}`;});btnClose.addEventListener('click',()=>(overlay.remove(),document.getElementById('__bm_console_style')?.remove()));function checkSyntax(code){try{new Function(code);input.classList.remove('error');}catch(e){input.classList.add('error');}}input.addEventListener('input',()=>checkSyntax(input.value));function createExpandable(value){if(value===null)return `<span class=\"__bm_console_output_null\">null</span>`;if(value===undefined)return `<span class=\"__bm_console_output_undefined\">undefined</span>`;if(typeof value==='string')return `<span class=\"__bm_console_output_string\">'${value}'</span>`;if(typeof value==='number')return `<span class=\"__bm_console_output_number\">${value}</span>`;if(typeof value==='boolean')return `<span class=\"__bm_console_output_boolean\">${value}</span>`;if(value instanceof Error)return `<span class=\"__bm_console_output_error\">${value}</span>`;if(typeof value==='function')return `<span class=\"__bm_console_output_function\">ƒ ${value.name||'anonymous'}()</span>`;if(typeof value==='object'){const isArray=Array.isArray(value);const keys=Object.keys(value);const children=keys.map(k=>`<div class=\"__bm_console_child\"><strong>${k}:</strong> ${createExpandable(value[k])}</div>`).join('');return `<div class=\"__bm_console_expandable __bm_console_collapsed\">${isArray?'Array':'Object'} (${keys.length})</div><div class=\"__bm_console_child\" style=\"display:none\">${children}</div>`;}return String(value);}function addLog(value){const wrapper=document.createElement('div');wrapper.innerHTML=`> ${value.replace(/</g,'&lt;')}\\n${createExpandable(evalSafe(value))} <span class=\"__bm_console_copy_btn\">Copy</span>`;log.appendChild(wrapper);attachEvents(wrapper);if(autoScroll)log.scrollTop=log.scrollHeight;}function evalSafe(code){try{return eval(code);}catch(e){return e;}}function attachEvents(wrapper){const expandableHeaders=wrapper.querySelectorAll('.__bm_console_expandable');expandableHeaders.forEach(header=>{header.addEventListener('click',()=>{const child=header.nextElementSibling;if(!child)return;const expanded=child.style.display!=='none';child.style.display=expanded?'none':'block';header.classList.toggle('__bm_console_collapsed',expanded);header.classList.toggle('__bm_console_expanded',!expanded);});});const copyBtns=wrapper.querySelectorAll('.__bm_console_copy_btn');copyBtns.forEach(btn=>btn.addEventListener('click',()=>{navigator.clipboard.writeText(wrapper.innerText.replace(/>/,'').trim()).then(()=>{btn.textContent='Copied!';setTimeout(()=>btn.textContent='Copy',1000);});}));}input.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const start=input.selectionStart;const end=input.selectionEnd;input.value=input.value.substring(0,start)+'\\t'+input.value.substring(end);input.selectionStart=input.selectionEnd=start+1;}else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const value=input.value;if(!value.trim())return;history.push(value);historyIndex=history.length;addLog(value);input.value='';}else if(e.key==='ArrowUp'){if(historyIndex>0){historyIndex--;input.value=history[historyIndex];}e.preventDefault();}else if(e.key==='ArrowDown'){if(historyIndex<history.length-1){historyIndex++;input.value=history[historyIndex];}else{historyIndex=history.length;input.value='';}e.preventDefault();}});})();" },
        { g: "Diagnostics & Debugging", n: "Image Info Overlay", c: "(function(){if(window.__imgOverlayActive){document.querySelectorAll('.__img_overlay').forEach(el=>el.remove());document.getElementById('__img_overlay_panel')?.remove();window.__imgOverlayActive=false;return;}window.__imgOverlayActive=true;function getFileType(url){const match=url.split('?')[0].match(/\\.(\\w+)$/i);return match?match[1].toLowerCase():\"unknown\";}async function fetchFileSize(url){try{const res=await fetch(url,{method:\"HEAD\"});const size=res.headers.get(\"content-length\");if(size){const kb=(parseInt(size,10)/1024).toFixed(1);return `${kb} KB`;}}catch(e){return \"size ?\";}return \"size ?\";}document.querySelectorAll(\"img\").forEach(async img=>{const rect=img.getBoundingClientRect();const width=rect.width||img.naturalWidth||img.offsetWidth||100;const height=rect.height||img.naturalHeight||img.offsetHeight||50;const src=img.src||\"(no src)\";const type=getFileType(src);const overlay=document.createElement(\"div\");overlay.className=\"__img_overlay\";Object.assign(overlay.style,{position:\"absolute\",left:img.offsetLeft+\"px\",top:img.offsetTop+\"px\",width:img.offsetWidth+\"px\",height:img.offsetHeight+\"px\",background:\"rgba(255,255,255,0.85)\",border:(img.complete&&img.naturalWidth>0)?\"1px dashed #333\":\"2px solid red\",color:\"#000\",fontSize:\"11px\",fontFamily:\"monospace\",display:\"flex\",flexDirection:\"column\",alignItems:\"center\",justifyContent:\"center\",textAlign:\"center\",padding:\"2px\",zIndex:\"999999\",pointerEvents:\"auto\"});const info=document.createElement(\"div\");info.textContent=`${Math.round(width)}x${Math.round(height)} | .${type}`;overlay.appendChild(info);const path=document.createElement(\"div\");path.textContent=src;Object.assign(path.style,{fontSize:\"9px\",wordBreak:\"break-all\",maxWidth:\"100%\",overflow:\"hidden\",textOverflow:\"ellipsis\",whiteSpace:\"nowrap\"});overlay.appendChild(path);const copyBtn=document.createElement(\"button\");copyBtn.textContent=\"📋\";Object.assign(copyBtn.style,{position:\"absolute\",top:\"2px\",right:\"2px\",fontSize:\"10px\",border:\"none\",background:\"#000\",color:\"#fff\",cursor:\"pointer\",padding:\"0 4px\",borderRadius:\"3px\"});copyBtn.addEventListener(\"click\",e=>{e.stopPropagation();navigator.clipboard.writeText(`${width}x${height} | ${type} | ${src}`);copyBtn.textContent=\"✅\";setTimeout(()=>copyBtn.textContent=\"📋\",1000);});overlay.appendChild(copyBtn);img.parentElement.style.position=\"relative\";img.parentElement.appendChild(overlay);const size=await fetchFileSize(src);if(size){const sizeDiv=document.createElement(\"div\");sizeDiv.textContent=size;overlay.insertBefore(sizeDiv,path);}});const panel=document.createElement(\"div\");panel.id=\"__img_overlay_panel\";Object.assign(panel.style,{position:\"fixed\",bottom:\"10px\",right:\"10px\",zIndex:\"1000000\",background:\"#333\",color:\"#fff\",padding:\"6px 12px\",borderRadius:\"6px\",fontSize:\"12px\",fontFamily:\"Arial, sans-serif\",cursor:\"pointer\"});panel.textContent=\"Hide Image Info\";document.body.appendChild(panel);panel.addEventListener(\"click\",()=>{document.querySelectorAll('.__img_overlay').forEach(el=>el.remove());panel.remove();window.__imgOverlayActive=false;console.log(\"Image overlays removed.\");});})();" },
        { g: "Diagnostics & Debugging", n: "Highlight Repaints", c: "(function(){var observer_key='__highlightRepaintsObserver';var active_key='__highlightRepaintsActive';var backup_key='__highlightRepaintsTransitionBackup';if(window[active_key]){console.log('Highlight Repaints active. Turning off.');document.body.style.transition=window[backup_key]||'';window[active_key]=false;if(window[observer_key])window[observer_key].disconnect();return;}window[active_key]=true;window[backup_key]=document.body.style.transition;document.body.style.transition='none';const observer=new MutationObserver(mutations=>{mutations.forEach(mutation=>{if(mutation.type==='attributes'||mutation.type==='childList'||mutation.type==='characterData'){const target=mutation.target||mutation;highlight(target);}});});function highlight(el){if(!el||!el.style)return;const originalOutline=el.style.outline;el.style.outline='2px solid rgba(255,0,0,0.7)';setTimeout(()=>{el.style.outline=originalOutline;},100);}observer.observe(document.body,{attributes:true,childList:true,subtree:true,characterData:true});window[observer_key]=observer;console.log('Highlight Repaints enabled. Click again to turn off.');})();" },
        { g: "Utility & Lookup", n: "Hard Reload (Cache Buster)", c: "(function(){const url=new URL(window.location.href);url.searchParams.set('_',Date.now());window.location.replace(url.toString());})();" },
        { g: "Diagnostics & Debugging", n: "Outline Elements", c: "document.body.classList.toggle('__bm-outlined')" },
        { g: "Diagnostics & Debugging", n: "Toggle Grid", c: "var id='__bm_grid';var el=document.getElementById(id);if(el){el.remove();return;}el=document.createElement('div');el.id=id;el.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;background-image:linear-gradient(transparent 23px,rgba(205,214,244,0.4) 24px),linear-gradient(90deg,transparent 23px,rgba(205,214,244,0.4) 24px);background-size:24px 24px;z-index:2147483646';document.body.appendChild(el);" },
        { g: "Diagnostics & Debugging", n: "Cookies Viewer", c: "alert(document.cookie||'No cookies found.');" },
        { g: "Diagnostics & Debugging", n: "Performance Stats", c: `setTimeout(()=>{var p=performance.getEntriesByType('navigation')[0];var fcp=performance.getEntriesByName('first-contentful-paint')[0];var lcp=performance.getEntriesByType('largest-contentful-paint')[0];if(!p){alert('Performance Navigation Timing API not supported.');return;}var info=['Performance Stats (ms):','DNS: '+(p.domainLookupEnd-p.domainLookupStart).toFixed(2),'TCP Connect: '+(p.connectEnd-p.connectStart).toFixed(2),'FCP: '+(fcp?fcp.startTime.toFixed(2):'N/A'),'LCP: '+(lcp?lcp.startTime.toFixed(2):'N/A'),'TTFB: '+(p.responseStart-p.requestStart).toFixed(2),'DOM Interactive: '+(p.domInteractive-p.fetchStart).toFixed(2),'DOM Complete: '+(p.domComplete-p.fetchStart).toFixed(2),'Page Load: '+(p.loadEventEnd-p.fetchStart).toFixed(2)];alert(info.join('\\n'))},0);` },
        { g: "Page Manipulation", n: "Editable Page", c: "document.body.contentEditable=document.body.contentEditable=='true'?'false':'true';" },
        { g: "Page Manipulation", n: "Invert Colors", c: "var el=document.documentElement;var id='__bm_invert';if(el.hasAttribute(id)){el.style.filter='';el.removeAttribute(id);}else{el.style.filter='invert(1) hue-rotate(180deg)';el.setAttribute(id,'');}" }, {
            n: "Rainbowify",
            c: "var s=document.getElementById('__bm_rainbow');if(s){s.remove();return;}s=document.createElement('style');s.id='__bm_rainbow';s.textContent='*{animation:bm_rainbow 6s infinite}@keyframes bm_rainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}';document.head.appendChild(s);"
        }, { g: "Page Manipulation", n: "Disco Mode", c: "var id='__bm_disco';if(window[id]){clearInterval(window[id]);window[id]=null;document.body.style.background='';return;}window[id]=setInterval(()=>{document.body.style.background='hsl('+Math.floor(Math.random()*360)+',100%,50%)';},200);" },
        { g: "Page Manipulation", n: "Nyan Cat", c: "var id='__bm_nyan';var el=document.getElementById(id);if(el){el.remove();return;}var i=document.createElement('img');i.id=id;i.src='https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif';i.style.cssText='position:fixed;bottom:0;left:0;z-index:2147483646';document.body.appendChild(i);" },
        { g: "Page Manipulation", n: "Print-Friendly", c: "document.querySelectorAll('img,video,iframe').forEach(e=>e.style.display='none');document.body.style.background='white';" },
        { g: "Page Manipulation", n: "Show All Links", c: "alert(Array.from(document.links).map(a=>a.href).join('\\n')||'No links found.');" },
        { g: "Utility & Lookup", n: "View Source", c: "window.open('view-source:'+location.href);" },
        { g: "Page Manipulation", n: "Zap/Restore Gremlins", c: "if(window.__bm_zappedGremlins&&window.__bm_zappedGremlins.length>0){window.__bm_zappedGremlins.forEach(item=>item.el.style.display=item.display);window.__bm_zappedGremlins=null;alert('Gremlins restored.');return;}window.__bm_zappedGremlins=[];var count=0;document.querySelectorAll('body *').forEach(e=>{if(['fixed','sticky'].includes(getComputedStyle(e).position)&&e.id!=='__bm_modal'){window.__bm_zappedGremlins.push({el:e,display:e.style.display});e.style.display='none';count++;}});alert(count+' gremlins zapped. Run again to restore.');" }, {
            g: 'CSS Tools',
            n: 'Copy CSS Selector',
            c: "(function(){alert('Click an element to copy its CSS selector');document.body.style.cursor='crosshair';function h(e){e.preventDefault();e.stopPropagation();document.body.removeEventListener('click',h,true);document.body.style.cursor='default';var el=e.target,path=[];while(el&&el.nodeType===1){var sel=el.nodeName.toLowerCase();if(el.id)sel+='#'+el.id;else if(el.classList.length)sel+='.'+Array.from(el.classList).join('.');path.unshift(sel);el=el.parentElement;}var fp=path.join(' > ');navigator.clipboard.writeText(fp);var t=document.getElementById('__bm_copy_toast');if(!t){t=document.createElement('div');t.id='__bm_copy_toast';document.body.appendChild(t);}t.textContent='Copied: '+fp;t.style.opacity=1;setTimeout(()=>t.style.opacity=0,1800);}document.body.addEventListener('click',h,true);})();"
        },

        { g: "CSS Tools", n: "CSS Injector (Ultimate)", c: "(function(){const overlay_id='__bm_css_overlay';if(document.getElementById(overlay_id)){document.getElementById(overlay_id).remove();document.getElementById('__bm_css_live_style')?.remove();document.getElementById('__bm_css_style')?.remove();document.querySelectorAll('.__bm_snippet style').forEach(s=>s.remove());return;}const style=document.createElement('style');style.id='__bm_css_style';style.textContent=`#${overlay_id}{position:fixed;bottom:20px;left:20px;width:720px;height:520px;background:rgba(20,20,20,0.96);color:#e6eef3;font-family:ui-monospace,monospace;font-size:13px;border:1px solid #333;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.6);z-index:2147483647;display:flex;flex-direction:column;resize:both;overflow:hidden;}#${overlay_id}_header{cursor:move;background:linear-gradient(180deg,#0d1013,#0a0b0d);padding:8px;user-select:none;display:flex;justify-content:space-between;align-items:center;gap:8px;}#${overlay_id}_header .left{display:flex;gap:8px;align-items:center;}#${overlay_id}_header button,#${overlay_id}_header .small-btn{background:#111;border:1px solid #2b2f33;color:#dfe8ee;font-size:12px;padding:6px 8px;cursor:pointer;border-radius:5px;}#${overlay_id}_header .small-btn{padding:4px 6px;font-size:11px;}#__bm_css_tabs{display:flex;border-bottom:1px solid #24272a;}#__bm_css_tabs button{flex:1;padding:8px 10px;background:#0f1113;color:#aeb7bd;border:none;cursor:pointer;}#__bm_css_tabs button.active{background:#07121a;color:#66d9ef;border-bottom:2px solid #66d9ef;}#__bm_css_content{display:flex;flex:1;min-height:0;}#__bm_css_content>.tab{display:none;flex-direction:column;padding:10px;gap:8px;min-height:0;}#__bm_css_content>.tab.active{display:flex;}#__bm_live_area{display:flex;flex-direction:column;gap:8px;min-height:0;flex:1;}#${overlay_id}_input{flex:1;min-height:220px;resize:none;padding:10px;background:#071014;color:#cfeefc;border:1px solid #233034;border-radius:6px;box-sizing:border-box;overflow:auto;white-space:pre-wrap;}#__bm_live_controls{display:flex;gap:8px;align-items:center;}#__bm_save_snippet_btn{padding:8px 10px;background:#0d2b2a;border:1px solid #163533;color:#cfeefc;border-radius:6px;cursor:pointer;}#__bm_saved_list{flex:1;overflow:auto;padding-right:6px;display:flex;flex-direction:column;gap:8px;}.__bm_snippet{background:#071014;border:1px solid #223232;padding:8px;border-radius:6px;display:flex;flex-direction:column;gap:6px;}.__bm_snippet textarea{background:#041012;color:#cfeefc;border:1px solid #122425;border-radius:4px;font-family:inherit;font-size:12px;padding:8px;resize:vertical;min-height:80px;}.__bm_snippet .actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}.__bm_snippet .actions button{background:#071a1a;border:1px solid #123232;color:#cfeefc;padding:6px 8px;border-radius:5px;cursor:pointer;font-size:12px;}.__bm_snippet .status{font-size:11px;color:#9fb1b1;margin-left:6px;}.__bm_outline{outline:3px dashed rgba(255,80,80,0.95)!important;outline-offset:2px!important;transition:outline-offset .08s;}.__bm_small_note{font-size:12px;color:#9fb1b1;}`;document.head.appendChild(style);const overlay=document.createElement('div');overlay.id=overlay_id;overlay.innerHTML=`<div id=\"${overlay_id}_header\"><div class=\"left\"><strong>CSS Injector — Ultimate</strong></div><div class=\"right\"><button id=\"__bm_css_pick\" class=\"small-btn\">Pick Element (Simple)</button><button id=\"__bm_css_pick_deep\" class=\"small-btn\">Pick Element (Deep)</button><button id=\"__bm_css_clear\" class=\"small-btn\">Clear</button><button id=\"__bm_css_autoupdate\" class=\"small-btn\">AutoApply: ON</button><button id=\"__bm_css_close\" class=\"small-btn\">Close</button></div></div><div id=\"__bm_css_tabs\"><button data-tab=\"live\" class=\"active\">Live Edit</button><button data-tab=\"saved\">Saved Snippets</button></div><div id=\"__bm_css_content\"><div class=\"tab active\" data-tab=\"live\"><div id=\"__bm_live_area\"><textarea id=\"${overlay_id}_input\" spellcheck=\"false\" placeholder=\"Type CSS here (Shift+Enter for newline). Use Pick Element buttons.\"></textarea><div id=\"__bm_live_controls\"><button id=\"__bm_save_snippet_btn\">Save Snippet</button><span class=\"__bm_small_note\">Enter = apply when AutoApply is OFF. Tab inserts 4 spaces.</span></div></div></div><div class=\"tab\" data-tab=\"saved\"><div id=\"__bm_saved_list\"></div></div></div>`;document.body.appendChild(overlay);const input=overlay.querySelector(`#${overlay_id}_input`);const btnPick=overlay.querySelector('#__bm_css_pick');const btnPickDeep=overlay.querySelector('#__bm_css_pick_deep');const btnClear=overlay.querySelector('#__bm_css_clear');const btnAuto=overlay.querySelector('#__bm_css_autoupdate');const btnClose=overlay.querySelector('#__bm_css_close');const tabButtons=overlay.querySelectorAll('#__bm_css_tabs button');const tabContents=overlay.querySelectorAll('#__bm_css_content .tab');const btnSave=overlay.querySelector('#__bm_save_snippet_btn');const savedList=overlay.querySelector('#__bm_saved_list');const liveStyleTag=document.createElement('style');liveStyleTag.id='__bm_css_live_style';document.head.appendChild(liveStyleTag);function applyLiveCSS(){liveStyleTag.textContent=input.value||'';}tabButtons.forEach(btn=>{btn.addEventListener('click',()=>{tabButtons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const tab=btn.dataset.tab;tabContents.forEach(c=>c.classList.toggle('active',c.dataset.tab===tab));});});const header=overlay.querySelector(`#${overlay_id}_header`);let dragging=false,sx=0,sy=0,ol=0,ot=0;header.addEventListener('mousedown',e=>{if(e.target.closest('button'))return;dragging=true;sx=e.clientX;sy=e.clientY;ol=overlay.offsetLeft;ot=overlay.offsetTop;e.preventDefault();});window.addEventListener('mousemove',e=>{if(dragging){overlay.style.left=(ol+e.clientX-sx)+'px';overlay.style.top=(ot+e.clientY-sy)+'px';}});window.addEventListener('mouseup',()=>dragging=false);let autoApply=true;btnAuto.addEventListener('click',()=>{autoApply=!autoApply;btnAuto.textContent=`AutoApply: ${autoApply?'ON':'OFF'}`;if(autoApply)applyLiveCSS();});btnClear.addEventListener('click',()=>{input.value='';applyLiveCSS();});btnClose.addEventListener('click',()=>{overlay.remove();document.getElementById('__bm_css_live_style')?.remove();document.getElementById('__bm_css_style')?.remove();document.querySelectorAll('.__bm_snippet style').forEach(s=>s.remove());});input.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const s=input.selectionStart;const e2=input.selectionEnd;input.value=input.value.slice(0,s)+'\\t'+input.value.slice(e2);input.selectionStart=input.selectionEnd=s+1;}else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!autoApply)applyLiveCSS();}});input.addEventListener('input',()=>{if(autoApply)applyLiveCSS();});const STORAGE_KEY='__bm_css_snippets';function saveSnippetsToStorage(){const data=[];savedList.querySelectorAll('.__bm_snippet').forEach(s=>{const ta=s.querySelector('textarea');const enabled=s.dataset.enabled==='true';data.push({css:ta.value,enabled});});localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}function loadSnippetsFromStorage(){const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');data.forEach(d=>{const el=createSnippetElement(d.css);if(d.enabled){el.querySelector('.actions button').click();}savedList.appendChild(el);});}function createSnippetElement(snippetText){const wrapper=document.createElement('div');wrapper.className='__bm_snippet';const ta=document.createElement('textarea');ta.value=snippetText;ta.readOnly=true;wrapper.appendChild(ta);const actions=document.createElement('div');actions.className='actions';const btnEnable=document.createElement('button');btnEnable.textContent='Enable';const btnEdit=document.createElement('button');btnEdit.textContent='Edit';const btnCopy=document.createElement('button');btnCopy.textContent='Copy';const btnDelete=document.createElement('button');btnDelete.textContent='Delete';const status=document.createElement('span');status.className='status';status.textContent='Disabled';actions.append(btnEnable,btnEdit,btnCopy,btnDelete,status);wrapper.appendChild(actions);let enabled=false,styleTag=null;btnEnable.addEventListener('click',()=>{if(!enabled){styleTag=document.createElement('style');styleTag.textContent=ta.value;document.head.appendChild(styleTag);enabled=true;btnEnable.textContent='Disable';status.textContent='Enabled';wrapper.dataset.enabled='true';}else{if(styleTag)styleTag.remove();enabled=false;btnEnable.textContent='Enable';status.textContent='Disabled';wrapper.dataset.enabled='false';}saveSnippetsToStorage();});btnEdit.addEventListener('click',()=>{input.value=ta.value;applyLiveCSS();tabButtons.forEach(b=>b.classList.toggle('active',b.dataset.tab==='live'));tabContents.forEach(c=>c.classList.toggle('active',c.dataset.tab==='live'));});btnCopy.addEventListener('click',()=>{navigator.clipboard.writeText(ta.value).then(()=>{btnCopy.textContent='Copied!';setTimeout(()=>btnCopy.textContent='Copy',900);});});btnDelete.addEventListener('click',()=>{if(styleTag)styleTag.remove();wrapper.remove();saveSnippetsToStorage();});return wrapper;}btnSave.addEventListener('click',()=>{const text=input.value.trim();if(!text)return;const el=createSnippetElement(text);savedList.prepend(el);saveSnippetsToStorage();tabButtons.forEach(b=>b.classList.toggle('active',b.dataset.tab==='saved'));tabContents.forEach(c=>c.classList.toggle('active',c.dataset.tab==='saved'));});function pickElementSimple(){pickElement(false);}btnPick.addEventListener('click',pickElementSimple);btnPickDeep.addEventListener('click',()=>{pickElement(true);});function pickElement(deep=false){let picking=true;const info=document.createElement('div');info.textContent='Pick an element — Esc to cancel';Object.assign(info.style,{position:'fixed',top:'8px',left:'50%',transform:'translateX(-50%)',zIndex:2147483648,background:'rgba(0,0,0,0.7)',color:'#fff',padding:'6px 10px',borderRadius:'6px',fontFamily:'inherit'});document.body.appendChild(info);const hoverHandler=e=>{if(e.target.closest('#__bm_css_overlay'))return;e.stopPropagation();e.preventDefault();document.querySelectorAll('.__bm_outline').forEach(x=>x.classList.remove('__bm_outline'));e.target.classList.add('__bm_outline');};const clickHandler=e=>{if(e.target.closest('#__bm_css_overlay'))return;e.preventDefault();e.stopPropagation();const el=e.target;const selector=deep?getDeepUniqueSelector(el):getSimpleSelector(el);input.value=`${selector} {\\n\\t\\n}`;if(autoApply)applyLiveCSS();cleanup();};const keyHandler=e=>{if(e.key==='Escape')cleanup();};function cleanup(){picking=false;document.querySelectorAll('.__bm_outline').forEach(x=>x.classList.remove('__bm_outline'));document.removeEventListener('mousemove',hoverHandler,true);document.removeEventListener('click',clickHandler,true);document.removeEventListener('keydown',keyHandler,true);if(info.parentNode)info.remove();}document.addEventListener('mousemove',hoverHandler,true);document.addEventListener('click',clickHandler,true);document.addEventListener('keydown',keyHandler,true);}function getSimpleSelector(el){if(el.id)return '#'+CSS.escape(el.id);return el.tagName.toLowerCase()+(el.className?'.'+[...el.classList].map(c=>CSS.escape(c)).join('.'):'');}function getDeepUniqueSelector(el){if(!el||el.nodeType!==1)return '';if(el.id)return '#'+CSS.escape(el.id);const parts=[];let node=el;while(node&&node.nodeType===1&&node.tagName.toLowerCase()!=='html'){let part=node.tagName.toLowerCase();if(node.classList&&node.classList.length)part+='.'+[...node.classList].map(c=>CSS.escape(c)).join('.');const parent=node.parentNode;if(parent){const children=Array.from(parent.children);const sameSimple=children.filter(ch=>{if(ch.tagName!==node.tagName)return false;const chClasses=[...ch.classList];const nodeClasses=[...node.classList];if(nodeClasses.length!==chClasses.length)return false;return nodeClasses.every(c=>ch.classList.contains(c));});if(sameSimple.length>1||node.classList.length===0){const nth=children.indexOf(node)+1;part+=`:nth-child(${nth})`;}}parts.unshift(part);if(node.tagName.toLowerCase()==='body')break;node=node.parentNode;}return parts.join(' > ');}loadSnippetsFromStorage();input.value=`/* Type CSS or use Pick Element buttons */\\n`;})();" },
        
        {
            g: 'CSS Tools',
            n: 'Copy Styles',
            c: "(function(){alert('Click an element to copy its computed styles');document.body.style.cursor='crosshair';function h(e){e.preventDefault();e.stopPropagation();document.body.removeEventListener('click',h,true);document.body.style.cursor='default';var el=e.target,cs=getComputedStyle(el),txt='{\\n';for(var i=0;i<cs.length;i++){var p=cs[i];txt+='  '+p+': '+cs.getPropertyValue(p)+';\\n';}txt+='}';navigator.clipboard.writeText(txt);var t=document.getElementById('__bm_copy_toast');if(!t){t=document.createElement('div');t.id='__bm_copy_toast';document.body.appendChild(t);}t.textContent='Copied computed styles';t.style.opacity=1;setTimeout(()=>t.style.opacity=0,1800);}document.body.addEventListener('click',h,true);})();"
        }, { g: "Diagnostics & Debugging", n: "Heading Outline", c: "(function(){var panel_id='__heading_outline';if(document.getElementById(panel_id)){document.getElementById(panel_id).remove();document.getElementById('__heading_style').remove();document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>h.style.outline='');return;}const style=document.createElement('style');style.id='__heading_style';style.textContent=`#${panel_id}{position:fixed;top:10px;right:10px;max-height:90vh;overflow-y:auto;width:280px;background:rgba(30,30,30,0.95);color:#fff;border-radius:8px;padding:10px;font-family:sans-serif;z-index:2147483647;box-shadow:0 4px 12px rgba(0,0,0,0.4);cursor:grab;}#${panel_id} h4{margin:5px 0;font-weight:bold;display:flex;justify-content:space-between;align-items:center;}#${panel_id} .heading-link{cursor:pointer;display:flex;align-items:center;}#${panel_id} .heading-link:hover .heading-text{text-decoration:underline;}#${panel_id} .collapsible{margin-left:0px;}#${panel_id} .collapse-toggle{cursor:pointer;user-select:none;display:inline-block;width:16px;text-align:center;margin-right:5px;}#${panel_id} button{margin:5px 5px 10px 0;padding:3px 6px;background:#444;border:none;border-radius:4px;color:#fff;cursor:pointer;}h1,h2,h3,h4,h5,h6{outline:2px dashed #ff9800 !important;padding:2px !important;}#${panel_id} .top-buttons{display:flex;justify-content:flex-end;margin-bottom:5px;}#${panel_id} .top-buttons button{padding:2px 6px;font-weight:bold;}`;document.head.appendChild(style);const panel=document.createElement('div');panel.id=panel_id;panel.innerHTML=`<h4>Page Outline</h4>`;document.body.appendChild(panel);const topButtons=document.createElement('div');topButtons.className='top-buttons';const scrollTopBtn=document.createElement('button');scrollTopBtn.textContent='↑';scrollTopBtn.title='Scroll to Top';scrollTopBtn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});const closeBtn=document.createElement('button');closeBtn.textContent='×';closeBtn.title='Close Outline';closeBtn.onclick=()=>{panel.remove();document.getElementById('__heading_style').remove();document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>h.style.outline='');};topButtons.appendChild(scrollTopBtn);topButtons.appendChild(closeBtn);panel.appendChild(topButtons);const expandAllBtn=document.createElement('button');expandAllBtn.textContent='Expand All';const collapseAllBtn=document.createElement('button');collapseAllBtn.textContent='Collapse All';panel.appendChild(expandAllBtn);panel.appendChild(collapseAllBtn);const headings=Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));function buildNestedOutline(headings){const root=document.createElement('div');root.className='collapsible';function createSubOutline(startIndex,parentLevel){const container=document.createElement('div');container.className='collapsible';container.style.display='block';let i=startIndex;while(i<headings.length){const h=headings[i];const level=parseInt(h.tagName[1]);if(!h.id)h.id=`__heading_outline_${i}`;if(level<parentLevel)break;if(level===parentLevel){const link=document.createElement('div');link.className='heading-link';link.style.marginLeft=`${(level-1)*15}px`;const toggle=document.createElement('span');toggle.className='collapse-toggle';toggle.textContent='▼';link.appendChild(toggle);const text=document.createElement('span');text.className='heading-text';text.textContent=h.textContent;link.appendChild(text);container.appendChild(link);text.onclick=()=>{h.scrollIntoView({behavior:'smooth',block:'start'});h.style.transition='background 0.5s';h.style.background='rgba(255,235,59,0.4)';setTimeout(()=>h.style.background='',800);};const [subContainer,nextIndex]=createSubOutline(i+1,level+1);if(subContainer.children.length){container.appendChild(subContainer);toggle.onclick=(e)=>{e.stopPropagation();if(subContainer.style.display==='none'){subContainer.style.display='block';toggle.textContent='▼';}else{subContainer.style.display='none';toggle.textContent='▶';}};i=nextIndex;}else{toggle.style.visibility='hidden';i++;}}else{i++;}}return [container,i];}const [nestedOutline,]=createSubOutline(0,1);root.appendChild(nestedOutline);return root;}const outlineTree=buildNestedOutline(headings);panel.appendChild(outlineTree);expandAllBtn.onclick=()=>{const allSub=panel.querySelectorAll('.collapsible');allSub.forEach(c=>c.style.display='block');const toggles=panel.querySelectorAll('.collapse-toggle');toggles.forEach(t=>t.textContent='▼');};collapseAllBtn.onclick=()=>{const allSub=panel.querySelectorAll('.collapsible');allSub.forEach(c=>{if(c.parentElement===panel||c.parentElement.id===panel_id)return;c.style.display='none';});const toggles=panel.querySelectorAll('.collapse-toggle');toggles.forEach(t=>{if(t.parentElement.parentElement===panel||t.parentElement.parentElement.id===panel_id)return;t.textContent='▶';});};let isDragging=false,startX,startY,origX,origY;panel.addEventListener('mousedown',e=>{if(e.target.tagName==='BUTTON'||e.target.classList.contains('collapse-toggle')||e.target.classList.contains('heading-text'))return;isDragging=true;startX=e.clientX;startY=e.clientY;const rect=panel.getBoundingClientRect();origX=rect.left;origY=rect.top;panel.style.cursor='grabbing';e.preventDefault();});document.addEventListener('mousemove',e=>{if(!isDragging)return;const dx=e.clientX-startX;const dy=e.clientY-startY;panel.style.top=origY+dy+'px';panel.style.left=origX+dx+'px';});document.addEventListener('mouseup',()=>(isDragging=false,panel.style.cursor='grab'));})();" },
        { g: "Page Manipulation", n: "Matrix Rain", c: "(function(){var canvas_id='__bm_matrix_canvas';var canvas=document.getElementById(canvas_id);if(canvas){clearInterval(window.__matrixRainEffect.interval);window.removeEventListener('resize',window.__matrixRainEffect.resize);canvas.remove();window.__matrixRainEffect=null;return;}canvas=document.createElement('canvas');canvas.id=canvas_id;Object.assign(canvas.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'100%',zIndex:'2147483646',pointerEvents:'none'});document.body.appendChild(canvas);const ctx=canvas.getContext('2d');window.__matrixRainEffect={};function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}window.addEventListener('resize',resize);window.__matrixRainEffect.resize=resize;resize();const chars='アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';const fontSize=16;let columns=Math.floor(canvas.width/fontSize);let drops=Array(columns).fill(0);function draw(){ctx.fillStyle='rgba(0, 0, 0, 0.05)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#0F0';ctx.font=fontSize+'px monospace';if(columns!==Math.floor(canvas.width/fontSize)){columns=Math.floor(canvas.width/fontSize);drops=Array(columns).fill(0);}for(let i=0;i<drops.length;i++){const text=chars.charAt(Math.floor(Math.random()*chars.length));ctx.fillText(text,i*fontSize,drops[i]*fontSize);if(drops[i]*fontSize>canvas.height&&Math.random()>0.975){drops[i]=0;}drops[i]++;}}window.__matrixRainEffect.interval=setInterval(draw,50);})();" },
        { g: "Page Manipulation", n: "Snowfall Effect", c: "(function(){var container_id='__bm_snow_container';var snowContainer=document.getElementById(container_id);if(snowContainer){snowContainer.remove();window.removeEventListener('resize',window.__snowfallEffect.resize);cancelAnimationFrame(window.__snowfallEffect.frame);window.__snowfallEffect=null;return;}window.__snowfallEffect={};snowContainer=document.createElement('div');snowContainer.id=container_id;Object.assign(snowContainer.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'2147483646'});document.body.appendChild(snowContainer);const snowflakes=[];const numSnowflakes=100;const colors=['#FFF','#CCF','#AAF','#EEE'];for(let i=0;i<numSnowflakes;i++){const snow=document.createElement('div');const size=Math.random()*8+2;Object.assign(snow.style,{position:'absolute',top:`${Math.random()*window.innerHeight}px`,left:`${Math.random()*window.innerWidth}px`,width:`${size}px`,height:`${size}px`,background:colors[Math.floor(Math.random()*colors.length)],borderRadius:'50%',opacity:Math.random(),pointerEvents:'none'});snowContainer.appendChild(snow);snowflakes.push({el:snow,x:parseFloat(snow.style.left),y:parseFloat(snow.style.top),size:size,speed:Math.random()*1+0.5,drift:Math.random()*0.5-0.25});}function animate(){for(let snow of snowflakes){snow.y+=snow.speed;snow.x+=snow.drift;if(snow.y>window.innerHeight){snow.y=-snow.size;snow.x=Math.random()*window.innerWidth;}if(snow.x>window.innerWidth)snow.x=0;if(snow.x<0)snow.x=window.innerWidth;snow.el.style.top=snow.y+'px';snow.el.style.left=snow.x+'px';}window.__snowfallEffect.frame=requestAnimationFrame(animate);}animate();window.__snowfallEffect.resize=()=>{for(let snow of snowflakes){if(snow.x>window.innerWidth)snow.x=window.innerWidth;if(snow.y>window.innerHeight)snow.y=window.innerHeight;}};window.addEventListener('resize',window.__snowfallEffect.resize);})();" },
        { g: "CSS Tools", n: "W3C CSS Validator", c: "(function(){var links=Array.from(document.querySelectorAll('link[rel=\"stylesheet\"]')).map(link=>link.href).filter(href=>href);if(links.length===0){alert(\"No external CSS files found on this page.\");return;}links.forEach(href=>{var validatorUrl='https://jigsaw.w3.org/css-validator/validator?uri='+encodeURIComponent(href);window.open(validatorUrl,'_blank');});})();" },
        { g: "Diagnostics & Debugging", n: "W3C Validator", c: "(function(){var url=encodeURIComponent(window.location.href);var validatorUrl='https://validator.w3.org/nu/?doc='+url;window.open(validatorUrl,'_blank');})();" },
        { g: "Page Manipulation", n: "Hypnotic Page", c: "(function(){var id='__hypno_style';var style=document.getElementById(id);var toast_id='__hypno_toast';var toast=document.getElementById(toast_id);if(style){style.remove();if(toast)toast.remove();return;}style=document.createElement('style');style.id=id;style.textContent=`@keyframes hypnotic-spiral{0%{transform:rotate(0deg) scale(1)}25%{transform:rotate(3deg) scale(1.01)}50%{transform:rotate(0deg) scale(1)}75%{transform:rotate(-3deg) scale(0.99)}100%{transform:rotate(0deg) scale(1)}}body,body *{animation:hypnotic-spiral 4s infinite linear;transform-origin:center center}`;document.head.appendChild(style);toast=document.createElement('div');toast.id=toast_id;toast.textContent='🌀 Hypnotic effect active (Click again to stop)!';Object.assign(toast.style,{position:'fixed',bottom:'20px',right:'20px',padding:'10px 15px',background:'#ff4081',color:'#fff',borderRadius:'6px',fontFamily:'sans-serif',zIndex:9999,opacity:0.9});document.body.appendChild(toast);})();" },
        { g: "Page Manipulation", n: "Zap Popups/Modals", c: "(function(){const modalSelectors=['[class*=\"modal\"]','[class*=\"popup\"]','[class*=\"overlay\"]','[class*=\"lightbox\"]','[class*=\"banner\"]','[id*=\"modal\"]','[id*=\"popup\"]','[id*=\"overlay\"]','[id*=\"lightbox\"]','[id*=\"banner\"]'];let removedCount=0;modalSelectors.forEach(selector=>{const elements=document.querySelectorAll(selector);elements.forEach(el=>{el.remove();removedCount++;});});console.log(`Removed ${removedCount} popups/modals/overlays.`);})();" },
        { g: "CSS Tools", n: "Remove All Styles", c: "(function(){document.querySelectorAll('link[rel=\"stylesheet\"]').forEach(link=>link.remove());document.querySelectorAll('style').forEach(style=>style.remove());document.querySelectorAll('[style]').forEach(el=>el.removeAttribute('style'));document.querySelectorAll('[class]').forEach(el=>el.removeAttribute('class'));document.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));console.log('All styles removed. Page is now unstyled.');})();" },
        { g: "Page Manipulation", n: "Click-to-Delete", c: "(function(){var id='__bm_click_to_delete_mode';if(window[id]&&window[id].active){var styleTag=document.getElementById('__bm_delete_style');if(styleTag)styleTag.remove();document.body.removeEventListener('click',window[id].click,true);document.body.removeEventListener('mouseover',window[id].over,true);document.body.removeEventListener('mouseout',window[id].out,true);document.removeEventListener('keydown',window[id].key);window[id]=null;return;}window[id]={active:true,click:function(e){if(!window[id].active)return;e.stopPropagation();if(confirm('Delete this element?'))e.target.remove();},over:function(e){if(!window[id].active)return;e.target.classList.add('__bm_delete_hover');},out:function(e){if(!window[id].active)return;e.target.classList.remove('__bm_delete_hover');},key:function(e){if(e.key==='Escape'){var styleTag=document.getElementById('__bm_delete_style');if(styleTag)styleTag.remove();document.body.removeEventListener('click',window[id].click,true);document.body.removeEventListener('mouseover',window[id].over,true);document.body.removeEventListener('mouseout',window[id].out,true);document.removeEventListener('keydown',window[id].key);window[id]=null;}}};var style=document.createElement('style');style.id='__bm_delete_style';style.textContent='.click-to-delete-hover{outline:2px solid red!important;cursor:crosshair!important;}';document.head.appendChild(style);document.body.addEventListener('click',window[id].click,true);document.body.addEventListener('mouseover',window[id].over,true);document.body.addEventListener('mouseout',window[id].out,true);document.addEventListener('keydown',window[id].key);})();" },
        { g: "CSS Tools", n: "Hover Persist", c: "var id='__bm_hover_persist';if(window[id]){document.body.removeEventListener('click',window[id],true);window[id]=null;document.querySelectorAll('.bm-hover-persist-active').forEach(el=>el.classList.remove('bm-hover-persist-active'));alert('Hover Persist disabled.');return;}window[id]=function(e){e.preventDefault();e.stopPropagation();if(e.target.classList.contains('bm-hover-persist-active')){e.target.classList.remove('bm-hover-persist-active');}else{e.target.classList.add('bm-hover-persist-active');}};document.body.addEventListener('click',window[id],true);alert('Click elements to toggle hover persist. Click again to disable.');" },
        { g: "Page Manipulation", n: "Rotate Page", c: `var id='__bm_page_wrapper';var wrapper=document.getElementById(id);var modal=document.getElementById('__bm_modal');if(wrapper){var isRotated=wrapper.style.transform;if(isRotated){wrapper.style.transform='';modal.classList.remove('rotated-comp');}else{wrapper.style.transform='rotate(180deg)';modal.classList.add('rotated-comp');}return;}wrapper=document.createElement('div');wrapper.id=id;wrapper.style.transition='transform 0.5s ease';wrapper.style.transform='rotate(180deg)';var nodesToMove=[];for(var i=0;i<document.body.childNodes.length;i++){var node=document.body.childNodes[i];if(node.nodeType===1&&node.id==='__bm_modal')continue;nodesToMove.push(node);}nodesToMove.forEach(node=>wrapper.appendChild(node));document.body.appendChild(wrapper);modal.classList.add('rotated-comp');` },
        { g: "Utility & Lookup", n: "Get Page Info", c: `function createInfoCard(){if(document.getElementById('__bm_page_info_card'))return;var desc=document.querySelector('meta[name=description]');var canon=document.querySelector('link[rel=canonical]');var lastMod=document.lastModified;var info={'Title':document.title,'URL':location.href,'Canonical':canon?canon.href:'N/A','Last Modified':lastMod||'N/A','Word Count':document.body.innerText.split(/\\s+/).length,'H1 Count':document.querySelectorAll('h1').length,'Link Count':document.links.length,'Image Count':document.images.length,'iFrame Count':document.getElementsByTagName('iframe').length,'Charset':document.characterSet,'Description':desc?desc.content:'N/A'};var card=document.createElement('div');card.id='__bm_page_info_card';var content='<span id="__bm_info_close">✖</span><h4>Page Info</h4>';for(var label in info){content+="<div class='bm-info-row'><span>"+label+"</span><span title='Click to copy'>"+info[label]+"</span></div>";}card.innerHTML=content;document.body.appendChild(card);card.addEventListener('click',function(e){if(e.target.id==='__bm_info_close'){card.remove();return;}if(e.target.tagName==='SPAN'&&e.target.title==='Click to copy'){navigator.clipboard.writeText(e.target.textContent);var originalText=e.target.textContent;e.target.textContent='Copied!';setTimeout(function(){e.target.textContent=originalText;},1000);}});}createInfoCard();` },
        { g: "Utility & Lookup", n: "Scroll To Top/Bottom", c: 'var id="__bm_scroll_buttons";var el=document.getElementById(id);if(el){el.remove();document.documentElement.style.scrollBehavior="";return;}var speedInput=prompt("Enter scroll speed: \'slow\' (smooth) or \'fast\' (auto)","slow");var behavior=speedInput&&speedInput.toLowerCase()==="fast"?"auto":"smooth";document.documentElement.style.scrollBehavior=behavior;el=document.createElement("div");el.id=id;el.innerHTML=\'<button title="Scroll to Top">▲</button><button title="Scroll to Bottom">▼</button>\';document.body.appendChild(el);el.children[0].onclick=function(){window.scrollTo({top:0,behavior:behavior});};el.children[1].onclick=function(){window.scrollTo({top:document.body.scrollHeight,behavior:behavior});};' },
        { g: "Utility & Lookup", n: "Wayback Lookup", c: "window.open('https://web.archive.org/web/*/'+location.href);" }
    ];

    // --- Populate select ---
    var selectElement = modal.querySelector('#__bm_select');
    var groupedBookmarklets = {};
    bookmarkletData.forEach((item, index) => {
        item.g = item.g || "Other";
        groupedBookmarklets[item.g] = groupedBookmarklets[item.g] || [];
        groupedBookmarklets[item.g].push({ idx: index, name: item.n });
    });
    for (var groupName in groupedBookmarklets) {
        var optGroup = document.createElement('optgroup');
        optGroup.label = groupName;
        groupedBookmarklets[groupName].forEach(function (item) {
            var option = document.createElement('option');
            option.value = item.idx;
            option.textContent = item.name;
            optGroup.appendChild(option);
        });
        selectElement.appendChild(optGroup);
    }

    // --- Event Handlers ---
    modal.querySelector('#__bm_run').onclick = () => {
        try {
            new Function(bookmarkletData[selectElement.value].c)();
        } catch (e) {
            alert('Error running bookmarklet tool:\n' + e.message);
        }
    };
    modal.querySelector('#__bm_modal_close').onclick = () => { modal.remove(); };

    // --- Drag Functionality ---
    var header = modal.querySelector('#__bm_modal_header');
    header.addEventListener('mousedown', function (e) {
        var offsetX = e.clientX, offsetY = e.clientY;
        var initialLeft = modal.offsetLeft, initialTop = modal.offsetTop;
        function onMouseMove(moveEvent) {
            var deltaX = moveEvent.clientX - offsetX, deltaY = moveEvent.clientY - offsetY;
            modal.style.left = initialLeft + deltaX + 'px';
            modal.style.top = initialTop + deltaY + 'px';
        }
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            localStorage.setItem('__bm_modal_pos', JSON.stringify({ left: modal.style.left, top: modal.style.top }));
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
})();
