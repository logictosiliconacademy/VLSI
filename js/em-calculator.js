
function calculateEM(){
let width=parseFloat(document.getElementById('width').value);
let current=parseFloat(document.getElementById('current').value);
let density=current/width;
document.getElementById('result').innerHTML=
'Current Density = '+density.toFixed(2)+'<br>'+(density<1?'SAFE':'EM RISK');
}
