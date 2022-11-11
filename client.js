let currCell = -1;

let cells_data = [];
function textOfCell(cell){
    return cell.children[1].value;
}

function responseRefOfCell(cell){
    cell.children[2];
}

function runCell(cell){
    let run_button = document.getElementById("run_button");
    run_button.disabled=true;
    request = {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
            command: textOfCell(cell)
        })
    };
    fetch('/eval', request).
        then((response) => 
                response.json().
                    then((data) => 
                        {
                            console.log(data);
                            cell.children[2].innerText = data.result;
                            run_button.disabled = false;
                        }
                        ) );
    
}

async function saveCells(){
    let cells_text = [];
    for(i=0; i < cells_data.length; i++){
        cells_text.push(textOfCell(cells_data[i]));
    }
    request = {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
            cells: cells_text
        })
    };
    let run_button = document.getElementById("run_button");
    run_button.disabled=true;
    let response = await (fetch('/save',request));
    run_button.disabled=false;
}

async function restoreCells(){
    request = {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json'
        },
    };
    let response = await (fetch('/restore', request));
    let data = await response.json();
    let saved_cells = data.saved_cells;
    console.log(saved_cells);
    for (i = 0; i < saved_cells.length; i++){
        addCell(i,saved_cells[i]);
    }

}

function runCurrCell(){
    if(currCell >= 0 && currCell < cells_data.length){
        cell = document.getElementById(currCell);
        //console.log(textOfCell(cell));
        runCell(cell);
    }
    saveCells();


    
}

function selectCell(cell){
    currCell = cell.id;
    for(i = 0; i < cells_data.length; i++){
        if(i == cell.id){
            document.getElementById(i).style.backgroundColor = "grey";
        }
        else{
            document.getElementById(i).style.backgroundColor = "lightgrey";
        }
    }
    console.log(currCell);
}

function resize(textbox){
    let maxrows = 50;
    let columns = textbox.cols;
    let text = textbox.value;
    let text_array = text.split('\n');
    let num_rows = text_array.length;
    for (i=0;i<text_array.length;i++) 
        num_rows+=parseInt(text_array[i].length/columns);
    if (num_rows>maxrows) 
        textbox.rows=maxrows;
    else 
        textbox.rows=num_rows;
}

function addNewCell(){
    addCell(cells_data.length,"");
}

function addCell(n,str){
    console.log("add cell");
    //
    let cells_html = document.getElementById("cells");
    cells_html.insertAdjacentHTML('beforeend',`
    <div class = "cell" id = "${n}" onclick = "selectCell(this)">
        <h4> [${n}]</h4>
        <textarea onkeyup="resize(this);">${str}</textarea>
        <p></p>
    </div>
    `);
    selectCell(document.getElementById(n));
    cells_data.push(document.getElementById(n));
}

restoreCells();