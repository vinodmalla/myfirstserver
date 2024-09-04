// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
const vscode = acquireVsCodeApi();
var addedNewCells = 0;
var deletedNewCells = 0;
var addedLibCells = 0;
var deletedLibCells = 0;
var lastCSNname = 0;
var lastCSNbit = 0;
var ready2save = [];
var sliderStepSimulations = [];
var sliderStepWriteResults = [];
var inputSignals = [];
var outputSignals = [];

function convertBinHex(oldval,oldsys) {
    let res = '';
    if(Number(oldsys)===16) {
        const hexlen = String(oldval).trim().length;
        for(let c=0; c<hexlen; c++) {
            const hexdec = parseInt(oldval.charAt(c),16).toString(10);
            const hexbin = parseInt(oldval.charAt(c),16).toString(2);
            if(isNaN(hexdec)) {return 'NaN';}
            else {res = res + '0'.repeat(4-hexbin.length) + hexbin;}
        }
    }
    else if(Number(oldsys)===2) {
        const binlen = String(oldval).trim().length/4;
        for(let c=0; c<binlen; c++) {
            const bindec = parseInt(oldval.substring(c*4,c*4+4),2).toString(10);
            const binhex = parseInt(oldval.substring(c*4,c*4+4),2).toString(16).toUpperCase();
            if(isNaN(bindec)) {return 'NaN';}
            else {res = res + binhex;}
        }
    }
    return res;
}
function addError(err) {
    for(let e=0; e<ready2save.length; e++) {if(ready2save[e]===err) {return 1;}}
    ready2save.push(err);
}
function removeError(err) {
    for(let e=0; e<ready2save.length; e++) {if(ready2save[e]===err) {ready2save.splice(e,1);}}
}
function configStandard() {
    vscode.postMessage({command:'standard',setting:'config_file'});
}
function designStandard() {
    vscode.postMessage({command:'standard',setting:'design_file'});
}
function libraryStandard() {
    vscode.postMessage({command:'standard',setting:'library_file'});
}
function linkerStandard() {
    vscode.postMessage({command:'standard',setting:'linker_file'});
}
function nextEnter(event) {
    if (document.title==="Prolead Configuration" && event.keyCode === 13) { // if the enter key is pressed
        var step1 = document.getElementById("project_path_group").style["display"];
        var step2 = document.getElementById("project_files_group").style["display"];
        var step3 = document.getElementById("file_names_group").style["display"];

        if(step1==="block" && step2==="none" && step3==="none") {nextFiles();}
        else if(step1==="block" && step2==="block" && step3==="none") {nextNames();}
        else if(step1==="block" && step2==="block" && step3==="block") {create();}
    }
}
function nextFiles() {
    vscode.postMessage({
        command:'nextFiles',
        path:document.getElementById("project_folder_path").value,
        name:document.getElementById("project_folder_name").value
    });

}
function nextNames() {
    vscode.postMessage({
        command:'nextNames',
        confValue:document.getElementById("config_file").value,
        dsgnValue:document.getElementById("design_file").value,
        librValue:document.getElementById("library_file").value,
    });
}
function create() {
    vscode.postMessage({
        command:'create',
        path:document.getElementById("project_folder_path").value,
        name:document.getElementById("project_folder_name").value,
        confValue:document.getElementById("config_file").value,
        dsgnValue:document.getElementById("design_file").value,
        librValue:document.getElementById("library_file").value,
        modName:document.getElementById("module_name_list").options[document.getElementById("module_name_list").selectedIndex].text,
        libName:document.getElementById("library_name_list").options[document.getElementById("library_name_list").selectedIndex].text
    });
}
function browseFolder() {
    //
}
function browseFile(myID) {
    var input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.onchange = e => {
        var myPath = e.target.files[0].path;
        while(myPath.indexOf('\\')!==-1) {myPath = myPath.replace('\\','/');}
        if(myPath.indexOf('/home/')!==-1) {myPath = myPath.substring(myPath.indexOf('/home/'));}
        else if(myPath.indexOf('/etc/')!==-1) {myPath = myPath.substring(myPath.indexOf('/etc/'));}
        else if(myPath.indexOf('/sys/')!==-1) {myPath = myPath.substring(myPath.indexOf('/sys/'));}
        else if(myPath.indexOf('/tmp/')!==-1) {myPath = myPath.substring(myPath.indexOf('/tmp/'));}
        document.getElementById(myID).value = myPath;
        switch(myID) {
            case 'design_file':
                updateNames('module_name_list','design_file');
                break;
            case 'library_file':
                updateNames('library_name_list','library_file');
                break;
        }
    };
}
function validateFolder(myID,myVAL) {
    vscode.postMessage({command:'validateFolder', id:myID, path:myVAL});
}
function validateFile(myID,myVAL) {
    vscode.postMessage({command:'validateFile',id:myID, path:myVAL});
}
function updateNames(myid,mypath) {
    vscode.postMessage({
        command:'fetchNames',
        theid:myid,
        thepath:document.getElementById(mypath).value
    });
}
function createAddCellsButton() {
    const newcellsbutton = document.createElement('button');
    newcellsbutton.id = 'add_newcells_lib';
    newcellsbutton.innerText = `Add New Cell to the Library ${document.getElementById('library_name_chooser').value}`;
    newcellsbutton.style['display'] = 'block';
    newcellsbutton.style['maxWidth'] = '920px';
    newcellsbutton.style['margin'] = '0 auto';
    newcellsbutton.onclick = addLibNewcells;
    document.body.appendChild(newcellsbutton);
}
function addLibNewcells() {
    vscode.postMessage({
        command:'addLibNewcells',
        lib:document.getElementById('cells_edit_box').title,
        nr:addedLibCells
    });
    setTimeout(()=>{window.scrollTo(0, document.body.scrollHeight);},250);
}
function addNewLib() {
    // ask if user wants to preceed
    try {
        const libShown = document.getElementById('cells_edit_box').title;
        if(libShown!=='The New Library') {
            vscode.postMessage({command:'exit_editing_newlib',shown:libShown});
        }
        else {
            vscode.postMessage({command:'already_adding'});
        }
    }
    catch(err) {
        const newlib = document.createElement('div');
        newlib.className = 'configgroup';
        newlib.title = 'The New Library';
        newlib.id = 'newlib_name_box';
        newlib.style['display'] = 'block';
        newlib.innerHTML = 
        `<h2 class="configheader"><strong>New Library Name</strong></h2>
        <a id="newcells_number" style="color:#ababab !important;">0 cells are added to the new library. To add a new cell click the button "Add A Cell"</a>
        <div class="configitem">
            <input type="text" id="newlib_name" style="display:inline; width:89.5%;"> <button class="action-button" id="new_cells_add" style="display:inline; width:10%;" onclick="addNewCell()">Add A Cell</button>
        </div>
        <div class="configitem">
            <button class="action-button" id="newlib_create" onclick="createNewLib()">Create</button>
        </div>`;
        document.body.appendChild(newlib);

        const editbox = document.createElement('div');
        editbox.className = 'configgroup';
        editbox.title = 'The New Library';
        editbox.id = 'cells_edit_box';
        editbox.style['display'] = 'block';
        document.body.appendChild(editbox);
    }
}
function addNewCell() {
    let cellnr = addedNewCells - deletedNewCells;
    const newcell = document.createElement('div');
    newcell.className = 'configitem';
    newcell.id = `newlib_newcell_${addedNewCells}`;
    newcell.innerHTML =
    `<div style="display:block; float:left; width:100%; height:30px; border-top:#3c3c3c 1px solid; padding-top:10px; position:relative;">
        <label id="${newcell.id}_label" for="${newcell.id}_name" style="font-size:16px; position:absolute; top:44%;"><strong>Cell ${cellnr+1} - Type:</strong></label>
        <svg class="delete-cell" width="32" height="32" style="float:right;" viewBox="0 0 10 20" xmlns="http://www.w3.org/2000/svg" fill="red" onclick="deleteCell('${newcell.id}')"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6zM7.9 7.5L10.3 5l.7.7-2.4 2.5 2.4 2.5-.7.7-2.4-2.5-2.4 2.5-.7-.7 2.4-2.5-2.4-2.5.7-.7 2.4 2.5z"></path></svg>
        <select name="${newcell.id}_name" id="${newcell.id}_name" style="display:inline; float:right; color:#cccccc; background-color:#3c3c3c; width:80%; height:28px; margin-left: 8px;">
        <option value="Gate">Gate</option>
        <option value="Reg">Reg</option>
        <option value="Buffer">Buffer</option>
        </select>
    </div>
    <div style="display:block; float:left; width:35%; margin:12px 0px 10px 0px;">
    <p id="${newcell.id}_variant_0" style="color:#007fd4; position:absolute; margin-top:80px; font-size:12px; width:322px; text-align:center;"></p>
    <p id="${newcell.id}_variants_all" style="color:#007fd4; position:absolute; margin-top:34px; font-size:12px; width:322px; text-align:center;">
        <strong id="${newcell.id}_variant_1"></strong><br>
        <strong id="${newcell.id}_variant_2"></strong><br>
        <strong id="${newcell.id}_variant_3"></strong><br>
        <strong id="${newcell.id}_variant_4"></strong><br>
        <strong id="${newcell.id}_variant_5"></strong><br>
        <strong id="${newcell.id}_variant_6"></strong><br>
        <strong id="${newcell.id}_variant_7"></strong><br>
        <strong id="${newcell.id}_variant_8"></strong><br>
    </p>
    <p id="${newcell.id}_inname_all" style="color:#007fd4; position:absolute; margin-top:-3px; font-size:16px; width:40px; margin-left:23px; text-align:right; direction:rtl;">
        <strong id="${newcell.id}_inname_0" style="position:absolute; margin-top:80px;"></strong><br>
        <strong id="${newcell.id}_inname_1"></strong><br>
        <strong id="${newcell.id}_inname_2"></strong><br>
        <strong id="${newcell.id}_inname_3"></strong><br>
        <strong id="${newcell.id}_inname_4"></strong><br>
        <strong id="${newcell.id}_inname_5"></strong><br>
        <strong id="${newcell.id}_inname_6"></strong><br>
        <strong id="${newcell.id}_inname_7"></strong><br>
        <strong id="${newcell.id}_inname_8"></strong><br>
    </p>
    <p id="${newcell.id}_outname_all" style="color:#007fd4; position:absolute; margin-top:-3px; font-size:16px; width:40px; margin-left:260px; text-align:left; direction:ltr;">
        <strong id="${newcell.id}_outname_0" style="position:absolute; margin-top:80px;"></strong><br>
        <strong id="${newcell.id}_outname_1"></strong><br>
        <strong id="${newcell.id}_outname_2"></strong><br>
        <strong id="${newcell.id}_outname_3"></strong><br>
        <strong id="${newcell.id}_outname_4"></strong><br>
        <strong id="${newcell.id}_outname_5"></strong><br>
        <strong id="${newcell.id}_outname_6"></strong><br>
        <strong id="${newcell.id}_outname_7"></strong><br>
        <strong id="${newcell.id}_outname_8"></strong><br>
    </p>
    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 322 172" width="322" height="172">
        <style>
            .s0 { display:block; fill: none; stroke: #007fd4; stroke-width: 2; }
            .s1 { display:none; fill: none; stroke: #007fd4; stroke-width: 2; }
        </style>
        <path id="${newcell.id}_circuitbasic" class="s0" d="m114.1 32.8c0-2.2 1.8-4 4-4h85.8c2.2 0 4 1.8 4 4v106.4c0 2.2-1.8 4-4 4h-85.8c-2.2 0-4-1.8-4-4z"/>
        <g id="${newcell.id}_inputs_all">
            <path id="${newcell.id}_input_8" class="s1" d="m113.5 133.8h-19.6l-18.6 16.5h-8.5"/>
            <path id="${newcell.id}_input_7" class="s1" d="m113.5 120.3h-24l-14.2 9.7h-8.5"/>
            <path id="${newcell.id}_input_6" class="s1" d="m113.5 106.2h-26.8l-11.4 6.8h-8.5"/>
            <path id="${newcell.id}_input_5" class="s1" d="m113.5 92.4h-28.5l-9.7 2.9h-8.5"/>
            <path id="${newcell.id}_input_4" class="s1" d="m113.5 78.9h-28.5l-9.7-2.9h-8.5"/>
            <path id="${newcell.id}_input_3" class="s1" d="m113.5 65.2h-26.8l-11.4-6.7h-8.5"/>
            <path id="${newcell.id}_input_2" class="s1" d="m113.5 51.3h-24l-14.2-9.9h-8.5"/>
            <path id="${newcell.id}_input_1" class="s1" d="m113.5 37.8h-19.6l-18.6-16.7h-8.5"/>
            <path id="${newcell.id}_input_0" class="s1" d="m113.5 85.9h-46.7"/>
        </g>
        <g id="${newcell.id}_outputs_all">
            <path id="${newcell.id}_output_8" class="s1" d="m208.1 133.8h19.6l18.7 16.5h9"/>
            <path id="${newcell.id}_output_7" class="s1" d="m208.1 120.3h24l14.3 9.7h9"/>
            <path id="${newcell.id}_output_6" class="s1" d="m208.1 106.2h26.8l11.5 6.8h9"/>
            <path id="${newcell.id}_output_5" class="s1" d="m208.1 92.4h28.5l9.8 2.9h9"/>
            <path id="${newcell.id}_output_4" class="s1" d="m208.1 78.9h28.5l9.8-2.9h9"/>
            <path id="${newcell.id}_output_3" class="s1" d="m208.1 65.2h26.8l11.5-6.7h9"/>
            <path id="${newcell.id}_output_2" class="s1" d="m208.1 51.3h24l14.3-9.9h9"/>
            <path id="${newcell.id}_output_1" class="s1" d="m208.1 37.8h19.6l18.7-16.7h9"/>
            <path id="${newcell.id}_output_0" class="s1" d="m208 85.9h47.4"/>
        </g>
    </svg>
    </div>
    <div style="display:block; float:right; width:50%; margin:12px 0px 10px 0px;">
        <label for="${newcell.id}_inputs">Inputs Names:</label>
        <input type="text" id="${newcell.id}_inputs" style="height:28px;" value="" onchange="changes(this.id)">
        <label for="${newcell.id}_outputs">Outputs Names:</label>
        <input type="text" id="${newcell.id}_outputs" style="height:28px;" value="" onchange="changes(this.id)">
        <label for="${newcell.id}_variants">Variants Names:</label>
        <input type="text" id="${newcell.id}_variants" style="height:28px;" value="" onchange="changes(this.id)">
        <label for="${newcell.id}_formula">Formula:</label>
        <input type="text" id="${newcell.id}_formula" style="height:28px;" alt="" onchange="changes(this.id)">
    </div>
    <div style="display:block; float:right; width:12%; margin:12px 0px 10px 0px;">
        <label for="${newcell.id}_NrInputs">Nr. Inputs:</label>
        <input type="number" min="0" id="${newcell.id}_NrInputs" style="width:80%; height:28px;" value="0" onchange="checkCellVariables(this.id, this.value)">
        <label for="${newcell.id}_NrOutputs">Nr. Outputs:</label>
        <input type="number" min="0" id="${newcell.id}_NrOutputs" style="width:80%; height:28px;" value="0" onchange="checkCellVariables(this.id, this.value)">
        <label for="${newcell.id}_NrVariants">Nr. Variants:</label>
        <input type="number" min="0" id="${newcell.id}_NrVariants" style="width:80%; height:28px;" value="0" onchange="checkCellVariables(this.id, this.value)">
        <label for="${newcell.id}_LnFormula">Formulas:</label>
        <select name="${newcell.id}_LnFormula" id="${newcell.id}_LnFormula" style="color:#cccccc; background-color:#3c3c3c; width:80%; height:28px;" onchange="showOutputFormula(this.id)">
        </select>
    </div>`;
    // updating the text in the top
    document.getElementById('cells_edit_box').appendChild(newcell);
    let textcells = document.getElementById('newcells_number').innerText.split(' ');
    textcells[0] = Number(textcells[0])+1;
    let text = textcells.toString();
    while(text.indexOf(',')!==-1) {text = text.replace(',',' ');}
    document.getElementById('newcells_number').innerText = text;
    addedNewCells++;
}
function createNewLib() {
    if(document.getElementById('newlib_name')===null || String(document.getElementById('newlib_name').value).trim()==="") {
        document.getElementById('newlib_name').className = "error";
        vscode.postMessage({command:'newlibInvalid'});
    }
    else if(addedNewCells===deletedNewCells) {
        document.getElementById('newlib_name').className = "";
        vscode.postMessage({command:'notEnoughNewCells'});
    }
    else {
        document.getElementById('newlib_name').className = "";
        vscode.postMessage({command:'createNewLib', name:document.getElementById('newlib_name').value});
    }
}
function deleteCell(myID) {
    const cellnr = document.getElementById(myID+'_label');
    let text = cellnr.innerText.split(' ');
    vscode.postMessage({command:'deleteCell', name:text[0]+' '+text[1], id:myID});
}
function showLibCells() {
    let libShown, libSelected = document.getElementById('library_name_chooser').value;
    try {
        libShown = document.getElementById('cells_edit_box').title;
        if(libShown!==libSelected) {vscode.postMessage({command:'exit_library_editing',shown:libShown});}
        else {vscode.postMessage({command:'already_editing', lib:libSelected});}
    }
    catch (err) {
        // For the first time = if no library is opened to be edited
        addedNewCells = 0; deletedNewCells = 0; addedLibCells = 0; deletedLibCells = 0;
        createAddCellsButton();
        vscode.postMessage({
            command:'getLibCells',
            lib:document.getElementById('library_name_chooser').value
        });
    }
}
function editLibCells() {
    //
}
function showOutputFormula(myID) {
    // get index of selected output
    const index = document.getElementById(myID).selectedIndex;
    // try to get the formula of the selected output
    try {
        const formulas = document.getElementById(myID.replace('_LnFormula','_formula')).alt;
        document.getElementById(myID.replace('_LnFormula','_formula')).value = String(formulas).split(',')[index]===undefined? '':String(formulas).split(',')[index];
    } catch(err) {
        document.getElementById(myID.replace('_LnFormula','_formula')).value = '';
    }
}
function updateGraphic(cellID, name, array) {
    function draw(name, number, array) {
        switch(number) {
            case 0:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                break;
            case 1:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                document.getElementById(cellID+name+0).style['display'] = 'block';
                break;
            case 2:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                for(const e of [3,6]) {document.getElementById(cellID+name+e).style['display'] = 'block';}
                break;
            case 3:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                for(const e of [0,1,8]) {document.getElementById(cellID+name+e).style['display'] = 'block';}
                break;
            case 4:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                for(const e of [1,3,6,8]) {document.getElementById(cellID+name+e).style['display'] = 'block';}
                break;
            case 5:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                for(const e of [0,1,3,6,8]) {document.getElementById(cellID+name+e).style['display'] = 'block';}
                break;
            case 6:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                for(const e of [1,2,3,6,7,8]) {document.getElementById(cellID+name+e).style['display'] = 'block';}
                break;
            case 7:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                for(const e of [0,1,2,3,6,7,8]) {document.getElementById(cellID+name+e).style['display'] = 'block';}
                break;
            case 8:
                document.getElementById(cellID+name+0).style['display'] = 'none';
                for(let e=1; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'block';}
                break;
            default: // for more than 8
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                document.getElementById(cellID+name+1).style['display'] = 'block';
                for(const e of [2,3,4,0,5,6,7]) {document.getElementById(cellID+name+e).style['display'] = 'none';}
                document.getElementById(cellID+name+8).style['display'] = 'block';
                break;
        }
    }
    function write(name, number, array) {
        switch(number) {
            case 0:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                break;
            case 1:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                document.getElementById(cellID+name+0).innerText = array[0];
                break;
            case 2:
                let v2 = [3,6];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v2.length; e++) {document.getElementById(cellID+name+v2[e]).innerText = array[e];}
                break;
            case 3:
                let v3 = [1,0,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v3.length; e++) {document.getElementById(cellID+name+v3[e]).innerText = array[e];}
                break;
            case 4:
                let v4 = [1,3,6,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v4.length; e++) {document.getElementById(cellID+name+v4[e]).innerText = array[e];}
                break;
            case 5:
                let v5 = [1,3,0,6,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v5.length; e++) {document.getElementById(cellID+name+v5[e]).innerText = array[e];}
                break;
            case 6:
                let v6 = [1,2,3,6,7,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v6.length; e++) {document.getElementById(cellID+name+v6[e]).innerText = array[e];}
                break;
            case 7:
                let v7 = [1,2,3,0,6,7,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v7.length; e++) {document.getElementById(cellID+name+v7[e]).innerText = array[e];}
                break;
            case 8:
                document.getElementById(cellID+name+0).innerText = '';
                for(let e=1; e<9; e++) {document.getElementById(cellID+name+e).innerText = array[e-1];}
                break;
            default: // for more than 8
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                document.getElementById(cellID+name+1).innerText = array[0];
                for(const e of [3,0,6]) {document.getElementById(cellID+name+e).innerText = '.';}
                document.getElementById(cellID+name+8).innerText = array[array.length-1];
                break;
        }
    }
    // update inputs
    if(name==='_input_') {
        const inputLgth = array.length;
        draw(name,inputLgth,array);
        write('_inname_',inputLgth,array);
    }
    // update outputs
    else if(name==='_output_') {
        const outputLgth = array.length;
        draw(name,outputLgth,array);
        write('_outname_',outputLgth,array);
    }
    // update variants
    else if(name==='_variant_') {
        const variantLgth = array.length;
        switch(variantLgth) {
            case 0:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                break;
            case 1:
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                document.getElementById(cellID+name+0).innerHTML = '<strong>'+array[0]+'</strong>';
                break;
            case 2:
                let v2 = [3,6];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v2.length; e++) {document.getElementById(cellID+name+v2[e]).innerText = array[e];}
                break;
            case 3:
                let v3 = [2,0,7];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v3.length; e++) {document.getElementById(cellID+name+v3[e]).innerText = array[e];}
                document.getElementById(cellID+name+0).innerHTML = '<strong>'+array[1]+'</strong>';
                break;
            case 4:
                let v4 = [1,3,6,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v4.length; e++) {document.getElementById(cellID+name+v4[e]).innerText = array[e];}
                break;
            case 5:
                let v5 = [1,3,0,6,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v5.length; e++) {document.getElementById(cellID+name+v5[e]).innerText = array[e];}
                document.getElementById(cellID+name+0).innerHTML = '<strong>'+array[2]+'</strong>';
                break;
            case 6:
                let v6 = [1,2,3,6,7,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v6.length; e++) {document.getElementById(cellID+name+v6[e]).innerText = array[e];}
                break;
            case 7:
                let v7 = [1,2,3,0,6,7,8];
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                for(let e=0; e<v7.length; e++) {document.getElementById(cellID+name+v7[e]).innerText = array[e];}
                document.getElementById(cellID+name+0).innerHTML = '<strong>'+array[3]+'</strong>';
                break;
            case 8:
                document.getElementById(cellID+name+0).innerText = '';
                for(let e=1; e<9; e++) {document.getElementById(cellID+name+e).innerText = array[e-1];}
                break;
            default: // for more than 8
                for(let e=0; e<9; e++) {document.getElementById(cellID+name+e).innerText = '';}
                document.getElementById(cellID+name+1).innerText = array[0];
                document.getElementById(cellID+name+3).innerText = '.';
                document.getElementById(cellID+name+0).innerHTML = '<strong>.</strong>';
                document.getElementById(cellID+name+6).innerText = '.';
                document.getElementById(cellID+name+8).innerText = array[array.length-1];
                break;
        }
    }
    
}
/**
 * 
 * @returns [-1 name doesn't start with a letter | -2 name has empty space | -3 name contains symbol | -4 if name equals operator]
 */
function validateCell(id, type, value) {
    function arrayIncludesChar(word, array) {
        for(let e=0; e<array.length; e++) {
            if (array[e]===word) {return true;}
        }
        return false;
    }

    const operators = ['nand', 'and', 'xnor', 'xor', 'nor', 'or', 'not'];
    switch(type) {
        case 'names':
            if(String(value).charAt(0).match(/[A-Za-z]/gu)===null) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-1, value:value});
                return -1;
            }
            else if(String(value).includes(' ')) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-2, value:value});
                return -2;
            }
            else if(String(value).match(/\W/gu)!==null) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-3, value:value});
                return -3;
            }
            else if(operators.includes(value)) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-4, value:value});
                return -4;
            }
            else {
                document.getElementById(id).className = ""; return 1;
            }
        case 'formula':
            // 1) check if more brakets are opened than closed or vice versa
            const nOpenBrkt = String(value).match(/\(/g)===null? 0:String(value).match(/\(/g).length;
            const nClosBrkt = String(value).match(/\)/g)===null? 0:String(value).match(/\)/g).length;
            if(nOpenBrkt>nClosBrkt) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-11, value:nOpenBrkt-nClosBrkt});
                return -11;
            }
            else if(nOpenBrkt<nClosBrkt) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-12, value:nClosBrkt-nOpenBrkt});
                return -12;
            }
            else {
                document.getElementById(id).className = "";
            }
            // 2) check if not specified values are used (remove brackets, remove in/outputs, remove empty spaces, divide then check)
            let names = value.replaceAll('(',' ').replaceAll(')',' ').split(' ').filter(e => e);
            const inputs = document.getElementById(id.replace('formula','inputs')).value.split(',');
            const outputs = document.getElementById(id.replace('formula','outputs')).value.split(',');
            for(let c=0; c<names.length; c++) {
                if(arrayIncludesChar(names[c],inputs)) {names.splice(c,1); c--;}
                else if(arrayIncludesChar(names[c],outputs)) {names.splice(c,1); c--;}
                else if(arrayIncludesChar(names[c],operators)) {names.splice(c,1); c--;}
            }
            names = names.filter(e => e);
            if(names.length===0) {
                document.getElementById(id).className = "";
            }
            else {
                for(let e=0; e<names.length; e++) {
                    document.getElementById(id).className = "error";
                    vscode.postMessage({command:'invalidValue', error:-13, value:names[e]});
                }
                return -13;
            }
            // 3) check if symbols are used
            if(value.match(/[^()A-Za-z0-9_ ]/g)!==null) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-14, value:value.match(/[^()A-Za-z0-9_ ]/g)});
                return -14;
            }
            else {
                document.getElementById(id).className = "";
            }
            // remove 'not' and check if operators occur more than once in row
            let allVals = String(String(value.match(/[^()]/g)).match(/[A-Za-z0-9_ ]/g)).replaceAll(',','').replaceAll('not','').split(' ').filter(e => e);
            for(let e=0; e<allVals.length-1; e++) {
                if(allVals[e]===allVals[e+1]) {
                    document.getElementById(id).className = "error";
                    vscode.postMessage({command:'invalidValue', error:-15, value:allVals[e]});
                    return -15;
                }
                else {
                    document.getElementById(id).className = "";
                }
            }
            // check if formula ends with an operator
            allVals = String(String(value.match(/[^()]/g)).match(/[A-Za-z0-9_ ]/g)).replaceAll(',','').split(' ').filter(e => e);
            if(String(operators).indexOf(allVals[allVals.length-1])!==-1) {
                document.getElementById(id).className = "error";
                vscode.postMessage({command:'invalidValue', error:-16, value:allVals[allVals.length-1]});
                return -16;
            }
            else {
                document.getElementById(id).className = "";
            }
            return 1;
        default:
            return 1;
    }
}
function probesChanged(myID, myVAL) {
    if(myVAL.trim()==='') {
        document.getElementById(myID).className = "error"; addError('Empty value for '+myID);
        vscode.postMessage({command:'wireProbesInvalid',text:`Please choose 'all' probes or specify a positive integer number!`});
    }
    else if(myVAL==='all' || Number(myVAL)===0) {
        document.getElementById(myID+'_hint').style['display'] = 'none';
        document.getElementById(myID).className = "";
        removeError('Empty value for '+myID);
        removeError('Invalid value for '+myID);
        removeError('Value of '+myID+' can not be a float number');
        const children = document.getElementById(myID+'_list').children.length;
        for(let c=1; c<=Number(children); c++) {document.getElementById(myID+'_list_'+c).remove();}
    }
    else if(!isNaN(myVAL) && String(myVAL).includes('.')) {
        document.getElementById(myID).className = "error"; addError('Value of '+myID+' can not be a float number');
        vscode.postMessage({command:'wireProbesInvalid',text:'The number of probes can not be a float number!'});
    }
    else if(!isNaN(myVAL) && Number(myVAL)>0) {
        document.getElementById(myID+'_hint').style['display'] = 'block';
        document.getElementById(myID).className = "";
        removeError('Empty value for '+myID);
        removeError('Invalid value for '+myID);
        removeError('Value of '+myID+' can not be a float number');
        const children = document.getElementById(myID+'_list').children.length;
        for(let c=Number(myVAL)+1; c<=Number(children); c++) {removeError('Invalid name for wire '+myID+'_list_'+c+'_value'); document.getElementById(myID+'_list_'+c).remove();}
        for(let c=Number(children)+1; c<=Number(myVAL); c++) {
            const newprobe = document.createElement('div');
            newprobe.id = myID+'_list_'+c;
            newprobe.style = 'display:block; margin:4px 0px; overflow:hidden;';
            newprobe.innerHTML = `<label style="float:left; width:4%; margin:3px">${c}.</label>
            <input type="text" id="${myID}_list_${c}_value" list="wires_list" style="float:left; width:50%; height:20px; margin:0px 2px;" onchange="probeNameChanged(this.id, this.value)">
            <input type="text" id="${myID}_list_${c}_hint" value="Hint" style="float:left; width:17.5%; height:20px; margin:0px 2px;" readonly>
            <input id="${myID}_list_${c}_vector" type="checkbox" style="float:left; width:2%;" disabled onclick="probeFullVector(this.id)">
            <label for="${myID}_list_${c}_vector" style="float:left; margin:2px;">Full Vector</label>
            <input id="${myID}_list_${c}_glitch" type="checkbox" style="float:left; width:2%;">
            <label for="${myID}_list_${c}_glitch" style="float:left; margin:2px;">Glitch Extended</label>`;
            document.getElementById(myID+'_list').appendChild(newprobe);
        }
    }
    else {
        document.getElementById(myID).className = "error"; addError('Invalid value for '+myID);
        vscode.postMessage({command:'wireProbesInvalid',text:'Please specify a positive integer number of probes or specify them all!'});
    }
}
function probeNameChanged(myID, myVAL) {
    const list = document.getElementById('wires_list').children;
    let ready2continue = false;
    for(let w=0; w<Number(list.length); w++) {if(myVAL===list[w].innerText) {ready2continue=true; break;}}
    if(!ready2continue) {
        document.getElementById(myID).className = "error"; addError('Invalid name for wire '+myID);
        vscode.postMessage({command:'wireProbesInvalid', text:'The specified wire name is not included in the design file!'});
    }
    else {
        document.getElementById(myID).className = ""; removeError('Invalid name for wire '+myID);
        vscode.postMessage({command:'checkWireHint', id:myID, val:myVAL});
    }
}
function probeFullVector(myID) {
    const isChecked = document.getElementById(myID).checked;
    const oldval = String(document.getElementById(myID.replace('_vector','_value')).value);

    if(isChecked && oldval.includes('[') && !oldval.includes(']')) {return -1;}
    else if(isChecked && !oldval.includes('[') && oldval.includes(']')) {return -1;}
    else if(isChecked && oldval.includes('[') && oldval.includes(']')) {
        const newval = oldval.substring(0,oldval.indexOf('['));
        document.getElementById(myID.replace('_vector','_value')).value = `${newval}`;
        document.getElementById(myID.replace('_vector','_value')).className=""; removeError('probeNameChanged_'+myID);
    }
    else if(!isChecked) {
        document.getElementById(myID.replace('_vector','_value')).value = `${oldval}[0]`;
        document.getElementById(myID.replace('_vector','_value')).className=""; removeError('probeNameChanged_'+myID);
    }
}
function checkTestClockCycleBit(myID, myVAL) {
    const min = document.getElementById(myID).min;
    const max = document.getElementById(myID).max;

    if(myVAL==='') {
        document.getElementById(myID).className = "";
    }
    else if(String(myVAL).includes('.')) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'valueMustBeInteger', name:'Test Clock Cycle '+myID.split('_')[5].charAt(0).toUpperCase()+myID.split('_')[5].substring(1), val:myVAL});
    }
    else if(Number(myVAL)<Number(min)) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'testClockCycleMin', name:'Test Clock Cycle '+myID.split('_')[5].charAt(0).toUpperCase()+myID.split('_')[5].substring(1), val:myVAL, min:min, max:max});
    }
    else if(Number(myVAL)>Number(max)) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'testClockCycleMax', name:'Test Clock Cycle '+myID.split('_')[5].charAt(0).toUpperCase()+myID.split('_')[5].substring(1), val:myVAL, min:min, max:max});
    }
    else if(Number(myVAL)>=Number(min) && Number(myVAL)<=Number(max)) {
        document.getElementById(myID).className = "";
    }
}
function addTestClockCycle() {
    const tccBegin = document.getElementById('no_of_test_clock_cycles_begin').value;
    const tccEnd = document.getElementById('no_of_test_clock_cycles_end').value;
    const min = document.getElementById('no_of_test_clock_cycles_begin').min;
    const max = document.getElementById('no_of_test_clock_cycles_begin').max;
    const children = document.getElementById('test_clock_cycles_list').children;

    if(tccBegin==='') {
        vscode.postMessage({command:'testClockCycleEmpty'});
        return -1;
    }
    else if(tccEnd==='') {
        vscode.postMessage({command:'testClockCycleEmpty'});
        return -1;
    }
    else if(Number(tccBegin)<Number(min) || Number(tccBegin)>Number(max)) {
        return -1;
    }
    else if(Number(tccEnd)<Number(min) || Number(tccEnd)>Number(max)) {
        return -1;
    }
    else if(Number(tccBegin)>Number(tccEnd)) {
        document.getElementById('no_of_test_clock_cycles_begin').className = "error";
        document.getElementById('no_of_test_clock_cycles_end').className = "error";
        vscode.postMessage({command:'testClockCycleB>E'});
        return -1;
    }
    else if(Number(tccBegin)<=Number(tccEnd)) {
        document.getElementById('no_of_test_clock_cycles_begin').className = "";
        document.getElementById('no_of_test_clock_cycles_end').className = "";
    }

    const newval = Number(tccBegin)===Number(tccEnd)? tccBegin:`${tccBegin}-${tccEnd}`;
    for(let c=0; c<Number(children.length); c++) {
        const existingCC = children[c].innerText.split(/\r?\n/)[0];
        if(existingCC.includes('-') && Number(tccBegin)<Number(existingCC.split('-')[0]) && Number(tccEnd)<Number(existingCC.split('-')[0])) {}
        else if(existingCC.includes('-') && Number(tccBegin)>Number(existingCC.split('-')[1]) && Number(tccEnd)>Number(existingCC.split('-')[1])) {}
        else if(existingCC.includes('-')) {
            vscode.postMessage({command:'testClockCycleOverlaps', name:newval, existing:existingCC});
            return -1;
        }
        else if(!existingCC.includes('-') && Number(tccBegin)<Number(existingCC) && Number(tccEnd)<Number(existingCC)) {}
        else if(!existingCC.includes('-') && Number(tccBegin)>Number(existingCC) && Number(tccEnd)>Number(existingCC)) {}
        else if(!existingCC.includes('-')) {
            vscode.postMessage({command:'testClockCycleOverlaps', name:newval, existing:existingCC});
            return -1;
        }
    }

    let newid = 1;
    while(document.getElementById('test_clock_cycles_list_'+newid)!==null) {newid++;}

    const newCC = document.createElement('div');
    newCC.id = 'test_clock_cycles_list_'+newid;
    newCC.style = "max-width:860px; margin:0 auto;";
    newCC.innerHTML = `<div style="background:#303030; margin-bottom:3px; width:92.5%; float:left;">${newval}</div>
    <button name="test_clock_cycles_list_${newid}" class="delete-button" style="display:inline; width:7%; height:14px; padding:0px 0px 0px 0px; float:right; margin-bottom:4px;" onclick="deleteTestClockCycle(this.name)">delete</button>`;
    document.getElementById('test_clock_cycles_list').appendChild(newCC);

    if(ready2save.length===0) {save();}
}
function deleteTestClockCycle(myID) {
    document.getElementById(myID).remove();
    if(ready2save.length===0) {save();}
}
function focusCSN() {
    lastCSNname = document.getElementById('clock_signal_name').selectedIndex;
    lastCSNbit = document.getElementById('clock_signal_name_bit').value;
}
function inputSignalNamesCSN(myID,newbitval) {
    vscode.postMessage({command:'inputSignalNamesCSN', value:document.getElementById(myID).value, id:myID, bit:newbitval});
}
function inputSignalNamesARI(myID) {
    vscode.postMessage({command:'inputSignalNamesARI', value:document.getElementById(myID).value, id:myID});
}
function checkBitField(myID) {
    const myMIN = Number(document.getElementById(myID).min);
    const myMAX = Number(document.getElementById(myID).max);
    const myVAL = Number(document.getElementById(myID).value);

    if(document.getElementById('clock_signal_name_bit').value==="") {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'emptyBitField', id:myID});
        addError('checkBitField_'+myID); return -1;
    }
    else if(document.getElementById('always_random_inputs_lsb').value==="") {
        document.getElementById(myID).className = "";
        removeError('checkBitField_'+myID);
    }
    else if(document.getElementById('always_random_inputs_msb').value==="") {
        document.getElementById(myID).className = "";
        removeError('checkBitField_'+myID);
    }
    else if(myVAL>myMAX || myVAL<myMIN) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'invalidBitField', val:myVAL, min:myMIN, max:myMAX});
        addError('checkBitField_'+myID); return -1;
    }
    else {
        document.getElementById(myID).className = "";
        removeError('checkBitField_'+myID);
    }

    switch(myID) {
        case 'clock_signal_name_bit':
            const currentCSN = document.getElementById('clock_signal_name').value;
            const children = document.getElementById('always_random_inputs_list').childNodes;
            for(let c=0; c<children.length; c++) {
                const signal = String(children[c].innerText).split(/\r?\n/)[0].split(' ');
                const ariMSB = signal[0].substring(signal[0].indexOf('[')+1,signal[0].indexOf(':'));
                const ariLSB = signal[0].substring(signal[0].indexOf(':')+1,signal[0].indexOf(']'));
                if(signal.length===2 && signal[1]===currentCSN && myVAL>=ariLSB && myVAL<=ariMSB) {
                    document.getElementById(myID).className = "error";
                    vscode.postMessage({command:'clockSignalUsedAsARI',name:`${signal[1]}[${myVAL}]`});
                    addError('checkBitFieldOverlap_'+myID); return -1;
                }
                else {removeError('checkBitFieldOverlap_'+myID);}
            }
            if(ready2save.length===0) {save();}
            break;
        case 'always_random_inputs_lsb':
            break;
    }
}
function addRandomInputs() {
    // check if random input already exists
    const currentMSB = document.getElementById('always_random_inputs_msb').value;
    const currentLSB = document.getElementById('always_random_inputs_lsb').value;
    const currentMIN = document.getElementById('always_random_inputs_lsb').min;
    const currentMAX = document.getElementById('always_random_inputs_msb').max;
    const currentNr = document.getElementById('always_random_inputs_list').childElementCount;
    const children = document.getElementById('always_random_inputs_list').childNodes;
    const currentVAL = document.getElementById('always_random_inputs').value;
    const clockSignalName = document.getElementById('clock_signal_name').value;
    const clockSignalBit = document.getElementById('clock_signal_name_bit').value===''? '0':document.getElementById('clock_signal_name_bit').value;
    const isClockSignalVector = document.getElementById('clock_signal_name_bit').min !== '';
    let newid;
    for(let i=0; i<=currentNr; i++) {
        if(document.getElementById(`always_random_inputs_list_${i}`)===null) {
            newid=i; break;
        }
    }

    let newname = ``;
    if(currentMIN==='' || currentMAX==='') {newname = currentVAL;}
    else if(currentLSB<currentMIN && currentLSB!=='' && currentMIN!=='') {return -1;}
    else if(currentMSB>currentMAX && currentMSB!=='' && currentMAX!=='') {return -1;}
    else if(currentLSB>currentMSB && currentLSB!=='' && currentMSB!=='') {
        document.getElementById('always_random_inputs_lsb').className = "error";
        document.getElementById('always_random_inputs_msb').className = "error";
        vscode.postMessage({command:'LSBgreaterMSB',msb:currentMSB,lsb:currentLSB});
        return -1;
    }
    else {
        document.getElementById('always_random_inputs_lsb').className = "";
        document.getElementById('always_random_inputs_msb').className = "";
        newname = `[${currentMSB===''?'0':currentMSB}:${currentLSB===''?'0':currentLSB}] ${currentVAL}`;
    }

    // checking if the random input is already added
    for(let i=0; i<children.length; i++) {
        if(String(children[i].innerText).includes(newname)) {
            vscode.postMessage({command:'randomInputsExists',name:newname}); return -1;
        }
        else if(newname.split(' ').length===2 && String(children[i].innerText).includes(newname.split(' ')[1])) {
            const range = String(children[i].innerText).split(' ')[0];
            const addedMSB = range.substring(range.indexOf('[')+1,range.indexOf(':'));
            const addedLSB = range.substring(range.indexOf(':')+1,range.indexOf(']'));
            if(currentLSB<addedLSB && currentMSB<addedLSB) {}
            else if(currentLSB>addedMSB && currentMSB>addedMSB) {}
            else {vscode.postMessage({command:'randomInputsOverlaps',name:newname,existing:`[${addedMSB}:${addedLSB}] ${newname.split(' ')[1]}`}); return -1;}
        }
    }

    // checking if the random input is already used for clock signal name
    if(isClockSignalVector && currentVAL===clockSignalName && clockSignalBit>=currentLSB && clockSignalBit<=currentMSB) {
        vscode.postMessage({command:'clockSignalAlreadyUsed',name:clockSignalName, bit:clockSignalBit, vector:true}); return -1;
    }
    else if(!isClockSignalVector && currentVAL===clockSignalName) {
        vscode.postMessage({command:'clockSignalAlreadyUsed',name:clockSignalName, vector:false}); return -1;
    }

    const newRndmInpt = document.createElement('div');
    newRndmInpt.id = `always_random_inputs_list_${newid}`;
    newRndmInpt.style = 'max-width:860px; margin:0 auto;';
    newRndmInpt.innerHTML = `<div style="background: #303030; margin-bottom:3px; width:92.5%; float:left;">${newname}</div>
    <button name="always_random_inputs_list_${newid}" class="delete-button" style="display:inline; width:7%; height:14px; padding:0px 0px 0px 0px; float:right; margin-bottom:4px;" onclick="deleteRandomInput(this.name)">delete</button>`;
    document.getElementById('always_random_inputs_list').appendChild(newRndmInpt);
    if(ready2save.length===0) {save();}
}
function deleteRandomInput(myID) {
    document.getElementById(myID).remove();
    if(ready2save.length===0) {save();}
}
function endConditionChoiceChanged() {
    const endConditionChoice = document.querySelector('input[name="endCondition"]:checked').value;
    if(endConditionChoice==='end_condition_choice_tim') {
        // enable the following
        document.getElementById('end_condition_time_value').readOnly = false;
        // disable the following
        document.getElementById('end_condition_signal_value').readOnly = true;
        document.getElementById('end_condition_signal_system').disabled = true;
        document.getElementById('end_condition_signal_lsb').readOnly = true;
        document.getElementById('end_condition_signal_msb').readOnly = true;
        document.getElementById('end_condition_signal_output').disabled = true;
        // reset red frame
        document.getElementById('end_condition_signal_value').className = "";
        document.getElementById('end_condition_signal_lsb').className = "";
        document.getElementById('end_condition_signal_msb').className = "";
        endConditionTimeChanged();
    }
    else if(endConditionChoice==='end_condition_choice_sig') {
        // disable the following
        document.getElementById('end_condition_time_value').readOnly = true;
        // enable the following
        document.getElementById('end_condition_signal_value').readOnly = false;
        document.getElementById('end_condition_signal_system').disabled = false;
        document.getElementById('end_condition_signal_lsb').readOnly = false;
        document.getElementById('end_condition_signal_msb').readOnly = false;
        document.getElementById('end_condition_signal_output').disabled = false;
        vscode.postMessage({command:'checkEndConditionIfVector',index:document.getElementById('end_condition_signal_output').selectedIndex});
        // reset red frame
        document.getElementById('end_condition_time_value').className = "";
        endConditionValueChanged();
        endConditionBitChanged('end_condition_signal_lsb');
        endConditionBitChanged('end_condition_signal_msb');
    }
}
function endConditionTimeChanged() {
    const val = document.getElementById('end_condition_time_value').value;
    const min = document.getElementById('end_condition_time_value').min;
    const max = document.getElementById('max_clock_cycle').value;

    if(val==='') {
        document.getElementById('end_condition_time_value').className = "error";
        vscode.postMessage({command:'endConditionTimeValueEmpty'});
        addError('endConditionTimeChanged'); return -1;
    }
    else if(String(val).includes('.')) {
        document.getElementById('end_condition_time_value').className = "error";
        vscode.postMessage({command:'valueMustBeInteger', name:'End Condition Time Signal'});
        addError('endConditionTimeChanged'); return -1;
    }
    else if(Number(val)<Number(min)) {
        document.getElementById('end_condition_time_value').className = "error";
        vscode.postMessage({command:'endConditionTimeValueMin', val:val, min:min});
        addError('endConditionTimeChanged'); return -1;
    }
    else if(Number(val)>Number(max)) {
        document.getElementById('end_condition_time_value').className = "error";
        vscode.postMessage({command:'checkIntegerMaxInvalid', name:'End Condition Time Signal', val:val, max:max});
        addError('endConditionTimeChanged'); return -1;
    }
    else if(Number(val)>=Number(min) || Number(val)<=Number(max)) {
        document.getElementById('end_condition_time_value').className = "";
        removeError('endConditionTimeChanged');
        if(ready2save.length===0) {save();}
    }
}
function endConditionOutputChanged() {
    vscode.postMessage({command:'endConditionOutputChanged',index:document.getElementById('end_condition_signal_output').selectedIndex});
}
function endConditionBitChanged(myID) {
    const min = document.getElementById(myID).min;
    const max = document.getElementById(myID).max;
    const val = document.getElementById(myID).value;
    if(val==='') {
        document.getElementById(myID).className = "";
        addError('endConditionBitChangedRange');
    }
    else if(String(val).includes('.')) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'valueMustBeInteger', name:'LSB of the end condition signal'});
        addError('endConditionBitChangedRange'); return -1;
    }
    else if(Number(val)<Number(min)) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'endConditionSignalBit2Low', name:myID.split('_')[3].toUpperCase(), value:val, min:min, max:max});
        addError('endConditionBitChangedRange'); return -1;
    }
    else if(Number(val)>Number(max)) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'endConditionSignalBit2High', name:myID.split('_')[3].toUpperCase(), value:val, min:min, max:max});
        addError('endConditionBitChangedRange'); return -1;
    }
    else if(Number(val)>=Number(min) && Number(val)<=Number(max)) {
        document.getElementById(myID).className = "";
        removeError('endConditionBitChangedRange');
    }

    const lsb = document.getElementById('end_condition_signal_lsb').value;
    const msb = document.getElementById('end_condition_signal_msb').value;
    const len = Number(msb)-Number(lsb)+1;
    const old = document.getElementById('end_condition_signal_value').value;
    const sys = document.getElementById('end_condition_signal_system').value;
    if(lsb==='' || msb==='') {
        document.getElementById('end_condition_signal_lsb').className = "";
        document.getElementById('end_condition_signal_msb').className = "";
        addError('endConditionBitChangedSystem');
    }
    else if(Number(lsb)>Number(msb)) {
        document.getElementById('end_condition_signal_lsb').className = "error";
        document.getElementById('end_condition_signal_msb').className = "error";
        vscode.postMessage({command:'endConditionSignalLSB>MSB', msb:msb, lsb:lsb});
        addError('endConditionBitChangedSystem'); return -1;
    }
    else if(sys==='bin') {
        document.getElementById('end_condition_signal_lsb').className = "";
        document.getElementById('end_condition_signal_msb').className = "";
        document.getElementById('end_condition_signal_value').setAttribute('maxlength',len);
        if(len>=old.length) {document.getElementById('end_condition_signal_value').value = '0'.repeat(Number(len)-Number(old.length)) + old;}
        else {document.getElementById('end_condition_signal_value').value = old.substring(0,len);}
        removeError('endConditionBitChangedSystem');
    }
    else if(sys==='hex' && len%4===0) {
        document.getElementById('end_condition_signal_lsb').className = "";
        document.getElementById('end_condition_signal_msb').className = "";
        document.getElementById('end_condition_signal_value').setAttribute('maxlength',len/4);
        if((len/4)>=old.length) {document.getElementById('end_condition_signal_value').value = '0'.repeat(Number(len/4)-Number(old.length)) + document.getElementById('end_condition_signal_value').value;}
        else {document.getElementById('end_condition_signal_value').value = old.substring(0,len/4);}
        removeError('endConditionBitChangedSystem');
    }
    else if(sys==='hex' && len%4!==0) {
        const newval = parseInt(document.getElementById('end_condition_signal_value').value,16).toString(2);
        document.getElementById('end_condition_signal_lsb').className = "";
        document.getElementById('end_condition_signal_msb').className = "";
        document.getElementById('end_condition_signal_system').selectedIndex = 0;
        document.getElementById('end_condition_signal_value').setAttribute('maxlength',len);
        document.getElementById('end_condition_signal_value').value = newval;
        if(len>=newval.length) {document.getElementById('end_condition_signal_value').value = '0'.repeat(Number(len)-Number(newval.length)) + newval;}
        else {document.getElementById('end_condition_signal_value').value = newval.substring(0,len);}
        removeError('endConditionBitChangedSystem');
    }
}
function endConditionNrSystemChanged() {
    const oldval = document.getElementById('end_condition_signal_value').value;
    const newsys = document.getElementById('end_condition_signal_system').value;
    const newlen = Number(document.getElementById('end_condition_signal_msb').value) - Number(document.getElementById('end_condition_signal_lsb').value) + 1;

    if(newsys==='bin') {
        document.getElementById('end_condition_signal_value').setAttribute('maxlength',newlen);
        document.getElementById('end_condition_signal_value').value = parseInt(oldval,16).toString(2);
        if(ready2save.length===0) {save();}
    }
    else if(newsys==='hex' && newlen%4===0) {
        document.getElementById('end_condition_signal_value').setAttribute('maxlength',newlen/4);
        document.getElementById('end_condition_signal_value').value = parseInt(oldval,2).toString(16).toUpperCase();
        if(ready2save.length===0) {save();}
    }
    else if(newsys==='hex' && newlen%4!==0) {
        document.getElementById('end_condition_signal_system').selectedIndex = 0;
        document.getElementById('end_condition_signal_value').setAttribute('maxlength',newlen);
    }
}
function endConditionValueChanged() {
    const msb = document.getElementById('end_condition_signal_msb').value;
    const lsb = document.getElementById('end_condition_signal_lsb').value;
    const len = Number(msb) - Number(lsb) + 1;
    const isVector = document.getElementById('end_condition_signal_msb').min!=='';
    const sys = document.getElementById('end_condition_signal_system').value;
    const val = document.getElementById('end_condition_signal_value').value;
    const matchHEX = val.match(/[^A-Fa-f0-9]/g);
    const matchBIN = val.match(/[^0-1]/g);

    if(isVector) {
        if(msb.trim()==='') {
            document.getElementById('end_condition_signal_value').className = "";
            document.getElementById('end_condition_signal_msb').className = "error";
            vscode.postMessage({command:'endConditionSignalNoMSB'});
            addError('endConditionValueChangedVector'); return -1;
        }
        else if(lsb.trim()==='') {
            document.getElementById('end_condition_signal_value').className = "";
            document.getElementById('end_condition_signal_lsb').className = "error";
            vscode.postMessage({command:'endConditionSignalNoLSB'});
            addError('endConditionValueChangedVector'); return -1;
        }
        else {
            removeError('endConditionValueChangedVector');
        }
        if(sys==='hex' && matchHEX!==null) {
            document.getElementById('end_condition_signal_value').className = "error";
            vscode.postMessage({command:'endConditionValueInvalid', chars:String(matchHEX), sys:'hex'});
            addError('endConditionValueChangedHex'); return -1;
        }
        else {
            removeError('endConditionValueChangedHex');
        }
    }

    if(sys==='bin' && matchBIN!==null) {
        document.getElementById('end_condition_signal_value').className = "error";
        vscode.postMessage({command:'endConditionValueInvalid', chars:String(matchBIN), sys:'bin'});
        addError('endConditionValueChangedBin'); return -1;
    }
    else {
        document.getElementById('end_condition_signal_value').className = "";
        removeError('endConditionValueChangedBin');
    }

    if(val!=='' && ready2save.length===0) {save();}
}
function numberOfGroupsInputChanged(myID) {
    const min = Number(document.getElementById(myID).min);
    const max = Number(document.getElementById(myID).max);
    const val = Number(document.getElementById(myID).value);

    if(val<min) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'numberOfGroupsInvalid', min:min, max:max, id:myID});
        addError('numberOfGroupsInvalid'); return -1;
    }
    else if(val>max) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'numberOfGroupsInvalid', min:min, max:max, id:myID});
        addError('numberOfGroupsInvalid'); return -1;
    }
    else if(val>=min && val<=max) {
        document.getElementById(myID).className = "";
        removeError('numberOfGroupsInvalid');
    }

    // if id includes size update maxlength of all children nodes
    if(myID === 'number_of_groups_size') {
        let g=1;
        while(document.getElementById('number_of_groups_list_'+g)!==null) {
            const sys = document.getElementById('number_of_groups_list_'+g+'_sys').value;
            const len = Number(document.getElementById('number_of_groups_list_'+g+'_val').value.length);

            if(sys==='bin') {
                document.getElementById('number_of_groups_list_'+g+'_val').setAttribute('maxlength',val);
                document.getElementById('number_of_groups_list_'+g+'_out').setAttribute('maxlength',val);
                if(len>=val) {
                    document.getElementById('number_of_groups_list_'+g+'_val').value = document.getElementById('number_of_groups_list_'+g+'_val').value.substring(0,val);
                    document.getElementById('number_of_groups_list_'+g+'_out').value = document.getElementById('number_of_groups_list_'+g+'_out').value.substring(0,val);
                }
                else {
                    document.getElementById('number_of_groups_list_'+g+'_val').value = '0'.repeat(val-len) + document.getElementById('number_of_groups_list_'+g+'_val').value;
                    document.getElementById('number_of_groups_list_'+g+'_out').value = '0'.repeat(val-len) + document.getElementById('number_of_groups_list_'+g+'_out').value;
                }
                g++;
            }
            else if(sys==='hex' && val%4===0) {
                document.getElementById('number_of_groups_list_'+g+'_val').setAttribute('maxlength',val/4);
                document.getElementById('number_of_groups_list_'+g+'_out').setAttribute('maxlength',val/4);
                if(len>=(val/4)) {
                    document.getElementById('number_of_groups_list_'+g+'_val').value = document.getElementById('number_of_groups_list_'+g+'_val').value.substring(0,val/4);
                    document.getElementById('number_of_groups_list_'+g+'_out').value = document.getElementById('number_of_groups_list_'+g+'_out').value.substring(0,val/4);
                }
                else {
                    document.getElementById('number_of_groups_list_'+g+'_val').value = '0'.repeat((val/4)-len) + document.getElementById('number_of_groups_list_'+g+'_val').value;
                    document.getElementById('number_of_groups_list_'+g+'_out').value = '0'.repeat((val/4)-len) + document.getElementById('number_of_groups_list_'+g+'_out').value;
                }
                g++;
            }
            else if(sys==='hex' && val%4!==0) {
                document.getElementById('number_of_groups_list_'+g+'_sys').selectedIndex = 0;
                groupNrSystemChanged('number_of_groups_list_'+g+'_sys','bin');
                document.getElementById('number_of_groups_list_'+g+'_val').setAttribute('maxlength',val);
                document.getElementById('number_of_groups_list_'+g+'_out').setAttribute('maxlength',val);
                if((len*4)>=val) {
                    document.getElementById('number_of_groups_list_'+g+'_val').value = document.getElementById('number_of_groups_list_'+g+'_val').value.substring(0,val);
                    document.getElementById('number_of_groups_list_'+g+'_out').value = document.getElementById('number_of_groups_list_'+g+'_out').value.substring(0,val);
                }
                else {
                    document.getElementById('number_of_groups_list_'+g+'_val').value = '0'.repeat(val-(len*4)) + document.getElementById('number_of_groups_list_'+g+'_val').value;
                    document.getElementById('number_of_groups_list_'+g+'_out').value = '0'.repeat(val-(len*4)) + document.getElementById('number_of_groups_list_'+g+'_out').value;
                }
                g++;
            }
        }

        const allStates = document.getElementById('initial_clock_cycles_list').children;
        for(let s=0; s<allStates.length; s++) {
            const stateName = document.getElementById(allStates[s].id+'_name').innerText.replace(':','');
            const allSignals = document.getElementById(document.getElementById(allStates[s].id).children[2].id).children;
            for(let c=0; c<allSignals.length; c++) {
                const signalName = document.getElementById(allSignals[c].id+'_label').innerText.replace(':','');
                const shareLEN = Number(document.getElementById(allSignals[c].id+'_sigmsb').value)-Number(document.getElementById(allSignals[c].id+'_siglsb').value)+1;
                const shareMSB = document.getElementById(allSignals[c].id+'_sharemsb');
                const shareLSB = document.getElementById(allSignals[c].id+'_sharelsb');
                const newMAX = val-1;
                const shareMSBvalue = Number(shareMSB.value);
                const shareLSBvalue = Number(shareLSB.value);
                shareMSB.max = newMAX; shareMSB.min = newMAX-shareLEN; shareLSB.max = newMAX-shareLEN;
                if(shareMSBvalue>shareMSB.max) {
                    vscode.postMessage({command:'newShareSizeInvalid', state:stateName, signal:signalName, bit:'MSB'});
                    addError('newShareMSBSizeInvalid');
                }
                else {
                    removeError('newShareMSBSizeInvalid');
                }
                if(shareLSBvalue>shareLSB.max) {
                    vscode.postMessage({command:'newShareSizeInvalid', state:stateName, signal:signalName, bit:'LSB'});
                    addError('newShareLSBSizeInvalid');
                }
                else {
                    removeError('newShareLSBSizeInvalid');
                }
            }
        }
    }
    else if(myID === 'number_of_groups_number') {
        const nr = Number(document.getElementById('number_of_groups_number').value);
        const sz = Number(document.getElementById('number_of_groups_size').value);
        const ex = document.getElementById('number_of_groups_list').childElementCount;

        for(let g=ex+1; g<=nr; g++) {
            const groupDiv = document.createElement('div');
            groupDiv.id = `number_of_groups_list_${g}`;
            groupDiv.innerHTML = `<label for="${groupDiv.id}_val" style="float:left; width:65px; margin:2px 4px;">Group ${g}:</label>
            <select id="${groupDiv.id}_sys" style="display:inline; float:left; color:#cccccc; background-color:#3c3c3c; width:5%; height:20px; margin:0px 4px;" onchange="groupNrSystemChanged(this.id, this.value)">
                <option name="bin" selected>bin</option>
                <option name="hex">hex</option>
            </select>
            <input type="text" maxlength="${sz}" value="`.concat('0'.repeat(sz)) + `" id="${groupDiv.id}_val" style="display:inline; float:left;width: 27.6%; height:20px; margin:0px 0px 4px 0px; padding:0px;" onchange="groupValueChanged(this.id)">
            <button class="action-button" style="display:inline; float:left; width:2%; height:18px; margin:1px 3px 5px 6px; padding:0px;" onclick="fillGroup('${groupDiv.id}_val','0')">0</button>
            <button class="action-button" style="display:inline; float:left; width:2%; height:18px; margin:1px 3px 5px 3px; padding:0px;" onclick="fillGroup('${groupDiv.id}_val','1')">1</button>
            <button class="action-button" style="display:inline; float:left; width:2%; height:18px; margin:1px 3px 5px 3px; padding:0px;" onclick="fillGroup('${groupDiv.id}_val','$')">$</button>
            <label for="${groupDiv.id}_out" style="float:left; width:118px; margin:2px 4px;">Expected Output:</label>
            <input type="text" maxlength="${sz}" value="`.concat('0'.repeat(sz)) + `" id="${groupDiv.id}_out" style="display:inline; float:left; width:26.4%; height:20px; margin:0px 0px 4px 0px; padding:0px;" onchange="groupValueChanged(this.id)">
            <button class="action-button" style="display:inline; float:left; width:2%; height:18px; margin:1px 3px 5px 6px; padding:0px;" onclick="fillGroup('${groupDiv.id}_out','0')">0</button>
            <button class="action-button" style="display:inline; float:left; width:2%; height:18px; margin:1px 3px 5px 3px; padding:0px;" onclick="fillGroup('${groupDiv.id}_out','1')">1</button>
            <button class="action-button" style="display:inline; float:left; width:2%; height:18px; margin:1px 3px 5px 3px; padding:0px;" onclick="fillGroup('${groupDiv.id}_out','$')">$</button>`;
            document.getElementById('number_of_groups_list').appendChild(groupDiv);
        }
        for(let g=nr+1; g<=ex; g++) {
            document.getElementById(`number_of_groups_list_${g}`).remove();
        }
    }
}
function groupNrSystemChanged(groupID, newsys) {
    const sz = Number(document.getElementById('number_of_groups_size').value);
    const valBOX = document.getElementById(groupID.replace('_sys','_val'));
    const outBOX = document.getElementById(groupID.replace('_sys','_out'));
    let oldval = valBOX.value.trim()===''?0:valBOX.value;
    let oldout = outBOX.value.trim()===''?0:outBOX.value;

    if(newsys==='bin') {
        valBOX.value = ''; outBOX.value = '';

        for(let c=0; c<Number(oldval.length); c++) {
            if(oldval.charAt(c)==='$') {valBOX.value += '$$$$';}
            else {valBOX.value += '0'.repeat(4-String(parseInt(oldval.charAt(c),16).toString(2)).length) + String(parseInt(oldval.charAt(c),16).toString(2));}
        }
        for(let c=0; c<Number(oldout.length); c++) {
            if(oldout.charAt(c)==='$') {outBOX.value += '$$$$';}
            else {outBOX.value += '0'.repeat(4-String(parseInt(oldout.charAt(c),16).toString(2)).length) + String(parseInt(oldout.charAt(c),16).toString(2));}
        }

        const vallen = valBOX.value.length; const outlen = outBOX.value.length;
        if(oldval.match(/[^A-Fa-f0-9$]/g)!==null) {valBOX.value = '0'.repeat(sz); valBOX.className="";}
        else {valBOX.value = '0'.repeat(sz-vallen) + valBOX.value;}
        if(oldout.match(/[^A-Fa-f0-9$]/g)!==null) {outBOX.value = '0'.repeat(sz); outBOX.className="";}
        else {outBOX.value = '0'.repeat(sz-outlen) + outBOX.value;}
        valBOX.setAttribute('maxlength',sz); outBOX.setAttribute('maxlength',sz);
    }
    else if(newsys==='hex' && sz%4===0) {
        if(sz>oldval.length) {oldval = '0'.repeat(sz-oldval.length) + oldval;}
        else if(sz<oldval.length) {oldval = oldval.substring(0,sz);}
        if(sz>oldout.length) {oldout = '0'.repeat(sz-oldout.length) + oldout;}
        else if(sz<oldout.length) {oldout = oldout.substring(0,sz);}

        let newval=``, newout=``, d=0;
        while(d<(Number(oldval.length)/4) || d<(Number(oldout.length)/4)) {
            const crntval = oldval.substring(d*4,(d+1)*4);
            const crntout = oldout.substring(d*4,(d+1)*4);
            if(d<(Number(oldval.length)/4)) {
                if(crntval.match(/[$]/g)===null) {newval += parseInt(crntval,2).toString(16).toUpperCase();}
                else if(crntval.match(/[$]/g).length===4) {newval += '$';}
                else {vscode.postMessage({command:'groupSizeHexRandomInvalid', val:crntval}); document.getElementById(groupID).selectedIndex=0; return -1;}
            }
            if(d<(Number(oldout.length)/4)) {
                if(crntout.match(/[$]/g)===null) {newout += parseInt(crntout,2).toString(16).toUpperCase();}
                else if(crntout.match(/[$]/g).length===4) {newout += '$';}
                else {vscode.postMessage({command:'groupSizeHexRandomInvalid', val:crntout}); document.getElementById(groupID).selectedIndex=0; return -1;}
            }
            d++;
        }

        if(oldval.match(/[^0-1$]/g)!==null) {valBOX.value = '0'.repeat(sz/4); valBOX.className="";}
        else {valBOX.value = newval;}
        if(oldout.match(/[^0-1$]/g)!==null) {outBOX.value = '0'.repeat(sz/4); outBOX.className="";}
        else {outBOX.value = newout;}
        valBOX.setAttribute('maxlength',sz/4); outBOX.setAttribute('maxlength',sz/4);
    }
    else if(newsys==='hex' && sz%4!==0) {
        document.getElementById(groupID).selectedIndex = 0;
        valBOX.setAttribute('maxlength',sz);
        outBOX.setAttribute('maxlength',sz);
        vscode.postMessage({command:'groupSizeHexInvalid', size:sz});
    }
}
function groupValueChanged(groupID) {
    const sys = document.getElementById(groupID.substring(0,groupID.lastIndexOf('_'))+'_sys').value;
    const val = document.getElementById(groupID).value;
    const shares = document.getElementById('no_of_outputs_list').children.length;
    let charmatch;

    if(sys==='bin') {
        charmatch = val.trim().match(/[^0-1$]/g);
    }
    else if(sys==='hex') {
        charmatch = val.trim().match(/[^A-Fa-f0-9$]/g);
    }
    if(charmatch!==null) {
        vscode.postMessage({command:'groupValueInvalid', system:sys, group:String(groupID).split('_')[4], chars:String(charmatch)});
        document.getElementById(groupID).className = "error";
        addError('groupValueInvalid_'+groupID); return -1;
    }
    else {
        document.getElementById(groupID).className = "";
        removeError('groupValueInvalid_'+groupID);
    }
    if(groupID.includes('out') && String(document.getElementById(groupID).value).trim()==='' && shares>0) {
        document.getElementById(groupID).className = "error";
        vscode.postMessage({command:'emptyExpectedOutputAndSomeOutputShares'});
        addError('No expeceted output for '+groupID+' and Output Shares are not empty'); return -1;
    }
    else if(groupID.includes('out') && document.getElementById(groupID).value!=='' && shares>0) {
        document.getElementById(groupID).className = "";
        removeError('No expeceted output for '+groupID+' and Output Shares are not empty');
    }
}
function fillGroup(groupID, val) {
    const sz = Number(document.getElementById('number_of_groups_size').value);
    const sy = document.getElementById(groupID.substring(0,groupID.lastIndexOf('_'))+'_sys').value;

    if(sy==='bin') {
        removeError('fillGroup_'+groupID); document.getElementById('number_of_groups_size').className = "";
        document.getElementById(groupID).value = String(val).repeat(sz);
    }
    else if(sy==='hex' && sz%4===0 && val==='0') {
        removeError('fillGroup_'+groupID); document.getElementById('number_of_groups_size').className = "";
        document.getElementById(groupID).value = String('0').repeat(sz/4);
    }
    else if(sy==='hex' && sz%4===0 && val==='1') {
        removeError('fillGroup_'+groupID); document.getElementById('number_of_groups_size').className = "";
        document.getElementById(groupID).value = String('F').repeat(sz/4);
    }
    else if(sy==='hex' && sz%4===0 && val==='$') {
        removeError('fillGroup_'+groupID); document.getElementById('number_of_groups_size').className = "";
        document.getElementById(groupID).value = String('$').repeat(sz/4);
    }
    else if(sy==='hex' && sz%4!==0) {
        document.getElementById('number_of_groups_size').className = "error";
        addError('fillGroup_'+groupID); return -1;
    }

    groupValueChanged(groupID);
}
function clearGroups() {
    let g=1;
    while(document.getElementById('number_of_groups_list_'+g)!==null) {
        document.getElementById('number_of_groups_list_'+g).remove();
        g++;
    }
    document.getElementById('number_of_groups_number').value = '';
    document.getElementById('number_of_groups_size').value = '';
}
function checkOutputName(myID) {
    vscode.postMessage({command:'outputSignalsInfos', value:document.getElementById(myID).value});
}
function checkOutputBit(myID) {
    const myMIN = Number(document.getElementById(myID).min);
    const myMAX = Number(document.getElementById(myID).max);
    const myMSB = Number(document.getElementById('no_of_outputs_msb').value);
    const myLSB = Number(document.getElementById('no_of_outputs_lsb').value);
    const myVAL = Number(document.getElementById(myID).value);

    if(String(myVAL).includes('.')) {
        vscode.postMessage({command:'valueMustBeInteger', name:myID.split('_')[3].toUpperCase()+' of the output'});
        document.getElementById(myID).className = "error"; return -1;
    }
    else if(myVAL>myMAX || myVAL<myMIN) {
        vscode.postMessage({command:'invalidBitField', val:myVAL, min:myMIN, max:myMAX});
        document.getElementById(myID).className = "error"; return -1;
    }
    else {
        document.getElementById(myID).className = "";
    }
    if(myMSB>=myLSB && myMSB<=myMAX && myLSB>=myMIN) {
        document.getElementById('no_of_outputs_msb').className = "";
        document.getElementById('no_of_outputs_lsb').className = "";
    }
    else {
        document.getElementById('no_of_outputs_msb').className = "error";
        document.getElementById('no_of_outputs_lsb').className = "error";
        vscode.postMessage({command:'LSBgreaterMSB', msb:myMSB, lsb:myLSB});
    }
}
function addOutputShare() {
    const children = document.getElementById('no_of_outputs_list').children;
    const mySIG = document.getElementById('no_of_outputs_name').value;
    const myMSB = document.getElementById('no_of_outputs_msb').value;
    const myLSB = document.getElementById('no_of_outputs_lsb').value;
    const myMAX = document.getElementById('no_of_outputs_msb').max;
    const myMIN = document.getElementById('no_of_outputs_msb').min;
    const myNR = document.getElementById('no_of_outputs_list').children.length;
    let newid = myNR+1;
    for(let i=1; i<=myNR; i++) {
        if(document.getElementById(`no_of_outputs_list_${i}`)===null) {
            newid=i; break;
        }
    }

    if(myMSB==='') {vscode.postMessage({command:'outputNoBitSpecified', name:'MSB'}); return -1;}
    else if(myLSB==='') {vscode.postMessage({command:'outputNoBitSpecified', name:'LSB'}); return -1;}
    else if(Number(myLSB)<Number(myMIN) || Number(myLSB)>Number(myMAX)) {return -1;}
    else if(Number(myMSB)<Number(myMIN) || Number(myMSB)>Number(myMAX)) {return -1;}
    else if(Number(myLSB)>Number(myMSB)) {return -1;}

    for(let c=0; c<children.length; c++) {
        if(children[c].innerText.split(/\r?\n/)[0].includes(mySIG)) {
            const existingSignal = children[c].innerText.split(/\r?\n/)[0];
            const existingMSB = existingSignal.substring(existingSignal.indexOf('[')+1, existingSignal.indexOf(':'));
            const existingLSB = existingSignal.substring(existingSignal.indexOf(':')+1, existingSignal.indexOf(']'));
            if(myLSB<existingLSB && myMSB<existingLSB) {}
            else if(myLSB>existingMSB && myMSB>existingMSB) {}
            else {vscode.postMessage({command:'outputShareOverlaps', name:`[${myMSB}:${myLSB}] ${mySIG}`, existing:`[${existingMSB}:${existingLSB}] ${mySIG}`}); return -1;}
        }
    }

    const newOutputShare = document.createElement('div');
    newOutputShare.id = `no_of_outputs_list_${newid}`;
    newOutputShare.style = 'max-width:860px; margin:0 auto;';
    newOutputShare.innerHTML = `<div style="background: #303030; margin-bottom:3px; width:92.5%; float:left;">[${myMSB}:${myLSB}] ${mySIG}</div>
    <button name="no_of_outputs_list_${newid}" class="delete-button" style="display:inline; width:7%; height:14px; padding:0px; float:right; margin-bottom:4px;" onclick="deleteOutputShare(this.name)">delete</button>`;
    document.getElementById('no_of_outputs_list').appendChild(newOutputShare);

    const nrGroups = Number(document.getElementById('number_of_groups_number').value);
    for(let g=1; g<=nrGroups; g++) {
        if(String(document.getElementById(`number_of_groups_list_${g}_out`).value).trim()==='') {
            vscode.postMessage({command:'emptyExpectedOutputAndSomeOutputShares'});
            document.getElementById(`number_of_groups_list_${g}_out`).className = "error";
            addError(`No expeceted output for number_of_groups_list_${g}_out and Output Shares are not empty`);
        }
    }

    if(ready2save.length===0) {save();}
}
function deleteOutputShare(myID) {
    document.getElementById(myID).remove();
    if(document.getElementById('no_of_outputs_list').children.length===0) {
        const nrGroups = Number(document.getElementById('number_of_groups_number').value);
        for(let g=1; g<=nrGroups; g++) {
            document.getElementById(`number_of_groups_list_${g}_out`).className = "";
            removeError(`No expeceted output for number_of_groups_list_${g}_out and Output Shares are not empty`);
        }
    }
    if(ready2save.length===0) {save();}
}
function checkFloat(myID,myVAL) {
    if(Number(myVAL)>0) {
        document.getElementById(myID).className = "";
        removeError('Invalid float number: '+myID);
    }
    else {
        vscode.postMessage({command:'checkFloatGreaterZero', id:myID});
        document.getElementById(myID).className = "error";
        addError('Invalid float number: '+myID); return -1;
    }
    if(myID==='effect_size') {
        if(Number(myVAL)<=1 && Number(myVAL)>0) {
            document.getElementById(myID+'_range').value = myVAL;
        }
        else if(Number(myVAL)<=0) {
            document.getElementById(myID+'_range').value = 0;
        }
        else if(Number(myVAL)>1) {
            document.getElementById(myID+'_range').value = 1;
        }
        if(ready2save.length===0) {save();}
    }
}
function sliderEffectSizeChanged(myVAL) {
    document.getElementById('effect_size').value = myVAL;
    document.getElementById('effect_size').className = "";
    removeError('Invalid float number: effect_size');
    if(ready2save.length===0) {save();}
}
function checkIntegerEqualZero(myID,myVAL) {
    const maxClockCycle = document.getElementById('max_clock_cycle').value;

    if(String(myVAL).includes('.')) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'checkValueNotInteger', id:myID});
        addError('checkIntegerEqualZero_'+myID);
    }
    else if(myID==='end_wait_cycles' && Number(myVAL)>Number(maxClockCycle)) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'checkIntegerMaxInvalid', name:'End Wait Cycles', val:myVAL, max:maxClockCycle});
        addError('checkIntegerEqualZero_'+myID);
    }
    else if(Number(myVAL)>=0) {
        document.getElementById(myID).className = "";
        removeError('checkIntegerEqualZero_'+myID);
    }
    else {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'checkIntegerEqualZero', id:myID});
        addError('checkIntegerEqualZero_'+myID);
    }

    if(ready2save.length===0) {save();}
}
function checkIntegerGreaterZero(myID,myVAL) {
    if(myID==='no_of_probing_sets_per_step' && String(myVAL).trim().toLowerCase()==='all') {
        document.getElementById(myID).className = "";
        removeError('checkIntegerGreaterZero'+myID);
    }
    else if(String(myVAL).includes('.')) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'checkValueNotInteger', id:myID});
        addError('checkIntegerGreaterZero'+myID);
    }
    else if(Number(myVAL)>0) {
        document.getElementById(myID).className = "";
        removeError('checkIntegerGreaterZero'+myID);
    }
    else {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'checkIntegerGreaterZero', id:myID});
        addError('checkIntegerGreaterZero'+myID);
    }

    if(myID==='max_clock_cycle') {
        document.getElementById('end_wait_cycles').max = myVAL;
        if(Number(document.getElementById('end_wait_cycles').value)>myVAL) {
            document.getElementById('end_wait_cycles').value = myVAL;
            vscode.postMessage({command:'clockCycleReduced', name:'End Wait Cycle', val:myVAL});
        }
        document.getElementById('end_condition_time_value').max = myVAL;
        if(Number(document.getElementById('end_condition_time_value').value)>myVAL) {
            document.getElementById('end_condition_time_value').value = myVAL;
            vscode.postMessage({command:'clockCycleReduced', name:'End Condition Time Signal', val:myVAL});
        }
        document.getElementById('no_of_test_clock_cycles_begin').max = myVAL;
        document.getElementById('no_of_test_clock_cycles_begin').placeholder = myVAL+'-1';
        checkTestClockCycleBit('no_of_test_clock_cycles_begin', document.getElementById('no_of_test_clock_cycles_begin').value);
        document.getElementById('no_of_test_clock_cycles_end').max = myVAL;
        document.getElementById('no_of_test_clock_cycles_end').placeholder = myVAL+'-1';
        checkTestClockCycleBit('no_of_test_clock_cycles_end',document.getElementById('no_of_test_clock_cycles_end').value);
        for(let c=0; c<document.getElementById('test_clock_cycles_list').children.length; c++) {
            const cycle = document.getElementById('test_clock_cycles_list').children[c].innerText.split(/\r?\n/)[0];
            if(cycle.includes('-') && Number(cycle.split('-')[0])>Number(myVAL)) {document.getElementById('test_clock_cycles_list').children[c].remove();}
            else if(cycle.includes('-') && Number(cycle.split('-')[1])>Number(myVAL)) {document.getElementById('test_clock_cycles_list').children[c].remove();}
            else if(!cycle.includes('-') && Number(cycle)>Number(myVAL)) {document.getElementById('test_clock_cycles_list').children[c].remove();}
        }
    }

    if(ready2save.length===0) {save();}
}
function checkStateSignalName(myID, myVAL) {
    let myIDX = 0;
    for(let s=0; s<inputSignals.length; s++) {if(inputSignals[s].name===myVAL) {myIDX=s; break;}}

    const myMSB = document.getElementById(myID.replace('_name','_sigmsb'));
    const myLSB = document.getElementById(myID.replace('_name','_siglsb'));
    const myLEN = Number(inputSignals[myIDX].max) - Number(inputSignals[myIDX].min) + 1;
    myMSB.min = myLSB.min = inputSignals[myIDX].min;
    myMSB.max = myLSB.max = inputSignals[myIDX].max;
    myMSB.value = myLSB.value = '';
    myMSB.placeholder = myLSB.placeholder = inputSignals[myIDX].placeholder;
    myMSB.readOnly = myLSB.readOnly = inputSignals[myIDX].placeholder==='No Bits'? true:false;

    if(inputSignals[myIDX].placeholder==='No Bits') {
        document.getElementById(myID).style['width'] = '36.5%';
        document.getElementById(myID.replace('_name','_sigmsb')).style['display'] = 'none';
        document.getElementById(myID.replace('_name','_siglsb')).style['display'] = 'none';

        document.getElementById(myID.replace('_name','_sigmsb')).value = '';
        document.getElementById(myID.replace('_name','_siglsb')).value = '';

        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sigmsb').className = "";
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_siglsb').className = "";
        removeError('Invalid signal bit value for '+myID.substring(0,myID.lastIndexOf('_')));
    }
    else {
        document.getElementById(myID).style['width'] = '15%';
        document.getElementById(myID.replace('_name','_sigmsb')).style['display'] = 'inline';
        document.getElementById(myID.replace('_name','_siglsb')).style['display'] = 'inline';

        document.getElementById(myID.replace('_name','_sigmsb')).value = inputSignals[myIDX].max;
        document.getElementById(myID.replace('_name','_siglsb')).value = inputSignals[myIDX].min;

        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sigmsb').className = "";
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_siglsb').className = "";
        removeError('Invalid signal bit value for '+myID.substring(0,myID.lastIndexOf('_')));
    }

    const myTYP = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_valtype').value;
    if(inputSignals[myIDX].placeholder==='No Bits' && myTYP==='bin'){
        // set existing value to 0
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = '0';
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').setAttribute('maxlength',1);
        // convert hidden value also
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = '0';
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = '0';
    }
    else if(inputSignals[myIDX].placeholder!=='No Bits' && myTYP==='bin') {
        // convert existing value
        const currentVAL = String(document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value);
        const currentLEN = Number(currentVAL.length);
        const newLEN = Number(inputSignals[myIDX].max)+1;
        if(newLEN>currentLEN) {document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = '0'.repeat(newLEN-currentLEN) + currentVAL;}
        else {document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = currentVAL.substring(0,newLEN);}
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').setAttribute('maxlength',String(newLEN));
        // convert hidden value also
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = inputSignals[myIDX].max;
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = inputSignals[myIDX].min;
    }
    else if(myLEN%4!==0 && myTYP==='hex') {
        // set existing value to 0
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_valtype').selectedIndex = 0;
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = '0'.repeat(myLEN);
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').setAttribute('maxlength',myLEN);
        vscode.postMessage({command:'stateSignalValHexInvalid', state:myID.split('_')[4], signal:myID.split('_')[6], length:myLEN});
        // convert hidden value also
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = '0';
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = '0';
    }
    else if(myLEN%4===0 && myTYP==='hex') {
        // convert existing value
        const currentVAL = String(document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value);
        const currentLEN = Number(currentVAL.length);
        const newLEN = (Number(inputSignals[myIDX].max)+1)/4;
        if(newLEN>currentLEN) {document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = '0'.repeat(newLEN-currentLEN) + currentVAL;}
        else {document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = currentVAL.substring(0,newLEN);}
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').setAttribute('maxlength',String(newLEN));
        // convert hidden value also
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = inputSignals[myIDX].max;
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = inputSignals[myIDX].min;
    }
    else if(inputSignals[myIDX].placeholder==='No Bits' && myTYP==='share') {
        // clear hidden value
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = '';
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').setAttribute('maxlength','');
        // set existing value
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = '0';
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = '0';
    }
    else if(inputSignals[myIDX].placeholder!=='No Bits' && myTYP==='share') {
        // clear hidden value
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').value = '';
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value').setAttribute('maxlength','');
        // set existing value
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = inputSignals[myIDX].max;
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = inputSignals[myIDX].min;
    }
}
function checkStateSignalBit(myID) {
    const myMIN = Number(document.getElementById(myID).min);
    const myMAX = Number(document.getElementById(myID).max);
    const myMSB = Number(document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sigmsb').value);
    const myLSB = Number(document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_siglsb').value);
    const myVAL = Number(document.getElementById(myID).value);
    const valBOX = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_value');
    const shareMSBbox = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb');
    const shareLSBbox = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb');
    const myLEN = Number(myMSB) - Number(myLSB) + 1;
    const mySTT = document.getElementById(myID.substring(0,myID.indexOf('_signal_'))+'_name').innerText.replace(':','');
    const mySIG = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_label').innerText.replace(':','');
    const myBIT = myID.includes('_sigmsb')? 'MSB':'LSB';
    const myTYP = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_valtype').value;
    const groupLEN = Number(document.getElementById('number_of_groups_size').value)-1;

    if(String(myVAL).includes('.')) {
        addError('Invalid signal bit value for '+myID.substring(0,myID.lastIndexOf('_')));
        vscode.postMessage({command:'valueMustBeInteger', name:`${myBIT} of ${mySIG} of ${mySTT}`});
        document.getElementById(myID).className = "error"; return -1;
    }
    else if(myVAL>myMAX || myVAL<myMIN) {
        addError('Invalid signal bit value for '+myID.substring(0,myID.lastIndexOf('_')));
        vscode.postMessage({command:'invalidBitField', val:myVAL, min:myMIN, max:myMAX});
        document.getElementById(myID).className = "error"; return -1;
    }
    else {
        removeError('Invalid signal bit value for '+myID.substring(0,myID.lastIndexOf('_')));
        document.getElementById(myID).className = "";
    }
    if(myMSB>=myLSB && myMSB<=myMAX && myLSB>=myMIN) {
        removeError('Invalid signal bit value for '+myID.substring(0,myID.lastIndexOf('_')));
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sigmsb').className = "";
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_siglsb').className = "";
    }
    else {
        addError('Invalid signal bit value for '+myID.substring(0,myID.lastIndexOf('_')));
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sigmsb').className = "error";
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_siglsb').className = "error";
        vscode.postMessage({command:'LSBgreaterMSB', msb:myMSB, lsb:myLSB});
    }

    const sigVAL = valBOX.value;
    const shareMSB = shareMSBbox.value;
    const shareLSB = shareLSBbox.value;
    if(myTYP==='bin') {
        valBOX.setAttribute('maxlength',myLEN);
        if(myLEN>=sigVAL.length) {valBOX.value = '0'.repeat(myLEN-sigVAL.length) + sigVAL;}
        else {valBOX.value = sigVAL.substring(0,myLEN);}
        checkStateSignalValue(myID.substring(0,myID.lastIndexOf('_'))+'_value',valBOX.value);
    }
    else if(myTYP==='hex' && myLEN%4===0) {
        valBOX.setAttribute('maxlength',myLEN/4);
        if((myLEN/4)>=sigVAL.length) {valBOX.value = '0'.repeat((myLEN/4)-sigVAL.length) + sigVAL;}
        else {valBOX.value = sigVAL.substring(0,(myLEN/4));}
        checkStateSignalValue(myID.substring(0,myID.lastIndexOf('_'))+'_value',valBOX.value);
    }
    else if(myTYP==='hex' && myLEN%4!==0) {
        valBOX.setAttribute('maxlength',myLEN);
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_valtype').selectedIndex = 0;
        if(myLEN>=(sigVAL.length*4)) {valBOX.value = '0'.repeat(myLEN-(sigVAL.length*4)) + parseInt(sigVAL,16).toString(2);}
        else {valBOX.value = parseInt(sigVAL,16).toString(2).substring(0,myLEN);}
        checkStateSignalValue(myID.substring(0,myID.lastIndexOf('_'))+'_value',valBOX.value);
    }
    else if(myTYP==='share') {
        if(String(shareMSB).includes('.') || String(shareLSB).includes('.')) {}
        else if(myLSB>myMSB) {}
        else {
            shareLSBbox.value = Number(shareLSB);
            shareLSBbox.max = groupLEN - myMSB + myLSB;
            shareMSBbox.value = Number(shareLSB) + myMSB - myLSB;
            shareMSBbox.min = myMSB - myLSB; shareMSBbox.max = groupLEN;
            checkStateShareBit(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb',String(Number(shareLSB)+myMSB-myLSB));
            checkStateShareBit(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb',shareLSB);
        }
    }
}
function checkStateSignalValue(myID, myVAL) {
    const myTYP = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_valtype').value;
    const mySTT = document.getElementById(myID.substring(0,myID.indexOf('_signal_'))+'_name').innerText.replace(':','');
    const mySIG = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_label').innerText.replace(':','');
    let charmatch;

    if(myTYP==='bin') {
        charmatch = myVAL.trim().match(/[^0-1]/g);
    }
    else if(myTYP==='hex') {
        charmatch = myVAL.trim().match(/[^A-Fa-f0-9]/g);
    }
    if(charmatch!==null) {
        vscode.postMessage({command:'stateSignalValueInvalid', sys:myTYP, state:mySTT, signal:mySIG, chars:String(charmatch)});
        document.getElementById(myID).className="error";
        addError('Invalid signal value for '+myID.substring(0,myID.lastIndexOf('_'))); return -1;
    }
    else {
        document.getElementById(myID).className = "";
        removeError('Invalid signal value for '+myID.substring(0,myID.lastIndexOf('_')));
    }
}
function checkStateShareIndex(myID, myVAL) {
    if(String(myVAL).includes('.')) {
        vscode.postMessage({command:'stateShareIndexInteger'});
        document.getElementById(myID).className="error";
        addError('Invalid share index for '+myID.substring(0,myID.lastIndexOf('_'))); return -1;
    }
    else if(Number(myVAL)<0) {
        vscode.postMessage({command:'stateShareIndexPositive'});
        document.getElementById(myID).className="error";
        addError('Invalid share index for '+myID.substring(0,myID.lastIndexOf('_'))); return -1;
    }
    else {
        document.getElementById(myID).className="";
        removeError('Invalid share index for '+myID.substring(0,myID.lastIndexOf('_')));
    }
}
function checkStateShareBit(myID, myVAL) {
    if(String(myVAL).includes('.')) {
        vscode.postMessage({command:'stateShareBitInteger'});
        document.getElementById(myID).className="error";
        addError('Invalid share bit value for '+myID.substring(0,myID.lastIndexOf('_'))); return -1;
    }
    else if(Number(myVAL)<Number(document.getElementById(myID).min) || Number(myVAL)>Number(document.getElementById(myID).max)) {
        vscode.postMessage({command:'stateShareBitInvalid', max:document.getElementById(myID).max});
        document.getElementById(myID).className="error";
        addError('Invalid share bit value for '+myID.substring(0,myID.lastIndexOf('_'))); return -1;
    }
    else {
        document.getElementById(myID).className="";
        removeError('Invalid share bit value for '+myID.substring(0,myID.lastIndexOf('_')));
    }

    const myMSB = Number(document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sigmsb').value);
    const myLSB = Number(document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_siglsb').value);
    const nwMAX = Number(document.getElementById('number_of_groups_size').value)-1;
    const myLEN = Number(myMSB)-Number(myLSB);
    const myBIT = Number(myVAL);

    if(myID.includes('_sharemsb')) {
        const newLSB = myBIT-myLEN;
        if(newLSB>=0) {
            document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = newLSB;
        }
        else {
            document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = myLEN;
            document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = 0;
        }
    }
    else if(myID.includes('_sharelsb')) {
        const newMSB = myBIT+myLEN;
        if(newMSB<=nwMAX) {
            document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = newMSB;
        }
        else {
            document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharemsb').value = nwMAX;
            document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_sharelsb').value = myLEN+1;
        }
    }
}
function checkStateNumbers(myID, myVAL) {
    if(String(myVAL).includes('.')) {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'checkValueNotInteger', id:myID});
        addError('Invalid number for state property'+myID);
    }
    else if(Number(myVAL)>0) {
        document.getElementById(myID).className = "";
        removeError('Invalid number for state property'+myID);
    }
    else {
        document.getElementById(myID).className = "error";
        vscode.postMessage({command:'checkIntegerGreaterZero', id:myID});
        addError('Invalid number for state property'+myID);
    }

    if(myID.includes('_sigval')) {
        const stateNr = Number(myID.split('_')[4]);
        const existingChildren = document.getElementById(myID.replace('_sigval','_signals')).children.length;
        const newGroupMAX = Number(document.getElementById('number_of_groups_size').value)-1;
        let inputSignalsList = ``;
        for(let i=0; i<inputSignals.length; i++) {
            inputSignalsList += `
            <option>${inputSignals[i].name}</option>`;
        }
        if(Number(myVAL)>existingChildren) {
            for(let sig=existingChildren+1; sig<=Number(myVAL); sig++) {
                const newSignal = document.createElement('div');
                newSignal.id = `initial_clock_cycles_list_${stateNr}_signal_${sig}`;
                newSignal.style = "display:block; overflow:hidden; margin:4px 0px; width:774px;";
                newSignal.innerHTML = `<label id="initial_clock_cycles_list_${stateNr}_signal_${sig}_label" style="float:left; height:16px; width:8%; margin:1px 4px;">Signal ${sig}:</label>
                <select id="initial_clock_cycles_list_${stateNr}_signal_${sig}_name" style="float:left; height:18px; width:15%; margin-right:3px; margin-left:10px; color:#cccccc; background:#3c3c3c;" onchange="checkStateSignalName(this.id, this.value)">`.concat(inputSignalsList) + `
                </select>
                <input id="initial_clock_cycles_list_${stateNr}_signal_${sig}_sigmsb" type="number" min="${inputSignals[0].min}" max="${inputSignals[0].max}" value="${inputSignals[0].max}" style="float:left; height:18px; width:10%; margin:0px 3px;" placeholder="${inputSignals[0].placeholder}"`.concat(inputSignals[0].placeholder==='No Bits'?' readonly':'') + ` onchange="checkStateSignalBit(this.id)">
                <input id="initial_clock_cycles_list_${stateNr}_signal_${sig}_siglsb" type="number" min="${inputSignals[0].min}" max="${inputSignals[0].max}" value="${inputSignals[0].min}" style="float:left; height:18px; width:10%; margin:0px 3px;" placeholder="${inputSignals[0].placeholder}"`.concat(inputSignals[0].placeholder==='No Bits'?' readonly':'') + ` onchange="checkStateSignalBit(this.id)">
                <select id="initial_clock_cycles_list_${stateNr}_signal_${sig}_valtype" style="float:left; width:8%; height:18px; color:#cccccc; background:#3c3c3c; margin:0px 3px;" onchange="checkStateSignalType(this.id, this.value)">
                    <option>bin</option>
                    <option>hex</option>
                    <option>share</option>
                </select>
                <input id="initial_clock_cycles_list_${stateNr}_signal_${sig}_value" value="`.concat('0'.repeat(Number(inputSignals[0].max)+1)) + `" type="text" style="display:block; float:left; height:18px; width:29.25%; margin:0px 3px;" onchange="checkStateSignalValue(this.id, this.value)">
                <input id="initial_clock_cycles_list_${stateNr}_signal_${sig}_shareidx" type="number" min="0" placeholder="Idx" style="display:none; float:left; height:18px; width:7.65%; margin:0px 3px;" onchange="checkStateShareIndex(this.id, this.value)">
                <input id="initial_clock_cycles_list_${stateNr}_signal_${sig}_sharemsb" type="number" min="0" max="${newGroupMAX}" value="${newGroupMAX}" placeholder="MSB" style="display:none; float:left; height:18px; width:10%; margin:0px 3px;" onchange="checkStateShareBit(this.id, this.value)">
                <input id="initial_clock_cycles_list_${stateNr}_signal_${sig}_sharelsb" type="number" min="0" max="${newGroupMAX}" value="0" placeholder="LSB" style="display:none; float:left; height:18px; width:10%; margin:0px 3px;" onchange="checkStateShareBit(this.id, this.value)">`;
                document.getElementById(myID.replace('_sigval','_signals')).appendChild(newSignal);
            }
        }
        else if(Number(myVAL)<existingChildren) {
            for(let sig=existingChildren; sig>Number(myVAL); sig--) {
                document.getElementById(`initial_clock_cycles_list_${stateNr}_signal_${sig}`).remove();
            }
        }
    }
}
function checkInitialClockCyclesStates() {
    const mySTATES = document.getElementById('no_of_initial_clock_cycles');
    const oldSTATES = document.getElementById('initial_clock_cycles_list').children.length;
    const newSTATES = Number(document.getElementById('no_of_initial_clock_cycles').value);

    // check number of states
    if(String(mySTATES.value).includes('.')) {
        vscode.postMessage({command:'checkValueNotInteger', id:mySTATES.id});
        mySTATES.className = "error"; return -1;
    }
    else if(Number(mySTATES.value)>0) {
        mySTATES.className = "";
    }
    else {
        vscode.postMessage({command:'checkIntegerGreaterZero', id:mySTATES.id});
        mySTATES.className = "error"; return -1;
    }

    // create or delete states
    if(newSTATES>oldSTATES) {
        const lastID = Number(document.getElementById('initial_clock_cycles_list').children[oldSTATES-1].id.split('_')[4]);
        for(let s=1; s<=(newSTATES-oldSTATES); s++) {
            const newStateID = lastID+s, newStateNr = oldSTATES+s;
            const newGroupMAX = 1;
            let inputSignalsList = '';
            for(let i=0; i<inputSignals.length; i++) {
                inputSignalsList += `
                <option>${inputSignals[i].name}</option>`;
            }

            const newState = document.createElement('div');
            newState.id = `initial_clock_cycles_list_${newStateID}`;
            newState.style = "display:block; overflow:hidden; border-top:1px solid #3c3c3c; width:860px; margin:8px auto";

            const newHeader = document.createElement('div');
            newHeader.id = `initial_clock_cycles_list_${newStateID}_header`;
            newHeader.style = "display:block; overflow:hidden; margin:8px 0px;";
            newHeader.innerHTML = `<label id="initial_clock_cycles_list_${newStateID}_name" style="float:left; height:16px; width:8.25%; margin:2px 4px;"><strong>State ${newStateNr}:</strong></label>
            <label for="initial_clock_cycles_list_${newStateID}_durval" style="float:left; height:16px; width:8.25%; margin:2px 4px;">Duration:</label>
            <input id="initial_clock_cycles_list_${newStateID}_durval" type="number" min="1" value="1" style="float:left; height:20px; width:23.5%;" onchange="checkStateNumbers(this.id, this.value)">
            <label for="initial_clock_cycles_list_${newStateID}_sigval" style="float:left; height:16px; width:7.6%; margin:2px 4px 2px 10px;">Signals:</label>
            <input id="initial_clock_cycles_list_${newStateID}_sigval" type="number" min="1" value="1" style="float:left; height:20px; width:25%;" onchange="checkStateNumbers(this.id, this.value)">
            <button name="initial_clock_cycles_list_${newStateID}" class="delete-button" style="float:left; height:20px; width:8.5%; padding:0px; margin-left:14px;" onclick="deleteClockCycle(this.name)">Delete</button>`;

            const newLabels = document.createElement('div');
            newLabels.id = `initial_clock_cycles_list_${newStateID}_labels`;
            newLabels.style = "display:block; overflow:hidden; height:16px;";
            newLabels.innerHTML = `<label style="float:left; width:14.5%; margin-left:18%;">Signal Name:</label>
            <label style="float:left; width:9.5%;">MSB:</label>
            <label style="float:left; width:10%;">LSB:</label>
            <label style="float:left; width:8%;">Type:</label>
            <label>Value / Share Index, MSB, LSB:</label>`;

            const newSignals = document.createElement('div');
            newSignals.id = `initial_clock_cycles_list_${newStateID}_signals`;
            newSignals.style = "display:block; overflow:hidden; width:708px; margin:0 auto;";

            const newSignal = document.createElement('div');
            newSignal.id = `initial_clock_cycles_list_${newStateID}_signal_1`;
            newSignal.style = "display:block; overflow:hidden; margin:4px 0px; width:774px;";
            newSignal.innerHTML = `<label id="initial_clock_cycles_list_${newStateID}_signal_1_label" style="float:left; height:16px; width:8%; margin:1px 4px;">Signal 1:</label>
            <select id="initial_clock_cycles_list_${newStateID}_signal_1_name" style="float:left; height:18px; width:15%; margin-right:3px; margin-left:10px; color:#cccccc; background:#3c3c3c;" onchange="checkStateSignalName(this.id, this.value)">`.concat(inputSignalsList) + `
            </select>
            <input id="initial_clock_cycles_list_${newStateID}_signal_1_sigmsb" type="number" min="${inputSignals[0].min}" max="${inputSignals[0].max}" value="${inputSignals[0].max}" style="float:left; height:18px; width:10%; margin:0px 3px;" placeholder="${inputSignals[0].placeholder}"`.concat(inputSignals[0].placeholder==='No Bits'?' readonly':'') + ` onchange="checkStateSignalBit(this.id)">
            <input id="initial_clock_cycles_list_${newStateID}_signal_1_siglsb" type="number" min="${inputSignals[0].min}" max="${inputSignals[0].max}" value="${inputSignals[0].min}" style="float:left; height:18px; width:10%; margin:0px 3px;" placeholder="${inputSignals[0].placeholder}"`.concat(inputSignals[0].placeholder==='No Bits'?' readonly':'') + ` onchange="checkStateSignalBit(this.id)">
            <select id="initial_clock_cycles_list_${newStateID}_signal_1_valtype" style="float:left; width:8%; height:18px; color:#cccccc; background:#3c3c3c; margin:0px 3px;" onchange="checkStateSignalType(this.id, this.value)">
                <option>bin</option>
                <option>hex</option>
                <option>share</option>
            </select>
            <input id="initial_clock_cycles_list_${newStateID}_signal_1_value" value="`.concat('0'.repeat(Number(inputSignals[0].max)+1)) + `" type="text" style="display:block; float:left; height:18px; width:29.25%; margin:0px 3px;" onchange="checkStateSignalValue(this.id, this.value)">
            <input id="initial_clock_cycles_list_${newStateID}_signal_1_shareidx" type="number" placeholder="Idx" min="0" style="display:none; float:left; height:18px; width:7.65%; margin:0px 3px;" onchange="checkStateShareIndex(this.id, this.value)">
            <input id="initial_clock_cycles_list_${newStateID}_signal_1_sharemsb" type="number" placeholder="MSB" min="0" max="${newGroupMAX}" value="${newGroupMAX}" style="display:none; float:left; height:18px; width:10%; margin:0px 3px;" onchange="checkStateShareBit(this.id, this.value)">
            <input id="initial_clock_cycles_list_${newStateID}_signal_1_sharelsb" type="number" placeholder="LSB" min="0" max="${newGroupMAX}" value="0" style="display:none; float:left; height:18px; width:10%; margin:0px 3px;" onchange="checkStateShareBit(this.id, this.value)">`;

            newSignals.appendChild(newSignal);
            newState.appendChild(newHeader);
            newState.appendChild(newLabels);
            newState.appendChild(newSignals);
            document.getElementById('initial_clock_cycles_list').appendChild(newState);
        }
    }
    else if(newSTATES<oldSTATES) {
        for(let s=oldSTATES-1; s>=newSTATES; s--) {
            document.getElementById('initial_clock_cycles_list').children[s].remove();
        }
    }
}
function checkStateSignalType(myID, myVAL) {
    const myMSB = document.getElementById(myID.replace('_valtype','_sigmsb')).value;
    const myLSB = document.getElementById(myID.replace('_valtype','_siglsb')).value;
    const valueBOX = document.getElementById(myID.replace('_valtype','_value'));
    const shareIDX = document.getElementById(myID.replace('_valtype','_shareidx'));
    const shareMSB = document.getElementById(myID.replace('_valtype','_sharemsb'));
    const shareLSB = document.getElementById(myID.replace('_valtype','_sharelsb'));
    const myLEN = Number(myMSB)-Number(myLSB)+1;

    if(myVAL==='bin') {
        // hex > bin
        if(valueBOX.style['display']==='block') {
            // make conversion better
            const oldValue = convertBinHex(valueBOX.value,16);
            const valNotPad = oldValue==='NaN'? '0':oldValue;
            const valPadded = myLEN>=valNotPad.length? '0'.repeat(myLEN-valNotPad.length)+valNotPad : valNotPad.substring(0,myLEN);
            valueBOX.value = valPadded;
        }
        // share > bin
        else {
            shareIDX.style['display'] = 'none';
            shareMSB.style['display'] = 'none';
            shareLSB.style['display'] = 'none';
            if(valueBOX.value==='') {valueBOX.value = '0'.repeat(myLEN);}
            valueBOX.style['display'] = 'block';
        }
        valueBOX.setAttribute('maxlength',myLEN); valueBOX.className = "";
        removeError('Invalid signal value for '+myID.substring(0,myID.lastIndexOf('_')));
        if(shareIDX.className==='error') {shareIDX.value = "";} shareIDX.className = "";
        if(shareMSB.className==='error') {shareMSB.value = myMSB;} shareMSB.className = "";
        if(shareLSB.className==='error') {shareLSB.value = myLSB;} shareLSB.className = "";
        removeError('Invalid share index for '+myID.substring(0,myID.lastIndexOf('_')));
        removeError('Invalid share bit value for '+myID.substring(0,myID.lastIndexOf('_'))); // for msb
        removeError('Invalid share bit value for '+myID.substring(0,myID.lastIndexOf('_'))); // for lsb
    }
    else if(myVAL==='hex' && myLEN%4===0) {
        // bin > hex
        if(valueBOX.style['display']==='block') {
            // make conversion better
            const oldValue = convertBinHex(valueBOX.value,2);
            const valNotPad = oldValue==='NaN'? '0':oldValue.toUpperCase();
            const valPadded = (myLEN/4)>=valNotPad.length? '0'.repeat((myLEN/4)-valNotPad.length)+valNotPad : valNotPad.substring(0,myLEN);
            valueBOX.value = valPadded;
        }
        // share > hex
        else {
            shareIDX.style['display'] = 'none';
            shareMSB.style['display'] = 'none';
            shareLSB.style['display'] = 'none';
            if(valueBOX.value==='') {valueBOX.value = '0'.repeat(myLEN/4);}
            valueBOX.style['display'] = 'block';
        }
        valueBOX.setAttribute('maxlength',myLEN/4); valueBOX.className = "";
        removeError('Invalid signal value for '+myID.substring(0,myID.lastIndexOf('_')));
        if(shareIDX.className==='error') {shareIDX.value = "";} shareIDX.className = "";
        if(shareMSB.className==='error') {shareMSB.value = myMSB;} shareMSB.className = "";
        if(shareLSB.className==='error') {shareLSB.value = myLSB;} shareLSB.className = "";
        removeError('Invalid share index for '+myID.substring(0,myID.lastIndexOf('_')));
        removeError('Invalid share bit value for '+myID.substring(0,myID.lastIndexOf('_'))); // for msb
        removeError('Invalid share bit value for '+myID.substring(0,myID.lastIndexOf('_'))); // for lsb
    }
    else if(myVAL==='hex' && myLEN%4!==0) {
        if(valueBOX.style['display']==='block') {document.getElementById(myID).selectedIndex = 0;}
        else {document.getElementById(myID).selectedIndex = 2;}
        const mySTT = document.getElementById(myID.substring(0,myID.indexOf('_signal_'))+'_name').innerText.replace(':','');
        const mySIG = document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_label').innerText.replace(':','');
        vscode.postMessage({command:'stateSignalValHexInvalid', state:mySTT, signal:mySIG, length:myLEN});
    }
    else if(myVAL==='share') {
        // bin/hex > share
        valueBOX.value = '';
        valueBOX.setAttribute('maxlength','');
        valueBOX.style['display'] = 'none';
        shareIDX.style['display'] = 'block';
        shareMSB.style['display'] = 'block';
        shareLSB.style['display'] = 'block';
        // autofill the index field for the share
        let newIDX = 0; let newNR = Number(myID.split('_')[6]);
        const nrSignals = document.getElementById(myID.substring(0,myID.indexOf('_signal_'))+'_signals').children.length;
        for(let s=1; s<=nrSignals; s++) {
            const oldIDX = document.getElementById(myID.substring(0,myID.indexOf('_signal_'))+`_signal_${s}_shareidx`).value;
            if(oldIDX!=='' && Number(oldIDX)===newIDX && s!==newNR) {newIDX++;}
        }
        document.getElementById(myID.substring(0,myID.lastIndexOf('_'))+'_shareidx').value = newIDX;
        if(shareMSB.value==='' && myMSB==='') {shareMSB.value = '0';} else if(shareMSB.value==='') {shareMSB.value = myMSB;}
        if(shareLSB.value==='' && myLSB==='') {shareLSB.value = '0';} else if(shareLSB.value==='') {shareLSB.value = myLSB;}
        removeError('Invalid signal value for '+myID.substring(0,myID.lastIndexOf('_')));
    }
}
function deleteClockCycle(myID) {
    document.getElementById(myID).remove();

    let newID = myID.substring(0,myID.lastIndexOf('_'))+'_', newNR = Number(myID.split('_')[4])+1;
    while(document.getElementById(newID+newNR)!==null) {
        const oldLabel = String(document.getElementById(newID+newNR+'_name').innerText);
        const newState = Number(oldLabel.split(' ')[1].replace(':','').trim())-1;
        const newLabel = `State ${newState}:`;
        document.getElementById(newID+newNR+'_name').innerHTML = `<strong>${newLabel}</strong>`;
        newNR++;
    }
}
function noOfSimulationsChanged(myID) {
    let ready2continue = true;
    const noOfSimulationsID = 'no_of_simulations';
    const noOfStepSimulationsID = 'no_of_step_simulations';
    const noOfStepWriteResultsID = 'no_of_step_write_results';
    let noOfSimulations = Number(document.getElementById(noOfSimulationsID).value);
    let noOfStepSimulations = Number(document.getElementById(noOfStepSimulationsID).value);
    let noOfStepWriteResults = Number(document.getElementById(noOfStepWriteResultsID).value);

    if(noOfSimulations>0 && noOfSimulations%64===0) {
        document.getElementById(noOfSimulationsID).className = "";
        removeError('noOfSimulationsChanged_'+myID); ready2continue=true;
    }
    else if(noOfSimulations%64!==0) {
        document.getElementById(noOfSimulationsID).className = "error";
        vscode.postMessage({command:'noOfSimulationsInvalid64'});
        addError('noOfSimulationsChanged_'+myID); ready2continue=false;
    }
    else if(noOfSimulations<=0) {
        document.getElementById(noOfSimulationsID).className = "error";
        vscode.postMessage({command:'noOfSimulationsInvalid0'});
        addError('noOfSimulationsChanged_'+myID); ready2continue=false;
    }
    // when Number of Simulations is changed
    if(ready2continue && myID===noOfSimulationsID) {
        sliderStepSimulations = []; let is=0;
        while(is<=noOfSimulations) {if(noOfSimulations%is===0) {sliderStepSimulations.push(is);} is+=64;}
        document.getElementById('no_of_step_simulations_range').max = sliderStepSimulations.length-1;
        for(let s=0; s<sliderStepSimulations.length; s++) {
            document.getElementById('no_of_step_simulations').value = sliderStepSimulations[s];
            document.getElementById('no_of_step_simulations_range').value = s;
            if(sliderStepSimulations[s]>=noOfStepSimulations) {break;}
        }
        document.getElementById('no_of_step_simulations_list').innerHTML = '';
        for(let c=0; c<sliderStepSimulations.length; c++) {
            document.getElementById('no_of_step_simulations_list').innerHTML += `
            <option>${c}</option>`;
        }

        sliderStepWriteResults = []; let iss=0;
        noOfStepSimulations = Number(document.getElementById(noOfStepSimulationsID).value);
        noOfStepWriteResults = Number(document.getElementById(noOfStepWriteResultsID).value);
        while(iss<=noOfSimulations) {if(noOfSimulations%iss===0) {sliderStepWriteResults.push(iss);} iss+=noOfStepSimulations;}
        document.getElementById('no_of_step_write_results_range').max = sliderStepWriteResults.length-1;
        for(let s=0; s<sliderStepWriteResults.length; s++) {
            document.getElementById('no_of_step_write_results').value = sliderStepWriteResults[s];
            document.getElementById('no_of_step_write_results_range').value = s;
            if(sliderStepWriteResults[s]>=noOfStepWriteResults) {break;}
        }
        document.getElementById('no_of_step_write_results_list').innerHTML = '';
        for(let c=0; c<sliderStepWriteResults.length; c++) {
            document.getElementById('no_of_step_write_results_list').innerHTML += `
            <option>${c}</option>`;
        }
    }

    noOfStepSimulations = Number(document.getElementById(noOfStepSimulationsID).value);
    if(noOfStepSimulations>0 && noOfStepSimulations%64===0 && noOfSimulations>=noOfStepSimulations && noOfSimulations%noOfStepSimulations===0) {
        document.getElementById(noOfStepSimulationsID).className = "";
        removeError('noOfStepSimulationsChanged_'+myID); ready2continue=true;
    }
    else if(noOfSimulations<noOfStepSimulations || noOfSimulations%noOfStepSimulations!==0) {
        document.getElementById(noOfStepSimulationsID).className = "error";
        vscode.postMessage({command:'noOfStepSimulationsInvalidSim'});
        addError('noOfStepSimulationsChanged_'+myID); ready2continue=false;
    }
    else if(noOfStepSimulations%64!==0) {
        document.getElementById(noOfStepSimulationsID).className = "error";
        vscode.postMessage({command:'noOfStepSimulationsInvalid64'});
        addError('noOfStepSimulationsChanged_'+myID); ready2continue=false;
    }
    else if(noOfStepSimulations<=0) {
        document.getElementById(noOfStepSimulationsID).className = "error";
        vscode.postMessage({command:'noOfStepSimulationsInvalid0'});
        addError('noOfStepSimulationsChanged_'+myID); ready2continue=false;
    }
    // when Number of Step Simulations is changed
    if(ready2continue && myID===noOfStepSimulationsID) {
        sliderStepWriteResults = []; let iss=0;
        noOfStepWriteResults = Number(document.getElementById(noOfStepWriteResultsID).value);
        while(iss<=noOfSimulations) {if(noOfSimulations%iss===0) {sliderStepWriteResults.push(iss);} iss+=noOfStepSimulations;}
        document.getElementById('no_of_step_write_results_range').max = sliderStepWriteResults.length-1;
        for(let s=0; s<sliderStepWriteResults.length; s++) {
            document.getElementById('no_of_step_write_results').value = sliderStepWriteResults[s];
            document.getElementById('no_of_step_write_results_range').value = s;
            if(sliderStepWriteResults[s]>=noOfStepWriteResults) {break;}
        }
        document.getElementById('no_of_step_write_results_list').innerHTML = '';
        for(let c=0; c<sliderStepWriteResults.length; c++) {
            document.getElementById('no_of_step_write_results_list').innerHTML += `
            <option>${c}</option>`;
        }
    }

    noOfStepWriteResults = Number(document.getElementById(noOfStepWriteResultsID).value);
    if(noOfStepWriteResults>0 && noOfStepWriteResults%64===0 && noOfStepWriteResults%noOfStepSimulations===0 && noOfSimulations%noOfStepWriteResults===0) {
        document.getElementById(noOfStepWriteResultsID).className = "";
        removeError('noOfStepWriteResultsChanged_'+myID); ready2continue=true;
    }
    else if(noOfSimulations<noOfStepWriteResults || noOfSimulations%noOfStepWriteResults!==0) {
        document.getElementById(noOfStepWriteResultsID).className = "error";
        vscode.postMessage({command:'noOfStepWriteInvalidSim'});
        addError('noOfStepWriteResultsChanged_'+myID); ready2continue=false;
    }
    else if(noOfStepSimulations>noOfStepWriteResults || noOfStepWriteResults%noOfStepSimulations!==0) {
        document.getElementById(noOfStepWriteResultsID).className = "error";
        vscode.postMessage({command:'noOfStepWriteInvalidStepSim'});
        addError('noOfStepWriteResultsChanged_'+myID); ready2continue=false;
    }
    else if(noOfStepWriteResults%64!==0) {
        document.getElementById(noOfStepWriteResultsID).className = "error";
        vscode.postMessage({command:'noOfStepWriteInvalid64'});
        addError('noOfStepWriteResultsChanged_'+myID); ready2continue=false;
    }
    else if(noOfStepWriteResults<=0) {
        document.getElementById(noOfStepWriteResultsID).className = "error";
        vscode.postMessage({command:'noOfStepWriteInvalid0'});
        addError('noOfStepWriteResultsChanged_'+myID); ready2continue=false;
    }
    // when Number of Step Write Results is changed
    if(ready2continue && myID===noOfStepWriteResultsID) {
        for(let s=0; s<sliderStepWriteResults.length; s++) {
            if(sliderStepWriteResults[s]===noOfStepWriteResults) {document.getElementById('no_of_step_write_results_range').value=s; break;}
        }
    }
}
function sliderSimulationsChanged(myID) {
    if(myID==='no_of_step_simulations_range') {
        noOfSimulationsChanged('no_of_step_simulations');
    }
    else if(myID==='no_of_step_write_results_range') {
        noOfSimulationsChanged('no_of_step_write_results');
    }
}
function changes(myID) {
    const elements = String(myID).split('_');
    if(myID.includes('newlib')) {
        const change = elements[3];
        switch (change) {
            case 'inputs':
                const newinputs = String(document.getElementById(myID).value).split(',').filter(e => e);
                for(let e=0; e<newinputs.length; e++) { if(validateCell(myID,'names',newinputs[e])<0) {return -1;} }
                document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_NrInputs').value = newinputs.length;
                updateGraphic(elements[0]+'_'+elements[1]+'_'+elements[2], '_input_', newinputs);
                break;
            case 'outputs':
                const newoutputs = String(document.getElementById(myID).value).split(',').filter(e => e);
                for(let e=0; e<newoutputs.length; e++) { if(validateCell(myID,'names',newoutputs[e])<0) {return -1;} }
                document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_NrOutputs').value = newoutputs.length;
                updateGraphic(elements[0]+'_'+elements[1]+'_'+elements[2], '_output_', newoutputs);
                // delete childs and add new options and don't change the output option in the select-element
                const slctd = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').value;
                document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').innerHTML = '';
                for(let opt=0; opt<String(document.getElementById(myID).value).split(',').length; opt++) {
                    const newoption = document.createElement('option');
                    const newval = String(document.getElementById(myID).value).split(',')[opt];
                    newoption.value = newval;
                    newoption.text = newval;
                    newoption.selected = newval===slctd;
                    document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').appendChild(newoption);
                }
                // show the formula of the selected output when the number of the outputs changes
                const idx = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').selectedIndex;
                const arr = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').alt.split(',');
                document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').value  = arr[idx]===undefined? '':arr[idx];
                // show the formula of the newly added outputs
                for(let f=0; f<newoutputs.length; f++) {
                    if(arr[f]===undefined) {
                        document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').selectedIndex = f;
                        showOutputFormula(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula'); break;
                    }
                }
                break;
            case 'variants':
                const newvariants = String(document.getElementById(myID).value).split(',').filter(e => e);
                for(let e=0; e<newvariants.length; e++) { if(validateCell(myID,'names',newvariants[e])<0) {return -1;} }
                document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_NrVariants').value = newvariants.length;
                updateGraphic(elements[0]+'_'+elements[1]+'_'+elements[2], '_variant_', newvariants);
                break;
            case 'formula':
                // put the formula into the alt text
                const newformula = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').value;
                if(validateCell(myID,'formula',newformula)<0) {return -1;}
                const index = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').selectedIndex;
                const array = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').alt.split(',');
                array[index] = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').value;
                document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').alt = String(array);
                break;
        }
    }
    else {
        if(elements[3]==='inputs') {
            const newinputs = String(document.getElementById(myID).value).split(',').filter(e => e);
            for(let e=0; e<newinputs.length; e++) { if(validateCell(myID,'names',newinputs[e])<0) {return -1;} }
            updateGraphic(elements[0]+'_'+elements[1]+'_'+elements[2],'_input_',newinputs);
        }
        // delete childs and add new options and don't change the output option in the select-element
        else if(elements[3]==='outputs') {
            const newoutputs = String(document.getElementById(myID).value).split(',').filter(e => e);
            for(let e=0; e<newoutputs.length; e++) { if(validateCell(myID,'names',newoutputs[e])<0) {return -1;} }
            updateGraphic(elements[0]+'_'+elements[1]+'_'+elements[2], '_output_',newoutputs);
            const slctd = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').value;
            document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').innerHTML = '';
            for(let opt=0; opt<String(document.getElementById(myID).value).split(',').length; opt++) {
                const newoption = document.createElement('option');
                const newval = String(document.getElementById(myID).value).split(',')[opt];
                newoption.value = newval;
                newoption.text = newval;
                newoption.selected = newval===slctd;
                document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').appendChild(newoption);
            }
            // show the formula of the selected output when the number of the outputs changes
            const idx = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').selectedIndex;
            const arr = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').alt.split(',');
            document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').value = arr[idx]===undefined? '':arr[idx];
            // show the formula of the newly added outputs
            for(let f=0; f<newoutputs.length; f++) {
                if(arr[f]===undefined) {
                    document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').selectedIndex = f;
                    showOutputFormula(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula'); break;
                }
            }
        }
        else if(elements[3]==='variants') {
            const newvariants = String(document.getElementById(myID).value).split(',').filter(e => e);
            for(let e=0; e<newvariants.length; e++) { if(validateCell(myID,'names',newvariants[e])<0) {return -1;} }
            updateGraphic(elements[0]+'_'+elements[1]+'_'+elements[2], '_variant_', newvariants);
        }
        else if(elements[3]==='formula') {
            const newformula = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').value;
            if(validateCell(myID,'formula',newformula)<0) {return -1;}
            // put the formula into the alt text
            const index = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').selectedIndex;
            const array = document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').alt.split(',');
            array[index] = newformula;
            document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').alt = String(array);
        }
        // add to alt text and save to local file
        vscode.postMessage({
            command:'changes',
            libNm:elements[0],
            cellNm:elements[1],
            cellNr:Number(document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_label').innerText.split(' ')[1])-1,
            cellID:elements[2],
            change:elements[3],
            newVal:document.getElementById(myID).value,
            formARR:document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_formula').alt.split(','),
            formIDX:document.getElementById(elements[0]+'_'+elements[1]+'_'+elements[2]+'_LnFormula').selectedIndex,
            id:myID
        });
    }
}
function checkCellVariables(myID, myVAL) {
    const newVariables = Number(myVAL);
    let newArray = '';

    if(String(myID).includes('_NrInputs')) {
        const inputField = document.getElementById(myID.replace('_NrInputs','_inputs'));
        const arrInputs = inputField.value.split(',').filter(function(e){return e;});
        const nmrInputs = arrInputs.length;

        if(nmrInputs>newVariables) {
            // delete some inputs
            for(let i=0; i<newVariables; i++) {newArray = newArray + `,${arrInputs[i]}`;}
            newArray = newArray.substring(1); inputField.value = newArray;
        }
        else if(nmrInputs<newVariables) {
            let startNr = 1; for(let i=0; i<arrInputs.length; i++) { if(arrInputs[i]===`I${startNr}`) {startNr++;} }
            for(let i=0; i<(newVariables-nmrInputs); i++) {newArray = newArray + `,I${startNr+i}`;}
            inputField.value = inputField.value+ newArray;
        }
        if(nmrInputs===0) {inputField.value = inputField.value.substring(1);}

        changes(myID.replace('_NrInputs','_inputs'));
    }
    else if (String(myID).includes('_NrOutputs')) {
        const outputField = document.getElementById(myID.replace('_NrOutputs','_outputs'));
        const arrOutputs = outputField.value.split(',').filter(function(e){return e;});
        const nmrOutputs = arrOutputs.length;

        if(nmrOutputs>newVariables) {
            // delete some inputs
            for(let o=0; o<newVariables; o++) {newArray = newArray + `,${arrOutputs[o]}`;}
            newArray = newArray.substring(1); outputField.value = newArray;
        }
        else if(nmrOutputs<newVariables) {
            let startNr = 1; for(let o=0; o<arrOutputs.length; o++) { if(arrOutputs[o]===`O${startNr}`) {startNr++;} }
            for(let o=0; o<(newVariables-nmrOutputs); o++) {newArray = newArray + `,O${startNr+o}`;}
            outputField.value = outputField.value +newArray;
        }
        if(nmrOutputs===0) {outputField.value = outputField.value.substring(1);}

        changes(myID.replace('_NrOutputs','_outputs'));
    }
    else if (String(myID).includes('_NrVariants')) {
        const variantField = document.getElementById(myID.replace('_NrVariants','_variants'));
        const arrVariants = variantField.value.split(',').filter(function(e){return e;});
        const nmrVariants = arrVariants.length;

        if(nmrVariants>newVariables) {
            // delete some inputs
            for(let v=0; v<newVariables; v++) {newArray = newArray + `,${arrVariants[v]}`;}
            newArray = newArray.substring(1); variantField.value = newArray;
        }
        else if(nmrVariants<newVariables) {
            let startNr = 1; for(let v=0; v<arrVariants.length; v++) { if(arrVariants[v]===`V${startNr}`) {startNr++;} }
            for(let v=0; v<(newVariables-nmrVariants); v++) {newArray = newArray + `,V${startNr+v}`;}
            variantField.value = variantField.value + newArray;
        }
        if(nmrVariants===0) {variantField.value = variantField.value.substring(1);}

        changes(myID.replace('_NrVariants','_variants'));
    }
}
function saveLibs() {
    vscode.postMessage({command:'saveLibs'});
}
function deleteLib() {
    let libID = document.getElementById('library_name_chooser').value;
    let cntID;
    try {
        cntID = document.getElementById('cells_edit_box').title;
    } catch (err) {cntID = '';}
    vscode.postMessage({
        command:'deleteLib',
        id:libID,
        shown:cntID
    });
}
function libChanged() {
    //
}
function save() {
    const nrARI = String(document.getElementById('always_random_inputs_list').childElementCount);
    let ari = nrARI;
    for(let i=0,cntr=0; cntr<Number(nrARI); i++) {
        if(document.getElementById(`always_random_inputs_list_${i}`)!==null) {
            ari += `,${document.getElementById(`always_random_inputs_list_${i}`).innerText.split(/\r?\n/)[0]}`;
            cntr++;
        }
    }

    let pbi = document.getElementById('probes_include').value;
    if(pbi==='all') {}
    else if(isNaN(pbi)) {vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;}
    else {
        for(let pi=1; pi<=Number(document.getElementById('probes_include').value); pi++) {
            let value = document.getElementById('probes_include_list_'+pi+'_value').value;
            const isGlitch = document.getElementById('probes_include_list_'+pi+'_glitch').checked;
            const hint = document.getElementById('probes_include_list_'+pi+'_hint').value;
            const list = document.getElementById('wires_list').innerText.split(/\r?\n/);
            const isFullVector = document.getElementById('probes_include_list_'+pi+'_vector').checked;

            let ready2continue = false;
            for(let w=0; w<Number(list.length); w++) {if(value.includes(list[w])) {ready2continue=true; break;}}
            if(!ready2continue) {vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;}
            if(value.match(/[^A-Za-z0-9\[\]:_]/g)!==null) {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Single')) {
                isGlitch? pbi+=`,{${value}}`:pbi+=`,${value}`;
            }
            else if(hint.includes('Vector') && !value.includes('[') && !value.includes(']') && isFullVector) {
                isGlitch? pbi+=`,{${value}*}`:pbi+=`,${value}*`;
            }
            else if((hint.includes('Vector') && !value.includes('[') && value.includes(']')) || (hint.includes('Vector') && value.includes('[') && !value.includes(']'))) {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Vector') && value.includes('[') && value.includes(']') && value.substring(value.indexOf('[')+1,value.indexOf(']')).trim()==='') {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Vector') && value.includes('[') && value.includes(']') && isNaN(value.substring(value.indexOf('[')+1,value.indexOf(']')).trim())) {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Vector') && value.includes('[') && value.includes(']')) {
                isGlitch? pbi+=`,{${value}}`:pbi+=`,${value}`;
            }
            else {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
        }
    }

    let pbe = document.getElementById('probes_exclude').value;
    if(pbe==='all') {}
    else if(isNaN(pbe)) {vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;}
    else {
        for(let pe=1; pe<=Number(document.getElementById('probes_exclude').value); pe++) {
            let value = document.getElementById('probes_exclude_list_'+pe+'_value').value;
            const isGlitch = document.getElementById('probes_exclude_list_'+pe+'_glitch').checked;
            const hint = document.getElementById('probes_exclude_list_'+pe+'_hint').value;
            const list = document.getElementById('wires_list').innerText.split(/\r?\n/);
            const isFullVector = document.getElementById('probes_exclude_list_'+pe+'_vector').checked;

            let ready2continue = false;
            for(let w=0; w<Number(list.length); w++) {if(value.includes(list[w])) {ready2continue=true; break;}}
            if(!ready2continue) {vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;}
            if(value.match(/[^A-Za-z0-9\[\]:_]/g)!==null) {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Single')) {
                isGlitch? pbe+=`,{${value}}`:pbe+=`,${value}`;
            }
            else if(hint.includes('Vector')&& !value.includes('[') && !value.includes(']') && isFullVector) {
                isGlitch? pbe+=`,{${value}*}`:pbe+=`,${value}*`;
            }
            else if((hint.includes('Vector') && !value.includes('[') && value.includes(']')) || (hint.includes('Vector') && value.includes('[') && !value.includes(']'))) {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Vector') && value.includes('[') && value.includes(']') && value.substring(value.indexOf('[')+1,value.indexOf(']')).trim()==='') {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Vector') && value.includes('[') && value.includes(']') && isNaN(value.substring(value.indexOf('[')+1,value.indexOf(']')).trim())) {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
            else if(hint.includes('Vector') && value.includes('[') && value.includes(']')) {
                isGlitch? pbe+=`,{${value}}`:pbe+=`,${value}`;
            }
            else {
                vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;
            }
        }
    }

    let tcc = document.getElementById('test_clock_cycles_list').children.length;
    for(let c=0; c<document.getElementById('test_clock_cycles_list').children.length; c++) {
        tcc += `,${document.getElementById('test_clock_cycles_list').children[c].innerText.split(/\r?\n/)[0]}`;
    }

    let csn;
    const csnMIN = document.getElementById('clock_signal_name_bit').min;
    const csnMAX = document.getElementById('clock_signal_name_bit').max;
    const csnBIT = document.getElementById('clock_signal_name_bit').value===''?'0':document.getElementById('clock_signal_name_bit').value;
    const csnVAL = document.getElementById('clock_signal_name').value;
    if(csnMIN==="" || csnMAX==="") {csn = csnVAL;}
    else {csn = `${csnVAL}[${csnBIT}]`;}

    let ed;
    if(document.querySelector('input[name="endCondition"]:checked').value==='end_condition_choice_tim') {
        if(document.getElementById('end_condition_time_value').value==='') {
            document.getElementById('end_condition_time_value').className = "error";
            vscode.postMessage({command:'endConditionTimeNameEmpty'});
            return -1;
        }
        ed = 'ClockCycles ' + document.getElementById('end_condition_time_value').value;
    }
    else if(document.querySelector('input[name="endCondition"]:checked').value==='end_condition_choice_sig'){
        const output = document.getElementById('end_condition_signal_output').value;
        const msb = document.getElementById('end_condition_signal_msb').value;
        const lsb = document.getElementById('end_condition_signal_lsb').value;
        const isVector = document.getElementById('end_condition_signal_msb').min!=='';
        const system = document.getElementById('end_condition_signal_system').value.substring(0,1);
        const value = document.getElementById('end_condition_signal_value').value;
        if(value==='') {
            document.getElementById('end_condition_signal_value').className = "error";
            vscode.postMessage({command:'endConditionSignalValueEmpty'});
            return -1;
        }
        if(isVector && msb==='' && lsb==='') {
            document.getElementById('end_condition_signal_msb').className = "error";
            document.getElementById('end_condition_signal_lsb').className = "error";
            vscode.postMessage({command:'endConditionSignalLSBMSBeEmpty'});
            return -1;
        }
        else if(isVector && msb==='') {
            document.getElementById('end_condition_signal_msb').className = "error";
            vscode.postMessage({command:'endConditionSignalMSBEmpty'});
            return -1;
        }
        else if(isVector && lsb==='') {
            document.getElementById('end_condition_signal_lsb').className = "error";
            vscode.postMessage({command:'endConditionSignalLSBEmpty'});
            return -1;
        }
        else {
            document.getElementById('end_condition_signal_value').className = "";
        }
        if(isVector && msb==='' && lsb==='') {ed = `${output} ${value.length}'${system}${value}`;}
        else {ed = `[${msb}:${lsb}] ${output} ${value.length}'${system}${value}`;}
    }

    let nog, exo = ``;
    const groupsNumber = Number(document.getElementById('number_of_groups_number').value);
    const groupSize = document.getElementById('number_of_groups_size').value;
    nog = String(groupsNumber);
    for(let g=1; g<=groupsNumber; g++) {
        const groupNrSystem = document.getElementById(`number_of_groups_list_${g}_sys`).value;
        const groupValue = document.getElementById(`number_of_groups_list_${g}_val`).value.trim();
        const outputValue = document.getElementById(`number_of_groups_list_${g}_out`).value.trim();
        nog += `,${groupSize}'${groupNrSystem.charAt(0)}${groupValue.toUpperCase()}`;
        exo += `,${groupSize}'${groupNrSystem.charAt(0)}${outputValue.toUpperCase()}`;
    }
    if(exo.length>0) {exo = exo.substring(1);}
    for(let g=1; g<=groupsNumber; g++) {
        if(document.getElementById(`number_of_groups_list_${g}_out`).value.trim()==='') {exo = ''; break;}
    }

    let nop = document.getElementById('no_of_outputs_list').children.length;
    for(let c=0; c<document.getElementById('no_of_outputs_list').children.length; c++) {
        nop += `,${document.getElementById('no_of_outputs_list').children[c].innerText.split(/\r?\n/)[0]}`;
    }

    const noiccStates = document.getElementById('initial_clock_cycles_list').children;
    const noiccNumber = noiccStates.length;
    let noicc = ``, totalDuration = 0;;
    for(let s=0; s<noiccNumber; s++) {
        const stateDuration = Number(document.getElementById(noiccStates[s].id + '_durval').value);
        const stateSignalNr = Number(document.getElementById(noiccStates[s].id + '_sigval').value);
        if(stateDuration===1) {noicc += `,${stateSignalNr}`;}
        else if(stateDuration>1) {noicc += `,${stateDuration}*${stateSignalNr}`;}
        totalDuration += stateDuration;
        for(i=1; i<=stateSignalNr; i++) {
            const sigName = document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_name').value;
            const sigMSB = Number(document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_sigmsb').value);
            const sigLSB = Number(document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_siglsb').value);
            const isVector = !document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_sigmsb').readOnly;
            const sigType = document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_valtype').value;
            const sigValue = document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_value').value;
            const shareIdx = Number(document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_shareidx').value);
            const shareMSB = Number(document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_sharemsb').value);
            const shareLSB = Number(document.getElementById(noiccStates[s].id + '_signal_' + String(i) + '_sharelsb').value);

            if(isVector && sigMSB>sigLSB) {noicc += `,[${sigMSB}:${sigLSB}] ${sigName} `;}
            else if(isVector && sigMSB===sigLSB) {noicc += `,${sigName}[${sigMSB}] `;}
            else {noicc += `,${sigName} `;}

            if(sigType==='bin') {noicc += `${sigMSB-sigLSB+1}'b${sigValue}`;}
            else if(sigType==='hex') {noicc += `${sigMSB-sigLSB+1}'h${sigValue}`;}
            else if(sigType==='share') {noicc += `group_in${shareIdx}[${shareMSB}:${shareLSB}]`;}
        }
    }
    noicc = `${totalDuration}${noicc}`;

    if(ready2save.length!==0) {vscode.postMessage({command:'notsaved',errorlist:ready2save}); return -1;}
    vscode.postMessage({
        command:'save',

        codeFolder:'',
        libraryFile:document.getElementById("library_file").value,
        libraryName:document.getElementById("library_name_list").value,
        designFile:document.getElementById("design_file").value,
        moduleName:document.getElementById("module_name_list").value,
        configFile:document.getElementById("config_file").value,
        resultFolder:document.getElementById("result_folder").value,

        noOfTestClockCycles:String(tcc),
        probesInclude:String(pbi),
        probesExclude:String(pbe),
        compactDistributions:document.getElementById("compact_distributions").checked,
        minimizeProbeSets:document.getElementById("minimize_probe_sets").checked,
        effectSize:document.getElementById("effect_size").value,
        orderOfTest:document.getElementById("order_of_test").value,
        transitionalLeakage:document.getElementById("transitional_leakage").checked,
        multivariateTest:document.querySelector('input[name="multivariate_test_radio"]:checked').value,
        maxDistanceMultivariate:document.getElementById("max_distance_multivariate").value,

        noOfGroups:String(nog),
        clockSignalName:String(csn),
        maxClockCycle:document.getElementById("max_clock_cycle").value,
        endCondition:String(ed),
        endWaitCycles:document.getElementById("end_wait_cycles").value,
        noOfInitialInputs:'0',
        noOfInitialClockCycles:String(noicc),
        noOfAlwaysRandomInputs:String(ari),
        noOfOutputs:String(nop),
        expectedOutput:String(exo),
        waveformSimulation:document.getElementById("waveform_simulation").checked,

        maxNoOfThreads:document.getElementById("max_no_of_threads").value,
        noOfSimulations:document.getElementById("no_of_simulations").value,
        noOfStepSimulations:document.getElementById("no_of_step_simulations").value,
        noOfStepWriteResults:document.getElementById("no_of_step_write_results").value,
        noOfEntriesInReport:document.getElementById("no_of_entries_in_report").value,
        removeFullProbingSets:document.getElementById("remove_full_probing_sets").value,
        noOfProbingSetsPerStep:document.getElementById("no_of_probing_sets_per_step").value,
    });
}
function scroll2top() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}
document.onkeydown = function(e){
    if(e.ctrlKey === true && e.key === "s" && document.title==="Configuration Page") {save();}
};
window.onscroll = function() {
    if (document.documentElement.scrollTop > 500) {
        try {document.getElementById('scroll2top').style['animation'] = "flowin 0.25s ease forwards";} catch(er) {}
    } else {
        try {document.getElementById('scroll2top').style['animation'] = "flowout 0.25s ease forwards";} catch(er) {}
    }
};
window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
        case 'set_frame_red':
            document.getElementById(message.id).className = "error";
            break;
        case 'set_frame_back':
            document.getElementById(message.id).className = "";
            break;
        case 'set_display_none':
            document.getElementById(message.id).style["display"] = "none";
            break;
        case 'set_display_block':
            document.getElementById(message.id).style["display"] = "block";
            break;
        case 'set_standard':
            document.getElementById(message.id).value = message.value;
            if(message.id==='design_file') {updateNames('module_name_list','design_file');}
            else if(message.id==='library_file') {updateNames('library_name_list','library_file');}
            break;
        case 'validateFile':
            if(message.valid==='1') {
                document.getElementById(message.id).className = "";
                removeError('Invalid path for '+message.id);
            }
            else if(message.valid==='-1') {
                document.getElementById(message.id).className = "error";
                addError('Invalid path for '+message.id);
            }
            break;
        case 'validateFolder':
            if(message.valid==='1') {
                document.getElementById(message.id).className = "";
                removeError('Invalid path for '+message.id);
            }
            else if(message.valid==='-1') {
                document.getElementById(message.id).className = "error";
                addError('Invalid path for '+message.id);
            }
            break;
        case 'add_list_element':
            var option = document.createElement('option');
            option.value = message.value;
            option.text = message.value;
            document.getElementById(message.list).appendChild(option);
            break;
        case 'update_module_name':
            updateNames('module_name_list','design_file');
            break;
        case 'update_library_name':
            updateNames('library_name_list','library_file');
            break;
        case 'clear_list':
            const myParent = document.getElementById(message.list);
            while(myParent.hasChildNodes()) {
                myParent.removeChild(myParent.lastChild);
            }
            break;
        case 'add_configgroup':
            const grp = document.createElement('div');
            grp.className = 'configgroup';
            grp.title = message.note;
            grp.id = 'cells_edit_box';
            grp.style['display'] = 'block';
            if(document.getElementById('cells_edit_box')!==null) {document.getElementById('cells_edit_box').remove();}
            document.body.appendChild(grp);
            break;
        case 'add_cells':
            const nrInputs = String(message.inputs).trim()===''? 0:String(message.inputs).split(',').length;
            const nrOutputs = String(message.outputs).trim()===''? 0:String(message.outputs).split(',').length;
            const nrVariants = String(message.variants).trim()===''? 0:String(message.variants).split(',').length;
            const nrFormula = String(message.formula).trim()===''? 0:String(message.formula).split(',').length;
            let formulas = ``;
            for(let opt=0; opt<nrOutputs; opt++) {
                formulas += `
                <option value="${String(message.outputs).split(',')[opt]}">${String(message.outputs).split(',')[opt]}</option>`;
            }
            const cell = document.createElement('div');
            cell.className = 'configitem';
            cell.id = `${message.lib}_libcell_${message.nr}`;
            cell.innerHTML =
            `<div style="display:block; float:left; width:100%; height:30px; border-top:#3c3c3c 1px solid; padding-top:10px; position:relative;">
                <label id="${cell.id}_label" for="${cell.id}_name" style="font-size:16px; position:absolute; top:44%;"><strong>Cell ${message.label} - Type:</strong></label>
                <svg class="delete-cell" width="32" height="32" style="float:right;" viewBox="0 0 10 20" xmlns="http://www.w3.org/2000/svg" fill="red" onclick="deleteCell('${cell.id}')"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6zM7.9 7.5L10.3 5l.7.7-2.4 2.5 2.4 2.5-.7.7-2.4-2.5-2.4 2.5-.7-.7 2.4-2.5-2.4-2.5.7-.7 2.4 2.5z"></path></svg>
                <select name="${cell.id}_name" id="${cell.id}_name" style="display:inline; float:right; color:#cccccc; background-color:#3c3c3c; width:80%; height:28px; margin-left: 8px;" onchange="changes(this.id)">
                <option value="Gate" ${message.name==='Gate'?'selected':''}>Gate</option>
                <option value="Reg" ${message.name==='Reg'?'selected':''}>Reg</option>
                <option value="Buffer" ${message.name==='Buffer'?'selected':''}>Buffer</option>
                </select>
            </div>
            <div style="display:block; float:left; width:35%; margin:12px 0px 10px 0px;">
                <p id="${cell.id}_variant_0" style="color:#007fd4; position:absolute; margin-top:80px; font-size:12px; width:322px; text-align:center;"></p>
                <p id="${cell.id}_variants_all" style="color:#007fd4; position:absolute; margin-top:34px; font-size:12px; width:322px; text-align:center;">
                    <strong id="${cell.id}_variant_1"></strong><br>
                    <strong id="${cell.id}_variant_2"></strong><br>
                    <strong id="${cell.id}_variant_3"></strong><br>
                    <strong id="${cell.id}_variant_4"></strong><br>
                    <strong id="${cell.id}_variant_5"></strong><br>
                    <strong id="${cell.id}_variant_6"></strong><br>
                    <strong id="${cell.id}_variant_7"></strong><br>
                    <strong id="${cell.id}_variant_8"></strong><br>
                </p>
                <p id="${cell.id}_inname_all" style="color:#007fd4; position:absolute; margin-top:-3px; font-size:16px; width:40px; margin-left:23px; text-align:right; direction:rtl;">
                    <strong id="${cell.id}_inname_0" style="position:absolute; margin-top:80px;"></strong><br>
                    <strong id="${cell.id}_inname_1"></strong><br>
                    <strong id="${cell.id}_inname_2"></strong><br>
                    <strong id="${cell.id}_inname_3"></strong><br>
                    <strong id="${cell.id}_inname_4"></strong><br>
                    <strong id="${cell.id}_inname_5"></strong><br>
                    <strong id="${cell.id}_inname_6"></strong><br>
                    <strong id="${cell.id}_inname_7"></strong><br>
                    <strong id="${cell.id}_inname_8"></strong><br>
                </p>
                <p id="${cell.id}_outname_all" style="color:#007fd4; position:absolute; margin-top:-3px; font-size:16px; width:40px; margin-left:260px; text-align:left; direction:ltr;">
                    <strong id="${cell.id}_outname_0" style="position:absolute; margin-top:80px;"></strong><br>
                    <strong id="${cell.id}_outname_1"></strong><br>
                    <strong id="${cell.id}_outname_2"></strong><br>
                    <strong id="${cell.id}_outname_3"></strong><br>
                    <strong id="${cell.id}_outname_4"></strong><br>
                    <strong id="${cell.id}_outname_5"></strong><br>
                    <strong id="${cell.id}_outname_6"></strong><br>
                    <strong id="${cell.id}_outname_7"></strong><br>
                    <strong id="${cell.id}_outname_8"></strong><br>
                </p>
                <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 322 172" width="322" height="172">
                    <style>
                        .s0 { display:block; fill: none; stroke: #007fd4; stroke-width: 2; }
                        .s1 { display:none; fill: none; stroke: #007fd4; stroke-width: 2; }
                    </style>
                    <path id="${cell.id}_circuitbasic" class="s0" d="m114.1 32.8c0-2.2 1.8-4 4-4h85.8c2.2 0 4 1.8 4 4v106.4c0 2.2-1.8 4-4 4h-85.8c-2.2 0-4-1.8-4-4z"/>
                    <g id="${cell.id}_inputs_all">
                        <path id="${cell.id}_input_8" class="s1" d="m113.5 133.8h-19.6l-18.6 16.5h-8.5"/>
                        <path id="${cell.id}_input_7" class="s1" d="m113.5 120.3h-24l-14.2 9.7h-8.5"/>
                        <path id="${cell.id}_input_6" class="s1" d="m113.5 106.2h-26.8l-11.4 6.8h-8.5"/>
                        <path id="${cell.id}_input_5" class="s1" d="m113.5 92.4h-28.5l-9.7 2.9h-8.5"/>
                        <path id="${cell.id}_input_4" class="s1" d="m113.5 78.9h-28.5l-9.7-2.9h-8.5"/>
                        <path id="${cell.id}_input_3" class="s1" d="m113.5 65.2h-26.8l-11.4-6.7h-8.5"/>
                        <path id="${cell.id}_input_2" class="s1" d="m113.5 51.3h-24l-14.2-9.9h-8.5"/>
                        <path id="${cell.id}_input_1" class="s1" d="m113.5 37.8h-19.6l-18.6-16.7h-8.5"/>
                        <path id="${cell.id}_input_0" class="s1" d="m113.5 85.9h-46.7"/>
                    </g>
                    <g id="${cell.id}_outputs_all">
                        <path id="${cell.id}_output_8" class="s1" d="m208.1 133.8h19.6l18.7 16.5h9"/>
                        <path id="${cell.id}_output_7" class="s1" d="m208.1 120.3h24l14.3 9.7h9"/>
                        <path id="${cell.id}_output_6" class="s1" d="m208.1 106.2h26.8l11.5 6.8h9"/>
                        <path id="${cell.id}_output_5" class="s1" d="m208.1 92.4h28.5l9.8 2.9h9"/>
                        <path id="${cell.id}_output_4" class="s1" d="m208.1 78.9h28.5l9.8-2.9h9"/>
                        <path id="${cell.id}_output_3" class="s1" d="m208.1 65.2h26.8l11.5-6.7h9"/>
                        <path id="${cell.id}_output_2" class="s1" d="m208.1 51.3h24l14.3-9.9h9"/>
                        <path id="${cell.id}_output_1" class="s1" d="m208.1 37.8h19.6l18.7-16.7h9"/>
                        <path id="${cell.id}_output_0" class="s1" d="m208 85.9h47.4"/>
                    </g>
                </svg>
            </div>
            <div style="display:block; float:right; width:50%; margin:12px 0px 10px 0px;">
                <label for="${cell.id}_inputs">Inputs Names:</label>
                <input type="text" id="${cell.id}_inputs" style="height:28px;" value="${message.inputs}" onchange="changes(this.id)">
                <label for="${cell.id}_outputs">Outputs Names:</label>
                <input type="text" id="${cell.id}_outputs" style="height:28px;" value="${message.outputs}" onchange="changes(this.id)">
                <label for="${cell.id}_variants">Variants Names:</label>
                <input type="text" id="${cell.id}_variants" style="height:28px;" value="${message.variants}" onchange="changes(this.id)">
                <label for="${cell.id}_formula">Formula:</label>
                <input type="text" id="${cell.id}_formula" style="height:28px;" alt="${message.formula}" onchange="changes(this.id)">
            </div>
            <div style="display:block; float:right; width:12%; margin:12px 0px 10px 0px;">
                <label for="${cell.id}_NrInputs">Nr. Inputs:</label>
                <input type="number" min="0" id="${cell.id}_NrInputs" style="width:80%; height:28px;" value="${nrInputs}" onchange="checkCellVariables(this.id, this.value)">
                <label for="${cell.id}_NrOutputs">Nr. Outputs:</label>
                <input type="number" min="0" id="${cell.id}_NrOutputs" style="width:80%; height:28px;" value="${nrOutputs}" onchange="checkCellVariables(this.id, this.value)">
                <label for="${cell.id}_NrVariants">Nr. Variants:</label>
                <input type="number" min="0" id="${cell.id}_NrVariants" style="width:80%; height:28px;" value="${nrVariants}" onchange="checkCellVariables(this.id, this.value)">
                <label for="${cell.id}_LnFormula">Formulas:</label>
                <select name="${cell.id}_LnFormula" id="${cell.id}_LnFormula" style="color:#cccccc; background-color:#3c3c3c; width:80%; height:28px;" onchange="showOutputFormula(this.id)">`.concat(formulas) + `
                </select>
            </div>`;
            document.getElementById('cells_edit_box').appendChild(cell);
            document.getElementById(cell.id+'_formula').value = String(message.formula).split(',')[document.getElementById(cell.id+'_LnFormula').selectedIndex];
            updateGraphic(cell.id,'_input_',String(message.inputs).split(',').filter(e => e));
            updateGraphic(cell.id,'_output_',String(message.outputs).split(',').filter(e => e));
            const newvariants = String(message.variants).split(',').filter(e => e);
            updateGraphic(cell.id,'_variant_',newvariants);
            addedLibCells++;
            break;
        case 'changes':
            const elmt = document.getElementById(message.id);
            elmt.value = message.val;
            break;
        case 'updateOutputFormula':
            document.getElementById(message.id).alt = message.newforms;
            break;
        case 'deleteCell':
            // removing the cell from the user interface
            document.getElementById(message.id).remove();
            // renumbering the new cells
            let max, idArray = String(message.id).split('_'), start = Number(idArray[2])+1;
            if(idArray[1]==='newcell') {
                deletedNewCells++;
                max = addedNewCells;
                // updating the text about number of cells on the new-lib-page
                let textcells = document.getElementById('newcells_number').innerText.split(' ');
                textcells[0] = Number(textcells[0])-1;
                let text = textcells.toString();
                while(text.indexOf(',')!==-1) {text = text.replace(',',' ');}
                document.getElementById('newcells_number').innerText = text;
            }
            else {
                deletedLibCells++;
                max = addedLibCells;
                // check what is wrong here when adding/deleting cells from an existing library!
            }
            for(let nr=start; nr<=max; nr++) {
                if(document.getElementById(idArray[0]+'_'+idArray[1]+'_'+String(nr)+'_label')!==null) {
                    const elmt = document.getElementById(idArray[0]+'_'+idArray[1]+'_'+String(nr)+'_label');
                    let cellTxt = elmt.innerText.split(' ');
                    cellTxt[1] = Number(cellTxt[1])-1;
                    let newTxt = cellTxt.toString();
                    while(newTxt.indexOf(',')!==-1) {newTxt = newTxt.replace(',',' ');}
                    elmt.innerHTML = '<strong>'+newTxt+'</strong>';
                }
            }
            break;
        case 'deleteLib':
            const mySelect = document.getElementById('library_name_chooser');
            mySelect.remove(message.id);
            break;
        case 'deleteContent':
            const cntnt = document.getElementById('cells_edit_box');
            if(cntnt.title===message.content) {cntnt.remove();}
            try {document.getElementById('add_newcells_lib').remove();} catch(err) {}
            break;
        case 'createNewLib':
            for(let nln=0; nln<addedNewCells; nln++) {
                if(document.getElementById('newlib_newcell_'+nln)!==null) {
                    const id = 'newlib_newcell_'+nln;
                    vscode.postMessage({
                        command:'addNewCells',
                        lib:document.getElementById('newlib_name').value,
                        name:document.getElementById(id+'_name').value,
                        inputs:document.getElementById(id+'_inputs').value,
                        outputs:document.getElementById(id+'_outputs').value,
                        variants:document.getElementById(id+'_variants').value,
                        formula:document.getElementById(id+'_formula').alt
                    });
                }
            }
            vscode.postMessage({command:'finishNewLib',name:message.name});
            break;
        case 'addNewlibToSelect':
            const newlib = document.createElement('option');
            newlib.value = message.name;
            newlib.innerText = message.name;
            document.getElementById('library_name_chooser').appendChild(newlib);
            document.getElementById('cells_edit_box').remove();
            document.getElementById('newlib_name_box').remove();
            addedNewCells=0; deletedNewCells=0;
            break;
        case 'exit_editing_newlib':
            addedNewCells = 0; deletedNewCells = 0; addedLibCells = 0; deletedLibCells = 0;
            document.getElementById('add_newcells_lib').remove();
            document.getElementById('cells_edit_box').remove();
            addNewLib();
            break;
        case 'exit_library_editing':
            try {document.getElementById('newlib_name_box').remove(); createAddCellsButton();} catch (e) {}
            addedNewCells = 0; deletedNewCells = 0; addedLibCells = 0; deletedLibCells = 0;
            document.getElementById('add_newcells_lib').innerText = `Add New Cell to the Library ${document.getElementById('library_name_chooser').value}`;
            document.getElementById('cells_edit_box').remove();
            vscode.postMessage({
                command:'getLibCells',
                lib:document.getElementById('library_name_chooser').value
            });
            break;
        case 'setWireHint':
            document.getElementById(message.id.replace('_value','_hint')).value = message.hint;
            const hint = message.hint;
            const myID = message.id;
            const myVAL = document.getElementById(message.id).value;
            const iswireVector = message.hint!=='Single Wire';

            if(iswireVector && !myVAL.includes('[') && !myVAL.includes(']')) {
                document.getElementById(myID.replace('_value','_vector')).disabled = false;
                document.getElementById(myID.replace('_value','_vector')).checked = true;
            }
            else if(iswireVector) {
                document.getElementById(myID.replace('_value','_vector')).disabled = false;
                document.getElementById(myID.replace('_value','_vector')).checked = false;
            }
            else {
                document.getElementById(myID.replace('_value','_vector')).disabled = true;
                document.getElementById(myID.replace('_value','_vector')).checked = false;
            }
            if(myVAL.match(/[^A-Za-z0-9\[\]:_]/g)!==null) {
                document.getElementById(message.id).className = "error";
                vscode.postMessage({command:'wireProbesInvalid', text:`The name of the wire contains invalid characters "${myVAL.match(/[^A-Za-z0-9\[\]:_]/g)}"`});
                addError('wireProbesInvalid'+myID);
            }
            else if((iswireVector && myVAL.includes('[') && !myVAL.includes(']')) || (iswireVector && !myVAL.includes('[') && myVAL.includes(']'))) {
                document.getElementById(myID).className = "error";
                vscode.postMessage({command:'wireProbesInvalid', text:`The bit value of the vector wire is not defined correctly`});
                addError('wireProbesInvalid'+myID);
            }
            else if(iswireVector && myVAL.includes('[') && myVAL.includes(']') && myVAL.substring(myVAL.indexOf('[')+1,myVAL.indexOf(']')).trim()==='') {
                document.getElementById(myID).className = "error";
                vscode.postMessage({command:'wireProbesInvalid', text:`The bit value of the vector wire "[${myVAL.substring(myVAL.indexOf('[')+1,myVAL.indexOf(']'))}]" is incorrect!`});
                addError('wireProbesInvalid'+myID);
            }
            else if(iswireVector && myVAL.includes('[') && myVAL.includes(']') && isNaN(myVAL.substring(myVAL.indexOf('[')+1,myVAL.indexOf(']')).trim())) {
                document.getElementById(myID).className = "error";
                vscode.postMessage({command:'wireProbesInvalid', text:`The bit value of the vector wire "[${myVAL.substring(myVAL.indexOf('[')+1,myVAL.indexOf(']'))}]" is incorrect!`});
                addError('wireProbesInvalid'+myID);
            }
            else {
                document.getElementById(myID).className = "";
                removeError('wireProbesInvalid'+myID);
            }
            break;
        case 'inputSignalNamesCSN':
            const isVector = message.min!=='';
            const currentCSN = document.getElementById('clock_signal_name').value;
            const children = document.getElementById('always_random_inputs_list').childNodes;
            const csnNR = document.getElementById(message.id);
            csnNR.min = message.min;
            csnNR.max = message.max;
            csnNR.value = message.value;
            csnNR.placeholder = message.placeholder;
            csnNR.readOnly = message.placeholder==='No Bits';
            csnNR.className = "";

            for(let i=0; i<children.length; i++) {
                if(String(children[i].innerText).includes(currentCSN) && !isVector) {
                    document.getElementById('clock_signal_name').selectedIndex = lastCSNname;
                    inputSignalNamesCSN('clock_signal_name',lastCSNbit);
                    vscode.postMessage({command:'clockSignalUsedAsARI',name:currentCSN});
                    addError('inputSignalNames'+myID); return -1;
                }
                else {
                    removeError('inputSignalNames'+myID);
                }
            }

            lastCSNname = document.getElementById('clock_signal_name').selectedIndex;
            lastCSNbit = document.getElementById('clock_signal_name_bit').value;
            if(!isVector && ready2save.length===0) {save();}
            break;
        case 'inputSignalNamesARI':
            const ariMSB = document.getElementById(message.msb);
            ariMSB.min = message.min;
            ariMSB.max = message.max;
            ariMSB.value = '';
            ariMSB.placeholder = message.placeholder;
            ariMSB.readOnly = message.placeholder==='No Bits';
            ariMSB.className = "";
            const ariLSB = document.getElementById(message.lsb);
            ariLSB.min = message.min;
            ariLSB.max = message.max;
            ariLSB.value = '';
            ariLSB.placeholder = message.placeholder;
            ariLSB.readOnly = message.placeholder==='No Bits';
            ariLSB.className = "";
            break;
        case 'notEndConditionVector':
            document.getElementById('end_condition_signal_lsb').readOnly = true;
            document.getElementById('end_condition_signal_msb').readOnly = true;
            break;
        case 'isEndConditionVector':
            document.getElementById('end_condition_signal_lsb').readOnly = false;
            document.getElementById('end_condition_signal_msb').readOnly = false;
            break;
        case 'endConditionOutputChanged':
            document.getElementById('end_condition_signal_lsb').value = '';
            document.getElementById('end_condition_signal_lsb').min = message.min;
            document.getElementById('end_condition_signal_lsb').max = message.max;
            document.getElementById('end_condition_signal_lsb').placeholder = message.placeholder;
            document.getElementById('end_condition_signal_lsb').readOnly = message.readOnly;
            document.getElementById('end_condition_signal_msb').value = '';
            document.getElementById('end_condition_signal_msb').min = message.min;
            document.getElementById('end_condition_signal_msb').max = message.max;
            document.getElementById('end_condition_signal_msb').placeholder = message.placeholder;
            document.getElementById('end_condition_signal_msb').readOnly = message.readOnly;
            document.getElementById('end_condition_signal_value').value = '';
            document.getElementById('end_condition_signal_value').setAttribute('maxlength',Number(message.max)-Number(message.min)+1);
            break;
        case 'outputSignalsInfos':
            const nopMSB = document.getElementById('no_of_outputs_msb');
            nopMSB.min = message.min;
            nopMSB.max = message.max;
            nopMSB.value = '';
            nopMSB.placeholder = message.placeholder;
            nopMSB.className = "";
            const nopLSB = document.getElementById('no_of_outputs_lsb');
            nopLSB.min = message.min;
            nopLSB.max = message.max;
            nopLSB.value = '';
            nopLSB.placeholder = message.placeholder;
            nopLSB.className = "";
            break;
        case 'setInputSignals':
            inputSignals.push({name:message.name, min:message.min, max:message.max, placeholder:message.placeholder});
            break;
        case 'setOutputSignals':
            outputSignals.push({name:message.name, min:message.min, max:message.max, placeholder:message.placeholder});
            break;
    }
});
setTimeout(()=>{
    if(document.title==="Configuration Page") {
        const noOfSimulations = Number(document.getElementById('no_of_simulations').value);
        const noOfStepSimulations = Number(document.getElementById('no_of_step_simulations').value);
        sliderStepSimulations = []; let is=0;
        while(is<=noOfSimulations) {if(noOfSimulations%is===0) {sliderStepSimulations.push(is);} is+=64;}
        sliderStepWriteResults = []; let iss=0;
        while(iss<=noOfSimulations) {if(noOfSimulations%iss===0) {sliderStepWriteResults.push(iss);} iss+=noOfStepSimulations;}
    }
},300);
setTimeout(()=>{
    if(document.title==="Configuration Page") {
        document.querySelector("input[id='no_of_step_simulations_range']").addEventListener('input', (event) => {document.getElementById('no_of_step_simulations').value = sliderStepSimulations[Number(event.target.value)];});
        document.querySelector("input[id='no_of_step_write_results_range']").addEventListener('input', (event) => {document.getElementById('no_of_step_write_results').value = sliderStepWriteResults[Number(event.target.value)];});
        document.querySelector("input[id='effect_size_range']").addEventListener('input', (event) => {document.getElementById('effect_size').value = document.getElementById('effect_size_range').value;});
        vscode.postMessage({command:'getInputSignals'});
        vscode.postMessage({command:'getOutputSignals'});
    }
},500);
(function () {
    const oldState = vscode.getState() || { colors: [] };

    /** @type {Array<{ value: string }>} */
    let colors = oldState.colors;

    updateColorList(colors);

    document.querySelector('.add-color-button').addEventListener('click', () => {
        addColor();
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'addColor':
                {
                    addColor();
                    break;
                }
            case 'clearColors':
                {
                    colors = [];
                    updateColorList(colors);
                    break;
                }

        }
    });

    /**
     * @param {Array<{ value: string }>} colors
     */
    function updateColorList(colors) {
        const ul = document.querySelector('.color-list');
        ul.textContent = '';
        for (const color of colors) {
            const li = document.createElement('li');
            li.className = 'color-entry';

            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            colorPreview.style.backgroundColor = `#${color.value}`;
            colorPreview.addEventListener('click', () => {
                onColorClicked(color.value);
            });
            li.appendChild(colorPreview);

            const input = document.createElement('input');
            input.className = 'color-input';
            input.type = 'text';
            input.value = color.value;
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                if (!value) {
                    // Treat empty value as delete
                    colors.splice(colors.indexOf(color), 1);
                } else {
                    color.value = value;
                }
                updateColorList(colors);
            });
            li.appendChild(input);

            ul.appendChild(li);
        }

        // Update the saved state
        vscode.setState({ colors: colors });
    }

    /** 
     * @param {string} color 
     */
    function onColorClicked(color) {
        vscode.postMessage({ type: 'colorSelected', value: color });
    }

    /**
     * @returns string
     */
    function getNewCalicoColor() {
        const colors = ['020202', 'f1eeee', 'a85b20', 'daab70', 'efcb99'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function addColor() {
        colors.push({ value: getNewCalicoColor() });
        updateColorList(colors);
    }
}());